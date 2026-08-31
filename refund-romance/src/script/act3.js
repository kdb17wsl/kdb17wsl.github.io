// ============================================================
// act3.js — 四·烟花 / 五·第八天
// ============================================================
import { S, mod, flag, pay, has, chapter, rot } from '../state.js';
import { say, silence, weight, chapterCard, choose, echoChoice, annotate, sleep, toast, clearStream } from '../ui.js';
import { fireworks, blackCard, elevenSeconds, heartbeatScene } from '../fx.js';
import { sfx } from '../audio.js';
import { askCalm, askFinal } from '../systems/advisor.js';
import { her } from './act2.js';

// ─────────── 四 · 烟花 ───────────
export async function act4() {
  chapter(4);
  clearStream();
  await chapterCard(4);

  await say('回来以后，她见了我父母。', 'nar');
  await say('当天晚上她说，家里要筹备两家见面和婚事，尽可能多打点。还是那两个账号。', 'her');

  // ── 香港的房子 ──
  await say('「必须买一套房子，写我的名字。」', 'her');
  if (S.aiLeft > 0) {
    const want = await choose('', [
      { t: '先问一下终端。', sub: 'CALM-4 会读你的资产' },
      { t: '不问。', sub: '' }
    ]);
    if (want.t.startsWith('先问')) await askCalm('house');
  }
  const hs = await choose('', [
    { t: '「好吧。」', sub: '写她的名字' },
    { t: '「先租着看看。」', sub: '' }
  ]);
  await echoChoice(hs.t);
  if (hs.t.startsWith('「好吧')) {
    mod({ heart: 10 }); mod({ dignity: -6 }); mod({ vacancy: 6 });
    pay({
      item: '一套房 · 写她的名字', ton: 1.1, date: '回来以后',
      status: '登记完成', refundable: false,
      note: '过去半年助理一间一间挑的十几套，我一套也没去过。',
      arb: '不动产已过户，平台无权处理。'
    });
  } else {
    mod({ heart: -14 }, { raw: true }); mod({ dignity: 4 });
    flag('noHouse');
  }

  // ── 那个影子 ──
  await say('我把过去半年看的十几套房都发给她。她都嫌不好看。', 'nar');
  await say('那十几套房我一套也没去过，是助理花了半年一间一间挑的。助理转给我，我转给她。', 'nar');
  await say('有一套在半山，视频里能看见海。拍的是傍晚。', 'nar');
  const p = await say('有一个瞬间镜头晃了一下，拍到了拍视频的人的影子在墙上。', 'nar');
  annotate(p, '我看着那个影子想：这个人是谁，他今天走了多少路，看了多少房，他知不知道这套房是给谁看的。');

  const sh = await choose('', [
    { t: '给助理回一条：辛苦了，你叫什么？', sub: '（一个多余的动作）' },
    { t: '把视频转发给她，什么也不问。', sub: '' }
  ]);
  await echoChoice(sh.t);
  if (sh.t.startsWith('给助理')) {
    await say('过了两分钟他回了。他说他姓侯，叫侯春。他今天看了九套。', 'dim');
    const { addName } = await import('../state.js');
    addName('侯春');
    mod({ dignity: 4 });
    toast('记住了一个名字：侯春', 'gold');
  } else {
    mod({ echo: 4 });
  }

  // ── 抽了八管血 ──
  await say('她说手头的事情要先处理完，先不见了。', 'nar');
  await say('「能来北方那座城市吗？」', 'her');
  await silence(1700, '（我沉默了。）');
  await say('她没有说那里有什么。我也没问。', 'nar');
  await say('情人节也没见面。', 'dim');
  await say('有一次她在电话里说，今天早上抽了八管血。', 'her');
  await say('我说这么多。', 'me');
  await say('「还好。」', 'her');
  await say('我说辛苦了。然后我们聊了别的。', 'me');
  const q = await say('后来我才知道，那种检查日子不能错。她那天大概六点就出门了，天还没亮。', 'nar');
  annotate(q, '我知道这件事，是因为助理每月的汇总付款单里多了一项。金额不大。我批得很快。这类金额不需要我看明细。');
  await say('我不知道是哪家机构。我也不知道她是自己去的，还是有人陪。', 'quiet');
  pay({
    item: '每月检查费（汇总付款单第 7 项）', ton: 0.0009, date: '去年至今',
    status: '已批', refundable: false,
    note: '金额不大，我批得很快。这类金额不需要我看明细。',
    arb: '已发生费用，不予退还。'
  });

  // ── 烟花 ──
  await fireworks();
  mod({ echo: 6 });
  await say('第二天她说，先不去了，除非先看到那套房子。', 'her');
  await say('时间太紧，她还是上了那架飞机。', 'nar');
  rot(1);
}

