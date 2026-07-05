import { describe, expect, it } from 'vitest';
import { buildBlogPostingStructuredData } from '../src/lib/blog-seo';
import type { BlogPost } from '../src/lib/blog';

const MINIMAL_POST = {
  title: 'Croisière à Bora Bora : le guide complet',
  slug: 'guide-bora-bora',
  publishedAt: '2026-05-01T10:00:00.000Z',
} as BlogPost;

// ── Cycle 1 — BlogPosting basic shape ───────────────────────────────────────

describe('buildBlogPostingStructuredData — basic shape', () => {
  it('returns a BlogPosting node with headline, url, and datePublished', () => {
    const result = buildBlogPostingStructuredData(MINIMAL_POST, {
      canonicalUrl: 'https://tahiti-guest-boat.com/blog/guide-bora-bora/',
      siteUrl: 'https://tahiti-guest-boat.com',
    });

    expect(result['@type']).toBe('BlogPosting');
    expect(result.headline).toBe('Croisière à Bora Bora : le guide complet');
    expect(result.url).toBe('https://tahiti-guest-boat.com/blog/guide-bora-bora/');
    expect(result.datePublished).toBe('2026-05-01T10:00:00.000Z');
  });

  it('attributes authorship to the Organization entity (no per-author byline)', () => {
    const result = buildBlogPostingStructuredData(MINIMAL_POST, {
      canonicalUrl: 'https://tahiti-guest-boat.com/blog/guide-bora-bora/',
      siteUrl: 'https://tahiti-guest-boat.com',
      siteName: 'Tahiti Guest Boat',
    });

    expect(result.author).toEqual({ '@type': 'Organization', name: 'Tahiti Guest Boat' });
  });

  it('references the sitewide Organization node as publisher via @id', () => {
    const result = buildBlogPostingStructuredData(MINIMAL_POST, {
      canonicalUrl: 'https://tahiti-guest-boat.com/blog/guide-bora-bora/',
      siteUrl: 'https://tahiti-guest-boat.com',
    });

    expect(result.publisher).toEqual({ '@id': 'https://tahiti-guest-boat.com/#organization' });
  });
});

// ── Cycle 2 — image and dateModified ────────────────────────────────────────

describe('buildBlogPostingStructuredData — image and dateModified', () => {
  it('includes image when provided', () => {
    const result = buildBlogPostingStructuredData(MINIMAL_POST, {
      canonicalUrl: 'https://tahiti-guest-boat.com/blog/guide-bora-bora/',
      siteUrl: 'https://tahiti-guest-boat.com',
      image: 'https://cdn.sanity.io/main.jpg',
    });

    expect(result.image).toBe('https://cdn.sanity.io/main.jpg');
  });

  it('omits image when not provided', () => {
    const result = buildBlogPostingStructuredData(MINIMAL_POST, {
      canonicalUrl: 'https://tahiti-guest-boat.com/blog/guide-bora-bora/',
      siteUrl: 'https://tahiti-guest-boat.com',
    });

    expect(result.image).toBeUndefined();
  });

  it('sets dateModified from updatedAt when present', () => {
    const post = { ...MINIMAL_POST, updatedAt: '2026-06-01T10:00:00.000Z' };
    const result = buildBlogPostingStructuredData(post, {
      canonicalUrl: 'https://tahiti-guest-boat.com/blog/guide-bora-bora/',
      siteUrl: 'https://tahiti-guest-boat.com',
    });

    expect(result.dateModified).toBe('2026-06-01T10:00:00.000Z');
  });

  it('falls back dateModified to datePublished when updatedAt is absent', () => {
    const result = buildBlogPostingStructuredData(MINIMAL_POST, {
      canonicalUrl: 'https://tahiti-guest-boat.com/blog/guide-bora-bora/',
      siteUrl: 'https://tahiti-guest-boat.com',
    });

    expect(result.dateModified).toBe('2026-05-01T10:00:00.000Z');
  });
});
