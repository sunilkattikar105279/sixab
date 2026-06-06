// pages/calendar.js — SIXXAB AI · Content Publishing Calendar
// Monthly + yearly scheduling with direct publish to all social platforms
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect, useCallback } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0", PINK = "#D4537E"

const PLATFORMS = [
  { id:"linkedin",  label:"LinkedIn",  icon:"ti-brand-linkedin",  color:"#0A66C2" },
  { id:"twitter",   label:"X",         icon:"ti-brand-x",         color:"#000000" },
  { id:"facebook",  label:"Facebook",  icon:"ti-brand-facebook",  color:"#1877F2" },
  { id:"instagram", label:"Instagram", icon:"ti-brand-instagram", color:"#E1306C" },
  { id:"youtube",   label:"YouTube",   icon:"ti-brand-youtube",   color:"#FF0000" },
]

const CONTENT_TYPES = [
  { id:"linkedin_post",      label:"LinkedIn Post",    color:"#0A66C2" },
  { id:"twitter_thread",     label:"Twitter Thread",   color:"#000000" },
  { id:"instagram_carousel", label:"Instagram Carousel",color:"#E1306C" },
  { id:"email_campaign",     label:"Email Campaign",   color:AMBER     },
  { id:"blog_post",          label:"Blog Post",        color:"#7C3AED" },
  { id:"video_script",       label:"Video Script",     color:"#DC2626" },
  { id:"ad_copy",            label:"Ad Copy",          color:"#378ADD" },
  { id:"custom",             label:"Custom Post",      color:"#64748B" },
]

const STATUS_COLORS = {
  draft:     { bg:"#F1F5F9", border:"#E2E8F0", text:"#64748B",  label:"Draft"     },
  scheduled: { bg:"#EFF6FF", border:"#BFDBFE", text:"#1D4ED8",  label:"Scheduled" },
  published: { bg:"#F0FDF4", border:"#BBF7D0", text:"#085041",  label:"Published" },
  failed:    { bg:"#FEF2F2", border:"#FECACA", text:"#991B1B",  label:"Failed"    },
}

const MONTHS  = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const WEEKDAYS_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

const CAL_KEY = "sixxab_cal_posts"

function loadPosts()  { try { return JSON.parse(localStorage.getItem(CAL_KEY)||"[]") } catch { return [] } }
function savePosts(p) { try { localStorage.setItem(CAL_KEY, JSON.stringify(p)) } catch {} }
function mkId()       { return `${Date.now()}-${Math.random().toString(36).slice(2,7)}` }

