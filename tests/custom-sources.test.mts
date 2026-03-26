/**
 * 自定义消息源配置校验测试
 *
 * 验证：
 *   1. 合法源配置可正常加载
 *   2. 缺少必要字段时抛出含中文错误说明的异常
 *   3. disabled 源不进入抓取流程（getEnabledCustomSources 返回空）
 *   4. 所有内置示例源均通过校验（模块加载时已校验）
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCustomSource,
  getEnabledCustomSources,
  customSourceToFeed,
  CUSTOM_SOURCES,
  CustomSourceValidationError,
} from '../src/config/custom-sources.ts';

// ======================================================================
// 1. validateCustomSource — 合法配置
// ======================================================================

describe('validateCustomSource — 合法配置', () => {
  it('接受最小合法 RSS 源配置', () => {
    const src = validateCustomSource({
      id: 'test-rss',
      name: 'Test RSS Feed',
      type: 'rss',
      url: 'https://example.com/feed.xml',
      enabled: true,
    });
    assert.equal(src.id, 'test-rss');
    assert.equal(src.name, 'Test RSS Feed');
    assert.equal(src.type, 'rss');
    assert.equal(src.enabled, true);
    assert.equal(src.region, undefined);
    assert.equal(src.priority, undefined);
  });

  it('接受 atom 类型源', () => {
    const src = validateCustomSource({
      id: 'test-atom',
      name: 'Test Atom',
      type: 'atom',
      url: 'https://example.com/atom.xml',
      enabled: false,
    });
    assert.equal(src.type, 'atom');
  });

  it('接受 api 类型源', () => {
    const src = validateCustomSource({
      id: 'test-api',
      name: 'Test API',
      type: 'api',
      url: 'https://api.example.com/news',
      enabled: false,
    });
    assert.equal(src.type, 'api');
  });

  it('接受 scrape 类型源', () => {
    const src = validateCustomSource({
      id: 'test-scrape',
      name: 'Test Scrape',
      type: 'scrape',
      url: 'https://example.com/news',
      enabled: false,
    });
    assert.equal(src.type, 'scrape');
  });

  it('接受包含所有可选字段的完整配置', () => {
    const src = validateCustomSource({
      id: 'full-source',
      name: 'Full Source',
      type: 'rss',
      url: 'https://example.com/feed.xml',
      region: 'asia',
      topic: 'tech',
      language: 'en',
      priority: 2,
      pollInterval: 900,
      timeout: 8000,
      rateLimit: 5,
      enabled: true,
      propagandaRisk: 'low',
      stateAffiliated: '测试国',
    });
    assert.equal(src.region, 'asia');
    assert.equal(src.topic, 'tech');
    assert.equal(src.language, 'en');
    assert.equal(src.priority, 2);
    assert.equal(src.pollInterval, 900);
    assert.equal(src.timeout, 8000);
    assert.equal(src.rateLimit, 5);
    assert.equal(src.propagandaRisk, 'low');
    assert.equal(src.stateAffiliated, '测试国');
  });

  it('接受 priority 为 1、2、3、4 的所有合法值', () => {
    for (const priority of [1, 2, 3, 4] as const) {
      const src = validateCustomSource({
        id: `p${priority}`,
        name: `Priority ${priority}`,
        type: 'rss',
        url: 'https://example.com/feed.xml',
        priority,
        enabled: false,
      });
      assert.equal(src.priority, priority);
    }
  });

  it('接受 propagandaRisk 为 low / medium / high', () => {
    for (const risk of ['low', 'medium', 'high'] as const) {
      const src = validateCustomSource({
        id: `risk-${risk}`,
        name: `Risk ${risk}`,
        type: 'rss',
        url: 'https://example.com/feed.xml',
        propagandaRisk: risk,
        enabled: false,
      });
      assert.equal(src.propagandaRisk, risk);
    }
  });
});

// ======================================================================
// 2. validateCustomSource — 缺少必要字段时报错
// ======================================================================

describe('validateCustomSource — 缺少必要字段时报错', () => {
  const base = {
    id: 'test',
    name: 'Test',
    type: 'rss',
    url: 'https://example.com/feed.xml',
    enabled: true,
  };

  it('非对象时抛出错误', () => {
    for (const bad of [null, undefined, 'string', 42, []]) {
      assert.throws(
        () => validateCustomSource(bad),
        (err: unknown) => {
          assert.ok(err instanceof CustomSourceValidationError, '应为 CustomSourceValidationError');
          assert.ok((err as Error).message.includes('对象'), `消息应含"对象"：${(err as Error).message}`);
          return true;
        },
      );
    }
  });

  it('缺少 id 时报错', () => {
    const { id: _id, ...rest } = base;
    assert.throws(
      () => validateCustomSource(rest),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('"id"'), `消息应含 "id"：${(err as Error).message}`);
        return true;
      },
    );
  });

  it('id 含大写字母时报格式无效错误', () => {
    assert.throws(
      () => validateCustomSource({ ...base, id: 'MyFeed' }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('格式无效'), `消息应含"格式无效"：${(err as Error).message}`);
        return true;
      },
    );
  });

  it('id 含空格时报格式无效错误', () => {
    assert.throws(
      () => validateCustomSource({ ...base, id: 'my feed' }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('格式无效'));
        return true;
      },
    );
  });

  it('缺少 name 时报错', () => {
    const { name: _name, ...rest } = base;
    assert.throws(
      () => validateCustomSource(rest),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('"name"'));
        return true;
      },
    );
  });

  it('type 为无效值时报错', () => {
    assert.throws(
      () => validateCustomSource({ ...base, type: 'html' }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('type'));
        return true;
      },
    );
  });

  it('缺少 url 时报错', () => {
    const { url: _url, ...rest } = base;
    assert.throws(
      () => validateCustomSource(rest),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('"url"'));
        return true;
      },
    );
  });

  it('url 不是合法 URL 时报错', () => {
    assert.throws(
      () => validateCustomSource({ ...base, url: 'not-a-url' }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('合法的 URL'));
        return true;
      },
    );
  });

  it('url 为相对路径时报错', () => {
    assert.throws(
      () => validateCustomSource({ ...base, url: '/relative/path' }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('合法的 URL'));
        return true;
      },
    );
  });

  it('缺少 enabled 时报错', () => {
    const { enabled: _enabled, ...rest } = base;
    assert.throws(
      () => validateCustomSource(rest),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('"enabled"'));
        return true;
      },
    );
  });

  it('priority 为 5 时报错', () => {
    assert.throws(
      () => validateCustomSource({ ...base, priority: 5 }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('priority'));
        return true;
      },
    );
  });

  it('priority 为 0 时报错', () => {
    assert.throws(
      () => validateCustomSource({ ...base, priority: 0 }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('priority'));
        return true;
      },
    );
  });

  it('pollInterval 为负数时报错', () => {
    assert.throws(
      () => validateCustomSource({ ...base, pollInterval: -1 }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('pollInterval'));
        return true;
      },
    );
  });

  it('pollInterval 为小数时报错', () => {
    assert.throws(
      () => validateCustomSource({ ...base, pollInterval: 30.5 }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('pollInterval'));
        return true;
      },
    );
  });

  it('timeout 为 0 时报错', () => {
    assert.throws(
      () => validateCustomSource({ ...base, timeout: 0 }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('timeout'));
        return true;
      },
    );
  });

  it('rateLimit 为字符串时报错', () => {
    assert.throws(
      () => validateCustomSource({ ...base, rateLimit: '10' }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('rateLimit'));
        return true;
      },
    );
  });

  it('propagandaRisk 为无效值时报错', () => {
    assert.throws(
      () => validateCustomSource({ ...base, propagandaRisk: 'extreme' }),
      (err: unknown) => {
        assert.ok(err instanceof CustomSourceValidationError);
        assert.ok((err as Error).message.includes('propagandaRisk'));
        return true;
      },
    );
  });

  it('错误消息均为中文', () => {
    const cases = [
      { ...base, id: undefined },
      { ...base, name: undefined },
      { ...base, type: 'bad' },
      { ...base, url: 'not-url' },
      { ...base, enabled: undefined },
    ];
    for (const bad of cases) {
      try {
        validateCustomSource(bad);
        assert.fail('应该抛出异常');
      } catch (err) {
        assert.ok(err instanceof CustomSourceValidationError);
        // 中文字符的 Unicode 范围检测
        assert.ok(
          /[\u4e00-\u9fa5]/.test((err as Error).message),
          `错误消息应含中文：${(err as Error).message}`,
        );
      }
    }
  });
});

// ======================================================================
// 3. getEnabledCustomSources — disabled 源不进入抓取流程
// ======================================================================

describe('getEnabledCustomSources — disabled 源不进入抓取流程', () => {
  it('返回的每条源 enabled 均为 true', () => {
    const enabled = getEnabledCustomSources();
    for (const src of enabled) {
      assert.equal(src.enabled, true, `源 "${src.id}" 的 enabled 应为 true`);
    }
  });

  it('disabled 源不出现在返回列表中', () => {
    const disabled = CUSTOM_SOURCES.filter((src) => !src.enabled);
    const enabled = getEnabledCustomSources();
    const enabledIds = new Set(enabled.map((s) => s.id));
    for (const src of disabled) {
      assert.ok(!enabledIds.has(src.id), `disabled 源 "${src.id}" 不应出现在抓取列表中`);
    }
  });

  it('所有内置示例源均为 disabled（示例不应自动启用）', () => {
    // 内置示例源均设置 enabled: false，防止用户未配置就自动抓取
    const enabled = getEnabledCustomSources();
    assert.equal(
      enabled.length,
      0,
      `内置示例源应全部禁用，但发现 ${enabled.length} 条已启用`,
    );
  });
});

// ======================================================================
// 4. CUSTOM_SOURCES — 内置示例源完整性
// ======================================================================

describe('CUSTOM_SOURCES — 内置示例源完整性', () => {
  it('导出数组且长度 >= 3（含三类示例源）', () => {
    assert.ok(Array.isArray(CUSTOM_SOURCES), 'CUSTOM_SOURCES 应为数组');
    assert.ok(CUSTOM_SOURCES.length >= 3, `应至少包含 3 条示例源，实际：${CUSTOM_SOURCES.length}`);
  });

  it('包含 rss 类型示例', () => {
    assert.ok(CUSTOM_SOURCES.some((s) => s.type === 'rss'), '应包含 rss 类型示例源');
  });

  it('包含 api 类型示例', () => {
    assert.ok(CUSTOM_SOURCES.some((s) => s.type === 'api'), '应包含 api 类型示例源');
  });

  it('包含 scrape 类型示例', () => {
    assert.ok(CUSTOM_SOURCES.some((s) => s.type === 'scrape'), '应包含 scrape 类型示例源');
  });

  it('每条源的 id 唯一', () => {
    const ids = CUSTOM_SOURCES.map((s) => s.id);
    const unique = new Set(ids);
    assert.equal(unique.size, ids.length, `发现重复 id：${ids.filter((id, i) => ids.indexOf(id) !== i)}`);
  });

  it('每条源均已通过 validateCustomSource 校验（模块加载时校验）', () => {
    for (const src of CUSTOM_SOURCES) {
      assert.ok(typeof src.id === 'string' && src.id.length > 0, `源 id 应为非空字符串`);
      assert.ok(typeof src.name === 'string' && src.name.length > 0, `源 name 应为非空字符串`);
      assert.ok(['rss', 'atom', 'api', 'scrape'].includes(src.type), `源 type 应合法`);
      assert.ok(typeof src.url === 'string' && src.url.startsWith('http'), `源 url 应为合法 URL`);
      assert.ok(typeof src.enabled === 'boolean', `源 enabled 应为布尔值`);
    }
  });
});

// ======================================================================
// 5. customSourceToFeed — Feed 类型转换
// ======================================================================

describe('customSourceToFeed — Feed 类型转换', () => {
  it('rss 源 URL 通过 RSS 代理路由', () => {
    const src = validateCustomSource({
      id: 'proxy-test',
      name: 'Proxy Test',
      type: 'rss',
      url: 'https://example.com/feed.xml',
      enabled: true,
    });
    const feed = customSourceToFeed(src);
    assert.ok(
      feed.url.toString().startsWith('/api/rss-proxy?url='),
      `rss 类型 URL 应通过代理：${feed.url}`,
    );
  });

  it('atom 源 URL 通过 RSS 代理路由', () => {
    const src = validateCustomSource({
      id: 'atom-proxy',
      name: 'Atom Proxy',
      type: 'atom',
      url: 'https://example.com/atom.xml',
      enabled: true,
    });
    const feed = customSourceToFeed(src);
    assert.ok(feed.url.toString().startsWith('/api/rss-proxy?url='));
  });

  it('api 源 URL 不经过代理（直接使用原始 URL）', () => {
    const src = validateCustomSource({
      id: 'api-direct',
      name: 'API Direct',
      type: 'api',
      url: 'https://api.example.com/news',
      enabled: true,
    });
    const feed = customSourceToFeed(src);
    assert.equal(feed.url, 'https://api.example.com/news');
  });

  it('字段正确映射到 Feed 对象', () => {
    const src = validateCustomSource({
      id: 'mapping-test',
      name: 'Mapping Test',
      type: 'rss',
      url: 'https://example.com/feed.xml',
      region: 'europe',
      language: 'fr',
      propagandaRisk: 'medium',
      stateAffiliated: '法国',
      enabled: true,
    });
    const feed = customSourceToFeed(src);
    assert.equal(feed.name, 'Mapping Test');
    assert.equal(feed.region, 'europe');
    assert.equal(feed.lang, 'fr');
    assert.equal(feed.propagandaRisk, 'medium');
    assert.equal(feed.stateAffiliated, '法国');
  });
});
