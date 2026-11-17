/**
 * 交互冒烟（本地开发用）：直接驱动真实浏览器，验证
 * 主题切换 / ClientRouter 无刷新导航 / 评论提交 / 阅读量 / 控制台报错。
 *
 * 用法：先起 wrangler dev，再 `node tools/smoke.mjs http://127.0.0.1:8787`
 */
import puppeteer from 'puppeteer-core';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.argv[2] ?? 'http://127.0.0.1:8787';
// 用首页第一页上的一篇真实文章做导航与评论目标
const TARGET = '/posts/hello-world';

const results = [];
const errors = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
};

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
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });

// 1. 主题切换
const before = await page.evaluate(() => document.documentElement.dataset.theme);
await page.click('#theme-toggle');
await new Promise((resolve) => setTimeout(resolve, 250));
const after = await page.evaluate(() => ({
  theme: document.documentElement.dataset.theme,
  saved: localStorage.getItem('sakura-note-theme'),
  bg: getComputedStyle(document.body).backgroundColor,
  meta: document.querySelector('meta[data-theme-color]')?.getAttribute('content'),
}));
check('主题切换', after.theme !== before && after.saved === after.theme, JSON.stringify(after));

// 2. ClientRouter 无刷新导航
await page.evaluate(() => {
  window.__marker = 'kept';
});
const target = await page.$(`a[href="${TARGET}"]`);
if (!target) {
  check('找到文章链接', false);
} else {
  await page.evaluate((path) => {
    document
      .querySelector(`a[href="${path}"]`)
      ?.scrollIntoView({ behavior: 'instant', block: 'center' });
  }, TARGET);
  await new Promise((resolve) => setTimeout(resolve, 120));
  await target.click();
  await page.waitForFunction(
    (path) => location.pathname === path,
    { timeout: 15000 },
    TARGET,
  );
  const kept = await page.evaluate(() => window.__marker === 'kept');
  const themeKept = await page.evaluate(() => document.documentElement.dataset.theme);
  check('ClientRouter 无刷新导航', kept, `window 标记保留=${kept}`);
  check('导航后主题保持', themeKept === after.theme, `theme=${themeKept}`);
}

// 3. 阅读量（页面加载后由 Actions 写入）
await page.waitForFunction(
  () => {
    const el = document.querySelector('[data-views-count]');
    return el && el.textContent !== '—';
  },
  { timeout: 15000 },
);
const views = await page.$eval('[data-views-count]', (el) => el.textContent);
check('阅读量计数', Number(views) >= 1, `views=${views}`);

// 4. 评论提交（换一个客户端 IP，避免与 curl 测的限流窗口冲突）
await page.setExtraHTTPHeaders({
  'CF-Connecting-IP': `203.0.113.${Math.floor(Math.random() * 200) + 10}`,
});
const author = `Smoke${Date.now().toString().slice(-5)}`;
await page.type('#comment-author', author, { delay: 10 });
await page.type('#comment-body', 'Browser smoke test: this note should appear in the list.', { delay: 5 });
await page.evaluate(() => {
  document.querySelector('#comment-form')?.scrollIntoView({ behavior: 'instant', block: 'center' });
});
await new Promise((resolve) => setTimeout(resolve, 120));
await page.click('#comment-submit');
await page.waitForFunction(
  (name) =>
    [...document.querySelectorAll('.note__author')].some((el) => el.textContent === name),
  { timeout: 20000 },
  author,
);
const status = await page.$eval('#comment-status', (el) => ({
  text: el.textContent,
  state: el.dataset.state,
}));
const count = await page.$$eval('.note', (nodes) => nodes.length);
check('评论提交并上屏', status.state === 'ok' && count >= 1, `count=${count} status=${status.text}`);

// 5. 刷新后评论仍在（D1 持久化）
await page.reload({ waitUntil: 'networkidle2' });
await page.waitForFunction(
  (name) => [...document.querySelectorAll('.note__author')].some((el) => el.textContent === name),
  { timeout: 20000 },
  author,
);
check('刷新后评论仍在', true);

// 6. 移动端无横向溢出
await page.setViewport({ width: 390, height: 844, isMobile: true });
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
const mobile = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));
check('移动端无横向溢出', mobile.scrollWidth <= mobile.clientWidth, JSON.stringify(mobile));

// 7. 控制台无报错
check('控制台无报错', errors.length === 0, errors.slice(0, 3).join(' | '));

await browser.close();

const failed = results.filter((item) => !item.pass);
console.log(JSON.stringify({ results, errors }, null, 2));
console.log(failed.length === 0 ? '\n全部通过' : `\n失败 ${failed.length} 项`);
process.exit(failed.length === 0 ? 0 : 1);
