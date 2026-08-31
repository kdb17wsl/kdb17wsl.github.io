// ============================================================
// endings.js — 六个结局 + 6 号星频道点评 + 对账单海报
// ============================================================
import { S, has, judgeEnding, isTrueEndReady, mod } from '../state.js';
import { sfx } from '../audio.js';
import { sleep, fmtTon, toast } from '../ui.js';

const $ = s => document.querySelector(s);

export const ENDINGS = {
  E1: {
    name: '十一秒', tag: '标准结局', emoji: '📵',
    lines: [
      '她说，行。她说，我知道了。她挂了。',
      '我把手机放在床头柜上，屏幕朝下。',
      '我把手按在自己的胸口，像一个医生在给别人做检查。',
      '心跳很稳。一分钟六十几下，和平时没有区别。',
      '我没有哭。我一直在等我哭。'
    ]
  },
  E2: {
    name: '两点五吨', tag: '你给了', emoji: '⚖️',
    lines: [
      '钱到账了。三天后那一层续订了三十天。',
      '机组每天照常报到，清洁工每天照常上去。',
      '之后没有人再见过她。',
      '一座失去皇后的宫殿。什么都不发生。',
      '空置度 100。心动值 —— 数据缺失。'
    ]
  },
  E3: {
    name: '信用分归零', tag: '你退了太多', emoji: '🚫',
    lines: [
      '你拿回了所有能拿回的。',
      '系统给你结算：钱回来了，尊严还在原地，回声很高。',
      '然后弹出一条通知：您的账号因高频退款被限制评价功能。',
      '你打开订单中心，想给那十九年写一句好评。',
      '输入框是灰的。'
    ]
  },
  E4: {
    name: '甜的，值', tag: '你一项都没退', emoji: '🍌',
    lines: [
      '你一项都没退。对账单上只有一行好评。',
      '你独自坐在阳台，手里一根黑掉的香蕉。',
      '你还是把它吃了。',
      '我知道那不是爱。',
      '但我 2007 年就答应过我自己：如果有一天名单上加了我，我不会拿回来。'
    ]
  },
  E5: {
    name: '更高的一种东西', tag: '你听了终端的话', emoji: '🖥️',
    lines: [
      '结论：资产不受影响。建议：不要支付。',
      '你问它，她不再爱我了吗。',
      '它说：对于爱情，我不关心，也不理解。但你不应该支付。',
      '它一点犹豫都没有。它不为难。',
      '你赢了。香蕉还是青的。'
    ]
  },
  E6: {
    name: '两个小时', tag: '隐藏结局', emoji: '🧹',
    lines: []
  }
};

