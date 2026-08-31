// ============================================================
// shell.js — mini-game 通用外壳：标题、副标题、内容区、底部条。
// ============================================================
const $ = s => document.querySelector(s);

export function openMini(title, sub) {
  const box = $('#mini-box');
  box.innerHTML = `
    <div class="rounded-2xl border hairline bg-ink-800 shadow-2xl overflow-hidden">
      <div class="border-b hairline px-5 py-3 flex items-baseline justify-between gap-3">
        <div class="min-w-0">
          <div class="text-[15px] font-bold text-bruise truncate">${title}</div>
          <div class="mt-0.5 text-[11px] text-neutral-500 truncate">${sub || ''}</div>
        </div>
        <div id="mini-meter" class="font-mono text-[11px] text-neutral-400 shrink-0 text-right"></div>
      </div>
      <div id="mini-body" class="p-4 sm:p-5"></div>
      <div id="mini-foot" class="border-t hairline px-5 py-3 flex items-center justify-between gap-3 text-[11px] text-neutral-500"></div>
    </div>`;
  $('#mini-layer').classList.add('on');
  return {
    body: $('#mini-body'),
    meter: $('#mini-meter'),
    foot: $('#mini-foot'),
    setMeter: h => { $('#mini-meter').innerHTML = h; },
    setFoot: h => { $('#mini-foot').innerHTML = h; }
  };
}

export function closeMini() {
  $('#mini-layer').classList.remove('on');
  $('#mini-box').innerHTML = '';
}

export const btn = (label, tone = 'gold') => {
  const map = {
    gold: 'bg-bruise text-ink-900 hover:brightness-110',
    ghost: 'border border-ink-600 text-neutral-300 hover:border-bruise',
    quiet: 'text-neutral-600 hover:text-neutral-400'
  };
  return `<button class="no-tap rounded-full px-5 py-2 font-mono text-[12px] transition active:scale-95 ${map[tone]}">${label}</button>`;
};
