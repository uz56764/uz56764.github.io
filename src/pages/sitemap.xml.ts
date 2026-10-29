import type { APIRoute } from 'astro';
import { getPosts, postUrl } from '../lib/posts';
import { absoluteUrl, url } from '../lib/site';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  const pages: { path: string; modified?: Date }[] = [
    { path: url() },
    { path: url('articles/') },
    ...posts.map(post => ({ path: postUrl(post), modified: post.data.updated ?? post.data.date })),
  ];
  const entries = pages.map(({ path, modified }) =>
    `  <url><loc>${absoluteUrl(path, site)}</loc>${modified ? `<lastmod>${modified.toISOString()}</lastmod>` : ''}</url>`,
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
