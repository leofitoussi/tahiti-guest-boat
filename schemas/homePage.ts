import { defineField, defineType } from 'sanity';
import { defineUniquePageBuilderField } from './pageBuilder';
import { defineLocalizationFields } from './localization-fields';
import { seo as seoType } from './seo';

export const homePage = defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  fields: [
    // ─── SEO ────────────────────────────────────────────────────────────────
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

    // ─── Page builder ────────────────────────────────────────────────────────
    defineUniquePageBuilderField(),
  ],

  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'seo', title: 'SEO' },
  ],

  preview: {
    select: {
      title: 'seoTitle',
      media: 'logo',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Homepage',
        subtitle: `Page d'accueil`,
        media,
      };
    },
  },
});
