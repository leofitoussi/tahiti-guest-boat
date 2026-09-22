import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import {
  applyConsentMode,
  buildConsentModeState,
  initializeConsentMode,
  readStoredConsent,
  saveStoredConsent,
} from '../src/lib/cookie-consent';
import { getSiteCopy } from '../src/lib/site-copy';

describe('cookie consent', () => {
  it('starts with denied Google consent when no first-party choice exists', () => {
    const storage = {
      getItem: () => null,
    };

    expect(readStoredConsent(storage, 1_000)).toBeNull();
    expect(buildConsentModeState(null)).toEqual({
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  it('restores an accepted choice for six months and grants all Google signals', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const savedAt = 1_000_000;

    saveStoredConsent(storage, { analytics: true, advertising: true }, savedAt);
    const restored = readStoredConsent(storage, savedAt + 1000);

    expect(restored).toEqual({ analytics: true, advertising: true });
    expect(buildConsentModeState(restored)).toEqual({
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });

  it('keeps audience measurement granted while advertising remains denied in a custom choice', () => {
    expect(buildConsentModeState({ analytics: true, advertising: false })).toEqual({
      ad_storage: 'denied',
      analytics_storage: 'granted',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  it('ignores a stored choice at the six-month expiry boundary', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const savedAt = Date.UTC(2026, 0, 31);
    const expiresAt = new Date(savedAt);
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    saveStoredConsent(storage, { analytics: true, advertising: true }, savedAt);

    expect(readStoredConsent(storage, expiresAt.getTime())).toBeNull();
  });

  it('withdraws consent by updating all Google signals to denied', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const calls: unknown[][] = [];

    saveStoredConsent(storage, { analytics: true, advertising: true }, 1_000_000);
    saveStoredConsent(storage, { analytics: false, advertising: false }, 1_000_001);
    applyConsentMode((...args) => calls.push(args), readStoredConsent(storage, 1_000_002));

    expect(calls).toEqual([
      ['set', 'ads_data_redaction', true],
      [
        'consent',
        'update',
        {
          ad_storage: 'denied',
          analytics_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        },
      ],
    ]);
  });

  it('provides equivalent localized actions in French and English', () => {
    const french = getSiteCopy('fr').cookies;
    const english = getSiteCopy('en').cookies;

    expect([french.acceptAll, french.rejectAll, french.customize, french.manage]).toEqual([
      'Tout accepter',
      'Tout refuser',
      'Personnaliser',
      'Gérer mes cookies',
    ]);
    expect(french.description).toBe('Nous mesurons les visites, les demandes de croisière et l’efficacité de nos publicités.');
    expect(french.policyPrefix).toBe('Consultez notre');
    expect([english.acceptAll, english.rejectAll, english.customize, english.manage]).toEqual([
      'Accept all',
      'Reject all',
      'Customize',
      'Manage cookies',
    ]);
    expect(english.description).toBe('We measure visits, cruise enquiries, and the effectiveness of our advertising.');
    expect(english.policyPrefix).toBe('Read our');
  });

  it('initializes denied consent before restoring a previously accepted choice', () => {
    const calls: unknown[][] = [];

    initializeConsentMode((...args) => calls.push(args), { analytics: true, advertising: true });

    expect(calls).toEqual([
      ['consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      }],
      ['set', 'ads_data_redaction', true],
      ['set', 'ads_data_redaction', false],
      [
        'consent',
        'update',
        {
          ad_storage: 'granted',
          analytics_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        },
      ],
    ]);
  });

  it('mounts the localized consent UI globally and initializes it before head tracking scripts', async () => {
    const [layout, head, banner, footer] = await Promise.all([
      readFile('src/layouts/BaseLayout.astro', 'utf8'),
      readFile('src/components/consent/CookieConsentHead.astro', 'utf8'),
      readFile('src/components/consent/CookieConsentBanner.astro', 'utf8'),
      readFile('src/components/navigation/Footer.astro', 'utf8'),
    ]);

    expect(layout.indexOf('<CookieConsentHead />')).toBeLessThan(layout.indexOf('{headScripts'));
    expect(layout).toContain('<CookieConsentBanner locale={locale} />');
    expect(head.indexOf("'default'")).toBeLessThan(head.indexOf("'update'"));
    expect(head).toContain("ad_personalization: 'denied'");
    expect(head).toContain("'ads_data_redaction', true");
    expect(banner).toContain('data-cookie-consent-action="accept"');
    expect(banner).toContain('data-cookie-consent-action="reject"');
    expect(banner).toContain('data-cookie-consent-action="customize"');
    expect(banner).not.toContain('Tahiti Guest Boat</p>');
    expect(banner).not.toContain('cookie-consent-title');
    expect(banner).toContain('aria-label={copy.title}');
    expect(banner).toContain('lg:max-w-6xl');
    expect(banner).toContain('lg:flex-none lg:flex-row lg:flex-nowrap');
    expect(banner.match(/lg:min-w-\[10\.5rem\]/g)).toHaveLength(3);
    expect(banner.indexOf('data-cookie-consent-action="reject"')).toBeLessThan(
      banner.indexOf('data-cookie-consent-action="customize"'),
    );
    expect(banner.indexOf('data-cookie-consent-action="customize"')).toBeLessThan(
      banner.indexOf('data-cookie-consent-action="accept"'),
    );
    expect(footer).toContain('data-cookie-consent-open');
  });
});
