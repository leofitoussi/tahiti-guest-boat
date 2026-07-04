import { defineField, defineType } from 'sanity';
import { inlineText, plainText } from './portableText';

export const heroBlock = defineType({
  name: 'heroBlock',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'array',
      of: inlineText,
      description: 'Titre principal (gras / italique possibles).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Image de fond',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'overlayOpacity',
      title: 'Opacité du voile noir (%)',
      type: 'number',
      description: 'Assombrit l\'image de fond pour améliorer la lisibilité du titre. 0 = aucun voile (défaut), 100 = noir complet.',
      initialValue: 0,
      validation: (rule) => rule.min(0).max(100).integer(),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Libellé du bouton',
      type: 'string',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'Lien du bouton',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'backgroundImage',
    },
    prepare({ title, media }) {
      return {
        title: plainText(title) || 'Hero',
        subtitle: 'Hero',
        media,
      };
    },
  },
});
