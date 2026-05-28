import { sanityClient } from 'sanity:client';
import type { TypedObject } from 'astro-portabletext/types';
import { isSanityConfigured } from './sanity';

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
  excerpt?: string;
  publishedAt?: string;
  mainImage?: SanityImage;
}

export interface BlogPost extends BlogPostSummary {
  body?: TypedObject[];
  seoTitle?: string;
  seoDescription?: string;
}

const postFields = `{
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
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
  }
}`;

const postDetailFields = `{
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
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
  seoTitle,
  seoDescription
}`;

const publishedPostFilter = `_type == "blogPost" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**"))`;

const BLOG_POSTS_QUERY = `*[${publishedPostFilter}] | order(publishedAt desc) ${postFields}`;
const BLOG_POST_QUERY = `*[${publishedPostFilter} && slug.current == $slug][0] ${postDetailFields}`;

export async function getBlogPosts() {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient.fetch<BlogPostSummary[]>(BLOG_POSTS_QUERY).catch(() => []);
}

export async function getBlogPost(slug: string) {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient.fetch<BlogPost | null>(BLOG_POST_QUERY, { slug }).catch(() => null);
}

export function formatPostDate(date?: string) {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}
