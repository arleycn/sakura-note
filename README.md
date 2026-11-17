# Arley's Blog · 樱云小筑

樱花主题的个人博客（主题名「樱云小筑」）。**Astro 7 + Cloudflare 全家桶**，视觉语言取自 [`bm.arley.cn`](https://bm.arley.cn)（本地源码 `D:\GitHub\sakura-nav`）。

> 一句话架构：**内容是构建期产物，交互是运行时能力。** 文章、列表、标签、归档在构建时出 HTML，由 Workers Static Assets 从边缘直接返回；评论、阅读量、配图走 Worker + D1 / KV / R2。

---

## 一、实测状态（2026-11-17）

| 项目 | 值 |
|---|---|
| Astro | `7.4.12`（官方 CLI `npm create astro@latest` 生成） |
| 适配器 | `@astrojs/cloudflare 14.4.8`（`npx astro add cloudflare`） |
| Wrangler | `4.163.0` |
| Node | `24.22.1`（packages 要求 ≥ 22.23.4） |
| `astro check` | **0 error / 0 warning / 0 hint**（32 文件） |
| `astro build` | 成功，**114 个预渲染页面**（28 篇文章 + 80 个标签页 + 5 页分页 + 归档/关于/标签/搜索/404）+ 4 个按需路由 |
| 产物体积 | client **8.0 MB**（其中 `pic/` 文章配图 6.3 MB / 95 张），server 3.1 MB；CSS 26.0 KB，站点 JS 14.4 KB，首页 HTML 14.7 KB，文章页 25.6 KB |
| 交互冒烟 | `node tools/smoke.mjs` **8/8 通过**（主题切换、ClientRouter 无刷新、导航后主题保持、阅读量、评论上屏、刷新持久化、移动端无横向溢出、控制台 0 报错） |
| 布局实测 | 1440 / 1280 / 390 三种视口 `scrollWidth === clientWidth`，溢出元素 0 个 |
| 内容 | 28 篇文章（2021-08 ~ 2026-11）、80 个标签、4 个年份；RSS 28 条，sitemap 116 条 |
| 运行时性能 | 1440×900 桌面：**156.8fps**，p95 帧 **7.5ms**，掉帧（>33ms）**0**，主线程 120ms/160 帧；文章页 162fps、最长帧 14.4ms |
| 常驻动画 | **3 个**：2 朵云（`transform`，96s/130s，可上合成层）+ 首页 150ms 淡入 |

#### 性能调优记录（2026-11-17）

首版有 10 个常驻 `infinite` 动画，其中 `sky-drift`（`background-position` 30s）作用在整屏渐变上、
两处 `grad-flow` 作用在按钮与页脚渐变上——**动 `background-position` 无法上合成层，每帧整块重绘**；
`twinkle` 则让整屏星点持续重绘。用 `tools/perf-ab.mjs` 做开关对照（同一路由、同一测量口径）：

| 变体 | 主线程 taskMs | 样式重算 | p95 帧 | 最长帧 |
|---|---|---|---|---|
| 初始 10 个动画 | 362.8 | 57.2ms | 11.4ms | 69.9ms |
| 只关 `backdrop-filter` | 355.1（**−2%，无关**） | 51.7ms | 11.5ms | 76.2ms |
| 只关 canvas 花瓣 | 336.8（−7%） | 58.3ms | 9.0ms | 106.6ms |
| 只关常驻动画 | **170.4（−53%）** | **8.0ms** | **7.5ms** | 76.6ms |
| **调优后（现状）** | **120.4（−67%）** | **19.7ms** | **7.5ms** | **24.2ms** |

结论与处置：

- **删** `sky-drift` / `grad-flow` / `twinkle`（改静态渐变与静态星点，视觉无可见差别）；
- **降** canvas 花瓣到 30fps（低端 24fps）、DPR 上限 1.5、数量 36→26；
- **减** 云 3 朵→2 朵，logo 与 hero 的摆动改 hover 触发；
- **快** 页面入场 550ms+位移 → **150ms 纯淡入**（位移会额外触发合成）；
- **去重** `body` 的固定渐变背景（与 `.backdrop__sky` 重复栅格化），改兜底纯色；
- `overflow-x: hidden` → `clip`，避免 body 变成滚动容器。
- `backdrop-filter` 实测仅 −2%，**未动**（按数据留，不凭感觉删）。

复测命令：`node tools/perf-ab.mjs`（A/B 对照表）、`node tools/perf.mjs <标签>`（单页）、
`MSYS_NO_PATHCONV=1 PERF_ROUTE=/posts/xxx node tools/perf.mjs`（指定路由；Git Bash 会把以 `/` 开头的环境变量值转成 Windows 路径，必须加 `MSYS_NO_PATHCONV=1`）。

### 内容来源（2026-11-17 迁移）

文章、站点文案、关于页信息都对齐线上站 `blog.arley.cn`（本地 `D://GitHub//arley-blog`）：

| 迁移项 | 怎么处理 |
|---|---|
| 文章正文 / front-matter | 原样搬入 `src/content/posts/`，仅补 `emoji`（卡片装饰）字段 |
| 旧内链 `/2026/10/27/xxx/` | 按 `legacy-paths.json` 映射改写成 `/posts/<id>`，共 11 处 |
| `/about/` 链接 | 改成 `/about`（本站 URL 不带尾斜杠） |
| 文章配图 | `public/pic/` 95 张原图复制，路径不变 |
| 站名 / 描述 / 标语 | 取自线上站 `SITE` 与 `PROFILE`，集中在 `src/config.ts` |
| 关于页 | 头像、自我介绍、8 个自建站入口、GitHub/Telegram/邮箱 |
| 页脚 | 版权区间 2021-2026、萌ICP备20223666号、社交入口 |

---

## 二、Cloudflare 全家桶分工

| 产品 | 用途 | 代码位置 |
|---|---|---|
| Workers | 按需渲染 `/search`、媒体代理、Actions 端点 | `src/pages/search.astro`、`src/pages/media/[...key].ts`、`src/actions/index.ts` |
| Static Assets | 23 个预渲染页 + 静态资源，边缘直出 | `wrangler.jsonc` → `assets` |
| D1 | 评论正文、索引 | `migrations/0001_init.sql`、`src/lib/db.ts` |
| KV (`VIEWS`) | 阅读量计数 + 评论限流窗口 | `src/lib/db.ts`、`src/lib/security.ts` |
| R2 (`MEDIA`) | 评论配图（≤2 MB，UUID 命名，一年 immutable 缓存） | `src/actions/index.ts`、`src/pages/media/[...key].ts` |
| Images | Astro 图片运行期变换（`cloudflare-binding`） | `astro.config.mjs` → `imageService` |
| Turnstile | 评论人机校验（未配密钥时自动跳过，便于本地开发） | `src/lib/security.ts` |

**为什么这么分**：D1 适合「有关系、要查询、要索引」的数据；KV 适合读多写少、允许最终一致的计数；R2 存二进制、出网不计费。三者边界见文章 `d1-kv-r2-boundaries`。

---

## 三、目录结构

```
sakura-blog/
├── astro.config.mjs        # 站点、适配器、预取、Shiki 双主题、astro:env
├── wrangler.jsonc          # Workers + Static Assets + D1/KV/R2/Images
├── migrations/             # D1 迁移（评论表 + 查询索引）
├── public/                 # favicon / OG 图 / 文章配图 pic/ / _headers / robots.txt
├── src/
│   ├── actions/index.ts    # 官方 Actions：comments.list/add、views.get/hit
│   ├── components/         # Header / Footer / 背景层 / 卡片 / 分页 / 评论
│   ├── content/posts/      # 28 篇文章（Markdown，含 categories/emoji）
│   ├── content.config.ts   # 内容集合 + Zod schema
│   ├── layouts/            # BaseLayout（SEO / ClientRouter / 防闪烁脚本）
│   ├── lib/                # posts 查询、D1/KV 访问、Turnstile 与限流
│   ├── pages/              # 首页、分页、文章、标签、归档、搜索、404、RSS、媒体代理
│   ├── scripts/site.ts     # 全站客户端逻辑（挂在 astro:page-load）
│   └── styles/global.css   # 设计令牌 + 全站样式 + 响应式
└── tools/                  # 本地工具：OG 生成、布局测量、交互冒烟、性能 A/B
```

---

## 四、官方能力 vs 手写部分（按需求先声明）

**官方方式（未自建轮子）**

| 能力 | 官方做法 |
|---|---|
| 项目脚手架 / 集成 | `npm create astro@latest`、`npx astro add cloudflare` |
| 内容建模 | `src/content.config.ts` + `glob()` loader + `astro/zod` |
| 内容渲染 | `render(entry)`，标题锚点由 Astro 生成 |
| 无刷新导航（官方 ajax 之一） | `<ClientRouter />` + `astro:page-load` / `astro:after-swap` |
| 链接预取 | `prefetch: { prefetchAll:false, defaultStrategy:'hover' }` + `data-astro-prefetch` |
| 数据交互（官方 ajax 之二） | `defineAction` / `actions.*` RPC / `isInputError()`，无一行手写 fetch 封装 |
| 环境变量 | `astro:env`（client 公开 / server secret 两类） |
| 绑定访问 | `import { env } from 'cloudflare:workers'` + `wrangler types` |
| SEO | `@astrojs/sitemap`、`@astrojs/rss`、canonical/OG/JSON-LD 手写在布局 |
| 缓存与 404 | `assets.html_handling` / `not_found_handling` / `run_worker_first` |
| 类型检查 | `astro check`（strict tsconfig） |

**手写的部分（官方没有直接对应，或必须自己实现的业务）**

| 手写内容 | 为什么手写 |
|---|---|
| `src/components/SakuraBackdrop.astro` + `site.ts` 里的花瓣 canvas | 官方无装饰层方案；约 90 行，含 DPR 限制、低端设备减半、`prefers-reduced-motion` 关闭、后台暂停 |
| 主题切换（localStorage + `<html data-theme>` + meta theme-color 同步） | 官方主题方案是 `<ThemeProvider>`（仅 React 等框架），纯 Astro 无对应 API |
| 评论的 D1 读写、KV 计数与限流、R2 上传与代理 | 业务逻辑，框架不管；SQL 与表结构手写 |
| Turnstile 服务端校验 | 官方提供 API，未提供 Astro 封装 |
| 评论便签 UI、樱花主题 CSS | 设计实现 |
| `tools/*.mjs`（OG 图生成、布局测量、冒烟） | 本地验证工具，不参与构建 |

---

## 五、本地开发

```bash
npm install
npm run cf-typegen          # wrangler.jsonc 变更后重跑，生成绑定类型
npm run db:migrate:local    # 建本地 D1 表
npm run dev                 # astro dev（Vite + workerd，端口 4321）
```

本地验收 Cloudflare 运行时（推荐，能覆盖 Actions / D1 / KV / R2）：

```bash
npm run build
npx wrangler dev --config dist/server/wrangler.json --persist-to .wrangler/state
node tools/smoke.mjs http://127.0.0.1:8787
node tools/measure.mjs http://127.0.0.1:8787/ 390x844 mobile
```

`tools/measure.mjs` 会打印 `scrollWidth` 对比视口宽度，并列出所有右边界越界的元素——**断点问题看数字，不看截图猜**。

---

## 六、部署（涉及真实账号资源，需逐项确认后执行）

以下命令会创建计费资源或改动线上，属于需确认的操作，**不要直接整段粘贴执行**。

```bash
# 1. 建资源（记录返回的 database_id / KV id，填回 wrangler.jsonc）
npx wrangler d1 create sakura-blog-db
npx wrangler kv namespace create VIEWS
npx wrangler r2 bucket create sakura-blog-media

# 2. 线上迁移
npx wrangler d1 migrations apply sakura-blog-db --remote

# 3. 密钥（不要写进仓库）
npx wrangler secret put TURNSTILE_SECRET_KEY

# 4. 构建期公开变量：PUBLIC_TURNSTILE_SITE_KEY 写进 Workers Builds 的环境变量
#    或本地 .env（astro:env client 变量在构建期注入）

# 5. 部署
npm run deploy
```

验证（部署后逐条）：

1. `curl -I https://<域名>/posts/<id>` → 200，`cf-cache-status` 命中，`Cache-Control` 里只有一个 `max-age`；
2. 浏览器打开 `/search?q=cloudflare` → 200（**不是** 404 页；`run_worker_first` 必须含 `/search`）；
3. 提交一条带图评论 → 200，列表出现，图片 `/media/comments/<uuid>.png` 返回 `image/png` + `immutable`；
4. 同一浏览器刷新文章页 → 阅读量不重复增加（cookie 去重）；
5. `curl -I https://<域名>/nope` → 404 且页面是自定义 404。

**回滚**：`wrangler deployments list` 找到上一版 → `wrangler rollback [deployment-id]`。D1 迁移不回滚（只加表与索引，向后兼容）。

---

## 七、已知限制与取舍

- **评论表单是 RPC 调用**：文章页预渲染，`<form action={actions.x}>` 会 POST 回静态文件，因此用客户端 `actions.comments.add(formData)`。代价是无 JS 时不能留言（`<noscript>` 有提示）。
- **D1 的 KV 限流是最终一致**：极端并发可能多放过一两条，目的是拦脚本，不做精确配额。
- **阅读量 KV 无原子自增**：同一秒并发会丢更新，计数场景可接受；要精确就换 D1 或 Durable Object。
- **`wrangler types` 生成的全局 `Element` 会与 DOM `Element` 合并**，`append/prepend` 签名被 HTMLRewriter 版本覆盖。客户端代码统一用 `appendChild` / `insertBefore`，不要用 `append/prepend`。
- **站点域名是占位值** `https://sakura-blog.arley.cn`，改域名只需改 `src/config.ts` 与 `astro.config.mjs` 的 `SITE`，以及 `public/robots.txt` 的 sitemap 行。
- **`PAGE_SIZE = 6`**（三列网格两行）；28 篇文章分成 5 页，`/page/2` ~ `/page/5` 按需生成。
- **文章配图是静态文件**（`public/pic/*.webp`，与线上站同一批图）。正文里是原生 `<img>` 标签，不走 `astro:assets` 的构建期压缩；要享受官方图片优化，需要把图挪到 `src/assets` 并改成相对路径引用。
- **标签存在大小写重复**：`Teambition`/`teambition`、`Panindex`/`panindex`、`OneManager`/`onemanage`、`infinity free` 等，来源是历史文章手写不一致。合并需要改文章 front-matter，未擅自改动。
