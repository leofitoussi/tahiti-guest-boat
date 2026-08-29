import { defineField, defineType } from 'sanity';
import { activityDescriptionText } from './portableText';
import { defineLocalizationFields } from './localization-fields';

export const activity = defineType({
  name: 'activity',
  title: 'Activity',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
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
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: activityDescriptionText,
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      description: '3 affiche cette activité avant 2, puis 1.',
      type: 'number',
      options: {
        list: [
          { title: '1/3', value: 1 },
          { title: '2/3', value: 2 },
          { title: '3/3', value: 3 },
        ],
        layout: 'radio',
      },
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(1).max(3),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'activityTag' }] }],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
    }),
    ...defineLocalizationFields(),
  ],
  preview: {
    select: {
      title: 'title',
      priority: 'priority',
      language: 'language',
      media: 'image',
    },
    prepare({ title, priority, language, media }) {
      return {
        title: title || 'Activity',
        subtitle: `${priority || 1}/3${language ? ` - ${language.toUpperCase()}` : ''}`,
        media,
      };
    },
  },
});
