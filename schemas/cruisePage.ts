import { defineField, defineType } from 'sanity';
import { defineLocalizationFields } from './localization-fields';

export const cruisePage = defineType({
  name: 'cruisePage',
  title: 'Cruise page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    ...defineLocalizationFields(),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(170),
    }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'heroBlock',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pitch',
      title: 'Pitch',
      type: 'pitchBlock',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured image',
      type: 'fullWidthImageBlock',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'boat',
      title: 'Boat',
      type: 'boatBlock',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'itinerary',
      title: 'Itinerary',
      type: 'itineraryBlock',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Cruise page',
        subtitle: subtitle ? `/nos-croisieres/${subtitle}/` : 'No slug',
      };
    },
  },
});
