// ============================================================
// act1.js — 序·重量 / 一·2007 / 二·第一次见面
// 全篇不出现任何姓名。她只有「她」，后来有「妈妈」。
// ============================================================
import { S, mod, flag, pay, has, chapter, rot } from '../state.js';
import { say, silence, weight, chapterCard, choose, echoChoice, annotate, sleep, toast, clearStream } from '../ui.js';
import { deviceMontage, blurryPhoto, blackCard } from '../fx.js';
import { sfx } from '../audio.js';
import { mgApply } from '../minigames/apply.js';
import { mgCinema } from '../minigames/cinema.js';
import { mgPolish } from '../minigames/polish.js';

// ─────────── 序 · 重量 ───────────
export async function act0() {
  chapter(0);
  await chapterCard(0);
  await weight('一颗种子的重量', '3.5 微克');
  await weight('五千万美元现金的重量', '2.5 吨');
  await say('她在崖顶酒店的电话里向我要的是后者，抵押的是前者。', 'nar');
  await say('她去那里，是为了预约一个 2027 年的春天。快一点的话还能属马。这是她主动提的。', 'dim');
  await say('到了地方，她说没有五千万，不做。', 'nar');
  await blackCard([
    '那一层包下来，三十天，一百万美元，为了她的隐私。',
    '她住了八天就走了。'
  ], 3200);
  await say('剩下的二十二天，酒店的清洁工每天照常上去。', 'nar');
  await say('是我的助理讲的。她去交钥匙的时候撞见过一次：一个女人推着车，一间一间进，换毛巾，擦台面，把被角掖好，退出来把门带上。做完一整层，两个小时。', 'nar');
  await say('助理问她，没人住，为什么还要做。', 'nar');
  await say('「登记上写着有人。」', 'her');
  await silence(1800, '（我突然意识到，她喜欢这个。）');
  await say('她喜欢一个地方因为她而空着。什么都不发生。', 'quiet');
  await say('与那一层一起空置的，还有一架停在机场的飞机，机组每天照常报到。', 'dim');
  await say('第八天她打了那个电话。', 'nar');
  await say('之后没有人再见过她。', 'nar');
  await blackCard(['现在，把时间拨回去十九年。'], 2200);
}

// ─────────── 一 · 2007 ───────────
export async function act1() {
  chapter(1);
  clearStream();
  await chapterCard(1);
  sfx.boot();
  await say('2007 年，已经有人替她烧钱了。那年我刚进大学。', 'nar');
  await say('当然，烧钱的不是我。', 'dim');
  await say('聊天软件弹出一个窗口，代言人是她。就在那台老机器上，分辨率糊得很。', 'nar');
  await say('我把图片存下来了。', 'nar');

  await say('我在一年房租一千块的宿舍上网，在一个已经倒闭了的社交网站上找到她，发了好友申请。', 'nar');
  await say('那个网站要填一句留言。', 'sys');

  const r = await mgApply();

  await say('后来这些年，我做每一件事的时候都在想一个问题：到了什么程度，她会通过。', 'nar');
  await say('第一个十亿的时候我想过，一百亿的时候我想过。', 'dim');
  await say('后来我不想了。那个网站早就倒闭了。', 'nar');

  await weight('2011 年，冷。我买了一件羽绒服', '一百五十块');
  await say('我记得这个价格，因为我犹豫了三天。', 'dim');
  await say('同一年她拍了一部一亿五千万的电影。一整排很有名的人像十九年后的崖顶酒店与那架飞机一样，被请来做了陪衬。', 'nar');
  await say('他们不知道自己为什么出现在这里。来都来了，总得发生些什么。', 'nar');
  await say('但是什么都没有发生。', 'quiet');
  await say('再后来是一亿五千万美元的那部。再后来是更长的名单。', 'dim');
  await say('我那时已经在国外了，读书，创业，越来越忙。', 'nar');

  await deviceMontage();

  await say('十九年后，名单上加了我。', 'num');
  await sleep(400);

  const c = await choose('（一个多余的动作。）', [
    { t: '再申请一次好友', sub: '十九年过去了' },
    { t: '不申请了', sub: '那个网站早就倒闭了' }
  ]);
  await echoChoice(c.t);
  if (c.t.startsWith('再申请')) {
    await say('页面打不开了。域名过期，跳到一个卖数据线的站。', 'sys');
    mod({ echo: 2 });
  } else {
    await say('我没有再申请第二次。', 'nar');
    mod({ dignity: 2 });
  }
}

