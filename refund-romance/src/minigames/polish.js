// ============================================================
// polish.js — 抛指甲：磨到不刮人为止
// 原文：她把我的手放在她腿上，一根一根磨。
//       先是粗的那一面，磨完换一面，再换一面。
//       磨一会儿举起来对着灯看看，再接着磨。
//       十个手指，她花了快一个小时。
// ============================================================
import { mod, flag, pay, has } from '../state.js';
import { sfx } from '../audio.js';
import { openMini, closeMini, btn } from './shell.js';
import { sleep, toast } from '../ui.js';

const FACES = [
  { k: 0, n: '粗面', d: '磨形状', need: 150, color: '#8a8f99' },
  { k: 1, n: '中面', d: '抛光',   need: 130, color: '#b0b6c2' },
  { k: 2, n: '细面', d: '顺着一个方向', need: 110, color: '#e2d3a8' }
];

export function mgPolish() {
  return new Promise(resolve => {
    const m = openMini('十个手指', '她从包里翻出一个小袋子，拉开，里面一排东西，像一套很小的工具');

    let nail = 0, face = 0, acc = 0, dir = 0, reverses = 0;
    let done = false, paused = false, skipShown = false, skipped = false;
    let lastX = null, total = 0;
    const TOTAL_NEED = 10 * (150 + 130 + 110);

    m.body.innerHTML = `
      <div class="rounded-xl border hairline bg-ink-900/60 p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="font-mono text-[10px] text-neutral-600">她说，过来。</div>
          <div class="font-mono text-[10px] text-neutral-500">第 <span id="pl-i" class="text-bruise">1</span> / 10 根</div>
        </div>

        <div id="pl-nails" class="flex items-end justify-center gap-1.5 mb-4"></div>

        <div id="pl-pad" class="relative h-32 rounded-xl border border-ink-600 overflow-hidden select-none touch-none cursor-ew-resize"
             style="background:linear-gradient(180deg,#1b1f26,#12151a)">
          <div class="absolute inset-x-0 top-2 text-center font-mono text-[10px] text-neutral-600">在这里左右划动</div>
          <div id="pl-nail-big" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-24 rounded-t-[40px] rounded-b-lg border border-neutral-600 transition-all"
               style="background:linear-gradient(180deg,#e8e2d4,#cfc7b4)"></div>
          <div id="pl-spark" class="pointer-events-none absolute inset-0"></div>
          <div id="pl-lamp" class="absolute inset-0 hidden items-center justify-center flex-col gap-2 bg-ink-900/92">
            <div class="text-3xl">💡</div>
            <div class="font-mono text-[11px] text-bruise">她举起来，对着灯看看。</div>
          </div>
        </div>

        <div class="mt-3 flex items-center gap-2">
          <div class="flex-1 h-1.5 rounded bg-ink-600 overflow-hidden">
            <div id="pl-bar" class="h-full transition-all duration-150" style="width:0%;background:#c8a24a"></div>
          </div>
          <span id="pl-face" class="font-mono text-[11px] text-bruise w-28 text-right">粗面 · 磨形状</span>
        </div>
        <div id="pl-tip" class="mt-2 h-5 font-mono text-[11px] text-neutral-600"></div>
      </div>

      <div class="mt-3 grid grid-cols-3 gap-2" id="pl-faces"></div>`;

    m.setFoot(`<span class="text-[10.5px] text-neutral-600">她说，磨到不刮人为止。（在方框里左右划动）</span>
      <span id="pl-skipwrap"></span>`);

    const nailsEl = document.getElementById('pl-nails');
    const facesEl = document.getElementById('pl-faces');
    const pad = document.getElementById('pl-pad');
    const big = document.getElementById('pl-nail-big');
    const bar = document.getElementById('pl-bar');
    const tip = document.getElementById('pl-tip');
    const spark = document.getElementById('pl-spark');
    const lamp = document.getElementById('pl-lamp');

    // 十根指甲
    for (let i = 0; i < 10; i++) {
      const d = document.createElement('div');
      d.className = 'w-5 rounded-t-full border border-ink-600 bg-ink-700 transition-all';
      d.style.height = (i === 4 || i === 5 ? 26 : i === 0 || i === 9 ? 16 : 22) + 'px';
      d.dataset.k = i;
      nailsEl.appendChild(d);
    }
    // 三面砂条
    FACES.forEach(f => {
      const b = document.createElement('button');
      b.className = 'no-tap rounded-lg border border-ink-600 bg-ink-900/60 px-2 py-2 text-center transition';
      b.innerHTML = `<div class="font-mono text-[12px]">${f.n}</div><div class="mt-0.5 text-[10px] text-neutral-600">${f.d}</div>`;
      b.dataset.f = f.k;
      b.onclick = () => {
        if (done || paused) return;
        if (+b.dataset.f !== face) { tip.textContent = '顺序不对。先' + FACES[face].n + '。'; sfx.bad(); return; }
        sfx.pick();
      };
      facesEl.appendChild(b);
    });

    function paintFaces() {
      [...facesEl.children].forEach((b, i) => {
        b.className = 'no-tap rounded-lg border px-2 py-2 text-center transition ' +
          (i === face ? 'border-bruise bg-bruise/10 text-bruise' :
            i < face ? 'border-ink-600 bg-ink-900/40 text-neutral-700 line-through' : 'border-ink-600 bg-ink-900/60 text-neutral-500');
      });
      document.getElementById('pl-face').textContent = FACES[face].n + ' · ' + FACES[face].d;
      big.style.background = ['linear-gradient(180deg,#d8d2c2,#b9b1a0)',
        'linear-gradient(180deg,#e8e2d4,#cfc7b4)',
        'linear-gradient(180deg,#f6f1e4,#e3dcc9)'][face];
      big.style.boxShadow = face === 2 ? '0 0 24px -6px #c8a24a' : 'none';
    }
    paintFaces();

    const NAIL_DONE = 'linear-gradient(180deg,#f6f1e4,#dcd4c0)';
    const NAIL_CUR = 'linear-gradient(180deg,#c8b98e,#8d846a)';
    function paintNails() {
      [...nailsEl.children].forEach((d, i) => {
        d.className = 'w-5 rounded-t-full border transition-all ' +
          (i < nail ? 'border-bruise/70' : i === nail ? 'border-bruise' : 'border-ink-600');
        d.style.background = i < nail ? NAIL_DONE : i === nail ? NAIL_CUR : '#191d24';
      });
      document.getElementById('pl-i').textContent = Math.min(nail + 1, 10);
    }
    paintNails();

    // ── 划动检测 ──
    const onDown = e => { lastX = (e.touches ? e.touches[0] : e).clientX; };
    const onUp = () => { lastX = null; };
    const onMove = e => {
      if (done || paused || lastX === null) return;
      const x = (e.touches ? e.touches[0] : e).clientX;
      const dx = x - lastX;
      if (Math.abs(dx) < 2) return;
      lastX = x;
      const d = Math.sign(dx);

      // 细面：不要来回蹭，要顺着一个方向
      if (face === 2) {
        if (dir !== 0 && d !== dir) {
          reverses++;
          acc = Math.max(0, acc - 34);
          tip.textContent = '不要来回蹭。要顺着一个方向。';
          tip.className = 'mt-2 h-5 font-mono text-[11px] text-rose';
          sfx.bad();
          if (reverses >= 5) return fail();
        }
        dir = d;
      }

      acc += Math.abs(dx); total += Math.abs(dx);
      sfx.sand();
      // 火花
      if (Math.random() < .35) {
        const s = document.createElement('div');
        s.className = 'absolute h-0.5 w-0.5 rounded-full';
        s.style.cssText += `left:${45 + Math.random() * 10}%;top:${44 + Math.random() * 12}%;background:${FACES[face].color};opacity:.9;transition:all .5s`;
        spark.appendChild(s);
        requestAnimationFrame(() => {
          s.style.transform = `translate(${(Math.random() - .5) * 60}px,${-14 - Math.random() * 22}px)`;
          s.style.opacity = 0;
        });
        setTimeout(() => s.remove(), 520);
      }
      bar.style.width = Math.min(100, acc / FACES[face].need * 100) + '%';

      // 95% 的跳过陷阱
      if (!skipShown && total / TOTAL_NEED >= 0.95) showSkip();

      if (acc >= FACES[face].need) nextFace();
    };
    pad.addEventListener('mousedown', onDown); pad.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mouseup', onUp); window.addEventListener('touchend', onUp);
    pad.addEventListener('mousemove', onMove); pad.addEventListener('touchmove', onMove, { passive: true });

    async function nextFace() {
      acc = 0; dir = 0;
      bar.style.width = '0%';
      tip.className = 'mt-2 h-5 font-mono text-[11px] text-neutral-600';
      if (face < 2) {
        face++;
        tip.textContent = '磨完换一面。' + (face === 2 ? '最后一面不要来回蹭。' : '');
        sfx.ok(); paintFaces();
        return;
      }
      // 一根磨好了
      nail++; face = 0; paintFaces(); paintNails();
      sfx.ok();
      if (nail >= 10) return succeed();
      // 磨一会儿举起来对着灯看看
      if (nail % 3 === 0) {
        paused = true;
        lamp.classList.remove('hidden'); lamp.classList.add('flex');
        await sleep(1200);
        lamp.classList.add('hidden'); lamp.classList.remove('flex');
        paused = false;
        tip.textContent = '再接着磨。';
      }
      m.setMeter(`已磨 <span class="text-bruise">${nail}</span> / 10`);
    }

    function showSkip() {
      skipShown = true;
      const wrap = document.getElementById('pl-skipwrap');
      wrap.innerHTML = `<button class="no-tap rounded-full border border-neutral-800 px-4 py-1.5 font-mono text-[11px] text-neutral-700 hover:text-neutral-500 transition">跳过</button>`;
      const b = wrap.firstElementChild;
      b.onclick = () => { skipped = true; succeed(true); };
      setTimeout(() => { if (!skipped) wrap.innerHTML = ''; }, 4000);
    }

    async function succeed(viaSkip = false) {
      if (done) return; done = true;
      cleanup();
      if (viaSkip) {
        m.body.innerHTML = `<div class="py-10 text-center space-y-3">
            <div class="text-4xl">✋</div>
            <div class="text-[14px] text-neutral-300">她说，行了。</div>
            <div class="font-mono text-[11px] text-neutral-600">你在最后一根手指上省下了 6 秒。</div>
          </div>`;
        mod({ heart: 12 }); mod({ dignity: -8 });
        flag('polishSkipped');
        toast('未获得【顺着一个方向】', 'gray');
        sfx.bad();
      } else {
        m.body.innerHTML = `<div class="py-8 text-center space-y-3">
            <div class="text-4xl">💅</div>
            <div class="text-[14px] text-neutral-300">十个手指，她花了快一个小时。</div>
            <div class="text-[13px] text-neutral-500">磨完她把我的手翻过来看了看，摸了一下。</div>
            <div class="text-[15px] text-rose pt-1">「行了。」</div>
            <div class="text-[13px] text-rose">「摸吧，想摸哪都行。」</div>
          </div>`;
        mod({ heart: 25 }); mod({ dignity: -15 });
        flag('oneDirection'); flag('polishDone');
        toast('获得被动【顺着一个方向】', 'gold');
        sfx.ok();
      }
      pay({
        item: '抛指甲服务 1 小时（十指）', ton: 0, date: '第一次见面当晚',
        status: viaSkip ? '部分履约' : '已履约', refundable: false,
        note: viaSkip ? '最后一根没磨完。' : '这一面磨形状，这一面抛光，最后一面顺着一个方向。',
        arb: '本服务无法退还。你的指甲现在还是磨人的。'
      });
      m.setFoot(''); m.setMeter('');
      await sleep(viaSkip ? 2600 : 3600);
      closeMini();
      resolve({ ok: !viaSkip, skipped: viaSkip });
    }

    async function fail() {
      if (done) return; done = true;
      cleanup();
      m.body.innerHTML = `<div class="py-10 text-center space-y-3">
          <div class="text-4xl">🩹</div>
          <div class="text-[15px] text-rose">「你的指甲扎得我痛。」</div>
          <div class="text-[13px] text-neutral-500">她把工具收回了小袋子，拉上。</div>
        </div>`;
      mod({ heart: -10 }, { raw: true });
      flag('polishFailed');
      pay({
        item: '抛指甲服务（中断）', ton: 0, date: '第一次见面当晚',
        status: '未履约', refundable: false,
        note: '来回蹭了五次。', arb: '服务未完成，不予退还。'
      });
      sfx.bad();
      m.setFoot(''); m.setMeter('');
      await sleep(2800);
      closeMini();
      resolve({ ok: false, failed: true });
    }

    function cleanup() {
      pad.removeEventListener('mousedown', onDown);
      pad.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    }

    m.setMeter('已磨 <span class="text-bruise">0</span> / 10');
  });
}
