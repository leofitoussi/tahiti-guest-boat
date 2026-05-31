import { sanityClient } from 'sanity:client';
import type { TypedObject } from 'astro-portabletext/types';
import { isSanityConfigured } from './sanity';
import type { SanityImage } from './blog';

export interface CruiseHeroBlock {
  _type?: 'heroBlock';
  _key?: string;
  title?: string;
  backgroundImage?: SanityImage;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface PitchBlock {
  _type?: 'pitchBlock';
  _key?: string;
  accroche?: string;
  badges?: {
    icon?: string;
    label?: string;
  }[];
}

export interface FullWidthImageBlock {
  _type?: 'fullWidthImageBlock';
  _key?: string;
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
  disclaimer?: string;
  steps?: ItineraryStep[];
}

export interface CruisePageSummary {
  _id: string;
  title: string;
  slug: string;
  heroTitle?: string;
  heroImage?: SanityImage;
  excerpt?: string;
  _createdAt?: string;
}

export interface CruisePage extends CruisePageSummary {
  seoTitle?: string;
  seoDescription?: string;
  hero?: CruiseHeroBlock;
  pitch?: PitchBlock;
  featuredImage?: FullWidthImageBlock;
  boat?: BoatBlock;
  itinerary?: ItineraryBlock;
}

export interface SiteSettings {
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
  whyUsArguments?: {
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
  seoTitle,
  seoDescription,
  hero{
    ...,
    backgroundImage${imageFields}
  },
  pitch,
  featuredImage{
    ...,
    image${imageFields}
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

const cruisePageFilter = `_type == "cruisePage" && defined(slug.current) && !(_id in path("drafts.**"))`;

const CRUISE_SUMMARY_QUERY = `*[${cruisePageFilter}] | order(_createdAt desc) {
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  "heroTitle": hero.title,
  "heroImage": hero.backgroundImage${imageFields},
  "excerpt": pitch.accroche
}`;

const CRUISE_PAGE_QUERY = `*[${cruisePageFilter} && slug.current == $slug][0] {
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  "heroTitle": hero.title,
  "heroImage": hero.backgroundImage${imageFields},
  "excerpt": pitch.accroche,
  ${cruisePageFields}
}`;

const SITE_SETTINGS_QUERY = `*[_type == "siteSettings" && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0] {
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
  whyUsArguments[]{icon, body},
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

const RELATED_CRUISES_QUERY = `*[
  ${cruisePageFilter} &&
  slug.current != $slug
] | order(_createdAt desc)[0...$limit] {
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  "heroTitle": hero.title,
  "heroImage": hero.backgroundImage${imageFields},
  "excerpt": pitch.accroche
}`;

export async function getCruisePages() {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient.fetch<CruisePageSummary[]>(CRUISE_SUMMARY_QUERY).catch(() => []);
}

export async function getCruisePage(slug: string) {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient.fetch<CruisePage | null>(CRUISE_PAGE_QUERY, { slug }).catch(() => null);
}

export async function getSiteSettings() {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY).catch(() => null);
}

export async function getReviews(limit = 3) {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient.fetch<Review[]>(REVIEWS_QUERY, { limit }).catch(() => []);
}

export async function getRelatedCruises(slug: string, limit = 3) {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient.fetch<CruisePageSummary[]>(RELATED_CRUISES_QUERY, { slug, limit }).catch(() => []);
}
