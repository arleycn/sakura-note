import { getCollection, type CollectionEntry } from 'astro:content';
import { PAGE_SIZE } from '../config';
import { localizePath, type Lang } from './i18n';

export type Post = CollectionEntry<'posts'>;

/** 文章放在 posts/zh 与 posts/en 两个目录里，id 形如 `zh/hello` */
export const langOf = (post: Post): Lang => (post.id.startsWith('en/') ? 'en' : 'zh');

/** 去掉语言目录前缀，剩下的才是 slug */
export const slugOf = (post: Post) => post.id.replace(/^(zh|en)\//, '');

/** 生产构建过滤草稿，开发环境保留，方便预览 */
export const isPublished = (post: Post) =>
  import.meta.env.PROD ? post.data.draft !== true : true;

/** 按发布时间倒序 */
export const byDateDesc = (a: Post, b: Post) =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

/** 取某语言下的全部已发布文章（倒序） */
export async function getPosts(lang: Lang = 'zh'): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.filter((post) => isPublished(post) && langOf(post) === lang).sort(byDateDesc);
}

/** 文章页地址，带语言前缀 */
export const postPath = (post: Post) => localizePath(langOf(post), `/posts/${slugOf(post)}`);

/** 标签页地址，带语言前缀 */
export const tagPath = (tag: string, lang: Lang) =>
  localizePath(lang, `/tags/${encodeURIComponent(tag)}`);

/** 长日期：中文 YYYY/MM/DD，英文 Nov 10, 2026 */
export function formatDate(date: Date, lang: Lang = 'zh'): string {
  if (lang === 'en') {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** 归档列表里的短日期：中文 11/10，英文 Nov 10 */
export function formatShort(date: Date, lang: Lang = 'zh'): string {
  if (lang === 'en') {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  }
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(date);
}

/** 阅读时长：中文按 350 字/分钟，英文按 200 词/分钟，最少 1 分钟 */
export function readingTime(body: string | undefined, lang: Lang = 'zh'): number {
  if (!body) return 1;
  if (lang === 'en') {
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }
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
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
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
