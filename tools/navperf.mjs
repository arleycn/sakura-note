import puppeteer from 'puppeteer-core';

const BASE = process.env.PERF_BASE ?? 'http://127.0.0.1:8787';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const b = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=1'],
});
const page = await b.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 1500));

// 1) 入场动画实际时长：从点击到 .post-card 全部 opacity=1 / transform 归位
const navResult = await page.evaluate(async () => {
  const list = [...document.querySelectorAll('a[href^="/posts/"]')];
  const link = list.find((a) => a.closest('.post-card')) ?? list[0];
  const href = link.getAttribute('href');

  const t0 = performance.now();
  link.click();

  // 等 URL 变化
  await new Promise((resolve) => {
    const iv = setInterval(() => {
      if (location.pathname === href) {
        clearInterval(iv);
        resolve();
      }
      if (performance.now() - t0 > 8000) {
        clearInterval(iv);
        resolve();
      }
    }, 16);
  });
  const tUrl = performance.now() - t0;

  // 等标题出现
  await new Promise((resolve) => {
    const iv = setInterval(() => {
      if (document.querySelector('.post__title, h1')) {
        clearInterval(iv);
        resolve();
      }
      if (performance.now() - t0 > 8000) {
        clearInterval(iv);
        resolve();
      }
    }, 16);
  });
  const tTitle = performance.now() - t0;

  // 等所有入场动画结束（没有 running 的 animation）
  const waitAnims = async () => {
    const until = performance.now() + 3000;
    while (performance.now() < until) {
      const running = document.getAnimations().filter((a) => a.playState === 'running');
      if (running.length === 0) break;
      await new Promise((r) => setTimeout(r, 30));
    }
  };
  await waitAnims();
  const tSettled = performance.now() - t0;

  const anims = document.getAnimations().map((a) => ({
    name: a.animationName ?? a.constructor.name,
    dur: Math.round(a.effect?.getTiming?.().duration ?? 0),
  }));

  return {
    href,
    urlMs: Math.round(tUrl),
    titleMs: Math.round(tTitle),
    settledMs: Math.round(tSettled),
    animCount: anims.length,
    anims: anims.slice(0, 12),
  };
});

// 2) 直接加载同一篇文章（无过渡）作为对照
const t0 = Date.now();
await page.goto(BASE + navResult.href, { waitUntil: 'networkidle2' });
const directMs = Date.now() - t0;
await new Promise((r) => setTimeout(r, 800));
const directSettle = await page.evaluate(async () => {
  const until = performance.now() + 3000;
  while (performance.now() < until) {
    if (document.getAnimations().filter((a) => a.playState === 'running').length === 0) break;
    await new Promise((r) => setTimeout(r, 30));
  }
  return document.getAnimations().length;
});

// 3) 主题切换耗时
const themeMs = await page.evaluate(async () => {
  const t = performance.now();
  document.querySelector('.theme-toggle, #theme-toggle, [data-theme-toggle]')?.click() ??
    document.documentElement.setAttribute('data-theme', 'dark');
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return Math.round(performance.now() - t);
});

console.log(
  JSON.stringify(
    { route: navResult, directLoadMs: directMs, directAnimCount: directSettle, themeSwapMs: themeMs },
    null,
    2,
  ),
);
await b.close();
