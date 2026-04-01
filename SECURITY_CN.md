# 安全政策

## 支持的版本

| 版本 | 是否支持 |
| --- | --- |
| main | :white_check_mark: |

目前只有 `main` 分支上的最新版本会被积极维护，并接收安全更新。

## 漏洞报告

**请不要通过公开的 GitHub issue 报告安全漏洞。**

如果你在 World Monitor 中发现了安全漏洞，请负责任地报告：

1. **GitHub 私密漏洞报告**：使用 [GitHub 的私密漏洞报告](https://github.com/koala73/worldmonitor/security/advisories/new) 直接向仓库提交报告。
2. **直接联系**：你也可以通过 GitHub 直接联系仓库所有者 [@koala73](https://github.com/koala73)。

### 需要提供的内容

- 漏洞描述及其潜在影响
- 复现步骤
- 受影响的组件（Edge Functions、客户端代码、数据图层等）
- 你已经识别出的任何潜在修复或缓解措施

### 响应时间

- **确认收到**：在你提交报告后的 48 小时内
- **初步评估**：1 周内
- **修复/补丁**：视严重程度而定，关键问题会优先处理

### 你可以期待什么

- 你会收到报告已收到的确认
- 我们会与你合作理解并验证问题
- 我们会持续告知修复进展
- 修复提交中会感谢报告者的贡献（除非你希望匿名）

## 安全注意事项

World Monitor 是一个客户端情报仪表盘，聚合公开可用的数据。以下是关键安全区域：

### API 密钥与机密信息

- **Web 部署**：API 密钥存储在 Vercel Edge Functions 的服务端
- **桌面运行时**：API 密钥通过统一的 vault 条目存储在操作系统密钥串中（macOS Keychain / Windows Credential Manager），不会以明文写入磁盘
- 任何 API 密钥都不应提交到仓库中
- 环境变量（`.env.local`）已加入 `.gitignore`
- RSS 代理使用域名 allowlist 来防止 SSRF

### Edge Functions 与 Sebuf 处理器

- 所有 17 个领域 API 都通过 Sebuf（基于 Proto-first RPC 的框架）在 Vercel Edge Functions 上提供
- Edge Functions 和处理器应验证并清理所有输入
- 每个函数都配置了 CORS 头
- 速率限制和 circuit breaker 可防止滥用

### 客户端安全

- 不会把敏感数据存储在 localStorage 或 sessionStorage 中
- 外部内容（RSS 源、新闻）在渲染前会被清理
- 地图数据图层使用可信、经过验证的数据源
- 内容安全策略将 `script-src` 限制为 `'self'`（不允许 unsafe-inline/eval）

### 桌面运行时安全（Tauri）

- **IPC 来源校验**：敏感的 Tauri 命令（secrets、cache、token）只允许可信窗口访问；来自外部来源的窗口（例如 YouTube 登录窗口）会被阻止
- **DevTools**：生产构建中禁用；开发时通过显式的 Cargo feature 开关启用
- **Sidecar 身份验证**：每个会话的 CSPRNG 令牌（`LOCAL_API_TOKEN`）用于验证所有 renderer 到 sidecar 的请求，防止其他本地进程访问 API
- **能力隔离**：YouTube 登录窗口运行在受限 capability 下，无法访问 secret 或 cache IPC 命令
- **fetch patch 信任边界**：全局 fetch 拦截器会注入 sidecar 令牌，TTL 为 5 分钟；renderer 是预期客户端 - 如果 renderer 完整性被破坏，Tauri IPC 提供的访问权限比 fetch patch 更高

### 数据源

- World Monitor 聚合的是公开可用的 OSINT 数据
- 不使用机密或受限制的数据源
- 带有国家背景的来源会标注宣传风险评分
- 所有数据都只读消费 - 平台不会修改上游来源

## 范围

以下内容属于安全报告的**范围内**：

- World Monitor 代码库中的漏洞
- Edge Function 安全问题（SSRF、注入、认证绕过）
- 通过 RSS 源或外部数据导致的 XSS 或内容注入
- API 密钥泄露或机密信息泄漏
- Tauri IPC 命令权限提升或 capability 绕过
- Sidecar 身份验证绕过或令牌泄漏
- 存在可利用攻击路径的依赖漏洞

以下内容属于**范围外**：

- 第三方服务中的漏洞（请向上游提供方报告）
- 社会工程攻击
- 拒绝服务攻击
- 仓库 fork 副本中的问题
- 用户自行提供的环境配置中的安全问题

## 贡献者最佳实践

- 永远不要提交 API 密钥、令牌或其他机密
- 所有敏感配置都使用环境变量
- 在 Edge Functions 中清理外部输入
- 保持依赖更新 - 定期运行 `npm audit`
- 对 API 访问遵循最小权限原则

---

感谢你帮助保护 World Monitor 和它的用户安全！🔒
