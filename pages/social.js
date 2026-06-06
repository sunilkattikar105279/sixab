// pages/social.js — SIXXAB AI · Social Media Hub
// Direct OAuth connections: LinkedIn, Twitter/X, Facebook, Instagram, YouTube
// No third-party tools — posts directly via official APIs
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

const PLATFORMS = [
  {
    id: "linkedin", label: "LinkedIn", icon: "ti-brand-linkedin", color: "#0A66C2",
    bg: "#EEF3FB", desc: "Posts, articles and company page updates",
    scope: "Posts · Company pages · Professional network",
    setupSteps: [
      "Go to linkedin.com/developers → Create app",
      "Add product: 'Share on LinkedIn' and 'Sign In with LinkedIn using OpenID Connect'",
      "Set Redirect URL: https://startupsinabox.com/api/social/callback/linkedin",
      "Copy Client ID and Client Secret to Vercel env vars",
    ],
    envVars: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"],
  },
  {
    id: "twitter", label: "Twitter / X", icon: "ti-brand-x", color: "#000000",
    bg: "#F7F7F7", desc: "Tweets, threads and profile posts",
    scope: "Tweets · Threads · Quote tweets",
    setupSteps: [
      "Go to developer.twitter.com → Projects & Apps → Create app",
      "Enable OAuth 2.0 with Read and Write permissions",
      "Set Callback URL: https://startupsinabox.com/api/social/callback/twitter",
      "Copy Client ID and Client Secret to Vercel env vars",
    ],
    envVars: ["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"],
  },
  {
    id: "facebook", label: "Facebook", icon: "ti-brand-facebook", color: "#1877F2",
    bg: "#EBF2FD", desc: "Page posts, stories and reels",
    scope: "Page posts · Stories · Group posts",
    setupSteps: [
      "Go to developers.facebook.com → Create app → Business type",
      "Add Facebook Login and Pages API products",
      "Set Redirect URI: https://startupsinabox.com/api/social/callback/facebook",
      "Copy App ID and App Secret to Vercel env vars",
      "Submit app for Facebook review (required for pages_manage_posts permission)",
    ],
    envVars: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"],
  },
  {
    id: "instagram", label: "Instagram", icon: "ti-brand-instagram", color: "#E1306C",
    bg: "#FDF0F5", desc: "Feed posts and Reels (via Facebook Business)",
    scope: "Feed posts · Reels · Carousels",
    setupSteps: [
      "Instagram uses your Facebook App — connect Facebook first",
      "Link your Instagram Business account to a Facebook Page (in Meta Business Suite)",
      "The Facebook connection will automatically detect your Instagram account",
      "Requires Instagram Business or Creator account (not personal)",
    ],
    envVars: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"],
  },
  {
    id: "youtube", label: "YouTube", icon: "ti-brand-youtube", color: "#FF0000",
    bg: "#FFF0F0", desc: "Community posts and video descriptions",
    scope: "Community posts · Video uploads · Channel",
    setupSteps: [
      "Go to console.cloud.google.com → APIs → YouTube Data API v3",
      "Create OAuth 2.0 credentials → Web application type",
      "Set Redirect URI: https://startupsinabox.com/api/social/callback/youtube",
      "Use same GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET as your Google Sign-in",
    ],
    envVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
]

const HISTORY_KEY = "sixxab_social_history"

export default function SocialHub() {
  const router = useRouter()
  const [status,      setStatus]      = useState({})
  const [loading,     setLoading]     = useState(true)
  const [publishing,  setPublishing]  = useState(false)
  const [selected,    setSelected]    = useState([])
  const [content,     setContent]     = useState("")
  const [mediaUrl,    setMediaUrl]    = useState("")
  const [scheduleAt,  setScheduleAt]  = useState("")
  const [result,      setResult]      = useState(null)
  const [setupPlatform,setSetupPlatform] = useState(null)
  const [history,     setHistory]     = useState([])
  const [activeTab,   setActiveTab]   = useState("connect") // connect | publish | history | setup
  const [toast,       setToast]       = useState(null)

  function showToast(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),4000) }

  // Load connection status + query params
  useEffect(() => {
    fetchStatus()
    try { setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]")) } catch {}
    // Handle OAuth callback
    const { connected, error, desc } = router.query
    if (connected) {
      showToast(`${connected.charAt(0).toUpperCase()+connected.slice(1)} connected successfully!`)
      router.replace("/social", undefined, { shallow:true })
    }
    if (error) {
      const msg = desc ? decodeURIComponent(desc) : error.replace(/_/g," ")
      showToast(msg, false)
      setActiveTab("setup") // send them to setup so they can see what to fix
      router.replace("/social", undefined, { shallow:true })
    }
  }, [router.query])

  async function fetchStatus() {
    setLoading(true)
    try {
      const r = await fetch("/api/social/status")
      const d = await r.json()
      setStatus(d.status || {})
    } catch { setStatus({}) }
    setLoading(false)
  }

  async function connect(platformId) {
    // First probe the auth endpoint — if env vars are missing it returns JSON error
    try {
      const probe = await fetch(`/api/social/auth?platform=${platformId}&_probe=1`)
      // If the route doesn't exist at all (404 HTML page) tell the user
      if (probe.status === 404) {
        showToast("API route not found — make sure pages/api/social/auth.js is pushed to GitHub", false)
        setActiveTab("setup")
        return
      }
      // If the route returns a JSON error (missing env var) show it
      const ct = probe.headers.get("content-type") || ""
      if (ct.includes("application/json")) {
        const d = await probe.json()
        if (d.error) {
          showToast(d.error + " — see Setup tab", false)
          setActiveTab("setup")
          return
        }
      }
    } catch {}
    // All good — redirect to OAuth flow
    window.location.href = `/api/social/auth?platform=${platformId}&redirect=/social`
  }

  async function disconnect(platformId) {
    await fetch("/api/social/disconnect", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({platform:platformId}) })
    showToast(`${platformId} disconnected`)
    fetchStatus()
  }

  async function publish() {
    if (!content.trim()) { showToast("Enter content to post", false); return }
    if (!selected.length) { showToast("Select at least one platform", false); return }
    const notConnected = selected.filter(p => !status[p]?.connected)
    if (notConnected.length) { showToast(`Connect ${notConnected.join(", ")} first`, false); return }
    setPublishing(true); setResult(null)
    try {
      const r = await fetch("/api/social/publish", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ platforms:selected, content, mediaUrl, scheduleAt: scheduleAt||undefined })
      })
      const d = await r.json()
      setResult(d)
      // Save to history
      const item = { id:Date.now(), content:content.slice(0,120), platforms:selected, result:d, timestamp:new Date().toISOString() }
      const nh = [item,...history].slice(0,50)
      setHistory(nh); localStorage.setItem(HISTORY_KEY, JSON.stringify(nh))
      if (d.success) showToast(`Published to ${d.published?.length} platform${d.published?.length!==1?"s":""}!`)
      else showToast(`Published to ${d.published?.length||0}/${selected.length} — check results below`, d.published?.length>0)
    } catch { showToast("Network error — check connection", false) }
    setPublishing(false)
  }

  const connectedCount = Object.values(status).filter(s=>s?.connected).length

  return (
    <>
      <Head>
        <title>SIXXAB AI — Social Media Hub</title>
        <meta name="description" content="Publish directly to LinkedIn, Twitter/X, Facebook, Instagram and YouTube from SIXXAB AI Content Studio."/>
      </Head>
      <style>{`
        body{background:#F4F4F0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .3s ease both}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        .inp{width:100%;padding:10px 13px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:13.5px;color:${N};background:#fff;transition:border .15s;font-family:inherit;outline:none}
        .inp:focus{border-color:${AMBER}}
        textarea.inp{resize:vertical;line-height:1.65}
        .tab-btn{padding:8px 16px;border-radius:9px;border:none;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;background:transparent;color:#64748B;transition:all .14s}
        .tab-btn.on{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.08)}
        .platform-pill{display:flex;align-items:center;gap:6px;padding:6px 13px;border-radius:20px;cursor:pointer;transition:all .14s;font-size:13px;font-weight:500;border:2px solid transparent}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${AMBER};border-radius:2px}
      `}</style>

      <SixxabNav active="/social"/>

      {/* Toast */}
      {toast && <div style={{position:"fixed",bottom:24,right:24,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)",animation:"fadeUp .3s ease"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

      {/* Header */}
      <div style={{background:N,padding:"16px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(239,159,39,.18)",border:"1.5px solid rgba(239,159,39,.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-share" style={{fontSize:20,color:AMBER}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                <h1 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:CHALK,letterSpacing:.5}}>
                  SIXXAB <span style={{color:AMBER,fontStyle:"italic"}}>Social Hub</span>
                </h1>
                <span style={{padding:"2px 9px",borderRadius:20,background:"rgba(239,159,39,.15)",border:"1px solid rgba(239,159,39,.35)",fontSize:10,fontWeight:600,color:AMBER}}>CMO Suite · Direct API</span>
              </div>
              <p style={{fontSize:12,color:"rgba(245,245,240,.45)"}}>LinkedIn · Twitter/X · Facebook · Instagram · YouTube · No third-party tools</p>
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            {[["Connected",connectedCount,"#1D9E75"],["Posts",history.length,AMBER]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center",padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
                <div style={{fontFamily:"Georgia",fontSize:18,color:c}}>{v}</div>
                <div style={{fontSize:9.5,color:"rgba(245,245,240,.4)",textTransform:"uppercase",letterSpacing:".07em"}}>{l}</div>
              </div>
            ))}
            <a href="/studio" style={{padding:"6px 14px",borderRadius:8,background:"rgba(212,83,126,.2)",border:"1px solid rgba(212,83,126,.4)",fontSize:12,fontWeight:500,color:"#F9A8D4",textDecoration:"none"}}>Content Studio →</a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"8px 4%",display:"flex",gap:4}}>
        <div style={{display:"flex",gap:2,background:"#F1F5F9",borderRadius:10,padding:3}}>
          {[["connect","🔗 Connect"],["publish","✦ Publish"],["history","📊 History"],["setup","⚙️ Dev Setup"]].map(([t,l])=>(
            <button key={t} className={`tab-btn${activeTab===t?" on":""}`} onClick={()=>setActiveTab(t)}>{l}</button>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center",fontSize:12,color:"#64748B"}}>
          <i className="ti ti-shield-check" style={{fontSize:12,color:"#1D9E75"}} aria-hidden="true"/>
          Direct OAuth — we never store your social passwords
        </div>
      </div>

      <div style={{maxWidth:1160,margin:"0 auto",padding:"20px 20px 60px"}}>

        {/* ══ CONNECT TAB ══ */}
        {activeTab==="connect" && (
          <div className="fu">
            <div style={{marginBottom:20}}>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:N,marginBottom:6}}>Connect your social accounts</h2>
              <p style={{fontSize:14,color:"#64748B",lineHeight:1.65}}>SIXXAB AI connects directly via each platform's official OAuth. Your credentials never touch our servers — only OAuth tokens that you can revoke anytime.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {PLATFORMS.map(p => {
                const s = status[p.id] || {}
                const isConnected = s.connected
                const isExpired   = s.expired
                return (
                  <div key={p.id} className="card" style={{border:`2px solid ${isConnected?p.color+"44":"#E2E8F0"}`}}>
                    <div style={{padding:"16px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #F1F5F9"}}>
                      <div style={{width:44,height:44,borderRadius:11,background:p.bg,border:`1px solid ${p.color}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <i className={`ti ${p.icon}`} style={{fontSize:22,color:p.color}} aria-hidden="true"/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:600,color:N,marginBottom:2}}>{p.label}</div>
                        <div style={{fontSize:12,color:"#64748B"}}>{p.scope}</div>
                      </div>
                      {/* Status indicator */}
                      <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,flexShrink:0,
                        background:isConnected?"#E1F5EE":isExpired?"#FEF3C7":"#F8F9FA",
                        border:`1px solid ${isConnected?"#6EE7B7":isExpired?"#FCD34D":"#E2E8F0"}`}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:isConnected?"#1D9E75":isExpired?"#F59E0B":"#CBD5E1"}}/>
                        <span style={{fontSize:11,fontWeight:600,color:isConnected?"#085041":isExpired?"#92400E":"#94A3B8"}}>
                          {loading?"Checking…":isConnected?"Connected":isExpired?"Expired":"Not connected"}
                        </span>
                      </div>
                    </div>

                    {/* Connected detail */}
                    {isConnected && s.name && (
                      <div style={{padding:"10px 18px",background:p.bg,borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",gap:10}}>
                        {s.picture && <img src={s.picture} alt={s.name} style={{width:28,height:28,borderRadius:"50%",flexShrink:0}}/>}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12.5,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                          {p.id==="facebook" && s.pages>0 && <div style={{fontSize:11,color:"#64748B"}}>{s.pages} page{s.pages!==1?"s":""} · {s.igAccounts||0} Instagram account{s.igAccounts!==1?"s":""}</div>}
                          {p.id==="instagram" && s.note && <div style={{fontSize:11,color:"#F59E0B"}}>{s.note}</div>}
                        </div>
                      </div>
                    )}

                    <div style={{padding:"12px 18px",display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{flex:1,fontSize:12,color:"#94A3B8"}}>{p.desc}</div>
                      <div style={{display:"flex",gap:7,flexShrink:0}}>
                        {isConnected && (
                          <button onClick={()=>disconnect(p.id)} style={{padding:"7px 13px",borderRadius:8,border:"1px solid #FECACA",background:"#FEF2F2",fontSize:12,fontWeight:500,color:"#991B1B",cursor:"pointer",fontFamily:"inherit"}}>
                            Disconnect
                          </button>
                        )}
                        <button onClick={()=>isConnected?setActiveTab("publish"):connect(p.id)}
                          style={{padding:"7px 14px",borderRadius:8,border:"none",background:isConnected?p.color:N,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                          <i className={`ti ${isConnected?"ti-send":"ti-plug"}`} style={{fontSize:11}} aria-hidden="true"/>
                          {isConnected?"Publish":"Connect"}
                        </button>
                      </div>
                    </div>
                    {!isConnected && (
                      <div style={{padding:"8px 18px",borderTop:"1px solid #F1F5F9",background:"#FAFAFA",display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                        {p.envVars.map(v=>(
                          <code key={v} style={{fontSize:10.5,padding:"2px 7px",borderRadius:5,background:"#F1F5F9",color:"#475569",border:"1px solid #E2E8F0"}}>{v}</code>
                        ))}
                        <button onClick={()=>{setSetupPlatform(p.id);setActiveTab("setup")}}
                          style={{marginLeft:"auto",fontSize:11,color:"#378ADD",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>
                          View setup guide ↗
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Architecture note */}
            <div style={{marginTop:16,padding:"14px 18px",borderRadius:12,background:N,border:"1px solid rgba(255,255,255,.07)",display:"flex",gap:14,alignItems:"flex-start"}}>
              <i className="ti ti-info-circle" style={{fontSize:18,color:AMBER,marginTop:1,flexShrink:0}} aria-hidden="true"/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:CHALK,marginBottom:4}}>How the direct integration works</div>
                <div style={{fontSize:12.5,color:"rgba(245,245,240,.5)",lineHeight:1.75}}>
                  Each platform's OAuth flow issues a token stored as an HttpOnly cookie — never in localStorage or our database. When you publish, SIXXAB AI calls the platform's official API directly from the server using that token. LinkedIn uses UGC Posts API. Twitter uses v2 Tweets API. Facebook and Instagram use the Graph API. YouTube uses the Data API v3. No third-party scheduling tool sits in the middle.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ PUBLISH TAB ══ */}
        {activeTab==="publish" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:16}} className="fu">
            <div>
              {/* Platform selector */}
              <div className="card" style={{padding:"14px 16px",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Select platforms to publish to</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {PLATFORMS.map(p=>{
                    const s = status[p.id]
                    const sel = selected.includes(p.id)
                    const conn = s?.connected
                    return (
                      <button key={p.id} className="platform-pill"
                        onClick={()=>conn&&setSelected(sel?selected.filter(x=>x!==p.id):[...selected,p.id])}
                        style={{borderColor:sel?p.color:(conn?"#E2E8F0":"#F1F5F9"),background:sel?`${p.color}12`:(conn?"#fff":"#FAFAFA"),color:sel?p.color:(conn?N:"#CBD5E1"),cursor:conn?"pointer":"not-allowed",opacity:conn?1:.6}}>
                        <i className={`ti ${p.icon}`} style={{fontSize:14,color:sel?p.color:(conn?p.color:"#CBD5E1")}} aria-hidden="true"/>
                        {p.label}
                        {conn
                          ? <div style={{width:6,height:6,borderRadius:"50%",background:"#1D9E75",marginLeft:2}}/>
                          : <div style={{fontSize:9,color:"#94A3B8",fontWeight:400}}>connect first</div>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Content editor */}
              <div className="card" style={{marginBottom:12}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:13,fontWeight:600,color:N}}>Post content</div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:11.5,color:content.length>280?"#DC2626":"#94A3B8"}}>{content.length} chars {selected.includes("twitter")&&"(280 max for X)"}</span>
                    <a href="/studio" style={{fontSize:12,color:AMBER,textDecoration:"none",fontWeight:500}}>← Generate in Studio</a>
                  </div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <textarea className="inp" rows={8}
                    placeholder="Write your post here, or generate content in the Content Studio and publish directly from there…"
                    value={content} onChange={e=>setContent(e.target.value)}
                    style={{fontSize:14,lineHeight:1.75,border:"none",padding:0,resize:"none"}}/>
                </div>
              </div>

              {/* Media URL */}
              <div className="card" style={{padding:"14px 16px",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Media URL (optional)</div>
                <input className="inp" placeholder="https://your-image-url.com/photo.jpg — required for Instagram posts"
                  value={mediaUrl} onChange={e=>setMediaUrl(e.target.value)}/>
                <div style={{fontSize:11.5,color:"#94A3B8",marginTop:6,lineHeight:1.55}}>
                  Instagram requires an image. Facebook, LinkedIn and Twitter use it as an attached image. YouTube uses it as a thumbnail.
                </div>
              </div>

              {/* Publish button */}
              <button onClick={publish} disabled={publishing||!selected.length||!content.trim()}
                style={{width:"100%",padding:13,borderRadius:11,background:publishing||!selected.length||!content.trim()?"#F1F5F9":N,color:publishing||!selected.length||!content.trim()?"#94A3B8":CHALK,border:"none",cursor:publishing||!selected.length||!content.trim()?"not-allowed":"pointer",fontFamily:"inherit",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:9,transition:"all .15s"}}>
                {publishing
                  ? <><div style={{width:16,height:16,border:"2px solid rgba(245,245,240,.25)",borderTopColor:CHALK,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Publishing…</>
                  : `✦ Publish to ${selected.length||"selected"} platform${selected.length!==1?"s":""} →`}
              </button>

              {/* Results */}
              {result && (
                <div className="card fu" style={{marginTop:12}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid #E8ECF4",background:result.success?"#F0FDF4":"#FEF3C7",display:"flex",alignItems:"center",gap:8}}>
                    <i className={`ti ti-${result.success?"circle-check":"alert-circle"}`} style={{fontSize:16,color:result.success?"#1D9E75":"#D97706"}} aria-hidden="true"/>
                    <span style={{fontSize:13,fontWeight:600,color:result.success?"#085041":"#92400E"}}>{result.summary}</span>
                  </div>
                  <div style={{padding:"12px 16px"}}>
                    {result.published?.map((p,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #F1F5F9"}}>
                        <i className={`ti ${PLATFORMS.find(pl=>pl.id===p.platform)?.icon||"ti-check"}`} style={{fontSize:15,color:PLATFORMS.find(pl=>pl.id===p.platform)?.color||"#1D9E75"}} aria-hidden="true"/>
                        <span style={{fontSize:13,color:N,flex:1}}>{p.platform}</span>
                        <span style={{fontSize:11,color:"#1D9E75",fontWeight:500}}>Published</span>
                        {p.url && p.url!="#" && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#378ADD",textDecoration:"none"}}>View ↗</a>}
                      </div>
                    ))}
                    {result.failed?.map((f,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:"1px solid #F1F5F9"}}>
                        <i className="ti ti-x" style={{fontSize:15,color:"#DC2626",marginTop:1}} aria-hidden="true"/>
                        <div style={{flex:1}}>
                          <span style={{fontSize:13,color:N}}>{f.platform}</span>
                          <div style={{fontSize:11.5,color:"#DC2626",marginTop:2}}>{f.error}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Schedule */}
              <div className="card" style={{padding:"14px 16px"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Schedule (optional)</div>
                <input type="datetime-local" className="inp" value={scheduleAt} onChange={e=>setScheduleAt(e.target.value)}/>
                <div style={{fontSize:11.5,color:"#94A3B8",marginTop:6}}>Leave empty to publish immediately</div>
                {scheduleAt && <button onClick={()=>setScheduleAt("")} style={{marginTop:6,fontSize:11.5,color:"#64748B",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0}}>Clear schedule</button>}
              </div>

              {/* Platform tips */}
              <div className="card" style={{padding:"14px 16px"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Platform tips</div>
                {[
                  {p:"LinkedIn",icon:"ti-brand-linkedin",c:"#0A66C2",tip:"Best time: Tue–Thu 8–10am. Keep under 700 chars. Personal posts 3× more reach than company pages."},
                  {p:"Twitter/X",icon:"ti-brand-x",c:"#000",tip:"Max 280 chars. Threads auto-split. Best time: 9am and 5pm weekdays."},
                  {p:"Facebook",icon:"ti-brand-facebook",c:"#1877F2",tip:"Images get 2.3× more engagement. Videos auto-play. Best: 1–3pm weekdays."},
                  {p:"Instagram",icon:"ti-brand-instagram",c:"#E1306C",tip:"Image required. Square (1:1) performs best. Captions up to 2,200 chars. Hashtags in first comment."},
                  {p:"YouTube",icon:"ti-brand-youtube",c:"#FF0000",tip:"Community posts need 500+ subscribers. Video titles under 60 chars. Best: Thursday–Saturday 12–4pm."},
                ].map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:9,padding:"8px 0",borderBottom:i<4?"1px solid #F1F5F9":"none",alignItems:"flex-start"}}>
                    <i className={`ti ${t.icon}`} style={{fontSize:13,color:t.c,marginTop:2,flexShrink:0}} aria-hidden="true"/>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:N,marginBottom:2}}>{t.p}</div>
                      <div style={{fontSize:11,color:"#64748B",lineHeight:1.55}}>{t.tip}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Content Studio link */}
              <div style={{background:N,borderRadius:13,padding:"14px 16px"}}>
                <div style={{fontSize:13,fontWeight:600,color:CHALK,marginBottom:6}}>Generate content first</div>
                <div style={{fontSize:12,color:"rgba(245,245,240,.5)",lineHeight:1.65,marginBottom:12}}>The Content Studio generates platform-optimised posts. LinkedIn posts, Twitter threads and Instagram carousels — all with the right format and length for each platform.</div>
                <a href="/studio" style={{display:"block",padding:"9px",borderRadius:9,background:AMBER,color:N,fontSize:13,fontWeight:700,textDecoration:"none",textAlign:"center"}}>Open Content Studio →</a>
              </div>
            </div>
          </div>
        )}

        {/* ══ HISTORY TAB ══ */}
        {activeTab==="history" && (
          <div className="fu">
            {history.length===0 ? (
              <div style={{textAlign:"center",padding:"60px",color:"#94A3B8"}}>
                <div style={{fontSize:28,marginBottom:10}}>📊</div>
                <div style={{fontSize:14,fontWeight:500,marginBottom:6}}>No posts yet</div>
                <div style={{fontSize:13,marginBottom:16}}>Publish your first post and it will appear here with platform results.</div>
                <button onClick={()=>setActiveTab("publish")} style={{padding:"9px 20px",borderRadius:9,background:N,color:CHALK,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>Start publishing →</button>
              </div>
            ) : history.map((h,i)=>(
              <div key={h.id} className="card" style={{padding:"14px 16px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13.5,color:N,lineHeight:1.6,marginBottom:8}}>{h.content}{h.content.length>=120?"…":""}</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {h.result?.published?.map((p,j)=>(
                        <span key={j} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:20,background:"#E1F5EE",fontSize:11,color:"#085041",fontWeight:500}}>
                          <i className={`ti ${PLATFORMS.find(pl=>pl.id===p.platform)?.icon||"ti-check"}`} style={{fontSize:10}} aria-hidden="true"/>
                          {p.platform}
                        </span>
                      ))}
                      {h.result?.failed?.map((f,j)=>(
                        <span key={j} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:20,background:"#FEF2F2",fontSize:11,color:"#991B1B",fontWeight:500}}>
                          ✗ {f.platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:11,color:"#94A3B8",marginBottom:6}}>{new Date(h.timestamp).toLocaleDateString()}</div>
                    <button onClick={()=>{setContent(h.content);setSelected(h.platforms||[]);setActiveTab("publish")}}
                      style={{padding:"5px 11px",borderRadius:7,border:"1px solid #E2E8F0",background:"#F8F9FA",fontSize:11.5,color:"#64748B",cursor:"pointer",fontFamily:"inherit"}}>
                      Reuse
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ SETUP TAB ══ */}
        {activeTab==="setup" && (
          <div className="fu">
            <div style={{marginBottom:20}}>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:N,marginBottom:6}}>Developer setup guide</h2>
              <p style={{fontSize:14,color:"#64748B",lineHeight:1.65}}>
                SIXXAB AI publishes directly via each platform's official API. This requires creating a developer app on each platform and adding the credentials to Vercel. One-time setup, 5–15 minutes per platform.
              </p>
            </div>

            {/* Vercel env vars checklist */}
            <div className="card" style={{padding:"16px 18px",marginBottom:16,border:"2px solid rgba(239,159,39,.3)",background:"#FFFBF2"}}>
              <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:10}}>Step 1 — Add to Vercel Environment Variables</div>
              <div style={{fontSize:12.5,color:"#64748B",marginBottom:12}}>Go to vercel.com → your project → Settings → Environment Variables. Add each of these:</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  ["LINKEDIN_CLIENT_ID","From LinkedIn developer app"],
                  ["LINKEDIN_CLIENT_SECRET","From LinkedIn developer app"],
                  ["TWITTER_CLIENT_ID","From Twitter developer portal"],
                  ["TWITTER_CLIENT_SECRET","From Twitter developer portal"],
                  ["FACEBOOK_APP_ID","From Meta for Developers"],
                  ["FACEBOOK_APP_SECRET","From Meta for Developers"],
                  ["GOOGLE_CLIENT_ID","Reuse existing (already set for Google login)"],
                  ["GOOGLE_CLIENT_SECRET","Reuse existing (already set for Google login)"],
                ].map(([k,v])=>(
                  <div key={k} style={{padding:"8px 11px",borderRadius:9,background:"#F8F9FA",border:"1px solid #E2E8F0"}}>
                    <code style={{fontSize:11.5,color:N,fontWeight:700,display:"block",marginBottom:2}}>{k}</code>
                    <div style={{fontSize:11,color:"#94A3B8"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-platform setup */}
            {(setupPlatform ? PLATFORMS.filter(p=>p.id===setupPlatform) : PLATFORMS).filter(p=>p.id!=="instagram").map(p=>(
              <div key={p.id} className="card" style={{marginBottom:12}}>
                <div style={{padding:"13px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",gap:10}}>
                  <i className={`ti ${p.icon}`} style={{fontSize:18,color:p.color}} aria-hidden="true"/>
                  <div style={{fontSize:14,fontWeight:600,color:N}}>{p.label}</div>
                  <span style={{fontSize:11.5,color:"#64748B",marginLeft:"auto"}}>{p.desc}</span>
                </div>
                <div style={{padding:"14px 18px"}}>
                  {p.setupSteps.map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:`${p.color}18`,border:`1px solid ${p.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:p.color,flexShrink:0}}>{i+1}</div>
                      <div style={{fontSize:13,color:N,lineHeight:1.6,paddingTop:2}}>{s}</div>
                    </div>
                  ))}
                  <div style={{marginTop:10,padding:"9px 12px",background:"#EFF6FF",borderRadius:9,border:"1px solid #BFDBFE",fontSize:12.5,color:"#1E40AF"}}>
                    <strong>Redirect URI:</strong> <code>https://startupsinabox.com/api/social/callback/{p.id==="youtube"?"youtube":p.id==="facebook"?"facebook":p.id}</code>
                  </div>
                </div>
              </div>
            ))}

            {/* Instagram note */}
            <div className="card" style={{padding:"14px 18px",border:"1px solid #FECACA",background:"#FFF0F5"}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <i className="ti ti-brand-instagram" style={{fontSize:18,color:"#E1306C",marginTop:1,flexShrink:0}} aria-hidden="true"/>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:4}}>Instagram — uses Facebook OAuth</div>
                  <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.65}}>Instagram Business publishing is handled via the Facebook Graph API. Connect Facebook first, then link your Instagram Business account to your Facebook Page in Meta Business Suite (business.facebook.com). The Facebook callback automatically detects linked Instagram accounts. Personal Instagram accounts cannot publish via API — you need a Business or Creator account.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
