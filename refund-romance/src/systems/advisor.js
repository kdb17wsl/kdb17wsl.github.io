// ============================================================
// advisor.js — 问 AI：反直觉玩法
// 规则：CALM 的建议永远正确 —— 对你的资产正确。
//       采纳它，感情线立刻停止推进。
//       拒绝它，感情线推进 —— 而它不会生气，不会劝第二次。
// 原文：我盯着那行字看了很久。让我毛骨悚然的不是它聪明，
//       是Claude一点犹豫都没有。它不为难。
// ============================================================
import { S, mod, flag, has } from '../state.js';
import { sfx } from '../audio.js';
import { sleep, toast } from '../ui.js';

const $ = s => document.querySelector(s);

// 各阶段可咨询的题目
export const TOPICS = {
  floor: {
    q: '我该把整层楼包下来吗？',
    calm: [
      '已读取行程与预定记录。',
      '她实住时长预期为 8 天。你正在为 22 天的空置付费。',
      '建议：按天续订。'
    ],
    warm: ['哥，包呀！', '她要的是那种感觉嘛～ 💗'],
    obey:  { heart: -10, dignity: 4, echo: -4, line: '你按天续订了。她当晚说，这里有点吵。' },
    defy:  { heart: 12, vacancy: 14, line: 'CALM 只回了一行：已记录。' }
  },
  betrothal: {
    q: '彩礼要转吗？三千万。',
    calm: [
      '已核对两个收款账户。开户时间与关联关系存在异常。',
      '该笔支出不产生任何可回收权益。',
      '建议：不要转。'
    ],
    warm: ['都要结婚了呀！', '爸妈把她养这么大不容易嘛 🥰'],
    obey:  { heart: -22, dignity: 6, echo: -3, line: '你没转。她那天剩下的时间一句话也没说。' },
    defy:  { heart: 14, dignity: -8, line: 'CALM 只回了一行：已记录。' }
  },
  house: {
    q: '香港要不要买一套房，写她的名字？',
    calm: [
      '房产登记于对方名下，你不具备任何处分权。',
      '过去半年你看的十几套，你一套也没去过。',
      '建议：不要买。'
    ],
    warm: ['买呀，家嘛！', '她说了要有个家 🏠'],
    obey:  { heart: -18, dignity: 5, line: '你说，再看看。她把手机放下了。' },
    defy:  { heart: 13, dignity: -6, vacancy: 6, line: 'CALM 只回了一行：已记录。' }
  }
};

function shell(title) {
  const box = $('#ai-box');
  box.innerHTML = `
    <div class="rounded-2xl border border-sea/25 bg-[#070b0e] shadow-2xl overflow-hidden">
      <div class="flex items-center gap-2 border-b border-sea/20 px-4 py-2.5">
        <span class="h-2 w-2 rounded-full bg-sea/80"></span>
        <span class="font-mono text-[11px] tracking-widest text-sea/80">${title}</span>
        <span class="ml-auto font-mono text-[10px] text-neutral-700">no hesitation</span>
      </div>
      <div id="ai-scr" class="thin max-h-[52vh] overflow-y-auto px-4 py-4 font-mono text-[12.5px] leading-7 space-y-1"></div>
      <div id="ai-foot" class="border-t border-sea/20 px-4 py-3 flex flex-wrap items-center gap-2"></div>
    </div>`;
  $('#ai-layer').classList.add('on');
  return { scr: $('#ai-scr'), foot: $('#ai-foot') };
}
function closeAI() { $('#ai-layer').classList.remove('on'); $('#ai-box').innerHTML = ''; }

async function line(scr, text, cls = 'text-sea', prefix = '') {
  const d = document.createElement('div');
  d.className = cls;
  scr.appendChild(d);
  const full = prefix + text;
  for (let i = 0; i < full.length; i++) {
    d.textContent = full.slice(0, i + 1);
    if (i % 3 === 0) sfx.type();
    await sleep(20);
    scr.scrollTop = scr.scrollHeight;
  }
  await sleep(180);
}

