import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { documentInternationalization } from '@sanity/document-internationalization';
import { media } from 'sanity-plugin-media';
import { schemaTypes } from './schemas';
import { deploySiteTool } from './studio/tools/deploySiteTool';
import { remapActivityTranslationReferences } from './src/lib/activity-translations';

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const nodeEnv = typeof process !== 'undefined' ? process.env : {};
const projectId = env?.PUBLIC_SANITY_PROJECT_ID || nodeEnv.PUBLIC_SANITY_PROJECT_ID || 'hct2hzrl';
const dataset = env?.PUBLIC_SANITY_DATASET || nodeEnv.PUBLIC_SANITY_DATASET || 'production';
const boatPageDocumentId = 'boatPage';
const contactPageDocumentId = 'contactPage';
const componentsTestPageDocumentId = 'componentsTestPage';
const siteSettingsDocumentId = 'siteSettings';

export default defineConfig({
  name: 'default',
  title: 'Tahiti Guest Boat',
  projectId,
  dataset,
  plugins: [
    media(),
    documentInternationalization({
      supportedLanguages: [
        { id: 'fr', title: 'French' },
        { id: 'en', title: 'English' },
      ],
      schemaTypes: ['homePage', 'siteSettings', 'boatPage', 'contactPage', 'cruisePage', 'blogPost', 'legalPage', 'activity', 'activityTag'],
      allowCreateMetaDoc: true,
      callback: remapActivityTranslationReferences,
    }),
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Homepage (FR/EN)')
              .child(S.documentTypeList('homePage').title('Versions linguistiques')),
            S.listItem()
              .title('Boat page')
              .schemaType('boatPage')
              .child(S.document().schemaType('boatPage').documentId(boatPageDocumentId)),
            S.listItem()
              .title('Contact page')
              .schemaType('contactPage')
              .child(S.document().schemaType('contactPage').documentId(contactPageDocumentId)),
            S.listItem()
              .title('Components test page')
              .schemaType('componentsTestPage')
              .child(S.document().schemaType('componentsTestPage').documentId(componentsTestPageDocumentId)),
            S.listItem()
              .title('Site settings')
              .schemaType('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId(siteSettingsDocumentId)),
            S.divider(),
            S.documentTypeListItem('cruisePage').title('Cruise pages'),
            S.documentTypeListItem('activity').title('Activités'),
            S.documentTypeListItem('activityTag').title('Tags activités'),
            S.documentTypeListItem('review').title('Reviews'),
            S.documentTypeListItem('blogPost').title('Blog posts'),
            S.documentTypeListItem('legalPage').title('Pages légales'),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  tools: (prev) => [...prev, deploySiteTool],
});
