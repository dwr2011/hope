const state = {
  week: 1,
  energy: 100,
  algo: 20,
  science: 35,
  bio: 50,
  family: 60,
  stress: 15,
  medal: 0,
  over: false,
};

const dom = {
  week: document.getElementById("week"),
  energy: document.getElementById("energy"),
  algo: document.getElementById("algo"),
  science: document.getElementById("science"),
  bio: document.getElementById("bio"),
  family: document.getElementById("family"),
  stress: document.getElementById("stress"),
  medal: document.getElementById("medal"),
  eventTitle: document.getElementById("event-title"),
  eventText: document.getElementById("event-text"),
  actionButtons: document.getElementById("action-buttons"),
  log: document.getElementById("log"),
  restart: document.getElementById("restart"),
};

const actions = [
  {
    label: "刷算法题（高强度）",
    apply: () => ({ algo: 12, science: 3, energy: -20, stress: 9 }),
    text: "你连刷 6 小时题，代码能力飞涨，但脑袋快冒烟了。",
  },
  {
    label: "参加校队训练",
    apply: () => ({ algo: 9, family: 3, energy: -14, stress: 5 }),
    text: "你在机房和队友切磋，学到不少新技巧。",
  },
  {
    label: "和爸妈聊生物模型",
    apply: () => ({ bio: 8, science: 5, family: 8, stress: -4, algo: 2 }),
    text: "爸妈用生物统计启发你，原来建模思维能迁移到算法。",
  },
  {
    label: "晨跑+整理错题",
    apply: () => ({ energy: 16, stress: -8, algo: 4, science: 4 }),
    text: "状态恢复了！你把错题分类后，思路更清晰。",
  },
  {
    label: "熬夜冲榜",
    apply: () => ({ algo: 15, medal: 4, energy: -28, stress: 14, family: -6 }),
    text: "榜单上升很快，但你黑眼圈也更重了。",
  },
  {
    label: "模拟赛复盘",
    apply: () => ({ algo: 8, medal: 3, stress: 2, science: 5, energy: -12 }),
    text: "你复盘了比赛失误，拿分效率显著提升。",
  },
];

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function randomEvent() {
  const r = Math.random();
  if (r < 0.2) {
    state.family = clamp(state.family + 6);
    dom.eventTitle.textContent = "家庭 Buff";
    dom.eventText.textContent = "爸妈做了你爱吃的饭，还帮你分析了学习节奏。家庭支持上升！";
    pushLog("家庭氛围很好，你更有动力了。", true);
  } else if (r < 0.35) {
    state.stress = clamp(state.stress + 7);
    dom.eventTitle.textContent = "临时测验";
    dom.eventText.textContent = "学校临时加了小测，时间被挤压，压力上升。";
    pushLog("突发测验打乱了你的训练计划。", false);
  } else {
    dom.eventTitle.textContent = "平稳推进";
    dom.eventText.textContent = "这周没有突发事件，关键看你的选择。";
  }
}

function pushLog(text, good = null) {
  const li = document.createElement("li");
  li.textContent = `第 ${state.week} 周：${text}`;
  if (good === true) li.classList.add("good");
  if (good === false) li.classList.add("bad");
  dom.log.prepend(li);
}

function render() {
  Object.keys(state).forEach((k) => {
    if (dom[k]) dom[k].textContent = state[k];
  });
}

function checkEnding() {
  if (state.medal >= 30 && state.algo >= 80) {
    state.over = true;
    dom.eventTitle.textContent = "🎉 省选突破";
    dom.eventText.textContent = "你在信息竞赛中斩获奖牌！刘厚朴证明了理科生的坚持与热爱。";
    pushLog("你拿到了关键奖牌，成为学弟学妹的榜样！", true);
  } else if (state.energy <= 0 || state.stress >= 100) {
    state.over = true;
    dom.eventTitle.textContent = "⚠️ 状态崩盘";
    dom.eventText.textContent = "你透支太久，需要休整。真正的强者也要学会可持续训练。";
    pushLog("过度消耗导致状态下滑，本局结束。", false);
  } else if (state.week > 16) {
    state.over = true;
    dom.eventTitle.textContent = "学期结束";
    dom.eventText.textContent = "学期告一段落。继续优化训练策略，下次冲击更高名次！";
    pushLog("本学期结束，你积累了宝贵经验。", true);
  }

  if (state.over) {
    dom.actionButtons.innerHTML = "";
  }
}

function nextWeek(action) {
  if (state.over) return;

  const delta = action.apply();
  for (const [key, val] of Object.entries(delta)) {
    state[key] = clamp((state[key] ?? 0) + val);
  }
  pushLog(action.text, delta.algo > 0 || delta.medal > 0);

  state.week += 1;
  randomEvent();
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
  Object.assign(state, {
    week: 1,
    energy: 100,
    algo: 20,
    science: 35,
    bio: 50,
    family: 60,
    stress: 15,
    medal: 0,
    over: false,
  });
  dom.log.innerHTML = "";
  dom.eventTitle.textContent = "新学期开始";
  dom.eventText.textContent = "你叫刘厚朴，高一理科生。爸妈都在学校教生物，常常拿“遗传规律”启发你，但你更想在信息竞赛里发光。";
  render();
  renderActions();
}

dom.restart.addEventListener("click", restart);
render();
renderActions();
