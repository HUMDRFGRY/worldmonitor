import type { Feed, PropagandaRisk } from '@/types';

// ======================================================================
// 自定义消息源 —— 类型定义
// ======================================================================

/** 消息源类型 */
export type CustomSourceType = 'rss' | 'atom' | 'api' | 'scrape';

/**
 * 自定义消息源配置。
 * 在 CUSTOM_SOURCES 数组中新增一条记录即可添加新源；
 * 将 enabled 设为 false 可停用某个源，无需删除配置。
 */
export interface CustomSource {
  /** 唯一标识符，仅允许小写字母、数字和连字符，如 'my-rss-feed' */
  id: string;
  /** 源显示名称，如 'Reuters World' */
  name: string;
  /** 源类型：rss | atom | api | scrape */
  type: CustomSourceType;
  /** 订阅 / 抓取 URL */
  url: string;
  /** 地区标识，如 'asia'、'europe'、'middleeast' */
  region?: string;
  /** 话题分类，对应 VARIANT_FEEDS 分类键，如 'tech'、'finance'、'politics' */
  topic?: string;
  /** 内容语言（ISO 639-1），如 'en'、'zh'、'ar' */
  language?: string;
  /** 源权威等级（1 = 最高，4 = 最低），默认 3 */
  priority?: 1 | 2 | 3 | 4;
  /** 定时抓取间隔（秒），默认 1800 */
  pollInterval?: number;
  /** 单次请求超时（毫秒），默认 10000 */
  timeout?: number;
  /** 每分钟最大请求次数，默认 10 */
  rateLimit?: number;
  /** 是否启用此源（false = 停用，不进入抓取流程） */
  enabled: boolean;
  /** 宣传风险评级：low | medium | high */
  propagandaRisk?: PropagandaRisk;
  /** 国家关联媒体标注，如 '俄罗斯'、'中国' */
  stateAffiliated?: string;
}

// ======================================================================
// 自定义消息源 —— 运行时校验
// ======================================================================

/** 自定义源配置校验错误（含中文说明） */
export class CustomSourceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomSourceValidationError';
  }
}

const VALID_TYPES: readonly CustomSourceType[] = ['rss', 'atom', 'api', 'scrape'];
const VALID_PRIORITIES = [1, 2, 3, 4] as const;
const VALID_PROPAGANDA_RISKS: readonly PropagandaRisk[] = ['low', 'medium', 'high'];

/**
 * 验证单条自定义源配置。
 * 校验通过时返回类型安全的 CustomSource 对象；
 * 校验失败时抛出 CustomSourceValidationError（含中文错误说明）。
 */
export function validateCustomSource(raw: unknown): CustomSource {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new CustomSourceValidationError('自定义源配置必须是对象');
  }

  const src = raw as Record<string, unknown>;

  // ——— 必填字段：id ———
  if (!src.id || typeof src.id !== 'string') {
    throw new CustomSourceValidationError('自定义源缺少必填字段 "id"（字符串）');
  }
  if (!/^[a-z0-9-]+$/.test(src.id)) {
    throw new CustomSourceValidationError(
      `自定义源 id "${src.id}" 格式无效，只允许小写字母、数字和连字符（例如 "my-rss-feed"）`,
    );
  }

  // ——— 必填字段：name ———
  if (!src.name || typeof src.name !== 'string') {
    throw new CustomSourceValidationError(`自定义源 "${src.id}" 缺少必填字段 "name"（字符串）`);
  }

  // ——— 必填字段：type ———
  if (!src.type || !VALID_TYPES.includes(src.type as CustomSourceType)) {
    throw new CustomSourceValidationError(
      `自定义源 "${src.id}" 的 type "${src.type}" 无效，可选值：${VALID_TYPES.join(' | ')}`,
    );
  }

  // ——— 必填字段：url ———
  if (!src.url || typeof src.url !== 'string') {
    throw new CustomSourceValidationError(`自定义源 "${src.id}" 缺少必填字段 "url"（字符串）`);
  }
  try {
    new URL(src.url);
  } catch {
    throw new CustomSourceValidationError(
      `自定义源 "${src.id}" 的 url "${src.url}" 不是合法的 URL（须以 https:// 或 http:// 开头）`,
    );
  }

  // ——— 必填字段：enabled ———
  if (typeof src.enabled !== 'boolean') {
    throw new CustomSourceValidationError(
      `自定义源 "${src.id}" 缺少必填字段 "enabled"（布尔值 true / false）`,
    );
  }

  // ——— 可选字段：priority ———
  if (src.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(src.priority as 1 | 2 | 3 | 4)) {
      throw new CustomSourceValidationError(
        `自定义源 "${src.id}" 的 priority "${src.priority}" 无效，可选值：1 | 2 | 3 | 4（1 最高，4 最低）`,
      );
    }
  }

  // ——— 可选字段：pollInterval ———
  if (src.pollInterval !== undefined) {
    if (typeof src.pollInterval !== 'number' || !Number.isInteger(src.pollInterval) || src.pollInterval <= 0) {
      throw new CustomSourceValidationError(
        `自定义源 "${src.id}" 的 pollInterval "${src.pollInterval}" 无效，须为正整数（单位：秒）`,
      );
    }
  }

  // ——— 可选字段：timeout ———
  if (src.timeout !== undefined) {
    if (typeof src.timeout !== 'number' || !Number.isInteger(src.timeout) || src.timeout <= 0) {
      throw new CustomSourceValidationError(
        `自定义源 "${src.id}" 的 timeout "${src.timeout}" 无效，须为正整数（单位：毫秒）`,
      );
    }
  }

  // ——— 可选字段：rateLimit ———
  if (src.rateLimit !== undefined) {
    if (typeof src.rateLimit !== 'number' || !Number.isInteger(src.rateLimit) || src.rateLimit <= 0) {
      throw new CustomSourceValidationError(
        `自定义源 "${src.id}" 的 rateLimit "${src.rateLimit}" 无效，须为正整数（单位：每分钟请求次数）`,
      );
    }
  }

  // ——— 可选字段：propagandaRisk ———
  if (src.propagandaRisk !== undefined) {
    if (!VALID_PROPAGANDA_RISKS.includes(src.propagandaRisk as PropagandaRisk)) {
      throw new CustomSourceValidationError(
        `自定义源 "${src.id}" 的 propagandaRisk "${src.propagandaRisk}" 无效，可选值：low | medium | high`,
      );
    }
  }

  return {
    id: src.id,
    name: src.name,
    type: src.type as CustomSourceType,
    url: src.url,
    region: typeof src.region === 'string' ? src.region : undefined,
    topic: typeof src.topic === 'string' ? src.topic : undefined,
    language: typeof src.language === 'string' ? src.language : undefined,
    priority: src.priority as 1 | 2 | 3 | 4 | undefined,
    pollInterval: typeof src.pollInterval === 'number' ? src.pollInterval : undefined,
    timeout: typeof src.timeout === 'number' ? src.timeout : undefined,
    rateLimit: typeof src.rateLimit === 'number' ? src.rateLimit : undefined,
    enabled: src.enabled,
    propagandaRisk: src.propagandaRisk as PropagandaRisk | undefined,
    stateAffiliated: typeof src.stateAffiliated === 'string' ? src.stateAffiliated : undefined,
  };
}

