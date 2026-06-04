import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { cruisePage } from '../schemas/cruisePage';
import { activityDescriptionText, inlineText } from '../schemas/portableText';

function galleryFields() {
  const fields = Object.fromEntries(cruisePage.fields.map((f: any) => [f.name, f]));
  return Object.fromEntries((fields.gallery as any).fields.map((f: any) => [f.name, f]));
}

describe('Page croisière — Galerie défilante block', () => {
  it('models the title as inline rich text so editors can bold/italic it', () => {
    const g = galleryFields();
    expect(g.title.type).toBe('array');
    expect(g.title.of).toBe(inlineText);
  });

  it('keeps the free intro text as rich text (bold, italic, links, lists)', () => {
    const g = galleryFields();
    expect(g.text.type).toBe('array');
    expect(g.text.of).toBe(activityDescriptionText);
  });

  it('orders gallery fields title → text → images', () => {
    const fields = Object.fromEntries(cruisePage.fields.map((f: any) => [f.name, f]));
    const names = (fields.gallery as any).fields.map((f: any) => f.name);
    expect(names).toEqual(['title', 'text', 'images']);
  });

  it('renders the title through portable text with a heading serializer (supports marks)', async () => {
    const source = await readFile('src/components/cruises/CruiseGalleryBlock.astro', 'utf8');
    expect(source).toContain('PortableText');
    expect(source).toContain('GalleryHeading');
    expect(source).toContain('slot="title"');
  });

  it('does not prematurely clamp the intro text width', async () => {
    const source = await readFile('src/components/cruises/CruiseGalleryBlock.astro', 'utf8');
    expect(source).not.toContain('max-w-2xl');
  });

  it('shows list markers for bullet and numbered lists in cruise rich text', async () => {
    const source = await readFile('src/components/cruises/CruisePortableText.astro', 'utf8');
    expect(source).toContain('list-style-type: disc');
    expect(source).toContain('list-style-type: decimal');
  });

  it('exposes a heading serializer that renders an h2 preserving inline marks', async () => {
    const source = await readFile('src/components/cruises/GalleryHeading.astro', 'utf8');
    expect(source).toContain('<h2');
    expect(source).toContain('<slot');
  });
});
