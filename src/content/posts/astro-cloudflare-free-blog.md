---
title: '用 Astro 和 Cloudflare 搭一个不花钱的博客，从装 Node 到接上 AI'
description: '域名一年几十块，其余全零。把 Astro 静态站塞进 Cloudflare Workers Static Assets，配 D1 做评论，push 一次自动上线。附每一步的命令、真实踩过的坑，以及让 AI 接手写文章的实际做法和隐私红线。'
emoji: '🚀'
pubDate: 2026-11-08T15:25:00+08:00
tags:
  - Astro
  - Cloudflare
  - 博客
  - 教程
  - 免费
categories:
  - 折腾
draft: false
---

这个博客现在的固定支出，是域名一年几十块。服务器、CDN、证书、数据库、自动构建、站内搜索，全是零。

先把「免费」这句话拆开。这两年讲 Cloudflare 免费的文章很多，照着做的人不少踩到额度才发现。免费是真的，前提是你知道自己站在哪条额度线上。

## 先算账

| 项目 | 用什么 | 免费额度 | 什么时候会破 |
|---|---|---|---|
| 域名 | Cloudflare Registrar | 不免费，一年几十到一百多 | 不买也行，用 `xxx.workers.dev` 也是零 |
| 托管 | Workers Static Assets | 静态请求不计量 | 跑代码的请求另算 |
| 跑代码 | Workers Free | 每天 10 万次请求，单次 CPU 10 毫秒 | 评论接口被刷 |
| 自动构建 | Workers Builds | 每月 3000 分钟，单次最多 20 分钟 | 一天推十几次 |
| 数据库 | D1 Free | 每天读 500 万行、写 10 万行，存 5 GB | 评论被灌水 |
| CDN 与证书 | Universal SSL | 不限流量，自动续 | 不会破 |
| 站内搜索 | Pagefind | 纯静态，构建时生成 | 不会破 |
| 代码托管 | GitHub | 私有仓库免费 | 不会破 |

表里最容易被忽略的是第三行。Cloudflare 的静态资源请求完全不计量，既不算请求数，也不算流量，HTML、CSS、图片被打多少次账单上都是零。吃掉额度的是「跑代码的请求」，免费版每天十万次，单次 CPU 十毫秒。

所以零成本搭建落到最后是一个架构问题。怎么让绝大多数请求不要跑到代码里去。

我的做法是把 Worker 入口限制在 `/api/*`。文章页、列表页、标签页、图片、字体，全部由边缘直接返回，一个字节都不进 Worker。只有评论接口走代码，一天几百次请求，离十万远得很。

一个博客最容易被这段搞死的场景是，你写了个全站 SSR，每次打开文章都要跑一次 Worker 渲染。一天一千个访客翻三篇，就是三千次调用，还没算搜索引擎爬虫。碰到有人刷你，十万很快就没了。静态生成加窄入口，这套组合本身就避开了这个坑。

## 为什么是 Astro

选它有几个理由，都不算高明但够用。构建完就是一堆 HTML，没有任何运行时依赖。文章用 Markdown 写，图片放本地，构建时一起压缩成 webp。想在文章里嵌视频、插自定义组件，Astro 的语法能直接写 HTML。

再一个，它的内容集合带 schema 校验。front-matter 少写一个字段，构建就报错，不会出现「这篇没日期，列表页排序乱了」这种上线后才发现的事。

至于框架语法，我没花多少时间。耗时间的是默认值、环境差异，还有那些看着成功其实没成功的构建。这部分前面写过一篇，这里不重复，只讲从零开始会遇到什么。

## 第 0 步，准备东西

要准备的东西不多。Cloudflare 账号一个，免费计划，注册不要卡。GitHub 账号一个，放代码用，私有仓库也免费。Node.js 22.23.4 以上，这条是硬门槛，下一节细讲。再加一个顺手的编辑器。域名可有可无，最后再说。

不用买服务器，不用装 Docker，不用碰 Nginx。这条路上没有一个需要你自己运维的东西。

## 第 1 步，装 Node

