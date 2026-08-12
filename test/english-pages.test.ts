import { access, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const englishRouteFiles = [
  'src/pages/en/our-boat.astro',
  'src/pages/en/contact.astro',
  'src/pages/en/cruises/index.astro',
  'src/pages/en/blog/index.astro',
];

describe('English global navigation destinations', () => {
  it('has a generated route for every destination exposed by the English site settings', async () => {
    await Promise.all(englishRouteFiles.map((file) => access(file)));
  });

  it('renders the English boat page from the English Sanity version', async () => {
    const source = await readFile('src/pages/en/our-boat.astro', 'utf8');

    expect(source).toContain("getUniquePage('boatPage', locale)");
    expect(source).toContain("const locale = 'en' as const");
    expect(source).toContain("fr: '/notre-bateau/'");
  });

  it('renders the English contact page from the English Sanity version', async () => {
    const source = await readFile('src/pages/en/contact.astro', 'utf8');

    expect(source).toContain("getUniquePage('contactPage', locale)");
    expect(source).toContain("const locale = 'en' as const");
    expect(source).toContain("fr: '/contact/'");
  });

  it('provides English cruise and blog archive routes', async () => {
    const [cruises, blog] = await Promise.all([
      readFile('src/pages/en/cruises/index.astro', 'utf8'),
      readFile('src/pages/en/blog/index.astro', 'utf8'),
    ]);

    expect(cruises).toContain('getCruisePages(locale)');
    expect(cruises).toContain("const locale = 'en' as const");
    expect(blog).toContain('getBlogPosts(locale)');
    expect(blog).toContain("const locale = 'en' as const");
  });

  it('localizes editorial cruise links with the current page language', async () => {
    const component = await readFile('src/components/blocks/CruiseInspirationBlock.astro', 'utf8');
    const pageBuilder = await readFile('src/components/blocks/PageBuilder.astro', 'utf8');

    expect(component).toContain('localizeHref(card.linkUrl, locale)');
    expect(pageBuilder).toMatch(/CruiseInspirationBlock[\s\S]*?locale=\{locale\}/);
  });
});
