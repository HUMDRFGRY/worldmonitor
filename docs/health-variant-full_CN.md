# Health 变体：完整实施计划

## 当前状态

| 组件 | 状态 |
|------|------|
| Proto RPCs | 1 - `ListDiseaseOutbreaks` |
| Redis keys | 3 - `health:disease-outbreaks:v1`、`health:vpd-tracker:realtime:v1`、`health:vpd-tracker:historical:v1` |
| Seed scripts | 2 - `seed-disease-outbreaks.mjs`、`seed-vpd-tracker.mjs` |
| MCP tool | 没有注册 `get_health_data` |
| Hostname variant | 未配置 |

疾病暴发 seeder 已经比较完善（WHO DON API + CDC + Outbreak News Today + ThinkGlobalHealth/ProMED，150 条地理定位告警）。VPD tracker 也有不错的 WHO 年度病例历史数据。其他部分还缺失。

## 目标状态：6 层数据

### 第 1 层：疾病暴发（已有 - 只增强）

**当前：** WHO DON API + CDC RSS + ThinkGlobalHealth/ProMED

**需要增强：**

- 添加 ECDC RSS
- 添加 PAHO Americas alerts
- 添加 STAT News
- 添加 bioRxiv Microbiology preprints
- 添加 The Lancet Infectious Diseases RSS
- 某些情况下 `cases` 字段经常为 0，需要在可用时从 ECDC 补充病例数据
- 不改变现有 cache key `health:disease-outbreaks:v1`

### 第 2 层：流行病趋势（新增）

**内容：** 每种疾病/国家的时间序列病例与死亡数，展示曲线而不只是地图上的点。

**来源：**

- Our World in Data disease data API
- WHO GHO Indicator API
- CDC surveillance data
- Nextstrain SARS-CoV-2

**Redis key：** `health:epidemic-trends:v1`
**Seed script：** `seed-epidemic-trends.mjs`
**Cache TTL：** 86400
**Proto RPC：** `ListEpidemicTrends`

### 第 3 层：疫苗覆盖率（新增）

**内容：** 按疫苗与国家展示覆盖率，是疫情准备的重要背景。

**来源：**

- WHO Immunization Data Portal
- UNICEF State of the World's Children
- CDC NIS

**Redis key：** `health:vaccination-coverage:v1`
**Seed script：** `seed-vaccination-coverage.mjs`
**Cache TTL：** 604800
**Proto RPC：** `GetVaccinationCoverage`

### 第 4 层：空气质量健康风险（新增）

**内容：** 将全球 PM2.5 / AQI 映射为健康风险区，是 climate/environment 与 health 的桥梁。

**来源：**

- OpenAQ API v3
- WAQI
- WHO AQI thresholds

**Redis key：** `health:air-quality:v1`
**Seed script：** `seed-health-air-quality.mjs`
**Cache TTL：** 3600
**Proto RPC：** `ListAirQualityAlerts`

### 第 5 层：病原体监测（新增）

**内容：** 新兴病原体/变种追踪，作为新型毒株的早期预警。

**来源：**

- Nextstrain
- GISAID surveillance reports
- WHO Weekly Epidemiological Record
- ProMED-mail

**Redis key：** `health:pathogen-surveillance:v1`
**Seed script：** `seed-pathogen-surveillance.mjs`
**Cache TTL：** 43200
**Proto RPC：** `ListPathogenAlerts`

### 第 6 层：全球健康新闻情报（新增 - 新闻层）

**内容：** 来自权威来源的健康/医学新闻聚合，并做 AI 标注。

**来源（RSS，无 key）：**

- STAT News
- WHO News
- NIH Latest News
- CDC Newsroom
- The Lancet
- NEJM
- bioRxiv Microbiology
- Global Health Now

**Redis key：** `health:news-intelligence:v1`
**Seed script：** `seed-health-news.mjs`
**Cache TTL：** 1800
**Proto RPC：** `ListHealthNews`

## 种子脚本调度（Railway Cron）

| Script | Interval | Key | TTL |
|--------|----------|-----|-----|
| `seed-disease-outbreaks.mjs` | 每 6h | `health:disease-outbreaks:v1` | 72h |
| `seed-vpd-tracker.mjs` | 每日 | `health:vpd-tracker:realtime:v1` | 72h |
| `seed-epidemic-trends.mjs` | 每日 | `health:epidemic-trends:v1` | 24h |
| `seed-vaccination-coverage.mjs` | 每周（周日 02:00 UTC） | `health:vaccination-coverage:v1` | 7 天 |
| `seed-health-air-quality.mjs` | 每 1h | `health:air-quality:v1` | 1h |
| `seed-pathogen-surveillance.mjs` | 每 12h | `health:pathogen-surveillance:v1` | 24h |
| `seed-health-news.mjs` | 每 30min（或 relay loop） | `health:news-intelligence:v1` | 1h |

## Proto Service 扩展

```proto
service HealthService {
  rpc ListDiseaseOutbreaks(...)  // EXISTING
  rpc ListEpidemicTrends(ListEpidemicTrendsRequest) returns (ListEpidemicTrendsResponse) {
    option (sebuf.http.config) = {path: "/list-epidemic-trends", method: HTTP_METHOD_GET};
  }
  rpc GetVaccinationCoverage(GetVaccinationCoverageRequest) returns (GetVaccinationCoverageResponse) {
    option (sebuf.http.config) = {path: "/get-vaccination-coverage", method: HTTP_METHOD_GET};
  }
  rpc ListAirQualityAlerts(ListAirQualityAlertsRequest) returns (ListAirQualityAlertsResponse) {
    option (sebuf.http.config) = {path: "/list-air-quality-alerts", method: HTTP_METHOD_GET};
  }
  rpc ListPathogenAlerts(ListPathogenAlertsRequest) returns (ListPathogenAlertsResponse) {
    option (sebuf.http.config) = {path: "/list-pathogen-alerts", method: HTTP_METHOD_GET};
  }
  rpc ListHealthNews(ListHealthNewsRequest) returns (ListHealthNewsResponse) {
    option (sebuf.http.config) = {path: "/list-health-news", method: HTTP_METHOD_GET};
  }
}
```

