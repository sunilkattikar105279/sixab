// pages/investor.js — SIXXAB AI · Investor Hub
// Phase 5 — Capitalise: Investor CRM, Pitch Deck, Partnership tracking, Fundraising model
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0", RED = "#DC2626"

// ── Investor pipeline stages ──────────────────────────────────────────────────
const INV_STAGES = [
  { id:"Identified",  color:"#F1EFE8", txt:"#5F5E5A" },
  { id:"Researched",  color:"#FAEEDA", txt:"#633806" },
  { id:"Intro sent",  color:"#EFF6FF", txt:"#1E40AF" },
  { id:"Meeting",     color:"#F0FDF4", txt:"#065F46" },
  { id:"DD",          color:"#F5F3FF", txt:"#4C1D95" },
  { id:"Term sheet",  color:"#FEF3C7", txt:"#92400E" },
  { id:"Closed ✓",    color:"#E1F5EE", txt:"#085041" },
  { id:"Passed",      color:"#FEF2F2", txt:"#991B1B" },
]

const INVESTOR_TYPES = ["Angel","Micro-VC","Seed VC","Family Office","Strategic","Accelerator","Crowdfund"]
const TICKET_SIZES   = ["$10k–$50k","$50k–$150k","$150k–$500k","$500k–$2M","$2M+"]

const INV_KEY  = "sixxab_investors"
const MRR_KEY  = "sixxab_crm_contacts"

function loadInvestors()   { try { return JSON.parse(localStorage.getItem(INV_KEY)||"[]") } catch { return [] } }
function saveInvestors(l)  { try { localStorage.setItem(INV_KEY, JSON.stringify(l)) } catch {} }
function mkId()            { return `${Date.now()}-${Math.random().toString(36).slice(2)}` }

const EMPTY = { id:"", name:"", fund:"", email:"", linkedin:"", type:"Angel",
                ticket:"$50k–$150k", stage:"Identified", notes:"", thesis:"",
                intro:"", lastTouch:"", createdAt:"" }

// ── Pitch metrics pulled from CRM ─────────────────────────────────────────────
function getPitchMetrics() {
  try {
    const contacts = JSON.parse(localStorage.getItem(MRR_KEY)||"[]")
    const closed = contacts.filter(c=>c.stage==="Closed ✓")
    const mrr = closed.reduce((a,c)=>a+(c.value==="Pro"?99.50:c.value==="Agency"?175:c.value==="Enterprise"?350:49.50),0)
    return { contacts:contacts.length, customers:closed.length, mrr:mrr.toFixed(0) }
  } catch { return { contacts:0, customers:0, mrr:0 } }
}

