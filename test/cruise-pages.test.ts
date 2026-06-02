import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import * as cruisesLib from '../src/lib/cruises';
import { cruisePage } from '../schemas/cruisePage';
import { itineraryBlock } from '../schemas/itineraryBlock';
import { itineraryStep } from '../schemas/itineraryStep';
import { getSiteCopy } from '../src/lib/site-copy';

class ValidationProbe {
  calls: string[] = [];

  required() {
    this.calls.push('required');
    return this;
  }

  warning() {
    this.calls.push('warning');
    return this;
  }

  max() {
    this.calls.push('max');
    return this;
  }
}

describe('Page croisière schema — fixed template base fields', () => {
  it('exposes destination label and editorial priority for shared copy and Autres croisières ordering', () => {
    const fields = Object.fromEntries(cruisePage.fields.map((field) => [field.name, field]));

    expect(fields.destinationLabel).toMatchObject({
      title: 'Libellé destination',
      type: 'string',
    });
    expect(fields.editorialPriority).toMatchObject({
      title: 'Priorité éditoriale',
      type: 'number',
    });
  });

  it('models Hero croisière and Accroche croisière as distinct fixed-template concepts', () => {
    const fields = Object.fromEntries(cruisePage.fields.map((field) => [field.name, field as any]));
    const cruiseTeaserFields = Object.fromEntries(
      fields.cruiseTeaser.fields.map((field: any) => [field.name, field]),
    );

    expect(fields.hero).toMatchObject({
      title: 'Hero croisière',
      type: 'heroBlock',
    });
    expect(fields.cruiseTeaser).toMatchObject({
      title: 'Accroche croisière',
      type: 'object',
    });
    expect(Object.keys(cruiseTeaserFields)).toEqual(['headline', 'capacity', 'minimumDuration', 'pricing', 'image']);
    expect(cruiseTeaserFields).not.toHaveProperty('icon');
  });

  it('warns about important missing template sections without blocking publication', () => {
    const fields = Object.fromEntries(cruisePage.fields.map((field) => [field.name, field as any]));

    for (const fieldName of ['hero', 'cruiseTeaser', 'pitch', 'featuredImage', 'boat', 'itinerary']) {
      const rule = new ValidationProbe();

      fields[fieldName].validation(rule);

      expect(rule.calls, `${fieldName} should guide editors with a warning`).toContain('warning');
      expect(rule.calls, `${fieldName} should warn when missing`).toContain('required');
    }
  });

  it('does not copy shared block content or page-builder placeholders into Page croisière documents', () => {
    const fieldNames = cruisePage.fields.map((field) => field.name);

    expect(fieldNames).not.toEqual(expect.arrayContaining(['pageBuilder', 'whyUsBlock', 'reviewsBlock']));
  });
});

// ── Cycle 4 ─────────────────────────────────────────────────────────────────
describe('related cruises — dynamic & exclusive', () => {
  it('GROQ query for related cruises excludes the current cruise by slug', async () => {
    const source = await readFile('src/lib/cruises.ts', 'utf8');
    // The query must filter out the page being viewed
    expect(source).toContain('slug.current != $slug');
  });

  it('the cruise template passes the current slug to getRelatedCruises', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');
    expect(source).toContain('getRelatedCruises');
    // Called with the current cruise slug so the current page is excluded
    expect(source).toContain('cruise.slug');
  });

  it('RelatedCruisesBlock renders nothing when cruises array is empty', async () => {
    const source = await readFile('src/components/cruises/RelatedCruisesBlock.astro', 'utf8');
    // Guard that prevents the section from rendering if no related cruises
    expect(source).toContain('cruises.length > 0');
  });
});

