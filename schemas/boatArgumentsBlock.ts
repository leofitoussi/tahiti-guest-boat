import { defineArrayMember, defineField, defineType } from 'sanity';
import { headingText, inlineText } from './portableText';

export const boatArgumentsBlock = defineType({
  name: 'boatArgumentsBlock',
  title: 'Boat arguments block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'array',
      of: headingText,
      description: 'Titre éditorial avec styles mixtes (gras, italique, romain).',
      validation: (rule) => rule.required().min(1).max(1),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: inlineText,
      description: 'Paragraphe de corps avec gras/italique inline.',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      description: 'Arguments clés affichés en grille sous le corps de texte.',
      of: [
        defineArrayMember({
          name: 'feature',
          title: 'Feature',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
            },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(4),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title.0.children.0.text',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Boat arguments block',
        subtitle: 'Titre + corps + arguments + photo',
        media,
      };
    },
  },
});
