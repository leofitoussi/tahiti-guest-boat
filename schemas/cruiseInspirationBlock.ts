import { defineArrayMember, defineField, defineType } from 'sanity';

export const cruiseInspirationBlock = defineType({
  name: 'cruiseInspirationBlock',
  title: 'Cruise inspiration block',
  type: 'object',
  fields: [
    defineField({
      name: 'headingPrefix',
      title: 'Début du titre',
      type: 'string',
      initialValue: 'Quelques idées de',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headingHighlight',
      title: 'Mot mis en valeur (italique)',
      type: 'string',
      initialValue: 'croisière',
      description: 'Affiché en italique dans le titre, suivi d\'une virgule.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Sous-titre',
      type: 'string',
      initialValue: 'juste pour vous inspirer…',
      description: 'Affiché en italique sur la deuxième ligne du titre.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cards',
      title: 'Destinations',
      type: 'array',
      validation: (rule) => rule.required().min(1).max(6),
      of: [
        defineArrayMember({
          name: 'card',
          title: 'Destination',
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Photo',
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({ name: 'alt', title: 'Texte alternatif', type: 'string' }),
              ],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'linkUrl',
              title: 'URL du lien',
              type: 'url',
              validation: (rule) =>
                rule.required().uri({ allowRelative: true }),
            }),
            defineField({
              name: 'linkLabel',
              title: 'Libellé du lien',
              type: 'string',
              initialValue: 'Découvrir',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              media: 'image',
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      subtitle: 'headingHighlight',
    },
    prepare({ subtitle }) {
      return {
        title: 'Cruise inspiration block',
        subtitle: subtitle || 'Bloc inspiration croisière',
      };
    },
  },
});
