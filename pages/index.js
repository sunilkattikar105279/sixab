// pages/index.js — SIXXAB AI · Autonomous Business Platform
// Complete landing page — all modules, framework, agents, verticals, board, support
import Head from "next/head"
import { useState, useEffect, useRef } from "react"
import { SixxabMark, SixxabWordmark } from "../components/SixxabNav"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

// ── 6-Phase framework ─────────────────────────────────────────────────────────
const FRAMEWORK = [
  { n:"01", icon:"🎯", title:"Validate",    color:"#EF9F27", revenue:"$0 → First customer",    tool:"Niche Selector",  href:"/niche-validator",
    sub:"Before you spend a dollar", entry:"You have an idea or a skill. No money spent yet.",
    exit:"Viability score 65+. Clear customer. Pricing confirmed.",
    desc:"Score your niche before building anything. Get real TAM, competitive landscape, pricing benchmarks and days-to-first-sale estimate for your exact industry and location.",
    outcomes:["Viability score out of 100","Real TAM/SAM/SOM","Recommended pricing","Days-to-first-sale estimate"] },
  { n:"02", icon:"⚡", title:"Launch",     color:"#1D9E75", revenue:"$0 → $10k MRR",           tool:"Orchestrator",    href:"/orchestrator",
    sub:"Idea to first revenue in 48 hours", entry:"Validated niche. Clear offer. 20 people to contact.",
    exit:"First paying customer. $1k MRR. NPS above 50.",
    desc:"Set one goal. 18 AI agents run in parallel and return one numbered action plan. Execute Priority 1 today. No team, no budget, no prior audience needed.",
    outcomes:["48-hour sprint to first revenue","18 agents in parallel","One unified action plan","Priority 1 done today"] },
  { n:"03", icon:"📈", title:"Optimise",   color:"#378ADD", revenue:"$10k → $50k MRR",         tool:"CXO Suite",       href:"/agents",
    sub:"Systematic weekly improvement", entry:"First 10 customers. Product works. Churn below 10%.",
    exit:"NPS 65+. Month-on-month growth 20%+. 80% retention at Day 90.",
    desc:"Every Monday, re-run the Orchestrator with your updated metrics. 11 CXO advisors analyse your pipeline, content and financials and surface the one lever to pull this week.",
    outcomes:["Weekly orchestrator rhythm","CDO analytics — activation and retention","CMO content compounding","COO retention and onboarding systems"] },
  { n:"04", icon:"🚀", title:"Scale",      color:"#7C3AED", revenue:"$50k → $500k ARR",         tool:"SIXXAB CRM",      href:"/crm",
    sub:"Revenue grows faster than founder hours", entry:"PMF confirmed. Repeatable sales motion. First hire made.",
    exit:"$500k ARR. Sales process runs without founder. Inbound generating.",
    desc:"SIXXAB CRM manages every contact across every agent. Marketing runs personalised outreach at scale. The CSO pipeline tracks every enterprise deal. The Finance agent tells you exactly when to hire.",
    outcomes:["SIXXAB CRM — full pipeline at scale","Automated outreach to hundreds of prospects","Enterprise deal tracking","Finance agent — hire timing model"] },
  { n:"05", icon:"💰", title:"Capitalise", color:"#DC2626", revenue:"$500k → $2M ARR",          tool:"Investor Hub",    href:"/investor",
    sub:"Raise capital. Lock enterprise deals.", entry:"Proven unit economics. MRR growing 15%+. Team of 3–6.",
    exit:"Seed or Series A closed. Enterprise contracts signed. Board in place.",
    desc:"The Investor Hub tracks every angel, VC and family office relationship. The Pitch Agent generates decks from live CRM data. The Corporate Board agents handle governance, M&A, legal compliance and exit planning.",
    outcomes:["Investor CRM — every relationship tracked","Pitch Agent — deck from live metrics","Corporate Board — governance, M&A, legal","CFO fundraising model — ask, valuation, dilution"] },
  { n:"06", icon:"🌍", title:"Global",     color:"#EC4899", revenue:"$2M → $10M ARR",            tool:"Vertical Packs",  href:"/verticals",
    sub:"The platform runs itself", entry:"Seed closed. Team of 8–15. Revenue in 2+ markets.",
    exit:"$10M ARR. Under 2 hrs/day founder input. 10+ countries.",
    desc:"Vertical Agent Packs deploy your model into any industry in any geography. The Advisor franchise extends reach without headcount. Corporate Board manages governance at scale. The CEO focuses on Series B.",
    outcomes:["<2 hrs/day founder input — platform autonomous","30 Vertical Agent Packs — Texas, US, Europe, Global","Advisor franchise — 20% rev share, zero headcount","Board governance — M&A, audit, exit, IPO"] },
]

// ── CXO suite (11 advisors) ───────────────────────────────────────────────────
const CXOS = [
  {id:"ceo",  title:"CEO",      icon:"ti-crown",               color:"#EF9F27", desc:"Vision, strategy, 48-hr sprint, investor narrative, Series B"},
  {id:"cmo",  title:"CMO",      icon:"ti-speakerphone",        color:"#D4537E", desc:"Marketing, content, LinkedIn, AppSumo, Product Hunt, SEO"},
  {id:"cso",  title:"CSO",      icon:"ti-trending-up",         color:"#1D9E75", desc:"Sales pipeline, demos, proposals, enterprise deals, partnerships"},
  {id:"cfo",  title:"CFO",      icon:"ti-chart-line",          color:"#378ADD", desc:"MRR, burn rate, LTV/CAC, fundraising model, Stripe reconciliation"},
  {id:"coo",  title:"COO",      icon:"ti-settings-automation", color:"#7C3AED", desc:"Onboarding, retention, support, process automation, SOPs"},
  {id:"cto",  title:"CTO",      icon:"ti-code",                color:"#0EA5E9", desc:"Tech stack, deployments, product roadmap, security, API integrations"},
  {id:"cdo",  title:"CDO",      icon:"ti-database",            color:"#16A34A", desc:"Analytics, funnel data, cohort analysis, activation metrics"},
  {id:"chro", title:"CHRO",     icon:"ti-users",               color:"#F59E0B", desc:"Hiring strategy, job descriptions, onboarding, team culture"},
  {id:"ciso", title:"CISO",     icon:"ti-shield-lock",         color:"#DC2626", desc:"Security, GDPR, SOC 2, API hygiene, incident response"},
  {id:"cio",  title:"CIO",      icon:"ti-currency-dollar",     color:"#B91C1C", desc:"Investor relations, due diligence, fundraising, enterprise contracts, valuation"},
  {id:"board",title:"Board",    icon:"ti-gavel",               color:"#1E3A5F", desc:"Corporate governance, M&A, legal compliance, audit, risk, exit planning"},
]

