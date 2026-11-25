import { describe, expect, it, vi, afterEach } from 'vitest';
import { chooseHomeVariant, experimentWindow, parseVariantCookie, sanitizeHomeExperimentEvent, EXPERIMENT_DURATION_MS } from '../src/lib/home-experiment';
import handler from '../netlify/edge-functions/home-intro-test.js';
import { HOME_INTRO_TEST_START } from '../netlify/lib/home-experiment-schedule.mjs';

const start = Date.parse('2026-12-01T10:00:00Z');
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('fourteen-day home experiment', () => {
  it('requires a start, has a half-open fourteen-day window and a 50/50 split', () => {
    expect(experimentWindow('', start)).toBeNull();
    expect(experimentWindow('bad date', start)).toBeNull();
    expect(experimentWindow(new Date(start).toISOString(), start - 1)).toBeNull();
    expect(experimentWindow(new Date(start).toISOString(), start)).toEqual({ start, end: start + EXPERIMENT_DURATION_MS });
    expect(EXPERIMENT_DURATION_MS).toBe(14 * 86400000);
    expect(experimentWindow(new Date(start).toISOString(), start + 7 * 86400000)).not.toBeNull();
    expect(experimentWindow(new Date(start).toISOString(), start + EXPERIMENT_DURATION_MS - 1)).not.toBeNull();
    expect(experimentWindow(new Date(start).toISOString(), start + EXPERIMENT_DURATION_MS)).toBeNull();
    expect(Array.from({ length: 1000 }, (_, i) => chooseHomeVariant(i / 1000)).filter(v => v === 'A')).toHaveLength(500);
    expect(chooseHomeVariant(.5)).toBe('B');
    expect(parseVariantCookie(`B.${start + EXPERIMENT_DURATION_MS}`, start + EXPERIMENT_DURATION_MS)).toBe('B');
    expect(parseVariantCookie(`B.${start}`, start + EXPERIMENT_DURATION_MS)).toBeNull();
  });
  it('only allows bounded experiment event properties', () => {
    expect(sanitizeHomeExperimentEvent('home_intro_engaged', { experiment: 'home-intro-v1', variant: 'B', viewport: 'mobile', reason: '20s_and_section', email: 'private' })).toEqual({ experiment: 'home-intro-v1', variant: 'B', viewport: 'mobile', reason: '20s_and_section' });
    expect(sanitizeHomeExperimentEvent('home_intro_engaged', { experiment: 'home-intro-v1', variant: 'B', viewport: 'mobile', reason: 'timer_only' })).toBeNull();
  });
});
function context(cookie?: string, production = true) {
  return { deploy: { context: production ? 'production' : 'deploy-preview', published: production },
    cookies: { get: () => cookie }, next: vi.fn(async () => new Response('<html><head></head><body><main data-home-experiment-variant="A">original</main></body></html>', { headers: { 'content-type': 'text/html', etag: 'old' } })) };
}
function setup() {
  vi.spyOn(Date, 'now').mockReturnValue(start + 1000);
  vi.stubGlobal('Netlify', { env: { get: () => new Date(start).toISOString() } });
}
describe('edge routing', () => {
  it('uses the release schedule without a Netlify variable and stops exactly fourteen days later', async () => {
    const releaseStart = Date.parse(HOME_INTRO_TEST_START);
    vi.stubGlobal('Netlify', { env: { get: () => undefined } });
    vi.spyOn(Date, 'now').mockReturnValue(releaseStart);
    const res = await handler(new Request('https://tahitiguestboat.com/'), context(`A.${releaseStart + EXPERIMENT_DURATION_MS}`));
    expect(res?.headers.get('x-tgb-home-variant')).toBe('A');
    vi.spyOn(Date, 'now').mockReturnValue(releaseStart + EXPERIMENT_DURATION_MS);
    expect(await handler(new Request('https://tahitiguestboat.com/'), context())).toBeUndefined();
  });
  it('marks production verification traffic for exclusion from the experiment report', async () => {
    setup();
    const res = await handler(new Request('https://tahitiguestboat.com/?home_test_qa=1'), context(`A.${start + EXPERIMENT_DURATION_MS}`));
    expect(await res?.text()).toContain('"qa":true');
  });
  it('keeps the public URL, injects the actually rendered A, prevents caching and writes no cookie before consent', async () => {
    setup(); const c = context(`A.${start + EXPERIMENT_DURATION_MS}`);
    const res = await handler(new Request('https://tahitiguestboat.com/'), c);
    expect(res?.headers.get('x-tgb-home-variant')).toBe('A');
    expect(res?.headers.get('cache-control')).toBe('private, no-store');
    expect(res?.headers.get('set-cookie')).toBeNull();
    expect(res?.headers.get('etag')).toBeNull();
    expect(await res?.text()).toContain('"measure":true');
  });
  it('fetches B without forwarding campaign queries, cookies or authorization and strips internal noindex on public home', async () => {
    setup(); const c = context(`B.${start + EXPERIMENT_DURATION_MS}`);
    const fetch = vi.fn(async (_url: URL) => new Response('<html><head></head><main data-home-experiment-variant="B"></main></html>', { headers: { 'content-type': 'text/html', 'x-robots-tag': 'noindex' } }));
    vi.stubGlobal('fetch', fetch);
    const res = await handler(new Request('https://tahitiguestboat.com/?utm_campaign=test'), c);
    expect(String(fetch.mock.calls[0][0])).toBe('https://tahitiguestboat.com/home-experiment/b/index.html');
    expect(res?.headers.get('x-tgb-home-variant')).toBe('B');
    expect(res?.headers.get('x-robots-tag')).toBeNull();
  });
  it('does not split before/after the experiment, on English pages, bots, unpublished production URLs, or an ordinary preview', async () => {
    setup();
    for (const url of ['https://tahitiguestboat.com/en/', 'https://preview.netlify.app/']) {
      expect(await handler(new Request(url), context())).toBeUndefined();
    }
    expect(await handler(new Request('https://tahitiguestboat.com/', { headers: { 'user-agent': 'Googlebot' } }), context())).toBeUndefined();
    expect(await handler(new Request('https://preview.netlify.app/'), context(undefined, false))).toBeUndefined();
    vi.spyOn(Date, 'now').mockReturnValue(start + EXPERIMENT_DURATION_MS);
    expect(await handler(new Request('https://tahitiguestboat.com/'), context())).toBeUndefined();
  });
  it('allows forced preview QA without sending measurement, and noindexes direct internal URLs', async () => {
    setup(); const c = context(undefined, false);
    const res = await handler(new Request('https://preview.netlify.app/?home_test=1&variant=A'), c);
    expect(await res?.text()).toContain('"measure":false');
    const internal = await handler(new Request('https://preview.netlify.app/home-experiment/b/'), c);
    expect(internal?.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
  it('falls back to the original if the B asset is absent', async () => {
    setup(); vi.stubGlobal('fetch', vi.fn(async () => new Response('missing', { status: 404 })));
    expect(await handler(new Request('https://tahitiguestboat.com/'), context(`B.${start + EXPERIMENT_DURATION_MS}`))).toBeUndefined();
  });
});
