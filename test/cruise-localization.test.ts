import { access, readFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import { sanityClient } from 'sanity:client';
import { buildCruiseAlternatePaths, buildCruisePath, type CruiseTranslationVersion } from '../src/lib/cruise-routes';
import { getCruiseTranslationVersions } from '../src/lib/cruises';
import { formatReviewDate } from '../src/lib/reviews';
import { localizePath } from '../src/lib/localization';

describe('localized cruise routes', () => {
  it('uses the localized archive segment for each language', () => {
    expect(buildCruisePath('bora-bora', 'fr')).toBe('/nos-croisieres/bora-bora/');
    expect(buildCruisePath('bora-bora', 'en')).toBe('/en/cruises/bora-bora/');
  });

  it('keeps internal French cruise links in the English route family', () => {
    expect(localizePath('/nos-croisieres/', 'en')).toBe('/en/cruises/');
    expect(localizePath('/nos-croisieres/bora-bora/', 'en')).toBe('/en/cruises/bora-bora/');
  });

  it('resolves the language switcher from published translation metadata even when slugs differ', () => {
    const versions: CruiseTranslationVersion[] = [
      { language: 'fr', slug: 'bora-bora-prive', isPublished: true },
      { language: 'en', slug: 'private-bora-bora', isPublished: true },
    ];

    expect(buildCruiseAlternatePaths(versions, 'en')).toEqual({
      fr: '/nos-croisieres/bora-bora-prive/',
    });
    expect(buildCruiseAlternatePaths(versions, 'fr')).toEqual({
      en: '/en/cruises/private-bora-bora/',
    });
  });

  it('does not expose an unpublished translation as an alternate', () => {
    expect(
      buildCruiseAlternatePaths(
        [{ language: 'en', slug: 'private-bora-bora', isPublished: false }],
        'fr',
      ),
    ).toEqual({});
  });

  it('loads the published language versions belonging to one translation metadata document', async () => {
    const fetch = vi.spyOn(sanityClient, 'fetch').mockResolvedValue([
      { _id: 'cruise-fr', language: 'fr', slug: 'bora-bora-prive' },
      { _id: 'cruise-en', language: 'en', slug: 'private-bora-bora' },
    ] as never);

    try {
      await expect(getCruiseTranslationVersions('cruise-fr')).resolves.toEqual([
        { language: 'fr', slug: 'bora-bora-prive', isPublished: true },
        { language: 'en', slug: 'private-bora-bora', isPublished: true },
      ]);
    } finally {
      fetch.mockRestore();
    }
  });

  it('resolves versions from the Sanity metadata reference without legacy group values', async () => {
    const fetch = vi.spyOn(sanityClient, 'fetch').mockResolvedValue([
      { _id: 'cruise-fr', language: 'fr', slug: 'bora-bora-prive' },
      { _id: 'cruise-en', language: 'en', slug: 'private-bora-bora' },
    ] as never);

    try {
      await expect(getCruiseTranslationVersions({ _id: 'cruise-fr' })).resolves.toHaveLength(2);
    } finally {
      fetch.mockRestore();
    }
  });

  it('publishes a static English detail route from English cruise slugs', async () => {
    const route = 'src/pages/en/cruises/[slug].astro';
    await access(route);
    const source = await readFile(route, 'utf8');

    expect(source).toContain("getAllCruiseSlugs('en')");
    expect(source).toContain("getCruisePage(summary.slug, locale)");
    expect(source).toContain("const locale = 'en' as const");
  });

  it('resolves the French detail alternate from the current cruise translation metadata', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');

    expect(source).toContain('getCruiseTranslationVersions(cruise)');
    expect(source).toContain('buildCruiseAlternatePaths(translations, locale)');
    expect(source).toContain('alternatePaths={alternatePaths}');
  });

  it('formats review dates in the language of the cruise page', () => {
    expect(formatReviewDate('2026-08-13T12:00:00.000Z', 'en')).toBe('August 2026');
    expect(formatReviewDate('2026-08-13T12:00:00.000Z', 'fr')).toBe('août 2026');
  });
});
