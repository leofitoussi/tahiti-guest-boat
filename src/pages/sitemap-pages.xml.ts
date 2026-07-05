import type { APIRoute } from 'astro';
import { getSitemapGroups } from '../lib/sitemap-content';
import { buildUrlsetXml } from '../lib/seo-sitemap';

export const GET: APIRoute = async ({ site }) => {
  const groups = await getSitemapGroups();
  const xml = buildUrlsetXml(site ?? 'https://tahitiguestboat.com', groups.pages.urls);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
