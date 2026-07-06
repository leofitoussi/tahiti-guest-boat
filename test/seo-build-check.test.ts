import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkSeoBuild } from '../scripts/check-seo.mjs';

let tempDirs: string[] = [];

async function makeDist() {
  const dir = await mkdtemp(join(tmpdir(), 'seo-check-'));
  tempDirs.push(dir);
  await mkdir(join(dir, 'page'), { recursive: true });
  return dir;
}

async function writeValidDist(dir: string) {
  await writeFile(
    join(dir, 'sitemap_index.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://example.com/page-sitemap.xml</loc></sitemap>
</sitemapindex>
`
  );
  await writeFile(
    join(dir, 'page-sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page/</loc>
    <lastmod>2026-06-01T10:00:00.000Z</lastmod>
  </url>
</urlset>
`
  );
  await writeFile(
    join(dir, 'robots.txt'),
    `User-agent: *
Allow: /

Sitemap: https://example.com/sitemap_index.xml
`
  );
  await writeFile(
    join(dir, 'page', 'index.html'),
    `<!doctype html><html><head>
<link rel="canonical" href="https://example.com/page/" />
<meta name="robots" content="index,follow" />
</head><body>Page</body></html>`
  );
}

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs = [];
});

describe('SEO post-build checks', () => {
  it('passes for a valid static build with sitemap, canonical, and indexable page', async () => {
    const distDir = await makeDist();
    await writeValidDist(distDir);

    await expect(checkSeoBuild({ distDir, siteUrl: 'https://example.com' })).resolves.toMatchObject({
      checkedUrls: 1,
    });
  });

  it('fails with an explicit error when a sitemap contains duplicate URLs', async () => {
    const distDir = await makeDist();
    await writeValidDist(distDir);
    await writeFile(
      join(distDir, 'page-sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/page/</loc><lastmod>2026-06-01T10:00:00.000Z</lastmod></url>
  <url><loc>https://example.com/page/</loc><lastmod>2026-06-01T10:00:00.000Z</lastmod></url>
</urlset>
`
    );

    await expect(checkSeoBuild({ distDir, siteUrl: 'https://example.com' })).rejects.toThrow(
      'Duplicate sitemap URL: https://example.com/page/'
    );
  });

  it('fails when a sitemap page is missing canonical or is marked noindex', async () => {
    const distDir = await makeDist();
    await writeValidDist(distDir);
    await writeFile(
      join(distDir, 'page', 'index.html'),
      `<!doctype html><html><head>
<meta name="robots" content="noindex,nofollow" />
</head><body>Page</body></html>`
    );

    await expect(checkSeoBuild({ distDir, siteUrl: 'https://example.com' })).rejects.toThrow(
      'missing <link rel="canonical">'
    );
    await expect(checkSeoBuild({ distDir, siteUrl: 'https://example.com' })).rejects.toThrow(
      'must be index,follow'
    );
  });
});
