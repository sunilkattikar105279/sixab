// pages/sales.js — SIXXAB AI Sales Command Center
// All 4 Levels of Sales AI in one unified interface
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect, useRef } from "react"

const N="#0A0E1A", AMBER="#EF9F27", CHALK="#F5F5F0", GREEN="#1D9E75"
const BLUE="#2563EB", ORANGE="#F97316", RED="#DC2626", PURPLE="#7C3AED"

// ── Level definitions matching the framework ──────────────────────
const LEVELS = [
  {
    id:1, label:"Level 1", title:"AI Outreach & Lead Gen",
    color:ORANGE, bg:"#FFF7ED", border:"#FED7AA",
    desc:"Research prospects, draft emails, create pitch materials, organize lead lists",
    tools:[
      { id:"research",  icon:"🔍", label:"Research Prospect",    desc:"Deep intel brief — pain points, triggers, personalisation hooks",   level:1 },
      { id:"email",     icon:"✉️", label:"Draft Email + Subject Lines", desc:"A/B subject lines, full email + 4-touch follow-up sequence", level:1 },
      { id:"pitch",     icon:"📋", label:"Create Pitch Materials",   desc:"Tailored one-pager — problem, proof, offer, next step",           level:1 },
    ]
  },
  {
    id:2, label:"Level 2", title:"Sales Co-Pilot Workflow",
    color:BLUE, bg:"#EFF6FF", border:"#BFDBFE",
    desc:"Pre-call intelligence, buyer personas, sales playbooks, proposal generation",
    tools:[
      { id:"precall",   icon:"📞", label:"Pre-Call Intelligence",   desc:"5-minute brief: priorities, discovery Qs, objections, win probability", level:2 },
      { id:"persona",   icon:"👤", label:"Build Buyer Persona",     desc:"Full persona: goals, pains, buying behaviour, messaging playbook",     level:2 },
      { id:"cadence",   icon:"🔄", label:"Design Sales Cadence",    desc:"9-touch multi-channel sequence with exact scripts for each step",       level:2 },
    ]
  },
  {
    id:3, label:"Level 3", title:"Custom Skills & Cadences",
    color:RED, bg:"#FEF2F2", border:"#FECACA",
    desc:"Automated follow-up workflows, pipeline analysis, forecasting",
    tools:[
      { id:"pipeline",  icon:"📊", label:"Pipeline Analysis",       desc:"Revenue forecast, deal health, red flags, quota attainment projection", level:3 },
      { id:"campaign",  icon:"🚀", label:"Batch Campaign Builder",  desc:"Scale to 1000s of prospects — targeting, copy, metrics, launch plan",  level:3 },
    ]
  },
  {
    id:4, label:"Level 4", title:"Full-Cycle Automation",
    color:PURPLE, bg:"#F5F3FF", border:"#DDD6FE",
    desc:"Batch outreach at scale, API lead scoring, deep account research, full process scripting",
    tools:[
      { id:"campaign",  icon:"🎯", label:"Scale Outreach Campaign", desc:"1000+ prospects, personalised at scale, A/B tested, week-by-week plan", level:4 },
    ]
  },
]

const ALL_TOOLS = LEVELS.flatMap(l => l.tools.map(t => ({...t, levelColor: l.color, levelLabel: l.label, levelTitle: l.title})))

// ── CRM contacts from localStorage ────────────────────────────────
function loadContacts() {
  try { return JSON.parse(localStorage.getItem("sixxab_crm_contacts")||"[]") } catch { return [] }
}

const EMPTY_PROSPECT = { name:"", company:"", role:"", industry:"", location:"", linkedin:"", email:"", notes:"", stage:"Prospect", score:70 }

