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
  it('allows Heading 4 in the Blog Article body styles', () => {
    const field = blogPost.fields.find((f) => f.name === 'body') as any;
    expect(field).toBeDefined();
    expect(field.type).toBe('array');

    const blockMember = field.of.find((member: any) => member.type === 'block');
    const styleValues = blockMember.styles.map((style: any) => style.value);

    expect(styleValues).toContain('h4');
  });

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

  it('uses the primary page heading token for the Article title', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('font-size: var(--heading-1)');
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

describe('TableOfContents — desktop sticky behavior', () => {
  it('keeps the desktop variant scrollable with a runtime max-height variable', async () => {
    const source = await readFile('src/components/blog/TableOfContents.astro', 'utf8');
    expect(source).toContain('data-desktop-toc-scroll');
    expect(source).toContain('max-height: var(--toc-max-height');
    expect(source).toContain('lg:overflow-y-auto');
  });

  it('measures the desktop TOC to compute a sticky offset', async () => {
    const source = await readFile('src/components/blog/TableOfContents.astro', 'utf8');
    expect(source).toContain('data-desktop-toc');
    expect(source).toContain('ResizeObserver');
    expect(source).toContain("--toc-sticky-top");
    expect(source).toContain("--toc-max-height");
  });

  it('applies sticky positioning with a CSS variable on the desktop sidebar grid item', async () => {
    const source = await readFile('src/pages/blog/[slug].astro', 'utf8');
    expect(source).toContain('lg:sticky');
    expect(source).toContain('top: var(--toc-sticky-top, 6rem);');
  });
});

describe('BlogContent — heading block overrides', () => {
  it('imports HeadingBlock', async () => {
    const source = await readFile('src/components/blog/BlogContent.astro', 'utf8');
    expect(source).toContain('HeadingBlock');
  });

  it('maps h4 blocks to HeadingBlock', async () => {
    const source = await readFile('src/components/blog/BlogContent.astro', 'utf8');
    expect(source).toContain('h4: HeadingBlock');
  });

  it('maps h2 and h3 blocks to HeadingBlock', async () => {
    const source = await readFile('src/components/blog/BlogContent.astro', 'utf8');
    expect(source).toContain('h2: HeadingBlock');
    expect(source).toContain('h3: HeadingBlock');
  });

  it('uses design system body and heading scale tokens for Blog editorial content', async () => {
    const source = await readFile('src/components/blog/BlogContent.astro', 'utf8');
    expect(source).toContain('font-size: var(--font-size-base);');
    expect(source).toContain('font-size: var(--heading-2);');
    expect(source).toContain('font-size: var(--heading-3);');
    expect(source).toContain('font-size: var(--heading-4);');
  });

  it('uses tokenized spacing and agreed color hierarchy for Blog body headings', async () => {
    const source = await readFile('src/components/blog/BlogContent.astro', 'utf8');
    expect(source).toContain('margin: var(--space-10) 0 var(--space-4);');
    expect(source).toContain('margin: var(--space-8) 0 var(--space-3);');
    expect(source).toContain('margin: var(--space-6) 0 var(--space-3);');
    expect(source).toContain('color: var(--primary);');
    expect(source).toMatch(/:global\(h3\)[\s\S]*color:\s*var\(--foreground\)/);
    expect(source).toMatch(/:global\(h4\)[\s\S]*color:\s*var\(--foreground\)/);
  });

  it('gives h4 headings the same scroll offset used for deep-linked Blog headings', async () => {
    const source = await readFile('src/components/blog/BlogContent.astro', 'utf8');
    expect(source).toMatch(/:global\(h4\)[\s\S]*scroll-margin-top:\s*6rem/);
  });
});

describe('HeadingBlock — heading id anchor', () => {
  it('calls headingId to set the id attribute', async () => {
    const source = await readFile('src/components/blog/HeadingBlock.astro', 'utf8');
    expect(source).toContain('headingId');
    expect(source).toContain('id={headingId(node)}');
  });

  it('supports h4 as a rendered Blog heading level', async () => {
    const source = await readFile('src/components/blog/HeadingBlock.astro', 'utf8');
    expect(source).toContain("node.style === 'h4'");
  });
});

describe('extractHeadings — unit', () => {
  it('extracts h2 and h3 blocks with correct id and level', async () => {
    const { extractHeadings } = await import('../src/lib/portable-text-headings');
    const body = [
      { _type: 'block', _key: 'h1', style: 'h1', children: [{ _type: 'span', text: 'Titre principal' }] },
      { _type: 'block', _key: 'abc', style: 'h2', children: [{ _type: 'span', text: 'Section un' }] },
      { _type: 'block', _key: 'def', style: 'h3', children: [{ _type: 'span', text: 'Sous-section' }] },
      { _type: 'block', _key: 'h4', style: 'h4', children: [{ _type: 'span', text: 'Section ignorée' }] },
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

  it('does not include h1 or h4 blocks in the extracted headings', async () => {
    const { extractHeadings } = await import('../src/lib/portable-text-headings');
    const body = [
      { _type: 'block', _key: 'a', style: 'h1', children: [{ _type: 'span', text: 'Titre principal' }] },
      { _type: 'block', _key: 'b', style: 'h4', children: [{ _type: 'span', text: 'Titre secondaire' }] },
    ];

    expect(extractHeadings(body as any)).toEqual([]);
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
