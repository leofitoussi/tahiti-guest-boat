import type { TypedObject } from 'astro-portabletext/types';
import type { CruisePage, CruisePageSummary } from './cruises';
import { buildCruisePath } from './cruise-routes';
import { defaultLocale, type Locale } from './localization';
import { urlForImage } from './sanity';

interface CruiseSeoOptions {
  canonicalUrl: string;
  relatedCruises?: CruisePageSummary[];
  siteName?: string;
  locale?: Locale;
}

export function buildPrimaryCruiseKeyword(
  destinationLabel?: string,
  title?: string,
  locale: Locale = defaultLocale,
) {
  const destination = destinationLabel?.trim() || deriveDestinationFromTitle(title, locale);

  return destination ? `${locale === 'en' ? 'cruise' : 'croisière'} ${destination}` : undefined;
}

export function buildCruiseSeoImage(cruise: CruisePage) {
  const image = cruise.hero?.backgroundImage ?? cruise.cruiseTeaser?.image;

  return image ? urlForImage(image)?.width(1200).height(630).fit('crop').auto('format').url() : undefined;
}

export function buildCruiseStructuredData(
  cruise: CruisePage,
  { canonicalUrl, relatedCruises = [], siteName = 'Tahiti Guest Boat', locale = defaultLocale }: CruiseSeoOptions
) {
  const touristTrip: Record<string, unknown> = {
    '@type': 'TouristTrip',
    '@id': `${canonicalUrl}#tourist-trip`,
    name: cruise.title,
    description: cruise.seoDescription ?? cruise.excerpt,
    url: canonicalUrl,
    provider: {
      '@type': 'Organization',
      name: siteName,
    },
  };

  const keyword = buildPrimaryCruiseKeyword(cruise.destinationLabel, cruise.title, locale);
  if (keyword) {
    touristTrip.touristType = keyword;
  }

  const image = buildCruiseSeoImage(cruise);
  if (image) {
    touristTrip.image = image;
  }

  const subTrip = buildSubTrips(cruise);
  if (subTrip.length > 0) {
    touristTrip.subTrip = subTrip;
  }

  const graph: Record<string, unknown>[] = [touristTrip];
  const itemList = buildRelatedCruisesItemList(relatedCruises, canonicalUrl, locale);

  if (itemList) {
    graph.push(itemList);
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

function buildSubTrips(cruise: CruisePage) {
  return (
    cruise.itinerary?.steps
      ?.map((step) => {
        const description = portableTextToPlainText(step.description);
        const name = portableTextToPlainText(step.dayLabel);

        if (!name || !description) {
          return null;
        }

        return {
          '@type': 'TouristTrip',
          name,
          description,
        };
      })
      .filter((step): step is { '@type': 'TouristTrip'; name: string; description: string } => Boolean(step)) ?? []
  );
}

function buildRelatedCruisesItemList(
  relatedCruises: CruisePageSummary[],
  canonicalUrl: string,
  locale: Locale,
) {
  if (relatedCruises.length === 0) {
    return null;
  }

  const origin = new URL(canonicalUrl).origin;
  const itemListElement = relatedCruises
    .filter((cruise) => cruise.slug && cruise.title)
    .map((cruise, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: cruise.title,
      url: new URL(buildCruisePath(cruise.slug, locale), origin).toString(),
    }));

  if (itemListElement.length === 0) {
    return null;
  }

  return {
    '@type': 'ItemList',
    name: locale === 'en' ? 'Other cruises' : 'Autres croisières',
    itemListElement,
  };
}

function portableTextToPlainText(blocks?: TypedObject[] | string) {
  if (typeof blocks === 'string') {
    return blocks.replace(/\s+/g, ' ').trim();
  }
  return (
    blocks
      ?.map((block) => {
        if (!('children' in block) || !Array.isArray(block.children)) {
          return '';
        }

        return block.children
          .map((child) => ('text' in child && typeof child.text === 'string' ? child.text : ''))
          .join('');
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim() ?? ''
  );
}

function deriveDestinationFromTitle(title?: string, locale: Locale = defaultLocale) {
  const normalizedTitle = title?.trim();
  if (!normalizedTitle) {
    return undefined;
  }

  const match = locale === 'en'
    ? normalizedTitle.match(/\b(?:in|to|around|of)\s+(.+)$/i)
    : normalizedTitle.match(/\b(?:à|au|aux|en|dans les|dans le)\s+(.+)$/i);

  return match?.[1]?.replace(/\s*\|\s*.+$/, '').trim();
}
