import { describe, expect, it } from 'vitest';
import { buildOrganizationStructuredData, buildWebsiteStructuredData } from '../src/lib/site-seo';

// ── Cycle 1 — Organization basic shape ──────────────────────────────────────

describe('buildOrganizationStructuredData — basic shape', () => {
  it('returns an Organization node with @id, name, and url', () => {
    const result = buildOrganizationStructuredData({
      siteUrl: 'https://tahiti-guest-boat.com',
      siteName: 'Tahiti Guest Boat',
    });

    expect(result['@type']).toBe('Organization');
    expect(result['@id']).toBe('https://tahiti-guest-boat.com/#organization');
    expect(result.name).toBe('Tahiti Guest Boat');
    expect(result.url).toBe('https://tahiti-guest-boat.com');
  });
});

// ── Cycle 2 — logo and sameAs ────────────────────────────────────────────────

describe('buildOrganizationStructuredData — logo and sameAs', () => {
  it('includes logo when a logoUrl is provided', () => {
    const result = buildOrganizationStructuredData({
      siteUrl: 'https://tahiti-guest-boat.com',
      logoUrl: 'https://cdn.sanity.io/logo.png',
    });

    expect(result.logo).toBe('https://cdn.sanity.io/logo.png');
  });

  it('omits logo when no logoUrl is provided', () => {
    const result = buildOrganizationStructuredData({
      siteUrl: 'https://tahiti-guest-boat.com',
    });

    expect(result.logo).toBeUndefined();
  });

  it('includes sameAs social profile URLs when provided', () => {
    const result = buildOrganizationStructuredData({
      siteUrl: 'https://tahiti-guest-boat.com',
      sameAs: [
        'https://www.facebook.com/p/Sail-with-Tahiti-Guest-Boat-61575614675016/',
        'https://www.instagram.com/tahitiguestboat/',
      ],
    });

    expect(result.sameAs).toEqual([
      'https://www.facebook.com/p/Sail-with-Tahiti-Guest-Boat-61575614675016/',
      'https://www.instagram.com/tahitiguestboat/',
    ]);
  });

  it('omits sameAs when the array is empty or absent', () => {
    expect(buildOrganizationStructuredData({ siteUrl: 'https://tahiti-guest-boat.com' }).sameAs).toBeUndefined();
    expect(
      buildOrganizationStructuredData({ siteUrl: 'https://tahiti-guest-boat.com', sameAs: [] }).sameAs,
    ).toBeUndefined();
  });
});

// ── Cycle 3 — contactPoint ───────────────────────────────────────────────────

describe('buildOrganizationStructuredData — contactPoint', () => {
  it('builds a ContactPoint from contactEmail and contactPhone', () => {
    const result = buildOrganizationStructuredData({
      siteUrl: 'https://tahiti-guest-boat.com',
      contactEmail: 'tahitiguestboat@gmail.com',
      contactPhone: '+689 89 34 14 34',
    });

    expect(result.contactPoint).toEqual({
      '@type': 'ContactPoint',
      email: 'tahitiguestboat@gmail.com',
      telephone: '+689 89 34 14 34',
      contactType: 'customer service',
    });
  });

  it('omits contactPoint when neither email nor phone is provided', () => {
    const result = buildOrganizationStructuredData({ siteUrl: 'https://tahiti-guest-boat.com' });
    expect(result.contactPoint).toBeUndefined();
  });

  it('builds a partial contactPoint when only email is provided', () => {
    const result = buildOrganizationStructuredData({
      siteUrl: 'https://tahiti-guest-boat.com',
      contactEmail: 'tahitiguestboat@gmail.com',
    });

    expect(result.contactPoint).toEqual({
      '@type': 'ContactPoint',
      email: 'tahitiguestboat@gmail.com',
      contactType: 'customer service',
    });
  });
});

// ── Cycle 4 — reviews remain visible but are excluded from Organization JSON-LD ──

describe('buildOrganizationStructuredData — review exclusion', () => {
  it('does not emit aggregateRating or review properties', () => {
    const result = buildOrganizationStructuredData({ siteUrl: 'https://tahiti-guest-boat.com' });

    expect(result.aggregateRating).toBeUndefined();
    expect(result.review).toBeUndefined();
  });
});

// ── Cycle 5 — WebSite node shape ─────────────────────────────────────────────

describe('buildWebsiteStructuredData — WebSite node shape', () => {
  it('returns a WebSite node referencing the Organization as publisher via @id, with no SearchAction', () => {
    const result = buildWebsiteStructuredData({
      siteUrl: 'https://tahiti-guest-boat.com',
      siteName: 'Tahiti Guest Boat',
    });

    expect(result).toEqual({
      '@type': 'WebSite',
      '@id': 'https://tahiti-guest-boat.com/#website',
      name: 'Tahiti Guest Boat',
      url: 'https://tahiti-guest-boat.com',
      publisher: { '@id': 'https://tahiti-guest-boat.com/#organization' },
    });
  });
});
