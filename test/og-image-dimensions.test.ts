import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('og:image width/height — pages pass the same dimensions used to build the image URL', () => {
  it('Page croisière passes imageWidth/imageHeight matching buildCruiseSeoImage (1200x630)', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');

    expect(source).toContain('imageWidth={1200}');
    expect(source).toContain('imageHeight={630}');
  });

  it('blog article passes imageWidth/imageHeight matching mainImageUrl (1440x810)', async () => {
    const source = await readFile('src/components/blog/BlogArticlePage.astro', 'utf8');

    expect(source).toContain('imageWidth={1440}');
    expect(source).toContain('imageHeight={810}');
  });
});
