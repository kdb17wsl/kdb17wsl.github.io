// ============================================================
// cinema.js — 包场：那天领钱的有二十六个人
// 原文：把座位全买下来不难，麻烦的是已经卖出去的票。
//       助理和保镖提前到影院门口，遇到买了票的观众，把现金递过去。
//       一对带孩子的夫妻来了，孩子已经在门口高高举着爆米花。
//       助理递上一沓钱，孩子不懂为什么不能进去，大人接过钱，道谢，什么也没问，走了。
//       那天领钱的有二十六个人。
// ============================================================
import { S, mod, flag, pay, addName } from '../state.js';
import { sfx } from '../audio.js';
import { openMini, closeMini, btn } from './shell.js';
import { sleep, toast } from '../ui.js';

const TYPES = {
  easy:   { emoji: '🧍', label: '接过钱，道谢，什么也没问' },
  ask:    { emoji: '🙋', label: '要问为什么' },
  family: { emoji: '👨‍👩‍👦', label: '一对带孩子的夫妻' },
  fan:    { emoji: '🧐', label: '好像认出了她' }
};

// 26 位观众：固定第 19 位是带孩子的一家，随机一位是认出她的人
function buildQueue() {
  const q = [];
  const fanAt = 7 + Math.floor(Math.random() * 8);
  for (let i = 1; i <= 26; i++) {
    if (i === 19) q.push({ i, t: 'family' });
    else if (i === fanAt) q.push({ i, t: 'fan' });
    else q.push({ i, t: Math.random() < 0.32 ? 'ask' : 'easy' });
  }
  return q;
}

