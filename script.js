const TOTAL_WEEKS = 28;

const initialState = {
  week: 1,
  energy: 100,
  algo: 20,
  science: 35,
  bio: 50,
  friends: 50,
  family: 60,
  stress: 15,
  score: 0,
  goal: "基础期",
  exam: "第6周 信息测试",
  over: false,
};

const state = { ...initialState };

const dom = {
  week: document.getElementById("week"),
  energy: document.getElementById("energy"),
  algo: document.getElementById("algo"),
  science: document.getElementById("science"),
  bio: document.getElementById("bio"),
  friends: document.getElementById("friends"),
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
  modal: document.getElementById("modal"),
  modalTitle: document.getElementById("modal-title"),
  modalText: document.getElementById("modal-text"),
  modalProgress: document.getElementById("modal-progress"),
  modalActions: document.getElementById("modal-actions"),
};

const exams = {
  6: { name: "信息测试", type: "contest_sim" },
  10: { name: "月考", type: "school_sim" },
  14: { name: "校内选拔赛", type: "contest" },
  18: { name: "期中", type: "school" },
  22: { name: "省队模拟", type: "contest_sim" },
  28: { name: "期末联考", type: "school_sim" },
};

const actions = [
  { label: "刷算法题", apply: () => ({ algo: 10, science: 2, energy: -16, stress: 8, score: 2 }), text: "你推进了几类经典题。" },
  { label: "模拟赛复盘", apply: () => ({ algo: 8, science: 4, energy: -10, stress: 3, score: 4 }), text: "你把失误点逐项改正。" },
  { label: "校队对拍训练", apply: () => ({ algo: 9, friends: 6, energy: -14, stress: 4, score: 3 }), text: "和同学对拍，发现了边界 bug。" },
  { label: "请教同学林骁", apply: () => ({ algo: 6, friends: 8, stress: -3, energy: -6 }), text: "林骁分享了很实用的思路。" },
  { label: "和班长陈璇讨论理综", apply: () => ({ science: 9, bio: 4, friends: 6, energy: -9, stress: 2 }), text: "你理综解题速度提升了。" },
  { label: "陪爸妈备生物课", apply: () => ({ family: 12, bio: 8, stress: -7, energy: 5 }), text: "家庭关系变好，心态更稳。" },
  { label: "晨跑+午休", apply: () => ({ energy: 18, stress: -9, science: 3, algo: 2 }), text: "你恢复了状态。" },
  { label: "机房加练到深夜", apply: () => ({ algo: 13, score: 5, energy: -28, stress: 15, family: -6 }), text: "进步明显，但代价不小。" },
  { label: "参加社团活动", apply: () => ({ friends: 10, stress: -4, energy: -5, algo: -2 }), text: "你放松了，也稍微掉了训练节奏。" },
  { label: "文化课冲刺晚自习", apply: () => ({ science: 10, bio: 5, energy: -14, stress: 6 }), text: "文化课稳住了。" },
  { label: "OI讲题分享", apply: () => ({ algo: 7, friends: 7, family: 3, stress: -2, score: 2 }), text: "你讲清了题解，表达能力也提升。" },
  { label: "彻底摆烂", apply: () => ({ energy: 10, stress: -5, algo: -6, science: -5, score: -3 }), text: "休息到了，但进度掉了。" },
];

function clamp(v) { return Math.max(0, Math.min(100, v)); }
function pushLog(text, good = null) {
  const li = document.createElement("li");
  li.textContent = `第 ${state.week} 周：${text}`;
  if (good === true) li.classList.add("good");
  if (good === false) li.classList.add("bad");
  dom.log.prepend(li);
}
function currentGoal() {
  if (state.week <= 10) return "基础期：算法>=40，文化课别掉队";
  if (state.week <= 20) return "提升期：信息测试稳定拿分";
  return "冲刺期：竞赛与期末双线冲刺";
}
function nextExamText() {
  const w = Object.keys(exams).map(Number).find((n) => n >= state.week);
  return w ? `第${w}周 ${exams[w].name}` : "无";
}

function showModal({ title, text, progress = "", options = [] }) {
  dom.modal.classList.remove("hidden");
  dom.modalTitle.textContent = title;
  dom.modalText.textContent = text;
  dom.modalProgress.textContent = progress;
  dom.modalActions.innerHTML = "";
  options.forEach((opt) => {
    const b = document.createElement("button");
    b.textContent = opt.label;
    b.addEventListener("click", () => opt.onClick());
    dom.modalActions.appendChild(b);
  });
}
function hideModal() { dom.modal.classList.add("hidden"); }

