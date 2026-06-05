// pages/leads.js — SIXXAB AI Lead Generation SaaS
// CSO-owned: ICP, prospect generation, outreach sequences, scoring, CRM push
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0", GREEN = "#1D9E75"

const CRM_KEY = "sixxab_crm_contacts"
function loadCRM() { try { return JSON.parse(localStorage.getItem(CRM_KEY)||"[]") } catch { return [] } }
function saveCRM(list) {
  try {
    localStorage.setItem(CRM_KEY, JSON.stringify(list))
    localStorage.setItem("sixxab_crm_lastupdate", Date.now().toString())
    window.dispatchEvent(new CustomEvent("sixxab_crm_updated", { detail:{ contacts:list } }))
  } catch {}
}
function mkId() { return `${Date.now()}-${Math.random().toString(36).slice(2)}` }

const INDUSTRIES = ["HVAC & Air Conditioning","Real Estate","Legal Services","Business Consulting","Landscaping","Plumbing & Electrical","IT Support & MSP","Health & Wellness","Roofing","Auto Repair","FinTech","E-Commerce","EdTech","SaaS","Manufacturing","Logistics","Other"]
const LOCATIONS  = ["Dallas, TX","Houston, TX","Austin, TX","DFW Metroplex","United States","United Kingdom","Europe","India","Australia","Singapore","Other"]

const TOOLS = [
  { id:"icp",      icon:"🎯", label:"ICP Builder",        color:"#EF9F27", desc:"Define your Ideal Customer Profile" },
  { id:"prospects",icon:"👥", label:"Prospect Generator",  color:GREEN,    desc:"Generate 15 qualified prospect profiles" },
  { id:"sequence", icon:"📧", label:"Outreach Sequence",   color:"#378ADD", desc:"7-touchpoint multi-channel sequence" },
  { id:"qualify",  icon:"⚡", label:"Lead Qualifier",      color:"#7C3AED", desc:"Score and qualify any lead from CRM" },
  { id:"objections",icon:"🛡️",label:"Objection Handler",  color:"#DC2626", desc:"Handle any sales objection with 3 responses" },
  { id:"followup", icon:"🔄", label:"Follow-Up Writer",    color:"#EC4899", desc:"Write a follow-up for any non-responder" },
]

