// ============================================================
// fx.js — 全屏演出层：十一秒黑屏、心跳、烟花、关灯、CRT 快切。
// ============================================================
import { S, mod } from './state.js';
import { sfx } from './audio.js';
import { sleep } from './ui.js';

const $ = s => document.querySelector(s);
const black = () => $('#black-layer');
const bbox = () => $('#black-box');

function openBlack(html) {
  bbox().innerHTML = html;
  black().classList.remove('hidden');
}
function closeBlack() {
  black().classList.add('hidden');
  bbox().innerHTML = '';
}

// ── 关灯的声音 ──────────────────────────────
// 在这一层里走了两趟才停。
export async function lightsOut(line = '关灯的声音在这一层里走了两趟才停。') {
  openBlack(`<div class="text-center px-8">
      <div id="lo-txt" class="font-serif text-[15px] text-neutral-500 opacity-0 transition-opacity duration-1000"></div>
    </div>`);
  await sleep(220);
  sfx.lightsOut();
  await sleep(500);
  const t = $('#lo-txt');
  t.textContent = line;
  t.classList.remove('opacity-0');
  await sleep(2400);
  if (S.echo >= 40) {
    t.textContent = '到这里，到我为止。';
    await sleep(1800);
  }
  t.classList.add('opacity-0');
  await sleep(900);
  closeBlack();
}

// ── 十一秒 ──────────────────────────────
// 电话里她那边有海，我这边是维港，两边都没有人说话。
// 玩家什么都不做即可；任何点击都会中断。
export function elevenSeconds() {
  return new Promise(resolve => {
    openBlack(`
      <div class="absolute inset-0 flex flex-col items-center justify-center select-none">
        <div class="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-[0.4em] text-sea/50 rotate-180" style="writing-mode:vertical-rl">她那边有海</div>
        <div class="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-[0.4em] text-neutral-700" style="writing-mode:vertical-rl">我这边是维港</div>
        <div class="relative">
          <div class="echo-ring"></div><div class="echo-ring" style="animation-delay:1.1s"></div>
          <div id="es-num" class="font-mono text-7xl tabular-nums text-neutral-300">0</div>
        </div>
        <div class="mt-8 text-[12px] text-neutral-600">两边都没有人说话。</div>
        <div id="es-tip" class="mt-2 font-mono text-[10px] text-neutral-800">（什么都不做，就是数下去）</div>
      </div>`);
    sfx.sea(13);

    let n = 0, broke = false;
    const numEl = $('#es-num');
    const iv = setInterval(() => {
      if (broke) return;
      n++;
      numEl.textContent = n;
      numEl.classList.remove('bump'); void numEl.offsetWidth; numEl.classList.add('bump');
      if (n >= 4) sfx.beat();
      if (n === 11) {
        clearInterval(iv);
        finish(true);
      }
    }, 1000);

    const onBreak = () => {
      if (broke || n >= 11) return;
      broke = true;
      clearInterval(iv);
      $('#es-tip').textContent = '（你开口了。）';
      finish(false);
    };
    black().addEventListener('click', onBreak, { once: true });

    async function finish(full) {
      black().removeEventListener('click', onBreak);
      await sleep(700);
      bbox().innerHTML = `<div class="px-8 text-center space-y-3">
          <div class="font-serif text-[16px] text-rose">行。</div>
          <div class="font-serif text-[16px] text-rose">我知道了。</div>
          <div class="pt-3 font-mono text-[10px] text-neutral-700">她挂了。</div>
        </div>`;
      sfx.dial();
      await sleep(2600);
      if (S.echo >= 40) {
        bbox().innerHTML = `<div class="px-8 text-center space-y-2 max-w-md mx-auto">
            <div class="text-[13px] text-neutral-500 leading-7">我全记得，一个字不差。</div>
            <div class="text-[13px] text-neutral-500 leading-7">我记不起来的是她的声音——她说「我知道了」的时候，是什么语气。</div>
            <div class="pt-3 font-mono text-[10px] text-sea">回声值 ${S.echo} · 语气识别失败</div>
          </div>`;
        await sleep(3600);
      }
      closeBlack();
      resolve(full ? 11 : n);
    }
  });
}

