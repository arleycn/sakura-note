import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { env } from 'cloudflare:workers';
import { listComments, insertComment, readViews, bumpViews } from '../lib/db';
import { rateLimit, verifyTurnstile, clientIp, sha256 } from '../lib/security';

const postId = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[\w-]+$/, 'Post id may only contain letters, numbers, underscores and hyphens');

const nonEmpty = (min: number, max: number, label: string) =>
  z.preprocess(
    (value) => (value == null ? '' : value),
    z
      .string()
      .trim()
      .min(min, `${label}至少 ${min} 个字符`)
      .max(max, `${label}最多 ${max} 个字符`),
  );

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

/** 只留可见字符，去掉控制符，避免把终端转义序列写进数据库 */
function cleanText(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

export const server = {
  comments: {
    list: defineAction({
      input: z.object({ postId }),
      handler: async ({ postId: id }) => {
        return { comments: await listComments(id) };
      },
    }),

    /**
     * 评论提交。
     * 用 accept: 'form' 是为了直接吃 FormData（含配图文件），
     * 客户端通过 actions.comments.add(formData) 走官方 RPC。
     */
    add: defineAction({
      accept: 'form',
      input: z.object({
        postId,
        author: nonEmpty(1, 24, 'Name'),
        body: nonEmpty(2, 600, 'Comment'),
        // 蜜罐字段：正常用户永远看不到，填了就是脚本
        website: z.string().nullish(),
        'cf-turnstile-response': z.string().nullish(),
        image: z.instanceof(File).nullish(),
      }),
      handler: async (input, context) => {
        if (input.website) {
          // 静默成功，不给脚本任何反馈
          return { ok: true as const, comment: null };
        }

        const ip = clientIp(context.request);
        const identity = ip ? await sha256(ip) : 'unknown';

        const allowed = await rateLimit('comment-10m', identity, 3, 10 * 60);
        const daily = await rateLimit('comment-1d', identity, 30, 24 * 60 * 60);
        if (!allowed || !daily) {
          throw new ActionError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many comments in a short time. Please try again later.',
          });
        }

        const passed = await verifyTurnstile(
          input['cf-turnstile-response'],
          ip,
        );
        if (!passed) {
          throw new ActionError({
            code: 'FORBIDDEN',
            message: 'Verification failed. Refresh the page and try again.',
          });
        }

        let imageKey: string | null = null;
        const file = input.image;
        if (file && file.size > 0) {
          const ext = ALLOWED_IMAGE_TYPES.get(file.type);
          if (!ext) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'Only PNG, JPEG, WebP and GIF images are supported.',
            });
          }
          if (file.size > MAX_IMAGE_BYTES) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'The image must be 2MB or smaller.',
            });
          }
          if (!env.MEDIA) {
            throw new ActionError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Image storage is not configured. Please post without an image.',
            });
          }

          imageKey = `comments/${crypto.randomUUID()}.${ext}`;
          await env.MEDIA.put(imageKey, file.stream(), {
            httpMetadata: {
              contentType: file.type,
              cacheControl: 'public, max-age=31536000, immutable',
            },
          });
        }

        const comment = await insertComment({
          postId: input.postId,
          author: cleanText(input.author),
          body: cleanText(input.body),
          imageKey,
        });

        return { ok: true as const, comment };
      },
    }),
  },

  views: {
    /** 批量读计数，列表页一次拿完，避免 N 次往返 */
    get: defineAction({
      input: z.object({ postIds: z.array(postId).max(24) }),
      handler: async ({ postIds }) => ({ views: await readViews(postIds) }),
    }),

    /**
     * 记一次阅读。
     * 同一浏览器 6 小时内只记一次（cookie 去重），刷新不刷量。
     */
    hit: defineAction({
      input: z.object({ postId }),
      handler: async ({ postId: id }, context) => {
        const cookieName = `seen_${(await sha256(id)).slice(0, 12)}`;
        const seen = context.cookies.get(cookieName)?.value === '1';

        if (seen) {
          const views = await readViews([id]);
          return { views: views[id] ?? 0, counted: false as const };
        }

        const total = await bumpViews(id);
        context.cookies.set(cookieName, '1', {
          path: '/',
          maxAge: 60 * 60 * 6,
          httpOnly: true,
          sameSite: 'lax',
          secure: context.url.protocol === 'https:',
        });

        return { views: total, counted: true as const };
      },
    }),
  },
};
