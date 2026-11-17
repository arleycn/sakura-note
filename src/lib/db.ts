import { env } from 'cloudflare:workers';

/**
 * Cloudflare 绑定统一出口。
 * 类型来自 `wrangler types` 生成的 worker-configuration.d.ts，
 * 改了 wrangler.jsonc 之后要重跑 `npm run cf-typegen`。
 */
export const bindings = env;

export type CommentRow = {
  id: string;
  post_id: string;
  author: string;
  body: string;
  image_key: string | null;
  created_at: number;
};

export type PublicComment = {
  id: string;
  author: string;
  body: string;
  imageUrl: string | null;
  createdAt: number;
};

const MAX_COMMENTS = 50;

export async function listComments(postId: string): Promise<PublicComment[]> {
  if (!env.DB) return [];

  const { results } = await env.DB.prepare(
    `SELECT id, post_id, author, body, image_key, created_at
       FROM comments
      WHERE post_id = ?
      ORDER BY created_at DESC
      LIMIT ?`,
  )
    .bind(postId, MAX_COMMENTS)
    .all<CommentRow>();

  return (results ?? []).map((row) => ({
    id: row.id,
    author: row.author,
    body: row.body,
    imageUrl: row.image_key ? `/media/${row.image_key}` : null,
    createdAt: row.created_at,
  }));
}

export async function insertComment(input: {
  postId: string;
  author: string;
  body: string;
  imageKey: string | null;
}): Promise<PublicComment> {
  const row: CommentRow = {
    id: crypto.randomUUID(),
    post_id: input.postId,
    author: input.author,
    body: input.body,
    image_key: input.imageKey,
    created_at: Date.now(),
  };

  await env.DB.prepare(
    `INSERT INTO comments (id, post_id, author, body, image_key, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(row.id, row.post_id, row.author, row.body, row.image_key, row.created_at)
    .run();

  return {
    id: row.id,
    author: row.author,
    body: row.body,
    imageUrl: row.image_key ? `/media/${row.image_key}` : null,
    createdAt: row.created_at,
  };
}

const VIEWS_TTL = 60 * 60 * 24 * 30; // 30 天没访问就归零，避免冷门文章永久占 key

export async function readViews(postIds: string[]): Promise<Record<string, number>> {
  if (!env.VIEWS || postIds.length === 0) return {};

  const entries = await Promise.all(
    postIds.map(async (id) => {
      const value = await env.VIEWS.get(`views:${id}`);
      return [id, Number(value ?? 0) || 0] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export async function bumpViews(postId: string): Promise<number> {
  if (!env.VIEWS) return 0;

  const key = `views:${postId}`;
  const current = Number((await env.VIEWS.get(key)) ?? 0) || 0;
  const next = current + 1;
  await env.VIEWS.put(key, String(next), { expirationTtl: VIEWS_TTL });
  return next;
}
