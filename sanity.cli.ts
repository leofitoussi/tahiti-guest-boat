import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'hct2hzrl';
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  deployment: {
    appId: 'qcw76nomgyrj3iun862bji59',
  },
});
