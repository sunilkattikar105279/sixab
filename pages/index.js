import { useState, useEffect, useRef } from "react"

// ── PRICING ──────────────────────────────────────────────────────────────────
const TIERS = [
  {
    id:"starter", name:"Starter", price:99, founding:49.50,
    phase:"Phase 1", tagline:"Solo founder launching their first product",
    highlight:false, badge:null,
    features:[
      "Founder Enterprise Orchestrator",
      "AI strategy advisor — 50 sessions/month",
      "7-day autonomous launch sprint",
      "Marketing agent — 20 DM scripts/month",
      "Strategy, Content & Analytics agents",
      "Email support · Cancel anytime",
    ],
  },
  {
    id:"pro", name:"Pro", price:199, founding:99.50,
    phase:"Phase 1 + 2", tagline:"Founders scaling to $10k MRR and beyond",
    highlight:true, badge:"Most Popular",
    features:[
      "Full orchestrator — all 16 agents in parallel",
      "Complete CXO suite (CEO · CMO · CFO · COO · CTO · CISO · CDO · CHRO)",
      "Unlimited AI strategy sessions",
      "Multi-channel outreach — LinkedIn, X, Instagram, WhatsApp, Email, SMS",
      "Live sales pipeline + revenue optimizer",
      "HR + HR Ops agents for team building",
      "1 discovery call/month with Sunil",
      "Priority support — 4hr SLA",
    ],
  },
  {
    id:"agency", name:"Agency", price:350, founding:175,
    phase:"Phase 1, 2 + 3", tagline:"Consultants, agencies and enterprise teams",
    highlight:false, badge:null,
    features:[
      "Everything in Pro — unlimited scale",
      "5 team seats + white-label AI persona",
      "Full autonomous operations suite",
      "API access — build on SIXXAB",
      "SIXXAB Advisor franchise eligibility",
      "Dedicated success manager",
      "Custom onboarding + enterprise SLA",
    ],
  },
]

// ── ORCHESTRATOR DEMO GOALS ───────────────────────────────────────────────────
const GOALS = [
  {
    label:"Launch",
    goal:"Get 10 paying customers at $99/mo within 30 days",
    outputs:[
      {cxo:"CEO", text:"Goal is achievable. Need 40 DMs → 10 demos → 3 closes/week. Confidence: 91%."},
      {cxo:"CMO", text:"LinkedIn first. DFW founders highly active Tue–Thu 9am. Post daily launch content."},
      {cxo:"CSO", text:"Pipeline set: 20 outreach → 8 replies → 4 demos → 2 closes expected Week 1."},
      {cxo:"CFO", text:"CAC: $0 organic · LTV: $1,194 · Payback: immediate. Break-even at 3 customers."},
    ],
    plan:"Send 20 LinkedIn DMs today using the Marketing agent. Run 3 demos this week using the Sales close script. First customer expected within 2.3 days.",
  },
  {
    label:"Scale",
    goal:"Scale from $1k to $10k MRR in 90 days",
    outputs:[
      {cxo:"CEO", text:"Need 51 more Pro subscribers at $99.50. At 28% close rate: 182 DMs over 90 days."},
      {cxo:"CMO", text:"3 channels in parallel: LinkedIn daily posts, AppSumo campaign, referral programme at 20%."},
      {cxo:"CSO", text:"12 Starter→Pro upsell candidates identified. Upgrade offer sent = +$600 MRR immediately."},
      {cxo:"CFO", text:"Month 1: $3.4k · Month 2: $6.8k · Month 3: $10.2k. Path is achievable."},
    ],
    plan:"Launch referral programme today (20% commission). Submit AppSumo application this week. Upsell the 12 identified Starter customers to Pro before the weekend.",
  },
  {
    label:"Hire",
    goal:"Build a 3-person team in 60 days under $20k/month burn",
    outputs:[
      {cxo:"CHRO", text:"Role 1: Growth marketer ($4k/mo). Role 2: Customer success ($3.5k/mo). Role 3: Engineer ($6k/mo)."},
      {cxo:"CFO", text:"Total burn: $13.5k/mo + $5k overheads = $18.5k/mo. Fits constraint at current MRR."},
      {cxo:"COO", text:"Onboarding SOP written. 30/60/90 day plan template ready. Loom walkthrough recorded."},
      {cxo:"CEO", text:"Hire growth marketer first — highest ROI role. Engineer hire after MRR hits $15k."},
    ],
    plan:"Post the growth marketer role on LinkedIn and Wellfound today using the HR agent job description. Interview the top 5 candidates using the CHRO agent script.",
  },
]

