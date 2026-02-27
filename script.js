const TOTAL_WEEKS = 32;

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
  lin: 40,
  chen: 40,
  team: 40,
  score: 0,
  exam: "第8周 CSP-S",
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
  lin: document.getElementById("lin"),
  chen: document.getElementById("chen"),
  team: document.getElementById("team"),
  score: document.getElementById("score"),
  exam: document.getElementById("exam"),
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
  8: { name: "CSP-S", type: "contest_multi", problems: 4 },
  14: { name: "NOIP 提高组", type: "contest_multi", problems: 4 },
  20: { name: "学校期中", type: "school_multi", problems: 3 },
  24: { name: "省队集训测试", type: "contest_multi", problems: 5 },
  28: { name: "NOI 模拟赛", type: "contest_multi", problems: 6 },
  32: { name: "NOI", type: "contest_multi", problems: 6 },
};

const actions = [
  { label: "竞赛训练（弹出题单）", type: "training_modal" },
  { label: "社交活动（同学线）", type: "social_modal" },
  { label: "集训周（封闭）", type: "camp" },
  { label: "基础维护（文化课+轻刷题）", apply: () => ({ science: 8, dp: 2, ds: 2, energy: -8, stress: 2 }), text: "你稳住了文化课和基础题感。" },
  { label: "机房高强度训练", apply: () => ({ dp: 5, nt: 5, graph: 5, ds: 5, string: 5, score: 5, health: -14, energy: -20, stress: 10 }), text: "你全方向冲刺，代价是身体明显透支。" },
  { label: "休整+运动", apply: () => ({ health: 14, energy: 12, stress: -10, social: 4 }), text: "你恢复了身体和精力。" },
];

function clamp(v) { return Math.max(0, Math.min(100, v)); }
function hideModal() { dom.modal.classList.add("hidden"); }
function showModal({ title, text, progress = "", options = [] }) {
  dom.modal.classList.remove("hidden");
  dom.modalTitle.textContent = title;
  dom.modalText.textContent = text;
  dom.modalProgress.textContent = progress;
  dom.modalActions.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = opt.label;
    btn.addEventListener("click", opt.onClick);
    dom.modalActions.appendChild(btn);
  });
}
function pushLog(text, good = null) {
  const li = document.createElement("li");
  li.textContent = `第 ${state.week} 周：${text}`;
  if (good === true) li.classList.add("good");
  if (good === false) li.classList.add("bad");
  dom.log.prepend(li);
}
function applyDelta(delta) {
  Object.entries(delta).forEach(([k, v]) => {
    if (k in state) state[k] = clamp(state[k] + v);
  });
}
function nextExamText() {
  const w = Object.keys(exams).map(Number).find((x) => x >= state.week);
  return w ? `第${w}周 ${exams[w].name}` : "无";
}

function randomEventChoice() {
  if (Math.random() > 0.32) return Promise.resolve();
  const pool = [
    { title: "队友约你复盘", text: "晚饭后一起复盘上一场。", a: { l: "去复盘", d: { team: 7, social: 5, dp: 2, stress: -2 } }, b: { l: "自己刷题", d: { dp: 3, nt: 2, team: -4, stress: 2 } } },
    { title: "林骁发来数据结构题", text: "他问你要不要一起做。", a: { l: "一起做", d: { ds: 6, lin: 8, social: 4, energy: -5 } }, b: { l: "先放着", d: { energy: 4, lin: -3 } } },
    { title: "陈璇邀请你讲题", text: "班里同学想听字符串专题。", a: { l: "去讲题", d: { string: 5, chen: 8, social: 6, stress: -2 } }, b: { l: "拒绝", d: { string: 2, chen: -5, social: -2 } } },
    { title: "家里聚餐", text: "爸妈希望你今晚轻松一点。", a: { l: "参加", d: { family: 8, health: 4, stress: -4 } }, b: { l: "继续练", d: { dp: 3, family: -5, stress: 3 } } },
  ];
  const e = pool[Math.floor(Math.random() * pool.length)];
  return new Promise((resolve) => {
    showModal({
      title: `突发事件：${e.title}`,
      text: e.text,
      options: [
        { label: e.a.l, onClick: () => { applyDelta(e.a.d); pushLog(`事件选择：${e.a.l}`, true); hideModal(); resolve(); } },
        { label: e.b.l, onClick: () => { applyDelta(e.b.d); pushLog(`事件选择：${e.b.l}`, false); hideModal(); resolve(); } },
      ],
    });
  });
}