// ── Cycle 5 ─────────────────────────────────────────────────────────────────
describe('Autres croisières — no arbitrary limit', () => {
  it('RELATED_CRUISES_QUERY fetches all cruises without a slice limit', async () => {
    const source = await readFile('src/lib/cruises.ts', 'utf8');
    // Must not cap results with a GROQ slice — all other cruises are shown
    expect(source).not.toMatch(/RELATED_CRUISES_QUERY[\s\S]*?\[0\s*\.\.\.\s*\$limit\]/);
  });

  it('getRelatedCruises does not accept a limit parameter', () => {
    // Signature should be (slug, locale) — no limit arg that could silently truncate
    expect(cruisesLib.getRelatedCruises.length).toBeLessThanOrEqual(2);
  });

  it('cruise template calls getRelatedCruises without a limit argument', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');
    expect(source).not.toMatch(/getRelatedCruises\(.*?,\s*\d+/);
  });
});

// ── Cycle 6 ─────────────────────────────────────────────────────────────────
describe('Autres croisières — horizontal overflow', () => {
  it('RelatedCruisesBlock uses a horizontal scroll container', async () => {
    const source = await readFile('src/components/cruises/RelatedCruisesBlock.astro', 'utf8');
    expect(source).toMatch(/overflow-x-auto|overflow-x:.*auto|scroll-x/);
  });

  it('RelatedCruisesBlock cards have a stable fixed width (no flex-wrap)', async () => {
    const source = await readFile('src/components/cruises/RelatedCruisesBlock.astro', 'utf8');
    expect(source).not.toContain('flex-wrap');
    expect(source).toMatch(/min-w-|w-\[/);
  });
});

// ── Cycle 3 ─────────────────────────────────────────────────────────────────
describe('cruises lib — getRelatedCruises', () => {
  it('exports getRelatedCruises as a function', () => {
    expect(typeof cruisesLib.getRelatedCruises).toBe('function');
  });

  it('exports getCruisePages as a function', () => {
    expect(typeof cruisesLib.getCruisePages).toBe('function');
  });

  it('exports getCruisePage as a function', () => {
    expect(typeof cruisesLib.getCruisePage).toBe('function');
  });

  it('queries Page croisière base fields and orders Autres croisières by editorial priority', async () => {
    const source = await readFile('src/lib/cruises.ts', 'utf8');

    expect(source).toContain('destinationLabel');
    expect(source).toContain('editorialPriority');
    expect(source).toContain('cruiseTeaser');
    expect(source).toContain('order(coalesce(editorialPriority, 0) desc, _createdAt desc)');
  });
});

// ── Cycle 2 ─────────────────────────────────────────────────────────────────
describe('cruise archive — /nos-croisieres/', () => {
  it('imports getCruisePages to populate the archive list', async () => {
    const source = await readFile('src/pages/nos-croisieres/index.astro', 'utf8');
    expect(source).toContain('getCruisePages');
  });

  it('links each cruise card to /nos-croisieres/[slug]/', async () => {
    const source = await readFile('src/pages/nos-croisieres/index.astro', 'utf8');
    expect(source).toContain('/nos-croisieres/${cruise.slug}/');
  });
});

// ── Cycle 1 ─────────────────────────────────────────────────────────────────
// (was already in correct state — tests pin the expected order)

describe('cruise page template — fixed section order', () => {
  it('renders Pourquoi choisir Tahiti Guest Boat and Avis Google from shared data implicitly', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');

    expect(source).toContain('getSiteSettings');
    expect(source).toContain('getReviews');
    expect(source).toContain('<WhyUsBlock settings={settings} locale={locale} />');
    expect(source).toContain('<ReviewsBlock reviews={reviews} locale={locale} />');
  });

  it('renders sections in the fixed order: Hero → Pitch → FullWidthImage → Boat → Itinerary → WhyUs → Reviews → Booking → RelatedCruises', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');

    const ORDERED_SECTIONS = [
      'HeroBlock',
      'PitchBlock',
      'FullWidthImageBlock',
      'BoatBlock',
      'ItineraryBlock',
      'WhyUsBlock',
      'ReviewsBlock',
      'BookingBlock',
      'RelatedCruisesBlock',
    ];

    let lastIndex = -1;
    for (const section of ORDERED_SECTIONS) {
      const idx = source.indexOf(`<${section}`);
      expect(idx, `<${section} should be present in the template`).toBeGreaterThan(-1);
      expect(idx, `<${section} should come after the previous section`).toBeGreaterThan(lastIndex);
      lastIndex = idx;
    }
  });
});

