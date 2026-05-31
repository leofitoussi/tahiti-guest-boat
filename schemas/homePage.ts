import { defineArrayMember, defineField, defineType } from 'sanity';

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

    // ─── Page builder ────────────────────────────────────────────────────────
    defineField({
      name: 'pageBuilder',
      title: 'Sections de la page',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({ type: 'heroHeaderBlock' }),
        defineArrayMember({ type: 'homeHeroBlock' }),
        defineArrayMember({ type: 'pitchBlock' }),
        defineArrayMember({ type: 'galleryBlock' }),
        defineArrayMember({ type: 'editorialBlock' }),
        defineArrayMember({ type: 'boatBlock' }),
        defineArrayMember({ type: 'videoFeatureBlock' }),
        defineArrayMember({ type: 'whyUsBlock' }),
        defineArrayMember({ type: 'reviewsBlock' }),
        defineArrayMember({ type: 'bookingBlock' }),
        defineArrayMember({ type: 'relatedCruisesBlock' }),
        defineArrayMember({ type: 'fullWidthImageBlock' }),
      ],
    }),
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
