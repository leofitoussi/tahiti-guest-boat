import { sanityClient } from 'sanity:client';
import type { TypedObject } from 'astro-portabletext/types';
import { isSanityConfigured } from './sanity';
import { defaultLocale, type Locale } from './localization';
import { buildLocalizedSluggedDocumentFilter, localizedDocumentFields } from './sanity-localization';
import type { BlogTranslationVersion } from './blog-routes';
import { selectLocalizedReference } from './localized-references';

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
  _id?: string;
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
  language?: Locale;
  locale?: Locale;
  translationGroup?: string;
  visible?: boolean;
  isPublished?: boolean;
  heroTitle?: string;
  heroImage?: SanityImage;
  excerpt?: string;
}

export function localizeBlogPostReferences<T extends BlogPostSummary>(
  post: T,
  versions: CruiseLinkSummary[],
  locale: Locale = defaultLocale,
): T {
  const primaryCruise = selectLocalizedReference(post.primaryCruise, versions, locale) ?? undefined;
  const secondaryCruises = (post.secondaryCruises ?? []).flatMap((cruise) => {
    const localized = selectLocalizedReference(cruise, versions, locale);
    return localized ? [localized] : [];
  });

  return {
    ...post,
    primaryCruise,
    secondaryCruises,
  } as T;
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

const cruiseLinkFields = `{
  _id,
  ${localizedDocumentFields},
  title,
  "slug": slug.current,
  visible,
  "heroTitle": pt::text(hero.title),
  "heroImage": hero.backgroundImage${imageFields},
  "excerpt": pitch.accroche
}`;

const postFields = `{
  _id,
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
  primaryCruise->${cruiseLinkFields},
  secondaryCruises[]->${cruiseLinkFields}
}`;

const postDetailFields = `{
  _id,
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
  primaryCruise->${cruiseLinkFields},
  secondaryCruises[]->${cruiseLinkFields},
  seoTitle,
  seoDescription,
  seo { indexable }
}`;

const publishedPostFilter = buildLocalizedSluggedDocumentFilter('blogPost') + ' && defined(publishedAt)';

const BLOG_POSTS_QUERY = `*[${publishedPostFilter} && coalesce(visible, false) == true] | order(publishedAt desc) ${postFields}`;
const BLOG_POST_QUERY = `*[${publishedPostFilter} && slug.current == $slug][0] ${postDetailFields}`;

const LOCALIZED_CRUISE_REFERENCES_QUERY = `*[
  _type == "cruisePage" &&
  !(_id in path("drafts.**")) &&
  defined(slug.current) &&
  coalesce(visible, false) == true &&
  (
    _id in $referenceIds ||
    _id in *[_type == "translation.metadata" && references($referenceIds)].translations[].value._ref
  )
] ${cruiseLinkFields}`;

async function getLocalizedCruiseReferences(posts: BlogPostSummary[]) {
  const referenceIds = [...new Set(
    posts.flatMap((post) => [post.primaryCruise?._id, ...(post.secondaryCruises ?? []).map((cruise) => cruise._id)]).filter(
      (id): id is string => Boolean(id),
    ),
  )];

  if (referenceIds.length === 0) {
    return [];
  }

  return sanityClient
    .fetch<CruiseLinkSummary[]>(LOCALIZED_CRUISE_REFERENCES_QUERY, { referenceIds })
    .then((references) => references ?? [])
    .catch(() => []);
}

export async function getBlogPosts(locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return [];
  }

  const posts = await sanityClient.fetch<BlogPostSummary[]>(BLOG_POSTS_QUERY, { locale }).catch(() => []);
  const references = await getLocalizedCruiseReferences(posts ?? []);

  return (posts ?? []).map((post) => localizeBlogPostReferences(post, references, locale));
}

export async function getBlogPost(slug: string, locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return null;
  }

  const post = await sanityClient.fetch<BlogPost | null>(BLOG_POST_QUERY, { slug, locale }).catch(() => null);

  if (!post) {
    return null;
  }

  const references = await getLocalizedCruiseReferences([post]);
  return localizeBlogPostReferences(post, references, locale);
}

const ALL_BLOG_SLUGS_QUERY = `*[${publishedPostFilter}] { "slug": slug.current }`;

const BLOG_TRANSLATION_VERSIONS_QUERY = `*[
  _type == "blogPost" &&
  !(_id in path("drafts.**")) &&
  defined(slug.current) &&
  (
    (defined($translationGroup) && translationGroup == $translationGroup) ||
    (defined($documentId) && _id in *[_type == "translation.metadata" && references($documentId)][0].translations[].value._ref)
  )
] {
  _id,
  ${localizedDocumentFields},
  "slug": slug.current,
  "isPublished": defined(publishedAt)
}`;

export async function getAllBlogSlugs(locale: Locale = defaultLocale) {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient
    .fetch<{ slug: string }[]>(ALL_BLOG_SLUGS_QUERY, { locale })
    .catch(() => []);
}

export async function getBlogTranslationVersions(
  source?: string | Pick<BlogPost, '_id' | 'translationGroup'>,
): Promise<BlogTranslationVersion[]> {
  const translationGroup = typeof source === 'string' ? source : source?.translationGroup;
  const documentId = typeof source === 'string' ? undefined : source?._id;

  if (!isSanityConfigured || (!translationGroup && !documentId)) {
    return [];
  }

  const documents = await sanityClient
    .fetch<
      {
        _id?: string;
        language?: Locale;
        locale?: Locale;
        slug?: string;
        isPublished?: boolean;
      }[]
    >(BLOG_TRANSLATION_VERSIONS_QUERY, { translationGroup, documentId })
    .catch(() => []);

  return (documents ?? []).flatMap((document) => {
    if (!document.slug) {
      return [];
    }

    return [
      {
        locale: document.language ?? document.locale ?? defaultLocale,
        slug: document.slug,
        isPublished: document.isPublished !== false,
      },
    ];
  });
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
