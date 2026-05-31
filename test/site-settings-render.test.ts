import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { describe, expect, it, beforeAll } from 'vitest';

const buildArgs = ['run', 'build'];

describe('site settings render', () => {
  beforeAll(() => {
    execFileSync('npm', buildArgs, { stdio: 'ignore' });
  }, 120000);

  it('renders the shared site settings into the home page header and footer', async () => {
    const html = await readFile('dist/index.html', 'utf8');

    expect(html).toContain('<html lang="fr">');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('hreflang="fr"');
    expect(html).toContain('Réservez');
    expect(html).toContain('Notre bateau');
    expect(html).toContain('Nos croisières');
    expect(html).toContain('Notre blog');
    expect(html).toContain('contact@tahiti-guest-boat.com');
    expect(html).toContain('+689 87 00 00 09');
  });
});
