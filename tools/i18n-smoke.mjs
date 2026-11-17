import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] ?? 'http://127.0.0.1:8787';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const checks = [];
const errors = [];
const check = (name, pass, detail = '') => checks.push({ name, pass, detail });

const routes = [
  '/',
  '/en',
  '/posts/hello-world',
  '/en/posts/hello-world',
  '/archives',
  '/en/archives',
  '/tags',
  '/en/tags',
  '/rss.xml',
  '/en/rss.xml',
  '/sitemap-index.xml',
];

for (const route of routes) {
  const response = await fetch(new URL(route, BASE));
  check(`GET ${route}`, response.status === 200, `status=${response.status}`);
}

const homeHtml = await (await fetch(new URL('/', BASE))).text();
check(
  'home hreflang pairs',
  homeHtml.includes('hreflang="zh-CN"') && homeHtml.includes('hreflang="en"') && homeHtml.includes('/en'),
);

const rssEn = await (await fetch(new URL('/en/rss.xml', BASE))).text();
check('English RSS language', rssEn.includes('<language>en</language>'));

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--disable-gpu', '--hide-scrollbars'],
});

const page = await browser.newPage();
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(String(error)));
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });

await page.goto(new URL('/', BASE).href, { waitUntil: 'networkidle2' });
await page.click('.lang-btn');
await page.waitForFunction(() => location.pathname === '/en', { timeout: 15000 });
const enText = await page.evaluate(() => document.body.innerText);
check('English UI after switch', enText.includes('Start reading') && enText.includes('Latest posts'));

await page.goto(new URL('/en/posts/hello-world', BASE).href, { waitUntil: 'networkidle2' });
await page.click('.lang-btn');
await page.waitForFunction(() => location.pathname === '/posts/hello-world', { timeout: 15000 });
const zhText = await page.evaluate(() => document.body.innerText);
check('Chinese UI after switch', zhText.includes('本文目录') && zhText.includes('留言板'));

check('console clean', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();

const failed = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ checks, errors }, null, 2));
console.log(failed.length === 0 ? '\n全部通过' : `\n失败 ${failed.length} 项`);
process.exit(failed.length === 0 ? 0 : 1);
