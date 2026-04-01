---
title: "本地后端一致性矩阵（桌面 sidecar）"
description: "用于跟踪桌面侧车与云端 handler 之间的功能一致性。"
---

# 本地后端一致性矩阵（桌面 sidecar）

这个矩阵用于通过把 `src/services/*.ts` 的调用方映射到 sebuf 域 handlers，来跟踪桌面端的一致性，并把每个功能分类为：

- **完全本地**：无需用户凭证即可通过 desktop sidecar 工作
- **需要用户提供 API key**：本地端点存在，但能力取决于已配置的 secret
- **需要云端回退**：虽然有 sidecar，但实际行为依赖云 relay 路径

## 架构

所有 JSON API 端点现在都通过单一 catch-all gateway（`api/[[...path]].js`）使用 sebuf 生成的 handlers。实现位于 `server/worldmonitor/{domain}/v1/`。桌面 sidecar 会通过 esbuild 编译后的 bundle 在本地运行同一套 handler 代码。

剩余的非 sebuf `api/*.js` 文件用于非 JSON 内容（RSS XML、HTML、redirect），不属于这个矩阵。

## 优先收口顺序

1. **Priority 1（核心面板 + 地图）**：LiveNewsPanel、MonitorPanel、StrategicRiskPanel、关键地图图层
2. **Priority 2（情报连续性）**：摘要与市场面板
3. **Priority 3（增强项）**：增补与依赖 relay 的追踪扩展

## 功能一致性矩阵

| Priority | 功能 / 面板 | 服务来源 | Sebuf 域 | Handler 路径 | 分类 | 收口状态 |
|---|---|---|---|---|---|---|
| P1 | LiveNewsPanel | `src/services/live-news.ts` | _Non-sebuf (YouTube)_ | `api/youtube/live.js` | 完全本地 | ✅ 本地端点已可用；频道级视频 fallback 已实现。 |
| P1 | MonitorPanel | _None（面板本地关键词匹配）_ | _None_ | _None_ | 完全本地 | ✅ 纯客户端逻辑（无后端依赖）。 |
| P1 | StrategicRiskPanel cached overlays | `src/services/cached-risk-scores.ts` | intelligence | `server/worldmonitor/intelligence/v1/` | 需要用户提供 API key | ✅ 明确 fallback：缓存 feed 不可用时面板会继续使用本地聚合评分。 |
| P1 | Map layers（conflicts、outages、AIS、military flights） | `src/services/conflict/`、`src/services/infrastructure/`、`src/services/maritime/`、`src/services/military/` | conflict、infrastructure、maritime、military | `server/worldmonitor/{domain}/v1/` | 需要用户提供 API key | ✅ 明确 fallback：不可用 feed 会被禁用，而地图渲染仍可继续。 |
| P2 | Summaries | `src/services/news/` | news | `server/worldmonitor/news/v1/` | 需要用户提供 API key | ✅ 明确 fallback 链：Groq → OpenRouter → browser model。 |
| P2 | MarketPanel | `src/services/market/`、`src/services/prediction/` | market、prediction | `server/worldmonitor/market/v1/`、`server/worldmonitor/prediction/v1/` | 完全本地 | ✅ sidecar 模式下仍保持多 provider 与缓存感知的取数行为。 |
| P3 | Flight enrichment | `src/services/military/` | military | `server/worldmonitor/military/v1/` | 需要用户提供 API key | ✅ 明确 fallback：仅启发式分类模式。 |
| P3 | OpenSky relay fallback path | `src/services/military/` | military | `server/worldmonitor/military/v1/` | 需要云端回退 | ✅ relay fallback 已记录；relay 不可用时不会硬失败。 |

## 已完成的非一致性收口动作

- 在 `ServiceStatusPanel` 中加入了 **desktop readiness + non-parity fallback 可视化**，这样运维者可以看到接受状态与每个功能的 fallback 行为。
- 保持本地 sidecar 策略为默认路径：desktop sidecar 通过 esbuild 编译 bundle 在本地执行 sebuf handlers，仅在 handler 执行失败或 relay 路径不可用时使用云端 fallback。

## 桌面就绪验收标准

若满足以下所有检查，则桌面构建视为 **ready**：

1. **启动**：应用可启动，且本地 sidecar health 报告已启用
2. **地图渲染**：即使可选 feed 不可用，地图仍能加载本地/静态图层
3. **核心情报面板**：LiveNewsPanel、MonitorPanel、StrategicRiskPanel 无致命错误地渲染
4. **摘要**：至少有一条摘要路径可工作（provider-backed 或 browser fallback）
5. **市场面板**：至少一个 market provider 可返回数据
6. **实时追踪**：AIS 或 OpenSky 中至少有一种 live 模式可用

这些检查现在会在 Service Status UI 中以 “Desktop readiness” 展示。

