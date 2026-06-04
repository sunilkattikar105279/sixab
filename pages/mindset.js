// pages/mindset.js — SIXXAB AI · Founder Mental Model & Framework of Thinking
// Public page — no login required
import Head from "next/head"
import { useState } from "react"
import { SixxabMark, SixxabWordmark } from "../components/SixxabNav"
import SixxabNav from "../components/SixxabNav"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

// ── The 12 laws of autonomous business thinking ───────────────────────────────
const LAWS = [
  {
    n:"01", icon:"🎯", color:"#EF9F27",
    title:"Validate before you build. Always.",
    principle:"Every hour spent building an unvalidated product is a guaranteed loss. Every hour spent validating is a guaranteed return.",
    context:"Most founders skip validation because it feels slower than building. It isn't. Building the wrong thing takes 6 months. Validating takes 90 minutes on the Niche Selector.",
    rule:"You are not allowed to build anything until your viability score is 65 or above and you have spoken to at least 5 people from your target market.",
    tool:"SIXXAB Niche Selector", toolHref:"/niche-validator",
    antipattern:"'I'll validate after I build a prototype.' This is how 80% of founder time gets destroyed.",
    question:"If 10 people said yes to paying for this right now — do you know exactly which 10 people and why they would?"
  },
  {
    n:"02", icon:"⚡", color:"#1D9E75",
    title:"Revenue this week, not revenue someday.",
    principle:"The only question that matters on Monday morning is: what is the single action I can take today that is most likely to produce revenue this week?",
    context:"Founders optimise for feeling productive — writing code, designing logos, planning strategy. None of these produce revenue. Sending the right message to the right person at the right moment produces revenue.",
    rule:"Before you open your laptop on Monday, you must answer: what specific person will I contact today, what will I offer them, and what will I say? If you cannot answer all three, run the Orchestrator first.",
    tool:"Orchestrator", toolHref:"/orchestrator",
    antipattern:"'I need to finish the website/product/pitch deck before I can sell.' No. Sell first. Build what people paid for.",
    question:"Who is the most likely person to pay you money in the next 7 days, and have you contacted them yet?"
  },
  {
    n:"03", icon:"📐", color:"#378ADD",
    title:"One goal. One week. Full commitment.",
    principle:"A founder who pursues three goals simultaneously achieves none of them. A founder who pursues one goal with full commitment achieves it — or learns something definitive.",
    context:"The Orchestrator produces one unified plan from one goal. If you give it three goals you get a muddled plan. If you give it one specific, numbered, deadline-bound goal you get a plan you can actually execute.",
    rule:"Every Monday you set exactly one goal. Format: [Outcome] + [Specific number] + [By when] + [Target market]. You do not change this goal before Friday. You measure against it on Friday and set the next goal on Monday.",
    tool:"Orchestrator", toolHref:"/orchestrator",
    antipattern:"'I'm working on marketing, sales and product this week.' No. Choose the one that unlocks the others.",
    question:"What is your specific, numbered, deadline-bound goal for this week — written down in one sentence?"
  },
  {
    n:"04", icon:"👥", color:"#7C3AED",
    title:"Your CRM is your most valuable business asset.",
    principle:"A business is a set of relationships, not a set of features. The quality of your contact database determines the ceiling of your revenue.",
    context:"Most founders treat their contact list as a spreadsheet. SIXXAB treats it as a living system — every contact has a stage, a score, a history and a set of agents working on their behalf. The difference between a $10k MRR business and a $100k ARR business is almost always the quality and size of the relationship database.",
    rule:"You add every business conversation to SIXXAB CRM the same day it happens. You update every stage change immediately. You spend 5 minutes at the end of each workday maintaining the CRM. No exceptions.",
    tool:"SIXXAB CRM", toolHref:"/crm",
    antipattern:"'I'll add contacts to the CRM when I have more time.' You never have more time. Add them now.",
    question:"How many warm contacts — people who know you and might buy from you — do you have in your CRM right now?"
  },
  {
    n:"05", icon:"📊", color:"#D4537E",
    title:"Marketing is about compounding, not campaigns.",
    principle:"One LinkedIn post does nothing. Fifty-two consistent LinkedIn posts per year build an audience that generates inbound indefinitely.",
    context:"Founders treat marketing as a campaign — a burst of activity before a launch. This is how marketing fails. Marketing works through consistency and compounding. The agent that wrote your content last Tuesday is the same one writing it next Tuesday. The compound effect builds over months, not days.",
    rule:"You publish one piece of content every working day. It does not have to be perfect. It does have to be published. The Content Agent generates it. You review it. You post it. This takes 10 minutes per day and builds an audience that sustains you for years.",
    tool:"CXO Suite — CMO", toolHref:"/agents",
    antipattern:"'I'll start posting when I have something worth saying.' You always have something worth saying. Founders learning in public are magnetic.",
    question:"When did you last publish something about your business, and how many days ago was that?"
  },
  {
    n:"06", icon:"🔄", color:"#0EA5E9",
    title:"Retention beats acquisition. Always.",
    principle:"Keeping a customer costs 5–7× less than acquiring one. A business with 90% retention at Day 90 will always outgrow a business with 70% retention, even if the second business spends twice as much on acquisition.",
    context:"The COO advisor exists to build retention systems before you need them — onboarding sequences, NPS surveys, check-in cadences, churn prediction signals. Most founders hire a sales person when they lose customers. The right response is to fix retention first.",
    rule:"Before you spend a single dollar on marketing or sales, you must have a Day 1, Day 7, Day 30 and Day 90 onboarding sequence live. If you don't, build it this week before doing anything else.",
    tool:"CXO Suite — COO", toolHref:"/agents",
    antipattern:"'I'll worry about retention once I have more customers.' By then, the leaky bucket has cost you months of growth.",
    question:"What happens to a customer on Day 1, Day 7 and Day 30 after they sign up? If you don't know the answer, fix this today."
  },
  {
    n:"07", icon:"💰", color:"#DC2626",
    title:"Know your numbers before anyone asks.",
    principle:"A founder who cannot instantly state their MRR, LTV, CAC, churn rate and burn rate cannot make good decisions. A founder who knows these numbers by heart makes every decision faster and with higher confidence.",
    context:"The CFO advisor runs your financial model. The CDO advisor tracks your funnel data. Between them they produce the five numbers you need to know every Monday: MRR, new customers, churned customers, net revenue retention, and runway in months. If you know these five numbers you can answer any investor question, any hiring question, any pricing question.",
    rule:"Every Monday before running the Orchestrator you update your five numbers: MRR, new MRR, churned MRR, net revenue retention, and runway. These go into the Orchestrator goal. The plan that comes back is calibrated to your actual situation, not a generic template.",
    tool:"CXO Suite — CFO", toolHref:"/agents",
    antipattern:"'I'll look at the numbers when something feels wrong.' By then you are already behind. Weekly review is non-negotiable.",
    question:"Right now, without looking anything up: what is your MRR, your monthly churn rate, and your runway in months?"
  },
  {
    n:"08", icon:"🏗️", color:"#6B7280",
    title:"Build the system, not the output.",
    principle:"A founder who writes one great proposal has one great proposal. A founder who builds a proposal system has infinite great proposals that require zero effort.",
    context:"The difference between a business and a job is the presence of systems. Every task you do more than twice should be turned into a system. The Ops Agent exists to build SOPs from your natural language description of how you do things. Every time you do something for the third time, describe it to the Ops Agent and it becomes a reusable template.",
    rule:"Every Friday you identify one task you performed this week that you will have to perform again. You describe it to the Ops Agent. You convert it to a template or checklist. After 12 weeks you have 12 systems and your time spent on operations has halved.",
    tool:"CXO Suite — COO", toolHref:"/agents",
    antipattern:"'I'll document processes when the business is more stable.' Businesses get more complex, not more stable. Document now.",
    question:"What is one task you do every week that takes longer than 30 minutes and has no documented process?"
  },
  {
    n:"09", icon:"🌍", color:"#EC4899",
    title:"Geography is a choice, not a constraint.",
    principle:"A business that works in Dallas works in London. A business that works in London works in Singapore. The Vertical Agent Packs handle the local regulatory and language context. The system is already global.",
    context:"Most founders think global expansion is a Phase 4 problem. It isn't. The strategic question of which markets to enter is a Phase 3 problem. By the time you have $50k MRR, you should have already identified your second and third markets. The 30 Vertical Agent Packs are already pre-configured for Texas, US national, European and global markets. You pick the market. The agents handle the context.",
    rule:"By the end of Phase 3 (Optimise) you have identified your two expansion markets and run the Niche Selector for each. The HOV advisor gives you a readiness assessment for each market. You do not wait until Phase 6 to think about global.",
    tool:"Vertical Packs", toolHref:"/verticals",
    antipattern:"'International is too complicated right now.' English-language markets — UK, Canada, Australia, Singapore — are not complicated. They are the same business in a different postcode.",
    question:"If you had to expand to one international market in the next 90 days, which one would it be and why?"
  },
  {
    n:"10", icon:"💼", color:"#1E3A5F",
    title:"Governance is not a bureaucratic chore. It is a competitive advantage.",
    principle:"A company with a properly structured board, clean cap table, documented governance and proactive compliance is worth dramatically more than a company with equivalent revenue but messy structure. Every dollar of enterprise value you preserve through governance costs nothing but attention.",
    context:"Most founders delay governance until they have to deal with it — usually right before a raise or acquisition when they have no time and maximum pressure. The Corporate Board agents exist to do governance continuously, not reactively. A 30-minute quarterly governance review by the Board agent is worth 30 hours of rushed legal work before a deal.",
    rule:"Once per quarter you run the Governance Agent, the Corp Compliance Agent and the Audit & Risk Agent. This takes one hour. You action any flagged items before they become problems. You never have a governance surprise during a fundraise or acquisition.",
    tool:"CXO Suite — Board", toolHref:"/agents",
    antipattern:"'I'll deal with legal and governance when I have investors.' Investors find the mess. They don't fix it. They discount your valuation for it.",
    question:"When did you last review your cap table, shareholder agreements and compliance obligations? If the answer is 'never', do it this week."
  },
  {
    n:"11", icon:"📈", color:"#16A34A",
    title:"The Capitalise phase is the gap where most founders stall. Plan for it.",
    principle:"The journey from $500k ARR to $2M ARR is not an execution problem. It is a capital and network problem. Founders who plan for this phase 12 months early close seed rounds in 90 days. Founders who think about it when they need money take 18 months and often fail.",
    context:"The Investor Hub exists to manage investor relationships before you need money. You add every angel, VC and family office to the Investor CRM the first time you meet them — at conferences, through warm intros, in DMs. By the time you are ready to raise, you have a warm pipeline of 50+ relationships, not a cold list of emails to scrape.",
    rule:"Starting at Phase 3 (Optimise), you add one investor contact to the Investor CRM every week. You do not pitch them. You share your progress. You build the relationship. By Phase 5 (Capitalise) you have 50+ warm relationships and a raise takes 90 days instead of 18 months.",
    tool:"Investor Hub", toolHref:"/investor",
    antipattern:"'I'll start talking to investors when I'm ready to raise.' By then they don't know you. Relationships take 12–18 months to build. Start now.",
    question:"How many investors do you know personally — people who would take your call right now? If the answer is under 10, start building this week."
  },
  {
    n:"12", icon:"🤝", color:"#F59E0B",
    title:"The platform works when you work it. Consistency beats intensity.",
    principle:"A founder who uses SIXXAB AI for 20 focused minutes every Monday and Friday will outperform a founder who uses it for 4 hours on one Saturday every three weeks.",
    context:"The compound effect of the SIXXAB framework comes from consistency, not heroics. The Monday Orchestrator session + Friday metrics review + daily CRM update is 30 minutes of total daily commitment that compounds across 52 weeks into a business that runs autonomously. Miss two weeks and the compounding stops. Miss a month and the agents have stale data and produce generic advice.",
    rule:"Your SIXXAB AI routine is non-negotiable: Monday 8am — run Orchestrator (15 min). Daily end of day — update CRM (5 min). Friday 4pm — review metrics against goal (10 min). 30 minutes per day. Every day. Not some days.",
    tool:"Orchestrator", toolHref:"/orchestrator",
    antipattern:"'I'll use it when I really need it.' You need it every week. Consistent weekly use is the entire point.",
    question:"Do you have a recurring calendar block for your Monday Orchestrator session and Friday metrics review? If not, block it now."
  },
]

