// pages/index.js — SIXXAB AI · Landing Page
// Clean, simple, grouped — $0 to $10M ARR
import Head from "next/head"
import { useState, useEffect, useRef } from "react"
import { SixxabMark, SixxabWordmark } from "../components/SixxabNav"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

const PHASES = [
  { n:"01", title:"Validate",   color:"#EF9F27", revenue:"$0 → First customer",  tool:"Niche Selector",  href:"/niche-validator",
    desc:"Score your niche before you build. Get market size, competition and pricing in 60 seconds." },
  { n:"02", title:"Launch",     color:"#1D9E75", revenue:"$0 → $10k MRR",         tool:"Orchestrator",    href:"/orchestrator",
    desc:"Set one goal. 18 agents run in parallel. One action plan. First revenue in 48 hours." },
  { n:"03", title:"Optimise",   color:"#378ADD", revenue:"$10k → $50k MRR",       tool:"CXO Suite",       href:"/agents",
    desc:"11 CXO advisors analyse your pipeline every week and surface the one lever to pull." },
  { n:"04", title:"Scale",      color:"#7C3AED", revenue:"$50k → $500k ARR",      tool:"SIXXAB CRM",      href:"/crm",
    desc:"Full CRM with lead generation, outreach sequences, proposal writer and retention pipeline." },
  { n:"05", title:"Capitalise", color:"#DC2626", revenue:"$500k → $2M ARR",       tool:"Investor Hub",    href:"/investor",
    desc:"Track investors, generate pitch decks from live data. Corporate Board handles governance." },
  { n:"06", title:"Global",     color:"#EC4899", revenue:"$2M → $10M ARR",        tool:"Vertical Packs",  href:"/verticals",
    desc:"30 vertical packs across Texas, US and Europe. Platform runs itself under 2hrs/day." },
]

const TOOL_GROUPS = [
  { label:"Strategy",   color:"#EF9F27", icon:"ti-crown",              tools:[
    { name:"Orchestrator",  href:"/orchestrator", desc:"18 agents, one goal, one plan" },
    { name:"CXO Suite",     href:"/agents",       desc:"11 advisors — CEO to Board" },
    { name:"AI Coach",      href:"/coach",        desc:"Personal strategy coach" },
  ]},
  { label:"Sales & Marketing", color:"#D4537E", icon:"ti-speakerphone", tools:[
    { name:"Content Studio",href:"/studio",       desc:"10 content types, all platforms" },
    { name:"Lead Generation",href:"/leads",       desc:"ICP, prospects, outreach" },
    { name:"Social Hub",    href:"/social",       desc:"LinkedIn, X, Facebook, Instagram, YouTube" },
    { name:"Calendar",      href:"/calendar",     desc:"Monthly & yearly publishing schedule" },
  ]},
  { label:"Sales & Close",     color:"#1D9E75", icon:"ti-trending-up",  tools:[
    { name:"Proposal Writer",  href:"/proposal",  desc:"Proposals, SOW, case studies" },
    { name:"SIXXAB CRM",       href:"/crm",       desc:"Full pipeline with scoring" },
    { name:"Retention Pipeline",href:"/retention",desc:"Prospect to renewal lifecycle" },
  ]},
  { label:"Finance & Growth",  color:"#378ADD", icon:"ti-currency-dollar", tools:[
    { name:"Investor Hub",  href:"/investor",     desc:"Pitch, CRM, fundraising model" },
    { name:"Vertical Packs",href:"/verticals",    desc:"30 industry packs, 3 geographies" },
    { name:"Niche Selector",href:"/niche-validator",desc:"Validate before you build" },
  ]},
  { label:"Learn & Plan",      color:"#7C3AED", icon:"ti-book",          tools:[
    { name:"Roadmap",       href:"/roadmap",      desc:"$0 to $10M milestone tracker" },
    { name:"Runbook",       href:"/runbook",      desc:"Platform guide, every module" },
    { name:"Mental Model",  href:"/mindset",      desc:"12 laws of autonomous business" },
    { name:"Validate Ideas",href:"/validate",     desc:"Customer interview guide" },
  ]},
]

