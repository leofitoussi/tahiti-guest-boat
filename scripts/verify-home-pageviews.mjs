import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

// The actual deployed 3.0.3 tracker, executed as a test in an isolated DOM.
// No browser automation, analytics requests or extra visitor storage.
const tracker = readFileSync(process.argv[2], 'utf8');
const script = '<script defer src="https://analytics.tahitiguestboat.com/script.js" data-website-id="388d24a4-9679-4b9c-992d-5ac0427b099c"';
for (const variant of ['A', 'B']) for (const choice of ['undecided', 'denied', 'granted', 'opt-out']) {
  const dom = new JSDOM(`<head>${script} data-tag="home-intro-v2:${variant}"></script></head>`, { url: 'https://tahitiguestboat.com/', runScripts: 'outside-only' });
  const w = dom.window;
  if (choice !== 'undecided') w.localStorage.setItem('tgb_cookie_consent', JSON.stringify({ analytics: choice === 'granted', advertising: false, savedAt: Date.now() }));
  if (choice === 'opt-out') w.localStorage.setItem('umami.disabled', '1');
  const before = Array.from({ length: w.localStorage.length }, (_, i) => w.localStorage.key(i));
  Object.defineProperty(w.document, 'currentScript', { value: w.document.querySelector('script') });
  Object.defineProperty(w.document, 'readyState', { value: 'complete' });
  Object.defineProperty(w.document, 'visibilityState', { value: 'hidden' });
  w.document.hasFocus = () => false;
  const sends = [];
  w.fetch = async (_url, init) => { sends.push(JSON.parse(init.body)); return { json: async () => ({}) }; };
  w.eval(tracker);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(sends.length, choice === 'opt-out' ? 0 : 1, `${variant}/${choice}`);
  if (sends.length) {
    assert.equal(sends[0].payload.tag, `home-intro-v2:${variant}`);
    assert.equal(sends[0].payload.name, undefined, 'This must remain a normal pageview');
  }
  assert.deepEqual(Array.from({ length: w.localStorage.length }, (_, i) => w.localStorage.key(i)), before);
  assert.equal(w.document.cookie, '');
  w.close();
}
console.log('Real Umami tracker: A/B native pageviews tagged before any consent choice, with refusal or acceptance, hidden/unfocused; no new storage, no second event, tracker opt-out respected. No analytics requests sent.');
