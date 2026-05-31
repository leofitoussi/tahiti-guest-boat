import { sanityClient } from 'sanity:client';
import type { TypedObject } from '@portabletext/types';
import { isSanityConfigured } from './sanity';
import { defaultLocale, type Locale } from './localization';
import { buildLocalizedSluggedDocumentFilter, localizedDocumentFields } from './sanity-localization';

export interface LegalPageSummary {
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
}

const legalPageFields = `
  ${localizedDocumentFields},
  title,
  "slug": slug.current,
  seoTitle,
  seoDescription,
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
