// pages/retention.js — SIXXAB AI · Lead-to-Retention Pipeline
// End-to-end: Prospect → CRM → Onboarding → Customer Success → Renewal
// Powered by CSO, COO, Customer Success and Onboarding agents
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect, useCallback } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0", GREEN = "#1D9E75"

const CRM_KEY = "sixxab_crm_contacts"
const HIST_KEY = "sixxab_retention_history"

function loadCRM()   { try { return JSON.parse(localStorage.getItem(CRM_KEY)||"[]")  } catch { return [] } }
function saveCRM(l)  { try { localStorage.setItem(CRM_KEY, JSON.stringify(l)); window.dispatchEvent(new CustomEvent("sixxab_crm_updated",{detail:{contacts:l}})) } catch {} }
function loadHist()  { try { return JSON.parse(localStorage.getItem(HIST_KEY)||"[]") } catch { return [] } }
function saveHist(h) { try { localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(0,100))) } catch {} }
function mkId()      { return `${Date.now()}-${Math.random().toString(36).slice(2,7)}` }

// Pipeline stages with actions
const PIPELINE = [
  { id:"Prospect",    label:"Prospect",    icon:"ti-user",            color:"#64748B", bg:"#F8F9FA", next:"Outreach",   action:"Send LinkedIn DM",       agent:"cso",             agentLabel:"CSO · Lead Gen" },
  { id:"Outreach",    label:"Outreach",    icon:"ti-send",            color:"#EF9F27", bg:"#FFFBF2", next:"Replied",    action:"Follow up",              agent:"cso",             agentLabel:"CSO · Outreach" },
  { id:"Replied",     label:"Replied",     icon:"ti-message",         color:"#378ADD", bg:"#EFF6FF", next:"Demo",       action:"Book demo",              agent:"cso",             agentLabel:"CSO · Demo prep" },
  { id:"Demo",        label:"Demo",        icon:"ti-presentation",    color:"#7C3AED", bg:"#F5F3FF", next:"Proposal",   action:"Send proposal",          agent:"cso",             agentLabel:"CSO · Proposal" },
  { id:"Proposal",    label:"Proposal",    icon:"ti-file-text",       color:"#EC4899", bg:"#FDF0F5", next:"Negotiation",action:"Handle objections",      agent:"cso",             agentLabel:"CSO · Close" },
  { id:"Negotiation", label:"Negotiation", icon:"ti-handshake",       color:"#F59E0B", bg:"#FFFBEB", next:"Closed ✓",  action:"Close deal",             agent:"cio",             agentLabel:"CIO · Enterprise" },
  { id:"Closed ✓",   label:"Customer",    icon:"ti-circle-check",    color:"#1D9E75", bg:"#F0FDF4", next:"Onboarding", action:"Start onboarding",       agent:"onboarding_agent",agentLabel:"COO · Onboarding" },
  { id:"Onboarding",  label:"Onboarding",  icon:"ti-rocket",          color:"#0EA5E9", bg:"#EFF6FF", next:"Active",     action:"Day 7 check-in",         agent:"onboarding_agent",agentLabel:"COO · Onboarding" },
  { id:"Active",      label:"Active",      icon:"ti-trending-up",     color:"#1D9E75", bg:"#F0FDF4", next:"Renewal",    action:"NPS survey",             agent:"customer_success",agentLabel:"COO · Success" },
  { id:"At Risk",     label:"At Risk",     icon:"ti-alert-triangle",  color:"#DC2626", bg:"#FEF2F2", next:"Active",     action:"Win-back sequence",      agent:"customer_success",agentLabel:"COO · Success" },
  { id:"Renewal",     label:"Renewal",     icon:"ti-refresh",         color:"#7C3AED", bg:"#F5F3FF", next:"Active",     action:"Renewal conversation",   agent:"customer_success",agentLabel:"COO · Success" },
  { id:"Churned",     label:"Churned",     icon:"ti-user-off",        color:"#94A3B8", bg:"#F8F9FA", next:"At Risk",    action:"Win-back campaign",      agent:"customer_success",agentLabel:"COO · Success" },
]

