import { useState, useRef, useEffect } from "react"

// ── Load CRM contacts from localStorage (shared with /crm page) ──────────────
const CRM_KEY = "sixxab_crm_contacts"
function loadCRMContacts() {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(CRM_KEY) || "[]") } catch { return [] }
}
function saveCRMContacts(list) {
  try { localStorage.setItem(CRM_KEY, JSON.stringify(list)) } catch {}
}
function crmToLead(c) {
  return {
    id: c.id, name: c.name, role: c.role||"", email: c.email||"",
    phone: c.phone||"", linkedin: c.linkedin||"", company: c.company||"",
    status: c.score>=80?"hot":c.score>=60?"warm":c.score>=40?"demo":"cold",
    score: c.score||50, source: c.source||"LinkedIn",
    lastTouch: c.lastTouch||"—", value: c.value||"Starter",
    stage: c.stage||"Prospect", notes: c.notes||"", tags: c.tags||[],
    assignedAgent: c.assignedAgent||"marketing",
  }
}

// ── CXO definitions ─────────────────────────────────────────────────────────
const CXOS = [
  {
    id:"ceo", title:"CEO", name:"Chief Executive Officer",
    color:"#EF9F27", bg:"#FAEEDA", txt:"#412402",
    icon:"ti-crown", desc:"Vision, strategy, investors, board, culture and 48-hr revenue execution",
    agents:["strategy","marketing","sales","content"],
    kpis:[{l:"Goal",v:"$10k MRR"},{l:"Phase",v:"1 of 3"},{l:"Agents",v:"18"},{l:"Advisors",v:"7"}],
    chatRole:"You are the SIXXAB CEO AI advisor. You focus on revenue growth, strategic direction, investor readiness, team culture, and 48-hour execution sprints. Be decisive, data-driven and action-oriented.",
  },
  {
    id:"cto", title:"CTO", name:"Chief Technology Officer",
    color:"#378ADD", bg:"#E6F1FB", txt:"#042C53",
    icon:"ti-code", desc:"Tech stack, AI architecture, product roadmap, security and scalability",
    agents:["product","tech","security"],
    kpis:[{l:"Stack",v:"Next.js"},{l:"AI",v:"Claude"},{l:"Deploy",v:"Vercel"},{l:"DB",v:"Supabase soon"}],
    chatRole:"You are the SIXXAB CTO AI advisor. You focus on tech architecture, Claude API integration, Vercel deployment, Next.js best practices, scalability, and product engineering decisions.",
  },
  {
    id:"cfo", title:"CFO", name:"Chief Financial Officer",
    color:"#1D9E75", bg:"#E1F5EE", txt:"#04342C",
    icon:"ti-chart-line", desc:"MRR, burn rate, Stripe reconciliation, unit economics and fundraising",
    agents:["ops","finance"],
    kpis:[{l:"Model",v:"SaaS"},{l:"Plans",v:"3 tiers"},{l:"CAC",v:"Organic"},{l:"Payments",v:"Stripe"}],
    chatRole:"You are the SIXXAB CFO AI advisor. You focus on unit economics (MRR, LTV, CAC, churn), Stripe revenue, burn rate, P&L, fundraising readiness, and financial forecasting for a SaaS startup.",
  },
  {
    id:"coo", title:"COO", name:"Chief Operating Officer",
    color:"#7C3AED", bg:"#F5F3FF", txt:"#26215C",
    icon:"ti-settings-automation", desc:"Ops systems, support, onboarding, retention and scale processes",
    agents:["support","ops","hr"],
    kpis:[{l:"Open tickets",v:"3"},{l:"Churn",v:"2.1%"},{l:"Onboarding",v:"100%"},{l:"Retention",v:"97.9%"}],
    chatRole:"You are the SIXXAB COO AI advisor. You focus on operational excellence, customer onboarding, support systems, churn reduction, team processes, and scaling operations from 100 to 10,000 users.",
  },
  {
    id:"ciso", title:"CISO", name:"Chief Information Security Officer",
    color:"#DC2626", bg:"#FEF2F2", txt:"#501313",
    icon:"ti-shield-lock", desc:"Data security, compliance, GDPR, API key management and threat monitoring",
    agents:["security","compliance"],
    kpis:[{l:"Vulnerabilities",v:"0"},{l:"GDPR",v:"Compliant"},{l:"API keys",v:"Rotated"},{l:"Incidents",v:"0"}],
    chatRole:"You are the SIXXAB CISO AI advisor. You focus on data security, API key hygiene, GDPR compliance, Stripe PCI compliance, user data protection, and security best practices for a Next.js SaaS.",
  },
  {
    id:"cdo", title:"CDO", name:"Chief Data Officer",
    color:"#0EA5E9", bg:"#E0F2FE", txt:"#042C53",
    icon:"ti-database", desc:"Analytics, user insights, funnel data, cohort analysis and growth metrics",
    agents:["analytics","content"],
    kpis:[{l:"Conversion",v:"8.5%"},{l:"Activation",v:"74%"},{l:"D7 retention",v:"68%"},{l:"Features used",v:"3.2 avg"}],
    chatRole:"You are the SIXXAB CDO AI advisor. You focus on product analytics, conversion funnel optimisation, cohort analysis, user activation, feature adoption, and data-driven growth decisions.",
  },
  {
    id:"cmo", title:"CMO", name:"Chief Marketing Officer",
    color:"#D4537E", bg:"#FBEAF0", txt:"#4B1528",
    icon:"ti-speakerphone", desc:"Brand, content, multi-channel campaigns, SEO, Product Hunt and AppSumo",
    agents:["marketing","content","social"],
    kpis:[{l:"Reach",v:"12.4k"},{l:"DMs sent",v:"1,247"},{l:"Response",v:"18.4%"},{l:"Leads",v:"94"}],
    chatRole:"You are the SIXXAB CMO AI advisor. You focus on brand positioning, LinkedIn/X/Instagram strategy, Product Hunt launches, AppSumo campaigns, content marketing, SEO, and turning founders into customers.",
  },
]

