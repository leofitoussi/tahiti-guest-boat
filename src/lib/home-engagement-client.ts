import { readStoredConsent } from './cookie-consent';
import { HOME_EXPERIMENT, HOME_VARIANT_COOKIE, EXPERIMENT_VISIT_KEY, ENGAGEMENT_MS, EXPERIMENT_DURATION_MS, type ExperimentRuntime } from './home-experiment';

type Payload = Record<string, unknown>;
type TrackedWindow = Window & { umami?: { track: (payload: (defaults: Payload) => Payload) => unknown } };
interface Attention {
  activeMs: number;
  sentMs: number;
  sectionSeen: boolean;
  sentSection: boolean;
}
// Only page memory. A reload gets a new state; Umami joins the received deltas
// to its existing visit on the server. Reinitializing the same document cannot
// resend the same time or section signal.
const attention = new WeakMap<Element, Attention>();

export function initializeHomeEngagement() {
  if (location.pathname !== '/') return;
  const element = document.getElementById('home-experiment-runtime');
  let runtime: ExperimentRuntime | null = null;
  try { runtime = JSON.parse(element?.textContent ?? 'null'); } catch { return; }
  const valid = (value: ExperimentRuntime | null): value is ExperimentRuntime => !!value
    && value.experiment === HOME_EXPERIMENT && ['A', 'B'].includes(value.variant)
    && Number.isFinite(value.start) && value.end === value.start + EXPERIMENT_DURATION_MS
    && Date.now() >= value.start && Date.now() < value.end && typeof value.measure === 'boolean';
  if (!element || !valid(runtime)) return;
  const visit = runtime;
  if (visit.measure && !['tahitiguestboat.com', 'www.tahitiguestboat.com'].includes(location.hostname)) return;
  try { localStorage.removeItem(EXPERIMENT_VISIT_KEY); } catch { /* obsolete visit storage may be blocked */ }
  const state = attention.get(element) ?? { activeMs: 0, sentMs: 0, sectionSeen: false, sentSection: false };
  attention.set(element, state);
  const viewport = matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
  let disposed = false;
  let frozen = false;
  let sectionVisible = false;
  let lastTick = performance.now();
  const foreground = () => !frozen && document.visibilityState === 'visible' && document.hasFocus();
  let wasForeground = foreground();
  const optedOut = () => {
    try { return !!localStorage.getItem('umami.disabled'); } catch { return false; }
  };
  const updateAssignment = () => {
    // Stable assignment remains optional. The attention timer never reads or
    // writes visit state, cookies or sessionStorage to measure time.
    let consented = false;
    try { consented = readStoredConsent(localStorage, Date.now())?.analytics === true; } catch { /* blocked storage */ }
    document.cookie = consented && valid(visit)
      ? `${HOME_VARIANT_COOKIE}=${visit.variant}.${visit.end}; Max-Age=${Math.max(0, Math.floor((visit.end - Date.now()) / 1000))}; Path=/; SameSite=Lax; Secure`
      : `${HOME_VARIANT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  };
  const flush = (partial = false) => {
    if (disposed || !valid(visit) || optedOut()) return;
    const delta = Math.max(0, Math.floor(state.activeMs) - state.sentMs);
    if ((!partial && state.activeMs < ENGAGEMENT_MS) || (!delta && !(state.sectionSeen && !state.sentSection))) return;
    const tracker = (window as TrackedWindow).umami;
    if (visit.measure && !tracker) return;
    const data = {
      experiment: HOME_EXPERIMENT, variant: visit.variant, viewport,
      active_ms: String(delta), section_seen: String(state.sectionSeen), ...(visit.qa ? { qa: 'true' } : {}),
    };
    // A single attempt per delta, like the native tracker. SQL deduplicates the
    // resulting engagement by visit, including reloads and other home tabs.
    state.sentMs += delta;
    state.sentSection ||= state.sectionSeen;
    if (!visit.measure) {
      window.dispatchEvent(new CustomEvent('tgb:home-experiment-preview', { detail: { name: 'home_intro_attention', data } }));
      return;
    }
    try {
      void Promise.resolve(tracker!.track(defaults => ({
        website: defaults.website, hostname: location.hostname,
        screen: defaults.screen, language: defaults.language, tag: defaults.tag,
        url: '/', title: 'Tahiti Guest Boat', referrer: '',
        name: 'home_intro_attention', data,
      }))).catch(() => {});
    } catch { /* Analytics must never affect the page. */ }
  };
  const tick = () => {
    if (disposed || frozen) return;
    const now = performance.now();
    const elapsed = Math.max(0, Math.min(1100, now - lastTick));
    lastTick = now;
    if (optedOut()) {
      state.activeMs = 0; state.sentMs = 0; state.sectionSeen = false; state.sentSection = false;
      wasForeground = foreground();
      return;
    }
    if (wasForeground) state.activeMs = Math.min(ENGAGEMENT_MS, state.activeMs + elapsed);
    wasForeground = foreground();
    if (wasForeground && sectionVisible) state.sectionSeen = true;
    flush();
  };
  const onHide = () => {
    if (frozen) return;
    tick(); flush(true); frozen = true; wasForeground = false;
  };
  const onShow = () => { frozen = false; lastTick = performance.now(); wasForeground = foreground(); };
  const onStorage = (event: StorageEvent) => {
    if (event.key === 'tgb_cookie_consent' || event.key === null) updateAssignment();
  };
  const target = document.querySelector('[data-home-post-intro] section');
  const observer = target ? new IntersectionObserver(([entry]) => {
    sectionVisible = entry.isIntersecting && entry.intersectionRect.height >= Math.min(120, entry.boundingClientRect.height);
    tick();
  }, { threshold: [0, 0.1, 0.25, 0.5, 1] }) : null;
  if (target) observer?.observe(target);
  updateAssignment();
  const timer = window.setInterval(tick, 1000);
  document.addEventListener('visibilitychange', tick);
  window.addEventListener('focus', tick); window.addEventListener('blur', tick);
  window.addEventListener('pagehide', onHide); window.addEventListener('pageshow', onShow);
  window.addEventListener('storage', onStorage); window.addEventListener('tgb:consent-changed', updateAssignment);
  return () => {
    disposed = true; clearInterval(timer); observer?.disconnect();
    document.removeEventListener('visibilitychange', tick);
    window.removeEventListener('focus', tick); window.removeEventListener('blur', tick);
    window.removeEventListener('pagehide', onHide); window.removeEventListener('pageshow', onShow);
    window.removeEventListener('storage', onStorage); window.removeEventListener('tgb:consent-changed', updateAssignment);
  };
}