// ── Cycle 5 — Itinéraire indicatif ──────────────────────────────────────────

describe('Itinéraire indicatif — shared disclaimer in site copy', () => {
  it('getSiteCopy provides a non-empty itineraryDisclaimer for the fr locale', () => {
    const copy = getSiteCopy('fr');
    expect(typeof copy.blocks.itineraryDisclaimer).toBe('string');
    expect(copy.blocks.itineraryDisclaimer.length).toBeGreaterThan(10);
  });

  it('getSiteCopy provides a non-empty itineraryDisclaimer for the en locale', () => {
    const copy = getSiteCopy('en');
    expect(typeof copy.blocks.itineraryDisclaimer).toBe('string');
    expect(copy.blocks.itineraryDisclaimer.length).toBeGreaterThan(10);
  });
});

describe('Itinéraire indicatif — schema shape', () => {
  it('itineraryBlock does not expose a per-page disclaimer field', () => {
    const fieldNames = itineraryBlock.fields.map((f) => f.name);
    expect(fieldNames).not.toContain('disclaimer');
  });

  it('itineraryBlock has title, route, and steps', () => {
    const fieldNames = itineraryBlock.fields.map((f) => f.name);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('route');
    expect(fieldNames).toContain('steps');
  });

  it('itineraryStep has dayLabel, rich-text description, and optional image', () => {
    const fields = Object.fromEntries(itineraryStep.fields.map((f) => [f.name, f]));
    expect(fields.dayLabel).toMatchObject({ type: 'string' });
    expect(fields.description).toMatchObject({ type: 'array' });
    expect(fields.image).toMatchObject({ type: 'image' });
  });
});

describe('Itinéraire indicatif — GROQ projection', () => {
  it('cruises.ts projects itinerary steps with image metadata', async () => {
    const source = await readFile('src/lib/cruises.ts', 'utf8');
    expect(source).toContain('itinerary{');
    expect(source).toContain('steps[]{');
    expect(source).toContain('"metadata"');
  });
});

// ── Cycle 6 — Bloc réservation shared + destination-aware ───────────────────

describe('BookingBlock — destination-aware title', () => {
  it('BookingBlock reads destinationLabel prop to compose the title', async () => {
    const source = await readFile('src/components/cruises/BookingBlock.astro', 'utf8');
    expect(source).toContain('destinationLabel');
  });

  it('BookingBlock composes title with destinationLabel when provided', async () => {
    const source = await readFile('src/components/cruises/BookingBlock.astro', 'utf8');
    // Title must branch on destinationLabel presence
    expect(source).toMatch(/destinationLabel/);
    // Destination label must appear in the rendered heading
    expect(source).toMatch(/destinationLabel.*title|title.*destinationLabel/s);
  });

  it('cruise page template passes destinationLabel to BookingBlock', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');
    expect(source).toContain('destinationLabel={cruise.destinationLabel}');
  });

  it('cruisePage schema has no per-page booking fields', () => {
    const fieldNames = cruisePage.fields.map((f) => f.name);
    expect(fieldNames).not.toContain('bookingTitle');
    expect(fieldNames).not.toContain('tallyFormId');
    expect(fieldNames).not.toContain('bookingEmbed');
  });
});

describe('Itinéraire indicatif — component', () => {
  it('ItineraryBlock uses details/summary accordion for periods', async () => {
    const source = await readFile('src/components/cruises/ItineraryBlock.astro', 'utf8');
    expect(source).toContain('<details');
    expect(source).toContain('<summary');
  });

  it('ItineraryBlock renders the shared disclaimer from site copy, not a per-page field', async () => {
    const source = await readFile('src/components/cruises/ItineraryBlock.astro', 'utf8');
    expect(source).toContain('itineraryDisclaimer');
    expect(source).not.toContain('block.disclaimer');
  });

  it('ItineraryBlock does not render when steps are absent or empty', async () => {
    const source = await readFile('src/components/cruises/ItineraryBlock.astro', 'utf8');
    expect(source).toMatch(/block\.steps.*length|block\.steps\s*&&|block\.steps\?/);
  });
});
