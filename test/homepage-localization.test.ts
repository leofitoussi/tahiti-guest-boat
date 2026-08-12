import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { sanityClient } from 'sanity:client';
import { getHomePagePair, resolveHomePageVersion, type HomePagePair } from '../src/lib/home-page';
import { buildOpenGraphLocale } from '../src/lib/localization';

describe('Homepage language versions', () => {
  it('serves English only when the published version is linked to the French source', () => {
    const source = { _id: 'home-fr', language: 'fr' as const };
    const linkedEnglish = { _id: 'home-en', language: 'en' as const };

    const pair: HomePagePair = {
      source,
      translations: [{ document: linkedEnglish }],
    };

    expect(resolveHomePageVersion(pair, 'en')).toEqual(linkedEnglish);
    expect(resolveHomePageVersion({ source, translations: [] }, 'en')).toBeNull();
  });

  it('loads the source and its reference-linked translations as one pair', async () => {
    const pair: HomePagePair = {
      source: { _id: 'home-fr', language: 'fr' },
      translations: [{ document: { _id: 'home-en', language: 'en' } }],
    };
    const fetch = vi.spyOn(sanityClient, 'fetch').mockResolvedValue(pair as never);

    try {
      await expect(getHomePagePair()).resolves.toEqual(pair);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('references($homePageId)'),
        expect.objectContaining({ homePageId: expect.any(String) }),
      );
    } finally {
      fetch.mockRestore();
    }
  });

  it('models the Homepage language as a Studio-controlled field', async () => {
    const { homePage } = await import('../schemas/homePage');
    const language = (homePage.fields as any[]).find((field) => field.name === 'language');

    expect(language).toMatchObject({ name: 'language', type: 'string', hidden: true, readOnly: true });

    const preview = homePage.preview as any;
    expect(preview.prepare({ title: 'Homepage', media: undefined, language: 'en' }).subtitle).toContain('EN');
  });

  it('enables reference-backed translation management for Homepages in the Studio', async () => {
    const config = await readFile('sanity.config.ts', 'utf8');

    expect(config).toContain("documentInternationalization({");
    expect(config).toContain("schemaTypes: ['homePage']");
    expect(config).toContain('allowCreateMetaDoc: true');
  });

  it('uses a language-specific Open Graph locale', () => {
    expect(buildOpenGraphLocale('fr')).toBe('fr_FR');
    expect(buildOpenGraphLocale('en')).toBe('en_US');
  });
});
