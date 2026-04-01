---
title: "World Monitor Pro - 实施路线图"
description: "World Monitor Pro 的订阅、认证、支付、用户仪表盘与 API 分层路线图。"
---

# World Monitor Pro - 实施路线图

## 背景

`/pro` 落地页承诺了 4 个层级（Free、Pro、API、Enterprise）的功能，但除了营销页之外几乎什么都还没做。当前状态：

- **Convex**：非常基础 - 只有 `registrations` 和 `counters` 两张表
- **认证**：没有 - 无 Clerk、无 session。桌面端只使用 keychain 中手动配置的 `WORLDMONITOR_API_KEY`
- **支付**：没有 - 无 Stripe
- **门控**：仅桌面端 UI 层面（6 个面板、3 个地图图层）。没有服务端强制执行。`api/_api-key.js` 只校验静态 `WORLDMONITOR_VALID_KEYS` 环境变量
- **用户仪表盘**：没有
- **API 层**：没有（虽然营销上说它是独立产品）
- **分发渠道**：没有（Slack/Telegram/Discord/WhatsApp/Email）
- **AI 简报**：没有（虽然通过 Groq 已有 LLM 基础设施，但没有定时简报）
- **股票研究**：只有基础报价，没有财务数据、分析师目标价、估值指标

关键架构约束：**主应用是 vanilla TS + Vite（不是 React）**。只有 `pro-test/` 落地页是 React。Clerk 必须使用 `@clerk/clerk-js` headless SDK。

**推荐 MVP 范围**：Phase 0–4 + tasks 5.1、5.2 = 商业化 MVP。Phase 6 的 XL 功能等到收入验证后再做。

## 依赖图

```text
Phase 0 (Decisions)
  ├──→ Phase 1 (Auth) ────┐
  └──→ Phase 2 (Schema) ──┤
                           ├──→ Phase 3 (Payments) ──→ Phase 4 (Gating)
                           │                                  │
                           │                           ┌──────┼──────┐
                           │                           ▼      ▼      ▼
                           └──────────────────→ Phase 5   Phase 6  Phase 7
                                              (Dashboard) (Pro)    (API)
                                                                     │
                                                                     ▼
                                                              Phase 8 (Enterprise)
```

**关键路径**：Decisions → Auth + Schema（并行）→ Payments → Gating → 其余一切

## 汇总

| Phase | P0 | P1 | P2 | P3 | Total |
|-------|----|----|----|----|-------|
| 0: Decisions | 3 | — | — | — | 3 |
| 1: Auth | 2 | 2 | — | — | 4 |
| 2: Schema | 2 | 1 | 1 | — | 4 |
| 3: Payments | 3 | 2 | 1 | — | 6 |
| 4: Gating | 2 | 2 | — | — | 4 |
| 5: Dashboard | — | 2 | 3 | — | 5 |
| 6: Pro Features | — | 5 | 3 | — | 8 |
| 7: API Tier | — | 2 | 2 | — | 4 |
| 8: Enterprise | — | — | — | 10 | 10 |
| **Total** | **12** | **16** | **10** | **10** | **48** |

## GitHub Issues

### Phase 0：基础决策

#### Issue #0.1：选择认证提供方

**标题**：`decision: auth provider — Clerk (@clerk/clerk-js headless) vs Convex Auth`

**标签**：`decision`、`auth`、`P0`

**描述**：评估并选择 World Monitor Pro 的认证提供方。

**选项**：

1. **Clerk**（推荐） - 与 Convex 一等集成，支持 email/social login，并把 webhook 同步到 Convex。主应用用 `@clerk/clerk-js` headless SDK，`pro-test` 页面用 `@clerk/clerk-react`
2. **Convex Auth** - 内建，组件更少，但较新、实战验证较少
3. **Supabase Auth** - 成熟，但会在 Convex 之上再加一层基础设施

**关键约束**：主应用是 vanilla TS + Vite（不是 React）。认证 SDK 必须支持 headless DOM mounting（`mountSignIn()` / `mountSignUp()`）。

**验收标准**：

- [ ] 记录决策与理由
- [ ] 原型：在 vanilla TS 中用所选 provider 跑通登录流程
- [ ] 验证 Convex webhook sync 正常工作