这一步最容易卡住，而且报错信息不会告诉你原因。Astro 7 要求 Node 22.23.4 以上，我机器上装的是 22.22.2，差了小数点后面一位。它不给你降级跑，直接拒绝启动。先看一眼当前版本。

```bash
node -v
```

不到 22.23.4 就去官网下新的。Windows 上装完可能还是旧版，因为 PATH 里排在前面的那个才生效，用 `where node` 看一眼有几个。

不想动系统环境，就下免安装的压缩包，解压到某个目录，每次开终端手动把路径指过去。麻烦一点，但不会影响你别的项目。

```bash
export PATH="/path/to/node-v24/bin:$PATH"
node -v
```

## 第 2 步，建项目

```bash
npm create astro@latest my-blog
cd my-blog
npm install
```

交互里问的东西按默认走。模板选 Blog 那个，它已经把列表页、文章详情页、RSS 都写好了，示例文章删掉就行。别选空模板再自己搭路由，那套东西不难，但没必要从头写一遍。建完的结构是这样的。

```
my-blog/
├── src/
│   ├── content/posts/      文章，一个 .md 一个文件
│   ├── content.config.ts   文章字段的规则
│   ├── pages/              路由，文件即页面
│   │   └── posts/          模板给的详情页，把 .md 变成网页
│   ├── layouts/            页面外壳
│   └── components/         组件
├── public/                 原样拷到根目录的东西，图片放这
├── astro.config.mjs        站点配置
└── package.json
```

`public` 这个目录值得单独说一句。放进去的文件会原样出现在网站根路径下，`public/pic/a.webp` 对应的地址就是 `/pic/a.webp`。很多人第一次用会把图片放进 `src`，然后在正文里写相对路径，本地能看，上线图全裂。

## 第 3 步，写第一篇文章

在 `src/content/posts/` 下新建一个 `.md`，文件名会变成 URL。

```markdown
---
title: '第一篇'
description: '列表卡片和搜索结果里显示的那句话，纯文本。'
pubDate: 2026-11-08T20:00:00+08:00
tags:
  - 随笔
categories:
  - 生活
draft: false
---

正文从这里开始。
```

字段的规则写在 `src/content.config.ts` 里，用 zod 描述。这一层值得认真写，因为写错一次，以后每篇文章都要跟着错。

```ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(300),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
```

`draft` 这个字段值不大，用处不小。写完一半的文章标 `true`，构建时跳过，不会出现在列表和站点地图里。等写完了再改回 `false`。

有了 schema，标题超过 120 字、日期写成「今天」、忘了写 description，构建当场报错。这比上线以后发现首页一片空白好得多。

## 第 4 步，本地跑通

```bash
npm run dev
```

打开 `http://localhost:4321`，能看见页面就成了。改文件不用重启，浏览器自己刷。写完跑一次真构建。

```bash
npm run build
```

产物在 `dist/`。这个目录里应该有一堆 `.html`，还有 `sitemap-index.xml`。退出码是 0 不代表产物完整，这一点我吃过亏。构建脚本在收尾阶段出错时，前面生成的页面还在，屏幕上只飘一句警告，后面的集成压根没执行。判断办法很土，构建完去 `dist/` 里翻一眼，该有的文件在不在。缺了就是缺了，别信「Completed」。

最后本地预览一下，`npm run preview`，看图片和链接有没有问题。

## 第 5 步，交给 Cloudflare

先装 wrangler，它是 Cloudflare 的命令行工具。装完敲 `npx wrangler login`，会弹浏览器让你授权，点同意就回来了。

```bash
npm install -D wrangler
npx wrangler login
```