export function mgCinema() {
  return new Promise(resolve => {
    const m = openMini('二十六个人', '两个人的放映厅，这种场景一般用于审片');
    const q = buildQueue();
    let idx = 0, paidN = 0, leaked = 0, done = false, left = 52, timer;
    let askHandled = 0;

    m.body.innerHTML = `
      <div class="rounded-xl border hairline bg-ink-900/60 p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="font-mono text-[10px] text-neutral-600">《疯狂植物城 2》· 14:30 场 · 影院门口</div>
          <div class="font-mono text-[10px] text-neutral-500">剩 <span id="cn-t" class="text-bruise">52</span>s</div>
        </div>

        <div class="relative h-28 rounded-lg border border-ink-600 overflow-hidden" style="background:linear-gradient(180deg,#171b21,#0f1216)">
          <div class="absolute left-0 inset-y-0 w-16 border-r border-dashed border-ink-600 flex flex-col items-center justify-center">
            <div class="text-lg">🚪</div><div class="font-mono text-[8px] text-neutral-600">入口</div>
          </div>
          <div id="cn-cur" class="absolute left-20 top-1/2 -translate-y-1/2"></div>
          <div id="cn-queue" class="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-45"></div>
        </div>

        <div id="cn-say" class="mt-3 min-h-[44px] rounded-lg border hairline bg-ink-800/60 px-3 py-2 text-[12.5px] text-neutral-400"></div>
        <div id="cn-act" class="mt-3 grid gap-2"></div>
      </div>

      <div class="mt-3 grid grid-cols-3 gap-2 text-center">
        <div class="rounded-lg border hairline bg-ink-900/50 py-2">
          <div class="font-mono text-[10px] text-neutral-600">已劝退</div><div class="font-mono text-lg text-bruise" id="cn-p">0</div>
        </div>
        <div class="rounded-lg border hairline bg-ink-900/50 py-2">
          <div class="font-mono text-[10px] text-neutral-600">漏进场</div><div class="font-mono text-lg text-rose" id="cn-l">0</div>
        </div>
        <div class="rounded-lg border hairline bg-ink-900/50 py-2">
          <div class="font-mono text-[10px] text-neutral-600">队列</div><div class="font-mono text-lg text-neutral-300"><span id="cn-i">1</span>/26</div>
        </div>
      </div>`;

    m.setFoot(`<span class="text-[10.5px] text-neutral-600">她说，放映厅里除了我们两个，不能有任何人。</span>
      <button id="cn-quit" class="no-tap font-mono text-[11px] text-neutral-700 hover:text-rose transition">放弃包场</button>`);

    const cur = document.getElementById('cn-cur');
    const qEl = document.getElementById('cn-queue');
    const say = document.getElementById('cn-say');
    const act = document.getElementById('cn-act');

    document.getElementById('cn-quit').onclick = () => finish('quit');

    timer = setInterval(() => {
      left--; document.getElementById('cn-t').textContent = left;
      if (left <= 0) finish('timeout');
    }, 1000);

    function paintQueue() {
      qEl.innerHTML = q.slice(idx + 1, idx + 8).map(p =>
        `<span class="text-sm">${TYPES[p.t].emoji}</span>`).join('');
      document.getElementById('cn-p').textContent = paidN;
      document.getElementById('cn-l').textContent = leaked;
      document.getElementById('cn-i').textContent = Math.min(idx + 1, 26);
      m.setMeter(`已劝退 <span class="text-bruise">${paidN}</span> / 26`);
    }

    function next() {
      if (done) return;
      if (idx >= q.length) return finish('clear');
      const p = q[idx];
      paintQueue();
      cur.innerHTML = `<div class="text-3xl beat">${TYPES[p.t].emoji}</div>
        <div class="mt-0.5 font-mono text-[9px] text-neutral-600">第 ${p.i} 位</div>`;

      if (p.t === 'easy') {
        say.textContent = '一位买了票的观众走过来。';
        act.innerHTML = `<button data-a="cash" class="opt no-tap rounded-lg px-3 py-2 text-left text-[13px]">把现金递过去</button>`;
      } else if (p.t === 'ask') {
        say.textContent = '他接了钱，但没走：「为什么不能进去？」';
        act.innerHTML = `
          <button data-a="ok"   class="opt no-tap rounded-lg px-3 py-2 text-left text-[13px]">「包场了。」</button>
          <button data-a="soft" class="opt no-tap rounded-lg px-3 py-2 text-left text-[13px]">「不好意思。」</button>
          <button data-a="more" class="opt no-tap rounded-lg px-3 py-2 text-left text-[13px]">「再加一份。」</button>`;
      } else if (p.t === 'family') {
        say.innerHTML = `一对带孩子的夫妻来了。<span class="text-bruise">孩子已经在门口高高举着爆米花。</span>`;
        act.innerHTML = `
          <button data-a="fcash"  class="opt no-tap rounded-lg px-3 py-2 text-left text-[13px]">递上一沓钱</button>
          <button data-a="fpop"   class="opt no-tap rounded-lg px-3 py-2 text-left text-[13px]">递钱，再让助理买一桶爆米花给他</button>
          <button data-a="fgive"  class="opt no-tap rounded-lg px-3 py-2 text-left text-[13px]">放弃包场，让他们进去</button>`;
      } else {
        say.textContent = '这个人往里张望了一下，好像认出了她。';
        act.innerHTML = `
          <button data-a="hat"  class="opt no-tap rounded-lg px-3 py-2 text-left text-[13px]">先按住她的帽子，再递钱</button>
          <button data-a="cash" class="opt no-tap rounded-lg px-3 py-2 text-left text-[13px]">直接递钱</button>`;
      }
      act.querySelectorAll('[data-a]').forEach(b => b.onclick = () => handle(b.dataset.a, p));
    }

    function handle(a, p) {
      if (done) return;
      sfx.cash();
      switch (a) {
        case 'cash':
          if (p.t === 'fan') { leaked++; mod({ heart: -8 }, { raw: true }); say.textContent = '他掏出手机拍了一张。'; mod({ echo: 3 }); }
          paidN++; break;
        case 'hat': paidN++; mod({ dignity: -2 }); break;
        case 'ok': paidN++; askHandled++; mod({ echo: 1 }); break;
        case 'soft': paidN++; askHandled++; mod({ echo: 1 }); break;
        case 'more': paidN++; askHandled++; mod({ echo: 1 }); mod({ vacancy: 1 }); break;
        case 'fcash':
          paidN++; mod({ echo: 3 }); flag('popcornHeld');
          say.innerHTML = '大人接过钱，道谢，什么也没问，走了。<span class="text-neutral-600">孩子不懂为什么不能进去。</span>';
          toast('获得心理状态【举着的爆米花】', 'rose');
          break;
        case 'fpop':
          paidN++; mod({ echo: 1 }); mod({ dignity: 2 }); flag('popcornGiven');
          addName('小满');   // 那个孩子的名字，助理后来问到了
          say.textContent = '孩子拿到了新的一桶。他还是没能进去，但他一路都在吃。';
          break;
        case 'fgive':
          return finish('family');
      }
      idx++;
      if (paidN >= 26 || idx >= q.length) return finish('clear');
      setTimeout(next, a.startsWith('f') ? 1500 : 420);
    }

    async function finish(how) {
      if (done) return; done = true;
      clearInterval(timer);
      m.setFoot(''); act.innerHTML = '';

      if (how === 'clear' && leaked === 0) {
        m.body.innerHTML = `<div class="py-8 text-center space-y-3">
            <div class="text-4xl">🎬</div>
            <div class="text-[14px] text-neutral-300">那天领钱的有二十六个人。</div>
            <div class="text-[13px] text-neutral-500">放映厅里只有两个人。</div>
            <div class="font-mono text-[11px] text-bruise">空置 +20 · 回声 +${askHandled}</div>
          </div>`;
        mod({ heart: 15 }); mod({ vacancy: 20 });
        flag('cinemaCleared');
        sfx.ok();
      } else if (how === 'family') {
        m.body.innerHTML = `<div class="py-8 text-center space-y-3">
            <div class="text-4xl">🍿</div>
            <div class="text-[14px] text-neutral-300">你让他们进去了。</div>
            <div class="text-[13px] text-neutral-500">她在放映厅里戴着口罩看了一半就走了。</div>
            <div class="font-mono text-[11px] text-sea">回声 -8 · 尊严 +6 · 心动 -20</div>
          </div>`;
        mod({ heart: -20 }, { raw: true }); mod({ echo: -8 }); mod({ dignity: 6 });
        flag('cinemaGaveUp'); addName('小满');
        sfx.bad();
      } else if (how === 'quit') {
        m.body.innerHTML = `<div class="py-8 text-center space-y-3">
            <div class="text-4xl">🎟️</div>
            <div class="text-[14px] text-neutral-400">你没有包场。</div>
            <div class="text-[13px] text-neutral-500">她把口罩戴回去了。</div>
          </div>`;
        mod({ heart: -20 }, { raw: true }); mod({ echo: -5 });
        flag('cinemaGaveUp');
        sfx.bad();
      } else {
        m.body.innerHTML = `<div class="py-8 text-center space-y-3">
            <div class="text-4xl">🚪</div>
            <div class="text-[14px] text-rose">有 ${leaked || 26 - paidN} 个人进去了。</div>
            <div class="text-[13px] text-neutral-500">她当场离场。</div>
          </div>`;
        mod({ heart: -18 }, { raw: true });
        sfx.bad();
      }

      pay({
        item: `放映厅整场清空（劝退 ${paidN} 人）`,
        ton: 0.031, date: '第一次见面当天下午',
        status: how === 'clear' && leaked === 0 ? '已履约' : '未履约',
        refundable: true, partial: true,
        note: '大人接过钱，道谢，什么也没问，走了。',
        arb: S.flags.has('popcornHeld')
          ? '其中一份爆米花无法退回。'
          : '座位已恢复销售，可部分退还。'
      });

      await sleep(2800);
      closeMini();
      resolve({ paidN, leaked, how });
    }

    paintQueue(); next();
  });
}

