import {
  applyConsentMode,
  readStoredConsent,
  saveStoredConsent,
  type ConsentModeWriter,
  type ConsentPreferences,
} from './cookie-consent';
import {
  LANGUAGE_SUGGESTION_PENDING_ATTRIBUTE,
  LANGUAGE_SUGGESTION_RESOLVED_EVENT,
} from './language-suggestion-client';

export function mountCookieConsent(root: HTMLElement) {
  const storage = (() => {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  })();
  const preferencesForm = root.querySelector<HTMLFormElement>('[data-cookie-consent-preferences]');
  const analyticsInput = root.querySelector<HTMLInputElement>('[data-cookie-consent-analytics]');
  const advertisingInput = root.querySelector<HTMLInputElement>('[data-cookie-consent-advertising]');
  const customizeButton = root.querySelector<HTMLButtonElement>('[data-cookie-consent-action="customize"]');

  const writeConsent: ConsentModeWriter = (command, action, state) => {
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) gtag(command, action, state);
  };

  const setPreferences = (preferences: ConsentPreferences) => {
    if (analyticsInput) analyticsInput.checked = preferences.analytics;
    if (advertisingInput) advertisingInput.checked = preferences.advertising;
  };

  const hide = () => {
    root.hidden = true;
    root.classList.add('hidden');
    root.removeAttribute('data-open');
  };

  const show = (focus = false) => {
    const stored = storage ? readStoredConsent(storage, Date.now()) : null;
    setPreferences(stored ?? { analytics: false, advertising: false });
    customizeButton?.setAttribute('aria-expanded', 'false');
    if (preferencesForm) {
      preferencesForm.hidden = true;
      preferencesForm.classList.add('hidden');
    }
    root.hidden = false;
    root.classList.remove('hidden');
    root.dataset.open = 'true';
    if (focus) root.focus({ preventScroll: true });
  };

  const showWhenNeeded = () => {
    if (storage && readStoredConsent(storage, Date.now())) {
      hide();
    } else {
      show();
    }
  };

  const save = (preferences: ConsentPreferences) => {
    if (storage) {
      try {
        saveStoredConsent(storage, preferences, Date.now());
      } catch {
        // Consent still applies for this page when browser storage is unavailable.
      }
    }
    applyConsentMode(writeConsent, preferences);
    hide();
  };

  if (document.documentElement.hasAttribute(LANGUAGE_SUGGESTION_PENDING_ATTRIBUTE)) {
    hide();
    window.addEventListener(LANGUAGE_SUGGESTION_RESOLVED_EVENT, showWhenNeeded, { once: true });
  } else {
    showWhenNeeded();
  }

  root.querySelector<HTMLButtonElement>('[data-cookie-consent-action="accept"]')?.addEventListener('click', () => {
    save({ analytics: true, advertising: true });
  });

  root.querySelector<HTMLButtonElement>('[data-cookie-consent-action="reject"]')?.addEventListener('click', () => {
    save({ analytics: false, advertising: false });
  });

  customizeButton?.addEventListener('click', () => {
    const expanded = customizeButton.getAttribute('aria-expanded') === 'true';
    customizeButton.setAttribute('aria-expanded', String(!expanded));
    if (preferencesForm) {
      preferencesForm.hidden = expanded;
      preferencesForm.classList.toggle('hidden', expanded);
    }
  });

  preferencesForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    save({
      analytics: analyticsInput?.checked === true,
      advertising: advertisingInput?.checked === true,
    });
  });

  document.querySelectorAll<HTMLAnchorElement>('[data-cookie-consent-open]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      show(true);
    });
  });
}
