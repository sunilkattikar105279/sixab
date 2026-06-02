// pages/runbook.js — SIXXAB AI Platform Runbook
// How to use every module — accessible before login from landing page
import { useState } from "react"
import Head from "next/head"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

const CHAPTERS = [
  {
    id:"start", icon:"🚀", title:"Getting started",
    color:"#EF9F27", tag:"Start here",
    summary:"Set up your SIXXAB AI account, configure your profile and run your first orchestrator session in under 15 minutes.",
    sections:[
      {
        title:"Create your account",
        steps:[
          {n:"1", text:"Go to startupsinabox.com and click 'Get started'"},
          {n:"2", text:"Sign up with email/password or Google. Choose a founding member plan ($49.50, $99.50 or $175/mo)"},
          {n:"3", text:"Complete Stripe checkout — your founding rate is locked forever from this moment"},
          {n:"4", text:"You land on the Orchestrator page — this is your command centre"},
        ],
        tip:"Use your business email, not personal — it makes the AI agents personalise scripts to your business domain."
      },
      {
        title:"Set up SIXXAB CRM first",
        steps:[
          {n:"1", text:"Go to /crm (top nav → SIXXAB CRM)"},
          {n:"2", text:"Import contacts: paste LinkedIn profiles, upload a CSV, or add manually"},
          {n:"3", text:"Tag each contact with their stage: Prospect, Outreach, Replied, Demo, Proposal, Closed"},
          {n:"4", text:"These contacts now appear in every agent — marketing scripts, sales pipeline, support tickets"},
        ],
        tip:"Even 5 contacts is enough to start. The more you add, the better the agent personalisation."
      },
      {
        title:"Run your first Orchestrator session",
        steps:[
          {n:"1", text:"Go to /orchestrator → type your goal in plain English"},
          {n:"2", text:"Example: 'Get 5 paying customers at $99/mo within 30 days targeting Dallas HVAC contractors'"},
          {n:"3", text:"Click 'Run orchestrator' — all 18 agents analyse in parallel (takes 15–30 seconds)"},
          {n:"4", text:"Read the unified plan. Execute Priority 1 today. Don't wait for perfect."},
        ],
        tip:"State your goal as an outcome with a number and a deadline. 'Help me grow' is not a goal. '10 customers by month-end' is."
      },
    ]
  },
  {
    id:"niche", icon:"🎯", title:"SIXXAB Niche Selector",
    color:"#378ADD", tag:"Step 1 — Validate",
    summary:"Validate your business niche before investing time or money. Get viability score, market size and pricing benchmarks for any industry in any location.",
    sections:[
      {
        title:"When to use it",
        steps:[
          {n:"→", text:"Before starting any new business or product — takes 90 seconds, saves months of wasted effort"},
          {n:"→", text:"When pivoting — test the new niche before killing the old one"},
          {n:"→", text:"When expanding to a new location or market — validate Dallas vs Houston vs Austin"},
          {n:"→", text:"When a client asks you to serve a new vertical — check the numbers first"},
        ],
        tip:"The viability score is an AI assessment based on market size, competition and your inputs. 75+ = pursue it. 55–74 = pursue with specific adjustments. Below 55 = serious reconsideration needed."
      },
      {
        title:"How to get the most accurate results",
        steps:[
          {n:"1", text:"Select the most specific industry option available — 'HVAC & Air Conditioning' beats 'Home Services'"},
          {n:"2", text:"Use a specific location — 'Dallas, TX' gives better data than 'United States'"},
          {n:"3", text:"Fill in target customer and problem fields — the AI calibrates pricing and competition to your exact positioning"},
          {n:"4", text:"Run it twice with different positioning to compare — e.g. 'residential HVAC' vs 'commercial HVAC'"},
        ],
        tip:"The pricing benchmark shows what the market charges — not what you should charge. Use the SIXXAB Recommendation field which factors in your positioning."
      },
      {
        title:"After validation — next steps",
        steps:[
          {n:"1", text:"Score 75+: Go to Orchestrator and set 'Get first 5 customers' as your Week 1 goal"},
          {n:"2", text:"Score 55–74: Review the competition section. Pick one differentiator and refine your positioning"},
          {n:"3", text:"Score below 55: Read the risks section carefully. Consider the adjacent niche options"},
          {n:"4", text:"All scores: Book a discovery call with Sunil — 20 minutes to turn the analysis into a specific plan"},
        ],
        tip:"Save your validation results — take a screenshot or copy the key numbers. You will reference them when setting Orchestrator goals."
      },
    ]
  },
  {
    id:"orchestrator", icon:"👑", title:"Founder Enterprise Orchestrator",
    color:"#EF9F27", tag:"Step 2 — Launch",
    summary:"Set one goal. 18 AI agents run in parallel. One unified action plan returned. This is your Monday morning ritual.",
    sections:[
      {
        title:"The weekly Orchestrator rhythm",
        steps:[
          {n:"Mon", text:"Open /orchestrator. Update your goal based on last week's results. Run all agents. Review unified plan."},
          {n:"Tue", text:"Execute Priority 1. The marketing agent scripts go out. The content posts go live."},
          {n:"Wed", text:"Run demo calls using the Sales agent close script. Reply to all DMs within 1 hour."},
          {n:"Thu", text:"Follow up proposals. Handle any support. Check pipeline in SIXXAB CRM."},
          {n:"Fri", text:"Review metrics. Update the Orchestrator goal for Monday. Screenshot any wins."},
        ],
        tip:"Run the Orchestrator before you check email. The plan tells you what matters. Email tells you what other people think matters."
      },
      {
        title:"Writing goals that produce great plans",
        steps:[
          {n:"✓", text:"'Get 10 paying customers at $99/mo targeting Dallas HVAC contractors within 30 days'"},
          {n:"✓", text:"'Scale from current revenue to $10k MRR within 90 days using LinkedIn and referrals'"},
          {n:"✓", text:"'Hire a customer success manager within 60 days at under $4k/month'"},
          {n:"✗", text:"'Help me grow my business' — too vague, no number, no deadline, no market"},
          {n:"✗", text:"'Make more money' — the AI cannot calibrate without specifics"},
        ],
        tip:"Include: what (the outcome), how much (a specific number), by when (a deadline), and where (your market or niche). Four elements = great plan."
      },
      {
        title:"Understanding the unified plan output",
        steps:[
          {n:"1", text:"Goal viability — whether the goal is achievable and confidence percentage. If below 70%, the plan explains what to adjust."},
          {n:"2", text:"Priority 1, 2, 3 — ranked by impact. Do Priority 1 today, Priority 2 this week, Priority 3 this month."},
          {n:"3", text:"First action today — the single most important thing to do in the next 2 hours."},
          {n:"4", text:"Biggest risk — the one thing most likely to derail you. Read this carefully every week."},
          {n:"5", text:"30-day milestone — how to know you are on track. Check this against your CRM data on Friday."},
        ],
        tip:"Click each CXO advisor card to expand their full analysis. The CEO card has the strategic view. The CFO card has the financial model. Each is worth reading once per week."
      },
    ]
  },
  {
    id:"cxo", icon:"💼", title:"SIXXAB CXO Suite",
    color:"#7C3AED", tag:"Step 3 — Optimise",
    summary:"Seven CXO advisors — CEO, CMO, CFO, COO, CTO, CDO, CHRO — each with AI chat, KPI dashboard and 18 specialist agents underneath.",
    sections:[
      {
        title:"Which CXO to use for what",
        steps:[
          {n:"CEO", text:"Strategy, investor readiness, 48-hour sprint execution, team culture, revenue model decisions"},
          {n:"CMO", text:"Channel selection, content calendar, Product Hunt, AppSumo, brand positioning, lead generation"},
          {n:"CSO", text:"Sales pipeline, demo scripts, proposal writing, objection handling, upsell strategy"},
          {n:"CFO", text:"MRR tracking, unit economics (LTV/CAC), burn rate, Stripe reconciliation, fundraising model"},
          {n:"COO", text:"Customer onboarding, support tickets, churn reduction, process automation, SOP builder"},
          {n:"CDO", text:"Funnel analytics, activation rate, cohort retention, product usage data, A/B test design"},
          {n:"CHRO", text:"Job descriptions, interview scripts, onboarding checklists, team culture, performance frameworks"},
        ],
        tip:"Start with CEO for direction, then go deep into whichever CXO owns your current bottleneck. If you're losing customers, that is COO. If you can't acquire customers, that is CMO + CSO."
      },
      {
        title:"Using the CXO chat effectively",
        steps:[
          {n:"1", text:"Each CXO has a chat panel — ask specific questions about your business, not general questions"},
          {n:"2", text:"Good: 'I have 10 customers at $99/mo and 20% monthly churn. What is the highest-leverage retention action this week?'"},
          {n:"3", text:"Bad: 'How do I grow my business?' — too broad for the AI to calibrate an answer"},
          {n:"4", text:"Share your real numbers — MRR, churn rate, CAC, conversion rate. The more data you give, the better the advice"},
        ],
        tip:"The CXO advisors work best when you treat them like real executives. Give them context, share the problem, ask for a specific recommendation."
      },
      {
        title:"CRM data flows into the CXO Suite",
        steps:[
          {n:"1", text:"Contacts you add to SIXXAB CRM automatically appear in the Marketing agent's outreach list"},
          {n:"2", text:"Pipeline stages in CRM feed the CSO's sales pipeline view — no manual data entry"},
          {n:"3", text:"Contact notes from CRM are used by all agents to personalise scripts for that specific person"},
          {n:"4", text:"Hot leads (score 80+) appear in the COO's daily action list automatically"},
        ],
        tip:"Keep your SIXXAB CRM updated daily. 5 minutes of CRM updates at the end of each day makes every agent dramatically more useful."
      },
    ]
  },
  {
    id:"crm", icon:"📋", title:"SIXXAB CRM",
    color:"#1D9E75", tag:"Step 4 — Scale",
    summary:"Full contact management, LinkedIn import, pipeline tracking and AI script generation — all in one place, shared across every agent.",
    sections:[
      {
        title:"Import your LinkedIn contacts",
        steps:[
          {n:"1", text:"Go to /crm → click 'Import from LinkedIn'"},
          {n:"2", text:"Paste method: Open any LinkedIn profile → Ctrl+A (select all) → Ctrl+C (copy) → paste into SIXXAB"},
          {n:"3", text:"CSV method: Export from LinkedIn Sales Navigator, HubSpot, or any CRM → upload CSV file"},
          {n:"4", text:"Manual: Use the 'Add manually' tab for single contacts — fill in name, LinkedIn URL, role, company"},
          {n:"5", text:"Preview all detected contacts before importing — remove any duplicates or incorrect parses"},
        ],
        tip:"Start with your warm network — people you know or have met. These will always convert better than cold contacts."
      },
      {
        title:"Using the pipeline view",
        steps:[
          {n:"1", text:"Switch to 'Pipeline' view in the top tabs — shows all contacts as Kanban cards by stage"},
          {n:"2", text:"Stages: Prospect → Outreach → Replied → Demo → Proposal → Negotiation → Closed ✓ → Lost"},
          {n:"3", text:"Click any contact card to open their full record — notes, activity log, AI scripts tab"},
          {n:"4", text:"The CRM MRR figure in the stats bar calculates potential revenue from all contacts by their plan value"},
        ],
        tip:"Move contacts through stages the same day something happens. A stale pipeline is worse than no pipeline — it gives false confidence."
      },
      {
        title:"Generating AI scripts for contacts",
        steps:[
          {n:"1", text:"Open any contact → go to 'AI Scripts' tab"},
          {n:"2", text:"Choose script type: LinkedIn DM, Email, WhatsApp, X DM, Cold call opener or Follow-up"},
          {n:"3", text:"The AI uses their name, role, company, stage and notes to personalise the script"},
          {n:"4", text:"Click Copy → paste directly into LinkedIn, your email client or WhatsApp"},
          {n:"5", text:"Better notes = better scripts. Add what you know about their pain points to the notes field"},
        ],
        tip:"Log every interaction in the Activity tab. The more history the AI has, the more specifically it can tailor follow-ups."
      },
    ]
  },
  {
    id:"verticals", icon:"🏭", title:"Vertical Agent Packs",
    color:"#EC4899", tag:"Step 5 — Specialise",
    summary:"10 industry-specific agent configurations for HVAC, Real Estate, Legal, Consulting and 6 more Texas markets — pre-built language, workflows and scripts.",
    sections:[
      {
        title:"Which vertical pack to use",
        steps:[
          {n:"→", text:"HVAC & Air Conditioning — seasonal campaigns, service quotes, technician scheduling"},
          {n:"→", text:"Real Estate & Property — listing descriptions, buyer/seller outreach, open house follow-ups"},
          {n:"→", text:"Legal Services — intake forms, retainer proposals, billing reminders, referral network"},
          {n:"→", text:"Business Consulting — proposals, ROI calculator, case studies, LinkedIn thought leadership"},
          {n:"→", text:"Landscaping — seasonal campaigns, HOA outreach, neighbour scripts, annual contracts"},
          {n:"→", text:"Plumbing/Electrical — emergency response, maintenance upsell, insurance documentation"},
          {n:"→", text:"Auto Repair — service reminders, fleet outreach, loyalty programme, review requests"},
          {n:"→", text:"Health & Wellness — onboarding, package upsell, corporate wellness, referral flywheel"},
          {n:"→", text:"Roofing — storm campaigns, insurance claims, estimate scripts, subcontractor network"},
          {n:"→", text:"IT Support/MSP — managed services proposals, QBR decks, security audits, onboarding checklists"},
        ],
        tip:"If you serve multiple industries, start with the vertical pack that matches your largest or most profitable client type."
      },
      {
        title:"Running vertical workflows",
        steps:[
          {n:"1", text:"Go to /verticals → select your industry tab → click the Workflow tab"},
          {n:"2", text:"Follow the 4-step workflow for your vertical — each step links to the right SIXXAB tool"},
          {n:"3", text:"The Orchestrator understands your vertical context — mention your industry in every goal"},
          {n:"4", text:"Example goal: 'Book 10 HVAC maintenance contracts using the LinkedIn and email agents this week'"},
        ],
        tip:"Mention your industry in every Orchestrator goal. 'Get 10 customers' gives generic advice. 'Get 10 HVAC residential maintenance contracts in DFW' gives vertical-specific plans."
      },
    ]
  },
  {
    id:"roadmap", icon:"🗺️", title:"12-Month Roadmap",
    color:"#F59E0B", tag:"See the big picture",
    summary:"The three-phase journey from launch to $1M ARR — every milestone, feature and team hire mapped out. Track your progress week by week.",
    sections:[
      {
        title:"The three phases",
        steps:[
          {n:"Phase 1", text:"Months 1–3 — Validate and Launch. Target: $10k MRR, 100 customers, NPS 70+. Solo founder + 18 agents. No hires."},
          {n:"Phase 2", text:"Months 4–8 — Optimise and Scale. Target: $100k ARR, 1,000 customers, 3 global markets. First 2 hires at Month 4 and 6."},
          {n:"Phase 3", text:"Months 9–12 — Autonomous Global. Target: $1M ARR, 5,000 customers, 20 countries. Platform runs <2hrs/day founder time."},
        ],
        tip:"Most founders try to skip Phase 1 and jump to scale. The roadmap is specifically designed to build the validation and systems foundation before scaling. Trust the sequence."
      },
      {
        title:"Using the interactive checklist",
        steps:[
          {n:"1", text:"Go to /roadmap → select the phase you are in"},
          {n:"2", text:"Click each milestone checkbox to mark it complete — the phase progress bar updates in real time"},
          {n:"3", text:"Items marked 'shipped' are already built into the platform — tick them immediately"},
          {n:"4", text:"Items without a tick are your current targets — bring them into your Orchestrator as weekly goals"},
        ],
        tip:"The roadmap is a reference, not a constraint. If you are ahead of schedule, skip forward. If behind, look at what is blocking you and bring it to the Orchestrator."
      },
    ]
  },
]

