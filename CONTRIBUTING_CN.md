# 参与 World Monitor 贡献

感谢你对为 World Monitor 贡献的兴趣！这个项目依靠社区贡献不断成长，无论是代码、数据源、文档还是 bug 报告，都非常欢迎。

<p align="center">
  <a href="./CONTRIBUTING.md"><strong>English</strong></a> &nbsp;·&nbsp;
  <a href="./CONTRIBUTING_CN.md"><strong>中文</strong></a>
</p>

## 目录

- [架构概览](#架构概览)
- [快速开始](#快速开始)
- [开发环境搭建](#开发环境搭建)
- [如何贡献](#如何贡献)
- [Pull Request 流程](#pull-request-流程)
- [AI 辅助开发](#ai-辅助开发)
- [编码规范](#编码规范)
- [与 Sebuf（RPC 框架）协作](#与-sebufrpc-框架协作)
- [添加数据源](#添加数据源)
- [添加 RSS 源](#添加-rss-源)
- [报告 Bug](#报告-bug)
- [功能请求](#功能请求)
- [行为准则](#行为准则)

## 架构概览

World Monitor 是一个实时 OSINT 仪表盘，使用 **纯 TypeScript**（不依赖 UI 框架）、用于地图渲染的 **MapLibre GL + deck.gl**，以及一个名为 **Sebuf** 的自定义 Proto-first RPC 框架来完成所有 API 通信。

### 关键技术

| 技术 | 用途 |
|---|---|
| **TypeScript** | 所有代码，包括前端、边缘函数和处理器 |
| **Vite** | 构建工具和开发服务器 |
| **Sebuf** | Proto-first 的 HTTP RPC 框架，用于类型化 API 契约 |
| **Protobuf / Buf** | 跨 22 个领域的服务和消息定义 |
| **MapLibre GL** | 基础地图渲染（瓦片、地球模式、相机） |
| **deck.gl** | WebGL 覆盖图层（散点、GeoJSON、弧线、热力图） |
| **d3** | 图表、迷你折线图和数据可视化 |
| **Vercel Edge Functions** | 无服务器 API 网关 |
| **Tauri v2** | 桌面应用（Windows、macOS、Linux） |
| **Convex** | 极简后端（仅用于 beta 兴趣登记） |
| **Playwright** | 端到端测试和视觉回归测试 |

### 变体系统

该代码库会基于同一份源码生成三个应用变体，每个变体面向不同受众：

| 变体 | 命令 | 关注重点 |
|---|---|---|
| `full` | `npm run dev` | 地缘政治、军事、冲突、基础设施 |
| `tech` | `npm run dev:tech` | 初创公司、AI/ML、云计算、网络安全 |
| `finance` | `npm run dev:finance` | 市场、交易、央行、大宗商品 |

这些变体共享全部代码，但默认面板、地图图层和 RSS 源不同。变体配置位于 `src/config/variants/`。

### 目录结构

| 目录 | 用途 |
|---|---|
| `src/components/` | UI 组件 - Panel 子类、地图、模态框（约 50 个面板） |
| `src/services/` | 数据获取模块 - sebuf 客户端封装、AI、信号分析 |
| `src/config/` | 静态数据和变体配置（feeds、地理、军事、管线、港口） |
| `src/generated/` | 自动生成的 sebuf 客户端 + 服务端 stub（**请勿手动编辑**） |
| `src/types/` | TypeScript 类型定义 |
| `src/locales/` | i18n JSON 文件（14 种语言） |
| `src/workers/` | 用于分析的 Web Workers |
| `server/` | 所有 17 个领域服务的 Sebuf 处理器实现 |
| `api/` | Vercel Edge Functions（sebuf 网关 + 旧版端点） |
| `proto/` | Protobuf 服务和消息定义 |
| `data/` | 静态 JSON 数据集 |
| `docs/` | 文档 + 生成的 OpenAPI 规范 |
| `src-tauri/` | Tauri v2 Rust 应用 + 用于桌面构建的 Node.js sidecar |
| `e2e/` | Playwright 端到端测试 |
| `scripts/` | 构建和打包脚本 |

## 快速开始

1. **Fork** 该仓库到你的 GitHub 账户
2. **克隆** 你的 fork 到本地：
   ```bash
   git clone https://github.com/<your-username>/worldmonitor.git
   cd worldmonitor
   ```
3. **创建分支** 用于你的工作：
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 开发环境搭建

```bash
# 安装所有内容（buf CLI、sebuf 插件、npm 依赖、Playwright 浏览器）
make install

# 启动开发服务器（默认 full 变体）
npm run dev

# 启动其他变体
npm run dev:tech
npm run dev:finance

# 运行类型检查
npm run typecheck

# 运行测试
npm run test:data          # 数据完整性测试
npm run test:e2e           # Playwright 端到端测试

# 生产构建（按变体）
npm run build              # full
npm run build:tech
npm run build:finance
```

开发服务器运行在 `http://localhost:3000`。运行 `make help` 可以查看所有可用的 make 目标。

### 环境变量（可选）

为了获得完整功能，请将 `.env.example` 复制为 `.env.local`，并填入你需要的 API 密钥。即使没有任何 API 密钥，应用也可以运行，只是外部数据源将不可用。

完整列表请参见 [API Dependencies](docs/DOCUMENTATION.md#api-dependencies)。

## 如何贡献

### 我们欢迎的贡献类型

- **修复 bug** - 发现问题了吗？直接修复它！
- **新增数据图层** - 向地图添加新的地理空间数据源
- **RSS 源** - 用高质量来源扩充我们 100+ 的 feed 集合
- **UI/UX 改进** - 让仪表盘更直观
- **性能优化** - 更快的加载、更好的缓存
- **文档** - 改进文档、添加示例、修复错别字
- **可访问性** - 让所有人都能使用这个仪表盘
- **国际化** - 帮助 World Monitor 支持更多语言
- **测试** - 添加单元测试或集成测试

### 我们特别希望看到的内容

- 新的数据图层（参见 [添加数据源](#添加数据源)）
- feed 质量改进和新的 RSS 源
- 移动端响应式改进
- 地图渲染管线的性能优化
- 更好的异常检测算法

## Pull Request 流程

1. **如果你的更改影响公共 API 或用户可见行为，请更新文档**
2. **提交前运行类型检查**：`npm run typecheck`
3. **在本地测试你的更改**，至少要用 `full` 变体测试；如果你的改动影响其他变体，也要一并测试
4. **保持 PR 聚焦** - 每个 pull request 只包含一个功能或修复
5. **写清楚描述**，解释你的 PR 做了什么，以及为什么这样做
6. **如适用，关联相关 issue**

### PR 标题约定

使用能概括变更内容的描述性标题：

- `feat: add earthquake magnitude filtering to map layer`
- `fix: resolve RSS feed timeout for Al Jazeera`
- `docs: update API dependencies section`
- `perf: optimize marker clustering at low zoom levels`
- `refactor: extract threat classifier into separate module`

### 审查流程

- 所有 PR 在合并前都需要维护者审查
- 维护者可能会要求修改，这很正常，也是一种协作过程
- 一旦批准，维护者会合并你的 PR

## AI 辅助开发

我们完全支持 AI 辅助开发。我们的许多 PR 都会标注帮助生成它们的 LLM（例如 `claude`、`codex`、`cursor`），也欢迎贡献者使用任何他们觉得有帮助的 AI 工具。

不过，**无论代码是如何写出来的，都要遵循同样的质量标准**。AI 生成的代码会像人工编写的代码一样接受同等严格的审查。贡献者有责任理解并能够解释自己提交的每一行代码。未经审查就盲目粘贴 LLM 输出是不被鼓励的——请把 AI 当作协作者，而不是你自己判断力的替代品。

## 编码规范

### TypeScript

- 所有新代码都使用 TypeScript
- 避免使用 `any` 类型 - 使用合适的类型，或者配合类型守卫使用 `unknown`
- 为公共 API 导出 interface/type
- 使用有意义的变量名和函数名

### 代码风格

- 遵循仓库现有的代码风格
- 默认使用 `const`，只有在需要重新赋值时才使用 `let`
- 优先使用函数式模式（map、filter、reduce），少用命令式循环
- 保持函数职责单一 - 每个函数只负责一件事
- 为导出的函数和复杂逻辑添加 JSDoc 注释

### 文件组织

- 静态图层/地理数据和变体配置放在 `src/config/`
- Sebuf 处理器实现放在 `server/worldmonitor/{domain}/v1/`
- Edge Function 网关和旧版端点放在 `api/`
- UI 组件（面板、地图、模态框）放在 `src/components/`
- 服务模块（数据获取、客户端封装）放在 `src/services/`
- Proto 定义放在 `proto/worldmonitor/{domain}/v1/`

## 与 Sebuf（RPC 框架）协作

Sebuf 是本项目自定义的 Proto-first HTTP RPC 框架，是 gRPC-Web 的轻量替代方案。客户端和服务端之间的所有 API 通信都使用 Sebuf。

### 工作方式

1. **Proto 定义** 位于 `proto/worldmonitor/{domain}/v1/`，用于定义服务和消息
2. **代码生成**（`make generate`）会生成：
   - 位于 `src/generated/client/` 的 TypeScript 客户端（例如 `MarketServiceClient`）
   - 位于 `src/generated/server/` 的服务端路由工厂（例如 `createMarketServiceRoutes`）
3. **处理器** 位于 `server/worldmonitor/{domain}/v1/handler.ts`，实现服务接口
4. **网关** 位于 `api/[domain]/v1/[rpc].ts`，注册所有处理器并路由请求
5. **客户端** 位于 `src/services/{domain}/index.ts`，对生成的客户端进行封装供应用使用

### 添加新的 RPC 方法

1. 在 `.proto` 服务定义中添加该方法
2. 运行 `make generate` 重新生成客户端/服务端 stub
3. 在该领域的 `handler.ts` 中实现处理器方法
4. 客户端 stub 会自动生成 - 直接从 `src/services/{domain}/` 中使用它

使用 `make lint` 检查 proto 文件，使用 `make breaking` 检查相对于 main 分支的破坏性变更。

### Proto 约定

- **时间字段**：使用 `int64`（Unix epoch 毫秒），不要使用 `google.protobuf.Timestamp`
- **int64 编码**：在时间字段上加上 `[(sebuf.http.int64_encoding) = INT64_ENCODING_NUMBER]`，这样 TypeScript 接收到的是 `number` 而不是 `string`
- **HTTP 注解**：每个 RPC 方法都需要 `option (sebuf.http.config) = { path: "...", method: POST }`

### Proto 代码生成要求

运行 `make install` 可以自动安装所有内容，或者分别安装：

```bash
make install-buf       # 安装 buf CLI（需要 Go）
make install-plugins   # 安装 sebuf protoc-gen 插件（需要 Go）
```

## 添加数据源

要向地图添加新的数据图层：

1. **定义数据源** - 确认你要集成的 API 或数据集
2. **添加 proto 服务**（如果该数据需要后端代理）- 在 `proto/worldmonitor/{domain}/v1/` 中定义消息和 RPC 方法
3. **生成 stub** - 运行 `make generate`
4. **实现处理器** - 放在 `server/worldmonitor/{domain}/v1/`
5. **注册处理器** - 在 `api/[domain]/v1/[rpc].ts` 和 `vite.config.ts` 中注册（用于本地开发）
6. **创建服务模块** - 在 `src/services/{domain}/` 中封装生成的客户端
7. **添加图层配置**，并按照现有图层模式实现地图渲染器
8. **添加到图层切换** - 让它可以在 UI 中切换
9. **记录数据源** - 把它添加到 `docs/DOCUMENTATION.md`

对于处理非 JSON 载荷的端点（XML feed、二进制数据、HTML 嵌入），你可以直接在 `api/` 中添加一个独立的 Edge Function，而不是使用 Sebuf。对于任何返回 JSON 的内容，优先使用 Sebuf - 类型化契约总是值得的。

### 数据源要求

- 必须可自由访问（核心功能不能依赖付费 API）
- 必须具有宽松许可证，或者属于公开的政府数据
- 至少应当每天更新一次，以保证实时相关性
- 必须包含地理坐标，或者能够被地理定位

### 国家边界覆盖

国家轮廓从 `public/data/countries.geojson` 加载。可选的更高分辨率覆盖层（来源于 [Natural Earth](https://www.naturalearthdata.com/)）通过 R2 CDN 提供。应用会在主文件之后加载覆盖层，并替换任何 `ISO3166-1-Alpha-2`（或 `ISO_A2`）匹配的国家几何数据。要从 Natural Earth 刷新边界覆盖层，请运行：

```bash
node scripts/fetch-country-boundary-overrides.mjs
rclone copy public/data/country-boundary-overrides.geojson r2:worldmonitor-maps/
```

## 添加 RSS 源

要添加新的 RSS 源：

1. 确认该 feed 可靠且持续维护
2. 根据编辑可靠性分配一个 **source tier**（1-4）
3. 标记任何 **国家关联** 或 **宣传风险**
4. 对 feed 进行分类（地缘政治、防务、能源、科技等）
5. 测试 feed 是否能通过 RSS 代理正确解析

## 报告 Bug

提交 bug 报告时，请包含：

- **描述** - 清晰说明问题是什么
- **复现步骤** - 如何触发这个 bug
- **预期行为** - 应该发生什么
- **实际行为** - 实际发生了什么
- **截图** - 如适用
- **浏览器/操作系统** - 你的环境信息
- **控制台错误** - 任何相关的浏览器控制台输出

请在可用时使用 [Bug Report issue template](https://github.com/koala73/worldmonitor/issues/new/choose)。

## 功能请求

我们欢迎功能创意！在提出功能建议时：

- **描述它要解决的问题**
- **尽可能详细地提出解决方案**
- **考虑你想到的替代方案**
- **提供上下文** - 谁会从这个功能中受益？

请在可用时使用 [Feature Request issue template](https://github.com/koala73/worldmonitor/issues/new/choose)。

## 行为准则

本项目遵循 [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md)。参与本项目即表示你应当遵守该行为准则。请通过 GitHub issues 或联系仓库所有者来报告不可接受的行为。

---

感谢你帮助让 World Monitor 变得更好！🌍
