import { sanityClient } from 'sanity:client';
import type { TypedObject } from 'astro-portabletext/types';
import { isSanityConfigured } from './sanity';
import { defaultLocale, type Locale } from './localization';
import {
  buildLocalizedSingletonDocumentFilter,
  buildLocalizedSluggedDocumentFilter,
  localizedDocumentFields,
} from './sanity-localization';
import type { SanityImage } from './blog';

export interface CruiseHeroBlock {
  _type?: 'heroBlock';
  _key?: string;
  title?: string;
  backgroundImage?: SanityImage;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface CruiseTeaser {
  headline?: string;
  capacity?: string;
  minimumDuration?: string;
  pricing?: string;
  image?: SanityImage;
}

export interface FullWidthImageBlock {
  _type?: 'fullWidthImageBlock';
  _key?: string;
  image?: SanityImage;
}

export interface CruiseGallery {
  title?: TypedObject[];
  text?: TypedObject[];
  images?: SanityImage[];
}

export interface CruiseIntro {
  heading?: TypedObject[];
  body?: TypedObject[];
  image?: SanityImage;
}

export interface EditorialBlock {
  _type: 'editorialBlock';
  _key?: string;
  title?: TypedObject[];
  body?: TypedObject[];
  images?: SanityImage[];
  layout?: 'left' | 'right';
}

export interface BoatBlock {
  _type?: 'boatBlock';
  _key?: string;
  title?: TypedObject[];
  body?: TypedObject[];
  arguments?: {
    icon?: string;
    label?: string;
    body?: string;
  }[];
  boatImage?: SanityImage;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface ItineraryStep {
  dayLabel?: string;
  description?: TypedObject[];
  image?: SanityImage;
}

export interface ItineraryBlock {
  _type?: 'itineraryBlock';
  _key?: string;
  title?: string;
  route?: string;
  steps?: ItineraryStep[];
}

export interface CruiseInspirationCard {
  _key?: string;
  title?: string;
  description?: string;
  linkLabel?: string;
  linkUrl?: string;
  image?: SanityImage;
}

export interface CruiseInspirationBlock {
  _type?: 'cruiseInspirationBlock';
  _key?: string;
  headingPrefix?: string;
  headingHighlight?: string;
  subtitle?: string;
  cards?: CruiseInspirationCard[];
}

export interface CruisePageSummary {
  _id: string;
  title: string;
  slug: string;
  locale?: Locale;
  translationGroup?: string;
  heroTitle?: string;
  heroImage?: SanityImage;
  excerpt?: string;
  destinationLabel?: string;
  editorialPriority?: number;
  _createdAt?: string;
}

export interface IntroductionDestination {
  heading?: string;
  body?: TypedObject[];
  images?: SanityImage[];
}

export interface ExperienceCroisiere {
  heading?: string;
  body?: TypedObject[];
  image?: SanityImage;
}

export interface BateauRecommande {
  heading?: string;
  body?: TypedObject[];
  image?: SanityImage;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface CruisePage extends CruisePageSummary {
  locale?: Locale;
  translationGroup?: string;
  seoTitle?: string;
  seoDescription?: string;
  hero?: CruiseHeroBlock;
  cruiseTeaser?: CruiseTeaser;
  gallery?: CruiseGallery;
  cruiseIntro?: CruiseIntro;
  introductionDestination?: IntroductionDestination;
  experienceCroisiere?: ExperienceCroisiere;
  bateauRecommande?: BateauRecommande;
  boat?: BoatBlock;
  itinerary?: ItineraryBlock;
}

export interface SiteSettings {
  locale?: Locale;
  translationGroup?: string;
  siteName?: string;
  logo?: SanityImage;
  logoAlt?: string;
  reservationText?: string;
  reservationLink?: string;
  nav?: {
    label?: string;
    href?: string;
    hasDropdown?: boolean;
  }[];
  footerLinks?: {
    label?: string;
    url?: string;
  }[];
  footerText?: string;
  contactEmail?: string;
  contactPhone?: string;
  whyUsTitle?: string;
  whyUsDescription?: string;
  whyUsArguments?: {
    heading?: string;
    icon?: string;
    body?: string;
  }[];
  bookingEmbed?: {
    title?: string;
    providerName?: string;
    embedUrl?: string;
    fallbackCtaLabel?: string;
    fallbackCtaUrl?: string;
  };
}

export interface Review {
  _id: string;
  name?: string;
  rating?: number;
  body?: string;
  date?: string;
  source?: 'google' | 'manual';
  sourceUrl?: string;
  authorImage?: SanityImage;
}

export interface ActivityTag {
  _id: string;
  title?: string;
  slug?: string;
  locale?: Locale;
  translationGroup?: string;
}

export interface Activity {
  _id: string;
  title?: string;
  image?: SanityImage;
  description?: TypedObject[];
  priority?: 1 | 2 | 3;
  tags?: ActivityTag[];
}

const imageFields = `{
  ...,
  asset,
  alt,
  caption,
  "metadata": asset->metadata {
    dimensions,
    lqip,
    palette {
      dominant {
        background
      }
    }
  }
}`;

const cruisePageFields = `
  ${localizedDocumentFields},
  destinationLabel,
  editorialPriority,
  seoTitle,
  seoDescription,
  hero{
    ...,
    backgroundImage${imageFields}
  },
  cruiseTeaser{
    ...,
    image${imageFields}
  },
  gallery{
    title,
    text,
    images[]${imageFields}
  },
  cruiseIntro{
    heading,
    body,
    image${imageFields}
  },
  introductionDestination{
    heading,
    body,
    images[]{
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
  experienceCroisiere{
    heading,
    body,
    image${imageFields}
  },
  bateauRecommande{
    heading,
    body,
    image${imageFields},
    ctaLabel,
    ctaUrl
  },
  boat{
    ...,
    boatImage${imageFields}
  },
  itinerary{
    ...,
    steps[]{
      ...,
      image${imageFields}
    }
  }
`;

const cruisePageFilter = buildLocalizedSluggedDocumentFilter('cruisePage');

const CRUISE_SUMMARY_QUERY = `*[${cruisePageFilter}] | order(coalesce(editorialPriority, 0) desc, _createdAt desc) {
  _id,
  _createdAt,
  ${localizedDocumentFields},
  title,
  destinationLabel,
  editorialPriority,
  "slug": slug.current,
  "heroTitle": hero.title,
  "heroImage": hero.backgroundImage${imageFields},
  "excerpt": cruiseTeaser.headline
}`;

const CRUISE_PAGE_QUERY = `*[${cruisePageFilter} && slug.current == $slug][0] {
  _id,
  _createdAt,
  ${localizedDocumentFields},
  title,
  destinationLabel,
  editorialPriority,
  "slug": slug.current,
  "heroTitle": hero.title,
  "heroImage": hero.backgroundImage${imageFields},
  "excerpt": cruiseTeaser.headline,
  ${cruisePageFields}
}`;

const SITE_SETTINGS_QUERY = `*[${buildLocalizedSingletonDocumentFilter('siteSettings')}] | order(_updatedAt desc)[0] {
  ${localizedDocumentFields},
  siteName,
  logo${imageFields},
  logoAlt,
  reservationText,
  reservationLink,
  nav[]{label, href, hasDropdown},
  footerLinks[]{label, url},
  footerText,
  contactEmail,
  contactPhone,
  whyUsTitle,
  whyUsDescription,
  whyUsArguments[]{heading, icon, body},
  bookingEmbed{
    title,
    providerName,
    embedUrl,
    fallbackCtaLabel,
    fallbackCtaUrl
  }
}`;

const REVIEWS_QUERY = `*[
  _type == "review" &&
  isPublished == true &&
  !(_id in path("drafts.**"))
] | order(date desc)[0...$limit] {
  _id,
  name,
  rating,
  body,
  date,
  source,
  sourceUrl,
  authorImage${imageFields}
}`;

const ACTIVITIES_QUERY = `*[
  _type == "activity" &&
  locale == $locale &&
  isPublished == true &&
  !(_id in path("drafts.**"))
] | order(priority desc, title asc) {
  _id,
  title,
  image${imageFields},
  description,
  priority,
  tags[]->{
    _id,
    ${localizedDocumentFields},
    title,
    "slug": slug.current
  }
}`;

const RELATED_CRUISES_QUERY = `*[
  ${cruisePageFilter} &&
  slug.current != $slug
] | order(coalesce(editorialPriority, 0) desc, _createdAt desc) {
  _id,
  _createdAt,
  ${localizedDocumentFields},
  title,
  destinationLabel,
  editorialPriority,
  "slug": slug.current,
  "heroTitle": hero.title,
  "heroImage": hero.backgroundImage${imageFields},
  "excerpt": cruiseTeaser.headline
}`;

export async function getCruisePages(locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient.fetch<CruisePageSummary[]>(CRUISE_SUMMARY_QUERY, { locale }).catch(() => []);
}

export async function getCruisePage(slug: string, locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient.fetch<CruisePage | null>(CRUISE_PAGE_QUERY, { slug, locale }).catch(() => null);
}

export async function getSiteSettings(locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY, { locale }).catch(() => null);
}

export async function getReviews(limit = 3) {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient.fetch<Review[]>(REVIEWS_QUERY, { limit }).catch(() => []);
}

export async function getActivities(locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient.fetch<Activity[]>(ACTIVITIES_QUERY, { locale }).catch(() => []);
}

export async function getRelatedCruises(slug: string, locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient.fetch<CruisePageSummary[]>(RELATED_CRUISES_QUERY, { slug, locale }).catch(() => []);
}
