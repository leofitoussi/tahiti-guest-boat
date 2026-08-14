import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('blog article template — canonical link convention', () => {
  it('the "back to blog" link follows the trailing-slash convention used by every other internal link', async () => {
    const source = await readFile('src/components/blog/BlogArticlePage.astro', 'utf8');

    expect(source).toContain("localizePath('/blog/', locale)");
    expect(source).not.toContain("localizePath('/blog', locale)");
  });
});

describe('blog article template — BlogPosting JSON-LD wiring', () => {
  it('builds BlogPosting structured data and passes it into BaseLayout', async () => {
    const source = await readFile('src/components/blog/BlogArticlePage.astro', 'utf8');

    expect(source).toContain('buildBlogPostingStructuredData');
    expect(source).toContain('structuredData={structuredData}');
  });
});
