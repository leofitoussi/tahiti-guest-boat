import { defineArrayMember, defineField, defineType } from 'sanity';

export const itineraryBlock = defineType({
  name: 'itineraryBlock',
  title: 'Itinerary block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'route',
      title: 'Route',
      type: 'string',
      description: 'Example: Hiva Oa > Tahuata > Fatu Hiva',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'itineraryStep',
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'route',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Itinerary block',
        subtitle: subtitle || 'Itinerary',
      };
    },
  },
});
