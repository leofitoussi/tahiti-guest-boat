// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { initializeHomeEngagement } from '../src/lib/home-engagement-client';
import { EXPERIMENT_VISIT_KEY, EXPERIMENT_DURATION_MS } from '../src/lib/home-experiment';

let dispose: ReturnType<typeof initializeHomeEngagement>;
let intersection: (entries: unknown[]) => void;
let focus = true;
let visible = true;
let events: Array<{ name: string; data: Record<string, string> }>;
const preview = (e: Event) => events.push((e as CustomEvent).detail);
const start = Date.parse('2026-12-01T10:00:00Z');
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
  document.body.innerHTML = `<script type="application/json" id="home-experiment-runtime">${JSON.stringify({ experiment: 'home-intro-v1', variant: 'B', start, end: start + EXPERIMENT_DURATION_MS, measure: false })}</script><main><div data-home-post-intro><script></script><section>gallery</section></div></main>`;
  window.addEventListener('tgb:home-experiment-preview', preview);
});
afterEach(() => { dispose?.(); window.removeEventListener('tgb:home-experiment-preview', preview); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('engagement measured after real exposure', () => {
  it('requires both twenty foreground seconds and a real section, then sends only one event even after reload', async () => {
    consent(true); dispose = initializeHomeEngagement(); await advance(0);
    expect(events.map(e => e.name)).toEqual(['home_intro_exposed']);
    await advance(20_000); expect(events).toHaveLength(1);
    section(); await advance(0);
    expect(events[1]?.data.reason).toBe('20s_and_section');
    await advance(10_000); dispose?.(); dispose = initializeHomeEngagement(); await advance(10_000);
    expect(events.map(e => e.name)).toEqual(['home_intro_exposed', 'home_intro_engaged']);
  });
  it('does not count hidden or unfocused time and does not qualify on section visibility alone', async () => {
    consent(true); dispose = initializeHomeEngagement(); section(); await advance(10_000);
    visible = false; document.dispatchEvent(new Event('visibilitychange')); await advance(60_000);
    visible = true; focus = false; document.dispatchEvent(new Event('visibilitychange')); await advance(60_000);
    expect(events).toHaveLength(1);
    focus = true; window.dispatchEvent(new Event('focus')); await advance(9999);
    expect(events).toHaveLength(1); await advance(1001); expect(events[1]?.data.reason).toBe('20s_and_section');
  });
  it('qualifies on another actual page but not a home reload or an anchor', async () => {
    consent(true); dispose = initializeHomeEngagement(); await advance(0); dispose?.();
    dispose = initializeHomeEngagement(); await advance(0); expect(events).toHaveLength(1); dispose?.();
    document.getElementById('home-experiment-runtime')?.remove();
    vi.stubGlobal('location', { pathname: '/notre-bateau/', hostname: 'preview.netlify.app' });
    dispose = initializeHomeEngagement(); await advance(0);
    expect(events[1]?.data.reason).toBe('next_page');
    expect(events).toHaveLength(2);
  });
  it('collects nothing before consent or after revocation and never retroactively counts that time', async () => {
    dispose = initializeHomeEngagement(); section(); await advance(40_000);
    expect(events).toHaveLength(0); expect(localStorage.getItem(EXPERIMENT_VISIT_KEY)).toBeNull();
    consent(true); await advance(0); await advance(10_000); expect(events).toHaveLength(1);
    consent(false); await advance(20_000); expect(events).toHaveLength(1);
    expect(localStorage.getItem(EXPERIMENT_VISIT_KEY)).toBeNull();
  });
  it('never calls production Umami from preview and stops after fourteen days', async () => {
    const track = vi.fn(); vi.stubGlobal('umami', { track });
    consent(true); dispose = initializeHomeEngagement(); section(); await advance(20_000);
    expect(track).not.toHaveBeenCalled();
    vi.setSystemTime(start + EXPERIMENT_DURATION_MS); await advance(1000);
    expect(localStorage.getItem(EXPERIMENT_VISIT_KEY)).toBeNull();
  });
  it('waits for a late tracker and deduplicates next-page engagement across repeated initialization', async () => {
    const runtime = document.getElementById('home-experiment-runtime')!;
    runtime.textContent = runtime.textContent!.replace('"measure":false', '"measure":true');
    vi.stubGlobal('location', { pathname: '/', hostname: 'tahitiguestboat.com' });
    consent(true); dispose = initializeHomeEngagement(); await advance(2000);
    expect(JSON.parse(localStorage.getItem(EXPERIMENT_VISIT_KEY)!).exposed).toBe(false);
    const track = vi.fn(); vi.stubGlobal('umami', { track }); await advance(1000);
    expect(track).toHaveBeenCalledTimes(1); dispose?.();
    runtime.remove(); vi.stubGlobal('location', { pathname: '/nos-croisieres/', hostname: 'tahitiguestboat.com' });
    dispose = initializeHomeEngagement(); await advance(0); expect(track).toHaveBeenCalledTimes(2);
    dispose?.(); dispose = initializeHomeEngagement(); await advance(0); expect(track).toHaveBeenCalledTimes(2);
  });
  it('expires an idle visit without discarding the fourteen-day assignment for a consented returning visitor', async () => {
    consent(true); dispose = initializeHomeEngagement(); await advance(0); dispose?.();
    vi.setSystemTime(start + 31 * 60_000);
    document.getElementById('home-experiment-runtime')?.remove();
    vi.stubGlobal('location', { pathname: '/notre-bateau/', hostname: 'preview.netlify.app' });
    const cookie = vi.spyOn(document, 'cookie', 'set');
    dispose = initializeHomeEngagement(); await advance(0);
    expect(localStorage.getItem(EXPERIMENT_VISIT_KEY)).toBeNull();
    expect(cookie).not.toHaveBeenCalled();
    expect(events).toHaveLength(1);
  });
});
