import { defineField, defineType } from 'sanity';

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'indexable',
      title: 'Indexable par Google',
      type: 'boolean',
      initialValue: false,
      description: 'Cocher pour autoriser Google à indexer cette page. Par défaut, les nouvelles pages sont masquées des moteurs de recherche.',
    }),
  ],
});
