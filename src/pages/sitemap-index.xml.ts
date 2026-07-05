import type { APIRoute } from 'astro';
import { getSitemapGroups, getSitemapReferences } from '../lib/sitemap-content';
import { buildSitemapIndexXml } from '../lib/seo-sitemap';

export const GET: APIRoute = async ({ site }) => {
  const groups = await getSitemapGroups();
  const xml = buildSitemapIndexXml(site ?? 'https://tahiti-guest-boat.com', getSitemapReferences(groups));

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
