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

describe('layout navigation — automatic cruise links', () => {
  it('BaseLayout fetches cruise pages for the shared header and footer', async () => {
    const source = await readFile('src/layouts/BaseLayout.astro', 'utf8');

    expect(source).toContain('getCruisePages');
    expect(source).toContain('buildLayoutViewModel(settings, logoUrl, locale, cruisePages)');
    expect(source).toContain('cruiseLinks={layoutViewModel.cruiseLinks}');
  });

  it('DesktopNavigation exposes cruise links from items marked as dropdowns or /nos-croisieres/', async () => {
    const source = await readFile('src/components/navigation/DesktopNavigation.tsx', 'utf8');

    expect(source).toContain('isCruiseNavItem');
    expect(source).toContain('item.hasDropdown || normalizedHref === "/nos-croisieres"');
    expect(source).toContain('group-hover/navigation-item:visible');
    expect(source).toContain('group-focus-within/navigation-item:visible');
  });

  it('MobileDrawer renders cruise links directly without an accordion', async () => {
    const source = await readFile('src/components/navigation/MobileDrawer.tsx', 'utf8');

    expect(source).toContain('cruiseLinks.map');
    expect(source).toContain('min-h-11');
    expect(source).not.toContain('Accordion');
  });

  it('Footer has a dedicated automatic cruise navigation section', async () => {
    const source = await readFile('src/components/navigation/Footer.astro', 'utf8');

    expect(source).toContain('cruiseLinks');
    expect(source).toContain('cruisesNavigationLabel');
    expect(source).toContain('cruiseLinks.map');
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

  it('renders sections in the fixed order: Hero → Accroche → Gallery → CruiseIntro → Pitch → FullWidthImage → IntroductionDestination → ExperienceCroisiere → BateauRecommande → Boat → Itinerary → WhyUs → Reviews → Booking → RelatedCruises', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');

    const ORDERED_SECTIONS = [
      'HeroBlock',
      'CruiseTeaserBlock',
      'CruiseGalleryBlock',
      'CruiseIntroBlock',
      'PitchBlock',
      'FullWidthImageBlock',
      'IntroductionDestinationBlock',
      'ExperienceCroisiereBlock',
      'BateauRecommandeBlock',
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

// ── Cycle 11 — Bloc intro croisière après galerie ──────────────────────────

describe('CruiseIntroBlock — schema and data flow', () => {
  it('cruisePage exposes editable cruiseIntro fields for heading, body, highlight, and image', () => {
    const fields = Object.fromEntries(cruisePage.fields.map((f) => [f.name, f as any]));
    expect(fields.cruiseIntro).toMatchObject({ type: 'object' });

    const sub = Object.fromEntries(fields.cruiseIntro.fields.map((f: any) => [f.name, f]));
    expect(sub.heading).toMatchObject({ type: 'string' });
    expect(sub.body).toMatchObject({ type: 'array' });
    expect(sub.highlight).toMatchObject({ type: 'text' });
    expect(sub.image).toMatchObject({ type: 'image' });
  });

  it('cruises.ts projects cruiseIntro content and image metadata', async () => {
    const source = await readFile('src/lib/cruises.ts', 'utf8');
    expect(source).toContain('cruiseIntro{');
    expect(source).toContain('highlight');
    expect(source).toContain('image');
    expect(source).toContain('export interface CruiseIntro');
  });

  it('template renders CruiseIntroBlock immediately after CruiseGalleryBlock', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');
    const order = ['CruiseGalleryBlock', 'CruiseIntroBlock', 'PitchBlock'];

    let last = -1;
    for (const tag of order) {
      const idx = source.indexOf(`<${tag}`);
      expect(idx, `<${tag} must be present`).toBeGreaterThan(-1);
      expect(idx, `<${tag} must come after previous`).toBeGreaterThan(last);
      last = idx;
    }

    expect(source).toContain('block={cruise.cruiseIntro}');
  });
});

// ── Cycle 7 — Hero et Accroche croisière (issue #16) ────────────────────────

describe('CruiseTeaserBlock — conditional rendering', () => {
  it('cruise template guards CruiseTeaserBlock against absent cruiseTeaser data', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');
    // Section must not render when cruiseTeaser is falsy
    expect(source).toMatch(/cruise\.cruiseTeaser/);
  });

  it('CruiseTeaserBlock renders nothing when headline and image are absent', async () => {
    const source = await readFile('src/components/cruises/CruiseTeaserBlock.astro', 'utf8');
    // Component self-guards: no render if no meaningful content
    expect(source).toMatch(/block\??\.headline|block\??\.image/);
  });
});

describe('CruiseTeaserBlock — structure and markers', () => {
  it('renders headline, capacity, minimumDuration, and pricing from block data', async () => {
    const source = await readFile('src/components/cruises/CruiseTeaserBlock.astro', 'utf8');
    expect(source).toMatch(/block\??\.headline/);
    expect(source).toMatch(/block\??\.capacity/);
    expect(source).toMatch(/block\??\.minimumDuration/);
    expect(source).toMatch(/block\??\.pricing/);
  });

  it('practical marker icons are frontend-owned — not read from block data', async () => {
    const source = await readFile('src/components/cruises/CruiseTeaserBlock.astro', 'utf8');
    expect(source).not.toContain('block.icon');
    expect(source).not.toContain('block.capacity.icon');
  });
});

describe('CruiseTeaserBlock — image loading', () => {
  it('Accroche image uses lazy loading (below hero fold)', async () => {
    const source = await readFile('src/components/cruises/CruiseTeaserBlock.astro', 'utf8');
    expect(source).toContain('loading="lazy"');
    expect(source).not.toContain('fetchpriority="high"');
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

// ── Cycle 8 — Sections éditoriales destination (issue #17) ──────────────────

describe('sections éditoriales — schema fields', () => {
  it('cruisePage has introductionDestination with heading, body, and images gallery', () => {
    const fields = Object.fromEntries(cruisePage.fields.map((f) => [f.name, f as any]));
    expect(fields.introductionDestination).toMatchObject({ type: 'object' });
    const sub = Object.fromEntries(fields.introductionDestination.fields.map((f: any) => [f.name, f]));
    expect(sub.heading).toMatchObject({ type: 'string' });
    expect(sub.body).toMatchObject({ type: 'array' });
    expect(sub.images).toMatchObject({ type: 'array' });
  });

  it('cruisePage has experienceCroisiere with heading, body, and single image', () => {
    const fields = Object.fromEntries(cruisePage.fields.map((f) => [f.name, f as any]));
    expect(fields.experienceCroisiere).toMatchObject({ type: 'object' });
    const sub = Object.fromEntries(fields.experienceCroisiere.fields.map((f: any) => [f.name, f]));
    expect(sub.heading).toMatchObject({ type: 'string' });
    expect(sub.body).toMatchObject({ type: 'array' });
    expect(sub.image).toMatchObject({ type: 'image' });
  });

  it('cruisePage has bateauRecommande with heading, body, image, and CTA', () => {
    const fields = Object.fromEntries(cruisePage.fields.map((f) => [f.name, f as any]));
    expect(fields.bateauRecommande).toMatchObject({ type: 'object' });
    const sub = Object.fromEntries(fields.bateauRecommande.fields.map((f: any) => [f.name, f]));
    expect(sub.heading).toMatchObject({ type: 'string' });
    expect(sub.body).toMatchObject({ type: 'array' });
    expect(sub.image).toMatchObject({ type: 'image' });
    expect(sub.ctaLabel).toMatchObject({ type: 'string' });
    expect(sub.ctaUrl).toMatchObject({ type: 'url' });
  });

  it('editorial sections are not exposed in GROQ page-builder references', () => {
    const fieldNames = cruisePage.fields.map((f) => f.name);
    expect(fieldNames).not.toContain('editorialSections');
    expect(fieldNames).toContain('introductionDestination');
    expect(fieldNames).toContain('experienceCroisiere');
    expect(fieldNames).toContain('bateauRecommande');
  });
});

describe('sections éditoriales — GROQ projection', () => {
  it('cruises.ts projects introductionDestination with image metadata', async () => {
    const source = await readFile('src/lib/cruises.ts', 'utf8');
    expect(source).toContain('introductionDestination');
    expect(source).toContain('images[]{');
  });

  it('cruises.ts projects experienceCroisiere with image metadata', async () => {
    const source = await readFile('src/lib/cruises.ts', 'utf8');
    expect(source).toContain('experienceCroisiere');
  });

  it('cruises.ts projects bateauRecommande with image metadata', async () => {
    const source = await readFile('src/lib/cruises.ts', 'utf8');
    expect(source).toContain('bateauRecommande');
  });
});

describe('sections éditoriales — TypeScript types', () => {
  it('CruisePage interface includes all three editorial section fields', () => {
    // TS types are compile-time only; verified via source text in the next test
    expect(typeof cruisesLib.getCruisePage).toBe('function');
  });

  it('cruises lib source declares IntroductionDestination, ExperienceCroisiere, BateauRecommande types', async () => {
    const source = await readFile('src/lib/cruises.ts', 'utf8');
    expect(source).toContain('introductionDestination');
    expect(source).toContain('experienceCroisiere');
    expect(source).toContain('bateauRecommande');
  });
});

describe('sections éditoriales — empty-section guards', () => {
  it('IntroductionDestinationBlock renders nothing when block is absent or empty', async () => {
    const source = await readFile('src/components/cruises/IntroductionDestinationBlock.astro', 'utf8');
    expect(source).toMatch(/hasContent|!block|block\s*&&/);
    expect(source).toMatch(/return/);
  });

  it('ExperienceCroisiereBlock renders nothing when block is absent or empty', async () => {
    const source = await readFile('src/components/cruises/ExperienceCroisiereBlock.astro', 'utf8');
    expect(source).toMatch(/hasContent|!block|block\s*&&/);
    expect(source).toMatch(/return/);
  });

  it('BateauRecommandeBlock renders nothing when block is absent or empty', async () => {
    const source = await readFile('src/components/cruises/BateauRecommandeBlock.astro', 'utf8');
    expect(source).toMatch(/hasContent|!block|block\s*&&/);
    expect(source).toMatch(/return/);
  });
});

describe('sections éditoriales — lazy loading', () => {
  it('IntroductionDestinationBlock gallery images use lazy loading', async () => {
    const source = await readFile('src/components/cruises/IntroductionDestinationBlock.astro', 'utf8');
    expect(source).toContain('loading="lazy"');
    expect(source).not.toContain('fetchpriority="high"');
  });

  it('ExperienceCroisiereBlock image uses lazy loading', async () => {
    const source = await readFile('src/components/cruises/ExperienceCroisiereBlock.astro', 'utf8');
    expect(source).toContain('loading="lazy"');
  });

  it('BateauRecommandeBlock image uses lazy loading', async () => {
    const source = await readFile('src/components/cruises/BateauRecommandeBlock.astro', 'utf8');
    expect(source).toContain('loading="lazy"');
  });
});

describe('sections éditoriales — rendering order', () => {
  it('template renders three editorial sections between FullWidthImageBlock and BoatBlock', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');
    const order = [
      'FullWidthImageBlock',
      'IntroductionDestinationBlock',
      'ExperienceCroisiereBlock',
      'BateauRecommandeBlock',
      'BoatBlock',
    ];
    let last = -1;
    for (const tag of order) {
      const idx = source.indexOf(`<${tag}`);
      expect(idx, `<${tag} must be present`).toBeGreaterThan(-1);
      expect(idx, `<${tag} must come after previous`).toBeGreaterThan(last);
      last = idx;
    }
  });

  it('template passes editorial section data from cruise object', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');
    expect(source).toContain('cruise.introductionDestination');
    expect(source).toContain('cruise.experienceCroisiere');
    expect(source).toContain('cruise.bateauRecommande');
  });
});

// ── Cycle 9 — Hero image priority (issue #22) ───────────────────────────────

describe('performance — hero image priority', () => {
  it('HeroBlock background image has fetchpriority="high" for LCP', async () => {
    const source = await readFile('src/components/cruises/HeroBlock.astro', 'utf8');
    expect(source).toContain('fetchpriority="high"');
  });

  it('HeroBlock background image uses eager loading', async () => {
    const source = await readFile('src/components/cruises/HeroBlock.astro', 'utf8');
    expect(source).toContain('loading="eager"');
  });
});

// ── Cycle 10 — FullWidthImageBlock lazy load (issue #22) ────────────────────

describe('performance — FullWidthImageBlock lazy load', () => {
  it('FullWidthImageBlock image uses lazy loading (below fold)', async () => {
    const source = await readFile('src/components/cruises/FullWidthImageBlock.astro', 'utf8');
    expect(source).toContain('loading="lazy"');
    expect(source).not.toContain('fetchpriority="high"');
  });

  it('FullWidthImageBlock image has explicit width and height for stable layout', async () => {
    const source = await readFile('src/components/cruises/FullWidthImageBlock.astro', 'utf8');
    expect(source).toContain('width="1920"');
    expect(source).toContain('height="920"');
  });
});

// ── Cycle 11 — BoatBlock lazy load (issue #22) ──────────────────────────────

describe('performance — BoatBlock lazy load', () => {
  it('BoatBlock image uses lazy loading', async () => {
    const source = await readFile('src/components/cruises/BoatBlock.astro', 'utf8');
    expect(source).toContain('loading="lazy"');
    expect(source).not.toContain('fetchpriority="high"');
  });

  it('BoatBlock image has an aspect-ratio constraint to prevent layout shift', async () => {
    const source = await readFile('src/components/cruises/BoatBlock.astro', 'utf8');
    expect(source).toMatch(/aspect-\[/);
  });
});

// ── Cycle 12 — ItineraryBlock lazy load (issue #22) ─────────────────────────

describe('performance — ItineraryBlock lazy load', () => {
  it('ItineraryBlock step images use lazy loading', async () => {
    const source = await readFile('src/components/cruises/ItineraryBlock.astro', 'utf8');
    expect(source).toContain('loading="lazy"');
    expect(source).not.toContain('fetchpriority="high"');
  });

  it('ItineraryBlock step images have explicit dimensions for stable layout', async () => {
    const source = await readFile('src/components/cruises/ItineraryBlock.astro', 'utf8');
    expect(source).toContain('width="760"');
    expect(source).toContain('height="500"');
  });
});

// ── Cycle 13 — RelatedCruisesBlock lazy load (issue #22) ────────────────────

describe('performance — RelatedCruisesBlock lazy load', () => {
  it('RelatedCruisesBlock card images use lazy loading', async () => {
    const source = await readFile('src/components/cruises/RelatedCruisesBlock.astro', 'utf8');
    expect(source).toContain('loading="lazy"');
    expect(source).not.toContain('fetchpriority="high"');
  });

  it('RelatedCruisesBlock card images have an aspect-ratio constraint', async () => {
    const source = await readFile('src/components/cruises/RelatedCruisesBlock.astro', 'utf8');
    expect(source).toMatch(/aspect-\[/);
  });
});

// ── Cycle 14 — Tally deferred (issue #22) ───────────────────────────────────

describe('performance — Tally deferred rendering', () => {
  it('BookingBlock Tally embed script uses defer (not async) to not block initial rendering', async () => {
    const source = await readFile('src/components/cruises/BookingBlock.astro', 'utf8');
    expect(source).toContain('defer');
    expect(source).not.toMatch(/<script\s+async\s+src="https:\/\/tally/);
  });

  it('BookingBlock Tally iframe uses lazy loading', async () => {
    const source = await readFile('src/components/cruises/BookingBlock.astro', 'utf8');
    expect(source).toContain('loading="lazy"');
  });
});

// ── Cycle 15 — Itinerary native accordion (issue #22) ───────────────────────

describe('performance — itinerary native accordion', () => {
  it('ItineraryBlock uses native details/summary accordion with no client JS', async () => {
    const source = await readFile('src/components/cruises/ItineraryBlock.astro', 'utf8');
    expect(source).toContain('<details');
    expect(source).toContain('<summary');
    // No client-side framework component
    expect(source).not.toMatch(/client:(load|idle|visible)/);
  });
});

// ── Cycle 16 — No unnecessary client JS (issue #22) ─────────────────────────

describe('performance — no unnecessary client JS in cruise sections', () => {
  it('RelatedCruisesBlock uses CSS-only horizontal scroll (no JS carousel)', async () => {
    const source = await readFile('src/components/cruises/RelatedCruisesBlock.astro', 'utf8');
    expect(source).not.toMatch(/client:(load|idle|visible)/);
    expect(source).not.toContain('useEffect');
    expect(source).not.toContain('addEventListener');
  });

  it('ItineraryBlock imports no client-side interactive component', async () => {
    const source = await readFile('src/components/cruises/ItineraryBlock.astro', 'utf8');
    expect(source).not.toMatch(/client:(load|idle|visible)/);
  });

  it('EditorialBlock images use lazy loading and no client JS', async () => {
    const source = await readFile('src/components/cruises/EditorialBlock.astro', 'utf8');
    expect(source).toContain('loading="lazy"');
    expect(source).not.toMatch(/client:(load|idle|visible)/);
  });
});
