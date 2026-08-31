// ============================================================
// ui.js — 阅读器 / 顶栏 / 账本 / toast。整局叙事都通过 R 输出。
// ============================================================
import { S, CH, onChange, has } from './state.js';
import { sfx } from './audio.js';

const $ = s => document.querySelector(s);
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

const stream = () => $('#stream');
const reader = () => $('#reader');

let waiter = null;          // 等待点击的 resolve
let skipTyping = false;

// ─────────── 点击推进 ───────────
function armTap() {
  const onTap = e => {
    if (e.target.closest('button,a,input,.no-tap')) return;
    if (skipTyping === false && typing) { skipTyping = true; return; }
    if (waiter) { const w = waiter; waiter = null; w(); }
  };
  reader().addEventListener('click', onTap);
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      if (typing) { skipTyping = true; return; }
      if (waiter) { const w = waiter; waiter = null; w(); }
    }
  });
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));
export function beat() {
  $('#tap-hint').textContent = '点击任意处继续 ▸';
  if (S.auto) return sleep(720);
  return new Promise(r => { waiter = r; });
}

function scroll() { const r = reader(); r.scrollTop = r.scrollHeight; }

// ─────────── 文本类型 ───────────
const STYLE = {
  nar:   'text-neutral-300',
  dim:   'text-neutral-500 text-[14px]',
  her:   'text-rose pl-4 border-l-2 border-rose/40',
  me:    'text-neutral-200 pl-4 border-l-2 border-neutral-600',
  mama:  'text-rose pl-4 border-l-2 border-rose/70',
  ai:    'font-mono text-sea text-[13.5px] pl-4 border-l-2 border-sea/40',
  sys:   'font-mono text-bruise text-[12.5px] tracking-wide',
  num:   'font-mono text-bruise text-[15px]',
  quiet: 'text-neutral-600 italic',
  head:  'text-bruise text-lg font-bold tracking-widest'
};

let typing = false;
export async function say(text, kind = 'nar', opts = {}) {
  const p = el('p', `beat ${STYLE[kind] || STYLE.nar}`);
  stream().appendChild(p);
  scroll();
  const speed = opts.speed ?? (kind === 'ai' ? 26 : 17);
  typing = true; skipTyping = false;
  let buf = '';
  p.classList.add('caret');
  for (let i = 0; i < text.length; i++) {
    buf += text[i];
    p.textContent = buf;
    if (skipTyping) { p.textContent = text; break; }
    if (i % 2 === 0 && text[i].trim()) sfx.type();
    await sleep(speed);
    if (i % 12 === 0) scroll();
  }
  p.textContent = text;
  p.classList.remove('caret');
  typing = false;
  scroll();
  if (opts.wait !== false) await beat();
  return p;
}

// 沉默：不打字，只留白与呼吸
export async function silence(ms = 2200, label = '（沉默）') {
  const p = el('p', 'beat text-neutral-700 italic text-[13px] tracking-[0.3em]', label);
  stream().appendChild(p); scroll();
  const t = performance.now();
  const iv = setInterval(() => {
    const d = ((performance.now() - t) / 1000).toFixed(1);
    p.textContent = `${label} ${d}s`;
  }, 100);
  await sleep(ms);
  clearInterval(iv);
  p.classList.add('opacity-60');
}

// 一行居中的重量/数字
export async function weight(a, b) {
  const box = el('div', 'beat my-6 rounded-xl border hairline bg-ink-900/60 px-5 py-4 text-center');
  box.innerHTML = `<div class="text-[12px] text-neutral-500">${a}</div><div class="mt-1 font-mono text-2xl text-bruise">${b}</div>`;
  stream().appendChild(box); scroll(); sfx.coin();
  await beat();
}

// 章节标题卡
export async function chapterCard(i) {
  const box = el('div', 'beat my-8 text-center');
  box.innerHTML = `<div class="font-mono text-[10px] tracking-[0.5em] text-neutral-600">CHAPTER ${i}</div>
    <div class="mt-2 text-2xl font-bold tracking-widest text-bruise">${CH[i]}</div>
    <div class="mx-auto mt-3 h-px w-16 bg-bruise/40"></div>`;
  stream().appendChild(box); scroll(); sfx.pick();
  await sleep(900);
}

