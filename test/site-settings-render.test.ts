import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
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

  it('renders complete SEO output for a Page croisière', async () => {
    const html = await readFile('dist/nos-croisieres/croisiere-decouverte-tuamotu/index.html', 'utf8');

    expect(html).toContain(
      '<link rel="canonical" href="https://tahiti-guest-boat.com/nos-croisieres/croisiere-decouverte-tuamotu/"'
    );
    expect(html).toContain('<meta property="og:title"');
    expect(html).toContain('<meta property="og:image"');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image"');
    expect(html).toContain('<script type="application/ld+json"');

    const jsonLd = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/)?.[1];
    expect(jsonLd).toBeTruthy();

    const structuredData = JSON.parse(jsonLd as string) as {
      '@context': string;
      '@graph': Record<string, any>[];
    };
    const touristTrip = structuredData['@graph'].find((item) => item['@type'] === 'TouristTrip');
    const itemList = structuredData['@graph'].find((item) => item['@type'] === 'ItemList');

    expect(structuredData['@context']).toBe('https://schema.org');
    expect(touristTrip).toMatchObject({
      name: 'Croisière découverte aux Tuamotu',
      provider: {
        '@type': 'Organization',
        name: 'Tahiti Guest Boat',
      },
    });
    expect(touristTrip?.touristType).toMatch(/^croisière /);
    expect(touristTrip).not.toHaveProperty('offers');
    expect(touristTrip?.subTrip.length).toBeGreaterThan(0);
    expect(touristTrip?.subTrip[0]).toMatchObject({
      '@type': 'TouristTrip',
    });
    expect(touristTrip?.subTrip.every((trip: any) => trip.name && trip.description)).toBe(true);
    expect(itemList?.itemListElement).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'ListItem',
          position: 1,
        }),
      ])
    );
  });
});
