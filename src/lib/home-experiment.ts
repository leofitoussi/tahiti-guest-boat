export const HOME_EXPERIMENT = 'home-intro-v1';
export const HOME_VARIANT_COOKIE = 'tgb_home_intro_v1';
export const EXPERIMENT_VISIT_KEY = 'tgb_home_intro_visit_v1';
export const HOME_PAGEVIEW_TAG = 'home-intro-v2';

// Attach the rendered variant to the existing pageview before the deferred
// Umami script executes. This requires no browser storage or additional send.
export function tagHomePageview(html: string, variant: HomeVariant, qa = false) {
  const tag = `${HOME_PAGEVIEW_TAG}:${variant}${qa ? ':qa' : ''}`;
  return html.replace(/<script\b[^>]*>/gi, opening => {
    const legacy = /\bsrc\s*=\s*(["'])https:\/\/analytics\.tahitiguestboat\.com\/script\.js\1/i.test(opening)
      && /\bdata-website-id\s*=\s*(["'])388d24a4-9679-4b9c-992d-5ac0427b099c\1/i.test(opening);
    const controlled = /\bdata-measurement(?:\s|=|>)/i.test(opening)
      && /\bdata-umami-id\s*=\s*(["'])388d24a4-9679-4b9c-992d-5ac0427b099c\1/i.test(opening);
    if (!legacy && !controlled) return opening;
    const attribute = legacy ? 'data-tag' : 'data-umami-tag';
    return opening.replace(new RegExp(`\\s${attribute}\\s*=\\s*(["'])[^"']*\\1`, 'i'), '')
      .replace(/>$/, ` ${attribute}="${tag}">`);
  });
}
export const ORIGINAL_EXPERIMENT_DURATION_MS = 14 * 24 * 60 * 60 * 1000;
// Explicitly extended by the user on 25 November, to 13 December 07:34 Tahiti.
export const EXPERIMENT_DURATION_MS = 21 * 24 * 60 * 60 * 1000;
export const VISIT_IDLE_MS = 30 * 60 * 1000;
export const ENGAGEMENT_MS = 20_000;

export type HomeVariant = 'A' | 'B';
export interface ExperimentRuntime {
  experiment: typeof HOME_EXPERIMENT;
  variant: HomeVariant;
  start: number;
  end: number;
  measure: boolean;
  qa?: boolean;
}

export function experimentWindow(startValue: string | undefined, now: number) {
  // A start time is required: building or previewing never starts the live test.
  const start = startValue ? Date.parse(startValue) : NaN;
  if (!Number.isFinite(start) || now < start || now >= start + EXPERIMENT_DURATION_MS) return null;
  return { start, end: start + EXPERIMENT_DURATION_MS };
}

export function parseVariantCookie(value: string | undefined, end: number): HomeVariant | null {
  const [variant, expiry] = (value ?? '').split('.');
  const previousEnd = end - (EXPERIMENT_DURATION_MS - ORIGINAL_EXPERIMENT_DURATION_MS);
  return (variant === 'A' || variant === 'B') && (expiry === String(end) || expiry === String(previousEnd)) ? variant : null;
}

export function chooseHomeVariant(sample: number): HomeVariant {
  return sample < 0.5 ? 'A' : 'B';
}

export function sanitizeHomeExperimentEvent(name: unknown, data: unknown): Record<string, string> | null {
  if (name !== 'home_intro_exposed' && name !== 'home_intro_engaged' && name !== 'home_intro_attention') return null;
  if (!data || typeof data !== 'object') return null;
  const value = data as Record<string, unknown>;
  if (value.experiment !== HOME_EXPERIMENT || !['A', 'B'].includes(String(value.variant))) return null;
  if (!['mobile', 'desktop'].includes(String(value.viewport))) return null;
  const clean: Record<string, string> = {
    experiment: HOME_EXPERIMENT, variant: String(value.variant), viewport: String(value.viewport),
  };
  if (value.qa === 'true') clean.qa = 'true';
  if (name === 'home_intro_engaged') {
    if (!['next_page', '20s_and_section'].includes(String(value.reason))) return null;
    clean.reason = String(value.reason);
  }
  if (name === 'home_intro_attention') {
    if (!/^[0-9]{1,5}$/.test(String(value.active_ms)) || Number(value.active_ms) > ENGAGEMENT_MS
      || !['true', 'false'].includes(String(value.section_seen))) return null;
    clean.active_ms = String(value.active_ms);
    clean.section_seen = String(value.section_seen);
  }
  return clean;
}
