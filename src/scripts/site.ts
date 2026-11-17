import { actions, isInputError } from 'astro:actions';

/**
 * 全站客户端逻辑，统一挂在 astro:page-load 上：
 * ClientRouter 换页后 DOM 是新节点，必须每次重新绑定。
 */

const THEME_KEY = 'sakura-blog-theme';
const THEME_COLOR = { light: '#ffd7e9', dark: '#241b3a' } as const;

function syncThemeUi(theme: 'light' | 'dark') {
  document.querySelectorAll<HTMLMetaElement>('meta[data-theme-color]').forEach((meta) => {
    meta.content = THEME_COLOR[theme];
  });

  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/**
 * ClientRouter 换页时会把新文档的 <html> 属性带过来，
 * 手动写上的 data-theme 会丢。astro:after-swap 在新 DOM 落地、
 * 首次绘制之前触发，是恢复主题的唯一正确时机。
 */
function restoreThemeAfterSwap() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved !== 'light' && saved !== 'dark') return;
  document.documentElement.dataset.theme = saved;
  syncThemeUi(saved);
}

document.addEventListener('astro:after-swap', restoreThemeAfterSwap);

function initTheme() {
  const button = document.getElementById('theme-toggle');
  if (!button || button.dataset.bound === '1') return;

  const media = matchMedia('(prefers-color-scheme: dark)');
  const read = (): 'light' | 'dark' => {
    const attr = document.documentElement.dataset.theme;
    if (attr === 'light' || attr === 'dark') return attr;
    return media.matches ? 'dark' : 'light';
  };

  syncThemeUi(read());

  button.addEventListener('click', () => {
    const next = read() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    syncThemeUi(next);
  });

  media.addEventListener('change', (event) => {
    if (localStorage.getItem(THEME_KEY)) return;
    syncThemeUi(event.matches ? 'dark' : 'light');
  });

  button.dataset.bound = '1';
}

function initPetals() {
  const canvas = document.getElementById('petal-canvas') as HTMLCanvasElement | null;
  if (!canvas || canvas.dataset.started === '1') return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const COLORS = ['#ffb1d2', '#ff8fb8', '#ffd7e9', '#ffc2dc', '#f9a8c9'];
  const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4;

  type Petal = {
    x: number;
    y: number;
    r: number;
    angle: number;
    spin: number;
    vy: number;
    sway: number;
    swaySpeed: number;
    color: string;
    opacity: number;
  };

  let width = 0;
  let height = 0;
  let petals: Petal[] = [];
  let running = true;
  let frameId = 0;

  const spawn = (initial: boolean): Petal => ({
    x: Math.random() * width,
    y: initial ? Math.random() * height : -16,
    r: Math.random() * 5.5 + 3,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.05,
    vy: Math.random() * 0.7 + 0.4,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: Math.random() * 0.015 + 0.008,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0],
    opacity: Math.random() * 0.35 + 0.5,
  });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const fillPool = () => {
    let count = Math.min(Math.floor(width / (width < 760 ? 46 : 26)), 36);
    if (lowEnd) count = Math.ceil(count / 2);
    while (petals.length > count) petals.pop();
    while (petals.length < count) petals.push(spawn(true));
  };

  const frame = () => {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    for (const petal of petals) {
      petal.sway += petal.swaySpeed;
      petal.angle += petal.spin;
      petal.x += Math.sin(petal.sway) * 0.8;
      petal.y += petal.vy;

      if (petal.y > height + 16 || petal.x > width + 16) {
        Object.assign(petal, spawn(false));
      }

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.angle);
      ctx.globalAlpha = petal.opacity;
      ctx.fillStyle = petal.color;
      ctx.beginPath();
      ctx.moveTo(0, -petal.r);
      ctx.bezierCurveTo(petal.r * 0.9, -petal.r * 0.5, petal.r * 0.7, petal.r * 0.6, 0, petal.r);
      ctx.bezierCurveTo(-petal.r * 0.7, petal.r * 0.6, -petal.r * 0.9, -petal.r * 0.5, 0, -petal.r);
      ctx.fill();
      ctx.restore();
    }

    frameId = requestAnimationFrame(frame);
  };

  resize();
  fillPool();
  frameId = requestAnimationFrame(frame);
  canvas.dataset.started = '1';

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resize();
      fillPool();
    }, 200);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(frameId);
    } else if (!running) {
      running = true;
      frameId = requestAnimationFrame(frame);
    }
  });
}

function initBackTop() {
  const button = document.getElementById('backtop');
  if (!button || button.dataset.bound === '1') return;

  const onScroll = () => {
    button.classList.toggle('is-visible', window.scrollY > 520);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  onScroll();
  button.dataset.bound = '1';
}

async function initViews() {
  const targets = [...document.querySelectorAll<HTMLElement>('[data-views-post]')];
  if (targets.length === 0) return;

  for (const target of targets) {
    const postId = target.dataset.viewsPost;
    if (!postId || target.dataset.loaded === '1') continue;
    target.dataset.loaded = '1';

    const { data, error } = await actions.views.hit({ postId });
    if (error || !data) continue;

    const value = target.querySelector<HTMLElement>('[data-views-count]');
    if (value) value.textContent = String(data.views);
  }
}

function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < day * 30) return `${Math.floor(diff / day)} 天前`;

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
}

