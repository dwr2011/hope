const TOTAL_WEEKS = 32;
const initialState = {
  week: 1, health: 100, energy: 100, stress: 15,
  dp: 15, nt: 12, graph: 14, ds: 13, string: 13,
  science: 35, social: 45, family: 60,
  lin: 40, chen: 40, crush: 20, team: 40,
  score: 0, exam: "第8周 CSP-S", over: false,
};
const state = { ...initialState };
const dom = Object.fromEntries([
  "week","health","energy","stress","dp","nt","graph","ds","string","science","social","family","lin","chen","crush","team","score","exam",
  "event-title","event-text","action-buttons","log","restart","modal","modal-title","modal-text","modal-progress","modal-actions"
].map(id => [id.replace(/-([a-z])/g, (_,c)=>c.toUpperCase()), document.getElementById(id)]));

const exams = {
  8:{name:"CSP-S",type:"contest",problems:4},14:{name:"NOIP 提高组",type:"contest",problems:4},20:{name:"学校期中",type:"school",problems:4},24:{name:"省队集训测试",type:"contest",problems:5},28:{name:"NOI 模拟赛",type:"contest",problems:6},32:{name:"NOI",type:"contest",problems:6},
};

const actions = [
  { label:"竞赛训练（弹出题单）", type:"training" },
  { label:"社交活动（人物线）", type:"social" },
  { label:"集训周（封闭）", type:"camp" },
  { label:"文化课深耕", apply:()=>({science:10,energy:-10,stress:4}), text:"你完成了多科专项训练。" },
  { label:"高强度刷题", apply:()=>({dp:4,nt:4,graph:4,ds:4,string:4,health:-12,energy:-18,stress:9,score:4}), text:"你全方向冲刺但代价很大。" },
  { label:"休整恢复", apply:()=>({health:14,energy:12,stress:-10,social:4}), text:"你把状态拉了回来。" },
];

const trainingBank = [
  ["树形DP",{dp:2,graph:1},{health:-2,energy:-3,stress:1}],
  ["状压DP",{dp:3},{health:-3,energy:-4,stress:2}],
  ["逆元与同余",{nt:2},{health:-2,energy:-3,stress:1}],
  ["筛法与积性函数",{nt:3,ds:1},{health:-4,energy:-5,stress:2}],
  ["最短路变形",{graph:2,ds:1},{health:-2,energy:-3,stress:1}],
  ["网络流",{graph:3,dp:1},{health:-5,energy:-6,stress:3}],
  ["平衡树",{ds:3},{health:-4,energy:-5,stress:2}],
  ["线段树",{ds:2,dp:1},{health:-3,energy:-4,stress:2}],
  ["KMP",{string:3},{health:-3,energy:-4,stress:1}],
  ["后缀数组",{string:3,ds:1},{health:-5,energy:-6,stress:3}],
];

function clamp(v){return Math.max(0,Math.min(100,v));}
function applyDelta(d){Object.entries(d).forEach(([k,v])=>{if(k in state) state[k]=clamp(state[k]+v);});}
function pushLog(t,g=null){const li=document.createElement("li");li.textContent=`第 ${state.week} 周：${t}`;if(g===true)li.classList.add("good");if(g===false)li.classList.add("bad");dom.log.prepend(li);}
function hideModal(){dom.modal.classList.add("hidden");}
function showModal({title,text,progress="",options=[]}){dom.modal.classList.remove("hidden");dom.modalTitle.textContent=title;dom.modalText.textContent=text;dom.modalProgress.textContent=progress;dom.modalActions.innerHTML="";options.forEach(o=>{const b=document.createElement("button");b.textContent=o.label;b.addEventListener("click",o.onClick);dom.modalActions.appendChild(b);});}
function nextExamText(){const w=Object.keys(exams).map(Number).find(n=>n>=state.week);return w?`第${w}周 ${exams[w].name}`:"无";}

