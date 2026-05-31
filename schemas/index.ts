import { blogPost } from './blogPost';
import { boatBlock } from './boatBlock';
import { bookingBlock } from './bookingBlock';
import { cruisePage } from './cruisePage';
import { editorialBlock } from './editorialBlock';
import { fullWidthImageBlock } from './fullWidthImageBlock';
import { galleryBlock } from './galleryBlock';
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
  blogPost,
  siteSettings,
  review,
  cruisePage,
  // Blocks
  homeHeroBlock,
  heroHeaderBlock,
  heroBlock,
  galleryBlock,
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
