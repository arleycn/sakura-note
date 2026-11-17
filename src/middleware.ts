import { defineMiddleware } from 'astro:middleware';

/**
 * 只对 Worker 处理的响应生效（静态资产走 ASSETS，不经过这里）。
 * 安全头的静态部分在 public/_headers 里，两边保持一致。
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()',
  );

  return response;
});
