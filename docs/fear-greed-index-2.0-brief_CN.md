# Fear & Greed Index 2.0 - 设计简报

## 目标

构建一个复合市场情绪指标（0–100），由 **10 个加权类别** 组合而成。不同于 CNN 的 Fear & Greed Index（大约 7 个输入，经常被批评为滞后且过度简化），这个版本使用更细颗粒度的 10 个类别、每类更多输入，以生成更接近机构级别的读数。

## 复合分数

```text
Final Score = Σ (Category_Score × Category_Weight)
```

每个类别的分数范围都是 **0–100**（0 = 极度恐惧，100 = 极度贪婪）。加权求和后得到复合指数。

### 10 个类别

| # | 类别 | 权重 | 含义 |
|---|------|------|------|
| 1 | **Sentiment** | 10% | CNN F&G、AAII 牛熊调查、crypto sentiment |
| 2 | **Volatility** | 10% | VIX 水平、VIX 期限结构 |
| 3 | **Positioning** | 15% | Put/Call 比率、期权偏斜（CBOE SKEW） |
| 4 | **Trend** | 10% | SPX 相对 20/50/200 日均线、价格动量 |
| 5 | **Breadth** | 10% | 高于 200 日均线的股票比例、AD ratio、等权分歧 |
| 6 | **Momentum** | 10% | 板块 RSI spread、变化率 |
| 7 | **Liquidity** | 15% | M2 增长、Fed 资产负债表、SOFR |
| 8 | **Credit** | 10% | HY spread、IG spread、信用 ETF 趋势 |
| 9 | **Macro** | 5% | Fed rate、收益率曲线、失业率 |
| 10 | **Cross-Asset** | 5% | 黄金/USD 相关性、债券 vs 股票 |

### 分数标签

| 区间 | 标签 |
|------|------|
| 0–20 | Extreme Fear |
| 20–40 | Fear |
| 40–60 | Neutral |
| 60–80 | Greed |
| 80–100 | Extreme Greed |

### Header Metrics（9 个关键统计）

| 指标 | 来源 | 上下文 |
|------|------|------|
| CNN F&G | CNN dataviz API | 0–100 分 + 标签 |
| AAII Bear % | AAII 调查 | 与历史均值对比 |
| AAII Bull % | AAII 调查 | 与历史均值对比 |
| Put/Call Ratio | CBOE CDN CSV | 与 1 年均值对比 |
| VIX | Yahoo / FRED | 百分比变化 |
| HY Spread | FRED | 与长期均值对比 |
| % > 200 DMA | Yahoo `^MMTH` | 与近期峰值对比 |
| 10Y Yield | FRED | 水平值 |
| Fed Rate | FRED | 当前区间 |

## 数据源

所有来源都可免费使用，不需要付费 API key。

### 已有数据（从 Redis 读取）

| 数据点 | FRED Series | 用途 |
|--------|------------|------|
| VIX | VIXCLS | Volatility |
| HY Spread (OAS) | BAMLH0A0HYM2 | Credit |
| 10Y Yield | DGS10 | Macro |
| Fed Funds Rate | FEDFUNDS | Macro |
| 10Y-2Y Spread | T10Y2Y | Macro |
| M2 Money Supply | M2SL | Liquidity |
| Fed Balance Sheet | WALCL | Liquidity |
| Unemployment | UNRATE | Macro |
| Crypto Fear & Greed | Alternative.me | Sentiment |

### 新增 FRED series

| Series | Name | Category |
|--------|------|----------|
| `BAMLC0A0CM` | ICE BofA US IG OAS | Credit |
| `SOFR` | Secured Overnight Financing Rate | Liquidity |

### 新外部来源

| Source | Endpoint | Format | Auth | Reliability |
|--------|----------|--------|------|-------------|
| CNN Fear & Greed | `production.dataviz.cnn.io/index/fearandgreed/graphdata/{date}` | JSON | User-Agent header | MEDIUM |
| AAII Sentiment | `aaii.com/sentimentsurvey` | HTML | User-Agent header | LOW |
| CBOE Total P/C | `cdn.cboe.com/.../totalpc.csv` | CSV | 无 | HIGH |
| CBOE Equity P/C | `cdn.cboe.com/.../equitypc.csv` | CSV | 无 | HIGH |

### Yahoo Finance Symbols（19 个）

使用 `query1.finance.yahoo.com/v8/finance/chart`，无 API key，仅需 User-Agent header。

