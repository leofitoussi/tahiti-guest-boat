import { describe, expect, it } from 'vitest';
import {
  buildLocalizedMetadata,
  buildLanguageSwitcher,
  localizeHref,
  localizePath,
  stripLocalePrefix,
} from '../src/lib/localization';

describe('localization helpers', () => {
  it('keeps French paths unchanged', () => {
    expect(localizePath('/nos-croisieres/lagon/', 'fr')).toBe('/nos-croisieres/lagon/');
  });

  it('prefixes English paths under /en', () => {
    expect(localizePath('/nos-croisieres/lagon/', 'en')).toBe('/en/nos-croisieres/lagon/');
  });

  it('keeps the English homepage on its canonical trailing-slash path', () => {
    expect(localizePath('/', 'en')).toBe('/en/');
  });

  it('leaves external hrefs untouched', () => {
    expect(localizeHref('https://example.com', 'en')).toBe('https://example.com');
  });

  it('strips the English prefix back to the source path', () => {
    expect(stripLocalePrefix('/en/blog/article/')).toEqual({ locale: 'en', path: '/blog/article/' });
  });

  it('builds localized canonical metadata from a path', () => {
    const metadata = buildLocalizedMetadata('/blog/article/', {
      locale: 'en',
      siteUrl: 'https://example.com',
      alternatePaths: {
        fr: '/blog/article/',
      },
    });

    expect(metadata.lang).toBe('en');
    expect(metadata.canonical).toBe('https://example.com/en/blog/article/');
    expect(metadata.alternates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ locale: 'en', path: 'https://example.com/en/blog/article/' }),
        expect.objectContaining({ locale: 'fr', path: 'https://example.com/blog/article/' }),
      ])
    );
  });

  it('builds a language switcher from published alternate paths only', () => {
    expect(buildLanguageSwitcher('fr', { en: '/en/' })).toEqual([
      { locale: 'fr', label: 'Français', shortLabel: 'FR', isCurrent: true },
      { locale: 'en', label: 'English', shortLabel: 'EN', isCurrent: false, href: '/en/' },
    ]);

    expect(buildLanguageSwitcher('fr')).toEqual([
      { locale: 'fr', label: 'Français', shortLabel: 'FR', isCurrent: true },
    ]);
  });
});
