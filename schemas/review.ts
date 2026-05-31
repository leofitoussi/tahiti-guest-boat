import { StarIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (rule) => rule.required().min(0).max(5),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Google', value: 'google' },
          { title: 'Manual', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'manual',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceId',
      title: 'Source ID',
      type: 'string',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'authorImage',
      title: 'Author image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'importedAt',
      title: 'Imported at',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      rating: 'rating',
      source: 'source',
      media: 'authorImage',
    },
    prepare({ title, rating, source, media }) {
      return {
        title: title || 'Review',
        subtitle: `${rating || 0}/5 - ${source || 'manual'}`,
        media,
      };
    },
  },
});
