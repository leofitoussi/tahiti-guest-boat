import { defineField, defineType } from 'sanity';

export const relatedCruisesBlock = defineType({
  name: 'relatedCruisesBlock',
  title: 'Related cruises block',
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
        title: 'Related cruises block',
        subtitle: 'Dynamic related cruises',
      };
    },
  },
});
