import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Page bateau localized public routes', () => {
  beforeAll(() => {
    execFileSync('npx', ['astro', 'build'], { stdio: 'ignore', timeout: 600000 });
  }, 600000);

  it('publishes a reciprocal French/English pair without leaking French page content into English', async () => {
    const [frenchHtml, englishHtml] = await Promise.all([
      readFile('dist/notre-bateau/index.html', 'utf8'),
      readFile('dist/en/our-boat/index.html', 'utf8'),
    ]);

    expect(frenchHtml).toContain('<html lang="fr">');
    expect(frenchHtml).toContain(
      '<link rel="canonical" href="https://tahitiguestboat.com/notre-bateau/"',
    );
    expect(frenchHtml).toContain(
      '<link rel="alternate" hreflang="en" href="https://tahitiguestboat.com/en/our-boat/"',
    );

    expect(englishHtml).toContain('<html lang="en">');
    expect(englishHtml).toContain(
      '<link rel="canonical" href="https://tahitiguestboat.com/en/our-boat/"',
    );
    expect(englishHtml).toContain(
      '<link rel="alternate" hreflang="fr" href="https://tahitiguestboat.com/notre-bateau/"',
    );
    expect(englishHtml).toContain('<meta property="og:locale" content="en_US"');
    expect(englishHtml).toContain('A catamaran made for long-distance cruising');
    expect(englishHtml).toContain('Activities included on board Na Maka');
    expect(englishHtml).not.toContain('Les activités incluses à bord de Na Maka');
    expect(englishHtml).toContain('href="/en/cruises"');
    expect(englishHtml).toContain('href="/en/contact"');
    expect(englishHtml).toContain('aria-label="Change language"');
  }, 600000);
});
