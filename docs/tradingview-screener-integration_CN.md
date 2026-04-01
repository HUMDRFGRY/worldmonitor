---
title: "TradingView Screener 集成指南"
description: "扩展 WorldMonitor 金融中心以接入 TradingView Screener 数据的参考文档。"
---

# TradingView Screener 集成指南

**用途：** 用于扩展 WorldMonitor 金融中心以接入 TradingView Screener 数据的参考文档。

## 目录

1. 概览
2. 库
3. 可用数据
4. 架构契合方式（推荐）
5. 集成模式
6. 面板扩展
7. 字段参考
8. 查询手册
9. 限流与生产注意事项
10. 实施清单

## 概览

TradingView 提供一个未正式文档化但稳定的 `/screener` API，地址为 `https://scanner.tradingview.com/{market}/scan`。有两个开源库对它做了封装：

| 库 | 语言 | 仓库 |
|----|------|------|
| `tradingview-screener` | Python | `../TradingView-Screener/` |
| `tradingview-screener-ts` | TypeScript | https://github.com/Anny26022/TradingView-Screener-ts |

它们提供：

- 股票、加密货币、外汇、期货、债券等 3000+ 字段
- 类 SQL 的 `Query` builder，支持 filter / sort / paginate
- 87 个市场/交易所
- 每个字段支持多时间周期变体
- 公共延迟数据不需要 API key

对 WorldMonitor 来说，真正相关的是 TypeScript 版本。它与 Python 版本功能完全对齐（41/41 operations pass），并且支持自托管 REST server。

## 库

### TypeScript：`tradingview-screener-ts`

```bash
npm install tradingview-screener-ts
```

```typescript
import { Query, col, And, Or } from 'tradingview-screener-ts'

const [total, rows] = await new Query()
  .set_markets('crypto')
  .select('name', 'close', 'volume', 'market_cap_basic', 'change')
  .order_by('market_cap_basic', false)
  .limit(50)
  .get_scanner_data()
// rows: [{ ticker: 'BINANCE:BTCUSDT', name: 'Bitcoin', close: 62000, ... }]
```

**关键类型：**

```typescript
interface ScreenerRowDict { s: string; d: unknown[] }
interface ScreenerDict    { totalCount: number; data: ScreenerRowDict[] | null }
```

**时间周期变体：** 在任意字段名后追加 `|{tf}`。

```typescript
'close'       // daily
'close|1'     // 1-minute
'close|5'     // 5-minute
'close|60'    // 1-hour
'close|240'    // 4-hour
'close|1W'    // weekly
'close|1M'    // monthly
```

## 可用数据

### 按资产类别

| Market Key | 字段数 | 带时间周期 | 备注 |
|------------|--------|-----------|------|
| `america` | 1,003 | 3,514 | 美股 |
| `crypto` | 525 | 3,094 | BTC/ETH 等 |
| `forex` | 439 | 2,950 | 外汇对 |
| `cfd` | 439 | 2,950 | 差价合约 |
| `futures` | 394 | 394 | 商品、指数期货 |
| `bonds` | 153 | 180 | 政府/企业债 |
| `coin` | 518 | 3,029 | 现货加密货币 |

### 可用数据分类

| 类别 | 示例字段 |
|------|---------|
| Price / OHLCV | `close`、`open`、`high`、`low`、`volume` |
| Change | `change`、`change_abs`、`change_from_open`、`gap` |
| Market cap | `market_cap_basic` |
| 技术指标 | `RSI`、`MACD.macd`、`MACD.signal`、`MACD.hist`、`BB.upper`、`BB.lower`、`BB.mid` |
| 均线 | `EMA5`、`EMA20`、`EMA50`、`EMA100`、`EMA200`、`SMA20`、`SMA50`、`SMA200` |
| 成交量分析 | `relative_volume_10d_calc`、`Value.Traded`、`average_volume_10d_calc` |
| 基本面 | `price_earnings_ttm`、`earnings_per_share_basic_ttm`、`dividend_yield_recent`、`book_value_per_share` |
| 52 周 | `price_52_week_high`、`price_52_week_low`、`High.All`、`Low.All` |
| VWAP | `VWAP` |
| 分类信息 | `type`、`typespecs`、`sector`、`industry`、`country`、`exchange`、`currency` |
| 状态 | `active_symbol`、`is_primary`、`update_mode` |
| 指数归属 | `index` |
| 分析师评级 | `Recommend.All`、`Recommend.MA`、`Recommend.Other` |
| Beta/风险 | `beta_1_year` |
| 盘前/盘后 | `premarket_change`、`premarket_volume`、`postmarket_change` |
| 财报 | `earnings_release_next_trading_date_fq`、`earnings_per_share_forecast_next_fq` |
| Crypto 特有 | `24h_vol_change`、`circulating_supply`、`total_supply`、`24h_close_change` |

## 架构契合方式（推荐）

WorldMonitor 的数据流是：`Railway seeds Redis → Vercel reads Redis → Frontend RPC`

TradingView Screener 调用应放在 **Railway AIS relay**（`scripts/ais-relay.cjs`）里，与现有 CoinGecko/Yahoo/Finnhub 调用并列。

```text
Railway ais-relay.cjs
  └── seedTvStockScreener()     → market:tv-screener:stocks:v1    (TTL 5m)
  └── seedTvCryptoScreener()    → market:tv-screener:crypto:v1    (TTL 5m)
  └── seedTvForexScreener()     → market:tv-screener:forex:v1     (TTL 5m)
  └── seedTvTechnicals()        → market:tv-technicals:v1         (TTL 5m)
  └── seedTvEarningsCalendar()  → market:tv-earnings:v1           (TTL 1h)
  └── seedTvSectorSummary()     → market:tv-sectors:v1            (TTL 5m)

Vercel RPC handlers（只读 Redis）：
  └── list-tv-stock-screener.ts
  └── list-tv-crypto-screener.ts
  └── list-tv-forex-screener.ts
  └── get-tv-technicals.ts
  └── list-tv-earnings.ts
  └── list-tv-sectors.ts

Frontend → circuit breaker → RPC → Redis
```

**不要在 Vercel edge 直接调用 TradingView。** 所有上游请求都应放在 Railway 侧。

TypeScript 库 `tradingview-screener-ts` 运行在 Railway relay 的 Node.js 进程中。

## 集成模式

### 种子脚本模式

### Relay 集成模式

## 实施清单

- 在 Railway relay 中引入 `tradingview-screener-ts`
- 新增 stock/crypto/forex/technical/earnings/sector 种子任务
- 为每个 payload 设置合适 TTL
- 在 Vercel 侧只保留 Redis 读取
- 为前端面板添加 circuit breaker
- 记录限流与 provider fallback 行为

