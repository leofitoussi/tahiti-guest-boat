import { access, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('English Blog article route', () => {
  it('publishes each English Article through the shared article renderer', async () => {
    const routePath = 'src/pages/en/blog/[slug].astro';

    await access(routePath);

    const source = await readFile(routePath, 'utf8');
    const renderer = await readFile('src/components/blog/BlogArticlePage.astro', 'utf8');

    expect(source).toContain("getAllBlogSlugs('en')");
    expect(source).toContain('getBlogPost(summary.slug, locale)');
    expect(source).toContain('<BlogArticlePage post={post} locale={locale} alternatePaths={alternatePaths} />');
    expect(renderer).toContain('<BlogContent value={post.body} />');
    expect(source).toContain("const locale = 'en' as const");
  });
});

describe('Studio translation configuration', () => {
  it('registers all PRD content families with document internationalization', async () => {
    const source = await readFile('sanity.config.ts', 'utf8');

    expect(source).toContain(
      "schemaTypes: ['homePage', 'siteSettings', 'boatPage', 'contactPage', 'cruisePage', 'blogPost', 'legalPage', 'activity', 'activityTag']",
    );
  });
});

describe('English legal page route', () => {
  it('publishes each English legal page through the shared Portable Text renderer', async () => {
    const routePath = 'src/pages/en/[slug].astro';

    await access(routePath);

    const source = await readFile(routePath, 'utf8');
    const renderer = await readFile('src/components/legal/LegalPageView.astro', 'utf8');

    expect(source).toContain("getLegalPages('en')");
    expect(source).toContain('getLegalPage(slug, locale)');
    expect(source).toContain('<LegalPageView page={page} locale={locale} alternatePaths={alternatePaths} />');
    expect(renderer).toContain('<PortableText value={page.body ?? []} />');
    expect(source).toContain("const locale = 'en' as const");
  });
});