const PLANS = [
  { name:"Starter",  price:250,  highlight:false,
    tagline:"Validate and launch",
    features:["Niche Selector","Orchestrator — 18 agents","Content Studio","Lead Generation","AI Coach","Email support"] },
  { name:"Pro",      price:999,  highlight:true,
    tagline:"Scale with full CXO suite",
    features:["Everything in Starter","11 CXO advisors — CEO to Board","SIXXAB CRM + pipeline","Social Hub — all platforms","Proposal Writer","Investor Hub","Customer Success agents","Priority support"] },
  { name:"Agency",   price:2499, highlight:false,
    tagline:"Multiple businesses and clients",
    features:["Everything in Pro","10 team seats + white-label","30 Vertical Agent Packs","Corporate Board agents","Advisor franchise — 20% rev share","API access","Dedicated success manager"] },
]

const PROOF = [
  { init:"MT", name:"Marcus T.",  role:"Founder · Dallas",   text:"Set one goal Monday. By Thursday I had 3 demos booked. The Orchestrator just works." },
  { init:"PS", name:"Priya S.",   role:"Consultant · Mumbai", text:"The Niche Selector told me where to focus. I stopped guessing and started executing." },
  { init:"JK", name:"Jason K.",   role:"SaaS · London",       text:"Switched from 11 tools to SIXXAB. Cut ops time in half. Know what to do every week." },
]

