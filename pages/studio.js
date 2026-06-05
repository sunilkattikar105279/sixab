// pages/studio.js — SIXXAB AI Content Studio
// CMO-owned: brand kit, social posts, emails, blogs, video scripts, ads
// Syncs with CRM contacts for personalised content
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect, useRef } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0", PINK = "#D4537E"

const CONTENT_TYPES = [
  { id:"linkedin_post",     label:"LinkedIn Post",       icon:"ti-brand-linkedin",     color:"#0A66C2", group:"Social",   desc:"High-engagement LinkedIn post with hook, body and CTA" },
  { id:"twitter_thread",    label:"Twitter / X Thread",  icon:"ti-brand-x",            color:"#1DA1F2", group:"Social",   desc:"6–8 tweet thread that builds authority and drives traffic" },
  { id:"instagram_carousel",label:"Instagram Carousel",  icon:"ti-brand-instagram",    color:"#E1306C", group:"Social",   desc:"7-slide carousel script with visual notes and hooks" },
  { id:"email_campaign",    label:"Cold Email",          icon:"ti-mail",               color:"#EF9F27", group:"Email",    desc:"Cold outreach email with subject line — 4 sentences max" },
  { id:"email_sequence",    label:"Email Sequence",      icon:"ti-mail-forward",       color:"#EF9F27", group:"Email",    desc:"5-email nurture sequence — Day 1, 3, 7, 14, 21" },
  { id:"blog_post",         label:"Blog Post",           icon:"ti-file-text",          color:"#7C3AED", group:"Written",  desc:"600–800 word SEO-optimised blog post" },
  { id:"video_script",      label:"Video Script",        icon:"ti-video",              color:"#DC2626", group:"Video",    desc:"YouTube/TikTok script with hooks, B-roll and CTA notes" },
  { id:"ad_copy",           label:"Ad Copy",             icon:"ti-ad",                 color:"#378ADD", group:"Paid",     desc:"3 ad variations with headlines, body and CTA" },
  { id:"press_release",     label:"Press Release",       icon:"ti-news",               color:"#6B7280", group:"PR",       desc:"Full press release — announcement ready to publish" },
  { id:"brand_story",       label:"Brand Story",         icon:"ti-sparkles",           color:"#EC4899", group:"Brand",    desc:"3-format brand story: elevator, social bio, full narrative" },
]

const CONTENT_GROUPS = ["Social","Email","Written","Video","Paid","PR","Brand"]

const CHANNELS = ["LinkedIn","Twitter / X","Instagram","Email","WhatsApp","SMS","YouTube","TikTok","Facebook"]

const DEFAULT_BRAND = {
  name: "SIXXAB AI",
  tone: "direct, confident, founder-to-founder",
  target: "founders, entrepreneurs and SMB owners",
  cta: "Start at startupsinabox.com",
  tagline: "Your business runs itself.",
  colours: { primary:"#EF9F27", dark:"#0A0E1A", light:"#F5F5F0" }
}

