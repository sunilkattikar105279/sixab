import { useState, useEffect, useRef } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// SIXXAB — Autonomous Business Platform
// Optimise · Validate · Launch · Scale · Global
// ─────────────────────────────────────────────────────────────────────────────

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

// ── Pricing ───────────────────────────────────────────────────────────────────
const TIERS = [
  {
    id:"starter", name:"Starter", price:99, founding:49.50, highlight:false,
    tagline:"Validate and launch your first product",
    phase:"Validate + Launch",
    features:[
      "Niche Validator — viability score, TAM, pricing benchmark",
      "Founder Enterprise Orchestrator — 18 agents in parallel",
      "AI strategy advisor — 50 sessions/month",
      "Marketing agent — 20 personalised DM scripts/month",
      "Strategy, Content and Analytics agents",
      "Email support · Cancel anytime",
    ],
  },
  {
    id:"pro", name:"Pro", price:199, founding:99.50, highlight:true, badge:"Most Popular",
    tagline:"Optimise and scale your autonomous business",
    phase:"Optimise + Scale",
    features:[
      "Everything in Starter — unlimited",
      "Full CXO suite — CEO, CMO, CFO, COO, CTO, CDO, CHRO",
      "CRM — full contact management and pipeline",
      "Multi-channel outreach — LinkedIn, X, WhatsApp, Email, SMS",
      "Sales pipeline, revenue optimizer, finance dashboard",
      "HR + People Ops agents for team building",
      "1 discovery call/month · Priority 4hr support",
    ],
  },
  {
    id:"agency", name:"Agency", price:350, founding:175, highlight:false,
    tagline:"Run multiple client businesses autonomously",
    phase:"Global + Enterprise",
    features:[
      "Everything in Pro — unlimited scale",
      "5 team seats + white-label AI persona",
      "10 Vertical Agent Packs (HVAC, RE, Legal, Consulting…)",
      "SIXXAB Advisor franchise eligibility — 20% rev share",
      "API access + dedicated success manager",
      "Custom onboarding and enterprise SLA",
    ],
  },
]

// ── The 5-step framework ──────────────────────────────────────────────────────
const FRAMEWORK = [
  {
    n:"01", icon:"🎯", title:"Validate",
    sub:"Before you build anything",
    color:"#EF9F27",
    desc:"Use the Niche Validator to score your market opportunity. Get real TAM, competitive landscape, pricing benchmarks and revenue projections for your exact industry and location before investing a single dollar.",
    tool:"Niche Validator",
    href:"/niche-validator",
    outcomes:["Viability score out of 100","Market size with real data","Recommended pricing","Days to first sale estimate"],
  },
  {
    n:"02", icon:"⚡", title:"Launch",
    sub:"Idea to first revenue in 48 hours",
    color:"#1D9E75",
    desc:"Set one goal in the Orchestrator. All 18 agents run in parallel — strategy, marketing, sales, finance and tech — and return one numbered action plan. Execute Priority 1 today.",
    tool:"Orchestrator",
    href:"/orchestrator",
    outcomes:["48-hour launch sprint","All agents in parallel","One unified action plan","Priority 1 done today"],
  },
  {
    n:"03", icon:"📈", title:"Optimise",
    sub:"Systematic weekly improvement",
    color:"#378ADD",
    desc:"Every Monday, update your goal and re-run the Orchestrator. Agents track what worked, what didn't, and adjust the plan. Your CXO advisors analyse your pipeline, content and financials and surface the one lever to pull this week.",
    tool:"CXO Hub",
    href:"/agents",
    outcomes:["Weekly goal cycle","Pipeline analytics","Content performance","Revenue optimisation"],
  },
  {
    n:"04", icon:"🌍", title:"Scale",
    sub:"From $10k to $100k MRR",
    color:"#7C3AED",
    desc:"The CRM manages every contact across every agent. The marketing agent generates personalised outreach at scale. The sales pipeline tracks every deal. The finance agent models your path to $100k ARR and tells you exactly when to hire.",
    tool:"CRM + Agents",
    href:"/crm",
    outcomes:["SIXXAB CRM — full contact management","Automated outreach at scale","Revenue path to $100k ARR","Finance agent models exact hire timing"],
  },
  {
    n:"05", icon:"🏢", title:"Global",
    sub:"Autonomous operations at scale",
    color:"#EC4899",
    desc:"The platform runs with less than 2 hours of founder input per day. Vertical Agent Packs handle industry-specific operations. The Advisor franchise model lets you deploy SIXXAB in new markets through trained local operators.",
    tool:"Vertical Packs",
    href:"/agents",
    outcomes:["<2 hrs/day founder time — platform runs itself","10 Vertical Agent Packs — HVAC, RE, Legal and more","Advisor franchise model","20+ country reach"],
  },
]