function trainingProblemSet() {
  const bank = [
    { name: "树形DP", gainText: "+2DP +1图论", gain: { dp: 2, graph: 1 }, costText: "-2健康 -3精力 +1压力", cost: { health: -2, energy: -3, stress: 1 } },
    { name: "状压DP", gainText: "+3DP", gain: { dp: 3 }, costText: "-3健康 -4精力 +2压力", cost: { health: -3, energy: -4, stress: 2 } },
    { name: "逆元与同余", gainText: "+2数论", gain: { nt: 2 }, costText: "-2健康 -3精力 +1压力", cost: { health: -2, energy: -3, stress: 1 } },
    { name: "筛法优化", gainText: "+3数论 +1数据结构", gain: { nt: 3, ds: 1 }, costText: "-4健康 -5精力 +2压力", cost: { health: -4, energy: -5, stress: 2 } },
    { name: "最短路变形", gainText: "+2图论 +1数据结构", gain: { graph: 2, ds: 1 }, costText: "-2健康 -3精力 +1压力", cost: { health: -2, energy: -3, stress: 1 } },
    { name: "网络流", gainText: "+3图论 +1DP", gain: { graph: 3, dp: 1 }, costText: "-5健康 -6精力 +3压力", cost: { health: -5, energy: -6, stress: 3 } },
    { name: "平衡树", gainText: "+3数据结构", gain: { ds: 3 }, costText: "-4健康 -5精力 +2压力", cost: { health: -4, energy: -5, stress: 2 } },
    { name: "线段树维护", gainText: "+2数据结构 +1DP", gain: { ds: 2, dp: 1 }, costText: "-3健康 -4精力 +2压力", cost: { health: -3, energy: -4, stress: 2 } },
    { name: "KMP/扩展KMP", gainText: "+3字符串", gain: { string: 3 }, costText: "-3健康 -4精力 +1压力", cost: { health: -3, energy: -4, stress: 1 } },
    { name: "后缀数组", gainText: "+3字符串 +1数据结构", gain: { string: 3, ds: 1 }, costText: "-5健康 -6精力 +3压力", cost: { health: -5, energy: -6, stress: 3 } },
  ];
  return bank.sort(() => Math.random() - 0.5).slice(0, 5);
}

function runTrainingModal() {
  return new Promise((resolve) => {
    let picks = 0;
    const maxPicks = 3;
    const set = trainingProblemSet();

    function draw() {
      showModal({
        title: "竞赛训练题单",
        text: "你点了竞赛训练。下面是本周题单（每题都有明确加点）。",
        progress: `已做 ${picks}/${maxPicks}`,
        options: [
          ...set.map((q) => ({
            label: `${q.name}｜${q.gainText}｜${q.costText}`,
            onClick: () => {
              applyDelta(q.gain);
              applyDelta(q.cost);
              state.score = clamp(state.score + 2);
              picks += 1;
              pushLog(`训练：${q.name}（${q.gainText}）`, true);
              if (picks >= maxPicks) {
                hideModal();
                resolve();
              } else draw();
            },
          })),
          {
            label: "今天到此为止（保健康）",
            onClick: () => {
              applyDelta({ health: 4, stress: -2 });
              pushLog("你适时收手，避免过载。", true);
              hideModal();
              resolve();
            },
          },
        ],
      });
    }
    draw();
  });
}