// ── Agents (26 horizontal + 10 vertical) ─────────────────────────────────────
const AGENT_GROUPS = [
  { label:"Strategy & Vision", color:"#EF9F27", agents:["Strategy","Pitch Deck","Financial Model"] },
  { label:"Content Studio", color:"#D4537E", agents:["LinkedIn Post","Email Campaign","Blog Post","Video Script","Ad Copy","Brand Story"] },
  { label:"Lead Gen", color:"#1D9E75", agents:["ICP Builder","Prospect Generator","Outreach Sequence","Lead Qualifier","Objection Handler"] },
  { label:"Sales", color:"#1D9E75", agents:["Sales","Lead Gen","Partnership"] },
  { label:"Finance", color:"#378ADD", agents:["Finance","Pricing","Compliance"] },
  { label:"Operations", color:"#7C3AED", agents:["Support","Ops"] },
  { label:"Technology", color:"#0EA5E9", agents:["Product","Tech","Security"] },
  { label:"Data", color:"#16A34A", agents:["Analytics","Intelligence"] },
  { label:"People", color:"#F59E0B", agents:["HR","HR Ops"] },
  { label:"Capitalise", color:"#DC2626", agents:["Investor Relations","Due Diligence","Board Comms","Fundraising","Enterprise Deals","Valuation"] },
  { label:"Governance", color:"#1E3A5F", agents:["Governance","M&A","Legal Counsel","Audit & Risk","Corp Compliance","Exit Strategy"] },
  { label:"Verticals", color:"#EC4899", agents:["HVAC","Real Estate","Legal","Consulting","Landscaping","Plumbing","Auto Repair","Health","Roofing","IT/MSP"] },
]

// ── Pricing tiers ─────────────────────────────────────────────────────────────
const TIERS = [
  { id:"starter", name:"Starter",  price:250,  badge:null,         highlight:false,
    tagline:"Validate and launch your niche",
    features:["SIXXAB Niche Selector — viability score, TAM, pricing","Founder Enterprise Orchestrator — 18 AI agents in parallel","AI Strategy Coach — unlimited sessions","Marketing Agent — personalised outreach scripts","Content Studio — social, email and blog generation","Lead Generation — ICP builder and prospect generator","Email support · Cancel anytime"] },
  { id:"pro",     name:"Pro",      price:999,  badge:"Most Popular",highlight:true,
    tagline:"Optimise and scale with 11 CXO advisors",
    features:["Everything in Starter — unlimited","Full 11-CXO Suite — CEO to Corporate Board","SIXXAB CRM — full contact management and pipeline","Proposal Writer — full proposals, SOW and case studies","Investor Hub — Capitalise phase and fundraising tools","Content Studio and Lead Gen — full access","Customer Success agent — onboarding and retention","Priority support · 2 discovery calls/month"] },
  { id:"agency",  name:"Agency",   price:2499, badge:null,         highlight:false,
    tagline:"Run multiple businesses and clients autonomously",
    features:["Everything in Pro — unlimited scale","10 team seats + white-label AI persona","30 Vertical Agent Packs — Texas, US and European markets","Corporate Board agents — governance, M&A, exit planning","SIXXAB Advisor franchise eligibility — 20% revenue share","API access for custom integrations","Dedicated customer success manager · Enterprise SLA","Custom onboarding workshop with Sunil"] },
]

