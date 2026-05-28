import { defineField, defineType } from 'sanity';

export const homePage = defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      validation: (rule) => rule.required().max(70),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: false,
      },
    }),
    defineField({
      name: 'logoAlt',
      title: 'Logo alt text',
      type: 'string',
    }),
    defineField({
      name: 'navItems',
      title: 'Navigation items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Link',
              type: 'url',
              validation: (rule) =>
                rule.required().uri({
                  allowRelative: true,
                  scheme: ['http', 'https', 'mailto', 'tel'],
                }),
            }),
            defineField({
              name: 'hasDropdown',
              title: 'Show dropdown indicator',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'href',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'reservationText',
      title: 'Reservation button text',
      type: 'string',
    }),
    defineField({
      name: 'reservationLink',
      title: 'Reservation button link',
      type: 'url',
      validation: (rule) =>
        rule.uri({
          allowRelative: true,
          scheme: ['http', 'https', 'mailto', 'tel'],
        }),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'heroImageAlt',
      title: 'Hero image alt text',
      type: 'string',
    }),
    defineField({
      name: 'heroKeywords',
      title: 'Hero keywords',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.min(1).max(3),
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroBody',
      title: 'Hero body',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'primaryCtaText',
      title: 'Primary CTA text',
      type: 'string',
    }),
    defineField({
      name: 'primaryCtaLink',
      title: 'Primary CTA link',
      type: 'url',
      validation: (rule) =>
        rule.uri({
          allowRelative: true,
          scheme: ['http', 'https', 'mailto', 'tel'],
        }),
    }),
    defineField({
      name: 'secondaryCtaText',
      title: 'Secondary CTA text',
      type: 'string',
    }),
    defineField({
      name: 'secondaryCtaLink',
      title: 'Secondary CTA link',
      type: 'url',
      validation: (rule) =>
        rule.uri({
          allowRelative: true,
          scheme: ['http', 'https', 'mailto', 'tel'],
        }),
    }),
  ],
  preview: {
    select: {
      title: 'heroTitle',
      media: 'heroImage',
    },
  },
});
