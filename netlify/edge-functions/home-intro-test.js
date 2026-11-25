import { HOME_EXPERIMENT, HOME_VARIANT_COOKIE, chooseHomeVariant, experimentWindow, parseVariantCookie, EXPERIMENT_DURATION_MS, tagHomePageview } from '../../src/lib/home-experiment.ts';
import { HOME_INTRO_TEST_START } from '../lib/home-experiment-schedule.mjs';

const PRIVATE_PATH = '/home-experiment/b/';
const BOT = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit/i;

export default async function homeIntroTest(request, context) {
  const url = new URL(request.url);
  // Internal variant is never an independently indexable public page.
  if (url.pathname.startsWith('/home-experiment/')) {
    const response = await context.next();
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, { status: response.status, headers });
  }
  if (url.pathname !== '/' || !['GET', 'HEAD'].includes(request.method) || BOT.test(request.headers.get('user-agent') ?? '')) return;
  const production = context.deploy.context === 'production';
  const liveHost = ['tahitiguestboat.com', 'www.tahitiguestboat.com'].includes(url.hostname);
  const preview = !production && url.searchParams.get('home_test') === '1';
  const now = Date.now();
  const previewStart = Math.floor(now / EXPERIMENT_DURATION_MS) * EXPERIMENT_DURATION_MS;
  const window = preview ? { start: previewStart, end: previewStart + EXPERIMENT_DURATION_MS }
    : production && context.deploy.published && liveHost
      ? experimentWindow(Netlify.env.get('HOME_INTRO_TEST_START') || HOME_INTRO_TEST_START, now) : null;
  if (!window) return;

  const forced = preview ? url.searchParams.get('variant') : null;
  const variant = forced === 'A' || forced === 'B' ? forced
    : parseVariantCookie(context.cookies.get(HOME_VARIANT_COOKIE), window.end)
      ?? chooseHomeVariant(crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32);
  let response = variant === 'B'
    ? await fetch(new URL(PRIVATE_PATH + 'index.html', request.url))
    : await context.next();
  // If B is missing or broken, deliver the original and record no exposure.
  if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) return;
  let html = await response.text();
  if (!html.includes(`data-home-experiment-variant="${variant}"`)) return;
  const runtime = { experiment: HOME_EXPERIMENT, variant, ...window, measure: !preview,
    ...(url.searchParams.get('home_test_qa') === '1' ? { qa: true } : {}) };
  if (!preview) html = tagHomePageview(html, variant, runtime.qa);
  const config = `<script type="application/json" id="home-experiment-runtime">${JSON.stringify(runtime)}</script>`;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.delete('etag');
  if (!preview) headers.delete('x-robots-tag');
  else headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set('Cache-Control', 'private, no-store');
  headers.set('Netlify-CDN-Cache-Control', 'no-store');
  headers.set('Vary', 'Cookie');
  headers.set('X-TGB-Home-Variant', variant);
  // No assignment cookie is written here. The client persists it only with
  // measurement consent, after this variant has actually been displayed.
  return new Response(request.method === 'HEAD' ? null : html.replace('</head>', `${config}</head>`), { headers });
}

export const config = { path: ['/', '/home-experiment/*'], onError: 'bypass' };
