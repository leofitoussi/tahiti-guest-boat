import { defineField, defineType } from 'sanity';

export const fullWidthImageBlock = defineType({
  name: 'fullWidthImageBlock',
  title: 'Full width image block',
  type: 'object',
  fields: [
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
      media: 'image',
      title: 'image.alt',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Full width image block',
        subtitle: 'Full width image',
        media,
      };
    },
  },
});
