import { at, defineMigration, set } from 'sanity/migrate';

const activityAltText: Record<string, string> = {
  '2bf7cc3d-0522-454e-aca5-c6893bee4ea7': 'Jeux à la plage en Polynésie française',
  '4c37c292-4faf-4bd6-a5c0-88023933539c': 'Plongée sous-marine en Polynésie française',
};

type PortableTextBlock = {
  _key: string;
  _type: 'block';
  children: {
    _key: string;
    _type: 'span';
    marks: string[];
    text: string;
  }[];
  markDefs: never[];
  style: 'normal';
};

function demoBoatHeading(): PortableTextBlock[] {
  return [
    {
      _key: 'demo-boat-heading',
      _type: 'block',
      children: [
        {
          _key: 'demo-boat-heading-text',
          _type: 'span',
          marks: [],
          text: 'BoatBlock',
        },
      ],
      markDefs: [],
      style: 'normal',
    },
  ];
}

export default defineMigration({
  title: 'Repair existing Sanity validation errors',
  documentTypes: ['activity', 'componentsTestPage'],
  filter:
    '_id in ["2bf7cc3d-0522-454e-aca5-c6893bee4ea7", "drafts.2bf7cc3d-0522-454e-aca5-c6893bee4ea7", "4c37c292-4faf-4bd6-a5c0-88023933539c", "drafts.4c37c292-4faf-4bd6-a5c0-88023933539c", "componentsTestPage", "drafts.componentsTestPage"]',
  migrate: {
    document(document) {
      if (document._type === 'activity' && document._id) {
        const publishedId = document._id.replace(/^drafts\./, '');
        const alt = activityAltText[publishedId];
        if (alt) {
          return at('image.alt', set(alt));
        }
      }

      if (document._type === 'componentsTestPage') {
        const pageBuilder = Array.isArray(document.pageBuilder) ? document.pageBuilder : [];
        return at(
          'pageBuilder',
          set(
            pageBuilder.map((block) =>
              block && typeof block === 'object' && '_key' in block && block._key === 'demo-boat-block'
                ? { ...block, heading: demoBoatHeading() }
                : block,
            ),
          ),
        );
      }
    },
  },
});
