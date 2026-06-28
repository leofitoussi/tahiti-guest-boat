import type { TypedObject } from 'astro-portabletext/types';

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function headingId(block: { _key?: string }): string {
  return `heading-${block._key ?? ''}`;
}

function blockText(block: any): string {
  return (block.children ?? []).map((c: any) => c.text ?? '').join('').trim();
}

export function extractHeadings(body: TypedObject[] = []): Heading[] {
  return (body as any[])
    .filter((b) => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'))
    .map((b) => ({ id: headingId(b), text: blockText(b), level: (b.style === 'h2' ? 2 : 3) as 2 | 3 }))
    .filter((h) => h.text.length > 0);
}
