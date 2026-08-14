import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { sanityClient } from 'sanity:client';
import { getActivities, type Activity } from '../src/lib/cruises';
import {
  localizeActivityPortableText,
  resolveVisibleActivityGroups,
  type ActivityGroup,
} from '../src/lib/activities';
import { remapActivityTranslationReferences } from '../src/lib/activity-translations';

describe('English activity data', () => {
  it('exposes only published English activities and their English tags', async () => {
    vi.spyOn(sanityClient, 'fetch').mockResolvedValue([
      {
        _id: 'activity-en',
        language: 'en',
        isPublished: true,
        title: 'Kayaking',
        tags: [
          { _id: 'tag-en', language: 'en', title: 'Water sports' },
          { _id: 'tag-fr', locale: 'fr', title: 'Nautique' },
        ],
      },
      {
        _id: 'activity-en-draft',
        language: 'en',
        isPublished: false,
        title: 'Draft activity',
        tags: [{ _id: 'tag-en', language: 'en', title: 'Water sports' }],
      },
      {
        _id: 'activity-fr',
        locale: 'fr',
        isPublished: true,
        title: 'Kayak',
        tags: [{ _id: 'tag-fr', locale: 'fr', title: 'Nautique' }],
      },
    ] as never);

    try {
      await expect(getActivities('en')).resolves.toEqual([
        expect.objectContaining({
          _id: 'activity-en',
          title: 'Kayaking',
          tags: [{ _id: 'tag-en', language: 'en', title: 'Water sports' }],
        }),
      ]);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('renders an English group only when its filters and activities are English', () => {
    const activities: Activity[] = [
      {
        _id: 'activity-en',
        language: 'en',
        title: 'Kayaking',
        tags: [{ _id: 'tag-en', language: 'en', title: 'Water sports' }],
      },
      {
        _id: 'activity-fr',
        locale: 'fr',
        title: 'Kayak',
        tags: [{ _id: 'tag-fr', locale: 'fr', title: 'Nautique' }],
      },
    ];
    const groups: ActivityGroup[] = [
      {
        _key: 'english-group',
        heading: 'Water sports',
        tagFilters: [{ _id: 'tag-en', language: 'en', title: 'Water sports' }],
      },
      {
        _key: 'french-group',
        heading: 'Activités nautiques',
        tagFilters: [{ _id: 'tag-fr', locale: 'fr', title: 'Nautique' }],
      },
    ];

    expect(resolveVisibleActivityGroups(groups, activities, 'en')).toEqual([
      expect.objectContaining({
        _key: 'english-group',
        activities: [expect.objectContaining({ _id: 'activity-en', title: 'Kayaking' })],
      }),
    ]);
  });

  it('passes the current locale into the public activities block', async () => {
    const [component, pageBuilder] = await Promise.all([
      readFile('src/components/blocks/ActivitiesBlock.astro', 'utf8'),
      readFile('src/components/blocks/PageBuilder.astro', 'utf8'),
    ]);

    expect(component).toContain('resolveVisibleActivityGroups(groups, activities, locale)');
    expect(pageBuilder).toMatch(/ActivitiesBlock[\s\S]*?locale=\{locale\}/);
  });

  it('localizes internal activity links without rewriting external links or anchors', () => {
    const value = [
      {
        _type: 'block',
        children: [],
        markDefs: [
          { _key: 'contact', _type: 'link', href: '/contact/' },
          { _key: 'anchor', _type: 'link', href: '#activities' },
          { _key: 'external', _type: 'link', href: 'https://example.com' },
        ],
      },
    ];

    expect(localizeActivityPortableText(value, 'en')[0]).toMatchObject({
      markDefs: [
        { _key: 'contact', href: '/en/contact/' },
        { _key: 'anchor', href: '#activities' },
        { _key: 'external', href: 'https://example.com' },
      ],
    });
  });

  it('links a duplicated activity to the translated tags in the same order', async () => {
    const commit = vi.fn().mockResolvedValue(undefined);
    const set = vi.fn().mockReturnValue({ commit });
    const client = {
      fetch: vi.fn().mockResolvedValue([
        { sourceId: 'tag-fr-1', translatedId: 'tag-en-1' },
        { sourceId: 'tag-fr-2', translatedId: 'tag-en-2' },
      ]),
      patch: vi.fn().mockReturnValue({ set }),
    };

    await remapActivityTranslationReferences({
      sourceDocument: {
        _id: 'activity-fr',
        _type: 'activity',
        tags: [
          { _key: 'first', _type: 'reference', _ref: 'tag-fr-1' },
          { _key: 'second', _type: 'reference', _ref: 'tag-fr-2' },
        ],
      },
      newDocument: { _id: 'activity-en', _type: 'activity' },
      sourceLanguageId: 'fr',
      destinationLanguageId: 'en',
      metaDocumentId: 'translation.metadata.activity',
      client,
    } as never);

    expect(set).toHaveBeenCalledWith({
      tags: [
        { _key: 'first', _type: 'reference', _ref: 'tag-en-1' },
        { _key: 'second', _type: 'reference', _ref: 'tag-en-2' },
      ],
    });
    expect(commit).toHaveBeenCalledOnce();
  });

  it('signals an incomplete tag translation before saving the English activity', async () => {
    const client = {
      fetch: vi.fn().mockResolvedValue([{ sourceId: 'tag-fr-1', translatedId: 'tag-en-1' }]),
      patch: vi.fn(),
    };

    await expect(
      remapActivityTranslationReferences({
        sourceDocument: {
          _id: 'activity-fr',
          _type: 'activity',
          tags: [
            { _type: 'reference', _ref: 'tag-fr-1' },
            { _type: 'reference', _ref: 'tag-fr-2' },
          ],
        },
        newDocument: { _id: 'activity-en', _type: 'activity' },
        sourceLanguageId: 'fr',
        destinationLanguageId: 'en',
        metaDocumentId: 'translation.metadata.activity',
        client,
      } as never),
    ).rejects.toThrow('missing en versions for activity tags tag-fr-2');

    expect(client.patch).not.toHaveBeenCalled();
  });

  it('enables reference-backed translation management for activities and tags', async () => {
    const config = await readFile('sanity.config.ts', 'utf8');

    expect(config).toContain(
      "schemaTypes: ['homePage', 'siteSettings', 'boatPage', 'contactPage', 'cruisePage', 'blogPost', 'legalPage', 'activity', 'activityTag']",
    );
    expect(config).toContain('callback: remapActivityTranslationReferences');
  });
});
