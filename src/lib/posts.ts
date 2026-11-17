import { getCollection, type CollectionEntry } from 'astro:content';
import { PAGE_SIZE } from '../config';

export type Post = CollectionEntry<'posts'>;

/** 生产构建过滤草稿，开发环境保留，方便预览 */
export const isPublished = (post: Post) =>
  import.meta.env.PROD ? post.data.draft !== true : true;

/** 按发布时间倒序 */
export const byDateDesc = (a: Post, b: Post) =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.filter(isPublished).sort(byDateDesc);
}

export const postPath = (post: Post) => `/posts/${post.id}`;

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** 中文按 350 字/分钟估算，最少 1 分钟 */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const chars = body.replace(/\s+/g, '').length;
  return Math.max(1, Math.round(chars / 350));
}

export function tagCounts(posts: Post[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

export function paginate<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    current,
    totalPages,
  };
}
