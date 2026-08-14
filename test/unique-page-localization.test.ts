import { describe, expect, it, vi } from 'vitest';
import { sanityClient } from 'sanity:client';
import {
  getUniquePageVersions,
  resolveUniquePageVersion,
  type UniquePageDocument,
} from '../src/lib/page-builder';

describe('unique page language resolution', () => {
  it('selects the latest published version for a language with a stable id tie-breaker', () => {
    const versions: UniquePageDocument[] = [
      {
        _id: 'boatPage-en-older',
        language: 'en',
        _updatedAt: '2026-08-12T00:00:00Z',
        seoTitle: 'Older boat page',
      },
      {
        _id: 'boatPage-en-newer',
        language: 'en',
        _updatedAt: '2026-08-13T00:00:00Z',
        seoTitle: 'Current boat page',
      },
      {
        _id: 'boatPage-en-same-date',
        language: 'en',
        _updatedAt: '2026-08-13T00:00:00Z',
        seoTitle: 'Same-date boat page',
      },
      {
        _id: 'boatPage-fr',
        locale: 'fr',
        _updatedAt: '2026-08-14T00:00:00Z',
        seoTitle: 'Page bateau française',
      },
    ];

    expect(resolveUniquePageVersion(versions, 'en')).toMatchObject({
      _id: 'boatPage-en-newer',
      seoTitle: 'Current boat page',
    });
    expect(resolveUniquePageVersion(versions, 'fr')).toMatchObject({
      _id: 'boatPage-fr',
      seoTitle: 'Page bateau française',
    });
  });

  it('does not fall back to another language when the requested version is absent', () => {
    const versions: UniquePageDocument[] = [
      {
        _id: 'boatPage-fr',
        locale: 'fr',
        _updatedAt: '2026-08-14T00:00:00Z',
        seoTitle: 'Page bateau française',
      },
    ];

    expect(resolveUniquePageVersion(versions, 'en')).toBeNull();
  });

  it('loads the exact published versions needed by both localized routes', async () => {
    const fetch = vi.spyOn(sanityClient, 'fetch').mockResolvedValue([
      {
        _id: 'boatPage-en-older',
        language: 'en',
        _updatedAt: '2026-08-12T00:00:00Z',
        seoTitle: 'Older boat page',
      },
      {
        _id: 'boatPage-fr',
        locale: 'fr',
        _updatedAt: '2026-08-14T00:00:00Z',
        seoTitle: 'Page bateau française',
      },
      {
        _id: 'boatPage-en-newer',
        language: 'en',
        _updatedAt: '2026-08-13T00:00:00Z',
        seoTitle: 'Current boat page',
      },
    ] as never);

    try {
      await expect(getUniquePageVersions('boatPage')).resolves.toMatchObject({
        fr: { _id: 'boatPage-fr', seoTitle: 'Page bateau française' },
        en: { _id: 'boatPage-en-newer', seoTitle: 'Current boat page' },
      });
    } finally {
      fetch.mockRestore();
    }
  });
});
