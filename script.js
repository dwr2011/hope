const TOTAL_WEEKS = 32;

const initialState = {
  week: 1,
  health: 100,
  energy: 100,
  stress: 15,
  dp: 15,
  nt: 12,
  graph: 14,
  science: 35,
  social: 45,
  family: 60,
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
  science: document.getElementById("science"),
  social: document.getElementById("social"),
  family: document.getElementById("family"),
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
  { label: "方向训练（弹题）", type: "training_modal" },
  { label: "基础维护（文化课+轻刷题）", apply: () => ({ science: 8, dp: 3, energy: -8, stress: 2 }), text: "你稳住了基础。" },
  { label: "社交（和队友交流/散步）", apply: () => ({ social: 10, stress: -7, energy: 6, health: 4 }), text: "你通过社交放松并获得信息。" },
  { label: "机房高强度训练", apply: () => ({ dp: 7, nt: 7, graph: 7, score: 4, health: -12, energy: -20, stress: 10 }), text: "高强度训练带来明显进步，但透支较大。" },
  { label: "集训周（封闭）", type: "camp" },
  { label: "休整+运动", apply: () => ({ health: 14, energy: 12, stress: -10, social: 4 }), text: "你恢复了身体和状态。" },
  { label: "请教学长（数论专题）", apply: () => ({ nt: 10, social: 4, energy: -7, stress: 1 }), text: "数论理解明显提升。" },
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
  const week = Object.keys(exams).map(Number).find((w) => w >= state.week);
  return week ? `第${week}周 ${exams[week].name}` : "无";
}

function randomEventChoice() {
  // 降低频率：30%触发，但增加事件池
  if (Math.random() > 0.3) return Promise.resolve();
  const pool = [
    {
      title: "同学喊你去打羽毛球",
      text: "要不要去？",
      a: { label: "去（社交+恢复）", d: { social: 8, health: 6, stress: -5, dp: -1 } },
      b: { label: "不去（继续刷题）", d: { dp: 3, stress: 3, social: -4 } },
    },
    {
      title: "班主任提醒你文化课",
      text: "你要临时做一套题还是坚持训练？",
      a: { label: "补文化课", d: { science: 7, stress: 4, energy: -5 } },
      b: { label: "坚持竞赛", d: { dp: 3, nt: 3, science: -2, stress: 2 } },
    },
    {
      title: "队友分享图论板子",
      text: "今晚花时间研究吗？",
      a: { label: "研究", d: { graph: 8, energy: -6, stress: 2 } },
      b: { label: "先休息", d: { health: 6, stress: -4, graph: -1 } },
    },
    {
      title: "家里安排聚餐",
      text: "去聚餐还是在家训练？",
      a: { label: "去聚餐", d: { family: 8, social: 5, stress: -4 } },
      b: { label: "留家训练", d: { dp: 4, family: -5, stress: 3 } },
    },
    {
      title: "轻微感冒",
      text: "你要硬扛还是休息？",
      a: { label: "硬扛", d: { dp: 4, nt: 2, health: -10, stress: 5 } },
      b: { label: "休息", d: { health: 8, energy: 6, dp: -2, stress: -3 } },
    },
  ];
  const e = pool[Math.floor(Math.random() * pool.length)];
  return new Promise((resolve) => {
    showModal({
      title: `突发事件：${e.title}`,
      text: e.text,
      options: [
        { label: e.a.label, onClick: () => { applyDelta(e.a.d); pushLog(`事件选择：${e.a.label}`, true); hideModal(); resolve(); } },
        { label: e.b.label, onClick: () => { applyDelta(e.b.d); pushLog(`事件选择：${e.b.label}`, false); hideModal(); resolve(); } },
      ],
    });
  });
}

function trainingProblemSet() {
  const bank = [
    { name: "DP-树形背包", gain: { dp: 7, graph: 2 }, cost: { health: -4, energy: -5, stress: 3 } },
    { name: "DP-状压", gain: { dp: 8 }, cost: { health: -5, energy: -6, stress: 4 } },
    { name: "数论-同余与逆元", gain: { nt: 8 }, cost: { health: -4, energy: -5, stress: 3 } },
    { name: "数论-筛法+莫比乌斯", gain: { nt: 10 }, cost: { health: -7, energy: -8, stress: 6 } },
    { name: "图论-最短路变形", gain: { graph: 7, dp: 1 }, cost: { health: -4, energy: -5, stress: 3 } },
    { name: "图论-网络流", gain: { graph: 10 }, cost: { health: -8, energy: -9, stress: 6 } },
  ];
  return bank.sort(() => Math.random() - 0.5).slice(0, 4);
}

