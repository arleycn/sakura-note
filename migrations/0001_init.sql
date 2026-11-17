-- 评论表：只存纯文本正文，配图落 R2，D1 里只留 key
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  image_key TEXT,
  created_at INTEGER NOT NULL
);

-- 列表查询固定是「某篇文章 + 时间倒序」，索引方向与之对齐
CREATE INDEX IF NOT EXISTS idx_comments_post_created
  ON comments (post_id, created_at DESC);
