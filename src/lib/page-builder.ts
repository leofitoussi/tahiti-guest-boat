import { sanityClient } from 'sanity:client';
import { isSanityConfigured } from './sanity';
import { defaultLocale, type Locale } from './localization';
import { buildLocalizedSingletonDocumentFilter, localizedDocumentFields } from './sanity-localization';

export interface UniquePageDocument {
  locale?: Locale;
  translationGroup?: string;
  seoTitle?: string;
  seoDescription?: string;
  pageBuilder?: Record<string, unknown>[];
}

const pageBuilderFields = `pageBuilder[]{
  _type,
  _key,

  _type == "heroHeaderBlock" => {
    keywords,
    title,
    body,
    primaryCtaLabel,
    primaryCtaLink,
    secondaryCtaLabel,
    secondaryCtaLink,
    image{ ..., asset, alt, "metadata": asset->metadata { dimensions } }
  },

  _type == "homeHeroBlock" => {
    keywords,
    title,
    body,
    primaryCtaLabel,
    primaryCtaLink,
    secondaryCtaLabel,
    secondaryCtaLink,
    image{ ..., asset, alt, "metadata": asset->metadata { dimensions } }
  },

  _type == "marqueeGalleryBlock" => {
    eyebrow,
    title,
    "row1": row1[]{
      ..., asset, alt,
      "metadata": asset->metadata { dimensions, lqip }
    },
    "row2": row2[]{
      ..., asset, alt,
      "metadata": asset->metadata { dimensions, lqip }
    },
    "row3": row3[]{
      ..., asset, alt,
      "metadata": asset->metadata { dimensions, lqip }
    }
  },

  _type == "galleryBlock" => {
    eyebrow,
    title,
    layout,
    columns,
    gap,
    images[]{
      ...,
      asset,
      alt,
      caption,
      "metadata": asset->metadata { dimensions, lqip }
    }
  },

  _type == "pitchBlock" => {
    accroche,
    badges[]{ icon, label }
  },

  _type == "editorialBlock" => {
    title,
    body,
    image{
      ...,
      asset,
      alt,
      "metadata": asset->metadata {
        dimensions,
        lqip,
        palette { dominant { background } }
      }
    },
    desktopLayout,
    mobileLayout,
    primaryCtaLabel,
    primaryCtaLink,
    secondaryCtaLabel,
    secondaryCtaLink
  },

  _type == "boatBlock" => {
    title,
    body,
    ctaLabel,
    ctaUrl,
    boatImage{
      ...,
      asset,
      "metadata": asset->metadata { dimensions, lqip }
    }
  },

  _type == "videoFeatureBlock" => {
    iconImage{
      ...,
      asset,
      alt,
      "metadata": asset->metadata {
        dimensions,
        lqip,
        palette { dominant { background } }
      }
    },
    title,
    body,
    ctaLabel,
    ctaUrl,
    youtubeUrl,
    posterImage{
      ...,
      asset,
      alt,
      "metadata": asset->metadata {
        dimensions,
        lqip,
        palette { dominant { background } }
      }
    }
  },

  _type in ["whyUsBlock", "reviewsBlock", "bookingBlock", "relatedCruisesBlock", "fullWidthImageBlock"] => {
    ...
  },

  _type == "cruiseInspirationBlock" => {
    headingPrefix,
    headingHighlight,
    subtitle,
    cards[]{
      _key,
      title,
      description,
      linkLabel,
      linkUrl,
      image{
        ...,
        asset,
        alt,
        "metadata": asset->metadata { dimensions }
      }
    }
  },

  _type == "practicalInfoBlock" => {
    sectionTitle,
    leftColumn{ title, body },
    rightColumn{ title, body }
  },

  _type == "faqBlock" => {
    title,
    description,
    ctaLabel,
    ctaHref,
    items[]{
      _key,
      question,
      answer
    }
  }
}`;

type UniquePageDocumentType = 'boatPage' | 'contactPage' | 'componentsTestPage';

export function buildUniquePageQuery(documentType: UniquePageDocumentType) {
  return `*[${buildLocalizedSingletonDocumentFilter(documentType)}][0]{
  ${localizedDocumentFields},
  seoTitle,
  seoDescription,
  ${pageBuilderFields}
}`;
}

export async function getUniquePage(documentType: UniquePageDocumentType, locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient.fetch<UniquePageDocument | null>(buildUniquePageQuery(documentType), { locale }).catch(() => null);
}
