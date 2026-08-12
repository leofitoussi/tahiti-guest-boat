import { at, defineMigration, set } from 'sanity/migrate';

export default defineMigration({
  title: 'Mark existing Homepage documents as French source versions',
  documentTypes: ['homePage'],
  filter: '!defined(language) && (!defined(locale) || locale == "fr")',
  migrate: {
    document() {
      return at('language', set('fr'));
    },
  },
});
