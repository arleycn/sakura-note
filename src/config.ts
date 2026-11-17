/**
 * 站点级常量与导航配置。
 * 默认值全部是 example.com 占位，符合 Astro 主题目录的收录要求。
 */
export const SITE = {
  url: import.meta.env.PUBLIC_SITE_URL ?? 'https://example.com',
  name: 'Sakura Note',
  theme: 'Sakura Note',
  author: 'Sakura',
  email: 'hello@example.com',
  github: 'https://github.com',
  since: 2026,
  themeColor: { light: '#ffd7e9', dark: '#241b3a' },
  repo: 'https://github.com/arleycn/sakura-note',
} as const;

/** href 不带语言前缀，渲染时按当前语言补。 */
export const NAV = [
  { href: '/', label: 'home', emoji: '🌸' },
  { href: '/archives', label: 'archives', emoji: '🗂️' },
  { href: '/tags', label: 'tags', emoji: '🏷️' },
  { href: '/about', label: 'about', emoji: '🍡' },
  { href: '/search', label: 'search', emoji: '🔍' },
] as const;

export type NavLabel = (typeof NAV)[number]['label'];

/** 页脚与关于页的社交入口，全部是占位地址 */
export const SOCIAL = [
  { href: 'https://github.com', label: 'GitHub', emoji: '🐙' },
  { href: 'https://example.com', label: 'Blog', emoji: '🏠' },
  { href: '/rss.xml', label: 'RSS', emoji: '📮' },
  { href: SITE.repo, label: 'Source', emoji: '🧩' },
] as const;

export interface SiteLink {
  name: string;
  url: string;
  badge: { zh: string; en: string };
  desc: { zh: string; en: string };
  current?: boolean;
}

/** 关于页的示例站点卡片，全部是占位数据。 */
export const MY_SITES: SiteLink[] = [
  {
    name: 'Example Home',
    url: 'https://example.com',
    badge: { zh: '主页', en: 'Home' },
    desc: {
      zh: '示例站点一，用来展示卡片布局。',
      en: 'Sample site one, showing the card layout.',
    },
  },
  {
    name: 'Example Notes',
    url: 'https://example.com/notes',
    badge: { zh: '笔记', en: 'Notes' },
    desc: {
      zh: '示例站点二，换成你自己的项目即可。',
      en: 'Sample site two — swap in your own project.',
    },
  },
  {
    name: SITE.name,
    url: '/',
    badge: { zh: '本站', en: 'This site' },
    desc: {
      zh: '你正在看的这个博客。',
      en: 'The blog you are reading right now.',
    },
    current: true,
  },
];

/** 每页文章数：三列网格，两行正好一屏 */
export const PAGE_SIZE = 6;
