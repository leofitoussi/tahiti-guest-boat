import { sanityClient } from 'sanity:client';
import { isSanityConfigured } from './sanity';
import { defaultLocale, type Locale } from './localization';
import { buildLocalizedSingletonDocumentFilter, localizedDocumentFields } from './sanity-localization';

export interface UniquePageDocument {
  _id?: string;
  _createdAt?: string;
  _updatedAt?: string;
  language?: Locale;
  seoTitle?: string;
  seoDescription?: string;
  seo?: { indexable?: boolean };
  pageBuilder?: Record<string, unknown>[];
}

export const pageBuilderFields = `pageBuilder[]{
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

  _type == "heroImageOverlayBlock" => {
    firstLine,
    secondLine,
    overlayOpacity,
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
    secondaryCtaLink,
    invertBackground
  },

  _type == "boatBlock" => {
    heading,
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
    ctaLabel,
    ctaUrl,
    desktopLayout
  },

  _type == "boatStoryVideoBlock" => {
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
    youtubeUrl,
    videoTitle,
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

  _type == "videoFeatureBlock" => {
    anchorId,
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
    anchorId,
    sectionTitle,
    leftColumn{ title, body },
    rightColumn{ title, body }
  },

  _type == "activitiesBlock" => {
    anchorId,
    title,
    intro,
    groups[]{
      _key,
      heading,
      description,
      tagFilters[]->{
        _id,
        ${localizedDocumentFields},
        title,
        "slug": slug.current
      }
    }
  },

  _type == "boatPresentationBlock" => {
    title,
    body,
    blueprintImages[]{
      ...,
      asset,
      alt,
      "metadata": asset->metadata { dimensions }
    }
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
  },

  _type == "boatArgumentsBlock" => {
    title,
    body,
    features[]{
      _key,
      title,
      description
    },
    image{
      ...,
      asset,
      alt,
      "metadata": asset->metadata { dimensions }
    }
  },

  _type == "cabinTourBlock" => {
    title,
    tabs[]{
      _key,
      label,
      body,
      image{
        ...,
        asset,
        alt,
        "metadata": asset->metadata { dimensions }
      }
    }
  }
}`;

type UniquePageDocumentType = 'boatPage' | 'contactPage';

const uniquePageContentProjection = `
  seoTitle,
  seoDescription,
  seo { indexable },
  ${pageBuilderFields}
`;

const uniquePageProjection = `
  ${localizedDocumentFields},
  ${uniquePageContentProjection}
`;

export function buildUniquePageQuery(documentType: UniquePageDocumentType) {
  return `*[${buildLocalizedSingletonDocumentFilter(documentType)}]
    | order(coalesce(_updatedAt, _createdAt) desc, _id asc)[0]{${uniquePageProjection}}`;
}

export function buildUniquePageVersionsQuery(documentType: UniquePageDocumentType) {
  return `*[
    _type == "${documentType}" &&
    !(_id in path("drafts.**"))
  ] | order(coalesce(_updatedAt, _createdAt) desc, _id asc){
    _id,
    _createdAt,
    _updatedAt,
    ${uniquePageProjection}
  }`;
}

export function resolveUniquePageVersion(
  versions: UniquePageDocument[],
  locale: Locale = defaultLocale,
): UniquePageDocument | null {
  return (
    versions
      .filter((version) => version.language === locale)
      .toSorted((left, right) => {
        const leftDate = left._updatedAt ?? left._createdAt ?? '';
        const rightDate = right._updatedAt ?? right._createdAt ?? '';
        return rightDate.localeCompare(leftDate) || (left._id ?? '').localeCompare(right._id ?? '');
      })[0] ?? null
  );
}

export async function getUniquePageVersions(
  documentType: UniquePageDocumentType,
): Promise<Record<Locale, UniquePageDocument | null>> {
  if (!isSanityConfigured) {
    return { fr: null, en: null };
  }

  const versions = await sanityClient
    .fetch<UniquePageDocument[]>(buildUniquePageVersionsQuery(documentType))
    .catch(() => []);

  return {
    fr: resolveUniquePageVersion(versions, 'fr'),
    en: resolveUniquePageVersion(versions, 'en'),
  };
}

export async function getUniquePage(documentType: UniquePageDocumentType, locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient.fetch<UniquePageDocument | null>(buildUniquePageQuery(documentType), { locale }).catch(() => null);
}

export const COMPONENTS_TEST_PAGE_ID = 'componentsTestPage';

export async function getComponentsTestPage() {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient
    .fetch<UniquePageDocument | null>(`*[_id == $documentId][0]{${uniquePageContentProjection}}`, {
      documentId: COMPONENTS_TEST_PAGE_ID,
    })
    .catch(() => null);
}