export default function SalesPage() {
  const [activeTool,  setActiveTool]   = useState(null)
  const [activeLevel, setActiveLevel]  = useState(null)
  const [prospect,    setProspect]     = useState(EMPTY_PROSPECT)
  const [context,     setContext]      = useState("")
  const [contacts,    setContacts]     = useState([])
  const [output,      setOutput]       = useState("")
  const [loading,     setLoading]      = useState(false)
  const [history,     setHistory]      = useState([])
  const [toast,       setToast]        = useState(null)
  const [copied,      setCopied]       = useState(false)
  const [view,        setView]         = useState("tools") // tools | history | pipeline
  const [selContact,  setSelContact]   = useState(null)
  const [searchQ,     setSearchQ]      = useState("")
  const outputRef = useRef(null)

  useEffect(() => {
    setContacts(loadContacts())
    try { setHistory(JSON.parse(localStorage.getItem("sixxab_sales_history")||"[]")) } catch {}
    window.addEventListener("sixxab_crm_updated", () => setContacts(loadContacts()))
  }, [])

  function showToast(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),4000) }

  function selectTool(tool) {
    setActiveTool(tool)
    setOutput("")
    setCopied(false)
    // Auto-fill prospect from selected CRM contact
    if (selContact) {
      setProspect({ name:selContact.name||"", company:selContact.company||"", role:selContact.role||"", industry:selContact.industry||"", location:selContact.location||"", linkedin:selContact.linkedin||"", email:selContact.email||"", notes:selContact.notes||"", stage:selContact.stage||"Prospect", score:selContact.score||70 })
    }
  }

  async function run() {
    if (!activeTool) return
    setLoading(true); setOutput("")
    try {
      const pipeline_contacts = view==="pipeline" ? contacts : contacts.slice(0,10)
      const r = await fetch("/api/sales/agent", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          mode:     activeTool.id,
          prospect: { ...prospect, crm_stage: selContact?.stage, crm_score: selContact?.score },
          context:  context + (selContact?.notes ? "\nCRM Notes: "+selContact.notes : ""),
          contacts: pipeline_contacts,
        })
      })
      const d = await r.json()
      if (!r.ok || d.error) { showToast(d.error||"Failed",false); setLoading(false); return }
      setOutput(d.output||"")
      // Save to history
      const item = { id:Date.now(), tool:activeTool.id, label:activeTool.label, prospect:prospect.name||"Prospect", output:d.output, createdAt:new Date().toISOString() }
      const nh = [item,...history].slice(0,100)
      setHistory(nh)
      try { localStorage.setItem("sixxab_sales_history", JSON.stringify(nh)) } catch {}
      // Scroll to output
      setTimeout(()=>outputRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),100)
    } catch(e) { showToast("Error: "+e.message,false) }
    setLoading(false)
  }

  function copy() { navigator.clipboard?.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000); showToast("Copied!") }

  function saveToContact() {
    if (!selContact || !output) { showToast("Select a CRM contact first",false); return }
    const updated = contacts.map(c => c.id===selContact.id ? {...c, notes:(c.notes||"")+`\n\n--- ${activeTool?.label} (${new Date().toLocaleDateString()}) ---\n${output.slice(0,500)}…`} : c)
    localStorage.setItem("sixxab_crm_contacts", JSON.stringify(updated))
    setContacts(updated)
    showToast("Saved to CRM contact!")
  }

  const filteredContacts = contacts.filter(c => {
    const q = searchQ.toLowerCase()
    return !q || (c.name||"").toLowerCase().includes(q) || (c.company||"").toLowerCase().includes(q)
  })

  const pipelineStats = {
    total:     contacts.length,
    qualified: contacts.filter(c=>["Qualified","Proposal","Negotiation"].includes(c.stage)).length,
    proposal:  contacts.filter(c=>["Proposal","Negotiation"].includes(c.stage)).length,
    won:       contacts.filter(c=>c.stage==="Won").length,
    hotLeads:  contacts.filter(c=>c.score>=75).length,
    atRisk:    contacts.filter(c=>c.score<40).length,
  }

  const levelColor = (level) => [ORANGE, BLUE, RED, PURPLE][level-1] || AMBER

  return (<>
    <Head><title>SIXXAB AI — Sales Command Center</title></Head>
    <style>{`
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#F0F2F5;font-family:'Inter',system-ui,sans-serif}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .fu{animation:fadeUp .25s ease}
      .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
      .inp{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:${N};font-family:inherit;outline:none;background:#fff;transition:border .15s}
      .inp:focus{border-color:${AMBER}}
      textarea.inp{resize:vertical;line-height:1.65}
      .tool-card{padding:14px;border-radius:11px;border:1.5px solid;cursor:pointer;transition:all .15s;background:#fff}
      .tool-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.08)}
      .btn{padding:10px 20px;border-radius:10px;border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;transition:all .15s}
      .btn:disabled{opacity:.5;cursor:not-allowed}
      .btn-amber{background:${AMBER};color:${N}}
      .btn-outline{background:#fff;color:${N};border:1.5px solid #E2E8F0}
      .btn-outline:hover{background:#F8F9FA}
      .nav-tab{padding:7px 16px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;transition:all .14s}
      .nt-on{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.1)}
      .nt-off{background:transparent;color:#64748B}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(239,159,39,.35);border-radius:2px}
    `}</style>
    <SixxabNav active="/sales"/>

    {toast&&<div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

    {/* Header */}
    <div style={{background:N,padding:"14px 5%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:CHALK,marginBottom:2}}>Sales <span style={{color:AMBER,fontStyle:"italic"}}>Command Center</span></h1>
          <p style={{fontSize:11.5,color:"rgba(245,245,240,.4)"}}>4 Levels of Sales AI · Research · Cadences · Pipeline · Scale</p>
        </div>
        {/* Pipeline KPIs */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["Contacts",contacts.length,CHALK],["Hot Leads",pipelineStats.hotLeads,GREEN],["Proposals",pipelineStats.proposal,BLUE],["Won",pipelineStats.won,GREEN],["At Risk",pipelineStats.atRisk,RED]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",padding:"5px 10px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
              <div style={{fontFamily:"Georgia",fontSize:16,fontWeight:800,color:c,lineHeight:1.2}}>{v}</div>
              <div style={{fontSize:9.5,color:"rgba(245,245,240,.3)",textTransform:"uppercase",letterSpacing:".06em"}}>{l}</div>
            </div>
          ))}
          <a href="/crm" style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,background:"rgba(37,99,235,.15)",border:"1px solid rgba(37,99,235,.3)",fontSize:12.5,color:"#93C5FD",textDecoration:"none",fontWeight:600}}>
            <i className="ti ti-address-book" style={{fontSize:12}} aria-hidden="true"/>CRM →
          </a>
        </div>
      </div>
    </div>

    {/* Navigation tabs */}
    <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"8px 5%",display:"flex",gap:4}}>
      {[["tools","🎯 Sales Tools"],["history","🕐 History"],["pipeline","📊 Pipeline AI"]].map(([v,l])=>(
        <button key={v} className={`nav-tab ${view===v?"nt-on":"nt-off"}`} onClick={()=>setView(v)}>{l}</button>
      ))}
    </div>

    <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 5% 60px",display:"grid",gridTemplateColumns:"300px 1fr",gap:20,alignItems:"start"}}>

      {/* LEFT PANEL */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>

        {/* CRM contact selector */}
        <div className="card">
          <div style={{padding:"12px 14px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>Select prospect</div>
            <input className="inp" style={{fontSize:12.5,padding:"7px 10px"}} placeholder="Search CRM contacts…" value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
          </div>
          <div style={{maxHeight:200,overflowY:"auto"}}>
            {/* Manual entry option */}
            <div onClick={()=>{setSelContact(null);setProspect(EMPTY_PROSPECT)}}
              style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #F1F5F9",background:!selContact?"#FFFBF2":"transparent",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:7,background:`${AMBER}20`,border:`1px solid ${AMBER}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✏️</div>
              <div style={{fontSize:12.5,color:N,fontWeight:!selContact?600:400}}>Enter prospect manually</div>
            </div>
            {filteredContacts.slice(0,20).map(c=>(
              <div key={c.id} onClick={()=>{setSelContact(c);setProspect({name:c.name||"",company:c.company||"",role:c.role||"",industry:c.industry||"",location:c.location||"",linkedin:c.linkedin||"",email:c.email||"",notes:c.notes||"",stage:c.stage||"Prospect",score:c.score||70})}}
                style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #F1F5F9",background:selContact?.id===c.id?"#FFFBF2":"transparent",transition:"background .1s"}}
                onMouseOver={e=>e.currentTarget.style.background=selContact?.id===c.id?"#FFFBF2":"#F8F9FA"}
                onMouseOut={e=>e.currentTarget.style.background=selContact?.id===c.id?"#FFFBF2":"transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:7,background:`${c.score>=75?GREEN:c.score>=50?AMBER:RED}18`,border:`1px solid ${c.score>=75?GREEN:c.score>=50?AMBER:RED}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:c.score>=75?GREEN:c.score>=50?AMBER:RED,flexShrink:0}}>
                    {c.score||"?"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12.5,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                    <div style={{fontSize:11,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.role} · {c.company}</div>
                  </div>
                </div>
              </div>
            ))}
            {contacts.length===0&&(
              <div style={{padding:"16px 14px",fontSize:12.5,color:"#94A3B8"}}>
                No contacts in CRM yet. <a href="/crm" style={{color:AMBER}}>Add contacts →</a>
              </div>
            )}
          </div>
        </div>

        {/* Prospect fields */}
        <div className="card" style={{padding:"14px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Prospect details</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[["name","Full name","Sarah Johnson"],["company","Company","Acme Corp"],["role","Job title","VP of Sales"],["industry","Industry","SaaS / Technology"],["location","Location","Dallas, TX"],["email","Email","sarah@acme.com"],["linkedin","LinkedIn URL","linkedin.com/in/…"]].map(([k,l,ph])=>(
              <div key={k}>
                <label style={{fontSize:10.5,color:"#94A3B8",display:"block",marginBottom:3}}>{l}</label>
                <input className="inp" style={{fontSize:12.5,padding:"7px 10px"}} value={prospect[k]||""} placeholder={ph}
                  onChange={e=>setProspect(p=>({...p,[k]:e.target.value}))}/>
              </div>
            ))}
            <div>
              <label style={{fontSize:10.5,color:"#94A3B8",display:"block",marginBottom:3}}>Context / notes</label>
              <textarea className="inp" rows={3} style={{fontSize:12.5,padding:"7px 10px"}} value={context||prospect.notes||""} placeholder="Previous interactions, pain points, trigger events…"
                onChange={e=>setContext(e.target.value)}/>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>

        {/* TOOLS VIEW */}
        {view==="tools"&&(<>
          {/* Level cards */}
          {LEVELS.map(level=>(
            <div key={level.id} className="fu">
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{padding:"4px 12px",borderRadius:20,background:level.color,color:"#fff",fontSize:11.5,fontWeight:700}}>{level.label}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:N}}>{level.title}</div>
                  <div style={{fontSize:12,color:"#64748B"}}>{level.desc}</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
                {level.tools.map(tool=>{
                  const isActive = activeTool?.id===tool.id && activeTool?.level===tool.level
                  return(
                    <button key={tool.id+tool.level} className="tool-card" onClick={()=>{selectTool({...tool,level:level.id,levelColor:level.color});setActiveLevel(level.id)}}
                      style={{borderColor:isActive?level.color:"#E2E8F0",background:isActive?`${level.color}08`:"#fff",textAlign:"left"}}>
                      <div style={{fontSize:24,marginBottom:8}}>{tool.icon}</div>
                      <div style={{fontSize:13.5,fontWeight:700,color:isActive?level.color:N,marginBottom:4}}>{tool.label}</div>
                      <div style={{fontSize:12,color:"#64748B",lineHeight:1.5}}>{tool.desc}</div>
                      {isActive&&<div style={{marginTop:8,fontSize:11,fontWeight:600,color:level.color}}>✓ Selected</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Run panel */}
          {activeTool&&(
            <div className="card fu">
              <div style={{padding:"14px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>{activeTool.icon}</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:N}}>{activeTool.label}</div>
                    <div style={{fontSize:12,color:"#64748B"}}>{activeTool.levelLabel} · {activeTool.levelTitle}</div>
                  </div>
                </div>
                <button className="btn btn-amber" onClick={run} disabled={loading||(!prospect.name&&!context)}>
                  {loading?<><div style={{width:16,height:16,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Running…</>:<><i className="ti ti-wand" style={{fontSize:14}} aria-hidden="true"/>Run {activeTool.label}</>}
                </button>
              </div>

              {!output&&!loading&&(
                <div style={{padding:"24px 18px",textAlign:"center",color:"#94A3B8",fontSize:13.5}}>
                  {prospect.name||context ? `Ready to run ${activeTool.label} for ${prospect.name||"this prospect"}` : "Fill in prospect details on the left, then click Run"}
                </div>
              )}

              {loading&&(
                <div style={{padding:"32px 18px",textAlign:"center"}}>
                  <div style={{width:32,height:32,border:`3px solid ${activeTool.levelColor||AMBER}33`,borderTopColor:activeTool.levelColor||AMBER,borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px"}}/>
                  <div style={{fontSize:14,color:"#64748B"}}>AI is analysing {prospect.name||"prospect"} and building your {activeTool.label}…</div>
                  <div style={{fontSize:12,color:"#94A3B8",marginTop:4}}>Usually takes 10–20 seconds</div>
                </div>
              )}

              {output&&(
                <>
                  <div ref={outputRef} style={{padding:"20px 22px",maxHeight:600,overflowY:"auto"}}>
                    <pre style={{fontFamily:"inherit",fontSize:13.5,lineHeight:1.8,color:N,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{output}</pre>
                  </div>
                  <div style={{padding:"12px 18px",borderTop:"1px solid #E8ECF4",background:"#FAFBFC",display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button className="btn btn-amber" onClick={copy}>
                      <i className="ti ti-copy" style={{fontSize:13}} aria-hidden="true"/>{copied?"Copied!":"Copy All"}
                    </button>
                    {selContact&&(
                      <button className="btn btn-outline" onClick={saveToContact}>
                        <i className="ti ti-address-book" style={{fontSize:13}} aria-hidden="true"/>Save to CRM
                      </button>
                    )}
                    <button className="btn btn-outline" onClick={run}>
                      <i className="ti ti-refresh" style={{fontSize:13}} aria-hidden="true"/>Regenerate
                    </button>
                    <a href="/crm" style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",borderRadius:9,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:13,color:N,textDecoration:"none",fontWeight:500}}>
                      <i className="ti ti-address-book" style={{fontSize:13}} aria-hidden="true"/>Open in CRM
                    </a>
                    <a href="/proposal" style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",borderRadius:9,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:13,color:N,textDecoration:"none",fontWeight:500}}>
                      <i className="ti ti-file" style={{fontSize:13}} aria-hidden="true"/>Write Proposal
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </>)}

        {/* HISTORY VIEW */}
        {view==="history"&&(
          <div className="card fu">
            <div style={{padding:"12px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:14,fontWeight:700,color:N}}>Sales AI History ({history.length})</div>
              {history.length>0&&<button onClick={()=>{if(confirm("Clear history?"))setHistory([])}} style={{padding:"4px 10px",borderRadius:7,background:"#FEF2F2",border:"1px solid #FECACA",color:RED,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Clear</button>}
            </div>
            {history.length===0
              ?<div style={{padding:"40px",textAlign:"center",color:"#94A3B8",fontSize:14}}>No history yet. Run a sales tool to see outputs here.</div>
              :history.map(item=>(
                <div key={item.id} style={{padding:"14px 18px",borderBottom:"1px solid #F1F5F9"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,fontWeight:600,color:AMBER,background:`${AMBER}15`,padding:"2px 9px",borderRadius:6}}>{item.label}</span>
                      <span style={{fontSize:13,fontWeight:500,color:N}}>{item.prospect}</span>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>{setOutput(item.output);setActiveTool(ALL_TOOLS.find(t=>t.id===item.tool)||{id:item.tool,label:item.label,icon:"🎯"});setView("tools");showToast("Loaded!")}}
                        style={{padding:"4px 10px",borderRadius:7,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:12,cursor:"pointer",fontFamily:"inherit",color:N}}>Load</button>
                      <button onClick={()=>{ navigator.clipboard?.writeText(item.output); showToast("Copied!") }}
                        style={{padding:"4px 10px",borderRadius:7,background:`${AMBER}15`,border:`1px solid ${AMBER}30`,fontSize:12,cursor:"pointer",fontFamily:"inherit",color:AMBER}}>Copy</button>
                    </div>
                  </div>
                  <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{item.output}</div>
                  <div style={{fontSize:11,color:"#CBD5E1",marginTop:6}}>{new Date(item.createdAt).toLocaleString()}</div>
                </div>
              ))
            }
          </div>
        )}

        {/* PIPELINE VIEW */}
        {view==="pipeline"&&(
          <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Pipeline stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
              {[["Total Contacts",contacts.length,N,"ti-users"],["Hot Leads (75+)",pipelineStats.hotLeads,GREEN,"ti-flame"],["In Proposal",pipelineStats.proposal,BLUE,"ti-file-text"],["Won",pipelineStats.won,GREEN,"ti-trophy"],["At Risk (<40)",pipelineStats.atRisk,RED,"ti-alert-triangle"]].map(([l,v,c,ic])=>(
                <div key={l} className="card" style={{padding:"16px",textAlign:"center"}}>
                  <i className={`ti ${ic}`} style={{fontSize:22,color:c,display:"block",marginBottom:4}} aria-hidden="true"/>
                  <div style={{fontFamily:"Georgia",fontSize:28,fontWeight:800,color:c,lineHeight:1,marginBottom:4}}>{v}</div>
                  <div style={{fontSize:11.5,color:"#64748B"}}>{l}</div>
                </div>
              ))}
            </div>

            {/* Run pipeline analysis */}
            <div className="card">
              <div style={{padding:"14px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:N}}>AI Pipeline Analysis</div>
                  <div style={{fontSize:12,color:"#64748B"}}>Revenue forecast, deal health, red flags, quota projection</div>
                </div>
                <button className="btn btn-amber" onClick={()=>{setActiveTool({id:"pipeline",label:"Pipeline Analysis",icon:"📊",levelColor:RED,levelLabel:"Level 3",levelTitle:"Custom Skills"});run()}} disabled={loading||contacts.length===0}>
                  {loading?<><div style={{width:14,height:14,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Analysing…</>:<><i className="ti ti-chart-bar" style={{fontSize:13}} aria-hidden="true"/>Analyse Pipeline</>}
                </button>
              </div>
              {contacts.length===0
                ?<div style={{padding:"32px",textAlign:"center",color:"#94A3B8",fontSize:13}}>Add contacts in the <a href="/crm" style={{color:AMBER}}>CRM</a> first to run pipeline analysis.</div>
                :output&&activeTool?.id==="pipeline"
                  ?<div style={{padding:"20px",maxHeight:500,overflowY:"auto"}}><pre style={{fontFamily:"inherit",fontSize:13.5,lineHeight:1.8,color:N,whiteSpace:"pre-wrap"}}>{output}</pre></div>
                  :<div style={{padding:"20px",fontSize:13.5,color:"#64748B"}}>{contacts.length} contacts loaded from CRM. Click "Analyse Pipeline" to get revenue forecast and deal recommendations.</div>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  </>)
}
