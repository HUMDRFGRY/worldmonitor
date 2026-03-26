/**
 * 自定义消息源配置模块
 *
 * 用于定义、验证和加载用户自定义的新闻/数据源。
 * 支持 RSS/Atom、REST API 和网页抓取三种类型。
 *
 * 使用方式：在 CUSTOM_SOURCES 数组中添加或修改源定义，
 * 重新运行应用后新源将自动合并进抓取流程。
 */

import type { Feed } from '@/types';

// ─────────────────────────────────────────────
// 1. 类型定义
// ─────────────────────────────────────────────

/** 支持的消息源类型 */
export type CustomSourceType = 'rss' | 'api' | 'scrape';

/**
 * 自定义消息源完整配置项。
 * 带 * 的字段为必填，其余均可选。
 */
export interface CustomSourceConfig {
  /** * 源唯一标识符（英文字母/数字/连字符，全局唯一） */
  id: string;
  /** * 显示名称（如 "BBC 中文"） */
  name: string;
  /** * 源类型：'rss' | 'api' | 'scrape' */
  sourceType: CustomSourceType;
  /**
   * * 源 URL。
   * - rss/scrape：填字符串
   * - api：填字符串；若需多语言映射，可填 Record<lang, url>
   */
  url: string | Record<string, string>;
  /** 所属地区/话题分类（对应 FEEDS 的 key，如 'politics'、'tech'） */
  topic?: string;
  /** 所属地区标签（如 'asia'、'europe'） */
  region?: string;
  /** 内容语言（ISO 639-1 两字母代码，如 'zh'、'en'、'fr'） */
  lang?: string;
  /** 优先级（数值越小优先级越高；参考：1=权威机构，4=聚合/博客） */
  priority?: number;
  /** 轮询间隔（毫秒；默认 300000 = 5 分钟） */
  pollIntervalMs?: number;
  /** 请求超时（毫秒；默认 10000 = 10 秒） */
  timeoutMs?: number;
  /** 每分钟最大请求次数（速率限制） */
  rateLimit?: number;
  /** 是否启用此源（false = 停用，不进入抓取流程；默认 true） */
  enabled?: boolean;
  /** 源类型标签（参考 SOURCE_TYPES，如 'wire'、'mainstream'） */
  type?: string;
  /** 宣传风险评估（'low' | 'medium' | 'high'） */
  propagandaRisk?: 'low' | 'medium' | 'high';
  /** 国家/机构归属（如 "Russia"、"China"） */
  stateAffiliated?: string;
}

// ─────────────────────────────────────────────
// 2. 运行时校验（含中文报错）
// ─────────────────────────────────────────────

/** 校验结果 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_SOURCE_TYPES: CustomSourceType[] = ['rss', 'api', 'scrape'];
const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * 对单条自定义源配置进行运行时校验。
 * 返回 `{ valid, errors }` 而不抛出异常，方便批量报告。
 */