function applyDelta(delta) {
  Object.entries(delta).forEach(([k, v]) => {
    if (k in state) state[k] = clamp(state[k] + v);
  });
}

function randomChoiceEvent() {
  const r = Math.random();
  if (r > 0.45) return Promise.resolve();
  return new Promise((resolve) => {
    const events = [
      {
        title: "同学来约你打球",
        text: "同桌王鸣问你要不要放松一下。",
        a: { label: "去打球", delta: { energy: 10, stress: -7, friends: 8, algo: -2 } },
        b: { label: "婉拒继续训练", delta: { algo: 5, stress: 3, friends: -4 } },
      },
      {
        title: "老师临时加测",
        text: "晚自习前突击小测，时间被压缩。",
        a: { label: "临时抱佛脚", delta: { science: 6, stress: 6, energy: -6 } },
        b: { label: "按原计划竞赛", delta: { algo: 5, science: -2, stress: 2 } },
      },
      {
        title: "爸妈希望你早点休息",
        text: "他们担心你熬夜影响状态。",
        a: { label: "听劝早睡", delta: { energy: 12, stress: -6, family: 5 } },
        b: { label: "继续冲题", delta: { algo: 7, stress: 7, family: -5 } },
      },
    ];
    const e = events[Math.floor(Math.random() * events.length)];
    showModal({
      title: `偶然事件：${e.title}`,
      text: e.text,
      options: [
        { label: e.a.label, onClick: () => { applyDelta(e.a.delta); pushLog(`选择：${e.a.label}`, true); hideModal(); resolve(); } },
        { label: e.b.label, onClick: () => { applyDelta(e.b.delta); pushLog(`选择：${e.b.label}`, false); hideModal(); resolve(); } },
      ],
    });
  });
}

function runTimelineChallenge(kind, examName) {
  return new Promise((resolve) => {
    const total = 24;
    let t = 1;
    let think = 0;
    let write = 0;
    let read = 0;
    let answer = 0;

    function step() {
      const progress = kind === "contest"
        ? `时间点 ${t}/${total}｜想题 ${think}/8｜写代码 ${write}/6`
        : `时间点 ${t}/${total}｜审题 ${read}/8｜答题 ${answer}/6`;

      const doneContest = think >= 8 && write >= 6;
      const doneSchool = read >= 8 && answer >= 6;
      if (doneContest || doneSchool || t > total) {
        const success = doneContest || doneSchool;
        hideModal();
        resolve(success);
        return;
      }

      if (kind === "contest") {
        showModal({
          title: `${examName}：信息测试进行中`,
          text: "每个时间点做出选择。先想题达到阈值，再写代码完成提交。",
          progress,
          options: [
            {
              label: "想题",
              onClick: () => {
                t += 1;
                const gain = Math.random() < (0.45 + state.algo / 220 + state.friends / 400) ? 1 : 0;
                think += gain;
                state.stress = clamp(state.stress + 1);
                step();
              },
            },
            {
              label: "写代码",
              onClick: () => {
                t += 1;
                const unlocked = think >= 8;
                if (unlocked) {
                  const gain = Math.random() < (0.4 + state.algo / 180 + state.energy / 350 - state.stress / 500) ? 1 : 0;
                  write += gain;
                } else {
                  state.stress = clamp(state.stress + 2);
                }
                state.energy = clamp(state.energy - 2);
                step();
              },
            },
            {
              label: "问同学思路",
              onClick: () => {
                t += 1;
                if (state.friends >= 45) {
                  think += 1;
                  state.friends = clamp(state.friends + 1);
                } else {
                  state.stress = clamp(state.stress + 2);
                }
                step();
              },
            },
          ],
        });
      } else {
        showModal({
          title: `${examName}：文化课测试进行中`,
          text: "每个时间点做出选择。先审题再答题，节奏别乱。",
          progress,
          options: [
            {
              label: "审题",
              onClick: () => {
                t += 1;
                const gain = Math.random() < (0.48 + state.science / 240 + state.bio / 380) ? 1 : 0;
                read += gain;
                step();
              },
            },
            {
              label: "答题",
              onClick: () => {
                t += 1;
                const unlocked = read >= 8;
                if (unlocked) {
                  const gain = Math.random() < (0.45 + state.science / 180 + state.energy / 350 - state.stress / 500) ? 1 : 0;
                  answer += gain;
                } else {
                  state.stress = clamp(state.stress + 2);
                }
                state.energy = clamp(state.energy - 2);
                step();
              },
            },
            {
              label: "回忆老师提示",
              onClick: () => {
                t += 1;
                if (state.family >= 45) read += 1;
                else state.stress = clamp(state.stress + 1);
                step();
              },
            },
          ],
        });
      }
    }
    step();
  });
}

