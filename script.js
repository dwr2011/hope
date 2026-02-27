const TOTAL_WEEKS = 24;

const initialState = {
  week: 1,
  energy: 100,
  algo: 20,
  science: 35,
  bio: 50,
  family: 60,
  stress: 15,
  score: 0,
  goal: "基础期",
  exam: "第6周 月考",
  over: false,
};

const state = { ...initialState };

const dom = {
  week: document.getElementById("week"),
  energy: document.getElementById("energy"),
  algo: document.getElementById("algo"),
  science: document.getElementById("science"),
  bio: document.getElementById("bio"),
  family: document.getElementById("family"),
  stress: document.getElementById("stress"),
  score: document.getElementById("score"),
  goal: document.getElementById("goal"),
  exam: document.getElementById("exam"),
  eventTitle: document.getElementById("event-title"),
  eventText: document.getElementById("event-text"),
  actionButtons: document.getElementById("action-buttons"),
  log: document.getElementById("log"),
  restart: document.getElementById("restart"),
};

const exams = {
  6: { name: "月考", type: "school" },
  10: { name: "校内选拔赛", type: "contest" },
  14: { name: "期中考", type: "school" },
  18: { name: "省队模拟赛", type: "contest" },
  24: { name: "期末联考", type: "final" },
};

const actions = [
  { label: "刷算法题（高强度）", apply: () => ({ algo: 12, science: 3, energy: -20, stress: 10, score: 2 }), text: "你连刷 6 小时题，算法有明显提升。" },
  { label: "参加校队训练", apply: () => ({ algo: 9, family: 2, energy: -14, stress: 5, score: 4 }), text: "你在校队里学会了更规范的比赛节奏。" },
  { label: "模拟赛复盘", apply: () => ({ algo: 8, science: 6, energy: -12, stress: 3, score: 5 }), text: "你复盘了卡题点，比赛得分效率提升。" },
  { label: "和爸妈聊生物模型", apply: () => ({ bio: 8, science: 6, family: 9, stress: -5, algo: 2 }), text: "爸妈把统计和遗传图谱讲得很透，你的建模直觉更强了。" },
  { label: "晨跑+整理错题", apply: () => ({ energy: 18, stress: -9, algo: 4, science: 4 }), text: "你调整了状态，后续学习更稳。" },
  { label: "做理综套卷", apply: () => ({ science: 10, bio: 6, energy: -12, stress: 4 }), text: "理综手感回来了，考试底盘更扎实。" },
  { label: "请教学长（图论/DP）", apply: () => ({ algo: 10, score: 3, family: 1, energy: -10, stress: 2 }), text: "学长点拨后，你的图论和 DP 思路更清楚。" },
  { label: "彻底摆烂一周", apply: () => ({ energy: 12, stress: -6, algo: -5, science: -4, score: -2 }), text: "你休息到了，但训练节奏掉了不少。" },
  { label: "熬夜冲榜", apply: () => ({ algo: 14, score: 6, energy: -30, stress: 16, family: -8 }), text: "排名涨得快，但状态和家庭关系都吃紧了。" },
  { label: "家庭日（陪爸妈备课）", apply: () => ({ family: 14, bio: 7, stress: -8, energy: 6 }), text: "你陪爸妈准备课堂实验，亲子关系明显变好。" },
];

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function pushLog(text, good = null) {
  const li = document.createElement("li");
  li.textContent = `第 ${state.week} 周：${text}`;
  if (good === true) li.classList.add("good");
  if (good === false) li.classList.add("bad");
  dom.log.prepend(li);
}

function currentGoal() {
  if (state.week <= 8) return "基础期：稳住数理，算法>=35";
  if (state.week <= 16) return "提升期：冲刺训练，算法>=60";
  return "冲刺期：争取奖牌 + 期末稳定";
}

function nextExamText() {
  const futureWeek = Object.keys(exams)
    .map((n) => Number(n))
    .find((w) => w >= state.week);
  if (!futureWeek) return "无（学期收官）";
  return `第${futureWeek}周 ${exams[futureWeek].name}`;
}

function randomEvent() {
  const r = Math.random();
  if (r < 0.16) {
    state.family = clamp(state.family + 7);
    dom.eventTitle.textContent = "家庭 Buff";
    dom.eventText.textContent = "爸妈给你做了复习计划，还加了营养餐。";
    pushLog("家庭支持增强：恢复速度提升。", true);
  } else if (r < 0.3) {
    state.stress = clamp(state.stress + 8);
    dom.eventTitle.textContent = "学校事务挤占时间";
    dom.eventText.textContent = "班级活动和测验突然变多，压力上升。";
    pushLog("计划被打断，压力增加。", false);
  } else if (r < 0.42) {
    state.energy = clamp(state.energy - 10);
    dom.eventTitle.textContent = "轻微感冒";
    dom.eventText.textContent = "你有点不舒服，训练效率下降。";
    pushLog("身体状态波动，注意休息。", false);
  } else {
    dom.eventTitle.textContent = "平稳推进";
    dom.eventText.textContent = "这周没有重大意外，关键看你的行动选择。";
  }
}