function randomEventChoice(){
  if(Math.random()>0.38) return Promise.resolve();
  const pool=[
    {t:"暗恋事件",x:"你在走廊遇到暗恋对象，对方问你周末要不要一起自习。",a:["答应",{crush:10,social:6,stress:-4,energy:-2}],b:["婉拒",{dp:2,crush:-4,stress:2}]},
    {t:"林骁约数论夜聊",x:"要不要去？",a:["去",{lin:9,nt:4,social:4,energy:-4}],b:["不去",{lin:-4,energy:4}]},
    {t:"陈璇请你讲字符串",x:"讲题会占用晚自习。",a:["讲题",{chen:9,string:4,social:5,science:-1}],b:["拒绝",{chen:-5,string:1}]},
    {t:"队友临时组队训练",x:"要不要参加双人对拍？",a:["参加",{team:8,graph:2,ds:2,stress:-2,energy:-5}],b:["单练",{dp:3,team:-4,stress:2}]},
    {t:"家庭晚餐",x:"爸妈希望你放松一下。",a:["参加",{family:8,health:4,stress:-4}],b:["继续练",{dp:2,nt:2,family:-5,stress:3}]},
  ];
  const e=pool[Math.floor(Math.random()*pool.length)];
  return new Promise(res=>showModal({title:`特殊事件：${e.t}`,text:e.x,options:[
    {label:e.a[0],onClick:()=>{applyDelta(e.a[1]);pushLog(`事件选择：${e.a[0]}`,true);hideModal();res();}},
    {label:e.b[0],onClick:()=>{applyDelta(e.b[1]);pushLog(`事件选择：${e.b[0]}`,false);hideModal();res();}},
  ]}));
}

function fmtDelta(d){return Object.entries(d).map(([k,v])=>`${v>0?`+${v}`:v}${({dp:'DP',nt:'数论',graph:'图论',ds:'数据结构',string:'字符串',health:'健康',energy:'精力',stress:'压力'})[k]||k}`).join(" ");}

function runTrainingModal(){
  return new Promise(resolve=>{
    const set=[...trainingBank].sort(()=>Math.random()-0.5).slice(0,6);
    let done=0;
    const draw=()=>showModal({
      title:"竞赛训练题单",text:"每题下面有明确加点，例如 +2DP +2数论。",progress:`已做 ${done}/3`,
      options:[...set.map(([name,g,c])=>({label:`${name}\n  ${fmtDelta(g)}｜${fmtDelta(c)}`,onClick:()=>{applyDelta(g);applyDelta(c);applyDelta({score:2});done++;pushLog(`训练：${name}（${fmtDelta(g)}）`,true);done>=3?(hideModal(),resolve()):draw();}})),
      {label:"提前收工",onClick:()=>{applyDelta({health:4,stress:-2});hideModal();resolve();}}]
    });
    draw();
  });
}

function runSocialModal(){
  return new Promise(resolve=>showModal({title:"社交活动（人物线）",text:"选择不同人物线，会影响长期协作收益。",options:[
    {label:"林骁线：数论讨论（+关系 +数论）",onClick:()=>{applyDelta({lin:10,nt:4,social:5,energy:-4,stress:-1});pushLog("你和林骁完成数论讨论。",true);hideModal();resolve();}},
    {label:"陈璇线：字符串讲题（+关系 +字符串）",onClick:()=>{applyDelta({chen:10,string:4,social:6,energy:-4,stress:-1});pushLog("你帮助陈璇做字符串分享。",true);hideModal();resolve();}},
    {label:"队伍线：模拟赛联训（+默契 +多方向）",onClick:()=>{applyDelta({team:10,dp:2,ds:2,graph:2,social:5,energy:-6});pushLog("你和队伍联训，协作提升明显。",true);hideModal();resolve();}},
    {label:"暗恋线：一起自习（+暗恋 +文化课）",onClick:()=>{applyDelta({crush:12,social:4,science:4,stress:-3});pushLog("你和暗恋对象一起自习，心态更稳定。",true);hideModal();resolve();}},
  ]}));
}

