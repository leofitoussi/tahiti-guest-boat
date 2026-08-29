import { StarIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

function isLegacyReview(document: unknown) {
  if (!document || typeof document !== 'object') return false;

  const record = document as Record<string, unknown>;
  return typeof record.body === 'string' && !record.bodyFr && !record.bodyEn;
}

export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (rule) => rule.required().min(0).max(5),
    }),
    defineField({
      name: 'originalLanguage',
      title: 'Original language',
      type: 'string',
      options: {
        list: [
          { title: 'French', value: 'fr' },
          { title: 'English', value: 'en' },
        ],
        layout: 'radio',
      },
      description: 'Language of the original testimonial. Choose it explicitly for each new review.',
      validation: (rule) =>
        rule.custom((value, context) =>
          value || isLegacyReview(context.document) ? true : 'Choose the original language before publishing this review.',
        ),
    }),
    defineField({
      name: 'body',
      title: 'Body (legacy)',
      type: 'text',
      rows: 4,
      hidden: true,
      deprecated: {
        reason: 'Kept temporarily while existing reviews are migrated to the French and English text fields.',
      },
    }),
    defineField({
      name: 'bodyFr',
      title: 'French text',
      type: 'text',
      rows: 4,
      validation: (rule) =>
        rule.custom((value, context) =>
          value || isLegacyReview(context.document) ? true : 'Add the French version before publishing this review.',
        ),
    }),
    defineField({
      name: 'bodyEn',
      title: 'English text',
      type: 'text',
      rows: 4,
      validation: (rule) =>
        rule.custom((value, context) =>
          value || isLegacyReview(context.document) ? true : 'Add the English version before publishing this review.',
        ),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Google', value: 'google' },
          { title: 'Manual', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'manual',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceId',
      title: 'Source ID',
      type: 'string',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'authorImage',
      title: 'Author image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'importedAt',
      title: 'Imported at',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      rating: 'rating',
      source: 'source',
      media: 'authorImage',
    },
    prepare({ title, rating, source, media }) {
      return {
        title: title || 'Review',
        subtitle: `${rating || 0}/5 - ${source || 'manual'}`,
        media,
      };
    },
  },
});
