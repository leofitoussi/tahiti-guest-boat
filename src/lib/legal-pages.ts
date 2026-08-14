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
  locale?: Locale;
  translationGroup?: string;
}

export interface LegalPage extends LegalPageSummary {
  locale?: Locale;
  translationGroup?: string;
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
  (
    (defined($translationGroup) && translationGroup == $translationGroup) ||
    (defined($documentId) && _id in *[_type == "translation.metadata" && references($documentId)][0].translations[].value._ref)
  )
] {
  _id,
  ${localizedDocumentFields},
  "slug": slug.current,
  seo { indexable }
}`;

export async function getLegalTranslationVersions(
  source?: string | Pick<LegalPage, '_id' | 'translationGroup'>,
): Promise<LegalTranslationVersion[]> {
  const translationGroup = typeof source === 'string' ? source : source?.translationGroup;
  const documentId = typeof source === 'string' ? undefined : source?._id;

  if (!isSanityConfigured || (!translationGroup && !documentId)) {
    return [];
  }

  const documents = await sanityClient
    .fetch<
      {
        language?: Locale;
        locale?: Locale;
        slug?: string;
        seo?: { indexable?: boolean };
      }[]
    >(LEGAL_TRANSLATION_VERSIONS_QUERY, { translationGroup, documentId })
    .catch(() => []);

  return (documents ?? []).flatMap((document) => {
    if (!document.slug || document.seo?.indexable !== true) {
      return [];
    }

    return [{ locale: document.language ?? document.locale ?? defaultLocale, slug: document.slug, isPublished: true }];
  });
}
