import { defineField, defineType } from 'sanity';
import { richText } from './portableText';

export const videoFeatureBlock = defineType({
  name: 'videoFeatureBlock',
  title: 'Video feature block',
  type: 'object',
  fields: [
    defineField({
      name: 'iconImage',
      title: 'Icon image',
      type: 'image',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'title',
      title: 'Title H2',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Heading 2', value: 'h2' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [],
          },
        },
      ],
      validation: (rule) => rule.required().min(1).max(1),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: richText,
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button label',
      type: 'string',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'Button URL',
      type: 'url',
      validation: (rule) =>
        rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Accepts a YouTube watch, short or embed URL.',
      validation: (rule) =>
        rule
          .required()
          .uri({ allowRelative: false, scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'posterImage',
      title: 'Poster image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title.0.children.0.text',
      media: 'posterImage',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Video feature block',
        subtitle: 'Hero vidéo réutilisable',
        media,
      };
    },
  },
});
