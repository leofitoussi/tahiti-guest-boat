import { defineField, defineType } from 'sanity';
import { defineUniquePageBuilderField } from './pageBuilder';
import { defineLocalizationFields } from './localization-fields';
import { seo as seoType } from './seo';

export const boatPage = defineType({
  name: 'boatPage',
  title: 'Boat page',
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
    defineField({
      name: 'seo',
      title: seoType.title,
      type: 'seo',
      group: 'seo',
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
        title: title || 'Boat page',
        subtitle: `Page unique`,
      };
    },
  },
});
