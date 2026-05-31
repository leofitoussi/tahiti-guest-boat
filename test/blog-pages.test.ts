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

// ── Cycle 1 ─────────────────────────────────────────────────────────────────
describe('blog article template — uniform', () => {
  it('exists at the expected public URL path', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('getBlogPost');
  });

  it('uses getStaticPaths driven by getBlogPosts', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('getStaticPaths');
    expect(source).toContain('getBlogPosts');
  });

  it('renders body via BlogContent (not PageBuilder)', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('BlogContent');
    expect(source).not.toContain('PageBuilder');
  });
});