function runCamp(){
  return new Promise(resolve=>showModal({title:"集训周",text:"收益高，消耗也高。",options:[
    {label:"算法综合集训（+6DP +6图论 +6数据结构）",onClick:()=>{applyDelta({dp:6,graph:6,ds:6,health:-10,energy:-12,stress:7,score:6});hideModal();resolve();}},
    {label:"数论+字符串集训（+8数论 +8字符串）",onClick:()=>{applyDelta({nt:8,string:8,health:-10,energy:-12,stress:7,score:6});hideModal();resolve();}},
  ]}));
}

function knowledgeMap(){return {dp:state.dp,nt:state.nt,graph:state.graph,ds:state.ds,string:state.string};}

function runContestMulti(exam){
  return new Promise(resolve=>{
    let idx=1,total=0;
    const topics=["dp","nt","graph","ds","string"];
    const step=()=>{
      if(idx>exam.problems){hideModal();resolve(total);return;}
      const topic=topics[Math.floor(Math.random()*topics.length)];
      const k=knowledgeMap()[topic];
      let tried=0;
      const tiers=[
        {name:"保底档",need:1,base:0.88,range:[25,55],cost:{energy:-2,stress:1}},
        {name:"进阶档",need:2,base:0.62,range:[45,80],cost:{energy:-4,stress:2}},
        {name:"冲刺档",need:3,base:0.38,range:[70,100],cost:{energy:-7,health:-3,stress:4}},
      ];
      const draw=()=>showModal({
        title:`${exam.name} 第${idx}题（${{dp:'DP',nt:'数论',graph:'图论',ds:'数据结构',string:'字符串'}[topic]}）`,
        text:"每档有不同尝试数与成功率。薄弱点初始会隐藏需要尝试数。",
        progress:`当前总分 ${total}/${exam.problems*100}`,
        options: tiers.map(t=>{
          const weak = k < 35;
          const needText = weak && tried < 1 ? "需要尝试：？？" : `需要尝试：${t.need}`;
          const chance = Math.max(0.15, Math.min(0.95, t.base + (k - 40) / 120 + state.team / 250 - state.stress / 300));
          return {
            label:`${t.name}｜${needText}｜成功率约${Math.round(chance*100)}%`,
            onClick:()=>{
              tried += 1;
              applyDelta(t.cost);
              if(tried >= t.need && Math.random() < chance){
                const got = Math.round(t.range[0] + Math.random()*(t.range[1]-t.range[0]));
                total += got; idx += 1; step();
              } else {
                pushLog(`第${idx}题尝试${t.name}未过，继续尝试。`, false);
                draw();
              }
            }
          };
        })
      });
      draw();
    };
    step();
  });
}

function runSchoolMulti(exam){
  return new Promise(resolve=>{
    let i=1,total=0;
    const subs=["数学","物理","化学","生物","语文","英语"];
    const step=()=>{
      if(i>exam.problems){hideModal();resolve(total);return;}
      const s=subs[Math.floor(Math.random()*subs.length)];
      const p = state.science*0.75 + state.energy*0.12 + state.family*0.08 + state.crush*0.03 - state.stress*0.2;
      showModal({title:`${exam.name} - ${s}`,text:"文化课改成多科阶段：稳答/提分/冲刺。",progress:`当前总分 ${total}/${exam.problems*100}`,options:[
        {label:"稳答档（40~70）",onClick:()=>{total += Math.max(40,Math.min(70,Math.round(p*0.65+Math.random()*15)));applyDelta({energy:-3,stress:1});i++;step();}},
        {label:"提分档（55~88）",onClick:()=>{total += Math.max(55,Math.min(88,Math.round(p*0.82+Math.random()*14)));applyDelta({energy:-5,stress:2});i++;step();}},
        {label:"冲刺档（20~100）",onClick:()=>{total += Math.max(20,Math.min(100,Math.round(p + (Math.random()-0.35)*28)));applyDelta({energy:-7,stress:4});i++;step();}},
      ]});
    };
    step();
  });
}

