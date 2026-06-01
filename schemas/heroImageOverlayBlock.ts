import { defineField, defineType } from 'sanity';
import { inlineText } from './portableText';

export const heroImageOverlayBlock = defineType({
  name: 'heroImageOverlayBlock',
  title: 'Hero image avec titre superposé',
  type: 'object',
  fields: [
    defineField({
      name: 'firstLine',
      title: 'Première ligne du H1',
      description: 'Sélectionnez un mot pour appliquer le gras, l’italique, ou les deux.',
      type: 'array',
      of: inlineText,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'secondLine',
      title: 'Deuxième ligne du H1',
      description: 'Rendue plus petite que la première ligne.',
      type: 'array',
      of: inlineText,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'overlayOpacity',
      title: 'Opacité du filtre sur l’image',
      description: 'Valeur en pourcentage. 0 laisse l’image intacte, 80 ajoute un voile très marqué.',
      type: 'number',
      initialValue: 45,
      validation: (rule) => rule.min(0).max(80).integer(),
    }),
    defineField({
      name: 'image',
      title: 'Image hero',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Texte alternatif',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      firstLine: 'firstLine',
      secondLine: 'secondLine',
      media: 'image',
    },
    prepare({ firstLine, secondLine, media }) {
      const toText = (blocks = []) =>
        blocks
          .flatMap((block: any) => block.children ?? [])
          .map((child: any) => child.text)
          .join('');

      return {
        title: [toText(firstLine), toText(secondLine)].filter(Boolean).join(' ') || 'Hero image avec titre superposé',
        subtitle: 'H1 sur image avec transition arrondie',
        media,
      };
    },
  },
});
