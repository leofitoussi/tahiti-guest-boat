import { defineField, defineType } from 'sanity';
import { headingText, richText } from './portableText';

export const editorialBlock = defineType({
  name: 'editorialBlock',
  title: 'Editorial block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'array',
      of: headingText,
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: richText,
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'desktopLayout',
      title: 'Desktop layout',
      type: 'string',
      options: {
        list: [
          { title: 'Image puis texte', value: 'image-text' },
          { title: 'Texte puis image', value: 'text-image' },
        ],
        layout: 'radio',
      },
      initialValue: 'image-text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mobileLayout',
      title: 'Mobile layout',
      type: 'string',
      options: {
        list: [
          { title: 'Image puis texte', value: 'image-text' },
          { title: 'Texte puis image', value: 'text-image' },
        ],
        layout: 'radio',
      },
      initialValue: 'text-image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'primaryCtaLabel',
      title: 'Primary CTA label',
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
      name: 'secondaryCtaLabel',
      title: 'Secondary CTA label',
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
    prepare() {
      return {
        title: 'Editorial block',
        subtitle: 'Image + texte + CTA',
      };
    },
  },
});
