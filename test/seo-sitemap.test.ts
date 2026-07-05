import { describe, expect, it } from 'vitest';
import { sanityClient } from 'sanity:client';
import { getSitemapGroups, SITEMAP_CONTENT_QUERY } from '../src/lib/sitemap-content';
import { buildRobotsTxt, buildSitemapIndexXml, buildUrlsetXml, toSitemapUrls } from '../src/lib/seo-sitemap';

describe('SEO sitemap generation', () => {
  it('builds a sitemap index that references each content sitemap with absolute URLs', () => {
    const xml = buildSitemapIndexXml('https://tahiti-guest-boat.com', [
      { path: '/sitemap-pages.xml', lastmod: '2026-06-01T10:00:00.000Z' },
      { path: '/sitemap-blog.xml', lastmod: '2026-06-02T10:00:00.000Z' },
      { path: '/sitemap-cruises.xml', lastmod: '2026-06-03T10:00:00.000Z' },
    ]);

    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://tahiti-guest-boat.com/sitemap-pages.xml</loc>');
    expect(xml).toContain('<loc>https://tahiti-guest-boat.com/sitemap-blog.xml</loc>');
    expect(xml).toContain('<loc>https://tahiti-guest-boat.com/sitemap-cruises.xml</loc>');
    expect(xml).toContain('<lastmod>2026-06-03T10:00:00.000Z</lastmod>');
  });

  it('builds a URL sitemap with loc and lastmod for every indexable URL', () => {
    const xml = buildUrlsetXml('https://tahiti-guest-boat.com', [
      { path: '/', lastmod: '2026-06-01T10:00:00.000Z' },
      { path: '/blog/croisiere-privee/', lastmod: '2026-06-02T10:00:00.000Z' },
    ]);

    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://tahiti-guest-boat.com/</loc>');
    expect(xml).toContain('<lastmod>2026-06-01T10:00:00.000Z</lastmod>');
    expect(xml).toContain('<loc>https://tahiti-guest-boat.com/blog/croisiere-privee/</loc>');
    expect(xml).toContain('<lastmod>2026-06-02T10:00:00.000Z</lastmod>');
  });

  it('maps only indexable content documents and uses real content modification dates', () => {
    const urls = toSitemapUrls([
      {
        path: '/blog/indexable/',
        _updatedAt: '2026-06-10T10:00:00.000Z',
        publishedAt: '2026-05-01T10:00:00.000Z',
        seo: { indexable: true },
      },
      {
        path: '/blog/noindex/',
        _updatedAt: '2026-06-11T10:00:00.000Z',
        seo: { indexable: false },
      },
      {
        path: '/blog/published-fallback/',
        publishedAt: '2026-05-02T10:00:00.000Z',
        seo: { indexable: true },
      },
    ]);

    expect(urls).toEqual([
      { path: '/blog/indexable/', lastmod: '2026-06-10T10:00:00.000Z' },
      { path: '/blog/published-fallback/', lastmod: '2026-05-02T10:00:00.000Z' },
    ]);
  });

  it('collects page, blog, and cruise sitemap groups from indexable Sanity content', async () => {
    const originalFetch = sanityClient.fetch;
    sanityClient.fetch = (async () => ({
      pages: [
        { path: '/', _updatedAt: '2026-06-01T10:00:00.000Z', seo: { indexable: true } },
        { path: '/composants/', _updatedAt: '2026-06-01T11:00:00.000Z', seo: { indexable: false } },
      ],
      blog: [
        { path: '/blog/croisiere-privee/', _updatedAt: '2026-06-02T10:00:00.000Z', seo: { indexable: true } },
      ],
      cruises: [
        { path: '/nos-croisieres/bora-bora/', _updatedAt: '2026-06-03T10:00:00.000Z', seo: { indexable: true } },
      ],
    })) as unknown as typeof sanityClient.fetch;

    try {
      const groups = await getSitemapGroups();

      expect(groups.pages.urls).toEqual([{ path: '/', lastmod: '2026-06-01T10:00:00.000Z' }]);
      expect(groups.blog.urls).toEqual([
        { path: '/blog/croisiere-privee/', lastmod: '2026-06-02T10:00:00.000Z' },
      ]);
      expect(groups.cruises.urls).toEqual([
        { path: '/nos-croisieres/bora-bora/', lastmod: '2026-06-03T10:00:00.000Z' },
      ]);
    } finally {
      sanityClient.fetch = originalFetch;
    }
  });

  it('builds robots.txt with the production sitemap index URL', () => {
    expect(buildRobotsTxt('https://tahiti-guest-boat.com')).toBe(`User-agent: *
Allow: /

Sitemap: https://tahiti-guest-boat.com/sitemap-index.xml
`);
  });

  it('dates public archive pages from visible content that can change those pages', () => {
    expect(SITEMAP_CONTENT_QUERY).toContain('coalesce(visible, false) == true');
  });
});
