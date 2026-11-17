---
title: 评论与阅读量是怎么实现的
description: 用官方 Actions 做类型安全 RPC，D1 存评论、KV 计数、R2 存配图，外加限流与去重。
pubDate: 2026-11-13
tags: ['Astro', 'Cloudflare', 'D1', 'KV']
categories: ['原理']
emoji: '💌'
---

评论和阅读量是全站唯一需要服务端状态的地方。这里没有一行手写的 `fetch`，全部走 Astro 官方的 Actions。

## 为什么用 Actions

官方推荐的做法是把服务端逻辑写成 action，前端直接 `import { actions } from 'astro:actions'` 调用。类型从服务端定义一路带到调用方，参数写错在编辑器里就报错。

```ts
// src/actions/index.ts
export const server = {
  comments: {
    add: defineAction({
      accept: 'form',
      input: z.object({
        postId: z.string().regex(/^[\w-]+$/),
        author: z.string().min(1).max(24),
        body: z.string().min(1).max(600),
      }),
      handler: async (input, context) => {
        const db = env.DB;
        // 限流、蜜罐、Turnstile 校验……
        const row = await insertComment(db, input);
        return { comment: row };
      },
    }),
  },
};
```

前端：

```ts
const { data, error } = await actions.comments.add(formData);
if (isInputError(error)) {
  // 官方提供的判别函数，不用自己比对错误码
}
```

## 三种存储各管什么

| 数据 | 存哪 | 为什么 |
|---|---|---|
| 评论正文 | D1 | 要按文章查、要排序、要能加索引 |
| 浏览计数 | KV | 高频自增、允许最终一致、读多写多 |
| 评论配图 | R2 | 二进制，别塞进数据库 |

配图不直接公开 R2 桶，而是走 `/media/[...key]` 这个路由，由 Worker 校验后流式返回。

## 两个容易被忽略的细节

**浏览去重靠 Cookie，不靠 IP。** 同一篇文一天只计一次，用一个 `HttpOnly` 的会话 Cookie 标记。IP 会变、会共享，用它去重既不准也不礼貌。

**限流用 KV 的时间窗。** 同一来源在 60 秒内最多发一条评论，键是哈希后的来源标识，不存原始 IP。

## 不配密钥也能跑

Turnstile 是可选能力：`.dev.vars` 里没有 `TURNSTILE_SECRET_KEY` 时，服务端跳过校验但保留限流和蜜罐。这样本地开发不用先去申请密钥。

```bash
# .dev.vars（从 .dev.vars.example 复制）
TURNSTILE_SECRET_KEY=你的密钥
PUBLIC_TURNSTILE_SITE_KEY=你的站点 key
```

上生产时把这两项加到 Worker 的 secret 里，前端才会出现人机验证。
