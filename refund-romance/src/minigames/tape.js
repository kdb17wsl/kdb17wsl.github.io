// ============================================================
// tape.js — 封光：三十卷胶带
// 原文：她睡觉不能有一丝光。助理用黑胶带把整个房间贴起来，
//       外面亮如白昼，里面黑得像禁闭室。胶带一晒就掉，每天要重贴。
//       胶带买了三十卷，后来又补了二十卷。
//       她们发现下午三点以后贴的最容易掉，因为那时候玻璃最烫。
//       她知道那两个女孩叫什么。我不知道。
// ============================================================
import { S, mod, flag, pay, addName, has } from '../state.js';
import { sfx } from '../audio.js';
import { openMini, closeMini, btn } from './shell.js';
import { sleep, toast } from '../ui.js';
import { lightsOut } from '../fx.js';

// 11 个漏光点
const LEAKS = [
  { n: '窗框·上', x: 8,  y: 8,  w: 84, h: 5,  cost: 4 },
  { n: '窗框·下', x: 8,  y: 62, w: 84, h: 5,  cost: 4 },
  { n: '窗框·左', x: 6,  y: 8,  w: 4,  h: 59, cost: 4 },
  { n: '窗框·右', x: 90, y: 8,  w: 4,  h: 59, cost: 4 },
  { n: '空调指示灯', x: 20, y: 74, w: 9, h: 7, cost: 1 },
  { n: '插座灯·A',  x: 34, y: 78, w: 8, h: 6, cost: 1 },
  { n: '插座灯·B',  x: 47, y: 78, w: 8, h: 6, cost: 1 },
  { n: '烟感呼吸灯', x: 60, y: 72, w: 9, h: 7, cost: 1 },
  { n: '电视待机灯', x: 73, y: 78, w: 8, h: 6, cost: 1 },
  { n: '门缝',      x: 86, y: 72, w: 8, h: 13, cost: 2 },
  { n: '路由器',    x: 12, y: 86, w: 9, h: 6, cost: 1 }
];

const HELPERS = [
  { id: 'h1', role: '负责窗框', name: '小杜', emoji: '👩‍🔧' },
  { id: 'h2', role: '负责空调和插座的指示灯', name: '阿枝', emoji: '👩‍🎨' }
];

