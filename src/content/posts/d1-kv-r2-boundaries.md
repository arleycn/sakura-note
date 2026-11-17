---
title: "D1 / KV / R2 怎么选：三个存储的边界在哪"
description: "不是所有数据都该进数据库。按读写形态选 Cloudflare 存储，比按「哪个更熟」选要省一半调用费。"
pubDate: 2026-11-10
updatedDate: 2026-11-16
tags: ["Cloudflare", "D1", "存储"]
emoji: "🗄️"
---

Cloudflare 的存储产品看着多，其实按**读写形态**分就三类，选错的代价通常体现在账单和延迟上。

## D1：有关系、要查询、要事务

评论是最典型的场景：要按文章查、按时间倒序、要分页、将来可能还要审核状态。

```sql
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_comments_post ON comments (post_id, created_at DESC);
```

索引方向要和查询排序一致，否则 D1 会退化成扫描。

## KV：读多写少、允许最终一致

阅读量属于「写一次、读一万次」，而且差几秒不影响正确性。用 KV 的 `get`/`put` 就够，不必开数据库连接。

要注意 KV 是最终一致的：同一秒内并发自增会丢更新。计数器场景可以接受，账务场景不行。

## R2：存二进制，不存状态

评论配图放 R2，D1 里只存 key。这样列表查询不会拖着大字段，图片还能单独设长缓存：

```
Cache-Control: public, max-age=31536000, immutable
```

R2 出网不收流量费，这一点比把图片塞进数据库或直接放 Pages 产物要划算。

## 一张选择表

| 数据 | 存储 | 理由 |
|---|---|---|
| 评论正文 | D1 | 关系查询 + 索引 |
| 阅读量 | KV | 高频读、弱一致可接受 |
| 配图 | R2 | 二进制、长缓存 |
| 站点配置 | 代码 / 环境变量 | 不需要运行时改 |

## 别做的事

- 别用 KV 存需要「按条件筛选」的列表——它只能按 key 取。
- 别把图片 base64 塞进 D1——单行体积和查询成本都会炸。
- 别为了「统一」把所有东西塞进一个存储，边界清楚才好排障。
