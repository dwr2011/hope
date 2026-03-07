const TOTAL_WEEKS = 36;

const initialState = {
  week: 1,
  health: 100,
  energy: 100,
  stress: 15,
  dp: 15,
  nt: 12,
  graph: 14,
  ds: 13,
  string: 13,
  science: 35,
  social: 45,
  family: 60,
  socialCircle: 45,
  clubRep: 35,
  crush: 20,
  crushStage: "普通同学",
  team: 40,
  romanceEvents: 0,
  score: 0,
  exam: "第8周 CSP-S",
  route: "均衡",
  over: false,
};

const state = { ...initialState };

const dom = {
  week: document.getElementById("week"),
  health: document.getElementById("health"),
  energy: document.getElementById("energy"),
  stress: document.getElementById("stress"),
  dp: document.getElementById("dp"),
  nt: document.getElementById("nt"),
  graph: document.getElementById("graph"),
  ds: document.getElementById("ds"),
  string: document.getElementById("string"),
  science: document.getElementById("science"),
  social: document.getElementById("social"),
  family: document.getElementById("family"),
  socialCircle: document.getElementById("socialCircle"),
  clubRep: document.getElementById("clubRep"),
  crush: document.getElementById("crush"),
  crushStage: document.getElementById("crushStage"),
  team: document.getElementById("team"),
  score: document.getElementById("score"),
  exam: document.getElementById("exam"),
  route: document.getElementById("route"),
  eventTitle: document.getElementById("event-title"),
  eventText: document.getElementById("event-text"),
  actionButtons: document.getElementById("action-buttons"),
  log: document.getElementById("log"),
  restart: document.getElementById("restart"),
  modal: document.getElementById("modal"),
  modalTitle: document.getElementById("modal-title"),
  modalText: document.getElementById("modal-text"),
  modalProgress: document.getElementById("modal-progress"),
  modalActions: document.getElementById("modal-actions"),
};

const exams = {
  8: { name: "CSP-S", type: "contest", problems: 4 },
  14: { name: "NOIP 提高组", type: "contest", problems: 4 },
  20: { name: "期中联考", type: "school", problems: 5 },
  24: { name: "省队集训测试", type: "contest", problems: 5 },
  30: { name: "NOI 模拟赛", type: "contest", problems: 6 },
  36: { name: "NOI", type: "contest", problems: 6 },
};

const actions = [
  { label: "竞赛训练（弹出题单）", type: "training" },
  { label: "社交活动（关系线）", type: "social" },
  { label: "家庭活动（家庭线）", type: "family" },
  { label: "集训周（封闭）", type: "camp" },
  { label: "文化课深耕", apply: () => ({ science: 10, energy: -10, stress: 4 }), text: "你完成了多科专项训练。" },
  { label: "高强度刷题", apply: () => ({ dp: 4, nt: 4, graph: 4, ds: 4, string: 4, health: -12, energy: -18, stress: 9, score: 4, route: "竞赛冲刺" }), text: "你全方向冲刺但代价很大。" },
  { label: "休整恢复", apply: () => ({ health: 14, energy: 12, stress: -10, social: 4, route: "健康优先" }), text: "你把状态拉了回来。" },
  { label: "校园活动策划", apply: () => ({ social: 8, socialCircle: 6, clubRep: 5, science: 3, stress: -2, route: "社交经营" }), text: "你在活动里积累了人脉和组织力。" },
  { label: "自习室双线计划", apply: () => ({ dp: 2, science: 5, crush: 4, stress: -1, route: "双线平衡" }), text: "你稳住了竞赛与学业两条线。" },
];