| # | Symbol | 类别 | 用途 |
|---|--------|------|------|
| 1 | `^GSPC` | Trend, Momentum | SPX - 计算 20/50/200 DMA、ROC |
| 2 | `^VIX` | Volatility | 实时 VIX |
| 3 | `^VIX9D` | Volatility | 9 日 VIX，做期限结构 |
| 4 | `^VIX3M` | Volatility | 3 个月 VIX，做期限结构 |
| 5 | `^SKEW` | Positioning | CBOE SKEW index |
| 6 | `^MMTH` | Breadth | 高于 200 DMA 的股票比例 |
| 7 | `^NYA` | Breadth | NYSE 综合指数 |
| 8 | `C:ISSU` | Breadth | NYSE advances/declines/unchanged |
| 9 | `GLD` | Cross-Asset | 黄金 proxy |
| 10 | `TLT` | Cross-Asset | 债券 proxy |
| 11 | `SPY` | Cross-Asset, Breadth | 股票基准 |
| 12 | `RSP` | Breadth | 等权 S&P 500 |
| 13 | `DX-Y.NYB` | Cross-Asset | 美元指数 |
| 14 | `HYG` | Credit | HY bond ETF 趋势 |
| 15 | `LQD` | Credit | IG bond ETF 趋势 |
| 16 | `XLK` | Momentum | 科技板块 |
| 17 | `XLF` | Momentum | 金融板块 |
| 18 | `XLE` | Momentum | 能源板块 |
| 19 | `XLV` | Momentum | 医疗板块 |

## 评分公式

### 1. Sentiment（10%）

```text
inputs: CNN_FG, AAII_Bull, AAII_Bear

score = (CNN_FG * 0.4) + (AAII_Bull_Percentile * 0.3) + ((100 - AAII_Bear_Percentile) * 0.3)
```

若 AAII 不可用，则直接使用 CNN F&G；若 CNN 和 AAII 都不可用，再用 `cryptoFearGreed` 作为 proxy。

### 2. Volatility（10%）

```text
vix_score = clamp(100 - ((VIX - 12) / 28) * 100, 0, 100)
term_score = contango ? 70 : backwardation ? 30 : 50
score = vix_score * 0.7 + term_score * 0.3
```

### 3. Positioning（15%）

```text
pc_score = clamp(100 - ((PC_Ratio - 0.7) / 0.6) * 100, 0, 100)
skew_score = clamp(100 - ((SKEW - 100) / 50) * 100, 0, 100)
score = pc_score * 0.6 + skew_score * 0.4
```

### 4. Trend（10%）

```text
above_count = count(price > SMA20, price > SMA50, price > SMA200)
distance_200 = (price - SMA200) / SMA200
score = (above_count / 3) * 50 + clamp(distance_200 * 500 + 50, 0, 100) * 0.5
```

### 5. Breadth（10%）

```text
breadth_score = Pct_Above_200DMA
ad_score = clamp((AD_Ratio - 0.5) / 1.5 * 100, 0, 100)
rsp_score = clamp(RSP_SPY_30d_diff * 10 + 50, 0, 100)
score = breadth_score * 0.4 + ad_score * 0.3 + rsp_score * 0.3
```

### 6. Momentum（10%）

```text
rsi_score = clamp((avg_sector_rsi - 30) / 40 * 100, 0, 100)
roc_score = clamp(SPX_ROC_20d * 10 + 50, 0, 100)
score = rsi_score * 0.5 + roc_score * 0.5
```

### 7. Liquidity（15%）

```text
m2_score = clamp(M2_YoY * 10 + 50, 0, 100)
fed_score = clamp(Fed_BS_MoM * 20 + 50, 0, 100)
sofr_score = clamp(100 - SOFR * 15, 0, 100)
score = m2_score * 0.4 + fed_score * 0.3 + sofr_score * 0.3
```

### 8. Credit（10%）

```text
hy_score = clamp(100 - ((HY_Spread - 3.0) / 5.0) * 100, 0, 100)
ig_score = clamp(100 - ((IG_Spread - 0.8) / 2.0) * 100, 0, 100)
trend_score = HY_narrowing ? 70 : HY_widening ? 30 : 50
score = hy_score * 0.4 + ig_score * 0.3 + trend_score * 0.3
```

### 9. Macro（5%）

```text
rate_score = clamp(100 - Fed_Rate * 15, 0, 100)
curve_score = T10Y2Y > 0 ? 60 + T10Y2Y * 20 : 40 + T10Y2Y * 40
unemp_score = clamp(100 - (UNRATE - 3.5) * 20, 0, 100)
score = rate_score * 0.3 + curve_score * 0.4 + unemp_score * 0.3
```

### 10. Cross-Asset（5%）

（其余部分可按同样方式继续扩展。）

