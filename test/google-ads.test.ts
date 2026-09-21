import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { assertNoGoogleAdsTagInTrackingScripts, getGoogleAdsConfiguration } from '../src/lib/google-ads';

describe('Google Ads configuration', () => {
  it('keeps the tag disabled until both build-time values are configured', () => {
    expect(getGoogleAdsConfiguration(undefined, undefined)).toBeNull();
    expect(getGoogleAdsConfiguration('AW-18346160740', undefined)).toBeNull();
  });

  it('creates the unique conversion destination supplied by Google Ads', () => {
    expect(getGoogleAdsConfiguration('AW-18346160740', 'dUvTCKSv3f8cEOTkkKxE')).toEqual({
      tagId: 'AW-18346160740',
      conversionDestination: 'AW-18346160740/dUvTCKSv3f8cEOTkkKxE',
    });
  });

  it('rejects a Google Ads tag in the editable tracking scripts so it cannot be loaded twice', () => {
    expect(() => assertNoGoogleAdsTagInTrackingScripts('<script src="//gc.zgo.at/count.js"></script>')).not.toThrow();
    expect(() =>
      assertNoGoogleAdsTagInTrackingScripts(
        '<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18346160740"></script>',
      ),
    ).toThrow('Google Ads');
  });

  it('places the configured Google tag after the default consent state and fires a conversion only after Tally confirmation', async () => {
    const [layout, tag, booking, confirmation] = await Promise.all([
      readFile('src/layouts/BaseLayout.astro', 'utf8'),
      readFile('src/components/analytics/GoogleAdsTag.astro', 'utf8'),
      readFile('src/components/cruises/BookingBlock.astro', 'utf8'),
      readFile('src/components/ConfirmationPage.astro', 'utf8'),
    ]);

    expect(layout.indexOf('<CookieConsentHead />')).toBeLessThan(layout.indexOf('<GoogleAdsTag />'));
    expect(layout.indexOf('<GoogleAdsTag />')).toBeLessThan(layout.indexOf('{headScripts'));
    expect(tag).toContain('getGoogleAdsConfiguration');
    expect(tag).toContain('googletagmanager.com/gtag/js?id=${config.tagId}');
    expect(booking).toContain('getTallySubmissionFromMessage');
    expect(booking).toContain('rememberTallySubmission');
    expect(confirmation).toContain('consumeTallySubmission');
    expect(confirmation).toContain("gtag('event', 'conversion'");
  });
});
