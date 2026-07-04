import { describe, expect, it } from 'vitest';
import { buildLayoutViewModel } from '../src/lib/site-settings';
import type { CruisePageSummary } from '../src/lib/cruises';

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
