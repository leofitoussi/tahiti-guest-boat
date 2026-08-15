import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { sanityClient } from 'sanity:client';
import { schemaTypes } from '../schemas';
import { legalPage } from '../schemas/legalPage';
import { buildLegalAlternatePaths } from '../src/lib/legal-routes';
import * as legalPagesLib from '../src/lib/legal-pages';

describe('legal page route template', () => {
  it('exists as a dynamic Astro route', async () => {
    const source = await readFile('src/pages/[slug].astro', 'utf8');

    expect(source).toContain('getLegalPage');
  });

  it('uses PortableText to render body, not PageBuilder', async () => {
    const source = await readFile('src/components/legal/LegalPageView.astro', 'utf8');

    expect(source).toContain('PortableText');
    expect(source).not.toContain('PageBuilder');
  });
});

describe('legal pages lib', () => {
  it('exports getLegalPage as a function', () => {
    expect(typeof legalPagesLib.getLegalPage).toBe('function');
  });

  it('exports getLegalPages as a function', () => {
    expect(typeof legalPagesLib.getLegalPages).toBe('function');
  });

  it('offers a published alternate even when that alternate is not indexable', async () => {
    const fetch = vi.spyOn(sanityClient, 'fetch').mockResolvedValue([
      {
        language: 'fr',
        slug: 'politique-de-confidentialite',
        seo: { indexable: true },
      },
      {
        language: 'en',
        slug: 'privacy-policy',
        seo: { indexable: false },
      },
    ] as never);

    try {
      const versions = await legalPagesLib.getLegalTranslationVersions({
        _id: 'legal-privacy-fr',
        translationGroup: 'privacy-policy',
      });

      expect(buildLegalAlternatePaths(versions, 'fr')).toEqual({
        en: '/en/privacy-policy/',
      });
    } finally {
      fetch.mockRestore();
    }
  });

  it('builds reciprocal French and English paths for a legal translation group', () => {
    const versions = [
      { locale: 'fr' as const, slug: 'politique-de-confidentialite', isPublished: true },
      { locale: 'en' as const, slug: 'privacy-policy', isPublished: true },
    ];

    expect(buildLegalAlternatePaths(versions, 'fr')).toEqual({
      en: '/en/privacy-policy/',
    });
    expect(buildLegalAlternatePaths(versions, 'en')).toEqual({
      fr: '/politique-de-confidentialite/',
    });
  });
});

describe('legal page schema', () => {
  it('registers legalPage as a document', () => {
    const documentNames = schemaTypes
      .filter((s) => s.type === 'document')
      .map((s) => s.name);

    expect(documentNames).toContain('legalPage');
  });

  it('has title, slug, body, seoTitle, and seoDescription fields', () => {
    const fieldNames = legalPage.fields.map((f) => f.name);

    expect(fieldNames).toEqual(
      expect.arrayContaining(['title', 'slug', 'locale', 'translationGroup', 'body', 'seoTitle', 'seoDescription'])
    );
  });

  it('uses richText for body with no page-builder block types', () => {
    const bodyField = legalPage.fields.find((f) => f.name === 'body') as any;

    expect(bodyField.type).toBe('array');

    const memberTypes: string[] = bodyField.of.map((m: any) => m.type);
    const pageBuilderTypes = [
      'heroHeaderBlock', 'homeHeroBlock', 'galleryBlock',
      'editorialBlock', 'boatBlock', 'videoFeatureBlock', 'whyUsBlock',
      'reviewsBlock', 'bookingBlock', 'relatedCruisesBlock', 'fullWidthImageBlock',
    ];
    for (const t of pageBuilderTypes) {
      expect(memberTypes).not.toContain(t);
    }
  });
});
