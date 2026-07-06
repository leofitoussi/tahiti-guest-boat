import { sanityClient } from 'sanity:client';
import { isSanityConfigured } from './sanity';
import { getSiteSettings } from './cruises';
import { defaultLocale, type Locale } from './localization';
import { buildLocalizedSluggedDocumentFilter } from './sanity-localization';
import { getSiteCopy, type SiteCopy } from './site-copy';

const HOME_PAGE_ID = 'f512860b-c337-4a81-b057-a93acdc2c961';
const DEFAULT_SITE_NAME = 'Tahiti Guest Boat';

const indexableLegalPageFilter = `${buildLocalizedSluggedDocumentFilter('legalPage')} && seo.indexable == true`;
const indexableCruiseFilter = `${buildLocalizedSluggedDocumentFilter('cruisePage')} && seo.indexable == true`;
const indexableBlogFilter = `${buildLocalizedSluggedDocumentFilter('blogPost')} && defined(publishedAt) && seo.indexable == true`;

export const LLMS_TXT_QUERY = `{
  "home": *[_id == $homeId && !(_id in path("drafts.**"))][0]{ seoDescription },
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

export function buildLlmsTxt(content: LlmsTxtContent): string {
  const pagesSection = content.pages
    .map((page) => `- [${page.title}](${page.path})${page.description ? `: ${page.description}` : ''}`)
    .join('\n');

  const cruisesSection = buildEntriesSection('Croisières', content.cruises);
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

function buildStaticPages(copy: SiteCopy): LlmsTxtPage[] {
  return [
    { title: copy.pages.home.title, path: '/', description: copy.pages.home.description },
    { title: copy.pages.boat.title, path: '/notre-bateau/', description: copy.pages.boat.description },
    { title: copy.pages.contact.title, path: '/contact/', description: copy.pages.contact.description },
    { title: copy.pages.blogIndex.title, path: '/blog/', description: copy.pages.blogIndex.description },
    {
      title: copy.pages.cruisesIndex.title,
      path: '/nos-croisieres/',
      description: copy.pages.cruisesIndex.description,
    },
  ];
}

export async function getLlmsTxtContent(locale: Locale = defaultLocale): Promise<string> {
  const copy = getSiteCopy(locale);
  const staticPages = buildStaticPages(copy);

  if (!isSanityConfigured) {
    return buildLlmsTxt({
      siteName: DEFAULT_SITE_NAME,
      summary: copy.pages.home.description,
      pages: staticPages,
      optional: [],
      cruises: [],
      blog: [],
    });
  }

  const [settings, content] = await Promise.all([
    getSiteSettings(locale),
    sanityClient
      .fetch<LlmsTxtQueryResult>(LLMS_TXT_QUERY, { homeId: HOME_PAGE_ID, locale })
      .catch(() => null),
  ]);

  return buildLlmsTxt({
    siteName: settings?.siteName ?? DEFAULT_SITE_NAME,
    summary: content?.home?.seoDescription ?? copy.pages.home.description,
    pages: staticPages,
    optional: (content?.legalPages ?? []).map((page) => ({
      title: page.title,
      path: `/${page.slug}/`,
    })),
    cruises: (content?.cruises ?? []).map((cruise) => ({
      title: cruise.title,
      path: `/nos-croisieres/${cruise.slug}/`,
      description: cruise.excerpt,
    })),
    blog: (content?.blog ?? []).map((post) => ({
      title: post.title,
      path: `/blog/${post.slug}/`,
      description: post.excerpt,
    })),
  });
}
