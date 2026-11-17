import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

/**
 * R2 对象代理。
 * 只暴露 comments/ 前缀，避免把桶里其他对象一并读出去；
 * 缓存一年 + immutable：对象名带 UUID，内容永不原地覆盖。
 */
export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const key = params.key ?? '';

  if (!key.startsWith('comments/') || key.includes('..')) {
    return new Response('Not found', { status: 404 });
  }

  if (!env.MEDIA) {
    return new Response('Storage not configured', { status: 503 });
  }

  const object = await env.MEDIA.get(key);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Content-Type-Options', 'nosniff');

  return new Response(object.body, { headers });
};