// ── PLATFORM CAPABILITIES ─────────────────────────────────────────────────────
const CAPS = [
  {icon:"👑", title:"Enterprise Orchestrator", desc:"Set one goal. All 16 agents run in parallel. One unified action plan returned.", tag:"New"},
  {icon:"🧠", title:"AI Strategy Advisor", desc:"24/7 McKinsey-level advisor. Numbered action plan, not vague advice, in 60 seconds.", tag:"Core"},
  {icon:"📣", title:"Multi-Channel Marketing", desc:"LinkedIn, Instagram, X, WhatsApp, Email, SMS — personalised DMs for each contact.", tag:"Marketing"},
  {icon:"📈", title:"Sales Pipeline", desc:"Lead scoring, hot alerts, demo scripts, proposal templates, close playbooks.", tag:"Sales"},
  {icon:"💰", title:"Finance & Analytics", desc:"Live MRR, Stripe reconciliation, LTV/CAC, 90-day revenue forecasts, burn rate.", tag:"Finance"},
  {icon:"⚙️", title:"Operations Suite", desc:"Support tickets, onboarding sequences, NPS, process automation, SOP builder.", tag:"Ops"},
  {icon:"👥", title:"HR & People Ops", desc:"Hiring pipeline, job descriptions, onboarding checklists, performance frameworks.", tag:"People"},
  {icon:"🔐", title:"Security & Compliance", desc:"API key hygiene, GDPR, PCI-DSS checklists, vulnerability scanning.", tag:"Security"},
]

// ── PHASES ────────────────────────────────────────────────────────────────────
const PHASES = [
  {
    n:"01", label:"Phase 1", title:"Autonomous Launch",
    months:"Months 1–3", target:"$10k MRR · 100 customers",
    color:"#EF9F27", milestones:[
      "Orchestrator coordinates all 16 agents toward your weekly goal",
      "First 10 paying customers via warm outreach",
      "Product Hunt launch + AppSumo application",
      "NPS above 70 · churn below 3%",
    ],
  },
  {
    n:"02", label:"Phase 2", title:"Autonomous Scale",
    months:"Months 4–8", target:"$100k ARR · 1,000 customers",
    color:"#1D9E75", milestones:[
      "SIXXAB Advisor franchise programme — 20% revenue share",
      "Global expansion: UK, India, Australia, Singapore",
      "White-label enterprise deals — accelerators, universities",
      "Seed round preparation and close",
    ],
  },
  {
    n:"03", label:"Phase 3", title:"Autonomous Global",
    months:"Months 9–12", target:"$1M ARR · 5,000 customers · 20 countries",
    color:"#7C3AED", milestones:[
      "Platform fully autonomous — <2 hrs/day founder time",
      "SIXXAB App Store — third-party agents and integrations",
      "100+ enterprise contracts (universities, accelerators, corps)",
      "Series A preparation — target $5M–$10M",
    ],
  },
]

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
const TESTI = [
  {name:"Marcus T.", role:"Solo founder · Dallas", avatar:"MT", quote:"Closed my first $2,400 client on Day 3. The orchestrator told me exactly which agent to use and what to say."},
  {name:"Priya S.", role:"Consultant · Mumbai", avatar:"PS", quote:"Idea to first revenue in 48 hours. I set one goal, 16 agents ran, I got a numbered plan. I just executed."},
  {name:"Jason K.", role:"SaaS founder · London", avatar:"JK", quote:"Hit $5k MRR in 6 weeks. The orchestrator decomposed my scaling goal into tasks I could actually finish in a day."},
  {name:"Angela B.", role:"Agency owner · Dallas", avatar:"AB", quote:"Signed 3 new clients the first week using the outreach scripts. ROI was immediate. We're on Agency plan now."},
  {name:"James P.", role:"E-commerce · Sydney", avatar:"JP", quote:"The CXO command center changed how I think about my business. Having 7 advisors in one tab is genuinely magic."},
  {name:"Ravi M.", role:"Tech founder · Singapore", avatar:"RM", quote:"From idea to Stripe payment in 31 hours. The autonomous launch model is exactly what solo founders need."},
]

const N="#0A0E1A", AMBER="#EF9F27", CHALK="#F5F5F0"

function SXLogo({size=28}) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/>
      <text x="7" y="54" fontFamily="Georgia,serif" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
      <text x="35" y="54" fontFamily="Georgia,serif" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
    </svg>
  )
}

