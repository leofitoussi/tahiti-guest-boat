import { defineField, defineType } from 'sanity';
import { defineLocalizationFields } from './localization-fields';
import { defineUniquePageBuilderField } from './pageBuilder';

export const componentsTestPage = defineType({
  name: 'componentsTestPage',
  title: 'Components test page',
  type: 'document',
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      initialValue: 'Composants | Tahiti Guest Boat',
      validation: (rule) => rule.required().max(70),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      initialValue: 'Page interne de test des composants Tahiti Guest Boat.',
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
        title: title || 'Components test page',
        subtitle: 'Page de test composants',
      };
    },
  },
});
