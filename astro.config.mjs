import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import { withVelogQuotes } from './src/lib/markdown/velog-quotes.mjs';
import remarkImportedPost from './src/lib/markdown/remark-imported-post.mjs';
import rehypeHeadingAnchors from './src/lib/markdown/rehype-heading-anchors.mjs';
import rehypeCodeBlocks from './src/lib/markdown/rehype-code-blocks.mjs';
import rehypeTables from './src/lib/markdown/rehype-tables.mjs';
import { transformerDiffLines } from './src/lib/markdown/shiki-diff-lines.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://uz56764.github.io',
  base: process.env.PUBLIC_BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  server: {
    // Extra hosts for a preview behind a reverse proxy, comma-separated in .env.
    allowedHosts: env.PREVIEW_ALLOWED_HOSTS?.split(',') ?? [],
  },
  markdown: {
    processor: withVelogQuotes(unified({
      smartypants: false,
      remarkPlugins: [remarkImportedPost],
      // Heading ids are needed before the anchor plugin runs; Astro keeps existing ids.
      rehypePlugins: [rehypeHeadingIds, rehypeHeadingAnchors, rehypeCodeBlocks, rehypeTables],
    })),
    shikiConfig: {
      // Token colors are defined in src/styles/prose.css so code matches the palette.
      theme: 'css-variables',
      wrap: false,
      transformers: [transformerDiffLines()],
    },
  },
});
