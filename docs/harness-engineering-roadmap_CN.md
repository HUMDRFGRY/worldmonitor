---
title: "Harness 工程就绪路线图"
description: "基于 OpenAI 2026 年 2 月的 Harness Engineering 文章，对本仓库的代理工程成熟度做评估。"
---

> 基于 [Harness Engineering: Leveraging Codex in an Agent-First World](https://openai.com/index/harness-engineering/)（OpenAI，2026 年 2 月）
>
> **最后更新**：2026-03-14
>
> **当前就绪度**：约 25%

## 杠杆评估

| # | 支柱 | 状态 | 分数 |
|---|------|------|------|
| 1 | 把仓库知识作为系统记录 | 良好 | 7/10 |
| 2 | 强制架构约束 | 良好 | 6/10 |
| 3 | 应用可读性（代理可观测性） | 较弱 | 2/10 |
| 4 | 代理之间的 review 闭环 | 空白 | 0/10 |
| 5 | 自愈 / 垃圾回收 | 空白 | 0/10 |
| 6 | 完整功能闭环 | 空白 | 0/10 |
| 7 | 文档 lint / 整理 | 部分 | 4/10 |

## 支柱 1：仓库知识作为系统记录

**原则**：`AGENTS.md` 是目录，不是百科全书。采用渐进式披露。仓库之外的东西视为不存在。

### 已完成

- [x] 根目录 `AGENTS.md`（目录化、渐进式披露）
- [x] 根目录 `ARCHITECTURE.md`（系统参考，带源码引用与 ownership 规则）
- [x] `docs/architecture.mdx` 已重命名为 “Design Philosophy”（解释设计决策）
- [x] 旧版 `docs/Docs_To_Review/ARCHITECTURE.md` 已加废弃提示
- [x] 架构文档之间建立了交叉引用
- [x] Proto contract 系统与 CI freshness 检查
- [x] 完整的 Mintlify 文档站与 API reference

### 剩余

- [ ] 创建 `docs/design-docs/` 目录并加入 `index.md`
- [ ] 创建 `docs/exec-plans/active/` 与 `docs/exec-plans/completed/`
- [ ] 创建 `docs/product-specs/` 并加入 `index.md`
- [ ] 将 `.claude/memory/` 中与所有贡献者相关的约定迁移到仓库可见文档
- [ ] 增加 `docs/generated/` 用于自动生成的参考文档

## 支柱 2：强制架构约束

**原则**：仅靠文档无法维持一致性。需要自定义 lint 强制依赖方向、命名、文件大小、结构化日志等。lint error 需要附带修复建议。

### 已完成

- [x] TypeScript strict mode
- [x] CI 与 pre-push 中的 `tsc --noEmit`
- [x] Edge function 自包含检查
- [x] Proto breaking-change 检测
- [x] Markdown lint

### 剩余

- [x] **P0**：加入 JS/TS linter（Biome 2.4.7）
- [x] **P0**：加入架构边界 lint
- [ ] 把 `.claude/memory/` 的约定编码成 lint 规则
- [ ] 文件大小限制告警
- [ ] API handlers 的结构化日志强制

## 支柱 3：应用可读性（代理可观测性）

**原则**：代理必须能启动应用、导航 UI、截图、检查 DOM，并查询日志/指标/trace。

### 已完成

- [x] 浏览器端 Sentry
- [x] `api/health.js` 带逐 key freshness 监控
- [x] `api/seed-health.js`
- [x] Playwright E2E 基础设施
- [x] Circuit breaker 指标

### 剩余

- [ ] **P1**：扩展 Playwright E2E harness，支持代理驱动验证
- [ ] **P1**：为 API handlers 添加结构化 JSON 日志
- [ ] 以可查询格式暴露日志
- [ ] 增加性能预算断言
- [ ] 桌面端接入 Chrome DevTools Protocol 以便 DOM 检查

## 支柱 4：代理之间的 review 闭环

**原则**：代理先在本地自审，再由其他代理复审。反馈循环持续到通过为止。

### 已完成

- [x] pre-push hook 运行自动检查
- [x] CI 对所有 PR 跑 typecheck

### 剩余

- [ ] **P2**：在 CI 中配置代理 PR review
- [ ] 从 advisory comments 开始，而不是 blocking
- [ ] 增加 self-review 步骤
- [ ] 多代理复审：分别检查安全、性能、约定

## 支柱 5：自愈 / 垃圾回收

**原则**：后台代理扫描违规并发起重构 PR。技术债应成为增量维护，而不是大规模重构。

### 已完成

- [x] `AGENTS.md` 中已部分编码“金科玉律”

### 剩余

- [ ] **P3**：创建约定违规扫描器
- [ ] 后台代理发起小型重构 PR
- [ ] 在 `docs/exec-plans/tech-debt-tracker.md` 中跟踪技术债
- [ ] 定义“golden principles”文档

## 支柱 6：完整功能闭环

**原则**：给定一个 prompt，代理应能验证仓库状态、复现 bug、录制视频、实现修复、验证修复、开 PR、处理反馈并合并。

### 已完成

- [x] 代理可通过 `gh` 开 PR
- [x] 代理可通过 `npm run test:data` 运行测试
- [x] 支持隔离 worktree

### 剩余

- [ ] **P4**：bug 复现 harness
- [ ] 低风险 PR 自合并流水线
- [ ] 代理升级协议（何时问人）
- [ ] 构建失败自动修复

## 支柱 7：文档 lint / 整理

**原则**：专门的 lint 检查文档的新鲜度、交叉链接和结构；后台代理负责整理任务。

### 已完成

- [x] `markdownlint-cli2` 已进入 CI 与 pre-push
- [x] Mintlify 兼容性的 MDX lint
- [x] `ARCHITECTURE.md` 中的 ownership 规则

### 剩余

- [ ] **P3**：文档新鲜度 lint
- [ ] 交叉链接验证器
- [ ] 文档整理代理

## 实施顺序

```text
Phase 1 (P0) — Foundation
├── Add Biome/ESLint linter
├── Add tests to CI
└── Architectural boundary rules

Phase 2 (P1) — Agent Observability
├── Expand Playwright harness
├── Structured logging
└── Encode memory conventions as lint rules

Phase 3 (P2) — Review Loops
├── Automated PR review agent
└── Golden patterns doc

Phase 4 (P3) — Self-Healing
├── Convention violation scanner
├── Doc freshness linter
└── Tech debt tracker

Phase 5 (P4) — Full Autonomy
├── Bug reproduction harness
├── Self-merge pipeline
└── Progressive disclosure doc tree
```

## 进度日志

| 日期 | 变更 | 支柱 |
|------|------|------|
| 2026-03-14 | 创建 `AGENTS.md`（目录） | 1 |
| 2026-03-14 | 创建 `ARCHITECTURE.md`（系统参考，Codex-approved） | 1 |
| 2026-03-14 | 重命名 `docs/architecture.mdx` 为 “Design Philosophy” 并添加交叉引用 | 1 |
| 2026-03-14 | 废弃旧版 `docs/Docs_To_Review/ARCHITECTURE.md` | 1 |
| 2026-03-14 | 添加 Biome 2.4.7 linter | 2 |
| 2026-03-14 | 修复全部 9 个失败测试文件 | 2 |
| 2026-03-14 | 添加 architectural boundary lint | 2 |

