import { defineArrayMember, defineField } from 'sanity';

export const uniquePageBuilderBlockTypes = [
  'heroHeaderBlock',
  'homeHeroBlock',
  'pitchBlock',
  'galleryBlock',
  'marqueeGalleryBlock',
  'editorialBlock',
  'boatBlock',
  'videoFeatureBlock',
  'whyUsBlock',
  'reviewsBlock',
  'bookingBlock',
  'relatedCruisesBlock',
  'fullWidthImageBlock',
  'cruiseInspirationBlock',
  'practicalInfoBlock',
] as const;

export function defineUniquePageBuilderField() {
  return defineField({
    name: 'pageBuilder',
    title: 'Sections de la page',
    type: 'array',
    group: 'content',
    of: uniquePageBuilderBlockTypes.map((type) => defineArrayMember({ type })),
  });
}
