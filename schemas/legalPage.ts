import { defineField, defineType } from 'sanity';
import { richText } from './portableText';
import { defineLocalizationFields } from './localization-fields';

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Page légale',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    ...defineLocalizationFields(),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'array',
      of: richText,
    }),
    defineField({
      name: 'seoTitle',
      title: 'Titre SEO',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'Description SEO',
      type: 'text',
      rows: 3,
    }),
  ],
});
