// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { mountCookieConsent } from '../src/lib/cookie-consent-client';

describe('cookie consent client', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-language-suggestion-pending');
    document.body.innerHTML = '<div data-cookie-consent class="hidden" hidden></div>';
  });

  it('defers the cookie banner until an unresolved language suggestion releases it', () => {
    const root = document.querySelector<HTMLElement>('[data-cookie-consent]')!;
    document.documentElement.setAttribute('data-language-suggestion-pending', 'true');

    mountCookieConsent(root);

    expect(root.hidden).toBe(true);

    document.documentElement.removeAttribute('data-language-suggestion-pending');
    window.dispatchEvent(new CustomEvent('language-suggestion-resolved'));

    expect(root.hidden).toBe(false);
    expect(root.dataset.open).toBe('true');
  });
});
