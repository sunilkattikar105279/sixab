// pages/crm.js
// SIXXAB AI — CRM — Complete contact management, LinkedIn import, pipeline, agent integration
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect, useRef } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

// ── Contact schema ────────────────────────────────────────────────────────────
const EMPTY_CONTACT = {
  id: "", name: "", role: "", company: "", email: "", phone: "",
  linkedin: "", location: "", source: "Manual", stage: "Prospect",
  score: 50, tags: [], notes: "", lastTouch: "", value: "Starter",
  assignedAgent: "marketing", createdAt: "", updatedAt: "",
}

const STAGES = [
  { id:"Prospect",   color:"#F1EFE8", txt:"#5F5E5A", border:"#D6D3CC" },
  { id:"Outreach",   color:"#FAEEDA", txt:"#633806", border:"#F5CDA0" },
  { id:"Replied",    color:"#EFF6FF", txt:"#1E40AF", border:"#BFDBFE" },
  { id:"Demo",       color:"#E6F1FB", txt:"#0C447C", border:"#93C5FD" },
  { id:"Proposal",   color:"#F5F3FF", txt:"#4C1D95", border:"#C4B5FD" },
  { id:"Negotiation",color:"#FEF3C7", txt:"#92400E", border:"#FDE68A" },
  { id:"Closed ✓",   color:"#E1F5EE", txt:"#085041", border:"#6EE7B7" },
  { id:"Lost",       color:"#FEF2F2", txt:"#991B1B", border:"#FECACA" },
]

const SOURCES = ["LinkedIn","LinkedIn Sales Navigator","Referral","Product Hunt","AppSumo","Website","Discovery Call","Event","Cold Email","Other"]
const AGENTS  = ["marketing","sales","support","strategy","content","ops","finance","hr"]
const VALUES  = ["Starter","Pro","Agency","Enterprise"]
const TAGS    = ["Hot lead","Decision maker","Founder","Agency","Freelancer","Enterprise","Champion","Blocker","Follow up","VIP"]

// ── Storage helpers ───────────────────────────────────────────────────────────
const STORE_KEY = "sixxab_crm_contacts"
function loadContacts() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]") } catch { return [] }
}
function saveContacts(list) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)) } catch {}
}

// ── Parse LinkedIn paste ──────────────────────────────────────────────────────
function parseLinkedInPaste(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
  const contacts = []
  let i = 0
  while (i < lines.length) {
    const nameLine = lines[i]
    if (!nameLine || nameLine.length < 2 || nameLine.length > 80) { i++; continue }
    // Try to detect a name-like line (has space, no http, no @, not all uppercase numbers)
    if (!nameLine.includes(" ") || nameLine.startsWith("http") || nameLine.includes("@")) { i++; continue }
    const contact = { ...EMPTY_CONTACT }
    contact.name = nameLine
    contact.source = "LinkedIn"
    // Look ahead for role/company
    if (i+1 < lines.length && !lines[i+1].includes("@") && !lines[i+1].startsWith("http")) {
      contact.role = lines[i+1]; i++
    }
    if (i+1 < lines.length && !lines[i+1].includes("@") && lines[i+1].length < 80) {
      const maybeCo = lines[i+1]
      if (maybeCo && !maybeCo.includes("•") && !maybeCo.startsWith("+")) {
        contact.company = maybeCo; i++
      }
    }
    if (i+1 < lines.length && lines[i+1].includes("@")) { contact.email = lines[i+1]; i++ }
    if (i+1 < lines.length && lines[i+1].startsWith("+")) { contact.phone = lines[i+1]; i++ }
    contact.id = Date.now() + Math.random().toString(36).slice(2)
    contact.createdAt = new Date().toISOString()
    contact.updatedAt = new Date().toISOString()
    contact.lastTouch = "Just added"
    contacts.push(contact)
    i++
  }
  return contacts
}

// ── Parse CSV ─────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.split("\n")
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g,""))
  const contacts = []
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map(v => v.trim().replace(/"/g,""))
    if (!vals[0]) continue
    const c = { ...EMPTY_CONTACT }
    headers.forEach((h, j) => {
      if (h.includes("name") || h==="fullname") c.name = vals[j] || c.name
      if (h.includes("title") || h.includes("role") || h.includes("position")) c.role = vals[j] || c.role
      if (h.includes("company") || h.includes("organization")) c.company = vals[j] || c.company
      if (h.includes("email")) c.email = vals[j] || c.email
      if (h.includes("phone") || h.includes("mobile")) c.phone = vals[j] || c.phone
      if (h.includes("linkedin")) c.linkedin = vals[j] || c.linkedin
      if (h.includes("location") || h.includes("city")) c.location = vals[j] || c.location
      if (h.includes("source")) c.source = vals[j] || c.source
      if (h.includes("stage")) c.stage = vals[j] || c.stage
      if (h.includes("note")) c.notes = vals[j] || c.notes
    })
    if (!c.name) continue
    c.id = Date.now() + Math.random().toString(36).slice(2)
    c.source = c.source || "LinkedIn"
    c.stage = c.stage || "Prospect"
    c.createdAt = new Date().toISOString()
    c.updatedAt = new Date().toISOString()
    c.lastTouch = "Imported"
    contacts.push(c)
  }
  return contacts
}