// ── Verticals ─────────────────────────────────────────────────────────────────
const VERTICAL_TIERS = [
  { id:"texas", label:"🤠 Texas & Local", color:"#EF9F27", packs:[
    {icon:"❄️",name:"HVAC & Air Conditioning", color:"#0EA5E9",market:"47,000+ businesses",  href:"/verticals"},
    {icon:"🏠",name:"Real Estate & Property",  color:"#1D9E75",market:"150,000+ agents",     href:"/verticals"},
    {icon:"⚖️",name:"Legal Services",          color:"#7C3AED",market:"$8.2B market",        href:"/verticals"},
    {icon:"📊",name:"Business Consulting",     color:"#EF9F27",market:"12% YoY growth",      href:"/verticals"},
    {icon:"🌿",name:"Landscaping & Lawn Care", color:"#16A34A",market:"$1.4B market",        href:"/verticals"},
    {icon:"🔧",name:"Plumbing & Electrical",   color:"#DC2626",market:"35,000+ licensed",    href:"/verticals"},
    {icon:"🚗",name:"Auto Repair & Detailing", color:"#F59E0B",market:"$4.1B market",        href:"/verticals"},
    {icon:"💊",name:"Health & Wellness",       color:"#EC4899",market:"$2.8B market",        href:"/verticals"},
    {icon:"🏗️",name:"Roofing & Construction", color:"#6B7280",market:"#1 US roofing state",  href:"/verticals"},
    {icon:"💼",name:"IT Support & MSP",        color:"#378ADD",market:"$12.4B market",       href:"/verticals"},
  ]},
  { id:"us", label:"🇺🇸 US National", color:"#378ADD", packs:[
    {icon:"❄️",name:"HVAC — US National",      color:"#0284C7",market:"$156B market",        href:"/verticals"},
    {icon:"💳",name:"FinTech — US",            color:"#7C3AED",market:"$72B investment",     href:"/verticals"},
    {icon:"🛒",name:"E-Commerce — US",         color:"#F59E0B",market:"$1.1T market",        href:"/verticals"},
    {icon:"🏫",name:"EdTech — US",             color:"#8B5CF6",market:"$146B market",        href:"/verticals"},
    {icon:"🏨",name:"Hospitality — US",        color:"#EF4444",market:"$950B industry",      href:"/verticals"},
    {icon:"🏭",name:"Manufacturing — US",      color:"#64748B",market:"$2.9T GDP",           href:"/verticals"},
    {icon:"🚛",name:"Logistics & Supply Chain",color:"#0EA5E9",market:"$1.6T market",        href:"/verticals"},
    {icon:"🎬",name:"Media & Content — US",    color:"#D4537E",market:"$700B industry",      href:"/verticals"},
    {icon:"❤️",name:"Non-Profit — US",         color:"#16A34A",market:"1.5M organisations",  href:"/verticals"},
    {icon:"🏠",name:"Real Estate — US",        color:"#0D9488",market:"$4.4T market",        href:"/verticals"},
  ]},
  { id:"europe", label:"🌍 Europe & Global", color:"#7C3AED", packs:[
    {icon:"☁️",name:"SaaS — Europe",           color:"#1E3A5F",market:"€130B market",        href:"/verticals"},
    {icon:"💳",name:"FinTech — Europe",         color:"#4F46E5",market:"€100B ecosystem",    href:"/verticals"},
    {icon:"🏥",name:"HealthTech — Europe",      color:"#BE185D",market:"€46B digital health", href:"/verticals"},
    {icon:"⚖️",name:"Legal Services — Europe", color:"#6D28D9",market:"€200B market",        href:"/verticals"},
    {icon:"🏠",name:"Real Estate — Europe",    color:"#0F766E",market:"€1.4T market",        href:"/verticals"},
    {icon:"🛍️",name:"Retail & Commerce — EU", color:"#B45309",market:"€7.5T market",        href:"/verticals"},
    {icon:"🌱",name:"Sustainability & ESG",    color:"#15803D",market:"$40T global finance",  href:"/verticals"},
    {icon:"🏛️",name:"GovTech & Public Sector", color:"#1E40AF",market:"$1.1T global",        href:"/verticals"},
    {icon:"🏭",name:"Manufacturing — Europe",  color:"#475569",market:"€1.9T GDP",           href:"/verticals"},
    {icon:"❄️",name:"HVAC — Europe",           color:"#0369A1",market:"€119B market",        href:"/verticals"},
  ]},
]

// ── Social proof ──────────────────────────────────────────────────────────────
const TESTI = [
  {name:"Marcus T.",role:"Solo founder · Dallas",    avatar:"MT",quote:"Set one goal on Monday. By Thursday I had 3 demos booked and a close script. The orchestrator just works."},
  {name:"Priya S.", role:"Consultant · Mumbai",      avatar:"PS",quote:"The niche validator told me exactly where to focus. I stopped guessing and started executing."},
  {name:"Jason K.", role:"SaaS founder · London",    avatar:"JK",quote:"Switched from 11 separate tools to SIXXAB. Cut my ops time in half and know what to do every week."},
  {name:"Angela B.",role:"Agency owner · Dallas",    avatar:"AB",quote:"The HVAC vertical pack saved days of setup. My clients were getting outreach scripts on day one."},
  {name:"James P.", role:"E-commerce · Sydney",      avatar:"JP",quote:"The CXO suite gives me a CFO, CMO and COO perspective on every decision. Game changer."},
  {name:"Ravi M.",  role:"Tech founder · Singapore", avatar:"RM",quote:"Validated my niche in 90 seconds. Launched in 48 hours. The framework is genuinely different."},
]

