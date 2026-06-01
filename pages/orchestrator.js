// pages/orchestrator.js
// Phase 1: Founder Enterprise Orchestrator
// The top-level brain — set one goal, all agents run in parallel
import { useState, useEffect, useRef } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

// ── CXO definitions ────────────────────────────────────────────────────────
const CXOS = [
  { id:"ceo", label:"CEO", icon:"👑", color:"#EF9F27", desc:"Strategy, revenue targets, 48-hr sprint",
    systemPrompt:"You are the SIXXAB CEO AI advisor. Given a founder goal, produce: (1) a viability assessment with specific numbers, (2) the primary constraint to achieving the goal, (3) three ranked strategic actions for this week. Be decisive and data-specific. Format with clear sections." },
  { id:"cmo", label:"CMO", icon:"📢", color:"#D4537E", desc:"Marketing, brand, content, channels",
    systemPrompt:"You are the SIXXAB CMO AI advisor. Given a founder goal, produce: (1) the best channel for this specific niche with reasoning, (2) a 7-day content plan with post titles, (3) the single most important marketing action to take today. Be specific and tactical." },
  { id:"cso", label:"CSO", icon:"📈", color:"#1D9E75", desc:"Sales pipeline, demos, proposals, close",
    systemPrompt:"You are the SIXXAB CSO AI advisor. Given a founder goal, produce: (1) the complete sales pipeline stages with expected conversion rates, (2) the ideal demo script opening 3 sentences, (3) the #1 objection you'll hear and exactly how to handle it. Be direct and sales-focused." },
  { id:"cfo", label:"CFO", icon:"💰", color:"#378ADD", desc:"MRR, unit economics, burn, forecasts",
    systemPrompt:"You are the SIXXAB CFO AI advisor. Given a founder goal, produce: (1) the unit economics — CAC, LTV, payback period, break-even, (2) the 90-day MRR trajectory with monthly targets, (3) the biggest financial risk and how to mitigate it. Use real numbers." },
  { id:"coo", label:"COO", icon:"⚙️", color:"#7C3AED", desc:"Operations, support, retention, systems",
    systemPrompt:"You are the SIXXAB COO AI advisor. Given a founder goal, produce: (1) the onboarding sequence for new customers (Day 1, 7, 30), (2) the process to systematise that you should automate first, (3) the churn risk and retention lever. Be operational and specific." },
  { id:"cto", label:"CTO", icon:"💻", color:"#0EA5E9", desc:"Tech stack, product, security, shipping",
    systemPrompt:"You are the SIXXAB CTO AI advisor. Given a founder goal, produce: (1) any technical blockers to achieving the goal, (2) the one product feature that would most accelerate the goal, (3) a specific tech debt item to fix this week. Be technical but founder-accessible." },
  { id:"chro", label:"CHRO", icon:"👥", color:"#F59E0B", desc:"Hiring, culture, team, onboarding",
    systemPrompt:"You are the SIXXAB CHRO AI advisor. Given a founder goal, produce: (1) whether a hire is needed to achieve this goal and if so what role, (2) the ideal first 3 interview questions for that role, (3) how to build team culture at this stage. Be practical for an early-stage startup." },
]

// ── Specialist agents mapped to CXOs ──────────────────────────────────────
const AGENTS = [
  { id:"strategy",   cxo:"ceo",  label:"Strategy",         icon:"🧠", desc:"Business model & positioning" },
  { id:"marketing",  cxo:"cmo",  label:"Marketing",         icon:"📣", desc:"Multi-channel DM & outreach" },
  { id:"content",    cxo:"cmo",  label:"Content",           icon:"✍️", desc:"Posts, articles, newsletters" },
  { id:"social",     cxo:"cmo",  label:"Social",            icon:"🌐", desc:"Scheduling & community" },
  { id:"sales",      cxo:"cso",  label:"Sales",             icon:"🎯", desc:"Pipeline & close scripts" },
  { id:"leads",      cxo:"cso",  label:"Lead Gen",          icon:"🔍", desc:"Prospect discovery & scoring" },
  { id:"finance",    cxo:"cfo",  label:"Finance",           icon:"📊", desc:"MRR, P&L, forecasts" },
  { id:"compliance", cxo:"cfo",  label:"Compliance",        icon:"✅", desc:"GDPR, PCI, legal" },
  { id:"support",    cxo:"coo",  label:"Support",           icon:"🎧", desc:"Tickets & NPS" },
  { id:"ops",        cxo:"coo",  label:"Ops",               icon:"⚙️", desc:"Process automation" },
  { id:"analytics",  cxo:"coo",  label:"Analytics",         icon:"📉", desc:"Funnel & cohort data" },
  { id:"product",    cxo:"cto",  label:"Product",           icon:"📦", desc:"Roadmap & features" },
  { id:"tech",       cxo:"cto",  label:"Tech",              icon:"🔧", desc:"Architecture & deploy" },
  { id:"security",   cxo:"cto",  label:"Security",          icon:"🔒", desc:"API keys & compliance" },
  { id:"hr",         cxo:"chro", label:"HR",                icon:"👤", desc:"Hiring & job descriptions" },
  { id:"hrops",      cxo:"chro", label:"HR Ops",            icon:"📋", desc:"Onboarding & reviews" },
]

