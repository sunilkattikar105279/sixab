import { useState, useEffect, useRef } from "react"

// ── Agent definitions ─────────────────────────────────────────────────────
const AGENTS = [
  {
    id: "marketing",
    icon: "ti-speakerphone",
    label: "Marketing Agent",
    color: "#EF9F27",
    colorBg: "#FAEEDA",
    colorTxt: "#633806",
    desc: "Multi-channel outreach across LinkedIn, Instagram, X, WhatsApp, Email & SMS",
    channels: ["LinkedIn", "Instagram", "X / Twitter", "WhatsApp", "Email", "SMS / Text"],
    channelIcons: ["ti-brand-linkedin","ti-brand-instagram","ti-brand-x","ti-brand-whatsapp","ti-mail","ti-message"],
  },
  {
    id: "sales",
    icon: "ti-trending-up",
    label: "Sales Agent",
    color: "#1D9E75",
    colorBg: "#E1F5EE",
    colorTxt: "#085041",
    desc: "Handles the full pipeline from lead qualification to close and upsell",
  },
  {
    id: "support",
    icon: "ti-headset",
    label: "Support Agent",
    color: "#378ADD",
    colorBg: "#E6F1FB",
    colorTxt: "#0C447C",
    desc: "After-sale onboarding, issue resolution, retention and NPS collection",
  },
  {
    id: "strategy",
    icon: "ti-brain",
    label: "Strategy Agent",
    color: "#7C3AED",
    colorBg: "#F5F3FF",
    colorTxt: "#4C1D95",
    desc: "Business model, niche selection, pricing, positioning and growth planning",
  },
  {
    id: "content",
    icon: "ti-writing",
    label: "Content Agent",
    color: "#D4537E",
    colorBg: "#FBEAF0",
    colorTxt: "#72243E",
    desc: "Blog posts, social copy, email newsletters, SEO articles and video scripts",
  },
  {
    id: "ops",
    icon: "ti-settings-automation",
    label: "Ops & Finance Agent",
    color: "#5F5E5A",
    colorBg: "#F1EFE8",
    colorTxt: "#2C2C2A",
    desc: "MRR tracking, churn alerts, Stripe reconciliation, P&L and burn rate",
  },
]

// ── Channel config ────────────────────────────────────────────────────────
const CHANNEL_CONFIG = {
  LinkedIn:    { icon: "ti-brand-linkedin",  color: "#0A66C2", hint: "Professional tone · max 1,300 chars · no hashtag spam" },
  Instagram:   { icon: "ti-brand-instagram", color: "#E1306C", hint: "Warm & visual · 150 char DM limit · use emojis" },
  "X / Twitter": { icon: "ti-brand-x",       color: "#000000", hint: "Sharp & punchy · 280 chars · hook in first 5 words" },
  WhatsApp:    { icon: "ti-brand-whatsapp",  color: "#25D366", hint: "Conversational · short · feels like a friend texting" },
  Email:       { icon: "ti-mail",            color: "#EF9F27", hint: "Subject line is everything · plain text converts better" },
  "SMS / Text":{ icon: "ti-message",         color: "#8B5CF6", hint: "Under 160 chars · always include opt-out · first name only" },
}

// ── Demo contacts ─────────────────────────────────────────────────────────
const DEMO_CONTACTS = [
  { id:1, name:"Sarah Chen",     role:"Freelance designer",    status:"warm",  avatar:"SC" },
  { id:2, name:"Mike Rodriguez", role:"HVAC contractor owner",  status:"hot",   avatar:"MR" },
  { id:3, name:"Priya Nair",     role:"Business consultant",    status:"warm",  avatar:"PN" },
  { id:4, name:"Tom Walsh",      role:"Real estate agent",      status:"cold",  avatar:"TW" },
  { id:5, name:"Angela Brooks",  role:"Marketing freelancer",   status:"hot",   avatar:"AB" },
]

// ── Pipeline stages ───────────────────────────────────────────────────────
const PIPELINE = [
  { stage:"Prospect",  count:47, value:"$4,700",  color:"#F1EFE8", txt:"#5F5E5A" },
  { stage:"Outreach",  count:23, value:"$2,875",  color:"#FAEEDA", txt:"#633806" },
  { stage:"Demo",      count:11, value:"$2,200",  color:"#E6F1FB", txt:"#0C447C" },
  { stage:"Proposal",  count:6,  value:"$1,800",  color:"#F5F3FF", txt:"#4C1D95" },
  { stage:"Closed",    count:4,  value:"$1,176",  color:"#E1F5EE", txt:"#085041" },
]

