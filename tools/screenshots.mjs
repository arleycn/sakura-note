import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] ?? 'http://127.0.0.1:8787';
const EDGE = process.env.EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const screenshotDir = fileURLToPath(new URL('../screenshots/', import.meta.url));
await mkdir(screenshotDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--disable-gpu', '--hide-scrollbars'],
});

const page = await browser.newPage();

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(new URL('/', BASE).href, { waitUntil: 'networkidle2' });
await new Promise((resolve) => setTimeout(resolve, 1200));
await page.screenshot({ path: `${screenshotDir}desktop.png` });

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true });
await page.goto(new URL('/', BASE).href, { waitUntil: 'networkidle2' });
await new Promise((resolve) => setTimeout(resolve, 1200));
await page.screenshot({ path: `${screenshotDir}mobile.png` });

await browser.close();
console.log('screenshots/desktop.png');
console.log('screenshots/mobile.png');