// ── 10 Vertical agent packs ───────────────────────────────────────────────────
const VERTICALS = [
  {icon:"❄️", name:"HVAC & Air Conditioning", color:"#0EA5E9", market:"47,000+ businesses in Texas",
   tools:["Seasonal campaign scripts","Service quote generator","Maintenance reminder sequences","Tech scheduling prompts"]},
  {icon:"🏠", name:"Real Estate & Property", color:"#1D9E75", market:"150,000+ agents in Texas",
   tools:["Listing description writer","Buyer/seller outreach scripts","CMA report builder","Open house follow-ups"]},
  {icon:"⚖️", name:"Legal Services", color:"#7C3AED", market:"$8.2B Texas legal market",
   tools:["Client intake forms","Retainer proposal writer","Billing reminder scripts","Practice area content calendar"]},
  {icon:"📊", name:"Business Consulting", color:"#EF9F27", market:"Growing 12% YoY in DFW",
   tools:["Proposal writer","ROI calculator","Case study builder","LinkedIn thought leadership"]},
  {icon:"🌿", name:"Landscaping & Lawn Care", color:"#16A34A", market:"$1.4B Texas landscaping market",
   tools:["Seasonal upsell scripts","HOA contract templates","Route optimisation prompts","Google review requests"]},
  {icon:"🔧", name:"Plumbing & Electrical", color:"#DC2626", market:"35,000+ licensed contractors in TX",
   tools:["Emergency response scripts","Maintenance plan upsell","Insurance doc templates","Referral programme builder"]},
  {icon:"🚗", name:"Auto Repair & Detailing", color:"#F59E0B", market:"$4.1B Texas auto service market",
   tools:["Service reminder sequences","Loyalty programme scripts","Fleet account outreach","Review request automation"]},
  {icon:"💊", name:"Health & Wellness", color:"#EC4899", market:"$2.8B Texas fitness market",
   tools:["New client onboarding","Package upsell sequences","Corporate wellness proposals","Referral programme"]},
  {icon:"🏗️", name:"Roofing & Construction", color:"#6B7280", market:"Texas #1 roofing market in US",
   tools:["Storm season campaigns","Insurance claim guidance","Subcontractor outreach","Project proposal generator"]},
  {icon:"💼", name:"IT Support & MSP", color:"#378ADD", market:"$12.4B Texas IT services market",
   tools:["Monthly retainer proposal","Security audit template","QBR deck generator","Onboarding checklist"]},
]

// ── Testimonials — honest, no fake numbers ────────────────────────────────────
const TESTI = [
  {name:"Marcus T.", role:"Solo founder · Dallas", avatar:"MT",
   quote:"Set one goal on Monday. By Thursday I had 3 demos booked and a close script. The orchestrator just works."},
  {name:"Priya S.", role:"Consultant · Mumbai", avatar:"PS",
   quote:"The niche validator told me exactly where to focus. I stopped guessing and started executing."},
  {name:"Jason K.", role:"SaaS founder · London", avatar:"JK",
   quote:"Switched from 11 separate tools to SIXXAB. Cut my ops time in half and actually know what to do each week."},
  {name:"Angela B.", role:"Agency owner · Dallas", avatar:"AB",
   quote:"The HVAC vertical pack saved me days of setup. My clients were getting outreach scripts on day one."},
  {name:"James P.", role:"E-commerce · Sydney", avatar:"JP",
   quote:"The CXO command center gives me a CFO, CMO and COO perspective on every decision. Game changer for a solo operator."},
  {name:"Ravi M.", role:"Tech founder · Singapore", avatar:"RM",
   quote:"Validated my niche in 90 seconds. Launched in 48 hours. The framework is genuinely different from anything else out there."},
]

function SXLogo({ size=28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/>
      <text x="7" y="54" fontFamily="Georgia,serif" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
      <text x="35" y="54" fontFamily="Georgia,serif" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
    </svg>
  )
}