// ── 隐藏结局：一间一间进 ──────────────
function hiddenEnding() {
  return new Promise(async resolve => {
    const box = $('#end-box');
    box.innerHTML = `
      <div class="min-h-full bg-black flex flex-col items-center justify-center px-5 py-10">
        <div class="w-full max-w-md">
          <div class="text-center">
            <div class="font-mono text-[10px] tracking-[0.4em] text-neutral-700">HIDDEN</div>
            <div class="mt-2 text-[13px] text-neutral-500">视角切换。你不再是那个打电话的人。</div>
          </div>
          <div class="mt-8 rounded-xl border border-neutral-800 p-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🛒</span>
              <div class="min-w-0">
                <div class="font-mono text-[11px] text-neutral-400">你推着一辆布草车。</div>
                <div class="font-mono text-[10px] text-neutral-600">整整一层，没有人住。</div>
              </div>
            </div>
            <div id="he-rooms" class="mt-4 grid grid-cols-6 gap-1.5"></div>
            <div id="he-step" class="mt-4 min-h-[22px] font-mono text-[11.5px] text-neutral-500"></div>
            <button id="he-btn" class="mt-3 w-full rounded-lg border border-neutral-700 py-2.5 font-mono text-[12px] text-neutral-300 hover:border-neutral-500 transition">进下一间</button>
          </div>
          <div class="mt-4 text-center font-mono text-[10px] text-neutral-700">没有计分。没有倒计时。没有音乐。</div>
        </div>
      </div>`;
    $('#end-layer').classList.add('on');

    const grid = $('#he-rooms');
    for (let i = 0; i < 24; i++) {
      const d = document.createElement('div');
      d.className = 'aspect-square rounded border border-neutral-800 bg-neutral-950';
      grid.appendChild(d);
    }
    const STEPS = ['换毛巾', '擦台面', '把被角掖好', '退出来，把门带上'];
    let room = 0, step = 0;
    const stepEl = $('#he-step'), btn = $('#he-btn');

    btn.onclick = async () => {
      if (room >= 24) return;
      btn.disabled = true;
      for (step = 0; step < STEPS.length; step++) {
        stepEl.textContent = `第 ${room + 1} 间 · ${STEPS[step]}`;
        sfx.sand();
        await sleep(260);
      }
      grid.children[room].className = 'aspect-square rounded border border-neutral-700 bg-neutral-800';
      room++;
      btn.disabled = false;
      btn.textContent = room >= 24 ? '做完了' : `进下一间（${room}/24）`;
      if (room >= 24) {
        btn.disabled = true;
        await sleep(900);
        await finish();
      }
    };

    async function finish() {
      box.innerHTML = `
        <div class="min-h-full bg-black flex items-center justify-center px-6">
          <div class="max-w-md text-center space-y-6">
            <div class="font-mono text-3xl text-neutral-300">两个小时。</div>
            <div class="space-y-2 text-[13.5px] leading-7 text-neutral-500">
              <div>助理问她，没人住，为什么还要做。</div>
            </div>
            <button id="he-ans" class="rounded-xl border border-bruise px-6 py-3 font-serif text-[15px] text-bruise hover:bg-bruise/10 transition">
              「登记上写着有人。」
            </button>
          </div>
        </div>`;
      $('#he-ans').onclick = async () => {
        sfx.ok();
        box.innerHTML = `
          <div class="min-h-full bg-black flex items-center justify-center px-6 py-16">
            <div class="max-w-sm text-center">
              <div class="font-mono text-[10px] tracking-[0.4em] text-neutral-700">CREDITS</div>
              <div class="mt-6 space-y-3">
                ${S.names.map(n => `<div class="font-serif text-[15px] text-neutral-300">${n}</div>`).join('')}
              </div>
              <div class="mt-8 font-mono text-[10px] text-neutral-700">片尾滚动的不是资产明细。</div>
              <div class="mt-10">
                <button id="he-go" class="rounded-full bg-bruise px-6 py-2.5 font-mono text-[12px] font-bold text-ink-900">看对账单</button>
              </div>
            </div>
          </div>`;
        $('#he-go').onclick = () => { $('#end-layer').classList.remove('on'); resolve(); };
      };
    }
  });
}

// ── 结局主入口 ──────────────
export async function showEnding(settleResult) {
  const key = judgeEnding();
  S.ending = key;
  if (key === 'E6') { await hiddenEnding(); }

  const E = ENDINGS[key];
  const box = $('#end-box');
  box.innerHTML = `
    <div class="min-h-full bg-[#0a0c0f] px-4 sm:px-6 py-10">
      <div class="mx-auto max-w-2xl">
        <div class="text-center">
          <div class="font-mono text-[10px] tracking-[0.4em] text-neutral-600">${E.tag}</div>
          <div class="mt-4 text-5xl">${E.emoji}</div>
          <h2 class="mt-4 text-3xl font-bold tracking-widest text-bruise">${E.name}</h2>
        </div>
        <div id="en-lines" class="mt-8 space-y-4 text-[14.5px] leading-8 text-neutral-400"></div>
        <div id="en-more" class="mt-10"></div>
      </div>
    </div>`;
  $('#end-layer').classList.add('on');

  const lines = key === 'E6'
    ? ['你做完了一整层。两个小时。', '没有人住。登记上写着有人。', '这一局，你记住了五个名字。']
    : E.lines;
  for (const l of lines) {
    const d = document.createElement('div');
    d.className = 'beat';
    d.textContent = l;
    $('#en-lines').appendChild(d);
    sfx.type();
    await sleep(1250);
  }
  await sleep(700);
  await channelSix(settleResult);
  await scoreboard(settleResult);
}

