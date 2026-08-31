// ============================================================
// audio.js — Web Audio 合成音效。无外部资源，零加载。
// 「关灯的声音」与回声值联动：回声越高，余响越长。
// ============================================================
import { S } from './state.js';

let ctx = null;
const ac = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

function env(node, t, a, d, peak = 0.2) {
  const g = ac().createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  node.connect(g);
  return g;
}

function tone({ f = 440, type = 'sine', a = 0.005, d = 0.15, peak = 0.15, slide = 0, delay = 0 }) {
  if (S.muted) return;
  const c = ac(), t = c.currentTime + delay;
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + a + d);
  env(o, t, a, d, peak).connect(c.destination);
  o.start(t); o.stop(t + a + d + 0.05);
}

function noise({ d = 0.12, peak = 0.12, hp = 600, lp = 6000, delay = 0 }) {
  if (S.muted) return;
  const c = ac(), t = c.currentTime + delay;
  const len = Math.max(1, Math.floor(c.sampleRate * d));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const dt = buf.getChannelData(0);
  for (let i = 0; i < len; i++) dt[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource(); src.buffer = buf;
  const f1 = c.createBiquadFilter(); f1.type = 'highpass'; f1.frequency.value = hp;
  const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp;
  const g = c.createGain(); g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  src.connect(f1).connect(f2).connect(g).connect(c.destination);
  src.start(t);
}

export const sfx = {
  type:    () => tone({ f: 1500 + Math.random() * 400, type: 'square', d: 0.012, peak: 0.012 }),
  click:   () => { tone({ f: 660, type: 'triangle', d: 0.07, peak: 0.1 }); },
  pick:    () => tone({ f: 880, type: 'sine', d: 0.09, peak: 0.09, slide: 260 }),
  back:    () => tone({ f: 420, type: 'sine', d: 0.1, peak: 0.08, slide: -160 }),
  paper:   () => noise({ d: 0.2, peak: 0.09, hp: 1800, lp: 9000 }),      // 小票摩擦
  cash:    () => { noise({ d: 0.13, peak: 0.09, hp: 900, lp: 7000 }); noise({ d: 0.1, peak: 0.06, hp: 1400, delay: 0.09 }); },
  tape:    () => noise({ d: 0.3, peak: 0.14, hp: 500, lp: 4200 }),        // 撕胶带
  sand:    () => noise({ d: 0.09, peak: 0.055, hp: 1200, lp: 5200 }),     // 砂条
  ok:      () => { tone({ f: 523, d: 0.14, peak: 0.11 }); tone({ f: 784, d: 0.22, peak: 0.1, delay: 0.1 }); },
  bad:     () => { tone({ f: 210, type: 'sawtooth', d: 0.26, peak: 0.1, slide: -80 }); },
  coin:    () => { tone({ f: 1200, d: 0.06, peak: 0.09 }); tone({ f: 1800, d: 0.12, peak: 0.07, delay: 0.05 }); },
  beat:    () => { tone({ f: 62, type: 'sine', d: 0.2, peak: 0.32 }); tone({ f: 48, type: 'sine', d: 0.3, peak: 0.2, delay: 0.16 }); },
  dial:    () => { tone({ f: 480, d: 0.5, peak: 0.07 }); tone({ f: 620, d: 0.5, peak: 0.07 }); },
  firework:() => { noise({ d: 0.7, peak: 0.16, hp: 200, lp: 3000 }); tone({ f: 140, type: 'sine', d: 0.5, peak: 0.12, slide: -90 }); },

  // 关灯的声音：在这一层里走了两趟才停
  lightsOut() {
    if (S.muted) return;
    noise({ d: 0.05, peak: 0.2, hp: 1500, lp: 9000 });          // 啪
    const trips = S.echo >= 40 ? 3 : 2;
    for (let i = 1; i <= trips; i++) {
      noise({ d: 0.22 + i * 0.14, peak: 0.075 / i, hp: 240, lp: 2000, delay: 0.2 * i });
    }
  },

  // 海：回声越高，海越大，语气越听不清
  sea(seconds = 4) {
    if (S.muted) return;
    const c = ac(), t = c.currentTime;
    const len = Math.floor(c.sampleRate * seconds);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + (Math.random() * 2 - 1) * 0.02) * 0.995; d[i] = last; }
    const src = c.createBufferSource(); src.buffer = buf;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
    const g = c.createGain();
    const vol = 0.1 + (S.echo / 100) * 0.36;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 1.1);
    g.gain.linearRampToValueAtTime(0.0001, t + seconds);
    src.connect(lp).connect(g).connect(c.destination);
    src.start(t);
  },

  boot() { // 老式白机开机
    if (S.muted) return;
    tone({ f: 190, type: 'square', d: 0.1, peak: 0.07 });
    tone({ f: 300, type: 'square', d: 0.1, peak: 0.06, delay: 0.11 });
    noise({ d: 0.5, peak: 0.03, hp: 3000, lp: 12000, delay: 0.24 });
  }
};

export const unmuteHint = () => { try { ac(); } catch (e) { /* 用户未交互 */ } };
