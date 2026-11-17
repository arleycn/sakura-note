/**
 * 站点级常量与导航配置。
 * 改域名 / 站名 / 作者 / 导航项只动这一个文件。
 */
export const SITE = {
  url: 'https://sakura-blog.arley.cn',
  name: '樱云小筑',
  nameEn: "Sakura Note",
  tagline: 'さくらノート · 把喜欢的东西写下来',
  description:
    'Arley 的樱花主题博客：Astro 7 + Cloudflare 全家桶实战笔记，记录独立开发、边缘计算与二次元日常。',
  author: 'Arley',
  email: 'hi@arley.cn',
  locale: 'zh-CN',
  themeColor: { light: '#ffd7e9', dark: '#241b3a' },
} as const;

export const NAV = [
  { href: '/', label: '首页', emoji: '🌸' },
  { href: '/archives', label: '归档', emoji: '🗂️' },
  { href: '/tags', label: '标签', emoji: '🏷️' },
  { href: '/about', label: '关于', emoji: '🍡' },
  { href: '/search', label: '搜索', emoji: '🔍' },
] as const;

export const SOCIAL = [
  { href: 'https://github.com/arleycn', label: 'GitHub', emoji: '🐙' },
  { href: 'https://arley.cn', label: '主站', emoji: '🏠' },
  { href: '/rss.xml', label: 'RSS', emoji: '📮' },
] as const;

/** 每页文章数 */
export const PAGE_SIZE = 4;