// ─────────── 二 · 第一次见面 ───────────
export async function act2() {
  chapter(2);
  clearStream();
  await chapterCard(2);

  await say('酒店大堂我们见了第一面。我一直以为见到她那天我会紧张。', 'nar');
  await say('我没有。', 'nar');
  await say('她比照片上瘦，穿得很随意，靠在沙发上。', 'nar');
  await say('我看着她，忽然想不起来我等的到底是什么。', 'quiet');

  // ── 节点 1：它烂了怎么办 ──
  await say('我带她去看那件东西。一面白墙，一根用胶带贴住的香蕉。', 'nar');
  await weight('概念艺术品 · 一根香蕉', '620 万美元');
  await say('她看了很久，问我，这个多少钱。', 'her');
  await say('六百二十万美元。', 'me');
  await say('「那它烂了怎么办。」', 'her');

  const n1 = await choose('（她在等一个答案。）', [
    { t: '沉默。', sub: '不说话。' },
    { t: '「烂了就再买一根。」', sub: '' },
    { t: '「所以它才值这个价。」', sub: '' }
  ]);
  await echoChoice(n1.t);
  if (n1.t === '沉默。') {
    await silence(2400, '（我沉默了。）');
    mod({ heart: 8 });
    flag('siLent1');
  } else if (n1.t.includes('再买一根')) {
    await say('她轻笑了一下。', 'dim');
    mod({ heart: -5 }, { raw: true }); mod({ vacancy: 5 });
    flag('quoteHabit');
    toast('获得习惯【报价】', 'gray');
  } else {
    await say('她把头转过来看了我一眼，然后又转回去。', 'dim');
    mod({ heart: 12 }); mod({ dignity: -5 });
    flag('culturalInvest');
    toast('成就：文化投资', 'gold');
  }
  // 香蕉开始计时
  S.startAt = Date.now();
  flag('clockStarted');
  toast('保鲜度开始计时 · 15:00', 'gold');
  pay({
    item: '概念艺术品 · 一根香蕉（贴在墙上）', ton: 0.62, date: '第一次见面当天',
    status: '将会腐烂', refundable: true,
    note: '她看了很久，问它烂了怎么办。',
    arb: '商品自然腐败不属于质量问题。'
  });

  await say('她说，不管了，我们去看电影吧。', 'her');
  await say('我说好。', 'me');
  await say('「放映厅里除了我们两个，不能有任何人。」', 'her');

  // ── 节点 2：包场 ──
  const n2 = await choose('', [
    { t: '「好。」', sub: '我出去打了个电话。' },
    { t: '「包个下午场就行，人本来就少。」', sub: '' },
    { t: '「我把整栋楼包了，隔壁厅也空着。」', sub: '' }
  ]);
  await echoChoice(n2.t);

  if (n2.t === '「好。」') {
    await say('我出去打了个电话。回来的时候她还站在那根香蕉前面。', 'nar');
    await say('那部电影是一部动画片。两个人的放映厅，这种场景一般用于审片。', 'dim');
    await say('我让助理把电影院所有的座位都买下来。', 'nar');
    await say('把座位全买下来不难。麻烦的是已经卖出去的票。', 'sys');
    await mgCinema();
  } else if (n2.t.includes('下午场')) {
    await say('她把口罩戴回去了，说算了。', 'nar');
    mod({ heart: -12 }, { raw: true }); mod({ echo: -4 });
    flag('cinemaGaveUp');
  } else {
    await say('整栋楼。隔壁厅也空着，什么都不放。', 'nar');
    mod({ heart: 18 }); mod({ vacancy: 35 }); mod({ dignity: -8 });
    flag('versailles');
    pay({
      item: '整栋影院包场（含隔壁空厅）', ton: 0.09, date: '第一次见面当天下午',
      status: '已履约', refundable: true,
      note: '隔壁厅什么都不放。', arb: '空场部分无法核定损失，按票面退还。'
    });
    await mgCinema();
  }

  await say('看完她把头像换成了那部动画片里的角色。', 'dim');

  // ── 抛指甲 ──
  await say('晚上我伸手过去，被她拿开了。', 'nar');
  await say('我以为她不愿意。我把手收回来，准备说点什么。', 'nar');
  await say('她没说话。她坐起来，从包里翻出一个小袋子，拉开，里面一排东西，像一套很小的工具。', 'nar');
  await say('「你的指甲扎得我痛。」', 'her');
  await say('我看了一眼。我一直是拿指甲刀随便剪两下，边上是尖的，平时不觉得。', 'nar');
  await say('「过来。」', 'her');

  await mgPolish();

  // ── 节点 3：要是以后我不在了 ──
  if (!has('polishFailed')) {
    await say('中间她说过一句话。', 'nar');
    await say('「要是以后我不在了，就再没有人给你抛指甲了。」', 'her');
    const n3 = await choose('', [
      { t: '笑一下，不说话。', sub: '' },
      { t: '「那你别走。」', sub: '' },
      { t: '「那我学。」', sub: '把那三面记下来。' }
    ]);
    await echoChoice(n3.t);
    if (n3.t.startsWith('笑一下')) {
      await silence(1600, '（我笑了一下，没说话。）');
      mod({ echo: 5 });
      flag('iSmiled');
    } else if (n3.t.includes('别走')) {
      await say('她说，那你得听话。', 'her');
      mod({ heart: 15 }); mod({ dignity: -20 });
      flag('dontGo');
    } else {
      await say('她把三面又教了我一遍。这一面磨形状，这一面抛光，最后一面不要来回蹭，要顺着一个方向。', 'her');
      await say('我说好。', 'me');
      mod({ heart: 5 });
      flag('iLearned'); flag('oneDirection');
      toast('记住了：顺着一个方向', 'gold');
    }
  }

  // ── 节点 5：那四十几页 ──
  await say('认识她三个月的时候，我让人做了一份东西。', 'nar');
  await say('她那些年的项目、合作方、公司股权、两个长辈的名字、几个关联账户，租的房，买的房，还有一些别的。', 'dim');
  await weight('一周就做完了', '四十几页');
  await say('里面有一些事她后来跟我讲过，讲的和上面写的不太一样。', 'nar');

  const n5 = await choose('', [
    { t: '不看，当场销毁。', sub: '什么都不知道，也挺好。' },
    { t: '看。但以后一个字都不提。', sub: '我全部相信她说的。' },
    { t: '看，并且当场问她。', sub: '' }
  ]);
  await echoChoice(n5.t);
  if (n5.t.startsWith('不看')) {
    await say('碎纸机响了四十秒。', 'sys');
    mod({ dignity: 10 });
    flag('burnedFile');
  } else if (n5.t.includes('一个字都不提')) {
    await say('有一些事她一直没讲。我也没有问。', 'nar');
    const p = await say('我全部相信她说的。', 'me');
    annotate(p, '但是我一个字也不信。');
    flag('fileKept');
    toast('获得被动【那四十几页】', 'rose');
    pay({
      item: '背景尽调 · 四十几页', ton: 0.0004, date: '认识第三个月',
      status: '已交付', refundable: false,
      note: '我全部相信她说的。但是我一个字也不信。',
      arb: '信息类服务已消费，不予退还。'
    });
  } else {
    await say('她看着我，很久。然后她说，那你查啊，你不是都查完了吗。', 'her');
    mod({ heart: -40 }, { raw: true });
    flag('confronted');
  }

  if (has('blurryPhoto')) await blurryPhoto();
  await say('那份东西我留着，一直留到现在。', 'nar');
  rot(1);
}
