import { getCollection, type CollectionEntry } from 'astro:content';
import { categories } from './categories';
import { isContentsList } from './markdown/remark-imported-post.mjs';
import { displayTitle, formatDate, url } from './site';

export type Post = CollectionEntry<'posts'>;

/** Published posts, newest first. Drafts are visible in `astro dev` only. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postUrl = (post: Post) => url(`article/${post.id}/`);

export const categorySlug = (post: Post) => categories[post.data.category].slug;

const fence = /^[\t >]*(`{3,})[^\n]*\n([\s\S]*?)^[\t >]*\1[ \t]*$/gm;

function splitBody(markdown: string) {
  const code: string[] = [];
  const prose = markdown.replace(fence, (_match, _fence, block: string) => {
    if (!isContentsList(block)) code.push(block);
    return '\n';
  });
  return { prose, code: code.join('\n') };
}

const WORDS_PER_MINUTE = 230;
const CODE_LINES_PER_MINUTE = 60;

export function readingMinutes(post: Post) {
  if (post.data.readingTime) return post.data.readingTime;
  const { prose, code } = splitBody(post.body ?? '');
  const words = prose.match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu)?.length ?? 0;
  const codeLines = code.split('\n').filter(line => line.trim()).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE + codeLines / CODE_LINES_PER_MINUTE));
}

function plainText(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^[\t >]*#{1,6}\s+/gm, '')
    .replace(/^[\t >]*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/[`*\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export type SearchEntry = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
  href: string;
  /** Explanatory text, preferred for result excerpts. */
  prose: string;
  /** Code listings, so function and symbol names are searchable. */
  code: string;
};

export function searchEntry(post: Post): SearchEntry {
  const { prose, code } = splitBody(post.body ?? '');
  return {
    title: displayTitle(post.data.title),
    description: post.data.description,
    category: post.data.category,
    tags: post.data.tags,
    date: formatDate(post.data.date, 'short'),
    href: postUrl(post),
    prose: plainText(prose),
    code: code.replace(/\s+/g, ' ').trim(),
  };
}
