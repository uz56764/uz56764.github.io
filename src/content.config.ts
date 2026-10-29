import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { categoryNames } from './lib/categories';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(categoryNames),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    language: z.enum(['en', 'ko']).default('ko'),
    /** Minutes; estimated from the body when omitted. */
    readingTime: z.number().positive().optional(),
    /** Markdown dialect of a post brought over from another platform; only
        affects rendering compatibility (see src/lib/markdown/). */
    importedFrom: z.enum(['velog']).optional(),
    cover: image().optional(),
    coverAlt: z.string().optional(),
  }),
});

export const collections = { posts };
