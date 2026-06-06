import { at, defineMigration, set } from 'sanity/migrate';

type PortableTextBlock = {
  children?: { text?: string }[];
};

type PageBuilderBlock = Record<string, unknown> & {
  _type?: string;
};

function portableTextToPlainText(value: unknown): string | undefined {
  if (!Array.isArray(value)) return undefined;
  const text = value
    .map((block: PortableTextBlock) => block.children?.map((child) => child.text || '').join('') || '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text || undefined;
}

function normalizeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const url = value.trim();
  if (/^(https?:|mailto:|tel:|\/)/.test(url)) return url;
  return `https://${url}`;
}

function normalizeImage(value: unknown) {
  if (!value || typeof value !== 'object') return undefined;
  const image = value as Record<string, unknown>;
  return {
    ...image,
    alt: typeof image.alt === 'string' && image.alt ? image.alt : 'Catamaran Na Maka au mouillage',
  };
}

function convertBoatBlock(block: PageBuilderBlock) {
  if (block._type !== 'boatBlock') return block;

  return Object.fromEntries(
    Object.entries({
      _key: block._key,
      _type: 'boatBlock',
      heading: typeof block.heading === 'string' ? block.heading : portableTextToPlainText(block.title),
      body: block.body,
      image: normalizeImage(block.image || block.boatImage),
      ctaLabel: block.ctaLabel,
      ctaUrl: normalizeUrl(block.ctaUrl),
      desktopLayout: block.desktopLayout === 'image-text' ? 'image-text' : 'text-image',
    }).filter(([, value]) => value !== undefined),
  );
}

export default defineMigration({
  title: 'Convert page builder boat blocks to image text model',
  filter: 'defined(pageBuilder) && count(pageBuilder[_type == "boatBlock" && (defined(title) || defined(boatImage) || defined(arguments) || !defined(desktopLayout))]) > 0',
  migrate: {
    document(doc) {
      if (!Array.isArray(doc.pageBuilder)) return;
      return at('pageBuilder', set(doc.pageBuilder.map(convertBoatBlock)));
    },
  },
});