const trainingBank = [
  ["树形DP", { dp: 2, graph: 1 }, { health: -2, energy: -3, stress: 1 }],
  ["状压DP", { dp: 3 }, { health: -3, energy: -4, stress: 2 }],
  ["逆元与同余", { nt: 2 }, { health: -2, energy: -3, stress: 1 }],
  ["筛法与积性函数", { nt: 3, ds: 1 }, { health: -4, energy: -5, stress: 2 }],
  ["最短路变形", { graph: 2, ds: 1 }, { health: -2, energy: -3, stress: 1 }],
  ["网络流", { graph: 3, dp: 1 }, { health: -5, energy: -6, stress: 3 }],
  ["平衡树", { ds: 3 }, { health: -4, energy: -5, stress: 2 }],
  ["线段树", { ds: 2, dp: 1 }, { health: -3, energy: -4, stress: 2 }],
  ["KMP", { string: 3 }, { health: -3, energy: -4, stress: 1 }],
  ["后缀数组", { string: 3, ds: 1 }, { health: -5, energy: -6, stress: 3 }],
];

function clamp(v) { return Math.max(0, Math.min(100, v)); }
function applyDelta(d) { Object.entries(d).forEach(([k, v]) => { if (k in state) state[k] = typeof state[k] === "number" ? clamp(state[k] + v) : v; }); }
function pushLog(t, good = null) { const li = document.createElement("li"); li.textContent = `第 ${state.week} 周：${t}`; if (good === true) li.classList.add("good"); if (good === false) li.classList.add("bad"); dom.log.prepend(li); }
function hideModal() { dom.modal.classList.add("hidden"); }
function showModal({ title, text, progress = "", options = [] }) {
  dom.modal.classList.remove("hidden");
  dom.modalTitle.textContent = title;
  dom.modalText.textContent = text;
  dom.modalProgress.textContent = progress;
  dom.modalActions.innerHTML = "";
  options.forEach((o) => { const b = document.createElement("button"); b.textContent = o.label; b.addEventListener("click", o.onClick); dom.modalActions.appendChild(b); });
}

function nextExamText() { const w = Object.keys(exams).map(Number).find((n) => n >= state.week); return w ? `第${w}周 ${exams[w].name}` : "无"; }
function updateCrushStage() {
  if (state.romanceEvents >= 4 && state.crush >= 82) state.crushStage = "稳定交往";
  else if (state.romanceEvents >= 3 && state.crush >= 68) state.crushStage = "双向暧昧";
  else if (state.romanceEvents >= 2 && state.crush >= 50) state.crushStage = "关系升温";
  else if (state.romanceEvents >= 1 && state.crush >= 35) state.crushStage = "熟络同频";
  else state.crushStage = "普通同学";
}

