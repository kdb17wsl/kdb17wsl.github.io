// ============================================================
// apply.js — 好友申请：四十分钟一句话
// 原文：我写了删，删了写，弄了大概四十分钟，最后发出去一句「你好」。
//       她没有通过。
// ============================================================
import { S, mod, flag, pay } from '../state.js';
import { sfx } from '../audio.js';
import { openMini, closeMini, btn } from './shell.js';
import { sleep, toast } from '../ui.js';

const WORDS = [
  '你好', '我', '看过', '你的', '广告', '在', 'QQ', '上',
  '我在', '很北', '的', '一所', '学校', '宿舍', '一年', '一千块',
  '以后', '会', '有钱', '真的', '打扰了', '能不能', '认识', '一下'
];

export function mgApply() {
  return new Promise(resolve => {
    const m = openMini('一句留言', '2007 · 校内网 · 一台联想 IBM 老机器，分辨率糊得很');
    let picked = [], left = 40, done = false, timer;

    m.body.innerHTML = `
      <div class="crt rounded-lg border border-emerald-900/50 p-4">
        <div class="flex items-center gap-2 mb-3">
          <div class="h-2 w-2 rounded-full bg-emerald-500/70"></div>
          <span class="font-mono text-[10px] text-emerald-500/80">好友申请 · 需要填写一句留言</span>
        </div>
        <div id="ap-input" class="min-h-[68px] rounded border px-3 py-2 font-serif text-[15px] leading-8 text-emerald-100 transition-colors duration-300" style="border-color:#1f4d33;background:#08120c"></div>
        <div class="mt-2 flex items-center justify-between font-mono text-[10px]">
          <span id="ap-warn" class="text-emerald-700">　</span>
          <span class="text-emerald-700"><span id="ap-len">0</span> 字</span>
        </div>
      </div>
      <div class="mt-4">
        <div class="mb-2 font-mono text-[10px] text-neutral-600">点词造句 · 再点已选的词可以删掉</div>
        <div id="ap-pool" class="flex flex-wrap gap-1.5"></div>
      </div>
      <div class="mt-4 grid grid-cols-3 gap-3 text-center">
        <div class="rounded-lg border hairline bg-ink-900/50 py-2">
          <div class="font-mono text-[10px] text-neutral-600">倒计时</div>
          <div class="font-mono text-lg text-bruise" id="ap-t">40</div>
          <div class="font-mono text-[9px] text-neutral-700">1 秒 = 1 分钟</div>
        </div>
        <div class="rounded-lg border hairline bg-ink-900/50 py-2">
          <div class="font-mono text-[10px] text-neutral-600">写了删，删了写</div>
          <div class="font-mono text-lg text-rose" id="ap-r">0</div>
          <div class="font-mono text-[9px] text-neutral-700">后悔计数器</div>
        </div>
        <div class="rounded-lg border hairline bg-ink-900/50 py-2">
          <div class="font-mono text-[10px] text-neutral-600">她的账号</div>
          <div class="text-lg">👤</div>
          <div class="font-mono text-[9px] text-neutral-700">也许根本没用过</div>
        </div>
      </div>`;

    m.setFoot(`<span class="text-[10.5px] text-neutral-600">短一点的话，看起来不那么用力。</span>
      <span id="ap-send">${btn('发 送')}</span>`);

    const pool = document.getElementById('ap-pool');
    const inp = document.getElementById('ap-input');
    const warn = document.getElementById('ap-warn');

    WORDS.forEach((w, i) => {
      const b = document.createElement('button');
      b.className = 'no-tap rounded border border-ink-600 bg-ink-900/70 px-2.5 py-1.5 font-serif text-[13px] text-neutral-300 hover:border-bruise hover:text-bruise transition';
      b.textContent = w; b.dataset.i = i;
      b.onclick = () => { if (done) return; picked.push(w); sfx.pick(); render(); };
      pool.appendChild(b);
    });

    function render() {
      const txt = picked.join('');
      inp.innerHTML = picked.length
        ? picked.map((w, i) => `<span data-k="${i}" class="no-tap cursor-pointer rounded px-1 hover:bg-rose/20 hover:line-through">${w}</span>`).join('')
        : `<span class="text-emerald-900">（写点什么……）</span>`;
      inp.querySelectorAll('[data-k]').forEach(s => {
        s.onclick = () => {
          if (done) return;
          picked.splice(+s.dataset.k, 1);
          S.regret++; sfx.back(); render();
        };
      });
      const n = txt.length;
      document.getElementById('ap-len').textContent = n;
      document.getElementById('ap-r').textContent = S.regret;
      // 字数越多，边框越红
      const heat = Math.min(1, n / 18);
      inp.style.borderColor = `rgb(${31 + heat * 150},${77 - heat * 30},${51 - heat * 10})`;
      warn.textContent = n > 12 ? '这样看起来会不会太……' : n > 6 ? '再删两个字？' : '　';
      warn.className = n > 12 ? 'text-rose' : 'text-emerald-700';
    }
    render();

    document.getElementById('ap-send').firstElementChild.onclick = () => finish('send');

    timer = setInterval(() => {
      left--;
      document.getElementById('ap-t').textContent = left;
      if (left <= 6) document.getElementById('ap-t').classList.add('text-rose');
      if (left <= 0) finish('timeout');
    }, 1000);

    async function finish(how) {
      if (done) return;
      done = true; clearInterval(timer);
      const txt = picked.join('');
      const n = txt.length;

      m.body.innerHTML = `<div class="py-8 text-center space-y-4">
          <div class="crt mx-auto w-full max-w-sm rounded-lg border border-emerald-900/50 p-5">
            <div class="font-mono text-[10px] text-emerald-600 mb-2">已发送</div>
            <div id="ap-out" class="font-serif text-[17px] text-emerald-100 min-h-[28px]"></div>
          </div>
          <div id="ap-res" class="text-[13px] text-neutral-500 min-h-[22px]"></div>
        </div>`;
      m.setFoot('');
      m.setMeter('');
      const out = document.getElementById('ap-out'), res = document.getElementById('ap-res');

      if (how === 'timeout' && n === 0) {
        out.innerHTML = `<span class="text-neutral-600 text-[12px]">（系统替你发出了一整屏的话，然后撤回了。）</span>`;
        S.regret += 40;
        mod({ dignity: -10 });
        sfx.bad();
        res.textContent = '后悔计数器 +40。开局尊严 -10。';
        flag('longEssay'); flag('sentNothing');
      } else {
        out.textContent = txt || '（空的）';
        sfx.ok();
        if (n <= 4 && n > 0) {
          res.textContent = '最后发出去一句这个。弄了大概四十分钟。';
          flag('shortHello');
        } else {
          res.textContent = '发出去了。有点长。';
          flag('longEssay');
          toast('获得体质【小作文体质】', 'rose');
        }
      }

      await sleep(2100);
      // 她没有通过。
      res.innerHTML = '';
      out.parentElement.insertAdjacentHTML('afterend',
        `<div id="ap-wait" class="font-mono text-[11px] text-neutral-600">等待对方验证 …</div>`);
      const w = document.getElementById('ap-wait');
      for (let i = 0; i < 3; i++) { await sleep(800); w.textContent = '等待对方验证 ' + '·'.repeat(i + 1); }
      await sleep(900);
      w.className = 'font-mono text-[13px] text-rose';
      w.textContent = '她没有通过。';
      sfx.bad();
      await sleep(1500);
      w.insertAdjacentHTML('afterend',
        `<div class="mt-2 text-[12px] text-neutral-600">她也许根本没用过这个网站。</div>
         <div class="mt-1 text-[12px] text-neutral-600">我没有再申请第二次。</div>`);

      // 那张图，我存下来了。
      flag('blurryPhoto');
      pay({
        item: '好友申请 1 次（留言：' + (txt || '（空）') + '）',
        ton: 0, date: '2007', status: '未通过', refundable: false,
        note: '弄了大概四十分钟。', arb: '对方未处理。已超过申诉期十九年。'
      });
      toast('获得道具【一张糊图】', 'gold');

      await sleep(2600);
      closeMini();
      resolve({ n, regret: S.regret, how });
    }
  });
}