// Agent system prompts for each stage
const AGENT_PROMPTS = {
  cso: {
    "Prospect":    (c) => `You are the SIXXAB CSO. Write a personalised LinkedIn connection request for ${c.name} (${c.role||"Business owner"} at ${c.company||"their company"}). Their pain point: ${c.notes||"operational inefficiency"}. Max 300 chars. No pitch. Start a conversation only.`,
    "Outreach":    (c) => `You are the SIXXAB CSO. Write a follow-up message for ${c.name} at ${c.company||"their company"} who hasn't responded. Last contact: ${c.lastTouch||"LinkedIn DM"}. Days since: ${c.daysSince||"7"}. Add new value. No "just following up". Max 4 sentences.`,
    "Replied":     (c) => `You are the SIXXAB CSO. ${c.name} at ${c.company||"their company"} replied to our outreach. Write a message to book a 20-minute demo. Make it easy to say yes. One clear CTA with a calendly link placeholder.`,
    "Demo":        (c) => `You are the SIXXAB CSO. Prepare a demo agenda for ${c.name} (${c.role||"founder"}) at ${c.company||"their company"}. Pain: ${c.notes||"business operations"}. Make the demo specific to their situation. 5 sections, 4 minutes each.`,
    "Proposal":    (c) => `You are the SIXXAB CSO. Write an objection handling response for ${c.name} at ${c.company||"their company"} who said "${c.lastTouch||"I need to think about it"}". Use: acknowledge, reframe, proof, offer. Max 4 sentences. Close with a question.`,
    "Negotiation": (c) => `You are the SIXXAB CSO. Write a closing message for ${c.name} at ${c.company||"their company"} in negotiation. Their plan: ${c.value||"Pro"}. Address any final hesitation. One clear next step. Keep it human, not salesy.`,
  },
  onboarding_agent: {
    "Closed ✓":  (c) => `You are the SIXXAB Onboarding Agent. Write a Day 0 welcome email for ${c.name} who just signed up for the ${c.value||"Pro"} plan. Include: warm welcome, what to do in the next 48 hours (run Niche Selector → set Orchestrator goal → import 20 LinkedIn contacts), what they can expect. Friendly, specific, actionable.`,
    "Onboarding": (c) => `You are the SIXXAB Onboarding Agent. Write a Day 7 check-in message for ${c.name} on the ${c.value||"Pro"} plan. Ask: did you run the Orchestrator? Any questions? Share one specific tip for their industry. Short — 3 sentences.`,
  },
  customer_success: {
    "Active":   (c) => `You are the SIXXAB Customer Success Agent. Write an NPS survey email for ${c.name} at ${c.company||"their company"} who has been a customer for ${c.tenure||"30"} days. Ask: on a scale of 1–10, how likely are you to recommend SIXXAB AI? What would make it a 10? Keep it short and human.`,
    "At Risk":  (c) => `You are the SIXXAB Customer Success Agent. ${c.name} at ${c.company||"their company"} is showing churn signals: ${c.notes||"low usage in the last 14 days"}. Write a win-back message. Acknowledge the silence, offer a 15-minute call, share one specific result from another customer. Max 4 sentences.`,
    "Renewal":  (c) => `You are the SIXXAB Customer Success Agent. Write a renewal conversation starter for ${c.name} on the ${c.value||"Pro"} plan. Their tenure: ${c.tenure||"90"} days. Focus on what they've achieved, what's next, and a soft prompt to continue or upgrade. Not a hard sell.`,
    "Churned":  (c) => `You are the SIXXAB Customer Success Agent. Write a win-back email for ${c.name} who cancelled their ${c.value||"Starter"} plan. Reason if known: ${c.notes||"not stated"}. Acknowledge, don't guilt. Share one new feature they didn't have. Offer a 1-month discount to return. Keep it brief.`,
  },
}

// Health score calculator
function calcHealth(c) {
  let score = 50
  if (c.stage==="Active")      score = 85
  if (c.stage==="Onboarding")  score = 70
  if (c.stage==="Renewal")     score = 65
  if (c.stage==="At Risk")     score = 30
  if (c.stage==="Churned")     score = 10
  if (c.stage==="Closed ✓")   score = 75
  if (c.nps >= 9)  score = Math.min(100, score+10)
  if (c.nps && c.nps <= 6) score = Math.max(0, score-20)
  return score
}

