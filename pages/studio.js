// pages/studio.js — SIXXAB AI Content Studio
// Unified with Calendar + Social Hub via shared sixxab_social_posts store
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect, useRef } from "react"

const N="#0A0E1A", AMBER="#EF9F27", CHALK="#F5F5F0", GREEN="#1D9E75", PINK="#D4537E"

// ── Shared store (same key as calendar + social hub) ─────────────
const STORE_KEY  = "sixxab_social_posts"
const DRAFT_KEY  = "sixxab_studio_draft"
const HIST_KEY   = "sixxab_studio_history"
const BRAND_KEY  = "sixxab_brand"

function loadPosts()      { try { return JSON.parse(localStorage.getItem(STORE_KEY)||"[]") } catch { return [] } }
function savePosts(p)     { try { localStorage.setItem(STORE_KEY,JSON.stringify(p.slice(0,500))); window.dispatchEvent(new Event("sixxab_posts_updated")) } catch {} }
function loadHistory()    { try { return JSON.parse(localStorage.getItem(HIST_KEY)||"[]") } catch { return [] } }
function saveHistory(h)   { try { localStorage.setItem(HIST_KEY,JSON.stringify(h.slice(0,100))) } catch {} }

// ── Content types ─────────────────────────────────────────────────
const CONTENT_TYPES = [
  { id:"linkedin_post",     label:"LinkedIn Post",    icon:"ti-brand-linkedin", color:"#0A66C2", group:"Social",  desc:"High-engagement post with hook, insight and CTA" },
  { id:"twitter_thread",    label:"Twitter Thread",   icon:"ti-brand-x",        color:"#000000", group:"Social",  desc:"7-tweet thread with numbered insights" },
  { id:"instagram_caption", label:"Instagram Caption",icon:"ti-brand-instagram",color:"#E1306C", group:"Social",  desc:"Visual caption with hashtags and CTA" },
  { id:"facebook_post",     label:"Facebook Post",    icon:"ti-brand-facebook", color:"#1877F2", group:"Social",  desc:"Engaging community post" },
  { id:"blog_post",         label:"Blog Article",     icon:"ti-article",        color:"#6366F1", group:"Content", desc:"SEO-optimised 1000-word article" },
  { id:"email_newsletter",  label:"Email Newsletter", icon:"ti-mail",           color:"#059669", group:"Content", desc:"Weekly newsletter with 5 sections" },
  { id:"press_release",     label:"Press Release",    icon:"ti-news",           color:"#6B7280", group:"Content", desc:"Professional announcement format" },
  { id:"case_study",        label:"Case Study",       icon:"ti-chart-bar",      color:"#D97706", group:"Content", desc:"Problem → solution → results story" },
  { id:"video_script",      label:"Video Script",     icon:"ti-video",          color:"#DC2626", group:"Content", desc:"YouTube/Reel script with hooks" },
  { id:"sales_email",       label:"Sales Email",      icon:"ti-send",           color:"#7C3AED", group:"Sales",   desc:"Cold outreach with pain-point focus" },
  { id:"weekly_plan",       label:"Weekly Content Plan",icon:"ti-calendar-week",color:"#0891B2", group:"Special", desc:"7-day content calendar with 5 posts per day" },
  { id:"topic_ideas",       label:"Topic Ideas",      icon:"ti-bulb",           color:"#F59E0B", group:"Special", desc:"30 content ideas tailored to your business" },
]

const SOCIAL_PLATFORMS = [
  { id:"linkedin",  label:"LinkedIn",  icon:"ti-brand-linkedin",  color:"#0A66C2" },
  { id:"twitter",   label:"Twitter/X", icon:"ti-brand-x",         color:"#000000" },
  { id:"instagram", label:"Instagram", icon:"ti-brand-instagram", color:"#E1306C" },
  { id:"facebook",  label:"Facebook",  icon:"ti-brand-facebook",  color:"#1877F2" },
]

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

const DEFAULT_BRAND = { name:"", industry:"", audience:"", tone:"Professional", usp:"", voice:"First person" }