// 灰色批注：与那四十几页对不上的地方
export function annotate(p, txt) {
  const n = el('div', 'mt-1 pl-4 font-mono text-[11px] text-neutral-600', `⌐ ${txt}`);
  p.after(n); scroll();
}

export function clearStream() { stream().innerHTML = ''; }

// ─────────── 选项 ───────────
export function choose(prompt, opts) {
  return new Promise(resolve => {
    const wrap = $('#choices');
    wrap.innerHTML = '';
    if (prompt) wrap.appendChild(el('div', 'font-mono text-[11px] tracking-widest text-neutral-600 mb-1', prompt));
    $('#tap-hint').textContent = '做出选择';
    opts.forEach((o, i) => {
      if (o.hide && o.hide()) return;
      const b = el('button', 'opt no-tap w-full rounded-xl px-4 py-3 text-left');
      b.innerHTML = `
        <div class="flex items-start gap-3">
          <span class="mt-0.5 font-mono text-[11px] text-bruise shrink-0">${'ABCDEF'[i]}</span>
          <div class="min-w-0">
            <div class="text-[14.5px] text-neutral-200">${o.t}</div>
            ${o.sub ? `<div class="mt-1 text-[11px] text-neutral-500">${o.sub}</div>` : ''}
          </div>
        </div>`;
      b.onclick = () => { sfx.click(); wrap.innerHTML = ''; resolve(o); };
      wrap.appendChild(b);
    });
    scroll();
  });
}

// 回显玩家选择
export async function echoChoice(text) {
  const p = el('p', 'beat text-neutral-200 pl-4 border-l-2 border-bruise/60');
  p.textContent = text;
  stream().appendChild(p); scroll();
  await sleep(260);
}

// ─────────── toast ───────────
export function toast(html, tone = 'gold') {
  const map = { gold: 'border-bruise/50 text-bruise', sea: 'border-sea/50 text-sea', rose: 'border-rose/50 text-rose', gray: 'border-neutral-700 text-neutral-400' };
  const t = el('div', `rounded-full border ${map[tone]} bg-ink-900/95 px-4 py-2 font-mono text-[11.5px] shadow-lg`, html);
  t.style.animation = 'rise .3s both';
  $('#toast-wrap').appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .5s,transform .5s'; t.style.opacity = 0; t.style.transform = 'translateY(-8px)'; }, 2100);
  setTimeout(() => t.remove(), 2700);
}

// ─────────── 顶栏 ───────────
const BARS = [
  { k: 'heart',   n: '心动',   c: 'var(--bar-heart)' },
  { k: 'dignity', n: '尊严',   c: 'var(--bar-dignity)' },
  { k: 'vacancy', n: '空置',   c: 'var(--bar-vacancy)' },
  { k: 'echo',    n: '回声',   c: 'var(--bar-echo)' }
];

export function buildHUD() {
  $('#hud-bars').innerHTML = BARS.map(b => `
    <div class="min-w-0" data-bar="${b.k}">
      <div class="flex items-baseline justify-between gap-1">
        <span class="text-[10px] text-neutral-500">${b.n}</span>
        <span class="font-mono text-[11px]" data-val="${b.k}" style="color:${b.c}">0</span>
      </div>
      <div class="mt-1 h-1 rounded bg-ink-600 overflow-hidden relative">
        <div class="h-full transition-all duration-500" data-fill="${b.k}" style="width:0%;background:${b.c}"></div>
      </div>
    </div>`).join('');

  $('#chapters').innerHTML = CH.map((c, i) =>
    `<li data-ch="${i}" class="flex items-center gap-2"><span class="font-mono text-[10px] w-3">${i}</span><span>${c}</span></li>`).join('');

  $('#names-grid').innerHTML = Array.from({ length: 5 }, () =>
    `<div class="aspect-square rounded border border-ink-600 bg-ink-900/60 flex items-center justify-center text-[9px] text-neutral-700">?</div>`).join('');

  renderHUD();
}

export function renderHUD() {
  BARS.forEach(b => {
    const v = S[b.k];
    const vEl = document.querySelector(`[data-val="${b.k}"]`);
    const fEl = document.querySelector(`[data-fill="${b.k}"]`);
    if (!vEl) return;
    if (vEl.textContent !== String(v)) { vEl.classList.remove('bump'); void vEl.offsetWidth; vEl.classList.add('bump'); }
    vEl.textContent = v;
    fEl.style.width = v + '%';
  });
  $('#hud-paid').textContent = S.paidTon.toFixed(2) + ' 吨';
  $('#ai-left') && ($('#ai-left').textContent = S.aiLeft);
  $('#rc-n') && ($('#rc-n').textContent = S.receipts.length);
  $('#names-n') && ($('#names-n').textContent = S.names.length);
}

