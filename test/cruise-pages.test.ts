import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import * as cruisesLib from '../src/lib/cruises';

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