export function validateCustomSource(cfg: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof cfg !== 'object' || cfg === null) {
    return { valid: false, errors: ['配置项必须是一个对象'] };
  }

  const c = cfg as Record<string, unknown>;

  // ── 必填字段 ──────────────────────────────
  if (!c['id'] || typeof c['id'] !== 'string' || c['id'].trim() === '') {
    errors.push('缺少必填字段 "id"（源唯一标识符，字符串）');
  } else if (!ID_PATTERN.test(c['id'])) {
    errors.push(`"id" 格式不合法（"${c['id']}"）：只允许字母、数字、连字符和下划线`);
  }

  if (!c['name'] || typeof c['name'] !== 'string' || c['name'].trim() === '') {
    errors.push('缺少必填字段 "name"（源显示名称，字符串）');
  }

  if (!c['sourceType']) {
    errors.push(`缺少必填字段 "sourceType"，可选值：${VALID_SOURCE_TYPES.join(' | ')}`);
  } else if (!VALID_SOURCE_TYPES.includes(c['sourceType'] as CustomSourceType)) {
    errors.push(`"sourceType" 值非法（"${c['sourceType']}"），可选值：${VALID_SOURCE_TYPES.join(' | ')}`);
  }

  if (c['url'] === undefined || c['url'] === null || c['url'] === '') {
    errors.push('缺少必填字段 "url"（源地址，字符串或多语言映射对象）');
  } else if (typeof c['url'] !== 'string' && typeof c['url'] !== 'object') {
    errors.push('"url" 必须是字符串或 Record<lang, url> 对象');
  }

  // ── 可选字段类型校验 ─────────────────────
  if (c['priority'] !== undefined && (typeof c['priority'] !== 'number' || c['priority'] < 1)) {
    errors.push('"priority" 必须是大于等于 1 的数值（建议范围 1–4）');
  }

  if (c['pollIntervalMs'] !== undefined && (typeof c['pollIntervalMs'] !== 'number' || c['pollIntervalMs'] < 1000)) {
    errors.push('"pollIntervalMs" 必须是大于等于 1000 的数值（单位：毫秒）');
  }

  if (c['timeoutMs'] !== undefined && (typeof c['timeoutMs'] !== 'number' || c['timeoutMs'] < 500)) {
    errors.push('"timeoutMs" 必须是大于等于 500 的数值（单位：毫秒）');
  }

  if (c['rateLimit'] !== undefined && (typeof c['rateLimit'] !== 'number' || c['rateLimit'] < 1)) {
    errors.push('"rateLimit" 必须是大于 0 的整数（每分钟最大请求次数）');
  }

  if (c['enabled'] !== undefined && typeof c['enabled'] !== 'boolean') {
    errors.push('"enabled" 必须是布尔值（true 启用 / false 停用）');
  }

  if (c['propagandaRisk'] !== undefined && !['low', 'medium', 'high'].includes(c['propagandaRisk'] as string)) {
    errors.push('"propagandaRisk" 可选值：low | medium | high');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 校验全部自定义源配置，遇到无效配置时在控制台输出中文警告并跳过。
 * 返回所有通过校验的 `Feed` 对象（enabled !== false）。
 */
export function loadCustomSources(configs: CustomSourceConfig[]): Feed[] {
  const feeds: Feed[] = [];
  const seenIds = new Set<string>();

  for (const cfg of configs) {
    const { valid, errors } = validateCustomSource(cfg);

    if (!valid) {
      console.warn(
        `[自定义消息源] 配置无效，已跳过：\n` +
        errors.map(e => `  • ${e}`).join('\n') +
        `\n  原始配置：${JSON.stringify(cfg)}`
      );
      continue;
    }

    if (seenIds.has(cfg.id)) {
      console.warn(`[自定义消息源] 检测到重复的 id "${cfg.id}"，后者已跳过`);
      continue;
    }
    seenIds.add(cfg.id);

    // 停用的源直接跳过
    if (cfg.enabled === false) {
      continue;
    }

    feeds.push({
      id: cfg.id,
      name: cfg.name,
      url: cfg.url,
      type: cfg.type,
      region: cfg.region,
      topic: cfg.topic,
      lang: cfg.lang,
      priority: cfg.priority,
      pollIntervalMs: cfg.pollIntervalMs,
      timeoutMs: cfg.timeoutMs,
      rateLimit: cfg.rateLimit,
      enabled: cfg.enabled,
      propagandaRisk: cfg.propagandaRisk,
      stateAffiliated: cfg.stateAffiliated,
    });
  }

  return feeds;
}

/**
 * 将已通过校验的自定义源按 topic 归组，方便合并进 FEEDS。
 * topic 未指定的源归入 'custom' 分组。
 */
export function groupCustomFeedsByTopic(feeds: Feed[]): Record<string, Feed[]> {
  const grouped: Record<string, Feed[]> = {};
  for (const feed of feeds) {
    const key = feed.topic ?? 'custom';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(feed);
  }
  return grouped;
}

// ─────────────────────────────────────────────
// 3. 用户自定义源列表
//    在此数组中增删改条目，保存后重启即生效。
// ─────────────────────────────────────────────

/**
 * 在这里添加你的自定义消息源。
 *
 * 示例已注释，取消注释并修改字段即可启用。
 * 详细说明见 docs/CUSTOM_SOURCES.md。
 */
export const CUSTOM_SOURCES: CustomSourceConfig[] = [
  // ── RSS/Atom 示例 ──────────────────────────────────────────────────────────
  // {
  //   id: 'xinhua-english',
  //   name: '新华社（英文）',
  //   sourceType: 'rss',
  //   url: '/api/rss-proxy?url=' + encodeURIComponent('http://www.xinhuanet.com/english/rss/worldrss.xml'),
  //   topic: 'politics',
  //   region: 'asia',
  //   lang: 'en',
  //   priority: 2,
  //   pollIntervalMs: 300_000,   // 5 分钟
  //   timeoutMs: 10_000,
  //   rateLimit: 10,
  //   enabled: true,
  //   type: 'wire',
  // },

  // ── REST API 示例 ──────────────────────────────────────────────────────────
  // {
  //   id: 'my-api-source',
  //   name: '我的内部 API',
  //   sourceType: 'api',
  //   url: 'https://api.example.com/news/feed',
  //   topic: 'tech',
  //   lang: 'zh',
  //   priority: 3,
  //   pollIntervalMs: 600_000,   // 10 分钟
  //   timeoutMs: 15_000,
  //   rateLimit: 5,
  //   enabled: true,
  //   type: 'tech',
  // },

  // ── 网页抓取示例 ──────────────────────────────────────────────────────────
  // {
  //   id: 'custom-scrape-site',
  //   name: '自定义抓取站点',
  //   sourceType: 'scrape',
  //   url: '/api/rss-proxy?url=' + encodeURIComponent('https://example.com/news'),
  //   topic: 'politics',
  //   lang: 'zh',
  //   priority: 4,
  //   pollIntervalMs: 900_000,   // 15 分钟
  //   enabled: true,
  // },

  // ── 已停用示例（不进入抓取流程）─────────────────────────────────────────
  // {
  //   id: 'disabled-source',
  //   name: '已停用的测试源',
  //   sourceType: 'rss',
  //   url: 'https://example.com/rss',
  //   enabled: false,
  // },
];

// ─────────────────────────────────────────────
// 4. 导出已加载（且启用）的自定义源
// ─────────────────────────────────────────────

/** 经过校验和启用过滤的自定义 Feed 对象列表 */
export const LOADED_CUSTOM_FEEDS: Feed[] = loadCustomSources(CUSTOM_SOURCES);

/** 按 topic 分组的自定义源（供合并进 FEEDS 使用） */
export const CUSTOM_FEEDS_BY_TOPIC: Record<string, Feed[]> = groupCustomFeedsByTopic(LOADED_CUSTOM_FEEDS);
