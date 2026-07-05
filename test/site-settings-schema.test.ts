import { describe, expect, it } from 'vitest';
import { siteSettings } from '../schemas/siteSettings';

describe('siteSettings schema — sameAs field', () => {
  it('has a sameAs field that is an array of URLs', () => {
    const field = (siteSettings.fields as any[]).find((f) => f.name === 'sameAs');

    expect(field, 'siteSettings is missing a sameAs field').toBeDefined();
    expect(field.type).toBe('array');
    expect(field.of).toEqual([{ type: 'url' }]);
  });
});