function getDaysInMonth(y, m) { return new Date(y, m+1, 0).getDate() }
function getFirstDay(y, m)    { return new Date(y, m, 1).getDay() }
function isoDate(y, m, d)     { return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}` }
function toLocalDate(iso)     { const [y,m,d] = iso.split("T")[0].split("-"); return new Date(+y, +m-1, +d) }

export default function CalendarPage() {
  const today = new Date()
  const [view,         setView]         = useState("month")   // month | year | week
  const [curYear,      setCurYear]      = useState(today.getFullYear())
  const [curMonth,     setCurMonth]     = useState(today.getMonth())
  const [posts,        setPosts]        = useState([])
  const [selectedDay,  setSelectedDay]  = useState(null)      // "YYYY-MM-DD"
  const [modal,        setModal]        = useState(null)      // null | "new" | "edit" | "detail"
  const [editing,      setEditing]      = useState(null)      // post object
  const [socialStatus, setSocialStatus] = useState({})
  const [publishing,   setPublishing]   = useState(null)      // post id being published
  const [toast,        setToast]        = useState(null)
  const [filterPlatform, setFilterPlatform] = useState("all")

  // Form state for new/edit post
  const emptyForm = { title:"", content:"", platforms:[], type:"custom", date:"", time:"09:00", status:"draft", notes:"" }
  const [form,    setForm]    = useState(emptyForm)
  const setF = (k,v) => setForm(f=>({...f,[k]:v}))
  const togglePlatform = (id) => setF("platforms", form.platforms.includes(id) ? form.platforms.filter(p=>p!==id) : [...form.platforms, id])

  useEffect(() => {
    setPosts(loadPosts())
    fetch("/api/social/status").then(r=>r.json()).then(d=>setSocialStatus(d.status||{})).catch(()=>{})
    // Load draft from Studio
    try {
      const draft = sessionStorage.getItem("sixxab_studio_draft")
      if (draft) {
        const { content: c, type } = JSON.parse(draft)
        if (c) {
          const d = isoDate(today.getFullYear(), today.getMonth(), today.getDate())
          setForm({...emptyForm, content:c, type:type||"custom", date:d, platforms:[]})
          setSelectedDay(d); setModal("new")
          sessionStorage.removeItem("sixxab_studio_draft")
        }
      }
    } catch {}
  }, [])

  function showToast(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),3500) }

  // ── CRUD ────────────────────────────────────────────────────────────────────
  function savePost() {
    if (!form.title.trim() && !form.content.trim()) { showToast("Add a title or content", false); return }
    if (!form.date) { showToast("Select a date", false); return }
    if (editing) {
      const updated = posts.map(p => p.id===editing.id ? {...p,...form,updatedAt:new Date().toISOString()} : p)
      setPosts(updated); savePosts(updated)
      showToast("Post updated")
    } else {
      const post = { id:mkId(), ...form, status:"draft", createdAt:new Date().toISOString() }
      const updated = [...posts, post]
      setPosts(updated); savePosts(updated)
      showToast("Post added to calendar")
    }
    setModal(null); setEditing(null); setForm(emptyForm)
  }

  function deletePost(id) {
    const updated = posts.filter(p=>p.id!==id)
    setPosts(updated); savePosts(updated)
    setModal(null); setEditing(null)
    showToast("Deleted")
  }

  function openNew(date="") {
    setForm({...emptyForm, date: date || isoDate(curYear, curMonth, today.getDate())})
    setEditing(null); setModal("new")
  }
  function openEdit(post) { setForm({...post}); setEditing(post); setModal("edit") }
  function openDetail(post) { setEditing(post); setModal("detail") }

  // ── Publish ─────────────────────────────────────────────────────────────────
  async function publishPost(post) {
    const connected = post.platforms.filter(p=>socialStatus[p]?.connected)
    if (!connected.length) { showToast(`Connect ${post.platforms.join(", ")} in Social Hub first`, false); return }
    setPublishing(post.id)
    try {
      const r = await fetch("/api/social/publish", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ platforms: connected, content: post.content || post.title })
      })
      const d = await r.json()
      const success = d.published?.length > 0
      const updated = posts.map(p => p.id===post.id
        ? {...p, status: success?"published":"failed", publishedAt:new Date().toISOString(), publishResult:d}
        : p)
      setPosts(updated); savePosts(updated)
      if (modal==="detail") setEditing(updated.find(p=>p.id===post.id)||null)
      showToast(success ? `Published to ${d.published.length} platform${d.published.length!==1?"s":""}!` : `Failed: ${d.failed?.[0]?.error}`, success)
    } catch(e) { showToast("Publish error: "+e.message, false) }
    setPublishing(null)
  }

  // ── Calendar helpers ─────────────────────────────────────────────────────────
  const postsOnDate = useCallback((dateStr) =>
    posts.filter(p => p.date === dateStr && (filterPlatform==="all" || p.platforms.includes(filterPlatform)))
  , [posts, filterPlatform])

  const monthDays = (() => {
    const first = getFirstDay(curYear, curMonth)
    const total = getDaysInMonth(curYear, curMonth)
    const cells = []
    for (let i=0; i<first; i++) cells.push(null)
    for (let d=1; d<=total; d++) cells.push(d)
    return cells
  })()

  const allMonthPosts = posts.filter(p => {
    const [y,m] = p.date?.split("-") || []
    return +y===curYear && +m-1===curMonth && (filterPlatform==="all"||p.platforms.includes(filterPlatform))
  })

  const yearMonthCounts = MONTHS.map((_,mi) =>
    posts.filter(p=>{ const [y,m]=p.date?.split("-")||[]; return +y===curYear && +m-1===mi }).length
  )

  const selectedPosts = selectedDay ? postsOnDate(selectedDay) : []
  const isToday = (d) => d===isoDate(today.getFullYear(),today.getMonth(),today.getDate())

  function navMonth(dir) {
    let m = curMonth + dir, y = curYear
    if (m<0) { m=11; y-- } else if (m>11) { m=0; y++ }
    setCurMonth(m); setCurYear(y)
  }

  const connectedPlatforms = PLATFORMS.filter(p=>socialStatus[p.id]?.connected)

  return (
    <>
      <Head>
        <title>SIXXAB AI — Content Calendar · Publishing Schedule</title>
        <meta name="description" content="Plan, schedule and publish social media content. Monthly and yearly calendar view. Direct publishing to LinkedIn, X, Facebook, Instagram and YouTube."/>
      </Head>
      <style>{`
        body{background:#F4F4F0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .3s ease both}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        .inp{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13px;color:${N};background:#fff;font-family:inherit;outline:none;transition:border .15s}
        .inp:focus{border-color:${AMBER}}
        textarea.inp{resize:vertical;line-height:1.65}
        select.inp{cursor:pointer}
        .day-cell{min-height:90px;border:1px solid #E8ECF4;padding:6px;cursor:pointer;transition:background .12s;position:relative;background:#fff}
        .day-cell:hover{background:#FFFBF2}
        .day-cell.today{background:#FFFBF2;border-color:${AMBER}}
        .day-cell.selected{background:#FFF9EC;border-color:${AMBER}88}
        .day-cell.other-month{background:#F8F9FA;opacity:.5}
        .post-chip{padding:2px 6px;border-radius:5px;font-size:10px;font-weight:600;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;display:block}
        .modal-bg{position:fixed;inset:0;background:rgba(10,14,26,.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)}
        .modal{background:#fff;border-radius:16px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.25)}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${AMBER};border-radius:2px}
        @media(max-width:768px){.hide-m{display:none!important}.day-cell{min-height:56px}}
      `}</style>

      <SixxabNav active="/calendar"/>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",bottom:24,right:24,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)",animation:"fadeUp .3s ease"}}>
          {toast.ok?"✓":"✗"} {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{background:N,padding:"14px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:`rgba(239,159,39,.18)`,border:`1.5px solid rgba(239,159,39,.4)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-calendar-month" style={{fontSize:22,color:AMBER}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                <h1 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:CHALK,letterSpacing:.5}}>
                  SIXXAB <span style={{color:AMBER,fontStyle:"italic"}}>Content Calendar</span>
                </h1>
                <span style={{padding:"2px 9px",borderRadius:20,background:"rgba(239,159,39,.15)",border:"1px solid rgba(239,159,39,.35)",fontSize:10,fontWeight:600,color:AMBER}}>CMO Suite</span>
              </div>
              <p style={{fontSize:12,color:"rgba(245,245,240,.45)"}}>Plan · Schedule · Publish · Monthly & Yearly · All platforms</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            {/* Stats */}
            {[
              ["Total",posts.length,"#94A3B8"],
              ["Scheduled",posts.filter(p=>p.status==="scheduled").length,"#378ADD"],
              ["Published",posts.filter(p=>p.status==="published").length,"#1D9E75"],
            ].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center",padding:"4px 11px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
                <div style={{fontFamily:"Georgia",fontSize:16,color:c,lineHeight:1}}>{v}</div>
                <div style={{fontSize:9.5,color:"rgba(245,245,240,.4)",textTransform:"uppercase",letterSpacing:".06em"}}>{l}</div>
              </div>
            ))}
            {/* Connected platforms */}
            <div style={{display:"flex",gap:4}}>
              {PLATFORMS.map(p=>(
                <div key={p.id} title={socialStatus[p.id]?.connected?`${p.label} connected`:`${p.label} not connected`}
                  style={{width:26,height:26,borderRadius:7,background:socialStatus[p.id]?.connected?`${p.color}20`:"#1F2937",border:`1px solid ${socialStatus[p.id]?.connected?p.color:"#374151"}`,display:"flex",alignItems:"center",justifyContent:"center",opacity:socialStatus[p.id]?.connected?1:.4}}>
                  <i className={`ti ${p.icon}`} style={{fontSize:12,color:socialStatus[p.id]?.connected?p.color:"#6B7280"}} aria-hidden="true"/>
                </div>
              ))}
            </div>
            <a href="/social" style={{padding:"6px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",fontSize:11.5,color:"rgba(245,245,240,.6)",textDecoration:"none"}}>Manage connections ↗</a>
            <button onClick={()=>openNew()} style={{padding:"8px 16px",borderRadius:9,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
              <i className="ti ti-plus" style={{fontSize:13}} aria-hidden="true"/>Schedule post
            </button>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"8px 4%",display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
        {/* View switcher */}
        <div style={{display:"flex",gap:2,background:"#F1F5F9",borderRadius:9,padding:3}}>
          {[["month","Month"],["week","Week"],["year","Year"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)}
              style={{padding:"6px 14px",borderRadius:7,border:"none",fontSize:12.5,fontWeight:view===v?600:400,cursor:"pointer",fontFamily:"inherit",background:view===v?"#fff":"transparent",color:view===v?N:"#64748B",boxShadow:view===v?"0 1px 4px rgba(0,0,0,.08)":"none",transition:"all .14s"}}>
              {l}
            </button>
          ))}
        </div>

        {/* Month/Year navigation */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>view==="year"?setCurYear(y=>y-1):navMonth(-1)}
            style={{width:28,height:28,borderRadius:7,border:"1px solid #E2E8F0",background:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
            ‹
          </button>
          <span style={{fontSize:15,fontWeight:700,color:N,minWidth:140,textAlign:"center",fontFamily:"Georgia,serif"}}>
            {view==="year" ? curYear : `${MONTHS[curMonth]} ${curYear}`}
          </span>
          <button onClick={()=>view==="year"?setCurYear(y=>y+1):navMonth(1)}
            style={{width:28,height:28,borderRadius:7,border:"1px solid #E2E8F0",background:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
            ›
          </button>
          <button onClick={()=>{setCurYear(today.getFullYear());setCurMonth(today.getMonth())}}
            style={{padding:"5px 11px",borderRadius:7,border:"1px solid #E2E8F0",background:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:12,color:"#64748B"}}>
            Today
          </button>
        </div>

        {/* Platform filter */}
        <div style={{display:"flex",gap:5,marginLeft:"auto",flexWrap:"wrap"}}>
          <button onClick={()=>setFilterPlatform("all")}
            style={{padding:"4px 11px",borderRadius:20,border:`1.5px solid ${filterPlatform==="all"?AMBER:"#E2E8F0"}`,background:filterPlatform==="all"?"rgba(239,159,39,.1)":"#fff",fontSize:11.5,fontWeight:filterPlatform==="all"?600:400,color:filterPlatform==="all"?AMBER:"#64748B",cursor:"pointer",fontFamily:"inherit"}}>
            All
          </button>
          {PLATFORMS.map(p=>(
            <button key={p.id} onClick={()=>setFilterPlatform(filterPlatform===p.id?"all":p.id)}
              style={{padding:"4px 10px",borderRadius:20,border:`1.5px solid ${filterPlatform===p.id?p.color:p.color+"33"}`,background:filterPlatform===p.id?`${p.color}12`:"#fff",fontSize:11.5,fontWeight:filterPlatform===p.id?600:400,color:filterPlatform===p.id?p.color:"#94A3B8",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
              <i className={`ti ${p.icon}`} style={{fontSize:11}} aria-hidden="true"/>{p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Calendar views ── */}
      <div style={{maxWidth:1400,margin:"0 auto",padding:"16px 20px 60px"}}>

        {/* ══ MONTH VIEW ══ */}
        {view==="month" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:0}}>
            {/* Day header */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"#fff",borderRadius:"12px 12px 0 0",border:"1px solid #E8ECF4",borderBottom:"none"}}>
              {WEEKDAYS.map(d=>(
                <div key={d} style={{padding:"10px 8px",textAlign:"center",fontSize:11.5,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",borderRight:"1px solid #F1F5F9"}}>
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",border:"1px solid #E8ECF4",borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
              {monthDays.map((day, i) => {
                if (!day) return <div key={`e${i}`} style={{minHeight:90,background:"#F8F9FA",borderRight:"1px solid #F1F5F9",borderBottom:"1px solid #F1F5F9"}}/>
                const dateStr = isoDate(curYear, curMonth, day)
                const dayPosts = postsOnDate(dateStr)
                const sel = selectedDay === dateStr
                const tod = isToday(dateStr)
                return (
                  <div key={day} className={`day-cell${tod?" today":""}${sel?" selected":""}`}
                    style={{borderRight:"1px solid #F1F5F9",borderBottom:"1px solid #F1F5F9"}}
                    onClick={()=>{ setSelectedDay(dateStr); if(!dayPosts.length) openNew(dateStr) }}>
                    {/* Day number */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:tod?AMBER:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontSize:12,fontWeight:tod?700:400,color:tod?N:"#64748B"}}>{day}</span>
                      </div>
                      {dayPosts.length>0&&(
                        <button onClick={e=>{e.stopPropagation();openNew(dateStr)}}
                          style={{width:16,height:16,borderRadius:"50%",background:`${AMBER}22`,border:`1px solid ${AMBER}44`,fontSize:10,color:AMBER,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
                          +
                        </button>
                      )}
                    </div>
                    {/* Post chips */}
                    {dayPosts.slice(0,3).map(p=>{
                      const plat = PLATFORMS.find(pl=>pl.id===p.platforms?.[0])
                      const sc = STATUS_COLORS[p.status]||STATUS_COLORS.draft
                      return (
                        <div key={p.id} className="post-chip"
                          onClick={e=>{e.stopPropagation();openDetail(p)}}
                          style={{background:sc.bg,border:`1px solid ${sc.border}`,color:sc.text,display:"flex",alignItems:"center",gap:3}}>
                          {plat&&<i className={`ti ${plat.icon}`} style={{fontSize:9,color:plat.color,flexShrink:0}} aria-hidden="true"/>}
                          <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{p.title||p.content?.slice(0,25)||"Untitled"}</span>
                        </div>
                      )
                    })}
                    {dayPosts.length>3&&<div style={{fontSize:9,color:"#94A3B8",paddingLeft:2}}>+{dayPosts.length-3} more</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ══ WEEK VIEW ══ */}
        {view==="week" && (() => {
          // Find start of current week (Monday)
          const todayDate = new Date(curYear, curMonth, today.getDate())
          const dayOfWeek = todayDate.getDay()
          const monday = new Date(todayDate); monday.setDate(todayDate.getDate() - (dayOfWeek===0?6:dayOfWeek-1))
          const weekDays = Array.from({length:7},(_,i)=>{
            const d = new Date(monday); d.setDate(monday.getDate()+i)
            return d
          })
          return (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
                {weekDays.map((d,i)=>{
                  const dateStr = isoDate(d.getFullYear(),d.getMonth(),d.getDate())
                  const dayPosts = postsOnDate(dateStr)
                  const tod = isToday(dateStr)
                  return (
                    <div key={i} className="card" style={{border:tod?`2px solid ${AMBER}`:""}}>
                      <div style={{padding:"10px 12px",borderBottom:"1px solid #E8ECF4",background:tod?"#FFFBF2":"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div>
                          <div style={{fontSize:10.5,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".06em"}}>{WEEKDAYS_FULL[d.getDay()]}</div>
                          <div style={{fontSize:18,fontWeight:700,color:tod?AMBER:N,fontFamily:"Georgia,serif"}}>{d.getDate()}</div>
                        </div>
                        <button onClick={()=>openNew(dateStr)}
                          style={{width:24,height:24,borderRadius:7,background:AMBER,border:"none",color:N,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                      </div>
                      <div style={{padding:"8px 10px",minHeight:140,display:"flex",flexDirection:"column",gap:5}}>
                        {dayPosts.map(p=>{
                          const sc = STATUS_COLORS[p.status]||STATUS_COLORS.draft
                          return (
                            <div key={p.id} onClick={()=>openDetail(p)}
                              style={{padding:"7px 9px",borderRadius:8,background:sc.bg,border:`1px solid ${sc.border}`,cursor:"pointer",fontSize:12}}>
                              <div style={{fontWeight:600,color:N,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title||"Untitled"}</div>
                              <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                                {(p.platforms||[]).map(pl=>{
                                  const plat=PLATFORMS.find(x=>x.id===pl)
                                  return plat?<i key={pl} className={`ti ${plat.icon}`} style={{fontSize:10,color:plat.color}} aria-hidden="true"/>:null
                                })}
                                <span style={{fontSize:10,color:sc.text,marginLeft:"auto"}}>{p.time||""}</span>
                              </div>
                            </div>
                          )
                        })}
                        {dayPosts.length===0&&<div style={{fontSize:11.5,color:"#E2E8F0",textAlign:"center",margin:"auto"}}>No posts</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* ══ YEAR VIEW ══ */}
        {view==="year" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {MONTHS.map((month,mi)=>{
                const monthPosts = posts.filter(p=>{ const[y,m]=p.date?.split("-")||[]; return +y===curYear&&+m-1===mi&&(filterPlatform==="all"||p.platforms.includes(filterPlatform)) })
                const firstDay = getFirstDay(curYear,mi)
                const daysInMonth = getDaysInMonth(curYear,mi)
                const isCurrentMonth = mi===today.getMonth()&&curYear===today.getFullYear()
                return (
                  <div key={month} className="card" style={{border:isCurrentMonth?`2px solid ${AMBER}`:""}}
                    onClick={()=>{setCurMonth(mi);setView("month")}}>
                    <div style={{padding:"10px 14px",borderBottom:"1px solid #E8ECF4",background:isCurrentMonth?"#FFFBF2":"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
                      <span style={{fontSize:13,fontWeight:700,color:isCurrentMonth?AMBER:N,fontFamily:"Georgia,serif"}}>{month}</span>
                      {monthPosts.length>0&&(
                        <span style={{fontSize:10.5,fontWeight:700,padding:"2px 8px",borderRadius:20,background:AMBER,color:N}}>{monthPosts.length}</span>
                      )}
                    </div>
                    {/* Mini calendar grid */}
                    <div style={{padding:"8px 10px"}}>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:4}}>
                        {["S","M","T","W","T","F","S"].map((d,i)=>(
                          <div key={i} style={{textAlign:"center",fontSize:8,color:"#CBD5E1",fontWeight:600}}>{d}</div>
                        ))}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1}}>
                        {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
                        {Array.from({length:daysInMonth},(_,i)=>{
                          const d=i+1
                          const dateStr=isoDate(curYear,mi,d)
                          const hasPosts=postsOnDate(dateStr).length>0
                          const isTodays=isToday(dateStr)
                          return (
                            <div key={d} onClick={e=>{e.stopPropagation();setCurMonth(mi);setSelectedDay(dateStr);setView("month")}}
                              style={{width:"100%",aspectRatio:"1",borderRadius:3,background:isTodays?AMBER:hasPosts?`${AMBER}30`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:hasPosts||isTodays?"pointer":"default"}}>
                              <span style={{fontSize:8,fontWeight:hasPosts||isTodays?700:400,color:isTodays?N:hasPosts?AMBER:"#94A3B8"}}>{d}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {/* Platform breakdown */}
                    {monthPosts.length>0&&(
                      <div style={{padding:"6px 10px",borderTop:"1px solid #F1F5F9",display:"flex",gap:4,flexWrap:"wrap"}}>
                        {PLATFORMS.filter(p=>monthPosts.some(post=>post.platforms?.includes(p.id))).map(p=>(
                          <i key={p.id} className={`ti ${p.icon}`} style={{fontSize:11,color:p.color}} aria-hidden="true"/>
                        ))}
                        <span style={{fontSize:10,color:"#94A3B8",marginLeft:"auto"}}>
                          {monthPosts.filter(p=>p.status==="published").length} published
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Year stats */}
            <div className="card" style={{marginTop:16,padding:"16px 20px"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>
                {curYear} — Publishing overview
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(12,1fr)",gap:4,alignItems:"end",height:60}}>
                {yearMonthCounts.map((count,i)=>{
                  const max = Math.max(...yearMonthCounts,1)
                  const h = Math.max(4,(count/max)*52)
                  return (
                    <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                      <div onClick={()=>{setCurMonth(i);setView("month")}}
                        style={{width:"100%",height:h,borderRadius:"3px 3px 0 0",background:i===curMonth?AMBER:`${AMBER}44`,cursor:"pointer",transition:"background .15s"}}
                        title={`${MONTHS[i]}: ${count} posts`}/>
                      <span style={{fontSize:8.5,color:"#94A3B8"}}>{MONTHS[i].slice(0,3)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODAL ══ */}
      {modal && (
        <div className="modal-bg" onClick={e=>{if(e.target===e.currentTarget){setModal(null);setEditing(null)}}}>
          <div className="modal">

            {/* Detail view */}
            {modal==="detail" && editing && (() => {
              const sc = STATUS_COLORS[editing.status]||STATUS_COLORS.draft
              return (
                <div>
                  <div style={{padding:"18px 20px",borderBottom:"1px solid #E8ECF4",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:16,fontWeight:700,color:N,fontFamily:"Georgia,serif",marginBottom:4}}>{editing.title||"Untitled post"}</div>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{padding:"2px 9px",borderRadius:20,background:sc.bg,border:`1px solid ${sc.border}`,fontSize:11,fontWeight:600,color:sc.text}}>{sc.label}</span>
                        <span style={{fontSize:12,color:"#64748B"}}>{editing.date} {editing.time&&`at ${editing.time}`}</span>
                        {(editing.platforms||[]).map(pid=>{const p=PLATFORMS.find(x=>x.id===pid);return p?<i key={pid} className={`ti ${p.icon}`} style={{fontSize:14,color:p.color}} aria-hidden="true"/>:null})}
                      </div>
                    </div>
                    <button onClick={()=>{setModal(null);setEditing(null)}} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#94A3B8",lineHeight:1}}>×</button>
                  </div>

                  <div style={{padding:"16px 20px"}}>
                    {editing.content&&(
                      <div style={{fontSize:14,color:N,lineHeight:1.8,marginBottom:16,padding:"12px 14px",background:"#F8F9FA",borderRadius:10,whiteSpace:"pre-wrap",maxHeight:200,overflowY:"auto"}}>
                        {editing.content}
                      </div>
                    )}
                    {editing.notes&&<div style={{fontSize:12.5,color:"#64748B",marginBottom:14,padding:"9px 12px",background:"#FFFBF2",borderRadius:8,border:"1px solid rgba(239,159,39,.2)"}}><strong>Notes:</strong> {editing.notes}</div>}

                    {/* Publish result */}
                    {editing.publishResult&&(
                      <div style={{marginBottom:14}}>
                        {editing.publishResult.published?.map((p,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,background:"#E1F5EE",border:"1px solid #6EE7B7",marginBottom:4,fontSize:12.5,color:"#085041"}}>
                            <i className={`ti ${PLATFORMS.find(pl=>pl.id===p.platform)?.icon||"ti-check"}`} style={{fontSize:13}} aria-hidden="true"/>
                            <span style={{flex:1}}>Published to {p.platform}</span>
                            {p.url&&p.url!=="#"&&<a href={p.url} target="_blank" rel="noopener noreferrer" style={{color:"#085041",fontWeight:600,fontSize:11,textDecoration:"none"}}>View ↗</a>}
                          </div>
                        ))}
                        {editing.publishResult.failed?.map((f,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,background:"#FEF2F2",border:"1px solid #FECACA",marginBottom:4,fontSize:12.5,color:"#991B1B"}}>
                            <i className="ti ti-x" style={{fontSize:13}} aria-hidden="true"/>
                            {f.platform}: {f.error}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {editing.status!=="published"&&(
                        <button onClick={()=>publishPost(editing)} disabled={publishing===editing.id}
                          style={{flex:1,minWidth:120,padding:"10px",borderRadius:9,background:publishing===editing.id?"#F1F5F9":N,color:publishing===editing.id?"#94A3B8":CHALK,border:"none",cursor:publishing===editing.id?"not-allowed":"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                          {publishing===editing.id?<><div style={{width:13,height:13,border:"2px solid rgba(245,245,240,.3)",borderTopColor:CHALK,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Publishing…</>:<><i className="ti ti-send" style={{fontSize:12}} aria-hidden="true"/>Publish now</>}
                        </button>
                      )}
                      <button onClick={()=>openEdit(editing)}
                        style={{padding:"10px 16px",borderRadius:9,border:"1px solid #E2E8F0",background:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:13,color:"#64748B"}}>
                        Edit
                      </button>
                      <button onClick={()=>deletePost(editing.id)}
                        style={{padding:"10px 14px",borderRadius:9,border:"1px solid #FECACA",background:"#FEF2F2",cursor:"pointer",fontFamily:"inherit",fontSize:13,color:"#991B1B"}}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* New/Edit form */}
            {(modal==="new"||modal==="edit") && (
              <div>
                <div style={{padding:"18px 20px",borderBottom:"1px solid #E8ECF4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,color:N}}>
                    {modal==="edit"?"Edit post":"Schedule a post"}
                  </div>
                  <button onClick={()=>{setModal(null);setEditing(null)}} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#94A3B8",lineHeight:1}}>×</button>
                </div>
                <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:13}}>

                  {/* Title */}
                  <div>
                    <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:5}}>Post title / topic</label>
                    <input className="inp" placeholder="e.g. Why founders need autonomous business systems" value={form.title} onChange={e=>setF("title",e.target.value)}/>
                  </div>

                  {/* Content */}
                  <div>
                    <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:5}}>
                      Content
                      <a href="/studio" style={{marginLeft:8,fontSize:11,color:PINK,textDecoration:"none",fontWeight:400,textTransform:"none"}}>Generate in Content Studio ↗</a>
                    </label>
                    <textarea className="inp" rows={5} placeholder="Write or paste your post content here…" value={form.content} onChange={e=>setF("content",e.target.value)}/>
                  </div>

                  {/* Date + Time */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:5}}>Date *</label>
                      <input type="date" className="inp" value={form.date} onChange={e=>setF("date",e.target.value)}/>
                    </div>
                    <div>
                      <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:5}}>Time</label>
                      <input type="time" className="inp" value={form.time} onChange={e=>setF("time",e.target.value)}/>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div>
                    <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:8}}>Platforms</label>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      {PLATFORMS.map(p=>{
                        const sel=form.platforms.includes(p.id)
                        const conn=socialStatus[p.id]?.connected
                        return (
                          <button key={p.id} onClick={()=>togglePlatform(p.id)}
                            title={!conn?`Connect ${p.label} in Social Hub first`:""}
                            style={{display:"flex",alignItems:"center",gap:6,padding:"6px 13px",borderRadius:20,border:`1.5px solid ${sel?p.color:conn?"#E2E8F0":"#F1F5F9"}`,background:sel?`${p.color}12`:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:sel?600:400,color:sel?p.color:conn?N:"#CBD5E1"}}>
                            <i className={`ti ${p.icon}`} style={{fontSize:13,color:sel?p.color:conn?p.color:"#CBD5E1"}} aria-hidden="true"/>
                            {p.label}
                            {conn&&<div style={{width:5,height:5,borderRadius:"50%",background:"#1D9E75"}}/>}
                          </button>
                        )
                      })}
                    </div>
                    {connectedPlatforms.length===0&&<div style={{fontSize:12,color:"#F59E0B",marginTop:6}}>No accounts connected. <a href="/social" style={{color:AMBER,fontWeight:600}}>Connect in Social Hub →</a></div>}
                  </div>

                  {/* Content type + Status */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:5}}>Content type</label>
                      <select className="inp" value={form.type} onChange={e=>setF("type",e.target.value)}>
                        {CONTENT_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:5}}>Status</label>
                      <select className="inp" value={form.status} onChange={e=>setF("status",e.target.value)}>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={{fontSize:10.5,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:5}}>Notes (optional)</label>
                    <input className="inp" placeholder="Campaign notes, hashtags, media URL…" value={form.notes} onChange={e=>setF("notes",e.target.value)}/>
                  </div>

                  {/* Buttons */}
                  <div style={{display:"flex",gap:9,paddingTop:4}}>
                    <button onClick={savePost}
                      style={{flex:1,padding:"12px",borderRadius:10,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700}}>
                      {modal==="edit"?"Save changes":"Add to calendar"}
                    </button>
                    {modal==="edit"&&form.platforms?.length>0&&form.status!=="published"&&(
                      <button onClick={()=>{savePost();editing&&publishPost(editing)}}
                        style={{flex:1,padding:"12px",borderRadius:10,background:N,color:CHALK,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                        <i className="ti ti-send" style={{fontSize:13}} aria-hidden="true"/>Save & Publish
                      </button>
                    )}
                    {modal==="edit"&&(
                      <button onClick={()=>deletePost(editing.id)}
                        style={{padding:"12px 16px",borderRadius:10,border:"1px solid #FECACA",background:"#FEF2F2",cursor:"pointer",fontFamily:"inherit",fontSize:13,color:"#991B1B"}}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
