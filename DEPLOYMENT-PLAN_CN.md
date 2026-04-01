# 部署计划 - Clerk Auth + Dodo Payments

## 合并顺序

**先合并 PR #1812，再合并 PR #2024。** Dodo 计费功能依赖于 Clerk Auth 已在 Convex 中注册。

1. 合并 `feat/better-auth` → `main`（PR #1812）
2. 将 `dodo_payments` 基于更新后的 `main` 重新 rebase，并解决冲突
3. 合并 `dodo_payments` → `main`（PR #2024）

---

## 环境变量

### Clerk Auth（PR #1812）

所有值均来自 **Clerk Dashboard → API Keys** ([dashboard.clerk.com](https://dashboard.clerk.com))

| 变量 | 设置位置 | 值 |
|----------|----------|--------|
| `VITE_CLERK_PUBLISHABLE_KEY` | **Vercel** | Clerk Dashboard → API Keys → Publishable Key (`pk_live_...`) |
| `CLERK_SECRET_KEY` | **Vercel**（secret） | Clerk Dashboard → API Keys → Secret Key (`sk_live_...`) |
| `CLERK_JWT_ISSUER_DOMAIN` | **Vercel** | 你的 Clerk 应用域名，例如 `https://worldmonitor.clerk.accounts.dev` |

#### Clerk Dashboard 设置

1. **JWT Template**：创建一个名为 **`convex`** 的模板，并添加自定义 claim：
   ```json
   { "plan": "{{user.public_metadata.plan}}" }
   ```
2. **Pro 用户**：将测试用户的 `public_metadata.plan` 设置为 `"pro"`，以验证高级权限
3. **登录方式**：在 User & Authentication 中配置 email OTP（或你想要的其他方式）

---

### Dodo Payments（PR #2024）

API key + webhook secret 来自 **Dodo Dashboard** ([app.dodopayments.com](https://app.dodopayments.com))

| 变量 | 设置位置 | 值 |
|----------|----------|--------|
| `DODO_API_KEY` | **Convex Dashboard** | Dodo → Settings → API Keys |
| `DODO_PAYMENTS_ENVIRONMENT` | **Convex Dashboard** | `test_mode` 或 `live_mode` |
| `DODO_PAYMENTS_WEBHOOK_SECRET` | **Convex Dashboard** | Dodo → Developers → Webhooks → signing secret |
| `DODO_WEBHOOK_SECRET` | **Convex Dashboard** | 与上面相同的值 |
| `VITE_DODO_ENVIRONMENT` | **Vercel** | `test_mode` 或 `live_mode`（必须与服务端一致） |
| `VITE_CONVEX_URL` | **Vercel** | Convex Dashboard → Settings → Deployment URL (`https://xxx.convex.cloud`) |

#### Dodo Dashboard 设置

1. **Webhook endpoint**：创建一个指向 `https://<convex-deployment>.convex.site/dodo/webhook` 的 webhook
2. **订阅事件**：`subscription.active`、`subscription.renewed`、`subscription.on_hold`、`subscription.cancelled`、`subscription.expired`、`subscription.plan_changed`、`payment.succeeded`、`payment.failed`、`refund.succeeded`、`refund.failed`、`dispute.*`
3. **Products**：确保 product ID 与 `convex/payments/seedProductPlans.ts` 中的种子数据一致 - 部署后运行 `seedProductPlans` mutation

---

## 部署步骤

### 第 1 步 - 合并 PR #1812（Clerk Auth）

```
1. 在 Vercel 上设置 Clerk 环境变量（全部 3 个）
2. 创建名为 "convex" 的 Clerk JWT template
3. 合并 feat/better-auth → main
4. 部署到 Vercel
5. 验证：登录可用，Pro 用户可以看到高级面板，premium API 路由中会出现 bearer token
```

### 第 2 步 - 合并 PR #2024（Dodo Payments）

```
1. 在 Convex Dashboard 上设置 Dodo 环境变量（4 个）
2. 在 Vercel 上设置 Dodo + Convex 环境变量（2 个）
3. 将 dodo_payments rebase 到 main，并解决冲突
4. 合并 dodo_payments → main
5. 部署到 Vercel + Convex
6. 在 Convex Dashboard 中运行 seedProductPlans mutation
7. 在 Dodo Dashboard 中创建 webhook endpoint
8. 验证：Checkout flow → webhook → entitlements granted → 面板解锁
```

### 部署后验证

- [ ] 匿名用户看到被锁定的高级面板
- [ ] Clerk 登录正常工作（email OTP 或已配置的方法）
- [ ] Pro 用户（`public_metadata.plan: "pro"`）看到已解锁面板 + 数据正常加载
- [ ] Dodo 测试结账（`4242 4242 4242 4242`）创建订阅
- [ ] Webhook 触发 → subscription + entitlements 出现在 Convex Dashboard
- [ ] Billing portal 可从 Settings 打开
- [ ] 桌面端 API key 流程仍然按原样工作

---

## 总结

| 位置 | 需要设置的变量 |
|-------|----------------|
| **Vercel** | `VITE_CLERK_PUBLISHABLE_KEY`、`CLERK_SECRET_KEY`、`CLERK_JWT_ISSUER_DOMAIN`、`VITE_DODO_ENVIRONMENT`、`VITE_CONVEX_URL` |
| **Convex Dashboard** | `DODO_API_KEY`、`DODO_PAYMENTS_ENVIRONMENT`、`DODO_PAYMENTS_WEBHOOK_SECRET`、`DODO_WEBHOOK_SECRET` |
