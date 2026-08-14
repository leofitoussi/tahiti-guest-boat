import { describe, expect, it } from 'vitest';
import { selectLocalizedReference } from '../src/lib/localized-references';
import { localizeBlogPostReferences, type BlogPost } from '../src/lib/blog';

describe('localized editorial references', () => {
  it('selects the matching published language version even when its slug differs', () => {
    const french = { _id: 'cruise-fr', language: 'fr' as const, translationGroup: 'bora', title: 'Bora Bora', slug: 'bora-bora-prive' };
    const english = { _id: 'cruise-en', language: 'en' as const, translationGroup: 'bora', title: 'Bora Bora', slug: 'private-bora-bora' };

    expect(selectLocalizedReference(french, [french, english], 'en')).toEqual(english);
  });

  it('does not fall back to the source language when the target version is unavailable', () => {
    const french = { _id: 'cruise-fr', language: 'fr' as const, translationGroup: 'bora', title: 'Bora Bora', slug: 'bora-bora-prive' };

    expect(selectLocalizedReference(french, [french], 'en')).toBeNull();
  });

  it('does not expose an unpublished target version as a public relation', () => {
    const french = { _id: 'cruise-fr', language: 'fr' as const, translationGroup: 'bora', title: 'Bora Bora', slug: 'bora-bora-prive' };
    const englishDraft = {
      _id: 'cruise-en',
      language: 'en' as const,
      translationGroup: 'bora',
      title: 'Bora Bora',
      slug: 'private-bora-bora',
      isPublished: false,
    };

    expect(selectLocalizedReference(french, [french, englishDraft], 'en')).toBeNull();
  });

  it('remaps an Article primary and secondary cruise relations to the current language', () => {
    const frenchPrimary = { _id: 'primary-fr', language: 'fr' as const, translationGroup: 'primary', title: 'Bora Bora', slug: 'bora-bora' };
    const englishPrimary = { _id: 'primary-en', language: 'en' as const, translationGroup: 'primary', title: 'Bora Bora', slug: 'private-bora-bora' };
    const frenchSecondary = { _id: 'secondary-fr', language: 'fr' as const, translationGroup: 'secondary', title: 'Maupiti', slug: 'maupiti' };

    const post = {
      title: 'English Article',
      slug: 'english-article',
      primaryCruise: frenchPrimary,
      secondaryCruises: [frenchSecondary],
    } as BlogPost;

    expect(localizeBlogPostReferences(post, [frenchPrimary, englishPrimary, frenchSecondary], 'en')).toMatchObject({
      primaryCruise: englishPrimary,
      secondaryCruises: [],
    });
  });
});
