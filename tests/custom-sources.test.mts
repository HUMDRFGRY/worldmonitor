/**
 * 自定义消息源配置单元测试
 *
 * 运行方式：npm run test:data
 *
 * 覆盖场景：
 *  1. 合法配置可正常加载
 *  2. 缺失必要字段时报错
 *  3. disabled 源不进入抓取流程
 *  4. 字段类型非法时报错
 *  5. 重复 id 的第二条记录被跳过
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ---------------------------------------------------------------------------
// 由于测试运行在 Node.js（不支持 path alias @/），我们直接 import 相对路径。
// ---------------------------------------------------------------------------
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 使用动态 import（以支持 TypeScript 通过 tsx 运行）
const { validateCustomSource, loadCustomSources } = await import(
  resolve(__dirname, '../src/config/custom-sources.ts')
);

// ─────────────────────────────────────────────────────────────
// 辅助：构造一条最简合法配置
// ─────────────────────────────────────────────────────────────
function minimal(overrides = {}) {
  return {
    id: 'test-source',
    name: '测试源',
    sourceType: 'rss',
    url: 'https://example.com/rss',
    enabled: true,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────
describe('validateCustomSource — 合法配置', () => {
  it('最简 RSS 配置应通过校验', () => {
    const result = validateCustomSource(minimal());
    assert.equal(result.valid, true, `预期通过，但报错：${result.errors.join(', ')}`);
    assert.deepEqual(result.errors, []);
  });

  it('完整配置（含所有可选字段）应通过校验', () => {
    const full = minimal({
      id: 'full-source',
      name: '完整配置示例',
      sourceType: 'api',
      url: 'https://api.example.com/feed',
      topic: 'tech',
      region: 'asia',
      lang: 'zh',
      priority: 2,
      pollIntervalMs: 300_000,
      timeoutMs: 10_000,
      rateLimit: 20,
      enabled: true,
      type: 'mainstream',
      propagandaRisk: 'low',
      stateAffiliated: undefined,
    });
    const result = validateCustomSource(full);
    assert.equal(result.valid, true, `预期通过，但报错：${result.errors.join(', ')}`);
  });

  it('enabled: false 的配置本身应通过校验', () => {
    const result = validateCustomSource(minimal({ enabled: false }));
    assert.equal(result.valid, true);
  });

  it('url 为多语言映射对象时应通过校验', () => {
    const result = validateCustomSource(minimal({
      url: { en: 'https://example.com/en/rss', zh: 'https://example.com/zh/rss' },
    }));
    assert.equal(result.valid, true);
  });
});

// ─────────────────────────────────────────────────────────────
describe('validateCustomSource — 缺失必要字段', () => {
  it('缺少 id 时应报错', () => {
    const result = validateCustomSource(minimal({ id: undefined }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('id')), `报错中未提及 id：${result.errors}`);
  });

  it('id 为空字符串时应报错', () => {
    const result = validateCustomSource(minimal({ id: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('id')));
  });

  it('id 含非法字符时应报错', () => {
    const result = validateCustomSource(minimal({ id: 'invalid id!' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('id')));
  });

  it('缺少 name 时应报错', () => {
    const result = validateCustomSource(minimal({ name: undefined }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('name')));
  });

  it('缺少 sourceType 时应报错', () => {
    const result = validateCustomSource(minimal({ sourceType: undefined }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('sourceType')));
  });

  it('sourceType 值非法时应报错', () => {
    const result = validateCustomSource(minimal({ sourceType: 'webhook' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('sourceType')));
  });

  it('缺少 url 时应报错', () => {
    const result = validateCustomSource(minimal({ url: undefined }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('url')));
  });

  it('url 为空字符串时应报错', () => {
    const result = validateCustomSource(minimal({ url: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('url')));
  });

  it('配置项为 null 时应报错', () => {
    const result = validateCustomSource(null);
    assert.equal(result.valid, false);
  });

  it('配置项为非对象时应报错', () => {
    const result = validateCustomSource('not-an-object');
    assert.equal(result.valid, false);
  });
});

// ─────────────────────────────────────────────────────────────
describe('validateCustomSource — 可选字段类型校验', () => {
  it('priority 为负数时应报错', () => {
    const result = validateCustomSource(minimal({ priority: -1 }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('priority')));
  });

  it('pollIntervalMs 小于 1000 时应报错', () => {
    const result = validateCustomSource(minimal({ pollIntervalMs: 500 }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('pollIntervalMs')));
  });

  it('timeoutMs 小于 500 时应报错', () => {
    const result = validateCustomSource(minimal({ timeoutMs: 100 }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('timeoutMs')));
  });

  it('rateLimit 为 0 时应报错', () => {
    const result = validateCustomSource(minimal({ rateLimit: 0 }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('rateLimit')));
  });

  it('enabled 为字符串时应报错', () => {
    const result = validateCustomSource(minimal({ enabled: 'yes' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('enabled')));
  });

  it('propagandaRisk 值非法时应报错', () => {
    const result = validateCustomSource(minimal({ propagandaRisk: 'extreme' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('propagandaRisk')));
  });
});

// ─────────────────────────────────────────────────────────────
describe('loadCustomSources — 批量加载与过滤', () => {
  it('合法且启用的源应被加载', () => {
    const feeds = loadCustomSources([minimal({ id: 'enabled-src' })]);
    assert.equal(feeds.length, 1);
    assert.equal(feeds[0].id, 'enabled-src');
    assert.equal(feeds[0].name, '测试源');
  });

  it('disabled 源（enabled: false）不应进入加载结果', () => {
    const feeds = loadCustomSources([
      minimal({ id: 'active-src', enabled: true }),
      minimal({ id: 'disabled-src', enabled: false }),
    ]);
    assert.equal(feeds.length, 1);
    assert.equal(feeds[0].id, 'active-src');
  });

  it('无效配置被跳过，不影响合法源加载', () => {
    const feeds = loadCustomSources([
      { id: '', name: '', sourceType: 'rss', url: '' }, // 无效
      minimal({ id: 'valid-src' }),                      // 合法
    ]);
    assert.equal(feeds.length, 1);
    assert.equal(feeds[0].id, 'valid-src');
  });

  it('空数组应返回空数组', () => {
    const feeds = loadCustomSources([]);
    assert.deepEqual(feeds, []);
  });

  it('重复 id 的第二条记录应被跳过', () => {
    const feeds = loadCustomSources([
      minimal({ id: 'dup-id', name: '第一条' }),
      minimal({ id: 'dup-id', name: '第二条' }),
    ]);
    assert.equal(feeds.length, 1);
    assert.equal(feeds[0].name, '第一条');
  });

  it('多条合法源应全部加载', () => {
    const feeds = loadCustomSources([
      minimal({ id: 'src-1', name: '源一' }),
      minimal({ id: 'src-2', name: '源二', sourceType: 'api' }),
      minimal({ id: 'src-3', name: '源三', sourceType: 'scrape' }),
    ]);
    assert.equal(feeds.length, 3);
  });
});
