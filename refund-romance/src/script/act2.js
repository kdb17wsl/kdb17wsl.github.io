// ============================================================
// act2.js — 三·出去走走（称呼、封光、日落、八万、彩礼五张卡、求婚）
// ============================================================
import { S, mod, flag, pay, has, chapter, rot, addName } from '../state.js';
import { say, silence, weight, chapterCard, choose, echoChoice, annotate, sleep, toast, clearStream } from '../ui.js';
import { blackCard, lightsOut } from '../fx.js';
import { sfx } from '../audio.js';
import { mgTape, mgLeaveTape } from '../minigames/tape.js';
import { mgFuel } from '../minigames/cinema.js';
import { askCalm } from '../systems/advisor.js';

// 她的称呼：全局只有两种
export const her = () => has('honorific') ? '妈妈' : '她';
const herSaid = t => t;

export async function act3() {
  chapter(3);
  clearStream();
  await chapterCard(3);

  await say('她说，这边人太多，会被认出来，我们出去走走。', 'her');
  await say('我说好。', 'me');
  await say('她在地图上指了一下一个我没听过的地方。', 'nar');
  await say('我说好。', 'me');
  await say('我出去打了个电话，回来才知道那个地方在很远的大洋上，是一座冷火山岛。', 'nar');
  await weight('第二天中午，我们一行三十个人出发', '一架 A330 在机场等着');

  pay({
    item: '包机 · 三十人（宽体客机）', ton: 0.36, date: '出去走走 · 第 1 天',
    status: '已履约', refundable: true,
    note: '按两百人设计的飞机，我们只有三十个人。',
    arb: '航段已执行，燃油部分不可退。'
  });

  // ── 节点 4：叫我妈妈 ──
  await say('飞机的卧室里她问我，我的名字好听吗。', 'her');
  await say('我说好听。', 'me');
  await say('「我爸爸的姓和我妈妈的姓拼在一起的，是不是很巧。」', 'her');
  await say('我说我第一天就记住了。', 'me');
  await say('她抱着我说，以后别叫我名字了——', 'her');
  await say('「叫我妈妈吧。」', 'her');

  const n4 = await choose('', [
    { t: '「好，妈妈。」', sub: '' },
    { t: '「叫姐吧。」', sub: '' },
    { t: '不叫。', sub: '' }
  ]);
  await echoChoice(n4.t);

  if (n4.t.includes('妈妈')) {
    flag('honorific'); flag('honorificLock');
    mod({ heart: 6 });
    S.dignity = Math.min(S.dignity, 30);
    mod({ dignity: 0 });
    toast('称呼已生效 · 心动收益 ×1.5 · 尊严锁定 30', 'rose');
    await say('好，妈妈。', 'me');
    pay({
      item: '称呼变更服务（名字 → 妈妈）', ton: 0, date: '出去走走 · 机上',
      status: '生效中', refundable: false,
      note: '她爸爸的姓和她妈妈的姓拼在一起。',
      arb: '称呼一旦生效，不支持恢复原状。'
    });
  } else if (n4.t.includes('姐')) {
    await say('她笑了一下，没说话。然后她转过去睡了。', 'nar');
    mod({ heart: -18 }, { raw: true });
    flag('bargained');
  } else {
    await say('她没有再提这件事。落地以后她一个人先下了飞机。', 'nar');
    mod({ heart: -35 }, { raw: true });
    S.vacancy = 0; mod({ vacancy: 0 });
    flag('refusedHonorific');
  }

  // ── 落地 ──
  await say('落地以后机长过来告诉我：老板，岛上一开始不让降，他们没见过这么大的私人飞机。', 'dim');
  await say('岛上规矩一样，周围不能有人。助理去处理了，没有人问为什么。', 'nar');
  await say('这次我没问多少人。', 'quiet');
  mod({ vacancy: 10 });

  // 那一层楼
  await say('酒店问我，要不要把那一层整个包下来。三十天。', 'sys');
  if (S.aiLeft > 0) {
    const want = await choose('', [
      { t: '先问一下终端。', sub: 'CALM-4 会读你的行程和预定记录' },
      { t: '不问，直接包。', sub: '' }
    ]);
    if (want.t.startsWith('先问')) {
      await askCalm('floor');
    } else {
      mod({ heart: 10 }); mod({ vacancy: 12 });
    }
  }
  pay({
    item: '酒店整层 30 天（为了她的隐私）', ton: 0.98, date: '出去走走 · 第 2 天',
    status: '已预订', refundable: true, partial: true,
    note: '她住了八天就走了。剩下的二十二天，清洁工每天照常上去。',
    arb: '登记上写着有人。'
  });

  // 崖顶那层楼 / 岛上酒店
  await say('酒店正对着大洋，落地窗太大。她睡觉不能有一丝光。', 'nar');
  await mgTape(1);

  // ── 节点 7：不如西北那个小镇的日落 ──
  await say('我们在公路边停下看日落，助理从车上搬下来玫瑰花，开了香槟。', 'nar');
  await say(`${her()}看着云海说，好美。`, 'her');
  await say('「不过不如西北那个小镇的日落。」', 'her');
  await silence(1400, '（我是那个小镇的人。）');

  const n7 = await choose('', [
    { t: '不说。', sub: '' },
    { t: '「我就是那儿的人。」', sub: '' },
    { t: '「那我们去那儿。」', sub: '' }
  ]);
  await echoChoice(n7.t);
  if (n7.t === '不说。') {
    await say('我没有说。', 'nar');
    mod({ echo: 6 });
    flag('didntSay');
  } else if (n7.t.includes('我就是')) {
    await say(`${her()}停了一下，问我：那你是几岁走的？`, 'her');
    await say('这是她第一次主动问我一件关于我自己的事。', 'quiet');
    mod({ heart: 10 }); mod({ dignity: 5 }); mod({ echo: -8 });
    flag('sheAsked');
    toast('她第一次问了你一个问题', 'gold');
  } else {
    await say('她说太远了。', 'her');
    rot(1);
  }

  await say('夜晚我们在山顶看星星，穿着棉袄还是冷。', 'nar');
  await say('「许个愿吧。」', 'her');
  await say('我问，你许了什么。', 'me');
  await say('「不告诉你。」', 'her');
  await say('「太美了。但就是太冷了，我们去暖的地方好不好。」', 'her');
  await say('我说，好吧。', 'me');
  await weight('这里零下十五度，那里二十七度', '直线九千五百公里 · 飞十一小时');

  // 配平放油
  await mgFuel();

  await say('「小飞机声音好吵。还是大飞机好。」', 'her');
  await say('去那边的飞机卧室里，她跟我说，她许的愿是——', 'nar');
  await say('和我要一个孩子。必须找人代着生。', 'her');
  await say('我没有问过为什么。我以为她怕疼。', 'quiet');
  pay({
    item: '2027 年春天 · 预约金', ton: 0.002, date: '出去走走 · 机上',
    status: '已支付', refundable: false,
    note: '这是她主动提的。快一点的话还能属马。',
    arb: '预约类服务，定金不退。'
  });

  // ── 节点 6：八万块的威胁 ──
  await say('中途她突然坐起来找手机，连上网，说糟了。', 'nar');
  await say('我问怎么了。', 'me');
  await say('「有个人要威胁我，问了三天了，我一直没回。」', 'her');
  await say('我说要多少。', 'me');
  await say('「不用你管。」', 'her');
  await say('她打字打了很久，删了改，改了删。打完把手机扣在腿上，过一会儿又翻过来看。', 'nar');
  await say('我问那人是谁。', 'me');
  await say('「以前跟我一起做事的，出了事，扛了下来。出来走投无路，一定要找我。」', 'her');

  const n6 = await choose('', [
    { t: '「干脆报警。」', sub: '' },
    { t: '「这个也用得着想三天。」', sub: '' },
    { t: '「我替你给，加个零。」', sub: '' }
  ]);
  await echoChoice(n6.t);

  await say('我说你给了吗。', 'me');
  await say('「给了。」', 'her');
  await say('多少。', 'me');
  await weight('她说', '八万');

  if (n6.t.includes('报警')) {
    await say('她看了我一眼。', 'nar');
    await say('「你不懂。」', 'her');
    mod({ heart: -8 }, { raw: true });
    flag('youDontGet');
  } else if (n6.t.includes('三天')) {
    await say('她没说话。', 'nar');
    await say('那天剩下的时间她一直没怎么说话。落地了才睡着。', 'nar');
    mod({ heart: -20 }, { raw: true });
    flag('silentDay');
    // 具体的惩罚：所有互动按钮灰掉一段真实时间
    toast('她一句话也不说。等一会儿。', 'gray');
    await sleep(4200);
  } else {
    await say('她把手机扣在腿上，过一会儿又翻过来看。', 'nar');
    mod({ heart: 3 }); mod({ dignity: -12 });
    pay({
      item: '代她支付的一笔钱（加了个零）', ton: 0.008, date: '出去走走 · 机上',
      status: '已转出', refundable: true,
      note: '她说不用你管。', arb: '第三方收款，平台无法介入。'
    });
  }

  // ── 无鞋岛 ──
  await say('最早到的是她的箱子。三十个人的行李，小飞机装不下，分了三架。', 'nar');
  await say('她只有一只箱子，单独一架。她说不要和别人的放在一起。', 'her');
  await say('那地方是出了名的 no news, no shoes。她放心了。', 'dim');
  await weight('酒店管家、保镖、助理', '一共二十六个人');
  await say('还有两个无人机手远远跟着。助理们又开始贴胶带了。空调的灯，插座的灯，一遍又一遍。', 'nar');
  pay({
    item: '随行人员 26 人 · 十四天', ton: 0.21, date: '出去走走 · 第 8 天',
    status: '已履约', refundable: false,
    note: '还有两个无人机手远远跟着。', arb: '劳务已发生，不予退还。'
  });
  await mgTape(2);

  await say('晚上我们像交换暗号一样交换了彼此的前任，就像一个王朝在核对年号。', 'nar');
  await say('她不愿意有任何差池。不过她有一个禁忌词，那个人不能提。', 'nar');
  const p1 = await say('我没提。', 'me');
  if (has('fileKept')) annotate(p1, '虽然我知道，她背上的纹身是因为那个人。可能因为太大了洗不掉。');

  // ── 彩礼：五张卡 ──
  await say('「现在我们是一家人了。我爸妈把我养这么大不容易，你得给彩礼。」', 'her');
  await say('她报了两个名字，和两个账号。', 'nar');
  await weight('彩礼', '三千万 · 人民币');
  if (S.aiLeft > 0) {
    const want = await choose('（要不要先问一下终端？）', [
      { t: '先问 CALM-4。', sub: '它会读你的资产' },
      { t: '不问，直接转。', sub: '' }
    ]);
    if (want.t.startsWith('先问')) await askCalm('betrothal');
  }
  await mgCards();

  // ── 节点 9：那张糊图 ──
  if (has('blurryPhoto')) {
    await say('太无聊的时候，我在摆弄那张 2007 年的图，想传到新设备上。', 'nar');
    await say('她把头凑过来：「你怎么背着我存别的女人的照片，这是谁。」', 'her');

    const n9 = await choose('', [
      { t: '沉默。当晚把图删了。', sub: '' },
      { t: '沉默。当晚删了，第二天从旧手机里找回来。', sub: '' },
      { t: '「这是你。2007 年。」', sub: '' }
    ]);
    await echoChoice(n9.t);
    if (n9.t === '沉默。当晚把图删了。') {
      await silence(1600, '（我沉默了。什么也没说。）');
      await say('她看图太糊了，就去忙别的了。那天晚上我把那张图删了。', 'nar');
      S.flags.delete('blurryPhoto');
      mod({ heart: 5 });
      toast('失去道具【一张糊图】', 'gray');
    } else if (n9.t.includes('找回来')) {
      await silence(1400, '（我沉默了。）');
      await say('那天晚上我把那张图删了。', 'nar');
      await say('第二天又从旧手机里找回来了。', 'nar');
      mod({ heart: 5 }); mod({ echo: 2 });
      toast('保留【一张糊图】', 'gold');
    } else {
      await say('她凑近看了一眼，说这也太丑了，然后去忙别的了。', 'her');
      mod({ heart: -3 }, { raw: true }); mod({ dignity: 8 });
      flag('toldHerPhoto');
    }
  }

  // ── 撕番位 ──
  await say('她手机也刷个不停，我问她看什么。', 'me');
  await say('「没什么，就是排位的那些破事。」', 'her');
  await say('一部戏只能有一个人排第一。', 'sys');
  const rank = await choose('', [
    { t: '帮她拉一把。', sub: '' },
    { t: '「无聊啊。」', sub: '' }
  ]);
  await echoChoice(rank.t);
  if (rank.t.startsWith('帮她')) {
    await mgRank();
  } else {
    await say('「是啊。更难的是，有时候一进组四五十天，晚上还要跟同一个人对戏，白天继续排。」', 'her');
    await say('我说太反人性了。', 'me');
    await say('「是啊。不过拍完了，无论之前怎么样，就当一切都没发生。」', 'her');
    await say('然后她又看了半个小时。', 'quiet');
    mod({ echo: 2 });
  }

  // ── 求婚 ──
  await say('新的一年，我在岛上向她求婚了。', 'nar');
  await say('是前一天早上决定的。戒指在很远的城市。岛上没有卖戒指的地方，助理坐水上飞机去了首府，下午回来，戒指装在一个酒店的信封里。', 'nar');
  await say('「钻戒太小了。」', 'her');
  await say('「没事，以后补个大的。」', 'her');
  await say('「另外，你能来北方那座城市吗？」', 'her');
  await silence(1900, '（我沉默了。）');
  await say('她以为我不想去。', 'nar');
  await say('「你为什么对我这么好。」', 'her');
  await say('我说因为我喜欢你。', 'me');
  await say('「那你以前对别人也这样吗。」', 'her');
  await say('我说没有。', 'me');
  await say('她笑了一下，没说话。', 'nar');
  pay({
    item: '戒指一枚（装在一个酒店的信封里）', ton: 0.014, date: '新年第二天',
    status: '已交付', refundable: true,
    note: '她说钻戒太小了。以后补个大的。',
    arb: '已佩戴商品影响二次销售，折价退还。'
  });

  // ── 她在算日子 ──
  await say('有一天早上我醒得早，她不在床上。', 'nar');
  await say('我出去看，她坐在露台上，对着海，整个海是黑的。没开灯，天还没亮。', 'nar');
  await say('我问她怎么起这么早。', 'me');
  await say('「我在算日子。」', 'her');
  await say('我说算什么。', 'me');
  await say('「你回去睡吧。」', 'her');
  await say('我在她旁边坐了一会儿，不知道说什么。后来我回去睡了。', 'nar');
  await say('我再醒过来的时候她已经化好妆了。', 'nar');

  await say('在岛上待了十四天，没有一个人认出她。', 'nar');
  await say('第十三天晚上在餐厅，她把墨镜摘了。过了一会儿，帽子也摘了，放在桌上。', 'nar');
  await say('她就那样坐了一顿饭。隔壁桌是一对老夫妻，服务生是本地人，没有人多看她一眼。', 'nar');
  await say('吃完她把帽子戴回去了。', 'nar');
  await say('「我们回去吧。」', 'her');
  await say('我说不是还没住够吗。', 'me');
  await say('「太安静了。」', 'her');

  await mgLeaveTape();
  rot(1);
}

