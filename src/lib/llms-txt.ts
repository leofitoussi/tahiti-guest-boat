import { sanityClient } from 'sanity:client';
import { isSanityConfigured } from './sanity';
import { getSiteSettings } from './cruises';
import { defaultLocale, localizePath, type Locale } from './localization';
import { buildLocalizedSluggedDocumentFilter } from './sanity-localization';
import { getSiteCopy, type SiteCopy } from './site-copy';

const HOME_PAGE_ID = 'f512860b-c337-4a81-b057-a93acdc2c961';
const DEFAULT_SITE_NAME = 'Tahiti Guest Boat';

const indexableLegalPageFilter = `${buildLocalizedSluggedDocumentFilter('legalPage')} && seo.indexable == true`;
const indexableCruiseFilter = `${buildLocalizedSluggedDocumentFilter('cruisePage')} && seo.indexable == true`;
const indexableBlogFilter = `${buildLocalizedSluggedDocumentFilter('blogPost')} && defined(publishedAt) && seo.indexable == true`;
const englishLocalizedFilter = `(language == "en" || (!defined(language) && locale == "en"))`;
const indexableEnglishCruiseFilter = `_type == "cruisePage" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**")) && ${englishLocalizedFilter} && seo.indexable == true`;
const indexableEnglishBlogFilter = `_type == "blogPost" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**")) && ${englishLocalizedFilter} && seo.indexable == true`;

export const LLMS_TXT_QUERY = `{
  "home": *[_id == $homeId && !(_id in path("drafts.**"))][0]{ seoDescription },
  "homeTranslation": *[_type == "translation.metadata" && !(_id in path("drafts.**")) && references($homeId)][0].translations[language == $locale][0].value->{ seoDescription, seo { indexable } },
  "surfaceAvailability": {
    "home": $locale == "fr" || count(*[_type == "translation.metadata" && !(_id in path("drafts.**")) && references($homeId)][0].translations[language == $locale && defined(value->) && value->seo.indexable == true]) > 0,
    "boat": $locale == "fr" || count(*[_type == "translation.metadata" && !(_id in path("drafts.**")) && references($boatPageId)][0].translations[language == $locale && defined(value->) && value->seo.indexable == true]) > 0,
    "contact": $locale == "fr" || count(*[_type == "translation.metadata" && !(_id in path("drafts.**")) && references($contactPageId)][0].translations[language == $locale && defined(value->) && value->seo.indexable == true]) > 0,
    "cruises": $locale == "fr" || count(*[${indexableEnglishCruiseFilter}]) > 0,
    "blog": $locale == "fr" || count(*[${indexableEnglishBlogFilter}]) > 0
  },
  "legalPages": *[${indexableLegalPageFilter}] | order(slug.current asc) { title, "slug": slug.current },
  "cruises": *[${indexableCruiseFilter}] | order(coalesce(editorialPriority, 0) desc, _createdAt desc) {
    title,
    "slug": slug.current,
    "excerpt": pt::text(cruiseTeaser.headline)
  },
  "blog": *[${indexableBlogFilter}] | order(publishedAt desc) { title, "slug": slug.current, excerpt }
}`;

interface LlmsTxtQueryEntry {
  title: string;
  slug: string;
  excerpt?: string;
}

interface LlmsTxtQueryResult {
  home?: { seoDescription?: string } | null;
  homeTranslation?: { seoDescription?: string; seo?: { indexable?: boolean } } | null;
  surfaceAvailability?: {
    home?: boolean;
    boat?: boolean;
    contact?: boolean;
    cruises?: boolean;
    blog?: boolean;
  };
  legalPages?: { title: string; slug: string }[];
  cruises?: LlmsTxtQueryEntry[];
  blog?: LlmsTxtQueryEntry[];
}

export interface LlmsTxtPage {
  title: string;
  path: string;
  description?: string;
}

export interface LlmsTxtLegalPage {
  title: string;
  path: string;
}

export interface LlmsTxtContent {
  siteName: string;
  summary: string;
  pages: LlmsTxtPage[];
  optional: LlmsTxtLegalPage[];
  cruises: LlmsTxtPage[];
  blog: LlmsTxtPage[];
}

