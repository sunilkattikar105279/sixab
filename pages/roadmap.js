// pages/roadmap.js
// SIXXAB 12-Month Autonomous Startup Roadmap
// Phase 1: Launch (months 1-3) · Phase 2: Scale (months 4-8) · Phase 3: Global (months 9-12)
import { useState } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

const PHASES = [
  {
    id: 1, label: "Phase 1", title: "Autonomous Launch",
    months: "Months 1–3", color: "#EF9F27", bg: "#FFFBF2",
    target: "First $10k MRR · 100 customers · Product-market fit",
    tagline: "Prove the model. Get paying customers. Systemise the basics.",
    milestones: [
      { month: 1, title: "Foundation & first revenue", items: [
        { done: true,  text: "SIXXAB platform live at startupsinabox.com" },
        { done: true,  text: "Login + auth system (email, mobile, Google, Apple)" },
        { done: true,  text: "Pricing $99/$199/$350 with 50% founding discount" },
        { done: true,  text: "Discovery call + contact pages live" },
        { done: true,  text: "AI coach + multi-agent hub deployed" },
        { done: false, text: "Orchestrator page live at /orchestrator" },
        { done: false, text: "First 10 paying customers closed" },
        { done: false, text: "Email marketing automation (Resend) live" },
      ]},
      { month: 2, title: "Growth engine activated", items: [
        { done: false, text: "LinkedIn content flywheel — 1 post/day" },
        { done: false, text: "Product Hunt launch (aim Top 5 on launch day)" },
        { done: false, text: "AppSumo application submitted" },
        { done: false, text: "Referral programme — 20% commission for sharers" },
        { done: false, text: "50 paying customers · $5k MRR" },
        { done: false, text: "Indie Hackers 'Show IH' post — milestone update" },
        { done: false, text: "First 3 customer testimonials + video case studies" },
        { done: false, text: "Dallas founder community presence (DEC, Capital Factory)" },
      ]},
      { month: 3, title: "Product-market fit validation", items: [
        { done: false, text: "100 paying customers · $10k MRR" },
        { done: false, text: "NPS survey sent to all customers — target 70+" },
        { done: false, text: "Churn below 3% — retention systems live" },
        { done: false, text: "AppSumo campaign live — target $50k revenue" },
        { done: false, text: "Supabase auth migration (persistent sessions)" },
        { done: false, text: "Founder success stories — 3 documented revenue wins" },
        { done: false, text: "Phase 2 roadmap locked based on customer feedback" },
      ]},
    ],
    newFeatures: [
      "/orchestrator — Founder Enterprise Orchestrator",
      "/roadmap — This 12-month launch tracker",
      "/api/orchestrator — AI goal decomposition endpoint",
      "Supabase auth (persistent login across deploys)",
      "Stripe webhook → automatic plan upgrade/downgrade",
      "Weekly MRR email digest to founder (Sunil)",
    ],
  },
  {
    id: 2, label: "Phase 2", title: "Autonomous Scale",
    months: "Months 4–8", color: "#1D9E75", bg: "#F0FDF4",
    target: "$100k ARR · 1,000 customers · Global reach in 5 markets",
    tagline: "Automate acquisition. Systemise operations. Expand globally.",
    milestones: [
      { month: 4, title: "Automation infrastructure", items: [
        { done: false, text: "AI-generated weekly content published automatically" },
        { done: false, text: "Automated email drip sequences (onboarding, upgrade, win-back)" },
        { done: false, text: "Live dashboard: MRR, churn, CAC, LTV (admin at /admin)" },
        { done: false, text: "Stripe webhooks → Resend → customer lifecycle emails" },
        { done: false, text: "250 customers · $25k MRR" },
        { done: false, text: "First enterprise customer — agency or accelerator" },
      ]},
      { month: 5, title: "Franchise model launch", items: [
        { done: false, text: "SIXXAB Advisor programme — application page live" },
        { done: false, text: "10 trained SIXXAB Advisors in Dallas, London, Mumbai" },
        { done: false, text: "Revenue share system — 20% to advisors, 80% SIXXAB" },
        { done: false, text: "500 customers · $50k MRR" },
        { done: false, text: "Second Product Hunt launch (agents update)" },
        { done: false, text: "Press coverage — 3 startup media features" },
      ]},
      { month: 6, title: "Global market entry", items: [
        { done: false, text: "India market launch — LinkedIn India + IIM networks" },
        { done: false, text: "UK market launch — Startup Grind London + Twitter" },
        { done: false, text: "Australia market — Startmate community" },
        { done: false, text: "Localised pricing (INR, GBP, AUD)" },
        { done: false, text: "750 customers · $75k MRR" },
        { done: false, text: "First global cohort — 50 founders across 5 countries" },
      ]},
      { month: 7, title: "Enterprise & white-label", items: [
        { done: false, text: "White-label platform for accelerators/incubators" },
        { done: false, text: "First 3 enterprise contracts signed ($5k–$15k/year each)" },
        { done: false, text: "API open access — developers building on SIXXAB" },
        { done: false, text: "1,000 customers · $100k MRR approaching" },
        { done: false, text: "Team hire — 1 customer success + 1 growth marketer" },
      ]},
      { month: 8, title: "$100k ARR milestone", items: [
        { done: false, text: "$100k ARR achieved — announce publicly" },
        { done: false, text: "1,200 customers across 10+ countries" },
        { done: false, text: "NPS maintained above 65 at scale" },
        { done: false, text: "Seed funding round preparation begins" },
        { done: false, text: "Phase 3 architecture designed" },
      ]},
    ],
    newFeatures: [
      "/admin — Real-time MRR and customer dashboard",
      "/advisor — SIXXAB Advisor programme portal",
      "/api/lifecycle — Automated customer lifecycle webhooks",
      "/enterprise — White-label enquiry and onboarding",
      "Multi-currency Stripe (INR, GBP, AUD)",
      "Automated weekly MRR digest to Sunil",
      "AI-generated social posts (no manual input needed)",
    ],
  },
  {
    id: 3, label: "Phase 3", title: "Autonomous Global",
    months: "Months 9–12", color: "#7C3AED", bg: "#F5F3FF",
    target: "$1M ARR · 5,000 customers · 20 countries · Seed round closed",
    tagline: "The platform runs itself. You set the vision. AI executes.",
    milestones: [
      { month: 9, title: "Autonomous operations", items: [
        { done: false, text: "Platform fully autonomous — <2hrs founder/day" },
        { done: false, text: "AI auto-generates all content, outreach and follow-ups" },
        { done: false, text: "Self-healing support — AI resolves 80% of tickets" },
        { done: false, text: "2,000 customers · $200k MRR" },
        { done: false, text: "Seed round closed — $500k–$2M" },
        { done: false, text: "5-person team — eng, marketing, success, ops, sales" },
      ]},
      { month: 10, title: "Platform ecosystem", items: [
        { done: false, text: "SIXXAB App Store — third-party agents and integrations" },
        { done: false, text: "100+ enterprise customers (accelerators, universities, corps)" },
        { done: false, text: "Developer API — 50+ builders building on SIXXAB" },
        { done: false, text: "3,000 customers · $300k MRR" },
        { done: false, text: "Strategic partnerships — Stripe, Anthropic, Calendly" },
      ]},
      { month: 11, title: "Market leadership", items: [
        { done: false, text: "Recognised as #1 AI startup platform globally" },
        { done: false, text: "Forbes / TechCrunch feature" },
        { done: false, text: "4,000 customers · 20 countries · $400k MRR" },
        { done: false, text: "Series A preparation — target $5M–$10M" },
        { done: false, text: "University programme — 20 universities licensed" },
      ]},
      { month: 12, title: "Year 1 complete — $1M ARR", items: [
        { done: false, text: "$1M ARR — announce on all channels" },
        { done: false, text: "5,000 customers across 20+ countries" },
        { done: false, text: "Autonomous startup model proven at scale" },
        { done: false, text: "Year 2 roadmap — Series A, product v2, 10 new markets" },
        { done: false, text: "Community of 10,000+ founders in the SIXXAB ecosystem" },
      ]},
    ],
    newFeatures: [
      "/app-store — SIXXAB agent marketplace",
      "/api/v2 — Public API for third-party builders",
      "/university — University programme portal",
      "Autonomous content engine — zero manual posts",
      "AI sales SDR — outbound without founder input",
      "Self-healing support — 80% AI ticket resolution",
      "Multi-region deployment (US, EU, APAC)",
    ],
  },
]

