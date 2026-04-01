# 🌍 自托管 World Monitor

使用 Docker/Podman 在本地运行完整的 World Monitor 技术栈。

## 📋 前置条件

- **Docker** 或 **Podman**（rootless 模式也可以）
- **Docker Compose** 或 **podman-compose**（`pip install podman-compose` 或 `uvx podman-compose`）
- **Node.js 22+**（用于在宿主机上运行种子脚本）

## 🚀 快速开始

```bash
# 1. 克隆并进入仓库
git clone https://github.com/koala73/worldmonitor.git
cd worldmonitor
npm install

# 2. 启动技术栈
docker compose up -d        # 或：uvx podman-compose up -d

# 3. 将数据 seed 到 Redis
./scripts/run-seeders.sh

# 4. 打开仪表盘
open http://localhost:3000
```

仪表盘在默认情况下可以直接使用公开数据源（地震、天气、冲突等）。API 密钥可以解锁更多数据源。

## 🔑 API 密钥

创建一个 `docker-compose.override.yml` 来注入你的密钥。这个文件会被 **gitignore**，因此你的机密信息会保留在本地。

```yaml
services:
  worldmonitor:
    environment:
      # 🤖 LLM - 可选择一个或两个（用于情报评估）
      GROQ_API_KEY: ""            # https://console.groq.com (免费，14.4K 次请求/天)
      OPENROUTER_API_KEY: ""      # https://openrouter.ai (免费，50 次请求/天)

      # 📊 市场与经济
      FINNHUB_API_KEY: ""         # https://finnhub.io (免费层)
      FRED_API_KEY: ""            # https://fred.stlouisfed.org/docs/api/api_key.html (免费)
      EIA_API_KEY: ""             # https://www.eia.gov/opendata/ (免费)

      # ⚔️ 冲突与动荡
      ACLED_ACCESS_TOKEN: ""      # https://acleddata.com (研究用途免费)

      # 🛰️ 地球观测
      NASA_FIRMS_API_KEY: ""      # https://firms.modaps.eosdis.nasa.gov (免费)

      # ✈️ 航空
      AVIATIONSTACK_API: ""       # https://aviationstack.com (免费层)

      # 🚢 海事
      AISSTREAM_API_KEY: ""       # https://aisstream.io (免费)

      # 🌐 网络中断（付费）
      CLOUDFLARE_API_TOKEN: ""    # https://dash.cloudflare.com (需要 Radar 访问权限)

      # 🔌 自托管 LLM（可选 - 任何 OpenAI 兼容端点都可以）
      LLM_API_URL: ""             # 例如 http://localhost:11434/v1/chat/completions
      LLM_API_KEY: ""
      LLM_MODEL: ""

  ais-relay:
    environment:
      AISSTREAM_API_KEY: ""       # 同上面的密钥 - relay 也需要它
```

### 💰 免费 vs 付费

| 状态 | 密钥 |
|------|------|
| 🟢 不需要密钥 | 地震、天气、自然事件、UNHCR 流离失所、预测市场、稳定币、加密货币、支出、气候异常、海底电缆、BIS 数据、网络威胁 |
| 🟢 免费注册 | GROQ、FRED、EIA、NASA FIRMS、AISSTREAM、Finnhub、AviationStack、ACLED、OpenRouter |
| 🟡 免费（有限制） | OpenSky（注册后可获得更高速率限制） |
| 🔴 付费 | Cloudflare Radar（网络中断） |

## 🌱 数据种子

种子脚本会拉取上游数据并写入 Redis。它们运行在**宿主机**上（不在容器内），并且需要 Redis REST 代理处于运行状态。

```bash
# 运行所有 seeder（会自动从 docker-compose.override.yml 读取 API 密钥）
./scripts/run-seeders.sh
```

**⚠️ 重要：** Redis 数据会在容器重启后通过 `redis-data` volume 保留，但如果执行 `docker compose down -v` 就会丢失。若你移除了卷，或者看到数据过旧，请重新运行 seeder。

如需自动化，可以添加一个 cron 任务：

```bash
# 每 30 分钟重新 seed 一次
*/30 * * * * cd /path/to/worldmonitor && ./scripts/run-seeders.sh >> /tmp/wm-seeders.log 2>&1
```