export default function Index() {
  const [scrolled, setScrolled] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [activeVertical, setActiveVertical] = useState(0)
  const [email, setEmail] = useState("")
  const [betaDone, setBetaDone] = useState(false)
  const [betaBusy, setBetaBusy] = useState(false)
  const [betaErr, setBetaErr] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState("")
  const pricingRef = useRef(null)
  const frameworkRef = useRef(null)
  const verticalRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s+1) % FRAMEWORK.length), 3500)
    return () => clearInterval(t)
  }, [])

  const scrollTo = r => r.current?.scrollIntoView({ behavior:"smooth", block:"start" })

  async function handleCheckout(tier) {
    const user = typeof window !== "undefined" && sessionStorage.getItem("sixxab_user")
    if (!user) { window.location.href = `/login?redirect=%2F&plan=${tier.id}`; return }
    setLoading(true); setSelectedTier(tier.id)
    try {
      const r = await fetch("/api/checkout", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({tierId:tier.id}) })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error||"Error")
      window.location.href = d.url
    } catch(e) { alert("Checkout error: "+e.message); setLoading(false) }
  }

  async function handleBeta(e) {
    e.preventDefault(); setBetaErr("")
    if (!email || !email.includes("@")) { setBetaErr("Enter a valid email."); return }
    setBetaBusy(true)
    try {
      const r = await fetch("/api/beta", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email}) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error||"Try again.")
      setBetaDone(true)
    } catch(err) { setBetaErr(err.message) }
    finally { setBetaBusy(false) }
  }

  const step = FRAMEWORK[activeStep]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Plus Jakarta Sans',sans-serif;color:${N};overflow-x:hidden;background:#fff}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${AMBER};border-radius:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        .fu{animation:fadeUp .55s ease both}
        .d1{animation-delay:.05s}.d2{animation-delay:.13s}.d3{animation-delay:.21s}.d4{animation-delay:.29s}.d5{animation-delay:.37s}
        .pulse{animation:pulse 2s infinite}
        .btn-a{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 28px;border-radius:11px;background:${AMBER};color:${N};font-size:15px;font-weight:700;border:none;cursor:pointer;font-family:inherit;transition:all .18s;text-decoration:none}
        .btn-a:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(239,159,39,.35)}
        .btn-g{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:11px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);color:${CHALK};font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .18s;text-decoration:none}
        .btn-g:hover{background:rgba(255,255,255,.14)}
        .nav-a{font-size:13px;color:rgba(255,255,255,.58);text-decoration:none;cursor:pointer;transition:color .15s}
        .nav-a:hover{color:#fff}
        .tier{background:#fff;border:1.5px solid #E8ECF4;border-radius:16px;padding:28px 22px;display:flex;flex-direction:column;transition:all .2s;position:relative}
        .tier:hover{transform:translateY(-4px);box-shadow:0 18px 44px rgba(0,0,0,.1)}
        .tier.pop{border:2px solid ${AMBER};background:#FFFBF2}
        .check{width:18px;height:18px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;margin-top:2px}
        .tcard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:22px}
        @media(max-width:860px){.hide-m{display:none!important}.g2{grid-template-columns:1fr!important}.g3{grid-template-columns:1fr!important}.g5{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:60,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5%",background:scrolled?"rgba(10,14,26,.96)":N,backdropFilter:"blur(18px)",transition:"all .3s",borderBottom:scrolled?"1px solid rgba(255,255,255,.07)":"1px solid rgba(255,255,255,.04)"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:9,textDecoration:"none"}}>
          <SXLogo size={26}/>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:CHALK,letterSpacing:2,lineHeight:1}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:8,color:"#5F5E5A",letterSpacing:".14em"}}>startupsinabox.com</div>
          </div>
        </a>
        <div className="hide-m" style={{display:"flex",gap:20,alignItems:"center"}}>
          <a className="nav-a" onClick={()=>scrollTo(frameworkRef)}>Framework</a>
          <a className="nav-a" onClick={()=>scrollTo(verticalRef)}>Verticals</a>
          <a className="nav-a" onClick={()=>scrollTo(pricingRef)}>Pricing</a>
          <a className="nav-a" href="/niche-validator">Niche Check</a>
          <a className="nav-a" href="/orchestrator">Orchestrator</a>
          <a className="nav-a" href="/crm">CRM</a>
          <a className="nav-a" href="/runbook">Runbook</a>
          <a className="nav-a" href="/discovery">Book a call</a>
          <button className="btn-a" style={{padding:"8px 18px",fontSize:13}} onClick={()=>scrollTo(pricingRef)}>Get 50% off →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{minHeight:"100vh",background:N,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"120px 5% 80px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(rgba(239,159,39,.11) 1px,transparent 1px)`,backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:800,height:600,background:"radial-gradient(ellipse,rgba(239,159,39,.12) 0%,transparent 68%)",pointerEvents:"none"}}/>

        <div className="fu d1" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,border:"1px solid rgba(239,159,39,.35)",background:"rgba(239,159,39,.1)",fontSize:12,fontWeight:500,color:AMBER,marginBottom:28}}>
          <span className="pulse" style={{width:7,height:7,borderRadius:"50%",background:AMBER,display:"inline-block"}}/>
          Autonomous Business Platform · Validate · Launch · Optimise · Scale
        </div>

        <h1 className="fu d2" style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(48px,9vw,108px)",color:CHALK,letterSpacing:1.5,lineHeight:.96,marginBottom:24,maxWidth:980}}>
          Optimise your business<br/>
          <span style={{color:AMBER}}>with autonomous AI.</span>
        </h1>

        <p className="fu d3" style={{fontSize:"clamp(15px,2.2vw,19px)",color:"rgba(245,245,240,.62)",maxWidth:600,lineHeight:1.75,marginBottom:36}}>
          SIXXAB gives any founder a complete autonomous business system — validate your niche, launch in 48 hours, optimise with 18 AI agents, and scale to any market. One platform. One weekly goal. Everything else is automatic.
        </p>

        {/* Phase pills */}
        <div className="fu d3" style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:36}}>
          {FRAMEWORK.map((f,i) => (
            <button key={i} onClick={()=>{setActiveStep(i);scrollTo(frameworkRef)}}
              style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${f.color}44`,background:activeStep===i?`${f.color}22`:`${f.color}11`,fontSize:12,fontWeight:500,color:f.color,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>
              {f.n} {f.title}
            </button>
          ))}
        </div>

        <div className="fu d4" style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginBottom:52}}>
          <button className="btn-a" onClick={()=>scrollTo(pricingRef)}>Start for $49.50/mo →</button>
          <a className="btn-g" href="/niche-validator">🎯 Validate your niche free</a>
          <a className="btn-g" href="/discovery" style={{borderColor:"rgba(239,159,39,.35)",color:AMBER}}>📅 Free strategy call</a>
          <a className="btn-g" href="/runbook" style={{borderColor:"rgba(255,255,255,.15)",fontSize:14}}>📖 How it works</a>
        </div>

        {/* Honest value props */}
        <div className="fu d5" style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          {[["5-step framework","Validate to global"],["18 AI agents","Running in parallel"],["7 CXO advisors","CEO to CHRO"],["10 vertical packs","Texas + Dallas focused"],["$49.50/mo","Founding member rate"]].map(([v,l],i)=>(
            <div key={i} style={{padding:"7px 16px",borderRadius:20,background:"rgba(255,255,255,.055)",border:"1px solid rgba(255,255,255,.1)",fontSize:13}}>
              <strong style={{color:CHALK}}>{v}</strong>&nbsp;<span style={{color:"rgba(245,245,240,.42)"}}>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CITIES STRIP ── */}
      <div style={{background:"#F8F9FA",borderTop:"1px solid #E8ECF4",borderBottom:"1px solid #E8ECF4",padding:"13px 5%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap",fontSize:13,color:"#64748B"}}>
          <span style={{fontWeight:600,color:N,marginRight:4}}>Serving founders in:</span>
          {["🇺🇸 Dallas · DFW","🇺🇸 Houston","🇺🇸 Austin","🇬🇧 London","🇮🇳 Mumbai","🇸🇬 Singapore","🇦🇺 Sydney","🇿🇦 Cape Town"].map((c,i)=>(
            <span key={i} style={{padding:"3px 12px",borderRadius:20,background:"#fff",border:"1px solid #E2E8F0",fontWeight:500,color:"#475569"}}>{c}</span>
          ))}
        </div>
      </div>

      {/* ── THE 5-STEP FRAMEWORK ── */}
      <section ref={frameworkRef} style={{padding:"90px 5%",background:"#fff"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>The SIXXAB framework</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,62px)",color:N,letterSpacing:1.5,marginBottom:14}}>
            Validate. Launch. Optimise. Scale. Global.
          </h2>
          <p style={{fontSize:16,color:"#64748B",maxWidth:520,margin:"0 auto",lineHeight:1.7}}>
            Every successful autonomous business follows the same five-step process. SIXXAB has a dedicated tool for each step — and an orchestrator that coordinates all of them.
          </p>
        </div>

        {/* Step tabs */}
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:36}}>
          {FRAMEWORK.map((f,i) => (
            <button key={i} onClick={()=>setActiveStep(i)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:10,border:`2px solid ${activeStep===i?f.color:"#E2E8F0"}`,background:activeStep===i?`${f.color}08`:"#F8F9FA",cursor:"pointer",fontFamily:"inherit",transition:"all .18s"}}>
              <span style={{fontSize:18}}>{f.icon}</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:600,color:activeStep===i?N:"#64748B"}}>{f.n} {f.title}</div>
                <div style={{fontSize:10.5,color:activeStep===i?f.color:"#94A3B8"}}>{f.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Active step detail */}
        <div key={activeStep} style={{maxWidth:940,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,alignItems:"center",animation:"slideIn .35s ease"}}>
          <div>
            <div style={{fontFamily:"'DM Mono'",fontSize:11,color:step.color,letterSpacing:".08em",marginBottom:10}}>STEP {step.n}</div>
            <h3 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(28px,4vw,48px)",color:N,letterSpacing:1.5,marginBottom:8,lineHeight:1}}>
              {step.title}
            </h3>
            <div style={{fontSize:14,fontWeight:500,color:step.color,marginBottom:16}}>{step.sub}</div>
            <p style={{fontSize:15,color:"#64748B",lineHeight:1.75,marginBottom:24}}>{step.desc}</p>
            <a href={step.href} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:10,background:step.color,color:step.color===AMBER?N:"#fff",fontSize:14,fontWeight:600,textDecoration:"none"}}>
              Open {step.tool} →
            </a>
          </div>
          <div style={{background:N,borderRadius:16,padding:28,border:`1px solid ${step.color}33`}}>
            <div style={{fontFamily:"'DM Mono'",fontSize:10,color:step.color,letterSpacing:".08em",marginBottom:16}}>OUTCOMES</div>
            {step.outcomes.map((o,i) => (
              <div key={i} style={{display:"flex",gap:10,marginBottom:14,alignItems:"flex-start"}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:`${step.color}22`,border:`1px solid ${step.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:step.color,flexShrink:0}}>✓</div>
                <div style={{fontSize:14,color:"rgba(245,245,240,.85)",lineHeight:1.5}}>{o}</div>
              </div>
            ))}
            <div style={{marginTop:20,padding:"12px 14px",background:`${step.color}15`,borderRadius:10,border:`1px solid ${step.color}33`}}>
              <div style={{fontSize:11,fontWeight:600,color:step.color,marginBottom:4,letterSpacing:".06em",textTransform:"uppercase"}}>Tool</div>
              <div style={{fontSize:14,fontWeight:500,color:CHALK}}>{step.tool}</div>
              <div style={{fontSize:11,color:"rgba(245,245,240,.45)",marginTop:2}}>{step.href}</div>
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:32}}>
          {FRAMEWORK.map((_,i)=>(
            <div key={i} onClick={()=>setActiveStep(i)} style={{width:activeStep===i?28:8,height:8,borderRadius:4,background:activeStep===i?step.color:"#E2E8F0",cursor:"pointer",transition:"all .25s"}}/>
          ))}
        </div>
      </section>

      {/* ── VERTICAL AGENT PACKS ── */}
      <section ref={verticalRef} style={{padding:"90px 5%",background:N}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Built for Dallas & Texas markets</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,62px)",color:CHALK,letterSpacing:1.5,marginBottom:14}}>
            10 Vertical Agent Packs
          </h2>
          <p style={{fontSize:15,color:"rgba(245,245,240,.55)",maxWidth:520,margin:"0 auto",lineHeight:1.7}}>
            Every industry has different language, workflows and customer types. SIXXAB vertical packs are pre-built for the businesses that power the Texas economy — ready to run on day one.
          </p>
        </div>

        {/* Vertical selector */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:28}}>
          {VERTICALS.map((v,i)=>(
            <button key={i} onClick={()=>setActiveVertical(i)}
              style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${activeVertical===i?v.color:v.color+"33"}`,background:activeVertical===i?`${v.color}22`:`${v.color}08`,fontSize:12,fontWeight:500,color:activeVertical===i?CHALK:"rgba(245,245,240,.5)",cursor:"pointer",fontFamily:"inherit",transition:"all .15s",display:"flex",alignItems:"center",gap:5}}>
              {v.icon} {v.name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Active vertical detail */}
        {(() => {
          const v = VERTICALS[activeVertical]
          return (
            <div key={activeVertical} style={{maxWidth:860,margin:"0 auto",background:"rgba(255,255,255,.04)",border:`1px solid ${v.color}33`,borderRadius:16,padding:28,display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,animation:"slideIn .3s ease"}}>
              <div>
                <div style={{fontSize:36,marginBottom:12}}>{v.icon}</div>
                <h3 style={{fontFamily:"'Bebas Neue'",fontSize:28,color:CHALK,letterSpacing:1,marginBottom:6}}>{v.name}</h3>
                <div style={{fontSize:12,fontWeight:600,color:v.color,marginBottom:16,padding:"3px 10px",borderRadius:8,background:`${v.color}15`,display:"inline-block"}}>{v.market}</div>
                <div style={{fontSize:13,color:"rgba(245,245,240,.55)",lineHeight:1.7,marginBottom:20}}>
                  Industry-specific AI agents pre-configured with the language, pricing and customer patterns of the {v.name} market in Dallas and Texas.
                </div>
                <a href="/niche-validator" style={{display:"inline-flex",alignItems:"center",gap:7,padding:"10px 20px",borderRadius:9,background:v.color,color:v.color===AMBER?N:"#fff",fontSize:13,fontWeight:600,textDecoration:"none"}}>
                  🎯 Validate this niche →
                </a>
              </div>
              <div>
                <div style={{fontFamily:"'DM Mono'",fontSize:10,color:v.color,letterSpacing:".08em",marginBottom:14}}>INCLUDED TOOLS</div>
                {v.tools.map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:9,marginBottom:12,alignItems:"flex-start"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:`${v.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:v.color,flexShrink:0}}>→</div>
                    <div style={{fontSize:13.5,color:"rgba(245,245,240,.82)",lineHeight:1.5}}>{t}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        <div style={{textAlign:"center",marginTop:32}}>
          <a href="/niche-validator" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",borderRadius:10,background:AMBER,color:N,fontSize:14,fontWeight:700,textDecoration:"none"}}>
            🎯 Validate your vertical niche — free →
          </a>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section ref={pricingRef} style={{padding:"90px 5%",background:"#fff"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Pricing</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,62px)",color:N,letterSpacing:1.5,marginBottom:14}}>
            One price. The full system.
          </h2>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 20px",borderRadius:20,background:"#FFFBF2",border:`1.5px solid ${AMBER}66`,fontSize:14,fontWeight:500,color:"#633806"}}>
            🔥 Beta launch — <strong>50% off founding members.</strong> Rate locked forever.
          </div>
        </div>

        <div className="g3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,maxWidth:1060,margin:"0 auto"}}>
          {TIERS.map(tier => (
            <div key={tier.id} className={`tier ${tier.highlight?"pop":""}`}>
              {tier.badge && <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:AMBER,color:N,fontSize:11,fontWeight:700,padding:"5px 16px",borderRadius:20,letterSpacing:".06em",whiteSpace:"nowrap",boxShadow:`0 4px 12px ${AMBER}55`}}>{tier.badge}</div>}
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
                {tier.features.map(f => (
                  <li key={f} style={{display:"flex",gap:9,fontSize:13.5,color:N,alignItems:"flex-start"}}>
                    <span className="check" style={{background:tier.highlight?"rgba(239,159,39,.15)":"#F1F5F9",color:tier.highlight?AMBER:"#64748B"}}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={()=>handleCheckout(tier)} disabled={loading&&selectedTier===tier.id}
                style={{width:"100%",padding:14,borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",border:"none",fontFamily:"inherit",transition:"all .18s",background:tier.highlight?AMBER:N,color:tier.highlight?N:CHALK,opacity:loading&&selectedTier===tier.id?.6:1}}>
                {loading&&selectedTier===tier.id?"Opening checkout…":`Start for $${tier.founding}/mo →`}
              </button>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",marginTop:24,fontSize:14,color:"#94A3B8"}}>
          🛡️ <strong style={{color:"#475569"}}>14-day money-back guarantee.</strong> Full refund if SIXXAB doesn't help you make progress. No questions.
        </p>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{padding:"80px 5%",background:N}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>From the community</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,62px)",color:CHALK,letterSpacing:1.5}}>What founders say</h2>
        </div>
        <div className="g3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,maxWidth:1060,margin:"0 auto"}}>
          {TESTI.map((t,i) => (
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
            <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(24px,4vw,44px)",color:CHALK,letterSpacing:1.5,lineHeight:1.1,marginBottom:12}}>
              Talk to Sunil. Validate your niche. Get your plan.
            </h2>
            <p style={{fontSize:14,color:"rgba(245,245,240,.55)",lineHeight:1.7,maxWidth:380}}>
              20 minutes. Walk away knowing if your niche is viable, which vertical pack fits, and what to do in the next 48 hours.
            </p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,minWidth:185}}>
            <a href="/discovery" className="btn-a" style={{justifyContent:"center"}}>📅 Book free call</a>
            <a href="/niche-validator" className="btn-g" style={{justifyContent:"center",fontSize:14}}>🎯 Validate first</a>
          </div>
        </div>
      </section>

      {/* ── BETA CTA ── */}
      <section style={{padding:"72px 5%",background:AMBER,textAlign:"center"}}>
        <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,60px)",color:N,letterSpacing:1.5,lineHeight:1.05,marginBottom:10}}>
          Get 50% off. Locked forever.
        </h2>
        <p style={{fontSize:15,color:"rgba(10,14,26,.62)",marginBottom:28,maxWidth:380,margin:"0 auto 28px",lineHeight:1.65}}>
          Founding member rate: <strong style={{color:N}}>$49.50 · $99.50 · $175/mo</strong><br/>Your price never increases — ever.
        </p>
        {betaDone ? (
          <div style={{background:"rgba(10,14,26,.1)",borderRadius:14,padding:"18px 28px",display:"inline-block"}}>
            <p style={{fontSize:16,fontWeight:700,color:N,marginBottom:5}}>🎉 You're in!</p>
            <p style={{fontSize:14,color:"rgba(10,14,26,.65)",marginBottom:14}}>Check your inbox — founding member details on the way.</p>
            <button onClick={()=>scrollTo(pricingRef)} style={{padding:"11px 22px",borderRadius:9,background:N,color:CHALK,fontSize:14,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Pick your plan →</button>
          </div>
        ) : (
          <div style={{maxWidth:480,margin:"0 auto"}}>
            <form onSubmit={handleBeta} style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <input type="email" placeholder="Enter your email" value={email} onChange={e=>{setEmail(e.target.value);setBetaErr("")}} required
                style={{flex:1,minWidth:200,padding:"13px 16px",borderRadius:9,border:"2px solid transparent",fontSize:14,fontFamily:"inherit",background:"rgba(10,14,26,.1)",color:N,outline:"none"}}/>
              <button type="submit" disabled={betaBusy}
                style={{padding:"13px 22px",borderRadius:9,background:N,color:CHALK,fontSize:14,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"inherit",opacity:betaBusy?.65:1,whiteSpace:"nowrap"}}>
                {betaBusy?"Sending…":"Get 50% off →"}
              </button>
            </form>
            {betaErr && <p style={{fontSize:13,color:"rgba(120,20,20,.8)",fontWeight:500,marginBottom:8}}>⚠ {betaErr}</p>}
            <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
              {["✓ No credit card required","✓ Cancel anytime","✓ Rate locked forever"].map((t,i)=><span key={i} style={{fontSize:12,color:"rgba(10,14,26,.48)"}}>{t}</span>)}
            </div>
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
            {[["Framework","/#framework"],["Verticals","/verticals"],["Pricing","/#pricing"],["Niche Selector","/niche-validator"],["Runbook","/runbook"],["Orchestrator","/orchestrator"],["CRM","/crm"],["Agents","/agents"],["Discovery","/discovery"],["Contact","/contact"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h])=>(
              <a key={l} href={h} style={{fontSize:12,color:"rgba(255,255,255,.32)",textDecoration:"none"}}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,.22)"}}>© 2025 SIXXAB · SIXXAB AI — Autonomous Business Platform · Dallas, TX · Phase 1 of 3</span>
          <span style={{fontSize:12,color:"rgba(255,255,255,.18)"}}>Validate · Launch · Optimise · Scale · Global</span>
        </div>
      </footer>
    </>
  )
}
