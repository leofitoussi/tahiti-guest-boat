import { defineField, defineType } from 'sanity';
import { headingText, richText } from './portableText';

export const boatBlock = defineType({
  name: 'boatBlock',
  title: 'Boat block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'array',
      of: headingText,
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: richText,
    }),
    defineField({
      name: 'arguments',
      title: 'Arguments',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description: 'Emoji or short icon label.',
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 2,
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'body',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'boatImage',
      title: 'Boat image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'CTA URL',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      media: 'boatImage',
    },
    prepare({ media }) {
      return {
        title: 'Boat block',
        subtitle: 'Boat presentation',
        media,
      };
    },
  },
});
