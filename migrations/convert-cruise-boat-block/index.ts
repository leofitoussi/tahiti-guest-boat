import { at, defineMigration, set } from 'sanity/migrate';

type PortableTextBlock = {
  children?: { text?: string }[];
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

export default defineMigration({
  title: 'Convert cruise boat block to image text model',
  documentTypes: ['cruisePage'],
  filter: 'defined(boat) && (defined(boat.title) || defined(boat.boatImage) || defined(boat.arguments))',
  migrate: {
    document(doc) {
      const boat = doc.boat as Record<string, unknown> | undefined;
      if (!boat) return;
      const heading = typeof boat.heading === 'string' ? boat.heading : portableTextToPlainText(boat.title);
      const image = (boat.image || boat.boatImage) as Record<string, unknown> | undefined;
      const normalizedImage =
        image && typeof image === 'object'
          ? {
              ...image,
              alt: typeof image.alt === 'string' && image.alt ? image.alt : 'Catamaran Na Maka au mouillage',
            }
          : undefined;
      const nextBoat = Object.fromEntries(
        Object.entries({
          _type: 'boatBlock',
          heading,
          body: boat.body,
          image: normalizedImage,
          ctaLabel: boat.ctaLabel,
          ctaUrl: boat.ctaUrl,
          desktopLayout: 'text-image',
        }).filter(([, value]) => value !== undefined),
      );

      return at('boat', set(nextBoat));
    },
  },
});