function randomEventChoice() {
  if (Math.random() > 0.32) return Promise.resolve();
  const pool = [
    {
      t: "感情事件：图书馆借书偶遇",
      x: "对方把你常看的算法书递了过来，想不想顺势聊几句？",
      a: ["顺势聊天", { crush: 7, social: 3, stress: -2, romanceEvents: 1 }],
      b: ["点头离开", { crush: -2, dp: 2 }],
    },
    {
      t: "感情事件：深夜消息",
      x: "对方问你比赛前会不会紧张。",
      a: ["认真回复并互相鼓励", { crush: 8, social: 2, stress: -3, romanceEvents: 1 }],
      b: ["已读不回", { crush: -5, stress: 2 }],
    },
    {
      t: "社交事件：班级协作",
      x: "班里在组织学科经验分享，是否主动承担？",
      a: ["主动承担", { social: 8, socialCircle: 7, clubRep: 4, energy: -3 }],
      b: ["低调旁听", { social: 2, stress: -1 }],
    },
    {
      t: "社交事件：社团策划冲突",
      x: "活动安排临时撞期，你要不要站出来协调？",
      a: ["主动协调", { clubRep: 8, socialCircle: 4, stress: 2, science: 2 }],
      b: ["回避冲突", { clubRep: -4, social: -3, stress: -1 }],
    },
    {
      t: "家庭事件：父母谈心",
      x: "家里想了解你的真实压力。",
      a: ["坦诚交流", { family: 8, stress: -6, health: 3 }],
      b: ["敷衍过去", { family: -6, stress: 3 }],
    },
    {
      t: "团队事件：临时集体训练",
      x: "是否加入团队夜训？",
      a: ["加入", { team: 8, graph: 2, ds: 2, energy: -5 }],
      b: ["单练", { dp: 3, team: -4, stress: 2 }],
    },
  ];

  if (state.crush >= 60 && state.romanceEvents >= 2 && state.week >= 10) {
    pool.push({
      t: "感情事件：表白窗口",
      x: "几次互动后气氛正好，你决定？",
      a: ["认真表白", { stress: 5 }],
      b: ["再相处一段", { crush: 3, stress: -1, romanceEvents: 1 }],
      special: "confession",
    });
  }

  const e = pool[Math.floor(Math.random() * pool.length)];
  return new Promise((res) => {
    showModal({
      title: `特殊事件：${e.t}`,
      text: e.x,
      options: [
        {
          label: e.a[0],
          onClick: () => {
            applyDelta(e.a[1]);
            if (e.special === "confession") {
              const okRate = Math.max(0.3, Math.min(0.92, 0.34 + state.crush / 170 + state.social / 320 + state.socialCircle / 360 - state.stress / 520));
              if (Math.random() < okRate) {
                applyDelta({ crush: 16, social: 5, stress: -8, romanceEvents: 1 });
                state.crushStage = "告白成功";
                pushLog("你勇敢表达并获得回应，关系进入新阶段。", true);
              } else {
                applyDelta({ crush: -8, stress: 8 });
                pushLog("告白没有成功，但你学会了更成熟地面对关系。", false);
              }
            } else {
              pushLog(`事件选择：${e.a[0]}`, true);
            }
            hideModal();
            res();
          },
        },
        { label: e.b[0], onClick: () => { applyDelta(e.b[1]); pushLog(`事件选择：${e.b[0]}`, false); hideModal(); res(); } },
      ],
    });
  });
}

function fmtDelta(d) {
  const m = { dp: "DP", nt: "数论", graph: "图论", ds: "数据结构", string: "字符串", health: "健康", energy: "精力", stress: "压力" };
  return Object.entries(d).map(([k, v]) => `${v > 0 ? `+${v}` : v}${m[k] || k}`).join(" ");
}

function runTrainingModal() {
  return new Promise((resolve) => {
    const set = [...trainingBank].sort(() => Math.random() - 0.5).slice(0, 7);
    let done = 0;
    const draw = () => showModal({
      title: "竞赛训练题单",
      text: "每题有明确加点，可形成不同训练走线。",
      progress: `已做 ${done}/3`,
      options: [
        ...set.map(([name, g, c]) => ({ label: `${name}\n  ${fmtDelta(g)}｜${fmtDelta(c)}`, onClick: () => { applyDelta(g); applyDelta(c); applyDelta({ score: 2 }); done += 1; pushLog(`训练：${name}`, true); if (done >= 3) { hideModal(); resolve(); } else draw(); } })),
        { label: "提前收工", onClick: () => { applyDelta({ health: 4, stress: -2 }); hideModal(); resolve(); } },
      ],
    });
    draw();
  });
}

function runSocialModal() {
  return new Promise((resolve) => showModal({
    title: "社交活动（关系重写）",
    text: "以真实社交场景与感情事件推进，不再使用固定人物槽位。",
    options: [
      { label: "班级讨论会（+社交圈 +文化课）", onClick: () => { applyDelta({ social: 8, socialCircle: 9, science: 3, energy: -3 }); pushLog("你在讨论会里结识了更多靠谱同学。", true); hideModal(); resolve(); } },
      { label: "社团项目协作（+社团影响力 +团队）", onClick: () => { applyDelta({ clubRep: 10, team: 5, social: 4, stress: 2 }); pushLog("你推动了社团项目，影响力提升。", true); hideModal(); resolve(); } },
      { label: "操场夜谈（感情事件）", onClick: () => { applyDelta({ crush: 8, romanceEvents: 1, stress: -3, social: 3 }); pushLog("一次真诚夜谈让关系更近一步。", true); hideModal(); resolve(); } },
      { label: "活动主持尝试（+社交 +抗压）", onClick: () => { applyDelta({ social: 7, socialCircle: 4, stress: 1, science: 2 }); pushLog("你在公开场合表达更自信了。", true); hideModal(); resolve(); } },
      { label: "安静旁听（小幅社交 +恢复）", onClick: () => { applyDelta({ social: 3, stress: -2, energy: 2 }); pushLog("你保持参与但不过度消耗。", true); hideModal(); resolve(); } },
    ],
  }));
}

