export const prerender = true;

import type { APIContext } from 'astro';
import { renderRss } from '../lib/rss';

export function GET(context: APIContext) {
  return renderRss(context, 'zh');
}
