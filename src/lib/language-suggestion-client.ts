import {
  readLanguageSuggestionPreference,
  resolveLanguageSuggestion,
  saveLanguageSuggestionLocale,
  saveLanguageSuggestionOptOut,
} from './language-suggestion';
import type { Locale } from './localization';

export const LANGUAGE_SUGGESTION_PENDING_ATTRIBUTE = 'data-language-suggestion-pending';
export const LANGUAGE_SUGGESTION_RESOLVED_EVENT = 'language-suggestion-resolved';

interface MountLanguageSuggestionOptions {
  root: HTMLElement;
  currentLocale: Locale;
  primaryBrowserLanguage: string | undefined;
  alternatePaths: Partial<Record<Locale, string>>;
  storage: Pick<Storage, 'getItem' | 'setItem'>;
}

const destinationCopy: Record<Locale, { flag: string; label: string }> = {
  en: { flag: '🇬🇧', label: 'View in English' },
  fr: { flag: '🇫🇷', label: 'Voir en français' },
};

export function mountLanguageSuggestion({
  root,
  currentLocale,
  primaryBrowserLanguage,
  alternatePaths,
  storage,
}: MountLanguageSuggestionOptions) {
  const suggestion = resolveLanguageSuggestion({
    currentLocale,
    primaryBrowserLanguage,
    alternatePaths,
    preference: readLanguageSuggestionPreference(storage, Date.now()),
  });
  if (!suggestion) return;

  const copy = destinationCopy[suggestion.targetLocale];
  const action = root.querySelector<HTMLAnchorElement>('[data-language-suggestion-action]');
  const flag = root.querySelector<HTMLElement>('[data-language-suggestion-flag]');
  const label = root.querySelector<HTMLElement>('[data-language-suggestion-label]');
  const close = root.querySelector<HTMLButtonElement>('[data-language-suggestion-close]');

  if (!action || !flag || !label) return;

  action.href = suggestion.href;
  action.setAttribute('aria-label', copy.label);
  flag.textContent = copy.flag;
  label.textContent = copy.label;
  root.hidden = false;
  document.documentElement.setAttribute(LANGUAGE_SUGGESTION_PENDING_ATTRIBUTE, 'true');

  let isResolved = false;
  const resolve = () => {
    if (isResolved) return;

    isResolved = true;
    root.hidden = true;
    document.documentElement.removeAttribute(LANGUAGE_SUGGESTION_PENDING_ATTRIBUTE);
    window.dispatchEvent(new CustomEvent(LANGUAGE_SUGGESTION_RESOLVED_EVENT));
  };

  close?.addEventListener('click', () => {
    saveLanguageSuggestionOptOut(storage, Date.now());
    resolve();
  });

  const scheduleTimeout = () => {
    window.setTimeout(resolve, 4_000);
  };

  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scheduleTimeout);
    });
  } else {
    scheduleTimeout();
  }
}

export function mountLanguageSwitcherPreference(
  storage: Pick<Storage, 'setItem'>,
  root: ParentNode = document,
) {
  root.querySelectorAll<HTMLAnchorElement>('[data-language-switcher="true"]').forEach((link) => {
    link.addEventListener('click', () => {
      const locale = link.dataset.languageSwitcherLocale;
      if (locale === 'fr' || locale === 'en') {
        saveLanguageSuggestionLocale(storage, locale, Date.now());
      }
    });
  });
}
