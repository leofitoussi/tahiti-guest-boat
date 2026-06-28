import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { describe, expect, it, beforeAll } from 'vitest';

const buildArgs = ['run', 'build'];

describe('site settings render', () => {
  beforeAll(() => {
    execFileSync('npm', buildArgs, { stdio: 'ignore' });
  }, 120000);

  it('renders the shared site settings into the home page header and footer', async () => {
    const html = await readFile('dist/index.html', 'utf8');

    expect(html).toContain('<html lang="fr">');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('hreflang="fr"');
    expect(html).toContain('Réservez');
    expect(html).toContain('Notre bateau');
    expect(html).toContain('Nos croisières');
    expect(html).toContain('Notre blog');
    expect(html).toContain('contact@tahiti-guest-boat.com');
    expect(html).toContain('+689 87 00 00 09');
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
        `<link rel="canonical" href="https://tahiti-guest-boat.com/nos-croisieres/${slug}/"`
      );
      expect(html, `og:title for ${slug}`).toContain('<meta property="og:title"');
      expect(html, `twitter:card for ${slug}`).toContain(
        '<meta name="twitter:card" content="summary_large_image"'
      );
      expect(html, `JSON-LD for ${slug}`).toContain('<script type="application/ld+json"');

      const jsonLd = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/)?.[1];
      expect(jsonLd, `JSON-LD payload for ${slug}`).toBeTruthy();

      const structuredData = JSON.parse(jsonLd as string) as {
        '@context': string;
        '@graph': Record<string, any>[];
      };
      const touristTrip = structuredData['@graph'].find((item) => item['@type'] === 'TouristTrip');

      expect(structuredData['@context'], `@context for ${slug}`).toBe('https://schema.org');
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
