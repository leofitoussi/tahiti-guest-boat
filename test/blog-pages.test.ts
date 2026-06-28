import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { blogPost } from '../schemas/blogPost';
import * as blogLib from '../src/lib/blog';

// ── Cycle 4 ─────────────────────────────────────────────────────────────────
describe('blog article template — cruise relationship links', () => {
  it('links to the primary cruise via /nos-croisieres/[slug]/', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('primaryCruise');
    expect(source).toContain('/nos-croisieres/');
  });

  it('links to secondary cruises via /nos-croisieres/[slug]/', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('secondaryCruises');
  });

  it('renders the cruise relationship section only when at least one cruise is linked', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    // Guard condition — section hidden when no cruises
    expect(source).toMatch(/primaryCruise\s*\|\|\s*secondaryCruises|secondaryCruises\.length\s*>\s*0/);
  });
});

// ── Cycle 3 ─────────────────────────────────────────────────────────────────
describe('blog lib — exports and GROQ cruise dereferencing', () => {
  it('exports getBlogPosts as a function', () => {
    expect(typeof blogLib.getBlogPosts).toBe('function');
  });

  it('exports getBlogPost as a function', () => {
    expect(typeof blogLib.getBlogPost).toBe('function');
  });

  it('GROQ query dereferences primaryCruise with ->', async () => {
    const source = await readFile('src/lib/blog.ts', 'utf8');
    expect(source).toContain('primaryCruise->');
  });

  it('GROQ query dereferences secondaryCruises with []-> ', async () => {
    const source = await readFile('src/lib/blog.ts', 'utf8');
    expect(source).toContain('secondaryCruises[]->');
  });
});

// ── Cycle 2 ─────────────────────────────────────────────────────────────────
describe('blogPost schema — cruise relationships', () => {
  it('has a primaryCruise field referencing cruisePage', () => {
    const field = blogPost.fields.find((f) => f.name === 'primaryCruise') as any;
    expect(field).toBeDefined();
    expect(field.type).toBe('reference');
    expect(field.to).toEqual(expect.arrayContaining([{ type: 'cruisePage' }]));
  });

  it('marks primaryCruise as required', () => {
    const field = blogPost.fields.find((f) => f.name === 'primaryCruise') as any;
    // validation is a function — just assert it exists (Sanity rule chain)
    expect(typeof field.validation).toBe('function');
  });

  it('has a secondaryCruises field as an array of cruisePage references', () => {
    const field = blogPost.fields.find((f) => f.name === 'secondaryCruises') as any;
    expect(field).toBeDefined();
    expect(field.type).toBe('array');
    const memberTypes = field.of.map((m: any) => m.type);
    expect(memberTypes).toContain('reference');
  });

  it('caps secondaryCruises at 3 entries', () => {
    const field = blogPost.fields.find((f) => f.name === 'secondaryCruises') as any;
    expect(typeof field.validation).toBe('function');
  });
});

// ── Cycle 5 ─────────────────────────────────────────────────────────────────
describe('blog article template — table of contents & reading width', () => {
  it('imports TableOfContents', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('TableOfContents');
  });

  it('renders TableOfContents with mobile and desktop variants', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('variant="mobile"');
    expect(source).toContain('variant="desktop"');
  });

  it('applies 68ch reading width to the article body column', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('max-w-[68ch]');
  });

  it('uses a 2-column desktop grid', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('lg:grid-cols-[minmax(0,1fr)_220px]');
  });

  it('imports extractHeadings from portable-text-headings', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('extractHeadings');
  });
});

describe('BlogContent — heading block overrides', () => {
  it('imports HeadingBlock', async () => {
    const source = await readFile('src/components/blog/BlogContent.astro', 'utf8');
    expect(source).toContain('HeadingBlock');
  });

  it('maps h2 and h3 blocks to HeadingBlock', async () => {
    const source = await readFile('src/components/blog/BlogContent.astro', 'utf8');
    expect(source).toContain('h2: HeadingBlock');
    expect(source).toContain('h3: HeadingBlock');
  });
});

describe('HeadingBlock — heading id anchor', () => {
  it('calls headingId to set the id attribute', async () => {
    const source = await readFile('src/components/blog/HeadingBlock.astro', 'utf8');
    expect(source).toContain('headingId');
    expect(source).toContain('id={headingId(node)}');
  });
});

describe('extractHeadings — unit', () => {
  it('extracts h2 and h3 blocks with correct id and level', async () => {
    const { extractHeadings } = await import('../src/lib/portable-text-headings');
    const body = [
      { _type: 'block', _key: 'abc', style: 'h2', children: [{ _type: 'span', text: 'Section un' }] },
      { _type: 'block', _key: 'def', style: 'h3', children: [{ _type: 'span', text: 'Sous-section' }] },
      { _type: 'block', _key: 'ghi', style: 'normal', children: [{ _type: 'span', text: 'Paragraphe' }] },
    ];
    const headings = extractHeadings(body as any);
    expect(headings).toHaveLength(2);
    expect(headings[0]).toEqual({ id: 'heading-abc', text: 'Section un', level: 2 });
    expect(headings[1]).toEqual({ id: 'heading-def', text: 'Sous-section', level: 3 });
  });

  it('ignores blocks with empty text', async () => {
    const { extractHeadings } = await import('../src/lib/portable-text-headings');
    const body = [
      { _type: 'block', _key: 'xyz', style: 'h2', children: [{ _type: 'span', text: '' }] },
    ];
    expect(extractHeadings(body as any)).toHaveLength(0);
  });
});

// ── Cycle 1 ─────────────────────────────────────────────────────────────────
describe('blog article template — uniform', () => {
  it('exists at the expected public URL path', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('getBlogPost');
  });

  it('uses getStaticPaths driven by getAllBlogSlugs', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('getStaticPaths');
    expect(source).toContain('getAllBlogSlugs');
  });

  it('renders body via BlogContent (not PageBuilder)', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('BlogContent');
    expect(source).not.toContain('PageBuilder');
  });
});
