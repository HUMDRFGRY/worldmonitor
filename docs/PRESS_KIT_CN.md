# World Monitor：媒体资料包与 FAQ

## World Monitor 是什么？

World Monitor 是一个实时全球情报仪表盘，把新闻、市场、军事活动、基础设施数据和 AI 分析整合到一个交互式地图界面中。可以把它理解成一个过去只有政府机构和大型企业才能使用的态势感知工具，如今通过网页或桌面应用就能让记者、分析师、研究人员和普通公众使用。

平台监测 200+ 国家，汇聚 435+ 新闻 feeds、30+ 路直播、卫星追踪、军机与海军舰艇数据、预测市场和几十个专门数据层。所有内容会显示在写实 3D 地球仪或平面 WebGL 地图上，并由 AI 摘要把成千上万条头条压缩成可执行的情报简报。

## 它是如何工作的？

### 核心体验

用户打开 World Monitor 后，首先会看到一个加载了实时数据点的地球仪（或平面地图）。每个点都代表世界上此刻正在发生的事情：黑海上空的军机、土耳其地震、内罗毕抗议、东欧网络攻击源，或者冲突区附近 GPS 干扰激增。

用户可以开启/关闭 45+ 数据图层、放大到特定区域、点击任意事件查看详情，并阅读把多条数据源串联起来的 AI 生成摘要。命令面板（Cmd+K）支持按国家、图层和情报类别快速搜索。

### 五个专门仪表盘

World Monitor 由同一套代码运行五种主题变体，分别面向不同受众：

| 变体 | 域名 | 重点 |
|------|------|------|
| **World Monitor** | worldmonitor.app | 地缘政治、军事、冲突、基础设施 |
| **Tech Monitor** | tech.worldmonitor.app | AI/ML、初创公司、网络安全、技术生态 |
| **Finance Monitor** | finance.worldmonitor.app | 市场、央行、海湾 FDI、大宗商品 |
| **Commodity Monitor** | commodity.worldmonitor.app | 采矿、金属、能源、关键矿产 |
| **Happy Monitor** | happy.worldmonitor.app | 好消息、保护工作、积极全球趋势 |

### AI 情报层

World Monitor 使用多层 AI 管线处理和摘要信息：

1. **World Brief**：系统定期生成全球最重要事件的 AI 摘要，使用优先速度和成本效率的模型链。
2. **AI Deduction**：用户可以输入自由文本地缘政治问题并获得基于实时标题的分析。
3. **Headline Memory**：本地语义索引能记住最近标题，并跨时间关联事件。
4. **Threat Classification**：三阶段管线自动按严重度与类型分类新闻。
5. **Country Intelligence Briefs**：国家全页档案，结合不稳定指数、AI 分析、事件时间线与预测市场数据。

所有 AI 功能都可以完全在浏览器中运行，使用轻量 ML 模型，数据不会离开用户设备。云端 AI（Groq、OpenRouter）是可选项，仅在配置后使用。

## 数据来源

World Monitor 聚合了来自数十个来源的公开数据，不使用专有或机密信息。

### 新闻与媒体

- 435+ RSS feeds
- 30+ 路直播
- 22 个地缘热点摄像头
- 26 个 Telegram OSINT 频道

### 地缘政治与安全

- ACLED
- UCDP
- GDELT
- OREF
- LiveUAMap
- 政府旅行建议
- 13 个美国大使馆 feed

### 军事与战略

- ADS-B Exchange / OpenSky
- AIS
- CelesTrak
- 226 个军事基地
- 核设施和伽马辐照设施位置

### 基础设施与环境

- USGS 地震数据
- GDACS
- NASA EONET
- NASA FIRMS
- Cloudflare Radar
- 海底电缆登陆点与维修船追踪
- 111 个机场

### 市场与金融

- Yahoo Finance
- CoinGecko
- Polymarket
- FRED
- EIA
- BIS
- mempool.space

### 网络安全威胁

- abuse.ch
- AlienVault OTX
- AbuseIPDB
- C2IntelFeeds
- Ransomware.live

### 人道主义

- UN OCHA HAPI
- WorldPop
- CDC、ECDC、WHO
- Open-Meteo ERA5 气候异常

## 关键数字

| 指标 | 数值 |
|------|------|
| 监测新闻 feeds | 435+ |
| 直播视频流 | 30+ |
| 地图图层 | 45+ |
| 监测国家 | 200+ |
| 支持语言 | 21（含 RTL） |
| 军事基地 | 210+ |
| AI 数据中心 | 111 |
| 证券交易所 | 92 |
| 战略港口 | 83 |
| 海底电缆 | 55+ |
| 管道 | 88 |
| 情报卫星 | 80-120 |
| Telegram OSINT 频道 | 26 |
| 机场 | 107 |
| 预测市场事件 | 100+ |

## 适用人群

World Monitor 面向多个群体：

- **记者与编辑部**
- **安全与风险分析师**
- **研究人员与学者**
- **金融从业者**
- **政策分析师**
- **普通公众**

## 与现有工具的区别

| 功能 | World Monitor | 传统 OSINT 工具 | 新闻聚合器 |
|------|--------------|------------------|------------|
| 实时地图可视化 | 是 | 常常静态或延迟 | 没有 |
| AI 摘要 | 是 | 很少 | 基础或没有 |
| 军事追踪 | ADS-B + AIS + 卫星 | 仅专用工具 | 没有 |
| 预测市场 | 集成 | 没有 | 没有 |
| 多主题变体 | 5 个仪表盘 | 通常单一聚焦 | 没有 |
| 浏览器端 ML | 是 | 依赖服务器 | 没有 |
| 桌面应用 | 是 | 视情况而定 | 很少 |
| 成本 | 提供免费层 | 每年 1 万到 10 万+ 美元 | 免费但有限 |
| 开源 | AGPL-3.0 | 几乎没有 | 很少 |

## 评分与检测系统

### Country Instability Index（CII）

每个国家都会得到 0 到 100 的实时不稳定指数，由四个加权组件计算：

- 基线风险 40%
- 社会动荡 20%
- 安全事件 20%
- 信息速度 20%

分级：Low、Normal、Elevated、High、Critical。

### Hotspot Detection

系统会把新闻聚类、地理收敛、CII 分数和军事信号接近度结合起来识别新兴危机。当多个指标在某地区同时上升时，会把它提升为 “hotspot”。

### Cross-Stream Correlation

系统会监测 14 种信号在异常模式下的组合，例如 GPS 干扰与军机活动同时上升，或者预测市场价格与某地区突发新闻同步变化。

## 隐私与安全

- 免费层不需要账号
- 所有 AI 都可以在浏览器本地运行
- API keys 只在服务端
- 开源可审计
- API 层有限流与 bot protection
- 桌面应用会把 key 存在 OS keychain

## 可用性

- Web：worldmonitor.app 及变体子域
- Desktop：macOS / Windows / Linux
- PWA：可安装
- Mobile：响应式布局
- Languages：21 种

## 接下来要做什么：路线图亮点

### Pro Tier（计划中）

- 认证用户
- 定时 AI briefing
- 高级股票研究
- 自定义告警规则
- API 访问

### Enterprise（计划中）

- 团队工作区
- 更细的权限与共享视图

