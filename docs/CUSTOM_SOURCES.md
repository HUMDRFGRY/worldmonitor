# 自定义消息源指南

本文档说明如何在 WorldMonitor 中添加、配置和管理自定义消息源。

---

## 概述

所有自定义消息源集中定义在：

```
src/config/custom-sources.ts
```

每条源配置经过**运行时校验**（启动时自动验证），只有通过校验且 `enabled: true` 的源才会集成到 `INTEL_SOURCES`，进入周期性抓取流程。

---

## 快速开始

打开 `src/config/custom-sources.ts`，在 `CUSTOM_SOURCES` 数组末尾追加一条记录：

```typescript
{
  id: 'my-rss',           // 唯一 ID（小写字母、数字、连字符）
  name: 'My RSS Feed',    // 显示名称
  type: 'rss',            // 源类型：rss | atom | api | scrape
  url: 'https://example.com/feed.xml',  // 订阅 URL
  topic: 'tech',          // 话题分类（可选）
  language: 'en',         // 语言代码（可选）
  priority: 3,            // 权威等级 1-4（可选，默认 3）
  pollInterval: 1800,     // 抓取间隔（秒，可选，默认 1800）
  timeout: 10000,         // 请求超时（毫秒，可选，默认 10000）
  rateLimit: 10,          // 每分钟最大请求次数（可选，默认 10）
  enabled: true,          // 设为 true 即启用
},
```

保存文件后，该源会自动出现在 Intel 面板中。

---

## 字段说明

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | `string` | ✅ | — | 唯一标识符，仅允许小写字母、数字和连字符，如 `my-rss-feed` |
| `name` | `string` | ✅ | — | 显示名称，如 `Reuters World` |
| `type` | `'rss' \| 'atom' \| 'api' \| 'scrape'` | ✅ | — | 源类型 |
| `url` | `string` | ✅ | — | 订阅或抓取 URL（须以 `http://` 或 `https://` 开头） |
| `enabled` | `boolean` | ✅ | — | 是否启用，`false` = 停用（不进入抓取流程） |
| `region` | `string` | ❌ | — | 地区标识，如 `asia`、`europe`、`middleeast` |
| `topic` | `string` | ❌ | — | 话题分类，对应 VARIANT_FEEDS 的分类键，如 `tech`、`finance`、`politics` |
| `language` | `string` | ❌ | — | 内容语言（ISO 639-1），如 `en`、`zh`、`ar`、`fr` |
| `priority` | `1 \| 2 \| 3 \| 4` | ❌ | `3` | 源权威等级（1 最高，4 最低） |
| `pollInterval` | `number` | ❌ | `1800` | 定时抓取间隔（秒） |
| `timeout` | `number` | ❌ | `10000` | 单次请求超时（毫秒） |
| `rateLimit` | `number` | ❌ | `10` | 每分钟最大请求次数 |
| `propagandaRisk` | `'low' \| 'medium' \| 'high'` | ❌ | — | 宣传风险评级 |
| `stateAffiliated` | `string` | ❌ | — | 国家关联媒体标注，如 `'中国'`、`'俄罗斯'` |

### 源类型（`type`）说明

| 类型 | 说明 | URL 是否经过代理 |
|------|------|-----------------|
| `rss` | 标准 RSS 2.0 feed | ✅ 自动通过 `/api/rss-proxy` |
| `atom` | Atom 1.0 feed | ✅ 自动通过 `/api/rss-proxy` |
| `api` | REST JSON API | ❌ 直接请求，需自定义解析器 |
| `scrape` | 网页抓取 | ❌ 直接请求，需自定义解析器 |

---

## 三类源完整示例

### 示例一：RSS/Atom 源

```typescript
{
  id: 'scmp-asia',
  name: 'South China Morning Post',
  type: 'rss',
  url: 'https://www.scmp.com/rss/5/feed',
  region: 'asia',
  topic: 'asia',
  language: 'en',
  priority: 2,
  pollInterval: 900,    // 15 分钟抓取一次
  timeout: 12000,
  rateLimit: 10,
  enabled: true,        // 将此处改为 true 以启用
},
```

