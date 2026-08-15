import { afterEach, describe, expect, it, vi } from 'vitest';
import { sanityClient } from 'sanity:client';
import { buildLlmsTxt, getLlmsTxtContent, LLMS_TXT_QUERY } from '../src/lib/llms-txt';

describe('llms.txt generation', () => {
  it('renders an English discovery document with English section labels and paths', () => {
    const output = buildLlmsTxt({
      siteName: 'Tahiti Guest Boat',
      summary: 'Private sailing cruises in Polynesia.',
      pages: [{ title: 'Our cruises', path: '/en/cruises/' }],
      optional: [],
      cruises: [{ title: 'Private Bora Bora cruise', path: '/en/cruises/private-bora-bora/' }],
      blog: [{ title: 'Travel guide', path: '/en/blog/travel-guide/' }],
    }, 'en');

    expect(output).toContain('## Cruises');
    expect(output).toContain('## Blog');
    expect(output).not.toContain('## Croisières');
    expect(output).not.toContain('/nos-croisieres/');
  });

  it('requires seo.indexable == true for legal pages, cruises, and blog posts', () => {
    const legalPagesFilter = LLMS_TXT_QUERY.match(/"legalPages": \*\[(.*?)\]/)?.[1];
    const cruisesFilter = LLMS_TXT_QUERY.match(/"cruises": \*\[(.*?)\]/)?.[1];
    const blogFilter = LLMS_TXT_QUERY.match(/"blog": \*\[(.*?)\]/)?.[1];

    expect(legalPagesFilter).toContain('seo.indexable == true');
    expect(cruisesFilter).toContain('seo.indexable == true');
    expect(blogFilter).toContain('seo.indexable == true');
  });

  it('renders an H1, a summary blockquote, and the static Pages section', () => {
    const markdown = buildLlmsTxt({
      siteName: 'Tahiti Guest Boat',
      summary: "L'esprit et le charme d'une belle maison d'hôtes, version croisière en Polynésie.",
      pages: [
        { title: 'Tahiti Guest Boat | Croisière en Polynésie', path: '/', description: "L'esprit et le charme..." },
        { title: 'Notre bateau | Tahiti Guest Boat', path: '/notre-bateau/', description: 'Découvrez notre bateau...' },
      ],
      optional: [],
      cruises: [],
      blog: [],
    });

    expect(markdown).toBe(`# Tahiti Guest Boat

> L'esprit et le charme d'une belle maison d'hôtes, version croisière en Polynésie.

## Pages

- [Tahiti Guest Boat | Croisière en Polynésie](/): L'esprit et le charme...
- [Notre bateau | Tahiti Guest Boat](/notre-bateau/): Découvrez notre bateau...
`);
  });

  it('appends an Optional section listing legal pages, and omits it entirely when there are none', () => {
    const withLegalPages = buildLlmsTxt({
      siteName: 'Tahiti Guest Boat',
      summary: 'Résumé.',
      pages: [],
      optional: [
        { title: "Conditions générales d'utilisation", path: '/cgu/' },
        { title: 'Mentions légales', path: '/mentions-legales/' },
      ],
      cruises: [],
      blog: [],
    });

    expect(withLegalPages).toContain(`## Optional

- [Conditions générales d'utilisation](/cgu/)
- [Mentions légales](/mentions-legales/)
`);

    const withoutLegalPages = buildLlmsTxt({
      siteName: 'Tahiti Guest Boat',
      summary: 'Résumé.',
      pages: [],
      optional: [],
      cruises: [],
      blog: [],
    });

    expect(withoutLegalPages).not.toContain('## Optional');
  });

  it('appends a Croisières section listing indexable cruises, and omits it entirely when there are none', () => {
    const withCruises = buildLlmsTxt({
      siteName: 'Tahiti Guest Boat',
      summary: 'Résumé.',
      pages: [],
      optional: [],
      cruises: [
        { title: 'Croisière aux Marquises', path: '/nos-croisieres/marquises/', description: "L'aventure aux confins de la Polynésie." },
        { title: 'Croisière aux Tuamotu', path: '/nos-croisieres/tuamotu/', description: 'Lagons turquoise et atolls secrets.' },
      ],
      blog: [],
    });

    expect(withCruises).toContain(`## Croisières

- [Croisière aux Marquises](/nos-croisieres/marquises/): L'aventure aux confins de la Polynésie.
- [Croisière aux Tuamotu](/nos-croisieres/tuamotu/): Lagons turquoise et atolls secrets.
`);

    const withoutCruises = buildLlmsTxt({
      siteName: 'Tahiti Guest Boat',
      summary: 'Résumé.',
      pages: [],
      optional: [],
      cruises: [],
      blog: [],
    });

    expect(withoutCruises).not.toContain('## Croisières');
  });

  it('appends a Blog section listing indexable posts, and omits it entirely when there are none', () => {
    const withPosts = buildLlmsTxt({
      siteName: 'Tahiti Guest Boat',
      summary: 'Résumé.',
      pages: [],
      optional: [],
      cruises: [],
      blog: [
        { title: 'Les meilleures plages secrètes', path: '/blog/plages-secretes/', description: 'Notre sélection de criques cachées.' },
        { title: 'Préparer sa valise pour Tahiti', path: '/blog/preparer-valise/', description: 'La check-list indispensable.' },
      ],
    });

    expect(withPosts).toContain(`## Blog

- [Les meilleures plages secrètes](/blog/plages-secretes/): Notre sélection de criques cachées.
- [Préparer sa valise pour Tahiti](/blog/preparer-valise/): La check-list indispensable.
`);

    const withoutPosts = buildLlmsTxt({
      siteName: 'Tahiti Guest Boat',
      summary: 'Résumé.',
      pages: [],
      optional: [],
      cruises: [],
      blog: [],
    });

    expect(withoutPosts).not.toContain('## Blog');
  });

  it('fetches indexable cruises and blog posts from Sanity and renders them with their site paths', async () => {
    const originalFetch = sanityClient.fetch;
    sanityClient.fetch = (async (query: string) => {
      if (query.includes('siteSettings')) {
        return { siteName: 'Tahiti Guest Boat' };
      }
      return {
        home: { seoDescription: 'Résumé.' },
        legalPages: [],
        cruises: [{ title: 'Croisière aux Marquises', slug: 'marquises', excerpt: "L'aventure aux confins de la Polynésie." }],
        blog: [{ title: 'Les meilleures plages secrètes', slug: 'plages-secretes', excerpt: 'Notre sélection de criques cachées.' }],
      };
    }) as unknown as typeof sanityClient.fetch;

    try {
      const markdown = await getLlmsTxtContent();
      expect(markdown).toContain(`## Croisières

- [Croisière aux Marquises](/nos-croisieres/marquises/): L'aventure aux confins de la Polynésie.
`);
      expect(markdown).toContain(`## Blog

- [Les meilleures plages secrètes](/blog/plages-secretes/): Notre sélection de criques cachées.
`);
    } finally {
      sanityClient.fetch = originalFetch;
    }
  });

  it('does not advertise unpublished English singleton or archive surfaces', async () => {
    const originalFetch = sanityClient.fetch;
    sanityClient.fetch = (async (query: string) => {
      if (query.includes('siteSettings')) {
        return { siteName: 'Tahiti Guest Boat' };
      }
      return {
        homeTranslation: { seoDescription: 'English summary.', seo: { indexable: true } },
        surfaceAvailability: { home: true, boat: false, contact: false, cruises: false, blog: false },
        legalPages: [],
        cruises: [],
        blog: [],
      };
    }) as unknown as typeof sanityClient.fetch;

    try {
      const markdown = await getLlmsTxtContent('en');

      expect(markdown).toContain('(/en/)');
      expect(markdown).not.toContain('/en/our-boat/');
      expect(markdown).not.toContain('/en/contact/');
      expect(markdown).not.toContain('/en/cruises/');
      expect(markdown).not.toContain('/en/blog/');
    } finally {
      sanityClient.fetch = originalFetch;
    }
  });

  it('uses the English structural path for the localized boat page', async () => {
    const originalFetch = sanityClient.fetch;
    sanityClient.fetch = (async (query: string) => {
      if (query.includes('siteSettings')) {
        return { siteName: 'Tahiti Guest Boat' };
      }
      return {
        homeTranslation: { seoDescription: 'English summary.', seo: { indexable: true } },
        surfaceAvailability: { home: true, boat: true, contact: true, cruises: true, blog: true },
        legalPages: [],
        cruises: [],
        blog: [],
      };
    }) as unknown as typeof sanityClient.fetch;

    try {
      const markdown = await getLlmsTxtContent('en');

      expect(markdown).toContain('(/en/our-boat/)');
      expect(markdown).not.toContain('(/en/notre-bateau/)');
    } finally {
      sanityClient.fetch = originalFetch;
    }
  });

  it('prefers the Sanity home summary and site name, falling back to static copy when Sanity has no value', async () => {
    const originalFetch = sanityClient.fetch;
    sanityClient.fetch = (async (query: string) => {
      if (query.includes('siteSettings')) {
        return { siteName: 'Tahiti Guest Boat (Sanity)' };
      }
      return {
        home: { seoDescription: 'Résumé Sanity.' },
        legalPages: [],
      };
    }) as unknown as typeof sanityClient.fetch;

    try {
      const markdown = await getLlmsTxtContent();
      expect(markdown).toContain('# Tahiti Guest Boat (Sanity)');
      expect(markdown).toContain('> Résumé Sanity.');
    } finally {
      sanityClient.fetch = originalFetch;
    }
  });

  it('falls back to the static site name and home description when Sanity has none', async () => {
    const originalFetch = sanityClient.fetch;
    sanityClient.fetch = (async (query: string) => {
      if (query.includes('siteSettings')) {
        return null;
      }
      return { home: null, legalPages: [] };
    }) as unknown as typeof sanityClient.fetch;

    try {
      const markdown = await getLlmsTxtContent();
      expect(markdown).toContain('# Tahiti Guest Boat');
      expect(markdown).toContain(`> L'esprit et le charme d'une belle maison d'hôtes, version croisière en Polynésie.`);
    } finally {
      sanityClient.fetch = originalFetch;
    }
  });

  describe('when Sanity is not configured', () => {
    afterEach(() => {
      vi.doUnmock('../src/lib/sanity');
      vi.resetModules();
    });

    it('renders only the static pages, without fetching Sanity content', async () => {
      const fetchSpy = vi.spyOn(sanityClient, 'fetch');
      vi.resetModules();
      vi.doMock('../src/lib/sanity', async () => {
        const actual = await vi.importActual<typeof import('../src/lib/sanity')>('../src/lib/sanity');
        return { ...actual, isSanityConfigured: false };
      });

      try {
        const { getLlmsTxtContent: getLlmsTxtContentUnconfigured } = await import('../src/lib/llms-txt');
        const markdown = await getLlmsTxtContentUnconfigured();

        expect(markdown).toContain('# Tahiti Guest Boat');
        expect(markdown).toContain('## Pages');
        expect(markdown).not.toContain('## Optional');
        expect(markdown).not.toContain('## Croisières');
        expect(markdown).not.toContain('## Blog');
        expect(fetchSpy).not.toHaveBeenCalled();
      } finally {
        fetchSpy.mockRestore();
      }
    });
  });
});
