# 气候变体：完整实施计划

## 当前状态

| 组件 | 状态 |
|------|------|
| Proto RPCs | 1 - `ListClimateAnomalies` |
| Redis keys | 1 - `climate:anomalies:v1` |
| Seed scripts | 1 - `seed-climate-anomalies.mjs` |
| MCP tool | `get_climate_data` - 与 `weather:alerts:v1` 打包 |
| Hostname variant | 未配置 |

**现有 seeder 的关键缺陷：** `seed-climate-anomalies.mjs` 使用 30 天滚动窗口作为自身基线。它比较的是“最近 7 天”对“前 23 天”，而不是和 30 年气候常态对比。这会让异常数值在内部自洽，但在气候学上没有意义。

## 目标状态：6 层数据

### 第 1 层：气候异常（已有 - 修正并扩展）

**先修正：** 将 30 天滚动基线替换为 **30 年 ERA5 气候常态**，可通过 Copernicus Climate Data Store 或 Open-Meteo 历史端点实现，参考标准为 1991–2020（WMO 标准）。

**正确的 Open-Meteo 做法：**

```text
// Reference period: same calendar month, 1991-2020 (30-year WMO normal)
// Step 1: Fetch current 7-day mean for zone
// Step 2: Fetch historical 30-year monthly mean for same month
//         using open-meteo archive: start_date=1991-01-01 end_date=2020-12-31, aggregate monthly
// Step 3: anomaly = current - historical_mean
```

**扩展区域：** 当前的 15 个区域偏地缘政治，增加气候专用区域：

- Arctic
- Greenland
- Western Antarctic Ice Sheet
- Tibetan Plateau
- Congo Basin
- Coral Triangle
- North Atlantic

**不改变 cache key `climate:anomalies:v1`** - 直接原地修复。

### 第 2 层：CO2 与温室气体监测（新增）

**内容：** 真实大气 CO2 浓度、趋势与年增长率。它是所有气候变化的基础数字。

**来源：**

- NOAA GML Mauna Loa
- NOAA global average
- Methane (CH4)
- Nitrous oxide (N2O)

**计算内容：**

- 当前 ppm
- 同比变化
- 280 ppm 前工业基线
- 450 ppm “安全”水平
- CO2 超过 400 ppm 以来的天数

**Redis key：** `climate:co2-monitoring:v1`
**Seed script：** `seed-co2-monitoring.mjs`
**Cache TTL：** 86400
**Proto RPC：** `GetCo2Monitoring`

### 第 3 层：全球灾害告警（新增 - 复用现有种子数据）

**内容：** 实时灾害事件与严重度评分。GDACS 已经在 natural events seeder 中运行，这里直接对 climate 图层暴露它，并补充其他灾害源。

**关键要求：** 复用 `natural:events:v1` 的 Redis 数据，不要重播种。仅通过 climate-domain RPC 暴露 GDACS + wildfire + earthquake，并聚焦洪水、风暴、干旱、野火、热浪等事件。

**额外来源：**

- ReliefWeb API
- EM-DAT
- NOAA Storm Prediction Center

**Redis key：** `climate:disasters:v1`
**Seed script：** `seed-climate-disasters.mjs`
**Cache TTL：** 21600
**Proto RPC：** `ListClimateDisasters`

### 第 4 层：空气质量与污染（新增）

**内容：** 全球 PM2.5、AQI、臭氧、NO2 数据，既是化石燃料排放的结果，也是气候反馈的一部分。

**说明：** 这一层与 Health 变体共享数据（`health:air-quality:v1`），气候域会用同样的数据，但 RPC 更聚焦污染来源与趋势，而非健康风险。

**来源：**

- OpenAQ API v3
- WAQI
- Copernicus Atmosphere Monitoring Service
- EPA AirNow

**Redis key：** `climate:air-quality:v1`
**Seed script：** 与 health 共用 `seed-health-air-quality.mjs`
**Cache TTL：** 3600
**Proto RPC：** `ListAirQualityData`

### 第 5 层：海平面、冰与海洋数据（新增）

**内容：** 气候变化的长期物理指标，包括海平面上升、北极海冰和海洋热含量。

**来源：**

- NSIDC Sea Ice Index
- NOAA Sea Level Trends
- CSIRO/AVISO global mean sea level
- NOAA OHC
- Copernicus SST anomaly

**Redis key：** `climate:ocean-ice:v1`
**Seed script：** `seed-climate-ocean-ice.mjs`
**Cache TTL：** 86400
**Proto RPC：** `GetOceanIceData`

### 第 6 层：气候新闻情报（新增 - 新闻层）

**内容：** 来自权威气候源的新闻聚合，并对事件、政策、纪录做 AI 标注。

**来源（RSS，无 key）：**

- Carbon Brief
- The Guardian Environment
- ReliefWeb Disasters
- NASA Earth Observatory
- NOAA Climate News
- Phys.org Earth Science
- Copernicus/ECMWF
- Inside Climate News
- Climate Central

**Redis key：** `climate:news-intelligence:v1`
**Seed script：** `seed-climate-news.mjs`
**Cache TTL：** 1800
**Proto RPC：** `ListClimateNews`

## Seed Script Schedule（Railway Cron）

| Script | Interval | Key | TTL |
|--------|----------|-----|-----|
| `seed-climate-anomalies.mjs` | 每 6h | `climate:anomalies:v1` | 72h |
| `seed-co2-monitoring.mjs` | 每日 | `climate:co2-monitoring:v1` | 24h |
| `seed-climate-disasters.mjs` | 每 6h | `climate:disasters:v1` | 6h |
| `seed-health-air-quality.mjs` | 每 1h | `climate:air-quality:v1` | 1h |
| `seed-climate-ocean-ice.mjs` | 每日 | `climate:ocean-ice:v1` | 24h |
| `seed-climate-news.mjs` | 每 30min | `climate:news-intelligence:v1` | 1h |

## Proto Service 扩展

```proto
// service.proto additions
service ClimateService {
  rpc ListClimateAnomalies(...)  // EXISTING
  rpc GetCo2Monitoring(GetCo2MonitoringRequest) returns (GetCo2MonitoringResponse) {
    option (sebuf.http.config) = {path: "/get-co2-monitoring", method: HTTP_METHOD_GET};
  }
  rpc ListClimateDisasters(ListClimateDisastersRequest) returns (ListClimateDisastersResponse) {
    option (sebuf.http.config) = {path: "/list-climate-disasters", method: HTTP_METHOD_GET};
  }
  rpc ListAirQualityData(ListAirQualityDataRequest) returns (ListAirQualityDataResponse) {
    option (sebuf.http.config) = {path: "/list-air-quality-data", method: HTTP_METHOD_GET};
  }
  rpc GetOceanIceData(GetOceanIceDataRequest) returns (GetOceanIceDataResponse) {
    option (sebuf.http.config) = {path: "/get-ocean-ice-data", method: HTTP_METHOD_GET};
  }
  rpc ListClimateNews(ListClimateNewsRequest) returns (ListClimateNewsResponse) {
    option (sebuf.http.config) = {path: "/list-climate-news", method: HTTP_METHOD_GET};
  }
}
```

