import { defineField, defineType } from 'sanity';
import { defineUniquePageBuilderField } from './pageBuilder';
import { defineLocalizationFields } from './localization-fields';

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact page',
  type: 'document',
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.required().max(70),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (rule) => rule.required().max(160),
    }),
    ...defineLocalizationFields(),
    defineUniquePageBuilderField(),
  ],
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  preview: {
    select: {
      title: 'seoTitle',
    },
    prepare({ title }) {
      return {
        title: title || 'Contact page',
        subtitle: `Page unique`,
      };
    },
  },
});
