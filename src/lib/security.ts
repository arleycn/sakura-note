import { env } from 'cloudflare:workers';
import { TURNSTILE_SECRET_KEY } from 'astro:env/server';

/** SHA-256 十六进制摘要，用于把 IP 变成不可逆的限流键 */
export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * KV 固定窗口限流。
 * KV 是最终一致的，极端并发下可能多放过一两次，
 * 这里的目的只是挡住脚本刷评论，不追求精确配额。
 */
export async function rateLimit(
  bucket: string,
  identity: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  if (!env.VIEWS) return true;

  const windowId = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `rl:${bucket}:${identity}:${windowId}`;
  const used = Number((await env.VIEWS.get(key)) ?? 0) || 0;

  if (used >= limit) return false;

  await env.VIEWS.put(key, String(used + 1), {
    expirationTtl: windowSeconds + 60,
  });
  return true;
}

type TurnstileResult = {
  success: boolean;
  'error-codes'?: string[];
};

/**
 * Turnstile 校验。
 * 没配 TURNSTILE_SECRET_KEY 时直接放行（本地开发 / 未接入阶段），
 * 线上配了密钥就必须通过。
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp: string | null,
): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  const form = new FormData();
  form.set('secret', TURNSTILE_SECRET_KEY);
  form.set('response', token);
  if (remoteIp) form.set('remoteip', remoteIp);

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: form },
  );

  if (!response.ok) return false;

  const result = (await response.json()) as TurnstileResult;
  return result.success === true;
}

export function clientIp(request: Request): string | null {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    null
  );
}
