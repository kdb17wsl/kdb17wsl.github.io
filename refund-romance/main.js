// ============================================================
// main.js — 引导与总装
// ============================================================
import { S, tick, chapter, has, onChapterChange } from './src/state.js';
import { initUI, say, sleep, chapterCard, clearStream, toast } from './src/ui.js';
import { sfx, unmuteHint } from './src/audio.js';
import { bindAdvisorButton } from './src/systems/advisor.js';
import { openSettle } from './src/systems/settle.js';
import { showEnding } from './src/systems/endings.js';
import { saveChapter, loadChapter, clearSave } from './src/systems/save.js';
import { act0, act1, act2 } from './src/script/act1.js';
import { act3 } from './src/script/act2.js';
import { act4, act5 } from './src/script/act3.js';

const $ = s => document.querySelector(s);

// 章节 → 该章的入口函数。存档只记章节号，恢复时从该章开头重走。
const ACTS = [act0, act1, act2, act3, act4, act5];
const CH_NAME = ['序·重量', '一·2007', '二·第一次见面', '三·出去走走', '四·烟花', '五·第八天', '六·清算'];

// ── 开屏 ──
(function boot() {
  let t = 2.5;
  const iv = setInterval(() => {
    t = Math.max(0, +(t - 0.1).toFixed(1));
    $('#dis-count').textContent = t.toFixed(1);
    if (t <= 0) {
      clearInterval(iv);
      $('#disclaimer').style.transition = 'opacity .6s';
      $('#disclaimer').style.opacity = 0;
      setTimeout(() => {
        $('#disclaimer').remove();
        $('#title').classList.remove('hidden');
        $('#title').classList.add('flex');
        offerContinue();
      }, 620);
    }
  }, 100);
})();

// ── 标题页：若有存档，显示「继续」 ──
async function offerContinue() {
  const rec = await loadChapter();
  if (!rec) return;
  const at = new Date(rec.at);
  const stamp = `${at.getMonth() + 1}月${at.getDate()}日 ${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
  const name = CH_NAME[rec.chapter] || '未知章节';

  const box = document.createElement('div');
  box.className = 'mt-6 mx-auto max-w-sm rounded-xl border border-bruise/35 bg-bruise/5 px-4 py-3';
  box.innerHTML = `
    <div class="font-mono text-[10px] tracking-widest text-neutral-500">上次停在</div>
    <div class="mt-1 text-[15px] text-bruise">${name}</div>
    <div class="mt-0.5 font-mono text-[10px] text-neutral-600">${stamp} · 只记了章节，数值会从这一章重新算</div>
    <div class="mt-3 flex gap-2">
      <button id="btn-resume" class="flex-1 rounded-full bg-bruise py-2 font-mono text-[12px] font-bold text-ink-900 hover:brightness-110 transition">从这一章继续</button>
      <button id="btn-wipe" class="rounded-full border border-ink-600 px-4 py-2 font-mono text-[12px] text-neutral-400 hover:border-rose hover:text-rose transition">删档</button>
    </div>`;
  $('#btn-start').insertAdjacentElement('afterend', box);

  box.querySelector('#btn-resume').onclick = () => { sfx.click(); begin(rec.chapter); };
  box.querySelector('#btn-wipe').onclick = async () => {
    sfx.back();
    await clearSave();
    box.remove();
    toast('存档已删除', 'gray');
  };
}

$('#btn-start').onclick = () => { sfx.click(); begin(0); };

// ── 启动（from = 起始章节）──
async function begin(from) {
  unmuteHint(); sfx.boot();
  $('#title').classList.add('hidden');
  $('#game').classList.remove('hidden');
  $('#game').classList.add('flex');
  initUI();
  bindAdvisorButton(pickTopic);
  onChapterChange(saveChapter);           // 每次切章自动写入 IndexedDB
  S.startAt = Date.now() + 60000;         // 序章不计时，第一次见面才开始
  setInterval(() => { if (has('clockStarted')) tick(); }, 500);

  // 跳章续玩：把香蕉时钟按跳过的章数折算，避免读档后一路青香蕉
  if (from > 0) {
    S.startAt = Date.now() - S.limitMs * Math.min(0.72, from * 0.13);
    if (from >= 2) { S.flags.add('clockStarted'); tick(); }
    toast(`从「${CH_NAME[from]}」继续`, 'gold');
  }
  await run(from);
}

// 当前可咨询的题目
function pickTopic() {
  if (S.chapter <= 2) return 'floor';
  if (S.chapter === 3) return 'betrothal';
  if (S.chapter === 4) return 'house';
  return null;
}

async function run(from = 0) {
  try {
    for (let i = from; i < ACTS.length; i++) await ACTS[i]();
    await settlePhase();
  } catch (e) {
    console.error(e);
    toast('出了点问题，但账还是要结的。', 'rose');
    await settlePhase();
  }
}

async function settlePhase() {
  chapter(6);
  clearStream();
  await chapterCard(6);

  // E5：听了终端的话 —— 提前结束，不进清算
  if (has('obeyedCalmFinal')) {
    await say('结论：资产不受影响。建议：不要支付。', 'ai');
    await say('你照做了。这一局提前结束了。', 'sys');
    await sleep(600);
    await clearSave();
    await showEnding({ refundTon: 0, credit: 100 });
    return;
  }

  await say('后来助理把所有的单子整理好，送了过来。', 'nar');
  await say('每一次付出都有一张。', 'nar');
  await say('你要一项一项处理它们：申请仅退款，还是确认收货。', 'sys');
  await sleep(500);
  const sr = await openSettle();
  await sleep(400);
  await clearSave();          // 一局走完，清掉存档
  await showEnding(sr);
}
