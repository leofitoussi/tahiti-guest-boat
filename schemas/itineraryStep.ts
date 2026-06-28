import { defineField, defineType } from 'sanity';
import { inlineText, plainText, richText } from './portableText';

export const itineraryStep = defineType({
  name: 'itineraryStep',
  title: 'Étape d’itinéraire',
  type: 'object',
  fields: [
    defineField({
      name: 'dayLabel',
      title: 'Libellé du jour',
      type: 'array',
      of: inlineText,
      description: 'Exemple : Jour 1 à 3 (gras / italique possibles).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: richText,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
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
      title: 'dayLabel',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title: plainText(title) || 'Étape d’itinéraire',
        subtitle: 'Itinéraire',
        media,
      };
    },
  },
});