export default function RoadmapPage() {
  const [activePhase, setActivePhase] = useState(1)
  const [openMonth, setOpenMonth] = useState(1)
  const [completedItems, setCompletedItems] = useState({})

  const phase = PHASES.find(p => p.id === activePhase)

  function toggleItem(key) {
    setCompletedItems(s => ({ ...s, [key]: !s[key] }))
  }

  const totalItems = phase.milestones.reduce((a, m) => a + m.items.length, 0)
  const doneItems = phase.milestones.reduce((a, m) =>
    a + m.items.filter((item, i) => item.done || completedItems[`${activePhase}-${m.month}-${i}`]).length, 0)
  const pct = Math.round((doneItems / totalItems) * 100)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;color:${N};min-height:100vh}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fadeUp{animation:fadeUp .35s ease both}
        .card{background:#fff;border-radius:14px;border:1px solid #E2E8F0;overflow:hidden}
        .check-row{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:0.5px solid #F1F5F9;cursor:pointer}
        .check-row:last-child{border-bottom:none}
        .check-row:hover{opacity:.85}
      `}</style>

      {/* Nav */}
      <nav style={{background:N,padding:"0 5%",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <svg width="22" height="22" viewBox="0 0 72 72"><rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/><text x="7" y="54" fontFamily="Georgia" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text><text x="35" y="54" fontFamily="Georgia" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text></svg>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:CHALK,letterSpacing:2}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
          <span style={{fontFamily:"'DM Mono'",fontSize:10,color:AMBER,letterSpacing:".08em",marginLeft:4}}>roadmap</span>
        </div>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          {[["/orchestrator","Orchestrator"],["/agents","Agents"],["/","Home"]].map(([h,l]) => (
            <a key={l} href={h} style={{fontSize:13,color:"rgba(255,255,255,.5)",textDecoration:"none"}}>{l}</a>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <div style={{background:N,padding:"36px 5% 28px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,border:"1px solid rgba(239,159,39,.35)",background:"rgba(239,159,39,.1)",fontSize:12,fontWeight:500,color:AMBER,marginBottom:16}}>
          12-month autonomous startup roadmap
        </div>
        <h1 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(32px,5vw,64px)",color:CHALK,letterSpacing:1.5,marginBottom:12,lineHeight:1}}>
          From launch to <span style={{color:AMBER}}>$1M ARR</span>
        </h1>
        <p style={{fontSize:15,color:"rgba(245,245,240,.55)",maxWidth:480,margin:"0 auto",lineHeight:1.7}}>
          Three phases. 12 months. Zero guesswork. Every milestone, feature and target mapped out — with the orchestrator running all agents toward each goal.
        </p>
      </div>

      {/* Phase selector */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"16px 5%",display:"flex",gap:12,overflowX:"auto"}}>
        {PHASES.map(p => (
          <button key={p.id} onClick={() => { setActivePhase(p.id); setOpenMonth(p.milestones[0].month) }}
            style={{padding:"10px 20px",borderRadius:10,border:`2px solid ${activePhase===p.id?p.color:"#E2E8F0"}`,background:activePhase===p.id?p.bg:"#fff",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",whiteSpace:"nowrap",transition:"all .15s"}}>
            <div style={{fontSize:11,fontWeight:600,color:activePhase===p.id?p.color:"#94A3B8",letterSpacing:".07em",textTransform:"uppercase"}}>{p.label} · {p.months}</div>
            <div style={{fontSize:13,fontWeight:500,color:activePhase===p.id?N:"#64748B",marginTop:2}}>{p.title}</div>
          </button>
        ))}
      </div>

      <div style={{maxWidth:1060,margin:"0 auto",padding:"24px 20px 60px"}}>

        {/* Phase header */}
        <div className="card fadeUp" style={{marginBottom:20,border:`2px solid ${phase.color}`}}>
          <div style={{background:N,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontFamily:"'DM Mono'",fontSize:11,color:phase.color,letterSpacing:".08em",marginBottom:6}}>{phase.label} · {phase.months}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:CHALK,letterSpacing:1}}>{phase.title}</div>
              <div style={{fontSize:13,color:"rgba(245,245,240,.55)",marginTop:4}}>{phase.tagline}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:36,color:phase.color,letterSpacing:1}}>{pct}%</div>
              <div style={{fontSize:11,color:"rgba(245,245,240,.4)"}}>phase complete</div>
              <div style={{width:120,height:4,background:"rgba(255,255,255,.1)",borderRadius:2,marginTop:6,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:phase.color,borderRadius:2,transition:"width .4s"}}/>
              </div>
            </div>
          </div>
          <div style={{padding:"12px 20px",background:phase.bg,borderTop:"1px solid #E8ECF4"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#64748B",marginBottom:3}}>Target</div>
            <div style={{fontSize:14,fontWeight:500,color:N}}>{phase.target}</div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16,alignItems:"start"}}>

          {/* Milestones */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {phase.milestones.map(m => {
              const isOpen = openMonth === m.month
              const mDone = m.items.filter((item, i) => item.done || completedItems[`${activePhase}-${m.month}-${i}`]).length
              const mTotal = m.items.length
              const mPct = Math.round((mDone / mTotal) * 100)
              return (
                <div key={m.month} className="card">
                  <div style={{padding:"13px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,background:isOpen?"#FAFAFA":"#fff"}} onClick={() => setOpenMonth(isOpen ? null : m.month)}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:mPct===100?phase.color+"22":isOpen?"#F8F9FA":"#F1F5F9",border:`2px solid ${mPct===100?phase.color:isOpen?phase.color+"44":"#E2E8F0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:mPct===100?phase.color:"#94A3B8",flexShrink:0,transition:"all .2s"}}>
                      {mPct===100?"✓":m.month}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:N}}>Month {m.month} — {m.title}</div>
                      <div style={{width:"100%",height:3,background:"#F1F5F9",borderRadius:2,marginTop:5,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${mPct}%`,background:phase.color,borderRadius:2,transition:"width .4s"}}/>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:"#94A3B8",whiteSpace:"nowrap"}}>{mDone}/{mTotal}</div>
                    <div style={{fontSize:13,color:"#CBD5E1"}}>{isOpen?"▲":"▼"}</div>
                  </div>
                  {isOpen && (
                    <div style={{padding:"0 16px 12px",borderTop:"1px solid #F1F5F9"}} className="fadeUp">
                      {m.items.map((item, i) => {
                        const key = `${activePhase}-${m.month}-${i}`
                        const isDone = item.done || completedItems[key]
                        return (
                          <div key={i} className="check-row" onClick={() => !item.done && toggleItem(key)}>
                            <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${isDone?phase.color:"#E2E8F0"}`,background:isDone?phase.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all .15s"}}>
                              {isDone && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <span style={{fontSize:13,color:isDone?"#94A3B8":N,textDecoration:isDone?"line-through":"none",lineHeight:1.5,flex:1}}>{item.text}</span>
                            {item.done && <span style={{fontSize:10,color:phase.color,fontWeight:600,flexShrink:0}}>shipped</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sidebar */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* New features */}
            <div className="card">
              <div style={{padding:"11px 14px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
                <div style={{fontSize:12,fontWeight:500,color:N}}>New features this phase</div>
              </div>
              <div style={{padding:"10px 14px"}}>
                {phase.newFeatures.map((f,i) => (
                  <div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:i<phase.newFeatures.length-1?"1px solid #F8F9FA":"none",alignItems:"flex-start"}}>
                    <span style={{fontSize:10,fontWeight:600,color:phase.color,marginTop:2,flexShrink:0}}>→</span>
                    <span style={{fontSize:12,color:"#64748B",lineHeight:1.5}}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Orchestrator CTA */}
            <div style={{background:N,borderRadius:14,padding:18}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:CHALK,letterSpacing:1,marginBottom:8}}>Run the orchestrator</div>
              <p style={{fontSize:12.5,color:"rgba(245,245,240,.55)",lineHeight:1.65,marginBottom:14}}>Set a goal aligned with this phase and run all 16 agents toward it right now.</p>
              <a href="/orchestrator" style={{display:"block",padding:"10px 16px",borderRadius:9,background:AMBER,color:N,fontSize:13,fontWeight:600,textDecoration:"none",textAlign:"center"}}>
                Open orchestrator →
              </a>
            </div>

            {/* All phases summary */}
            <div className="card">
              <div style={{padding:"11px 14px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
                <div style={{fontSize:12,fontWeight:500,color:N}}>All phases at a glance</div>
              </div>
              <div style={{padding:"10px 14px",display:"flex",flexDirection:"column",gap:8}}>
                {PHASES.map(p => (
                  <div key={p.id} style={{display:"flex",gap:10,alignItems:"center",padding:"7px 10px",borderRadius:8,background:activePhase===p.id?p.bg:"transparent",cursor:"pointer"}} onClick={() => { setActivePhase(p.id); setOpenMonth(p.milestones[0].month) }}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:500,color:N}}>{p.label} — {p.title}</div>
                      <div style={{fontSize:10,color:"#94A3B8"}}>{p.months}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