function runSocialModal() {
  return new Promise((resolve) => {
    showModal({
      title: "社交活动",
      text: "不是简单+社交，而是走不同人物线。",
      options: [
        { label: "找林骁讨论数论（+关系 +数论）", onClick: () => { applyDelta({ lin: 10, nt: 4, social: 5, energy: -4, stress: -1 }); pushLog("你和林骁深入讨论了数论。", true); hideModal(); resolve(); } },
        { label: "帮陈璇讲字符串（+关系 +字符串）", onClick: () => { applyDelta({ chen: 10, string: 4, social: 6, energy: -4, stress: -1 }); pushLog("你帮陈璇讲了字符串专题。", true); hideModal(); resolve(); } },
        { label: "和队友打模拟赛（+队伍 +多方向）", onClick: () => { applyDelta({ team: 10, dp: 2, ds: 2, graph: 2, social: 5, health: -2, energy: -6 }); pushLog("你和队友完成了一次高质量联训。", true); hideModal(); resolve(); } },
        { label: "参加班级活动（大幅减压）", onClick: () => { applyDelta({ social: 8, stress: -7, health: 5, science: 2 }); pushLog("你通过班级活动恢复了心态。", true); hideModal(); resolve(); } },
      ],
    });
  });
}

function runCamp() {
  return new Promise((resolve) => {
    showModal({
      title: "集训周",
      text: "选择主攻方向（收益高，消耗也高）。",
      options: [
        { label: "DP集训（+10DP +3数据结构，-10健康）", onClick: () => { applyDelta({ dp: 10, ds: 3, health: -10, energy: -12, stress: 7, score: 5 }); pushLog("完成DP集训。", true); hideModal(); resolve(); } },
        { label: "数论集训（+11数论 +2DP，-10健康）", onClick: () => { applyDelta({ nt: 11, dp: 2, health: -10, energy: -12, stress: 7, score: 5 }); pushLog("完成数论集训。", true); hideModal(); resolve(); } },
        { label: "图论+数据结构集训（+8图论 +8数据结构，-11健康）", onClick: () => { applyDelta({ graph: 8, ds: 8, health: -11, energy: -13, stress: 8, score: 6 }); pushLog("完成图论+数据结构集训。", true); hideModal(); resolve(); } },
        { label: "字符串专项集训（+10字符串 +4数据结构，-10健康）", onClick: () => { applyDelta({ string: 10, ds: 4, health: -10, energy: -12, stress: 7, score: 5 }); pushLog("完成字符串专项集训。", true); hideModal(); resolve(); } },
      ],
    });
  });
}

function contestPower() {
  return state.dp * 0.2 + state.nt * 0.2 + state.graph * 0.2 + state.ds * 0.2 + state.string * 0.2 + state.energy * 0.1 + state.team * 0.05 - state.stress * 0.25;
}

function runContestMulti(exam) {
  return new Promise((resolve) => {
    let idx = 1;
    let total = 0;
    function step() {
      if (idx > exam.problems) {
        hideModal();
        resolve(total);
        return;
      }
      const p = contestPower();
      showModal({
        title: `${exam.name} - 第${idx}题`,
        text: "每题都可拿部分分：稳拿部分分，或冲高分。",
        progress: `当前总分 ${total}/${exam.problems * 100}`,
        options: [
          { label: "稳拿部分分（30~70）", onClick: () => { total += Math.max(30, Math.min(70, Math.round(p * 0.5 + Math.random() * 25))); applyDelta({ energy: -4, stress: 1 }); idx += 1; step(); } },
          { label: "冲高分（0~100，波动）", onClick: () => { total += Math.max(0, Math.min(100, Math.round(p + (Math.random() - 0.35) * 45))); applyDelta({ energy: -7, health: -3, stress: 4 }); idx += 1; step(); } },
        ],
      });
    }
    step();
  });
}

function runSchoolMulti(exam) {
  return new Promise((resolve) => {
    let idx = 1;
    let total = 0;
    function step() {
      if (idx > exam.problems) {
        hideModal();
        resolve(total);
        return;
      }
      const p = state.science * 0.7 + state.energy * 0.15 + state.family * 0.1 - state.stress * 0.2;
      showModal({
        title: `${exam.name} - 第${idx}科`,
        text: "稳答或冲刺。",
        progress: `当前总分 ${total}/${exam.problems * 100}`,
        options: [
          { label: "稳答（40~75）", onClick: () => { total += Math.max(40, Math.min(75, Math.round(p * 0.75 + Math.random() * 10))); applyDelta({ energy: -3, stress: 1 }); idx += 1; step(); } },
          { label: "冲刺（10~100）", onClick: () => { total += Math.max(10, Math.min(100, Math.round(p + (Math.random() - 0.4) * 30))); applyDelta({ energy: -6, stress: 3 }); idx += 1; step(); } },
        ],
      });
    }
    step();
  });
}