// ── Score calculation ─────────────────────────────────────────────────────────
function calcScore(c) {
  let s = 30
  if (c.email)   s += 15
  if (c.phone)   s += 10
  if (c.linkedin) s += 10
  if (c.company) s += 5
  if (c.role)    s += 5
  if (c.notes && c.notes.length > 20) s += 10
  const stageBonus = { Prospect:0, Outreach:5, Replied:15, Demo:25, Proposal:35, Negotiation:45, "Closed ✓":60, Lost:0 }
  s += stageBonus[c.stage] || 0
  if (c.value==="Pro") s += 5
  if (c.value==="Agency" || c.value==="Enterprise") s += 10
  return Math.min(99, s)
}

export default function CRMPage() {
  const [contacts,  setContacts]  = useState([])
  const [view,      setView]      = useState("list") // list | kanban | import | contact
  const [search,    setSearch]    = useState("")
  const [filter,    setFilter]    = useState({ stage:"", source:"", agent:"", value:"" })
  const [selected,  setSelected]  = useState(null)   // contact being edited/viewed
  const [isNew,     setIsNew]     = useState(false)
  const [importTab, setImportTab] = useState("paste") // paste | csv | manual
  const [pasteText, setPasteText] = useState("")
  const [csvText,   setCsvText]   = useState("")
  const [preview,   setPreview]   = useState([])
  const [importing, setImporting] = useState(false)
  const [toast,     setToast]     = useState(null)
  const [sortBy,    setSortBy]    = useState("score")
  const [genScript, setGenScript] = useState(null)
  const [genLoading,setGenLoading]= useState(false)
  const fileRef = useRef(null)

  useEffect(() => { setContacts(loadContacts()) }, [])

  function showToast(msg, ok=true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  function save(list) { setContacts(list); saveContacts(list) }

  function upsertContact(c) {
    c.score = calcScore(c)
    c.updatedAt = new Date().toISOString()
    const idx = contacts.findIndex(x => x.id === c.id)
    const next = idx >= 0 ? contacts.map(x => x.id===c.id ? c : x) : [...contacts, c]
    save(next)
    showToast(idx >= 0 ? "Contact updated" : "Contact added")
    setSelected(c)
    setIsNew(false)
    setView("contact")
  }

  function deleteContact(id) {
    if (!confirm("Delete this contact?")) return
    save(contacts.filter(x => x.id !== id))
    setSelected(null)
    setView("list")
    showToast("Contact deleted", false)
  }

  function newContact(defaults={}) {
    const c = { ...EMPTY_CONTACT, ...defaults,
      id: Date.now() + Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      lastTouch: "Just added" }
    setSelected(c)
    setIsNew(true)
    setView("contact")
  }

  function parseImport() {
    let parsed = []
    if (importTab === "paste") parsed = parseLinkedInPaste(pasteText)
    else if (importTab === "csv") parsed = parseCSV(csvText)
    setPreview(parsed)
  }

  function confirmImport() {
    setImporting(true)
    const scored = preview.map(c => ({ ...c, score: calcScore(c) }))
    const merged = [...contacts, ...scored.filter(p => !contacts.find(c => c.email && c.email===p.email))]
    save(merged)
    showToast(`${scored.length} contacts imported`)
    setPreview([]); setPasteText(""); setCsvText("")
    setView("list")
    setImporting(false)
  }

  async function generateScript(contact) {
    setGenLoading(true); setGenScript(null)
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{
          role: "user",
          content: `You are the SIXXAB Marketing Agent. Generate a personalised LinkedIn DM script for this contact.

Name: ${contact.name}
Role: ${contact.role || "Unknown"}
Company: ${contact.company || "Unknown"}
Stage: ${contact.stage}
Notes: ${contact.notes || "None"}
Offer: SIXXAB platform — autonomous business system, $49.50–$175/mo

Write a concise, personalised LinkedIn DM (under 300 chars) that:
1. References something specific about their role or company
2. States the value SIXXAB provides for someone like them
3. Has a clear, low-friction CTA

Return ONLY the message text, no preamble.`
        }]})
      })
      const d = await res.json()
      setGenScript(d.reply || "Unable to generate — check API connection.")
    } catch { setGenScript("Unable to generate script. Check your internet connection.") }
    setGenLoading(false)
  }

  // ── Filtered & sorted contacts ─────────────────────────────────────────────
  const filtered = contacts
    .filter(c => {
      if (search && !`${c.name} ${c.role} ${c.company} ${c.email}`.toLowerCase().includes(search.toLowerCase())) return false
      if (filter.stage && c.stage !== filter.stage) return false
      if (filter.source && c.source !== filter.source) return false
      if (filter.agent && c.assignedAgent !== filter.agent) return false
      if (filter.value && c.value !== filter.value) return false
      return true
    })
    .sort((a,b) => {
      if (sortBy === "score") return b.score - a.score
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "stage") return STAGES.findIndex(s=>s.id===a.stage) - STAGES.findIndex(s=>s.id===b.stage)
      if (sortBy === "updated") return new Date(b.updatedAt) - new Date(a.updatedAt)
      return 0
    })

  const stats = {
    total: contacts.length,
    hot: contacts.filter(c => c.score >= 80).length,
    pipeline: contacts.filter(c => ["Outreach","Replied","Demo","Proposal","Negotiation"].includes(c.stage)).length,
    closed: contacts.filter(c => c.stage === "Closed ✓").length,
    mrr: contacts.filter(c => c.stage==="Closed ✓").reduce((a,c) => a+(c.value==="Pro"?99.50:c.value==="Agency"?175:c.value==="Enterprise"?350:49.50), 0),
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;color:${N};min-height:100vh}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .fu{animation:fadeUp .3s ease both}
        .sl{animation:slideIn .3s ease both}
        input,select,textarea{font-family:inherit;outline:none}
        .inp{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;color:${N};background:#fff;transition:border .15s}
        .inp:focus{border-color:${AMBER}}
        .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;font-family:inherit;transition:all .15s}
        .btn-amber{background:${AMBER};color:${N}}
        .btn-amber:hover{opacity:.9}
        .btn-ghost{background:#fff;border:1px solid #E2E8F0;color:#64748B}
        .btn-ghost:hover{background:#F8F9FA;color:${N}}
        .btn-danger{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B}
        .card{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
        .row-hover:hover{background:#F8F9FA}
        .tag{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:12px;font-size:10.5px;font-weight:500;cursor:pointer}
        select.inp{cursor:pointer}
        textarea.inp{resize:vertical;line-height:1.6}
        .spin{animation:spin .8s linear infinite}
      `}</style>

      {/* Nav */}
      <nav style={{background:N,padding:"0 5%",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.07)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <a href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
            <svg width="22" height="22" viewBox="0 0 72 72"><rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/><text x="7" y="54" fontFamily="Georgia" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text><text x="35" y="54" fontFamily="Georgia" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text></svg>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:CHALK,letterSpacing:2}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
          </a>
          <span style={{color:"rgba(255,255,255,.15)"}}>·</span>
          <span style={{fontFamily:"'DM Mono'",fontSize:10,color:AMBER,letterSpacing:".08em"}}>CRM</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {[["Agents","/agents"],["Orchestrator","/orchestrator"],["Coach","/coach"]].map(([l,h])=>(
            <a key={l} href={h} style={{fontSize:13,color:"rgba(255,255,255,.5)",textDecoration:"none"}}>{l}</a>
          ))}
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",bottom:24,right:24,zIndex:999,padding:"10px 18px",borderRadius:10,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.1)",animation:"fadeUp .3s ease"}}>
          {toast.ok?"✓":"✗"} {toast.msg}
        </div>
      )}

      <div style={{maxWidth:1300,margin:"0 auto",padding:"20px 20px 60px"}}>

        {/* Header + stats */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
          <div>
            <h1 style={{fontFamily:"'Bebas Neue'",fontSize:28,color:N,letterSpacing:1.5}}>CRM — Contact Relationships</h1>
            <p style={{fontSize:13,color:"#64748B"}}>Manage all contacts across every agent. Import from LinkedIn. Track your pipeline.</p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn btn-ghost" onClick={()=>setView("import")}><i className="ti ti-brand-linkedin" style={{color:"#0A66C2"}} aria-hidden="true"/>Import from LinkedIn</button>
            <button className="btn btn-amber" onClick={()=>newContact()}><i className="ti ti-plus" aria-hidden="true"/>Add contact</button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
          {[
            {l:"Total contacts",v:stats.total,c:N},
            {l:"Hot leads (80+)",v:stats.hot,c:"#DC2626"},
            {l:"In pipeline",v:stats.pipeline,c:AMBER},
            {l:"Closed customers",v:stats.closed,c:"#1D9E75"},
            {l:"CRM MRR",v:"$"+stats.mrr.toFixed(0),c:"#1D9E75"},
          ].map((s,i)=>(
            <div key={i} className="card" style={{padding:"14px 16px"}}>
              <div style={{fontSize:22,fontWeight:700,color:s.c,fontFamily:"'Bebas Neue'",letterSpacing:.5}}>{s.v}</div>
              <div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* View tabs */}
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {[["list","ti-list","List"],["kanban","ti-layout-columns","Pipeline"],["import","ti-brand-linkedin","LinkedIn Import"]].map(([v,ic,l])=>(
            <button key={v} onClick={()=>{setView(v);setSelected(null)}}
              style={{padding:"7px 16px",borderRadius:8,border:`1.5px solid ${view===v?AMBER:"#E2E8F0"}`,background:view===v?"#FFFBF2":"#fff",fontSize:12.5,fontWeight:500,color:view===v?N:"#64748B",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,transition:"all .15s"}}>
              <i className={`ti ${ic}`} aria-hidden="true"/>{l}
            </button>
          ))}
          <div style={{flex:1}}/>
          {/* Sort */}
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            style={{padding:"7px 12px",borderRadius:8,border:"1px solid #E2E8F0",fontSize:12.5,color:"#64748B",background:"#fff",cursor:"pointer",fontFamily:"inherit"}}>
            <option value="score">Sort: Score</option>
            <option value="updated">Sort: Recently updated</option>
            <option value="stage">Sort: Stage</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        {/* Search + filters */}
        {(view==="list"||view==="kanban") && (
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <div style={{position:"relative",flex:1,minWidth:200}}>
              <i className="ti ti-search" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#94A3B8",fontSize:14}} aria-hidden="true"/>
              <input className="inp" style={{paddingLeft:32}} placeholder="Search name, role, company, email…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            {[["stage","Stage",STAGES.map(s=>s.id)],["source","Source",SOURCES],["agent","Agent",AGENTS],["value","Plan",VALUES]].map(([k,l,opts])=>(
              <select key={k} className="inp" style={{width:"auto",minWidth:110,cursor:"pointer"}} value={filter[k]} onChange={e=>setFilter({...filter,[k]:e.target.value})}>
                <option value="">All {l}s</option>
                {opts.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            <button className="btn btn-ghost" onClick={()=>setFilter({stage:"",source:"",agent:"",value:""})} style={{padding:"7px 12px",fontSize:12}}>Clear</button>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <div className="card fu">
            <div style={{padding:"10px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",gap:0,fontSize:11,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".07em"}}>
              <div style={{width:32}}/>
              <div style={{flex:2}}>Name</div>
              <div style={{flex:1.5}}>Role / Company</div>
              <div style={{width:90}}>Stage</div>
              <div style={{width:70}}>Score</div>
              <div style={{width:80}}>Source</div>
              <div style={{width:80}}>Agent</div>
              <div style={{width:70}}>Plan</div>
              <div style={{width:80}}>Last touch</div>
              <div style={{width:60}}/>
            </div>
            {filtered.length === 0 && (
              <div style={{padding:40,textAlign:"center",color:"#94A3B8"}}>
                <div style={{fontSize:24,marginBottom:8}}>📭</div>
                <div style={{fontSize:13,fontWeight:500,marginBottom:6}}>{contacts.length===0?"No contacts yet":"No contacts match your filters"}</div>
                <div style={{fontSize:12,marginBottom:16}}>{contacts.length===0?"Import from LinkedIn or add manually to get started":""}</div>
                {contacts.length===0 && <button className="btn btn-amber" onClick={()=>setView("import")}>Import from LinkedIn →</button>}
              </div>
            )}
            {filtered.map(c => {
              const stage = STAGES.find(s=>s.id===c.stage)||STAGES[0]
              return (
                <div key={c.id} className="row-hover" style={{display:"flex",alignItems:"center",gap:0,padding:"10px 16px",borderBottom:"1px solid #F1F5F9",cursor:"pointer"}}
                  onClick={()=>{setSelected(c);setIsNew(false);setView("contact")}}>
                  <div style={{width:32}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:AMBER+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:AMBER}}>
                      {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                    </div>
                  </div>
                  <div style={{flex:2,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                    <div style={{fontSize:11,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.email}</div>
                  </div>
                  <div style={{flex:1.5,minWidth:0}}>
                    <div style={{fontSize:12,color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.role}</div>
                    <div style={{fontSize:11,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.company}</div>
                  </div>
                  <div style={{width:90}}>
                    <span style={{padding:"2px 8px",borderRadius:12,background:stage.color,color:stage.txt,fontSize:10.5,fontWeight:500}}>{c.stage}</span>
                  </div>
                  <div style={{width:70}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:28,height:4,borderRadius:2,background:"#E2E8F0",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${c.score}%`,background:c.score>=80?"#1D9E75":c.score>=60?AMBER:"#94A3B8",borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:11,color:c.score>=80?"#1D9E75":c.score>=60?AMBER:"#94A3B8",fontWeight:600}}>{c.score}</span>
                    </div>
                  </div>
                  <div style={{width:80,fontSize:11,color:"#64748B"}}>{c.source}</div>
                  <div style={{width:80,fontSize:11,color:"#64748B",textTransform:"capitalize"}}>{c.assignedAgent}</div>
                  <div style={{width:70}}>
                    <span style={{padding:"2px 7px",borderRadius:8,background:"#F1F5F9",fontSize:10.5,color:"#475569"}}>{c.value}</span>
                  </div>
                  <div style={{width:80,fontSize:11,color:"#94A3B8"}}>{c.lastTouch}</div>
                  <div style={{width:60,display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>generateScript(c)} style={{width:26,height:26,borderRadius:6,border:"none",background:"#F1F5F9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <i className="ti ti-sparkles" style={{fontSize:12,color:AMBER}} aria-hidden="true"/>
                    </button>
                    {c.linkedin && <a href={c.linkedin.startsWith("http")?c.linkedin:"https://linkedin.com/in/"+c.linkedin} target="_blank" rel="noopener noreferrer"
                      style={{width:26,height:26,borderRadius:6,border:"none",background:"#F1F5F9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}>
                      <i className="ti ti-brand-linkedin" style={{fontSize:12,color:"#0A66C2"}} aria-hidden="true"/>
                    </a>}
                  </div>
                </div>
              )
            })}
            <div style={{padding:"10px 16px",borderTop:"1px solid #F1F5F9",fontSize:11,color:"#94A3B8"}}>
              Showing {filtered.length} of {contacts.length} contacts
            </div>
          </div>
        )}

        {/* ── KANBAN / PIPELINE VIEW ── */}
        {view === "kanban" && (
          <div style={{overflowX:"auto",paddingBottom:8}}>
            <div style={{display:"flex",gap:12,minWidth:STAGES.length*210+"px"}}>
              {STAGES.map(stage => {
                const stageContacts = filtered.filter(c=>c.stage===stage.id)
                const stageMRR = stageContacts.reduce((a,c)=>a+(c.value==="Pro"?99.50:c.value==="Agency"?175:c.value==="Enterprise"?350:49.50),0)
                return (
                  <div key={stage.id} style={{width:200,flexShrink:0}}>
                    <div style={{padding:"8px 10px",borderRadius:"10px 10px 0 0",background:stage.color,borderBottom:`2px solid ${stage.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:11.5,fontWeight:600,color:stage.txt}}>{stage.id}</span>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:10,color:stage.txt,opacity:.7}}>${stageMRR.toFixed(0)}</span>
                        <span style={{width:18,height:18,borderRadius:"50%",background:stage.txt,color:stage.color,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",opacity:.7}}>{stageContacts.length}</span>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,minHeight:80}}>
                      {stageContacts.map(c => (
                        <div key={c.id} onClick={()=>{setSelected(c);setIsNew(false);setView("contact")}}
                          style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:"10px 12px",cursor:"pointer",transition:"all .15s",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                            <div style={{width:26,height:26,borderRadius:"50%",background:AMBER+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,color:AMBER,flexShrink:0}}>
                              {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                            </div>
                            <div style={{minWidth:0}}>
                              <div style={{fontSize:12,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                              <div style={{fontSize:10,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.role||c.company}</div>
                            </div>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontSize:10,color:"#64748B"}}>{c.source}</span>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <div style={{width:22,height:3,borderRadius:2,background:"#E2E8F0",overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${c.score}%`,background:c.score>=80?"#1D9E75":c.score>=60?AMBER:"#94A3B8"}}/>
                              </div>
                              <span style={{fontSize:9.5,color:c.score>=80?"#1D9E75":c.score>=60?AMBER:"#94A3B8",fontWeight:600}}>{c.score}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button onClick={()=>newContact({stage:stage.id})}
                        style={{width:"100%",padding:"8px",borderRadius:9,border:"1.5px dashed #E2E8F0",background:"transparent",fontSize:11.5,color:"#94A3B8",cursor:"pointer",fontFamily:"inherit"}}>
                        + Add
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── LINKEDIN IMPORT ── */}
        {view === "import" && (
          <div style={{display:"grid",gridTemplateColumns:preview.length?"1fr 1fr":"1fr",gap:16}} className="fu">
            <div className="card">
              <div style={{padding:"14px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
                <div style={{fontSize:14,fontWeight:600,color:N,marginBottom:3}}>Import contacts from LinkedIn</div>
                <div style={{fontSize:12,color:"#64748B"}}>Paste profiles, upload a CSV, or add manually</div>
              </div>
              <div style={{padding:18}}>
                {/* Import method tabs */}
                <div style={{display:"flex",gap:6,marginBottom:16}}>
                  {[["paste","ti-clipboard-text","Paste profiles"],["csv","ti-file-spreadsheet","Upload CSV"],["manual","ti-user-plus","Add manually"]].map(([t,ic,l])=>(
                    <button key={t} onClick={()=>{setImportTab(t);setPreview([])}}
                      style={{padding:"7px 14px",borderRadius:8,border:`1.5px solid ${importTab===t?AMBER:"#E2E8F0"}`,background:importTab===t?"#FFFBF2":"#fff",fontSize:12,fontWeight:500,color:importTab===t?N:"#64748B",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                      <i className={`ti ${ic}`} aria-hidden="true"/>{l}
                    </button>
                  ))}
                </div>

                {/* Paste method */}
                {importTab === "paste" && (
                  <>
                    <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:9,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#1E40AF",lineHeight:1.6}}>
                      <strong>How to paste from LinkedIn:</strong><br/>
                      1. Open a LinkedIn profile → select all text on the page (Ctrl+A) → copy (Ctrl+C)<br/>
                      2. Or copy from Sales Navigator search results — select names, titles, companies<br/>
                      3. Paste below. SIXXAB extracts name, role, company, email and phone automatically.
                    </div>
                    <textarea className="inp" rows={10} placeholder={"Paste LinkedIn profile text here...\n\nExample:\nSarah Chen\nFreelance UX Designer\nChrome Design Studio\nsarah@example.com\n+1-214-555-0101\n\nJames Park\nE-commerce Founder\nParkBrands\njames@parkbrands.com"}
                      value={pasteText} onChange={e=>setPasteText(e.target.value)} style={{marginBottom:10}}/>
                    <button className="btn btn-amber" onClick={parseImport} disabled={!pasteText.trim()} style={{width:"100%",justifyContent:"center"}}>
                      <i className="ti ti-eye" aria-hidden="true"/>Preview contacts →
                    </button>
                  </>
                )}

                {/* CSV method */}
                {importTab === "csv" && (
                  <>
                    <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:9,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#065F46",lineHeight:1.6}}>
                      <strong>CSV format:</strong> Headers should include: <code style={{fontFamily:"monospace",background:"#E1F5EE",padding:"1px 5px",borderRadius:4}}>name, role, company, email, phone, linkedin, location, source, stage, notes</code><br/>
                      Compatible with LinkedIn Sales Navigator CSV exports, HubSpot exports, and any standard contact CSV.
                    </div>
                    <input type="file" ref={fileRef} accept=".csv,.txt" style={{display:"none"}} onChange={e=>{
                      const f = e.target.files[0]; if (!f) return
                      const r = new FileReader(); r.onload = ev => setCsvText(ev.target.result); r.readAsText(f)
                    }}/>
                    <button className="btn btn-ghost" onClick={()=>fileRef.current?.click()} style={{width:"100%",justifyContent:"center",marginBottom:10}}>
                      <i className="ti ti-upload" aria-hidden="true"/>Choose CSV file
                    </button>
                    <textarea className="inp" rows={8} placeholder={"Or paste CSV content directly:\n\nname,role,company,email,phone,source\nSarah Chen,UX Designer,Chrome Design,sarah@example.com,+1-214-555-0101,LinkedIn"}
                      value={csvText} onChange={e=>setCsvText(e.target.value)} style={{marginBottom:10}}/>
                    <button className="btn btn-amber" onClick={parseImport} disabled={!csvText.trim()} style={{width:"100%",justifyContent:"center"}}>
                      <i className="ti ti-eye" aria-hidden="true"/>Preview contacts →
                    </button>
                  </>
                )}

                {/* Manual method */}
                {importTab === "manual" && (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      {[["Full name *","name","text","Sarah Chen"],["LinkedIn URL","linkedin","url","linkedin.com/in/sarahchen"],
                        ["Job title","role","text","Freelance Designer"],["Company","company","text","Chrome Design Studio"],
                        ["Email address","email","email","sarah@example.com"],["Phone number","phone","tel","+1-214-555-0101"],
                        ["Location","location","text","Dallas, TX"]].map(([l,k,t,ph])=>(
                        <div key={k}>
                          <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:4}}>{l}</label>
                          <input className="inp" type={t} placeholder={ph} id={`manual-${k}`}/>
                        </div>
                      ))}
                      <div>
                        <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:4}}>Source</label>
                        <select className="inp" id="manual-source"><option value="LinkedIn">LinkedIn</option>{SOURCES.map(s=><option key={s}>{s}</option>)}</select>
                      </div>
                    </div>
                    <div>
                      <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:4}}>Notes</label>
                      <textarea className="inp" rows={3} id="manual-notes" placeholder="What did you discuss? What's their main pain point?"/>
                    </div>
                    <button className="btn btn-amber" style={{justifyContent:"center"}} onClick={()=>{
                      const g = id => document.getElementById("manual-"+id)?.value || ""
                      const name = g("name")
                      if (!name.trim()) { showToast("Please enter a name", false); return }
                      newContact({ name, linkedin:g("linkedin"), role:g("role"), company:g("company"),
                        email:g("email"), phone:g("phone"), location:g("location"),
                        source:g("source")||"LinkedIn", notes:g("notes") })
                    }}>
                      <i className="ti ti-plus" aria-hidden="true"/>Add contact
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Preview panel */}
            {preview.length > 0 && (
              <div className="card sl">
                <div style={{padding:"14px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:N}}>{preview.length} contacts ready to import</div>
                    <div style={{fontSize:12,color:"#64748B"}}>Review and confirm. Duplicates (same email) will be skipped.</div>
                  </div>
                  <button className="btn btn-amber" onClick={confirmImport} disabled={importing}>
                    {importing?<div style={{width:14,height:14,border:"2px solid rgba(10,14,26,.3)",borderTopColor:N,borderRadius:"50%"}} className="spin"/>:<i className="ti ti-check" aria-hidden="true"/>}
                    Import {preview.length} contacts
                  </button>
                </div>
                <div style={{maxHeight:500,overflowY:"auto"}}>
                  {preview.map((c,i)=>(
                    <div key={i} style={{padding:"11px 18px",borderBottom:"1px solid #F1F5F9",display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:AMBER+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:AMBER,flexShrink:0}}>
                        {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500,color:N}}>{c.name}</div>
                        {c.role && <div style={{fontSize:11,color:"#64748B"}}>{c.role}{c.company?" · "+c.company:""}</div>}
                        {c.email && <div style={{fontSize:11,color:"#94A3B8"}}>{c.email}</div>}
                      </div>
                      <button onClick={()=>setPreview(preview.filter((_,j)=>j!==i))}
                        style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",padding:4}}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CONTACT DETAIL VIEW ── */}
        {view === "contact" && selected && (
          <ContactForm
            contact={selected} isNew={isNew}
            onSave={upsertContact} onDelete={()=>deleteContact(selected.id)}
            onBack={()=>{setView("list");setSelected(null)}}
            onGenScript={generateScript} genScript={genScript} genLoading={genLoading}
            onClearScript={()=>setGenScript(null)}
          />
        )}
      </div>

      {/* Floating script panel */}
      {genScript && view!=="contact" && (
        <div style={{position:"fixed",bottom:24,right:24,width:360,background:N,borderRadius:14,border:`1px solid ${AMBER}44`,boxShadow:"0 16px 40px rgba(0,0,0,.25)",zIndex:998,animation:"fadeUp .3s ease"}}>
          <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,fontWeight:600,color:AMBER,fontFamily:"'DM Mono'",letterSpacing:".07em"}}>AI SCRIPT READY</span>
            <button onClick={()=>setGenScript(null)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.4)",fontSize:16}}>✕</button>
          </div>
          <div style={{padding:"12px 14px"}}>
            {genLoading ? <div style={{color:"rgba(245,245,240,.5)",fontSize:13,textAlign:"center",padding:"10px 0"}}>Generating script…</div>
              : <p style={{fontSize:13,color:"rgba(245,245,240,.85)",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{genScript}</p>}
          </div>
          {!genLoading && <div style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.08)",display:"flex",gap:8}}>
            <button onClick={()=>{navigator.clipboard.writeText(genScript);showToast("Copied!")}} className="btn btn-amber" style={{flex:1,justifyContent:"center",fontSize:12}}>
              <i className="ti ti-copy" aria-hidden="true"/>Copy script
            </button>
          </div>}
        </div>
      )}
    </>
  )
}

// ── Contact form / detail panel ───────────────────────────────────────────────
function ContactForm({ contact, isNew, onSave, onDelete, onBack, onGenScript, genScript, genLoading, onClearScript }) {
  const [form, setForm] = useState({ ...contact })
  const [activeTab, setActiveTab] = useState("details")
  const N = "#0A0E1A", AMBER = "#EF9F27"

  const set = (k,v) => setForm(f => ({ ...f, [k]: v }))
  const stage = STAGES.find(s=>s.id===form.stage)||STAGES[0]

  function toggleTag(t) {
    set("tags", form.tags.includes(t) ? form.tags.filter(x=>x!==t) : [...form.tags, t])
  }

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16,alignItems:"start"}} className="fu">
      {/* Main form */}
      <div className="card">
        <div style={{padding:"14px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",fontSize:18,lineHeight:1}}>←</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:N}}>{isNew?"New contact":form.name}</div>
            <div style={{fontSize:12,color:"#64748B"}}>{isNew?"Fill in contact details":form.role+(form.company?" · "+form.company:"")}</div>
          </div>
          {!isNew && (
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{padding:"3px 10px",borderRadius:20,background:stage.color,color:stage.txt,fontSize:11.5,fontWeight:500}}>{form.stage}</span>
              <span style={{padding:"3px 10px",borderRadius:20,background:"#F1F5F9",color:"#475569",fontSize:11.5,fontWeight:600}}>{form.score}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:0,borderBottom:"1px solid #E8ECF4",padding:"0 18px"}}>
          {[["details","Details"],["notes","Notes"],["activity","Activity"],["scripts","AI Scripts"]].map(([t,l])=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              style={{padding:"10px 14px",border:"none",background:"none",fontSize:12.5,fontWeight:500,cursor:"pointer",fontFamily:"inherit",color:activeTab===t?N:"#94A3B8",borderBottom:activeTab===t?`2px solid ${AMBER}`:"2px solid transparent",transition:"all .15s"}}>
              {l}
            </button>
          ))}
        </div>

        <div style={{padding:18}}>

          {/* Details tab */}
          {activeTab === "details" && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[["Full name *","name","text","Sarah Chen"],["LinkedIn URL","linkedin","url","linkedin.com/in/..."],
                  ["Job title","role","text","Freelance Designer"],["Company","company","text","Chrome Design Studio"],
                  ["Email address","email","email","sarah@example.com"],["Phone","phone","tel","+1-214-555-0101"],
                  ["Location","location","text","Dallas, TX"]].map(([l,k,t,ph])=>(
                  <div key={k}>
                    <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:4}}>{l}</label>
                    <input className="inp" type={t} placeholder={ph} value={form[k]||""} onChange={e=>set(k,e.target.value)}/>
                  </div>
                ))}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
                <div>
                  <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:4}}>Pipeline stage</label>
                  <select className="inp" value={form.stage} onChange={e=>set("stage",e.target.value)}>
                    {STAGES.map(s=><option key={s.id}>{s.id}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:4}}>Source</label>
                  <select className="inp" value={form.source} onChange={e=>set("source",e.target.value)}>
                    {SOURCES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:4}}>Assigned agent</label>
                  <select className="inp" value={form.assignedAgent} onChange={e=>set("assignedAgent",e.target.value)}>
                    {AGENTS.map(a=><option key={a} value={a}>{a.charAt(0).toUpperCase()+a.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:4}}>SIXXAB plan</label>
                  <select className="inp" value={form.value} onChange={e=>set("value",e.target.value)}>
                    {VALUES.map(v=><option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:6}}>Tags</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {TAGS.map(t => (
                    <span key={t} className="tag" onClick={()=>toggleTag(t)}
                      style={{background:form.tags.includes(t)?AMBER+"22":"#F1F5F9",color:form.tags.includes(t)?N:"#64748B",border:`1px solid ${form.tags.includes(t)?AMBER+"66":"#E2E8F0"}`}}>
                      {form.tags.includes(t)?"✓ ":""}{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes tab */}
          {activeTab === "notes" && (
            <div>
              <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:6}}>Notes & context</label>
              <textarea className="inp" rows={12} placeholder="What did you discuss? What's their pain point? What objections did they raise? What's the follow-up action?"
                value={form.notes||""} onChange={e=>set("notes",e.target.value)}/>
              <div style={{fontSize:11,color:"#94A3B8",marginTop:5}}>These notes are used by all AI agents to personalise scripts and recommendations for this contact.</div>
            </div>
          )}

          {/* Activity tab */}
          {activeTab === "activity" && (
            <div>
              <div style={{fontSize:12,color:"#64748B",marginBottom:12}}>Contact history and touchpoints</div>
              {[
                { icon:"ti-user-plus", label:"Contact created", when:contact.createdAt?new Date(contact.createdAt).toLocaleDateString():"Today", color:"#1D9E75" },
                { icon:"ti-message", label:"Last outreach", when:contact.lastTouch||"—", color:AMBER },
              ].map((a,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid #F1F5F9",alignItems:"center"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:a.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <i className={`ti ${a.icon}`} style={{fontSize:13,color:a.color}} aria-hidden="true"/>
                  </div>
                  <div style={{flex:1,fontSize:13,color:N}}>{a.label}</div>
                  <div style={{fontSize:11,color:"#94A3B8"}}>{a.when}</div>
                </div>
              ))}
              <div style={{marginTop:14}}>
                <label style={{fontSize:11,fontWeight:500,color:"#475569",display:"block",marginBottom:5}}>Log a touchpoint</label>
                <div style={{display:"flex",gap:8}}>
                  <input className="inp" placeholder="e.g. Sent LinkedIn DM, left voicemail, demo call…" id="activity-note" style={{flex:1}}/>
                  <button className="btn btn-amber" style={{whiteSpace:"nowrap"}} onClick={()=>{
                    const v = document.getElementById("activity-note")?.value
                    if (!v) return
                    set("lastTouch", "Just now")
                    set("notes", (form.notes||"")+"\n["+new Date().toLocaleDateString()+"] "+v)
                    document.getElementById("activity-note").value=""
                  }}>Log it</button>
                </div>
              </div>
            </div>
          )}

          {/* AI Scripts tab */}
          {activeTab === "scripts" && (
            <div>
              <div style={{fontSize:12,color:"#64748B",marginBottom:12}}>Generate personalised outreach scripts for this contact using the AI agents.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                {["LinkedIn DM","Email subject","WhatsApp","X/Twitter DM","Cold call opener","Follow-up message"].map((s,i)=>(
                  <button key={i} onClick={()=>onGenScript({...form, _scriptType:s})}
                    style={{padding:"9px 12px",borderRadius:9,border:"1px solid #E2E8F0",background:"#F8F9FA",fontSize:12,color:N,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all .15s"}}
                    onMouseOver={e=>e.currentTarget.style.borderColor=AMBER}
                    onMouseOut={e=>e.currentTarget.style.borderColor="#E2E8F0"}>
                    <span style={{fontSize:9,fontWeight:600,color:"#94A3B8",display:"block",marginBottom:2,textTransform:"uppercase",letterSpacing:".07em"}}>{i<2?"Marketing":i<4?"Social":"Sales"}</span>
                    {s}
                  </button>
                ))}
              </div>
              {genLoading && <div style={{padding:"20px",textAlign:"center",color:"#94A3B8",fontSize:13}}>
                <div style={{width:20,height:20,border:"2px solid #E2E8F0",borderTopColor:AMBER,borderRadius:"50%",margin:"0 auto 8px",animation:"spin .8s linear infinite"}}/>
                Generating personalised script…
              </div>}
              {genScript && !genLoading && (
                <div style={{background:N,borderRadius:12,padding:16,border:`1px solid ${AMBER}33`}}>
                  <div style={{fontSize:10,fontWeight:600,color:AMBER,letterSpacing:".08em",marginBottom:8,fontFamily:"'DM Mono'"}}>AI SCRIPT</div>
                  <p style={{fontSize:13,color:"rgba(245,245,240,.88)",lineHeight:1.75,whiteSpace:"pre-wrap",marginBottom:12}}>{genScript}</p>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{navigator.clipboard.writeText(genScript)}} className="btn btn-amber" style={{fontSize:12}}>
                      <i className="ti ti-copy" aria-hidden="true"/>Copy
                    </button>
                    <button onClick={onClearScript} className="btn btn-ghost" style={{fontSize:12}}>Clear</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save/delete row */}
          <div style={{display:"flex",gap:10,marginTop:18,paddingTop:16,borderTop:"1px solid #F1F5F9"}}>
            <button onClick={()=>onSave(form)} className="btn btn-amber" style={{flex:1,justifyContent:"center"}}>
              <i className="ti ti-check" aria-hidden="true"/>{isNew?"Add contact":"Save changes"}
            </button>
            {!isNew && <button onClick={onDelete} className="btn btn-danger" style={{fontSize:12}}>
              <i className="ti ti-trash" aria-hidden="true"/>Delete
            </button>}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {/* Score card */}
        <div className="card" style={{padding:16}}>
          <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Contact score</div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{fontSize:36,fontWeight:700,color:form.score>=80?"#1D9E75":form.score>=60?AMBER:"#94A3B8",fontFamily:"'Bebas Neue'",letterSpacing:1}}>
              {calcScore(form)}
            </div>
            <div style={{flex:1}}>
              <div style={{height:6,background:"#E2E8F0",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${calcScore(form)}%`,background:calcScore(form)>=80?"#1D9E75":calcScore(form)>=60?AMBER:"#94A3B8",borderRadius:3,transition:"width .4s"}}/>
              </div>
              <div style={{fontSize:10,color:"#94A3B8",marginTop:4}}>{calcScore(form)>=80?"Hot lead":calcScore(form)>=60?"Warm lead":"Cold lead"}</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[["Email",!!form.email],["Phone",!!form.phone],["LinkedIn",!!form.linkedin],["Company",!!form.company],["Notes",form.notes?.length>20]].map(([l,ok])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748B"}}>
                <span>{l}</span>
                <span style={{color:ok?"#1D9E75":"#E2E8F0",fontWeight:600}}>{ok?"✓":"—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="card" style={{padding:14}}>
          <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Quick actions</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {form.linkedin && <a href={form.linkedin.startsWith("http")?form.linkedin:"https://linkedin.com/in/"+form.linkedin} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:"#EFF6FF",border:"1px solid #BFDBFE",fontSize:12.5,fontWeight:500,color:"#1D4ED8",textDecoration:"none"}}>
              <i className="ti ti-brand-linkedin" aria-hidden="true"/>Open LinkedIn profile
            </a>}
            {form.email && <a href={`mailto:${form.email}`}
              style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:12.5,fontWeight:500,color:N,textDecoration:"none"}}>
              <i className="ti ti-mail" aria-hidden="true"/>Send email
            </a>}
            {form.phone && <a href={`tel:${form.phone}`}
              style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:12.5,fontWeight:500,color:N,textDecoration:"none"}}>
              <i className="ti ti-phone" aria-hidden="true"/>Call now
            </a>}
            <a href="/discovery"
              style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:"#FFFBF2",border:"1px solid rgba(239,159,39,.3)",fontSize:12.5,fontWeight:500,color:N,textDecoration:"none"}}>
              <i className="ti ti-calendar" style={{color:AMBER}} aria-hidden="true"/>Book discovery call
            </a>
          </div>
        </div>

        {/* Send to agent */}
        <div className="card" style={{padding:14}}>
          <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Send to agent</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {[["Marketing","Generate DM","ti-speakerphone",AMBER],["Sales","Add to pipeline","ti-trending-up","#1D9E75"],
              ["Support","Create ticket","ti-headset","#378ADD"],["Strategy","Analyse fit","ti-brain","#7C3AED"]].map(([ag,ac,ic,c])=>(
              <button key={ag} onClick={()=>{set("assignedAgent",ag.toLowerCase());}}
                style={{padding:"8px",borderRadius:8,border:`1px solid ${c}33`,background:`${c}08`,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                  <i className={`ti ${ic}`} style={{fontSize:12,color:c}} aria-hidden="true"/>
                  <span style={{fontSize:11,fontWeight:600,color:N}}>{ag}</span>
                </div>
                <div style={{fontSize:9.5,color:"#94A3B8"}}>{ac}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
