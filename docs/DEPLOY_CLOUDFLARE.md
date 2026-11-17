# Deploy to Cloudflare

This theme uses Astro's official Cloudflare adapter. Prerendered pages are served from Workers Static Assets; only on-demand routes run in the Worker.

## 1. Create resources

Resource creation changes your Cloudflare account and may be billable. Run it deliberately, not as part of a blind copy/paste.

```bash
npx wrangler d1 create sakura-note-db
npx wrangler kv namespace create VIEWS
npx wrangler r2 bucket create sakura-note-media
```

Copy the returned `database_id` and KV namespace `id` into `wrangler.jsonc`.

The R2 binding uses `bucket_name`, so no ID is needed there. The Images binding is declared automatically through `images.binding`.

## 2. Apply the database migration

```bash
npx wrangler d1 migrations apply sakura-note-db --remote
```

The migration in `migrations/0001_init.sql` only creates the comments table and its indexes. It is additive and backward compatible.

## 3. Set variables

Build-time public variables:

```bash
PUBLIC_SITE_URL=https://your-domain.example
PUBLIC_TURNSTILE_SITE_KEY=<site key, optional>
```

`PUBLIC_SITE_URL` controls canonical, OG, RSS, and sitemap URLs. `astro:env` injects public values at build time, so set them in your build environment before `npm run build`.

Runtime secret:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
```

When Turnstile keys are absent, comment verification is skipped for local development. Configure both keys before exposing comments to the public internet.

## 4. Build and deploy

```bash
npm run cf-typegen
npm run build
npm run deploy
```

`npm run deploy` runs `astro build && wrangler deploy`.

If you use Workers Builds instead of local deployment, configure the same build command and variables there.

## 5. Verify

Check these after deployment:

```bash
curl -I https://your-domain.example/
curl -I https://your-domain.example/posts/hello-world
curl -I https://your-domain.example/en/posts/hello-world
curl -sS -o /dev/null -w '%{http_code}\n' 'https://your-domain.example/search?q=markdown'
curl -I https://your-domain.example/rss.xml
curl -I https://your-domain.example/en/rss.xml
```

In a browser:

1. `/search?q=markdown` returns the search page, not a 404. This depends on `run_worker_first` in `wrangler.jsonc`.
2. Toggle light/dark theme, then navigate through a post with `ClientRouter`; the theme must persist.
3. Submit a comment with a small image; the image should load from `/media/comments/...` with an immutable cache header.
4. Reload the post; the comment remains and the view counter does not increase again in the same browser.
5. Switch language from a post page; the other locale opens the matching post or its closest equivalent.
6. Check `/nope` returns the custom 404 page with a 404 status.

## 6. Rollback

```bash
npx wrangler deployments list
npx wrangler rollback <deployment-id>
```

D1 migrations are not rolled back. They only add a table and indexes, so older application code can still run.

## Static-asset routing note

`assets.html_handling` is set to `drop-trailing-slash` and Astro uses `trailingSlash: 'never'`. Keep these aligned. The `run_worker_first` list must contain `/search`, `/en/search`, `/media/*`, and `/_actions/*`; otherwise browser navigation requests can be intercepted by the static 404 page before reaching the Worker.