async function runExamIfNeeded() {
  const exam = exams[state.week];
  if (!exam) return;

  if (exam.type === "contest_multi") {
    const score = await runContestMulti(exam);
    const avg = Math.round(score / exam.problems);
    if (avg >= 70) {
      applyDelta({ score: 14, dp: 2, nt: 2, graph: 2, ds: 2, string: 2, social: 2 });
      pushLog(`${exam.name}高分（均分${avg}），部分分策略执行很稳。`, true);
      dom.eventTitle.textContent = `🏅 ${exam.name}高分`;
      dom.eventText.textContent = "多题部分分策略非常有效。";
    } else if (avg >= 45) {
      applyDelta({ score: 7, dp: 1, nt: 1, graph: 1, ds: 1, string: 1 });
      pushLog(`${exam.name}中等（均分${avg}）。`, true);
      dom.eventTitle.textContent = `📈 ${exam.name}一般`;
      dom.eventText.textContent = "拿到部分分，但冲击力还差一点。";
    } else {
      applyDelta({ stress: 10, family: -5, score: -2 });
      pushLog(`${exam.name}失利（均分${avg}）。`, false);
      dom.eventTitle.textContent = `⚠️ ${exam.name}失利`;
      dom.eventText.textContent = "节奏和体能出了问题。";
    }
    return;
  }

  const score = await runSchoolMulti(exam);
  const avg = Math.round(score / exam.problems);
  if (avg >= 65) {
    applyDelta({ score: 6, science: 4, family: 4 });
    pushLog(`${exam.name}稳定（均分${avg}）。`, true);
  } else {
    applyDelta({ stress: 8, family: -4 });
    pushLog(`${exam.name}波动（均分${avg}）。`, false);
  }
}

async function handleAction(action) {
  if (action.type === "training_modal") return runTrainingModal();
  if (action.type === "social_modal") return runSocialModal();
  if (action.type === "camp") return runCamp();
  applyDelta(action.apply());
  pushLog(action.text, true);
}

function render() {
  state.exam = nextExamText();
  Object.keys(dom).forEach((k) => {
    if (k in state && dom[k]) dom[k].textContent = state[k];
  });
}

function checkEnding() {
  if (state.health <= 0 || state.energy <= 0 || state.stress >= 100) {
    state.over = true;
    dom.eventTitle.textContent = "⚠️ 状态崩盘";
    dom.eventText.textContent = "强度超负荷，需要停下来。";
    pushLog("健康/精力/压力失衡，提前结束。", false);
  }
  if (!state.over && state.week > TOTAL_WEEKS) {
    state.over = true;
    const final = state.score * 0.3 + (state.dp + state.nt + state.graph + state.ds + state.string) * 0.25 + (state.lin + state.chen + state.team) * 0.08 + state.health * 0.08 + state.science * 0.12 - state.stress * 0.2;
    if (final >= 88) {
      dom.eventTitle.textContent = "🎉 顶级结局：NOI冲线";
      dom.eventText.textContent = "你的方向训练和社交协作都达到了高水平。";
      pushLog("结局：NOI冲线成功。", true);
    } else if (final >= 62) {
      dom.eventTitle.textContent = "🙂 稳健结局";
      dom.eventText.textContent = "你形成了不错的训练体系。";
      pushLog("结局：稳步成长。", true);
    } else {
      dom.eventTitle.textContent = "🛠️ 反思结局";
      dom.eventText.textContent = "需要重建节奏，尤其是健康和社交协作。";
      pushLog("结局：需要复盘。", false);
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
  actions.forEach((action) => {
    const btn = document.createElement("button");
    btn.textContent = action.label;
    btn.addEventListener("click", () => nextWeek(action));
    dom.actionButtons.appendChild(btn);
  });
}

function restart() {
  Object.assign(state, initialState);
  dom.log.innerHTML = "";
  hideModal();
  dom.eventTitle.textContent = "新学期开始";
  dom.eventText.textContent = "点“竞赛训练（弹出题单）”会看到每题明确加点，比如 +2DP、+2数论。";
  render();
  renderActions();
}

dom.restart.addEventListener("click", restart);
restart();
