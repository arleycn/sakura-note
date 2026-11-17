import puppeteer from 'puppeteer-core';

const BASE = process.env.PERF_BASE ?? 'http://127.0.0.1:8787';
const LABEL = process.argv[2] ?? 'baseline';
const MOBILE = process.argv.includes('--mobile');
const CSS_OFF = process.env.PERF_CSS_OFF ?? '';
const ROUTE = process.env.PERF_ROUTE ?? '/';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const b = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--disable-gpu-sandbox', '--no-sandbox', '--force-device-scale-factor=1'],
});

const page = await b.newPage();
await page.setViewport({
  width: MOBILE ? 390 : 1440,
  height: MOBILE ? 844 : 900,
  deviceScaleFactor: MOBILE ? 2 : 1,
});

if (CSS_OFF) {
  await page.evaluateOnNewDocument((css) => {
    const inject = () => {
      const s = document.createElement('style');
      s.textContent = css;
      document.head.appendChild(s);
    };
    if (document.head) inject();
    else document.addEventListener('DOMContentLoaded', inject);
  }, CSS_OFF);
}

const cdp = await page.createCDPSession();
await cdp.send('Performance.enable');

await page.goto(BASE + ROUTE, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));

const metrics = async () => {
  const { metrics } = await cdp.send('Performance.getMetrics');
  const m = Object.fromEntries(metrics.map((x) => [x.name, x.value]));
  return m;
};

// 1) 空闲帧采样
const sampleIdle = () =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        const gaps = [];
        let last = performance.now();
        let n = 0;
        const tick = () => {
          const now = performance.now();
          gaps.push(now - last);
          last = now;
          if (++n < 180) requestAnimationFrame(tick);
          else resolve(gaps);
        };
        requestAnimationFrame(tick);
      }),
  );

// 2) 滚动帧采样
const sampleScroll = () =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        const gaps = [];
        let last = performance.now();
        let n = 0;
        let y = 0;
        const tick = () => {
          const now = performance.now();
          gaps.push(now - last);
          last = now;
          y += 18;
          window.scrollTo({ top: y, behavior: 'instant' });
          if (++n < 150) requestAnimationFrame(tick);
          else {
            window.scrollTo({ top: 0, behavior: 'instant' });
            resolve(gaps);
          }
        };
        requestAnimationFrame(tick);
      }),
  );

await page.evaluate(() => {
  window.__long = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) window.__long.push(Math.round(e.duration));
  }).observe({ entryTypes: ['longtask'] });
});

const stat = (gaps) => {
  const sorted = [...gaps].sort((a, b) => a - b);
  const p = (q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const jank = gaps.filter((g) => g > 20).length;
  const drop = gaps.filter((g) => g > 33).length;
  return {
    frames: gaps.length,
    avgMs: +mean.toFixed(2),
    fps: +(1000 / mean).toFixed(1),
    p50: +p(0.5).toFixed(2),
    p95: +p(0.95).toFixed(2),
    max: +Math.max(...gaps).toFixed(1),
    jank20: jank,
    drop33: drop,
  };
};

const before = await metrics();
const idle = stat(await sampleIdle());
const scroll = stat(await sampleScroll());
const after = await metrics();
const longtasks = await page.evaluate(() => window.__long);

const delta = (k) => +(after[k] - before[k]).toFixed(3);

const out = {
  label: LABEL,
  route: ROUTE,
  viewport: MOBILE ? '390x844@2x' : '1440x900@1x',
  idle,
  scroll,
  longtasks: { count: longtasks.length, durations: longtasks },
  mainThread: {
    taskSec: delta('TaskDuration'),
    scriptSec: delta('ScriptDuration'),
    styleSec: delta('RecalcStyleDuration'),
    layoutSec: delta('LayoutDuration'),
    styleCount: delta('RecalcStyleCount'),
    layoutCount: delta('LayoutCount'),
    nodes: after.Nodes,
    listeners: after.JSEventListeners,
    heapMB: +(after.JSHeapUsedSize / 1048576).toFixed(1),
  },
};
console.log(JSON.stringify(out, null, 2));
await b.close();
