import type { APIRoute } from 'astro';
import { getPosts, postUrl } from '../lib/posts';
import { absoluteUrl, site, url } from '../lib/site';

const escape = (value: string) => value.replace(/[<>&'"]/g, char => `&#${char.charCodeAt(0)};`);

export const GET: APIRoute = async ({ site: origin }) => {
  const posts = await getPosts();
  const items = posts.map(post => {
    const link = absoluteUrl(postUrl(post), origin);
    return `
    <item>
      <title>${escape(post.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <description>${escape(post.data.description)}</description>
      <category>${escape(post.data.category)}</category>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.name)}</title>
    <link>${absoluteUrl(url('articles/'), origin)}</link>
    <description>${escape(site.description)}</description>
    <language>en</language>
    <atom:link href="${absoluteUrl(url('rss.xml'), origin)}" rel="self" type="application/rss+xml" />${items.join('')}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