// ── Sub-agents ───────────────────────────────────────────────────────────────
const AGENTS = {
  marketing: {
    label:"Marketing Agent", icon:"ti-speakerphone", color:"#EF9F27",
    desc:"Multi-channel DM generator — LinkedIn, Instagram, X, WhatsApp, Email, SMS",
    channels:["LinkedIn","Instagram","X / Twitter","WhatsApp","Email","SMS"],
    channelIcons:{"LinkedIn":"ti-brand-linkedin","Instagram":"ti-brand-instagram","X / Twitter":"ti-brand-x","WhatsApp":"ti-brand-whatsapp","Email":"ti-mail","SMS":"ti-message"},
    channelHints:{"LinkedIn":"Professional tone · max 1,300 chars · no hashtag spam","Instagram":"Warm & visual · 150 char DM · emojis work","X / Twitter":"Sharp & punchy · 280 chars · hook first","WhatsApp":"Conversational · feels like a friend","Email":"Subject line is everything · plain text converts","SMS":"Under 160 chars · include opt-out"},
  },
  sales: { label:"Sales Agent", icon:"ti-trending-up", color:"#1D9E75", desc:"Lead pipeline, qualification, demos, proposals and close scripts" },
  support: { label:"Support Agent", icon:"ti-headset", color:"#378ADD", desc:"After-sale onboarding, ticket resolution, retention and NPS" },
  strategy: { label:"Strategy Agent", icon:"ti-brain", color:"#7C3AED", desc:"Business model, niche selection, pricing, positioning and 90-day growth" },
  content: { label:"Content Agent", icon:"ti-writing", color:"#D4537E", desc:"Blog posts, social copy, email newsletters, SEO and video scripts" },
  ops: { label:"Ops Agent", icon:"ti-settings-automation", color:"#5F5E5A", desc:"MRR tracking, Stripe reconciliation, burn rate and P&L" },
  finance: { label:"Finance Agent", icon:"ti-chart-line", color:"#1D9E75", desc:"Unit economics, forecasting, fundraising readiness and cash flow" },
  hr: { label:"HR Agent", icon:"ti-users", color:"#7C3AED", desc:"Hiring pipeline, job descriptions, culture building and team growth" },
  hrops: { label:"HR Ops Agent", icon:"ti-user-check", color:"#D4537E", desc:"Onboarding workflows, performance reviews and retention systems" },
  security: { label:"Security Agent", icon:"ti-shield-lock", color:"#DC2626", desc:"Vulnerability scanning, API key hygiene and compliance checks" },
  compliance: { label:"Compliance Agent", icon:"ti-certificate", color:"#F59E0B", desc:"GDPR, CCPA, PCI-DSS and SaaS legal compliance" },
  analytics: { label:"Analytics Agent", icon:"ti-chart-bar", color:"#0EA5E9", desc:"Funnel analysis, cohort data, activation and retention metrics" },
  social: { label:"Social Agent", icon:"ti-share", color:"#D4537E", desc:"Social calendar, posting schedule, community management" },
  product: { label:"Product Agent", icon:"ti-package", color:"#378ADD", desc:"Roadmap, feature prioritisation, user feedback and sprint planning" },
  tech: { label:"Tech Agent", icon:"ti-code", color:"#378ADD", desc:"Architecture decisions, code review, deployment and API integrations" },
}

// ── SAMPLE leads shown when CRM is empty ─────────────────────────────────────
const SAMPLE_LEADS = [
  { id:"s1", name:"Sarah Chen",     role:"Freelance designer",    email:"sarah@example.com", phone:"+1-214-555-0101", status:"hot",   score:92, source:"LinkedIn",    lastTouch:"2h ago",  value:"Pro",     stage:"Closed ✓",  linkedin:"", company:"",   notes:"", tags:[], assignedAgent:"marketing" },
  { id:"s2", name:"Mike Rodriguez", role:"HVAC contractor owner",  email:"mike@example.com",  phone:"+1-972-555-0202", status:"warm",  score:74, source:"Instagram",   lastTouch:"1d ago",  value:"Starter", stage:"Outreach",  linkedin:"", company:"",   notes:"", tags:[], assignedAgent:"marketing" },
  { id:"s3", name:"Priya Nair",     role:"Business consultant",    email:"priya@example.com", phone:"+1-469-555-0303", status:"hot",   score:88, source:"Referral",    lastTouch:"4h ago",  value:"Agency",  stage:"Proposal",  linkedin:"", company:"",   notes:"", tags:[], assignedAgent:"sales" },
  { id:"s4", name:"Tom Walsh",      role:"Real estate agent",      email:"tom@example.com",   phone:"+1-817-555-0404", status:"cold",  score:31, source:"X / Twitter", lastTouch:"5d ago",  value:"Starter", stage:"Prospect",  linkedin:"", company:"",   notes:"", tags:[], assignedAgent:"marketing" },
  { id:"s5", name:"Angela Brooks",  role:"Marketing freelancer",   email:"angela@example.com",phone:"+1-214-555-0505", status:"warm",  score:67, source:"Email",       lastTouch:"6h ago",  value:"Pro",     stage:"Outreach",  linkedin:"", company:"",   notes:"", tags:[], assignedAgent:"marketing" },
  { id:"s6", name:"James Park",     role:"E-commerce seller",      email:"james@example.com", phone:"+1-972-555-0606", status:"demo",  score:81, source:"LinkedIn",    lastTouch:"1h ago",  value:"Pro",     stage:"Demo",      linkedin:"", company:"",   notes:"", tags:[], assignedAgent:"sales" },
]

const PIPELINE = [
  {stage:"Prospect",  color:"#F1EFE8",txt:"#5F5E5A"},
  {stage:"Outreach",  color:"#FAEEDA",txt:"#633806"},
  {stage:"Replied",   color:"#EFF6FF",txt:"#1E40AF"},
  {stage:"Demo",      color:"#E6F1FB",txt:"#0C447C"},
  {stage:"Proposal",  color:"#F5F3FF",txt:"#4C1D95"},
  {stage:"Closed ✓",  color:"#E1F5EE",txt:"#085041"},
]

const HR_JOBS = [
  {id:1,title:"AI Product Engineer",type:"Full-time",status:"Open",apps:12,posted:"3d ago"},
  {id:2,title:"Growth Marketer",type:"Contract",status:"Open",apps:7,posted:"1w ago"},
  {id:3,title:"Customer Success Mgr",type:"Full-time",status:"Paused",apps:24,posted:"2w ago"},
]

const N = "#0A0E1A", AMBER = "#EF9F27"

