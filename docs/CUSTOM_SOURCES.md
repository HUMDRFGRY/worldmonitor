# 自定义消息源指南

本文档说明如何在 World Monitor 中新增、配置和管理自定义消息源。

---

## 目录

- [概述](#概述)
- [快速开始](#快速开始)
- [配置字段说明](#配置字段说明)
- [示例：新增 RSS/Atom 源](#示例新增-rssatom-源)
- [示例：新增 REST API 源](#示例新增-rest-api-源)
- [示例：新增网页抓取源](#示例新增网页抓取源)
- [停用一个源](#停用一个源)
- [多语言 URL 映射](#多语言-url-映射)
- [运行时校验与错误处理](#运行时校验与错误处理)
- [与现有源的关系](#与现有源的关系)
- [常见问题](#常见问题)

---

## 概述

World Monitor 内置了数百个新闻源（定义在 `src/config/feeds.ts`）。  
若需要新增自己的数据源，只需编辑 **`src/config/custom-sources.ts`** 中的 `CUSTOM_SOURCES` 数组，
无需修改其他任何文件。

自定义源支持三种类型：

| 类型 | 说明 |
|------|------|
| `rss` | RSS 2.0 / Atom 订阅源（最常见） |
| `api` | REST API 接口（返回 JSON 的内部/外部 API） |
| `scrape` | 网页抓取（通过代理获取 HTML，再由客户端解析） |

---

## 快速开始

1. 打开 `src/config/custom-sources.ts`
2. 在 `CUSTOM_SOURCES` 数组中追加新条目（参见下方示例）
3. 保存文件，重新启动开发服务器（`npm run dev`）

```typescript
// src/config/custom-sources.ts — CUSTOM_SOURCES 数组
export const CUSTOM_SOURCES: CustomSourceConfig[] = [
  {
    id: 'my-rss-source',          // 唯一标识符（英文字母/数字/连字符）
    name: '我的 RSS 源',           // 显示名称
    sourceType: 'rss',            // 类型：rss | api | scrape
    url: '/api/rss-proxy?url=' + encodeURIComponent('https://example.com/rss'),
    topic: 'politics',            // 归入哪个话题分组
    enabled: true,                // true = 启用（默认）
  },
];
```

---

## 配置字段说明

### 必填字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 全局唯一标识符，只允许字母、数字、`-`、`_` |
| `name` | `string` | 源的显示名称 |
| `sourceType` | `'rss' \| 'api' \| 'scrape'` | 源类型 |
| `url` | `string \| Record<lang, url>` | 源地址；RSS/API 填字符串，多语言填对象 |

### 可选字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `topic` | `string` | `'custom'` | 所属话题分组（如 `'politics'`、`'tech'`）；需与 `FEEDS` 键名一致 |
| `region` | `string` | — | 地区标签（如 `'asia'`、`'europe'`） |
| `lang` | `string` | — | 内容语言（ISO 639-1，如 `'zh'`、`'en'`）；填写后仅在对应界面语言时抓取 |
| `priority` | `number` | `4` | 优先级（1 = 最高，4 = 普通博客/聚合） |
| `pollIntervalMs` | `number` | 300000 | 轮询间隔（毫秒），最小 1000 |
| `timeoutMs` | `number` | 10000 | 请求超时（毫秒），最小 500 |
| `rateLimit` | `number` | — | 每分钟最大请求次数 |
| `enabled` | `boolean` | `true` | 设为 `false` 可停用该源，不影响其他源 |
| `type` | `string` | — | 源分类（参考内置 `SOURCE_TYPES`，如 `'wire'`、`'mainstream'`、`'tech'`） |
| `propagandaRisk` | `'low' \| 'medium' \| 'high'` | — | 宣传风险评估 |
| `stateAffiliated` | `string` | — | 国家/机构归属（如 `'China'`、`'Russia'`） |

---

## 示例：新增 RSS/Atom 源

```typescript
{
  id: 'xinhua-english',
  name: '新华社（英文）',
  sourceType: 'rss',
  // 使用内置 RSS 代理避免 CORS 问题
  url: '/api/rss-proxy?url=' + encodeURIComponent('https://www.xinhuanet.com/english/rss/worldrss.xml'),
  topic: 'politics',      // 归入"政治"分组
  region: 'asia',
  lang: 'en',
  priority: 2,            // 主流媒体级别
  pollIntervalMs: 300_000, // 5 分钟抓取一次
  timeoutMs: 10_000,
  rateLimit: 10,
  enabled: true,
  type: 'wire',
}
```

---

## 示例：新增 REST API 源

> **说明**：API 源目前由客户端通过 `url` 发起请求，
> 若目标 API 需要认证，建议在 `api/` 目录下新建代理端点，再将代理 URL 填入 `url`。

```typescript
{
  id: 'internal-news-api',
  name: '内部新闻 API',
  sourceType: 'api',
  url: '/api/my-news-proxy',  // 指向你在 api/ 下创建的代理
  topic: 'tech',
  lang: 'zh',
  priority: 3,
  pollIntervalMs: 600_000,    // 10 分钟
  timeoutMs: 15_000,
  rateLimit: 5,
  enabled: true,
  type: 'tech',
}
```

---

## 示例：新增网页抓取源

网页抓取源通过 `/api/rss-proxy` 代理取回 HTML，
若目标站点提供 RSS 格式则直接解析；否则需要自行在代理层做解析。

```typescript
{
  id: 'custom-scrape',
  name: '自定义抓取站点',
  sourceType: 'scrape',
  url: '/api/rss-proxy?url=' + encodeURIComponent('https://example.com/news.rss'),
  topic: 'politics',
  lang: 'zh',
  priority: 4,
  pollIntervalMs: 900_000,    // 15 分钟
  timeoutMs: 20_000,
  enabled: true,
}
```

---

## 停用一个源

将 `enabled` 设为 `false` 即可停用，无需删除配置：

```typescript
{
  id: 'my-source',
  name: '暂时停用的源',
  sourceType: 'rss',
  url: 'https://example.com/rss',
  enabled: false,   // ← 停用
}
```

停用的源：

- 不进入任何抓取循环
- 不消耗网络资源
- 配置保留，随时可重新启用

---

## 多语言 URL 映射

若同一个源在不同语言下有不同的订阅地址，`url` 可填写对象：

```typescript
{
  id: 'france24-multi',
  name: 'France 24（多语言）',
  sourceType: 'rss',
  url: {
    en: '/api/rss-proxy?url=' + encodeURIComponent('https://www.france24.com/en/rss'),
    fr: '/api/rss-proxy?url=' + encodeURIComponent('https://www.france24.com/fr/rss'),
    zh: '/api/rss-proxy?url=' + encodeURIComponent('https://www.france24.com/zh/rss'),
  },
  topic: 'politics',
  enabled: true,
}
```

系统会根据当前界面语言自动选择对应的 URL。

---

## 运行时校验与错误处理

应用启动时会对 `CUSTOM_SOURCES` 中的每条配置自动校验。  
若某条配置不合法，控制台（浏览器 DevTools 或 Node 日志）将输出中文警告，
并跳过该条配置，**不影响其他合法源的加载**。

常见报错示例：

```
[自定义消息源] 配置无效，已跳过：
  • 缺少必填字段 "id"（源唯一标识符，字符串）
  • "sourceType" 值非法（"webhook"），可选值：rss | api | scrape
  原始配置：{"name":"测试","sourceType":"webhook","url":"..."}
```

你也可以在代码中手动调用校验函数：

```typescript
import { validateCustomSource } from '@/config/custom-sources';

const result = validateCustomSource(myConfig);
if (!result.valid) {
  console.error('配置有误：', result.errors);
}
```

---

## 与现有源的关系

- 自定义源与内置源**并行运行**，互不影响。
- 自定义源会合并进对应 `topic` 的 Feed 分组（如 `topic: 'politics'` 则加入政治组）。
- 若 `topic` 未指定，自定义源归入 `'custom'` 分组。
- `priority` 字段影响 `SOURCE_TIERS` 的查询回退顺序（内置优先级表不含自定义源名称时，默认 tier 4）。

---

## 常见问题

**Q：添加后看不到新源的内容？**  
A：检查 `enabled` 是否为 `true`，并确认 `url` 可访问（无 CORS 问题建议走 `/api/rss-proxy`）。

**Q：如何让新源只在特定变体（tech/finance/full）中出现？**  
A：目前自定义源在所有变体中均可见。若需区分变体，可在代码中读取 `SITE_VARIANT` 后有条件地加入数组。

**Q：`topic` 字段填写什么值？**  
A：参考 `src/config/feeds.ts` 中各变体的分组键名，例如：
- Full 变体：`politics`、`us`、`europe`、`middleeast`、`africa`、`latam`、`asia`、`energy`、`tech`、`ai`、`finance`、`gov`、`layoffs`、`thinktanks`、`crisis`
- Tech 变体：`tech`、`ai`、`startups`、`vcblogs`、`security`、`cloud`、`dev` 等
- Finance 变体：`markets`、`forex`、`bonds`、`crypto`、`centralbanks` 等

**Q：可以用自定义源替换内置源吗？**  
A：可以先将内置源的 `enabled` 字段设为 `false`（在 `feeds.ts` 中），再添加自定义源。
