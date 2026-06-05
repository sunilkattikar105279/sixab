// pages/proposal.js — SIXXAB AI Proposal Writer
// CSO-owned: full proposals, SOW, case studies, follow-ups, objection rebuttals
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0", BLUE = "#378ADD"

const CRM_KEY = "sixxab_crm_contacts"
function loadCRM() { try { return JSON.parse(localStorage.getItem(CRM_KEY)||"[]") } catch { return [] } }

const TOOLS = [
  { id:"full_proposal",      icon:"📄", label:"Full Proposal",        color:BLUE,     desc:"Complete professional proposal — problem, approach, scope, ROI, timeline" },
  { id:"executive_summary",  icon:"📋", label:"Executive Summary",    color:"#7C3AED",desc:"150-word punchy summary for busy decision makers" },
  { id:"scope_of_work",      icon:"📐", label:"Scope of Work",        color:"#EF9F27",desc:"Detailed SOW with inclusions, exclusions, milestones, acceptance criteria" },
  { id:"case_study",         icon:"⭐", label:"Case Study",           color:"#1D9E75",desc:"Client success story from bullet points — for website and sales" },
  { id:"follow_up_proposal", icon:"🔄", label:"Proposal Follow-Up",   color:"#EC4899",desc:"Re-engage a non-responding prospect post-proposal" },
  { id:"objection_rebuttal", icon:"🛡️", label:"Objection Rebuttal",  color:"#DC2626",desc:"One-page document handling the specific objection they raised" },
]