export default function Index() {
  const [scrolled,      setScrolled]      = useState(false)
  const [activeStep,    setActiveStep]    = useState(0)
  const [activeVertical,setActiveVertical]= useState(0)
  const [activeTier,    setActiveTier]    = useState("texas")
  const [activeCxo,     setActiveCxo]     = useState(0)
  const [email,         setEmail]         = useState("")
  const [betaDone,      setBetaDone]      = useState(false)
  const [betaBusy,      setBetaBusy]      = useState(false)
  const [betaErr,       setBetaErr]       = useState("")
  const [loading,       setLoading]       = useState(false)
  const [selectedTier,  setSelectedTier]  = useState("")
  const pricingRef   = useRef(null)
  const frameworkRef = useRef(null)
  const agentsRef    = useRef(null)
  const verticalsRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", fn, { passive:true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s+1) % FRAMEWORK.length), 4000)
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
    if (!email||!email.includes("@")) { setBetaErr("Enter a valid email."); return }
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
      <Head>
        <title>SIXXAB AI — Autonomous Business Platform · Your business runs itself</title>
        <meta name="description" content="SIXXAB AI is the autonomous business platform that takes any business from $0 to $10M ARR. 6-phase framework. 11 CXO advisors. 36 specialist agents. 10 vertical packs. Plans from $250/mo."/>
        <link rel="canonical" href="https://startupsinabox.com"/>
        <meta property="og:title" content="SIXXAB AI — Your business runs itself."/>
        <meta property="og:description" content="6-phase framework. 11 CXO advisors. 36 AI agents. $0 to $10M ARR. Plans from $250/mo."/>
        <meta property="og:image" content="https://startupsinabox.com/api/og"/>
        <meta property="og:url" content="https://startupsinabox.com"/>
        <meta name="twitter:card" content="summary_large_image"/>
      </Head>
      <style>{`
        html{scroll-behavior:smooth}
        body{background:#fff;overflow-x:hidden}
        .btn-a{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 28px;border-radius:11px;background:${AMBER};color:${N};font-size:15px;font-weight:700;border:none;cursor:pointer;font-family:inherit;transition:all .18s;text-decoration:none}
        .btn-a:hover{opacity:.9}
        .btn-g{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:11px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);color:${CHALK};font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .18s;text-decoration:none}
        .btn-g:hover{background:rgba(255,255,255,.14)}
        .nav-a{font-size:13px;color:rgba(255,255,255,.55);text-decoration:none;cursor:pointer;transition:color .15s;background:none;border:none;font-family:inherit}
        .nav-a:hover{color:#fff}
        .card-h{background:#fff;border-radius:14px;border:1px solid #E2E8F0;overflow:hidden;transition:all .2s}
        .card-h:hover{border-color:#CBD5E1}
        .tier{background:#fff;border:1.5px solid #E8ECF4;border-radius:16px;padding:28px 22px;display:flex;flex-direction:column;transition:all .2s;position:relative}
        .tier:hover{transform:translateY(-4px);box-shadow:0 18px 44px rgba(0,0,0,.1)}
        .tier.pop{border:2px solid ${AMBER};background:#FFFBF2}
        .check{width:18px;height:18px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;margin-top:2px}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
        .tcard{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:22px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        .fu{animation:fadeUp .45s ease both}
        .sl{animation:slide .3s ease both}
        @media(max-width:860px){
  .hide-m{display:none!important}
  .g2,.g3{grid-template-columns:1fr!important}
}
@media(max-width:640px){
  .hero-ctas{flex-direction:column!important;align-items:stretch!important}
  .hero-ctas a,.hero-ctas button{width:100%!important;justify-content:center!important;text-align:center!important}
  .hero-pills{display:none!important}
  .nav-logo-sub{display:none!important}
  .framework-tabs{gap:4px!important}
  .framework-tabs button{padding:6px 10px!important;font-size:11px!important}
  .pricing-grid{grid-template-columns:1fr!important}
  .testi-grid{grid-template-columns:1fr!important}
}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:60,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5%",background:scrolled?"rgba(10,14,26,.96)":N,backdropFilter:"blur(18px)",transition:"all .3s",borderBottom:scrolled?"1px solid rgba(255,255,255,.07)":"1px solid rgba(255,255,255,.04)"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:9,textDecoration:"none"}}>
          <SixxabMark size={26}/>
          <SixxabWordmark/>
        </a>
        <div className="hide-m" style={{display:"flex",gap:18,alignItems:"center"}}>
          {[["Framework",()=>scrollTo(frameworkRef)],["Agents",()=>scrollTo(agentsRef)],["Verticals",()=>scrollTo(verticalsRef)],["Pricing",()=>scrollTo(pricingRef)]].map(([l,fn])=>(
            <button key={l} className="nav-a" onClick={fn}>{l}</button>
          ))}
          <a className="nav-a" href="/niche-validator">Niche Check</a>
          <a className="nav-a" href="/runbook">Runbook</a>
          <a className="nav-a" href="/mindset">Mental model</a>
          <a className="nav-a" href="/discovery">Book call</a>
          <button className="btn-a" style={{padding:"8px 18px",fontSize:13}} onClick={()=>scrollTo(pricingRef)}>Start free trial →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{minHeight:"100vh",background:N,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"120px 5% 80px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(rgba(239,159,39,.1) 1px,transparent 1px)`,backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"35%",left:"50%",transform:"translate(-50%,-50%)",width:900,height:700,background:"radial-gradient(ellipse,rgba(239,159,39,.13) 0%,transparent 65%)",pointerEvents:"none"}}/>

        {/* Phase pills */}
        <div className="fu" style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
          {FRAMEWORK.map((f,i)=>(
            <button key={i} onClick={()=>{setActiveStep(i);scrollTo(frameworkRef)}}
              style={{padding:"4px 13px",borderRadius:20,border:`1px solid ${f.color}55`,background:activeStep===i?`${f.color}22`:`${f.color}0A`,fontSize:11.5,fontWeight:500,color:activeStep===i?f.color:"rgba(245,245,240,.45)",cursor:"pointer",fontFamily:"inherit",transition:"all .18s"}}>
              {f.title}
            </button>
          ))}
        </div>

        <h1 className="fu" style={{fontFamily:"Georgia,serif",fontSize:"clamp(44px,8vw,100px)",fontWeight:700,color:CHALK,letterSpacing:"-1px",lineHeight:.96,marginBottom:22,maxWidth:1000}}>
          Your business<br/><span style={{color:AMBER,fontStyle:"italic"}}>runs itself.</span>
        </h1>

        <p className="fu" style={{fontSize:"clamp(15px,2vw,19px)",color:"rgba(245,245,240,.6)",maxWidth:580,lineHeight:1.8,marginBottom:32}}>
          SIXXAB AI is the autonomous business platform that takes any business from <strong style={{color:CHALK}}>$0 to $10M ARR</strong>. Six phases. 11 CXO advisors. 36 AI agents. <strong style={{color:CHALK}}>30 vertical packs across Texas, the US and Europe</strong>. One weekly goal.
        </p>

        <div className="fu hero-ctas" style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginBottom:44}}>
          <button className="btn-a" onClick={()=>scrollTo(pricingRef)}>Start free trial →</button>
          <a className="btn-g" href="/niche-validator">🎯 Validate your niche free</a>
          <a className="btn-g" href="/discovery" style={{borderColor:"rgba(239,159,39,.35)",color:AMBER}}>📅 Free strategy call</a>
          <a className="btn-g" href="/waitlist" style={{borderColor:"rgba(29,158,117,.35)",color:"#1D9E75"}}>📋 Join the waitlist</a>
        </div>

        {/* Value props strip */}
        <div className="fu hero-pills" style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          {[["6-phase framework","$0 → $10M ARR"],["11 CXO advisors","CEO to Corporate Board"],["36 AI agents","In parallel, 24/7"],["30 vertical packs","Texas · US · Europe · Global"],["From $250/mo","Professional plans"],["Corporate Board","Governance, M&A, Exit"]].map(([v,l],i)=>(
            <div key={i} style={{padding:"6px 15px",borderRadius:20,background:"rgba(255,255,255,.055)",border:"1px solid rgba(255,255,255,.1)",fontSize:12.5}}>
              <strong style={{color:CHALK}}>{v}</strong>&nbsp;<span style={{color:"rgba(245,245,240,.4)"}}>{l}</span>
            </div>
          ))}
        </div>

        {/* Cities */}
        <div style={{marginTop:40,display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",fontSize:12,color:"rgba(245,245,240,.28)"}}>
          <span style={{fontWeight:600,color:"rgba(245,245,240,.4)"}}>Serving founders in:</span>
          {["🇺🇸 Dallas · DFW","🇺🇸 Houston · NYC · LA","🇬🇧 London · UK","🇩🇪 Germany · DACH","🇫🇷 France","🇮🇳 Mumbai · Bangalore","🇸🇬 Singapore · SEA","🇦🇺 Sydney · Melbourne","🌍 30+ countries"].map((c,i)=>(
            <span key={i} style={{padding:"2px 10px",borderRadius:16,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)"}}>{c}</span>
          ))}
        </div>
      </section>

      {/* ── 6-PHASE FRAMEWORK ── */}
      <section ref={frameworkRef} style={{padding:"90px 5%",background:"#fff"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>The SIXXAB framework</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(28px,5vw,58px)",fontWeight:700,color:N,letterSpacing:"-0.5px",marginBottom:14,lineHeight:1.05}}>
            Validate. Launch. Optimise. Scale.<br/>Capitalise. Global.
          </h2>
          <p style={{fontSize:15.5,color:"#64748B",maxWidth:540,margin:"0 auto",lineHeight:1.75}}>
            Every business from $0 to $10M follows the same six phases. SIXXAB AI has a dedicated tool for each — with entry and exit gates so you always know exactly where you are.
          </p>
        </div>

        {/* Phase tabs */}
        <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap",marginBottom:36}}>
          {FRAMEWORK.map((f,i)=>(
            <button key={i} onClick={()=>setActiveStep(i)}
              style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,border:`2px solid ${activeStep===i?f.color:"#E2E8F0"}`,background:activeStep===i?`${f.color}08`:"#F8F9FA",cursor:"pointer",fontFamily:"inherit",transition:"all .18s"}}>
              <span style={{fontSize:16}}>{f.icon}</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:12.5,fontWeight:600,color:activeStep===i?N:"#64748B"}}>{f.title}</div>
                <div style={{fontSize:10.5,color:activeStep===i?f.color:"#94A3B8"}}>{f.revenue}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Active step */}
        <div key={activeStep} style={{maxWidth:960,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:26,alignItems:"start"}} className="sl">
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:step.color,letterSpacing:".08em"}}>PHASE {step.n}</div>
              <div style={{padding:"3px 10px",borderRadius:20,background:`${step.color}18`,border:`1px solid ${step.color}44`,fontSize:11,fontWeight:600,color:step.color}}>{step.revenue}</div>
            </div>
            <h3 style={{fontFamily:"Georgia,serif",fontSize:"clamp(26px,4vw,42px)",fontWeight:700,color:N,marginBottom:6,lineHeight:1.05}}>{step.title}</h3>
            <div style={{fontSize:14,fontWeight:500,color:step.color,marginBottom:16}}>{step.sub}</div>
            <p style={{fontSize:15,color:"#64748B",lineHeight:1.8,marginBottom:20}}>{step.desc}</p>
            {step.entry&&<div style={{marginBottom:10,padding:"9px 13px",borderRadius:9,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:12.5,color:"#475569"}}><strong style={{color:"#94A3B8",fontSize:10,textTransform:"uppercase",letterSpacing:".07em"}}>Entry: </strong>{step.entry}</div>}
            {step.exit&&<div style={{marginBottom:20,padding:"9px 13px",borderRadius:9,background:`${step.color}08`,border:`1px solid ${step.color}33`,fontSize:12.5,color:"#475569"}}><strong style={{color:step.color,fontSize:10,textTransform:"uppercase",letterSpacing:".07em"}}>Exit: </strong>{step.exit}</div>}
            <a href={step.href} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:10,background:step.color,color:["#EF9F27","#F59E0B","#DC2626","#B91C1C","#1E3A5F"].includes(step.color)?N:"#fff",fontSize:14,fontWeight:600,textDecoration:"none"}}>
              Open {step.tool} →
            </a>
          </div>
          <div style={{background:N,borderRadius:16,padding:26,border:`1px solid ${step.color}33`}}>
            <div style={{fontFamily:"monospace",fontSize:10,color:step.color,letterSpacing:".08em",marginBottom:14}}>WHAT YOU GET</div>
            {step.outcomes.map((o,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:13,alignItems:"flex-start"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:`${step.color}22`,border:`1px solid ${step.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:step.color,flexShrink:0}}>✓</div>
                <div style={{fontSize:13.5,color:"rgba(245,245,240,.85)",lineHeight:1.55}}>{o}</div>
              </div>
            ))}
            <div style={{marginTop:18,padding:"10px 13px",background:`${step.color}15`,borderRadius:10,border:`1px solid ${step.color}33`}}>
              <div style={{fontSize:10,fontWeight:600,color:step.color,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>Primary tool</div>
              <div style={{fontSize:14,fontWeight:600,color:CHALK}}>{step.tool}</div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:32}}>
          {FRAMEWORK.map((_,i)=>(
            <div key={i} onClick={()=>setActiveStep(i)} style={{width:activeStep===i?28:8,height:8,borderRadius:4,background:activeStep===i?step.color:"#E2E8F0",cursor:"pointer",transition:"all .25s"}}/>
          ))}
        </div>
      </section>

      {/* ── 11 CXO ADVISORS ── */}
      <section ref={agentsRef} style={{padding:"80px 5%",background:N}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Your global virtual C-suite</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(28px,5vw,58px)",fontWeight:700,color:CHALK,letterSpacing:"-0.5px",marginBottom:14,lineHeight:1.05}}>11 CXO Advisors
          </h2>
          <p style={{fontSize:15,color:"rgba(245,245,240,.55)",maxWidth:500,margin:"0 auto",lineHeight:1.75}}>
            From CEO strategy to Corporate Board governance — every business function covered by an AI advisor available 24/7.
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,maxWidth:1060,margin:"0 auto 28px"}}>
          {CXOS.map((c,i)=>(
            <div key={i} style={{padding:"14px 14px",borderRadius:12,border:`1px solid ${c.color}33`,background:`${c.color}08`,transition:"all .18s",cursor:"default"}}
              onMouseOver={e=>{e.currentTarget.style.background=`${c.color}18`;e.currentTarget.style.borderColor=`${c.color}66`}}
              onMouseOut={e=>{e.currentTarget.style.background=`${c.color}08`;e.currentTarget.style.borderColor=`${c.color}33`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                <div style={{width:30,height:30,borderRadius:8,background:`${c.color}20`,border:`1px solid ${c.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <i className={`ti ${c.icon}`} style={{fontSize:14,color:c.color}} aria-hidden="true"/>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:CHALK}}>{c.title}</div>
              </div>
              <div style={{fontSize:11,color:"rgba(245,245,240,.5)",lineHeight:1.5}}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Agent groups */}
        <div style={{maxWidth:1060,margin:"0 auto"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(245,245,240,.35)",marginBottom:16,textAlign:"center"}}>36 Specialist Agents across all functions</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
            {AGENT_GROUPS.map(g=>(
              <div key={g.label} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:20,background:`${g.color}12`,border:`1px solid ${g.color}33`}}>
                <span style={{fontSize:10,fontWeight:700,color:g.color,textTransform:"uppercase",letterSpacing:".07em"}}>{g.label}</span>
                <span style={{width:1,height:10,background:`${g.color}44`}}/>
                {g.agents.map((a,i)=>(
                  <span key={i} style={{fontSize:11,color:"rgba(245,245,240,.65)",whiteSpace:"nowrap"}}>{a}{i<g.agents.length-1?<span style={{color:`${g.color}66`}}> · </span>:""}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Board highlight */}
        <div style={{maxWidth:1060,margin:"28px auto 0",padding:"20px 24px",borderRadius:16,background:"rgba(30,58,95,.4)",border:"1px solid rgba(30,58,95,.8)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(30,58,95,.6)",border:"1.5px solid rgba(30,58,95,1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-gavel" style={{fontSize:20,color:"#93C5FD"}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:CHALK,marginBottom:3}}>Corporate Board & Governance</div>
              <div style={{fontSize:12.5,color:"rgba(245,245,240,.5)",lineHeight:1.5}}>7 board-level agents: Governance · M&A · Legal Counsel · Audit & Risk · Board Comms · Corp Compliance · Exit Strategy</div>
            </div>
          </div>
          <a href="/agents" style={{padding:"9px 20px",borderRadius:9,background:"rgba(30,58,95,.8)",border:"1px solid rgba(147,197,253,.3)",color:"#93C5FD",fontSize:13,fontWeight:600,textDecoration:"none",whiteSpace:"nowrap"}}>Open Board →</a>
        </div>
        <div style={{textAlign:"center",marginTop:28}}>
          <a href="/agents" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 28px",borderRadius:10,background:AMBER,color:N,fontSize:14,fontWeight:700,textDecoration:"none"}}>Open CXO Suite →</a>
        </div>
      </section>

      {/* ── GLOBAL VERTICAL PACKS ── */}
      <section ref={verticalsRef} style={{padding:"80px 5%",background:"#fff"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>30 vertical agent packs · 3 geographic tiers</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(28px,5vw,58px)",fontWeight:700,color:N,letterSpacing:"-0.5px",marginBottom:14,lineHeight:1.05}}>
            Texas. United States. Europe.<br/>
            <span style={{color:AMBER,fontStyle:"italic"}}>Any industry. Any market.</span>
          </h2>
          <p style={{fontSize:15,color:"#64748B",maxWidth:600,margin:"0 auto",lineHeight:1.75}}>
            Every vertical pack is pre-configured with industry language, local regulations, compliance requirements and market-specific workflows. Pick your industry and geography — agents are ready on day one.
          </p>
        </div>

        {/* Tier tabs */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:28,flexWrap:"wrap"}}>
          {VERTICAL_TIERS.map(t=>(
            <button key={t.id} onClick={()=>{setActiveTier(t.id);setActiveVertical(0)}}
              style={{padding:"9px 22px",borderRadius:10,border:`2px solid ${activeTier===t.id?t.color:"#E2E8F0"}`,background:activeTier===t.id?`${t.color}10`:"#F8F9FA",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:activeTier===t.id?600:400,color:activeTier===t.id?N:"#64748B",transition:"all .15s",display:"flex",alignItems:"center",gap:7}}>
              {t.label}
              <span style={{padding:"1px 8px",borderRadius:12,background:`${t.color}20`,color:t.color,fontSize:11,fontWeight:700}}>10</span>
            </button>
          ))}
        </div>

        {/* Pack grid */}
        {VERTICAL_TIERS.filter(t=>t.id===activeTier).map(tier=>(
          <div key={tier.id} style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,maxWidth:1060,margin:"0 auto 28px"}}>
            {tier.packs.map((v,i)=>(
              <a key={i} href={v.href}
                style={{padding:"16px 12px",borderRadius:12,border:`1.5px solid ${v.color}33`,background:`${v.color}06`,cursor:"pointer",textAlign:"center",textDecoration:"none",transition:"all .15s",display:"block"}}
                onMouseOver={e=>{e.currentTarget.style.background=`${v.color}14`;e.currentTarget.style.borderColor=`${v.color}77`;e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseOut={e=>{e.currentTarget.style.background=`${v.color}06`;e.currentTarget.style.borderColor=`${v.color}33`;e.currentTarget.style.transform="none"}}>
                <div style={{fontSize:26,marginBottom:7}}>{v.icon}</div>
                <div style={{fontSize:11.5,fontWeight:600,color:N,lineHeight:1.3,marginBottom:5}}>{v.name}</div>
                <div style={{fontSize:9.5,fontWeight:600,color:v.color,padding:"2px 6px",background:`${v.color}15`,borderRadius:7,display:"inline-block"}}>{v.market}</div>
              </a>
            ))}
          </div>
        ))}

        {/* Tier-specific sub-copy */}
        {activeTier==="texas" && (
          <div style={{maxWidth:1060,margin:"0 auto 28px",padding:"14px 20px",borderRadius:12,background:"#FFFBF2",border:"1px solid rgba(239,159,39,.3)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:3}}>🤠 Built for Dallas, DFW and Texas</div>
              <div style={{fontSize:12.5,color:"#64748B"}}>All scripts, pricing benchmarks and compliance guidance pre-tuned for Texas market conditions, customer language and local regulations.</div>
            </div>
            <a href="/niche-validator" style={{padding:"9px 20px",borderRadius:9,background:AMBER,color:N,fontSize:13,fontWeight:600,textDecoration:"none",whiteSpace:"nowrap"}}>Validate Texas niche →</a>
          </div>
        )}
        {activeTier==="us" && (
          <div style={{maxWidth:1060,margin:"0 auto 28px",padding:"14px 20px",borderRadius:12,background:"#EFF6FF",border:"1px solid #BFDBFE",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:3}}>🇺🇸 US national compliance pre-configured</div>
              <div style={{fontSize:12.5,color:"#64748B"}}>Federal and state regulations, SEC/FINRA/DOT/OSHA requirements, GSA procurement and US market language — all pre-built into every agent.</div>
            </div>
            <a href="/niche-validator" style={{padding:"9px 20px",borderRadius:9,background:"#378ADD",color:"#fff",fontSize:13,fontWeight:600,textDecoration:"none",whiteSpace:"nowrap"}}>Validate US niche →</a>
          </div>
        )}
        {activeTier==="europe" && (
          <div style={{maxWidth:1060,margin:"0 auto 28px",padding:"14px 20px",borderRadius:12,background:"#F5F3FF",border:"1px solid #C4B5FD",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:3}}>🌍 GDPR · DORA · MDR · CSRD · FCA — EU/UK compliance built in</div>
              <div style={{fontSize:12.5,color:"#64748B"}}>Every European pack has regulatory frameworks pre-loaded: GDPR, EU AI Act, PSD2, MDR, CSRD, FCA, G-Cloud and EU public procurement — ready on day one.</div>
            </div>
            <a href="/niche-validator" style={{padding:"9px 20px",borderRadius:9,background:"#7C3AED",color:"#fff",fontSize:13,fontWeight:600,textDecoration:"none",whiteSpace:"nowrap"}}>Validate European niche →</a>
          </div>
        )}

        <div style={{textAlign:"center",display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/verticals" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 28px",borderRadius:10,background:N,color:CHALK,fontSize:14,fontWeight:700,textDecoration:"none"}}>Explore all 30 vertical packs →</a>
          <a href="/niche-validator" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 28px",borderRadius:10,border:"1.5px solid #E2E8F0",color:N,fontSize:14,fontWeight:500,textDecoration:"none"}}>🎯 Validate your niche free →</a>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section ref={pricingRef} style={{padding:"80px 5%",background:N}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Pricing</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(28px,5vw,58px)",fontWeight:700,color:CHALK,letterSpacing:"-0.5px",marginBottom:14,lineHeight:1.05}}>One price. The full system.</h2>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 20px",borderRadius:20,background:"rgba(239,159,39,.15)",border:`1.5px solid ${AMBER}66`,fontSize:14,fontWeight:500,color:AMBER}}>
            Professional pricing. No lock-in. Cancel anytime.
          </div>
        </div>
        <div className="g3" style={{maxWidth:1060,margin:"0 auto"}}>
          {TIERS.map(tier=>(
            <div key={tier.id} className={`tier${tier.highlight?" pop":""}`}>
              {tier.badge&&<div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:AMBER,color:N,fontSize:11,fontWeight:700,padding:"5px 16px",borderRadius:20,boxShadow:`0 4px 12px ${AMBER}55`,whiteSpace:"nowrap"}}>{tier.badge}</div>}
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:N}}>{tier.name}</div>
                  <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:8,background:"#EEF2FF",color:"#3D52A0"}}>{tier.phase}</span>
                </div>
                <div style={{fontSize:13,color:"#64748B"}}>{tier.tagline}</div>
              </div>
              <div style={{marginBottom:18}}>
                <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4}}>
                  <span style={{fontFamily:"Georgia,serif",fontSize:48,color:tier.highlight?AMBER:N,lineHeight:1,fontWeight:700}}>${tier.price}</span>
                  <span style={{fontSize:14,color:"#94A3B8"}}>/mo</span>
                </div>
                <div style={{fontSize:12,color:"#64748B",marginTop:2}}>Billed monthly · Cancel anytime</div>
              </div>
              <ul style={{listStyle:"none",flex:1,marginBottom:22,display:"flex",flexDirection:"column",gap:8}}>
                {tier.features.map(f=>(
                  <li key={f} style={{display:"flex",gap:9,fontSize:13,color:N,alignItems:"flex-start"}}>
                    <span className="check" style={{background:tier.highlight?"rgba(239,159,39,.15)":"#F1F5F9",color:tier.highlight?AMBER:"#64748B"}}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={()=>handleCheckout(tier)} disabled={loading&&selectedTier===tier.id}
                style={{width:"100%",padding:14,borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",border:"none",fontFamily:"inherit",background:tier.highlight?AMBER:"#fff",color:tier.highlight?N:N,border:tier.highlight?"none":"2px solid #E2E8F0",opacity:loading&&selectedTier===tier.id?.6:1,transition:"all .18s"}}>
                {loading&&selectedTier===tier.id?"Opening…":`Start for $${tier.founding}/mo →`}
              </button>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",marginTop:24,fontSize:14,color:"rgba(245,245,240,.4)"}}>
          🛡️ <strong style={{color:"rgba(245,245,240,.6)"}}>14-day free trial on all plans.</strong> Full refund if SIXXAB AI doesn't help you make progress.
        </p>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{padding:"72px 5%",background:"#F8F9FA"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>From the community</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(24px,4vw,48px)",fontWeight:700,color:N,letterSpacing:"-0.5px"}}>What founders say</h2>
        </div>
        <div className="g3" style={{maxWidth:1060,margin:"0 auto"}}>
          {TESTI.map((t,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:14,border:"1px solid #E8ECF4",padding:"22px",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
              <div style={{color:AMBER,fontSize:13,letterSpacing:2,marginBottom:12}}>★★★★★</div>
              <p style={{fontSize:14,color:"#475569",lineHeight:1.8,marginBottom:16,fontStyle:"italic"}}>"{t.quote}"</p>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(239,159,39,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia",fontSize:12,fontWeight:700,color:AMBER}}>{t.avatar}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:N}}>{t.name}</div>
                  <div style={{fontSize:11,color:"#94A3B8"}}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCOVERY CTA ── */}
      <section style={{padding:"64px 5%",background:"#fff"}}>
        <div style={{maxWidth:880,margin:"0 auto",background:N,borderRadius:20,padding:"44px",display:"grid",gridTemplateColumns:"1fr auto",gap:32,alignItems:"center",flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Free · 20 minutes · No pitch</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(22px,4vw,40px)",fontWeight:700,color:CHALK,letterSpacing:"-0.5px",lineHeight:1.15,marginBottom:12}}>
              Talk to Sunil. Validate your niche.<br/>Get your plan.
            </h2>
            <p style={{fontSize:14,color:"rgba(245,245,240,.5)",lineHeight:1.75,maxWidth:400}}>20 minutes. Walk away knowing if your niche is viable, which phase you're in, and what to do in the next 48 hours.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,minWidth:190}}>
            <a href="/discovery" className="btn-a" style={{justifyContent:"center"}}>📅 Book free call</a>
            <a href="/niche-validator" className="btn-g" style={{justifyContent:"center",fontSize:13}}>🎯 Validate first</a>
            <a href="/runbook" className="btn-g" style={{justifyContent:"center",fontSize:13,color:"rgba(245,245,240,.5)"}}>📖 Read the runbook</a>
          </div>
        </div>
      </section>

      {/* ── BETA CTA ── */}
      <section style={{padding:"72px 5%",background:AMBER,textAlign:"center"}}>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(28px,5vw,56px)",fontWeight:700,color:N,letterSpacing:"-0.5px",lineHeight:1.05,marginBottom:10}}>Get 50% off. Locked forever.</h2>
        <p style={{fontSize:15,color:"rgba(10,14,26,.62)",marginBottom:28,maxWidth:380,margin:"0 auto 28px",lineHeight:1.65}}>
          Start with a 14-day free trial.<br/>No credit card required on Starter.
        </p>
        {betaDone ? (
          <div style={{background:"rgba(10,14,26,.1)",borderRadius:14,padding:"18px 28px",display:"inline-block"}}>
            <p style={{fontSize:16,fontWeight:700,color:N,marginBottom:5}}>🎉 You're in!</p>
            <p style={{fontSize:14,color:"rgba(10,14,26,.65)",marginBottom:14}}>Founding member details on the way.</p>
            <button onClick={()=>scrollTo(pricingRef)} style={{padding:"11px 22px",borderRadius:9,background:N,color:CHALK,fontSize:14,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Pick your plan →</button>
          </div>
        ):(
          <div style={{maxWidth:480,margin:"0 auto"}}>
            <form onSubmit={handleBeta} style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <input type="email" placeholder="Enter your email" value={email} onChange={e=>{setEmail(e.target.value);setBetaErr("")}} required
                style={{flex:1,minWidth:200,padding:"13px 16px",borderRadius:9,border:"2px solid transparent",fontSize:14,fontFamily:"inherit",background:"rgba(10,14,26,.1)",color:N,outline:"none"}}/>
              <button type="submit" disabled={betaBusy}
                style={{padding:"13px 22px",borderRadius:9,background:N,color:CHALK,fontSize:14,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"inherit",opacity:betaBusy?.65:1,whiteSpace:"nowrap"}}>
                {betaBusy?"Sending…":"Start free trial →"}
              </button>
            </form>
            {betaErr&&<p style={{fontSize:13,color:"rgba(120,20,20,.8)",fontWeight:500,marginBottom:8}}>⚠ {betaErr}</p>}
            <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
              {["✓ No credit card required","✓ Cancel anytime","✓ Rate locked forever"].map((t,i)=><span key={i} style={{fontSize:12,color:"rgba(10,14,26,.48)"}}>{t}</span>)}
            </div>
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:"#111520",padding:"32px 5%"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:24,marginBottom:28}}>
            <div>
              <a href="/" style={{display:"flex",alignItems:"center",gap:9,textDecoration:"none",marginBottom:10}}>
                <SixxabMark size={22}/>
                <SixxabWordmark/>
              </a>
              <p style={{fontSize:12,color:"rgba(255,255,255,.3)",maxWidth:220,lineHeight:1.7}}>The autonomous business platform. From $0 to $10M ARR. 30 vertical packs. Texas · US · Europe · Global.</p>
            </div>
            <div style={{display:"flex",gap:40,flexWrap:"wrap"}}>
              {[
                {heading:"Platform",links:[["Orchestrator","/orchestrator"],["CXO Suite","/agents"],["SIXXAB CRM","/crm"],["Content Studio","/studio"],["Lead Gen","/leads"],["Proposals","/proposal"],["Niche Selector","/niche-validator"],["Investor Hub","/investor"],["Vertical Packs","/verticals"]]},
                {heading:"Learn",links:[["Runbook","/runbook"],["Mental Model","/mindset"],["Roadmap","/roadmap"],["AI Coach","/coach"],["Validate Idea","/validate"],["Join Waitlist","/waitlist"],["Discovery Call","/discovery"],["Contact","/contact"]]},
                {heading:"Legal",links:[["Terms","/terms"],["Privacy","/privacy"],["Sitemap","/sitemap.xml"]]},
              ].map(col=>(
                <div key={col.heading}>
                  <div style={{fontSize:10.5,fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:12}}>{col.heading}</div>
                  {col.links.map(([l,h])=>(
                    <a key={l} href={h} style={{display:"block",fontSize:13,color:"rgba(255,255,255,.45)",textDecoration:"none",marginBottom:8}}
                      onMouseOver={e=>e.target.style.color="#fff"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,.45)"}>{l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,.22)"}}>© 2025 SIXXAB AI · Autonomous Business Platform · Dallas, TX</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,.18)"}}>Validate · Launch · Optimise · Scale · Capitalise · Global · $0 → $10M</span>
          </div>
        </div>
      </footer>
    </>
  )
}