function runFamilyModal() {
  return new Promise((resolve) => showModal({
    title: "家庭活动（家庭线）",
    text: "不同家庭活动会影响支持度、健康与学业状态。",
    options: [
      { label: "和家里做周计划（+家庭 +文化课）", onClick: () => { applyDelta({ family: 10, science: 4, stress: -3 }); pushLog("你和家里定下了可执行周计划。", true); hideModal(); resolve(); } },
      { label: "陪父母备课（+家庭 +生物思维）", onClick: () => { applyDelta({ family: 8, science: 3, dp: 1, health: 2 }); pushLog("备课交流让你学习节奏更稳。", true); hideModal(); resolve(); } },
      { label: "家庭日休息（+健康 +精力）", onClick: () => { applyDelta({ health: 8, energy: 7, stress: -5, dp: -1 }); pushLog("你通过家庭日恢复了状态。", true); hideModal(); resolve(); } },
      { label: "坚持外出训练（+竞赛 -家庭）", onClick: () => { applyDelta({ dp: 3, nt: 3, family: -6, stress: 2 }); pushLog("你保持了强度，但家庭支持下降。", false); hideModal(); resolve(); } },
    ],
  }));
}

function runCamp() {
  return new Promise((resolve) => showModal({
    title: "集训周",
    text: "不同集训对应不同走线。",
    options: [
      { label: "算法综合集训（竞赛线）", onClick: () => { applyDelta({ dp: 6, graph: 6, ds: 6, health: -10, energy: -12, stress: 7, score: 6, route: "竞赛冲刺" }); hideModal(); resolve(); } },
      { label: "数论+字符串集训（专项线）", onClick: () => { applyDelta({ nt: 8, string: 8, health: -10, energy: -12, stress: 7, score: 6, route: "专项突破" }); hideModal(); resolve(); } },
      { label: "平衡集训（学业+竞赛）", onClick: () => { applyDelta({ dp: 4, nt: 4, science: 5, stress: 3, score: 4, route: "双线平衡" }); hideModal(); resolve(); } },
    ],
  }));
}

function knowledgeMap() { return { dp: state.dp, nt: state.nt, graph: state.graph, ds: state.ds, string: state.string }; }

function buildContestTiers() {
  const pool = [10, 20, 25, 30, 40, 50, 60, 70, 75, 85, 100];
  const tierCount = 3 + Math.floor(Math.random() * 2);
  const picks = [...pool].sort(() => Math.random() - 0.5).slice(0, tierCount - 1);
  const scores = [...new Set([...picks, 100])].sort((a, b) => a - b);

  return scores.map((score, i) => {
    const level = i + 1;
    const thinkBase = Math.max(2, Math.round(score / 18));
    const codeBase = Math.max(2, Math.round(score / 17));
    const thinkNeed = Math.max(level + 1, Math.min(14, thinkBase + Math.floor(Math.random() * 4) - 1));
    const codeNeed = Math.max(level + 1, Math.min(14, codeBase + Math.floor(Math.random() * 4) - 1));
    return { score, thinkNeed, codeNeed };
  });
}

