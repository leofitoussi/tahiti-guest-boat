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

    expect(source).toContain("getUniquePageVersions('boatPage')");
    expect(source).toContain("const locale = 'en' as const");
    expect(source).toContain("pageVersions.fr ? { fr: '/notre-bateau/' } : {}");
  });

  it('renders the English contact page from the English Sanity version', async () => {
    const source = await readFile('src/pages/en/contact.astro', 'utf8');
    const renderer = await readFile('src/components/ContactPage.astro', 'utf8');

    expect(source).toContain("import ContactPage from '../../components/ContactPage.astro'");
    expect(source).toContain('<ContactPage locale={locale} />');
    expect(source).toContain("const locale = 'en' as const");
    expect(renderer).toContain("getUniquePageVersions('contactPage')");
    expect(renderer).toContain('getSiteSettings(locale)');
    expect(renderer).toContain('locale={locale}');
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

  it('gives English archive pages only published French counterparts', async () => {
    const [cruises, blog] = await Promise.all([
      readFile('src/pages/en/cruises/index.astro', 'utf8'),
      readFile('src/pages/en/blog/index.astro', 'utf8'),
    ]);

    expect(cruises).toContain("getCruisePages('fr')");
    expect(cruises).toContain('alternatePaths={alternatePaths}');
    expect(blog).toContain("getBlogPosts('fr')");
    expect(blog).toContain('alternatePaths={alternatePaths}');
  });

  it('keeps the English homepage route buildable at /en/', async () => {
    const source = await readFile('src/pages/en/index.astro', 'utf8');

    expect(source).toContain('getHomePagePair()');
    expect(source).toContain("resolveHomePageVersion(pair, 'en')");
    expect(source).not.toContain('getStaticPaths');
  });

  it('localizes editorial cruise links with the current page language', async () => {
    const component = await readFile('src/components/blocks/CruiseInspirationBlock.astro', 'utf8');
    const pageBuilder = await readFile('src/components/blocks/PageBuilder.astro', 'utf8');

    expect(component).toContain('localizeHref(card.linkUrl, locale)');
    expect(pageBuilder).toMatch(/CruiseInspirationBlock[\s\S]*?locale=\{locale\}/);
  });
});
