import { sanityClient } from 'sanity:client';
import type { TypedObject } from 'astro-portabletext/types';
import { isSanityConfigured } from './sanity';
import { defaultLocale, type Locale } from './localization';
import { buildLocalizedSluggedDocumentFilter, localizedDocumentFields } from './sanity-localization';

export interface SanityImage {
  asset?: unknown;
  alt?: string;
  caption?: string;
  metadata?: {
    dimensions?: {
      width?: number;
      height?: number;
    };
    lqip?: string;
    palette?: {
      dominant?: {
        background?: string;
      };
    };
  };
}

export interface BlogPostSummary {
  title: string;
  slug: string;
  locale?: Locale;
  translationGroup?: string;
  excerpt?: string;
  publishedAt?: string;
  updatedAt?: string;
  mainImage?: SanityImage;
  primaryCruise?: CruiseLinkSummary;
  secondaryCruises?: CruiseLinkSummary[];
}

export interface BlogPost extends BlogPostSummary {
  locale?: Locale;
  translationGroup?: string;
  body?: TypedObject[];
  seoTitle?: string;
  seoDescription?: string;
  seo?: { indexable?: boolean };
}

export interface CruiseLinkSummary {
  _id: string;
  title: string;
  slug: string;
  heroTitle?: string;
  heroImage?: SanityImage;
  excerpt?: string;
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

const postFields = `{
  ${localizedDocumentFields},
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "updatedAt": _updatedAt,
  mainImage{
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
  },
  primaryCruise->{
    _id,
    title,
    "slug": slug.current,
    "heroTitle": pt::text(hero.title),
    "heroImage": hero.backgroundImage${imageFields},
    "excerpt": pitch.accroche
  },
  secondaryCruises[]->{
    _id,
    title,
    "slug": slug.current,
    "heroTitle": pt::text(hero.title),
    "heroImage": hero.backgroundImage${imageFields},
    "excerpt": pitch.accroche
  }
}`;

const postDetailFields = `{
  ${localizedDocumentFields},
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "updatedAt": _updatedAt,
  mainImage{
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
  },
  body[]{
    ...,
    _type == "image" => {
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
    }
  },
  primaryCruise->{
    _id,
    title,
    "slug": slug.current,
    "heroTitle": pt::text(hero.title),
    "heroImage": hero.backgroundImage${imageFields},
    "excerpt": pitch.accroche
  },
  secondaryCruises[]->{
    _id,
    title,
    "slug": slug.current,
    "heroTitle": pt::text(hero.title),
    "heroImage": hero.backgroundImage${imageFields},
    "excerpt": pitch.accroche
  },
  seoTitle,
  seoDescription,
  seo { indexable }
}`;

const publishedPostFilter = buildLocalizedSluggedDocumentFilter('blogPost') + ' && defined(publishedAt)';

const BLOG_POSTS_QUERY = `*[${publishedPostFilter} && coalesce(visible, false) == true] | order(publishedAt desc) ${postFields}`;
const BLOG_POST_QUERY = `*[${publishedPostFilter} && slug.current == $slug][0] ${postDetailFields}`;

export async function getBlogPosts(locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient.fetch<BlogPostSummary[]>(BLOG_POSTS_QUERY, { locale }).catch(() => []);
}

export async function getBlogPost(slug: string, locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient.fetch<BlogPost | null>(BLOG_POST_QUERY, { slug, locale }).catch(() => null);
}

const ALL_BLOG_SLUGS_QUERY = `*[${publishedPostFilter}] { "slug": slug.current }`;

export async function getAllBlogSlugs(locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient
    .fetch<{ slug: string }[]>(ALL_BLOG_SLUGS_QUERY, { locale })
    .catch(() => []);
}

export function formatPostDate(date?: string, locale: Locale = defaultLocale) {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}
