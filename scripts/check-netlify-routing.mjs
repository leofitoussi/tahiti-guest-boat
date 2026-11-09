import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

// Run against a real Netlify deploy: Astro preview cannot reproduce CDN routing.
// GET only, including the webhook's method guard; never submits a booking.
const [baseUrl, reportPath] = process.argv.slice(2);
if (!baseUrl) throw new Error('Usage: node scripts/check-netlify-routing.mjs <origin> [report.json]');
const origin = new URL(baseUrl).origin;
const results = [];

async function trace(path) {
  let url = new URL(path, origin);
  const chain = [];
  const visited = new Set();
  while (true) {
    assert.equal(url.origin, origin, 'Redirect must stay on the tested deploy');
    assert.ok(!visited.has(url.href), `Redirect loop: ${url.pathname}`);
    visited.add(url.href);
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20_000) });
    const location = response.headers.get('location');
    chain.push({ path: url.pathname + url.search, status: response.status, location });
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel();
      assert.ok(chain.length <= 2, 'Too many redirects');
      url = new URL(location, url);
      continue;
    }
    return { chain, response, url };
  }
}

async function check(path, status, { locale, target = path, redirects = 0, query } = {}) {
  const result = { path, expectedStatus: status };
  try {
    const { chain, response, url } = await trace(path);
    result.chain = chain;
    assert.equal(response.status, status);
    assert.equal(chain.length - 1, redirects, 'Unexpected redirect count');
    assert.equal(url.pathname, new URL(target, origin).pathname);
    if (query) assert.equal(url.search, query, 'Query string must survive normalization');
    if (redirects) assert.ok([301, 308].includes(chain[0].status), 'Redirect must be permanent');
    const body = await response.text();
    if (locale) {
      assert.match(body, new RegExp(`<html\\b[^>]*lang=["']${locale}["']`));
      if (status === 404) assert.match(body, /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/);
    }
    result.passed = true;
    console.log(`PASS ${path} ${chain.map(step => step.status).join(' → ')}`);
    return body;
  } catch (error) {
    result.passed = false;
    result.error = error.message;
    console.error(`FAIL ${path}: ${error.message}`);
  } finally {
    results.push(result);
  }
}

for (const path of [
  '/not-a-real-page-seo-audit', '/not-a-real-page-seo-audit/',
  '/not-a-real-page-seo-audit//', '/blog/tgb55-missing', '/blog/tgb55-missing/',
  '/mentions-legales/', '/carte/', '/blog/guide-croisiere-tuamotu/',
  '/en/tgb55-missing', '/en/tgb55-missing/',
  '/en/blog/tgb55-missing', '/en/blog/tgb55-missing/',
]) await check(path, 404, { locale: path.startsWith('/en/') ? 'en' : 'fr' });

// All currently published pages, discovered from this deploy's sitemap.
// Keep requests on this origin even when the preview sitemap uses production URLs.
const index = await check('/sitemap_index.xml', 200);
assert.ok(index, 'Sitemap index unavailable');
const locs = xml => [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(match => new URL(match[1]).pathname);
const pages = new Set();
for (const path of locs(index)) {
  const sitemap = await check(path, 200);
  assert.ok(sitemap, `Sitemap unavailable: ${path}`);
  for (const page of locs(sitemap)) pages.add(page);
}
assert.ok(pages.size > 0, 'Empty sitemap');
for (const page of pages) {
  assert.ok(page.endsWith('/'), `Noncanonical sitemap path: ${page}`);
  await check(page, 200, { locale: page.startsWith('/en/') ? 'en' : 'fr' });
  if (page !== '/') await check(page.slice(0, -1), 200, { target: page, redirects: 1 });
}

await check('/contact?tgb55=slash', 200, { target: '/contact/', redirects: 1, query: '?tgb55=slash' });
await check('/category/blog/', 200, { target: '/blog/', redirects: 1 });
await check('/prototype/language-notification', 404, { locale: 'fr' });
await check('/prototype/language-notification/nested/', 404, { locale: 'fr' });
for (const path of ['/robots.txt', '/llms.txt', '/en/llms.txt', '/images/cruise-intro/namaka.svg', '/images/icone-tahiti-guest-boat.webp']) await check(path, 200);
const homepage = await check('/', 200, { locale: 'fr' });
const asset = homepage?.match(/(?:src|href)=["'](\/_astro\/[^"']+\.(?:css|js))["']/)?.[1];
assert.ok(asset, 'No generated CSS/JS asset found');
await check(asset, 200);
await check('/api/tally-webhook', 405);

const report = { origin, checkedAt: new Date().toISOString(), passed: results.every(result => result.passed), results };
if (reportPath) await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(`${results.filter(result => result.passed).length}/${results.length} routing checks passed`);
if (!report.passed) process.exitCode = 1;
