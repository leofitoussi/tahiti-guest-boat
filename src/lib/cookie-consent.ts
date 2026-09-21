export interface ConsentPreferences {
  analytics: boolean;
  advertising: boolean;
}

export interface ConsentModeState {
  ad_storage: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
}

export type ConsentModeWriter = (
  ...args: ['set', 'ads_data_redaction', boolean] | ['consent', 'update', ConsentModeState]
) => void;

export type ConsentModeInitializer = (
  ...args:
    | ['set', 'ads_data_redaction', boolean]
    | ['consent', 'default' | 'update', ConsentModeState & { wait_for_update?: number }]
) => void;

export interface ConsentStorageReader {
  getItem(key: string): string | null;
}

export interface ConsentStorage extends ConsentStorageReader {
  setItem(key: string, value: string): void;
}

export const CONSENT_STORAGE_KEY = 'tgb_cookie_consent';
const CONSENT_RETENTION_MONTHS = 6;

interface StoredConsent {
  analytics: boolean;
  advertising: boolean;
  savedAt: number;
}

export function readStoredConsent(storage: ConsentStorageReader, now: number): ConsentPreferences | null {
  let raw: string | null;

  try {
    raw = storage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    const stored = JSON.parse(raw) as Partial<StoredConsent>;
    if (
      typeof stored.analytics !== 'boolean' ||
      typeof stored.advertising !== 'boolean' ||
      typeof stored.savedAt !== 'number' ||
      !Number.isFinite(stored.savedAt)
    ) {
      return null;
    }

    const expiresAt = new Date(stored.savedAt);
    expiresAt.setMonth(expiresAt.getMonth() + CONSENT_RETENTION_MONTHS);

    const expiresAtTimestamp = expiresAt.getTime();
    if (!Number.isFinite(expiresAtTimestamp) || now >= expiresAtTimestamp) return null;

    return {
      analytics: stored.analytics,
      advertising: stored.advertising,
    };
  } catch {
    return null;
  }
}

export function saveStoredConsent(storage: ConsentStorage, preferences: ConsentPreferences, savedAt: number) {
  storage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({
      ...preferences,
      savedAt,
    } satisfies StoredConsent),
  );
}

export function buildConsentModeState(preferences: ConsentPreferences | null): ConsentModeState {
  const analytics = preferences?.analytics === true ? 'granted' : 'denied';
  const advertising = preferences?.advertising === true ? 'granted' : 'denied';

  return {
    ad_storage: advertising,
    analytics_storage: analytics,
    ad_user_data: advertising,
    ad_personalization: advertising,
  };
}

export function applyConsentMode(writer: ConsentModeWriter, preferences: ConsentPreferences | null) {
  writer('set', 'ads_data_redaction', preferences?.advertising !== true);
  writer('consent', 'update', buildConsentModeState(preferences));
}

export function initializeConsentMode(writer: ConsentModeInitializer, preferences: ConsentPreferences | null) {
  writer('consent', 'default', {
    ...buildConsentModeState(null),
    wait_for_update: 500,
  });
  writer('set', 'ads_data_redaction', true);

  if (preferences) {
    writer('set', 'ads_data_redaction', preferences.advertising !== true);
    writer('consent', 'update', buildConsentModeState(preferences));
  }
}
