import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { describe, expect, it, beforeAll } from 'vitest';

const buildArgs = ['run', 'build'];

describe('site settings render', () => {
  beforeAll(() => {
    execFileSync('npm', buildArgs, { stdio: 'ignore', timeout: 600000 });
  }, 600000);

  it('renders the shared site settings into the home page header and footer', async () => {
    const html = await readFile('dist/index.html', 'utf8');

    expect(html).toContain('<html lang="fr">');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('hreflang="fr"');
    expect(html).toContain('Réserver');
    expect(html).toContain('Notre bateau');
    expect(html).toContain('Nos croisières');
    expect(html).toContain('Notre blog');
    expect(html).toContain('tahitiguestboat@gmail.com');
    expect(html).toContain('+689 89 34 14 34');
  });

  // The booking block's tariff/inclusions text is authored per cruise in Sanity
  // (cruisePage.bookingBody), so live editorial content may legitimately contain
  // tariff copy. The template contract is what prevents a shared hardcoded
  // fallback from coming back.
  it('sources Page croisière booking prose from cruisePage.bookingBody', async () => {
    const [pageSource, bookingBlockSource, cruisesSource] = await Promise.all([
      readFile('src/pages/nos-croisieres/[slug].astro', 'utf8'),
      readFile('src/components/cruises/BookingBlock.astro', 'utf8'),
      readFile('src/lib/cruises.ts', 'utf8'),
    ]);

    expect(cruisesSource).toContain('bookingBody,');
    expect(pageSource).toContain('body={cruise.bookingBody}');
    expect(pageSource).not.toContain('body={settings?.bookingEmbed?.body}');

    expect(bookingBlockSource).toContain('body?: TypedObject[];');
    expect(bookingBlockSource).toContain('body?.length');
    expect(bookingBlockSource).toContain('<PortableText value={body} />');
    expect(bookingBlockSource).not.toContain('Tarif : 250 € par personne et par jour');
    expect(bookingBlockSource).not.toContain('chaque programme est personnalisé');
  });

  it('injects the FR head tracking scripts unescaped, near the top of the home page head', async () => {
    const html = await readFile('dist/index.html', 'utf8');
    const head = html.slice(0, html.indexOf('</head>'));

    // Raw, non-escaped injection (set:html, not interpolation).
    expect(head).toContain('<script data-goatcounter="https://tahiti-guest-boat.goatcounter.com/count"');
    expect(head).toContain('src="//gc.zgo.at/count.js"');
    expect(head).not.toContain('&lt;script data-goatcounter');

    // High in the head so a consent banner / analytics loads early — before the title.
    expect(head.indexOf('data-goatcounter')).toBeLessThan(head.indexOf('<title>'));
  });

  // The head tracking scripts are global: authored once (FR) and injected into
  // every template that goes through BaseLayout, not just the home page.
  it('injects the head tracking scripts into every built Page croisière head', async () => {
    const cruisesDir = 'dist/nos-croisieres';
    const entries = await readdir(cruisesDir, { withFileTypes: true });
    const slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

    expect(slugs.length).toBeGreaterThan(0);

    for (const slug of slugs) {
      const html = await readFile(`${cruisesDir}/${slug}/index.html`, 'utf8');
      const head = html.slice(0, html.indexOf('</head>'));

      expect(head, `goatcounter for ${slug}`).toContain(
        '<script data-goatcounter="https://tahiti-guest-boat.goatcounter.com/count"'
      );
    }
  });

  // Content-agnostic: discovers whatever cruise pages the build produced from
  // Sanity, so creating, renaming, or deleting a cruise never breaks this test.
  // It asserts only the SEO scaffolding the code guarantees for every cruise —
  // not the title, slug, or itinerary of any specific one.
  it('renders complete SEO scaffolding for every built Page croisière', async () => {
    const cruisesDir = 'dist/nos-croisieres';
    const entries = await readdir(cruisesDir, { withFileTypes: true });
    const slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

    expect(slugs.length).toBeGreaterThan(0);

    for (const slug of slugs) {
      const html = await readFile(`${cruisesDir}/${slug}/index.html`, 'utf8');

      expect(html, `canonical for ${slug}`).toContain(
        `<link rel="canonical" href="https://tahitiguestboat.com/nos-croisieres/${slug}/"`
      );
      expect(html, `og:title for ${slug}`).toContain('<meta property="og:title"');
      expect(html, `twitter:card for ${slug}`).toContain(
        '<meta name="twitter:card" content="summary_large_image"'
      );
      expect(html, `JSON-LD for ${slug}`).toContain('<script type="application/ld+json"');

      // BaseLayout now renders several JSON-LD scripts (sitewide Organization/WebSite,
      // then the page-specific one) — find the one carrying the cruise's TouristTrip graph.
      const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.+?)<\/script>/g)].map(
        (match) => JSON.parse(match[1]) as { '@context'?: string; '@graph'?: Record<string, any>[] }
      );
      const structuredData = jsonLdBlocks.find((block) => Array.isArray(block['@graph']));
      expect(structuredData, `JSON-LD graph payload for ${slug}`).toBeTruthy();

      const touristTrip = structuredData!['@graph']!.find((item) => item['@type'] === 'TouristTrip');

      expect(structuredData!['@context'], `@context for ${slug}`).toBe('https://schema.org');
      expect(touristTrip, `TouristTrip for ${slug}`).toMatchObject({
        provider: {
          '@type': 'Organization',
          name: 'Tahiti Guest Boat',
        },
      });
      expect(touristTrip?.url, `TouristTrip url for ${slug}`).toContain(
        `/nos-croisieres/${slug}/`
      );
    }
  });
});