export function mgTape(round = 1) {
  return new Promise(resolve => {
    const place = round === 1 ? '冷火山岛 · 面向大西洋的落地窗' : '无鞋岛 · 水上屋，玻璃更大';
    const m = openMini(round === 1 ? '把整个房间贴起来' : '又开始贴胶带了', place);

    let stock = round === 1 ? 30 : 26;
    let hour = 10;                      // 当前钟点
    let left = round === 1 ? 46 : 40;   // 秒
    let sealed = new Set();
    let checks = 0, done = false, timer;
    const asked = new Set();

    m.body.innerHTML = `
      <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
        <div>
          <div id="tp-room" class="relative aspect-[4/3] rounded-xl border border-ink-600 overflow-hidden"
               style="background:linear-gradient(180deg,#8fd0e8 0%,#cfe9f2 38%,#1b2028 39%,#12151a 100%)">
            <div id="tp-sun" class="absolute right-4 top-3 text-2xl transition-all duration-500">☀️</div>
            <div class="absolute inset-x-0 top-[39%] h-px bg-ink-600"></div>
            <div class="absolute left-3 bottom-2 font-mono text-[9px] text-neutral-500">外面亮如白昼</div>
            <div id="tp-layer" class="absolute inset-0"></div>
            <div id="tp-dark" class="pointer-events-none absolute inset-0 bg-black transition-opacity duration-700" style="opacity:0"></div>
          </div>
          <div id="tp-tip" class="mt-2 h-5 font-mono text-[11px] text-neutral-600">点亮着的地方，把它贴掉。</div>
        </div>

        <div class="space-y-2.5">
          <div class="rounded-lg border hairline bg-ink-900/60 p-3">
            <div class="font-mono text-[10px] text-neutral-600">胶带库存</div>
            <div class="font-mono text-2xl text-bruise"><span id="tp-stock">${stock}</span><span class="text-[11px] text-neutral-600"> 卷</span></div>
          </div>
          <div class="rounded-lg border hairline bg-ink-900/60 p-3">
            <div class="font-mono text-[10px] text-neutral-600">现在是</div>
            <div class="font-mono text-xl" id="tp-hour">10:00</div>
            <div id="tp-hot" class="mt-1 font-mono text-[9px] text-neutral-700">玻璃还不烫</div>
          </div>
          <div class="rounded-lg border hairline bg-ink-900/60 p-3">
            <div class="font-mono text-[10px] text-neutral-600">助理</div>
            <div id="tp-helpers" class="mt-1.5 space-y-1.5"></div>
          </div>
          <button id="tp-wait" class="no-tap w-full rounded-lg border border-ink-600 px-2 py-2 font-mono text-[11px] text-neutral-400 hover:border-bruise transition">
            等明早六点半再贴
          </button>
        </div>
      </div>`;

    m.setFoot(`<span class="text-[10.5px] text-neutral-600">她睡觉不能有一丝光。</span>
      <span id="tp-check">${btn('检 查（0/3）', 'ghost')}</span>`);

    const layer = document.getElementById('tp-layer');
    const tip = document.getElementById('tp-tip');

    // 渲染漏光点
    LEAKS.forEach((L, i) => {
      const d = document.createElement('button');
      d.className = 'no-tap absolute rounded-sm transition-all';
      d.style.cssText = `left:${L.x}%;top:${L.y}%;width:${L.w}%;height:${L.h}%;`;
      d.dataset.i = i;
      layer.appendChild(d);
      d.onclick = () => seal(i);
    });
    paint();

    function paint() {
      [...layer.children].forEach((d, i) => {
        const L = LEAKS[i], on = sealed.has(i);
        if (on) {
          d.className = 'no-tap tape absolute rounded-sm transition-all';
          d.style.background = 'rgba(20,22,26,.95)';
          d.style.boxShadow = 'none';
          d.title = L.n + '（已贴）';
        } else {
          d.className = 'no-tap absolute rounded-sm transition-all';
          d.style.background = 'rgba(255,246,214,.92)';
          d.style.boxShadow = '0 0 14px 3px rgba(255,240,190,.7)';
          d.title = L.n + ' · ' + L.cost + ' 卷';
        }
      });
      document.getElementById('tp-stock').textContent = stock;
      const dark = sealed.size / LEAKS.length;
      document.getElementById('tp-dark').style.opacity = (dark * 0.86).toFixed(2);
      m.setMeter(`已贴 <span class="text-bruise">${sealed.size}</span> / ${LEAKS.length} · 剩 <span class="${left <= 8 ? 'text-rose' : ''}">${left}</span>s`);
    }

    function paintHour() {
      const h = String(Math.floor(hour)).padStart(2, '0');
      document.getElementById('tp-hour').textContent = h + ':00';
      const hot = hour >= 15;
      document.getElementById('tp-hot').textContent = hot ? '下午三点后，玻璃最烫' : '玻璃还不烫';
      document.getElementById('tp-hot').className = 'mt-1 font-mono text-[9px] ' + (hot ? 'text-rose' : 'text-neutral-700');
      document.getElementById('tp-sun').textContent = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌇';
    }
    paintHour();

    // 助理：长按可以问她叫什么名字
    function paintHelpers() {
      document.getElementById('tp-helpers').innerHTML = HELPERS.map(h => {
        const known = S.names.includes(h.name);
        return `<button data-h="${h.id}" class="no-tap w-full flex items-center gap-2 rounded border px-2 py-1.5 text-left transition
          ${known ? 'border-bruise/50 bg-bruise/10' : 'border-ink-600 hover:border-bruise'}">
          <span class="text-sm">${h.emoji}</span>
          <span class="min-w-0">
            <span class="block font-mono text-[10px] ${known ? 'text-bruise' : 'text-neutral-500'}">${known ? h.name : '（不知道名字）'}</span>
            <span class="block text-[9px] text-neutral-600 truncate">${h.role}</span>
          </span>
        </button>`;
      }).join('');
      document.querySelectorAll('[data-h]').forEach(b => {
        b.onclick = async () => {
          const h = HELPERS.find(x => x.id === b.dataset.h);
          if (S.names.includes(h.name) || asked.has(h.id) || done) return;
          asked.add(h.id);
          // 消耗 3 秒宝贵时间，没有任何数值收益
          left -= 3; paint();
          tip.textContent = `你问她叫什么。她说，${h.name}。`;
          tip.className = 'mt-2 h-5 font-mono text-[11px] text-bruise';
          addName(h.name);
          toast(`记住了一个名字：${h.name}`, 'gold');
          sfx.pick();
          paintHelpers();
        };
      });
    }
    paintHelpers();

    function seal(i) {
      if (done || sealed.has(i)) return;
      const L = LEAKS[i];
      if (stock < L.cost) { tip.textContent = '胶带不够了。'; tip.className = 'mt-2 h-5 font-mono text-[11px] text-rose'; sfx.bad(); return; }
      stock -= L.cost; sealed.add(i);
      sfx.tape();
      tip.textContent = L.n + '，贴好了。';
      tip.className = 'mt-2 h-5 font-mono text-[11px] text-neutral-600';
      paint();
    }

    // 等明早六点半：消耗剧情一天，香蕉更黑
    document.getElementById('tp-wait').onclick = () => {
      if (done) return;
      if (hour < 15) { tip.textContent = '现在还不烫，不用等。'; sfx.bad(); return; }
      hour = 6.5; left += 14;
      tip.textContent = '改成早上贴。这件事没有人教她们，是她们自己试出来的。';
      tip.className = 'mt-2 h-5 font-mono text-[11px] text-bruise';
      flag('tapeMorning');
      sfx.ok();
      paintHour(); paint();
    };

    // 检查三遍：每次随机暴露 1 个之前"漏掉"的光点
    document.getElementById('tp-check').firstElementChild.onclick = () => {
      if (done) return;
      if (checks >= 3) return;
      checks++;
      const btnEl = document.getElementById('tp-check').firstElementChild;
      btnEl.textContent = `检 查（${checks}/3）`;
      sfx.paper();
      // 从已贴的里随机掀开一个（模拟"贴完再检查三遍"）
      const arr = [...sealed];
      if (arr.length && checks <= 3) {
        const k = arr[Math.floor(Math.random() * arr.length)];
        if (Math.random() < 0.62) {
          sealed.delete(k);
          tip.textContent = `检查第 ${checks} 遍：${LEAKS[k].n} 有点翘边。`;
          tip.className = 'mt-2 h-5 font-mono text-[11px] text-rose';
          sfx.bad();
        } else {
          tip.textContent = `检查第 ${checks} 遍：没有问题。`;
          tip.className = 'mt-2 h-5 font-mono text-[11px] text-neutral-600';
        }
      }
      if (checks === 3) { btnEl.textContent = '检查完了'; btnEl.disabled = true; btnEl.className += ' opacity-40'; }
      paint();
      if (sealed.size === LEAKS.length && checks >= 3) finish();
    };

    timer = setInterval(() => {
      left--;
      if (left % 6 === 0 && hour < 20) { hour += 1; paintHour(); }
      paint();
      if (left <= 0) finish();
      else if (sealed.size === LEAKS.length && checks >= 3) finish();
    }, 1000);

    async function finish() {
      if (done) return; done = true;
      clearInterval(timer);
      const miss = LEAKS.length - sealed.size;
      // 下午三点以后贴的，次日会掉
      const lateRisk = hour >= 15 && !has('tapeMorning');
      const fell = lateRisk && Math.random() < 0.6;
      const ok = miss === 0 && checks >= 3 && !fell;
      const used = (round === 1 ? 30 : 26) - stock;

      m.setFoot(''); m.setMeter('');
      if (ok) {
        m.body.innerHTML = `<div class="py-8 text-center space-y-3">
            <div class="text-4xl">🌑</div>
            <div class="text-[14px] text-neutral-300">外面亮如白昼，里面黑得像禁闭室。</div>
            <div class="text-[13px] text-neutral-500">她睡了。</div>
            <div class="font-mono text-[11px] text-bruise">用掉 ${used} 卷</div>
          </div>`;
        mod({ heart: 18 }); mod({ vacancy: 12 });
        flag('sealedOK');
        sfx.ok();
        await sleep(1600);
        await lightsOut();
      } else {
        const why = fell ? '下午三点以后贴的，玻璃太烫，半夜掉了。' : `还有 ${miss} 处漏光。` + (checks < 3 ? '你没有检查三遍。' : '');
        m.body.innerHTML = `<div class="py-8 text-center space-y-3">
            <div class="text-4xl">🌒</div>
            <div class="text-[15px] text-rose">她整夜没睡。</div>
            <div class="text-[13px] text-neutral-500">${why}</div>
          </div>`;
        mod({ heart: -15 }, { raw: true });
        flag('sealedFail');
        sfx.bad();
        await sleep(2400);
      }

      pay({
        item: `遮光胶带 ${used} 卷（${round === 1 ? '冷火山岛' : '无鞋岛'}）`,
        ton: used * 0.00012, date: round === 1 ? '出去走走 · 第 3 天' : '出去走走 · 第 9 天',
        status: ok ? '已履约' : '未履约', refundable: true,
        note: '一个负责窗框，一个负责指示灯，贴完再检查三遍。',
        arb: '易耗品已开封，按九折折价退还。'
      });

      // 走了以后没人告诉她们不用贴了
      if (round === 1) flag('tapeUnstopped');

      await sleep(700);
      closeMini();
      resolve({ ok, used, miss });
    }
  });
}

