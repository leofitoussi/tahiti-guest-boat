import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import indexNowPlugin from '../netlify/plugins/indexnow/index.js';

const siteUrl = 'https://tahitiguestboat.com';
const key = 'TahitiGuestBoatIndexNowKey';

const productionIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${siteUrl}/page-sitemap.xml</loc></sitemap>
</sitemapindex>`;

const productionPages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/nos-croisieres/moorea/</loc><lastmod>2026-08-01T00:00:00.000Z</lastmod></url>
</urlset>`;

const candidateIndex = productionIndex;
const candidatePages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/nos-croisieres/moorea/</loc><lastmod>2026-08-01T00:00:00.000Z</lastmod></url>
  <url><loc>${siteUrl}/blog/croisiere-privee/</loc><lastmod>2026-08-15T00:00:00.000Z</lastmod></url>
</urlset>`;

const modifiedCandidatePages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/nos-croisieres/moorea/</loc><lastmod>2026-08-15T00:00:00.000Z</lastmod></url>
</urlset>`;

const emptyCandidatePages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

const malformedCandidatePages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/nos-croisieres/moorea/</loc><lastmod>2026-08-01T00:00:00.000Z</lastmod>
</urlset>`;

const originalContext = process.env.CONTEXT;
const originalKey = process.env.INDEXNOW_KEY;

afterEach(() => {
  vi.unstubAllGlobals();

  if (originalContext === undefined) {
    delete process.env.CONTEXT;
  } else {
    process.env.CONTEXT = originalContext;
  }

  if (originalKey === undefined) {
    delete process.env.INDEXNOW_KEY;
  } else {
    process.env.INDEXNOW_KEY = originalKey;
  }
});

describe('IndexNow production plugin', () => {
  it('is registered for production deployments only', async () => {
    const netlifyConfig = await readFile('netlify.toml', 'utf8');

    expect(netlifyConfig).toMatch(
      /\[\[context\.production\.plugins\]\][^[]*package\s*=\s*"\.\/netlify\/plugins\/indexnow"/
    );
  });

  it('declares the local IndexNow build plugin', async () => {
    const manifest = await readFile('netlify/plugins/indexnow/manifest.yml', 'utf8');

    expect(manifest).toContain('name: tahiti-guest-boat-indexnow');
  });

  it('ships the IndexNow verification key as a public static asset', async () => {
    const verificationFile = (await readdir('public')).find((file) => /^[a-f0-9]{32}\.txt$/i.test(file));

    expect(verificationFile).toBeDefined();
    expect(await readFile(join('public', verificationFile), 'utf8')).toMatch(
      new RegExp(`^${verificationFile.slice(0, -4)}\\r?\\n?$`)
    );
  });

  it('does not publish or submit anything for a deploy preview', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'deploy-preview';
    process.env.INDEXNOW_KEY = key;
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status: { show: vi.fn() } } };

      await indexNowPlugin.onPreBuild(event);

      expect(fetch).not.toHaveBeenCalledWith('https://api.indexnow.org/indexnow', expect.anything());
      await indexNowPlugin.onSuccess(event);

      expect(fetch).not.toHaveBeenCalled();
      await expect(readFile(join(publishDir, `${key}.txt`), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('warns without failing when the production key is absent', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    delete process.env.INDEXNOW_KEY;
    const fetch = vi.fn();
    const status = { show: vi.fn() };
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status } };

      await expect(indexNowPlugin.onPreBuild(event)).resolves.toBeUndefined();
      await expect(indexNowPlugin.onSuccess(event)).resolves.toBeUndefined();

      expect(fetch).not.toHaveBeenCalled();
      expect(status.show).toHaveBeenCalledWith(expect.objectContaining({ summary: expect.stringContaining('INDEXNOW_KEY') }));
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('warns without submitting when the production sitemap is unavailable', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), candidatePages);

    const fetch = vi.fn(async () => new Response(null, { status: 503 }));
    const status = { show: vi.fn() };
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status } };

      await expect(indexNowPlugin.onPreBuild(event)).resolves.toBeUndefined();
      await expect(indexNowPlugin.onSuccess(event)).resolves.toBeUndefined();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(status.show).toHaveBeenCalledWith(expect.objectContaining({ summary: expect.stringContaining('production sitemap') }));
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('sends a public URL whose sitemap lastmod changed', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), modifiedCandidatePages);

    const fetch = vi.fn(async (input) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex);
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(productionPages);
      if (url === 'https://api.indexnow.org/indexnow') return new Response(null, { status: 200 });

      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status: { show: vi.fn() } } };

      await indexNowPlugin.onPreBuild(event);
      await indexNowPlugin.onSuccess(event);

      expect(fetch).toHaveBeenLastCalledWith(
        'https://api.indexnow.org/indexnow',
        expect.objectContaining({
          body: expect.stringContaining(`${siteUrl}/nos-croisieres/moorea/`),
        })
      );
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('sends a URL that was removed from the production sitemap', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), emptyCandidatePages);

    const fetch = vi.fn(async (input) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex);
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(productionPages);
      if (url === 'https://api.indexnow.org/indexnow') return new Response(null, { status: 200 });

      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status: { show: vi.fn() } } };

      await indexNowPlugin.onPreBuild(event);
      await indexNowPlugin.onSuccess(event);

      expect(fetch).toHaveBeenLastCalledWith(
        'https://api.indexnow.org/indexnow',
        expect.objectContaining({
          body: expect.stringContaining(`${siteUrl}/nos-croisieres/moorea/`),
        })
      );
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('does not submit an unchanged sitemap URL', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), productionPages);

    const fetch = vi.fn(async (input) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex);
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(productionPages);
      if (url === 'https://api.indexnow.org/indexnow') return new Response(null, { status: 200 });

      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status: { show: vi.fn() } } };

      await indexNowPlugin.onPreBuild(event);
      await indexNowPlugin.onSuccess(event);

      expect(fetch).not.toHaveBeenCalledWith('https://api.indexnow.org/indexnow', expect.anything());
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('warns without submitting when the candidate sitemap is malformed', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), malformedCandidatePages);

    const fetch = vi.fn(async (input) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex);
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(productionPages);
      if (url === 'https://api.indexnow.org/indexnow') return new Response(null, { status: 200 });

      throw new Error(`Unexpected request: ${url}`);
    });
    const status = { show: vi.fn() };
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status } };

      await indexNowPlugin.onPreBuild(event);
      await expect(indexNowPlugin.onSuccess(event)).resolves.toBeUndefined();

      expect(fetch).not.toHaveBeenCalledWith('https://api.indexnow.org/indexnow', expect.anything());
      expect(status.show).toHaveBeenCalledWith(expect.objectContaining({ summary: expect.stringContaining('could not be sent') }));
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('retries a rate-limited IndexNow submission without failing the deployment', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), candidatePages);

    let submissionAttempts = 0;
    const fetch = vi.fn(async (input) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex);
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(productionPages);
      if (url === 'https://api.indexnow.org/indexnow') {
        submissionAttempts += 1;
        return new Response(null, { status: submissionAttempts === 1 ? 429 : 200 });
      }

      throw new Error(`Unexpected request: ${url}`);
    });
    const status = { show: vi.fn() };
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status } };

      await indexNowPlugin.onPreBuild(event);
      await expect(indexNowPlugin.onSuccess(event)).resolves.toBeUndefined();

      expect(submissionAttempts).toBe(2);
      expect(status.show).not.toHaveBeenCalledWith(
        expect.objectContaining({ summary: expect.stringContaining('not accepted') })
      );
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('splits more than 10,000 changed URLs into separate IndexNow submissions', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    const urlList = Array.from({ length: 10_001 }, (_, index) => `${siteUrl}/blog/article-${index}/`);
    const manyCandidatePages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlList.map((url) => `  <url><loc>${url}</loc><lastmod>2026-08-15T00:00:00.000Z</lastmod></url>`).join('\n')}
</urlset>`;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), manyCandidatePages);

    const submissions = [];
    const fetch = vi.fn(async (input, init) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex.replace(productionPages, emptyCandidatePages));
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(emptyCandidatePages);
      if (url === 'https://api.indexnow.org/indexnow') {
        submissions.push(JSON.parse(init.body));
        return new Response(null, { status: 200 });
      }

      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status: { show: vi.fn() } } };

      await indexNowPlugin.onPreBuild(event);
      await indexNowPlugin.onSuccess(event);

      expect(submissions.map((submission) => submission.urlList)).toEqual([urlList.slice(0, 10_000), urlList.slice(10_000)]);
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('accepts a pending IndexNow response', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), candidatePages);

    const fetch = vi.fn(async (input) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex);
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(productionPages);
      if (url === 'https://api.indexnow.org/indexnow') return new Response(null, { status: 202 });

      throw new Error(`Unexpected request: ${url}`);
    });
    const status = { show: vi.fn() };
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status } };

      await indexNowPlugin.onPreBuild(event);
      await expect(indexNowPlugin.onSuccess(event)).resolves.toBeUndefined();

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(status.show).not.toHaveBeenCalled();
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('retries a network failure and accepts the later IndexNow response', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), candidatePages);

    let submissionAttempts = 0;
    const fetch = vi.fn(async (input) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex);
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(productionPages);
      if (url === 'https://api.indexnow.org/indexnow') {
        submissionAttempts += 1;
        if (submissionAttempts === 1) throw new Error('network unavailable');
        return new Response(null, { status: 202 });
      }

      throw new Error(`Unexpected request: ${url}`);
    });
    const status = { show: vi.fn() };
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status } };

      await indexNowPlugin.onPreBuild(event);
      await expect(indexNowPlugin.onSuccess(event)).resolves.toBeUndefined();

      expect(submissionAttempts).toBe(2);
      expect(status.show).not.toHaveBeenCalled();
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('retries a temporary server error and accepts the later IndexNow response', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), candidatePages);

    let submissionAttempts = 0;
    const fetch = vi.fn(async (input) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex);
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(productionPages);
      if (url === 'https://api.indexnow.org/indexnow') {
        submissionAttempts += 1;
        return new Response(null, { status: submissionAttempts === 1 ? 503 : 200 });
      }

      throw new Error(`Unexpected request: ${url}`);
    });
    const status = { show: vi.fn() };
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status } };

      await indexNowPlugin.onPreBuild(event);
      await expect(indexNowPlugin.onSuccess(event)).resolves.toBeUndefined();

      expect(submissionAttempts).toBe(2);
      expect(status.show).not.toHaveBeenCalled();
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('logs a permanent submission error once without exposing the key', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), candidatePages);

    let submissionAttempts = 0;
    const fetch = vi.fn(async (input) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex);
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(productionPages);
      if (url === 'https://api.indexnow.org/indexnow') {
        submissionAttempts += 1;
        return new Response(null, { status: 403 });
      }

      throw new Error(`Unexpected request: ${url}`);
    });
    const status = { show: vi.fn() };
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status } };

      await indexNowPlugin.onPreBuild(event);
      await expect(indexNowPlugin.onSuccess(event)).resolves.toBeUndefined();

      expect(submissionAttempts).toBe(1);
      const summaries = status.show.mock.calls.map(([entry]) => entry.summary).join('\n');
      expect(summaries).toContain('HTTP 403');
      expect(summaries).not.toContain(key);
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('logs an exhausted temporary failure without failing the deployment', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;
    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), candidatePages);

    let submissionAttempts = 0;
    const fetch = vi.fn(async (input) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex);
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(productionPages);
      if (url === 'https://api.indexnow.org/indexnow') {
        submissionAttempts += 1;
        return new Response(null, { status: 503 });
      }

      throw new Error(`Unexpected request: ${url}`);
    });
    const status = { show: vi.fn() };
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status } };

      await indexNowPlugin.onPreBuild(event);
      await expect(indexNowPlugin.onSuccess(event)).resolves.toBeUndefined();

      expect(submissionAttempts).toBe(3);
      expect(status.show).toHaveBeenCalledWith(
        expect.objectContaining({ summary: expect.stringContaining('after 3 attempts') })
      );
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });

  it('sends a newly deployed public URL once the static verification file is present', async () => {
    const publishDir = await mkdtemp(join(tmpdir(), 'tgb-indexnow-'));
    process.env.CONTEXT = 'production';
    process.env.INDEXNOW_KEY = key;

    await writeFile(join(publishDir, 'sitemap_index.xml'), candidateIndex);
    await writeFile(join(publishDir, 'page-sitemap.xml'), candidatePages);

    const fetch = vi.fn(async (input, init) => {
      const url = String(input);

      if (url === `${siteUrl}/sitemap_index.xml`) return new Response(productionIndex);
      if (url === `${siteUrl}/page-sitemap.xml`) return new Response(productionPages);
      if (url === 'https://api.indexnow.org/indexnow') return new Response(null, { status: 200 });

      throw new Error(`Unexpected request: ${url} ${init?.method ?? 'GET'}`);
    });
    vi.stubGlobal('fetch', fetch);

    try {
      const event = { constants: { PUBLISH_DIR: publishDir }, utils: { status: { show: vi.fn() } } };

      await indexNowPlugin.onPreBuild(event);
      await indexNowPlugin.onSuccess(event);

      expect(fetch).toHaveBeenLastCalledWith(
        'https://api.indexnow.org/indexnow',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            host: 'tahitiguestboat.com',
            key,
            keyLocation: `${siteUrl}/${key}.txt`,
            urlList: [`${siteUrl}/blog/croisiere-privee/`],
          }),
        })
      );
    } finally {
      await rm(publishDir, { recursive: true, force: true });
    }
  });
});
