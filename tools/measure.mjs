/**
 * 真机布局核验工具（本地开发用，不参与构建）。
 *
 * 用法：
 *   node tools/measure.mjs http://127.0.0.1:8787/ 390x844 desktop
 *
 * 做三件事：
 *   1) 按指定视口截图；
 *   2) 报告 documentElement.scrollWidth 对比视口宽度；
 *   3) 找出所有右边界超出视口的元素（按溢出量排序）。
 * 断点问题必须靠数字定位，不靠截图猜。
 */
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const [url = 'http://127.0.0.1:8787/', size = '390x844', name = 'shot'] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number);

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--disable-gpu', '--hide-scrollbars'],
});

const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: width < 700 });
await page.goto(url, { waitUntil: 'networkidle2' });
await new Promise((resolve) => setTimeout(resolve, 900));

const report = await page.evaluate(() => {
  const viewportWidth = document.documentElement.clientWidth;
  const overflow = [];
  for (const element of document.querySelectorAll('body *')) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const over = Math.round(rect.right - viewportWidth);
    if (over > 1) {
      overflow.push({
        over,
        tag: element.tagName.toLowerCase(),
        cls: element.className?.toString().slice(0, 60) ?? '',
        width: Math.round(rect.width),
      });
    }
  }
  overflow.sort((a, b) => b.over - a.over);
  return {
    viewportWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    overflow: overflow.slice(0, 12),
  };
});

await mkdir(new URL('../.shots/', import.meta.url), { recursive: true });
await page.screenshot({
  path: `E:/.WorkBuddy/2026-11-17-16-46-46/sakura-blog/.shots/${name}.png`,
  fullPage: false,
});

console.log(JSON.stringify({ url, size, ...report }, null, 2));
await browser.close();