export default function InvestorHub() {
  const [investors,    setInvestors]   = useState([])
  const [view,         setView]        = useState("crm") // crm | kanban | pitch | model
  const [selected,     setSelected]    = useState(null)
  const [isNew,        setIsNew]       = useState(false)
  const [form,         setForm]        = useState(EMPTY)
  const [pitchLoading, setPitchLoading]= useState(false)
  const [pitchOutput,  setPitchOutput] = useState("")
  const [modelLoading, setModelLoading]= useState(false)
  const [modelOutput,  setModelOutput] = useState("")
  const [ask,          setAsk]         = useState("500000")
  const [valuation,    setValuation]   = useState("3000000")
  const [toast,        setToast]       = useState(null)
  const metrics = getPitchMetrics()

  useEffect(() => { setInvestors(loadInvestors()) }, [])

  function showToast(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),3000) }

  function save(list) { setInvestors(list); saveInvestors(list) }

  function upsert(c) {
    c.updatedAt = new Date().toISOString()
    const idx = investors.findIndex(x=>String(x.id)===String(c.id))
    const next = idx>=0 ? investors.map(x=>String(x.id)===String(c.id)?c:x) : [...investors,c]
    save(next); showToast(idx>=0?"Investor updated":"Investor added")
    setSelected(c); setIsNew(false); setView("crm")
  }

  function newInvestor() {
    const c={...EMPTY,id:mkId(),createdAt:new Date().toISOString(),lastTouch:"Just added"}
    setForm(c); setSelected(c); setIsNew(true); setView("form")
  }

  function set(k,v) { setForm(f=>({...f,[k]:v})) }

  const pipeline = INV_STAGES.map(s=>({
    ...s, items: investors.filter(i=>i.stage===s.id)
  }))

  const totalPipeline = investors.filter(i=>!["Closed ✓","Passed"].includes(i.stage))
    .reduce((a,i)=>{
      const t = i.ticket==="$10k–$50k"?30:i.ticket==="$50k–$150k"?100:i.ticket==="$150k–$500k"?325:i.ticket==="$500k–$2M"?1250:2500
      return a+t*1000
    },0)

  const closed = investors.filter(i=>i.stage==="Closed ✓")
    .reduce((a,i)=>{
      const t = i.ticket==="$10k–$50k"?30:i.ticket==="$50k–$150k"?100:i.ticket==="$150k–$500k"?325:i.ticket==="$500k–$2M"?1250:2500
      return a+t*1000
    },0)

  async function generatePitch() {
    setPitchLoading(true); setPitchOutput("")
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:
          `You are the SIXXAB AI Pitch Agent. Generate a compelling investor pitch narrative for SIXXAB AI — Autonomous Business Platform.

Live metrics from SIXXAB CRM:
- Total contacts in CRM: ${metrics.contacts}
- Paying customers: ${metrics.customers}
- Current MRR: $${metrics.mrr}
- Fundraising ask: $${Number(ask).toLocaleString()}
- Pre-money valuation: $${Number(valuation).toLocaleString()}
- Equity offered: ${((Number(ask)/Number(valuation))*100).toFixed(1)}%

Write a 5-section investor pitch narrative:
1. THE PROBLEM (2 sentences — specific pain, real cost)
2. THE SOLUTION (3 sentences — SIXXAB AI, what makes it different, category)
3. TRACTION (use the real metrics above — be specific)
4. THE ASK (investment amount, equity, use of funds in 3 bullet points)
5. WHY NOW (2 sentences — timing, market shift, window)

Use real numbers. Be direct. No fluff. Write as if presenting to a Dallas angel investor who asks hard questions.`
        }]})
      })
      const d = await res.json()
      setPitchOutput(d.reply||"Unable to generate — check API connection.")
    } catch { setPitchOutput("Network error — check your connection.") }
    setPitchLoading(false)
  }

  async function generateModel() {
    setModelLoading(true); setModelOutput("")
    const askN = Number(ask)||500000
    const valN = Number(valuation)||3000000
    const equity = ((askN/valN)*100).toFixed(1)
    const mrrN = Number(metrics.mrr)||0
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:
          `You are the SIXXAB CFO AI advisor. Build a fundraising financial model for this raise:

Current MRR: $${mrrN}/mo
Fundraising ask: $${askN.toLocaleString()}
Pre-money valuation: $${valN.toLocaleString()}
Equity offered: ${equity}%
Business: SIXXAB AI — Autonomous Business Platform (SaaS, $49.50–$175/mo plans)

Generate a structured model with these sections:
1. CURRENT STATE — MRR, ARR, growth rate needed to hit milestones
2. USE OF FUNDS — break $${askN.toLocaleString()} into team/product/marketing/ops with percentages
3. 24-MONTH PROJECTION — Month 6, 12, 18, 24 MRR targets with the raise
4. KEY METRICS TO TRACK — 5 specific KPIs investors will ask about
5. DILUTION ANALYSIS — current ${equity}% ask vs typical seed terms, what to negotiate

Be specific with numbers. Format clearly with headers. Write for a founder preparing for investor due diligence.`
        }]})
      })
      const d = await res.json()
      setModelOutput(d.reply||"Unable to generate — check API connection.")
    } catch { setModelOutput("Network error.") }
    setModelLoading(false)
  }

  return (
    <>
      <Head>
        <title>SIXXAB AI — Investor Hub · Capitalise Phase</title>
        <meta name="description" content="SIXXAB AI Investor Hub — track investors, generate pitch decks, model your fundraise. Phase 5 of the SIXXAB framework."/>
      </Head>

      <style>{`
        body{background:#F4F4F0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .3s ease both}
        .card{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
        .inp{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;color:${N};background:#fff;transition:border .15s;font-family:inherit}
        .inp:focus{border-color:${RED};outline:none}
        select.inp{cursor:pointer}
        .tab-btn{padding:7px 16px;border-radius:8px;border:none;font-size:12.5px;font-weight:500;cursor:pointer;font-family:inherit;background:transparent;color:#64748B;transition:all .15s}
        .tab-btn.on{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.08)}
        .row-h:hover{background:#F8F9FA}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${RED};border-radius:2px}
      `}</style>

      <SixxabNav active="/investor"/>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",bottom:24,right:24,zIndex:999,padding:"10px 18px",borderRadius:10,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.1)",animation:"fadeUp .3s ease"}}>
          {toast.ok?"✓":"✗"} {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div style={{background:N,padding:"16px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(220,38,38,.18)",border:"1.5px solid rgba(220,38,38,.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-currency-dollar" style={{fontSize:22,color:RED}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}>
                <h1 style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:CHALK,letterSpacing:1,lineHeight:1}}>
                  SIXXAB <span style={{color:RED,fontStyle:"italic"}}>Investor Hub</span>
                </h1>
                <span style={{padding:"2px 9px",borderRadius:20,background:"rgba(220,38,38,.2)",border:"1px solid rgba(220,38,38,.4)",fontSize:10,fontWeight:600,color:"#FCA5A5"}}>Phase 05 — Capitalise</span>
              </div>
              <p style={{fontSize:12,color:"rgba(245,245,240,.45)"}}>
                Investor CRM · Pitch Generator · Fundraising Model · Partnership Tracker
              </p>
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            {[["Investors",investors.length,"#94A3B8"],["Pipeline",investors.filter(i=>!["Closed ✓","Passed"].includes(i.stage)).length,RED],["Closed",investors.filter(i=>i.stage==="Closed ✓").length,"#1D9E75"]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center",padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
                <div style={{fontFamily:"'Bebas Neue',Georgia",fontSize:18,color:c,letterSpacing:.5}}>{v}</div>
                <div style={{fontSize:9.5,color:"rgba(245,245,240,.4)",textTransform:"uppercase",letterSpacing:".07em"}}>{l}</div>
              </div>
            ))}
            <button onClick={newInvestor}
              style={{padding:"7px 16px",borderRadius:9,background:RED,color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
              <i className="ti ti-plus" style={{fontSize:12}} aria-hidden="true"/>Add investor
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1280,margin:"0 auto",padding:"20px 20px 60px"}}>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
          {[
            {l:"Pipeline potential",v:"$"+Math.round(totalPipeline/1000)+"k",c:RED},
            {l:"Raised to date",v:"$"+Math.round(closed/1000)+"k",c:"#1D9E75"},
            {l:"Live CRM MRR",v:"$"+metrics.mrr+"/mo",c:AMBER},
            {l:"Paying customers",v:metrics.customers,c:AMBER},
          ].map((s,i)=>(
            <div key={i} className="card" style={{padding:"14px 16px"}}>
              <div style={{fontSize:22,fontWeight:700,color:s.c,fontFamily:"Georgia,serif"}}>{s.v}</div>
              <div style={{fontSize:11,color:"#94A3B8",marginTop:3}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,marginBottom:16,background:"#F1F5F9",borderRadius:11,padding:4,width:"fit-content"}}>
          {[["crm","ti-address-book","Investor CRM"],["kanban","ti-layout-columns","Pipeline"],["pitch","ti-presentation","Pitch Generator"],["model","ti-calculator","Fundraising Model"]].map(([v,ic,l])=>(
            <button key={v} className={`tab-btn${view===v?" on":""}`} onClick={()=>setView(v)}>
              <i className={`ti ${ic}`} style={{fontSize:11,marginRight:4}} aria-hidden="true"/>{l}
            </button>
          ))}
        </div>

        {/* ══ INVESTOR CRM ══ */}
        {view==="crm" && (
          <div className="card fu">
            <div style={{padding:"10px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",gap:0,fontSize:11,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".07em"}}>
              <div style={{flex:2}}>Investor / Fund</div>
              <div style={{width:100}}>Type</div>
              <div style={{width:120}}>Ticket size</div>
              <div style={{width:110}}>Stage</div>
              <div style={{width:100}}>Last touch</div>
              <div style={{width:60}}/>
            </div>
            {investors.length===0 && (
              <div style={{padding:40,textAlign:"center",color:"#94A3B8"}}>
                <div style={{fontSize:24,marginBottom:8}}>💼</div>
                <div style={{fontSize:13,fontWeight:500,marginBottom:12}}>No investors tracked yet</div>
                <button onClick={newInvestor} style={{padding:"9px 20px",borderRadius:9,background:RED,color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>
                  Add your first investor →
                </button>
              </div>
            )}
            {investors.map(inv=>{
              const stg = INV_STAGES.find(s=>s.id===inv.stage)||INV_STAGES[0]
              return (
                <div key={inv.id} className="row-h" style={{display:"flex",alignItems:"center",padding:"11px 16px",borderBottom:"1px solid #F1F5F9",cursor:"pointer"}}
                  onClick={()=>{setForm(inv);setSelected(inv);setIsNew(false);setView("form")}}>
                  <div style={{flex:2}}>
                    <div style={{fontSize:13,fontWeight:500,color:N}}>{inv.name}</div>
                    <div style={{fontSize:11,color:"#94A3B8"}}>{inv.fund}</div>
                  </div>
                  <div style={{width:100,fontSize:12,color:"#64748B"}}>{inv.type}</div>
                  <div style={{width:120,fontSize:12,color:"#64748B"}}>{inv.ticket}</div>
                  <div style={{width:110}}>
                    <span style={{padding:"2px 9px",borderRadius:12,background:stg.color,color:stg.txt,fontSize:10.5,fontWeight:500}}>{inv.stage}</span>
                  </div>
                  <div style={{width:100,fontSize:11,color:"#94A3B8"}}>{inv.lastTouch||"—"}</div>
                  <div style={{width:60}}>
                    {inv.linkedin && <a href={inv.linkedin.startsWith("http")?inv.linkedin:"https://linkedin.com/in/"+inv.linkedin}
                      target="_blank" rel="noopener noreferrer"
                      onClick={e=>e.stopPropagation()}
                      style={{width:26,height:26,borderRadius:6,background:"#EFF6FF",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
                      <i className="ti ti-brand-linkedin" style={{fontSize:12,color:"#0A66C2"}} aria-hidden="true"/>
                    </a>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ══ KANBAN ══ */}
        {view==="kanban" && (
          <div style={{overflowX:"auto",paddingBottom:8}}>
            <div style={{display:"flex",gap:10,minWidth:INV_STAGES.length*180+"px"}}>
              {pipeline.map((p,i)=>(
                <div key={i} style={{width:170,flexShrink:0}}>
                  <div style={{padding:"7px 10px",borderRadius:"9px 9px 0 0",background:p.color,borderBottom:`2px solid ${p.txt}33`,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <span style={{fontSize:10.5,fontWeight:700,color:p.txt}}>{p.id}</span>
                    <span style={{width:18,height:18,borderRadius:"50%",background:p.txt,color:p.color,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",opacity:.75}}>{p.items.length}</span>
                  </div>
                  {p.items.map(inv=>(
                    <div key={inv.id} style={{background:"#fff",borderRadius:9,border:"1px solid #E2E8F0",padding:"9px 11px",marginBottom:6,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}
                      onClick={()=>{setForm(inv);setSelected(inv);setIsNew(false);setView("form")}}>
                      <div style={{fontSize:12,fontWeight:500,color:N,marginBottom:2}}>{inv.name}</div>
                      <div style={{fontSize:10,color:"#94A3B8",marginBottom:4}}>{inv.fund||inv.type}</div>
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:8,background:"#FEF2F2",color:RED,fontWeight:600}}>{inv.ticket}</span>
                    </div>
                  ))}
                  <button onClick={newInvestor}
                    style={{width:"100%",padding:"7px",borderRadius:8,border:"1.5px dashed #E2E8F0",background:"transparent",fontSize:11,color:"#94A3B8",cursor:"pointer",fontFamily:"inherit"}}>
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ PITCH GENERATOR ══ */}
        {view==="pitch" && (
          <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:16}} className="fu">
            <div className="card" style={{padding:18}}>
              <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:4}}>Fundraising inputs</div>
              <div style={{fontSize:12,color:"#64748B",marginBottom:14,lineHeight:1.55}}>Live CRM data is pulled automatically. Set your ask below.</div>
              {[{l:"Current MRR (from SIXXAB CRM)",v:"$"+metrics.mrr+"/mo",ro:true},{l:"Paying customers",v:metrics.customers,ro:true},{l:"Total CRM contacts",v:metrics.contacts,ro:true}].map((f,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:500,color:"#475569",marginBottom:3}}>{f.l}</div>
                  <div style={{padding:"9px 12px",borderRadius:8,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:13,fontWeight:600,color:N}}>{f.v}</div>
                </div>
              ))}
              <div style={{marginBottom:10}}>
                <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:3}}>Fundraising ask ($)</label>
                <input className="inp" type="number" value={ask} onChange={e=>setAsk(e.target.value)} placeholder="500000"/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:3}}>Pre-money valuation ($)</label>
                <input className="inp" type="number" value={valuation} onChange={e=>setValuation(e.target.value)} placeholder="3000000"/>
              </div>
              <div style={{padding:"9px 12px",borderRadius:8,background:"#FEF2F2",border:"1px solid #FECACA",marginBottom:16}}>
                <div style={{fontSize:11,color:"#94A3B8",marginBottom:2}}>Equity offered</div>
                <div style={{fontSize:18,fontWeight:700,color:RED}}>{((Number(ask)/Number(valuation))*100).toFixed(1)}%</div>
              </div>
              <button onClick={generatePitch} disabled={pitchLoading}
                style={{width:"100%",padding:11,borderRadius:9,background:pitchLoading?"#F1F5F9":RED,color:pitchLoading?"#94A3B8":"#fff",border:"none",cursor:pitchLoading?"not-allowed":"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                {pitchLoading?<><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Generating pitch…</>:"✦ Generate investor pitch →"}
              </button>
            </div>
            <div className="card" style={{padding:20}}>
              <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:14}}>AI-generated pitch narrative</div>
              {!pitchOutput && !pitchLoading && (
                <div style={{textAlign:"center",padding:"40px 20px",color:"#94A3B8"}}>
                  <div style={{fontSize:24,marginBottom:10}}>📋</div>
                  <div style={{fontSize:13}}>Fill in your ask and valuation, then click Generate to get a full pitch narrative using your live SIXXAB CRM data.</div>
                </div>
              )}
              {pitchOutput && (
                <>
                  <div style={{background:N,borderRadius:12,padding:18,marginBottom:12}}>
                    <div style={{fontFamily:"monospace",fontSize:9.5,color:RED,letterSpacing:".08em",marginBottom:10}}>AI INVESTOR PITCH — SIXXAB AI</div>
                    <div style={{fontSize:13.5,color:"rgba(245,245,240,.88)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{pitchOutput}</div>
                  </div>
                  <button onClick={()=>navigator.clipboard.writeText(pitchOutput)}
                    style={{padding:"8px 18px",borderRadius:9,background:RED,color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>
                    Copy pitch
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══ FUNDRAISING MODEL ══ */}
        {view==="model" && (
          <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:16}} className="fu">
            <div className="card" style={{padding:18}}>
              <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:4}}>Fundraising model inputs</div>
              <div style={{fontSize:12,color:"#64748B",marginBottom:14,lineHeight:1.55}}>The CFO agent builds your model from live metrics.</div>
              <div style={{marginBottom:10}}>
                <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:3}}>Fundraising ask ($)</label>
                <input className="inp" type="number" value={ask} onChange={e=>setAsk(e.target.value)} placeholder="500000"/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:3}}>Pre-money valuation ($)</label>
                <input className="inp" type="number" value={valuation} onChange={e=>setValuation(e.target.value)} placeholder="3000000"/>
              </div>
              <div style={{padding:"10px 12px",borderRadius:9,background:"#F8F9FA",border:"1px solid #E2E8F0",marginBottom:16}}>
                {[["Current MRR","$"+metrics.mrr+"/mo"],["Equity offered",((Number(ask)/Number(valuation))*100).toFixed(1)+"%"],["Post-money val","$"+(Number(ask)+Number(valuation)).toLocaleString()]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #F1F5F9",fontSize:12}}>
                    <span style={{color:"#64748B"}}>{l}</span>
                    <span style={{fontWeight:600,color:N}}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={generateModel} disabled={modelLoading}
                style={{width:"100%",padding:11,borderRadius:9,background:modelLoading?"#F1F5F9":N,color:modelLoading?"#94A3B8":CHALK,border:"none",cursor:modelLoading?"not-allowed":"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                {modelLoading?<><div style={{width:14,height:14,border:"2px solid rgba(245,245,240,.2)",borderTopColor:CHALK,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Building model…</>:"✦ Build fundraising model →"}
              </button>
            </div>
            <div className="card" style={{padding:20}}>
              <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:14}}>CFO fundraising model</div>
              {!modelOutput && !modelLoading && (
                <div style={{textAlign:"center",padding:"40px 20px",color:"#94A3B8"}}>
                  <div style={{fontSize:24,marginBottom:10}}>📊</div>
                  <div style={{fontSize:13}}>The CFO agent builds a 24-month projection, use of funds breakdown, and dilution analysis from your live MRR and fundraising inputs.</div>
                </div>
              )}
              {modelOutput && (
                <>
                  <div style={{background:"#F8F9FA",borderRadius:12,padding:18,marginBottom:12,border:"1px solid #E2E8F0"}}>
                    <div style={{fontFamily:"monospace",fontSize:9.5,color:"#64748B",letterSpacing:".08em",marginBottom:10}}>SIXXAB CFO — FUNDRAISING MODEL</div>
                    <div style={{fontSize:13,color:N,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{modelOutput}</div>
                  </div>
                  <button onClick={()=>navigator.clipboard.writeText(modelOutput)}
                    style={{padding:"8px 18px",borderRadius:9,background:N,color:CHALK,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>
                    Copy model
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══ INVESTOR FORM ══ */}
        {view==="form" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16}} className="fu">
            <div className="card">
              <div style={{padding:"13px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",gap:10}}>
                <button onClick={()=>setView("crm")} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",fontSize:18}}>←</button>
                <div style={{flex:1,fontSize:14,fontWeight:600,color:N}}>{isNew?"New investor":form.name||"Investor"}</div>
                <span style={{padding:"3px 10px",borderRadius:20,background:"#FEF2F2",color:RED,fontSize:11,fontWeight:500}}>{form.stage}</span>
              </div>
              <div style={{padding:20,display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[["Name *","name","text","Sarah Chen — Partner"],["Fund / Firm","fund","text","Sequoia / Angel"],["Email","email","email","sarah@example.com"],["LinkedIn","linkedin","url","linkedin.com/in/..."]].map(([l,k,t,ph])=>(
                    <div key={k}>
                      <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:3}}>{l}</label>
                      <input className="inp" type={t} placeholder={ph} value={form[k]||""} onChange={e=>set(k,e.target.value)}/>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  <div>
                    <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:3}}>Investor type</label>
                    <select className="inp" value={form.type} onChange={e=>set("type",e.target.value)}>
                      {INVESTOR_TYPES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:3}}>Ticket size</label>
                    <select className="inp" value={form.ticket} onChange={e=>set("ticket",e.target.value)}>
                      {TICKET_SIZES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:3}}>Stage</label>
                    <select className="inp" value={form.stage} onChange={e=>set("stage",e.target.value)}>
                      {INV_STAGES.map(s=><option key={s.id}>{s.id}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:3}}>Investment thesis (what they typically back)</label>
                  <input className="inp" placeholder="e.g. B2B SaaS, $500k–$2M checks, Dallas/Texas focus" value={form.thesis||""} onChange={e=>set("thesis",e.target.value)}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:3}}>How introduced / warm intro path</label>
                  <input className="inp" placeholder="e.g. Via Capital Factory, met at Dallas Founders Club" value={form.intro||""} onChange={e=>set("intro",e.target.value)}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:3}}>Notes</label>
                  <textarea className="inp" rows={4} placeholder="What did you discuss? What are their concerns? What's the next step?" value={form.notes||""} onChange={e=>set("notes",e.target.value)} style={{resize:"vertical",lineHeight:1.6}}/>
                </div>
                <div style={{display:"flex",gap:10,paddingTop:8,borderTop:"1px solid #F1F5F9"}}>
                  <button onClick={()=>upsert(form)}
                    style={{flex:1,padding:11,borderRadius:9,background:RED,color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>
                    {isNew?"Add investor":"Save changes"}
                  </button>
                  {!isNew && <button onClick={()=>{if(confirm("Delete this investor?")){{save(investors.filter(x=>x.id!==form.id));setView("crm");showToast("Deleted",false)}}}}
                    style={{padding:"11px 16px",borderRadius:9,background:"#FEF2F2",border:"1px solid #FECACA",color:"#991B1B",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:500}}>
                    Delete
                  </button>}
                </div>
              </div>
            </div>
            {/* Sidebar */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div className="card" style={{padding:14}}>
                <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Quick actions</div>
                {form.linkedin && <a href={form.linkedin.startsWith("http")?form.linkedin:"https://linkedin.com/in/"+form.linkedin} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:"#EFF6FF",border:"1px solid #BFDBFE",fontSize:12.5,fontWeight:500,color:"#1D4ED8",textDecoration:"none",marginBottom:7}}>
                  <i className="ti ti-brand-linkedin" aria-hidden="true"/>Open LinkedIn profile
                </a>}
                {form.email && <a href={`mailto:${form.email}?subject=SIXXAB AI — Investor Introduction`}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:12.5,fontWeight:500,color:N,textDecoration:"none",marginBottom:7}}>
                  <i className="ti ti-mail" aria-hidden="true"/>Send email
                </a>}
                <button onClick={()=>setView("pitch")}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:"#FEF2F2",border:"1px solid #FECACA",fontSize:12.5,fontWeight:500,color:RED,cursor:"pointer",fontFamily:"inherit",width:"100%",textAlign:"left"}}>
                  <i className="ti ti-presentation" aria-hidden="true"/>Generate pitch for this investor
                </button>
              </div>
              <div className="card" style={{padding:14,background:"#FFFBF2",border:"1px solid rgba(239,159,39,.3)"}}>
                <div style={{fontSize:11,fontWeight:600,color:AMBER,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Phase 05 — Capitalise</div>
                <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.65}}>This tool is part of the <strong style={{color:N}}>Capitalise phase</strong> — the bridge from product-market fit to institutional scale. Track every relationship, generate pitch materials, and model your fundraise in one place.</div>
                <a href="/" style={{display:"block",marginTop:10,fontSize:12,color:AMBER,textDecoration:"none",fontWeight:500}}>← View full framework</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{background:N,padding:"16px 4%",borderTop:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <svg width="18" height="18" viewBox="0 0 72 72" aria-hidden="true">
              <rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/>
              <text x="7" y="54" fontFamily="Georgia,serif" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
              <text x="35" y="54" fontFamily="Georgia,serif" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
            </svg>
            <div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:700,color:CHALK,letterSpacing:1}}>
              SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB <span style={{fontSize:8,color:"rgba(245,245,240,.35)",letterSpacing:2}}>AI</span>
            </div>
            <span style={{color:"rgba(255,255,255,.12)",margin:"0 6px"}}>·</span>
            <span style={{fontFamily:"monospace",fontSize:10,color:RED,letterSpacing:".08em"}}>INVESTOR HUB</span>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.22)"}}>© 2025 SIXXAB AI · Autonomous Business Platform · Dallas, TX</div>
        </div>
      </footer>
    </>
  )
}