// ─────────── 五 · 第八天 ───────────
export async function act5() {
  chapter(5);
  clearStream();
  await chapterCard(5);

  await say('第八天她打了电话。她那边是下午，我这边是凌晨。', 'nar');
  await weight('她说', '五千万，美元');
  await say('我说，让我想想。', 'me');
  await say('她没有说话。我听见她那边有海。', 'nar');
  await say('过了一会儿她说，好。', 'her');
  await say('她挂了。', 'nar');
  await silence(2000, '（我认识她以来，没有对她说过「让我想想」。）');

  // 强制问 AI
  await say('我把所有现金资产跑了一遍。我又核了一遍。', 'sys');
  await askFinal();

  await say('我从来没有拒绝过她。不是慷慨，是害怕。害怕下一秒的答案。', 'nar');
  await say('而现在有人替我说了。', 'quiet');

  // 第二天她打回来
  await say('第二天她打回来。', 'nar');
  await say('「海很大。」', 'her');
  await say('我说是吗。', 'me');
  await say('「这层楼太大了，有回声。早上有人来打扫，我躲在卫生间里等她们走。」', 'her');
  await say('我说可以不让她们来。', 'me');
  await say('「不用。」', 'her');

  // 那个清洁工
  const cl = await choose('', [
    { t: '「那个打扫的人，你知道她叫什么吗。」', sub: '' },
    { t: '不问。', sub: '' }
  ]);
  await echoChoice(cl.t);
  if (cl.t.startsWith('「那个打扫')) {
    await say('她停了一下，说：卢。她胸牌上写着卢。', 'her');
    const { addName } = await import('../state.js');
    addName('卢');
    mod({ dignity: 4 }); mod({ echo: -4 });
    toast('记住了一个名字：卢', 'gold');
  } else {
    mod({ echo: 3 });
  }

  await say('然后她说，诊所问我，孩子的父亲什么时候到。', 'her');
  await say('我说我可以派人过去。', 'me');
  await say('「不用。」', 'her');
  await say('然后她说，想好了吗。', 'her');

  // ── 节点 10：终局分岔 ──
  const n10 = await choose('（这一次，你得自己说。）', [
    { t: '「给。」', sub: '五千万，美元。' },
    { t: '「不给。」', sub: '照终端说的做。' },
    { t: '什么都不说。', sub: '（我没有在想任何事。）' }
  ]);
  await echoChoice(n10.t);

  if (n10.t === '「给。」') {
    flag('paidFinal');
    mod({ heart: 20 }); mod({ vacancy: 40 }); mod({ dignity: -12 });
    pay({
      item: '五千万美元（现金）', ton: 2.5, date: '第八天',
      status: '已转出', refundable: false,
      note: '她说，海很大。这层楼太大了，有回声。',
      arb: '大额跨境交易，平台不予受理。'
    });
    await say('三天后那一层续订了三十天。机组每天照常报到。', 'nar');
    await say('清洁工每天照常上去。', 'nar');
    await silence(2400, '（之后没有人再见过她。）');
  } else if (n10.t === '「不给。」') {
    flag('obeyedCalmFinal');
    mod({ dignity: 8 }); mod({ heart: -40 }, { raw: true });
    await say('她说，行。', 'her');
    await say('她说，我知道了。', 'her');
    await say('她挂了。', 'nar');
  } else {
    // 十一秒
    await say('不是在想。我没有在想任何事。', 'nar');
    await say('电话里她那边有海，我这边是维港，两边都没有人说话。', 'nar');
    const n = await elevenSeconds();
    flag('phoneDone');
    S.silenceSeconds = n;
    if (n >= 11) { flag('elevenFull'); mod({ echo: 4 }); }
    else mod({ echo: 8 });
    pay({
      item: '十一秒', ton: 0, date: '第八天 · 凌晨',
      status: '已消耗', refundable: false,
      note: `我数了一下，${n} 秒。`,
      arb: '时间类商品不支持七天无理由。'
    });
  }

  // ── 我把手放在胸口 ──
  await say('我把手机放在床头柜上，屏幕朝下。', 'nar');
  await say('然后我做了一件事，至今不知道为什么。', 'nar');
  await heartbeatScene();
  await say('那天剩下的时间我什么也没干。我在房间里待到天黑又到天亮。', 'nar');
  await say('早晨六点，对面的写字楼一栋一栋地开始亮灯。', 'nar');
  await say('中间助理敲过一次门，问晚餐怎么安排，我说不用了。', 'nar');

  // ── 事后结账 ──
  await blackCard(['后来助理跟我结账。'], 1800);
  await say('里面还有一项，是那座冷火山岛的酒店赔偿。', 'nar');
  if (!has('toldThem')) {
    await say('我们走了以后，胶带又贴了几天。没人告诉她们不用贴了。', 'nar');
    await say('酒店说贴得太久，次数太多，窗框上的胶痕清不掉，那面玻璃要整块换掉。', 'nar');
    await say('我说批了。', 'me');
    await say('那面玻璃朝着大洋。', 'quiet');
    if (!S.receipts.some(r => r.item.includes('玻璃更换'))) {
      pay({
        item: '窗框胶痕清不掉 · 整块玻璃更换', ton: 0.019, date: '事后结账',
        status: '已赔付', refundable: true,
        note: '贴得太久，次数太多。', arb: '那面玻璃朝着大洋。'
      });
    }
  } else {
    await say('那一项被划掉了。你走的时候说过一句：不用贴了。', 'dim');
  }

  await say('还有寄回来的一个箱子。八天的药，要冷藏的，一支没拆。', 'nar');
  pay({
    item: '八天的药（冷藏 · 一支没拆）', ton: 0.0006, date: '事后结账',
    status: '未使用', refundable: false,
    note: '一支没拆。', arb: '冷链商品一经出库，不予退换。'
  });
  await say('还有那笔预约的定金，不退。对方一月就准备好了。', 'nar');
  await say('档案里有她的照片。我没看过。', 'quiet');

  if (has('blurryPhoto')) {
    await say('她走后，我把那张 2007 年的图翻出来看了一次。', 'nar');
  }
  await say('有一天我用指甲刀剪指甲，剪完摸了一下，是尖的。', 'nar');
  await say('我想起来抽屉里还有那个东西，她留下的。', 'nar');

  // 抽屉里的那把工具
  const dr = await choose('', [
    { t: '拿出来磨两下。', sub: '' },
    { t: '不拿。', sub: '' }
  ]);
  await echoChoice(dr.t);
  if (dr.t.startsWith('拿出来')) {
    if (has('oneDirection')) {
      await say('我拿出来磨了两下。粗面磨形状，中面抛光，最后一面顺着一个方向。', 'nar');
      await say('磨完我摸了一下。不刮人了。', 'nar');
      mod({ dignity: 6 });
      flag('polishedSelf');
      toast('你记得是哪个方向。', 'gold');
    } else {
      await say('我拿出来磨了两下，不对。', 'nar');
      await say('她说过要顺着一个方向，我忘了是哪个方向。', 'nar');
      await say('我把它放回去了。', 'nar');
      await say('我的指甲现在还是磨人的。', 'quiet');
      mod({ echo: 3 });
    }
  } else {
    await say('我把抽屉关上了。我的指甲现在还是磨人的。', 'nar');
    mod({ echo: 2 });
  }

  await say('有一天早上手机弹出一个提醒，是助理去年排日程的时候设的：', 'nar');
  await say('「预产期前三个月，准备房间。」', 'sys');
  await say('我把它划掉了。', 'nar');

  await say('她走了以后，我一直在想一个问题。', 'nar');
  await say('如果那天我给了，她会留下来吗。', 'quiet');
  await say('我想了很久。', 'nar');
  await say('后来我把那份东西拿出来，又看了一遍。四十几页。', 'nar');

  await blackCard([
    '一百万人像潮水一样涌来，烟花结束，一百万人退去。',
    '一百万人。',
    '每年都是这样。',
    '什么都没有发生。'
  ], 4200);
}
