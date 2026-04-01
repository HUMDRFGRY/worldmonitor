# World Monitor - 社区推广指南

感谢你帮助传播 World Monitor！这份指南提供了可直接使用的宣传要点、必看功能和视觉建议，方便你为受众制作更有吸引力的内容。

## 什么是 World Monitor？

**一句话介绍**：一个免费、开源、实时的全球情报仪表盘，像 Bloomberg Terminal 与 OSINT 的结合体，但面向所有人。

**更长的描述**：World Monitor 把 170+ 新闻 feeds、军事追踪、金融市场、冲突数据、抗议监测、卫星影像和 AI 分析整合到一个统一的仪表盘里，并配有交互式地球仪。它提供网页应用、桌面应用（macOS/Windows/Linux）和可安装的 PWA。

## 关键链接

| 链接 | 说明 |
|------|------|
| [worldmonitor.app](https://worldmonitor.app) | 主仪表盘 - 地缘政治、军事、冲突 |
| [tech.worldmonitor.app](https://tech.worldmonitor.app) | 技术版 - 初创公司、AI/ML、网络安全 |
| [finance.worldmonitor.app](https://finance.worldmonitor.app) | 金融版 - 市场、交易所、央行 |
| [GitHub](https://github.com/koala73/worldmonitor) | 源码（AGPL-3.0） |

## 必看功能（Top 10）

### 1. 40+ 数据层的交互式地球仪

整个平台的核心。一个 WebGL 加速的地球仪（deck.gl），带可切换图层：冲突、军事基地、核设施、海底电缆、管道、卫星火点、抗议、网络威胁等。随着缩放，细节图层会逐步显现。

**展示方式**：切换不同图层；放大到冲突区域；展示图层面板。

### 2. AI 驱动的 World Brief

一键生成全球重大动态摘要。三层 LLM provider 链：本地 Ollama/LM Studio（完全私有、离线）、Groq（快速云端）、OpenRouter（回退）。Redis 缓存保证重复查询几乎瞬时返回。

**展示方式**：新闻面板顶部的摘要卡片。

### 3. 国家情报简报

点击地图上的任意国家，会打开一个全页情报档案：不稳定指数环、AI 分析、头条新闻、预测市场、7 日事件时间线、活跃信号 chip、基础设施暴露和股市数据。

**展示方式**：点击日本、乌克兰或伊朗等国家，打开完整档案页。

### 4. 19 种语言支持

UI 完整支持 19 种语言，包括日语。地区新闻 feeds 会自动适配 - 日本用户会看到 NHK World、Nikkei Asia 以及日本相关来源。语言包按需懒加载，性能友好。

**展示方式**：在设置里切换到日语，观察新闻源变化。

### 5. 实时军事追踪

实时 ADS-B 军机追踪与 AIS 海军舰艇监测。Strategic Posture 面板会显示 9 个全球区域的战区风险（波罗的海、黑海、南海、东地中海等）。

**展示方式**：启用 Military 图层，展示 Strategic Posture 面板。

### 6. 三种变体仪表盘

一套代码，三种专门视图 - 通过顶部栏一键在 World（地缘政治）、Tech（初创/AI）和 Finance（市场/交易所）之间切换。

**展示方式**：点击变体切换器（🌍 WORLD | 💻 TECH | 📈 FINANCE）。

### 7. 市场与加密情报

7 信号宏观雷达、综合 BUY/CASH 结论、BTC 现货 ETF 流量追踪、稳定币锚定监测、Fear & Greed Index 和比特币技术指标。用 sparkline 和圆环图展示趋势。

**展示方式**：滚动到 crypto/market 面板，指出 sparkline。

### 8. 直播与摄像头

8 路新闻直播（Bloomberg、Al Jazeera、Sky News 等）+ 19 个来自地缘热点的直播摄像头，覆盖 4 个区域。支持空闲自动暂停，5 分钟无操作后自动停止。

**展示方式**：打开视频面板或摄像头面板。

### 9. 免费桌面应用

通过 Tauri 提供 macOS、Windows、Linux 原生应用。API key 存在系统 keychain 中（不是明文）。本地 Node.js sidecar 可离线运行全部 60+ API handlers。还能运行本地 LLM，进行完全私有的离线 AI 摘要。

**展示方式**：网站上的下载按钮，或原生运行的桌面应用。

### 10. 故事分享与社交导出

为任意国家生成情报 brief，并分享到 Twitter/X、LinkedIn、WhatsApp、Telegram、Reddit。支持 canvas 渲染的 PNG 图片和二维码，链接回实时仪表盘。

**展示方式**：为某个国家生成故事，打开分享面板。

### 11. 本地 LLM 支持（Ollama / LM Studio）

把 AI 摘要完全跑在自己的硬件上 - 无需 API key、无需云端、无需把数据发出去。桌面应用会自动发现 Ollama 或 LM Studio 的模型，并通过 local → Groq → OpenRouter 的三层 fallback。

**展示方式**：打开 Settings → LLMs，选择自动发现的本地模型，再生成摘要。

## 视觉内容建议

### 值得截图的画面

1. 全仪表盘总览
2. 国家简报页
3. 图层开关演示
4. 金融版视图
5. 日语界面
6. 摄像头网格
7. Strategic Posture 面板
8. Settings 的 LLMs 选项卡

### 视频 / GIF 点子

1. 30 秒导览
2. 语言切换
3. 图层叠加
4. 变体切换

## 发布文案要点

### 面向大众

- “一个人人都能用的开源 Bloomberg Terminal - 免费、免登录”
- “170+ 新闻源、军事追踪、AI 分析 - 全都在一个仪表盘里”
- “可以用 Ollama 在本地运行 AI 摘要 - 数据不会离开你的机器”
- “支持日语，内置 NHK 和 Nikkei feeds”
- “macOS/Windows/Linux 原生桌面应用，完全免费”

### 面向技术受众

- “TypeScript、Vite、deck.gl、MapLibre GL、Tauri 构建”
- “40+ WebGL 数据层，60fps 运行”
- “ONNX Runtime Web 支持浏览器端 ML 推理”
- “本地 LLM 支持 - Ollama / LM Studio 零云依赖”
- “AGPL-3.0 开源 - 可在 GitHub 贡献”

### 面向金融 / OSINT 受众

- “7 信号加密宏观雷达，带 BUY/CASH 综合结论”
- “92 个全球证券交易所可视化”
- “Country Instability Index 实时跟踪 22 个国家”
- “预测市场集成，支持地缘政治预测”
- “空气隔离式 AI 分析 - 敏感情报工作可本地运行 Ollama”

### 面向日本受众

- 完整日语支持
- 内置 NHK World、日经亚洲等新闻源
- 免费、开源、无需注册
- 支持 macOS/Windows/Linux 桌面应用

## 最近的重大功能

| 版本 | 功能 |
|------|------|
| v2.5.1 | 批量 FRED 抓取、并行 UCDP、部分缓存 TTL、bot middleware |
| v2.5.0 | 本地 LLM 支持、Settings 分拆为 LLMs + API Keys 选项卡、keychain 整合 |
| v2.4.1 | 超宽布局 |
| v2.4.0 | 19 个地缘热点的 live webcams |
| v2.3.9 | 全量 i18n：19 种语言（含日语、阿拉伯语、中文） |
| v2.3.8 | 金融版、92 个交易所、海湾 FDI |
| v2.3.7 | 明暗主题系统、UCDP/UNHCR/Climate 面板 |
| v2.3.6 | Tauri 桌面应用、系统 keychain、自动更新 |
| v2.3.0 | 国家情报简报、故事分享 |

## 品牌说明

- **名称**：World Monitor
- **标语**：Real-time global intelligence dashboard
- **许可证**：AGPL-3.0
- **署名**：World Monitor by Elie Habib，或链接 GitHub 仓库
- **变体**：可提及 World/Tech/Finance 三个版本，也可只聚焦主版本
- **无需登录**：网页端可立即使用，无需注册或付费墙

## 致谢

非常感谢社区成员帮助 World Monitor 扩大影响力。欢迎你自由发挥这些指南，没有固定模板。最有说服力的内容通常来自于你自己觉得最有意思、最有用的部分。

如果你有问题或需要特定截图/素材，可以在 GitHub repo 里开 Discussion，或者直接联系。

