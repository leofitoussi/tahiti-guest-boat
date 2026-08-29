import { defineField, defineType } from 'sanity';
import { defineLocalizationFields } from './localization-fields';

export const activityTag = defineType({
  name: 'activityTag',
  title: 'Activity tag',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    ...defineLocalizationFields(),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      language: 'language',
    },
    prepare({ title, language }) {
      return {
        title: title || 'Activity tag',
        subtitle: language ? language.toUpperCase() : undefined,
      };
    },
  },
});