export default function RetentionPage() {
  const [contacts,     setContacts]     = useState([])
  const [history,      setHistory]      = useState([])
  const [selected,     setSelected]     = useState(null) // contact id
  const [tab,          setTab]          = useState("pipeline") // pipeline|customers|at-risk|analytics
  const [generating,   setGenerating]   = useState(false)
  const [agentOutput,  setAgentOutput]  = useState("")
  const [agentStage,   setAgentStage]   = useState("")
  const [toast,        setToast]        = useState(null)
  const [stageFilter,  setStageFilter]  = useState("all")
  const [search,       setSearch]       = useState("")
  const [copiedId,     setCopiedId]     = useState(null)

  useEffect(() => {
    setContacts(loadCRM())
    setHistory(loadHist())
    const onUpdate = (e) => { if(e.detail?.contacts) setContacts(e.detail.contacts) }
    window.addEventListener("sixxab_crm_updated", onUpdate)
    return () => window.removeEventListener("sixxab_crm_updated", onUpdate)
  }, [])

  function showToast(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),3500) }

  function copyMsg(text, id) {
    navigator.clipboard.writeText(text).then(()=>{ setCopiedId(id); setTimeout(()=>setCopiedId(null),2500) })
  }

  const contact = contacts.find(c=>String(c.id)===String(selected))

  // Move contact to next stage
  function advanceStage(contactId, newStage) {
    const updated = contacts.map(c => String(c.id)===String(contactId)
      ? { ...c, stage:newStage, lastStageChange:new Date().toISOString(),
          ...(newStage==="Closed ✓" && { closedAt:new Date().toISOString() }),
          ...(newStage==="Churned"  && { churnedAt:new Date().toISOString() }),
          ...(newStage==="Active"   && { activeSince:new Date().toISOString() }),
        }
      : c)
    setContacts(updated); saveCRM(updated)
    showToast(`${contacts.find(c=>String(c.id)===String(contactId))?.name} → ${newStage}`)
  }

  // Set field on contact
  function updateContact(contactId, patch) {
    const updated = contacts.map(c => String(c.id)===String(contactId) ? {...c,...patch} : c)
    setContacts(updated); saveCRM(updated)
  }

  // Run agent for selected contact + stage
  async function runAgent(stageId) {
    if (!contact) return
    const stage = PIPELINE.find(s=>s.id===stageId) || PIPELINE.find(s=>s.id===contact.stage)
    if (!stage) return
    const agentType = stage.agent
    const promptFn  = AGENT_PROMPTS[agentType]?.[stageId] || AGENT_PROMPTS[agentType]?.[contact.stage]
    if (!promptFn) { showToast("No agent prompt for this stage", false); return }

    setGenerating(true); setAgentOutput(""); setAgentStage(stageId)
    try {
      const r = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content: promptFn(contact) }] })
      })
      const d = await r.json()
      const output = d.reply || "Unable to generate — check API connection."
      setAgentOutput(output)
      // Save to history
      const item = { id:mkId(), contactId:contact.id, contactName:contact.name,
        stage:stageId, agent:stage.agentLabel, output, ts:new Date().toISOString() }
      const nh = [item,...history].slice(0,100)
      setHistory(nh); saveHist(nh)
    } catch { showToast("Network error", false) }
    setGenerating(false)
  }

  // Computed views
  const pipelineStages = ["Prospect","Outreach","Replied","Demo","Proposal","Negotiation"]
  const customerStages = ["Closed ✓","Onboarding","Active","Renewal"]
  const atRiskStages   = ["At Risk","Churned"]

  const filtered = contacts.filter(c => {
    const matchSearch = !search || `${c.name} ${c.company} ${c.role}`.toLowerCase().includes(search.toLowerCase())
    const matchStage  = stageFilter==="all" || c.stage===stageFilter
    return matchSearch && matchStage
  })

  const metrics = {
    leads:       contacts.filter(c=>pipelineStages.includes(c.stage)).length,
    customers:   contacts.filter(c=>customerStages.includes(c.stage)).length,
    atRisk:      contacts.filter(c=>atRiskStages.includes(c.stage)).length,
    mrr:         contacts.filter(c=>["Closed ✓","Onboarding","Active","Renewal"].includes(c.stage))
                         .reduce((a,c)=>(a+(c.value==="Pro"?999:c.value==="Agency"?2499:250)),0),
    conversion:  contacts.length ? Math.round((contacts.filter(c=>c.stage==="Closed ✓"||customerStages.includes(c.stage)).length/contacts.length)*100) : 0,
  }

  const selectedPipeline = PIPELINE.find(p=>p.id===contact?.stage)

  return (
    <>
      <Head>
        <title>SIXXAB AI — Lead to Retention Pipeline</title>
        <meta name="description" content="End-to-end lead management: prospect generation, CRM pipeline, onboarding, customer success and retention — powered by CSO, COO and Customer Success agents."/>
      </Head>
      <style>{`
        body{background:#F4F4F0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .3s ease both}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        .inp{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13px;color:${N};background:#fff;font-family:inherit;outline:none;transition:border .15s}
        .inp:focus{border-color:${AMBER}}
        .tab-btn{padding:7px 16px;border-radius:8px;border:none;font-size:12.5px;font-weight:500;cursor:pointer;font-family:inherit;background:transparent;color:#64748B;transition:all .14s}
        .tab-btn.on{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.08)}
        .contact-row{display:flex;align-items:center;gap:10;padding:10px 14px;cursor:pointer;transition:background .12s;border-bottom:1px solid #F1F5F9}
        .contact-row:hover{background:#FAFAFA}
        .contact-row.sel{background:#FFFBF2;border-left:3px solid ${AMBER}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${AMBER};border-radius:2px}
      `}</style>

      <SixxabNav active="/retention"/>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",bottom:24,right:24,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)",animation:"fadeUp .3s ease"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

      {/* Header */}
      <div style={{background:N,padding:"14px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(29,158,117,.18)",border:"1.5px solid rgba(29,158,117,.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-chart-arrows-vertical" style={{fontSize:22,color:GREEN}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                <h1 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:CHALK,letterSpacing:.5}}>
                  SIXXAB <span style={{color:GREEN,fontStyle:"italic"}}>Lead to Retention</span>
                </h1>
                <span style={{padding:"2px 9px",borderRadius:20,background:"rgba(29,158,117,.15)",border:"1px solid rgba(29,158,117,.35)",fontSize:10,fontWeight:600,color:"#6EE7B7"}}>CSO + COO + Customer Success</span>
              </div>
              <p style={{fontSize:12,color:"rgba(245,245,240,.45)"}}>Prospect → Outreach → Demo → Close → Onboard → Retain → Renew</p>
            </div>
          </div>
          {/* KPI strip */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[["Leads",metrics.leads,"#EF9F27"],["Customers",metrics.customers,GREEN],["At Risk",metrics.atRisk,"#DC2626"],["MRR","$"+metrics.mrr.toLocaleString(),GREEN],["Conv %",metrics.conversion+"%",AMBER]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center",padding:"5px 11px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
                <div style={{fontFamily:"Georgia",fontSize:16,color:c,lineHeight:1}}>{v}</div>
                <div style={{fontSize:9.5,color:"rgba(245,245,240,.4)",textTransform:"uppercase",letterSpacing:".06em"}}>{l}</div>
              </div>
            ))}
            <a href="/leads" style={{padding:"8px 14px",borderRadius:9,background:"rgba(29,158,117,.2)",border:"1px solid rgba(29,158,117,.4)",fontSize:12,fontWeight:600,color:"#6EE7B7",textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>
              <i className="ti ti-plus" style={{fontSize:11}} aria-hidden="true"/>Add prospects
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"8px 4%",display:"flex",gap:4,alignItems:"center"}}>
        <div style={{display:"flex",gap:2,background:"#F1F5F9",borderRadius:9,padding:3}}>
          {[["pipeline","🎯 Pipeline"],["customers","✓ Customers"],["at-risk","⚠ At Risk"],["analytics","📊 Analytics"]].map(([t,l])=>(
            <button key={t} className={`tab-btn${tab===t?" on":""}`} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts…"
          style={{marginLeft:12,padding:"6px 12px",border:"1px solid #E2E8F0",borderRadius:9,fontSize:12.5,fontFamily:"inherit",outline:"none",width:200,color:N}}/>
        <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)}
          style={{padding:"6px 10px",border:"1px solid #E2E8F0",borderRadius:9,fontSize:12.5,fontFamily:"inherit",outline:"none",color:N,cursor:"pointer"}}>
          <option value="all">All stages</option>
          {PIPELINE.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <span style={{marginLeft:"auto",fontSize:12,color:"#94A3B8"}}>{filtered.length} contacts</span>
      </div>

      {/* Main grid */}
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",height:"calc(100vh - 175px)",overflow:"hidden"}}>

        {/* Contact list */}
        <div style={{borderRight:"1px solid #E8ECF4",overflowY:"auto",background:"#FAFAFA"}}>
          {filtered.length===0 && (
            <div style={{padding:"28px 16px",textAlign:"center",color:"#94A3B8"}}>
              <div style={{fontSize:24,marginBottom:8}}>👥</div>
              <div style={{fontSize:13,marginBottom:12}}>No contacts yet</div>
              <a href="/leads" style={{fontSize:12.5,color:GREEN,textDecoration:"none",fontWeight:600}}>Generate prospects →</a>
            </div>
          )}
          {filtered.map(c=>{
            const stage = PIPELINE.find(p=>p.id===c.stage)
            const health = calcHealth(c)
            return (
              <div key={String(c.id)} className={`contact-row${String(c.id)===String(selected)?" sel":""}`}
                style={{borderLeft:`3px solid ${String(c.id)===String(selected)?AMBER:"transparent"}`}}
                onClick={()=>{ setSelected(String(c.id)); setAgentOutput(""); setAgentStage("") }}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <div style={{width:28,height:28,borderRadius:8,background:`${stage?.color||"#64748B"}18`,border:`1px solid ${stage?.color||"#64748B"}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <i className={`ti ${stage?.icon||"ti-user"}`} style={{fontSize:12,color:stage?.color||"#64748B"}} aria-hidden="true"/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:600,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                      <div style={{fontSize:10.5,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.company||c.role||"—"}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                    <span style={{fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:8,background:stage?.bg||"#F8F9FA",color:stage?.color||"#64748B",border:`1px solid ${stage?.color||"#64748B"}33`}}>{c.stage}</span>
                    {["Active","Onboarding","Renewal","At Risk","Churned"].includes(c.stage)&&(
                      <div style={{flex:1,height:3,borderRadius:2,background:"#F1F5F9",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${health}%`,background:health>=70?"#1D9E75":health>=40?AMBER:"#DC2626",borderRadius:2,transition:"width .3s"}}/>
                      </div>
                    )}
                    {c.score&&<span style={{fontSize:10,color:c.score>=75?"#1D9E75":c.score>=60?AMBER:"#DC2626",fontWeight:700,marginLeft:"auto"}}>{c.score}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail panel */}
        <div style={{overflowY:"auto",padding:"18px 22px"}}>
          {!contact ? (
            <div style={{textAlign:"center",padding:"48px 20px",color:"#94A3B8"}}>
              <div style={{fontSize:32,marginBottom:12}}>👈</div>
              <div style={{fontSize:14,fontWeight:500,marginBottom:6}}>Select a contact</div>
              <div style={{fontSize:13}}>Click any contact to see their pipeline, run agents and track their journey</div>
            </div>
          ) : (
            <div className="fu" key={String(contact.id)}>

              {/* Contact header */}
              <div className="card" style={{marginBottom:14,background:N,border:"none"}}>
                <div style={{padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                    <div style={{width:48,height:48,borderRadius:13,background:`${selectedPipeline?.color||"#64748B"}22`,border:`2px solid ${selectedPipeline?.color||"#64748B"}55`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <i className={`ti ${selectedPipeline?.icon||"ti-user"}`} style={{fontSize:22,color:selectedPipeline?.color||"#64748B"}} aria-hidden="true"/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:CHALK,marginBottom:3}}>{contact.name}</div>
                      <div style={{fontSize:13,color:"rgba(245,245,240,.55)"}}>{contact.role||"—"} {contact.company?"· "+contact.company:""}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,background:`${selectedPipeline?.color||"#64748B"}22`,color:selectedPipeline?.color||"#64748B",border:`1px solid ${selectedPipeline?.color||"#64748B"}44`,marginBottom:6}}>{contact.stage}</div>
                      {contact.value&&<div style={{fontSize:10.5,color:"rgba(245,245,240,.4)"}}>{contact.value} plan</div>}
                    </div>
                  </div>

                  {/* Quick info grid */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[
                      ["Score", contact.score||calcHealth(contact), contact.score>=75?"#1D9E75":contact.score>=60?AMBER:"#DC2626"],
                      ["Health", calcHealth(contact)+"%", calcHealth(contact)>=70?"#1D9E75":calcHealth(contact)>=40?AMBER:"#DC2626"],
                      ["Source", contact.source||"Manual", "#94A3B8"],
                    ].map(([l,v,c])=>(
                      <div key={l} style={{padding:"9px 11px",borderRadius:9,background:"rgba(255,255,255,.06)"}}>
                        <div style={{fontSize:9.5,color:"rgba(245,245,240,.35)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:3}}>{l}</div>
                        <div style={{fontSize:15,fontWeight:700,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage progression */}
                <div style={{padding:"10px 20px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:10.5,color:"rgba(245,245,240,.35)",marginRight:4}}>Move to:</span>
                  {PIPELINE.filter(p=>p.id!==contact.stage).slice(0,5).map(p=>(
                    <button key={p.id} onClick={()=>advanceStage(contact.id,p.id)}
                      style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${p.color}44`,background:`${p.color}18`,color:p.color,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pipeline progress bar */}
              <div className="card" style={{marginBottom:14,padding:"14px 16px"}}>
                <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Journey progress</div>
                <div style={{display:"flex",gap:2}}>
                  {PIPELINE.map((p,i)=>{
                    const pastStages = PIPELINE.slice(0,i+1).map(x=>x.id)
                    const isActive = p.id===contact.stage
                    const isDone = !isActive && (PIPELINE.findIndex(x=>x.id===contact.stage)>i || ["Active","Renewal"].includes(contact.stage))
                    return (
                      <div key={p.id} style={{flex:1,textAlign:"center"}} title={p.label}>
                        <div style={{height:6,borderRadius:3,background:isActive?p.color:isDone?"#1D9E75":"#E2E8F0",marginBottom:4,transition:"background .2s"}}/>
                        <div style={{fontSize:8,color:isActive?p.color:isDone?"#1D9E75":"#CBD5E1",fontWeight:isActive?700:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Agent action panel */}
              {selectedPipeline && (
                <div className="card" style={{marginBottom:14,border:`2px solid ${selectedPipeline.color}33`}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid #E8ECF4",background:`${selectedPipeline.bg}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <div style={{width:32,height:32,borderRadius:9,background:`${selectedPipeline.color}22`,border:`1px solid ${selectedPipeline.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <i className={`ti ${selectedPipeline.icon}`} style={{fontSize:15,color:selectedPipeline.color}} aria-hidden="true"/>
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:N}}>{selectedPipeline.agentLabel}</div>
                        <div style={{fontSize:11.5,color:"#64748B"}}>Recommended action: {selectedPipeline.action}</div>
                      </div>
                    </div>
                    <button onClick={()=>runAgent(contact.stage)} disabled={generating}
                      style={{padding:"8px 18px",borderRadius:9,background:generating?"#F1F5F9":selectedPipeline.color,color:generating?"#94A3B8":["#EF9F27","#F59E0B"].includes(selectedPipeline.color)?N:"#fff",border:"none",cursor:generating?"not-allowed":"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:7,transition:"all .15s"}}>
                      {generating?<><div style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Generating…</>:<><i className="ti ti-sparkles" style={{fontSize:12}} aria-hidden="true"/>Run agent</>}
                    </button>
                  </div>

                  {/* Agent output */}
                  {agentOutput && (
                    <div style={{padding:"14px 16px"}}>
                      <div style={{fontSize:13,color:N,lineHeight:1.85,whiteSpace:"pre-wrap",marginBottom:12}}>{agentOutput}</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        <button onClick={()=>copyMsg(agentOutput,"main")}
                          style={{padding:"7px 16px",borderRadius:8,background:copiedId==="main"?"#1D9E75":selectedPipeline.color,color:copiedId==="main"?"#fff":["#EF9F27"].includes(selectedPipeline.color)?N:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:600,transition:"background .2s"}}>
                          {copiedId==="main"?"✓ Copied!":"Copy message"}
                        </button>
                        {contact.stage==="Closed ✓"&&(
                          <button onClick={()=>advanceStage(contact.id,"Onboarding")}
                            style={{padding:"7px 16px",borderRadius:8,background:"#F0FDF4",border:"1px solid #6EE7B7",color:"#085041",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:500}}>
                            Mark onboarding started →
                          </button>
                        )}
                        {contact.stage==="Onboarding"&&(
                          <button onClick={()=>advanceStage(contact.id,"Active")}
                            style={{padding:"7px 16px",borderRadius:8,background:"#F0FDF4",border:"1px solid #6EE7B7",color:"#085041",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:500}}>
                            Mark as active customer →
                          </button>
                        )}
                        {contact.stage==="Active"&&(
                          <button onClick={()=>advanceStage(contact.id,"At Risk")}
                            style={{padding:"7px 16px",borderRadius:8,background:"#FEF2F2",border:"1px solid #FECACA",color:"#991B1B",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:500}}>
                            Flag as at risk
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick actions for other stages */}
                  {!agentOutput&&(
                    <div style={{padding:"10px 16px",display:"flex",gap:7,flexWrap:"wrap"}}>
                      {PIPELINE.filter(p=>p.id!==contact.stage&&AGENT_PROMPTS[p.agent]?.[p.id]).slice(0,3).map(p=>(
                        <button key={p.id} onClick={()=>runAgent(p.id)}
                          style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${p.color}33`,background:`${p.color}08`,color:p.color,fontSize:11.5,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>
                          {p.action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Contact notes + last touch */}
              <div className="card" style={{padding:"14px 16px",marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Contact details</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  {[["Email",contact.email||"—"],["LinkedIn",contact.linkedin||"—"],["Location",contact.location||"—"],["Plan",contact.value||"—"]].map(([l,v])=>(
                    <div key={l}>
                      <div style={{fontSize:10,color:"#94A3B8",marginBottom:2,textTransform:"uppercase",letterSpacing:".06em"}}>{l}</div>
                      <div style={{fontSize:12.5,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:10,color:"#94A3B8",marginBottom:4,textTransform:"uppercase",letterSpacing:".06em"}}>Notes / pain point</div>
                  <textarea defaultValue={contact.notes||""} rows={2}
                    onBlur={e=>updateContact(contact.id,{notes:e.target.value})}
                    style={{width:"100%",padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:9,fontSize:12.5,fontFamily:"inherit",resize:"none",outline:"none",color:N,lineHeight:1.6}}
                    placeholder="Pain point, context, key notes…"/>
                </div>
              </div>

              {/* History */}
              {history.filter(h=>h.contactId===String(contact.id)).length>0&&(
                <div className="card" style={{padding:"14px 16px"}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Agent history for {contact.name}</div>
                  {history.filter(h=>h.contactId===String(contact.id)).slice(0,5).map(h=>(
                    <div key={h.id} style={{padding:"9px 11px",borderRadius:9,background:"#F8F9FA",border:"1px solid #E8ECF4",marginBottom:7}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:11.5,fontWeight:600,color:N}}>{h.agent} · {h.stage}</span>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <span style={{fontSize:10,color:"#94A3B8"}}>{new Date(h.ts).toLocaleDateString()}</span>
                          <button onClick={()=>copyMsg(h.output,h.id)}
                            style={{padding:"2px 8px",borderRadius:6,background:copiedId===h.id?"#1D9E75":GREEN,color:"#fff",border:"none",fontSize:10.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"background .2s"}}>
                            {copiedId===h.id?"✓":"Copy"}
                          </button>
                        </div>
                      </div>
                      <div style={{fontSize:12,color:"#64748B",lineHeight:1.6,overflow:"hidden",maxHeight:48,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{h.output}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
