---
title: 部署到 Cloudflare，从零到上线
description: 建 D1 / KV / R2 三个资源、写进 wrangler 配置、跑迁移、deploy，以及出问题怎么回滚。
pubDate: 2026-11-12
tags: ['Cloudflare', '部署']
categories: ['指南']
emoji: '🚀'
---

静态页由 Workers Static Assets 从边缘直出，不消耗 Worker 调用；只有评论和阅读量这类动态请求才进 Worker。整站可以跑在免费额度内。

## 一、建三个资源

```bash
npx wrangler login

npx wrangler d1 create sakura-note-db        # 记下返回的 database_id
npx wrangler kv namespace create VIEWS       # 记下 id
npx wrangler r2 bucket create sakura-note-media
```

## 二、把 id 填进配置

`wrangler.jsonc` 里有两处占位要换成上一步返回的真实 id：

```jsonc
{
  "d1_databases": [
    { "binding": "DB", "database_name": "sakura-note-db", "database_id": "<换这里>" }
  ],
  "kv_namespaces": [
    { "binding": "VIEWS", "id": "<换这里>" }
  ],
  "r2_buckets": [
    { "binding": "MEDIA", "bucket_name": "sakura-note-media" }
  ]
}
```

## 三、跑数据库迁移

```bash
npx wrangler d1 migrations apply sakura-note-db --remote
```

迁移文件在 `migrations/`，按编号顺序执行，重复执行不会重跑已应用的部分。

## 四、构建并部署

```bash
npm run check
npm run build
npx wrangler deploy
```

> 如果本机开着代理，wrangler 可能报 `auth token expired`。清掉代理变量再跑：
> `env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy npx wrangler deploy`

## 五、验证

部署完别只看首页。下面这些都要过一遍：

| 检查 | 预期 |
|---|---|
| `/` 与 `/en` | 200，样式正常 |
| 任意文章页 | 200，代码块高亮、目录出现 |
| `/search?q=astro` | 200，**不能是 404** |
| 提交一条评论 | 出现在列表里，刷新后仍在 |
| 刷新文章页两次 | 阅读量只 +1 |
| `/media/不存在.png` | 404 而不是 500 |

搜索页这一条最容易踩坑：Workers Static Assets 对导航请求会优先匹配静态文件，没命中就直接返回 404 页面，Worker 根本不执行。解法是 `wrangler.jsonc` 里给动态路由开白名单：

```jsonc
"assets": {
  "run_worker_first": ["/search", "/media/*", "/_actions/*"]
}
```

## 六、出问题怎么退

```bash
npx wrangler deployments list
npx wrangler rollback <deployment-id>
```

回滚只回代码，不回数据库。涉及迁移的改动，最好把「加字段」和「用字段」分成两次发布。
