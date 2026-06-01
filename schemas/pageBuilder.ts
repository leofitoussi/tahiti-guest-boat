import { defineArrayMember, defineField } from 'sanity';

export const uniquePageBuilderBlockTypes = [
  'heroHeaderBlock',
  'heroImageOverlayBlock',
  'homeHeroBlock',
  'pitchBlock',
  'galleryBlock',
  'marqueeGalleryBlock',
  'editorialBlock',
  'boatBlock',
  'boatStoryVideoBlock',
  'videoFeatureBlock',
  'whyUsBlock',
  'reviewsBlock',
  'bookingBlock',
  'relatedCruisesBlock',
  'fullWidthImageBlock',
  'cruiseInspirationBlock',
  'boatPresentationBlock',
  'faqBlock',
  'practicalInfoBlock',
  'activitiesBlock',
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