#### Issue #0.2：选择支付提供方

**标题**：`decision: payment provider — Stripe Checkout (hosted) vs embedded`

**标签**：`decision`、`payments`、`P0`

**描述**：选择支付处理方案。

**建议**：Stripe Checkout（托管式）。比 embedded 更简单，可自动处理 SCA/3DS，前端代码更少。账单管理使用 Stripe Customer Portal。

**验收标准**：

- [ ] Stripe 账号已配置 test mode
- [ ] 记录决策：hosted vs embedded checkout

#### Issue #0.3：API tier 架构决策

**标题**：`decision: API tier architecture — separate Stripe products, independent of Pro plan`

**标签**：`decision`、`api-tier`、`P0`

**描述**：营销页写的是 API “独立于 Pro，可以一起买，也可以单独买”。需要定义 entitlement 模型。

**决策点**：

- 独立 Stripe products：Pro Monthly/Annual + API Starter + API Business
- 用户可以有 Pro 但没有 API，也可以有 API 但没有 Pro
- 单一 `entitlements` projection table 从所有 active subscriptions 推导访问权限
- 限流按 `rateLimitTier` 计算，而不是按产品计算

**验收标准**：

- [ ] 文档化 entitlement matrix
- [ ] 设计 `entitlements` projection table schema

### Phase 1：认证（第 1-2 周）

#### Issue #1.1：Clerk + Convex 集成

**标题**：`feat(auth): Clerk + Convex integration — users table, webhook sync`

**标签**：`auth`、`backend`、`infra`、`P0`

**描述**：使用 Clerk 作为认证提供方，并通过 webhook 将其接入 Convex。

**实施**：

1. 安装 `@clerk/clerk-js`（vanilla TS 主应用）+ `@clerk/clerk-react`（pro-test React 页面）
2. 在 `convex/schema.ts` 中添加 `users` 表
3. 作为 Convex HTTP action 创建 Clerk webhook handler：
   - `user.created` → 在 Convex 中创建用户，写入 `clerkId`、`email`、`name`、`plan: "free"`
   - `user.updated` → 同步 email/name 变化
   - `user.deleted` → 对用户记录做匿名化/墓碑化（不要硬删审计/账单记录）
4. 配置环境变量：`VITE_CLERK_PUBLISHABLE_KEY`、`CLERK_SECRET_KEY`、`CLERK_WEBHOOK_SECRET`

**关键文件**：

- `convex/schema.ts`
- `convex/clerk-webhook.ts`
- `.env.example`

**验收标准**：

- [ ] 用户通过 Clerk 注册后，Convex `users` 表里创建用户文档
- [ ] 用户在 Clerk 更新资料后，Convex 用户同步更新
- [ ] webhook 签名校验通过
- [ ] 自动化：Clerk webhook 集成测试

#### Issue #1.2：vanilla TS 仪表盘登录/注册 UI

**标题**：`feat(auth): sign-in/sign-up UI in vanilla TS dashboard (clerk-js headless)`

**标签**：`auth`、`frontend`、`P0`

**描述**：使用 Clerk 的 headless `@clerk/clerk-js` SDK 在主 vanilla TS 仪表盘中加入认证 UI。

**实施**：

1. 在应用入口初始化 `Clerk`
2. 用 `clerk.mountSignIn(element)` / `clerk.mountSignUp(element)` 打开认证弹窗
3. 在现有 navbar 中加入头像 + 下拉菜单（退出、账户、账单链接）
4. 通过服务模块暴露 `currentUser` 和 entitlements（`src/services/auth.ts`）
5. 将 locked panel CTA 从 “Join Waitlist” 改成 “Sign Up / Sign In”

**关键文件**：

- `src/main.ts`
- `src/services/auth.ts`
- `src/components/Panel.ts`
- `src/locales/en.json`

**风险**：`@clerk/clerk-js` headless 的文档比 React SDK 少。建议尽早原型验证 `mountSignIn()`。

**验收标准**：

- [ ] 主应用中的登录/注册 modal 可用
- [ ] navbar 中显示头像 + 下拉菜单
- [ ] locked panel CTA 改为 “Sign In to Unlock”
- [ ] 刷新后认证状态可持续

