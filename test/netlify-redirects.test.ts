import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('netlify.toml — canonical trailing-slash redirect', () => {
  it('redirects any non-trailing-slash path to its trailing-slash form, without forcing over existing files', async () => {
    const source = await readFile('netlify.toml', 'utf8');

    expect(source).toMatch(
      /\[\[redirects\]\][^[]*from\s*=\s*"\/\*"[^[]*to\s*=\s*"\/:splat\/"[^[]*status\s*=\s*301[^[]*force\s*=\s*false/,
    );
  });

  it('serves the English 404 for unknown English paths without overriding published pages', async () => {
    const source = await readFile('netlify.toml', 'utf8');

    expect(source).toMatch(
      /\[\[redirects\]\][^[]*from\s*=\s*"\/en\/\*"[^[]*to\s*=\s*"\/en\/404\/"[^[]*status\s*=\s*404[^[]*force\s*=\s*false/,
    );
  });
});