// ── 6 号星 · 夜航影厅 ──────────────
function channelSix(sr) {
  return new Promise(async resolve => {
    const wrap = $('#en-more');
    wrap.innerHTML = `
      <div class="rounded-2xl border border-rose/25 bg-[#0f0a0d] overflow-hidden">
        <div class="flex items-center gap-2 border-b border-rose/20 px-4 py-2.5">
          <span class="grid h-6 w-6 place-items-center rounded-full bg-rose/20 font-mono text-[11px] text-rose">6</span>
          <span class="font-mono text-[11px] tracking-widest text-rose/80">6 号星 · 夜航影厅</span>
          <span class="ml-auto font-mono text-[10px] text-neutral-700">深夜档</span>
        </div>
        <div class="px-4 py-5">
          <div class="flex gap-4 items-start">
            <div class="text-3xl shrink-0">🎙️</div>
            <div id="c6" class="min-w-0 flex-1 font-serif text-[14px] leading-8 text-neutral-300"></div>
          </div>
        </div>
      </div>`;

    const paid = S.paidTon.toFixed(2);
    const back = (sr?.refundTon || 0).toFixed(2);
    const script = [
      `观众朋友晚上好。本期我们聊一部很难归类的片子。`,
      `男主角全片共付出 ${paid} 吨，一句拒绝也没有——直到最后那一通电话。`,
      S.refunded === 0
        ? `片尾他一项都没退。评价内容：「${S.review || '甜的，值。'}」`
        : `片尾他退回了 ${back} 吨，其中有几项，平台没让他退。`,
      S.names.length >= 5
        ? `我们注意到一个细节：他记住了五个名字。这在同类影片中极为罕见。`
        : `我们注意到一个细节：全片有名有姓的，只有 ${S.names.length} 个人。`,
      has('honorific')
        ? `关于称呼，本台不作评价。片名我们建议改为——《为爱买单》。`
        : `片名我们建议改为——《为爱买单》。`,
      `下周同一时间，我们继续。`
    ];
    const el = $('#c6');
    for (const s of script) {
      const d = document.createElement('div');
      d.className = 'beat';
      el.appendChild(d);
      for (let i = 0; i < s.length; i++) { d.textContent = s.slice(0, i + 1); if (i % 3 === 0) sfx.type(); await sleep(24); }
      await sleep(500);
    }
    await sleep(900);
    resolve();
  });
}

