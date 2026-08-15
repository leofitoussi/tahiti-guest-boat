import { describe, expect, it } from 'vitest';
import { auditLocalizedContent } from '../src/lib/content-parity';

const frenchArticle = {
  body: [
    { _type: 'block', children: [{ text: 'Premier paragraphe français.' }] },
    { _type: 'block', children: [{ text: 'Deuxième paragraphe français.' }] },
    { _type: 'image', alt: 'Une image française' },
  ],
  mainImage: { alt: 'Image principale française' },
};

describe('localized content parity', () => {
  it('rejects abridged English content and French internal links', () => {
    const issues = auditLocalizedContent(frenchArticle, {
      body: [
        { _type: 'block', children: [{ text: 'First paragraph.' }] },
      ],
      mainImage: { alt: 'English main image' },
      primaryCruise: { _ref: 'croisiere-fr' },
      ctaUrl: '/nos-croisieres/croisiere-fr/',
    });

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['portable-text-block-count', 'image-count', 'french-link']),
    );
  });

  it('accepts a complete English translation with preserved media and relations', () => {
    const issues = auditLocalizedContent(frenchArticle, {
      body: [
        { _type: 'block', children: [{ text: 'First paragraph.' }] },
        { _type: 'block', children: [{ text: 'Second paragraph.' }] },
        { _type: 'image', alt: 'An English image' },
      ],
      mainImage: { alt: 'English main image' },
      primaryCruise: { _ref: 'cruisePage-en' },
      ctaUrl: '/en/cruises/cruise-en/',
    });

    expect(issues).toEqual([]);
  });

  it('rejects missing alt text and placeholder copy', () => {
    const issues = auditLocalizedContent(frenchArticle, {
      body: [
        { _type: 'block', children: [{ text: 'TODO: translate this section' }] },
        { _type: 'block', children: [{ text: 'Complete English text.' }] },
        { _type: 'image' },
      ],
      mainImage: {},
    });

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['missing-image-alt', 'placeholder-copy']),
    );
  });
});