// ── 彩礼：五张卡，第三张的那一下 ──────────────
function mgCards() {
  return new Promise(async resolve => {
    const { openMini, closeMini } = await import('../minigames/shell.js');
    const m = openMini('五张卡，两个账号', '一天一张卡限额一百万。她说太慢了。');
    let i = 0, stopped = false;
    const names = ['长辈账户 A', '长辈账户 B'];

    m.body.innerHTML = `
      <div class="space-y-2" id="cd-list"></div>
      <div id="cd-tip" class="mt-3 min-h-[40px] text-[12.5px] text-neutral-500"></div>`;
    const list = document.getElementById('cd-list');
    const tip = document.getElementById('cd-tip');

    for (let k = 0; k < 5; k++) {
      const d = document.createElement('div');
      d.className = 'rounded-lg border border-ink-600 bg-ink-900/60 px-3 py-2.5 flex items-center justify-between';
      d.innerHTML = `
        <div class="min-w-0">
          <div class="font-mono text-[11px] text-neutral-400">卡 ${k + 1} · 限额 100 万</div>
          <div class="text-[10px] text-neutral-600">收款：${names[k % 2]}</div>
        </div>
        <button data-k="${k}" class="no-tap rounded-full bg-bruise px-4 py-1.5 font-mono text-[11px] text-ink-900 disabled:opacity-25">滑动转账</button>`;
      list.appendChild(d);
    }
    m.setFoot(`<span class="text-[10.5px] text-neutral-600">她说，效率太低了。</span>`);
    paint();

    function paint() {
      list.querySelectorAll('button').forEach(b => {
        const k = +b.dataset.k;
        b.disabled = k !== i || stopped;
        if (k < i) { b.textContent = '已转出'; b.className = 'no-tap rounded-full border border-bruise/40 px-4 py-1.5 font-mono text-[11px] text-bruise'; }
      });
    }

    list.onclick = async e => {
      const b = e.target.closest('button[data-k]');
      if (!b || b.disabled) return;
      // 第三张，强制暂停：你犹豫了一下
      if (i === 2) {
        sfx.back();
        const hold = await hesitate();
        if (hold) {
          stopped = true;
          tip.innerHTML = '<span class="text-bruise">你停在了第三张。</span>';
          m.setFoot('');
          mod({ heart: -25 }, { raw: true }); mod({ dignity: 15 });
          flag('hesitated');
          toast('获得道具【犹豫】', 'gold');
          pay({
            item: '长辈见面礼（转出 2 / 5 张卡）', ton: 1.2, date: '回程当晚',
            status: '部分转出', refundable: true,
            note: '转到第三张的时候，我犹豫了一下。这一次我停下了。',
            arb: '未签收部分可申请退回。'
          });
          await sleep(2400); closeMini(); return resolve(false);
        }
      }
      i++; sfx.cash(); paint();
      if (i === 3) tip.textContent = '转到第三张的时候，我犹豫了一下。我还是转完了。';
      if (i >= 5) {
        stopped = true;
        m.setFoot('');
        tip.innerHTML = '过了一会儿，她把手机递过来给我看。对面回了两个字：<span class="text-bruise">收到。</span>';
        mod({ heart: 12 }); mod({ dignity: -10 });
        pay({
          item: '长辈见面礼（五张卡 / 两个账号）', ton: 3, date: '回程当晚',
          status: '已签收（回复：收到）', refundable: false,
          note: '那两个名字，我是在那四十几页里第一次见到的。',
          arb: '收货方已确认，交易关闭。'
        });
        await sleep(2600); closeMini(); resolve(true);
      }
    };

    function hesitate() {
      return new Promise(res => {
        const ov = document.createElement('div');
        ov.className = 'absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-ink-900/94';
        ov.innerHTML = `
          <div class="text-[15px] text-neutral-300">你犹豫了一下。</div>
          <div class="flex gap-3">
            <button id="hz-go" class="no-tap rounded-full bg-bruise px-5 py-2 font-mono text-[12px] text-ink-900">继续</button>
            <button id="hz-stop" class="no-tap rounded-full border border-ink-600 px-5 py-2 font-mono text-[12px] text-neutral-300 hover:border-bruise transition">停在这里</button>
          </div>`;
        document.getElementById('mini-body').style.position = 'relative';
        document.getElementById('mini-body').appendChild(ov);
        document.getElementById('hz-go').onclick = () => { sfx.click(); ov.remove(); res(false); };
        document.getElementById('hz-stop').onclick = () => { sfx.pick(); ov.remove(); res(true); };
      });
    }
  });
}

