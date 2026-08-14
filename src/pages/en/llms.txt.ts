import type { APIRoute } from 'astro';
import { getLlmsTxtContent } from '../../lib/llms-txt';

export const GET: APIRoute = async () => {
  return new Response(await getLlmsTxtContent('en'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
