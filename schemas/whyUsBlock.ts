import { defineField, defineType } from 'sanity';

export const whyUsBlock = defineType({
  name: 'whyUsBlock',
  title: 'Why us block',
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
        title: 'Why us block',
        subtitle: 'Dynamic shared content',
      };
    },
  },
});