// ── 对账单 + 海报导出 ──────────────
async function scoreboard(sr) {
  const wrap = $('#en-more');
  const stat = [
    ['已付重量', S.paidTon.toFixed(2) + ' 吨'],
    ['退回', (sr?.refundTon || 0).toFixed(2) + ' 吨'],
    ['凭证', S.receipts.length + ' 张'],
    ['仅退款', S.refunded + ' 项'],
    ['确认收货', S.kept + ' 项'],
    ['心动', S.heart],
    ['尊严', S.dignity],
    ['空置', S.vacancy],
    ['回声', S.echo],
    ['信用分', sr?.credit ?? 100],
    ['记住的名字', S.names.length + ' / 5'],
    ['后悔计数器', S.regret]
  ];

  wrap.insertAdjacentHTML('beforeend', `
    <div class="mt-6 rounded-2xl border hairline bg-ink-800/50 p-5">
      <div class="font-mono text-[11px] tracking-widest text-neutral-500">对账单</div>
      <div class="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        ${stat.map(([k, v]) => `
          <div class="rounded-lg border hairline bg-ink-900/60 px-3 py-2">
            <div class="text-[10px] text-neutral-600">${k}</div>
            <div class="mt-0.5 font-mono text-[15px] text-bruise">${v}</div>
          </div>`).join('')}
      </div>
      ${S.review ? `<div class="mt-4 rounded-lg border border-bruise/30 bg-bruise/5 px-3 py-2.5">
        <div class="font-mono text-[10px] text-neutral-500">追加好评</div>
        <div class="mt-1 font-serif text-[15px] text-bruise">${S.review}</div>
      </div>` : ''}

      ${!isTrueEndReady() && S.ending !== 'E6' ? `
      <div class="mt-4 rounded-lg border border-sea/25 bg-sea/5 px-3 py-2.5">
        <div class="font-mono text-[10px] text-sea">还有一个结局你没看到</div>
        <div class="mt-1 text-[11.5px] leading-6 text-neutral-500">
          它需要三件事：保留那张糊图、记住顺着一个方向、把回声压在 40 以下——<br>
          以及，问出五个人的名字。
        </div>
        <div class="mt-2 font-mono text-[10px] text-neutral-600">
          本局：糊图 ${has('blurryPhoto') ? '✓' : '✗'} · 方向 ${has('oneDirection') ? '✓' : '✗'} · 回声 ${S.echo}${S.echo < 40 ? ' ✓' : ' ✗'} · 名字 ${S.names.length}/5
        </div>
      </div>` : ''}

      <div class="mt-5 flex flex-wrap gap-2">
        <button id="sb-poster" class="rounded-full bg-bruise px-5 py-2.5 font-mono text-[12px] font-bold text-ink-900">生成对账单长图</button>
        <button id="sb-again" class="rounded-full border border-ink-600 px-5 py-2.5 font-mono text-[12px] text-neutral-300 hover:border-bruise transition">再来一局</button>
      </div>
      <canvas id="sb-cv" class="mt-4 hidden w-full max-w-xs mx-auto rounded-lg border hairline"></canvas>
      <div id="sb-hint" class="mt-2 hidden text-center font-mono text-[10px] text-neutral-600">长按图片保存 · 右键另存为</div>

      <p class="mt-6 text-center text-[10px] leading-5 text-neutral-700">
        虚构作品 · 情节与数值均为游戏设计 · 请勿与现实人物对应<br>
        不构成任何投资、法律、情感或消费建议<br>
        若你也想给谁申请退款：请先确认收货
      </p>
    </div>`);

  $('#sb-again').onclick = () => location.reload();
  $('#sb-poster').onclick = () => drawPoster(sr);
}