export default function RunbookPage() {
  const [activeChapter, setActiveChapter] = useState("start")
  const [openSections, setOpenSections] = useState({})

  const chapter = CHAPTERS.find(c=>c.id===activeChapter) || CHAPTERS[0]

  function toggleSection(idx) {
    setOpenSections(s=>({...s,[`${activeChapter}-${idx}`]:!s[`${activeChapter}-${idx}`]}))
  }

  return (
    <>
      <Head>
        <title>SIXXAB AI — Platform Runbook</title>
        <meta name="description" content="Complete guide to using every SIXXAB AI module — Orchestrator, CXO Suite, CRM, Niche Selector, Verticals and Roadmap."/>
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;color:${N};min-height:100vh}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .3s ease both}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        a{text-decoration:none}
      `}</style>

      {/* Nav — no auth required for runbook */}
      <nav style={{background:N,padding:"0 4%",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.07)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:8}}>
          <svg width="20" height="20" viewBox="0 0 72 72"><rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/><text x="7" y="54" fontFamily="Georgia" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text><text x="35" y="54" fontFamily="Georgia" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text></svg>
          <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:CHALK,letterSpacing:1}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB <span style={{fontSize:9,color:"rgba(245,245,240,.4)",letterSpacing:2}}>AI</span></div>
        </a>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontFamily:"'DM Mono'",fontSize:10,color:AMBER,letterSpacing:".1em"}}>PLATFORM RUNBOOK</span>
          <a href="/" style={{fontSize:11,color:"rgba(255,255,255,.4)",border:"0.5px solid rgba(255,255,255,.1)",padding:"3px 9px",borderRadius:6,display:"flex",alignItems:"center",gap:4}}>
            <i className="ti ti-home" style={{fontSize:11}} aria-hidden="true"/>Home
          </a>
          <a href="/login" style={{padding:"4px 14px",borderRadius:7,background:AMBER,color:N,fontSize:11,fontWeight:600}}>Login →</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{background:N,padding:"32px 4% 28px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:8}}>SIXXAB AI — Autonomous Business Platform</div>
          <h1 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(28px,5vw,52px)",color:CHALK,letterSpacing:1.5,marginBottom:10}}>Platform Runbook</h1>
          <p style={{fontSize:14,color:"rgba(245,245,240,.55)",lineHeight:1.7,maxWidth:600}}>
            Step-by-step guide to every SIXXAB AI module. Read this once before your first session. Refer back whenever you get stuck. The platform follows the same sequence every time — Validate → Launch → Optimise → Scale → Global.
          </p>
        </div>
      </div>

      <div style={{maxWidth:1080,margin:"0 auto",padding:"24px 20px 60px",display:"grid",gridTemplateColumns:"220px 1fr",gap:20,alignItems:"start"}}>

        {/* Sidebar */}
        <div style={{position:"sticky",top:72}}>
          <div className="card" style={{overflow:"hidden"}}>
            <div style={{padding:"10px 14px",background:"#FAFAFA",borderBottom:"1px solid #E8ECF4",fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em"}}>Contents</div>
            {CHAPTERS.map(c=>(
              <button key={c.id} onClick={()=>setActiveChapter(c.id)}
                style={{width:"100%",padding:"10px 14px",border:"none",background:activeChapter===c.id?`${c.color}08`:"transparent",borderLeft:activeChapter===c.id?`3px solid ${c.color}`:"3px solid transparent",cursor:"pointer",textAlign:"left",fontFamily:"inherit",display:"flex",alignItems:"flex-start",gap:8,borderBottom:"1px solid #F1F5F9",transition:"all .15s"}}>
                <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{c.icon}</span>
                <div>
                  <div style={{fontSize:11,fontWeight:500,color:activeChapter===c.id?N:"#64748B",lineHeight:1.3}}>{c.title}</div>
                  <div style={{fontSize:9.5,color:activeChapter===c.id?c.color:"#94A3B8",marginTop:2}}>{c.tag}</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{background:N,borderRadius:13,padding:14,marginTop:12}}>
            <div style={{fontSize:11.5,fontWeight:600,color:CHALK,marginBottom:8}}>Ready to start?</div>
            <a href="/login" style={{display:"block",padding:"9px",borderRadius:8,background:AMBER,color:N,fontSize:12,fontWeight:600,textAlign:"center",marginBottom:7}}>Create account →</a>
            <a href="/niche-validator" style={{display:"block",padding:"9px",borderRadius:8,border:"1px solid rgba(255,255,255,.15)",color:CHALK,fontSize:12,textAlign:"center",marginBottom:7}}>🎯 Validate niche free</a>
            <a href="/discovery" style={{display:"block",padding:"9px",borderRadius:8,border:"1px solid rgba(255,255,255,.15)",color:"rgba(245,245,240,.6)",fontSize:12,textAlign:"center"}}>📅 Book strategy call</a>
          </div>
        </div>

        {/* Main content */}
        <div className="fu" key={activeChapter}>
          {/* Chapter header */}
          <div className="card" style={{marginBottom:16,border:`2px solid ${chapter.color}44`}}>
            <div style={{background:N,padding:"20px 24px",display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:52,height:52,borderRadius:13,background:`${chapter.color}22`,border:`2px solid ${chapter.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{chapter.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:700,color:chapter.color,letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>{chapter.tag}</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:CHALK,letterSpacing:1}}>{chapter.title}</div>
              </div>
            </div>
            <div style={{padding:"12px 20px",background:`${chapter.color}08`,borderTop:`1px solid ${chapter.color}22`}}>
              <p style={{fontSize:13.5,color:"#475569",lineHeight:1.7}}>{chapter.summary}</p>
            </div>
          </div>

          {/* Sections */}
          {chapter.sections.map((section, idx)=>{
            const key=`${activeChapter}-${idx}`
            const open = openSections[key]!==false // default open
            return (
              <div key={idx} className="card" style={{marginBottom:12}}>
                <button onClick={()=>toggleSection(idx)} style={{width:"100%",padding:"14px 18px",border:"none",background:"#FAFAFA",cursor:"pointer",textAlign:"left",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:open?"1px solid #E8ECF4":"none"}}>
                  <div style={{fontSize:14,fontWeight:600,color:N}}>{section.title}</div>
                  <span style={{fontSize:18,color:"#94A3B8",transition:"transform .15s",display:"inline-block",transform:open?"rotate(180deg)":"rotate(0)"}}>▾</span>
                </button>
                {open!==false&&(
                  <div style={{padding:"16px 20px"}}>
                    {section.steps.map((step,si)=>(
                      <div key={si} style={{display:"flex",gap:11,marginBottom:12,alignItems:"flex-start"}}>
                        <div style={{minWidth:28,height:28,borderRadius:"50%",background:`${chapter.color}15`,border:`1.5px solid ${chapter.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10.5,fontWeight:700,color:chapter.color,flexShrink:0}}>
                          {step.n}
                        </div>
                        <div style={{fontSize:13.5,color:N,lineHeight:1.65,paddingTop:4}}>{step.text}</div>
                      </div>
                    ))}
                    {section.tip && (
                      <div style={{marginTop:14,padding:"11px 14px",background:"#FFFBF2",border:"1px solid rgba(239,159,39,.35)",borderRadius:9,fontSize:12.5,color:"#633806",lineHeight:1.65}}>
                        💡 <strong>Pro tip:</strong> {section.tip}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Chapter nav */}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            {CHAPTERS.findIndex(c=>c.id===activeChapter) > 0 ? (
              <button onClick={()=>setActiveChapter(CHAPTERS[CHAPTERS.findIndex(c=>c.id===activeChapter)-1].id)}
                style={{padding:"9px 18px",borderRadius:9,border:"1px solid #E2E8F0",background:"#fff",fontSize:13,fontWeight:500,color:"#64748B",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
                ← {CHAPTERS[CHAPTERS.findIndex(c=>c.id===activeChapter)-1].title}
              </button>
            ):<div/>}
            {CHAPTERS.findIndex(c=>c.id===activeChapter) < CHAPTERS.length-1 ? (
              <button onClick={()=>setActiveChapter(CHAPTERS[CHAPTERS.findIndex(c=>c.id===activeChapter)+1].id)}
                style={{padding:"9px 18px",borderRadius:9,background:chapter.color,color:chapter.color===AMBER?N:"#fff",fontSize:13,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
                {CHAPTERS[CHAPTERS.findIndex(c=>c.id===activeChapter)+1].title} →
              </button>
            ):(
              <a href="/login" style={{padding:"9px 18px",borderRadius:9,background:AMBER,color:N,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                Start using SIXXAB AI →
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
