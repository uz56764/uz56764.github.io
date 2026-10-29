import type { APIRoute } from 'astro';
import { getPosts, searchEntry } from '../lib/posts';

// Fetched when search opens, so article bodies stay out of the initial page load.
export const GET: APIRoute = async () => {
  const entries = (await getPosts()).map(searchEntry);
  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
