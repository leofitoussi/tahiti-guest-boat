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
    }),
    defineField({
      name: 'locale',
      title: 'Locale',
      type: 'string',
      deprecated: {
        reason: 'Use the Studio document internationalization workflow and the hidden language field.',
      },
      readOnly: true,
      options: {
        documentInternationalization: { exclude: true },
      },
      initialValue: 'fr',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'translationGroup',
      title: 'Translation group',
      type: 'string',
      description: 'Legacy field. Translation groups are now controlled by Sanity references.',
      deprecated: {
        reason: 'Translation groups are managed by translation.metadata references.',
      },
      readOnly: true,
      options: {
        documentInternationalization: { exclude: true },
      },
    }),
  ] as const;
}
