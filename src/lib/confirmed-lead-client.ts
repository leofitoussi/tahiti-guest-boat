import { readStoredConsent } from './cookie-consent';

export interface ConfirmedLead {
  formId: string;
  submissionId: string;
  formPagePath: string;
  locale: string;
}

type Payload = Record<string, unknown>;
type LeadWindow = Window & {
  umami?: { track: (payload: (defaults: Payload) => Payload) => unknown };
};

// Call only after consuming the short-lived Tally submission proof. Passing a
// custom payload also protects confirmations served by the legacy tracker.
export function trackConfirmedUmamiLead(
  lead: ConfirmedLead,
  consented = () => {
    try { return readStoredConsent(window.localStorage, Date.now())?.analytics === true; }
    catch { return false; }
  },
) {
  if (!['tahitiguestboat.com', 'www.tahitiguestboat.com'].includes(location.hostname)) return;
  const expires = Date.now() + 5_000;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let sent = false;
  const send = () => {
    if (sent || Date.now() >= expires || !consented()) return;
    const tracker = (window as LeadWindow).umami;
    if (!tracker) { timer = setTimeout(send, 250); return; }
    sent = true;
    try {
      const path = new URL(lead.formPagePath, location.origin).pathname;
      const referrer = (() => { try { return new URL(document.referrer).origin; } catch { return ''; } })();
      void Promise.resolve(tracker.track(defaults => ({
        website: defaults.website,
        hostname: location.hostname,
        screen: defaults.screen,
        language: defaults.language,
        url: location.pathname,
        title: 'Tahiti Guest Boat',
        referrer,
        name: 'lead_submitted',
        data: { form_id: lead.formId, locale: lead.locale, form_page_path: path },
      }))).catch(() => {});
    } catch { /* A tracker failure must never block confirmation. */ }
  };
  send();
  return () => { sent = true; clearTimeout(timer); };
}
