import { sanityClient } from 'sanity:client';
import { isSanityConfigured } from './sanity';
import { defaultLocale } from './localization';
import type { SitemapContentDocument, SitemapReference, SitemapUrl } from './seo-sitemap';
import { formatSitemapDate, toSitemapUrls } from './seo-sitemap';

const HOME_PAGE_ID = 'f512860b-c337-4a81-b057-a93acdc2c961';

const localizedDefaultFilter = `(locale == $locale || (!defined(locale) && $locale == "${defaultLocale}"))`;
const publishedDocumentFilter = `!(_id in path("drafts.**")) && ${localizedDefaultFilter}`;
const indexableBlogFilter = `_type == "blogPost" && defined(slug.current) && defined(publishedAt) && ${publishedDocumentFilter} && seo.indexable == true`;
const indexableCruiseFilter = `_type == "cruisePage" && defined(slug.current) && ${publishedDocumentFilter} && seo.indexable == true`;
const visibleBlogFilter = `_type == "blogPost" && defined(slug.current) && defined(publishedAt) && ${publishedDocumentFilter} && coalesce(visible, false) == true`;
const visibleCruiseFilter = `_type == "cruisePage" && defined(slug.current) && ${publishedDocumentFilter} && coalesce(visible, false) == true`;

export const SITEMAP_CONTENT_QUERY = `{
  "pages": [
    ...*[_id == $homeId && !(_id in path("drafts.**"))][0...1]{
      "path": "/",
      _updatedAt,
      _createdAt,
      seo { indexable }
    },
    ...*[_type == "boatPage" && ${publishedDocumentFilter}][0...1]{
      "path": "/notre-bateau/",
      _updatedAt,
      _createdAt,
      seo { indexable }
    },
    ...*[_type == "contactPage" && ${publishedDocumentFilter}][0...1]{
      "path": "/contact/",
      _updatedAt,
      _createdAt,
      seo { indexable }
    },
    {
      "path": "/blog/",
      "_updatedAt": *[${visibleBlogFilter}] | order(_updatedAt desc)[0]._updatedAt,
      "seo": { "indexable": count(*[${visibleBlogFilter}]) > 0 }
    },
    {
      "path": "/nos-croisieres/",
      "_updatedAt": *[${visibleCruiseFilter}] | order(_updatedAt desc)[0]._updatedAt,
      "seo": { "indexable": count(*[${visibleCruiseFilter}]) > 0 }
    },
    ...*[_type == "legalPage" && defined(slug.current) && ${publishedDocumentFilter}] | order(slug.current asc) {
      "path": "/" + slug.current + "/",
      _updatedAt,
      _createdAt,
      seo { indexable }
    }
  ],
  "blog": *[${indexableBlogFilter}] | order(publishedAt desc) {
    "path": "/blog/" + slug.current + "/",
    _updatedAt,
    publishedAt,
    _createdAt,
    seo { indexable }
  },
  "cruises": *[${indexableCruiseFilter}] | order(coalesce(editorialPriority, 0) desc, _createdAt desc) {
    "path": "/nos-croisieres/" + slug.current + "/",
    _updatedAt,
    _createdAt,
    seo { indexable }
  }
}`;

export type SitemapGroupName = 'pages' | 'blog' | 'cruises';

export interface SitemapGroup {
  name: SitemapGroupName;
  path: string;
  urls: SitemapUrl[];
}

interface SitemapContentResult {
  pages?: SitemapContentDocument[];
  blog?: SitemapContentDocument[];
  cruises?: SitemapContentDocument[];
}

export async function getSitemapGroups(): Promise<Record<SitemapGroupName, SitemapGroup>> {
  if (!isSanityConfigured) {
    return emptySitemapGroups();
  }

  const content = await sanityClient
    .fetch<SitemapContentResult>(SITEMAP_CONTENT_QUERY, {
      homeId: HOME_PAGE_ID,
      locale: defaultLocale,
    })
    .catch(() => null);

  return buildSitemapGroups(content ?? {});
}

export function buildSitemapGroups(content: SitemapContentResult): Record<SitemapGroupName, SitemapGroup> {
  return {
    pages: {
      name: 'pages',
      path: '/page-sitemap.xml',
      urls: toSitemapUrls(content.pages ?? []),
    },
    blog: {
      name: 'blog',
      path: '/post-sitemap.xml',
      urls: toSitemapUrls(content.blog ?? []),
    },
    cruises: {
      name: 'cruises',
      path: '/sitemap-cruises.xml',
      urls: toSitemapUrls(content.cruises ?? []),
    },
  };
}

export function getSitemapReferences(groups: Record<SitemapGroupName, SitemapGroup>): SitemapReference[] {
  return Object.values(groups).map((group) => ({
    path: group.path,
    lastmod: latestLastmod(group.urls),
  }));
}

function emptySitemapGroups(): Record<SitemapGroupName, SitemapGroup> {
  return buildSitemapGroups({});
}

function latestLastmod(urls: SitemapUrl[]) {
  const dates = urls.map((url) => new Date(url.lastmod).getTime()).filter((time) => !Number.isNaN(time));
  const latest = dates.length > 0 ? Math.max(...dates) : undefined;
  return latest === undefined ? undefined : formatSitemapDate(new Date(latest).toISOString());
}