function runContestMulti(exam) {
  return new Promise((resolve) => {
    let idx = 1;
    let total = 0;
    const topics = ["dp", "nt", "graph", "ds", "string"];
    let examTimeLeft = exam.problems * 18;

    const finishExam = () => {
      hideModal();
      resolve(total);
    };

    const stepProblem = () => {
      if (idx > exam.problems || examTimeLeft <= 0) {
        if (examTimeLeft <= 0) pushLog(`${exam.name}时间耗尽，考试提前结束。`, false);
        finishExam();
        return;
      }

      const topic = topics[Math.floor(Math.random() * topics.length)];
      const k = knowledgeMap()[topic];
      const topicName = { dp: "DP", nt: "数论", graph: "图论", ds: "数据结构", string: "字符串" }[topic];
      const tiers = buildContestTiers();

      const chooseTier = () => showModal({
        title: `${exam.name} 第${idx}题（${topicName}）`,
        text: "先选目标部分分档位，再通过“思考/写代码”完成对应次数。",
        progress: `当前总分 ${total}/${exam.problems * 100}｜全卷时间点剩余 ${examTimeLeft}`,
        options: [
          ...tiers.map((t) => ({
            label: `${t.score}/100 档`,
            onClick: () => runTier(t),
          })),
          {
            label: "跳过本题",
            onClick: () => {
              pushLog(`第${idx}题选择跳过。`, false);
              idx += 1;
              stepProblem();
            },
          },
        ],
      });

      const runTier = (tier) => {
        let thinkNow = 0;
        let codeNow = 0;

        const weak = k < 35;
        const shouldHideThinkNeed = weak && tier.score >= 75;

        const settleProblem = (timeUp = false) => {
          const thinkOk = thinkNow >= tier.thinkNeed;
          const codeOk = codeNow >= tier.codeNeed;

          if (thinkOk && codeOk) {
            total += tier.score;
            pushLog(`第${idx}题完成，拿到 ${tier.score}/100。`, true);
            idx += 1;
            stepProblem();
            return;
          }

          if (timeUp) {
            const partial = Math.max(0, Math.round(tier.score * (thinkNow + codeNow) / (tier.thinkNeed + tier.codeNeed) * 0.82));
            total += partial;
            pushLog(`第${idx}题时间结束，仅拿到 ${partial}/100。`, false);
            idx += 1;
            stepProblem();
            return;
          }

          pushLog(`第${idx}题提交过早，准备不足。`, false);
          applyDelta({ stress: 2 });
          drawTier();
        };

        const drawTier = () => {
          const thinkNeedText = shouldHideThinkNeed && thinkNow < 2 ? "?" : `${tier.thinkNeed}`;
          const table = `部分分    思考     写代码
${tier.score}/100   ${thinkNow}/${thinkNeedText}   ${codeNow}/${tier.codeNeed}`;
          const thinkRate = Math.max(0.12, Math.min(0.96, 0.24 + k * 0.006 + state.team * 0.0012 - state.stress * 0.0021 - (tier.score >= 100 ? 0.15 : tier.score >= 75 ? 0.08 : 0)));
          const codeRate = Math.max(0.10, Math.min(0.95, 0.22 + k * 0.0062 + state.team * 0.0014 - state.stress * 0.0022 - (tier.score >= 100 ? 0.17 : tier.score >= 75 ? 0.1 : 0)));

          if (examTimeLeft <= 0) {
            settleProblem(true);
            return;
          }

          showModal({
            title: `${exam.name} 第${idx}题｜目标 ${tier.score}/100`,
            text: `按你说的模式（全卷共享时间点）：
${table}`,
            progress: `全卷时间点剩余：${examTimeLeft}（思考/写代码每次都 -1）｜知识点=${k}｜思考成功率≈${Math.round(thinkRate * 100)}%｜写代码成功率≈${Math.round(codeRate * 100)}%`,
            options: [
              {
                label: "思考（时间-1，成功才+1）",
                onClick: () => {
                  examTimeLeft -= 1;
                  if (Math.random() < thinkRate) {
                    thinkNow += 1;
                    pushLog(`第${idx}题思考成功（${thinkNow}/${tier.thinkNeed}）。`, true);
                  } else {
                    pushLog(`第${idx}题思考未突破。`, false);
                  }
                  applyDelta({ stress: 1, energy: -1 });
                  if (thinkNow >= tier.thinkNeed && codeNow >= tier.codeNeed) {
                    settleProblem(true);
                    return;
                  }
                  drawTier();
                },
              },
              {
                label: "写代码（时间-1，成功才+1）",
                onClick: () => {
                  examTimeLeft -= 1;
                  if (Math.random() < codeRate) {
                    codeNow += 1;
                    pushLog(`第${idx}题代码推进成功（${codeNow}/${tier.codeNeed}）。`, true);
                  } else {
                    pushLog(`第${idx}题代码尝试失败。`, false);
                  }
                  applyDelta({ energy: -2, stress: 1, health: -1 });
                  if (thinkNow >= tier.thinkNeed && codeNow >= tier.codeNeed) {
                    settleProblem(true);
                    return;
                  }
                  drawTier();
                },
              },
              {
                label: "跳过本题",
                onClick: () => {
                  pushLog(`第${idx}题选择跳过。`, false);
                  idx += 1;
                  stepProblem();
                },
              },
              {
                label: "提交本题",
                onClick: () => settleProblem(false),
              },
            ],
          });
        };

        drawTier();
      };

      chooseTier();
    };

    stepProblem();
  });
}

