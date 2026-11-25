import { readStoredConsent } from './cookie-consent';
import { HOME_EXPERIMENT, HOME_VARIANT_COOKIE, EXPERIMENT_VISIT_KEY, ENGAGEMENT_MS, VISIT_IDLE_MS, EXPERIMENT_DURATION_MS, ORIGINAL_EXPERIMENT_DURATION_MS, type ExperimentRuntime } from './home-experiment';

interface Visit extends ExperimentRuntime {
  lastSeen: number;
  activeMs: number;
  sectionSeen: boolean;
  exposed: boolean;
  engaged: boolean;
  viewport: 'mobile' | 'desktop';
}
type TrackedWindow = Window & { umami?: { track: (name: string, data: Record<string, string>) => unknown } };

export function initializeHomeEngagement() {
  let runtime: ExperimentRuntime | null = null;
  try { runtime = JSON.parse(document.getElementById('home-experiment-runtime')?.textContent ?? 'null'); } catch { /* no experiment */ }
  const onHome = location.pathname === '/';
  let sectionVisible = false;
  let disposed = false;
  let lastTick = performance.now();
  let visitor: Visit | null = null;
  let locks = Promise.resolve();
  const clean = (forgetAssignment = true) => {
    try { localStorage.removeItem(EXPERIMENT_VISIT_KEY); } catch { /* blocked storage */ }
    if (forgetAssignment) document.cookie = `${HOME_VARIANT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
    visitor = null;
  };
  const consented = () => {
    try { return readStoredConsent(localStorage, Date.now())?.analytics === true; } catch { return false; }
  };
  const readVisit = (): Visit | null => {
    try {
      const stored: Visit = JSON.parse(localStorage.getItem(EXPERIMENT_VISIT_KEY) ?? 'null');
      if (stored?.end === stored?.start + ORIGINAL_EXPERIMENT_DURATION_MS) {
        stored.end = stored.start + EXPERIMENT_DURATION_MS;
      }
      if (!stored || stored.experiment !== HOME_EXPERIMENT || !['A', 'B'].includes(stored.variant)
        || !Number.isFinite(stored.start) || stored.end !== stored.start + EXPERIMENT_DURATION_MS
        || Date.now() < stored.start || Date.now() >= stored.end
        || !Number.isFinite(stored.lastSeen) || stored.lastSeen > Date.now()
        || Date.now() - stored.lastSeen >= VISIT_IDLE_MS
        || !Number.isFinite(stored.activeMs) || stored.activeMs < 0
        || typeof stored.sectionSeen !== 'boolean' || typeof stored.exposed !== 'boolean'
        || typeof stored.engaged !== 'boolean' || typeof stored.measure !== 'boolean'
        || !['mobile', 'desktop'].includes(stored.viewport)) return null;
      return stored;
    } catch { return null; }
  };
  const validRuntime = (value: ExperimentRuntime | null): value is ExperimentRuntime => !!value
    && value.experiment === HOME_EXPERIMENT && ['A', 'B'].includes(value.variant)
    && Number.isFinite(value.start) && value.end === value.start + EXPERIMENT_DURATION_MS
    && Date.now() >= value.start && Date.now() < value.end && typeof value.measure === 'boolean';
  const persist = (visit: Visit) => {
    try { localStorage.setItem(EXPERIMENT_VISIT_KEY, JSON.stringify(visit)); return true; } catch { return false; }
  };
  const send = (visit: Visit, name: string, reason?: string) => {
    const data = { experiment: HOME_EXPERIMENT, variant: visit.variant, viewport: visit.viewport, ...(reason ? { reason } : {}), ...(visit.qa ? { qa: 'true' } : {}) };
    if (!visit.measure) {
      // QA observes these local events; production Umami never receives them.
      window.dispatchEvent(new CustomEvent('tgb:home-experiment-preview', { detail: { name, data } }));
      console.info('[home-intro QA]', name, data);
      return true;
    }
    if (!['tahitiguestboat.com', 'www.tahitiguestboat.com'].includes(location.hostname)) return false;
    const tracker = (window as TrackedWindow).umami;
    if (!tracker) return false;
    try { void tracker.track(name, data); return true; } catch { return false; }
  };
  const runTick = (elapsed: number) => {
    if (disposed) return;
    if (!consented()) { clean(); lastTick = performance.now(); return; }
    const stored = readVisit();
    if (onHome && validRuntime(runtime)) {
      visitor = stored && stored.start === runtime.start && stored.variant === runtime.variant ? stored : {
        ...runtime, lastSeen: Date.now(), activeMs: 0, sectionSeen: false, exposed: false, engaged: false,
        viewport: matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
      };
      visitor.qa ||= runtime.qa;
      if (visitor.measure) {
        document.cookie = `${HOME_VARIANT_COOKIE}=${visitor.variant}.${visitor.end}; Max-Age=${Math.max(0, Math.floor((visitor.end - Date.now()) / 1000))}; Path=/; SameSite=Lax; Secure`;
      }
    } else {
      // Preview pages, a home with no active experiment, and internal URLs
      // cannot masquerade as the second public page of a production visit.
      visitor = !onHome && !location.pathname.startsWith('/home-') ? stored : null;
    }
    if (!visitor || !validRuntime(visitor)) { clean(onHome); return; }
    if (visitor.measure && !['tahitiguestboat.com', 'www.tahitiguestboat.com'].includes(location.hostname)) return;
    const foreground = document.visibilityState === 'visible' && document.hasFocus();
    // Store before sending and serialize across tabs with Web Locks when available.
    if (foreground && !visitor.exposed && onHome) {
      const trackerReady = !visitor.measure || !!(window as TrackedWindow).umami;
      if (trackerReady) {
        visitor.exposed = true;
        if (!persist(visitor) || !send(visitor, 'home_intro_exposed')) visitor.exposed = false;
      }
    }
    if (!visitor.exposed) { persist(visitor); return; }
    if (foreground) {
      if (onHome) {
        visitor.activeMs += elapsed;
        visitor.sectionSeen ||= sectionVisible;
      }
      visitor.lastSeen = Date.now();
      const reason = !onHome ? 'next_page' : visitor.activeMs >= ENGAGEMENT_MS && visitor.sectionSeen ? '20s_and_section' : null;
      if (reason && !visitor.engaged) {
        const trackerReady = !visitor.measure || !!(window as TrackedWindow).umami;
        if (trackerReady) {
          visitor.engaged = true;
          if (!persist(visitor) || !send(visitor, 'home_intro_engaged', reason)) visitor.engaged = false;
        }
      }
    }
    persist(visitor);
  };
  const tick = () => {
    const now = performance.now();
    // No background/sleep catch-up. Visibility/focus transitions flush the clock.
    const elapsed = Math.max(0, Math.min(1100, now - lastTick));
    lastTick = now;
    const job = () => runTick(elapsed);
    locks = locks.then(() => navigator.locks ? navigator.locks.request(HOME_EXPERIMENT, job) : job()).catch(() => {});
  };
  const resetClock = () => { lastTick = performance.now(); tick(); };
  const onStorage = (event: StorageEvent) => {
    if (event.key === 'tgb_cookie_consent' || event.key === null) resetClock();
  };
  // Most pages are outside an experiment; avoid a site-wide background timer.
  if (!validRuntime(runtime) && !readVisit()) {
    try { if (localStorage.getItem(EXPERIMENT_VISIT_KEY)) clean(!consented()); } catch { /* blocked storage */ }
    return;
  }
  const target = document.querySelector('[data-home-post-intro] section');
  const observer = target ? new IntersectionObserver(([entry]) => {
    // At least 120px of the next real section must be on screen, not a marker.
    sectionVisible = entry.isIntersecting && entry.intersectionRect.height >= Math.min(120, entry.boundingClientRect.height);
    tick();
  }, { threshold: [0, 0.1, 0.25, 0.5, 1] }) : null;
  if (target) observer?.observe(target);
  const timer = window.setInterval(tick, 1000);
  document.addEventListener('visibilitychange', resetClock);
  window.addEventListener('focus', resetClock);
  window.addEventListener('blur', resetClock);
  window.addEventListener('storage', onStorage);
  window.addEventListener('tgb:consent-changed', resetClock);
  window.addEventListener('pagehide', tick);
  tick();
  return () => {
    disposed = true; clearInterval(timer); observer?.disconnect();
    document.removeEventListener('visibilitychange', resetClock);
    window.removeEventListener('focus', resetClock); window.removeEventListener('blur', resetClock);
    window.removeEventListener('storage', onStorage); window.removeEventListener('tgb:consent-changed', resetClock);
    window.removeEventListener('pagehide', tick);
  };
}
