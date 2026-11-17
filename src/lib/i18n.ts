/**
 * 双语支持：语言判定、UI 文案字典、路径本地化。
 *
 * 中文为默认语言、不带前缀；英文带 /en 前缀。
 * 所有页面文案都从这里取，组件里不写死界面文字。
 */

export const LANGS = ['zh', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'zh';

export const LANG_LABEL: Record<Lang, string> = {
  zh: '中文',
  en: 'English',
};

export const LANG_HTML: Record<Lang, string> = {
  zh: 'zh-CN',
  en: 'en',
};

export const LANG_OG_LOCALE: Record<Lang, string> = {
  zh: 'zh_CN',
  en: 'en_US',
};

const zh = {
  meta: {
    description: (site: string) => `${site} 是一个基于 Astro 7 与 Cloudflare 的樱花主题博客示例。`,
  },
  nav: {
    home: '首页',
    archives: '归档',
    tags: '标签',
    about: '关于',
    search: '搜索',
    mainNav: '主导航',
    openMenu: '打开菜单',
    switchTheme: '切换日夜主题',
    switchLang: 'Switch to English',
    backTop: '返回顶部',
    skipToContent: '跳到正文',
    searchArticles: '搜索文章',
    searchShortcut: '搜索 (/)',
    source: '源码',
  },
  common: {
    readTime: (n: number) => `${n} 分钟`,
    readTimeLong: (n: number) => `${n} 分钟读完`,
    views: '次阅读',
    updated: (date: string) => `更新于 ${date}`,
    pageIndicator: (current: number, total: number) => `第 ${current} / ${total} 页`,
    prevPage: '← 上一页',
    nextPage: '下一页 →',
    pagination: '分页',
    allArchives: '全部归档 →',
    allTags: '全部标签 →',
    postNav: '上下篇',
    prevPost: '上一篇',
    nextPost: '下一篇',
    category: '分类',
    tags: '标签',
  },
  hero: {
    subtitle: '技术笔记、建站记录，还有一点樱花。',
    count: (n: number) => `已写下 ${n} 篇笔记`,
    motto: 'Where there is life, there is hope.',
    start: '开始阅读',
    rss: '订阅 RSS',
    hotTags: '热门标签',
    latest: '最新文章',
  },
  post: {
    toc: '本文目录',
    related: '相关笔记',
  },
  comments: {
    title: '留言板',
    nickname: '昵称',
    nicknamePlaceholder: '怎么称呼你呀～',
    body: '留言内容',
    bodyPlaceholder: '说点什么吧，纯文本，最多 600 字',
    image: '配图（可选，≤2MB）',
    website: '网站',
    submit: '寄出留言',
    submitting: '正在寄出…',
    empty: '还没有留言，来坐第一个沙发吧～',
    loadFailed: '留言加载失败，刷新试试',
    success: '留言已寄出，谢谢你的回应 🌸',
    invalid: '昵称或内容不符合要求，检查一下长度',
    generic: '发送失败，稍后再试',
    count: (n: number) => `${n} 条`,
    noscript: '留言需要 JavaScript：提交走 Astro Actions 的 RPC 调用。',
    imageAlt: (author: string) => `${author} 上传的配图`,
    needName: '先留个昵称吧～',
    tooShort: '内容太短啦，至少写两个字',
    sending: '正在发送…',
    justNow: '刚刚',
    minutesAgo: (n: number) => `${n} 分钟前`,
    hoursAgo: (n: number) => `${n} 小时前`,
    daysAgo: (n: number) => `${n} 天前`,
  },
  search: {
    title: '搜索',
    titleFor: (q: string) => `搜索：${q}`,
    description: '搜索站内全部笔记',
    label: '关键词',
    placeholder: '输入标题、标签或正文关键词…',
    submit: '找一找',
    resultFor: (q: string, n: number) => `「${q}」共找到 ${n} 篇`,
    none: '没找到相关文章。换个关键词试试，或者去',
    noneArchive: '归档',
    noneTail: '翻翻。',
    hint: '提示：任意页面按 / 可以直接跳到搜索。',
    noindexHint: '搜索结果页不参与搜索引擎收录',
  },
  archives: {
    title: '归档',
    description: (site: string) => `按年份浏览 ${site} 的全部笔记`,
    summary: (posts: number, years: number) => `${posts} 篇 · ${years} 个年份`,
    yearCount: (n: number) => `${n} 篇`,
  },
  tags: {
    title: '标签',
    description: (site: string) => `按标签浏览 ${site} 的全部笔记`,
    summary: (n: number) => `${n} 个标签`,
    tagDescription: (tag: string) => `标签 #${tag} 下的全部文章`,
    empty: '这个标签下还没有文章。',
  },
  about: {
    title: '关于',
    description: (author: string) => `关于 ${author} 与这个博客。`,
    contactTitle: '联系我',
    contact: '联系方式',
    sitesTitle: '示例站点',
    sitesHint: '以下都是示例数据，替换 src/config.ts 里的 MY_SITES 即可。',
    backHome: '回首页',
    role: '占位作者 · 示例介绍',
    intro: [
      '这一段是占位介绍。把 src/config.ts 里的 author 和这里的两段文字换成你自己的，关于页就成型了。',
      '这个页面同时展示了主题的几个能力：带渐变描边的标题、卡片式站点列表、便签风格的块级排版，以及深浅两套配色下的对比度。',
    ],
    contactHint: '把 src/config.ts 里的 email / github 换成你的真实地址。',
    avatarAlt: (author: string) => `${author} 的头像`,
    where: '这是哪儿',
    whereText: (site: string, theme: string, since: number) =>
      `${site}（${theme}），${since} 年开写。记录所得，分享所获 —— 技术教程、建站记录，以及值得留档的折腾。`,
    sites: '我做的站',
    sitesDesc: '下面都是占位数据，换成你自己的项目即可。',
    find: '找到我',
    findDesc: '有事直接说，不用寒暄。',
    stack: '站点是怎么搭的',
    stackDesc: '全部按官方文档的推荐方式落地，没有自建框架层。',
    guestbook: '留言',
    guestbookDesc: '站内留言直接在任意文章底部写，支持一张 2MB 以内的配图。',
    stackItems: [
      { layer: '框架', value: 'Astro 7 · 内容集合 + 按需渲染', emoji: '🚀' },
      { layer: '部署', value: 'Cloudflare Workers + Static Assets', emoji: '☁️' },
      { layer: '评论', value: 'D1 存正文，Actions 做接口', emoji: '💬' },
      { layer: '计数', value: 'KV 记阅读量，Cookie 去重', emoji: '👀' },
      { layer: '图片', value: 'R2 存配图，Images binding 做变换', emoji: '🖼️' },
      { layer: '交互', value: 'ClientRouter + Actions（官方 ajax）', emoji: '⚡' },
    ],
  },
  notFound: {
    title: '页面走丢了',
    description: '404 · 这个页面不存在',
    heading: '这页被风吹走了',
    body: '404 · 你要找的页面不存在，可能已经改名或删除。',
    home: '回首页',
    archives: '看归档',
  },
  footer: {
    nav: '站外链接',
    builtWith: '基于',
    builtWithTail: '构建',
    hostedOn: '托管于',
    rights: '保留所有权利',
    themeCredit: (theme: string) => `主题 ${theme}`,
  },
  rss: {
    title: '订阅',
  },
  pages: {
    pageTitle: (n: number) => `第 ${n} 页`,
    pageDescription: (site: string, n: number) => `${site} 文章列表第 ${n} 页`,
  },
};

const en: typeof zh = {
  meta: {
    description: (site: string) => `${site} is a sakura-themed blog starter built with Astro 7 and Cloudflare.`,
  },
  nav: {
    home: 'Home',
    archives: 'Archives',
    tags: 'Tags',
    about: 'About',
    search: 'Search',
    mainNav: 'Main navigation',
    openMenu: 'Open menu',
    switchTheme: 'Toggle light / dark theme',
    switchLang: '切换到中文',
    backTop: 'Back to top',
    skipToContent: 'Skip to content',
    searchArticles: 'Search articles',
    searchShortcut: 'Search (/)',
    source: 'Source',
  },
  common: {
    readTime: (n: number) => `${n} min`,
    readTimeLong: (n: number) => `${n} min read`,
    views: 'views',
    updated: (date: string) => `Updated ${date}`,
    pageIndicator: (current: number, total: number) => `Page ${current} of ${total}`,
    prevPage: '← Previous',
    nextPage: 'Next →',
    pagination: 'Pagination',
    allArchives: 'All posts →',
    allTags: 'All tags →',
    postNav: 'Post navigation',
    prevPost: 'Previous post',
    nextPost: 'Next post',
    category: 'Category',
    tags: 'Tags',
  },
  hero: {
    subtitle: 'Notes on building things, mostly for the web.',
    count: (n: number) => `${n} posts so far`,
    motto: 'Where there is life, there is hope.',
    start: 'Start reading',
    rss: 'Subscribe via RSS',
    hotTags: 'Popular tags',
    latest: 'Latest posts',
  },
  post: {
    toc: 'On this page',
    related: 'Related posts',
  },
  comments: {
    title: 'Comments',
    nickname: 'Name',
    nicknamePlaceholder: 'How should we call you?',
    body: 'Comment',
    bodyPlaceholder: 'Say something — plain text, up to 600 characters',
    image: 'Attach an image (optional, ≤2MB)',
    website: 'Website',
    submit: 'Post comment',
    submitting: 'Posting…',
    empty: 'No comments yet — be the first one.',
    loadFailed: 'Failed to load comments, try refreshing',
    success: 'Comment posted. Thanks for stopping by 🌸',
    invalid: 'Name or comment does not meet the length requirement',
    generic: 'Failed to send, please try again later',
    count: (n: number) => `${n}`,
    noscript: 'Comments need JavaScript: submission goes through Astro Actions RPC.',
    imageAlt: (author: string) => `Image uploaded by ${author}`,
    needName: 'Please leave a name first.',
    tooShort: 'Your comment is too short — at least two characters.',
    sending: 'Posting…',
    justNow: 'just now',
    minutesAgo: (n: number) => `${n}m ago`,
    hoursAgo: (n: number) => `${n}h ago`,
    daysAgo: (n: number) => `${n}d ago`,
  },
  search: {
    title: 'Search',
    titleFor: (q: string) => `Search: ${q}`,
    description: 'Search every post on this site',
    label: 'Keywords',
    placeholder: 'Title, tag, or a keyword from the body…',
    submit: 'Search',
    resultFor: (q: string, n: number) => `${n} result${n === 1 ? '' : 's'} for “${q}”`,
    none: 'Nothing found. Try another keyword, or browse the',
    noneArchive: 'archives',
    noneTail: '.',
    hint: 'Tip: press / on any page to jump straight to search.',
    noindexHint: 'Search result pages are excluded from indexing',
  },
  archives: {
    title: 'Archives',
    description: (site: string) => `Browse every ${site} post by year`,
    summary: (posts: number, years: number) => `${posts} posts · ${years} years`,
    yearCount: (n: number) => `${n}`,
  },
  tags: {
    title: 'Tags',
    description: (site: string) => `Browse every ${site} post by tag`,
    summary: (n: number) => `${n} tags`,
    tagDescription: (tag: string) => `Every post tagged #${tag}`,
    empty: 'No posts under this tag yet.',
  },
  about: {
    title: 'About',
    description: (author: string) => `About ${author} and this blog.`,
    contactTitle: 'Get in touch',
    contact: 'Contact',
    sitesTitle: 'Sample sites',
    sitesHint: 'All of this is sample data. Edit MY_SITES in src/config.ts.',
    backHome: 'Back home',
    role: 'Placeholder author · sample intro',
    intro: [
      'This is placeholder copy. Replace the author name in src/config.ts and these two paragraphs with your own, and the about page is done.',
      'This page also shows what the theme can do: a gradient-stroked heading, card-style site list, sticky-note block layout, and contrast that holds up in both light and dark mode.',
    ],
    contactHint: 'Point email / github in src/config.ts at your real accounts.',
    avatarAlt: (author: string) => `${author}'s avatar`,
    where: 'What is this',
    whereText: (site: string, theme: string, since: number) =>
      `${site} (${theme}) has been running since ${since}. It collects notes on building things for the web — tutorials, experiments, and small things worth keeping.`,
    sites: 'Sites',
    sitesDesc: 'Everything below is placeholder data — replace it with your own projects.',
    find: 'Find me',
    findDesc: 'Say hello anytime — no formalities needed.',
    stack: 'How it is built',
    stackDesc: 'Everything follows the official documentation. No custom framework layer.',
    guestbook: 'Comments',
    guestbookDesc: 'Leave a note at the bottom of any post, with an optional image up to 2MB.',
    stackItems: [
      { layer: 'Framework', value: 'Astro 7 · content collections + on-demand rendering', emoji: '🚀' },
      { layer: 'Hosting', value: 'Cloudflare Workers + Static Assets', emoji: '☁️' },
      { layer: 'Comments', value: 'D1 for rows, Actions for the API', emoji: '💬' },
      { layer: 'Views', value: 'KV counters with cookie dedupe', emoji: '👀' },
      { layer: 'Images', value: 'R2 uploads + Images binding', emoji: '🖼️' },
      { layer: 'Interactions', value: 'ClientRouter + Actions (official ajax)', emoji: '⚡' },
    ],
  },
  notFound: {
    title: 'Page not found',
    description: '404 · This page does not exist',
    heading: 'This page blew away',
    body: '404 · The page you are looking for does not exist. It may have been renamed or removed.',
    home: 'Back home',
    archives: 'Browse archives',
  },
  footer: {
    nav: 'Elsewhere',
    builtWith: 'Built with',
    builtWithTail: '',
    hostedOn: 'hosted on',
    rights: 'All rights reserved',
    themeCredit: (theme: string) => `Theme ${theme}`,
  },
  rss: {
    title: 'RSS',
  },
  pages: {
    pageTitle: (n: number) => `Page ${n}`,
    pageDescription: (site: string, n: number) => `${site} — page ${n} of the post list`,
  },
};

export const ui = { zh, en };

/** 取某语言的文案表 */
export const t = (lang: Lang) => ui[lang];

/** 给站内路径加语言前缀。中文是默认语言，不加前缀。 */
export function localizePath(lang: Lang, path: string): string {
  if (lang === DEFAULT_LANG) return path;
  return path === '/' ? '/en' : `/en${path}`;
}

/** 从 URL 判断当前语言 */
export function langFromPath(pathname: string): Lang {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : 'zh';
}

/** 去掉语言前缀，拿到语言无关的路径 */
export function unlocalizedPath(pathname: string): string {
  const stripped = pathname.replace(/^\/en(?=\/|$)/, '');
  return stripped === '' ? '/' : stripped;
}

/** 当前页在另一语言下的地址，用于语言切换按钮 */
export function alternatePath(pathname: string, target: Lang): string {
  return localizePath(target, unlocalizedPath(pathname));
}

export const otherLang = (lang: Lang): Lang => (lang === 'zh' ? 'en' : 'zh');
