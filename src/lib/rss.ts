import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../config';
import { LANG_HTML, t, type Lang } from './i18n';
import { getPosts, postPath } from './posts';

export async function renderRss(context: APIContext, lang: Lang) {
  const posts = await getPosts(lang);
  const strings = t(lang);

  return rss({
    title: `${SITE.name} · ${strings.rss.title}`,
    description: strings.meta.description(SITE.name),
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: new URL(postPath(post), context.site ?? SITE.url).href,
      categories: post.data.tags,
    })),
    customData: `<language>${LANG_HTML[lang]}</language>`,
  });
}
