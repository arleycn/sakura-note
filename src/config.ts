/**
 * 站点级常量与导航配置。
 * 改域名 / 站名 / 作者 / 导航项只动这一个文件。
 */
export const SITE = {
  url: 'https://sakura-blog.arley.cn',
  name: "Arley's Blog",
  /** 主题名，只用于页脚与关于页的署名，不参与 SEO 标题 */
  theme: '樱云小筑',
  tagline: '技术宅，喜欢折腾服务器、二次元和各种奇怪的小工具。',
  description: 'Arley 的个人博客：技术教程、二次元、资源整理与折腾记录。',
  author: 'Arley',
  email: 'arley@arley.cn',
  github: 'https://github.com/arleycn',
  telegram: 'https://t.me/Leoniceee',
  /** 建站年份，页脚版权区间与关于页用 */
  since: 2021,
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
  { href: 'https://t.me/Leoniceee', label: 'Telegram', emoji: '✈️' },
  { href: 'https://arley.cn', label: '主站', emoji: '🏠' },
  { href: '/rss.xml', label: 'RSS', emoji: '📮' },
] as const;

export interface SiteLink {
  name: string;
  url: string;
  desc: string;
  /** 卡片左侧的短标签，两三个字 */
  badge: string;
  current?: boolean;
}

/** 「我做的站」，关于页的引流入口 */
export const MY_SITES: SiteLink[] = [
  {
    name: 'Arley',
    url: 'https://arley.cn',
    desc: '个人主页，所有子站的入口都在这里。',
    badge: '主页',
  },
  {
    name: '樱云导航',
    url: 'https://bm.arley.cn',
    desc: '书签式站点导航，常用工具和资源一屏找齐。',
    badge: '导航',
  },
  {
    name: '樱云搜索',
    url: 'https://bm.arley.cn/search',
    desc: '聚合式搜索入口，一次输入跳多个引擎。',
    badge: '搜索',
  },
  {
    name: "Arley's 社区",
    url: 'https://bbs.arley.cn',
    desc: '论坛，聊技术也聊闲事，注册就能发帖。',
    badge: '社区',
  },
  {
    name: '樱云云盘',
    url: 'https://pan.arley.cn',
    desc: '资源、工具、软件和一整柜存货，慢慢翻。',
    badge: '云盘',
  },
  {
    name: '工具站',
    url: 'https://tools.arley.cn',
    desc: '在线小工具合集，日常常用的都在这里。',
    badge: '工具',
  },
  {
    name: '童年体验馆',
    url: 'https://fun.arley.cn',
    desc: '红白机卡带、老动画和放学后的游戏，都能再玩一次。',
    badge: '童年',
  },
  {
    name: SITE.name,
    url: '/',
    desc: '你正在看的这个站，写长文和技术记录的地方。',
    badge: '本站',
    current: true,
  },
];

/** 每页文章数：三列网格下一屏两行 */
export const PAGE_SIZE = 6;
