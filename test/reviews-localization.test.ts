import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { getLocalizedReviewContent } from '../src/lib/reviews';
import type { Review } from '../src/lib/cruises';

const review: Review = {
  _id: 'review-1',
  name: 'Marie',
  originalLanguage: 'fr',
  bodyFr: 'Une expérience magnifique.',
  bodyEn: 'A wonderful experience.',
};

describe('localized review content', () => {
  it('shows the translated text on an English page and keeps the original available', () => {
    expect(getLocalizedReviewContent(review, 'en')).toEqual({
      displayBody: 'A wonderful experience.',
      originalBody: 'Une expérience magnifique.',
      canToggle: true,
    });
  });

  it('shows the French translation on a French page for an English original', () => {
    expect(
      getLocalizedReviewContent(
        {
          ...review,
          originalLanguage: 'en',
          bodyFr: 'Une expérience merveilleuse.',
          bodyEn: 'A wonderful experience.',
        },
        'fr',
      ),
    ).toEqual({
      displayBody: 'Une expérience merveilleuse.',
      originalBody: 'A wonderful experience.',
      canToggle: true,
    });
  });

  it('does not offer a toggle when the page already uses the original language', () => {
    expect(getLocalizedReviewContent(review, 'fr')).toEqual({
      displayBody: 'Une expérience magnifique.',
      originalBody: undefined,
      canToggle: false,
    });
  });

  it('falls back to the available text without offering a toggle during migration', () => {
    expect(
      getLocalizedReviewContent(
        {
          _id: 'review-legacy',
          originalLanguage: 'fr',
          bodyFr: 'Une expérience magnifique.',
        },
        'en',
      ),
    ).toEqual({
      displayBody: 'Une expérience magnifique.',
      originalBody: undefined,
      canToggle: false,
    });
  });

  it('keeps serving legacy review bodies until the Sanity migration is complete', () => {
    expect(
      getLocalizedReviewContent(
        {
          _id: 'review-legacy',
          body: 'A legacy testimonial.',
        },
        'en',
      ),
    ).toEqual({
      displayBody: 'A legacy testimonial.',
      originalBody: undefined,
      canToggle: false,
    });
  });
});

describe('localized review data flow', () => {
  it('projects the bilingual fields and renders an accessible translation control', async () => {
    const [cruisesSource, blockSource, schemaSource] = await Promise.all([
      readFile('src/lib/cruises.ts', 'utf8'),
      readFile('src/components/cruises/ReviewsBlock.astro', 'utf8'),
      readFile('schemas/review.ts', 'utf8'),
    ]);

    expect(cruisesSource).toContain('originalLanguage,');
    expect(cruisesSource).toContain('bodyFr,');
    expect(cruisesSource).toContain('bodyEn,');
    expect(blockSource).toContain('getLocalizedReviewContent');
    expect(blockSource).toContain('data-review-translation-toggle');
    expect(blockSource).toContain('aria-pressed="false"');
    expect(blockSource).not.toContain('dataLayer');
    expect(blockSource).not.toContain('gtag');
    expect(schemaSource).toContain("name: 'originalLanguage'");
    expect(schemaSource).toContain("name: 'bodyFr'");
    expect(schemaSource).toContain("name: 'bodyEn'");
  });
});
