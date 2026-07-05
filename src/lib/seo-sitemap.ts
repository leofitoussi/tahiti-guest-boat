export interface SitemapReference {
  path: string;
  lastmod?: string;
}

export interface SitemapUrl {
  path: string;
  lastmod: string;
}

export interface SitemapContentDocument {
  path?: string;
  _updatedAt?: string;
  publishedAt?: string;
  _createdAt?: string;
  seo?: {
    indexable?: boolean;
  };
}

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';

export function buildSitemapIndexXml(siteUrl: string | URL, sitemaps: SitemapReference[]) {
  const entries = sitemaps
    .map((sitemap) => {
      const lastmod = sitemap.lastmod
        ? `
    <lastmod>${escapeXml(formatSitemapDate(sitemap.lastmod))}</lastmod>`
        : '';

      return `  <sitemap>
    <loc>${escapeXml(buildAbsoluteUrl(siteUrl, sitemap.path))}</loc>${lastmod}
  </sitemap>`;
    })
    .join('\n');

  return `${XML_DECLARATION}
<sitemapindex xmlns="${SITEMAP_NS}">
${entries}
</sitemapindex>
`;
}

export function buildUrlsetXml(siteUrl: string | URL, urls: SitemapUrl[]) {
  const entries = urls
    .map(
      (url) => `  <url>
    <loc>${escapeXml(buildAbsoluteUrl(siteUrl, url.path))}</loc>
    <lastmod>${escapeXml(formatSitemapDate(url.lastmod))}</lastmod>
  </url>`
    )
    .join('\n');

  return `${XML_DECLARATION}
<urlset xmlns="${SITEMAP_NS}">
${entries}
</urlset>
`;
}

export function buildRobotsTxt(siteUrl: string | URL) {
  return `User-agent: *
Allow: /

Sitemap: ${buildAbsoluteUrl(siteUrl, '/sitemap-index.xml')}
`;
}

export function buildAbsoluteUrl(siteUrl: string | URL, path: string) {
  return new URL(path, normalizeSiteUrl(siteUrl)).toString();
}

export function toSitemapUrls(documents: SitemapContentDocument[]) {
  return documents.flatMap((document) => {
    if (!document.path || document.seo?.indexable !== true) {
      return [];
    }

    return [
      {
        path: document.path,
        lastmod: resolveLastmod(document),
      },
    ];
  });
}

export function resolveLastmod(document: SitemapContentDocument) {
  const lastmod = document._updatedAt ?? document.publishedAt ?? document._createdAt;

  if (!lastmod) {
    throw new Error(`Missing sitemap lastmod for ${document.path ?? 'unknown URL'}`);
  }

  return formatSitemapDate(lastmod);
}

export function formatSitemapDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid sitemap lastmod date: ${value}`);
  }

  return date.toISOString();
}

function normalizeSiteUrl(siteUrl: string | URL) {
  const url = new URL(siteUrl.toString());
  url.pathname = '/';
  url.search = '';
  url.hash = '';
  return url;
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
