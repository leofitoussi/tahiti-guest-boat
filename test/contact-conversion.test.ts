import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';

describe('English contact conversion journey', () => {
  beforeAll(() => {
    execFileSync('npx', ['astro', 'build'], { stdio: 'ignore', timeout: 600000 });
  }, 600000);

  it('publishes an English noindex confirmation page with an English home link', async () => {
    const html = await readFile('dist/en/thank-you/index.html', 'utf8');

    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(html).toContain('Thank you');
    expect(html).toContain('href="/en/"');
  });

  it('publishes reciprocal SEO metadata for the French and English contact pages', async () => {
    const [frenchHtml, englishHtml] = await Promise.all([
      readFile('dist/contact/index.html', 'utf8'),
      readFile('dist/en/contact/index.html', 'utf8'),
    ]);

    expect(frenchHtml).toContain('<html lang="fr">');
    expect(frenchHtml).toContain(
      '<link rel="canonical" href="https://tahitiguestboat.com/contact/"',
    );
    expect(frenchHtml).toContain(
      '<link rel="alternate" hreflang="en" href="https://tahitiguestboat.com/en/contact/"',
    );

    expect(englishHtml).toContain('<html lang="en">');
    expect(englishHtml).toContain(
      '<link rel="canonical" href="https://tahitiguestboat.com/en/contact/"',
    );
    expect(englishHtml).toContain(
      '<link rel="alternate" hreflang="fr" href="https://tahitiguestboat.com/contact/"',
    );
    expect(englishHtml).toContain('<meta property="og:locale" content="en_US"');
  });

  it('keeps the English contact journey localized while preserving contact channels', async () => {
    const html = await readFile('dist/en/contact/index.html', 'utf8');

    expect(html).toContain('Practical information and contact');
    expect(html).toContain('href="/en/our-boat"');
    expect(html).toContain('href="/en/cruises"');
    expect(html).toContain('href="/en/blog"');
    expect(html).toContain('href="mailto:tahitiguestboat@gmail.com"');
    expect(html).toContain('href="tel:+68989341434"');
    expect(html).not.toContain('Informations pratiques et contact');
    expect(html).not.toContain('Nous contacter');
  });

  it('keeps the confirmation routes out of every generated sitemap', async () => {
    const sitemapFiles = await Promise.all([
      readFile('dist/page-sitemap.xml', 'utf8'),
      readFile('dist/post-sitemap.xml', 'utf8'),
      readFile('dist/sitemap-cruises.xml', 'utf8'),
    ]);
    const sitemaps = sitemapFiles.join('\n');

    expect(sitemaps).not.toContain('/merci/');
    expect(sitemaps).not.toContain('/en/thank-you/');
  });
});
