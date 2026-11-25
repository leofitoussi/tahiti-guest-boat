// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackConfirmedUmamiLead } from '../src/lib/confirmed-lead-client';
import { rememberTallySubmission, takeTallySubmission } from '../src/lib/tally-submission';
import { saveStoredConsent } from '../src/lib/cookie-consent';

beforeEach(() => {
  vi.useFakeTimers(); localStorage.clear(); sessionStorage.clear();
  window.history.replaceState(null, '', '/merci/?email=private&tallySubmissionId=opaque#private');
  vi.stubGlobal('location', new URL('https://tahitiguestboat.com/merci/?email=private&tallySubmissionId=opaque#private'));
});
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });
const lead = { formId: 'nPrj8V', submissionId: 'opaque', formPagePath: '/contact/?email=private', locale: 'fr' };
function grant(analytics = true) { saveStoredConsent(localStorage, { analytics, advertising: false }, Date.now()); }

describe('confirmed leads on thank-you pages', () => {
  it.each([
    ['nPrj8V', 'fr', '/merci/', '/contact/'],
    ['eqOGYl', 'en', '/en/thank-you/', '/en/contact/'],
  ])('sends %s once after a real proof, independently of Ads, without confirmation identifiers', (formId, locale, path, formPagePath) => {
    grant(); const track = vi.fn(); vi.stubGlobal('umami', { track });
    window.history.replaceState(null, '', `${path}?email=private&tallySubmissionId=opaque`);
    vi.stubGlobal('location', new URL(`https://tahitiguestboat.com${path}?email=private&tallySubmissionId=opaque`));
    const submission = { formId, submissionId: 'opaque', formPagePath };
    const confirm = () => {
      const proof = takeTallySubmission(sessionStorage, submission, Date.now());
      if (proof) trackConfirmedUmamiLead({ ...submission, locale });
    };
    confirm(); expect(track).not.toHaveBeenCalled();
    rememberTallySubmission(sessionStorage, submission, Date.now()); confirm(); confirm();
    expect(track).toHaveBeenCalledTimes(1);
    const payload = track.mock.calls[0][0]({ website: 'test', id: 'private', title: 'private', url: 'private', referrer: 'private' });
    expect(payload).toMatchObject({ website: 'test', name: 'lead_submitted', url: path, data: { form_id: formId, locale, form_page_path: formPagePath } });
    expect(JSON.stringify(payload)).not.toMatch(/private|opaque|tallySubmissionId/);
  });

  it('does not send before consent or after a refusal', async () => {
    const track = vi.fn(); vi.stubGlobal('umami', { track });
    trackConfirmedUmamiLead(lead); grant(false); trackConfirmedUmamiLead(lead);
    await vi.advanceTimersByTimeAsync(6000); expect(track).not.toHaveBeenCalled();
  });

  it('never sends to production from a deploy preview', () => {
    grant(); const track = vi.fn(); vi.stubGlobal('umami', { track });
    vi.stubGlobal('location', new URL('https://lead-check--tahiti-guest-boat.netlify.app/merci/'));
    trackConfirmedUmamiLead(lead); expect(track).not.toHaveBeenCalled();
  });

  it('waits for the tracker, sanitizes the form path, and handles a rejected send', async () => {
    grant(); trackConfirmedUmamiLead(lead); await vi.advanceTimersByTimeAsync(1000);
    const track = vi.fn().mockRejectedValue(new Error('offline')); vi.stubGlobal('umami', { track });
    await vi.advanceTimersByTimeAsync(1000); expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0][0]({}).data.form_page_path).toBe('/contact/');
  });

  it('stops pending sends after revocation or the five-second tracker deadline', async () => {
    grant(); trackConfirmedUmamiLead(lead); grant(false);
    const track = vi.fn(); vi.stubGlobal('umami', { track });
    await vi.advanceTimersByTimeAsync(1000); expect(track).not.toHaveBeenCalled();
    vi.stubGlobal('umami', undefined); grant(); trackConfirmedUmamiLead(lead);
    await vi.advanceTimersByTimeAsync(5000); vi.stubGlobal('umami', { track });
    await vi.advanceTimersByTimeAsync(1000); expect(track).not.toHaveBeenCalled();
  });
});
