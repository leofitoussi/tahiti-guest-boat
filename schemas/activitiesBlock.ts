import { defineArrayMember, defineField, defineType } from 'sanity';
import { activityDescriptionText, h2HeadingText } from './portableText';

export const activitiesBlock = defineType({
  name: 'activitiesBlock',
  title: 'Activities block',
  type: 'object',
  fields: [
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      description: 'Optionnel. Exemple: activites pour créer un lien vers #activites.',
      type: 'string',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) {
            return true;
          }

          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
            ? true
            : 'Utiliser uniquement des minuscules, chiffres et tirets.';
        }),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'array',
      of: h2HeadingText,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'array',
      of: activityDescriptionText,
    }),
    defineField({
      name: 'groups',
      title: 'Groups',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'activityGroup',
          title: 'Activity group',
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'array',
              of: activityDescriptionText,
            }),
            defineField({
              name: 'tagFilters',
              title: 'Tag filters',
              description: 'Le groupe affiche les activités qui contiennent tous les tags sélectionnés.',
              type: 'array',
              of: [{ type: 'reference', to: [{ type: 'activityTag' }] }],
              validation: (rule) => rule.required().min(1).unique(),
            }),
          ],
          preview: {
            select: {
              title: 'heading',
            },
            prepare({ title }) {
              return {
                title: title || 'Activity group',
                subtitle: 'Filtrage par tags en mode ET',
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Activities block',
        subtitle: 'Grouped dynamic activities',
      };
    },
  },
});