export default function ProposalPage() {
  const [activeTool,   setActiveTool]   = useState("full_proposal")
  const [params,       setParams]       = useState({ clientName:"", clientRole:"", company:"", industry:"", problem:"", solution:"SIXXAB AI — Autonomous Business Platform", price:"", timeline:"30-day onboarding", outcomes:"First revenue in 48 hours, $10k MRR in 90 days", engagement:"SIXXAB AI platform onboarding and setup", duration:"90 days", before:"", results:"", anonymous:"use real name", sentDate:"", objection:"", context:"", name:"" })
  const [loading,      setLoading]      = useState(false)
  const [output,       setOutput]       = useState("")
  const [history,      setHistory]      = useState([])
  const [crmContacts,  setCrmContacts]  = useState([])
  const [crmSearch,    setCrmSearch]    = useState("")
  const [selectedId,   setSelectedId]   = useState("")
  const [toast,        setToast]        = useState(null)

  useEffect(() => {
    setCrmContacts(loadCRM())
    try { setHistory(JSON.parse(localStorage.getItem("sixxab_proposal_history")||"[]")) } catch {}
    const onUpdate = (e) => { if(e.detail?.contacts) setCrmContacts(e.detail.contacts) }
    window.addEventListener("sixxab_crm_updated", onUpdate)
    return () => window.removeEventListener("sixxab_crm_updated", onUpdate)
  }, [])

  function showToast(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),3500) }
  const setP = (k,v) => setParams(f=>({...f,[k]:v}))
  const tool = TOOLS.find(t=>t.id===activeTool) || TOOLS[0]

  function selectContact(id) {
    setSelectedId(id)
    const c = crmContacts.find(x=>String(x.id)===String(id))
    if (!c) return
    setParams(p=>({...p, clientName:c.name, name:c.name, clientRole:c.role||"", company:c.company||"", industry:"", problem:c.notes||"" }))
  }

  async function generate() {
    const required = { full_proposal:"clientName", executive_summary:"clientName", scope_of_work:"company", case_study:"clientName", follow_up_proposal:"name", objection_rebuttal:"objection" }
    if (!params[required[activeTool]]) { showToast(`Please fill in the ${required[activeTool]==="objection"?"objection":"client name"} field`, false); return }
    setLoading(true); setOutput("")
    try {
      const r = await fetch("/api/proposal", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type:activeTool, params })
      })
      const d = await r.json()
      if (!r.ok || d.error) { showToast(d.error||"Generation failed", false); setLoading(false); return }
      setOutput(d.content)
      // Save history
      const item = { id:Date.now(), type:activeTool, label:tool.label, client:params.clientName||params.name||params.company, output:d.content, timestamp:new Date().toISOString() }
      const nh = [item,...history].slice(0,30)
      setHistory(nh); localStorage.setItem("sixxab_proposal_history", JSON.stringify(nh))
    } catch { showToast("Network error", false) }
    setLoading(false)
  }

  function exportMd() {
    const blob = new Blob([`# ${tool.label}: ${params.clientName||params.name||params.company}\n\n${output}`],{type:"text/markdown"})
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob)
    a.download=`sixxab-proposal-${Date.now()}.md`; a.click()
  }

  const filteredCrm = crmContacts.filter(c=>!crmSearch||`${c.name} ${c.company}`.toLowerCase().includes(crmSearch.toLowerCase()))

  const FIELDS = {
    full_proposal:     [["clientName","Client name *",""],["clientRole","Their role / title",""],["company","Company *",""],["industry","Industry",""],["problem","Problem they have *",""],["price","Investment / price",""],["timeline","Timeline",""],["outcomes","Key outcomes promised",""]],
    executive_summary: [["clientName","Client name *",""],["company","Company *",""],["problem","Problem summary",""],["solution","Solution overview",""],["price","Investment",""]],
    scope_of_work:     [["company","Client company *",""],["engagement","Engagement description",""],["duration","Duration",""],["price","Total investment",""]],
    case_study:        [["clientName","Client name *",""],["industry","Industry",""],["before","Situation before",""],["results","Results achieved *",""],["timeline","Timeline",""],["anonymous","Use real name?",""]],
    follow_up_proposal:[["name","Prospect name *",""],["company","Company *",""],["sentDate","When proposal was sent",""],["price","Proposal value",""]],
    objection_rebuttal:[["objection","The objection raised *",""],["context","Prospect context",""],["clientName","Client name",""]],
  }
  const fields = FIELDS[activeTool] || []

  return (
    <>
      <Head>
        <title>SIXXAB AI — Proposal Writer · CSO Suite</title>
        <meta name="description" content="AI Proposal Writer — generate full proposals, SOW, case studies, follow-ups and objection rebuttals. Powered by CSO advisor."/>
      </Head>
      <style>{`
        body{background:#F4F4F0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .3s ease both}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        .inp{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13px;color:${N};background:#fff;transition:border .15s;font-family:inherit}
        .inp:focus{border-color:${BLUE};outline:none}
        textarea.inp{resize:vertical;line-height:1.6}
        .tool-btn{display:flex;align-items:center;gap:8px;width:100%;padding:10px 12px;border:none;background:transparent;cursor:pointer;font-family:inherit;border-radius:9px;transition:all .14s;border-left:3px solid transparent;text-align:left}
        .tool-btn:hover{background:#F8F9FA}
        .tool-btn.on{background:#F8F9FA;border-left-color:var(--tc)}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${BLUE};border-radius:2px}
      `}</style>

      <SixxabNav active="/proposal"/>

      {toast && <div style={{position:"fixed",bottom:24,right:24,zIndex:999,padding:"10px 18px",borderRadius:10,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.1)",animation:"fadeUp .3s ease"}}>
        {toast.ok?"✓":"✗"} {toast.msg}
      </div>}

      {/* Header */}
      <div style={{background:N,padding:"16px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(55,138,221,.18)",border:"1.5px solid rgba(55,138,221,.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-file-text" style={{fontSize:22,color:BLUE}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                <h1 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:CHALK,letterSpacing:.5}}>
                  SIXXAB <span style={{color:BLUE,fontStyle:"italic"}}>Proposal Writer</span>
                </h1>
                <span style={{padding:"2px 9px",borderRadius:20,background:"rgba(55,138,221,.15)",border:"1px solid rgba(55,138,221,.35)",fontSize:10,fontWeight:600,color:"#93C5FD"}}>CSO Suite</span>
              </div>
              <p style={{fontSize:12,color:"rgba(245,245,240,.45)"}}>Full proposals · SOW · Case studies · Follow-ups · Objection rebuttals · CRM-synced</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{textAlign:"center",padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
              <div style={{fontFamily:"Georgia",fontSize:18,color:BLUE}}>{history.length}</div>
              <div style={{fontSize:9.5,color:"rgba(245,245,240,.4)",textTransform:"uppercase",letterSpacing:".07em"}}>Proposals</div>
            </div>
            <a href="/leads" style={{padding:"6px 14px",borderRadius:8,background:"rgba(29,158,117,.2)",border:"1px solid rgba(29,158,117,.4)",fontSize:12,fontWeight:500,color:"#6EE7B7",textDecoration:"none"}}>Lead Gen →</a>
            <a href="/studio" style={{padding:"6px 14px",borderRadius:8,background:"rgba(212,83,126,.2)",border:"1px solid rgba(212,83,126,.4)",fontSize:12,fontWeight:500,color:"#F9A8D4",textDecoration:"none"}}>Content Studio →</a>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 20px 60px"}}>
        <div style={{display:"grid",gridTemplateColumns:"190px 1fr",gap:14}}>

          {/* Tool nav */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div className="card">
              <div style={{padding:"9px 12px",borderBottom:"1px solid #E8ECF4",fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em"}}>Proposal Tools</div>
              {TOOLS.map(t=>(
                <button key={t.id} className={`tool-btn${activeTool===t.id?" on":""}`}
                  style={{"--tc":t.color}} onClick={()=>{setActiveTool(t.id);setOutput("")}}>
                  <span style={{fontSize:18,flexShrink:0}}>{t.icon}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:activeTool===t.id?N:"#64748B",lineHeight:1.3}}>{t.label}</div>
                    <div style={{fontSize:10.5,color:"#94A3B8",lineHeight:1.3}}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* History */}
            {history.length>0 && (
              <div className="card">
                <div style={{padding:"9px 12px",borderBottom:"1px solid #E8ECF4",fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em"}}>Recent ({history.length})</div>
                {history.slice(0,6).map(h=>(
                  <div key={h.id} onClick={()=>setOutput(h.output)}
                    style={{padding:"8px 12px",cursor:"pointer",borderBottom:"1px solid #F1F5F9"}}
                    onMouseOver={e=>e.currentTarget.style.background="#F8F9FA"}
                    onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{fontSize:11,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.client||"Untitled"}</div>
                    <div style={{fontSize:10,color:"#94A3B8"}}>{h.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main */}
          <div>
            {/* CRM picker */}
            <div className="card" style={{padding:"13px 16px",marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:600,color:N,marginBottom:8}}>Load contact from SIXXAB CRM</div>
              <input className="inp" placeholder="Search CRM contacts…" value={crmSearch} onChange={e=>setCrmSearch(e.target.value)} style={{marginBottom:8}}/>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",maxHeight:100,overflowY:"auto"}}>
                {filteredCrm.slice(0,12).map(c=>(
                  <div key={String(c.id)} onClick={()=>selectContact(String(c.id))}
                    style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,border:`1px solid ${selectedId===String(c.id)?BLUE+"66":"#E2E8F0"}`,background:selectedId===String(c.id)?"#EFF6FF":"#fff",cursor:"pointer",fontSize:12,color:selectedId===String(c.id)?"#1D4ED8":N,transition:"all .14s",flexShrink:0}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:`${BLUE}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:600,color:BLUE,flexShrink:0}}>
                      {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                    </div>
                    {c.name}
                    {c.company && <span style={{color:"#94A3B8",fontSize:10}}>· {c.company}</span>}
                  </div>
                ))}
                {filteredCrm.length===0 && <div style={{fontSize:12,color:"#94A3B8"}}>No contacts. <a href="/crm" style={{color:BLUE}}>Add in CRM →</a></div>}
              </div>
            </div>

            {/* Input form */}
            <div className="card fu" style={{marginBottom:14}}>
              <div style={{padding:"11px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>{tool.icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:N}}>{tool.label}</div>
                  <div style={{fontSize:11.5,color:"#64748B"}}>{tool.desc}</div>
                </div>
              </div>
              <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:11}}>
                {fields.map(([k,label])=>(
                  <div key={k}>
                    <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:4}}>{label}</label>
                    {k==="problem"||k==="before"||k==="results"||k==="context"||k==="outcomes"
                      ? <textarea className="inp" rows={2} placeholder="" value={params[k]||""} onChange={e=>setP(k,e.target.value)}/>
                      : <input className="inp" value={params[k]||""} onChange={e=>setP(k,e.target.value)}/>
                    }
                  </div>
                ))}
                <button onClick={generate} disabled={loading}
                  style={{width:"100%",padding:12,borderRadius:10,background:loading?"#F1F5F9":BLUE,color:loading?"#94A3B8":"#fff",border:"none",cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .15s"}}>
                  {loading ? <><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Writing {tool.label}…</> : `✦ Write ${tool.label} →`}
                </button>
              </div>
            </div>

            {/* Output */}
            {output && (
              <div className="card fu">
                <div style={{padding:"11px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                  <div style={{fontSize:13,fontWeight:600,color:N}}>{tool.label} — {params.clientName||params.name||params.company}</div>
                  <div style={{display:"flex",gap:7}}>
                    <button onClick={exportMd} style={{padding:"5px 13px",borderRadius:7,background:"#F5F3FF",border:"1px solid #C4B5FD",fontSize:12,fontWeight:500,color:"#6D28D9",cursor:"pointer",fontFamily:"inherit"}}>↓ Export .md</button>
                    <button onClick={()=>window.print()} style={{padding:"5px 13px",borderRadius:7,background:"#F1F5F9",border:"1px solid #E2E8F0",fontSize:12,color:"#64748B",cursor:"pointer",fontFamily:"inherit"}}>🖨 Print</button>
                    <button onClick={()=>navigator.clipboard.writeText(output).then(()=>showToast("Copied!"))}
                      style={{padding:"5px 13px",borderRadius:7,background:BLUE,border:"none",fontSize:12,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>Copy</button>
                  </div>
                </div>
                <div style={{padding:"20px 24px",fontSize:14,color:N,lineHeight:1.95,whiteSpace:"pre-wrap",fontFamily:"Georgia,'Plus Jakarta Sans',sans-serif",maxHeight:700,overflowY:"auto"}}>
                  {output}
                </div>
                <div style={{padding:"10px 16px",borderTop:"1px solid #E8ECF4",background:"#FAFAFA",fontSize:12.5,color:"#64748B",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <i className="ti ti-arrow-right" aria-hidden="true"/>
                  Next steps:
                  <a href="/crm" style={{color:"#1D9E75",fontWeight:500,textDecoration:"none"}}>Update pipeline in CRM</a>
                  ·
                  <a href="/leads" style={{color:"#378ADD",fontWeight:500,textDecoration:"none"}}>Handle objections →</a>
                  ·
                  <a href="/orchestrator" style={{color:AMBER,fontWeight:500,textDecoration:"none"}}>Run Orchestrator for next steps →</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
