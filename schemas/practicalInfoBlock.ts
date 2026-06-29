import { defineField, defineType } from 'sanity';
import { richText } from './portableText';

const columnFields = () => [
  defineField({
    name: 'title',
    title: 'Titre',
    type: 'string',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'body',
    title: 'Contenu',
    type: 'array',
    of: richText,
    description: 'Gras, italique, listes, liens, retours à la ligne.',
  }),
];

export const practicalInfoBlock = defineType({
  name: 'practicalInfoBlock',
  title: 'Informations pratiques',
  type: 'object',
  fields: [
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      description: 'Optionnel. Exemple: informations-pratiques pour créer un lien vers #informations-pratiques.',
      type: 'string',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true;
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
            ? true
            : 'Utiliser uniquement des minuscules, chiffres et tirets.';
        }),
    }),
    defineField({
      name: 'sectionTitle',
      title: 'Titre de section',
      type: 'string',
      initialValue: 'Informations pratiques',
    }),
    defineField({
      name: 'leftColumn',
      title: 'Colonne gauche',
      type: 'object',
      fields: columnFields(),
    }),
    defineField({
      name: 'rightColumn',
      title: 'Colonne droite',
      type: 'object',
      fields: columnFields(),
    }),
  ],
  preview: {
    select: {
      title: 'sectionTitle',
      left: 'leftColumn.title',
      right: 'rightColumn.title',
    },
    prepare({ title, left, right }) {
      return {
        title: title || 'Informations pratiques',
        subtitle: [left, right].filter(Boolean).join(' · ') || 'Contact & Tarif',
      };
    },
  },
});