// ── Metrics ───────────────────────────────────────────────────────────────
const METRICS = {
  marketing: [
    { label:"DMs sent",         value:"1,247",  delta:"+12%",   up:true  },
    { label:"Response rate",    value:"18.4%",  delta:"+3.1%",  up:true  },
    { label:"Leads generated",  value:"94",     delta:"+21%",   up:true  },
    { label:"Cost per lead",    value:"$0",     delta:"organic",up:true  },
  ],
  sales: [
    { label:"Pipeline value",   value:"$12,551",delta:"+18%",   up:true  },
    { label:"Conversion rate",  value:"8.5%",   delta:"+2.3%",  up:true  },
    { label:"Avg deal size",    value:"$24.50", delta:"Pro plan",up:true  },
    { label:"Sales cycle",      value:"2.3d",   delta:"-0.4d",  up:true  },
  ],
  support: [
    { label:"Open tickets",     value:"3",      delta:"-5",     up:true  },
    { label:"Avg response",     value:"1.2h",   delta:"-18min", up:true  },
    { label:"NPS score",        value:"72",     delta:"+4pts",  up:true  },
    { label:"Churn rate",       value:"2.1%",   delta:"-0.8%",  up:true  },
  ],
  strategy: [
    { label:"Active strategies",value:"3",      delta:"running",up:true  },
    { label:"Revenue forecast", value:"$8,400", delta:"Month 3",up:true  },
    { label:"Niche score",      value:"92/100", delta:"+7pts",  up:true  },
    { label:"Market fit",       value:"Strong", delta:"validated",up:true},
  ],
  content: [
    { label:"Posts published",  value:"34",     delta:"This month",up:true},
    { label:"Avg engagement",   value:"4.7%",   delta:"+1.2%",  up:true  },
    { label:"Content pieces",   value:"12",     delta:"Queued",  up:true  },
    { label:"SEO articles",     value:"8",      delta:"Live",    up:true  },
  ],
  ops: [
    { label:"MRR",              value:"$1,470", delta:"+$980",  up:true  },
    { label:"Active subs",      value:"31",     delta:"+14",    up:true  },
    { label:"Churn alerts",     value:"0",      delta:"All good",up:true },
    { label:"Burn rate",        value:"$38/mo", delta:"Lean",   up:true  },
  ],
}

