import { at, defineMigration, set } from 'sanity/migrate';

type ReviewLanguage = 'fr' | 'en';

export default defineMigration({
  title: 'Copy existing review bodies into their original language field',
  documentTypes: ['review'],
  filter: 'defined(body) && defined(originalLanguage)',
  migrate: {
    document(doc) {
      const body = typeof doc.body === 'string' ? doc.body : undefined;
      const originalLanguage = doc.originalLanguage as ReviewLanguage | undefined;

      if (!body || !originalLanguage) return;

      const targetField = originalLanguage === 'en' ? 'bodyEn' : 'bodyFr';
      if (typeof doc[targetField] === 'string' && doc[targetField]) return;

      return at(targetField, set(body));
    },
  },
});