### 🔧 手动运行 seeder

如果你更愿意手动运行单个 seeder：

```bash
export UPSTASH_REDIS_REST_URL=http://localhost:8079
export UPSTASH_REDIS_REST_TOKEN=wm-local-token
node scripts/seed-earthquakes.mjs
node scripts/seed-military-flights.mjs
# ... 等等
```

## 🏗️ 架构

```
┌─────────────────────────────────────────────┐
│                 localhost:3000               │
│                   (nginx)                    │
├──────────────┬──────────────────────────────┤
│ 静态文件     │      /api/* 代理             │
│  (Vite SPA)  │         │                    │
│              │    Node.js API (:46123)       │
│              │    50+ 路由处理器             │
│              │         │                     │
│              │    Redis REST 代理 (:8079)   │
│              │         │                     │
│              │      Redis (:6379)            │
└──────────────┴──────────────────────────────┘
         AIS Relay（WebSocket → AISStream）
```

| 容器 | 用途 | 端口 |
|-----------|---------|------|
| `worldmonitor` | nginx + Node.js API（supervisord） | 3000 → 8080 |
| `worldmonitor-redis` | 数据存储 | 6379（内部） |
| `worldmonitor-redis-rest` | Upstash 兼容的 REST 代理 | 8079 |
| `worldmonitor-ais-relay` | 实时船舶跟踪 WebSocket | 3004（内部） |

## 🔨 从源码构建

```bash
# 仅前端（用于开发）
npx vite build

# 完整 Docker 镜像
docker build -t worldmonitor:latest -f Dockerfile .

# 重新构建并重启
docker compose down && docker compose up -d
./scripts/run-seeders.sh
```

### ⚠️ 构建说明

- Docker 镜像在 builder 和 runtime 阶段都使用 **Node.js 22 Alpine**
- Docker 中会跳过 blog site 构建（依赖是单独的）
- runtime 阶段需要 `gettext`（Alpine 包）来支持 nginx 配置中的 `envsubst`
- 如果在 Docker 构建中遇到 `npm ci` 同步错误，请用容器自带的 npm 版本重新生成 lockfile：
  ```bash
  docker run --rm -v "$(pwd)":/app -w /app node:22-alpine npm install --package-lock-only
  ```

## 🌐 连接外部基础设施

### 共享 Redis（可选）

如果你运行的其他技术栈共享同一个 Redis 实例，可以通过外部网络连接：

```yaml
# docker-compose.override.yml
services:
  redis:
    networks:
      - infra_default

networks:
  infra_default:
    external: true
```

### 自托管 LLM

任何 OpenAI 兼容端点都可以（Ollama、vLLM、llama.cpp server 等）：

```yaml
# docker-compose.override.yml
services:
  worldmonitor:
    environment:
      LLM_API_URL: "http://your-host:8000/v1/chat/completions"
      LLM_API_KEY: "your-key"
      LLM_MODEL: "your-model-name"
    extra_hosts:
      - "your-host:192.168.1.100"  # 如果无法通过 DNS 解析
```

## 🐛 故障排查

| 问题 | 解决方法 |
|-------|----------|
| 📡 健康检查显示 `0/55 OK` | Seeder 还没运行 - 执行 `./scripts/run-seeders.sh` |
| 🔴 nginx 无法启动 | 查看 `podman logs worldmonitor` - 大概率缺少 `gettext` 包 |
| 🔑 Seeder 提示 "Missing UPSTASH_REDIS_REST_URL" | 技术栈没有运行，或者请通过 `./scripts/run-seeders.sh` 运行（会自动设置环境变量） |
| 📦 Docker 构建中 `npm ci` 失败 | lockfile 不匹配 - 使用 `docker run --rm -v $(pwd):/app -w /app node:22-alpine npm install --package-lock-only` 重新生成 |
| 🚢 没有船舶数据 | 在 `worldmonitor` 和 `ais-relay` 两个服务中都设置 `AISSTREAM_API_KEY` |
| 🔥 没有野火数据 | 设置 `NASA_FIRMS_API_KEY` |
| 🌐 没有中断数据 | 需要 `CLOUDFLARE_API_TOKEN`（付费 Radar 访问） |
