import { defineField, defineType } from 'sanity';

export const homeHeroBlock = defineType({
  name: 'homeHeroBlock',
  title: 'Hero homepage',
  type: 'object',
  fields: [
    defineField({
      name: 'keywords',
      title: 'Mots-clés (max 3)',
      description: 'Affichés en grand à gauche de la section. Le dernier est mis en italique gras.',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.min(1).max(3),
    }),
    defineField({
      name: 'title',
      title: 'Titre principal (H1)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Corps de texte',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'primaryCtaLabel',
      title: 'CTA principal — texte',
      type: 'string',
    }),
    defineField({
      name: 'primaryCtaLink',
      title: 'CTA principal — lien',
      type: 'url',
      validation: (rule) =>
        rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'CTA secondaire — texte',
      type: 'string',
    }),
    defineField({
      name: 'secondaryCtaLink',
      title: 'CTA secondaire — lien',
      type: 'url',
      validation: (rule) =>
        rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
    }),
    defineField({
      name: 'image',
      title: 'Image hero',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texte alternatif',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Hero homepage',
        subtitle: 'Bloc hero — section principale',
        media,
      };
    },
  },
});