// ── 心跳：我一直在等我哭 ──────────────────────────────
export async function heartbeatScene() {
  openBlack(`
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <div class="text-[12px] text-neutral-600 mb-6">我把手放在胸口，数了一下。</div>
      <div class="relative h-40 w-40 flex items-center justify-center">
        <div class="echo-ring !border-rose/40"></div>
        <div id="hb" class="text-6xl transition-transform duration-150">🫀</div>
      </div>
      <div class="mt-6 font-mono text-3xl text-rose tabular-nums" id="hb-n">--</div>
      <div class="mt-1 font-mono text-[10px] text-neutral-600">次 / 分钟</div>
      <div id="hb-line" class="mt-8 text-center text-[13px] text-neutral-500 h-6"></div>
    </div>`);
  const hb = $('#hb'), n = $('#hb-n'), line = $('#hb-line');
  const lines = ['很稳。', '我又数了一遍，还是很稳。', '一分钟六十几下，和平时没有区别。', '像一个医生在给别人做检查。', '我想，原来是这样。'];
  for (let i = 0; i < 11; i++) {
    sfx.beat();
    hb.style.transform = 'scale(1.14)';
    await sleep(150); hb.style.transform = 'scale(1)';
    n.textContent = 62 + (i % 3);
    if (i % 2 === 0 && lines[i / 2]) { line.textContent = lines[i / 2]; line.classList.remove('beat'); void line.offsetWidth; line.classList.add('beat'); }
    await sleep(770);
  }
  line.textContent = '我没有哭。我一直在等我哭。';
  await sleep(3000);
  closeBlack();
}

// ── 烟花：一百万人涌来，一百万人退去 ──────────────────────────────
export async function fireworks() {
  openBlack(`
    <div class="absolute inset-0 overflow-hidden">
      <canvas id="fw" class="absolute inset-0 w-full h-full"></canvas>
      <div class="absolute inset-x-0 bottom-16 text-center space-y-2 px-8">
        <div id="fw-txt" class="font-serif text-[15px] text-neutral-300"></div>
        <div id="fw-num" class="font-mono text-[11px] text-bruise"></div>
      </div>
    </div>`);
  const cv = $('#fw'), ctx = cv.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  let ps = [], run = true;
  const boom = () => {
    const x = Math.random() * cv.width, y = cv.height * (0.15 + Math.random() * 0.35);
    const hue = [45, 12, 190, 330][Math.floor(Math.random() * 4)];
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * 5 + 1.4;
      ps.push({ x, y, vx: Math.cos(a) * s * dpr, vy: Math.sin(a) * s * dpr, l: 1, hue });
    }
    sfx.firework();
  };
  const loop = () => {
    if (!run) return;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(0, 0, cv.width, cv.height);
    ps.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.045 * dpr; p.l -= 0.011;
      ctx.fillStyle = `hsla(${p.hue},85%,62%,${Math.max(0, p.l)})`;
      ctx.fillRect(p.x, p.y, 2.2 * dpr, 2.2 * dpr);
    });
    ps = ps.filter(p => p.l > 0);
    requestAnimationFrame(loop);
  };
  loop();
  const bi = setInterval(boom, 620);
  boom();

  const seq = [
    ['维港放烟花。', '来了 1,000,000 人。'],
    ['没有她。', ''],
    ['凌晨三点，我把父母送回去。', ''],
    ['路上很空，红灯没有一辆车在等。', '我还是停了。'],
    ['烟花结束，一百万人像潮水一样退去。', '每年都是这样。']
  ];
  for (const [a, b] of seq) {
    $('#fw-txt').textContent = a; $('#fw-num').textContent = b;
    $('#fw-txt').classList.remove('beat'); void $('#fw-txt').offsetWidth; $('#fw-txt').classList.add('beat');
    await sleep(2500);
  }
  clearInterval(bi);
  run = false;
  await sleep(600);
  closeBlack();
}