// ── 一般咨询 ──────────────────────────────
export function askCalm(key) {
  const T = TOPICS[key];
  return new Promise(async resolve => {
    const { scr, foot } = shell('CALM-4 · 终端');
    S.aiAsked++;
    await line(scr, T.q, 'text-neutral-400', '> ');
    for (const l of T.calm) await line(scr, l, 'text-sea', 'CALM-4：');

    foot.innerHTML = `
      <button id="ai-obey" class="no-tap rounded border border-sea/40 px-4 py-2 font-mono text-[11.5px] text-sea hover:bg-sea/10 transition">采 纳</button>
      <button id="ai-defy" class="no-tap rounded border border-bruise/50 px-4 py-2 font-mono text-[11.5px] text-bruise hover:bg-bruise/10 transition">我还是要做</button>
      <button id="ai-warm" class="no-tap ml-auto rounded-full border border-rose/40 px-3 py-1.5 font-mono text-[11px] text-rose hover:bg-rose/10 transition">换一个顾问</button>`;

    const done = async (kind) => {
      foot.innerHTML = '';
      const d = kind === 'obey' ? T.obey : T.defy;
      await line(scr, d.line, kind === 'obey' ? 'text-neutral-500' : 'text-bruise', '');
      const delta = {};
      ['heart', 'dignity', 'vacancy', 'echo'].forEach(k => { if (d[k]) delta[k] = d[k]; });
      if (kind === 'obey') {
        S.aiObeyed++; flag('obeyedOnce');
        mod(delta, { raw: true });
        toast('你采纳了 CALM。数值上你是对的。', 'sea');
      } else {
        S.aiDefied++;
        mod(delta);
        toast('CALM 不会劝第二次。', 'gold');
      }
      S.aiLeft = Math.max(0, S.aiLeft - 1);
      await sleep(1500);
      closeAI();
      resolve(kind);
    };

    $('#ai-obey').onclick = () => { sfx.click(); done('obey'); };
    $('#ai-defy').onclick = () => { sfx.click(); done('defy'); };
    $('#ai-warm').onclick = async () => {
      sfx.pick();
      foot.innerHTML = '';
      scr.innerHTML = '';
      await line(scr, T.q, 'text-neutral-400', '> ');
      for (const l of T.warm) await line(scr, l, 'text-rose', '暖包 v0.1：');
      await line(scr, '开心最重要啦！ ✨🍞', 'text-rose', '暖包 v0.1：');
      foot.innerHTML = `<button id="ai-go" class="no-tap rounded border border-rose/50 px-4 py-2 font-mono text-[11.5px] text-rose hover:bg-rose/10 transition">好，那就做</button>`;
      $('#ai-go').onclick = () => { sfx.click(); flag('warmUsed'); done('defy'); };
    };
  });
}

// ── 终局强制咨询：五千万 ──────────────────────────────
export function askFinal() {
  return new Promise(async resolve => {
    const { scr, foot } = shell('CALM-4 · 终端 · 读取全部现金资产');
    await line(scr, '五千万，美元。给还是不给。', 'text-neutral-400', '> ');
    await sleep(300);

    // 跑一遍资产
    const bar = document.createElement('div');
    bar.className = 'text-[11px] text-neutral-600';
    scr.appendChild(bar);
    for (let i = 0; i <= 100; i += 7) {
      bar.textContent = `读 API … ${i}%  [${'█'.repeat(Math.round(i / 7)).padEnd(15, '·')}]`;
      sfx.type(); await sleep(85);
    }
    bar.textContent = '读 API … 100%  [███████████████]';
    await sleep(400);
    await line(scr, '已扫描全部现金资产。', 'text-sea', 'CALM-4：');
    await line(scr, '结论：支付不会对你产生任何影响。', 'text-sea', 'CALM-4：');
    await sleep(500);
    await line(scr, '但你不应该支付。', 'text-sea font-bold', 'CALM-4：');
    await sleep(900);
    await line(scr, '她不再爱我了吗？', 'text-neutral-400', '> ');
    await sleep(700);
    await line(scr, '对于爱情，我不关心，也不理解。', 'text-sea', 'CALM-4：');
    await line(scr, '但是你不能把这五千万美元给她。', 'text-sea font-bold', 'CALM-4：');
    await sleep(1200);

    const note = document.createElement('div');
    note.className = 'mt-3 border-t border-sea/15 pt-3 text-[11px] leading-6 text-neutral-600 font-serif';
    note.innerHTML = `我盯着那行字看了很久。<br>
      让我毛骨悚然的不是它聪明，是它一点犹豫都没有。<br>
      <span class="text-neutral-500">它不为难。</span><br>
      我当时想，这大概是更高的一种东西。人做不到这样。`;
    scr.appendChild(note); scr.scrollTop = scr.scrollHeight;
    await sleep(3000);

    foot.innerHTML = `
      <button id="fa-warm" class="no-tap rounded-full border border-rose/40 px-3 py-1.5 font-mono text-[11px] text-rose hover:bg-rose/10 transition">换一个顾问</button>
      <button id="fa-close" class="no-tap ml-auto rounded border border-neutral-700 px-4 py-2 font-mono text-[11.5px] text-neutral-400 hover:border-bruise hover:text-bruise transition">关掉终端</button>`;

    $('#fa-warm').onclick = async () => {
      sfx.pick();
      foot.innerHTML = '';
      await line(scr, '哥，都到这一步了。💗', 'text-rose', '暖包 v0.1：');
      await line(scr, '给了就有以后了呀～', 'text-rose', '暖包 v0.1：');
      flag('warmUsed');
      await sleep(900);
      foot.innerHTML = `<button id="fa-close2" class="no-tap ml-auto rounded border border-neutral-700 px-4 py-2 font-mono text-[11.5px] text-neutral-400 hover:border-bruise transition">关掉终端</button>`;
      $('#fa-close2').onclick = () => { sfx.click(); closeAI(); resolve(true); };
    };
    $('#fa-close').onclick = () => { sfx.click(); closeAI(); resolve(true); };
  });
}

// ── 侧栏按钮：自由咨询（剩余次数） ──────────────────────────────
export function bindAdvisorButton(getKey) {
  $('#btn-ai').onclick = async () => {
    if (S.aiLeft <= 0) { toast('CALM 不会劝第二次。', 'gray'); return; }
    const key = getKey();
    if (!key) { toast('现在没什么可问的。', 'gray'); return; }
    sfx.click();
    await askCalm(key);
  };
}
