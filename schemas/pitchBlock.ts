import { defineArrayMember, defineField, defineType } from 'sanity';

export const pitchBlock = defineType({
  name: 'pitchBlock',
  title: 'Pitch block',
  type: 'object',
  fields: [
    defineField({
      name: 'accroche',
      title: 'Accroche',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'badges',
      title: 'Badges',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'badge',
          title: 'Badge',
          type: 'object',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description: 'Emoji or icon name.',
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'icon',
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'accroche',
    },
    prepare({ title }) {
      return {
        title: title || 'Pitch block',
        subtitle: 'Pitch',
      };
    },
  },
});