export default function LeadsPage() {
  const [activeTool,     setActiveTool]     = useState("icp")
  const [params,         setParams]         = useState({ industry:"", location:"Dallas, TX", product:"SIXXAB AI — Autonomous Business Platform", price:"$49.50/mo", prospectName:"", prospectRole:"", company:"", painPoint:"", offer:"50% off founding member access at $49.50/mo", notes:"", stage:"Outreach", channel:"LinkedIn", daysSince:"7", context:"", objection:"", name:"", role:"", lastTouch:"" })
  const [loading,        setLoading]        = useState(false)
  const [output,         setOutput]         = useState("")
  const [prospects,      setProspects]      = useState([]) // parsed JSON list from prospect_list
  const [selectedLeads,  setSelectedLeads]  = useState([])
  const [crmContacts,    setCrmContacts]    = useState([])
  const [selectedCrmId,  setSelectedCrmId]  = useState("")
  const [toast,          setToast]          = useState(null)
  const [crmSearch,      setCrmSearch]      = useState("")

  useEffect(() => {
    setCrmContacts(loadCRM())
    const onUpdate = (e) => { if(e.detail?.contacts) setCrmContacts(e.detail.contacts) }
    window.addEventListener("sixxab_crm_updated", onUpdate)
    return () => window.removeEventListener("sixxab_crm_updated", onUpdate)
  }, [])

  function showToast(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),3500) }
  const setP = (k,v) => setParams(f=>({...f,[k]:v}))
  const tool = TOOLS.find(t=>t.id===activeTool) || TOOLS[0]

  // When CRM contact selected — fill params
  function selectCrmContact(id) {
    setSelectedCrmId(id)
    const c = crmContacts.find(x=>String(x.id)===String(id))
    if (!c) return
    setParams(p=>({...p, name:c.name, prospectName:c.name, prospectRole:c.role||"", role:c.role||"", company:c.company||"", stage:c.stage||"Outreach", painPoint:c.notes||"", notes:c.notes||"", lastTouch:c.lastTouch||"Initial outreach" }))
  }

  async function generate() {
    const typeMap = { icp:"prospect_profile", prospects:"prospect_list", sequence:"outreach_sequence", qualify:"qualify_lead", objections:"objection_rebuttal", followup:"follow_up" }
    const type = typeMap[activeTool]
    setLoading(true); setOutput(""); setProspects([])
    try {
      const r = await fetch("/api/leads", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type, params, existingContacts:crmContacts })
      })
      const d = await r.json()
      if (!r.ok || d.error) { showToast(d.error||"Generation failed", false); setLoading(false); return }
      if (activeTool==="prospects" && Array.isArray(d.result)) {
        setProspects(d.result); setOutput("")
      } else {
        setOutput(typeof d.result==="string" ? d.result : JSON.stringify(d.result,null,2))
        setProspects([])
      }
    } catch { showToast("Network error", false) }
    setLoading(false)
  }

  // Add selected prospects to SIXXAB CRM
  function addToCrm() {
    const toAdd = prospects.filter(p=>selectedLeads.includes(p.name))
    if (!toAdd.length) { showToast("Select at least one prospect", false); return }
    const current = loadCRM()
    const added = []
    toAdd.forEach(p=>{
      if (current.find(c=>c.email===p.linkedin)) return // skip exact dupes
      const contact = { id:mkId(), name:p.name, role:p.role, company:p.company, email:"",
        linkedin:p.linkedin, location:p.location, stage:"Prospect", score:p.score||60,
        source:"Lead Gen Agent", notes:p.painPoint, tags:p.tags||[], value:"Starter",
        lastTouch:"Added by Lead Gen Agent", createdAt:new Date().toISOString(),
        assignedAgent:"leads", leadType:"generated" }
      current.push(contact); added.push(p.name)
    })
    saveCRM(current); setCrmContacts(current)
    setSelectedLeads([])
    showToast(`Added ${added.length} leads to SIXXAB CRM`)
  }

  // CRM filtered for qualify/followup pickers
  const filteredCrm = crmContacts.filter(c=>!crmSearch||`${c.name} ${c.role} ${c.company}`.toLowerCase().includes(crmSearch.toLowerCase()))

  // Field configs per tool
  const FIELDS = {
    icp:       [["industry","Target industry *",""],["location","Target location",""],["product","Your product/service",""],["price","Price point",""]],
    prospects: [["industry","Target industry *",""],["location","Target location",""],["product","Your product",""]],
    sequence:  [["prospectName","Prospect name *",""],["prospectRole","Their role",""],["company","Their company",""],["painPoint","Their pain point",""],["offer","Your offer",""]],
    qualify:   [["industry","Industry",""],["location","Location",""],["notes","Notes / context",""],["budget","Budget signal",""],["timeline","Timeline signal",""]],
    objections:[["objection","The objection *","e.g. We don't have budget right now"],["context","Prospect context",""]],
    followup:  [["lastTouch","Last touchpoint",""],["daysSince","Days since last contact",""],["channel","Channel",""],["notes","Notes",""]],
  }
  const fields = FIELDS[activeTool] || []

  return (
    <>
      <Head>
        <title>SIXXAB AI — Lead Generation · CSO Suite</title>
        <meta name="description" content="AI Lead Generation — ICP builder, prospect generator, outreach sequences, lead scoring and objection handling. Powered by CSO advisor."/>
      </Head>
      <style>{`
        body{background:#F4F4F0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .3s ease both}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        .inp{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13px;color:${N};background:#fff;transition:border .15s;font-family:inherit}
        .inp:focus{border-color:${GREEN};outline:none}
        select.inp{cursor:pointer}
        textarea.inp{resize:vertical;line-height:1.6}
        .tool-btn{display:flex;align-items:center;gap:8px;width:100%;padding:10px 12px;border:none;background:transparent;cursor:pointer;font-family:inherit;border-radius:9px;transition:all .14s;border-left:3px solid transparent;text-align:left}
        .tool-btn:hover{background:#F8F9FA}
        .tool-btn.on{background:#F8F9FA;border-left-color:var(--tc)}
        .prospect-card{border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;transition:all .14s;cursor:pointer}
        .prospect-card:hover{border-color:#CBD5E1;background:#FAFAFA}
        .prospect-card.on{border-color:${GREEN};background:#F0FDF4}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${GREEN};border-radius:2px}
      `}</style>

      <SixxabNav active="/leads"/>

      {toast && <div style={{position:"fixed",bottom:24,right:24,zIndex:999,padding:"10px 18px",borderRadius:10,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.1)",animation:"fadeUp .3s ease"}}>
        {toast.ok?"✓":"✗"} {toast.msg}
      </div>}

      {/* Header */}
      <div style={{background:N,padding:"16px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(29,158,117,.18)",border:"1.5px solid rgba(29,158,117,.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-user-search" style={{fontSize:22,color:GREEN}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                <h1 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:CHALK,letterSpacing:.5}}>
                  SIXXAB <span style={{color:GREEN,fontStyle:"italic"}}>Lead Generation</span>
                </h1>
                <span style={{padding:"2px 9px",borderRadius:20,background:"rgba(29,158,117,.15)",border:"1px solid rgba(29,158,117,.35)",fontSize:10,fontWeight:600,color:"#6EE7B7"}}>CSO Suite</span>
              </div>
              <p style={{fontSize:12,color:"rgba(245,245,240,.45)"}}>ICP builder · Prospect generator · Outreach sequences · Lead scoring · Objection handling · CRM sync</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{textAlign:"center",padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
              <div style={{fontFamily:"Georgia",fontSize:18,color:GREEN}}>{crmContacts.length}</div>
              <div style={{fontSize:9.5,color:"rgba(245,245,240,.4)",textTransform:"uppercase",letterSpacing:".07em"}}>CRM Contacts</div>
            </div>
            <a href="/studio" style={{padding:"6px 14px",borderRadius:8,background:"rgba(212,83,126,.2)",border:"1px solid rgba(212,83,126,.4)",fontSize:12,fontWeight:500,color:"#F9A8D4",textDecoration:"none"}}>Content Studio →</a>
            <a href="/proposal" style={{padding:"6px 14px",borderRadius:8,background:"rgba(55,138,221,.2)",border:"1px solid rgba(55,138,221,.4)",fontSize:12,fontWeight:500,color:"#93C5FD",textDecoration:"none"}}>Proposals →</a>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 20px 60px"}}>
        <div style={{display:"grid",gridTemplateColumns:"190px 1fr",gap:14}}>

          {/* Tool nav */}
          <div>
            <div className="card">
              <div style={{padding:"9px 12px",borderBottom:"1px solid #E8ECF4",fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em"}}>Lead Gen Tools</div>
              {TOOLS.map(t=>(
                <button key={t.id} className={`tool-btn${activeTool===t.id?" on":""}`}
                  style={{"--tc":t.color}} onClick={()=>{setActiveTool(t.id);setOutput("");setProspects([]);setSelectedLeads([])}}>
                  <span style={{fontSize:18,flexShrink:0}}>{t.icon}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:activeTool===t.id?N:"#64748B",lineHeight:1.3}}>{t.label}</div>
                    <div style={{fontSize:10.5,color:"#94A3B8",lineHeight:1.3}}>{t.desc}</div>
                  </div>
                </button>
              ))}
              <div style={{padding:"10px 12px",borderTop:"1px solid #E8ECF4"}}>
                <a href="/crm" style={{display:"block",padding:"8px",borderRadius:8,background:N,color:CHALK,fontSize:12,fontWeight:600,textDecoration:"none",textAlign:"center"}}>Open SIXXAB CRM →</a>
              </div>
            </div>
          </div>

          {/* Main panel */}
          <div>
            {/* CRM contact picker for qualify / followup tools */}
            {(activeTool==="qualify"||activeTool==="followup") && (
              <div className="card" style={{padding:"13px 16px",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:600,color:N,marginBottom:8}}>Select a contact from SIXXAB CRM</div>
                <input className="inp" placeholder="Search CRM contacts…" value={crmSearch} onChange={e=>setCrmSearch(e.target.value)} style={{marginBottom:8}}/>
                <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
                  {filteredCrm.slice(0,10).map(c=>(
                    <div key={String(c.id)} onClick={()=>selectCrmContact(String(c.id))}
                      style={{display:"flex",alignItems:"center",gap:9,padding:"7px 10px",cursor:"pointer",borderRadius:8,background:selectedCrmId===String(c.id)?"#F0FDF4":"transparent",border:`1px solid ${selectedCrmId===String(c.id)?"#6EE7B7":"transparent"}`}}>
                      <div style={{width:26,height:26,borderRadius:"50%",background:`${GREEN}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,color:GREEN,flexShrink:0}}>
                        {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12.5,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                        <div style={{fontSize:10.5,color:"#94A3B8"}}>{c.role||"—"} · {c.stage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tool input */}
            <div className="card fu" style={{marginBottom:14}}>
              <div style={{padding:"11px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>{tool.icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:N}}>{tool.label}</div>
                  <div style={{fontSize:11.5,color:"#64748B"}}>{tool.desc}</div>
                </div>
              </div>
              <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:11}}>
                {fields.map(([k,label,ph])=>(
                  <div key={k}>
                    <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:4}}>{label}</label>
                    {k==="industry"
                      ? <select className="inp" value={params[k]||""} onChange={e=>setP(k,e.target.value)}>
                          <option value="">Select industry…</option>
                          {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                        </select>
                      : k==="location"
                      ? <select className="inp" value={params[k]||""} onChange={e=>setP(k,e.target.value)}>
                          {LOCATIONS.map(l=><option key={l}>{l}</option>)}
                        </select>
                      : k==="notes"||k==="painPoint"||k==="context"
                      ? <textarea className="inp" rows={2} placeholder={ph||`Enter ${label.toLowerCase()}…`} value={params[k]||""} onChange={e=>setP(k,e.target.value)}/>
                      : <input className="inp" placeholder={ph||`Enter ${label.toLowerCase()}…`} value={params[k]||""} onChange={e=>setP(k,e.target.value)}/>
                    }
                  </div>
                ))}
                <button onClick={generate} disabled={loading}
                  style={{width:"100%",padding:12,borderRadius:10,background:loading?"#F1F5F9":GREEN,color:loading?"#94A3B8":"#fff",border:"none",cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .15s"}}>
                  {loading ? <><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Running {tool.label}…</> : `✦ Run ${tool.label} →`}
                </button>
              </div>
            </div>

            {/* Prospect cards */}
            {prospects.length>0 && (
              <div className="fu">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:600,color:N}}>{prospects.length} prospects generated · {selectedLeads.length} selected</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setSelectedLeads(selectedLeads.length===prospects.length?[]:prospects.map(p=>p.name))}
                      style={{padding:"6px 14px",borderRadius:8,border:"1px solid #E2E8F0",background:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit",color:"#64748B"}}>
                      {selectedLeads.length===prospects.length?"Deselect all":"Select all"}
                    </button>
                    {selectedLeads.length>0 && (
                      <button onClick={addToCrm} style={{padding:"6px 14px",borderRadius:8,background:GREEN,color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                        Add {selectedLeads.length} to SIXXAB CRM →
                      </button>
                    )}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {prospects.map((p,i)=>{
                    const sel = selectedLeads.includes(p.name)
                    return (
                      <div key={i} className={`prospect-card${sel?" on":""}`} onClick={()=>setSelectedLeads(sel?selectedLeads.filter(n=>n!==p.name):[...selectedLeads,p.name])}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
                          <div style={{width:32,height:32,borderRadius:8,background:`${GREEN}20`,border:`1px solid ${GREEN}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:GREEN,flexShrink:0}}>
                            {p.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:600,color:N}}>{p.name}</div>
                            <div style={{fontSize:11.5,color:"#64748B"}}>{p.role} · {p.company}</div>
                          </div>
                          <div style={{width:34,height:34,borderRadius:"50%",border:`2px solid ${p.score>=75?"#1D9E75":p.score>=60?AMBER:"#DC2626"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:p.score>=75?"#1D9E75":p.score>=60?AMBER:"#DC2626",flexShrink:0}}>{p.score}</div>
                        </div>
                        <div style={{fontSize:12,color:"#64748B",lineHeight:1.55,marginBottom:7}}>{p.painPoint}</div>
                        <div style={{fontSize:11.5,color:GREEN,fontStyle:"italic",marginBottom:8}}>⚡ {p.triggerEvent}</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          <a href={p.linkedin} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                            style={{fontSize:10.5,padding:"2px 8px",borderRadius:8,background:"#EFF6FF",color:"#1D4ED8",textDecoration:"none",fontWeight:500}}>LinkedIn</a>
                          <button onClick={(e)=>{e.stopPropagation();setParams(p2=>({...p2,prospectName:p.name,prospectRole:p.role,company:p.company,painPoint:p.painPoint}));setActiveTool("sequence");setOutput("")}}
                            style={{fontSize:10.5,padding:"2px 8px",borderRadius:8,background:`${GREEN}18`,color:GREEN,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>
                            → Generate sequence
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Text output */}
            {output && (
              <div className="card fu">
                <div style={{padding:"11px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                  <div style={{fontSize:13,fontWeight:600,color:N}}>{tool.label} output</div>
                  <div style={{display:"flex",gap:7}}>
                    <button onClick={()=>navigator.clipboard.writeText(output).then(()=>showToast("Copied!"))}
                      style={{padding:"5px 13px",borderRadius:7,background:GREEN,border:"none",fontSize:12,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>Copy</button>
                    {activeTool==="qualify" && (
                      <a href="/proposal" style={{padding:"5px 13px",borderRadius:7,background:"#EFF6FF",border:"1px solid #BFDBFE",fontSize:12,fontWeight:500,color:"#1D4ED8",textDecoration:"none"}}>Write proposal →</a>
                    )}
                  </div>
                </div>
                <div style={{padding:"16px 20px",fontSize:13.5,color:N,lineHeight:1.85,whiteSpace:"pre-wrap",maxHeight:600,overflowY:"auto"}}>{output}</div>
                <div style={{padding:"10px 16px",borderTop:"1px solid #E8ECF4",background:"#FAFAFA",fontSize:12.5,color:"#64748B",display:"flex",gap:8,alignItems:"center"}}>
                  <i className="ti ti-arrow-right" aria-hidden="true"/>
                  Ready to propose?
                  <a href="/proposal" style={{color:"#378ADD",fontWeight:500,textDecoration:"none"}}>Write a full proposal →</a>
                  or
                  <a href="/crm" style={{color:GREEN,fontWeight:500,textDecoration:"none"}}>Add to SIXXAB CRM →</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