// ── 配平：多加的那些又不能留着，得放掉 ──────────────
export function mgFuel() {
  return new Promise(resolve => {
    const m = openMini('配平', 'A330 是按两百人设计的，我们只有三十个人');
    let phase = 0; // 0 加油 1 放油
    m.body.innerHTML = `
      <div class="rounded-xl border hairline bg-ink-900/60 p-4">
        <div class="relative h-24 rounded-lg border border-ink-600 overflow-hidden" style="background:linear-gradient(180deg,#131720,#0d1015)">
          <div id="fu-plane" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl transition-transform duration-500">🛩️</div>
          <div id="fu-tilt" class="absolute inset-x-6 bottom-4 h-px bg-ink-600"></div>
          <div class="absolute left-3 top-2 font-mono text-[9px] text-neutral-600">设计载重 200 人 · 实载 30 人</div>
          <div id="fu-warn" class="absolute right-3 top-2 font-mono text-[10px] text-rose">太轻了，配平不对</div>
        </div>
        <div class="mt-4">
          <div class="flex items-baseline justify-between font-mono text-[11px]">
            <span id="fu-label" class="text-neutral-500">加油</span>
            <span class="text-bruise"><span id="fu-val">0</span> 吨</span>
          </div>
          <input id="fu-range" type="range" min="0" max="60" value="0" class="mt-2 w-full no-tap">
        </div>
        <div id="fu-tip" class="mt-3 min-h-[40px] font-mono text-[11.5px] text-neutral-500"></div>
      </div>`;
    m.setFoot(`<span class="text-[10.5px] text-neutral-600">加到够重为止。</span>
      <span id="fu-go">${btn('起 飞')}</span>`);

    const rg = document.getElementById('fu-range');
    const val = document.getElementById('fu-val');
    const plane = document.getElementById('fu-plane');
    const warn = document.getElementById('fu-warn');
    const tip = document.getElementById('fu-tip');

    rg.oninput = () => {
      const v = +rg.value;
      val.textContent = v;
      const bal = Math.min(1, v / 42);
      plane.style.transform = `translate(-50%,-50%) rotate(${(1 - bal) * -12}deg)`;
      if (phase === 0) {
        warn.textContent = v >= 42 ? '配平正常' : '太轻了，配平不对';
        warn.className = 'absolute right-3 top-2 font-mono text-[10px] ' + (v >= 42 ? 'text-emerald-400' : 'text-rose');
      }
      if (v % 7 === 0) sfx.sand();
    };

    document.getElementById('fu-go').firstElementChild.onclick = async () => {
      const v = +rg.value;
      if (phase === 0) {
        if (v < 42) { tip.textContent = '还不够重。所以每次都要多加油，加到够重为止。'; sfx.bad(); return; }
        phase = 1;
        sfx.ok();
        tip.textContent = '飞了十一个小时。到了地方——';
        await sleep(1400);
        document.getElementById('fu-label').textContent = '放油';
        warn.textContent = '多加的那些不能留着';
        warn.className = 'absolute right-3 top-2 font-mono text-[10px] text-bruise';
        tip.textContent = '多加的那些又不能留着，得放掉。';
        rg.max = v;
        document.getElementById('fu-go').firstElementChild.textContent = '放 掉';
        return;
      }
      if (+rg.value > 2) { tip.textContent = '还没放完。'; sfx.bad(); return; }
      sfx.ok();
      m.setFoot(''); 
      m.body.innerHTML = `<div class="py-10 text-center space-y-3">
          <div class="text-4xl">🛢️</div>
          <div class="text-[14px] text-neutral-300">我问了一下。</div>
          <div class="text-[13.5px] text-neutral-400">「每次都这样？」</div>
          <div class="text-[13.5px] text-neutral-400">「每次都这样。」</div>
        </div>`;
      pay({
        item: '宽体机配平燃油（多加的部分已放掉）', ton: 0.44, date: '出去走走 · 全程',
        status: '已挥发', refundable: false,
        note: '三十个人坐两百人的飞机。', arb: '每次都这样。'
      });
      flag('fuelSeen');
      await sleep(3200);
      closeMini(); resolve(true);
    };
  });
}