// ── Main component ────────────────────────────────────────────────────────
export default function AgentPlatform() {
  const [activeAgent, setActiveAgent] = useState("marketing")
  const [activeChannel, setActiveChannel] = useState("LinkedIn")
  const [selectedContacts, setSelectedContacts] = useState([1, 2, 5])
  const [offer, setOffer] = useState("50% off founding member access — $24.50/mo Pro plan. Expires at public launch.")
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(null)
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState([{
    role:"assistant",
    content:"SIXXAB agents ready. I'm your Marketing Agent — select your channels and contacts, then hit Generate to create personalised outreach scripts for each contact across all selected channels.",
  }])
  const [sending, setSending] = useState(false)
  const [pipelineView, setPipelineView] = useState("kanban")
  const [supportTickets] = useState([
    { id:"#T-001", name:"Sarah Chen",  issue:"Can't access coach page", status:"open",     priority:"high",   time:"2h ago" },
    { id:"#T-002", name:"Mike R.",     issue:"Stripe receipt question",  status:"resolved", priority:"low",    time:"1d ago" },
    { id:"#T-003", name:"Priya N.",    issue:"How to use /agent page",   status:"open",     priority:"medium", time:"4h ago" },
  ])
  const bottomRef = useRef(null)
  const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }) }, [messages])

  const agent = AGENTS.find(a => a.id === activeAgent)

  async function handleGenerate() {
    setGenerating(true)
    setGenerated(null)
    const contacts = DEMO_CONTACTS.filter(c => selectedContacts.includes(c.id))

    try {
      const res = await fetch("/api/marketing-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: contacts.map(c => ({
            name: c.name,
            role: c.role,
            platform: activeChannel,
            context: `Status: ${c.status} lead. Offer: ${offer}`,
          })),
        }),
      })
      const data = await res.json()
      if (data.messages) setGenerated(data.messages)
    } catch {
      setGenerated(contacts.map(c => ({
        name: c.name,
        platform: activeChannel,
        message: `Hi ${c.name.split(" ")[0]}, I noticed you're in ${c.role} — I built something that could save you hours every week.\n\nSIXAB gives you an AI business advisor, launch system and marketing tools in one box. We're offering founding members 50% off — $24.50/mo Pro plan.\n\nWould love your feedback. Open to a quick 15-min chat?`,
        followUp: `Hey ${c.name.split(" ")[0]}, just following up — did you get a chance to check out startupsinabox.com? Happy to answer any questions.`,
        bestTime: activeChannel === "LinkedIn" ? "Tue–Thu 8–10am" : activeChannel === "Email" ? "Tue 7–9am" : "Weekday mornings",
      })))
    }
    setGenerating(false)
  }

  async function sendChat() {
    if (!chatInput.trim() || sending) return
    const text = chatInput.trim()
    setChatInput("")
    const next = [...messages, { role:"user", content:text }]
    setMessages(next)
    setSending(true)
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })) }),
      })
      const data = await res.json()
      setMessages([...next, { role:"assistant", content: data.reply || "I'm here — what do you need?" }])
    } catch {
      setMessages([...next, { role:"assistant", content:"Network error — please retry." }])
    }
    setSending(false)
  }

  function copyText(text) {
    navigator.clipboard.writeText(text)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;color:#0A0E1A}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .spin{animation:spin .8s linear infinite}
        .pulse{animation:pulse 2s infinite}
        .fadeIn{animation:fadeIn .3s ease both}
        textarea,input,select{font-family:inherit}
        textarea:focus,input:focus,select:focus{outline:none}
        .chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:500;padding:3px 9px;border-radius:20px;cursor:pointer;border:1px solid transparent;transition:all .15s}
        .sbtn{padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:opacity .15s}
        .sbtn:hover{opacity:.88}
        .sbtn:disabled{opacity:.5;cursor:not-allowed}
        .ghost-btn{padding:7px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;background:transparent;border:1px solid #E2E8F0;color:#64748B;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s}
        .ghost-btn:hover{background:#F8F9FA;border-color:#CBD5E1}
        .tab-btn{padding:7px 16px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:none;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif}
      `}</style>

      <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#F4F4F0"}}>

        {/* ── SIDEBAR ── */}
        <aside style={{width:220,background:N,display:"flex",flexDirection:"column",flexShrink:0,borderRight:"1px solid rgba(255,255,255,.07)"}}>
          {/* Logo */}
          <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
              <svg width="28" height="28" viewBox="0 0 72 72">
                <rect x="1.5" y="1.5" width="69" height="69" rx="12" fill="none" stroke="#EF9F27" strokeWidth="2.5"/>
                <text x="7" y="54" fontFamily="'Bebas Neue'" fontSize="48" fill="none" stroke="#EF9F27" strokeWidth="1.5" letterSpacing="-3">S</text>
                <text x="35" y="54" fontFamily="'Bebas Neue'" fontSize="54" fill="none" stroke="#EF9F27" strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
              </svg>
              <div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:CHALK,letterSpacing:2,lineHeight:1}}>
                  SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB
                </div>
                <div style={{fontFamily:"'DM Mono'",fontSize:8,color:"#5F5E5A",letterSpacing:".12em"}}>agent platform</div>
              </div>
            </div>
          </div>

          {/* Agent nav */}
          <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
            <div style={{fontSize:9,fontWeight:600,color:"#5F5E5A",letterSpacing:".1em",textTransform:"uppercase",padding:"8px 8px 6px"}}>Agents</div>
            {AGENTS.map(a => (
              <button key={a.id} onClick={() => setActiveAgent(a.id)}
                style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 8px",borderRadius:8,border:"none",background:activeAgent===a.id?"rgba(239,159,39,.12)":"transparent",cursor:"pointer",marginBottom:2,transition:"background .15s"}}>
                <div style={{width:28,height:28,borderRadius:7,background:activeAgent===a.id?a.color:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .15s"}}>
                  <i className={`ti ${a.icon}`} style={{fontSize:14,color:activeAgent===a.id?N:"rgba(255,255,255,.45)"}} aria-hidden="true"/>
                </div>
                <div style={{textAlign:"left",flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500,color:activeAgent===a.id?AMBER:CHALK,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.label}</div>
                </div>
                {activeAgent===a.id && <div style={{width:3,height:20,borderRadius:2,background:AMBER,flexShrink:0}}/>}
              </button>
            ))}
          </nav>

          {/* Status bar */}
          <div style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.07)"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"rgba(255,255,255,.4)"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#1D9E75"}} className="pulse"/>
              All agents online
            </div>
            <div style={{fontFamily:"'DM Mono'",fontSize:9,color:"#444",marginTop:3}}>startupsinabox.com</div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* Top bar */}
          <header style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div>
              <div style={{fontSize:16,fontWeight:600,color:N}}>{agent.label}</div>
              <div style={{fontSize:11,color:"#94A3B8"}}>{agent.desc}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11,fontWeight:500,padding:"4px 10px",borderRadius:20,background:agent.colorBg,color:agent.colorTxt,display:"flex",alignItems:"center",gap:5}}>
                <i className={`ti ${agent.icon}`} style={{fontSize:13}} aria-hidden="true"/>
                Active
              </span>
              <button className="ghost-btn" onClick={() => window.location.href="/"}>← Home</button>
            </div>
          </header>

          {/* Metrics row */}
          <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"12px 24px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,flexShrink:0}}>
            {(METRICS[activeAgent]||METRICS.marketing).map((m,i) => (
              <div key={i} style={{background:"#F8F9FA",borderRadius:10,padding:"10px 14px"}}>
                <div style={{fontSize:11,color:"#94A3B8",marginBottom:3}}>{m.label}</div>
                <div style={{fontSize:20,fontWeight:600,color:N,marginBottom:2}}>{m.value}</div>
                <div style={{fontSize:11,color:m.up?"#1D9E75":"#DC2626",fontWeight:500}}>{m.up?"↑":""} {m.delta}</div>
              </div>
            ))}
          </div>

          {/* Agent workspace */}
          <div style={{flex:1,overflow:"auto",padding:20,display:"grid",gridTemplateColumns:"1fr 380px",gap:16}}>

            {/* LEFT: Agent-specific panel */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* ── MARKETING AGENT ── */}
              {activeAgent === "marketing" && (
                <>
                  {/* Channel selector */}
                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Select channels</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                      {AGENTS[0].channels.map((ch,i) => {
                        const cfg = CHANNEL_CONFIG[ch]
                        const active = activeChannel === ch
                        return (
                          <button key={ch} className="chip" onClick={() => setActiveChannel(ch)}
                            style={{background:active?cfg.color:"#F8F9FA",color:active?"#fff":"#64748B",border:`1px solid ${active?cfg.color:"#E2E8F0"}`}}>
                            <i className={`ti ${cfg.icon}`} style={{fontSize:13}} aria-hidden="true"/>
                            {ch}
                          </button>
                        )
                      })}
                    </div>
                    {CHANNEL_CONFIG[activeChannel] && (
                      <div style={{marginTop:10,padding:"7px 10px",background:"#F8F9FA",borderRadius:7,fontSize:11.5,color:"#64748B",display:"flex",gap:6}}>
                        <i className="ti ti-info-circle" style={{fontSize:14,flexShrink:0,marginTop:1}} aria-hidden="true"/>
                        {CHANNEL_CONFIG[activeChannel].hint}
                      </div>
                    )}
                  </div>

                  {/* Contact selector */}
                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em"}}>Contacts ({selectedContacts.length} selected)</div>
                      <button className="ghost-btn" style={{fontSize:11}} onClick={() => setSelectedContacts(DEMO_CONTACTS.map(c=>c.id))}>Select all</button>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {DEMO_CONTACTS.map(c => {
                        const sel = selectedContacts.includes(c.id)
                        return (
                          <div key={c.id} onClick={() => setSelectedContacts(sel ? selectedContacts.filter(x=>x!==c.id) : [...selectedContacts,c.id])}
                            style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:8,border:`1px solid ${sel?"#EF9F27":"#E8ECF4"}`,background:sel?"#FFFBF2":"#F8F9FA",cursor:"pointer",transition:"all .15s"}}>
                            <div style={{width:32,height:32,borderRadius:"50%",background:sel?"#EF9F27":N,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{c.avatar}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:500,color:N}}>{c.name}</div>
                              <div style={{fontSize:11,color:"#94A3B8"}}>{c.role}</div>
                            </div>
                            <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:10,background:c.status==="hot"?"#E1F5EE":c.status==="warm"?"#FAEEDA":"#F1F5F9",color:c.status==="hot"?"#085041":c.status==="warm"?"#633806":"#64748B"}}>{c.status}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Offer */}
                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Offer to embed in every message</div>
                    <textarea value={offer} onChange={e=>setOffer(e.target.value)} rows={2}
                      style={{width:"100%",border:"1px solid #E2E8F0",borderRadius:8,padding:"9px 11px",fontSize:13,background:"#F8F9FA",color:N,resize:"none",lineHeight:1.5}}/>
                  </div>

                  {/* Generate button */}
                  <button className="sbtn" onClick={handleGenerate} disabled={generating || selectedContacts.length === 0}
                    style={{background:AMBER,color:N,padding:"13px",borderRadius:10,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    {generating
                      ? <><div style={{width:16,height:16,border:"2px solid rgba(10,14,26,.3)",borderTopColor:N,borderRadius:"50%"}} className="spin"/> Generating {selectedContacts.length} scripts…</>
                      : <><i className="ti ti-sparkles" aria-hidden="true"/> Generate {selectedContacts.length} {activeChannel} scripts →</>
                    }
                  </button>

                  {/* Generated scripts */}
                  {generated && generated.map((m,i) => (
                    <div key={i} className="fadeIn" style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",overflow:"hidden"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"#F8F9FA",borderBottom:"1px solid #E8ECF4"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:28,height:28,borderRadius:"50%",background:N,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>
                            {m.name?.split(" ").map(w=>w[0]).join("")}
                          </div>
                          <div>
                            <div style={{fontSize:13,fontWeight:500,color:N}}>{m.name}</div>
                            <div style={{fontSize:10,color:"#94A3B8"}}>via {m.platform} · Best time: {m.bestTime}</div>
                          </div>
                        </div>
                        <button className="ghost-btn" style={{fontSize:11}} onClick={() => copyText(m.message)}>
                          <i className="ti ti-copy" style={{fontSize:12}} aria-hidden="true"/> Copy DM
                        </button>
                      </div>
                      <div style={{padding:14}}>
                        <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>Message</div>
                        <div style={{fontSize:13,color:N,lineHeight:1.7,whiteSpace:"pre-wrap",background:"#F8F9FA",borderRadius:8,padding:"10px 12px",marginBottom:10}}>{m.message}</div>
                        <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>Follow-up (3 days)</div>
                        <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.65,whiteSpace:"pre-wrap",background:"#FFFBF2",borderRadius:8,padding:"9px 12px",border:"1px solid rgba(239,159,39,.2)"}}>{m.followUp}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* ── SALES AGENT ── */}
              {activeAgent === "sales" && (
                <>
                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:14}}>Sales pipeline — {PIPELINE.reduce((a,p)=>a+p.count,0)} total leads</div>
                    <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
                      {PIPELINE.map((p,i) => (
                        <div key={i} style={{minWidth:130,flex:1,background:p.color,borderRadius:10,padding:12}}>
                          <div style={{fontSize:11,fontWeight:600,color:p.txt,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>{p.stage}</div>
                          <div style={{fontSize:24,fontWeight:700,color:p.txt,marginBottom:2}}>{p.count}</div>
                          <div style={{fontSize:11,color:p.txt,opacity:.7}}>{p.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:12}}>Hot leads — action needed</div>
                    {DEMO_CONTACTS.filter(c=>c.status==="hot").map(c => (
                      <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 0",borderBottom:"1px solid #F1F5F9"}}>
                        <div style={{width:36,height:36,borderRadius:"50%",background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#085041"}}>{c.avatar}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:500,color:N}}>{c.name}</div>
                          <div style={{fontSize:11,color:"#94A3B8"}}>{c.role}</div>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <button className="ghost-btn" style={{fontSize:11}}>Schedule demo</button>
                          <button className="sbtn" style={{background:"#1D9E75",color:"#fff",padding:"6px 12px",fontSize:11}}>Send proposal</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:10}}>AI demo close script</div>
                    <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.8,background:"#F8F9FA",borderRadius:8,padding:12}}>
                      <strong style={{color:N}}>Min 1–5:</strong> "Tell me about your business — what's the #1 problem slowing you down?"<br/>
                      <strong style={{color:N}}>Min 6–15:</strong> Live SIXXAB coach demo — use their actual business as the example<br/>
                      <strong style={{color:N}}>Min 16–18:</strong> "Based on what you've told me, the Pro plan at $24.50/mo is the right fit. Want to start today?"<br/>
                      <strong style={{color:N}}>Close:</strong> Silence after the question. First person to talk loses.
                    </div>
                  </div>
                </>
              )}

              {/* ── SUPPORT AGENT ── */}
              {activeAgent === "support" && (
                <>
                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                      <div style={{fontSize:13,fontWeight:600,color:N}}>Support tickets</div>
                      <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:"#FEF3C7",color:"#92400E",fontWeight:600}}>3 open</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {supportTickets.map(t => (
                        <div key={t.id} style={{border:`1px solid ${t.status==="open"?"#FECACA":"#D1FAE5"}`,borderRadius:10,padding:12,background:t.status==="open"?"#FEF2F2":"#F0FDF4"}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                            <div style={{display:"flex",alignItems:"center",gap:7}}>
                              <span style={{fontFamily:"'DM Mono'",fontSize:11,color:"#94A3B8"}}>{t.id}</span>
                              <span style={{fontSize:11,fontWeight:600,padding:"2px 7px",borderRadius:6,background:t.priority==="high"?"#FEE2E2":t.priority==="medium"?"#FEF3C7":"#F1F5F9",color:t.priority==="high"?"#991B1B":t.priority==="medium"?"#92400E":"#64748B"}}>{t.priority}</span>
                            </div>
                            <span style={{fontSize:11,color:"#94A3B8"}}>{t.time}</span>
                          </div>
                          <div style={{fontSize:13,fontWeight:500,color:N,marginBottom:3}}>{t.name}</div>
                          <div style={{fontSize:12,color:"#64748B",marginBottom:8}}>{t.issue}</div>
                          {t.status==="open" && (
                            <div style={{display:"flex",gap:6}}>
                              <button className="ghost-btn" style={{fontSize:11}}>View details</button>
                              <button className="sbtn" style={{background:"#378ADD",color:"#fff",padding:"5px 11px",fontSize:11}}>
                                <i className="ti ti-sparkles" style={{fontSize:11}} aria-hidden="true"/> AI reply
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:10}}>Onboarding checklist — new members</div>
                    {["Welcome email sent ✓","Coach page walkthrough scheduled","First strategy session booked","30-day check-in reminder set","NPS survey queued for day 30"].map((item,i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #F1F5F9",fontSize:13,color:i<2?"#1D9E75":"#64748B"}}>
                        <i className={`ti ${i<2?"ti-circle-check":"ti-circle"}`} style={{fontSize:16,color:i<2?"#1D9E75":"#D1D5DB"}} aria-hidden="true"/>
                        {item}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── STRATEGY AGENT ── */}
              {activeAgent === "strategy" && (
                <>
                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:12}}>Active growth strategies</div>
                    {[
                      {title:"Niche expansion: HVAC contractors DFW", status:"Running", progress:65, color:"#7C3AED"},
                      {title:"AppSumo marketplace launch", status:"Planning", progress:30, color:"#EF9F27"},
                      {title:"LinkedIn content flywheel", status:"Running", progress:80, color:"#1D9E75"},
                    ].map((s,i) => (
                      <div key={i} style={{marginBottom:14}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                          <div style={{fontSize:13,fontWeight:500,color:N}}>{s.title}</div>
                          <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:6,background:s.status==="Running"?"#E1F5EE":"#FAEEDA",color:s.status==="Running"?"#085041":"#633806"}}>{s.status}</span>
                        </div>
                        <div style={{height:6,background:"#F1F5F9",borderRadius:3}}>
                          <div style={{height:"100%",width:`${s.progress}%`,background:s.color,borderRadius:3,transition:"width .4s"}}/>
                        </div>
                        <div style={{fontSize:11,color:"#94A3B8",marginTop:3}}>{s.progress}% complete</div>
                      </div>
                    ))}
                  </div>

                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:10}}>Revenue forecast — next 90 days</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                      {[{label:"Month 1",val:"$1,470",sub:"31 subs"},{label:"Month 2",val:"$3,430",sub:"70 subs"},{label:"Month 3",val:"$6,860",sub:"140 subs"}].map((r,i) => (
                        <div key={i} style={{background:"#F8F9FA",borderRadius:10,padding:"12px 10px",textAlign:"center"}}>
                          <div style={{fontSize:11,color:"#94A3B8",marginBottom:4}}>{r.label}</div>
                          <div style={{fontSize:20,fontWeight:700,color:"#7C3AED"}}>{r.val}</div>
                          <div style={{fontSize:11,color:"#94A3B8"}}>{r.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── CONTENT AGENT ── */}
              {activeAgent === "content" && (
                <>
                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:12}}>Content calendar — this week</div>
                    {[
                      {day:"Mon",platform:"LinkedIn",type:"Launch post",status:"Published",color:"#0A66C2"},
                      {day:"Tue",platform:"X / Twitter",type:"Framework thread",status:"Scheduled",color:"#000"},
                      {day:"Wed",platform:"LinkedIn",type:"First revenue post",status:"Draft",color:"#0A66C2"},
                      {day:"Thu",platform:"Instagram",type:"Behind the scenes",status:"Draft",color:"#E1306C"},
                      {day:"Fri",platform:"Email",type:"Weekly founder digest",status:"Draft",color:"#EF9F27"},
                      {day:"Sat",platform:"LinkedIn",type:"Offer post",status:"Queued",color:"#0A66C2"},
                    ].map((c,i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #F1F5F9"}}>
                        <div style={{width:32,fontFamily:"'DM Mono'",fontSize:11,color:"#94A3B8",flexShrink:0}}>{c.day}</div>
                        <div style={{width:8,height:8,borderRadius:"50%",background:c.color,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:500,color:N}}>{c.type}</div>
                          <div style={{fontSize:11,color:"#94A3B8"}}>{c.platform}</div>
                        </div>
                        <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:6,background:c.status==="Published"?"#E1F5EE":c.status==="Scheduled"?"#EEF2FF":c.status==="Queued"?"#FAEEDA":"#F1F5F9",color:c.status==="Published"?"#085041":c.status==="Scheduled"?"#3D52A0":c.status==="Queued"?"#633806":"#64748B"}}>{c.status}</span>
                        {c.status!=="Published" && <button className="ghost-btn" style={{fontSize:11}}>Generate</button>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── OPS AGENT ── */}
              {activeAgent === "ops" && (
                <>
                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                    <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:12}}>MRR breakdown</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                      {[{l:"Total MRR",v:"$1,470",c:"#1D9E75"},{l:"New MRR",v:"+$980",c:"#7C3AED"},{l:"Churned MRR",v:"$0",c:"#64748B"},{l:"Net MRR growth",v:"+200%",c:"#EF9F27"}].map((m,i) => (
                        <div key={i} style={{background:"#F8F9FA",borderRadius:10,padding:12}}>
                          <div style={{fontSize:11,color:"#94A3B8",marginBottom:4}}>{m.l}</div>
                          <div style={{fontSize:22,fontWeight:700,color:m.c}}>{m.v}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Recent Stripe transactions</div>
                    {[
                      {name:"Angela Brooks", plan:"Pro", amount:"$24.50", time:"2h ago"},
                      {name:"Marcus T.",     plan:"Starter", amount:"$14.50", time:"Yesterday"},
                      {name:"Priya Nair",    plan:"Agency",  amount:"$34.50", time:"2 days ago"},
                    ].map((t,i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #F1F5F9"}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#085041"}}>{t.name.split(" ").map(w=>w[0]).join("")}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:500,color:N}}>{t.name}</div>
                          <div style={{fontSize:11,color:"#94A3B8"}}>{t.plan} · {t.time}</div>
                        </div>
                        <div style={{fontSize:14,fontWeight:700,color:"#1D9E75"}}>{t.amount}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT: AI Chat panel */}
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",display:"flex",flexDirection:"column",overflow:"hidden"}}>
              {/* Chat header */}
              <div style={{padding:"12px 14px",borderBottom:"1px solid #E8ECF4",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                <svg width="26" height="26" viewBox="0 0 72 72">
                  <rect x="1.5" y="1.5" width="69" height="69" rx="12" fill="none" stroke="#EF9F27" strokeWidth="2.5"/>
                  <text x="7" y="54" fontFamily="'Bebas Neue'" fontSize="48" fill="none" stroke="#EF9F27" strokeWidth="1.5" letterSpacing="-3">S</text>
                  <text x="35" y="54" fontFamily="'Bebas Neue'" fontSize="54" fill="none" stroke="#EF9F27" strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
                </svg>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:N}}>SIXXAB · {agent.label}</div>
                  <div style={{fontSize:10,color:"#94A3B8"}}>Ask anything about this agent</div>
                </div>
                <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#94A3B8"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#1D9E75"}} className="pulse"/>
                  Online
                </div>
              </div>

              {/* Messages */}
              <div style={{flex:1,overflowY:"auto",padding:"14px 14px 8px",display:"flex",flexDirection:"column",gap:12}}>
                {messages.map((m,i) => (
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row"}} className="fadeIn">
                    <div style={{width:26,height:26,borderRadius:m.role==="assistant"?7:"50%",flexShrink:0,background:m.role==="assistant"?AMBER:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:m.role==="assistant"?N:"#64748B"}}>
                      {m.role==="assistant"?"SX":"You"}
                    </div>
                    <div style={{maxWidth:"82%",padding:"9px 12px",borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",fontSize:12.5,lineHeight:1.7,whiteSpace:"pre-wrap",wordBreak:"break-word",background:m.role==="user"?"#FFFBF2":"#F8F9FA",border:`1px solid ${m.role==="user"?"rgba(239,159,39,.2)":"#E8ECF4"}`,color:N}}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <div style={{width:26,height:26,borderRadius:7,background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:N}}>SX</div>
                    <div style={{padding:"9px 14px",borderRadius:"12px 12px 12px 3px",background:"#F8F9FA",border:"1px solid #E8ECF4",display:"flex",gap:5,alignItems:"center"}}>
                      {[0,1,2].map(i => <div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#94A3B8",animation:`pulse 1.3s ${i*.2}s infinite`}}/>)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>

              {/* Quick prompts */}
              <div style={{padding:"6px 10px",borderTop:"1px solid #E8ECF4",display:"flex",gap:5,flexWrap:"wrap"}}>
                {[
                  activeAgent==="marketing" ? "Write a cold DM for LinkedIn" : null,
                  activeAgent==="marketing" ? "Best time to send on WhatsApp?" : null,
                  activeAgent==="sales" ? "Write a proposal email" : null,
                  activeAgent==="sales" ? "How do I handle price objections?" : null,
                  activeAgent==="support" ? "Write a refund response" : null,
                  activeAgent==="strategy" ? "Which niche should I target first?" : null,
                  activeAgent==="content" ? "Write a LinkedIn post for today" : null,
                  activeAgent==="ops" ? "Explain my MRR growth rate" : null,
                  "What should I do today?",
                ].filter(Boolean).slice(0,3).map((q,i) => (
                  <button key={i} onClick={() => { setChatInput(q); }}
                    style={{fontSize:10.5,padding:"4px 9px",borderRadius:20,border:"1px solid #E2E8F0",background:"#F8F9FA",color:"#64748B",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Plus Jakarta Sans'"}}>{q}</button>
                ))}
              </div>

              {/* Input */}
              <div style={{padding:"10px 12px",borderTop:"1px solid #E8ECF4",display:"flex",gap:8,alignItems:"flex-end",flexShrink:0}}>
                <textarea value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat()}}}
                  placeholder={`Ask the ${agent.label}…`} rows={1}
                  style={{flex:1,resize:"none",border:"1px solid #E2E8F0",borderRadius:8,padding:"8px 11px",fontSize:12.5,background:"#F8F9FA",color:N,lineHeight:1.5,minHeight:36,maxHeight:90,fontFamily:"'Plus Jakarta Sans'"}}/>
                <button onClick={sendChat} disabled={!chatInput.trim()||sending}
                  style={{width:36,height:36,borderRadius:8,border:"none",background:AMBER,color:N,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",opacity:!chatInput.trim()||sending?.5:1}}>↑</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
