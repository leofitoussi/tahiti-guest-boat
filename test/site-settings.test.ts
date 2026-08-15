import { describe, expect, it, vi } from 'vitest';
import { sanityClient } from 'sanity:client';
import { buildLayoutViewModel } from '../src/lib/site-settings';
import type { CruisePageSummary } from '../src/lib/cruises';
import { getTrackingHeadScripts } from '../src/lib/cruises';

function makeCruise(overrides: Partial<CruisePageSummary>): CruisePageSummary {
  return {
    _id: 'cruise-1',
    title: '',
    slug: 'croisiere-test',
    ...overrides,
  };
}

describe('buildLayoutViewModel — cruise link labels', () => {
  it('prefers the page title over heroTitle when both are present', () => {
    const cruises = [makeCruise({ title: 'Titre de la page', heroTitle: 'Titre du hero' })];

    const viewModel = buildLayoutViewModel(null, undefined, 'fr', cruises);

    expect(viewModel.cruiseLinks[0].label).toBe('Titre de la page');
  });

  it('falls back to heroTitle when the page title is absent', () => {
    const cruises = [makeCruise({ title: '', heroTitle: 'Titre du hero' })];

    const viewModel = buildLayoutViewModel(null, undefined, 'fr', cruises);

    expect(viewModel.cruiseLinks[0].label).toBe('Titre du hero');
  });
});

describe('buildLayoutViewModel — localized shell fallbacks', () => {
  it('uses English fallback copy for an English navigation shell', () => {
    const viewModel = buildLayoutViewModel(null, undefined, 'en');

    expect(viewModel.ctaLabel).toBe('Book your cruise');
    expect(viewModel.footerText).toBe('Private cruises and lagoon experiences in French Polynesia.');
    expect(viewModel.closeMenuLabel).toBe('Close menu');
  });

  it('exposes the exact published translation path to the shell', () => {
    const viewModel = buildLayoutViewModel(null, undefined, 'fr', [], { en: '/en/' });

    expect(viewModel.languageOptions).toEqual([
      { locale: 'fr', label: 'Français', shortLabel: 'FR', isCurrent: true },
      { locale: 'en', label: 'English', shortLabel: 'EN', isCurrent: false, href: '/en/' },
    ]);
  });

  it('passes localized legal links from Site settings to the footer', () => {
    const french = buildLayoutViewModel(
      {
        footerLinks: [
          { label: 'Politique de confidentialité', url: '/politique-de-confidentialite/' },
          { label: 'Politique de cookies', url: '/politique-de-cookies-ue/' },
        ],
      },
      undefined,
      'fr',
    );
    const english = buildLayoutViewModel(
      {
        footerLinks: [
          { label: 'Privacy policy', url: '/en/privacy-policy/' },
          { label: 'Cookie policy', url: '/en/cookie-policy/' },
        ],
      },
      undefined,
      'en',
    );

    expect(french.footerLinks).toEqual([
      { label: 'Politique de confidentialité', href: '/politique-de-confidentialite/' },
      { label: 'Politique de cookies', href: '/politique-de-cookies-ue/' },
    ]);
    expect(english.footerLinks).toEqual([
      { label: 'Privacy policy', href: '/en/privacy-policy/' },
      { label: 'Cookie policy', href: '/en/cookie-policy/' },
    ]);
  });
});

describe('tracking source of truth', () => {
  it('reads tracking scripts from the French Site settings version for every locale', async () => {
    const fetch = vi.spyOn(sanityClient, 'fetch').mockResolvedValue('<script>tracking()</script>' as never);

    await getTrackingHeadScripts();

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('language == "fr"'));
    fetch.mockRestore();
  });
});
