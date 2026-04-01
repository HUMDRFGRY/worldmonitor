# World Monitor

**实时全球情报仪表盘** - 由 AI 驱动的新闻聚合、地缘政治监控和基础设施跟踪，汇聚在一个统一的态势感知界面中。

<p align="center">
  <a href="./README.md"><strong>English</strong></a> &nbsp;·&nbsp;
  <a href="./README_CN.md"><strong>中文</strong></a>
</p>

[![GitHub stars](https://img.shields.io/github/stars/koala73/worldmonitor?style=social)](https://github.com/koala73/worldmonitor/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/koala73/worldmonitor?style=social)](https://github.com/koala73/worldmonitor/network/members)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=flat&logo=discord&logoColor=white)](https://discord.gg/re63kWKxaz)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Last commit](https://img.shields.io/github/last-commit/koala73/worldmonitor)](https://github.com/koala73/worldmonitor/commits/main)
[![Latest release](https://img.shields.io/github/v/release/koala73/worldmonitor?style=flat)](https://github.com/koala73/worldmonitor/releases/latest)

<p align="center">
  <a href="https://worldmonitor.app"><img src="https://img.shields.io/badge/Web_App-worldmonitor.app-blue?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Web App"></a>&nbsp;
  <a href="https://tech.worldmonitor.app"><img src="https://img.shields.io/badge/Tech_Variant-tech.worldmonitor.app-0891b2?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Tech Variant"></a>&nbsp;
  <a href="https://finance.worldmonitor.app"><img src="https://img.shields.io/badge/Finance_Variant-finance.worldmonitor.app-059669?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Finance Variant"></a>&nbsp;
  <a href="https://commodity.worldmonitor.app"><img src="https://img.shields.io/badge/Commodity_Variant-commodity.worldmonitor.app-b45309?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Commodity Variant"></a>&nbsp;
  <a href="https://happy.worldmonitor.app"><img src="https://img.shields.io/badge/Happy_Variant-happy.worldmonitor.app-f59e0b?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Happy Variant"></a>
</p>

<p align="center">
  <a href="https://worldmonitor.app/api/download?platform=windows-exe"><img src="https://img.shields.io/badge/Download-Windows_(.exe)-0078D4?style=for-the-badge&logo=windows&logoColor=white" alt="Download Windows"></a>&nbsp;
  <a href="https://worldmonitor.app/api/download?platform=macos-arm64"><img src="https://img.shields.io/badge/Download-macOS_Apple_Silicon-000000?style=for-the-badge&logo=apple&logoColor=white" alt="Download macOS ARM"></a>&nbsp;
  <a href="https://worldmonitor.app/api/download?platform=macos-x64"><img src="https://img.shields.io/badge/Download-macOS_Intel-555555?style=for-the-badge&logo=apple&logoColor=white" alt="Download macOS Intel"></a>&nbsp;
  <a href="https://worldmonitor.app/api/download?platform=linux-appimage"><img src="https://img.shields.io/badge/Download-Linux_(.AppImage)-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Download Linux"></a>
</p>

<p align="center">
  <a href="./docs/documentation.mdx"><strong>文档</strong></a> &nbsp;·&nbsp;
  <a href="https://github.com/koala73/worldmonitor/releases/latest"><strong>发布页</strong></a> &nbsp;·&nbsp;
  <a href="./CONTRIBUTING_CN.md"><strong>贡献指南</strong></a>
</p>

![World Monitor Dashboard](docs/images/worldmonitor-7-mar-2026.jpg)

---

## 它能做什么

- **435+ 个精选新闻源**，覆盖 15 个类别，并由 AI 合成为简报
- **双地图引擎** - 3D 地球仪（globe.gl）和 WebGL 平面地图（deck.gl），带有 45 个数据图层
- **跨流关联** - 军事、经济、灾害和升级信号的汇聚
- **国家情报指数** - 跨 12 个信号类别的综合风险评分
- **金融雷达** - 92 个证券交易所、大宗商品、加密货币，以及 7 信号市场综合指标
- **本地 AI** - 使用 Ollama 运行一切，无需 API 密钥
- **5 个站点变体**，来自同一个代码库（world、tech、finance、commodity、happy）
- **原生桌面应用**（Tauri 2），适用于 macOS、Windows 和 Linux
- **21 种语言**，包含母语新闻源和从右到左书写支持

如需查看完整功能列表、架构、数据源和算法，请参阅 **[文档](./docs/documentation.mdx)**。

---

## 快速开始

```bash
git clone https://github.com/koala73/worldmonitor.git
cd worldmonitor
npm install
npm run dev
```

打开 [localhost:5173](http://localhost:5173)。基础使用无需配置环境变量。

如需按变体进行开发：

```bash
npm run dev:tech       # tech.worldmonitor.app
npm run dev:finance    # finance.worldmonitor.app
npm run dev:commodity  # commodity.worldmonitor.app
npm run dev:happy      # happy.worldmonitor.app
```

有关部署选项（Vercel、Docker、静态），请参阅 **[自托管指南](./docs/getting-started.mdx)**。

---

## 技术栈

| 类别 | 技术 |
|---|---|
| **前端** | Vanilla TypeScript、Vite、globe.gl + Three.js、deck.gl + MapLibre GL |
| **桌面端** | Tauri 2（Rust）+ Node.js sidecar |
| **AI/ML** | Ollama / Groq / OpenRouter、Transformers.js（浏览器端） |
| **API 合约** | Protocol Buffers（92 个 proto、22 个服务）、sebuf HTTP 注解 |
| **部署** | Vercel Edge Functions（60+）、Railway relay、Tauri、PWA |
| **缓存** | Redis（Upstash）、三层缓存、CDN、service worker |

完整技术细节请见 **[架构文档](./docs/architecture.mdx)**。

---

## 航班数据

航班数据由 [Wingbits](https://wingbits.com?utm_source=worldmonitor&utm_medium=referral&utm_campaign=worldmonitor) 提供支持，这是最先进的 ADS-B 航班数据解决方案。

---

## 数据源

WorldMonitor 汇聚了 30+ 个外部数据源，覆盖地缘政治、金融、能源、气候、航空和网络安全。有关提供方、订阅层级和采集方式的完整信息，请参阅 [数据源目录](./docs/data-sources.mdx)。

---

## 贡献

欢迎贡献！请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md) 获取指南。

```bash
npm run typecheck        # 类型检查
npm run build:full       # 生产构建
```

---

## 许可证

**AGPL-3.0** 适用于非商业用途。任何商业用途都需要 **商业许可证**。

| 使用场景 | 是否允许 |
|---|---|
| 个人 / 研究 / 教育 | 允许 |
| 自托管（非商业） | 允许，需注明来源 |
| Fork 并修改（非商业） | 允许，需按照 AGPL-3.0 共享源代码 |
| 商业用途 / SaaS / 品牌重塑 | 需要商业许可证 |

完整条款请参见 [LICENSE](LICENSE)。如需商业授权，请联系维护者。

Copyright (C) 2024-2026 Elie Habib. 保留所有权利。

---

## 作者

**Elie Habib** - [GitHub](https://github.com/koala73)

## 贡献者

<a href="https://github.com/koala73/worldmonitor/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=koala73/worldmonitor" />
</a>

## 安全致谢

感谢以下研究人员负责任地披露安全问题：

- **Cody Richard** - 披露了三项安全发现，分别涉及 IPC 命令暴露、renderer 到 sidecar 的信任边界分析，以及 fetch patch 凭证注入架构（2026）

有关负责任披露的指南，请参阅我们的 [安全政策](./SECURITY.md)。

---

<p align="center">
  <a href="https://worldmonitor.app">worldmonitor.app</a> &nbsp;·&nbsp;
  <a href="./docs/documentation.mdx">documentation</a> &nbsp;·&nbsp;
  <a href="https://finance.worldmonitor.app">finance.worldmonitor.app</a> &nbsp;·&nbsp;
  <a href="https://commodity.worldmonitor.app">commodity.worldmonitor.app</a>
</p>

## Star 历史

<a href="https://api.star-history.com/svg?repos=koala73/worldmonitor&type=Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=koala73/worldmonitor&type=Date&type=Date&theme=dark" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=koala73/worldmonitor&type=Date&type=Date" />
 </picture>
</a>
