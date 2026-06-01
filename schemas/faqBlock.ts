import { defineArrayMember, defineField, defineType } from 'sanity';
import { richText } from './portableText';

export const faqBlock = defineType({
  name: 'faqBlock',
  title: 'FAQ',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de la section',
      type: 'string',
      initialValue: 'Foire aux questions',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Texte introductif affiché sous le titre.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Bouton — libellé',
      type: 'string',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Bouton — lien',
      type: 'url',
      validation: (rule) =>
        rule.uri({
          allowRelative: true,
          scheme: ['http', 'https', 'mailto', 'tel'],
        }),
    }),
    defineField({
      name: 'items',
      title: 'Questions / réponses',
      type: 'array',
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'faqItem',
          title: 'Question',
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Réponse',
              type: 'array',
              of: richText,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'question' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return {
        title: title || 'FAQ',
        subtitle: 'Accordéon de questions',
      };
    },
  },
});