然后建一个配置文件。名字用 `wrangler.jsonc`，比 `.toml` 好写注释。

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-blog",
  "compatibility_date": "2026-11-01",

  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*"]
  }
}
```

四个地方值得解释。`directory` 指向构建产物，Cloudflare 会把这个目录原样当静态站发出去。

`not_found_handling` 必须是 `404-page`。千万别用 `single-page-application`，那会让所有错链都返回 200，搜索引擎会把它们当成一堆重复页面收进去，站点地图很快就脏了。

`run_worker_first` 是这套方案的关键。只有匹配 `/api/*` 的请求才会进 Worker，其余路径直接由边缘返回静态文件。这样文章页访问量再大也不消耗 Worker 额度，前面算账那一节说的就是这个。

`compatibility_date` 写当前日期。写太旧的日期，有些运行时行为还是老版本，出了怪事很难查。配置写完就部署。

```bash
npm run build
npx wrangler deploy
```

输出会给一个地址，形如 `https://my-blog.你的子域.workers.dev`。先在这个地址上验收一遍。首页要能开，样式正常，随便点一篇文章也要能开，图片不裂。手打一个不存在的地址，应该给正常的 404，不是 200。`/sitemap-index.xml` 能打开，里面是文章地址。最后看浏览器控制台，不能有红字。

这五条全过了再绑域名。反过来做，出问题你不知道是 DNS 还是配置。

## 第 6 步，绑域名

域名的 NS 先指到 Cloudflare。在后台加站点，它会给你两个 NS 地址，去注册商那边换掉。生效要一会儿，快的十几分钟，慢的几小时。

然后进 Worker 的设置，找到 Domains & Routes，加自定义域名。

证书不用管，Universal SSL 自动签，签完自动续。这一步之所以免费，是因为 Cloudflare 是这个域名的 DNS 提供方。域名不在它这儿，绑不上。

不想买域名，就一直用 `workers.dev` 那个地址，功能一样，只是短链和分享卡片难看一点。

## 第 7 步，让 push 就上线

到这一步你改完文章还得在本地跑 build 再 deploy，太折腾。接上自动构建，写完 push 就完事。

路径是 Worker 的设置里找 Builds，点 Connect 连 GitHub。必须从已有 Worker 的设置进，不要走 Create application，那条路会新建第二个 Worker，绑定还得重配一遍。这个坑我在另一个项目上踩过。

参数填起来不复杂。仓库和分支选你的，Root directory 留空，Build command 写 `npm run build`，Deploy command 保持默认的 `npx wrangler deploy`，Build variables 不填，Watch paths 写 `*` 再排除 `node_modules/**`。Preview builds 建议关掉，开着的话每个分支都会建一个预览站，数据库绑定还是共用的生产库，测试数据会串进去。

免费版构建有额度，每月 3000 分钟，单次最多 20 分钟，同一个账号同时只能跑一个。实测第一次构建慢，六到七分钟很正常，别以为卡住了就反复点重试。排队的时候再点一次，只是又排一个。

第一次构建完，改一行字推到 main，等两分钟看线上变了没有。这一步通了，以后写文章就只剩写和推。

## 第 8 步，想要评论再加数据库

博客不带评论也能活。真想要，D1 是这里面最合适的选择，它是 Cloudflare 自家的 SQLite，免费额度对个人博客够用。

```bash
npx wrangler d1 create my-blog-comments
```

命令会打印一段带 `database_id` 的配置，把它粘进 `wrangler.jsonc` 的 `d1_databases` 里，`binding` 写 `DB`，因为代码里读的是 `env.DB`，两边必须一致。

建表用迁移文件，别在控制台手敲 SQL。手敲的语句没人记得住，换台机器就重建不出来。

```bash
npx wrangler d1 migrations apply my-blog-comments --remote
```

`--remote` 不能漏。漏了是写进本地模拟库，命令照样显示成功，线上读不到，你会以为是代码问题。

后面就是写一个 Worker 入口处理 `GET /api/comments` 和 `POST /api/comments`。有一点必须做在前面，任何提交都要限长度、限频率、做转义。公开的评论接口，第一个晚上就会有人来试。

## 怎么让 AI 帮你写

这一段是我实际用下来的。这个博客的迁移是和 AI 一起做的，前面那篇里我写过一句「我让助手再测，这次带上浏览器的预取头」，那不是修辞。当时是它带着那个头把 503 复现出来的，我自己用普通 GET 测了五十次全是 200。它也在另一处提醒过我，先确认集成到底跑没跑，结果我改了半天配置才发现压根没进去。

最先要解决的是重复交代。最开始我每开一个新会话都要重新说一遍，技术栈是什么、命令怎么跑、什么不能动，交代到第三回就烦了。后来改成在仓库里放几份文档，一份讲当前状态和待办，一份讲代码评审里定下的规矩，构建命令和踩过的坑都写在里面。换模型、换机器、隔一周回来，它读一遍就能接上。这一步的收益比任何提示词技巧都大，你现在读的这篇，也是在同一套文件上接着做的。

然后是语气。这东西描述不出来，只能喂进去。你说「写得口语一点、少用书面语」，它给你的东西还是那个味。你把十篇旧文丢过去说「照这个感觉」，结果完全不一样。它学的是句子的长度、段落怎么断、哪句话后面会停下来，这些东西说不上来，但读两段就能认出来。

front-matter 也要给死模板。schema 定死了字段，它就不会漏。我见过它把 `pubDate` 写成 `date`，构建报错才发现。有了校验，这类错误在第一秒就拦住了。

分工上，我的做法是这样。具体发生了什么、哪个数字、哪句话是我想说的，我给。结构、措辞、校对、查文档，它来。它写不出「我以为是 sitemap 配置有问题，在选项上改了半天」，因为那件事没发生在它身上。

有三类东西必须自己核。版本号、默认值、免费额度。这三样它最容易编，而且编得很像真的。额度这种数字还会随官方调整，它记住的是旧的，也不会主动告诉你可能过期。上面那张表里的数字，我写之前去官方文档对了一遍。差了会被读者当场指出来，就这么直接。

发布之前还有一道关，隐私。密钥、token、cookie 不进仓库，本地调试用的 `.dev.vars` 写进 `.gitignore`，提交前 `git status` 看一眼。`database_id` 本身不算密钥，但和账号绑在一起，公开文章里用占位符就行，别照抄自己的。截图是最容易漏的，控制台右上角的邮箱、账号 ID、域名列表里的其他站、账单页，全要打码。文章里出现过的服务器 IP、内网地址、真实姓名、别人的微信号，发布前搜一遍。让 AI 写的时候，也别把带密钥的文件整个丢进去，真需要它看配置，先手动把那几行换成假的。

最后一件事，写完让它把每一条命令、每一个数字标出来源。标不出来的你去核。这一遍花五分钟，能省掉一次公开出丑。

AI 在这件事上最有用的地方是它不嫌烦。你说「这段再短一点」「这个词换掉」「这句话我读着别扭」，它改十遍也不会有情绪。你自己写，改到第三遍就开始怀疑人生了。

## 排错

| 现象 | 原因 | 怎么修 |
|---|---|---|
| 控制台一片 503，普通刷新又正常 | Cloudflare 的 Speed Brain 自动预取，加上站点自己的批量预取 | Astro 里把 `prefetchAll` 关掉，只在 hover 时预取 |
| 构建说成功，sitemap 是旧的 | 收尾阶段报错，后面的集成没执行 | 去 `dist/` 里看文件在不在，别只看退出码 |
| 错链返回 200 | `not_found_handling` 写成了 SPA | 改成 `404-page` |
| Worker 额度掉得很快 | `run_worker_first` 覆盖了全站 | 只留 `/api/*` |
| 上线后图片全裂 | 图片放在 `src` 里了 | 移到 `public/`，路径按根目录写 |
| push 了线上没变 | 构建排队，或者 Worker 名对不上 | 看 Deployments 的时间戳 |
| `wrangler d1` 提示找不到库 | 少了 `--remote` | 加参数重跑，本地库和线上是两套 |
| 域名打不开，workers.dev 能开 | NS 还没生效，或证书在签 | 等，别连点重试 |
| 英文数字突然换了字体 | 字体栈里写了没声明的字体 | 字体栈只写实际加载过的 |

## 最后

搭这套东西，我自己花的时间比想象中多。不难，但每一步都有个默认值在等着绊你。Node 版本差一位、构建产物缺一半、预取把页面刷成 503，这些都不在教程里。

但搭完之后，写文章这件事变得很轻。新建一个 `.md`，写完 push，两分钟线上就有了。没有后台要登，没有插件要更新，没有服务器要重启。

一年几十块的域名，剩下的都是零。现在的问题只剩下写什么。
