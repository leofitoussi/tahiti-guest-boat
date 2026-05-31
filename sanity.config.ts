import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const nodeEnv = typeof process !== 'undefined' ? process.env : {};
const projectId = env?.PUBLIC_SANITY_PROJECT_ID || nodeEnv.PUBLIC_SANITY_PROJECT_ID || 'hct2hzrl';
const dataset = env?.PUBLIC_SANITY_DATASET || nodeEnv.PUBLIC_SANITY_DATASET || 'production';
const homePageDocumentId = 'f512860b-c337-4a81-b057-a93acdc2c961';
const siteSettingsDocumentId = 'siteSettings';

export default defineConfig({
  name: 'default',
  title: 'Tahiti Guest Boat',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Homepage')
              .schemaType('homePage')
              .child(S.document().schemaType('homePage').documentId(homePageDocumentId)),
            S.listItem()
              .title('Site settings')
              .schemaType('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId(siteSettingsDocumentId)),
            S.divider(),
            S.documentTypeListItem('cruisePage').title('Cruise pages'),
            S.documentTypeListItem('review').title('Reviews'),
            S.documentTypeListItem('blogPost').title('Blog posts'),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