// ── The 7 failure modes ────────────────────────────────────────────────────────
const FAILURES = [
  { icon:"🏗️", title:"Building before validating",   fix:"Run Niche Selector first. Every time. No exceptions." },
  { icon:"🌊", title:"Scattered weekly priorities",   fix:"One goal per week. Not three. Not five. One." },
  { icon:"🗄️", title:"Neglecting the CRM",           fix:"5 minutes of CRM updates every working day. Non-negotiable." },
  { icon:"📣", title:"Inconsistent marketing",        fix:"One piece of content every working day. The agent writes it. You approve and post." },
  { icon:"🚿", title:"Ignoring retention",            fix:"Fix the leaky bucket before pouring more water in. Retention first, acquisition second." },
  { icon:"🧮", title:"Not knowing your numbers",      fix:"Five numbers every Monday: MRR, new MRR, churned MRR, NRR, runway. Know them cold." },
  { icon:"🏃", title:"Waiting to plan the Capitalise phase", fix:"Start building investor relationships at Phase 3, not Phase 5. You need 12 months of relationship." },
]

// ── The weekly rhythm ──────────────────────────────────────────────────────────
const RHYTHM = [
  { day:"Monday", time:"8:00am", action:"Run the Orchestrator", detail:"Set your weekly goal. Read the unified plan. Know your Priority 1.", tool:"Orchestrator", color:"#EF9F27" },
  { day:"Monday", time:"9:00am", action:"Execute Priority 1",   detail:"Do the single highest-leverage action today, not tomorrow.", tool:"Your calendar", color:"#EF9F27" },
  { day:"Tue–Thu", time:"Daily", action:"Send outreach",        detail:"The Marketing Agent has your scripts. Send them. Reply within 1 hour.", tool:"SIXXAB CRM", color:"#1D9E75" },
  { day:"Daily",   time:"EOD",   action:"Update CRM",           detail:"Log every conversation. Move every contact one stage. 5 minutes.", tool:"SIXXAB CRM", color:"#1D9E75" },
  { day:"Wednesday", time:"Any", action:"Publish content",      detail:"The Content Agent drafted it. Review, approve, post. 10 minutes.", tool:"CXO Suite — CMO", color:"#D4537E" },
  { day:"Friday", time:"4:00pm", action:"Review metrics",       detail:"Did you hit your weekly goal? What moved, what didn't, and why?", tool:"CXO Suite — CFO", color:"#378ADD" },
  { day:"Friday", time:"4:30pm", action:"Set next week's goal", detail:"Based on what you learned this week, set Monday's Orchestrator goal now.", tool:"Orchestrator", color:"#EF9F27" },
  { day:"Monthly", time:"1st",   action:"Investor update",      detail:"Board Comms Agent generates it. Send it to every investor in your CRM.", tool:"Investor Hub", color:"#DC2626" },
  { day:"Quarterly", time:"Any", action:"Governance review",    detail:"Governance + Compliance + Audit agents. One hour. Flag and fix.", tool:"Board", color:"#1E3A5F" },
]

