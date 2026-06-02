import { describe, expect, it } from 'vitest';
import { buildPrimaryCruiseKeyword, buildCruiseStructuredData, buildCruiseSeoImage } from '../src/lib/cruise-seo';

// ── Cycle 17 — SEO keyword derivation ───────────────────────────────────────

describe('buildPrimaryCruiseKeyword — keyword derivation', () => {
  it('uses destinationLabel directly when provided', () => {
    expect(buildPrimaryCruiseKeyword('Bora Bora')).toBe('croisière Bora Bora');
  });

  it('falls back to destination extracted from title when destinationLabel is absent', () => {
    expect(buildPrimaryCruiseKeyword(undefined, 'Croisière en Polynésie | Tahiti Guest Boat')).toBe(
      'croisière Polynésie',
    );
  });

  it('returns undefined when neither destinationLabel nor a parseable title is provided', () => {
    expect(buildPrimaryCruiseKeyword(undefined, undefined)).toBeUndefined();
    expect(buildPrimaryCruiseKeyword('', '')).toBeUndefined();
  });
});

// ── Cycle 18 — Structured data shape ────────────────────────────────────────

const MINIMAL_CRUISE = {
  slug: 'bora-bora',
  title: 'Croisière à Bora Bora',
  destinationLabel: 'Bora Bora',
  seoDescription: 'Une croisière de rêve.',
} as any;

describe('buildCruiseStructuredData — graph shape', () => {
  it('returns a JSON-LD object with @context and @graph', () => {
    const result = buildCruiseStructuredData(MINIMAL_CRUISE, {
      canonicalUrl: 'https://example.com/nos-croisieres/bora-bora/',
    });
    expect(result['@context']).toBe('https://schema.org');
    expect(Array.isArray(result['@graph'])).toBe(true);
  });

  it('includes a TouristTrip node with name, description, and url', () => {
    const result = buildCruiseStructuredData(MINIMAL_CRUISE, {
      canonicalUrl: 'https://example.com/nos-croisieres/bora-bora/',
    });
    const trip = (result['@graph'] as any[]).find((n) => n['@type'] === 'TouristTrip');
    expect(trip).toBeDefined();
    expect(trip.name).toBe('Croisière à Bora Bora');
    expect(trip.description).toBe('Une croisière de rêve.');
    expect(trip.url).toBe('https://example.com/nos-croisieres/bora-bora/');
  });

  it('sets touristType from destinationLabel keyword', () => {
    const result = buildCruiseStructuredData(MINIMAL_CRUISE, {
      canonicalUrl: 'https://example.com/nos-croisieres/bora-bora/',
    });
    const trip = (result['@graph'] as any[]).find((n) => n['@type'] === 'TouristTrip');
    expect(trip.touristType).toBe('croisière Bora Bora');
  });

  it('populates subTrip from itinerary steps that have a dayLabel and description', () => {
    const cruise = {
      ...MINIMAL_CRUISE,
      itinerary: {
        steps: [
          {
            dayLabel: 'Jour 1',
            description: [{ _type: 'block', children: [{ text: 'Départ de Papeete' }] }],
          },
          {
            dayLabel: 'Jour 2',
            description: [{ _type: 'block', children: [{ text: 'Arrivée à Bora Bora' }] }],
          },
        ],
      },
    };
    const result = buildCruiseStructuredData(cruise, {
      canonicalUrl: 'https://example.com/nos-croisieres/bora-bora/',
    });
    const trip = (result['@graph'] as any[]).find((n) => n['@type'] === 'TouristTrip');
    expect(Array.isArray(trip.subTrip)).toBe(true);
    expect(trip.subTrip).toHaveLength(2);
    expect(trip.subTrip[0]).toMatchObject({ '@type': 'TouristTrip', name: 'Jour 1', description: 'Départ de Papeete' });
  });

  it('omits subTrip when itinerary has no steps', () => {
    const result = buildCruiseStructuredData(MINIMAL_CRUISE, {
      canonicalUrl: 'https://example.com/nos-croisieres/bora-bora/',
    });
    const trip = (result['@graph'] as any[]).find((n) => n['@type'] === 'TouristTrip');
    expect(trip.subTrip).toBeUndefined();
  });

  it('adds an ItemList node when relatedCruises are provided', () => {
    const result = buildCruiseStructuredData(MINIMAL_CRUISE, {
      canonicalUrl: 'https://example.com/nos-croisieres/bora-bora/',
      relatedCruises: [
        { slug: 'moorea', title: 'Croisière à Moorea' } as any,
        { slug: 'rangiroa', title: 'Croisière à Rangiroa' } as any,
      ],
    });
    const list = (result['@graph'] as any[]).find((n) => n['@type'] === 'ItemList');
    expect(list).toBeDefined();
    expect(list.itemListElement).toHaveLength(2);
    expect(list.itemListElement[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: 'Croisière à Moorea',
    });
  });

  it('omits ItemList when relatedCruises is empty', () => {
    const result = buildCruiseStructuredData(MINIMAL_CRUISE, {
      canonicalUrl: 'https://example.com/nos-croisieres/bora-bora/',
      relatedCruises: [],
    });
    const list = (result['@graph'] as any[]).find((n) => n['@type'] === 'ItemList');
    expect(list).toBeUndefined();
  });
});

// ── Cycle 19 — SEO image selection ──────────────────────────────────────────

// Sanity refs must follow the pattern image-{id}-{w}x{h}-{ext}
const sanityRef = (id: string) => ({ _type: 'image', asset: { _ref: `image-${id}Aa1Bb2Cc3Dd4Ee5Ff6Gg7-2000x3000-jpg` } });

describe('buildCruiseSeoImage — image source priority', () => {
  it('returns undefined when cruise has no images', () => {
    const result = buildCruiseSeoImage({} as any);
    expect(result).toBeUndefined();
  });

  it('prefers hero.backgroundImage over teaser and featuredImage', () => {
    const cruise = {
      hero: { backgroundImage: sanityRef('heroAAA') },
      cruiseTeaser: { image: sanityRef('teaserBBB') },
      featuredImage: { image: sanityRef('featCCC') },
    } as any;
    const result = buildCruiseSeoImage(cruise);
    expect(typeof result).toBe('string');
    expect(result).toContain('heroAAA');
  });

  it('falls back to cruiseTeaser.image when hero.backgroundImage is absent', () => {
    const cruise = {
      hero: {},
      cruiseTeaser: { image: sanityRef('teaserBBB') },
      featuredImage: { image: sanityRef('featCCC') },
    } as any;
    const result = buildCruiseSeoImage(cruise);
    expect(typeof result).toBe('string');
    expect(result).toContain('teaserBBB');
  });

  it('falls back to featuredImage.image when both hero and teaser images are absent', () => {
    const cruise = {
      featuredImage: { image: sanityRef('featCCC') },
    } as any;
    const result = buildCruiseSeoImage(cruise);
    expect(typeof result).toBe('string');
    expect(result).toContain('featCCC');
  });
});