// ── 2007 CRT 快切：每换一台设备，我都把那张图导过去 ──────────────
export async function deviceMontage() {
  const devices = [
    ['2008', '一台白色台式机', '📺'], ['2010', '第一部智能手机', '📱'],
    ['2013', '美国，二手笔记本', '💻'], ['2016', '第一家公司的工作机', '🖥️'],
    ['2019', '换了新的，导过去', '📲'], ['2023', '再换，还是导过去', '🖲️'],
    ['2026', '现在这一台', '📱']
  ];
  openBlack(`
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <div class="crt rounded-xl border border-emerald-900/60 p-6 w-64 text-center">
        <div id="dm-ic" class="text-5xl mb-3">📺</div>
        <div id="dm-y" class="font-mono text-bruise text-2xl">2008</div>
        <div id="dm-n" class="mt-1 text-[11px] text-neutral-500">一台白色台式机</div>
        <div class="mt-4 h-1 rounded bg-emerald-900/50 overflow-hidden">
          <div id="dm-bar" class="h-full bg-emerald-500/70 transition-all duration-500" style="width:0%"></div>
        </div>
        <div class="mt-2 font-mono text-[9px] text-emerald-600/80">正在拷贝 photo_2007.jpg …</div>
      </div>
      <div class="mt-7 text-center text-[13px] text-neutral-500 px-8 leading-7">
        唯一没变的是，每换一台设备，<br>无论多麻烦，我都把那张图导过去。
      </div>
    </div>`);
  for (const [y, n, ic] of devices) {
    $('#dm-y').textContent = y; $('#dm-n').textContent = n; $('#dm-ic').textContent = ic;
    $('#dm-bar').style.width = '0%';
    sfx.boot();
    await sleep(160);
    $('#dm-bar').style.width = '100%';
    await sleep(660);
  }
  await sleep(700);
  closeBlack();
}

// ── 那张糊图：像素越来越低 ──────────────────────────────
export async function blurryPhoto() {
  openBlack(`
    <div class="absolute inset-0 flex flex-col items-center justify-center px-8">
      <div class="relative">
        <canvas id="bp" width="220" height="280" class="rounded border border-ink-600" style="image-rendering:pixelated"></canvas>
        <div class="absolute -bottom-6 left-0 font-mono text-[9px] text-neutral-700">photo_2007.jpg · 保存于一台老机器</div>
      </div>
      <div id="bp-txt" class="mt-14 max-w-sm text-center text-[13px] leading-7 text-neutral-500"></div>
    </div>`);
  const cv = $('#bp'), c = cv.getContext('2d');
  // 程序化生成一张「看不清的图」：不使用任何真人素材
  const draw = px => {
    c.fillStyle = '#151a20'; c.fillRect(0, 0, 220, 280);
    for (let y = 0; y < 280; y += px) for (let x = 0; x < 220; x += px) {
      const cx = 110, cy = 120;
      const d = Math.hypot(x - cx, (y - cy) * 1.25);
      const face = Math.max(0, 1 - d / 78);
      const hair = y < 90 && d < 96 ? .5 : 0;
      const v = Math.min(1, face * .9 + hair * .5 + Math.random() * .12);
      const r = 40 + v * 150, g = 34 + v * 118, b = 36 + v * 104;
      c.fillStyle = `rgb(${r|0},${g|0},${b|0})`;
      c.fillRect(x, y, px, px);
    }
    c.fillStyle = 'rgba(200,162,74,.10)'; c.fillRect(0, 250, 220, 30);
  };
  const lines = [
    '十九年了，设备的像素越来越高，',
    '而这张图，仿佛像素越来越低。脸都是糊的。',
    '我放大看了很久，想找出她和后来有哪里不一样。',
    '一处也没找出来。',
    '因为那张照片本来就看不清。'
  ];
  const pxs = [3, 5, 8, 12, 18];
  for (let i = 0; i < lines.length; i++) {
    draw(pxs[i]); $('#bp-txt').textContent = lines[i];
    $('#bp-txt').classList.remove('beat'); void $('#bp-txt').offsetWidth; $('#bp-txt').classList.add('beat');
    sfx.type();
    await sleep(2200);
  }
  await sleep(900);
  closeBlack();
}

// ── 一句独白式黑屏卡 ──────────────────────────────
export async function blackCard(lines, ms = 2400, mono = false) {
  openBlack(`<div class="px-10 text-center space-y-3 max-w-lg mx-auto">
    ${lines.map(l => `<div class="${mono ? 'font-mono text-[12px] text-sea' : 'font-serif text-[15px] text-neutral-400'} leading-8">${l}</div>`).join('')}
  </div>`);
  await sleep(ms);
  closeBlack();
}
