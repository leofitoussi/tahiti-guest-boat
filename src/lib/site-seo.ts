import type { Review } from './cruises';

export interface OrganizationSeoOptions {
  siteUrl: string;
  siteName?: string;
  logoUrl?: string;
  sameAs?: string[];
  contactEmail?: string;
  contactPhone?: string;
  reviews?: Review[];
}

export function buildOrganizationStructuredData({
  siteUrl,
  siteName = 'Tahiti Guest Boat',
  logoUrl,
  sameAs,
  contactEmail,
  contactPhone,
  reviews = [],
}: OrganizationSeoOptions) {
  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
  };

  if (logoUrl) {
    organization.logo = logoUrl;
  }

  if (sameAs && sameAs.length > 0) {
    organization.sameAs = sameAs;
  }

  const contactPoint = buildContactPoint(contactEmail, contactPhone);
  if (contactPoint) {
    organization.contactPoint = contactPoint;
  }

  const ratedReviews = reviews.filter((review): review is Review & { rating: number } =>
    typeof review.rating === 'number',
  );

  if (ratedReviews.length > 0) {
    const total = ratedReviews.reduce((sum, review) => sum + review.rating, 0);
    organization.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (total / ratedReviews.length).toFixed(1),
      reviewCount: ratedReviews.length,
    };
    organization.review = ratedReviews.map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.name },
      reviewRating: { '@type': 'Rating', ratingValue: review.rating },
      reviewBody: review.body,
    }));
  }

  return organization;
}

export interface WebsiteSeoOptions {
  siteUrl: string;
  siteName?: string;
}

export function buildWebsiteStructuredData({ siteUrl, siteName = 'Tahiti Guest Boat' }: WebsiteSeoOptions) {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    publisher: { '@id': `${siteUrl}/#organization` },
  };
}

function buildContactPoint(contactEmail?: string, contactPhone?: string) {
  if (!contactEmail && !contactPhone) {
    return null;
  }

  const contactPoint: Record<string, unknown> = { '@type': 'ContactPoint' };
  if (contactEmail) {
    contactPoint.email = contactEmail;
  }
  if (contactPhone) {
    contactPoint.telephone = contactPhone;
  }
  contactPoint.contactType = 'customer service';

  return contactPoint;
}