// ── 排位拔河：赢了以后，什么都没有发生 ──────────────
function mgRank() {
  return new Promise(async resolve => {
    const { openMini, closeMini } = await import('../minigames/shell.js');
    const m = openMini('一部戏只能有一个人排第一', '疯狂点击帮她拉绳');
    let v = 50, t = 8, done = false;
    m.body.innerHTML = `
      <div class="rounded-xl border hairline bg-ink-900/60 p-4">
        <div class="flex items-center justify-between font-mono text-[11px] mb-2">
          <span class="text-bruise">她</span><span class="text-neutral-500">对方</span>
        </div>
        <div class="h-6 rounded-full bg-ink-600 overflow-hidden">
          <div id="rk-bar" class="h-full bg-bruise transition-all duration-100" style="width:50%"></div>
        </div>
        <div class="mt-4 text-center">
          <button id="rk-btn" class="no-tap rounded-2xl bg-bruise px-10 py-5 text-lg font-bold text-ink-900 active:scale-95 transition">拉</button>
          <div class="mt-2 font-mono text-[11px] text-neutral-600">剩 <span id="rk-t">8</span>s</div>
        </div>
      </div>`;
    m.setFoot('<span class="text-[10.5px] text-neutral-600">这件事没有任何奖励。</span>');
    const bar = document.getElementById('rk-bar');
    document.getElementById('rk-btn').onclick = () => {
      if (done) return;
      v = Math.min(100, v + 5); bar.style.width = v + '%'; sfx.pick();
    };
    const iv = setInterval(async () => {
      t--; document.getElementById('rk-t').textContent = t;
      v = Math.max(0, v - 1.4); bar.style.width = v + '%';
      if (t <= 0) {
        clearInterval(iv); done = true;
        bar.style.width = '100%';
        m.setFoot('');
        m.body.innerHTML = `<div class="py-10 text-center space-y-3">
            <div class="text-4xl">🏆</div>
            <div class="text-[14px] text-neutral-300">她排第一了。</div>
            <div class="text-[13px] text-neutral-500">然后她又看了半个小时。</div>
            <div class="font-mono text-[11px] text-neutral-600">心动 +2 · 香蕉更黑了一点</div>
          </div>`;
        mod({ heart: 2 }, { raw: true });
        rot(1);
        sfx.ok();
        await sleep(2600); closeMini(); resolve(true);
      }
    }, 1000);
  });
}
