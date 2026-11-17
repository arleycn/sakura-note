---
title: Deploying to Cloudflare, zero to live
description: Create the D1 / KV / R2 resources, wire them into wrangler, run migrations, deploy — and how to roll back.
pubDate: 2026-11-12
tags: ['Cloudflare', 'Deployment']
categories: ['Guides']
emoji: '🚀'
---

Static pages are served straight from Workers Static Assets at the edge and consume no Worker invocations; only dynamic requests like comments and view counts reach the Worker. The whole site fits inside the free tier.

## 1. Create three resources

```bash
npx wrangler login

npx wrangler d1 create sakura-note-db        # note the database_id
npx wrangler kv namespace create VIEWS       # note the id
npx wrangler r2 bucket create sakura-note-media
```

## 2. Put the ids into the config

Two placeholders in `wrangler.jsonc` need the ids from the previous step:

```jsonc
{
  "d1_databases": [
    { "binding": "DB", "database_name": "sakura-note-db", "database_id": "<replace>" }
  ],
  "kv_namespaces": [
    { "binding": "VIEWS", "id": "<replace>" }
  ],
  "r2_buckets": [
    { "binding": "MEDIA", "bucket_name": "sakura-note-media" }
  ]
}
```

## 3. Run migrations

```bash
npx wrangler d1 migrations apply sakura-note-db --remote
```

Migration files in `migrations/` run in numeric order; already-applied ones are not re-run.

## 4. Build and deploy

```bash
npm run check
npm run build
npx wrangler deploy
```

> With a system proxy enabled, wrangler may fail with `auth token expired`. Clear the proxy variables first:
> `env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy npx wrangler deploy`

## 5. Verify

Do not stop at the home page. Check all of these:

| Check | Expected |
|---|---|
| `/` and `/en` | 200, styles intact |
| Any post page | 200, highlighting works, TOC appears |
| `/search?q=astro` | 200 — **not 404** |
| Submit a comment | Appears in the list, still there after reload |
| Reload a post twice | View count only +1 |
| `/media/missing.png` | 404, not 500 |

The search check is the one that bites. Workers Static Assets matches navigation requests against static files first; a miss returns the 404 page and the Worker never runs. Fix it by whitelisting dynamic routes in `wrangler.jsonc`:

```jsonc
"assets": {
  "run_worker_first": ["/search", "/media/*", "/_actions/*"]
}
```

## 6. Rolling back

```bash
npx wrangler deployments list
npx wrangler rollback <deployment-id>
```

Rollback reverts code, not the database. For changes that involve migrations, ship "add the column" and "use the column" as two separate releases.
