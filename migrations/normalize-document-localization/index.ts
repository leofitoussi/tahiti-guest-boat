import { at, defineMigration, set, unset } from 'sanity/migrate';

const localizedDocumentTypes = [
  'homePage',
  'siteSettings',
  'boatPage',
  'contactPage',
  'cruisePage',
  'blogPost',
  'legalPage',
  'activity',
  'activityTag',
  'componentsTestPage',
];

type LegacyLocalizedDocument = {
  _type?: string;
  language?: string;
  locale?: string;
};

export default defineMigration({
  title: 'Normalize document localization fields',
  documentTypes: localizedDocumentTypes,
  migrate: {
    document(document) {
      const doc = document as LegacyLocalizedDocument;
      const patches = [at('locale', unset()), at('translationGroup', unset())];

      if (doc._type === 'componentsTestPage') {
        return patches;
      }

      if (doc.language && doc.locale && doc.language !== doc.locale) {
        throw new Error(
          `Cannot normalize ${doc._type ?? 'document'}: language "${doc.language}" does not match locale "${doc.locale}".`,
        );
      }

      if (!doc.language) {
        if (doc.locale !== 'fr' && doc.locale !== 'en') {
          throw new Error(
            `Cannot normalize ${doc._type ?? 'document'}: expected locale "fr" or "en", received "${doc.locale ?? 'undefined'}".`,
          );
        }

        return [at('language', set(doc.locale)), ...patches];
      }

      return patches;
    },
  },
});
