import { defineField, defineType } from 'sanity';

export const bookingBlock = defineType({
  name: 'bookingBlock',
  title: 'Booking block',
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
        title: 'Booking block',
        subtitle: 'Dynamic booking form',
      };
    },
  },
});