export default function StudioPage() {
  const [activeType,    setActiveType]    = useState("linkedin_post")
  const [activeGroup,   setActiveGroup]   = useState("Social")
  const [params,        setParams]        = useState({ topic:"", keyword:"", platform:"", length:"", audience:"", objective:"", purpose:"", recipientRole:"", announcement:"", wordCount:"600-800", stage:"warm prospect", product:"SIXXAB AI" })
  const [brand,         setBrand]         = useState(DEFAULT_BRAND)
  const [crmContacts,   setCrmContacts]   = useState([])
  const [useCrm,        setUseCrm]        = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [output,        setOutput]        = useState("")
  const [history,       setHistory]       = useState([]) // {type, label, output, timestamp}
  const [activeTab,     setActiveTab]     = useState("create") // create | brand | history | calendar
  const [toast,         setToast]         = useState(null)
  const [calendarItems, setCalendarItems] = useState([])
  const outputRef = useRef(null)

  useEffect(() => {
    try { setCrmContacts(JSON.parse(localStorage.getItem("sixxab_crm_contacts")||"[]")) } catch {}
    try { setHistory(JSON.parse(localStorage.getItem("sixxab_studio_history")||"[]")) } catch {}
    try { const b = JSON.parse(localStorage.getItem("sixxab_brand")||"{}"); if(b.name) setBrand({...DEFAULT_BRAND,...b}) } catch {}
    try { setCalendarItems(JSON.parse(localStorage.getItem("sixxab_content_calendar")||"[]")) } catch {}
    // Sync with CRM updates
    const onUpdate = () => { try { setCrmContacts(JSON.parse(localStorage.getItem("sixxab_crm_contacts")||"[]")) } catch {} }
    window.addEventListener("sixxab_crm_updated", onUpdate)
    return () => window.removeEventListener("sixxab_crm_updated", onUpdate)
  }, [])

  function showToast(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),3500) }
  const setP = (k,v) => setParams(f=>({...f,[k]:v}))
  const setBrandField = (k,v) => { const nb = {...brand,[k]:v}; setBrand(nb); localStorage.setItem("sixxab_brand", JSON.stringify(nb)) }

  const ct = CONTENT_TYPES.find(c=>c.id===activeType) || CONTENT_TYPES[0]

  async function generate() {
    const mainParam = params.topic || params.purpose || params.announcement || params.product
    if (!mainParam) { showToast("Fill in the content topic or subject first", false); return }
    setLoading(true); setOutput("")
    try {
      const r = await fetch("/api/studio", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type:activeType, params, crmContacts: useCrm ? crmContacts.slice(0,10) : [], brand })
      })
      const d = await r.json()
      if (!r.ok || d.error) { showToast(d.error||"Generation failed", false); setLoading(false); return }
      setOutput(d.content)
      // Save to history
      const newItem = { id:Date.now(), type:activeType, label:ct.label, topic:mainParam, output:d.content, timestamp:new Date().toISOString() }
      const newHistory = [newItem, ...history].slice(0,50)
      setHistory(newHistory)
      localStorage.setItem("sixxab_studio_history", JSON.stringify(newHistory))
      outputRef.current?.scrollIntoView({ behavior:"smooth" })
    } catch { showToast("Network error", false) }
    setLoading(false)
  }

  function addToCalendar() {
    if (!output) return
    const mainParam = params.topic || params.purpose || params.announcement || params.product
    const day = ["Monday","Tuesday","Wednesday","Thursday","Friday"]
    const newItem = { id:Date.now(), type:activeType, label:ct.label, topic:mainParam, output, day:day[calendarItems.length%5], channel:ct.group, scheduled:false }
    const updated = [...calendarItems, newItem]
    setCalendarItems(updated)
    localStorage.setItem("sixxab_content_calendar", JSON.stringify(updated))
    showToast("Added to content calendar")
  }

  function exportMd() {
    if (!output) return
    const blob = new Blob([`# ${ct.label}: ${params.topic||params.purpose||""}\n\n${output}`], {type:"text/markdown"})
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob)
    a.download = `sixxab-${activeType}-${Date.now()}.md`; a.click()
  }

  // Field definitions per content type
  const FIELDS = {
    linkedin_post:     [["topic","What is this post about? *","e.g. How I got 10 customers in 48 hours using SIXXAB AI"]],
    twitter_thread:    [["topic","Thread topic *","e.g. 7 things solo founders waste time on that AI can automate"]],
    instagram_carousel:[["topic","Carousel topic *","e.g. 5 signs you need an autonomous business platform"]],
    email_campaign:    [["purpose","Email purpose *","e.g. Introduce SIXXAB AI to HVAC contractors in Dallas"],["recipientRole","Recipient role","e.g. HVAC business owner, Dallas TX"]],
    email_sequence:    [["purpose","Sequence goal *","e.g. Nurture warm leads toward booking a discovery call"],["stage","Audience stage","e.g. Engaged with LinkedIn post, not yet booked a call"]],
    blog_post:         [["topic","Blog topic *","e.g. Why HVAC businesses in Texas need AI automation in 2025"],["keyword","SEO keyword","e.g. HVAC business automation Texas"],["wordCount","Word count","600–800"]],
    video_script:      [["topic","Video topic *","e.g. How to validate your business idea in 90 seconds"],["platform","Platform","YouTube / TikTok / Instagram Reels"],["length","Video length","3–5 minutes"]],
    ad_copy:           [["product","Product/offer *","SIXXAB AI — Autonomous Business Platform"],["platform","Ad platform","LinkedIn / Meta / Google"],["audience","Target audience","Founders and SMB owners, 25–55"],["objective","Campaign objective","Trial signups / demo bookings"]],
    press_release:     [["announcement","Announcement *","e.g. SIXXAB AI launches 30 vertical agent packs for US and European markets"]],
    brand_story:       [["product","Your brand name *","SIXXAB AI"]],
  }

  const fields = FIELDS[activeType] || [["topic","Content topic *",""]]

  return (
    <>
      <Head>
        <title>SIXXAB AI — Content Studio · CMO Suite</title>
        <meta name="description" content="AI Content Studio — generate LinkedIn posts, email campaigns, blog posts, video scripts, ad copy and more. Powered by CMO advisor."/>
      </Head>
      <style>{`
        body{background:#F4F4F0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .3s ease both}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        .inp{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13px;color:${N};background:#fff;transition:border .15s;font-family:inherit}
        .inp:focus{border-color:${PINK};outline:none}
        textarea.inp{resize:vertical;line-height:1.6}
        .tab-btn{padding:7px 14px;border-radius:8px;border:none;font-size:12.5px;font-weight:500;cursor:pointer;font-family:inherit;background:transparent;color:#64748B;transition:all .14s}
        .tab-btn.on{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.08)}
        .type-btn{display:flex;align-items:center;gap:7px;width:100%;padding:9px 11px;border:none;background:transparent;cursor:pointer;font-family:inherit;border-radius:9px;transition:all .14s;border-left:3px solid transparent;text-align:left}
        .type-btn:hover{background:#F8F9FA}
        .type-btn.on{background:#F8F9FA;border-left-color:var(--tc)}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${PINK};border-radius:2px}
      `}</style>

      <SixxabNav active="/studio"/>

      {/* Toast */}
      {toast && <div style={{position:"fixed",bottom:24,right:24,zIndex:999,padding:"10px 18px",borderRadius:10,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.1)",animation:"fadeUp .3s ease"}}>
        {toast.ok?"✓":"✗"} {toast.msg}
      </div>}

      {/* Header */}
      <div style={{background:N,padding:"16px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(212,83,126,.18)",border:"1.5px solid rgba(212,83,126,.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-sparkles" style={{fontSize:22,color:PINK}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                <h1 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:CHALK,letterSpacing:.5}}>
                  SIXXAB <span style={{color:PINK,fontStyle:"italic"}}>Content Studio</span>
                </h1>
                <span style={{padding:"2px 9px",borderRadius:20,background:"rgba(212,83,126,.15)",border:"1px solid rgba(212,83,126,.35)",fontSize:10,fontWeight:600,color:"#F9A8D4"}}>CMO Suite</span>
              </div>
              <p style={{fontSize:12,color:"rgba(245,245,240,.45)"}}>10 content types · Social · Email · Blog · Video · Ads · PR · Brand story · CRM-synced</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            {[["CRM",crmContacts.length,"#1D9E75"],["History",history.length,PINK],["Calendar",calendarItems.length,"#EF9F27"]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center",padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
                <div style={{fontFamily:"Georgia",fontSize:18,color:c,letterSpacing:.5}}>{v}</div>
                <div style={{fontSize:9.5,color:"rgba(245,245,240,.4)",textTransform:"uppercase",letterSpacing:".07em"}}>{l}</div>
              </div>
            ))}
            <a href="/leads" style={{padding:"6px 14px",borderRadius:8,background:"rgba(29,158,117,.2)",border:"1px solid rgba(29,158,117,.4)",fontSize:12,fontWeight:500,color:"#6EE7B7",textDecoration:"none"}}>Lead Gen →</a>
            <a href="/proposal" style={{padding:"6px 14px",borderRadius:8,background:"rgba(55,138,221,.2)",border:"1px solid rgba(55,138,221,.4)",fontSize:12,fontWeight:500,color:"#93C5FD",textDecoration:"none"}}>Proposals →</a>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"8px 4%",display:"flex",gap:4}}>
        <div style={{display:"flex",gap:2,background:"#F1F5F9",borderRadius:9,padding:3}}>
          {[["create","✦ Create",""],["brand","🎨 Brand Kit",""],["history","📚 History",""],["calendar","📅 Calendar",""]].map(([t,l])=>(
            <button key={t} className={`tab-btn${activeTab===t?" on":""}`} onClick={()=>setActiveTab(t)}>{l}</button>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
          <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5,color:"#64748B",cursor:"pointer"}}>
            <div onClick={()=>setUseCrm(u=>!u)} style={{width:34,height:18,borderRadius:9,background:useCrm?"#1D9E75":"#E2E8F0",position:"relative",transition:"background .2s",cursor:"pointer"}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:useCrm?18:2,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
            </div>
            Sync CRM ({crmContacts.length} contacts)
          </label>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 20px 60px"}}>

        {/* ══ CREATE TAB ══ */}
        {activeTab==="create" && (
          <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:14}}>

            {/* Type selector */}
            <div>
              <div className="card">
                {CONTENT_GROUPS.map(group=>(
                  <div key={group}>
                    <div style={{padding:"7px 12px 4px",fontSize:9.5,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em"}}>{group}</div>
                    {CONTENT_TYPES.filter(c=>c.group===group).map(ct=>(
                      <button key={ct.id} className={`type-btn${activeType===ct.id?" on":""}`}
                        style={{"--tc":ct.color}} onClick={()=>setActiveType(ct.id)}>
                        <i className={`ti ${ct.icon}`} style={{fontSize:13,color:ct.color,flexShrink:0}} aria-hidden="true"/>
                        <span style={{fontSize:12,fontWeight:500,color:activeType===ct.id?N:"#64748B",lineHeight:1.3}}>{ct.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Main panel */}
            <div>
              {/* Input card */}
              <div className="card fu" style={{marginBottom:14}}>
                <div style={{padding:"11px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",gap:10}}>
                  <i className={`ti ${ct.icon}`} style={{fontSize:16,color:ct.color}} aria-hidden="true"/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:N}}>{ct.label}</div>
                    <div style={{fontSize:11.5,color:"#64748B"}}>{ct.desc}</div>
                  </div>
                  {useCrm && crmContacts.length>0 && <span style={{fontSize:10.5,padding:"2px 9px",borderRadius:8,background:"#E1F5EE",color:"#085041",fontWeight:500}}>Using {Math.min(crmContacts.length,10)} CRM contacts</span>}
                </div>
                <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:11}}>
                  {fields.map(([k,label,ph])=>(
                    <div key={k}>
                      <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:4}}>{label}</label>
                      <input className="inp" placeholder={ph} value={params[k]||""} onChange={e=>setP(k,e.target.value)}/>
                    </div>
                  ))}
                  <button onClick={generate} disabled={loading}
                    style={{width:"100%",padding:12,borderRadius:10,background:loading?"#F1F5F9":PINK,color:loading?"#94A3B8":"#fff",border:"none",cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .15s"}}>
                    {loading ? <><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Generating {ct.label}…</> : `✦ Generate ${ct.label} →`}
                  </button>
                </div>
              </div>

              {/* Output */}
              {output && (
                <div ref={outputRef} className="card fu">
                  <div style={{padding:"11px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                    <div style={{fontSize:13,fontWeight:600,color:N}}>Generated {ct.label}</div>
                    <div style={{display:"flex",gap:7}}>
                      <button onClick={addToCalendar} style={{padding:"5px 13px",borderRadius:7,background:"#EFF6FF",border:"1px solid #BFDBFE",fontSize:12,fontWeight:500,color:"#1D4ED8",cursor:"pointer",fontFamily:"inherit"}}>
                        📅 Add to calendar
                      </button>
                      <button onClick={exportMd} style={{padding:"5px 13px",borderRadius:7,background:"#F5F3FF",border:"1px solid #C4B5FD",fontSize:12,fontWeight:500,color:"#6D28D9",cursor:"pointer",fontFamily:"inherit"}}>
                        ↓ Export .md
                      </button>
                      <button onClick={()=>navigator.clipboard.writeText(output).then(()=>showToast("Copied!"))}
                        style={{padding:"5px 13px",borderRadius:7,background:PINK,border:"none",fontSize:12,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>
                        Copy
                      </button>
                    </div>
                  </div>
                  <div style={{padding:"16px 20px",fontSize:14,color:N,lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:"'Plus Jakarta Sans',sans-serif",maxHeight:600,overflowY:"auto"}}>
                    {output}
                  </div>
                  {/* Push to leads */}
                  <div style={{padding:"11px 16px",borderTop:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",gap:8,alignItems:"center",fontSize:12.5,color:"#64748B"}}>
                    <i className="ti ti-arrow-right" aria-hidden="true"/>
                    Share this content: publish it, then
                    <a href="/leads" style={{color:"#1D9E75",fontWeight:500,textDecoration:"none"}}>add responding prospects to Lead Gen</a>
                    or
                    <a href="/proposal" style={{color:"#378ADD",fontWeight:500,textDecoration:"none"}}>write a proposal for a warm lead →</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ BRAND KIT TAB ══ */}
        {activeTab==="brand" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="fu">
            <div className="card" style={{padding:"18px 20px"}}>
              <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:14}}>Brand configuration</div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[
                  {k:"name",label:"Brand name",ph:"SIXXAB AI"},
                  {k:"tagline",label:"Tagline",ph:"Your business runs itself."},
                  {k:"tone",label:"Brand voice / tone",ph:"direct, confident, founder-to-founder"},
                  {k:"target",label:"Target audience",ph:"founders, entrepreneurs and SMB owners"},
                  {k:"cta",label:"Primary CTA",ph:"Start at startupsinabox.com"},
                ].map(f=>(
                  <div key={f.k}>
                    <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:4}}>{f.label}</label>
                    <input className="inp" placeholder={f.ph} value={brand[f.k]||""} onChange={e=>setBrandField(f.k,e.target.value)}/>
                  </div>
                ))}
                <div style={{padding:"9px 12px",background:"#E1F5EE",borderRadius:9,border:"1px solid #6EE7B7",fontSize:12.5,color:"#085041"}}>
                  ✓ Brand kit auto-applied to all generated content
                </div>
              </div>
            </div>
            <div className="card" style={{padding:"18px 20px",background:N,border:"none"}}>
              <div style={{fontSize:12,fontWeight:600,color:"rgba(245,245,240,.45)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>Brand preview</div>
              <div style={{fontFamily:"Georgia,serif",fontSize:26,fontWeight:700,color:CHALK,letterSpacing:"-0.5px",marginBottom:6}}>{brand.name||"Your Brand"}</div>
              <div style={{fontSize:15,color:AMBER,fontStyle:"italic",marginBottom:14}}>{brand.tagline||"Your tagline."}</div>
              <div style={{fontSize:13,color:"rgba(245,245,240,.55)",lineHeight:1.75,marginBottom:14}}>Tone: {brand.tone||"Not set"}</div>
              <div style={{fontSize:13,color:"rgba(245,245,240,.55)",lineHeight:1.75,marginBottom:14}}>Target: {brand.target||"Not set"}</div>
              <div style={{padding:"10px 13px",borderRadius:9,background:"rgba(239,159,39,.15)",border:"1px solid rgba(239,159,39,.35)",fontSize:13,fontWeight:600,color:AMBER}}>{brand.cta||"Your CTA here"}</div>
              <div style={{marginTop:20,fontSize:12,color:"rgba(245,245,240,.35)"}}>
                Generate a Brand Story to get 3 versions — elevator, social bio and full narrative.
              </div>
              <button onClick={()=>{setActiveType("brand_story");setActiveTab("create");setParams(p=>({...p,product:brand.name}))}}
                style={{marginTop:12,padding:"9px 18px",borderRadius:9,background:PINK,color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>
                Generate brand story →
              </button>
            </div>
          </div>
        )}

        {/* ══ HISTORY TAB ══ */}
        {activeTab==="history" && (
          <div className="fu">
            {history.length===0 ? (
              <div style={{textAlign:"center",padding:"40px",color:"#94A3B8"}}>
                <div style={{fontSize:24,marginBottom:8}}>📚</div>
                <div style={{fontSize:13}}>No content generated yet. Go to Create to generate your first piece.</div>
              </div>
            ) : history.map((h,i)=>(
              <div key={h.id} className="card" style={{padding:"14px 16px",marginBottom:10,display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:8,marginBottom:4}}>
                    <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:8,background:"#F1F5F9",color:"#64748B"}}>{h.label}</span>
                    <span style={{fontSize:11,color:"#94A3B8"}}>{new Date(h.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div style={{fontSize:13.5,fontWeight:500,color:N,marginBottom:5}}>{h.topic}</div>
                  <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.65,overflow:"hidden",maxHeight:48,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{h.output.slice(0,180)}…</div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <button onClick={()=>{ setOutput(h.output); setActiveTab("create"); showToast("Loaded into editor") }}
                    style={{padding:"5px 12px",borderRadius:7,border:"1px solid #E2E8F0",background:"#F8F9FA",fontSize:11.5,color:"#64748B",cursor:"pointer",fontFamily:"inherit"}}>Load</button>
                  <button onClick={()=>navigator.clipboard.writeText(h.output).then(()=>showToast("Copied!"))}
                    style={{padding:"5px 12px",borderRadius:7,background:PINK,border:"none",fontSize:11.5,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Copy</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ CALENDAR TAB ══ */}
        {activeTab==="calendar" && (
          <div className="fu">
            {calendarItems.length===0 ? (
              <div style={{textAlign:"center",padding:"40px",color:"#94A3B8"}}>
                <div style={{fontSize:24,marginBottom:8}}>📅</div>
                <div style={{fontSize:13}}>No content scheduled. Generate content and click "Add to calendar".</div>
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
                {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(day=>{
                  const dayItems = calendarItems.filter(c=>c.day===day)
                  return (
                    <div key={day}>
                      <div style={{fontSize:12,fontWeight:700,color:N,marginBottom:8,padding:"6px 0",borderBottom:"2px solid #E2E8F0"}}>{day}</div>
                      {dayItems.length===0 && <div style={{fontSize:11.5,color:"#CBD5E1",padding:"8px 0"}}>Empty</div>}
                      {dayItems.map(item=>(
                        <div key={item.id} style={{background:"#fff",borderRadius:9,border:`1px solid ${PINK}33`,padding:"10px 11px",marginBottom:8}}>
                          <div style={{fontSize:11,fontWeight:600,color:PINK,marginBottom:3}}>{item.label}</div>
                          <div style={{fontSize:12,color:N,lineHeight:1.4,marginBottom:6}}>{item.topic}</div>
                          <div style={{display:"flex",gap:5}}>
                            <button onClick={()=>navigator.clipboard.writeText(item.output).then(()=>showToast("Copied!"))}
                              style={{flex:1,padding:"4px",borderRadius:6,background:PINK,border:"none",fontSize:10.5,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Copy</button>
                            <button onClick={()=>setCalendarItems(c=>{const n=c.filter(x=>x.id!==item.id);localStorage.setItem("sixxab_content_calendar",JSON.stringify(n));return n})}
                              style={{padding:"4px 8px",borderRadius:6,border:"1px solid #E2E8F0",background:"#F8F9FA",fontSize:10.5,color:"#94A3B8",cursor:"pointer",fontFamily:"inherit"}}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
