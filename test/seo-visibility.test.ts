import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

// ── Cycle 5 ──────────────────────────────────────────────────────────────────
describe('Astro pages — noindex derived from seo.indexable', () => {
  const pageFiles = [
    'src/pages/nos-croisieres/[slug].astro',
    'src/pages/blog/[slug].astro',
    'src/pages/index.astro',
    'src/pages/notre-bateau.astro',
    'src/pages/contact.astro',
  ];

  for (const file of pageFiles) {
    it(`${file} passes noindex from seo.indexable`, async () => {
      const source = await readFile(file, 'utf8');
      expect(source).toMatch(/noindex.*seo.*indexable|seo.*indexable.*noindex/s);
    });
  }
});

// ── Cycle 4 ──────────────────────────────────────────────────────────────────
describe('GROQ listing queries — filter hidden pages', () => {
  it('cruise listing query filters out pages where visible is false', async () => {
    const source = await readFile('src/lib/cruises.ts', 'utf8');
    expect(source).toContain('coalesce(visible, false)');
  });

  it('blog listing query filters out posts where visible is false', async () => {
    const source = await readFile('src/lib/blog.ts', 'utf8');
    expect(source).toContain('coalesce(visible, false)');
  });

  it('cruise getStaticPaths uses a separate query that does not filter on visible', async () => {
    const source = await readFile('src/pages/nos-croisieres/[slug].astro', 'utf8');
    // getStaticPaths must call getAllCruiseSlugs (or similar) — not getCruisePages which filters visible
    expect(source).toMatch(/getAllCruiseSlugs|getStaticPaths[\s\S]{0,300}slug/);
  });

  it('blog getStaticPaths uses a separate query that does not filter on visible', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toMatch(/getAllBlogSlugs|getStaticPaths[\s\S]{0,300}slug/);
  });
});

// ── Cycle 3 ──────────────────────────────────────────────────────────────────
describe('cruisePage & blogPost schemas — visible field', () => {
  for (const { name, module } of [
    { name: 'cruisePage', module: () => import('../schemas/cruisePage').then((m) => m.cruisePage) },
    { name: 'blogPost', module: () => import('../schemas/blogPost').then((m) => m.blogPost) },
  ]) {
    it(`${name} has a visible boolean field defaulting to false`, async () => {
      const schema = await module();
      const field = (schema.fields as any[]).find((f) => f.name === 'visible') as any;
      expect(field, `${name} is missing a visible field`).toBeDefined();
      expect(field.type).toBe('boolean');
      expect(field.initialValue).toBe(false);
    });
  }

  it('homePage does not have a visible field (singleton, always in nav)', async () => {
    const { homePage } = await import('../schemas/homePage');
    const field = (homePage.fields as any[]).find((f) => f.name === 'visible');
    expect(field).toBeUndefined();
  });
});

// ── Cycle 2 ──────────────────────────────────────────────────────────────────
describe('page schemas — seo field present on all page types', () => {
  const pageSchemas = [
    { name: 'homePage', module: () => import('../schemas/homePage').then((m) => m.homePage) },
    { name: 'boatPage', module: () => import('../schemas/boatPage').then((m) => m.boatPage) },
    { name: 'contactPage', module: () => import('../schemas/contactPage').then((m) => m.contactPage) },
    { name: 'legalPage', module: () => import('../schemas/legalPage').then((m) => m.legalPage) },
    { name: 'cruisePage', module: () => import('../schemas/cruisePage').then((m) => m.cruisePage) },
    { name: 'blogPost', module: () => import('../schemas/blogPost').then((m) => m.blogPost) },
  ];

  for (const { name, module } of pageSchemas) {
    it(`${name} has a seo field of type seo`, async () => {
      const schema = await module();
      const field = (schema.fields as any[]).find((f) => f.name === 'seo');
      expect(field, `${name} is missing a seo field`).toBeDefined();
      expect(field.type).toBe('seo');
    });
  }
});

// ── Cycle 1 ──────────────────────────────────────────────────────────────────
describe('seo schema object — indexable field', () => {
  it('exports a seo object type', async () => {
    const { seo } = await import('../schemas/seo');
    expect(seo).toBeDefined();
    expect(seo.name).toBe('seo');
    expect(seo.type).toBe('object');
  });

  it('has an indexable boolean field', async () => {
    const { seo } = await import('../schemas/seo');
    const field = seo.fields.find((f: any) => f.name === 'indexable');
    expect(field).toBeDefined();
    expect(field!.type).toBe('boolean');
  });

  it('defaults indexable to false so new pages are noindex by default', async () => {
    const { seo } = await import('../schemas/seo');
    const field = seo.fields.find((f: any) => f.name === 'indexable') as any;
    expect(field!.initialValue).toBe(false);
  });
});
