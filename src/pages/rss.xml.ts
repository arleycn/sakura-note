export const prerender = true;

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../config';
import { getPosts, postPath } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      // 显式给绝对地址：@astrojs/rss 会把相对 link 解析成带尾斜杠的形态，
      // 与站点 canonical（trailingSlash: 'never'）不一致。
      link: new URL(postPath(post), context.site ?? SITE.url).href,
      categories: post.data.tags,
    })),
    customData: '<language>zh-cn</language>',
  });
}