export default function Home() {
  const [scrolled,   setScrolled]   = useState(false)
  const [activePhase,setActivePhase]= useState(0)
  const [email,      setEmail]      = useState("")
  const [done,       setDone]       = useState(false)
  const [busy,       setBusy]       = useState(false)
  const pricingRef = useRef(null)
  const toolsRef   = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", fn, {passive:true})
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActivePhase(p=>(p+1)%PHASES.length), 3500)
    return () => clearInterval(t)
  }, [])

  const scrollTo = r => r.current?.scrollIntoView({behavior:"smooth"})

  async function joinWaitlist(e) {
    e.preventDefault()
    if (!email.includes("@")) return
    setBusy(true)
    try {
      await fetch("/api/waitlist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"Waitlist",email})})
      setDone(true)
    } catch {}
    setBusy(false)
  }

  const phase = PHASES[activePhase]

  return (
    <>
      <Head>
        <title>SIXXAB AI — Autonomous Business Platform · $0 to $10M ARR</title>
        <meta name="description" content="SIXXAB AI is the autonomous business platform that takes any business from $0 to $10M ARR. 6 phases, 11 CXO advisors, 36 AI agents, 30 vertical packs. From $250/mo."/>
        <link rel="canonical" href="https://www.startupsinabox.com"/>
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',system-ui,sans-serif;background:#fff;color:${N};-webkit-font-smoothing:antialiased}
        h1,h2,h3{letter-spacing:-0.03em;font-family:'Georgia',serif}
        a{text-decoration:none;color:inherit}
        .btn{display:inline-flex;align-items:center;gap:7px;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:opacity .15s}
        .btn:hover{opacity:.88}
        .btn-amber{background:${AMBER};color:${N}}
        .btn-dark{background:${N};color:${CHALK}}
        .btn-ghost{background:transparent;border:1.5px solid rgba(255,255,255,.25);color:${CHALK}}
        .card{background:#fff;border-radius:12px;border:1px solid #E2E8F0}
        @media(max-width:640px){
          .hide-mobile{display:none!important}
          .stack-mobile{flex-direction:column!important}
          .full-mobile{width:100%!important;min-width:0!important}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:58,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5%",background:scrolled?"rgba(10,14,26,.97)":N,backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,.06)",transition:"background .3s"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:8}}>
          <SixxabMark size={24}/>
          <SixxabWordmark/>
        </a>
        <div className="hide-mobile" style={{display:"flex",gap:20,alignItems:"center"}}>
          {[["Platform",()=>scrollTo(toolsRef)],["Pricing",()=>scrollTo(pricingRef)]].map(([l,fn])=>(
            <button key={l} onClick={fn} style={{background:"none",border:"none",color:"rgba(245,245,240,.55)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}
              onMouseOver={e=>e.target.style.color="#fff"} onMouseOut={e=>e.target.style.color="rgba(245,245,240,.55)"}>{l}</button>
          ))}
          <a href="/niche-validator" style={{fontSize:13,color:"rgba(245,245,240,.55)"}}
            onMouseOver={e=>e.target.style.color="#fff"} onMouseOut={e=>e.target.style.color="rgba(245,245,240,.55)"}>Free niche check</a>
          <a href="/login" style={{fontSize:13,color:"rgba(245,245,240,.55)"}}
            onMouseOver={e=>e.target.style.color="#fff"} onMouseOut={e=>e.target.style.color="rgba(245,245,240,.55)"}>Sign in</a>
          <button className="btn btn-amber" style={{padding:"8px 18px",fontSize:13}} onClick={()=>scrollTo(pricingRef)}>Get started</button>
        </div>
        {/* Mobile sign in */}
        <a href="/login" className="hide-mobile" style={{display:"none"}}>
          <button className="btn btn-amber" style={{padding:"7px 14px",fontSize:12}}>Sign in</button>
        </a>
        <a href="/login" style={{display:"none"}} className="show-mobile">Sign in</a>
        <button className="btn btn-amber" style={{padding:"7px 14px",fontSize:12}} onClick={()=>scrollTo(pricingRef)}>Get started</button>
      </nav>

      {/* ── HERO ── */}
      <section style={{background:N,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"100px 6% 60px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(239,159,39,.08) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"40%",left:"50%",transform:"translate(-50%,-50%)",width:800,height:500,background:"radial-gradient(ellipse,rgba(239,159,39,.12) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1,maxWidth:760}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",borderRadius:20,border:"1px solid rgba(239,159,39,.3)",background:"rgba(239,159,39,.08)",fontSize:12,fontWeight:500,color:AMBER,marginBottom:22}}>
            Phase {phase.n} — {phase.title} · {phase.revenue}
          </div>
          <h1 style={{fontSize:"clamp(38px,8vw,88px)",fontWeight:700,color:CHALK,lineHeight:.97,marginBottom:18}}>
            Your business<br/><span style={{color:AMBER,fontStyle:"italic"}}>runs itself.</span>
          </h1>
          <p style={{fontSize:"clamp(15px,2vw,18px)",color:"rgba(245,245,240,.6)",lineHeight:1.8,maxWidth:520,margin:"0 auto 28px"}}>
            The autonomous business platform that takes any business from <strong style={{color:CHALK}}>$0 to $10M ARR</strong>. Six phases. 11 CXO advisors. 36 AI agents. 30 vertical packs.
          </p>
          <div className="stack-mobile" style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:36}}>
            <button className="btn btn-amber full-mobile" onClick={()=>scrollTo(pricingRef)}>Start free trial →</button>
            <a className="btn btn-ghost full-mobile" href="/niche-validator">🎯 Validate your niche free</a>
            <a className="btn btn-ghost full-mobile" href="/discovery">📅 Book a strategy call</a>
          </div>
          {/* Stats strip */}
          <div className="hide-mobile" style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
            {[["6 phases","$0 to $10M"],["11 CXO advisors","CEO to Board"],["36 AI agents","24/7 parallel"],["30 vertical packs","TX · US · EU"],["From $250/mo","14-day free trial"]].map(([v,l])=>(
              <div key={v} style={{padding:"5px 13px",borderRadius:20,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.09)",fontSize:12.5}}>
                <strong style={{color:CHALK}}>{v}</strong> <span style={{color:"rgba(245,245,240,.4)"}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6 PHASES ── */}
      <section style={{background:"#fff",padding:"72px 6%"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>The SIXXAB Framework</div>
          <h2 style={{fontSize:"clamp(26px,4vw,48px)",fontWeight:700,color:N,marginBottom:12}}>Six phases. Zero guesswork.</h2>
          <p style={{fontSize:15,color:"#64748B",maxWidth:480,margin:"0 auto"}}>Every business from $0 to $10M follows the same sequence. SIXXAB AI has a dedicated tool for each phase — with entry and exit gates.</p>
        </div>
        {/* Phase selector */}
        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
          {PHASES.map((p,i)=>(
            <button key={i} onClick={()=>setActivePhase(i)}
              style={{padding:"7px 14px",borderRadius:9,border:`1.5px solid ${activePhase===i?p.color:"#E2E8F0"}`,background:activePhase===i?`${p.color}10`:"#F8F9FA",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:activePhase===i?600:400,color:activePhase===i?p.color:"#64748B",transition:"all .15s"}}>
              {p.n} {p.title}
            </button>
          ))}
        </div>
        {/* Active phase */}
        <div key={activePhase} style={{maxWidth:800,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,animation:"fadeUp .3s ease"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:phase.color,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Phase {phase.n} · {phase.revenue}</div>
            <h3 style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:700,color:N,marginBottom:10,lineHeight:1.05}}>{phase.title}</h3>
            <p style={{fontSize:15,color:"#64748B",lineHeight:1.8,marginBottom:18}}>{phase.desc}</p>
            <a href={phase.href} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:10,background:phase.color,color:phase.color==="#EF9F27"?N:"#fff",fontSize:14,fontWeight:600}}>
              Open {phase.tool} →
            </a>
          </div>
          <div style={{background:N,borderRadius:14,padding:"22px",border:`1px solid ${phase.color}33`}}>
            <div style={{fontSize:10,fontWeight:700,color:phase.color,letterSpacing:".1em",textTransform:"uppercase",marginBottom:12}}>Primary tool</div>
            <div style={{fontSize:20,fontWeight:700,color:CHALK,fontFamily:"Georgia,serif",marginBottom:8}}>{phase.tool}</div>
            <div style={{fontSize:13,color:"rgba(245,245,240,.55)",lineHeight:1.7}}>{phase.desc}</div>
            <div style={{marginTop:16,padding:"10px 12px",borderRadius:9,background:`${phase.color}18`,border:`1px solid ${phase.color}33`,fontSize:12,fontWeight:600,color:phase.color}}>
              {phase.revenue}
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM TOOLS — grouped ── */}
      <section ref={toolsRef} style={{background:"#F4F4F0",padding:"72px 6%"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>The Platform</div>
          <h2 style={{fontSize:"clamp(26px,4vw,48px)",fontWeight:700,color:N,marginBottom:12}}>Everything your business needs.</h2>
          <p style={{fontSize:15,color:"#64748B",maxWidth:480,margin:"0 auto"}}>36 AI agents across 5 functional areas. Every tool connects to every other tool.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14,maxWidth:1100,margin:"0 auto"}}>
          {TOOL_GROUPS.map((g,gi)=>(
            <div key={gi} className="card" style={{padding:"18px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                <div style={{width:32,height:32,borderRadius:9,background:`${g.color}18`,border:`1px solid ${g.color}33`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <i className={`ti ${g.icon}`} style={{fontSize:15,color:g.color}} aria-hidden="true"/>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:N}}>{g.label}</div>
              </div>
              {g.tools.map((t,ti)=>(
                <a key={ti} href={t.href}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:ti<g.tools.length-1?"1px solid #F1F5F9":"none"}}
                  onMouseOver={e=>e.currentTarget.style.opacity=".7"}
                  onMouseOut={e=>e.currentTarget.style.opacity="1"}>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:N}}>{t.name}</div>
                    <div style={{fontSize:11.5,color:"#94A3B8"}}>{t.desc}</div>
                  </div>
                  <span style={{fontSize:14,color:g.color,flexShrink:0,marginLeft:8}}>→</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── VERTICALS ── */}
      <section style={{background:N,padding:"64px 6%"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>30 Vertical Packs</div>
            <h2 style={{fontSize:"clamp(24px,4vw,44px)",fontWeight:700,color:CHALK,marginBottom:14,lineHeight:1.1}}>Any industry.<br/>Any market.</h2>
            <p style={{fontSize:15,color:"rgba(245,245,240,.55)",lineHeight:1.8,marginBottom:20}}>Pre-built agent packs for Texas, US national and European markets. HVAC, Real Estate, Legal, FinTech, SaaS, HealthTech and 24 more — with local regulations pre-loaded.</p>
            <a href="/verticals" className="btn btn-amber">Explore vertical packs →</a>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[["🤠","Texas & Local","10 packs","#EF9F27"],["🇺🇸","US National","10 packs","#378ADD"],["🌍","Europe & Global","10 packs","#7C3AED"]].map(([ico,l,n,c])=>(
              <div key={l} style={{padding:"14px 12px",borderRadius:11,background:`${c}18`,border:`1px solid ${c}33`,textAlign:"center"}}>
                <div style={{fontSize:24,marginBottom:7}}>{ico}</div>
                <div style={{fontSize:12,fontWeight:600,color:CHALK,marginBottom:3}}>{l}</div>
                <div style={{fontSize:11,color:c,fontWeight:600}}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{background:"#F8F9FA",padding:"64px 6%"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <h2 style={{fontSize:"clamp(22px,3vw,40px)",fontWeight:700,color:N,marginBottom:8}}>What founders say</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14,maxWidth:900,margin:"0 auto"}}>
          {PROOF.map((t,i)=>(
            <div key={i} className="card" style={{padding:"20px"}}>
              <div style={{color:AMBER,fontSize:13,letterSpacing:2,marginBottom:12}}>★★★★★</div>
              <p style={{fontSize:14,color:"#475569",lineHeight:1.8,marginBottom:16,fontStyle:"italic"}}>"{t.text}"</p>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:`rgba(239,159,39,.15)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:AMBER}}>{t.init}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:N}}>{t.name}</div>
                  <div style={{fontSize:11,color:"#94A3B8"}}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section ref={pricingRef} style={{background:N,padding:"72px 6%"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Pricing</div>
          <h2 style={{fontSize:"clamp(26px,4vw,48px)",fontWeight:700,color:CHALK,marginBottom:10}}>Simple, transparent pricing.</h2>
          <p style={{fontSize:15,color:"rgba(245,245,240,.5)"}}>14-day free trial on all plans. Cancel anytime. No lock-in.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12,maxWidth:960,margin:"0 auto 24px"}}>
          {PLANS.map(plan=>(
            <div key={plan.name} style={{background:plan.highlight?"#fff":"rgba(255,255,255,.05)",borderRadius:14,border:plan.highlight?`2px solid ${AMBER}`:"1px solid rgba(255,255,255,.1)",padding:"24px 20px",display:"flex",flexDirection:"column",position:"relative"}}>
              {plan.highlight&&<div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",background:AMBER,color:N,fontSize:11,fontWeight:700,padding:"4px 14px",borderRadius:20,whiteSpace:"nowrap"}}>Most Popular</div>}
              <div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:plan.highlight?N:CHALK,marginBottom:4}}>{plan.name}</div>
              <div style={{fontSize:13,color:plan.highlight?"#64748B":"rgba(245,245,240,.5)",marginBottom:16}}>{plan.tagline}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4}}>
                <span style={{fontFamily:"Georgia,serif",fontSize:44,fontWeight:700,color:plan.highlight?N:CHALK,lineHeight:1}}>${plan.price}</span>
                <span style={{fontSize:13,color:plan.highlight?"#94A3B8":"rgba(245,245,240,.4)"}}>/mo</span>
              </div>
              <div style={{fontSize:12,color:"#1D9E75",fontWeight:500,marginBottom:18}}>14-day free trial · Cancel anytime</div>
              <ul style={{listStyle:"none",flex:1,marginBottom:20,display:"flex",flexDirection:"column",gap:7}}>
                {plan.features.map(f=>(
                  <li key={f} style={{display:"flex",gap:8,fontSize:13,color:plan.highlight?N:CHALK,alignItems:"flex-start"}}>
                    <span style={{color:"#1D9E75",fontSize:12,marginTop:2,flexShrink:0}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href={`/login?plan=${plan.name.toLowerCase()}`}
                style={{display:"block",padding:"12px",borderRadius:10,fontSize:14,fontWeight:700,textAlign:"center",background:plan.highlight?AMBER:"rgba(255,255,255,.1)",color:plan.highlight?N:CHALK,border:plan.highlight?"none":"1px solid rgba(255,255,255,.15)"}}>
                Start free trial →
              </a>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",fontSize:13.5,color:"rgba(245,245,240,.35)"}}>🛡️ 14-day money-back guarantee if SIXXAB AI doesn't help you make progress.</p>
      </section>

      {/* ── CTA ── */}
      <section style={{background:AMBER,padding:"60px 6%",textAlign:"center"}}>
        <h2 style={{fontSize:"clamp(26px,4vw,48px)",fontWeight:700,color:N,marginBottom:10}}>Start free. See results in 48 hours.</h2>
        <p style={{fontSize:15,color:"rgba(10,14,26,.6)",marginBottom:24,maxWidth:360,margin:"0 auto 24px"}}>Validate your niche, set your first Orchestrator goal and have a plan by end of day.</p>
        {done ? (
          <div style={{background:"rgba(10,14,26,.1)",borderRadius:12,padding:"16px 24px",display:"inline-block"}}>
            <p style={{fontSize:15,fontWeight:700,color:N,marginBottom:8}}>🎉 You're in! Check your inbox.</p>
            <a href="/niche-validator" className="btn btn-dark">Validate your niche now →</a>
          </div>
        ) : (
          <form onSubmit={joinWaitlist} style={{display:"flex",gap:8,maxWidth:440,margin:"0 auto",flexWrap:"wrap",justifyContent:"center"}}>
            <input type="email" placeholder="Enter your email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{flex:1,minWidth:200,padding:"12px 15px",borderRadius:9,border:"none",fontSize:14,fontFamily:"inherit",background:"rgba(10,14,26,.1)",color:N,outline:"none"}}/>
            <button type="submit" disabled={busy} className="btn btn-dark">{busy?"Sending…":"Get early access →"}</button>
          </form>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:"#111520",padding:"32px 6%"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:24,marginBottom:24}}>
            <div>
              <a href="/" style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <SixxabMark size={20}/>
                <SixxabWordmark/>
              </a>
              <p style={{fontSize:12,color:"rgba(255,255,255,.3)",maxWidth:200,lineHeight:1.7}}>Autonomous Business Platform. $0 to $10M ARR. Dallas, TX.</p>
            </div>
            <div style={{display:"flex",gap:32,flexWrap:"wrap"}}>
              {[
                {h:"Platform",links:[["Orchestrator","/orchestrator"],["CXO Suite","/agents"],["CRM","/crm"],["Content Studio","/studio"],["Lead Gen","/leads"],["Social Hub","/social"]]},
                {h:"Tools",links:[["Investor Hub","/investor"],["Proposals","/proposal"],["Retention","/retention"],["Calendar","/calendar"],["Verticals","/verticals"],["Validate","/validate"]]},
                {h:"Company",links:[["Runbook","/runbook"],["Mental Model","/mindset"],["Waitlist","/waitlist"],["Discovery","/discovery"],["Terms","/terms"],["Privacy","/privacy"]]},
              ].map(col=>(
                <div key={col.h}>
                  <div style={{fontSize:10.5,fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>{col.h}</div>
                  {col.links.map(([l,h])=>(
                    <a key={l} href={h} style={{display:"block",fontSize:13,color:"rgba(255,255,255,.45)",marginBottom:7,textDecoration:"none"}}
                      onMouseOver={e=>e.target.style.color="#fff"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,.45)"}>{l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:16,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <span style={{fontSize:11.5,color:"rgba(255,255,255,.2)"}}>© 2025 SIXXAB AI · Autonomous Business Platform · Dallas, TX</span>
            <span style={{fontSize:11.5,color:"rgba(255,255,255,.15)"}}>Validate · Launch · Optimise · Scale · Capitalise · Global</span>
          </div>
        </div>
      </footer>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  )
}