// ======================================================================
// 自定义消息源 —— 内置示例源配置
// ======================================================================

/**
 * 自定义消息源列表。
 *
 * 使用方式：
 *   - 复制示例块，修改 id / name / url 等字段，将 enabled 设为 true 即可启用。
 *   - 将 enabled 设为 false 可停用某个源，无需删除配置。
 *   - 新增源后无需修改其他文件，enabled 源会在构建/运行时自动集成到 INTEL_SOURCES。
 *
 * 注意：使用 RSS 代理的源需要确认域名已在 api/rss-proxy.js ALLOWED_DOMAINS 白名单中。
 */
const _CUSTOM_SOURCES_RAW: CustomSource[] = [
  // ——————————————————————————————————————————————————————————————
  // 示例 1：RSS/Atom 源（亚洲区域新闻）
  // ——————————————————————————————————————————————————————————————
  {
    id: 'scmp-asia',
    name: 'South China Morning Post',
    type: 'rss',
    url: 'https://www.scmp.com/rss/5/feed',
    region: 'asia',
    topic: 'asia',
    language: 'en',
    priority: 2,
    pollInterval: 900,
    timeout: 12000,
    rateLimit: 10,
    enabled: false,
  },

  // ——————————————————————————————————————————————————————————————
  // 示例 2：REST API 源（JSON 格式，需在 src/services/rss.ts 中适配解析器）
  // ——————————————————————————————————————————————————————————————
  {
    id: 'newsapi-world',
    name: 'NewsAPI World Headlines',
    type: 'api',
    url: 'https://newsapi.org/v2/top-headlines?category=general&language=en',
    topic: 'politics',
    language: 'en',
    priority: 3,
    pollInterval: 1800,
    timeout: 10000,
    rateLimit: 5,
    enabled: false,
  },

  // ——————————————————————————————————————————————————————————————
  // 示例 3：网页抓取源（需在 src/services/rss.ts 中适配解析器）
  // ——————————————————————————————————————————————————————————————
  {
    id: 'sipri-news',
    name: 'SIPRI News',
    type: 'scrape',
    url: 'https://www.sipri.org/news',
    topic: 'thinktanks',
    language: 'en',
    priority: 3,
    pollInterval: 3600,
    timeout: 15000,
    rateLimit: 2,
    enabled: false,
  },
];

// 模块加载时对所有预置源进行校验，确保配置错误在启动时即被发现
export const CUSTOM_SOURCES: CustomSource[] = _CUSTOM_SOURCES_RAW.map((src) =>
  validateCustomSource(src),
);

// ======================================================================
// 自定义消息源 —— 辅助工具函数
// ======================================================================

/** 返回所有已启用的自定义源（enabled === true，已通过校验） */
export function getEnabledCustomSources(): CustomSource[] {
  return CUSTOM_SOURCES.filter((src) => src.enabled);
}

/**
 * 将 CustomSource 转换为客户端 Feed 类型。
 * 对于 rss / atom 类型的源，URL 会自动通过 RSS 代理路由；
 * api / scrape 类型使用原始 URL（需要专门的解析器支持）。
 */
export function customSourceToFeed(src: CustomSource): Feed {
  const proxiedUrl =
    src.type === 'rss' || src.type === 'atom'
      ? `/api/rss-proxy?url=${encodeURIComponent(src.url)}`
      : src.url;

  return {
    name: src.name,
    url: proxiedUrl,
    type: src.type,
    region: src.region,
    lang: src.language,
    propagandaRisk: src.propagandaRisk,
    stateAffiliated: src.stateAffiliated,
  };
}
