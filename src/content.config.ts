import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * 构建期内容集合（官方 glob loader）。
 * 文章的 id 来自文件名，路由统一走 /posts/<id>。
 */
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().max(120),
    description: z.string().max(300),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // 与旧站字段对齐：分类是大类（折腾 / 技术教程），标签是细粒度关键词
    categories: z.array(z.string()).default([]),
    // 列表卡片上的装饰符号，纯样式，不参与 SEO
    emoji: z.string().default('🌸'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