async function runExamIfNeeded(){
  const exam=exams[state.week]; if(!exam) return;
  if(exam.type==="contest"){
    const score=await runContestMulti(exam); const avg=Math.round(score/exam.problems);
    if(avg>=70){applyDelta({score:14,dp:2,nt:2,graph:2,ds:2,string:2,social:2});pushLog(`${exam.name}高分（均分${avg}）。`,true);dom.eventTitle.textContent=`🏅 ${exam.name}高分`;dom.eventText.textContent="你根据档位策略稳定拿分。";}
    else if(avg>=45){applyDelta({score:7,dp:1,nt:1,graph:1,ds:1,string:1});pushLog(`${exam.name}中等（均分${avg}）。`,true);dom.eventTitle.textContent=`📈 ${exam.name}一般`;dom.eventText.textContent="部分分到手，但冲刺不够。";}
    else {applyDelta({stress:10,family:-4,score:-2});pushLog(`${exam.name}失利（均分${avg}）。`,false);dom.eventTitle.textContent=`⚠️ ${exam.name}失利`;dom.eventText.textContent="需要提高薄弱点并优化尝试策略。";}
    return;
  }
  const sc=await runSchoolMulti(exam); const avg=Math.round(sc/exam.problems);
  if(avg>=65){applyDelta({score:6,science:4,family:4});pushLog(`${exam.name}稳定（均分${avg}）。`,true);} else {applyDelta({stress:8,family:-4});pushLog(`${exam.name}波动（均分${avg}）。`,false);}
}

async function handleAction(a){ if(a.type==="training") return runTrainingModal(); if(a.type==="social") return runSocialModal(); if(a.type==="camp") return runCamp(); applyDelta(a.apply()); pushLog(a.text,true); }
function render(){ state.exam=nextExamText(); Object.keys(dom).forEach(k=>{ if(k in state && dom[k]) dom[k].textContent=state[k]; }); }
function checkEnding(){
  if(state.health<=0||state.energy<=0||state.stress>=100){state.over=true;dom.eventTitle.textContent="⚠️ 状态崩盘";dom.eventText.textContent="强度失衡导致崩盘。";pushLog("健康/精力/压力失衡，提前结束。",false);}
  if(!state.over && state.week>TOTAL_WEEKS){state.over=true;const final = state.score*0.3 + (state.dp+state.nt+state.graph+state.ds+state.string)*0.22 + (state.lin+state.chen+state.team+state.crush)*0.09 + state.science*0.12 + state.health*0.1 - state.stress*0.2;
    if(final>=88){dom.eventTitle.textContent="🎉 顶级结局";dom.eventText.textContent="竞赛、社交、感情和学业都处理得很好。";pushLog("结局：多线成功。",true);} else if(final>=62){dom.eventTitle.textContent="🙂 稳健结局";dom.eventText.textContent="总体稳健，仍有进步空间。";pushLog("结局：稳步成长。",true);} else {dom.eventTitle.textContent="🛠️ 反思结局";dom.eventText.textContent="还需要优化策略。";pushLog("结局：需要复盘。",false);} }
  if(state.over) dom.actionButtons.innerHTML="";
}
async function nextWeek(action){ if(state.over || !dom.modal.classList.contains("hidden")) return; await handleAction(action); await randomEventChoice(); state.week +=1; await runExamIfNeeded(); render(); checkEnding(); }
function renderActions(){ dom.actionButtons.innerHTML=""; actions.forEach(a=>{const b=document.createElement("button"); b.textContent=a.label; b.addEventListener("click",()=>nextWeek(a)); dom.actionButtons.appendChild(b);}); }
function restart(){ Object.assign(state,initialState); dom.log.innerHTML=""; hideModal(); dom.eventTitle.textContent="新学期开始"; dom.eventText.textContent="左侧看数据，右侧做决策：竞赛档位、文化课档位、人物线和暗恋线。"; render(); renderActions(); }
dom.restart.addEventListener("click",restart); restart();
