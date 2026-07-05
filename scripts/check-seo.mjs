import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SaxesParser } from 'saxes';

const DEFAULT_SITE_URL = 'https://tahiti-guest-boat.com';

export class SeoCheckError extends Error {
  constructor(messages) {
    super(`SEO checks failed:\n${messages.map((message) => `- ${message}`).join('\n')}`);
    this.name = 'SeoCheckError';
    this.messages = messages;
  }
}

export async function checkSeoBuild(options = {}) {
  const distDir = options.distDir ?? 'dist';
  const siteUrl = normalizeSiteUrl(options.siteUrl ?? process.env.PUBLIC_SITE_URL ?? DEFAULT_SITE_URL);
  const errors = [];
  const server = await startStaticServer(distDir);

  try {
    const baseUrl = `http://127.0.0.1:${server.port}`;
    const sitemapIndexUrl = new URL('/sitemap-index.xml', siteUrl).toString();
    const robotsUrl = new URL('/robots.txt', baseUrl).toString();

    const [sitemapIndexResponse, robotsResponse] = await Promise.all([
      fetchLocalUrl(sitemapIndexUrl, baseUrl, errors),
      fetch(robotsUrl, { redirect: 'manual' }),
    ]);

    if (!sitemapIndexResponse) {
      throwIfErrors(errors);
      return { checkedUrls: 0 };
    }

    const sitemapIndexXml = await sitemapIndexResponse.text();
    const sitemapIndex = parseXml(sitemapIndexXml, 'sitemap-index.xml', errors);
    const sitemapUrls = sitemapIndex.locs;

    if (robotsResponse.status !== 200) {
      errors.push(`robots.txt returned HTTP ${robotsResponse.status}`);
    } else {
      const robots = await robotsResponse.text();
      const expectedSitemapLine = `Sitemap: ${sitemapIndexUrl}`;
      if (!robots.includes(expectedSitemapLine)) {
        errors.push(`robots.txt must include "${expectedSitemapLine}"`);
      }
    }

    const pageUrls = [];
    for (const sitemapUrl of sitemapUrls) {
      const response = await fetchLocalUrl(sitemapUrl, baseUrl, errors);
      if (!response) continue;

      const xml = await response.text();
      const sitemap = parseXml(xml, new URL(sitemapUrl).pathname, errors);
      pageUrls.push(...sitemap.locs);
    }

    checkDuplicateUrls(pageUrls, errors);

    for (const pageUrl of pageUrls) {
      const response = await fetchLocalUrl(pageUrl, baseUrl, errors);
      if (!response) continue;

      const html = await response.text();
      checkCanonical(pageUrl, html, errors);
      checkMetaRobots(pageUrl, html, errors);
    }

    throwIfErrors(errors);
    return { checkedUrls: pageUrls.length };
  } finally {
    await server.close();
  }
}

function normalizeSiteUrl(value) {
  const url = new URL(value);
  url.pathname = '/';
  url.search = '';
  url.hash = '';
  return url;
}

async function fetchLocalUrl(publicUrl, baseUrl, errors) {
  let url;

  try {
    url = new URL(publicUrl);
  } catch {
    errors.push(`Invalid absolute URL in sitemap: ${publicUrl}`);
    return null;
  }

  if (!/^https?:$/.test(url.protocol)) {
    errors.push(`Sitemap URL must be HTTP(S): ${publicUrl}`);
    return null;
  }

  const localUrl = new URL(`${url.pathname}${url.search}`, baseUrl).toString();
  const response = await fetch(localUrl, { redirect: 'manual' });

  if (response.status >= 300 && response.status < 400) {
    errors.push(`${publicUrl} redirects with HTTP ${response.status}`);
    return null;
  }

  if (response.status !== 200) {
    errors.push(`${publicUrl} returned HTTP ${response.status}`);
    return null;
  }

  return response;
}

