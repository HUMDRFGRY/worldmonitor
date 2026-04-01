---
title: "用户请求汇总"
description: "从 GitHub Issues 与 Discussions 中整理出的用户需求。"
---

# 用户请求汇总

> 来源：55+ 个 open issues、40+ 个 discussions、391 条评论（主线程 Discussion #94）
> 编译日期：2026-03-06

## 1. 市场与金融（10+ 条）

| 请求 | 用户 / Issue |
|------|--------------|
| 自定义市场面板 - 选择交易所（印度 NSE/BSE、SENSEX）和单只股票 | @Bharadwajak、@Versifer003、@job3904、@riskRover、#1102 |
| 加密面板 - 默认 Top 10，并可添加自定义币种（XRP 等） | @tagusbeer、@avanirvana、#979 |
| 财报面板 - 即将公布/最近公布的季度财报 + AI 摘要 | #1010 |
| 全球宏观数据 - GDP、通胀、利率、就业 | #972 |
| 趋势线 - 被追踪指标的历史图表 | #252 |
| 关键材料与商品 - 稀土、贵金属、供需 | @jyr-ai、@SebastienMelki、Discussion #95 |
| 外汇预测功能 | @avneesh039 |
| P&L / 组合跟踪器 | @samuelebarbieri2006 |
| 地图上按国家显示经济指标 - 不稳定指数、股指、劳动力 | @straycomet |
| 商品交易功能 - 船只位置、航线数据、类似 Vortexa | @gordonbobgold-cpu |

## 2. 新闻源与区域覆盖（15+ 条）

### 减少西方偏见

| 区域 | 需求来源 | 用户 |
|------|----------|------|
| 印度 | The Hindu、NDTV、Hindustan Times、LiveMint、WION、PTI | @PartyTime111004、@sdf11-ops、Discussion #630 |
| 伊朗/波斯语 | BBC Persian、Iran International、Fars News、Telegram feeds | @aydakikio |
| 中国 | MIIT、MOFCOM 官方公告 | @jyr-ai |
| 土耳其 | TRT World（RSS + Live TV） | @nurdadak |
| 拉美 | 墨西哥毒品暴力、Azteca Noticias | @antel1904、#821 |
| 非洲 | 刚果，以及更广泛的代表性 | @sajou1、Discussion #796 |
| 阿曼 | Times of Oman、本地来源 | Discussion #643 |
| 大洋洲 | 北太平洋（帕劳）军事集结 | @jngori |
| 阿拉伯地区 | Al Jazeera Arabic + 其他阿语频道 | @Mhd-H00 |
| 越南 | VietnamToday HLS stream | @htch9999 |
| 法国 | France24 法语流 | @drpedro77 |
| 希腊 | 本地数据源 | @meetjames24、Discussion #248 |

### Feed 功能

| 请求 | 用户 / Issue |
|------|--------------|
| 可配置新闻 feeds - 像 TV 频道一样增删 | #649 |
| 新闻源偏见评分 | @elilat |
| 冲突报道可信度评分 | @DRLinda1 |
| 跨分类新闻去重 | @curiositypilot |
| 按用户语言翻译内容 | #644 |
| 对付费文章做 AI 摘要 | @Noah974Finance |

## 3. 地图与地球仪（8+ 条）

| 请求 | 用户 / Issue |
|------|--------------|
| 3D 地球仪，类似 Google Earth / Palantir Gotham | #730、#129、@LeadGenUSA |
| 地图可移动/可缩放成 tile | @ueco-jb |
| 白天/夜晚覆盖层 | Discussion #447 |
| 海底电缆地图（更详细 + 不走陆地） | #790、@hartmanphil、Discussion #1048 |
| 海水淡化厂基础设施图层 | @SharmaPrateek、#1029 |
| GPS 干扰 + ACAS 告警图层（Wingbits） | #126 |
| 导弹与无人机防御追踪 | #645 |
| 五角大楼披萨追踪 / INMARSAT / NAVTEX | @bkerler、#250 |
| 各国互联网 ping 速度地图 | @amindorf |
| 美国/盟友攻击图层（不只是伊朗） | @TiredOldGamer |
| 地缘政治阵营覆盖层（NATO、AUKUS、Quad 等） | @passionfruit18 |
| 更高保真度的抗议图层 + GDELT 来源链接 | #131、@Stingraeyy |

### 有争议边界（政治敏感）

- 台湾/中国标注（#1002） - 评论区争议很大
- 印度/克什米尔（#990，@mayankkhannaaa、@freespaceglitche、@Rajat15）
- 索马里兰（@aasheikh）、越南国旗（@giangdk）
- 建议方案：用户可切换边界视图（像 Google Maps 的 IP-based 做法）

## 4. 交通追踪 - ADS-B / AIS / Maritime（7+ 条）

| 请求 | 用户 |
|------|------|
| ADS-B 航班追踪，支持搜索 + 实时地图 | @omronoro、@itsklutch、@Honazhu |
| 军机覆盖层 | @VonBiz |
| 船舶追踪 API + 航线可视化 | @VonBiz、@gordonbobgold-cpu |
| 扩展舰船弹窗 - 显示全部信息（不要 `+118 more`） | @digitAI-4N6、#1094 |
| 航班时刻表与船舶数据一起显示 | @joelien102 |
| 以 FR24 作为替代 ADS-B 来源（用户 API keys） | @Honazhu |
| 实时全球航运 + 航空流量，带路线可视化、过滤器、告警 | @DHEDHiAly |

