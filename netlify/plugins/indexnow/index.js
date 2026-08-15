import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SaxesParser } from 'saxes';

const SITE_URL = 'https://tahitiguestboat.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_SUBMISSION_ATTEMPTS = 3;
const RETRY_DELAY_MS = 100;
const MAX_URLS_PER_SUBMISSION = 10_000;

let productionUrls;

export default {
  async onPreBuild({ utils }) {
    if (!isProduction()) return;

    const key = process.env.INDEXNOW_KEY;
    if (!key) {
      warn(utils, 'IndexNow is disabled because INDEXNOW_KEY is not configured.');
      return;
    }

    try {
      productionUrls = await readProductionUrls();
    } catch (error) {
      productionUrls = undefined;
      warn(utils, `IndexNow is disabled because the production sitemap could not be read: ${error.message}`);
    }
  },

  async onSuccess({ constants, utils }) {
    if (!isProduction() || !process.env.INDEXNOW_KEY || !productionUrls) return;

    try {
      const candidateUrls = await readCandidateUrls(constants.PUBLISH_DIR);
      const urlList = changedUrls(productionUrls, candidateUrls);

      if (urlList.length === 0) return;

      for (const urlBatch of urlBatches(urlList)) {
        await submitUrls(urlBatch, process.env.INDEXNOW_KEY, utils);
      }
    } catch (error) {
      warn(utils, `IndexNow notification could not be sent: ${error.message}`);
    }
  },
};

function isProduction() {
  return process.env.CONTEXT === 'production';
}

async function readProductionUrls() {
  const indexResponse = await fetch(`${SITE_URL}/sitemap_index.xml`);
  if (!indexResponse.ok) throw new Error(`sitemap_index.xml returned HTTP ${indexResponse.status}`);

  const sitemapUrls = sitemapLocations(await indexResponse.text());
  const sitemapContents = await Promise.all(
    sitemapUrls.map(async (sitemapUrl) => {
      const response = await fetch(sitemapUrl);
      if (!response.ok) throw new Error(`${sitemapUrl} returned HTTP ${response.status}`);
      return response.text();
    })
  );

  return new Map(sitemapContents.flatMap(urlEntries));
}

async function readCandidateUrls(publishDir) {
  const index = await readFile(join(publishDir, 'sitemap_index.xml'), 'utf8');
  const sitemapUrls = sitemapLocations(index);
  const sitemapContents = await Promise.all(
    sitemapUrls.map((sitemapUrl) => readFile(join(publishDir, new URL(sitemapUrl).pathname), 'utf8'))
  );

  return new Map(sitemapContents.flatMap(urlEntries));
}

function sitemapLocations(xml) {
  assertSitemapXml(xml, 'sitemapindex');
  return [...xml.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function urlEntries(xml) {
  assertSitemapXml(xml, 'urlset');
  return [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)].map((match) => [match[1], match[2]]);
}

function changedUrls(productionUrls, candidateUrls) {
  const addedOrModifiedUrls = [...candidateUrls].flatMap(([url, lastmod]) =>
    productionUrls.get(url) === lastmod ? [] : [url]
  );
  const removedUrls = [...productionUrls.keys()].filter((url) => !candidateUrls.has(url));

  return [...addedOrModifiedUrls, ...removedUrls];
}

function* urlBatches(urlList) {
  for (let index = 0; index < urlList.length; index += MAX_URLS_PER_SUBMISSION) {
    yield urlList.slice(index, index + MAX_URLS_PER_SUBMISSION);
  }
}

async function submitUrls(urlList, key, utils) {
  for (let attempt = 0; attempt < MAX_SUBMISSION_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: new URL(SITE_URL).hostname,
          key,
          keyLocation: `${SITE_URL}/${key}.txt`,
          urlList,
        }),
      });

      if (response.status === 200 || response.status === 202) return;
      if (!isTemporaryStatus(response.status)) {
        warn(utils, `IndexNow submission was not accepted (HTTP ${response.status}).`);
        return;
      }

      if (attempt === MAX_SUBMISSION_ATTEMPTS - 1) {
        warn(utils, `IndexNow submission failed after ${MAX_SUBMISSION_ATTEMPTS} attempts (HTTP ${response.status}).`);
        return;
      }
    } catch (error) {
      if (attempt === MAX_SUBMISSION_ATTEMPTS - 1) {
        warn(utils, `IndexNow submission failed after ${MAX_SUBMISSION_ATTEMPTS} attempts: ${error.message}`);
        return;
      }
    }

    await wait(RETRY_DELAY_MS * 2 ** attempt);
  }
}

function isTemporaryStatus(status) {
  return status === 429 || status >= 500;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function assertSitemapXml(xml, expectedRoot) {
  let root = '';
  let parseError;
  const parser = new SaxesParser();

  parser.on('opentag', (tag) => {
    root ||= tag.name;
  });
  parser.on('error', (error) => {
    parseError = error;
  });

  try {
    parser.write(xml).close();
  } catch (error) {
    parseError ??= error;
  }

  if (parseError) throw new Error(`invalid XML: ${parseError.message}`);
  if (root !== expectedRoot) throw new Error(`expected ${expectedRoot} XML root but found ${root || 'none'}`);
}

function warn(utils, message) {
  utils?.status?.show?.({ title: 'IndexNow', summary: message });
  console.warn(message);
}
