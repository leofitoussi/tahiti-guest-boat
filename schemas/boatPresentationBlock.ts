import { defineField, defineType } from 'sanity';
import { headingText, richText } from './portableText';

export const boatPresentationBlock = defineType({
  name: 'boatPresentationBlock',
  title: 'Boat presentation block',
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
      of: richText,
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'blueprintImages',
      title: 'Blueprint images',
      type: 'array',
      description: 'Deux dessins techniques / plans du bateau affichés côte à côte.',
      of: [
        {
          type: 'image',
          options: { hotspot: false },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
      validation: (rule) => rule.required().min(1).max(2),
    }),
  ],
  preview: {
    select: {
      title: 'title.0.children.0.text',
      media: 'blueprintImages.0',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Boat presentation block',
        subtitle: 'Titre éditorial + corps + plans techniques',
        media,
      };
    },
  },
});
