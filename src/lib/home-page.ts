import { defaultLocale, type Locale } from './localization';
import { isSanityConfigured } from './sanity';
import { pageBuilderFields } from './page-builder';
import { sanityClient } from 'sanity:client';

export const HOME_PAGE_ID = 'f512860b-c337-4a81-b057-a93acdc2c961';

export interface HomePageDocument {
  _id?: string;
  language?: Locale | null;
  locale?: Locale | null;
  seoTitle?: string;
  seoDescription?: string;
  seo?: { indexable?: boolean };
  pageBuilder?: Record<string, unknown>[];
}

export interface HomePageTranslation {
  document?: HomePageDocument | null;
}

export interface HomePagePair {
  source?: HomePageDocument | null;
  translations?: HomePageTranslation[];
}

const HOME_PAGE_PROJECTION = `{
  _id,
  language,
  locale,
  seoTitle,
  seoDescription,
  seo { indexable },
  ${pageBuilderFields}
}`;

export const HOME_PAGE_PAIR_QUERY = `{
  "source": *[_id == $homePageId && !(_id in path("drafts.**"))][0]${HOME_PAGE_PROJECTION},
  "translations": (*[_type == "translation.metadata" && !(_id in path("drafts.**")) && references($homePageId)] | order(_id asc))[0].translations[defined(value->) && value->language in ["fr", "en"]]{
    "document": value->${HOME_PAGE_PROJECTION}
  }
}`;

export async function getHomePagePair(): Promise<HomePagePair | null> {
  if (!isSanityConfigured) {
    return null;
  }

  return sanityClient
    .fetch<HomePagePair>(HOME_PAGE_PAIR_QUERY, { homePageId: HOME_PAGE_ID })
    .catch(() => null);
}

export function resolveHomePageVersion(pair: HomePagePair, locale: Locale): HomePageDocument | null {
  const versions = [pair.source, ...(pair.translations ?? []).map((translation) => translation.document)].filter(
    (document): document is HomePageDocument => Boolean(document),
  );

  return (
    versions.find((document) => (document.language ?? document.locale ?? defaultLocale) === locale) ?? null
  );
}
