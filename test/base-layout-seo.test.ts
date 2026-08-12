import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('BaseLayout — sitewide Organization/WebSite JSON-LD and Open Graph tags', () => {
  it('imports the site-seo builders and fetches reviews to feed the Organization node', async () => {
    const source = await readFile('src/layouts/BaseLayout.astro', 'utf8');

    expect(source).toContain('buildOrganizationStructuredData');
    expect(source).toContain('buildWebsiteStructuredData');
    expect(source).toContain('getReviews');
  });

  it('merges the Organization and WebSite nodes with the page-specific structuredData, without dropping it', async () => {
    const source = await readFile('src/layouts/BaseLayout.astro', 'utf8');

    // The page-specific structuredData prop must still be rendered alongside the new sitewide nodes.
    expect(source).toContain('...structuredData');
  });

  it('emits og:site_name from the site settings brand name', async () => {
    const source = await readFile('src/layouts/BaseLayout.astro', 'utf8');

    expect(source).toContain('property="og:site_name"');
  });

  it('emits an Open Graph locale matching the rendered language', async () => {
    const source = await readFile('src/layouts/BaseLayout.astro', 'utf8');

    expect(source).toContain('property="og:locale"');
    expect(source).toContain('buildOpenGraphLocale(locale)');
  });

  it('emits og:image:width and og:image:height driven by new imageWidth/imageHeight props', async () => {
    const source = await readFile('src/layouts/BaseLayout.astro', 'utf8');

    expect(source).toContain('imageWidth');
    expect(source).toContain('imageHeight');
    expect(source).toContain('property="og:image:width"');
    expect(source).toContain('property="og:image:height"');
  });

  it('does not remove the existing canonical link or per-page structured data mapping', async () => {
    const source = await readFile('src/layouts/BaseLayout.astro', 'utf8');

    expect(source).toContain('rel="canonical"');
    expect(source).toContain('application/ld+json');
  });
});
