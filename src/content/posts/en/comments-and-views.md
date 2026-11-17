---
title: How comments and view counts work
description: Type-safe RPC with official Actions, D1 for comments, KV for counters, R2 for images — plus rate limiting and dedupe.
pubDate: 2026-11-13
tags: ['Astro', 'Cloudflare', 'D1', 'KV']
categories: ['Internals']
emoji: '💌'
---

Comments and view counts are the only parts of the site that need server state. There is not a single hand-written `fetch` — everything goes through Astro's official Actions.

## Why Actions

The official approach is to define server logic as an action and call it from the client via `import { actions } from 'astro:actions'`. Types travel from the server definition to the call site, so a wrong argument fails in your editor.

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
        // rate limit, honeypot, Turnstile...
        const row = await insertComment(db, input);
        return { comment: row };
      },
    }),
  },
};
```

On the client:

```ts
const { data, error } = await actions.comments.add(formData);
if (isInputError(error)) {
  // official helper, no manual error-code matching
}
```

## What each store is for

| Data | Store | Why |
|---|---|---|
| Comment bodies | D1 | Query by post, sort, index |
| View counters | KV | High-frequency increments, eventual consistency is fine |
| Comment images | R2 | Binary data does not belong in a database |

Images are not exposed from the public R2 bucket directly. A `/media/[...key]` route validates and streams them.

## Two details that are easy to miss

**View dedupe uses a cookie, not an IP.** One view per post per day, tracked with an `HttpOnly` session cookie. IPs change and are shared — using them is both inaccurate and impolite.

**Rate limiting uses a KV time window.** One comment per source per 60 seconds, keyed by a hash of the source identifier, never the raw IP.

## It runs without keys

Turnstile is optional: if `TURNSTILE_SECRET_KEY` is missing from `.dev.vars`, the server skips verification but keeps rate limiting and the honeypot. That means local development needs no signup.

```bash
# .dev.vars (copy from .dev.vars.example)
TURNSTILE_SECRET_KEY=your-key
PUBLIC_TURNSTILE_SITE_KEY=your-site-key
```

Add both as Worker secrets in production and the widget appears on the client.