## 5. Telegram 与社交媒体作为 OSINT 来源（6+ 条）

| 请求 | 用户 |
|------|------|
| 将 Telegram 作为一等 OSINT 图层 - 提供了大量频道清单 | @StokedDude |
| Twitter/X 新闻集成 | @papelonconl1mon |
| 实时社交媒体 feed | @DRLinda1 |
| 特定 Telegram 频道（warfront witness 等） | @AnnasMazhar、@Fineman1168222 |
| Discord/Slack/Telegram bot 集成 | @soupsoup |

## 6. 告警与通知（5+ 条）

| 请求 | 用户 / Issue |
|------|--------------|
| 推送到手机 | #304 |
| 邮件摘要 - 可配置频率（小时/日/周） | @ymehili（PR #713） |
| 告警引擎 - push + webhooks + Telegram bot | @abhijithwrrr、#763 |
| 区域新告警时地图闪烁/弹出 | @RahulVashista |
| 关闭通知弹窗的设置 | @RahulVashista |
| 更好的新内容指示器 | @papelonconl1mon |

> 负责人备注：通知/告警计划放在付费版

## 7. UI/UX 与布局（8+ 条）

| 请求 | 用户 / Issue |
|------|--------------|
| 动态可调整布局 - 自由移动/缩放面板 | #904、@whitetrt |
| 用 “+” 按钮增删面板，而不是拖拽 | #882 |
| 设置里的 Save/Set 按钮（无视觉确认） | #1041 |
| Reset 按钮恢复默认布局 | @Apex-Fund-Manager |
| 每张卡片全屏，适合电视播出；每卡片 iframe/RSS | @manish-0521 |
| 多显示器支持 - 不同 tile 到不同屏幕 | @AIEPS |
| 屏幕响应性 - 手机/平板 | #906 |
| Palantir Gotham 风格 UI 打磨 | Discussion #718、#566 |
| 地图图例与过滤器置顶 | #829 |
| Cmd+K 命令列表 | Discussion #719 |
| 触屏笔电错误地进入 mobile UI | @Niboshi-Wasabi |

## 8. 平台与部署（10+ 条）

| 请求 | 用户 / Issue |
|------|--------------|
| Docker 容器 | #122、#265 |
| Android app / Fire TV | Discussion #133 |
| iOS mobile app | @artespraticas |
| Windows 32 位 | #774 |
| Linux AppImage 在 Mint 上损坏 | @xkaosxx |
| macOS app 依赖 web 版但不更新 | Discussion #588 |
| 通过 .env 配置 HTTP 端口 | Discussion #99、#933 |
| 自托管时跨升级保留配置 | @vgtmxrz、Discussion #207 |
| API mode - 无头情报管线 | Discussion #778 |
| iframe/embed 支持（5+ 条） | @netstairs、@AlexanderRemizovMLE、Discussion #659 |
| API key 备份/跨设备导出 | Discussion #684 |
| 更好的桌面上手体验 - license key 混淆、API 文档 | @TheShaman、Discussion #264、#869 |
| 每个面板需要哪些 API keys 的文档 | @stc788、@saushank3poch |
| 用户指南 / manual | @manav-yb、@papelonconl1mon |
| 教程视频 | Discussion #665 |

## 9. AI 与情报（5+ 条）

| 请求 | 用户 / Issue |
|------|--------------|
| Local Ollama 作为 AI fallback tier | Discussion #120、#222 |
| 供应链武器化追踪 | #837 |
| 完整供应链可视化 - 谁向谁供货 | @jayarjo |
| 空间天气监测（NOAA SWPC） | #141、@xkaosxx |
| 预测功能 - 预测下一个潜在打击目标 | @Ttian12 |
| 主权层矩阵 + 部署跟踪 | @bparlan |
| 犯罪定位器 | @elilat |
| Ransomware.live RSS 作为 cyber threat intel | @DefenceIntelligence |
| 来自 electricitymaps.com 的能源数据 | @xfsala |
| 灾害地点数据（地震等） | @ragabuyung99 |

## 10. 性能（5+ 条）

| Issue | 用户 |
|------|------|
| 世界地图很卡 - 多用户、硬件尚可 | Discussion #558、#871、@bukowa、@itsklutch |
| 地图与 YouTube 同时加载时卡顿 | #287 |
| 桌面端 sidecar 502/503 错误 | #976 |
| 面板 5 分钟后变空闲 | Discussion #909 |
| Mac Intel 渲染失败 | #864 |
| Android Chrome 1 分钟后自动关闭国家视图 | @nothingtosurprise |

## 11. 本地化与语言

| 请求 | 用户 |
|------|------|
| 越南语 | @thang76、Discussion #176 |
| 韩语（已贡献） | Discussion #493 |
| 全阿拉伯语本地化 | @abdulzizs1981-alt |
| 中文 - 切换后地图/新闻仍是英文 | @caiwe0 |
| 土耳其语 - 语言切换后数据仍是英文 | @fatihykt |

## 12. 安全与信任

| Issue | 用户 |
|------|------|
| 桌面 app 被杀毒软件标记 | @pronetworksecure |
| 对输入 Gmail 凭据的担忧 | @hub-newb |

## 按需求排序的重点

| # | 主题 | 请求数 | 影响 |
|---|------|-------|------|
| 1 | 区域新闻源 - 减少西方偏见 | 15+ | 全球受众 |
| 2 | 自定义市场/金融面板 | 10+ | 金融用户 |

