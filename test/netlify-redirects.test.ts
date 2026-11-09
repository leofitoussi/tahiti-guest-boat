import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('netlify.toml — missing pages and native URL normalization', () => {
  it('does not redirect unknown paths back to themselves with another slash', async () => {
    const source = await readFile('netlify.toml', 'utf8');

    expect(source).not.toMatch(
      /\[\[redirects\]\][^[]*from\s*=\s*"\/\*"[^[]*to\s*=\s*"\/:splat\/"/,
    );
  });

  it('serves the English 404 for unknown English paths without overriding published pages', async () => {
    const source = await readFile('netlify.toml', 'utf8');

    expect(source).toMatch(
      /\[\[redirects\]\][^[]*from\s*=\s*"\/en\/\*"[^[]*to\s*=\s*"\/en\/404\/"[^[]*status\s*=\s*404[^[]*force\s*=\s*false/,
    );
  });
});