function runTrainingModal() {
  return new Promise((resolve) => {
    let picks = 0;
    const maxPicks = 3;
    const set = trainingProblemSet();

    function renderPick() {
      showModal({
        title: "方向训练：本周题单",
        text: "可选 3 题。难度/收益越高，健康扣得越多。",
        progress: `已选 ${picks}/${maxPicks}`,
        options: [
          ...set.map((q) => ({
            label: `${q.name}（+方向，-健康）`,
            onClick: () => {
              applyDelta(q.gain);
              applyDelta(q.cost);
              const gainSum = (q.gain.dp || 0) + (q.gain.nt || 0) + (q.gain.graph || 0);
              state.score = clamp(state.score + Math.round(gainSum / 4));
              picks += 1;
              pushLog(`完成训练题：${q.name}`, true);
              if (picks >= maxPicks) {
                hideModal();
                resolve();
              } else {
                renderPick();
              }
            },
          })),
          {
            label: "提前收工（保健康）",
            onClick: () => {
              applyDelta({ health: 3, stress: -2 });
              pushLog("你提前收工，保留了体力。", true);
              hideModal();
              resolve();
            },
          },
        ],
      });
    }

    renderPick();
  });
}

function runCamp() {
  return new Promise((resolve) => {
    showModal({
      title: "集训周",
      text: "你进入封闭集训：可以选择主攻方向。",
      options: [
        { label: "DP集训", onClick: () => { applyDelta({ dp: 14, nt: 4, graph: 4, health: -10, energy: -14, stress: 8, score: 5 }); pushLog("完成DP集训。", true); hideModal(); resolve(); } },
        { label: "数论集训", onClick: () => { applyDelta({ nt: 16, dp: 3, graph: 2, health: -11, energy: -14, stress: 8, score: 5 }); pushLog("完成数论集训。", true); hideModal(); resolve(); } },
        { label: "图论集训", onClick: () => { applyDelta({ graph: 16, dp: 3, nt: 2, health: -11, energy: -14, stress: 8, score: 5 }); pushLog("完成图论集训。", true); hideModal(); resolve(); } },
        { label: "均衡集训", onClick: () => { applyDelta({ dp: 8, nt: 8, graph: 8, health: -12, energy: -16, stress: 9, score: 6 }); pushLog("完成均衡集训。", true); hideModal(); resolve(); } },
      ],
    });
  });
}

function runContestMulti(exam) {
  return new Promise((resolve) => {
    let idx = 1;
    let totalScore = 0;

    function solveOne() {
      if (idx > exam.problems) {
        hideModal();
        resolve(totalScore);
        return;
      }
      const strength = state.dp * 0.35 + state.nt * 0.3 + state.graph * 0.35 + state.energy * 0.12 + state.social * 0.08 - state.stress * 0.25;
      showModal({
        title: `${exam.name} - 第${idx}题`,
        text: "每题可拿部分分：稳拿部分分或冲满分。",
        progress: `当前总分：${totalScore} / ${exam.problems * 100}`,
        options: [
          {
            label: "稳拿部分分（20~70）",
            onClick: () => {
              const part = Math.max(20, Math.min(70, Math.round(strength * 0.6 + Math.random() * 25)));
              totalScore += part;
              applyDelta({ energy: -4, stress: 1 });
              idx += 1;
              solveOne();
            },
          },
          {
            label: "冲满分（波动大）",
            onClick: () => {
              const full = Math.round(strength + (Math.random() - 0.35) * 45);
              const gained = Math.max(0, Math.min(100, full));
              totalScore += gained;
              applyDelta({ energy: -7, health: -3, stress: 4 });
              idx += 1;
              solveOne();
            },
          },
        ],
      });
    }

    solveOne();
  });
}