**注意**：RSS 代理仅允许白名单域名。若目标域名不在
`api/rss-proxy.js` 的 `ALLOWED_DOMAINS` 列表中，需先添加。

### 示例二：REST API 源

```typescript
{
  id: 'newsapi-world',
  name: 'NewsAPI World Headlines',
  type: 'api',
  url: 'https://newsapi.org/v2/top-headlines?category=general&language=en',
  topic: 'politics',
  language: 'en',
  priority: 3,
  pollInterval: 1800,
  timeout: 10000,
  rateLimit: 5,
  enabled: true,
},
```

**注意**：`api` 类型源使用原始 URL 直接请求（不经过 RSS 代理）。
若 API 返回 JSON 格式，需在 `src/services/rss.ts` 中扩展解析逻辑以支持非 XML 响应。

### 示例三：网页抓取源

```typescript
{
  id: 'sipri-news',
  name: 'SIPRI News',
  type: 'scrape',
  url: 'https://www.sipri.org/news',
  topic: 'thinktanks',
  language: 'en',
  priority: 3,
  pollInterval: 3600,   // 1 小时抓取一次
  timeout: 15000,
  rateLimit: 2,
  enabled: true,
},
```

**注意**：`scrape` 类型需在 `src/services/rss.ts` 中实现对应 HTML 解析逻辑。

---

## 停用源

将 `enabled` 设为 `false` 即可停用，无需删除配置：

```typescript
{
  id: 'my-feed',
  name: 'My Feed',
  type: 'rss',
  url: 'https://example.com/feed.xml',
  enabled: false,  // ← 停用，不进入抓取流程
},
```

---

## 运行时校验

`CUSTOM_SOURCES` 数组在模块加载时对每条配置调用 `validateCustomSource()`。
若配置有误，应用启动时会抛出 `CustomSourceValidationError`（含中文错误说明），例如：

```
CustomSourceValidationError: 自定义源 "my-feed" 的 type "html" 无效，可选值：rss | atom | api | scrape
CustomSourceValidationError: 自定义源 "my-feed" 缺少必填字段 "url"（字符串）
CustomSourceValidationError: 自定义源 "my-feed" 的 url "not-a-url" 不是合法的 URL（须以 https:// 或 http:// 开头）
```

---

## 优先级（`priority`）说明

| 等级 | 典型来源 |
|------|---------|
| `1` | 通讯社（Reuters、AP、AFP）、官方政府/国际组织 |
| `2` | 主流媒体（BBC、Guardian、Al Jazeera） |
| `3` | 专业媒体、智库、研究机构 |
| `4` | 聚合器、博客 |

---

## 服务端集成（`server/worldmonitor/news/v1/_feeds.ts`）

服务端 RPC（`listFeedDigest`）使用独立的 `VARIANT_FEEDS` 配置。
若需要自定义源也出现在服务端摘要 API 中，可在 `server/worldmonitor/news/v1/_feeds.ts`
相应的 variant 分类下手动添加同一 URL：

```typescript
// server/worldmonitor/news/v1/_feeds.ts
full: {
  // ... 现有分类 ...
  custom: [
    { name: 'My RSS Feed', url: 'https://example.com/feed.xml' },
  ],
},
```

---

## 常见问题

**Q：添加 RSS 源后无法加载（404 / CORS 错误）？**
A：检查 `api/rss-proxy.js` 的 `ALLOWED_DOMAINS` 白名单，将目标域名加入列表。

**Q：`api` / `scrape` 类型的源数据不显示？**
A：这两类源不走 RSS XML 解析管道，需要在 `src/services/rss.ts` 的 `fetchFeed` 函数中
添加对应 `type` 的解析分支。

**Q：自定义源和内置 INTEL_SOURCES 有什么区别？**
A：没有本质区别；启用的自定义源会通过 `customSourceToFeed()` 转换后追加到
`INTEL_SOURCES` 末尾，享受相同的缓存、失败冷却、优先级等机制。

**Q：如何批量导入大量源？**
A：在 `CUSTOM_SOURCES` 数组中追加对象即可，每条记录均会经过校验。
建议每条记录保持清晰注释，说明来源和用途。
