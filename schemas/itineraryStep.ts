import { defineField, defineType } from 'sanity';
import { richText } from './portableText';

export const itineraryStep = defineType({
  name: 'itineraryStep',
  title: 'Itinerary step',
  type: 'object',
  fields: [
    defineField({
      name: 'dayLabel',
      title: 'Day label',
      type: 'string',
      description: 'Example: Jour 1 à 3',
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
          title: 'Alternative text',
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
        title: title || 'Itinerary step',
        subtitle: 'Itinerary',
        media,
      };
    },
  },
});
