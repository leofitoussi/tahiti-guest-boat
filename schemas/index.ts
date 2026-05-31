import { blogPost } from './blogPost';
import { legalPage } from './legalPage';
import { boatBlock } from './boatBlock';
import { boatPage } from './boatPage';
import { bookingBlock } from './bookingBlock';
import { contactPage } from './contactPage';
import { componentsTestPage } from './componentsTestPage';
import { cruisePage } from './cruisePage';
import { editorialBlock } from './editorialBlock';
import { fullWidthImageBlock } from './fullWidthImageBlock';
import { galleryBlock } from './galleryBlock';
import { marqueeGalleryBlock } from './marqueeGalleryBlock';
import { heroBlock } from './heroBlock';
import { heroHeaderBlock } from './heroHeaderBlock';
import { homeHeroBlock } from './homeHeroBlock';
import { homePage } from './homePage';
import { itineraryBlock } from './itineraryBlock';
import { itineraryStep } from './itineraryStep';
import { pitchBlock } from './pitchBlock';
import { relatedCruisesBlock } from './relatedCruisesBlock';
import { review } from './review';
import { reviewsBlock } from './reviewsBlock';
import { siteSettings } from './siteSettings';
import { videoFeatureBlock } from './videoFeatureBlock';
import { whyUsBlock } from './whyUsBlock';

export const schemaTypes = [
  // Documents
  homePage,
  boatPage,
  contactPage,
  componentsTestPage,
  blogPost,
  legalPage,
  siteSettings,
  review,
  cruisePage,
  // Blocks
  homeHeroBlock,
  heroHeaderBlock,
  heroBlock,
  galleryBlock,
  marqueeGalleryBlock,
  pitchBlock,
  fullWidthImageBlock,
  editorialBlock,
  boatBlock,
  videoFeatureBlock,
  itineraryBlock,
  itineraryStep,
  whyUsBlock,
  reviewsBlock,
  bookingBlock,
  relatedCruisesBlock,
];
