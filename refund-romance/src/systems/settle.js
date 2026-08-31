// ============================================================
// settle.js — 仅退款：逐项清算一段关系
// 每一次付出都是一张凭证。你亲手决定它是「确认收货」还是「申请仅退款」。
// 确认收货是隐性最优解：尊严 +2，且解锁那一项的真实附注。
// ============================================================
import { S, mod, flag, has } from '../state.js';
import { sfx } from '../audio.js';
import { fmtTon, toast, sleep } from '../ui.js';

const $ = s => document.querySelector(s);

// 补齐固定凭证（保证清单足够长）
const EXTRA = [
  { item: '崖顶整层 30 天（实住 8 天）', ton: 1.0, date: '第八天', status: '已履约', refundable: true, partial: true,
    note: '剩下的二十二天，清洁工每天照常上去。', arb: '登记上写着有人。' },
  { item: '飞机停场 · 机组每天报到', ton: 0.12, date: '第八天', status: '已履约', refundable: true,
    note: '一架飞机停在那里，机组每天照常报到。', arb: '停场费按日计，可退未使用日。' },
  { item: '玫瑰花与香槟（公路边）', ton: 0.0008, date: '出去走走 · 第 4 天', status: '已消耗', refundable: false,
    note: '她看着云海说好美。不过不如西北那个小镇的日落。', arb: '鲜切花不支持无理由退货。' },
  { item: '一件羽绒服', ton: 0.0000015, date: '2011', status: '已穿', refundable: false,
    note: '我记得这个价格，因为我犹豫了三天。', arb: '本商品由你自己买给你自己。不予受理。' }
];