// 离开时是否告诉她们不用贴了
export function mgLeaveTape() {
  return new Promise(resolve => {
    const m = openMini('要走了', '助理们还在贴。');
    m.body.innerHTML = `<div class="space-y-3">
        <p class="text-[13.5px] leading-7 text-neutral-400">
          车已经在楼下。两个女孩还在窗边，一个负责窗框，一个负责空调和插座的指示灯。
          胶带买了三十卷，后来又补了二十卷。
        </p>
        <div class="rounded-lg border hairline bg-ink-900/60 p-3 font-mono text-[11px] text-neutral-500">
          她们发现下午三点以后贴的最容易掉，因为那时候玻璃最烫。<br>
          这件事没有人教她们，是她们自己试出来的。<br>
          她们互相之间会讨论，像讨论一项工艺。
        </div>
      </div>`;
    m.setFoot(`
      <button id="lt-a" class="no-tap rounded-full border border-ink-600 px-4 py-2 font-mono text-[11.5px] text-neutral-300 hover:border-bruise transition">告诉她们不用贴了</button>
      <button id="lt-b" class="no-tap rounded-full bg-bruise px-4 py-2 font-mono text-[11.5px] text-ink-900">直接上车</button>`);

    document.getElementById('lt-a').onclick = async () => {
      sfx.click(); flag('toldThem'); unstop();
      m.body.innerHTML = `<div class="py-8 text-center space-y-2">
          <div class="text-[14px] text-neutral-300">你回头说了一句：不用贴了。</div>
          <div class="text-[12px] text-neutral-500">她们停下来，把剩下的胶带收进箱子。</div>
          <div class="font-mono text-[11px] text-bruise">尊严 +6 · 回声 -6</div>
        </div>`;
      m.setFoot(''); mod({ dignity: 6 }); mod({ echo: -6 });
      await sleep(2200); closeMini(); resolve(true);
    };
    document.getElementById('lt-b').onclick = async () => {
      sfx.back();
      m.body.innerHTML = `<div class="py-8 text-center space-y-2">
          <div class="text-[14px] text-neutral-400">我们走了以后，胶带又贴了几天。</div>
          <div class="text-[12px] text-neutral-500">没人告诉她们不用贴了。</div>
        </div>`;
      m.setFoot(''); mod({ echo: 5 });
      pay({
        item: '窗框胶痕清不掉 · 整块玻璃更换', ton: 0.019, date: '事后结账',
        status: '已赔付', refundable: true,
        note: '贴得太久，次数太多。', arb: '那面玻璃朝着大西洋。'
      });
      await sleep(2400); closeMini(); resolve(false);
    };
    function unstop() { S.flags.delete('tapeUnstopped'); }
  });
}
