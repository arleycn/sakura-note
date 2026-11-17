import puppeteer from 'puppeteer-core';

const BASE = process.env.PERF_BASE ?? 'http://127.0.0.1:8787';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const VARIANTS = {
  full: '',
  noBlur: `.topnav{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:rgba(255,255,255,.86)!important}`,
  noCanvas: `#petal-canvas{display:none!important}`,
  noInfinite: `*{animation-iteration-count:1!important;animation-duration:0.001s!important}`,
  noMotion: `*,*::before,*::after{animation:none!important;transition:none!important}`,
};

const run = async (name, css, jsKillCanvas) => {
  const b = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--force-device-scale-factor=1', '--disable-features=CalculateNativeWinOcclusion'],
  });
  const page = await b.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  if (jsKillCanvas) {
    await page.evaluateOnNewDocument(() => {
      HTMLCanvasElement.prototype.getContext = () => null;
    });
  }
  if (css) {
    await page.evaluateOnNewDocument((c) => {
      const inject = () => {
        const s = document.createElement('style');
        s.textContent = c;
        document.head.appendChild(s);
      };
      if (document.head) inject();
      else document.addEventListener('DOMContentLoaded', inject);
    }, css);
  }

  const cdp = await page.createCDPSession();
  await cdp.send('Performance.enable');
  await cdp.send('LayerTree.enable');
  let maxLayers = 0;
  cdp.on('LayerTree.layerTreeDidChange', (e) => {
    if (e.layers) maxLayers = Math.max(maxLayers, e.layers.length);
  });

  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  const get = async () => {
    const { metrics } = await cdp.send('Performance.getMetrics');
    return Object.fromEntries(metrics.map((x) => [x.name, x.value]));
  };

  // 纯 idle 3s（不断滚动，模拟人浏览）
  const m0 = await get();
  const gaps = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const g = [];
        let last = performance.now();
        let n = 0;
        let y = 0;
        const tick = () => {
          const now = performance.now();
          g.push(now - last);
          last = now;
          y += 22;
          window.scrollTo({ top: y, behavior: 'instant' });
          if (++n < 160) requestAnimationFrame(tick);
          else resolve(g);
        };
        requestAnimationFrame(tick);
      }),
  );
  const m1 = await get();

  const sorted = [...gaps].sort((a, b) => a - b);
  const p = (q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const anims = await page.evaluate(() => document.getAnimations().length);

  await b.close();
  return {
    variant: name,
    fps: +(1000 / mean).toFixed(1),
    p50: +p(0.5).toFixed(2),
    p95: +p(0.95).toFixed(2),
    max: +Math.max(...gaps).toFixed(1),
    over20: gaps.filter((x) => x > 20).length,
    over33: gaps.filter((x) => x > 33).length,
    taskMs: +((m1.TaskDuration - m0.TaskDuration) * 1000).toFixed(1),
    styleMs: +((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000).toFixed(1),
    scriptMs: +((m1.ScriptDuration - m0.ScriptDuration) * 1000).toFixed(1),
    layers: maxLayers,
    anims,
  };
};

const rows = [];
for (const [name, css] of Object.entries(VARIANTS)) {
  rows.push(await run(name, css, false));
}
rows.push(await run('noCanvas+noBlur', VARIANTS.noBlur, true));

console.table(rows);
