import { defineArrayMember, defineField, defineType } from 'sanity';
import { inlineText, plainText } from './portableText';

export const itineraryBlock = defineType({
  name: 'itineraryBlock',
  title: 'Itinéraire',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'array',
      of: inlineText,
      description: 'Titre de la section (gras / italique possibles).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'route',
      title: 'Parcours',
      type: 'string',
      description: 'Exemple : Hiva Oa > Tahuata > Fatu Hiva',
    }),
    defineField({
      name: 'steps',
      title: 'Étapes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'itineraryStep',
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'route',
    },
    prepare({ title, subtitle }) {
      return {
        title: plainText(title) || 'Itinéraire',
        subtitle: subtitle || 'Itinéraire',
      };
    },
  },
});
