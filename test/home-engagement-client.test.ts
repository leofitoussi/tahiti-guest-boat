// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { initializeHomeEngagement } from '../src/lib/home-engagement-client';
import { EXPERIMENT_DURATION_MS } from '../src/lib/home-experiment';

let dispose: ReturnType<typeof initializeHomeEngagement>;
let intersection: (entries: unknown[]) => void;
let focus = true;
let visible = true;
let events: Array<{ name: string; data: Record<string, string> }>;
const preview = (e: Event) => events.push((e as CustomEvent).detail);
const start = Date.parse('2026-11-22T17:34:00Z');
function consent(value: boolean) { localStorage.setItem('tgb_cookie_consent', JSON.stringify({ analytics: value, advertising: false, savedAt: Date.now() })); window.dispatchEvent(new Event('tgb:consent-changed')); }
function section(inView = true) { intersection([{ isIntersecting: inView, intersectionRect: { height: inView ? 150 : 0 }, boundingClientRect: { height: 600 } }]); }
async function advance(ms: number) { await vi.advanceTimersByTimeAsync(ms); }
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(start + 1000); focus = true; visible = true; events = [];
  localStorage.clear();
  vi.stubGlobal('location', { pathname: '/', hostname: 'preview.netlify.app' });
  vi.spyOn(document, 'hasFocus').mockImplementation(() => focus);
  vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visible ? 'visible' : 'hidden');
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  vi.stubGlobal('IntersectionObserver', class { constructor(cb: typeof intersection) { intersection = cb; } observe() {} disconnect() {} });
  document.body.innerHTML = `<script type="application/json" id="home-experiment-runtime">${JSON.stringify({ experiment: 'home-intro-v1', variant: 'B', start, end: start + EXPERIMENT_DURATION_MS, measure: false })}</script><main><div data-home-post-intro><section>gallery</section></div></main>`;
  window.addEventListener('tgb:home-experiment-preview', preview);
});
afterEach(() => { dispose?.(); window.removeEventListener('tgb:home-experiment-preview', preview); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('foreground attention for every native homepage visit', () => {
  it.each(['undecided', 'denied', 'granted'])('measures twenty seconds and a section with %s consent', async choice => {
    if (choice !== 'undecided') consent(choice === 'granted');
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const cookie = vi.spyOn(document, 'cookie', 'set');
    dispose = initializeHomeEngagement(); section(); await advance(19_999);
    expect(events).toHaveLength(0);
    await advance(1);
    expect(events).toEqual([{ name: 'home_intro_attention', data: { experiment: 'home-intro-v1', variant: 'B', viewport: 'desktop', active_ms: '20000', section_seen: 'true' } }]);
    expect(write).not.toHaveBeenCalled();
    if (choice !== 'granted') expect(cookie.mock.calls.every(([value]) => value.includes('Max-Age=0'))).toBe(true);
    dispose?.(); dispose = initializeHomeEngagement(); await advance(30_000);
    expect(events).toHaveLength(1);
  });
  it('does not mistake time alone for section visibility, and sends only the new section afterwards', async () => {
    dispose = initializeHomeEngagement(); await advance(20_000);
    expect(events[0]?.data).toMatchObject({ active_ms: '20000', section_seen: 'false' });
    section(); await advance(0);
    expect(events[1]?.data).toMatchObject({ active_ms: '0', section_seen: 'true' });
    section(); await advance(10_000); expect(events).toHaveLength(2);
  });
  it('excludes hidden and unfocused time', async () => {
    dispose = initializeHomeEngagement(); section(); await advance(10_000);
    visible = false; document.dispatchEvent(new Event('visibilitychange')); await advance(60_000);
    visible = true; focus = false; document.dispatchEvent(new Event('visibilitychange')); await advance(60_000);
    expect(events).toHaveLength(0);
    focus = true; window.dispatchEvent(new Event('focus')); await advance(9999);
    expect(events).toHaveLength(0); await advance(1); expect(events[0]?.data.active_ms).toBe('20000');
  });
  it('flushes partial time on exit without double-counting pagehide or a bfcache return', async () => {
    dispose = initializeHomeEngagement(); section(); await advance(10_000);
    window.dispatchEvent(new Event('pagehide')); window.dispatchEvent(new Event('pagehide'));
    await advance(30_000);
    expect(events.map(e => e.data.active_ms)).toEqual(['10000']);
    window.dispatchEvent(new Event('pageshow')); await advance(5_000);
    window.dispatchEvent(new Event('pagehide'));
    expect(events.map(e => e.data.active_ms)).toEqual(['10000', '5000']);
  });
  it('does not use storage for the timer and keeps measuring after consent is withdrawn', async () => {
    consent(true); dispose = initializeHomeEngagement(); section(); await advance(10_000);
    consent(false); await advance(10_000);
    expect(events[0]?.data.active_ms).toBe('20000');
    expect([...Array(localStorage.length)].map((_, i) => localStorage.key(i))).toEqual(['tgb_cookie_consent']);
  });
  it('respects the native opt-out and never accumulates opted-out time', async () => {
    localStorage.setItem('umami.disabled', '1'); dispose = initializeHomeEngagement(); section(); await advance(30_000);
    expect(events).toHaveLength(0);
    localStorage.removeItem('umami.disabled'); await advance(19_000); expect(events).toHaveLength(0);
    await advance(1_000); expect(events[0]?.data.active_ms).toBe('20000');
  });
  it('waits for a late tracker and sends a scrubbed native payload without consent', async () => {
    document.getElementById('home-experiment-runtime')!.textContent = document.getElementById('home-experiment-runtime')!.textContent!.replace('"measure":false', '"measure":true');
    vi.stubGlobal('location', { pathname: '/', hostname: 'tahitiguestboat.com' });
    dispose = initializeHomeEngagement(); section(); await advance(20_000);
    const track = vi.fn(callback => callback({ website: 'site', screen: '390x844', language: 'fr', tag: 'home-intro-v2:B', url: '/?private=value', referrer: 'https://example.com/?private=value', id: 'should-not-forward' }));
    vi.stubGlobal('umami', { track }); await advance(1_000);
    expect(track).toHaveBeenCalledTimes(1);
    const payload = track.mock.results[0].value;
    expect(payload).toMatchObject({ website: 'site', hostname: 'tahitiguestboat.com', url: '/', name: 'home_intro_attention', data: { active_ms: '20000', section_seen: 'true' } });
    expect(JSON.stringify(payload)).not.toMatch(/private|should-not-forward/);
  });
  it('never sends production data from preview and stops at the authorized end', async () => {
    const track = vi.fn(); vi.stubGlobal('umami', { track });
    dispose = initializeHomeEngagement(); section(); await advance(20_000);
    expect(track).not.toHaveBeenCalled();
    vi.setSystemTime(start + EXPERIMENT_DURATION_MS); await advance(1000);
    window.dispatchEvent(new Event('pagehide')); expect(events).toHaveLength(1);
  });
  it('does nothing on other pages or when the runtime is absent', async () => {
    document.getElementById('home-experiment-runtime')?.remove();
    const timer = vi.spyOn(window, 'setInterval');
    dispose = initializeHomeEngagement(); await advance(30_000);
    expect(timer).not.toHaveBeenCalled(); expect(events).toHaveLength(0);
  });
});
