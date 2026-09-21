export interface GoogleAdsConfiguration {
  tagId: string;
  conversionDestination: string;
}

const GOOGLE_ADS_TAG_PATTERN = /googletagmanager\.com\/gtag\/js\?id=AW-|gtag\s*\(\s*['"]config['"]\s*,\s*['"]AW-/i;

export function getGoogleAdsConfiguration(
  tagId: string | undefined,
  conversionLabel: string | undefined,
): GoogleAdsConfiguration | null {
  if (!tagId || !conversionLabel) return null;

  return {
    tagId,
    conversionDestination: `${tagId}/${conversionLabel}`,
  };
}

export function assertNoGoogleAdsTagInTrackingScripts(trackingScripts: string | null | undefined) {
  if (trackingScripts && GOOGLE_ADS_TAG_PATTERN.test(trackingScripts)) {
    throw new Error('Google Ads must be configured with the Netlify environment variables, not Sanity tracking scripts.');
  }
}