function runSchoolMulti(exam) {
  return new Promise((resolve) => {
    let i = 1, total = 0;
    const subs = ["数学", "物理", "化学", "生物", "语文", "英语"];
    const step = () => {
      if (i > exam.problems) { hideModal(); resolve(total); return; }
      const s = subs[Math.floor(Math.random() * subs.length)];
      const p = state.science * 0.75 + state.energy * 0.12 + state.family * 0.08 + state.crush * 0.03 + state.socialCircle * 0.02 - state.stress * 0.2;
      showModal({
        title: `${exam.name} - ${s}`,
        text: "文化课也有稳答/提分/冲刺三档。",
        progress: `当前总分 ${total}/${exam.problems * 100}`,
        options: [
          { label: "稳答档（40~70）", onClick: () => { total += Math.max(40, Math.min(70, Math.round(p * 0.65 + Math.random() * 15))); applyDelta({ energy: -3, stress: 1 }); i += 1; step(); } },
          { label: "提分档（55~88）", onClick: () => { total += Math.max(55, Math.min(88, Math.round(p * 0.82 + Math.random() * 14))); applyDelta({ energy: -5, stress: 2 }); i += 1; step(); } },
          { label: "冲刺档（20~100）", onClick: () => { total += Math.max(20, Math.min(100, Math.round(p + (Math.random() - 0.35) * 28))); applyDelta({ energy: -7, stress: 4 }); i += 1; step(); } },
        ],
      });
    };
    step();
  });
}

async function runExamIfNeeded() {
  const exam = exams[state.week];
  if (!exam) return;
  if (exam.type === "contest") {
    const score = await runContestMulti(exam);
    const avg = Math.round(score / exam.problems);
    if (avg >= 70) { applyDelta({ score: 14, dp: 2, nt: 2, graph: 2, ds: 2, string: 2, social: 2 }); pushLog(`${exam.name}高分（均分${avg}）。`, true); dom.eventTitle.textContent = `🏅 ${exam.name}高分`; dom.eventText.textContent = "你根据档位策略稳定拿分。"; }
    else if (avg >= 45) { applyDelta({ score: 7, dp: 1, nt: 1, graph: 1, ds: 1, string: 1 }); pushLog(`${exam.name}中等（均分${avg}）。`, true); dom.eventTitle.textContent = `📈 ${exam.name}一般`; dom.eventText.textContent = "部分分到手，但冲刺不够。"; }
    else { applyDelta({ stress: 10, family: -4, score: -2 }); pushLog(`${exam.name}失利（均分${avg}）。`, false); dom.eventTitle.textContent = `⚠️ ${exam.name}失利`; dom.eventText.textContent = "需要提高薄弱点并优化尝试策略。"; }
    return;
  }
  const sc = await runSchoolMulti(exam);
  const avg = Math.round(sc / exam.problems);
  if (avg >= 65) { applyDelta({ score: 6, science: 4, family: 4 }); pushLog(`${exam.name}稳定（均分${avg}）。`, true); }
  else { applyDelta({ stress: 8, family: -4 }); pushLog(`${exam.name}波动（均分${avg}）。`, false); }
}