export function renderNames() {
  const g = $('#names-grid'); if (!g) return;
  const cells = g.children;
  S.names.forEach((n, i) => {
    if (!cells[i]) return;
    cells[i].className = 'aspect-square rounded border border-bruise/50 bg-bruise/10 flex items-center justify-center text-[9px] text-bruise text-center leading-3 px-0.5';
    cells[i].textContent = n;
  });
}

export function renderFresh(f) {
  const lab = ['青', '黄', '斑', '黑'][f];
  ['#nana-top', '#nana-big'].forEach(s => { const n = $(s); if (n) n.className = n.className.replace(/f\d/, 'f' + f); });
  $('#fresh-label') && ($('#fresh-label').textContent = lab);
}

export function renderClock(p) {
  const left = Math.max(0, S.limitMs * (1 - p));
  const m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000);
  $('#fresh-time') && ($('#fresh-time').textContent = `${m}:${String(s).padStart(2, '0')}`);
  $('#fresh-bar') && ($('#fresh-bar').style.width = Math.max(2, p * 100) + '%');
}

export function renderChapter(i) {
  document.querySelectorAll('[data-ch]').forEach(li => {
    const k = +li.dataset.ch;
    li.className = 'flex items-center gap-2 ' + (k === i ? 'text-bruise' : k < i ? 'text-neutral-500 line-through decoration-neutral-700' : 'text-neutral-700');
  });
}

// ─────────── 账本 ───────────
export function pushReceipt(r) {
  const list = $('#rc-list'); if (!list) return;
  const card = el('div', 'receipt beat rounded-[3px] px-3 py-2.5 font-mono text-[11px]');
  card.innerHTML = `
    <div class="flex items-baseline justify-between">
      <span class="text-[10px] text-neutral-500">${r.id} · ${r.date || '—'}</span>
      <span class="${r.refundable ? 'text-neutral-500' : 'text-rose'} text-[10px]">${r.refundable ? '可退' : '不可退'}</span>
    </div>
    <div class="mt-1 text-[12.5px] font-serif text-ink-900">${r.item}</div>
    <div class="mt-1 flex items-baseline justify-between">
      <span class="text-neutral-600">${r.status}</span>
      <span class="font-bold">${fmtTon(r.ton)}</span>
    </div>`;
  list.prepend(card);
  sfx.paper();
  if (list.children.length > 40) list.lastChild.remove();
}

export function fmtTon(t) {
  if (!t) return '—';
  if (t >= 1) return t.toFixed(2) + ' 吨';
  if (t >= 0.01) return (t * 1000).toFixed(0) + ' 公斤';
  return (t * 1e6).toFixed(0) + ' 克';
}

// ─────────── 绑定 ───────────
export function initUI() {
  buildHUD(); armTap();
  onChange((kind, p) => {
    if (kind === 'stat') renderHUD();
    if (kind === 'receipt') { pushReceipt(p); renderHUD(); }
    if (kind === 'fresh') renderFresh(p);
    if (kind === 'clock') renderClock(p);
    if (kind === 'chapter') { renderChapter(p); renderHUD(); }
    if (kind === 'name') { renderNames(); renderHUD(); }
  });

  $('#btn-auto').onclick = e => { S.auto = !S.auto; e.target.textContent = '自动：' + (S.auto ? '开' : '关'); sfx.click(); };
  $('#btn-mute').onclick = e => { S.muted = !S.muted; e.target.textContent = '声音：' + (S.muted ? '关' : '开'); };
  const MOBILE_PANEL = ['fixed', 'inset-x-3', 'bottom-16', 'top-20', 'z-[65]', 'bg-ink-900/95', 'p-3', 'rounded-2xl', 'border', 'hairline'];
  $('#btn-panel').onclick = () => {
    const r = $('#pane-right');
    const open = r.classList.contains('hidden');
    r.classList.toggle('hidden', !open);
    r.classList.toggle('flex', open);
    MOBILE_PANEL.forEach(c => r.classList.toggle(c, open));
    $('#btn-panel').textContent = open ? '收起' : '账本';
    sfx.paper();
  };
}