function parseXml(xml, label, errors) {
  const locs = [];
  const stack = [];
  let text = '';
  let root = '';
  const parser = new SaxesParser();

  parser.on('opentag', (tag) => {
    root ||= tag.name;
    stack.push(tag.name);
    text = '';
  });
  parser.on('text', (value) => {
    text += value;
  });
  parser.on('cdata', (value) => {
    text += value;
  });
  parser.on('closetag', (tag) => {
    if (tag.name === 'loc') {
      locs.push(text.trim());
    }
    stack.pop();
    text = '';
  });
  parser.on('error', (error) => {
    errors.push(`${label} is not valid XML: ${error.message}`);
    parser.close();
  });

  try {
    parser.write(xml).close();
  } catch (error) {
    errors.push(`${label} is not valid XML: ${error.message}`);
  }

  if (!root) {
    errors.push(`${label} is empty or missing a root XML element`);
  }

  return { root, locs };
}

function checkDuplicateUrls(urls, errors) {
  const seen = new Set();
  const duplicates = new Set();

  for (const url of urls) {
    if (seen.has(url)) {
      duplicates.add(url);
    }
    seen.add(url);
  }

  for (const duplicate of duplicates) {
    errors.push(`Duplicate sitemap URL: ${duplicate}`);
  }
}

function checkCanonical(pageUrl, html, errors) {
  const canonicalTag = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i)?.[0];
  const canonicalHref = canonicalTag?.match(/\bhref=["']([^"']+)["']/i)?.[1];

  if (!canonicalHref) {
    errors.push(`${pageUrl} is missing <link rel="canonical">`);
    return;
  }

  try {
    const canonicalUrl = new URL(canonicalHref);
    if (!/^https?:$/.test(canonicalUrl.protocol)) {
      errors.push(`${pageUrl} canonical must be absolute HTTP(S): ${canonicalHref}`);
    }
  } catch {
    errors.push(`${pageUrl} canonical must be absolute: ${canonicalHref}`);
  }
}

function checkMetaRobots(pageUrl, html, errors) {
  const robotsTag = html.match(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i)?.[0];
  const robotsContent = robotsTag?.match(/\bcontent=["']([^"']+)["']/i)?.[1];

  if (!robotsContent) {
    errors.push(`${pageUrl} is missing <meta name="robots" content="index,follow">`);
    return;
  }

  if (robotsContent.toLowerCase().replaceAll(/\s+/g, '') !== 'index,follow') {
    errors.push(`${pageUrl} must be index,follow but has "${robotsContent}"`);
  }
}

async function startStaticServer(distDir) {
  const root = resolve(distDir);
  const server = createServer(async (request, response) => {
    if (!request.url) {
      response.writeHead(400).end('Bad request');
      return;
    }

    const requestUrl = new URL(request.url, 'http://127.0.0.1');
    const filePath = await resolveStaticPath(root, requestUrl.pathname);

    if (!filePath) {
      response.writeHead(404).end('Not found');
      return;
    }

    const body = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentType(filePath) });
    response.end(body);
  });

  await new Promise((resolveListen) => {
    server.listen(0, '127.0.0.1', resolveListen);
  });

  return {
    port: server.address().port,
    close: () =>
      new Promise((resolveClose, rejectClose) => {
        server.close((error) => (error ? rejectClose(error) : resolveClose()));
      }),
  };
}

async function resolveStaticPath(root, pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath.replace(/^\/+/, '') || 'index.html';
  let filePath = resolve(root, relativePath);

  if (!isInsideRoot(root, filePath)) {
    return null;
  }

  try {
    const currentStat = await stat(filePath);
    if (currentStat.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
  } catch {
    if (!extname(filePath)) {
      filePath = join(filePath, 'index.html');
    }
  }

  if (!isInsideRoot(root, filePath)) {
    return null;
  }

  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile() ? filePath : null;
  } catch {
    return null;
  }
}

function isInsideRoot(root, filePath) {
  const normalizedRoot = root.endsWith(sep) ? root : `${root}${sep}`;
  return filePath === root || filePath.startsWith(normalizedRoot);
}

function contentType(filePath) {
  const extension = extname(filePath);

  if (extension === '.xml') return 'application/xml; charset=utf-8';
  if (extension === '.txt') return 'text/plain; charset=utf-8';
  if (extension === '.html') return 'text/html; charset=utf-8';
  return 'application/octet-stream';
}

function throwIfErrors(errors) {
  if (errors.length > 0) {
    throw new SeoCheckError(errors);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkSeoBuild()
    .then((report) => {
      console.log(`SEO checks passed for ${report.checkedUrls} sitemap URL(s).`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