export default function AgentHub() {
  const [activeCxo, setActiveCxo] = useState("ceo")
  const [activeAgent, setActiveAgent] = useState(null)
  const [chatMsgs, setChatMsgs] = useState({})
  const [chatInput, setChatInput] = useState("")
  const [sending, setSending] = useState(false)
  const [activeChannel, setActiveChannel] = useState("LinkedIn")
  const [selectedLeads, setSelectedLeads] = useState([])
  const [offer, setOffer] = useState("Start with SIXXAB — autonomous startup platform from $49.50/mo. Founding member rate locked forever.")
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(null)
  const [pipelineFilter, setPipelineFilter] = useState("all")
  const bottomRef = useRef(null)

  // ── Send email via Resend API ──────────────────────────────────────────────
  async function sendEmail(to, subject, body, type="outreach") {
    if (!to || !to.includes("@")) {
      alert("This contact has no email address. Add one in CRM first.")
      return false
    }
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body, type }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Send failed")
      alert(`✓ Email sent to ${to}`)
      return true
    } catch(e) {
      alert("Email failed: " + e.message)
      return false
    }
  }

  const cxo = CXOS.find(c => c.id === activeCxo)
  const currentAgent = activeAgent ? AGENTS[activeAgent] : null
  const chatKey = activeAgent || activeCxo
  const msgs = chatMsgs[chatKey] || [{role:"assistant",content:activeAgent ? `${currentAgent?.label} ready. ${currentAgent?.desc}. How can I help?` : `${cxo?.title} command center active. I'm your AI advisor for ${cxo?.name} responsibilities. What's the priority today?`}]

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}) }, [msgs, sending])

  async function sendMsg() {
    if (!chatInput.trim() || sending) return
    const text = chatInput.trim()
    setChatInput("")
    const role = activeAgent ? AGENTS[activeAgent]?.chatRole || "" : cxo?.chatRole || ""
    const next = [...msgs, {role:"user",content:text}]
    setChatMsgs(p => ({...p,[chatKey]:next}))
    setSending(true)
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages: [{role:"user",content:`[System: ${role}]\n\n${text}`}],
        }),
      })
      const d = await res.json()
      setChatMsgs(p => ({...p,[chatKey]:[...next,{role:"assistant",content:d.reply||"I'm here — what do you need?"}]}))
    } catch {
      setChatMsgs(p => ({...p,[chatKey]:[...next,{role:"assistant",content:"Network error — please retry."}]}))
    }
    setSending(false)
  }

  async function generateScripts() {
    setGenerating(true); setGenerated(null)
    const leads = LEADS.filter(l => selectedLeads.map(String).includes(String(l.id)))
    try {
      const res = await fetch("/api/marketing-agent", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contacts: leads.map(l => ({name:l.name,role:l.role,platform:activeChannel,context:`Lead score: ${l.score}. Status: ${l.status}. Source: ${l.source}. Offer: ${offer}`})) }),
      })
      const d = await res.json()
      setGenerated(d.messages || leads.map(l => ({
        name:l.name, platform:activeChannel,
        message:`Hi ${l.name.split(" ")[0]}, I saw you're in ${l.role}. I built something that gives you a complete AI business system for $24.50/mo — strategy, launch, and marketing in one box.\n\nFounding member rate (50% off) expires at public launch. Worth 10 mins of your time?\n\nstartupsinabox.com`,
        followUp:`Hey ${l.name.split(" ")[0]}, just following up — did you get a chance to look at SIXXAB? Happy to do a quick 15-min demo.`,
        bestTime: activeChannel==="LinkedIn"?"Tue–Thu 8–10am":"Weekday mornings",
      })))
    } catch { setGenerated([]) }
    setGenerating(false)
  }

  function copyText(t) { navigator.clipboard.writeText(t) }

  const statusColor = {hot:"#E1F5EE",warm:"#FAEEDA",cold:"#F1F5F9",demo:"#EEF2FF"}
  const statusTxt = {hot:"#085041",warm:"#633806",cold:"#64748B",demo:"#3D52A0"}

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;overflow:hidden}
        ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .fadeIn{animation:fadeIn .25s ease both}
        .pulse{animation:pulse 2s infinite}
        textarea,input,select{font-family:inherit}
        .sbtn{padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:opacity .15s}
        .sbtn:hover{opacity:.88}
        .sbtn:disabled{opacity:.5;cursor:not-allowed}
        .gbtn{padding:7px 13px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;background:transparent;border:1px solid #E2E8F0;color:#64748B;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s}
        .gbtn:hover{background:#F8F9FA;border-color:#CBD5E1}
        .chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:500;padding:4px 10px;border-radius:20px;cursor:pointer;transition:all .15s}
      `}</style>

      <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside style={{width:230,background:N,display:"flex",flexDirection:"column",flexShrink:0}}>
          {/* Logo */}
          <div style={{padding:"16px 14px 12px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <svg width="26" height="26" viewBox="0 0 72 72">
                <rect x="1.5" y="1.5" width="69" height="69" rx="12" fill="none" stroke={AMBER} strokeWidth="2.5"/>
                <text x="7" y="54" fontFamily="Georgia" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
                <text x="35" y="54" fontFamily="Georgia" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
              </svg>
              <div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:"#F5F5F0",letterSpacing:2,lineHeight:1}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
                <div style={{fontFamily:"'DM Mono'",fontSize:8,color:"#444",letterSpacing:".1em"}}>CXO command center</div>
              </div>
            </div>
          </div>

          {/* CXO nav */}
          <nav style={{flex:1,padding:"8px 8px",overflowY:"auto"}}>
            <div style={{fontSize:9,fontWeight:600,color:"#5F5E5A",letterSpacing:".1em",textTransform:"uppercase",padding:"6px 8px 5px"}}>CXO suite</div>
            {CXOS.map(c => (
              <button key={c.id} onClick={()=>{setActiveCxo(c.id);setActiveAgent(null)}}
                style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 8px",borderRadius:8,border:"none",background:activeCxo===c.id&&!activeAgent?"rgba(255,255,255,.08)":"transparent",cursor:"pointer",marginBottom:1,transition:"background .15s"}}>
                <div style={{width:28,height:28,borderRadius:7,background:activeCxo===c.id&&!activeAgent?c.color:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .15s"}}>
                  <i className={`ti ${c.icon}`} style={{fontSize:13,color:activeCxo===c.id&&!activeAgent?N:"rgba(255,255,255,.4)"}} aria-hidden="true"/>
                </div>
                <div style={{flex:1,textAlign:"left",minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,color:activeCxo===c.id&&!activeAgent?c.color:"rgba(255,255,255,.7)",letterSpacing:.3}}>{c.title}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,.3)",lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name.replace("Chief ","").replace(" Officer","")}</div>
                </div>
              </button>
            ))}

            {/* Sub-agents under active CXO */}
            {cxo?.agents?.length > 0 && <>
              <div style={{fontSize:9,fontWeight:600,color:"#5F5E5A",letterSpacing:".1em",textTransform:"uppercase",padding:"10px 8px 5px"}}>Agents under {cxo.title}</div>
              {cxo.agents.map(aid => {
                const a = AGENTS[aid]; if (!a) return null
                return (
                  <button key={aid} onClick={()=>setActiveAgent(aid)}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"6px 8px 6px 16px",borderRadius:7,border:"none",background:activeAgent===aid?"rgba(255,255,255,.08)":"transparent",cursor:"pointer",marginBottom:1,transition:"background .15s"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:activeAgent===aid?a.color:"rgba(255,255,255,.2)",flexShrink:0}}/>
                    <div style={{fontSize:11,color:activeAgent===aid?a.color:"rgba(255,255,255,.5)"}}>{a.label}</div>
                  </button>
                )
              })}
            </>}
          </nav>

          <div style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.07)"}}>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"rgba(255,255,255,.35)"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#1D9E75"}} className="pulse"/>
              All systems online
            </div>
            <div style={{display:"flex",gap:8,marginTop:6}}>
              <a href="/" style={{fontSize:10,color:"rgba(255,255,255,.25)",textDecoration:"none"}}>Home</a>
              <a href="/coach" style={{fontSize:10,color:"rgba(255,255,255,.25)",textDecoration:"none"}}>Coach</a>
            </div>
          </div>
        </aside>

        {/* ── MAIN ────────────────────────────────────────────────────────── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* Header */}
          <header style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"0 20px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:currentAgent?currentAgent.color:cxo?.color,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <i className={`ti ${currentAgent?currentAgent.icon:cxo?.icon}`} style={{fontSize:15,color:currentAgent||cxo?.id==="ciso"?"#fff":N}} aria-hidden="true"/>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:N}}>{currentAgent?currentAgent.label:`${cxo?.title} — ${cxo?.name}`}</div>
                <div style={{fontSize:11,color:"#94A3B8"}}>{currentAgent?currentAgent.desc:cxo?.desc}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {activeAgent && <button className="gbtn" style={{fontSize:11}} onClick={()=>setActiveAgent(null)}>← Back to {cxo?.title}</button>}
              <span style={{fontSize:11,fontWeight:500,padding:"3px 10px",borderRadius:10,background:currentAgent?currentAgent.color+"22":cxo?.bg,color:currentAgent?currentAgent.color:cxo?.txt,display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:currentAgent?.color||cxo?.color}} className="pulse"/>
                Active
              </span>
            </div>
          </header>

          {/* KPI strip */}
          <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"10px 20px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,flexShrink:0}}>
            {(cxo?.kpis||[]).map((k,i) => (
              <div key={i} style={{background:"#F8F9FA",borderRadius:9,padding:"9px 12px"}}>
                <div style={{fontSize:10.5,color:"#94A3B8",marginBottom:2}}>{k.l}</div>
                <div style={{fontSize:19,fontWeight:600,color:N}}>{k.v}</div>
              </div>
            ))}
          </div>

          {/* Body */}
          <div style={{flex:1,overflow:"auto",padding:16,display:"grid",gridTemplateColumns:"1fr 360px",gap:14}}>

            {/* LEFT panel */}
            <div style={{display:"flex",flexDirection:"column",gap:12,minWidth:0}}>

              {/* CEO — Strategy overview */}
              {activeCxo==="ceo" && !activeAgent && <>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Active growth initiatives</div>
                  {[
                    {t:"DFW warm outreach — 20 founders",prog:65,c:AMBER,s:"Running"},
                    {t:"AppSumo marketplace application",prog:30,c:"#7C3AED",s:"Planning"},
                    {t:"Product Hunt launch — Day 7",prog:80,c:"#1D9E75",s:"Ready"},
                    {t:"LinkedIn content flywheel",prog:55,c:"#D4537E",s:"Running"},
                  ].map((x,i) => <div key={i} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <span style={{fontSize:13,fontWeight:500,color:N}}>{x.t}</span>
                      <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:6,background:x.s==="Running"?"#E1F5EE":x.s==="Ready"?"#EEF2FF":"#FAEEDA",color:x.s==="Running"?"#085041":x.s==="Ready"?"#3D52A0":"#633806"}}>{x.s}</span>
                    </div>
                    <div style={{height:5,background:"#F1F5F9",borderRadius:3}}><div style={{height:"100%",width:`${x.prog}%`,background:x.c,borderRadius:3}}/></div>
                  </div>)}
                </div>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>90-day revenue forecast</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                    {[{l:"Month 1",v:"$1,470",s:"31 subs"},{l:"Month 2",v:"$3,430",s:"70 subs"},{l:"Month 3",v:"$6,860",s:"140 subs"}].map((r,i) => (
                      <div key={i} style={{background:"#F8F9FA",borderRadius:10,padding:"12px 10px",textAlign:"center"}}>
                        <div style={{fontSize:11,color:"#94A3B8",marginBottom:4}}>{r.l}</div>
                        <div style={{fontSize:20,fontWeight:700,color:AMBER}}>{r.v}</div>
                        <div style={{fontSize:11,color:"#94A3B8"}}>{r.s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>}

              {/* CMO / Marketing agent */}
              {(activeCxo==="cmo"&&!activeAgent)||activeAgent==="marketing" ? <>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Select channel</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                    {Object.entries(AGENTS.marketing.channelIcons).map(([ch,ic]) => (
                      <button key={ch} className="chip" onClick={()=>setActiveChannel(ch)}
                        style={{background:activeChannel===ch?(ch==="LinkedIn"?"#0A66C2":ch==="Instagram"?"#E1306C":ch==="X / Twitter"?"#000":ch==="WhatsApp"?"#25D366":ch==="Email"?AMBER:"#8B5CF6"):"#F8F9FA",
                               color:activeChannel===ch?"#fff":"#64748B",border:`1px solid ${activeChannel===ch?"transparent":"#E2E8F0"}`}}>
                        <i className={`ti ${ic}`} style={{fontSize:12}} aria-hidden="true"/>{ch}
                      </button>
                    ))}
                  </div>
                  {AGENTS.marketing.channelHints[activeChannel] && (
                    <div style={{fontSize:11.5,color:"#64748B",background:"#F8F9FA",borderRadius:7,padding:"7px 10px",display:"flex",gap:5}}>
                      <i className="ti ti-info-circle" style={{fontSize:13,flexShrink:0,marginTop:1}} aria-hidden="true"/>
                      {AGENTS.marketing.channelHints[activeChannel]}
                    </div>
                  )}
                </div>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em"}}>Contacts ({selectedLeads.length} selected)</div>
                      <div style={{display:"flex",gap:6}}>
                        <a href="/crm" style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,background:"#EFF6FF",border:"1px solid #BFDBFE",fontSize:10.5,fontWeight:500,color:"#1D4ED8",textDecoration:"none"}}>
                          <i className="ti ti-address-book" style={{fontSize:11}} aria-hidden="true"/>Manage CRM
                        </a>
                        <button onClick={()=>setShowCrmPicker(!showCrmPicker)} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,background:"#FFFBF2",border:"1px solid rgba(239,159,39,.4)",fontSize:10.5,fontWeight:500,color:"#633806",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                          <i className="ti ti-brand-linkedin" style={{fontSize:11,color:"#0A66C2"}} aria-hidden="true"/>Add from CRM
                        </button>
                      </div>
                    </div>
                    {showCrmPicker && (
                      <div style={{border:"1px solid #E2E8F0",borderRadius:10,background:"#fff",marginTop:6,overflow:"hidden",maxHeight:220,display:"flex",flexDirection:"column"}}>
                        <div style={{padding:"8px 10px",borderBottom:"1px solid #F1F5F9"}}>
                          <input value={crmSearch} onChange={e=>setCrmSearch(e.target.value)}
                            placeholder="Search CRM contacts…"
                            style={{width:"100%",border:"1px solid #E2E8F0",borderRadius:7,padding:"5px 9px",fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}/>
                        </div>
                        <div style={{overflowY:"auto",flex:1}}>
                          {crmContacts.length === 0 ? (
                            <div style={{padding:"16px",textAlign:"center",fontSize:12,color:"#94A3B8"}}>
                              No CRM contacts yet. <a href="/crm" style={{color:"#0A66C2"}}>Import from LinkedIn →</a>
                            </div>
                          ) : crmContacts.filter(c => !crmSearch || `${c.name} ${c.role} ${c.company}`.toLowerCase().includes(crmSearch.toLowerCase())).slice(0,10).map(c => (
                            <div key={c.id} onClick={()=>addContactFromCRM(crmToLead(c))}
                              style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",cursor:"pointer",borderBottom:"1px solid #F8F9FA",background:selectedLeads.map(String).includes(String(c.id))?"#FFFBF2":"transparent"}}
                              onMouseOver={e=>e.currentTarget.style.background="#F8F9FA"}
                              onMouseOut={e=>e.currentTarget.style.background=selectedLeads.map(String).includes(String(c.id))?"#FFFBF2":"transparent"}>
                              <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(239,159,39,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,color:"#EF9F27",flexShrink:0}}>
                                {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                              </div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:12,fontWeight:500,color:"#0A0E1A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                                <div style={{fontSize:10,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.role||c.company}</div>
                              </div>
                              {c.linkedin && <i className="ti ti-brand-linkedin" style={{fontSize:12,color:"#0A66C2",flexShrink:0}} aria-hidden="true"/>}
                              {selectedLeads.map(String).includes(String(c.id)) && <span style={{fontSize:10,color:"#1D9E75",fontWeight:600,flexShrink:0}}>✓</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{display:"flex",gap:6}}>
                      {["all","hot","warm","cold"].map(f => (
                        <button key={f} className="chip" onClick={()=>setPipelineFilter(f)}
                          style={{background:pipelineFilter===f?"#0A0E1A":"#F8F9FA",color:pipelineFilter===f?"#fff":"#64748B",border:"1px solid #E2E8F0",fontSize:10}}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {LEADS.filter(l=>pipelineFilter==="all"||l.stage===pipelineFilter||l.status===pipelineFilter).map(l => {
                      const sel = selectedLeads.map(String).includes(String(l.id))
                      return (
                        <div key={l.id} onClick={()=>setSelectedLeads(sel?selectedLeads.filter(x=>String(x)!==String(l.id)):[...selectedLeads,l.id])}
                          style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderRadius:9,border:`1px solid ${sel?AMBER:"#E8ECF4"}`,background:sel?"#FFFBF2":"#F8F9FA",cursor:"pointer",transition:"all .15s"}}>
                          <div style={{width:30,height:30,borderRadius:"50%",background:sel?AMBER:N,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>{l.name.split(" ").map(w=>w[0]).join("")}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12.5,fontWeight:500,color:N}}>{l.name}</div>
                            <div style={{fontSize:11,color:"#94A3B8"}}>{l.role} · {l.source}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:statusColor[l.status]||"#F1F5F9",color:statusTxt[l.status]||"#64748B"}}>{l.status}</div>
                            <div style={{fontSize:10,fontWeight:600,color:l.score>=80?"#1D9E75":l.score>=60?"#F59E0B":"#EF4444"}}>{l.score}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:7}}>Offer to embed</div>
                  <textarea value={offer} onChange={e=>setOffer(e.target.value)} rows={2}
                    style={{width:"100%",border:"1px solid #E2E8F0",borderRadius:8,padding:"9px 11px",fontSize:13,background:"#F8F9FA",color:N,resize:"none",lineHeight:1.5}}/>
                </div>
                <button className="sbtn" onClick={generateScripts} disabled={generating||selectedLeads.length===0}
                  style={{background:AMBER,color:N,padding:13,borderRadius:10,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {generating?<><div style={{width:16,height:16,border:"2px solid rgba(10,14,26,.3)",borderTopColor:N,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Generating {selectedLeads.length} scripts…</>
                    :<><i className="ti ti-sparkles" aria-hidden="true"/>Generate {selectedLeads.length} {activeChannel} scripts →</>}
                </button>
                {generated?.map((m,i) => (
                  <div key={i} className="fadeIn" style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 13px",background:"#F8F9FA",borderBottom:"1px solid #E8ECF4"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:N,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff"}}>
                          {m.name?.split(" ").map(w=>w[0]).join("")}
                        </div>
                        <div><div style={{fontSize:12.5,fontWeight:500,color:N}}>{m.name}</div><div style={{fontSize:10,color:"#94A3B8"}}>via {m.platform} · {m.bestTime}</div></div>
                      </div>
                      <button className="gbtn" style={{fontSize:11}} onClick={()=>copyText(m.message)}><i className="ti ti-copy" style={{fontSize:11}} aria-hidden="true"/> Copy</button>
                    </div>
                    <div style={{padding:12}}>
                      <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",marginBottom:4}}>Message</div>
                      <div style={{fontSize:12.5,color:N,lineHeight:1.7,whiteSpace:"pre-wrap",background:"#F8F9FA",borderRadius:7,padding:"9px 11px",marginBottom:8}}>{m.message}</div>
                      <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",marginBottom:4}}>Follow-up (3 days)</div>
                      <div style={{fontSize:12,color:"#64748B",lineHeight:1.65,whiteSpace:"pre-wrap",background:"#FFFBF2",borderRadius:7,padding:"8px 11px",border:"1px solid rgba(239,159,39,.2)"}}>{m.followUp}</div>
                    </div>
                  </div>
                ))}
              </> : null}

              {/* COO / Sales agent — Pipeline */}
              {(activeCxo==="coo"&&!activeAgent)||activeAgent==="sales" ? <>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{fontSize:13,fontWeight:600,color:N}}>Pipeline — {LEADS.length} contacts · ${LEADS.reduce((a,l)=>a+(l.value==="Pro"?99.50:l.value==="Agency"?175:l.value==="Enterprise"?350:49.50),0).toFixed(2)} potential MRR</div>
                    <a href="/crm" style={{fontSize:11.5,color:"#0A66C2",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4}}>
                      <i className="ti ti-external-link" style={{fontSize:11}} aria-hidden="true"/>Open full CRM
                    </a>
                  </div>
                  <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
                    {PIPELINE.map((p,i) => {
                      const stageLeads = LEADS.filter(l => l.stage === p.stage)
                      return (
                        <div key={i} style={{minWidth:140,flex:1,background:p.color,borderRadius:10,padding:12}}>
                          <div style={{fontSize:11,fontWeight:600,color:p.txt,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>
                            {p.stage} ({stageLeads.length})
                          </div>
                          {stageLeads.length === 0 && (
                            <div style={{fontSize:10,color:p.txt,opacity:.5,padding:"6px 0"}}>No contacts</div>
                          )}
                          {stageLeads.map(l => (
                            <div key={l.id} style={{background:"rgba(255,255,255,.7)",borderRadius:7,padding:"8px 9px",marginBottom:6}}>
                              <div style={{fontSize:12,fontWeight:500,color:N}}>{l.name}</div>
                              <div style={{fontSize:10,color:"#94A3B8"}}>{l.role}</div>
                              <div style={{fontSize:10,fontWeight:600,color:"#1D9E75",marginTop:3}}>{l.value}</div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:10}}>Hot leads — act today</div>
                  {LEADS.filter(l=>l.status==="hot"||l.status==="demo"||l.score>=80).map(l => (
                    <div key={l.id} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 0",borderBottom:"1px solid #F1F5F9"}}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#085041"}}>{l.name.split(" ").map(w=>w[0]).join("")}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500,color:N}}>{l.name}</div>
                        <div style={{fontSize:11,color:"#94A3B8"}}>{l.role} · {l.email}</div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button className="gbtn" style={{fontSize:11,padding:"5px 10px"}}>Demo</button>
                        <button className="sbtn" style={{background:"#1D9E75",color:"#fff",padding:"5px 11px",fontSize:11}}>Propose</button>
                      </div>
                    </div>
                  ))}
                </div>
              </> : null}

              {/* COO / Support agent */}
              {activeAgent==="support" && <>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{fontSize:13,fontWeight:600,color:N}}>Support tickets</div>
                    <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:"#FEF3C7",color:"#92400E",fontWeight:600}}>3 open</span>
                  </div>
                  {[{id:"#T-001",name:"Sarah Chen",issue:"Can't access coach page",status:"open",priority:"high",time:"2h ago"},
                    {id:"#T-002",name:"Mike R.",issue:"Stripe receipt question",status:"resolved",priority:"low",time:"1d ago"},
                    {id:"#T-003",name:"Priya N.",issue:"How to use /agents page",status:"open",priority:"medium",time:"4h ago"},
                  ].map((t,i) => (
                    <div key={i} style={{border:`1px solid ${t.status==="open"?"#FECACA":"#D1FAE5"}`,borderRadius:10,padding:12,marginBottom:8,background:t.status==="open"?"#FEF2F2":"#F0FDF4"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <div style={{display:"flex",gap:7,alignItems:"center"}}>
                          <span style={{fontFamily:"'DM Mono'",fontSize:11,color:"#94A3B8"}}>{t.id}</span>
                          <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:6,background:t.priority==="high"?"#FEE2E2":t.priority==="medium"?"#FEF3C7":"#F1F5F9",color:t.priority==="high"?"#991B1B":t.priority==="medium"?"#92400E":"#64748B"}}>{t.priority}</span>
                        </div>
                        <span style={{fontSize:11,color:"#94A3B8"}}>{t.time}</span>
                      </div>
                      <div style={{fontSize:13,fontWeight:500,color:N,marginBottom:3}}>{t.name}</div>
                      <div style={{fontSize:12,color:"#64748B",marginBottom:t.status==="open"?8:0}}>{t.issue}</div>
                      {t.status==="open" && <div style={{display:"flex",gap:6}}>
                        <button className="gbtn" style={{fontSize:11}}>View</button>
                        <button className="sbtn" style={{background:"#378ADD",color:"#fff",padding:"5px 11px",fontSize:11}}>
                          <i className="ti ti-sparkles" style={{fontSize:11}} aria-hidden="true"/> AI reply
                        </button>
                      </div>}
                    </div>
                  ))}
                </div>
              </>}

              {/* COO / HR agent */}
              {(activeAgent==="hr"||activeAgent==="hrops") && <>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:12}}>{activeAgent==="hr"?"Open positions":"Onboarding pipeline"}</div>
                  {activeAgent==="hr" ? HR_JOBS.map((j,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #F1F5F9"}}>
                      <div style={{width:36,height:36,borderRadius:8,background:"#F5F3FF",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <i className="ti ti-user-plus" style={{fontSize:16,color:"#7C3AED"}} aria-hidden="true"/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500,color:N}}>{j.title}</div>
                        <div style={{fontSize:11,color:"#94A3B8"}}>{j.type} · {j.apps} applicants · Posted {j.posted}</div>
                      </div>
                      <span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:8,background:j.status==="Open"?"#E1F5EE":"#FEF3C7",color:j.status==="Open"?"#085041":"#92400E"}}>{j.status}</span>
                      <button className="gbtn" style={{fontSize:11}}>Review</button>
                    </div>
                  )) : ["Alex Kim — Onboarding week 1","Jordan Lee — Onboarding week 2","Sam Patel — 30-day review due"].map((p,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #F1F5F9"}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:"#EEF2FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#3D52A0"}}>{p.split(" ")[0][0]+p.split(" ")[1][0]}</div>
                      <div style={{flex:1,fontSize:13,fontWeight:500,color:N}}>{p}</div>
                      <button className="sbtn" style={{background:"#7C3AED",color:"#fff",padding:"5px 12px",fontSize:11}}>AI checklist</button>
                    </div>
                  ))}
                </div>
              </>}

              {/* CFO / Finance */}
              {activeCxo==="cfo" && !activeAgent && <>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:12}}>Unit economics</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                    {[{l:"MRR",v:"$1,470",c:"#1D9E75"},{l:"ARR",v:"$17,640",c:"#1D9E75"},{l:"CAC",v:"$0",c:"#7C3AED"},{l:"LTV",v:"$294",c:"#EF9F27"},{l:"LTV:CAC",v:"∞",c:"#1D9E75"},{l:"Payback period",v:"Immediate",c:"#1D9E75"}].map((m,i) => (
                      <div key={i} style={{background:"#F8F9FA",borderRadius:10,padding:12}}>
                        <div style={{fontSize:11,color:"#94A3B8",marginBottom:4}}>{m.l}</div>
                        <div style={{fontSize:20,fontWeight:700,color:m.c}}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Recent transactions</div>
                  {[{n:"Angela Brooks",p:"Pro",a:"$24.50",t:"2h ago"},{n:"Marcus T.",p:"Starter",a:"$14.50",t:"Yesterday"},{n:"Priya Nair",p:"Agency",a:"$34.50",t:"2d ago"}].map((t,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 0",borderBottom:"1px solid #F1F5F9"}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#085041"}}>{t.n.split(" ").map(w=>w[0]).join("")}</div>
                      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:N}}>{t.n}</div><div style={{fontSize:11,color:"#94A3B8"}}>{t.p} · {t.t}</div></div>
                      <div style={{fontSize:14,fontWeight:700,color:"#1D9E75"}}>{t.a}</div>
                    </div>
                  ))}
                </div>
              </>}

              {/* CTO */}
              {activeCxo==="cto" && !activeAgent && <>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:12}}>Tech stack health</div>
                  {[{n:"Next.js 14 on Vercel",s:"Healthy",v:"14.2.29",c:"#E1F5EE",t:"#085041"},{n:"Claude API (Anthropic)",s:"Healthy",v:"claude-sonnet-4-6",c:"#E1F5EE",t:"#085041"},{n:"Stripe Payments",s:"Healthy",v:"API v2",c:"#E1F5EE",t:"#085041"},{n:"Resend Email",s:"Check domain",v:"RESEND_DOMAIN_VERIFIED",c:"#FEF3C7",t:"#92400E"},{n:"Auth System",s:"In-memory",v:"Upgrade to Supabase",c:"#FEF3C7",t:"#92400E"}].map((x,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #F1F5F9"}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:x.c==="#E1F5EE"?"#1D9E75":"#F59E0B",flexShrink:0}}/>
                      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:N}}>{x.n}</div><div style={{fontFamily:"'DM Mono'",fontSize:10,color:"#94A3B8"}}>{x.v}</div></div>
                      <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:6,background:x.c,color:x.t}}>{x.s}</span>
                    </div>
                  ))}
                </div>
              </>}

              {/* CISO */}
              {activeCxo==="ciso" && !activeAgent && <>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:12}}>Security checklist</div>
                  {[{t:"STRIPE_SECRET_KEY in Vercel env (not committed)",done:true},{t:"RESEND_API_KEY in Vercel env (not committed)",done:true},{t:"ANTHROPIC_API_KEY in Vercel env",done:true},{t:"HTTPS enforced on startupsinabox.com",done:true},{t:"GDPR privacy policy live at /privacy",done:false},{t:"Terms of service at /terms",done:false},{t:"Auth upgraded from in-memory to Supabase",done:false},{t:"Rate limiting on /api/auth and /api/chat",done:false}].map((x,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 0",borderBottom:"1px solid #F1F5F9"}}>
                      <i className={`ti ${x.done?"ti-circle-check":"ti-circle-x"}`} style={{fontSize:17,color:x.done?"#1D9E75":"#EF4444",flexShrink:0}} aria-hidden="true"/>
                      <span style={{fontSize:13,color:x.done?N:"#64748B"}}>{x.t}</span>
                    </div>
                  ))}
                </div>
              </>}

              {/* CDO */}
              {activeCxo==="cdo" && !activeAgent && <>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:12}}>Funnel analytics</div>
                  {[{s:"Visitors",n:1240,pct:100},{s:"Signups",n:247,pct:19.9},{s:"Activated (used coach)",n:183,pct:74.1},{s:"Converted to paid",n:31,pct:8.5},{s:"Still active after 30d",n:30,pct:96.8}].map((f,i) => (
                    <div key={i} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:13,fontWeight:500,color:N}}>{f.s}</span>
                        <span style={{fontSize:12,fontWeight:600,color:"#0EA5E9"}}>{f.n.toLocaleString()} ({f.pct}%)</span>
                      </div>
                      <div style={{height:6,background:"#F1F5F9",borderRadius:3}}>
                        <div style={{height:"100%",width:`${f.pct}%`,background:"#0EA5E9",borderRadius:3}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </>}

              {/* Default — content calendar for CMO sub-agents */}
              {activeCxo==="cmo" && (activeAgent==="content"||activeAgent==="social") && <>
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",padding:16}}>
                  <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:12}}>Content calendar — this week</div>
                  {[{d:"Mon",p:"LinkedIn",t:"Launch post — SIXXAB is live",s:"Published"},{d:"Tue",p:"X / Twitter",t:"48-hour framework thread",s:"Scheduled"},{d:"Wed",p:"LinkedIn",t:"First Stripe payment screenshot",s:"Draft"},{d:"Thu",p:"Instagram",t:"Behind the scenes",s:"Draft"},{d:"Fri",p:"Email",t:"Weekly founder digest",s:"Draft"},{d:"Sat",p:"LinkedIn",t:"Founding member offer expires soon",s:"Queued"}].map((c,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 0",borderBottom:"1px solid #F1F5F9"}}>
                      <div style={{width:28,fontFamily:"'DM Mono'",fontSize:11,color:"#94A3B8",flexShrink:0}}>{c.d}</div>
                      <div style={{width:8,height:8,borderRadius:"50%",background:c.p==="LinkedIn"?"#0A66C2":c.p.includes("Twitter")?"#000":c.p==="Instagram"?"#E1306C":c.p==="Email"?AMBER:"#8B5CF6",flexShrink:0}}/>
                      <div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:500,color:N}}>{c.t}</div><div style={{fontSize:11,color:"#94A3B8"}}>{c.p}</div></div>
                      <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:6,background:c.s==="Published"?"#E1F5EE":c.s==="Scheduled"?"#EEF2FF":c.s==="Queued"?"#FAEEDA":"#F1F5F9",color:c.s==="Published"?"#085041":c.s==="Scheduled"?"#3D52A0":c.s==="Queued"?"#633806":"#64748B"}}>{c.s}</span>
                      {c.s!=="Published"&&<button className="gbtn" style={{fontSize:11}}>Generate</button>}
                    </div>
                  ))}
                </div>
              </>}

            </div>

            {/* RIGHT: AI Chat ─────────────────────────────────────────────── */}
            <div style={{background:"#fff",borderRadius:12,border:"1px solid #E8ECF4",display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
              <div style={{padding:"11px 13px",borderBottom:"1px solid #E8ECF4",display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
                <svg width="24" height="24" viewBox="0 0 72 72">
                  <rect x="1.5" y="1.5" width="69" height="69" rx="12" fill="none" stroke={AMBER} strokeWidth="2.5"/>
                  <text x="7" y="54" fontFamily="Georgia" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
                  <text x="35" y="54" fontFamily="Georgia" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
                </svg>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:600,color:N,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {currentAgent?`${currentAgent.label}`:`${cxo?.title} AI Advisor`}
                  </div>
                  <div style={{fontSize:10,color:"#94A3B8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {currentAgent?currentAgent.desc:cxo?.desc}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#94A3B8"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:"#1D9E75"}} className="pulse"/>
                </div>
              </div>

              <div style={{flex:1,overflowY:"auto",padding:"12px 12px 6px",display:"flex",flexDirection:"column",gap:10}}>
                {msgs.map((m,i) => (
                  <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row"}} className="fadeIn">
                    <div style={{width:24,height:24,borderRadius:m.role==="assistant"?6:"50%",flexShrink:0,background:m.role==="assistant"?AMBER:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:m.role==="assistant"?N:"#64748B"}}>
                      {m.role==="assistant"?"SX":"You"}
                    </div>
                    <div style={{maxWidth:"82%",padding:"8px 11px",borderRadius:m.role==="user"?"11px 11px 3px 11px":"11px 11px 11px 3px",fontSize:12.5,lineHeight:1.7,whiteSpace:"pre-wrap",wordBreak:"break-word",background:m.role==="user"?"#FFFBF2":"#F8F9FA",border:`1px solid ${m.role==="user"?"rgba(239,159,39,.2)":"#E8ECF4"}`,color:N}}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && <div style={{display:"flex",gap:7}}>
                  <div style={{width:24,height:24,borderRadius:6,background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:N}}>SX</div>
                  <div style={{padding:"9px 13px",borderRadius:"11px 11px 11px 3px",background:"#F8F9FA",border:"1px solid #E8ECF4",display:"flex",gap:4}}>
                    {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#94A3B8",animation:`pulse 1.3s ${i*.2}s infinite`}}/>)}
                  </div>
                </div>}
                <div ref={bottomRef}/>
              </div>

              {/* Quick prompts */}
              <div style={{padding:"6px 10px",borderTop:"1px solid #E8ECF4",display:"flex",gap:5,flexWrap:"wrap"}}>
                {(activeCxo==="ceo"?["What should I do today for revenue?","Give me my 48-hr sprint plan","How do I close my next 5 customers?"]
                  :activeCxo==="cto"?["Review my tech stack","How do I add Supabase auth?","Best practices for Claude API"]
                  :activeCxo==="cfo"?["What is my LTV:CAC ratio?","How do I reach $10k MRR?","Build me a P&L forecast"]
                  :activeCxo==="coo"?["Reduce churn rate","Build onboarding checklist","Handle a support escalation"]
                  :activeCxo==="ciso"?["GDPR compliance checklist","Secure my API keys","Add rate limiting"]
                  :activeCxo==="cdo"?["Improve activation rate","Analyze my funnel","Which feature drives retention?"]
                  :["Write my launch post","Best time to post on LinkedIn","Plan my content week"]
                ).map((q,i) => (
                  <button key={i} onClick={()=>setChatInput(q)}
                    style={{fontSize:10.5,padding:"4px 9px",borderRadius:20,border:"1px solid #E2E8F0",background:"#F8F9FA",color:"#64748B",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",whiteSpace:"nowrap"}}>{q}</button>
                ))}
              </div>

              <div style={{padding:"9px 11px",borderTop:"1px solid #E8ECF4",display:"flex",gap:7,alignItems:"flex-end",flexShrink:0}}>
                <textarea value={chatInput} onChange={e=>setChatInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg()}}}
                  placeholder={`Ask your ${currentAgent?currentAgent.label:cxo?.title+" advisor"}…`} rows={1}
                  style={{flex:1,resize:"none",border:"1px solid #E2E8F0",borderRadius:8,padding:"8px 11px",fontSize:12.5,background:"#F8F9FA",color:N,lineHeight:1.5,minHeight:36,maxHeight:90,fontFamily:"'Plus Jakarta Sans'"}}/>
                <button onClick={sendMsg} disabled={!chatInput.trim()||sending}
                  style={{width:34,height:34,borderRadius:8,border:"none",background:AMBER,color:N,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",opacity:!chatInput.trim()||sending?.5:1,flexShrink:0}}>↑</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