export default function StudioPage() {
  const [activeType,   setActiveType]   = useState("linkedin_post")
  const [activeTab,    setActiveTab]    = useState("create") // create | weekly | topics | history | calendar
  const [params,       setParams]       = useState({ topic:"", keyword:"", platform:"", audience:"", objective:"", product:"SIXXAB AI", wordCount:"600-800" })
  const [output,       setOutput]       = useState("")
  const [loading,      setLoading]      = useState(false)
  const [brand,        setBrand]        = useState(DEFAULT_BRAND)
  const [history,      setHistory]      = useState([])
  const [calPosts,     setCalPosts]     = useState([])
  const [socialStatus, setSocialStatus] = useState({})
  const [selPlatforms, setSelPlatforms] = useState([])
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("09:00")
  const [publishing,   setPublishing]   = useState(false)
  const [publishResult,setPublishResult]= useState(null)
  const [toast,        setToast]        = useState(null)
  const [weeklyPlan,   setWeeklyPlan]   = useState(null)
  const [topicIdeas,   setTopicIdeas]   = useState([])
  const [copied,       setCopied]       = useState(false)
  const outputRef = useRef(null)

  useEffect(() => {
    try { const b=JSON.parse(localStorage.getItem(BRAND_KEY)||"{}"); if(b.name) setBrand({...DEFAULT_BRAND,...b}) } catch {}
    setHistory(loadHistory())
    setCalPosts(loadPosts())
    // Load status
    fetchStatus()
    // Load draft passed from calendar/social
    try {
      const d=sessionStorage.getItem(DRAFT_KEY)
      if(d){ const {content}=JSON.parse(d); setOutput(content); setActiveTab("create"); sessionStorage.removeItem(DRAFT_KEY) }
    } catch {}
    // Listen for cross-page updates
    const onUpdate=()=>setCalPosts(loadPosts())
    window.addEventListener("sixxab_posts_updated",onUpdate)
    return ()=>window.removeEventListener("sixxab_posts_updated",onUpdate)
  },[])

  async function fetchStatus() {
    try { const r=await fetch("/api/social/status"); const d=await r.json(); setSocialStatus(d.status||{}) } catch {}
  }

  function saveBrand(b) { setBrand(b); try{localStorage.setItem(BRAND_KEY,JSON.stringify(b))}catch{} }
  function p(k,v) { setParams(prev=>({...prev,[k]:v})) }
  function showToast(msg,ok=true){ setToast({msg,ok}); setTimeout(()=>setToast(null),4000) }

  // ── Generate content ──────────────────────────────────────────
  async function generate() {
    const ct = CONTENT_TYPES.find(t=>t.id===activeType)
    setLoading(true); setOutput(""); setPublishResult(null)
    try {
      const brandCtx = brand.name ? `\nBrand: ${brand.name} | Industry: ${brand.industry} | Audience: ${brand.audience} | Tone: ${brand.tone} | USP: ${brand.usp}` : ""
      const r = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content: buildPrompt(ct, params, brandCtx) }] })
      })
      const d = await r.json()
      if(!r.ok || d.error) { showToast(d.error||"Generation failed",false); setLoading(false); return }
      const text = d.reply || ""
      setOutput(text)
      // Save to history
      const item = { id:Date.now(), type:activeType, label:ct.label, topic:params.topic||params.objective||"Generated", output:text, createdAt:new Date().toISOString() }
      const nh = [item,...history].slice(0,100)
      setHistory(nh); saveHistory(nh)
      // Parse weekly plan or topic ideas
      if(activeType==="weekly_plan") parseWeeklyPlan(text)
      if(activeType==="topic_ideas") parseTopicIdeas(text)
    } catch(e){ showToast("Error: "+e.message,false) }
    setLoading(false)
  }

  function buildPrompt(ct, params, brandCtx) {
    const base = `You are an expert content strategist and copywriter for ${brand.name||"a business"}.${brandCtx}\n\n`
    switch(ct.id) {
      case "weekly_plan": return `${base}Create a complete 7-day social media content plan for this week.\nBusiness: ${brand.name||params.topic} | Industry: ${brand.industry} | Audience: ${brand.audience}\n\nFor each day Mon-Sun, provide 3 post ideas:\n- Platform (LinkedIn/Twitter/Instagram)\n- Topic/Hook (first line)\n- Content type (educational/promotional/personal/engagement)\n- Best posting time\n\nFormat as:\n## MONDAY\n**Post 1:** [Platform] | [Time] | [Type]\nHook: [First line]\nContent: [2-3 sentence description]\n\nMake every post specific to ${brand.industry||"business"} and highly engaging. Include mix of educational (60%), promotional (20%), personal (20%).`
      case "topic_ideas": return `${base}Generate 30 content topic ideas for ${brand.name||"a business"} in ${brand.industry||"business"}.\n\nTarget audience: ${brand.audience||"entrepreneurs and business owners"}\nBusiness USP: ${brand.usp||"AI-powered business automation"}\n\nFormat as numbered list:\n1. [Topic] — [Platform] — [Why this works]\n\nInclude:\n- 10 LinkedIn thought leadership topics\n- 8 Twitter/X thread ideas\n- 6 Instagram content ideas\n- 4 video script topics\n- 2 newsletter topic ideas\n\nMake topics specific, timely and optimised for the ${new Date().getFullYear()} algorithm.`
      case "linkedin_post": return `${base}Write a high-engagement LinkedIn post about: ${params.topic}\nObjective: ${params.objective||"grow audience and generate leads"}\nTone: ${brand.tone||"Professional"}\n\nStructure:\n- Hook (controversial/surprising/question — 1 line)\n- 3-5 short paragraphs with insights\n- Practical takeaway\n- Call to action\n- 3-5 relevant hashtags\n\nKeep under 700 words. Use line breaks. No em dashes. Personal voice.`
      case "twitter_thread": return `${base}Write a Twitter thread (7-10 tweets) about: ${params.topic}\n\nFormat:\n1/ Hook tweet (makes people want to read more)\n2/ through 9/ — insights, stats, examples\n10/ CTA tweet\n\nEach tweet max 280 chars. Numbered format. Punchy and shareable.`
      case "email_newsletter": return `${base}Write a weekly email newsletter.\nTopic: ${params.topic}\nWord count: ${params.wordCount||"600-800"}\n\nStructure:\n- Subject line (5 options)\n- Preview text\n- Opening hook\n- Main insight (3 sections)\n- Quick win tip\n- Resource recommendation\n- Closing CTA\n\nTone: ${brand.tone||"conversational and professional"}`
      case "blog_post": return `${base}Write a comprehensive blog article.\nTopic: ${params.topic}\nKeyword: ${params.keyword||params.topic}\nWord count: ${params.wordCount||"1000-1200"}\n\nInclude: SEO title, meta description, introduction, 5 H2 sections with content, conclusion, internal link suggestions.`
      default: return `${base}Create ${ct.label} content about: ${params.topic||params.objective}\nObjective: ${params.objective}\nTone: ${brand.tone||"Professional"}\nAudience: ${brand.audience||"business professionals"}\n\nMake it highly engaging, specific and actionable.`
    }
  }

  function parseWeeklyPlan(text) {
    const days = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]
    const plan = {}
    days.forEach(day => {
      const idx = text.indexOf(`## ${day}`)
      const nextIdx = days.map(d=>`## ${d}`).find((s,i) => i > days.indexOf(`## ${day}`) && text.includes(s))
      if(idx !== -1) {
        const chunk = text.slice(idx, nextIdx ? text.indexOf(nextIdx) : undefined)
        plan[day] = chunk
      }
    })
    setWeeklyPlan(plan)
  }

  function parseTopicIdeas(text) {
    const lines = text.split("\n").filter(l => /^\d+\./.test(l.trim()))
    setTopicIdeas(lines.map((l,i)=>({ id:i+1, text:l.replace(/^\d+\.\s*/,""), selected:false })))
  }

  // ── Send to calendar ──────────────────────────────────────────
  function sendToCalendar(content, type, platform) {
    const post = {
      id:       Date.now() + Math.random(),
      title:    params.topic || params.objective || type || "Content Studio Post",
      content,
      platforms: platform ? [platform] : selPlatforms.length ? selPlatforms : ["linkedin"],
      date:     scheduleDate || getTodayDate(),
      time:     scheduleTime || "09:00",
      status:   scheduleDate ? "scheduled" : "draft",
      type:     activeType,
      source:   "studio",
      createdAt: new Date().toISOString(),
    }
    const updated = [post, ...loadPosts()]
    savePosts(updated)
    setCalPosts(updated)
    // Pass to calendar via sessionStorage too
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ content, type: activeType }))
    showToast(scheduleDate ? `Scheduled for ${scheduleDate} at ${scheduleTime}` : "Saved to Calendar as draft!")
    window.open("/calendar","_blank")
  }

  // ── Publish now ───────────────────────────────────────────────
  async function publishNow() {
    if(!output||!selPlatforms.length){ showToast("Select platforms first",false); return }
    const notConn = selPlatforms.filter(p=>!socialStatus[p]?.connected)
    if(notConn.length){ showToast(`Connect ${notConn.join(", ")} in Social Hub first`,false); return }
    setPublishing(true); setPublishResult(null)
    try {
      const r = await fetch("/api/social/publish",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ platforms:selPlatforms, content:output })
      })
      const d = await r.json()
      setPublishResult(d)
      if(d.published?.length>0){
        showToast(`Published to ${d.published.length} platform${d.published.length!==1?"s":""}! 🎉`)
        // Mark in calendar
        const post={ id:Date.now(), title:params.topic||"Studio Post", content:output, platforms:selPlatforms, date:getTodayDate(), time:new Date().toTimeString().slice(0,5), status:"published", publishedAt:new Date().toISOString(), source:"studio" }
        const updated=[post,...loadPosts()]
        savePosts(updated); setCalPosts(updated)
      } else { showToast(`Failed: ${d.failed?.[0]?.error||"Unknown error"}`,false) }
    } catch(e){ showToast("Network error: "+e.message,false) }
    setPublishing(false)
  }

  function getTodayDate(){ return new Date().toISOString().slice(0,10) }

  function copy(text=output){ navigator.clipboard?.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); showToast("Copied!") }

  const connectedPlatforms = SOCIAL_PLATFORMS.filter(p=>socialStatus[p.id]?.connected)
  const CT = CONTENT_TYPES.find(t=>t.id===activeType)

  return(<>
    <Head><title>SIXXAB AI — Content Studio</title></Head>
    <style>{`
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .fu{animation:fadeUp .25s ease}
      .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
      .inp{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:${N};font-family:inherit;outline:none;transition:border .15s;background:#fff}
      .inp:focus{border-color:${AMBER}}
      textarea.inp{resize:vertical;line-height:1.65}
      .tab{padding:7px 16px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;transition:all .14s}
      .ton{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.1)}
      .toff{background:transparent;color:#64748B}
      .type-btn{padding:10px 14px;border-radius:10px;border:1.5px solid;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:500;transition:all .14s;text-align:left;display:flex;align-items:center;gap:8px}
      .plat-btn{padding:7px 14px;border-radius:8px;border:1.5px solid;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;transition:all .14s}
      .btn-amber{padding:10px 20px;border-radius:10px;background:${AMBER};color:${N};border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;transition:all .15s}
      .btn-amber:disabled{opacity:.55;cursor:not-allowed}
      .btn-outline{padding:9px 16px;border-radius:9px;background:transparent;border:1.5px solid #E2E8F0;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;color:${N};display:flex;align-items:center;gap:6px;transition:all .14s}
      .btn-outline:hover{background:#F8F9FA;border-color:#CBD5E1}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(239,159,39,.35);border-radius:2px}
    `}</style>
    <SixxabNav active="/studio"/>

    {toast&&<div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

    {/* Header */}
    <div style={{background:N,padding:"14px 5%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:CHALK,marginBottom:2}}>Content <span style={{color:AMBER,fontStyle:"italic"}}>Studio</span></h1>
          <p style={{fontSize:11.5,color:"rgba(245,245,240,.4)"}}>Generate · Schedule · Publish · Sync with Calendar & Social Hub</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <a href="/calendar" style={{padding:"6px 14px",borderRadius:8,background:"rgba(239,159,39,.15)",border:"1px solid rgba(239,159,39,.3)",fontSize:12.5,color:AMBER,textDecoration:"none",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
            <i className="ti ti-calendar" style={{fontSize:12}} aria-hidden="true"/> Calendar {calPosts.length>0&&<span style={{background:AMBER,color:N,borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700}}>{calPosts.length}</span>}
          </a>
          <a href="/social" style={{padding:"6px 14px",borderRadius:8,background:"rgba(212,83,126,.15)",border:"1px solid rgba(212,83,126,.3)",fontSize:12.5,color:PINK,textDecoration:"none",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
            <i className="ti ti-share" style={{fontSize:12}} aria-hidden="true"/> Social Hub {connectedPlatforms.length>0&&<span style={{background:GREEN,color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700}}>{connectedPlatforms.length} connected</span>}
          </a>
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"8px 5%",display:"flex",gap:4,overflowX:"auto"}}>
      {[["create","✦ Create"],["weekly","📅 Weekly Plan"],["topics","💡 Topic Ideas"],["history","🕐 History"],["calendar","📊 Calendar Queue"]].map(([t,l])=>(
        <button key={t} className={`tab ${activeTab===t?"ton":"toff"}`} onClick={()=>setActiveTab(t)}>
          {l}{t==="calendar"&&calPosts.length>0&&<span style={{marginLeft:5,background:AMBER,color:N,borderRadius:8,padding:"1px 5px",fontSize:10,fontWeight:700}}>{calPosts.length}</span>}
        </button>
      ))}
    </div>

    <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 5% 60px",display:"grid",gridTemplateColumns:"280px 1fr",gap:20,alignItems:"start"}}>

      {/* LEFT: Content type selector */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div className="card" style={{padding:"14px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Content type</div>
          {["Social","Content","Special"].map(group=>(
            <div key={group} style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:"#CBD5E1",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{group}</div>
              {CONTENT_TYPES.filter(t=>t.group===group).map(t=>(
                <button key={t.id} className="type-btn" onClick={()=>{setActiveType(t.id);setOutput("");setPublishResult(null)}}
                  style={{width:"100%",marginBottom:4,borderColor:activeType===t.id?t.color:"#E2E8F0",background:activeType===t.id?`${t.color}10`:"transparent",color:activeType===t.id?t.color:N}}>
                  <i className={`ti ${t.icon}`} style={{fontSize:14,flexShrink:0}} aria-hidden="true"/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12.5,fontWeight:activeType===t.id?700:500}}>{t.label}</div>
                    <div style={{fontSize:10.5,color:"#94A3B8",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Brand settings */}
        <div className="card" style={{padding:"14px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Brand voice</div>
          {[["name","Business name","BigTech Consulting"],["industry","Industry","Technology Consulting"],["audience","Target audience","CTOs, IT Directors"],["tone","Tone","Professional"],["usp","USP","AI-powered IT transformation"]].map(([k,l,ph])=>(
            <div key={k} style={{marginBottom:8}}>
              <label style={{fontSize:11,color:"#94A3B8",display:"block",marginBottom:3}}>{l}</label>
              <input className="inp" style={{fontSize:12.5,padding:"7px 10px"}} value={brand[k]||""} placeholder={ph} onChange={e=>saveBrand({...brand,[k]:e.target.value})}/>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Main content area */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>

        {/* CREATE TAB */}
        {activeTab==="create"&&(<>
          <div className="card fu">
            <div style={{padding:"14px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:9,background:`${CT.color}18`,border:`1px solid ${CT.color}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <i className={`ti ${CT.icon}`} style={{fontSize:15,color:CT.color}} aria-hidden="true"/>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:N}}>{CT.label}</div>
                <div style={{fontSize:12,color:"#64748B"}}>{CT.desc}</div>
              </div>
            </div>
            <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:5}}>Topic / Main message *</label>
                <input className="inp" value={params.topic} placeholder={`e.g. "5 ways AI is changing ${brand.industry||"business"} in 2025"`} onChange={e=>p("topic",e.target.value)} onKeyDown={e=>e.key==="Enter"&&generate()}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:5}}>Objective</label>
                  <select className="inp" value={params.objective} onChange={e=>p("objective",e.target.value)}>
                    <option value="">Choose…</option>
                    {["Generate leads","Build authority","Drive traffic","Announce product","Educate audience","Build community","Share insight","Promote service"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:5}}>Audience</label>
                  <input className="inp" value={params.audience||brand.audience} placeholder="CTOs, founders…" onChange={e=>p("audience",e.target.value)}/>
                </div>
              </div>
              <button className="btn-amber" onClick={generate} disabled={loading||!params.topic.trim()} style={{justifyContent:"center"}}>
                {loading?<><div style={{width:16,height:16,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"spin .7s linear infinite"}}/> Generating…</>:<><i className="ti ti-wand" style={{fontSize:14}} aria-hidden="true"/> Generate {CT.label}</>}
              </button>
            </div>
          </div>

          {/* Output */}
          {output&&(
            <div className="card fu">
              <div style={{padding:"12px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                <div style={{fontSize:13.5,fontWeight:700,color:N}}>Generated {CT.label}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button className="btn-outline" onClick={()=>copy()}><i className="ti ti-copy" style={{fontSize:12}} aria-hidden="true"/>{copied?"Copied!":"Copy"}</button>
                  <button className="btn-outline" onClick={generate}><i className="ti ti-refresh" style={{fontSize:12}} aria-hidden="true"/>Regenerate</button>
                </div>
              </div>
              <div style={{padding:"18px",maxHeight:360,overflowY:"auto"}}>
                <pre ref={outputRef} style={{fontFamily:"inherit",fontSize:14,lineHeight:1.75,color:N,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{output}</pre>
              </div>

              {/* Publish actions */}
              <div style={{padding:"14px 18px",borderTop:"1px solid #E8ECF4",background:"#FAFBFC"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Publish or schedule</div>

                {/* Platform selection */}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                  {SOCIAL_PLATFORMS.map(plat=>{
                    const conn=socialStatus[plat.id]?.connected
                    const sel=selPlatforms.includes(plat.id)
                    return(
                      <button key={plat.id} className="plat-btn" onClick={()=>setSelPlatforms(s=>s.includes(plat.id)?s.filter(x=>x!==plat.id):[...s,plat.id])}
                        style={{borderColor:sel?plat.color:"#E2E8F0",background:sel?`${plat.color}12`:"#fff",color:sel?plat.color:"#94A3B8",opacity:conn?1:0.5,position:"relative"}}>
                        <i className={`ti ${plat.icon}`} style={{fontSize:13}} aria-hidden="true"/>
                        {plat.label}
                        {!conn&&<span style={{fontSize:9,position:"absolute",top:-6,right:-4,background:"#FEF2F2",color:"#DC2626",padding:"1px 4px",borderRadius:4,border:"1px solid #FECACA"}}>setup</span>}
                        {conn&&sel&&<span style={{fontSize:9,position:"absolute",top:-6,right:-4,background:"#E1F5EE",color:GREEN,padding:"1px 4px",borderRadius:4,border:"1px solid #6EE7B7"}}>✓</span>}
                      </button>
                    )
                  })}
                </div>

                {/* Schedule date/time */}
                <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:140}}>
                    <label style={{fontSize:11,color:"#94A3B8",display:"block",marginBottom:4}}>Schedule date (optional)</label>
                    <input className="inp" type="date" value={scheduleDate} min={getTodayDate()} onChange={e=>setScheduleDate(e.target.value)}/>
                  </div>
                  <div style={{width:120}}>
                    <label style={{fontSize:11,color:"#94A3B8",display:"block",marginBottom:4}}>Time</label>
                    <input className="inp" type="time" value={scheduleTime} onChange={e=>setScheduleTime(e.target.value)}/>
                  </div>
                </div>

                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <button className="btn-amber" onClick={publishNow} disabled={publishing||!selPlatforms.length}>
                    {publishing?<><div style={{width:14,height:14,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Publishing…</>:<><i className="ti ti-send" style={{fontSize:13}} aria-hidden="true"/>Publish Now</>}
                  </button>
                  <button className="btn-outline" onClick={()=>sendToCalendar(output,activeType)}>
                    <i className="ti ti-calendar-plus" style={{fontSize:13}} aria-hidden="true"/>
                    {scheduleDate?"Schedule for "+scheduleDate:"Save to Calendar"}
                  </button>
                  <button className="btn-outline" onClick={()=>{sessionStorage.setItem(DRAFT_KEY,JSON.stringify({content:output,type:activeType}));window.open("/social","_blank")}}>
                    <i className="ti ti-share" style={{fontSize:13}} aria-hidden="true"/>Open in Social Hub
                  </button>
                </div>

                {/* Publish result */}
                {publishResult&&(
                  <div style={{marginTop:12,padding:"11px 14px",borderRadius:10,background:publishResult.published?.length>0?"#E1F5EE":"#FEF2F2",border:`1px solid ${publishResult.published?.length>0?"#6EE7B7":"#FECACA"}`,fontSize:13}}>
                    {publishResult.published?.map(p=><div key={p.platform} style={{color:GREEN,marginBottom:2}}>✓ {p.platform}{p.url?<a href={p.url} target="_blank" rel="noopener noreferrer" style={{marginLeft:8,fontSize:12,color:GREEN}}> View post ↗</a>:null}</div>)}
                    {publishResult.failed?.map(f=><div key={f.platform} style={{color:"#DC2626",marginBottom:2}}>✗ {f.platform}: {f.error}</div>)}
                  </div>
                )}
              </div>
            </div>
          )}
        </>)}

        {/* WEEKLY PLAN TAB */}
        {activeTab==="weekly"&&(
          <div className="fu">
            <div className="card" style={{marginBottom:16}}>
              <div style={{padding:"14px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:N}}>Weekly Content Plan</div>
                  <div style={{fontSize:12,color:"#64748B"}}>AI generates 7 days of content tailored to your business</div>
                </div>
                <button className="btn-amber" onClick={()=>{setActiveType("weekly_plan");generate()}} disabled={loading}>
                  {loading?<><div style={{width:14,height:14,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Generating…</>:<><i className="ti ti-wand" style={{fontSize:13}} aria-hidden="true"/>Generate This Week's Plan</>}
                </button>
              </div>
              {!output&&!weeklyPlan&&(
                <div style={{padding:"32px",textAlign:"center",color:"#94A3B8"}}>
                  <i className="ti ti-calendar-week" style={{fontSize:40,display:"block",marginBottom:12,color:"#CBD5E1"}} aria-hidden="true"/>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>Generate your weekly content plan</div>
                  <div style={{fontSize:13,lineHeight:1.7}}>Fill in your brand details on the left, then click "Generate This Week's Plan" for a complete Monday-Sunday content calendar with posts for LinkedIn, Twitter, Instagram and more.</div>
                </div>
              )}
              {output&&activeType==="weekly_plan"&&(
                <div style={{padding:"18px",maxHeight:500,overflowY:"auto"}}>
                  <pre style={{fontFamily:"inherit",fontSize:13.5,lineHeight:1.8,color:N,whiteSpace:"pre-wrap"}}>{output}</pre>
                </div>
              )}
            </div>
            {output&&activeType==="weekly_plan"&&(
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button className="btn-amber" onClick={()=>{
                  // Parse and add all week's posts to calendar
                  const weekStart = new Date()
                  const day = weekStart.getDay()
                  const diff = day===0?-6:1-day
                  weekStart.setDate(weekStart.getDate()+diff)
                  const newPosts = DAYS.map((d,i)=>{
                    const date = new Date(weekStart); date.setDate(weekStart.getDate()+i)
                    return { id:Date.now()+i, title:`${d} — ${brand.name||"Content"} Post`, content:`Content for ${d}\n\n${output.split(`## ${d.toUpperCase()}`)[1]?.split("##")[0]?.trim()||""}`, platforms:["linkedin"], date:date.toISOString().slice(0,10), time:"09:00", status:"scheduled", source:"studio", createdAt:new Date().toISOString() }
                  })
                  const updated=[...newPosts,...loadPosts()]; savePosts(updated); setCalPosts(updated)
                  showToast("All 7 days added to Calendar!"); window.open("/calendar","_blank")
                }}>
                  <i className="ti ti-calendar-plus" style={{fontSize:13}} aria-hidden="true"/>Add All to Calendar
                </button>
                <button className="btn-outline" onClick={()=>copy()}><i className="ti ti-copy" style={{fontSize:12}} aria-hidden="true"/>Copy Plan</button>
              </div>
            )}
          </div>
        )}

        {/* TOPICS TAB */}
        {activeTab==="topics"&&(
          <div className="fu">
            <div className="card" style={{marginBottom:16}}>
              <div style={{padding:"14px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:N}}>Topic Ideas for {brand.name||"Your Business"}</div>
                  <div style={{fontSize:12,color:"#64748B"}}>30 content ideas tailored to {brand.industry||"your industry"} for growth</div>
                </div>
                <button className="btn-amber" onClick={()=>{setActiveType("topic_ideas");generate()}} disabled={loading}>
                  {loading?<><div style={{width:14,height:14,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Generating…</>:<><i className="ti ti-bulb" style={{fontSize:13}} aria-hidden="true"/>Generate 30 Topics</>}
                </button>
              </div>
              {topicIdeas.length===0&&(
                <div style={{padding:"32px",textAlign:"center",color:"#94A3B8"}}>
                  <i className="ti ti-bulb" style={{fontSize:40,display:"block",marginBottom:12,color:"#CBD5E1"}} aria-hidden="true"/>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>Get 30 content ideas instantly</div>
                  <div style={{fontSize:13,lineHeight:1.7}}>AI analyses your business, industry and audience to generate highly relevant topic ideas across LinkedIn, Twitter, Instagram, video and newsletters.</div>
                </div>
              )}
              {topicIdeas.length>0&&(
                <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:6,maxHeight:480,overflowY:"auto"}}>
                  {topicIdeas.map((idea,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:9,background:idea.selected?"#FFFBF2":"#FAFAFA",border:`1px solid ${idea.selected?AMBER:"#E2E8F0"}`,cursor:"pointer",transition:"all .14s"}}
                      onClick={()=>setTopicIdeas(prev=>prev.map((t,j)=>j===i?{...t,selected:!t.selected}:t))}>
                      <div style={{width:20,height:20,borderRadius:5,border:`1.5px solid ${idea.selected?AMBER:"#CBD5E1"}`,background:idea.selected?AMBER:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                        {idea.selected&&<i className="ti ti-check" style={{fontSize:11,color:N}} aria-hidden="true"/>}
                      </div>
                      <div style={{flex:1,fontSize:13.5,color:N,lineHeight:1.6}}>{idea.text}</div>
                      <button onClick={e=>{e.stopPropagation();setParams(prev=>({...prev,topic:idea.text.split("—")[0].trim()}));setActiveType("linkedin_post");setActiveTab("create");showToast("Topic loaded — click Generate!")}}
                        style={{padding:"4px 10px",borderRadius:7,background:AMBER,color:N,border:"none",cursor:"pointer",fontSize:11.5,fontWeight:600,fontFamily:"inherit",flexShrink:0}}>Use</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {topicIdeas.some(t=>t.selected)&&(
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button className="btn-amber" onClick={()=>{
                  const selected=topicIdeas.filter(t=>t.selected)
                  selected.forEach((idea,i)=>{
                    const post={id:Date.now()+i,title:idea.text.split("—")[0].trim(),content:"",platforms:["linkedin"],date:new Date(Date.now()+(i+1)*86400000).toISOString().slice(0,10),time:"09:00",status:"draft",source:"topics",createdAt:new Date().toISOString()}
                    const updated=[post,...loadPosts()]; savePosts(updated); setCalPosts(updated)
                  })
                  showToast(`${selected.length} topics added to Calendar!`); window.open("/calendar","_blank")
                }}>
                  <i className="ti ti-calendar-plus" style={{fontSize:13}} aria-hidden="true"/>Add {topicIdeas.filter(t=>t.selected).length} to Calendar
                </button>
                <button className="btn-outline" onClick={()=>copy(topicIdeas.filter(t=>t.selected).map(t=>t.text).join("\n"))}><i className="ti ti-copy" style={{fontSize:12}} aria-hidden="true"/>Copy Selected</button>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab==="history"&&(
          <div className="card fu">
            <div style={{padding:"12px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:14,fontWeight:700,color:N}}>Generation history ({history.length})</div>
              {history.length>0&&<button onClick={()=>{if(confirm("Clear all history?"))setHistory([])}} style={{padding:"4px 10px",borderRadius:7,background:"#FEF2F2",border:"1px solid #FECACA",color:"#DC2626",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Clear all</button>}
            </div>
            {history.length===0
              ?<div style={{padding:"40px",textAlign:"center",color:"#94A3B8",fontSize:14}}>No history yet. Generate content to see it here.</div>
              :history.map(item=>(
                <div key={item.id} style={{padding:"14px 18px",borderBottom:"1px solid #F1F5F9"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,fontWeight:600,color:CONTENT_TYPES.find(t=>t.id===item.type)?.color||"#64748B",background:`${CONTENT_TYPES.find(t=>t.id===item.type)?.color||"#64748B"}10`,padding:"2px 8px",borderRadius:6}}>{item.label}</span>
                      <span style={{fontSize:12.5,fontWeight:500,color:N}}>{item.topic}</span>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>{setOutput(item.output);setActiveType(item.type);setActiveTab("create");showToast("Loaded!")}} style={{padding:"4px 10px",borderRadius:7,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:12,cursor:"pointer",fontFamily:"inherit",color:N}}>Load</button>
                      <button onClick={()=>sendToCalendar(item.output,item.type)} style={{padding:"4px 10px",borderRadius:7,background:`${AMBER}15`,border:`1px solid ${AMBER}40`,fontSize:12,cursor:"pointer",fontFamily:"inherit",color:AMBER}}>→ Calendar</button>
                    </div>
                  </div>
                  <div style={{fontSize:13,color:"#64748B",lineHeight:1.6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{item.output}</div>
                  <div style={{fontSize:11,color:"#CBD5E1",marginTop:4}}>{new Date(item.createdAt).toLocaleString()}</div>
                </div>
              ))
            }
          </div>
        )}

        {/* CALENDAR QUEUE TAB */}
        {activeTab==="calendar"&&(
          <div className="card fu">
            <div style={{padding:"12px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:14,fontWeight:700,color:N}}>Calendar queue ({calPosts.length} posts)</div>
              <a href="/calendar" style={{padding:"6px 14px",borderRadius:8,background:AMBER,color:N,textDecoration:"none",fontSize:13,fontWeight:700}}>Open full Calendar →</a>
            </div>
            {calPosts.length===0
              ?<div style={{padding:"40px",textAlign:"center",color:"#94A3B8",fontSize:14}}>No posts in calendar yet. Generate content and add it to calendar.</div>
              :calPosts.slice(0,20).map(post=>{
                const SC={published:{color:GREEN,bg:"#E1F5EE"},scheduled:{color:"#1D4ED8",bg:"#EFF6FF"},draft:{color:"#64748B",bg:"#F1F5F9"},failed:{color:"#DC2626",bg:"#FEF2F2"}}
                const sc=SC[post.status]||SC.draft
                return(
                  <div key={post.id} style={{padding:"12px 18px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13.5,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{post.title}</div>
                      <div style={{fontSize:11.5,color:"#94A3B8",marginTop:2}}>{post.date} {post.time} · {(post.platforms||[]).join(", ")}</div>
                    </div>
                    <span style={{padding:"3px 10px",borderRadius:20,background:sc.bg,fontSize:11.5,fontWeight:600,color:sc.color,flexShrink:0,textTransform:"capitalize"}}>{post.status}</span>
                  </div>
                )
              })
            }
          </div>
        )}
      </div>
    </div>
  </>)
}
