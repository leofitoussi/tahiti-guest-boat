import { defineField } from 'sanity';

export function defineLocalizationFields() {
  return [
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      description: 'Managed by the document internationalization workflow.',
      options: {
        list: [
          { title: 'French', value: 'fr' },
          { title: 'English', value: 'en' },
        ],
      },
      readOnly: true,
      hidden: true,
      initialValue: 'fr',
      validation: (rule) => rule.required(),
    }),
  ] as const;
}
