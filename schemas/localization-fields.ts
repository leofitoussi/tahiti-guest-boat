import { defineField } from 'sanity';

export function defineLocalizationFields() {
  return [
    defineField({
      name: 'locale',
      title: 'Locale',
      type: 'string',
      options: {
        list: [
          { title: 'French', value: 'fr' },
          { title: 'English', value: 'en' },
        ],
      },
      initialValue: 'fr',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'translationGroup',
      title: 'Translation group',
      type: 'string',
      description: 'Shared key linking the French and English versions of the same page.',
    }),
  ] as const;
}

