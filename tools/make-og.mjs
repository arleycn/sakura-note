/**
 * 生成默认分享图 public/images/og-default.png（1200×630）。
 * 手写这个小工具的原因：OG 图需要位图，而站点没有引入设计资源。
 * 用法：node tools/make-og.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffd7e9"/>
      <stop offset="0.45" stop-color="#f0ddff"/>
      <stop offset="100%" stop-color="#cfe8ff"/>
    </linearGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ff6fa5"/>
      <stop offset="0.55" stop-color="#a06ee8"/>
      <stop offset="1" stop-color="#6fc3ff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <g fill="#ffffff" opacity="0.75">
    <circle cx="150" cy="120" r="3"/><circle cx="320" cy="80" r="2"/><circle cx="520" cy="140" r="2.4"/>
    <circle cx="880" cy="96" r="3"/><circle cx="1050" cy="160" r="2"/><circle cx="980" cy="60" r="2.6"/>
    <circle cx="240" cy="520" r="2.4"/><circle cx="420" cy="560" r="2"/><circle cx="1120" cy="520" r="2.4"/>
  </g>
  <g fill="#ff9ec4" opacity="0.55">
    <ellipse cx="120" cy="300" rx="16" ry="9" transform="rotate(-24 120 300)"/>
    <ellipse cx="1080" cy="420" rx="18" ry="10" transform="rotate(18 1080 420)"/>
    <ellipse cx="980" cy="220" rx="13" ry="7" transform="rotate(-12 980 220)"/>
    <ellipse cx="200" cy="470" rx="14" ry="8" transform="rotate(26 200 470)"/>
  </g>
  <g transform="translate(600 190) scale(1.55)" fill="#ff8fb8" opacity="0.9">
    <path d="M0 0C-6 -8 -6 -20 0 -25c6 5 6 17 0 25Z"/>
    <path d="M0 0C-6 -8 -6 -20 0 -25c6 5 6 17 0 25Z" transform="rotate(72)"/>
    <path d="M0 0C-6 -8 -6 -20 0 -25c6 5 6 17 0 25Z" transform="rotate(144)"/>
    <path d="M0 0C-6 -8 -6 -20 0 -25c6 5 6 17 0 25Z" transform="rotate(216)"/>
    <path d="M0 0C-6 -8 -6 -20 0 -25c6 5 6 17 0 25Z" transform="rotate(288)"/>
  </g>
  <text x="600" y="330" text-anchor="middle" font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif"
        font-size="86" font-weight="700" fill="url(#ink)" letter-spacing="6">樱云小筑</text>
  <text x="600" y="392" text-anchor="middle" font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif"
        font-size="26" fill="#6f6178" letter-spacing="4">SAKURA NOTE · 把喜欢的东西写下来</text>
  <text x="600" y="510" text-anchor="middle" font-family="Consolas, monospace"
        font-size="20" fill="#8b5cd6" letter-spacing="2">ASTRO 7 × CLOUDFLARE WORKERS</text>
</svg>`;

const outDir = new URL('../public/images/', import.meta.url);
await mkdir(outDir, { recursive: true });

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile(new URL('og-default.png', outDir), png);

console.log(`og-default.png ${(png.length / 1024).toFixed(1)} KB`);
