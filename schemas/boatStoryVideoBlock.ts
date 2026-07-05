import { defineField, defineType } from 'sanity';
import { headingText, richText } from './portableText';

export const boatStoryVideoBlock = defineType({
  name: 'boatStoryVideoBlock',
  title: 'Boat story video block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'array',
      of: headingText,
      validation: (rule) => rule.required().min(1).max(1),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: richText,
      validation: (rule) => rule.required().min(1),
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
      name: 'videoTitle',
      title: 'Video title',
      type: 'string',
      description: 'Accessible title used for the embedded YouTube player.',
      validation: (rule) => rule.required(),
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
        title: title || 'Boat story video block',
        subtitle: 'Logo, récit éditorial et vidéo',
        media,
      };
    },
  },
});
