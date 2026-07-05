import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';

describe('generated SEO sitemap files', () => {
  beforeAll(() => {
    execFileSync('npm', ['run', 'build'], { stdio: 'ignore', timeout: 600000 });
  }, 600000);

  it('renders the sitemap index, content sitemaps, and robots.txt during the Astro build', async () => {
    const [sitemapIndex, pagesSitemap, blogSitemap, cruisesSitemap, robots] = await Promise.all([
      readFile('dist/sitemap-index.xml', 'utf8'),
      readFile('dist/sitemap-pages.xml', 'utf8'),
      readFile('dist/sitemap-blog.xml', 'utf8'),
      readFile('dist/sitemap-cruises.xml', 'utf8'),
      readFile('dist/robots.txt', 'utf8'),
    ]);

    expect(sitemapIndex).toContain('https://tahiti-guest-boat.com/sitemap-pages.xml');
    expect(sitemapIndex).toContain('https://tahiti-guest-boat.com/sitemap-blog.xml');
    expect(sitemapIndex).toContain('https://tahiti-guest-boat.com/sitemap-cruises.xml');
    expect(pagesSitemap).toContain('<urlset');
    expect(blogSitemap).toContain('<urlset');
    expect(cruisesSitemap).toContain('<urlset');
    expect(robots).toContain('Sitemap: https://tahiti-guest-boat.com/sitemap-index.xml');
  });
});