type CommentView = {
  id: string;
  author: string;
  body: string;
  imageUrl: string | null;
  createdAt: number;
};

function buildCommentNode(comment: CommentView, index: number): HTMLElement {
  const note = document.createElement('article');
  note.className = 'note';
  note.style.setProperty('--tilt', `${index % 2 === 0 ? -1 : 1}deg`);

  const head = document.createElement('div');
  head.className = 'note__head';

  const author = document.createElement('span');
  author.className = 'note__author';
  author.textContent = comment.author;

  const time = document.createElement('time');
  time.className = 'note__time';
  time.dateTime = new Date(comment.createdAt).toISOString();
  time.textContent = formatRelative(comment.createdAt);

  head.appendChild(author);
  head.appendChild(time);

  const body = document.createElement('p');
  body.className = 'note__body';
  body.textContent = comment.body;

  note.appendChild(head);
  note.appendChild(body);

  if (comment.imageUrl) {
    const image = document.createElement('img');
    image.className = 'note__image';
    image.src = comment.imageUrl;
    image.alt = `${comment.author} 上传的配图`;
    image.loading = 'lazy';
    image.decoding = 'async';
    note.appendChild(image);
  }

  return note;
}

let turnstileWidget: string | null = null;

function renderTurnstile() {
  const slot = document.getElementById('turnstile-slot');
  const api = (window as unknown as { turnstile?: { render: (el: HTMLElement, opts: object) => string; reset: (id: string) => void } }).turnstile;
  if (!slot || !api) return;
  if (slot.dataset.rendered === '1') return;

  turnstileWidget = api.render(slot, {
    sitekey: slot.dataset.sitekey,
    theme: 'auto',
  });
  slot.dataset.rendered = '1';
}

function initComments() {
  const form = document.getElementById('comment-form') as HTMLFormElement | null;
  const list = document.getElementById('comment-list');
  if (!form || !list || form.dataset.bound === '1') return;

  const postId = form.dataset.postId;
  if (!postId) return;

  const status = document.getElementById('comment-status');
  const empty = document.getElementById('comment-empty');
  const count = document.getElementById('comment-count');
  const submit = document.getElementById('comment-submit') as HTMLButtonElement | null;

  const setStatus = (message: string, state: 'ok' | 'error' | '') => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  };

  const renderList = (comments: CommentView[]) => {
    list.replaceChildren(...comments.map((comment, index) => buildCommentNode(comment, index)));
    if (empty) empty.hidden = comments.length > 0;
    if (count) count.textContent = comments.length > 0 ? `${comments.length} 条` : '';
  };

  const load = async () => {
    const { data, error } = await actions.comments.list({ postId });
    if (error || !data) return;
    renderList(data.comments);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const author = String(formData.get('author') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();

    if (author.length === 0) {
      setStatus('先留个昵称吧～', 'error');
      return;
    }
    if (body.length < 2) {
      setStatus('内容太短啦，至少写两个字', 'error');
      return;
    }

    submit?.setAttribute('disabled', '');
    setStatus('正在发送…', '');

    const { data, error } = await actions.comments.add(formData);

    submit?.removeAttribute('disabled');

    if (error) {
      const message = isInputError(error)
        ? '昵称或内容不符合要求，检查一下长度'
        : error.message || '发送失败，稍后再试';
      setStatus(message, 'error');
      return;
    }

    if (data?.comment) {
      list.insertBefore(buildCommentNode(data.comment, 0), list.firstChild);
      if (empty) empty.hidden = true;
      const total = list.querySelectorAll('.note').length;
      if (count) count.textContent = `${total} 条`;
    }

    form.reset();
    if (turnstileWidget) {
      (window as unknown as { turnstile?: { reset: (id: string) => void } }).turnstile?.reset(turnstileWidget);
    }
    setStatus('留言成功，谢谢你 (๑˃̵ᴗ˂̵)و', 'ok');
  });

  form.dataset.bound = '1';
  void load();
}

function initSearchShortcut() {
  if (document.documentElement.dataset.searchBound === '1') return;
  document.documentElement.dataset.searchBound = '1';

  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (target?.isContentEditable) return;
    event.preventDefault();
    window.location.href = '/search';
  });
}

function init() {
  initTheme();
  initPetals();
  initBackTop();
  initSearchShortcut();
  renderTurnstile();
  void initViews();
  initComments();
}

document.addEventListener('astro:page-load', init);

if (document.readyState === 'complete') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init, { once: true });
}
