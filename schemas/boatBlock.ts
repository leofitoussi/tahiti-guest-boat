import { defineField, defineType } from 'sanity';
import { inlineText, plainText, richText } from './portableText';

export const boatBlock = defineType({
  name: 'boatBlock',
  title: 'Bloc bateau',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'array',
      of: inlineText,
      description: 'Titre du bloc (gras / italique possibles).',
    }),
    defineField({
      name: 'body',
      title: 'Texte',
      type: 'array',
      of: richText,
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
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Libellé CTA',
      type: 'string',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'Lien CTA',
      type: 'url',
      validation: (rule) => rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
    }),
    defineField({
      name: 'desktopLayout',
      title: 'Ordre des colonnes sur desktop',
      type: 'string',
      initialValue: 'text-image',
      options: {
        layout: 'radio',
        list: [
          { title: 'Texte puis image', value: 'text-image' },
          { title: 'Image puis texte', value: 'image-text' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title: plainText(title) || 'Bloc bateau',
        subtitle: 'Présentation bateau',
        media,
      };
    },
  },
});
