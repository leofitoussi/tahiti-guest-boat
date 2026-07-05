import type { APIRoute } from 'astro';
import { buildRobotsTxt } from '../lib/seo-sitemap';

export const GET: APIRoute = ({ site }) => {
  return new Response(buildRobotsTxt(site ?? 'https://tahitiguestboat.com'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
