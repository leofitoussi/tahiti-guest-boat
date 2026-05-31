import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { schemaTypes } from '../schemas';
import { boatPage } from '../schemas/boatPage';
import { componentsTestPage } from '../schemas/componentsTestPage';
import { contactPage } from '../schemas/contactPage';
import { homePage } from '../schemas/homePage';

const expectedPageBuilderTypes = [
  'heroHeaderBlock',
  'homeHeroBlock',
  'pitchBlock',
  'galleryBlock',
  'marqueeGalleryBlock',
  'editorialBlock',
  'boatBlock',
  'videoFeatureBlock',
  'whyUsBlock',
  'reviewsBlock',
  'bookingBlock',
  'relatedCruisesBlock',
  'fullWidthImageBlock',
];

describe('unique page family schema', () => {
  it('registers the homepage, boat page, and contact page documents', () => {
    const documentNames = schemaTypes
      .filter((schema) => schema.type === 'document')
      .map((schema) => schema.name);

    expect(documentNames).toEqual(expect.arrayContaining(['homePage', 'boatPage', 'contactPage', 'componentsTestPage']));
  });

  it('keeps the same page-builder block order across the unique page family', () => {
    for (const page of [homePage, boatPage, contactPage, componentsTestPage]) {
      const pageBuilderField = page.fields.find((field) => field.name === 'pageBuilder');

      expect(pageBuilderField?.type).toBe('array');
      expect((pageBuilderField as any)?.of?.map((member: any) => member.type)).toEqual(expectedPageBuilderTypes);
    }
  });

  it('adds locale metadata fields to the unique page family documents', () => {
    for (const page of [homePage, boatPage, contactPage, componentsTestPage]) {
      const fieldNames = page.fields.map((field) => field.name);

      expect(fieldNames).toEqual(expect.arrayContaining(['locale', 'translationGroup']));
    }
  });
});

describe('unique page family routes', () => {
  it('keeps the public /notre-bateau and /contact URLs available in the build', async () => {
    execFileSync('npm', ['run', 'build'], { stdio: 'ignore' });

    const boatHtml = await readFile('dist/notre-bateau/index.html', 'utf8');
    const contactHtml = await readFile('dist/contact/index.html', 'utf8');

    expect(boatHtml).toContain('<title>Namaka, le bateau de Tahiti Guest Boat</title>');
    expect(contactHtml).toContain('<title>Contact | Tahiti Guest Boat</title>');
  }, 120000);

  it('keeps /composants available as a noindex test page', async () => {
    execFileSync('npm', ['run', 'build'], { stdio: 'ignore' });

    const componentsHtml = await readFile('dist/composants/index.html', 'utf8');

    expect(componentsHtml).toContain('<title>Composants | Tahiti Guest Boat</title>');
    expect(componentsHtml).toContain('<meta name="robots" content="noindex, nofollow">');
  }, 120000);
});