function runSchoolMulti(exam) {
  return new Promise((resolve) => {
    let i = 1;
    let total = 0;
    function step() {
      if (i > exam.problems) {
        hideModal();
        resolve(total);
        return;
      }
      const p = state.science * 0.7 + state.energy * 0.15 + state.family * 0.1 - state.stress * 0.25;
      showModal({
        title: `${exam.name} - 第${i}科`,
        text: "先审题拿稳分，或冲高分。",
        progress: `当前总分：${total}/${exam.problems * 100}`,
        options: [
          { label: "稳答", onClick: () => { total += Math.max(30, Math.min(75, Math.round(p * 0.8 + Math.random() * 15))); applyDelta({ energy: -3, stress: 1 }); i += 1; step(); } },
          { label: "冲刺", onClick: () => { total += Math.max(10, Math.min(100, Math.round(p + (Math.random() - 0.4) * 30))); applyDelta({ energy: -6, stress: 3 }); i += 1; step(); } },
        ],
      });
    }
    step();
  });
}

async function runExamIfNeeded() {
  const exam = exams[state.week];
  if (!exam) return;

  let score = 0;
  if (exam.type === "contest_multi") {
    score = await runContestMulti(exam);
    const normalized = Math.round(score / exam.problems);
    if (normalized >= 70) {
      applyDelta({ score: 14, dp: 3, nt: 3, graph: 3, social: 2 });
      pushLog(`${exam.name}发挥优秀（均分${normalized}）。`, true);
      dom.eventTitle.textContent = `🏅 ${exam.name}高分`;
      dom.eventText.textContent = "你通过多题部分分策略打出了高分。";
    } else if (normalized >= 45) {
      applyDelta({ score: 7, dp: 1, nt: 1, graph: 1 });
      pushLog(`${exam.name}中等发挥（均分${normalized}）。`, true);
      dom.eventTitle.textContent = `📈 ${exam.name}一般`;
      dom.eventText.textContent = "你拿到了不少部分分，但还有提升空间。";
    } else {
      applyDelta({ stress: 10, family: -5, score: -2 });
      pushLog(`${exam.name}失利（均分${normalized}）。`, false);
      dom.eventTitle.textContent = `⚠️ ${exam.name}失利`;
      dom.eventText.textContent = "本次比赛节奏混乱，需要复盘。";
    }
    return;
  }

  score = await runSchoolMulti(exam);
  const avg = Math.round(score / exam.problems);
  if (avg >= 65) {
    applyDelta({ score: 6, science: 4, family: 4 });
    pushLog(`${exam.name}文化课稳定（均分${avg}）。`, true);
  } else {
    applyDelta({ stress: 8, family: -4 });
    pushLog(`${exam.name}文化课波动（均分${avg}）。`, false);
  }
}

async function handleAction(action) {
  if (action.type === "training_modal") {
    await runTrainingModal();
    return;
  }
  if (action.type === "camp") {
    await runCamp();
    return;
  }
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
    dom.eventText.textContent = "训练强度超出承受，必须停下来恢复。";
    pushLog("由于健康/精力/压力失衡，本局结束。", false);
  }

  if (!state.over && state.week > TOTAL_WEEKS) {
    state.over = true;
    const final = state.score * 0.35 + (state.dp + state.nt + state.graph) * 0.25 + state.science * 0.15 + state.social * 0.1 + state.health * 0.1 - state.stress * 0.2;
    if (final >= 85) {
      dom.eventTitle.textContent = "🎉 顶级结局：NOI冲线成功";
      dom.eventText.textContent = "你在方向训练、部分分策略、社交支持和健康管理上都做到极致。";
      pushLog("结局：冲线成功。", true);
    } else if (final >= 60) {
      dom.eventTitle.textContent = "🙂 稳健结局";
      dom.eventText.textContent = "你打下了扎实基础，下一年仍有大幅提升空间。";
      pushLog("结局：稳步成长。", true);
    } else {
      dom.eventTitle.textContent = "🛠️ 反思结局";
      dom.eventText.textContent = "你需要重新平衡训练强度与健康、社交。";
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
  dom.eventText.textContent = "尝试通过方向训练+部分分策略，冲击CSP-S/NOIP/NOI。";
  render();
  renderActions();
}

dom.restart.addEventListener("click", restart);
restart();
