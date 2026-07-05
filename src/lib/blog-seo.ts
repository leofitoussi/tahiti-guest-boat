import type { BlogPost } from './blog';

export interface BlogPostingSeoOptions {
  canonicalUrl: string;
  siteUrl: string;
  siteName?: string;
  image?: string;
}

export function buildBlogPostingStructuredData(
  post: BlogPost,
  { canonicalUrl, siteUrl, siteName = 'Tahiti Guest Boat', image }: BlogPostingSeoOptions,
) {
  const blogPosting: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    url: canonicalUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Organization', name: siteName },
    publisher: { '@id': `${siteUrl}/#organization` },
  };

  if (image) {
    blogPosting.image = image;
  }

  return blogPosting;
}
