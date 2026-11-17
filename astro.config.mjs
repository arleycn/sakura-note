// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

/**
 * 站点正式域名。sitemap / canonical / RSS / OG 都以此为准，
 * 换域名只改这一处（Cloudflare 上再把 workers.dev 跳过来）。
 */
const SITE = 'https://sakura-blog.arley.cn';

export default defineConfig({
  site: SITE,

  // Astro 7 + Cloudflare 的官方组合：默认按需渲染，
  // 内容页用 `export const prerender = true` 在构建期产出静态资产，
  // 由 Workers Static Assets 直接从边缘返回，不消耗 Worker 调用。
  output: 'server',

  adapter: cloudflare({
    // 构建期用 Sharp，运行期用 Cloudflare Images binding（官方默认方向）。
    imageService: { build: 'compile', runtime: 'cloudflare-binding' },
  }),

  // 站内 URL 统一不带尾斜杠，与 wrangler 的 html_handling: drop-trailing-slash 对齐；
  // sitemap / RSS / canonical 三处才不会出现 /posts/x 与 /posts/x/ 两种形态。
  trailingSlash: 'never',

  // Astro 7 默认 compressHTML: 'jsx' 会按 JSX 规则吃掉行内元素间的空格，
  // 中文排版下容易出现「词黏在一起」。改回 HTML 语义压缩。
  compressHTML: true,

  // 官方预取：只对悬停/聚焦的链接预取，不整站预取，
  // 避免边缘站点被批量预取打出无谓请求。
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },

  markdown: {
    shikiConfig: {
      // 必须双主题：单主题会把颜色内联死在标签上，日/夜切换时深色代码块在日间读不清。
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },

  integrations: [
    sitemap({
      // 404 / 搜索页不参与收录
      filter: (page) => !page.includes('/404') && !page.includes('/search'),
    }),
  ],

  // 官方类型安全环境变量（astro:env）。
  // secret 只在服务端可读；PUBLIC_ 前缀的会被打进客户端，绝不放密钥。
  env: {
    schema: {
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
});