async function runExamIfNeeded() {
  const exam = exams[state.week];
  if (!exam) return;
  const type = exam.type;

  if (type === "contest_sim") {
    const success = await runTimelineChallenge("contest", exam.name);
    if (success) {
      applyDelta({ score: 12, algo: 4, friends: 2 });
      pushLog(`${exam.name}完成：你在时间点管理上做得很好。`, true);
      dom.eventTitle.textContent = `🏅 ${exam.name}成功`;
      dom.eventText.textContent = "你先想题后写代码，节奏合理，得分显著。";
    } else {
      applyDelta({ stress: 10, score: -2 });
      pushLog(`${exam.name}未完成：提交节奏失衡。`, false);
      dom.eventTitle.textContent = `⚠️ ${exam.name}失利`;
      dom.eventText.textContent = "你在关键时间点犹豫太久，没能完成题目。";
    }
    return;
  }

  if (type === "school_sim") {
    const success = await runTimelineChallenge("school", exam.name);
    if (success) {
      applyDelta({ score: 8, science: 4, family: 4 });
      pushLog(`${exam.name}完成：文化课表现稳定。`, true);
      dom.eventTitle.textContent = `✅ ${exam.name}顺利`;
      dom.eventText.textContent = "你把审题和答题节奏控制住了。";
    } else {
      applyDelta({ stress: 9, family: -6 });
      pushLog(`${exam.name}失误：步骤不完整导致失分。`, false);
      dom.eventTitle.textContent = `❌ ${exam.name}波动`;
      dom.eventText.textContent = "你需要更稳定的考试流程。";
    }
    return;
  }

  if (type === "contest") {
    const p = state.algo * 0.7 + state.science * 0.15 + state.energy * 0.1 + state.friends * 0.05 - state.stress * 0.3;
    if (p >= 56) {
      applyDelta({ score: 10, algo: 3 });
      pushLog(`${exam.name}发挥出色。`, true);
    } else {
      applyDelta({ stress: 8, family: -4 });
      pushLog(`${exam.name}一般，后续需复盘。`, false);
    }
  }

  if (type === "school") {
    const p = state.science * 0.6 + state.bio * 0.2 + state.energy * 0.12 + state.family * 0.08 - state.stress * 0.24;
    if (p >= 45) {
      applyDelta({ score: 4, family: 3 });
      pushLog(`${exam.name}稳住了。`, true);
    } else {
      applyDelta({ stress: 8, family: -5 });
      pushLog(`${exam.name}下滑，需调整策略。`, false);
    }
  }
}

function render() {
  state.goal = currentGoal();
  state.exam = nextExamText();
  Object.keys(dom).forEach((k) => { if (k in state && dom[k]) dom[k].textContent = state[k]; });
}
function checkEnding() {
  if (state.energy <= 0 || state.stress >= 100) {
    state.over = true;
    dom.eventTitle.textContent = "⚠️ 状态崩盘";
    dom.eventText.textContent = "你过度透支，训练计划中断。";
    pushLog("由于状态崩盘，本局结束。", false);
  }
  if (!state.over && state.week > TOTAL_WEEKS) {
    state.over = true;
    const final = state.score * 0.45 + state.algo * 0.25 + state.science * 0.2 + state.friends * 0.1 - state.stress * 0.2;
    if (final >= 72) {
      dom.eventTitle.textContent = "🎉 顶级结局";
      dom.eventText.textContent = "你在同学支持与自律下，竞赛和学业双线成功。";
      pushLog("结局：双线冠军路线。", true);
    } else if (final >= 56) {
      dom.eventTitle.textContent = "🙂 稳健结局";
      dom.eventText.textContent = "你稳步成长，已经具备较强竞争力。";
      pushLog("结局：稳健成长。", true);
    } else {
      dom.eventTitle.textContent = "🛠️ 反思结局";
      dom.eventText.textContent = "你需要重构节奏：管理时间点与状态。";
      pushLog("结局：策略需要重做。", false);
    }
  }
  if (state.over) dom.actionButtons.innerHTML = "";
}

async function nextWeek(action) {
  if (state.over || !dom.modal.classList.contains("hidden")) return;
  applyDelta(action.apply());
  pushLog(action.text, true);
  await randomChoiceEvent();
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
  dom.eventText.textContent = "你需要应对偶然事件、同学互动和阶段考试挑战。";
  render();
  renderActions();
}

dom.restart.addEventListener("click", restart);
restart();
