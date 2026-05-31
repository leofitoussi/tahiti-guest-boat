import { defineField, defineType } from 'sanity';

export const reviewsBlock = defineType({
  name: 'reviewsBlock',
  title: 'Reviews block',
  type: 'object',
  fields: [
    defineField({
      name: 'dynamicBlock',
      title: 'Dynamic block',
      type: 'boolean',
      initialValue: true,
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Reviews block',
        subtitle: 'Dynamic reviews',
      };
    },
  },
});