async function handleAction(a) {
  if (a.type === "training") return runTrainingModal();
  if (a.type === "social") return runSocialModal();
  if (a.type === "family") return runFamilyModal();
  if (a.type === "camp") return runCamp();
  applyDelta(a.apply());
  pushLog(a.text, true);
}

function render() {
  updateCrushStage();
  state.exam = nextExamText();
  Object.keys(dom).forEach((k) => { if (k in state && dom[k]) dom[k].textContent = state[k]; });
}

function checkEnding() {
  if (state.health <= 0 || state.energy <= 0 || state.stress >= 100) {
    state.over = true;
    dom.eventTitle.textContent = "⚠️ 状态崩盘";
    dom.eventText.textContent = "强度失衡导致崩盘。";
    pushLog("健康/精力/压力失衡，提前结束。", false);
  }

  if (!state.over && state.week > TOTAL_WEEKS) {
    state.over = true;
    const contest = (state.dp + state.nt + state.graph + state.ds + state.string) / 5;
    const relation = (state.social + state.socialCircle + state.clubRep + state.team + state.crush) / 5;
    const final = state.score * 0.3 + contest * 0.24 + relation * 0.14 + state.science * 0.12 + state.family * 0.1 + state.health * 0.1 - state.stress * 0.2;

    if (final >= 90 && state.route === "竞赛冲刺") {
      dom.eventTitle.textContent = "🏆 竞赛王者线";
      dom.eventText.textContent = "你在高强度路线中完成了竞赛突破。";
      pushLog("结局：竞赛王者线。", true);
    } else if (final >= 85 && state.route === "双线平衡") {
      dom.eventTitle.textContent = "🎓 双线学霸线";
      dom.eventText.textContent = "你在竞赛与学业两线都保持了高水平。";
      pushLog("结局：双线学霸线。", true);
    } else if (final >= 80 && state.crushStage === "热恋") {
      dom.eventTitle.textContent = "💖 青春圆满线";
      dom.eventText.textContent = "感情、社交与成长节奏形成了良性循环。";
      pushLog("结局：青春圆满线。", true);
    } else if (final >= 75 && state.family >= 75) {
      dom.eventTitle.textContent = "🏠 家庭共振线";
      dom.eventText.textContent = "你和家庭形成了稳定支持系统，持续进步。";
      pushLog("结局：家庭共振线。", true);
    } else if (final >= 62) {
      dom.eventTitle.textContent = "🙂 稳健成长线";
      dom.eventText.textContent = "你找到了适合自己的长期节奏。";
      pushLog("结局：稳健成长线。", true);
    } else {
      dom.eventTitle.textContent = "🛠️ 反思重开线";
      dom.eventText.textContent = "这一季起伏较大，下一次你会更好。";
      pushLog("结局：需要复盘重开。", false);
    }
  }

  if (state.over) dom.actionButtons.innerHTML = "";
}

async function nextWeek(action) {
  if (state.over || !dom.modal.classList.contains("hidden")) return;
  await handleAction(action);
  await randomEventChoice();
  state.week += 1;
  await runExamIfNeeded();
  render();
  checkEnding();
}

function renderActions() {
  dom.actionButtons.innerHTML = "";
  actions.forEach((a) => {
    const b = document.createElement("button");
    b.textContent = a.label;
    b.addEventListener("click", () => nextWeek(a));
    dom.actionButtons.appendChild(b);
  });
}

function restart() {
  Object.assign(state, initialState);
  dom.log.innerHTML = "";
  hideModal();
  dom.eventTitle.textContent = "新学期开始";
  dom.eventText.textContent = "多活动、多事件、多走线：你要决定刘厚朴这一季的人生节奏。";
  render();
  renderActions();
}

dom.restart.addEventListener("click", restart);
restart();
