import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

// Execute compiled confirmation modules in an isolated DOM, with no browser,
// network, Tally submission, advertising request or email.
const dist = resolve(process.argv[2], 'dist');
for (const [path, formId, locale] of [['merci', 'nPrj8V', 'fr'], ['en/thank-you', 'eqOGYl', 'en']]) {
  const html = readFileSync(resolve(dist, path, 'index.html'), 'utf8');
  const entry = html.match(/src="([^"]*ConfirmationPage[^\"]*\.js)"/)[1];
  for (const scenario of ['confirmed', 'missing', 'stale', 'wrong-form', 'denied', 'preview']) {
    const host = scenario === 'preview' ? 'lead-check--tahiti-guest-boat.netlify.app' : 'tahitiguestboat.com';
    const dom = new JSDOM(html, { url: `https://${host}/${path}/?tallySubmissionId=opaque&email=private`, runScripts: 'outside-only' });
    const { window } = dom;
    window.localStorage.setItem('tgb_cookie_consent', JSON.stringify({ analytics: scenario !== 'denied', advertising: false, savedAt: Date.now() }));
    if (scenario !== 'missing') window.sessionStorage.setItem('tgb_tally_submission', JSON.stringify({
      formId: scenario === 'wrong-form' ? 'other' : formId, submissionId: 'opaque',
      submittedAt: Date.now() - (scenario === 'stale' ? 301_000 : 0), formPagePath: '/contact/?email=private',
    }));
    const events = [];
    window.umami = { track: callback => events.push(callback({ website: 'isolated-test', id: 'private' })) };
    window.gtag = () => {};
    const context = dom.getInternalVMContext();
    const cache = new Map();
    const load = async file => {
      if (cache.has(file)) return cache.get(file);
      const module = new vm.SourceTextModule(readFileSync(file, 'utf8'), { context, identifier: file });
      cache.set(file, module);
      await module.link((specifier, parent) => load(resolve(dirname(parent.identifier), specifier)));
      return module;
    };
    const module = await load(resolve(dist, entry.slice(1)));
    await module.evaluate();
    assert.equal(events.length, scenario === 'confirmed' ? 1 : 0, `${locale}: ${scenario}`);
    if (events.length) {
      assert.equal(events[0].name, 'lead_submitted');
      assert.equal(events[0].data.locale, locale);
      assert(!/private|opaque|tallySubmissionId/.test(JSON.stringify(events)));
      assert.equal(window.sessionStorage.getItem('tgb_tally_submission'), null);
    }
    window.close();
  }
}
console.log('Compiled FR/EN confirmation checks passed: valid proof, missing/stale/mismatched proof, consent, preview isolation and sanitized event payload. No requests sent.');