export default function MindsetPage() {
  const [activeLaw, setActiveLaw] = useState(null)

  return (
    <>
      <Head>
        <title>SIXXAB AI — Founder Mental Model · Framework of Thinking for Success</title>
        <meta name="description" content="The 12 laws of autonomous business thinking. The mental model every SIXXAB AI founder needs to go from $0 to $10M ARR. Anti-patterns, success questions and weekly rhythm."/>
      </Head>
      <style>{`
        body{background:#F4F4F0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
        .fu{animation:fadeUp .35s ease both}
        .si{animation:slideIn .28s ease both}
        .card{background:#fff;border-radius:14px;border:1px solid #E2E8F0;overflow:hidden}
        .law-btn{width:100%;text-align:left;padding:14px 16px;border:none;background:transparent;cursor:pointer;font-family:inherit;border-radius:10px;transition:all .15s;display:flex;align-items:flex-start;gap:10px;border-left:3px solid transparent}
        .law-btn:hover{background:#F8F9FA}
        .law-btn.on{background:#F8F9FA;border-left-color:var(--lc)}
        a{text-decoration:none}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${AMBER};border-radius:2px}
        @media(max-width:768px){.grid-2{grid-template-columns:1fr!important}}
      `}</style>

      <SixxabNav active="/mindset"/>

      {/* ── Hero ── */}
      <div style={{background:N,padding:"48px 5% 40px",borderBottom:"1px solid rgba(255,255,255,.07)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(239,159,39,.08) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:800,height:400,background:"radial-gradient(ellipse,rgba(239,159,39,.1) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:900,margin:"0 auto",position:"relative",zIndex:1}}>
          <div style={{fontFamily:"monospace",fontSize:10.5,color:AMBER,letterSpacing:".14em",textTransform:"uppercase",marginBottom:12}}>SIXXAB AI — Founder Mental Model</div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(32px,6vw,68px)",fontWeight:700,color:CHALK,letterSpacing:"-1px",lineHeight:.95,marginBottom:18}}>
            The framework of thinking<br/>
            <span style={{color:AMBER,fontStyle:"italic"}}>for autonomous success.</span>
          </h1>
          <p style={{fontSize:16,color:"rgba(245,245,240,.55)",maxWidth:580,lineHeight:1.8,marginBottom:28}}>
            SIXXAB AI is not software you use occasionally. It is a discipline you practice weekly. The founders who reach $10M ARR are not the ones who try hardest — they are the ones who think differently about what a business is and how it should run.
          </p>
          <p style={{fontSize:15,color:"rgba(245,245,240,.4)",maxWidth:560,lineHeight:1.75,borderLeft:`3px solid ${AMBER}`,paddingLeft:16,fontStyle:"italic"}}>
            "Most founders have a job inside their own company. The SIXXAB framework is a set of mental shifts that turn your job into a business — and your business into a platform."
          </p>
          <div style={{display:"flex",gap:8,marginTop:28,flexWrap:"wrap"}}>
            {[["12 laws","of autonomous thinking"],["7 failure modes","to eliminate"],["1 weekly rhythm","that compounds"]].map(([v,l])=>(
              <div key={v} style={{padding:"6px 14px",borderRadius:20,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",fontSize:12.5}}>
                <strong style={{color:CHALK}}>{v}</strong>&nbsp;<span style={{color:"rgba(245,245,240,.4)"}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1160,margin:"0 auto",padding:"32px 5% 80px"}}>

        {/* ── The 12 Laws ── */}
        <div style={{marginBottom:60}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <div style={{fontFamily:"monospace",fontSize:10.5,color:AMBER,letterSpacing:".12em",textTransform:"uppercase",marginBottom:8}}>Part 1 of 3</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(26px,4vw,46px)",fontWeight:700,color:N,letterSpacing:"-0.5px",marginBottom:10}}>The 12 Laws of Autonomous Business Thinking</h2>
            <p style={{fontSize:15,color:"#64748B",maxWidth:520,margin:"0 auto",lineHeight:1.75}}>These are the mental shifts that separate founders who scale from founders who stay stuck. Read each law. Apply the rule. Answer the question honestly.</p>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:16,alignItems:"start"}} className="grid-2">
            {/* Law nav */}
            <div style={{position:"sticky",top:72}}>
              <div className="card" style={{maxHeight:"calc(100vh - 100px)",overflowY:"auto"}}>
                <div style={{padding:"10px 14px",borderBottom:"1px solid #E8ECF4",fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em"}}>
                  12 Laws
                </div>
                {LAWS.map((l,i)=>(
                  <button key={i} className={`law-btn${activeLaw===i?" on":""}`}
                    style={{"--lc":l.color}} onClick={()=>setActiveLaw(activeLaw===i?null:i)}>
                    <div style={{width:28,height:28,borderRadius:8,background:`${l.color}18`,border:`1px solid ${l.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{l.icon}</div>
                    <div>
                      <div style={{fontSize:9.5,fontFamily:"monospace",color:l.color,letterSpacing:".06em",marginBottom:2}}>LAW {l.n}</div>
                      <div style={{fontSize:12,fontWeight:500,color:activeLaw===i?N:"#475569",lineHeight:1.3}}>{l.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Law detail */}
            <div>
              {activeLaw === null ? (
                /* Overview grid */
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {LAWS.map((l,i)=>(
                    <div key={i} onClick={()=>setActiveLaw(i)}
                      style={{padding:"16px",borderRadius:12,border:`1.5px solid ${l.color}33`,background:`${l.color}06`,cursor:"pointer",transition:"all .15s"}}
                      onMouseOver={e=>{e.currentTarget.style.background=`${l.color}12`;e.currentTarget.style.borderColor=`${l.color}66`;e.currentTarget.style.transform="translateY(-2px)"}}
                      onMouseOut={e=>{e.currentTarget.style.background=`${l.color}06`;e.currentTarget.style.borderColor=`${l.color}33`;e.currentTarget.style.transform="none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontSize:20}}>{l.icon}</span>
                        <span style={{fontFamily:"monospace",fontSize:10,color:l.color,letterSpacing:".06em"}}>LAW {l.n}</span>
                      </div>
                      <div style={{fontSize:13,fontWeight:600,color:N,lineHeight:1.35,marginBottom:6}}>{l.title}</div>
                      <div style={{fontSize:11.5,color:"#64748B",lineHeight:1.6}}>{l.principle.slice(0,80)}…</div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Law detail */
                <div key={activeLaw} className="si">
                  {(() => {
                    const l = LAWS[activeLaw]
                    return (
                      <div>
                        {/* Header */}
                        <div style={{background:N,borderRadius:14,padding:"22px 24px",marginBottom:14,border:`2px solid ${l.color}44`}}>
                          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                            <div style={{width:48,height:48,borderRadius:12,background:`${l.color}22`,border:`2px solid ${l.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{l.icon}</div>
                            <div>
                              <div style={{fontFamily:"monospace",fontSize:10,color:l.color,letterSpacing:".1em",marginBottom:4}}>LAW {l.n} OF 12</div>
                              <h3 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:CHALK,lineHeight:1.1}}>{l.title}</h3>
                            </div>
                          </div>
                          <p style={{fontSize:16,color:CHALK,lineHeight:1.75,fontStyle:"italic",fontFamily:"Georgia,serif",borderLeft:`3px solid ${l.color}`,paddingLeft:16}}>
                            {l.principle}
                          </p>
                        </div>

                        {/* Why it matters */}
                        <div className="card" style={{padding:"18px 20px",marginBottom:10}}>
                          <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Why this matters</div>
                          <p style={{fontSize:14.5,color:"#475569",lineHeight:1.8}}>{l.context}</p>
                        </div>

                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                          {/* The rule */}
                          <div className="card" style={{padding:"16px 18px",borderTop:`3px solid ${l.color}`}}>
                            <div style={{fontSize:11,fontWeight:700,color:l.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>The rule</div>
                            <p style={{fontSize:13.5,color:N,lineHeight:1.75}}>{l.rule}</p>
                          </div>
                          {/* Anti-pattern */}
                          <div className="card" style={{padding:"16px 18px",borderTop:"3px solid #EF4444",background:"#FFFBFB"}}>
                            <div style={{fontSize:11,fontWeight:700,color:"#EF4444",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>The anti-pattern to eliminate</div>
                            <p style={{fontSize:13.5,color:"#475569",lineHeight:1.75,fontStyle:"italic"}}>"{l.antipattern}"</p>
                          </div>
                        </div>

                        {/* Diagnostic question */}
                        <div style={{padding:"16px 20px",background:`${l.color}10`,border:`1.5px solid ${l.color}44`,borderRadius:12,marginBottom:12}}>
                          <div style={{fontSize:11,fontWeight:700,color:l.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Diagnostic question — answer this honestly</div>
                          <p style={{fontSize:15,color:N,lineHeight:1.7,fontWeight:500}}>{l.question}</p>
                        </div>

                        {/* Tool CTA */}
                        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                          <a href={l.toolHref} style={{padding:"10px 22px",borderRadius:10,background:l.color,color:["#EF9F27","#F59E0B","#1E3A5F"].includes(l.color)?N:"#fff",fontSize:13,fontWeight:700,display:"inline-flex",alignItems:"center",gap:7}}>
                            Open {l.tool} →
                          </a>
                          <div style={{display:"flex",gap:8}}>
                            {activeLaw > 0 && <button onClick={()=>setActiveLaw(activeLaw-1)} style={{padding:"10px 16px",borderRadius:10,border:"1px solid #E2E8F0",background:"#fff",fontSize:13,cursor:"pointer",fontFamily:"inherit",color:"#64748B"}}>← Law {String(activeLaw).padStart(2,"0")}</button>}
                            {activeLaw < 11 && <button onClick={()=>setActiveLaw(activeLaw+1)} style={{padding:"10px 16px",borderRadius:10,border:`1px solid ${LAWS[activeLaw+1]?.color}44`,background:`${LAWS[activeLaw+1]?.color}08`,fontSize:13,cursor:"pointer",fontFamily:"inherit",color:LAWS[activeLaw+1]?.color,fontWeight:500}}>Law {String(activeLaw+2).padStart(2,"0")} →</button>}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 7 Failure Modes ── */}
        <div style={{marginBottom:60}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontFamily:"monospace",fontSize:10.5,color:"#EF4444",letterSpacing:".12em",textTransform:"uppercase",marginBottom:8}}>Part 2 of 3</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(24px,4vw,44px)",fontWeight:700,color:N,letterSpacing:"-0.5px",marginBottom:10}}>The 7 Failure Modes</h2>
            <p style={{fontSize:15,color:"#64748B",maxWidth:460,margin:"0 auto",lineHeight:1.75}}>These are the patterns that kill 80% of businesses before they reach $50k MRR. Recognise them early. Eliminate them systematically.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:900,margin:"0 auto"}}>
            {FAILURES.map((f,i)=>(
              <div key={i} style={{background:"#fff",borderRadius:13,border:"1px solid #E2E8F0",padding:"18px 20px",display:"flex",gap:14,alignItems:"flex-start",borderLeft:"4px solid #EF4444"}}>
                <span style={{fontSize:26,flexShrink:0}}>{f.icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:N,marginBottom:6}}>{f.title}</div>
                  <div style={{fontSize:13,color:"#1D9E75",fontWeight:500,display:"flex",alignItems:"flex-start",gap:6}}>
                    <span style={{color:"#1D9E75",flexShrink:0,marginTop:1}}>→</span>{f.fix}
                  </div>
                </div>
              </div>
            ))}
            <div style={{background:N,borderRadius:13,padding:"18px 20px",display:"flex",gap:14,alignItems:"center",gridColumn:"span 1"}}>
              <span style={{fontSize:26}}>✦</span>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:CHALK,marginBottom:6}}>The common thread</div>
                <div style={{fontSize:13,color:"rgba(245,245,240,.55)",lineHeight:1.65}}>Every failure mode is a consistency failure. None of them are intelligence failures or resource failures. You have the tools. Use them consistently.</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Weekly Rhythm ── */}
        <div style={{marginBottom:32}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontFamily:"monospace",fontSize:10.5,color:AMBER,letterSpacing:".12em",textTransform:"uppercase",marginBottom:8}}>Part 3 of 3</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(24px,4vw,44px)",fontWeight:700,color:N,letterSpacing:"-0.5px",marginBottom:10}}>The Weekly Rhythm That Compounds</h2>
            <p style={{fontSize:15,color:"#64748B",maxWidth:520,margin:"0 auto",lineHeight:1.75}}>30 minutes per day. Every day. Non-negotiable. After 52 weeks this rhythm builds a business that generates revenue without requiring your constant presence.</p>
          </div>
          <div style={{maxWidth:900,margin:"0 auto"}}>
            {RHYTHM.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:0,marginBottom:6}}>
                {/* Day label */}
                <div style={{width:100,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",paddingRight:16,paddingTop:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:N,textAlign:"right"}}>{r.day}</div>
                  <div style={{fontSize:11,color:"#94A3B8",textAlign:"right"}}>{r.time}</div>
                </div>
                {/* Timeline dot */}
                <div style={{width:32,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:r.color,border:"2px solid #fff",boxShadow:`0 0 0 2px ${r.color}44`,marginTop:16,flexShrink:0}}/>
                  {i < RHYTHM.length-1 && <div style={{width:2,flex:1,background:"#E8ECF4",marginTop:4}}/>}
                </div>
                {/* Content */}
                <div style={{flex:1,paddingLeft:16,paddingBottom:i<RHYTHM.length-1?12:0}}>
                  <div style={{background:"#fff",borderRadius:12,border:`1px solid ${r.color}33`,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:N,marginBottom:3}}>{r.action}</div>
                      <div style={{fontSize:13,color:"#64748B"}}>{r.detail}</div>
                    </div>
                    <div style={{flexShrink:0}}>
                      <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:`${r.color}15`,color:r.color,fontWeight:500,whiteSpace:"nowrap"}}>{r.tool}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{background:N,borderRadius:18,padding:"40px 5%",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(239,159,39,.07) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontFamily:"monospace",fontSize:10.5,color:AMBER,letterSpacing:".12em",marginBottom:12}}>READY TO APPLY THE FRAMEWORK?</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(24px,4vw,44px)",fontWeight:700,color:CHALK,letterSpacing:"-0.5px",marginBottom:14,lineHeight:1.1}}>
              The mental model is the guide.<br/>The platform is the engine.
            </h2>
            <p style={{fontSize:15,color:"rgba(245,245,240,.5)",maxWidth:420,margin:"0 auto 28px",lineHeight:1.75}}>
              Apply Law 01 right now. Run your niche validation. Take 90 minutes before building anything else.
            </p>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <a href="/niche-validator" style={{padding:"13px 28px",borderRadius:11,background:AMBER,color:N,fontSize:15,fontWeight:700,display:"inline-flex",alignItems:"center",gap:8}}>🎯 Start with Niche Selector →</a>
              <a href="/orchestrator" style={{padding:"13px 28px",borderRadius:11,border:"1px solid rgba(255,255,255,.18)",background:"rgba(255,255,255,.06)",color:CHALK,fontSize:14,fontWeight:500,display:"inline-flex",alignItems:"center",gap:8}}>Run the Orchestrator →</a>
              <a href="/runbook" style={{padding:"13px 28px",borderRadius:11,border:"1px solid rgba(255,255,255,.1)",color:"rgba(245,245,240,.5)",fontSize:14,display:"inline-flex",alignItems:"center",gap:8}}>📖 Read the runbook</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
