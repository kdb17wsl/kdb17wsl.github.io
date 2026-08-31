// ============================================================
// state.js — 唯一数据源。所有数值变更必须经过 pay() / mod()，
// 以保证「每一次付出都生成一张凭证」这条铁律。
// ============================================================

export const S = {
  // 资源
  heart: 20,        // 心动
  dignity: 100,     // 尊严（只减不增，唯一例外：确认收货 / 极少数节点）
  vacancy: 0,       // 空置度
  echo: 0,          // 回声
  paidTon: 0,       // 已付重量（吨）
  // 时钟
  fresh: 0,         // 0 青 1 黄 2 斑 3 黑
  startAt: 0,
  limitMs: 15 * 60 * 1000,
  // 标记
  flags: new Set(),
  names: [],        // 收集到的名字
  receipts: [],
  aiLeft: 2,
  aiAsked: 0,
  aiObeyed: 0,
  aiDefied: 0,
  regret: 0,        // 后悔计数器
  refunded: 0,
  rejected: 0,
  kept: 0,
  silenceSeconds: 0,
  review: '',
  ending: null,
  chapter: 0,
  muted: false,
  auto: false
};

export const CH = ['序·重量', '一·2007', '二·第一次见面', '三·出去走走', '四·烟花', '五·第八天', '六·清算'];

const listeners = new Set();
export const onChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = (kind, payload) => listeners.forEach(f => f(kind, payload));

export const has = f => S.flags.has(f);
export const flag = f => { S.flags.add(f); };
export const unflag = f => { S.flags.delete(f); };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- 数值 ----------
// 心动收益公式：越空、越卑微，推进得越快
export function heartGain(base) {
  if (base <= 0) return base;
  const k = (1 + S.vacancy / 100) * (1 + (100 - S.dignity) / 100) * (has('honorific') ? 1.5 : 1);
  return Math.round(base * k);
}

export function mod(d = {}, opts = {}) {
  const before = { heart: S.heart, dignity: S.dignity, vacancy: S.vacancy, echo: S.echo };
  if (d.heart) S.heart = clamp(S.heart + (opts.raw ? d.heart : heartGain(d.heart)), 0, 100);
  if (d.dignity) S.dignity = clamp(S.dignity + d.dignity, 0, 100);
  if (d.vacancy) {
    S.vacancy = clamp(S.vacancy + d.vacancy, 0, 100);
    if (d.vacancy > 0) S.echo = clamp(S.echo + Math.round(d.vacancy * 0.3), 0, 100); // 真空必然回声
  }
  if (d.echo) S.echo = clamp(S.echo + d.echo, 0, 100);
  if (has('honorificLock')) S.dignity = Math.min(S.dignity, 30);
  emit('stat', { before, delta: d });
  return { heart: S.heart - before.heart, dignity: S.dignity - before.dignity };
}

// ---------- 凭证 ----------
// item 项目 / ton 计价 / date 日期 / status 履约 / refundable 可退 / note 附注 / arb 平台仲裁
export function pay(rc) {
  const r = Object.assign({
    id: 'R' + String(S.receipts.length + 1).padStart(2, '0'),
    item: '未命名支出', ton: 0, date: '', status: '已履约',
    refundable: true, note: '', arb: '', partial: false
  }, rc);
  S.paidTon = Math.round((S.paidTon + r.ton) * 1000) / 1000;
  S.receipts.push(r);
  emit('receipt', r);
  return r;
}

// ---------- 保鲜度 ----------
export function tick() {
  const p = clamp((Date.now() - S.startAt) / S.limitMs, 0, 1);
  const f = p < 0.3 ? 0 : p < 0.6 ? 1 : p < 0.88 ? 2 : 3;
  if (f !== S.fresh) { S.fresh = f; emit('fresh', f); }
  emit('clock', p);
  return p;
}
export function rot(n = 1) {
  S.startAt -= n * S.limitMs * 0.09;
  tick();
}

// 章节切换钩子：由 main.js 注册 IndexedDB 存档
let chapterHook = null;
export const onChapterChange = fn => { chapterHook = fn; };

export function chapter(i) {
  S.chapter = i;
  emit('chapter', i);
  if (chapterHook) chapterHook(i);
}
export function addName(n) {
  if (!S.names.includes(n)) { S.names.push(n); mod({ echo: -3 }); emit('name', n); }
}

// ---------- 结局判定 ----------
export function judgeEnding() {
  if (has('obeyedCalmFinal')) return 'E5';
  if (isTrueEndReady()) return 'E6';
  if (has('paidFinal')) return 'E2';
  if (S.refunded >= 8) return 'E3';
  if (S.refunded === 0 && S.dignity >= 60) return 'E4';
  return 'E1';
}
export const isTrueEndReady = () =>
  has('blurryPhoto') && has('oneDirection') && S.echo < 40 && S.names.length >= 5;
