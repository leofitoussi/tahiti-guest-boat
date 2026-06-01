import { defineArrayMember, defineField, defineType } from 'sanity';
import { headingText, richText } from './portableText';

export const cabinTourBlock = defineType({
  name: 'cabinTourBlock',
  title: 'Cabin tour block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de section',
      type: 'array',
      of: headingText,
      description: 'Titre éditorial avec styles mixtes (gras, italique, romain).',
      validation: (rule) => rule.required().min(1).max(1),
    }),
    defineField({
      name: 'tabs',
      title: 'Espaces',
      type: 'array',
      description: "Chaque espace (cabine, carré, cuisine…) devient un onglet.",
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'cabinTab',
          title: 'Espace',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: "Nom de l'espace",
              type: 'string',
              description: "Affiché dans l'onglet et en titre du panneau.",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Description',
              type: 'array',
              of: richText,
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: 'image',
              title: 'Photo',
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Texte alternatif',
                  type: 'string',
                  validation: (rule) => rule.required(),
                }),
              ],
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'label', media: 'image' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title.0.children.0.text',
      media: 'tabs.0.image',
    },
    prepare({ title, media }) {
      return {
        title: (title as string) || 'Cabin tour block',
        subtitle: 'Onglets par espace',
        media,
      };
    },
  },
});
