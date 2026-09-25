// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readLanguageSuggestionPreference } from '../src/lib/language-suggestion';
import {
  mountLanguageSuggestion,
  mountLanguageSwitcherPreference,
} from '../src/lib/language-suggestion-client';

describe('language suggestion client', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.innerHTML = `
      <aside data-language-suggestion hidden>
        <a data-language-suggestion-action>
          <span data-language-suggestion-flag></span>
          <span data-language-suggestion-label></span>
          <span aria-hidden="true">↗</span>
        </a>
        <button type="button" data-language-suggestion-close></button>
      </aside>
    `;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows one English CTA with the directly published counterpart URL', () => {
    const root = document.querySelector<HTMLElement>('[data-language-suggestion]')!;

    mountLanguageSuggestion({
      root,
      currentLocale: 'fr',
      primaryBrowserLanguage: 'en-AU',
      alternatePaths: { en: '/en/cruises/lagon/' },
      storage: window.localStorage,
    });

    expect(root.hidden).toBe(false);
    expect(root.querySelector('[data-language-suggestion-action]')).toHaveProperty('href', 'http://localhost:3000/en/cruises/lagon/');
    expect(root.textContent).toContain('🇬🇧');
    expect(root.textContent).toContain('View in English');
  });

  it('shows one French CTA when a French browser arrives on an English version', () => {
    const root = document.querySelector<HTMLElement>('[data-language-suggestion]')!;

    mountLanguageSuggestion({
      root,
      currentLocale: 'en',
      primaryBrowserLanguage: 'fr-FR',
      alternatePaths: { fr: '/nos-croisieres/lagon/' },
      storage: window.localStorage,
    });

    expect(root.querySelector('[data-language-suggestion-action]')).toHaveProperty('href', 'http://localhost:3000/nos-croisieres/lagon/');
    expect(root.textContent).toContain('🇫🇷');
    expect(root.textContent).toContain('Voir en français');
  });

  it('hides and globally suppresses the suggestion when the visitor closes it', () => {
    const root = document.querySelector<HTMLElement>('[data-language-suggestion]')!;

    mountLanguageSuggestion({
      root,
      currentLocale: 'fr',
      primaryBrowserLanguage: 'en',
      alternatePaths: { en: '/en/' },
      storage: window.localStorage,
    });
    root.querySelector<HTMLButtonElement>('[data-language-suggestion-close]')!.click();

    expect(root.hidden).toBe(true);
    expect(readLanguageSuggestionPreference(window.localStorage, Date.now())).toEqual({ kind: 'opt-out' });
  });

  it('hides after four seconds without persisting a refusal', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const root = document.querySelector<HTMLElement>('[data-language-suggestion]')!;

    mountLanguageSuggestion({
      root,
      currentLocale: 'fr',
      primaryBrowserLanguage: 'en',
      alternatePaths: { en: '/en/' },
      storage: window.localStorage,
    });
    vi.advanceTimersByTime(4_000);

    expect(root.hidden).toBe(true);
    expect(readLanguageSuggestionPreference(window.localStorage, Date.now())).toBeNull();
  });

  it('starts its four-second countdown after the suggestion has had a chance to paint', () => {
    vi.useFakeTimers();
    const root = document.querySelector<HTMLElement>('[data-language-suggestion]')!;
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });

    mountLanguageSuggestion({
      root,
      currentLocale: 'fr',
      primaryBrowserLanguage: 'en',
      alternatePaths: { en: '/en/' },
      storage: window.localStorage,
    });

    expect(frames).toHaveLength(1);
    frames.shift()!(0);
    expect(frames).toHaveLength(1);
    frames.shift()!(16);

    vi.advanceTimersByTime(3_999);
    expect(root.hidden).toBe(false);

    vi.advanceTimersByTime(1);
    expect(root.hidden).toBe(true);
  });

  it('marks the consent flow pending, then releases it when the suggestion times out', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const root = document.querySelector<HTMLElement>('[data-language-suggestion]')!;
    const releases: Event[] = [];
    window.addEventListener('language-suggestion-resolved', (event) => releases.push(event));

    mountLanguageSuggestion({
      root,
      currentLocale: 'fr',
      primaryBrowserLanguage: 'en',
      alternatePaths: { en: '/en/' },
      storage: window.localStorage,
    });

    expect(document.documentElement.dataset.languageSuggestionPending).toBe('true');

    vi.advanceTimersByTime(4_000);

    expect(document.documentElement.dataset.languageSuggestionPending).toBeUndefined();
    expect(releases).toHaveLength(1);
  });

  it('stores the destination chosen through the global language switcher', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<a href="#" data-language-switcher="true" data-language-switcher-locale="en">English</a>',
    );

    mountLanguageSwitcherPreference(window.localStorage);
    document.querySelector<HTMLAnchorElement>('[data-language-switcher]')!.click();

    expect(readLanguageSuggestionPreference(window.localStorage, Date.now())).toEqual({ kind: 'locale', locale: 'en' });
  });
});