function applyAction(action) {
  const delta = action.apply();
  for (const [key, val] of Object.entries(delta)) {
    if (!(key in state)) continue;
    state[key] = clamp((state[key] ?? 0) + val);
  }
  pushLog(action.text, (delta.algo ?? 0) + (delta.score ?? 0) > 0);
}

function runExamIfNeeded() {
  const exam = exams[state.week];
  if (!exam) return;

  if (exam.type === "school") {
    const schoolPower = state.science * 0.55 + state.bio * 0.2 + state.energy * 0.15 + state.family * 0.1 - state.stress * 0.25;
    if (schoolPower >= 45) {
      state.score = clamp(state.score + 4);
      state.family = clamp(state.family + 5);
      pushLog(`${exam.name}发挥稳定，家里更支持你搞竞赛。`, true);
      dom.eventTitle.textContent = `✅ ${exam.name}顺利`;
      dom.eventText.textContent = "你兼顾了理科学习，爸妈和老师都更放心。";
    } else {
      state.family = clamp(state.family - 8);
      state.stress = clamp(state.stress + 10);
      pushLog(`${exam.name}失常，老师提醒你平衡竞赛与文化课。`, false);
      dom.eventTitle.textContent = `⚠️ ${exam.name}失利`;
      dom.eventText.textContent = "成绩波动引发质疑，你必须调整策略。";
    }
    return;
  }

  const contestPower = state.algo * 0.7 + state.science * 0.15 + state.energy * 0.1 + state.family * 0.05 - state.stress * 0.3;
  if (contestPower >= 55) {
    state.score = clamp(state.score + 12);
    pushLog(`${exam.name}打出高分，排名冲上去！`, true);
    dom.eventTitle.textContent = `🏅 ${exam.name}高分`;
    dom.eventText.textContent = "你的训练开始转化成真实比赛成绩。";
  } else if (contestPower >= 42) {
    state.score = clamp(state.score + 5);
    pushLog(`${exam.name}中规中矩，仍有进步空间。`, true);
    dom.eventTitle.textContent = `📈 ${exam.name}一般`;
    dom.eventText.textContent = "基本盘还行，但还不足以稳拿奖。";
  } else {
    state.stress = clamp(state.stress + 12);
    pushLog(`${exam.name}崩了，几个关键题没写出来。`, false);
    dom.eventTitle.textContent = `❌ ${exam.name}失误`;
    dom.eventText.textContent = "你意识到状态管理和基础能力同样重要。";
  }
}

function render() {
  state.goal = currentGoal();
  state.exam = nextExamText();
  Object.keys(dom).forEach((key) => {
    if (key in state && dom[key]) dom[key].textContent = state[key];
  });
}

function checkEnding() {
  if (state.energy <= 0 || state.stress >= 100) {
    state.over = true;
    dom.eventTitle.textContent = "⚠️ 状态崩盘";
    dom.eventText.textContent = "你透支太久，必须休整。高强度训练也要可持续。";
    pushLog("由于极端状态，本局提前结束。", false);
  }

  if (!state.over && state.week > TOTAL_WEEKS) {
    state.over = true;
    const finalPower = state.algo * 0.45 + state.score * 0.35 + state.science * 0.2 - state.stress * 0.2;
    if (finalPower >= 70 && state.family >= 45) {
      dom.eventTitle.textContent = "🎉 双线成功结局";
      dom.eventText.textContent = "你拿到竞赛奖项，同时期末稳住，成为老师和同学公认的时间管理高手！";
      pushLog("结局：竞赛与学业双赢。", true);
    } else if (finalPower >= 56) {
      dom.eventTitle.textContent = "🙂 稳健成长结局";
      dom.eventText.textContent = "你离顶尖选手还有距离，但已经形成自己的训练体系。";
      pushLog("结局：稳步成长，来年可期。", true);
    } else {
      dom.eventTitle.textContent = "🛠️ 反思重开结局";
      dom.eventText.textContent = "这学期起伏较大，下一次你需要更明确的节奏与目标。";
      pushLog("结局：策略失衡，需要复盘。", false);
    }
  }

  if (state.over) dom.actionButtons.innerHTML = "";
}

function nextWeek(action) {
  if (state.over) return;
  applyAction(action);
  randomEvent();
  state.week += 1;
  runExamIfNeeded();
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
  dom.eventTitle.textContent = "新学期开始";
  dom.eventText.textContent = "你叫刘厚朴，高一理科生。你要在 24 周内平衡竞赛训练和学校考试。";
  render();
  renderActions();
}

dom.restart.addEventListener("click", restart);
restart();