export default function Index() {
  const [scrolled, setScrolled]       = useState(false)
  const [activeGoal, setActiveGoal]   = useState(0)
  const [running, setRunning]         = useState(false)
  const [orchStep, setOrchStep]       = useState(0) // 0=idle,1=decomposing,2=running,3=done
  const [visibleCxo, setVisibleCxo]  = useState([])
  const [showPlan, setShowPlan]       = useState(false)
  const [email, setEmail]             = useState("")
  const [betaDone, setBetaDone]       = useState(false)
  const [betaBusy, setBetaBusy]       = useState(false)
  const [betaErr, setBetaErr]         = useState("")
  const [loading, setLoading]         = useState(false)
  const [selectedTier, setSelectedTier] = useState("")
  const pricingRef  = useRef(null)
  const orchRef     = useRef(null)
  const phaseRef    = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", fn, {passive:true})
    return () => window.removeEventListener("scroll", fn)
  }, [])

  const scrollTo = r => r.current?.scrollIntoView({behavior:"smooth",block:"start"})

  async function handleCheckout(tier) {
    const user = typeof window !== "undefined" && sessionStorage.getItem("sixxab_user")
    if (!user) { window.location.href=`/login?redirect=%2F&plan=${tier.id}`; return }
    setLoading(true); setSelectedTier(tier.id)
    try {
      const r = await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tierId:tier.id})})
      const d = await r.json()
      if (!r.ok||d.error) throw new Error(d.error||"Error")
      window.location.href = d.url
    } catch(e) { alert("Checkout error: "+e.message); setLoading(false) }
  }

  async function handleBeta(e) {
    e.preventDefault(); setBetaErr("")
    if (!email||!email.includes("@")) { setBetaErr("Enter a valid email."); return }
    setBetaBusy(true)
    try {
      const r = await fetch("/api/beta",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})})
      const d = await r.json()
      if (!r.ok) throw new Error(d.error||"Try again.")
      setBetaDone(true)
    } catch(err) { setBetaErr(err.message) }
    finally { setBetaBusy(false) }
  }

  async function runOrchDemo() {
    if (running) return
    setRunning(true); setOrchStep(1); setVisibleCxo([]); setShowPlan(false)
    await new Promise(r => setTimeout(r, 700))
    setOrchStep(2)
    const goal = GOALS[activeGoal]
    for (let i = 0; i < goal.outputs.length; i++) {
      await new Promise(r => setTimeout(r, 600))
      setVisibleCxo(v => [...v, i])
    }
    await new Promise(r => setTimeout(r, 500))
    setOrchStep(3); setShowPlan(true); setRunning(false)
  }

  const goal = GOALS[activeGoal]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Plus Jakarta Sans',sans-serif;color:${N};overflow-x:hidden;background:#fff}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${AMBER};border-radius:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideL{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        .fu{animation:fadeUp .55s ease both}
        .d1{animation-delay:.05s}.d2{animation-delay:.14s}.d3{animation-delay:.23s}.d4{animation-delay:.32s}.d5{animation-delay:.41s}
        .fi{animation:fadeIn .4s ease both}
        .sl{animation:slideL .3s ease both}
        .pulse{animation:pulse 1.8s infinite}
        .btn-a{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 28px;border-radius:11px;background:${AMBER};color:${N};font-size:15px;font-weight:700;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .18s;text-decoration:none}
        .btn-a:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(239,159,39,.38)}
        .btn-g{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:11px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:${CHALK};font-size:15px;font-weight:500;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .18s;text-decoration:none}
        .btn-g:hover{background:rgba(255,255,255,.15)}
        .nav-a{font-size:13px;color:rgba(255,255,255,.58);text-decoration:none;cursor:pointer;transition:color .15s}
        .nav-a:hover{color:#fff}
        .cap-card{background:#fff;border:1px solid #E8ECF4;border-radius:14px;padding:22px;transition:all .2s}
        .cap-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.07);border-color:#CBD5E1}
        .tier{background:#fff;border:1.5px solid #E8ECF4;border-radius:16px;padding:28px 22px;display:flex;flex-direction:column;transition:all .2s;position:relative}
        .tier:hover{transform:translateY(-4px);box-shadow:0 18px 44px rgba(0,0,0,.1)}
        .tier.pop{border:2px solid ${AMBER};background:#FFFBF2}
        .tcard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:22px}
        .check{width:18px;height:18px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;margin-top:2px}
        @media(max-width:860px){.hide-m{display:none!important}.g2{grid-template-columns:1fr!important}.g3{grid-template-columns:1fr!important}.g4{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:60,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5%",background:scrolled?"rgba(10,14,26,.95)":N,backdropFilter:"blur(18px)",transition:"all .3s",borderBottom:scrolled?"1px solid rgba(255,255,255,.07)":"1px solid rgba(255,255,255,.04)"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:9,textDecoration:"none"}}>
          <SXLogo size={28}/>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:CHALK,letterSpacing:2,lineHeight:1}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:8,color:"#5F5E5A",letterSpacing:".14em"}}>startupsinabox.com</div>
          </div>
        </a>
        <div className="hide-m" style={{display:"flex",gap:22,alignItems:"center"}}>
          {[["How it works",()=>scrollTo(orchRef)],["Roadmap",()=>scrollTo(phaseRef)],["Pricing",()=>scrollTo(pricingRef)]].map(([l,fn])=>(
            <a key={l} className="nav-a" onClick={fn}>{l}</a>
          ))}
          <a className="nav-a" href="/orchestrator">Orchestrator</a>
          <a className="nav-a" href="/agents">Agents</a>
          <a className="nav-a" href="/discovery">Book a call</a>
          <button className="btn-a" style={{padding:"8px 18px",fontSize:13}} onClick={()=>scrollTo(pricingRef)}>Get 50% off →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{minHeight:"100vh",background:N,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"120px 5% 80px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(rgba(239,159,39,.12) 1px,transparent 1px)`,backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:800,height:600,background:"radial-gradient(ellipse,rgba(239,159,39,.13) 0%,transparent 68%)",pointerEvents:"none"}}/>

        <div className="fu d1" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,border:"1px solid rgba(239,159,39,.35)",background:"rgba(239,159,39,.1)",fontSize:12,fontWeight:500,color:AMBER,marginBottom:28}}>
          <span className="pulse" style={{width:7,height:7,borderRadius:"50%",background:AMBER,display:"inline-block"}}/>
          The world's first Autonomous Startup Platform · Dallas, TX · Global
        </div>

        <h1 className="fu d2" style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(50px,9vw,108px)",color:CHALK,letterSpacing:1.5,lineHeight:.96,marginBottom:24,maxWidth:980}}>
          Your autonomous<br/>
          <span style={{color:AMBER,WebkitTextStroke:`2px ${AMBER}`,WebkitTextFillColor:"transparent"}}>startup.</span>
          <span style={{color:CHALK}}> Built by AI.</span>
        </h1>

        <p className="fu d3" style={{fontSize:"clamp(15px,2.2vw,19px)",color:"rgba(245,245,240,.62)",maxWidth:620,lineHeight:1.75,marginBottom:20}}>
          Set one goal. The <strong style={{color:CHALK}}>Founder Enterprise Orchestrator</strong> decomposes it across 7 CXO advisors and 16 specialist agents — all running in parallel — and returns one unified action plan. From idea to first revenue in <strong style={{color:CHALK}}>48 hours.</strong>
        </p>

        {/* Phase badges */}
        <div className="fu d3" style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:36}}>
          {PHASES.map(p=>(
            <div key={p.n} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${p.color}44`,background:`${p.color}11`,fontSize:12,fontWeight:500,color:p.color}}>
              {p.label}: {p.target}
            </div>
          ))}
        </div>

        <div className="fu d4" style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginBottom:52}}>
          <button className="btn-a" onClick={()=>scrollTo(pricingRef)}>Start for $49.50/mo →</button>
          <button className="btn-g" onClick={()=>scrollTo(orchRef)}>See the orchestrator ↓</button>
          <a className="btn-g" href="/discovery" style={{borderColor:"rgba(239,159,39,.35)",color:AMBER}}>📅 Free strategy call</a>
        </div>

        <div className="fu d5" style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          {[["247+","founders inside"],["16","AI agents"],["7","CXO advisors"],["2.3 days","avg first revenue"],["3 phases","to $1M ARR"]].map(([v,l],i)=>(
            <div key={i} style={{padding:"7px 16px",borderRadius:20,background:"rgba(255,255,255,.055)",border:"1px solid rgba(255,255,255,.1)",fontSize:13}}>
              <strong style={{color:CHALK}}>{v}</strong>&nbsp;<span style={{color:"rgba(245,245,240,.42)"}}>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CITIES STRIP ── */}
      <div style={{background:"#F8F9FA",borderTop:"1px solid #E8ECF4",borderBottom:"1px solid #E8ECF4",padding:"13px 5%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap",fontSize:13,color:"#64748B"}}>
          <span style={{fontWeight:600,color:N,marginRight:4}}>Founders from:</span>
          {["🇺🇸 Dallas","🇬🇧 London","🇮🇳 Mumbai","🇸🇬 Singapore","🇦🇺 Sydney","🇨🇦 Toronto","🇿🇦 Cape Town","🇦🇪 Dubai"].map((c,i)=>(
            <span key={i} style={{padding:"3px 12px",borderRadius:20,background:"#fff",border:"1px solid #E2E8F0",fontWeight:500,color:"#475569"}}>{c}</span>
          ))}
        </div>
      </div>

      {/* ── ORCHESTRATOR DEMO ── */}
      <section ref={orchRef} style={{padding:"90px 5%",background:"#fff"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>How it works</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,60px)",color:N,letterSpacing:1.5,marginBottom:12}}>
            The orchestrator in action
          </h2>
          <p style={{fontSize:15,color:"#64748B",maxWidth:520,margin:"0 auto",lineHeight:1.7}}>
            Set one goal. Watch all agents run in parallel. Get one unified action plan in seconds.
          </p>
        </div>

        <div style={{maxWidth:900,margin:"0 auto"}}>
          {/* Goal selector */}
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
            {GOALS.map((g,i)=>(
              <button key={i} onClick={()=>{setActiveGoal(i);setOrchStep(0);setVisibleCxo([]);setShowPlan(false);setRunning(false)}}
                style={{padding:"9px 20px",borderRadius:10,border:`2px solid ${activeGoal===i?AMBER:"#E2E8F0"}`,background:activeGoal===i?"#FFFBF2":"#F8F9FA",color:activeGoal===i?N:"#64748B",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",transition:"all .15s"}}>
                {g.label}
              </button>
            ))}
          </div>

          {/* Goal display */}
          <div style={{background:N,borderRadius:16,overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.2)"}}>
            {/* Chrome */}
            <div style={{background:"#1A2035",padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
              {["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{width:11,height:11,borderRadius:"50%",background:c}}/>)}
              <div style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:6,padding:"4px 12px",marginLeft:8,display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:"#1D9E75",display:"inline-block"}} className="pulse"/>
                <span style={{fontFamily:"'DM Mono'",fontSize:11,color:"rgba(255,255,255,.35)"}}>startupsinabox.com/orchestrator</span>
              </div>
            </div>

            <div style={{padding:24}}>
              {/* Goal input area */}
              <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
                <div style={{fontSize:11,fontFamily:"'DM Mono'",color:AMBER,letterSpacing:".07em",marginBottom:8}}>FOUNDER GOAL</div>
                <div style={{fontSize:15,fontWeight:500,color:CHALK,marginBottom:12}}>{goal.goal}</div>
                <button onClick={runOrchDemo} disabled={running}
                  style={{padding:"10px 20px",borderRadius:9,background:running?"rgba(239,159,39,.3)":AMBER,color:N,fontSize:13,fontWeight:700,border:"none",cursor:running?"not-allowed":"pointer",fontFamily:"'Plus Jakarta Sans'",display:"flex",alignItems:"center",gap:7,transition:"all .15s"}}>
                  {running
                    ? <><div style={{width:14,height:14,border:"2px solid rgba(10,14,26,.3)",borderTopColor:N,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Running all agents…</>
                    : orchStep===3 ? "↻ Re-run" : "▶ Run orchestrator →"
                  }
                </button>
              </div>

              {/* CXO outputs */}
              {orchStep >= 2 && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                  {goal.outputs.map((o,i)=>(
                    <div key={i} style={{opacity:visibleCxo.includes(i)?1:0,transform:visibleCxo.includes(i)?"translateY(0)":"translateY(8px)",transition:"all .35s",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"11px 13px"}}>
                      <div style={{fontSize:10,fontWeight:700,color:AMBER,letterSpacing:".08em",marginBottom:5}}>{o.cxo} ADVISOR</div>
                      <div style={{fontSize:12.5,color:"rgba(245,245,240,.78)",lineHeight:1.65}}>{o.text}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Unified plan */}
              {showPlan && (
                <div style={{background:"rgba(239,159,39,.12)",border:"1px solid rgba(239,159,39,.25)",borderRadius:12,padding:"14px 16px"}} className="fi">
                  <div style={{fontSize:10,fontWeight:700,color:AMBER,letterSpacing:".08em",marginBottom:8}}>ORCHESTRATOR UNIFIED PLAN</div>
                  <div style={{fontSize:13,color:CHALK,lineHeight:1.75}}>{goal.plan}</div>
                </div>
              )}

              {orchStep===0 && (
                <div style={{textAlign:"center",padding:"30px 0",color:"rgba(245,245,240,.3)",fontSize:13}}>
                  Select a goal above and click Run to see all agents work in parallel →
                </div>
              )}
            </div>
          </div>

          <div style={{textAlign:"center",marginTop:20}}>
            <a href="/orchestrator" style={{fontSize:14,color:AMBER,textDecoration:"none",fontWeight:500}}>
              Open the full orchestrator with your real business goal →
            </a>
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section style={{padding:"80px 5%",background:"#F8F9FA"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Platform capabilities</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,60px)",color:N,letterSpacing:1.5,marginBottom:12}}>8 systems. One subscription.</h2>
          <p style={{fontSize:15,color:"#64748B",maxWidth:480,margin:"0 auto",lineHeight:1.7}}>Replace $2,796+/month of separate tools with one AI-powered autonomous platform.</p>
        </div>
        <div className="g4" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,maxWidth:1160,margin:"0 auto 44px"}}>
          {CAPS.map((c,i)=>(
            <div key={i} className="cap-card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <span style={{fontSize:24}}>{c.icon}</span>
                <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:8,background:c.tag==="New"?"#FFFBF2":"#EEF2FF",color:c.tag==="New"?AMBER:"#3D52A0",border:c.tag==="New"?`1px solid ${AMBER}44`:"none"}}>{c.tag}</span>
              </div>
              <div style={{fontSize:14,fontWeight:600,color:N,marginBottom:7}}>{c.title}</div>
              <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.65}}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Value comp */}
        <div style={{maxWidth:740,margin:"0 auto",background:N,borderRadius:18,padding:"26px 30px",display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:17,color:CHALK,letterSpacing:1,marginBottom:12}}>What this costs separately</div>
            {[["Strategy consultant","$2,000+"],["Marketing tools","$299+"],["Sales CRM","$149+"],["HR software","$199+"],["Analytics","$149+"]].map(([l,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"rgba(245,245,240,.5)",marginBottom:5}}>
                <span>{l}</span><span style={{color:"#EF4444",fontWeight:600}}>{v}</span>
              </div>
            ))}
            <div style={{borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:8,marginTop:4,display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700}}>
              <span style={{color:CHALK}}>Total/month</span><span style={{color:"#EF4444"}}>$2,796+</span>
            </div>
          </div>
          <div style={{textAlign:"center",background:AMBER,borderRadius:14,padding:"20px 26px",minWidth:160}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:N,letterSpacing:1,marginBottom:2}}>SIXXAB Pro</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:50,color:N,lineHeight:1,marginBottom:2}}>$99.50</div>
            <div style={{fontSize:12,color:"rgba(10,14,26,.6)",marginBottom:6}}>/month all included</div>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(10,14,26,.5)",textTransform:"uppercase",letterSpacing:".05em"}}>Save $2,696/mo</div>
          </div>
        </div>
      </section>

      {/* ── 12-MONTH ROADMAP ── */}
      <section ref={phaseRef} style={{padding:"90px 5%",background:N}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>12-month autonomous startup roadmap</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,60px)",color:CHALK,letterSpacing:1.5,marginBottom:12}}>
            From launch to <span style={{color:AMBER}}>$1M ARR</span>
          </h2>
          <p style={{fontSize:15,color:"rgba(245,245,240,.55)",maxWidth:500,margin:"0 auto",lineHeight:1.7}}>
            Three phases. Every milestone mapped. The orchestrator runs all agents toward each phase goal automatically.
          </p>
        </div>

        <div className="g3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,maxWidth:1060,margin:"0 auto 40px"}}>
          {PHASES.map((p,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${p.color}33`,borderRadius:16,padding:24,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,right:0,fontFamily:"'Bebas Neue'",fontSize:80,color:`${p.color}08`,lineHeight:1,pointerEvents:"none",userSelect:"none"}}>0{i+1}</div>
              <div style={{fontFamily:"'DM Mono'",fontSize:10,color:p.color,letterSpacing:".1em",marginBottom:8}}>{p.label} · {p.months}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:CHALK,letterSpacing:1,marginBottom:4}}>{p.title}</div>
              <div style={{fontSize:12,fontWeight:600,color:p.color,marginBottom:14,padding:"4px 10px",borderRadius:8,background:`${p.color}15`,display:"inline-block"}}>{p.target}</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {p.milestones.map((m,j)=>(
                  <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start",fontSize:12.5,color:"rgba(245,245,240,.65)"}}>
                    <span style={{color:p.color,flexShrink:0,marginTop:1}}>→</span>{m}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{textAlign:"center"}}>
          <a href="/roadmap" style={{padding:"12px 28px",borderRadius:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",color:CHALK,fontSize:14,fontWeight:500,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8}}>
            View the full interactive roadmap →
          </a>
        </div>
      </section>

      {/* ── GLOBAL MODEL ── */}
      <section style={{padding:"80px 5%",background:"#F8F9FA"}}>
        <div style={{maxWidth:1060,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:44}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Global business model</div>
            <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,60px)",color:N,letterSpacing:1.5,marginBottom:12}}>Three ways to join SIXXAB</h2>
          </div>
          <div className="g3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
            {[
              {icon:"🚀",title:"As a founder",sub:"$49.50–$175/mo",desc:"Get the full autonomous startup platform. Set goals, run the orchestrator, use all 16 agents. From idea to $10k MRR.",cta:"Start building",href:"/#pricing",color:"#EF9F27"},
              {icon:"🤝",title:"As an advisor",sub:"20% revenue share",desc:"Become a SIXXAB Advisor in your city. Run the platform for your founder community. Zero upfront cost — revenue share only.",cta:"Apply to advise",href:"/contact?type=partner",color:"#1D9E75"},
              {icon:"🏢",title:"As an enterprise",sub:"$5k–$50k/year",desc:"White-label SIXXAB for your accelerator, university or corporate innovation lab. Custom branding, team seats, dedicated support.",cta:"Talk to us",href:"/discovery",color:"#7C3AED"},
            ].map((m,i)=>(
              <div key={i} style={{background:"#fff",border:"1px solid #E8ECF4",borderRadius:16,padding:24,display:"flex",flexDirection:"column"}}>
                <div style={{fontSize:28,marginBottom:12}}>{m.icon}</div>
                <div style={{fontSize:15,fontWeight:600,color:N,marginBottom:3}}>{m.title}</div>
                <div style={{fontSize:12,fontWeight:600,color:m.color,marginBottom:10}}>{m.sub}</div>
                <div style={{fontSize:13,color:"#64748B",lineHeight:1.7,flex:1,marginBottom:18}}>{m.desc}</div>
                <a href={m.href} style={{padding:"10px 18px",borderRadius:9,background:m.color,color:"#fff",fontSize:13,fontWeight:600,textDecoration:"none",textAlign:"center"}}>{m.cta} →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section ref={pricingRef} style={{padding:"90px 5%",background:"#fff"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Pricing</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,60px)",color:N,letterSpacing:1.5,marginBottom:14}}>Pick your box</h2>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 20px",borderRadius:20,background:"#FFFBF2",border:`1.5px solid ${AMBER}66`,fontSize:14,fontWeight:500,color:"#633806"}}>
            🔥 Beta launch — <strong>50% off for founding members.</strong> Rate locked forever.
          </div>
        </div>

        <div className="g3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,maxWidth:1060,margin:"0 auto"}}>
          {TIERS.map(tier=>(
            <div key={tier.id} className={`tier ${tier.highlight?"pop":""}`}>
              {tier.badge&&<div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:AMBER,color:N,fontSize:11,fontWeight:700,padding:"5px 16px",borderRadius:20,letterSpacing:".06em",whiteSpace:"nowrap",boxShadow:"0 4px 12px rgba(239,159,39,.35)"}}>{tier.badge}</div>}
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:N,letterSpacing:1}}>{tier.name}</div>
                  <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:8,background:"#EEF2FF",color:"#3D52A0"}}>{tier.phase}</span>
                </div>
                <div style={{fontSize:13,color:"#64748B",lineHeight:1.5}}>{tier.tagline}</div>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:3}}>
                  <span style={{fontSize:14,color:"#CBD5E1",textDecoration:"line-through"}}>${tier.price}/mo</span>
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:54,color:tier.highlight?AMBER:N,lineHeight:1,letterSpacing:1}}>${tier.founding}</span>
                  <span style={{fontSize:14,color:"#94A3B8"}}>/mo</span>
                </div>
                <div style={{fontSize:12,color:"#1D9E75",fontWeight:600,marginTop:3}}>
                  ↑ Founding rate · save ${(tier.price-tier.founding).toFixed(2)}/mo · locked forever
                </div>
              </div>
              <ul style={{listStyle:"none",flex:1,marginBottom:24,display:"flex",flexDirection:"column",gap:9}}>
                {tier.features.map(f=>(
                  <li key={f} style={{display:"flex",gap:9,fontSize:13.5,color:N,alignItems:"flex-start"}}>
                    <span className="check" style={{background:tier.highlight?"rgba(239,159,39,.15)":"#F1F5F9",color:tier.highlight?AMBER:"#64748B"}}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={()=>handleCheckout(tier)} disabled={loading&&selectedTier===tier.id}
                style={{width:"100%",padding:14,borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",border:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all .18s",background:tier.highlight?AMBER:N,color:tier.highlight?N:CHALK,opacity:loading&&selectedTier===tier.id?.6:1}}>
                {loading&&selectedTier===tier.id?"Opening checkout…":`Start for $${tier.founding}/mo →`}
              </button>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",marginTop:24,fontSize:14,color:"#94A3B8"}}>
          🛡️ <strong style={{color:"#475569"}}>14-day money-back guarantee</strong> — full refund if SIXXAB doesn't deliver progress. No questions.
        </p>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{padding:"80px 5%",background:N}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Results</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,60px)",color:CHALK,letterSpacing:1.5}}>What founders say</h2>
        </div>
        <div className="g3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,maxWidth:1060,margin:"0 auto"}}>
          {TESTI.map((t,i)=>(
            <div key={i} className="tcard">
              <div style={{color:AMBER,fontSize:13,letterSpacing:2,marginBottom:12}}>★★★★★</div>
              <p style={{fontSize:14,color:"rgba(245,245,240,.8)",lineHeight:1.75,marginBottom:18,fontStyle:"italic"}}>"{t.quote}"</p>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(239,159,39,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:13,color:AMBER}}>{t.avatar}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:CHALK}}>{t.name}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCOVERY CTA ── */}
      <section style={{padding:"70px 5%",background:"#F8F9FA"}}>
        <div style={{maxWidth:860,margin:"0 auto",background:N,borderRadius:20,padding:"44px 44px",display:"grid",gridTemplateColumns:"1fr auto",gap:32,alignItems:"center",flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Free · 20 minutes · No pitch</div>
            <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(24px,4vw,44px)",color:CHALK,letterSpacing:1.5,lineHeight:1.1,marginBottom:12}}>Talk to Sunil. Get your 3-phase plan.</h2>
            <p style={{fontSize:14,color:"rgba(245,245,240,.55)",lineHeight:1.7,maxWidth:380}}>20 minutes. Walk away with a personalised Phase 1 action plan and clarity on which agents to activate first.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,minWidth:185}}>
            <a href="/discovery" className="btn-a" style={{justifyContent:"center"}}>📅 Book free call</a>
            <a href="/contact" className="btn-g" style={{justifyContent:"center",fontSize:14}}>Send inquiry</a>
          </div>
        </div>
      </section>

      {/* ── BETA CTA ── */}
      <section style={{padding:"72px 5%",background:AMBER,textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 16px",borderRadius:20,background:"rgba(10,14,26,.12)",marginBottom:18,fontSize:13,fontWeight:600,color:N}}>
          247 founders building autonomously inside SIXXAB
        </div>
        <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,60px)",color:N,letterSpacing:1.5,lineHeight:1.05,marginBottom:10}}>
          Get 50% off. Locked forever.
        </h2>
        <p style={{fontSize:16,color:"rgba(10,14,26,.62)",marginBottom:30,maxWidth:380,margin:"0 auto 30px",lineHeight:1.65}}>
          Founding member rate: <strong style={{color:N}}>$49.50 · $99.50 · $175/mo</strong><br/>Your price never increases — ever.
        </p>

        {betaDone?(
          <div style={{background:"rgba(10,14,26,.1)",borderRadius:14,padding:"18px 28px",display:"inline-block"}}>
            <p style={{fontSize:16,fontWeight:700,color:N,marginBottom:5}}>🎉 You're in!</p>
            <p style={{fontSize:14,color:"rgba(10,14,26,.65)",marginBottom:14}}>Check your inbox — 50% off details incoming.</p>
            <button onClick={()=>scrollTo(pricingRef)} style={{padding:"11px 22px",borderRadius:9,background:N,color:CHALK,fontSize:14,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Pick your plan →</button>
          </div>
        ):(
          <div style={{maxWidth:480,margin:"0 auto"}}>
            <form onSubmit={handleBeta} style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <input type="email" placeholder="Enter your email" value={email} onChange={e=>{setEmail(e.target.value);setBetaErr("")}} required
                style={{flex:1,minWidth:200,padding:"13px 16px",borderRadius:9,border:betaErr?"2px solid rgba(153,27,27,.5)":"2px solid transparent",fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",background:"rgba(10,14,26,.1)",color:N,outline:"none"}}/>
              <button type="submit" disabled={betaBusy}
                style={{padding:"13px 22px",borderRadius:9,background:N,color:CHALK,fontSize:14,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",opacity:betaBusy?.65:1,whiteSpace:"nowrap"}}>
                {betaBusy?"Sending…":"Get 50% off →"}
              </button>
            </form>
            {betaErr&&<p style={{fontSize:13,color:"rgba(120,20,20,.8)",fontWeight:500,marginBottom:8}}>⚠ {betaErr}</p>}
            <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
              {["✓ No credit card required","✓ Cancel anytime","✓ Rate locked forever"].map((t,i)=><span key={i} style={{fontSize:12,color:"rgba(10,14,26,.48)"}}>{t}</span>)}
            </div>
            <button onClick={()=>scrollTo(pricingRef)} style={{padding:"10px 22px",borderRadius:9,background:"rgba(10,14,26,.1)",color:N,fontSize:13,fontWeight:600,border:"1.5px solid rgba(10,14,26,.2)",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>See pricing →</button>
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:"#111520",padding:"28px 5%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <SXLogo size={22}/>
            <div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:CHALK,letterSpacing:2,lineHeight:1}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
              <div style={{fontFamily:"'DM Mono'",fontSize:8,color:"#444",letterSpacing:".12em"}}>startupsinabox.com</div>
            </div>
          </div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {[["Orchestrator","/orchestrator"],["Roadmap","/roadmap"],["Agents","/agents"],["Coach","/coach"],["Discovery","/discovery"],["Contact","/contact"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h])=>(
              <a key={l} href={h} style={{fontSize:12,color:"rgba(255,255,255,.32)",textDecoration:"none"}}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,.22)"}}>© 2025 SIXXAB · Startups In eXponential A Box · Dallas, TX · Global · Phase 1 of 3</span>
          <span style={{fontSize:12,color:"rgba(255,255,255,.18)"}}>247+ founders · 16 agents · 3 phases · $1M ARR target</span>
        </div>
      </footer>
    </>
  )
}