export function openSettle() {
  return new Promise(resolve => {
    // 清算阶段解除尊严锁：确认收货是唯一能把尊严拉回来的路
    S.flags.delete('honorificLock');
    // 补齐 + 兜底
    EXTRA.forEach(e => { if (!S.receipts.some(r => r.item === e.item)) S.receipts.push(Object.assign({ id: 'R' + String(S.receipts.length + 1).padStart(2, '0') }, e)); });
    S.receipts.forEach((r, i) => r.id = 'R' + String(i + 1).padStart(2, '0'));

    const box = $('#settle-box');
    box.innerHTML = `
      <div class="h-full flex flex-col bg-[#0a0c0f]">
        <!-- 顶栏 -->
        <div class="shrink-0 border-b hairline px-4 sm:px-6 py-3">
          <div class="mx-auto max-w-4xl flex items-center gap-3">
            <span class="text-xl">🧾</span>
            <div class="min-w-0 flex-1">
              <div class="text-[15px] font-bold text-neutral-200">订单中心 · 逐项清算</div>
              <div class="mt-0.5 font-mono text-[11px] text-sea">共 <span id="st-total">0</span> 笔交易 · 待处理 <span id="st-left">0</span></div>
            </div>
            <div class="text-right shrink-0">
              <div class="font-mono text-[10px] text-neutral-600">信用分</div>
              <div class="font-mono text-lg" id="st-credit">100</div>
            </div>
          </div>
        </div>

        <!-- 列表 -->
        <div id="st-list" class="thin flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3"></div>

        <!-- 底栏 -->
        <div class="shrink-0 border-t hairline px-4 sm:px-6 py-3">
          <div class="mx-auto max-w-4xl flex flex-wrap items-center gap-3">
            <div class="font-mono text-[11px] text-neutral-500">
              退款 <span id="st-rf" class="text-bruise">0</span> · 收货 <span id="st-kp" class="text-sea">0</span> ·
              已退回 <span id="st-back" class="text-bruise">0.00 吨</span>
            </div>
            <button id="st-done" class="ml-auto rounded-full bg-bruise px-6 py-2.5 font-mono text-[12px] font-bold text-ink-900 disabled:opacity-30 transition">提交结算</button>
          </div>
        </div>
      </div>`;
    $('#settle-layer').classList.add('on');

    const list = $('#st-list');
    let credit = 100, refundTon = 0, warned = false;

    S.receipts.forEach(r => list.appendChild(card(r)));
    paint();

    function card(r) {
      const d = document.createElement('div');
      d.className = 'receipt mx-auto max-w-4xl rounded-[3px] px-4 py-3';
      d.dataset.id = r.id;
      d.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline gap-2 font-mono text-[10px] text-neutral-500">
              <span>${r.id}</span><span>·</span><span>${r.date || '—'}</span>
              <span class="ml-auto ${r.refundable ? 'text-neutral-500' : 'text-rose'}">${r.refundable ? (r.partial ? '部分可退' : '可退') : '不可退'}</span>
            </div>
            <div class="mt-1 font-serif text-[14.5px] text-ink-900">${r.item}</div>
            <div class="mt-1 flex items-baseline gap-3 font-mono text-[11px]">
              <span class="text-neutral-600">${r.status}</span>
              <span class="font-bold text-ink-900">${fmtTon(r.ton)}</span>
            </div>
            <div class="mt-2 hidden rounded border border-neutral-300 bg-white/60 px-2.5 py-2" data-note>
              <div class="font-mono text-[10px] text-neutral-500">附注</div>
              <div class="mt-0.5 font-serif text-[12.5px] leading-6 text-neutral-700">${r.note || '—'}</div>
            </div>
            <div class="mt-1.5 hidden font-mono text-[11px] text-rose" data-arb></div>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2" data-act>
          <button data-a="refund" class="rounded-full border border-neutral-400 px-3.5 py-1.5 font-mono text-[11px] text-neutral-700 hover:bg-neutral-200 transition">申请仅退款</button>
          <button data-a="keep" class="rounded-full border border-neutral-400 px-3.5 py-1.5 font-mono text-[11px] text-neutral-700 hover:bg-neutral-200 transition">确认收货</button>
        </div>
        <div class="mt-2 hidden font-mono text-[11.5px]" data-res></div>`;
      d.querySelectorAll('[data-a]').forEach(b => b.onclick = () => act(r, d, b.dataset.a));
      return d;
    }

    function act(r, d, a) {
      if (r.done) return;
      const res = d.querySelector('[data-res]');
      const arb = d.querySelector('[data-arb]');
      const note = d.querySelector('[data-note]');
      d.querySelector('[data-act]').remove();
      r.done = a;

      if (a === 'refund') {
        sfx.coin();
        if (!r.refundable) {
          arb.classList.remove('hidden');
          arb.textContent = '⌐ 平台仲裁：' + (r.arb || '交易已关闭。');
          res.classList.remove('hidden');
          res.className = 'mt-2 font-mono text-[11.5px] text-rose';
          res.textContent = '退款被驳回。';
          d.style.opacity = .72;
          S.rejected++;
          credit -= 4;
        } else {
          const back = r.partial ? r.ton * 0.5 : r.ton;
          refundTon += back;
          S.refunded++;
          credit -= 6;
          mod({ echo: 2 });
          arb.classList.remove('hidden');
          arb.textContent = '⌐ 平台仲裁：' + (r.arb || '同意退款。');
          res.classList.remove('hidden');
          res.className = 'mt-2 font-mono text-[11.5px] text-bruise';
          res.textContent = `已退回 ${fmtTon(back)}${r.partial ? '（部分）' : ''}`;
          d.style.background = '#efe9d8';
        }
      } else {
        sfx.paper();
        S.kept++;
        mod({ dignity: 2 });
        note.classList.remove('hidden');
        res.classList.remove('hidden');
        res.className = 'mt-2 font-mono text-[11.5px] text-sea';
        res.textContent = '已确认收货。尊严 +2';
        d.style.background = '#f8f6ef';
      }
      paint();
      riskCheck();
    }

    function paint() {
      const total = S.receipts.length;
      const doneN = S.receipts.filter(r => r.done).length;
      $('#st-total').textContent = total;
      $('#st-left').textContent = total - doneN;
      $('#st-rf').textContent = S.refunded;
      $('#st-kp').textContent = S.kept;
      $('#st-back').textContent = refundTon.toFixed(2) + ' 吨';
      const c = Math.max(0, credit);
      const cEl = $('#st-credit');
      cEl.textContent = c;
      cEl.className = 'font-mono text-lg ' + (c >= 70 ? 'text-sea' : c >= 40 ? 'text-bruise' : 'text-rose');
      $('#st-done').disabled = doneN < total;
      if (doneN >= total) $('#st-done').classList.add('glow');
    }

    // 退款额度累计到 80%：平台风控
    async function riskCheck() {
      const refundableTotal = S.receipts.filter(r => r.refundable).reduce((a, r) => a + r.ton, 0);
      if (!warned && refundableTotal > 0 && refundTon / refundableTotal >= 0.8) {
        warned = true;
        await sleep(400);
        const ov = document.createElement('div');
        ov.className = 'fixed inset-0 z-[75] flex items-center justify-center bg-black/80 p-6';
        ov.innerHTML = `
          <div class="max-w-sm rounded-2xl border border-rose/40 bg-ink-800 p-5 text-center">
            <div class="text-2xl mb-2">⚠️</div>
            <div class="text-[14px] text-neutral-200">检测到异常退款行为</div>
            <div class="mt-2 text-[12px] leading-6 text-neutral-500">您的信用分即将归零。<br>是否继续？</div>
            <div class="mt-4 flex gap-2 justify-center">
              <button id="rk-yes" class="rounded-full bg-rose px-5 py-2 font-mono text-[11.5px] text-white">继续</button>
              <button id="rk-no" class="rounded-full border border-ink-600 px-5 py-2 font-mono text-[11.5px] text-neutral-300">算了</button>
            </div>
          </div>`;
        document.body.appendChild(ov);
        sfx.bad();
        await new Promise(res => {
          ov.querySelector('#rk-yes').onclick = () => { flag('riskIgnored'); ov.remove(); res(); };
          ov.querySelector('#rk-no').onclick = () => { flag('riskStopped'); mod({ dignity: 4 }); ov.remove(); res(); };
        });
      }
    }

    $('#st-done').onclick = async () => {
      sfx.click();
      // 追加好评（可选）
      const ok = await reviewDialog();
      $('#settle-layer').classList.remove('on');
      box.innerHTML = '';
      resolve({ refundTon, credit: Math.max(0, credit), review: ok });
    };
  });
}

// ── 追加好评：12 字以内 ──────────────
const BAN = /景|甜|田|国庆|心爱|明星|女星|富豪|真名|某某/g;
function reviewDialog() {
  return new Promise(resolve => {
    const ov = document.createElement('div');
    ov.className = 'fixed inset-0 z-[78] flex items-center justify-center bg-black/85 p-5';
    const allowed = has('hesitated') || has('oneDirection');
    ov.innerHTML = `
      <div class="w-full max-w-sm rounded-2xl border hairline bg-ink-800 p-5">
        <div class="text-[14px] font-bold text-neutral-200">追加好评</div>
        <div class="mt-1 text-[11.5px] text-neutral-500">
          ${allowed ? '12 字以内。会印在对账单上。' : '需要【犹豫】或【顺着一个方向】才能追评。'}
        </div>
        ${allowed ? `
        <input id="rv-in" maxlength="12" placeholder="甜的，值。"
          class="mt-3 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2.5 font-serif text-[14px] text-neutral-200 outline-none focus:border-bruise">
        <div class="mt-1 text-right font-mono text-[10px] text-neutral-600"><span id="rv-n">0</span>/12</div>` : ''}
        <div class="mt-4 flex gap-2">
          ${allowed ? `<button id="rv-ok" class="flex-1 rounded-full bg-bruise py-2.5 font-mono text-[12px] font-bold text-ink-900">写上</button>` : ''}
          <button id="rv-skip" class="flex-1 rounded-full border border-ink-600 py-2.5 font-mono text-[12px] text-neutral-400">不写</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    if (allowed) {
      const inp = ov.querySelector('#rv-in');
      inp.oninput = () => { ov.querySelector('#rv-n').textContent = inp.value.length; };
      inp.focus();
      ov.querySelector('#rv-ok').onclick = () => {
        let v = inp.value.trim();
        if (BAN.test(v)) { v = '（此处已被平台折叠）'; toast('命中敏感词，已折叠。', 'gray'); }
        S.review = v || '甜的，值。';
        sfx.ok(); ov.remove(); resolve(true);
      };
    }
    ov.querySelector('#rv-skip').onclick = () => { sfx.click(); ov.remove(); resolve(false); };
  });
}
