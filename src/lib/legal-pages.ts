import { sanityClient } from 'sanity:client';
import type { TypedObject } from '@portabletext/types';
import { isSanityConfigured } from './sanity';
import { defaultLocale, type Locale } from './localization';
import { buildLocalizedSluggedDocumentFilter, localizedDocumentFields } from './sanity-localization';
import type { LegalTranslationVersion } from './legal-routes';

export interface LegalPageSummary {
  _id?: string;
  title: string;
  slug: string;
  language?: Locale;
}

export interface LegalPage extends LegalPageSummary {
  body: TypedObject[];
  seoTitle?: string;
  seoDescription?: string;
  seo?: { indexable?: boolean };
}

const legalPageFields = `
  _id,
  ${localizedDocumentFields},
  title,
  "slug": slug.current,
  seoTitle,
  seoDescription,
  seo { indexable },
  body
`;

export async function getLegalPages(locale: Locale = defaultLocale): Promise<LegalPageSummary[]> {
  if (!isSanityConfigured) {
    return [];
  }

  return sanityClient
    .fetch<LegalPageSummary[]>(
      `*[${buildLocalizedSluggedDocumentFilter('legalPage')}] | order(title asc) {
        ${localizedDocumentFields},
        title,
        "slug": slug.current
      }`,
      { locale }
    )
    .catch(() => []);
}

export async function getLegalPage(slug: string, locale: Locale = defaultLocale): Promise<LegalPage | null> {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient
    .fetch<LegalPage | null>(
      `*[${buildLocalizedSluggedDocumentFilter('legalPage')} && slug.current == $slug][0]{
        ${legalPageFields}
      }`,
      { slug, locale }
    )
    .catch(() => null);
}

const LEGAL_TRANSLATION_VERSIONS_QUERY = `*[
  _type == "legalPage" &&
  !(_id in path("drafts.**")) &&
  defined(slug.current) &&
  _id in *[_type == "translation.metadata" && references($documentId)][0].translations[].value._ref
] {
  _id,
  ${localizedDocumentFields},
  "slug": slug.current
}`;

export async function getLegalTranslationVersions(
  source?: string | Pick<LegalPage, '_id'>,
): Promise<LegalTranslationVersion[]> {
  const documentId = typeof source === 'string' ? source : source?._id;

  if (!isSanityConfigured || !documentId) {
    return [];
  }

  const documents = await sanityClient
    .fetch<
      {
        language?: Locale;
        slug?: string;
      }[]
    >(LEGAL_TRANSLATION_VERSIONS_QUERY, { documentId })
    .catch(() => []);

  return (documents ?? []).flatMap((document) => {
    if (!document.slug) {
      return [];
    }

    if (!document.language) {
      return [];
    }

    return [{ language: document.language, slug: document.slug, isPublished: true }];
  });
}
