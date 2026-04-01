# 架构

> **最后验证**：2026-03-14，对照提交 `24b502d0`
>
> **归属规则**：当部署拓扑、API 表面、桌面运行时或 bootstrap keys 发生变化时，必须在同一个 PR 中更新本文档。

> **设计理念**：如果你想了解架构决策、情报工作方式和算法选择背后的“为什么”，请参见 [Design Philosophy](docs/architecture.mdx)。

World Monitor 是一个实时全球情报仪表盘，构建为一个 TypeScript 单页应用。它将来自数十个外部来源的数据聚合到一个统一的作战视图中，覆盖地缘政治、军事活动、金融市场、网络威胁、气候事件、海事追踪和航空等领域，并通过交互式地图和一组专门面板进行呈现。

---

## 1. 系统总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Desktop                        │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ DeckGLMap│  │ GlobeMap │  │  Panels    │  │  Workers     │  │
│  │(deck.gl) │  │(globe.gl)│  │(86 classes)│  │(ML, analysis)│  │
│  └────┬─────┘  └────┬─────┘  └─────┬──────┘  └──────────────┘  │
│       └──────────────┴──────────────┘                           │
│                         │ fetch /api/*                          │
└─────────────────────────┼───────────────────────────────────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
    ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
    │   Vercel    │ │  Railway  │ │   Tauri    │
    │ Edge Funcs  │ │ AIS Relay │ │  Sidecar   │
    │ + Middleware│ │ + Seeds   │ │ (Node.js)  │
    └──────┬──────┘ └─────┬─────┘ └─────┬──────┘
           │              │              │
           └──────────────┼──────────────┘
                          │
                   ┌──────▼──────┐
                   │   Upstash   │
                   │    Redis    │
                   └──────┬──────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
        ┌─────▼───┐ ┌─────▼───┐ ┌────▼────┐
        │ Finnhub │ │  Yahoo  │ │ ACLED   │
        │ OpenSky │ │  GDELT  │ │ UCDP    │
        │ CoinGeck│ │  FRED   │ │ FIRMS   │
        │   ...   │ │   ...   │ │   ...   │
        └─────────┘ └─────────┘ └─────────┘
              30+ upstream data sources
```

**源文件**：`package.json`、`vercel.json`

---

## 2. 部署拓扑

| 服务 | 平台 | 职责 |
|---------|----------|------|
| SPA + Edge Functions | Vercel | 静态文件、API 端点、中间件（bot 过滤、社交预览 OG） |
| AIS Relay | Railway | WebSocket 代理（AIS 流）、seed 循环（市场、航空、GPSJAM、风险评分、UCDP、正向事件）、RSS 代理、OREF 轮询 |
| Redis | Upstash | 带 stampede protection 的缓存层、`seed-meta` 新鲜度跟踪、速率限制 |
| Convex | Convex Cloud | 联系表单提交、候补名单注册 |
| Documentation | Mintlify | 公开文档，通过 Vercel 的 `/docs` 代理 |
| Desktop App | Tauri 2.x | macOS（ARM64、x64）、Windows（x64）、Linux（x64、ARM64），内置 Node.js sidecar |
| Container Image | GHCR | 多架构 Docker 镜像（nginx 提供构建后的 SPA，通过代理将 API 转发到上游） |

**源文件**：`vercel.json`、`docker/Dockerfile`、`scripts/ais-relay.cjs`、`convex/schema.ts`、`src-tauri/tauri.conf.json`

---

## 3. 前端架构

### 入口与初始化

`src/main.ts` 初始化 Sentry 错误追踪、Vercel analytics、动态 meta 标签、运行时 fetch patch（桌面 sidecar 重定向）、主题应用，并创建 `App` 实例。

`App.init()` 分 8 个阶段运行：

1. **存储 + i18n**：IndexedDB、语言检测、locale 加载
2. **ML Worker**：ONNX 模型准备（embeddings、情感分析、摘要）
3. **Sidecar**：等待桌面 sidecar 就绪（仅桌面端）
4. **Bootstrap**：从 `/api/bootstrap` 进行双层并发 hydration（fast 3s + slow 5s 超时）
5. **Layout**：`PanelLayoutManager` 渲染地图和面板
6. **UI**：`SignalModal`、`IntelligenceGapBadge`、`BreakingNewsBanner`、correlation engine
7. **Data**：并行执行 `loadAllData()` + 基于视口条件的 `primeVisiblePanelData()`
8. **Refresh**：通过 `startSmartPollLoop()` 使用变体特定轮询间隔

### 组件模型

所有面板都继承自 `Panel` 基类。面板通过 `setContent(html)` 渲染（150ms 去抖），并在稳定的 `this.content` 元素上使用事件委托。面板支持可调的行/列跨度，并持久化到 localStorage。

### 双地图系统

- **DeckGLMap**：通过 deck.gl + maplibre-gl 进行 WebGL 渲染。支持 `ScatterplotLayer`、`GeoJsonLayer`、`PathLayer`、`IconLayer`、`PolygonLayer`、`ArcLayer`、`HeatmapLayer`、`H3HexagonLayer`。使用 PMTiles 协议提供自托管底图瓦片。使用 Supercluster 进行标记聚类。
- **GlobeMap**：通过 globe.gl 提供 3D 交互式地球仪。使用带 `_kind` 区分符的单一 `htmlElementsData` 数组。包含地球纹理、大气着色器、空闲后自动旋转。

图层定义位于 `src/config/map-layer-definitions.ts`，每个定义都会说明渲染器支持情况（flat/globe）、高级状态、变体过滤和 i18n key。

### 状态管理

没有使用外部状态库。`AppContext` 是一个中心可变对象，保存地图引用、面板实例、面板/图层设置、所有缓存数据（新闻、市场、预测、聚类、情报缓存）、进行中的请求跟踪，以及 UI 组件引用。URL 状态通过 `src/utils/urlState.ts` 双向同步（250ms 去抖）。

### Web Workers

- **analysis.worker.ts**：新闻聚类（Jaccard 相似度）、跨领域关联检测
- **ml.worker.ts**：通过 `@xenova/transformers` 做 ONNX 推理（MiniLM-L6 embeddings、情感分析、摘要、NER），并在 worker 内维护向量存储用于标题记忆
- **vector-db.ts**：基于 IndexedDB 的向量存储，用于语义搜索

### 变体系统

通过主机名检测（`tech.worldmonitor.app` → tech，`finance.worldmonitor.app` → finance 等）或桌面端 localStorage 检测。控制项包括：默认面板、地图图层、刷新间隔、主题、UI 文本。变体切换会将所有设置重置为默认值。

**源文件**：`src/main.ts`、`src/App.ts`、`src/app/`、`src/components/Panel.ts`、`src/components/DeckGLMap.ts`、`src/components/GlobeMap.ts`、`src/config/variant.ts`、`src/workers/`

---

## 4. API 层

### Edge Functions

所有 API 端点都位于 `api/` 中，作为独立的 JavaScript 文件部署为 Vercel Edge Functions。它们不能从 `../src/` 或 `../server/` 导入（运行时不同）。只允许使用同目录的 `_*.js` helper 和 npm 包。这一约束由 `tests/edge-functions.test.mjs` 和 pre-push 的 esbuild bundle check 强制执行。

### 共享 Helper

| 文件 | 用途 |
|------|------|
| `_cors.js` | Origin allowlist（worldmonitor.app、Vercel previews、tauri://localhost、localhost） |
| `_rate-limit.js` | Upstash 滑动窗口速率限制、IP 提取 |
| `_api-key.js` | 基于来源的 API key 校验（桌面端需要 key，受信任浏览器可豁免） |
| `_relay.js` | 为 Railway relay 服务请求做代理的工厂 |

### 网关工厂

`server/gateway.ts` 提供 `createDomainGateway(routes)`，用于按领域生成 Edge Function bundle。处理流程如下：

1. Origin 校验（不允许则返回 403）
2. CORS 头
3. OPTIONS 预检
4. API key 校验
5. 速率限制（先按端点，再用全局兜底）
6. 路由匹配（先静态 Map 查找，再动态扫描 `{param}`）
7. POST-to-GET 兼容（针对旧客户端）
8. 带错误边界的处理器执行
9. 生成 ETag（FNV-1a hash）+ 304 Not Modified
10. 应用缓存头

### 缓存层级

| 层级 | s-maxage | 适用场景 |
|------|----------|----------|
| fast | 300s | 实时事件流、航班状态 |
| medium | 600s | 行情报价、股票分析 |
| slow | 1800s | ACLED 事件、网络威胁 |
| static | 7200s | 人道主义摘要、ETF 流向 |
| daily | 86400s | 关键矿产、静态参考数据 |
| no-store | 0 | 船舶快照、飞机追踪 |

### 领域处理器

`server/worldmonitor/<domain>/v1/handler.ts` 导出带有各个 RPC 函数的 handler 对象。每个 RPC 函数都使用 `server/_shared/redis.ts` 中的 `cachedFetchJson()` 来进行 cache-miss 合并：对同一 key 的并发请求只会共享一次上游 fetch 和 Redis 写入。

**源文件**：`api/`、`server/gateway.ts`、`server/router.ts`、`server/_shared/redis.ts`、`server/worldmonitor/`

---

## 5. Proto/RPC 契约系统

项目使用基于 Protocol Buffers 构建的 **sebuf** 框架：

```
proto/ definitions
    ↓ buf generate
src/generated/client/   (TypeScript RPC client stubs)
src/generated/server/   (TypeScript server message types)
docs/api/               (OpenAPI v3 specs)
```

服务定义使用 `(sebuf.http.config)` 注解将 RPC 映射到 HTTP 动词和路径。GET 字段需要 `(sebuf.http.query)` 注解。`repeated string` 字段需要在处理器中使用 `parseStringArray()`。`int64` 在 TypeScript 中映射为 `string`。

CI 通过 `.github/workflows/proto-check.yml` 强制生成代码的新鲜度：运行 `make generate`，如果输出与已提交文件不同就失败。

**源文件**：`proto/`、`Makefile`、`src/generated/`、`.github/workflows/proto-check.yml`

---

## 6. 数据管线

### Bootstrap Hydration

`/api/bootstrap` 一次性从 Redis 读取缓存 key。SPA 会并发拉取两个层级（fast + slow），分别使用独立的 abort controller 和超时。hydrated 数据会通过 `getHydratedData(key)` 按需供面板使用。

### Seed 脚本

`scripts/seed-*.mjs` 会拉取上游数据、做转换，并通过 `scripts/_seed-utils.mjs` 中的 `atomicPublish()` 写入 Redis。Atomic publish 会获取 Redis lock（SET NX）、验证数据、写入 cache key、写入 `seed-meta:<key>`（内容为 `{ fetchedAt, recordCount }`），然后释放锁。

### AIS Relay Seed 循环

Railway relay 服务（`scripts/ais-relay.cjs`）运行持续 seed 循环：

- 市场数据（股票、大宗商品、加密货币、稳定币、板块、ETF 流向、海湾报价）
- 航空（国际延误）
- 正向事件
- GPSJAM（GPS 干扰）
- 风险评分（CII）
- UCDP 事件

这些是主要 seeder。运行在 Railway cron 上的独立 `seed-*.mjs` 脚本属于次要/备份。

### 刷新调度

`startSmartPollLoop()` 支持：指数退避（最大 4 倍）、基于视口的刷新（仅当面板接近视口时）、标签页暂停（隐藏时挂起）、以及标签页可见性恢复时的错峰刷新（150ms 延迟）。

### 健康监控

`api/health.js` 会检查每个 bootstrap key 和独立 key。它会读取 `seed-meta:<key>` 并将 `fetchedAt` 与 `maxStaleMin` 比较。级联组会处理回退链（例如 theater-posture：live、stale、backup）。返回每个 key 的状态：OK、STALE、WARN、EMPTY。

**源文件**：`api/bootstrap.js`、`api/health.js`、`scripts/_seed-utils.mjs`、`scripts/seed-*.mjs`、`scripts/ais-relay.cjs`、`src/services/bootstrap.ts`、`src/app/refresh-scheduler.ts`

---

## 7. 桌面架构

### Tauri Shell

Tauri 2.x（Rust）负责应用生命周期、系统托盘和 IPC 命令：

- **机密管理**：读写平台 keyring（macOS Keychain、Windows Credential Manager、Linux keyring）
- **sidecar 控制**：启动 Node.js 进程、探测端口、注入环境变量
- **窗口管理**：三个可信窗口（main、settings、live-channels），并为 macOS 剪贴板快捷键提供 Edit 菜单

### Node.js Sidecar

`src-tauri/sidecar/local-api-server.mjs` 在动态端口运行。它会动态加载 `api/` 下的 Edge Function handler 模块，通过环境变量从 keyring 注入机密，并 monkey-patch `globalThis.fetch` 强制使用 IPv4（Node.js 会先尝试 IPv6，但许多政府 API 的 IPv6 支持不稳定）。

### Fetch Patch

`src/services/runtime.ts` 中的 `installRuntimeFetchPatch()` 会替换桌面 renderer 中的 `window.fetch`。所有 `/api/*` 请求都会通过 `Authorization: Bearer <token>` 路由到 sidecar（Tauri IPC 生成的 5 分钟 TTL 令牌）。如果 sidecar 失败，请求会回退到云端 API。

**源文件**：`src-tauri/src/main.rs`、`src-tauri/sidecar/local-api-server.mjs`、`src/services/runtime.ts`、`src/services/tauri-bridge.ts`

---

## 8. 安全模型

### 信任边界

```
Browser ↔ Vercel Edge ↔ Upstream APIs
Desktop ↔ Sidecar ↔ Cloud API / Upstream APIs
```

### 内容安全策略

必须保持同步的三个 CSP 来源：

1. `index.html` 中的 `<meta>` 标签（开发环境、Tauri fallback）
2. `vercel.json` 中的 HTTP header（生产环境，会覆盖 meta）
3. `src-tauri/tauri.conf.json`（桌面端）

### 身份验证

非浏览器来源需要 API key。受信任的浏览器来源（生产域名、Vercel preview 部署、localhost）可以豁免。高级 RPC 路径始终需要 key。

### Bot 保护

`middleware.ts` 会过滤自动化流量：在 API 和资源路径上阻止已知爬虫 user-agent，同时允许社交预览 bot（Twitter、Facebook、LinkedIn、Telegram、Discord）访问 story 和 OG 端点。

### 速率限制

基于 Upstash 的按 IP 滑动窗口，并针对高流量路径做端点级覆盖。

### 桌面机密存储

机密存储在平台 keyring 中（绝不以明文存储），通过 Tauri IPC 注入到 sidecar，并限定在一个允许的环境变量键白名单里。

**源文件**：`middleware.ts`、`vercel.json`、`index.html`、`src-tauri/tauri.conf.json`、`api/_api-key.js`、`server/_shared/rate-limit.ts`

---

## 9. 缓存架构

### 四层层级

```
Bootstrap seed (Railway writes to Redis on schedule)
    ↓ miss
In-memory cache (per Vercel instance, short TTL)
    ↓ miss
Redis (Upstash, cross-instance, cachedFetchJson coalesces concurrent misses)
    ↓ miss
Upstream API fetch (result cached back to Redis + seed-meta written)
```

### 缓存 Key 规则

任何共享缓存的 RPC handler 都必须把请求变化参数包含进 cache key。否则会导致跨请求数据泄漏。

### ETag / 条件请求

`server/gateway.ts` 会对每个响应体计算 FNV-1a hash，并将其作为 `ETag` 返回。客户端发送 `If-None-Match` 时，如果内容未变化，就会收到 `304 Not Modified`。

### CDN 集成

`CDN-Cache-Control` 头会让 Cloudflare edge（启用时）拥有比 `Cache-Control` 更长的 TTL，因为 CF 可以通过 ETag 重新验证，而无需完整传输 payload。

### Seed 元数据

每次写缓存时，也会写入 `seed-meta:<key>`，内容为 `{ fetchedAt, recordCount }`。健康检查端点会读取这些数据，判断新鲜度并发出过期告警。

**源文件**：`server/_shared/redis.ts`、`server/gateway.ts`、`api/health.js`

---

## 10. 测试

### 单元与集成测试

使用 `node:test` runner。`tests/*.test.{mjs,mts}` 中的测试覆盖：服务端处理器、cache key、circuit breaker、Edge Function 约束、数据验证、市场报价去重、健康检查、面板配置 guardrail、变体图层过滤等。

### Sidecar 与 API 测试

`api/*.test.mjs` 和 `src-tauri/sidecar/*.test.mjs` 测试 CORS 处理、YouTube embed 代理和本地 API server 行为。

### 端到端测试

`e2e/*.spec.ts` 中的 Playwright spec 测试主题切换、circuit breaker 持久化、关键词激增流程、移动端地图交互、运行时 fetch patch，以及按变体进行的 golden screenshot 视觉回归。

### Edge Function Guardrails

`tests/edge-functions.test.mjs` 会验证所有非 helper 的 `api/*.js` 文件都是自包含的：不能有 `node:` 内置模块导入，也不能跨目录导入 `../server/` 或 `../src/`。pre-push hook 还会对每个端点运行 esbuild bundle 检查。

### Pre-Push Hook

每次 `git push` 前都会运行：

1. TypeScript 检查（`tsc --noEmit`，针对 src 和 API）
2. CJS 语法校验
3. Edge function esbuild bundle 检查
4. Edge function import guardrail 测试
5. Markdown lint
6. MDX lint（Mintlify 兼容性）
7. 版本同步检查

**源文件**：`tests/`、`e2e/`、`playwright.config.ts`、`.husky/pre-push`

---

## 11. CI/CD

| 工作流 | 触发条件 | 检查内容 |
|----------|---------|--------|
| `typecheck.yml` | PR、push 到 main | `tsc --noEmit`，覆盖 src 和 API tsconfig |
| `lint.yml` | PR（markdown 变更） | markdownlint-cli2 |
| `proto-check.yml` | PR（proto 变更） | 生成代码与已提交输出一致 |
| `build-desktop.yml` | release tag、手动触发 | 5 平台矩阵构建、代码签名（macOS）、Linux AppImage 库剥离、smoke test |
| `docker-publish.yml` | release、手动触发 | 推送到 GHCR 的多架构镜像（amd64、arm64） |
| `test-linux-app.yml` | 手动触发 | Linux AppImage 构建 + 带截图校验的无头 smoke test |

**源文件**：`.github/workflows/`、`.husky/pre-push`

---

## 12. 目录参考

```
.
├── api/                    Vercel Edge Functions（自包含 JS）
│   ├── _*.js               共享 helper（CORS、rate-limit、API key、relay）
│   └── <domain>/           领域端点（aviation/、climate/、conflict/、...）
├── blog-site/              静态博客（构建到 public/blog/）
├── convex/                 Convex 后端（联系表单、候补名单）
├── data/                   静态数据文件（conservation、renewable、happiness）
├── deploy/                 部署配置
├── docker/                 Railway 使用的 Dockerfile + nginx 配置
├── docs/                   Mintlify 文档站
├── e2e/                    Playwright E2E spec
├── proto/                  Protobuf 服务定义（sebuf 框架）
├── scripts/                种子脚本、构建辅助、relay 服务
├── server/                 服务端代码（会被打包进 Edge Functions）
│   ├── _shared/            Redis、rate-limit、LLM、缓存工具
│   ├── gateway.ts          领域网关工厂
│   ├── router.ts           路由匹配
│   └── worldmonitor/       领域处理器（与 proto 结构对应）
├── shared/                 跨平台 JSON 配置（市场、RSS 域名）
├── src/                    浏览器 SPA（TypeScript）
│   ├── app/                App 编排管理器
│   ├── bootstrap/          chunk 重新加载恢复
│   ├── components/         Panel 子类 + 地图组件
│   ├── config/             变体、面板、图层、市场配置
│   ├── generated/          Proto 生成的客户端/服务端 stub（请勿编辑）
│   ├── locales/            i18n 翻译文件
│   ├── services/           按领域组织的业务逻辑
│   ├── types/              TypeScript 类型定义
│   ├── utils/              共享工具（circuit breaker、主题、URL state）
│   └── workers/            Web Workers（分析、ML、向量数据库）
├── src-tauri/              Tauri 桌面 shell（Rust）
│   └── sidecar/            Node.js sidecar API server
└── tests/                  单元/集成测试（node:test）
```