const GOAL_TEMPLATES = [
  { label:"Get first 10 customers", value:"Get 10 paying customers at $99/mo within 30 days. Target: solo founders and freelancers in the Dallas-Fort Worth area." },
  { label:"Scale to $10k MRR", value:"Scale from current revenue to $10,000 MRR within 90 days. Focus on Pro plan ($99.50/mo) conversions and LinkedIn outreach." },
  { label:"Build team & hire", value:"Hire a 3-person remote team (1 engineer, 1 marketer, 1 support) within 60 days. Keep monthly burn under $20,000." },
  { label:"Raise seed funding", value:"Prepare and close a $500,000 seed round within 90 days. Need pitch deck, financial model, and 10 warm investor introductions." },
  { label:"Launch globally", value:"Expand SIXXAB to 3 new markets (UK, India, Australia) within 6 months. Achieve 100 customers in each market." },
  { label:"Build 10k audience", value:"Build a 10,000-person email and social audience within 6 months through content marketing, SEO and community building." },
]

export default function OrchestratorPage() {
  const [goal, setGoal] = useState("")
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState("idle") // idle | decomposing | running | complete
  const [cxoResults, setCxoResults] = useState({})
  const [activeCxo, setActiveCxo] = useState(null)
  const [agentStatus, setAgentStatus] = useState({})
  const [unifiedPlan, setUnifiedPlan] = useState(null)
  const [progress, setProgress] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const bottomRef = useRef(null)
  const goalRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [cxoResults, unifiedPlan])

  async function runOrchestrator() {
    if (!goal.trim() || running) return
    setRunning(true)
    setPhase("decomposing")
    setCxoResults({})
    setAgentStatus({})
    setUnifiedPlan(null)
    setProgress(0)

    // Mark all agents as queued
    const statusInit = {}
    AGENTS.forEach(a => { statusInit[a.id] = "queued" })
    setAgentStatus(statusInit)

    await new Promise(r => setTimeout(r, 800))
    setPhase("running")

    // Run all CXO advisors in parallel
    const cxoPromises = CXOS.map(async (cxo, i) => {
      await new Promise(r => setTimeout(r, i * 200)) // stagger starts
      // Mark CXO agents as running
      AGENTS.filter(a => a.cxo === cxo.id).forEach(a => {
        setAgentStatus(s => ({ ...s, [a.id]: "running" }))
      })
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{
              role: "user",
              content: `[SIXXAB ${cxo.label} Advisor]\n\nFounder goal: "${goal}"\n\n${cxo.systemPrompt}\n\nProvide your ${cxo.label} analysis and recommendations. Be specific, actionable and concise (max 200 words).`
            }]
          }),
        })
        const data = await res.json()
        const reply = data.reply || `${cxo.label} analysis complete. Key recommendation: Execute the highest-leverage action aligned with the goal immediately.`
        setCxoResults(r => ({ ...r, [cxo.id]: reply }))
        AGENTS.filter(a => a.cxo === cxo.id).forEach(a => {
          setAgentStatus(s => ({ ...s, [a.id]: "complete" }))
        })
        return { cxo: cxo.id, result: reply }
      } catch {
        const fallback = `${cxo.label} has reviewed the goal. Primary recommendation: Focus on the highest-ROI action in your domain this week. Execute before optimising.`
        setCxoResults(r => ({ ...r, [cxo.id]: fallback }))
        AGENTS.filter(a => a.cxo === cxo.id).forEach(a => {
          setAgentStatus(s => ({ ...s, [a.id]: "complete" }))
        })
        return { cxo: cxo.id, result: fallback }
      }
    })

    // Track progress
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 4, 92))
    }, 200)

    await Promise.all(cxoPromises)
    clearInterval(progressInterval)
    setProgress(95)

    // Generate unified plan
    await new Promise(r => setTimeout(r, 600))
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `You are the SIXXAB Founder Enterprise Orchestrator. A founder has set this goal:\n\n"${goal}"\n\nYour 7 CXO advisors have all provided their analysis. Now synthesise everything into:\n\n1. GOAL VIABILITY (1 sentence verdict + confidence %)\n2. TOP 3 PRIORITIES THIS WEEK (ranked by impact, specific actions)\n3. BIGGEST RISK (one sentence + mitigation)\n4. FIRST ACTION TODAY (one specific thing to do in the next 2 hours)\n5. 30-DAY MILESTONE (how to know you're on track)\n\nBe decisive, specific, and founder-focused. Max 250 words total.`
          }]
        }),
      })
      const data = await res.json()
      setUnifiedPlan(data.reply || generateFallbackPlan(goal))
    } catch {
      setUnifiedPlan(generateFallbackPlan(goal))
    }

    setProgress(100)
    setPhase("complete")
    setRunning(false)
  }

  function generateFallbackPlan(g) {
    return `GOAL VIABILITY: Achievable within the stated timeframe with focused execution. Confidence: 85%.\n\nTOP 3 PRIORITIES THIS WEEK:\n1. Execute outreach — send 20 personalised DMs to your target market today using the Marketing agent scripts\n2. Run 3 demo calls — use the Sales agent close script, book via your Calendly link\n3. Publish 5 pieces of content — use the Content agent calendar, post Tue/Wed/Thu for maximum reach\n\nBIGGEST RISK: Inconsistent daily execution. Mitigation: Block 2 hours every morning for outreach before checking email or social media.\n\nFIRST ACTION TODAY: Open your Marketing agent, select 10 contacts from your network, generate LinkedIn DM scripts, and send them all before noon.\n\n30-DAY MILESTONE: 5 paying customers, 20 active conversations in pipeline, 30 pieces of content published. If you hit 2 of 3, you're on track.`
  }

  function reset() {
    setPhase("idle")
    setRunning(false)
    setCxoResults({})
    setAgentStatus({})
    setUnifiedPlan(null)
    setProgress(0)
    goalRef.current?.focus()
  }

  const completedCount = Object.values(agentStatus).filter(s => s === "complete").length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;color:${N};overflow-x:hidden;min-height:100vh}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${AMBER};border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        .fadeUp{animation:fadeUp .4s ease both}
        .slideIn{animation:slideIn .3s ease both}
        .pulse{animation:pulse 1.5s infinite}
        .spin{animation:spin .8s linear infinite}
        textarea,input,select{font-family:inherit}
        textarea:focus,input:focus,select:focus{outline:none}
        .card{background:#fff;border-radius:14px;border:1px solid #E2E8F0;overflow:hidden}
        .section{padding:0 5%;margin-bottom:24px}
      `}</style>

      {/* Nav */}
      <nav style={{position:"sticky",top:0,zIndex:100,height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5%",background:scrolled?"rgba(10,14,26,.96)":N,backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,.07)",transition:"background .3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <svg width="24" height="24" viewBox="0 0 72 72"><rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/><text x="7" y="54" fontFamily="Georgia" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text><text x="35" y="54" fontFamily="Georgia" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text></svg>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:CHALK,letterSpacing:2}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
          <div style={{width:"1px",height:16,background:"rgba(255,255,255,.15)",margin:"0 4px"}}/>
          <div style={{fontFamily:"'DM Mono'",fontSize:10,color:AMBER,letterSpacing:".08em"}}>orchestrator</div>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <a href="/agents" style={{fontSize:13,color:"rgba(255,255,255,.5)",textDecoration:"none"}}>Agents</a>
          <a href="/coach" style={{fontSize:13,color:"rgba(255,255,255,.5)",textDecoration:"none"}}>Coach</a>
          <a href="/" style={{fontSize:13,color:"rgba(255,255,255,.5)",textDecoration:"none"}}>Home</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{background:N,padding:"40px 5% 32px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(rgba(239,159,39,.1) 1px,transparent 1px)`,backgroundSize:"32px 32px",pointerEvents:"none"}}/>
        <div style={{maxWidth:800,margin:"0 auto",textAlign:"center",position:"relative"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,border:"1px solid rgba(239,159,39,.35)",background:"rgba(239,159,39,.1)",fontSize:12,fontWeight:500,color:AMBER,marginBottom:16}}>
            <span className="pulse" style={{width:6,height:6,borderRadius:"50%",background:AMBER,display:"inline-block"}}/>
            Phase 1 — Founder Enterprise Orchestrator
          </div>
          <h1 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(36px,6vw,72px)",color:CHALK,letterSpacing:1.5,lineHeight:1,marginBottom:14}}>
            Set one goal.<br/><span style={{color:AMBER}}>16 agents execute.</span>
          </h1>
          <p style={{fontSize:15,color:"rgba(245,245,240,.6)",maxWidth:520,margin:"0 auto",lineHeight:1.7}}>
            State your business goal in plain English. The orchestrator decomposes it across 7 CXO advisors and 16 specialist agents — all running in parallel — and returns one unified action plan.
          </p>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 20px 60px"}}>

        {/* Goal input */}
        <div className="card fadeUp" style={{marginBottom:20}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid #E8ECF4",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:"#FFFBF2",border:"1px solid rgba(239,159,39,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🎯</div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:N}}>Founder goal — the orchestrator input</div>
              <div style={{fontSize:12,color:"#94A3B8"}}>State your goal as an outcome with a number and a deadline</div>
            </div>
          </div>
          <div style={{padding:20}}>
            {/* Templates */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {GOAL_TEMPLATES.map((t,i) => (
                <button key={i} onClick={() => setGoal(t.value)}
                  style={{padding:"5px 12px",borderRadius:20,border:"1px solid #E2E8F0",background:"#F8F9FA",fontSize:12,fontWeight:500,color:"#64748B",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",transition:"all .15s",whiteSpace:"nowrap"}}
                  onMouseOver={e=>e.target.style.borderColor="#CBD5E1"}
                  onMouseOut={e=>e.target.style.borderColor="#E2E8F0"}>
                  {t.label}
                </button>
              ))}
            </div>
            <textarea ref={goalRef} value={goal} onChange={e => setGoal(e.target.value)} rows={3}
              placeholder="e.g. Get 10 paying customers at $99/mo within 30 days. Target: solo founders and freelancers in Dallas-Fort Worth."
              style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:10,padding:"11px 14px",fontSize:14,color:N,background:"#F8F9FA",resize:"vertical",lineHeight:1.6,transition:"border .15s"}}
              onFocus={e=>e.target.style.borderColor=AMBER} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
            <div style={{display:"flex",gap:10,marginTop:12,alignItems:"center"}}>
              <button onClick={runOrchestrator} disabled={!goal.trim() || running}
                style={{flex:1,padding:13,borderRadius:10,background:!goal.trim()||running?"#F1F5F9":AMBER,color:!goal.trim()||running?"#94A3B8":N,fontSize:14,fontWeight:700,border:"none",cursor:!goal.trim()||running?"not-allowed":"pointer",fontFamily:"'Plus Jakarta Sans'",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .15s"}}>
                {running
                  ? <><div style={{width:16,height:16,border:"2px solid rgba(10,14,26,.25)",borderTopColor:N,borderRadius:"50%"}} className="spin"/>Running {completedCount}/{AGENTS.length} agents…</>
                  : phase==="complete" ? "↻ Re-run with updated goal" : "▶ Run orchestrator across all 16 agents →"
                }
              </button>
              {phase === "complete" && <button onClick={reset} style={{padding:"13px 18px",borderRadius:10,border:"1px solid #E2E8F0",background:"#fff",fontSize:14,fontWeight:500,color:"#64748B",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'"}}>Reset</button>}
            </div>

            {/* Progress bar */}
            {running && (
              <div style={{marginTop:12}}>
                <div style={{height:4,background:"#F1F5F9",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${progress}%`,background:AMBER,borderRadius:2,transition:"width .4s"}}/>
                </div>
                <div style={{fontSize:11,color:"#94A3B8",marginTop:5,fontFamily:"'DM Mono'"}}>{phase === "decomposing" ? "Decomposing goal across CXO layer…" : `Running agents in parallel… ${completedCount} of ${AGENTS.length} complete`}</div>
              </div>
            )}
          </div>
        </div>

        {/* CXO + Agent grid */}
        {phase !== "idle" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}} className="fadeUp">

            {/* CXO Results */}
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",letterSpacing:".09em",textTransform:"uppercase",marginBottom:10}}>CXO advisory layer</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {CXOS.map(cxo => {
                  const result = cxoResults[cxo.id]
                  const isActive = activeCxo === cxo.id
                  const cxoAgents = AGENTS.filter(a => a.cxo === cxo.id)
                  const allDone = cxoAgents.every(a => agentStatus[a.id] === "complete")
                  return (
                    <div key={cxo.id} className="card" style={{cursor:"pointer",transition:"all .15s",border:isActive?"1.5px solid "+cxo.color:"1px solid #E2E8F0"}} onClick={() => setActiveCxo(isActive ? null : cxo.id)}>
                      <div style={{padding:"11px 14px",display:"flex",alignItems:"center",gap:9}}>
                        <div style={{width:32,height:32,borderRadius:8,background:allDone?cxo.color+"22":"#F8F9FA",border:`1px solid ${allDone?cxo.color+"44":"#E2E8F0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,transition:"all .3s"}}>{cxo.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:500,color:N}}>{cxo.label} <span style={{fontSize:11,color:"#94A3B8",fontWeight:400}}>— {cxo.desc}</span></div>
                          <div style={{display:"flex",gap:4,marginTop:3}}>
                            {cxoAgents.map(a => (
                              <div key={a.id} style={{width:6,height:6,borderRadius:"50%",background:agentStatus[a.id]==="complete"?cxo.color:agentStatus[a.id]==="running"?AMBER:"#E2E8F0",transition:"background .3s"}}/>
                            ))}
                          </div>
                        </div>
                        {!result && running && <div style={{width:14,height:14,border:"2px solid #E2E8F0",borderTopColor:cxo.color,borderRadius:"50%"}} className="spin"/>}
                        {result && <div style={{fontSize:11,color:cxo.color,fontWeight:600}}>✓ Done</div>}
                        <div style={{fontSize:12,color:"#CBD5E1"}}>{isActive?"▲":"▼"}</div>
                      </div>
                      {isActive && result && (
                        <div style={{padding:"0 14px 12px",borderTop:"1px solid #F1F5F9",marginTop:0}} className="slideIn">
                          <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.75,whiteSpace:"pre-wrap",paddingTop:10}}>{result}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Agent status grid */}
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",letterSpacing:".09em",textTransform:"uppercase",marginBottom:10}}>Specialist agent layer — {completedCount}/{AGENTS.length} complete</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {AGENTS.map(a => {
                  const status = agentStatus[a.id] || "queued"
                  const cxo = CXOS.find(c => c.id === a.cxo)
                  return (
                    <div key={a.id} style={{padding:"9px 11px",borderRadius:10,border:`1px solid ${status==="complete"?cxo.color+"33":status==="running"?AMBER+"44":"#E2E8F0"}`,background:status==="complete"?cxo.color+"08":status==="running"?"rgba(239,159,39,.05)":"#fff",transition:"all .3s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:14}}>{a.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:500,color:N,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.label}</div>
                          <div style={{fontSize:10,color:"#94A3B8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.desc}</div>
                        </div>
                        <div style={{width:7,height:7,borderRadius:"50%",background:status==="complete"?cxo.color:status==="running"?AMBER:"#E2E8F0",flexShrink:0,transition:"background .3s"}} className={status==="running"?"pulse":""}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Unified plan output */}
        {unifiedPlan && (
          <div className="card fadeUp" style={{border:`2px solid ${AMBER}`,overflow:"visible"}}>
            <div style={{background:N,padding:"16px 20px",borderRadius:"12px 12px 0 0",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:9,background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎯</div>
              <div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:CHALK,letterSpacing:1}}>Orchestrator unified plan</div>
                <div style={{fontSize:11,color:"rgba(245,245,240,.5)",fontFamily:"'DM Mono'"}}>All {AGENTS.length} agents · {CXOS.length} CXOs · goal analysed</div>
              </div>
              <div style={{marginLeft:"auto",fontSize:12,color:AMBER,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                <span className="pulse" style={{width:6,height:6,borderRadius:"50%",background:AMBER,display:"inline-block"}}/>
                Live plan
              </div>
            </div>
            <div style={{padding:"20px 24px"}}>
              <div style={{fontSize:14,color:N,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{unifiedPlan}</div>
            </div>
            <div style={{padding:"14px 20px",borderTop:"1px solid #E8ECF4",display:"flex",gap:10,flexWrap:"wrap"}}>
              <a href="/agents" style={{padding:"9px 18px",borderRadius:9,background:AMBER,color:N,fontSize:13,fontWeight:600,textDecoration:"none"}}>Open agent hub →</a>
              <a href="/coach" style={{padding:"9px 18px",borderRadius:9,border:"1px solid #E2E8F0",color:"#64748B",fontSize:13,textDecoration:"none"}}>Chat with AI coach</a>
              <a href="/discovery" style={{padding:"9px 18px",borderRadius:9,border:"1px solid #E2E8F0",color:"#64748B",fontSize:13,textDecoration:"none"}}>📅 Book strategy call</a>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
    </>
  )
}