// ── Canvas 海报 ──────────────
function drawPoster(sr) {
  const cv = $('#sb-cv');
  const W = 720, H = 1280, dpr = 2;
  cv.width = W * dpr; cv.height = H * dpr;
  cv.classList.remove('hidden');
  $('#sb-hint').classList.remove('hidden');
  const c = cv.getContext('2d');
  c.scale(dpr, dpr);

  // 纸
  c.fillStyle = '#f4f1e9'; c.fillRect(0, 0, W, H);
  // 锯齿
  c.fillStyle = '#0a0c0f';
  for (let x = 0; x < W; x += 24) { c.beginPath(); c.arc(x, 0, 11, 0, Math.PI * 2); c.fill(); }
  for (let x = 0; x < W; x += 24) { c.beginPath(); c.arc(x, H, 11, 0, Math.PI * 2); c.fill(); }

  const F = (s, w = '400') => `${w} ${s}px "Noto Serif SC","Songti SC",serif`;
  const M = s => `${s}px ui-monospace,Menlo,monospace`;
  c.fillStyle = '#14171c';
  c.textAlign = 'center';
  c.font = M(15); c.fillStyle = '#7a7266';
  c.fillText('仅退款恋爱 · 对账单', W / 2, 62);
  c.font = F(46, '700'); c.fillStyle = '#14171c';
  c.fillText(ENDINGS[S.ending].name, W / 2, 122);
  c.font = M(13); c.fillStyle = '#9a9284';
  c.fillText(ENDINGS[S.ending].tag, W / 2, 150);

  // 分割
  const hr = y => { c.strokeStyle = '#c9c2b2'; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(48, y); c.lineTo(W - 48, y); c.stroke(); c.setLineDash([]); };
  hr(176);

  // 左右两栏
  c.textAlign = 'left';
  c.font = M(13); c.fillStyle = '#7a7266';
  c.fillText('我花的', 48, 208);
  c.textAlign = 'right';
  c.fillText('我得到的', W - 48, 208);

  const L = [
    ['一根香蕉', '0.62 吨'],
    ['放映厅清空', '26 个人'],
    ['遮光胶带', '50 卷'],
    ['长辈见面礼', '两个账号'],
    ['配平燃油', '放掉了'],
    ['抛指甲', '一个小时'],
    ['合计', S.paidTon.toFixed(2) + ' 吨']
  ];
  const R = [
    ['她的时间', '22 天'],
    ['一个称呼', has('honorific') ? '妈妈' : '名字'],
    ['一句话', '我知道了'],
    ['十一秒', S.silenceSeconds ? S.silenceSeconds + ' 秒' : '—']
  ];
  let y = 246;
  c.font = F(19);
  L.forEach(([k, v], i) => {
    c.textAlign = 'left'; c.fillStyle = i === L.length - 1 ? '#14171c' : '#3c4048';
    c.font = i === L.length - 1 ? F(21, '700') : F(19);
    c.fillText(k, 48, y);
    c.textAlign = 'right'; c.font = i === L.length - 1 ? M(19) : M(17);
    c.fillText(v, 330, y);
    y += 42;
  });
  y = 246;
  R.forEach(([k, v]) => {
    c.textAlign = 'left'; c.fillStyle = '#3c4048'; c.font = F(19);
    c.fillText(k, 400, y);
    c.textAlign = 'right'; c.font = M(17);
    c.fillText(v, W - 48, y);
    y += 42;
  });

  hr(560);

  // 四条数值
  const bars = [['心动', S.heart, '#b4646a'], ['尊严', S.dignity, '#6d7a90'], ['空置', S.vacancy, '#a8862f'], ['回声', S.echo, '#4b6f7c']];
  let by = 604;
  bars.forEach(([n, v, col]) => {
    c.textAlign = 'left'; c.font = M(15); c.fillStyle = '#7a7266';
    c.fillText(n, 48, by);
    c.fillStyle = '#e2ddd0'; c.fillRect(140, by - 12, W - 240, 12);
    c.fillStyle = col; c.fillRect(140, by - 12, (W - 240) * v / 100, 12);
    c.textAlign = 'right'; c.fillStyle = '#14171c';
    c.fillText(String(v), W - 48, by);
    by += 46;
  });

  hr(by + 6);

  // 结论
  c.textAlign = 'center';
  c.font = M(14); c.fillStyle = '#7a7266';
  const concl = `本次交易共 ${S.receipts.length} 项，退款 ${S.refunded} 项，好评 ${S.review ? 1 : 0} 条。`;
  c.fillText(concl, W / 2, by + 52);
  if (S.review) {
    c.font = F(30, '700'); c.fillStyle = '#14171c';
    c.fillText(`「${S.review}」`, W / 2, by + 108);
  }

  // 名字
  c.font = M(13); c.fillStyle = '#9a9284';
  c.fillText(`记住的名字：${S.names.length ? S.names.join(' · ') : '一个也没有'}`, W / 2, by + 168);

  // 水印
  c.font = M(12); c.fillStyle = '#a8a094';
  c.fillText('《仅退款恋爱》· 虚构荒诞喜剧 · 与现实无关', W / 2, H - 92);
  c.fillText('由 With 通过自然语言生成', W / 2, H - 66);
  // 假二维码方块
  c.fillStyle = '#14171c';
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
    if ((i * 3 + j * 7 + (i * j) % 5) % 3 === 0) c.fillRect(W / 2 - 54 + i * 12, H - 250 + j * 12, 11, 11);
  }
  c.font = M(11); c.fillStyle = '#9a9284';
  c.fillText('扫码也没用，这是画的', W / 2, H - 128);

  sfx.paper();
  toast('长图已生成', 'gold');
  cv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