function buildEntriesSection(heading: string, entries: LlmsTxtPage[]): string {
  if (entries.length === 0) {
    return '';
  }

  const entriesList = entries
    .map((entry) => `- [${entry.title}](${entry.path})${entry.description ? `: ${entry.description}` : ''}`)
    .join('\n');

  return `\n## ${heading}\n\n${entriesList}\n`;
}

export function buildLlmsTxt(content: LlmsTxtContent, locale: Locale = defaultLocale): string {
  const pagesSection = content.pages
    .map((page) => `- [${page.title}](${page.path})${page.description ? `: ${page.description}` : ''}`)
    .join('\n');

  const cruisesSection = buildEntriesSection(locale === 'en' ? 'Cruises' : 'Croisières', content.cruises);
  const blogSection = buildEntriesSection('Blog', content.blog);

  const optionalSection =
    content.optional.length > 0
      ? `\n## Optional\n\n${content.optional.map((page) => `- [${page.title}](${page.path})`).join('\n')}\n`
      : '';

  return `# ${content.siteName}

> ${content.summary}

## Pages

${pagesSection}
${cruisesSection}${blogSection}${optionalSection}`;
}

function buildStaticPages(
  copy: SiteCopy,
  locale: Locale,
  availability: LlmsTxtQueryResult['surfaceAvailability'] = {},
): LlmsTxtPage[] {
  const pages = [
    { key: 'home', title: copy.pages.home.title, path: localizePath('/', locale), description: copy.pages.home.description },
    { key: 'boat', title: copy.pages.boat.title, path: localizePath('/notre-bateau/', locale), description: copy.pages.boat.description },
    { key: 'contact', title: copy.pages.contact.title, path: localizePath('/contact/', locale), description: copy.pages.contact.description },
    { key: 'blog', title: copy.pages.blogIndex.title, path: localizePath('/blog/', locale), description: copy.pages.blogIndex.description },
    {
      key: 'cruises',
      title: copy.pages.cruisesIndex.title,
      path: localizePath('/nos-croisieres/', locale),
      description: copy.pages.cruisesIndex.description,
    },
  ] as const;

  return pages
    .filter((page) => locale === defaultLocale || availability[page.key] === true)
    .map(({ key: _key, ...page }) => page);
}

export async function getLlmsTxtContent(locale: Locale = defaultLocale): Promise<string> {
  const copy = getSiteCopy(locale);
  const staticPages = buildStaticPages(copy, locale);

  if (!isSanityConfigured) {
    return buildLlmsTxt({
      siteName: DEFAULT_SITE_NAME,
      summary: copy.pages.home.description,
      pages: staticPages,
      optional: [],
      cruises: [],
      blog: [],
    }, locale);
  }

  const [settings, content] = await Promise.all([
    getSiteSettings(locale),
    sanityClient
      .fetch<LlmsTxtQueryResult>(LLMS_TXT_QUERY, {
        homeId: HOME_PAGE_ID,
        boatPageId: 'boatPage',
        contactPageId: 'contactPage',
        locale,
      })
      .catch(() => null),
  ]);

  const pages = buildStaticPages(copy, locale, content?.surfaceAvailability);

  return buildLlmsTxt({
    siteName: settings?.siteName ?? DEFAULT_SITE_NAME,
    summary: content?.homeTranslation?.seoDescription ?? content?.home?.seoDescription ?? copy.pages.home.description,
    pages,
    optional: (content?.legalPages ?? []).map((page) => ({
      title: page.title,
      path: localizePath(`/${page.slug}/`, locale),
    })),
    cruises: (content?.cruises ?? []).map((cruise) => ({
      title: cruise.title,
      path: localizePath(`/nos-croisieres/${cruise.slug}/`, locale),
      description: cruise.excerpt,
    })),
    blog: (content?.blog ?? []).map((post) => ({
      title: post.title,
      path: localizePath(`/blog/${post.slug}/`, locale),
      description: post.excerpt,
    })),
  }, locale);
}
