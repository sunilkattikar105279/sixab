// pages/website-builder.js — SIXXAB AI Website Builder
// Agent-based, conversational. Describe → Build → Refine → Deploy.
// Like Emergent: natural language drives everything.
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect, useRef, useCallback } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"
const GREEN = "#1D9E75", BLUE = "#2563EB", PINK = "#EC4899"

// ── Client storage ────────────────────────────────────────────────────────────
const CL_KEY = "sixxab_wb_v2_clients"
function loadClients() { try { return JSON.parse(localStorage.getItem(CL_KEY)||"[]") } catch { return [] } }
function saveClients(l) { try { localStorage.setItem(CL_KEY, JSON.stringify(l.slice(0,20))) } catch {} }

// ── Starter prompts shown on empty state ─────────────────────────────────────
const STARTERS = [
  { icon:"🏢", label:"Tech consulting firm", prompt:"Build a professional website for BigTech Consulting — an enterprise AI transformation and IT strategy consultancy based in Dallas, TX. Services: Digital Transformation, Cloud Migration, Cybersecurity, Data Analytics. Corporate blue and slate color scheme, authoritative typography." },
  { icon:"🔧", label:"HVAC business", prompt:"Build a website for Dallas Pro HVAC — a local air conditioning and heating company serving DFW. Include emergency contact button, services (AC repair, installation, maintenance plans), trust badges, 5-star reviews, and a strong local SEO focus." },
  { icon:"⚖️", label:"Law firm", prompt:"Create a website for Morrison & Associates — a Dallas family law and estate planning firm. Professional, trustworthy. Dark navy palette with gold accents. Include practice areas, attorney bio, consultation booking, FAQ, and client testimonials." },
  { icon:"🏠", label:"Real estate agent", prompt:"Build a website for Sarah Johnson Realty — a luxury real estate agent specialising in Dallas upscale properties. Elegant, warm. Services: buyer representation, seller marketing, property valuations. Include featured listings section and market reports." },
  { icon:"💪", label:"Personal trainer", prompt:"Create a website for Jake Morrison Fitness — an online and in-person personal training service in Dallas. Bold, energetic design. Programs: weight loss, muscle building, athlete training. Include before/after section, program pricing, and free consultation CTA." },
  { icon:"🍕", label:"Restaurant", prompt:"Build a website for Rosario's Kitchen — an authentic Italian restaurant in Dallas. Warm, inviting. Include menu highlights, reservation system, chef story, gallery, and location/hours." },
]

export default function WebsiteBuilder() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [clients,       setClients]      = useState([])
  const [activeId,      setActiveId]     = useState(null)
  const [messages,      setMessages]     = useState([])    // [{role,content,html?,suggestions?,ts}]
  const [currentHtml,   setCurrentHtml]  = useState("")
  const [input,         setInput]        = useState("")
  const [loading,       setLoading]      = useState(false)
  const [view,          setView]         = useState("split") // split | preview | code
  const [deploying,     setDeploying]    = useState(false)
  const [deployResult,  setDeployResult] = useState(null)
  const [showClients,   setShowClients]  = useState(false)
  const [toast,         setToast]        = useState(null)
  const [tokens,        setTokens]       = useState(0)
  const [bizName,       setBizName]      = useState("")
  const inputRef  = useRef(null)
  const chatRef   = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    const saved = loadClients()
    setClients(saved)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" })
  }, [messages, loading])

  function showToast(msg, ok=true) {
    setToast({msg,ok}); setTimeout(()=>setToast(null),4000)
  }

  // ── Client management ─────────────────────────────────────────────────────
  function newProject() {
    setActiveId(null); setMessages([]); setCurrentHtml("")
    setInput(""); setDeployResult(null); setBizName("")
  }

  function saveProject(html, msgs, name) {
    const id = activeId || Date.now()
    const proj = {
      id, name: name||bizName||"Untitled project",
      html, messages:msgs.slice(-10), // keep last 10
      updatedAt: new Date().toISOString(),
      preview: html.match(/<title>(.*?)<\/title>/i)?.[1] || name || "Website"
    }
    const updated = activeId
      ? clients.map(c => c.id===activeId ? proj : c)
      : [proj, ...clients].slice(0,20)
    setClients(updated); saveClients(updated)
    if (!activeId) setActiveId(id)
  }

  function loadProject(proj) {
    setActiveId(proj.id)
    setMessages(proj.messages || [])
    setCurrentHtml(proj.html || "")
    setBizName(proj.name)
    setDeployResult(null)
    setShowClients(false)
    showToast(`Loaded: ${proj.name}`)
  }

  function deleteProject(id) {
    const updated = clients.filter(c=>c.id!==id)
    setClients(updated); saveClients(updated)
    if (activeId===id) newProject()
    showToast("Deleted")
  }

  // ── Send message to agent ─────────────────────────────────────────────────
  const send = useCallback(async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput("")

    const userMsg = { role:"user", content:msg, ts:Date.now() }
    const next = [...messages, userMsg]
    setMessages(next)
    setLoading(true)

    // Extract business name from first message
    if (!bizName && messages.length === 0) {
      const nameMatch = msg.match(/for ([A-Z][A-Za-z\s&']+?)[\s,—–]|called ([A-Z][A-Za-z\s&']+)/i)
      if (nameMatch) setBizName((nameMatch[1]||nameMatch[2]).trim())
    }

    try {
      const r = await fetch("/api/website-agent", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          messages: next.map(m=>({role:m.role, content:m.content})),
          currentHtml: currentHtml || undefined,
          businessContext: bizName ? `Business name: ${bizName}` : undefined,
        })
      })

      const d = await r.json()
      if (!r.ok || d.error) {
        setMessages(m=>[...m,{ role:"assistant", content:`Error: ${d.error||"API call failed"}`, ts:Date.now() }])
        setLoading(false); return
      }

      const assistantMsg = {
        role: "assistant",
        content: d.reply || "Done!",
        html: d.html || null,
        suggestions: d.suggestions || [],
        conversational: d.conversational,
        ts: Date.now(),
      }

      const final = [...next, assistantMsg]
      setMessages(final)
      setTokens(t=>t+(d.tokens||0))

      if (d.html) {
        setCurrentHtml(d.html)
        saveProject(d.html, final, bizName)
      }

    } catch(e) {
      setMessages(m=>[...m,{ role:"assistant", content:`Network error: ${e.message}`, ts:Date.now() }])
    }

    setLoading(false)
    setTimeout(()=>inputRef.current?.focus(), 100)
  }, [input, messages, currentHtml, bizName, loading])

  // ── Deploy to Vercel ──────────────────────────────────────────────────────
  async function deploy() {
    if (!currentHtml) { showToast("Build a website first", false); return }
    setDeploying(true); setDeployResult(null)
    try {
      const slug = (bizName||"sixxab-site").toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")
      const r = await fetch("/api/deploy-vercel", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ html:currentHtml, projectName:slug, bizName })
      })
      const d = await r.json()
      setDeployResult(d)
      if (d.deployed) showToast("Deploying! Live in ~60 seconds 🚀")
      else if (d.needsSetup) showToast("Add VERCEL_TOKEN to deploy", false)
      else showToast(d.error||"Deploy failed",false)
    } catch(e) { showToast("Error: "+e.message,false) }
    setDeploying(false)
  }

  // ── Download HTML ─────────────────────────────────────────────────────────
  function download() {
    if (!currentHtml) return
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([currentHtml],{type:"text/html"}))
    a.download = `${(bizName||"website").toLowerCase().replace(/\s+/g,"-")}.html`
    a.click(); showToast("Downloaded!")
  }

  const hasWebsite = !!currentHtml
  const htmlSize   = currentHtml ? `${(currentHtml.length/1024).toFixed(0)}KB` : ""

  return (
    <>
      <Head>
        <title>SIXXAB AI — Website Builder · Agent-based</title>
        <meta name="description" content="Describe your business in plain language. AI builds your complete website instantly. Refine with conversation. Deploy to Vercel in one click."/>
      </Head>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0A0E1A;font-family:'Inter',system-ui,sans-serif;height:100vh;overflow:hidden}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        .fu{animation:fadeUp .25s ease both}
        /* Scrollbar */
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(239,159,39,.4);border-radius:2px}
        /* Input */
        .chat-inp{
          flex:1;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);
          border-radius:12px;padding:12px 16px;font-size:14px;color:#F5F5F0;
          font-family:inherit;outline:none;resize:none;line-height:1.55;
          transition:border .15s;max-height:120px;
        }
        .chat-inp:focus{border-color:rgba(239,159,39,.6)}
        .chat-inp::placeholder{color:rgba(245,245,240,.3)}
        /* Suggestion pill */
        .sugg{
          padding:6px 12px;border-radius:20px;border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.05);color:rgba(245,245,240,.6);
          font-size:12px;cursor:pointer;font-family:inherit;transition:all .15s;
          white-space:nowrap;text-align:left;
        }
        .sugg:hover{background:rgba(239,159,39,.12);border-color:rgba(239,159,39,.4);color:#EF9F27}
        /* View toggle */
        .vtab{
          padding:5px 12px;border-radius:7px;border:none;cursor:pointer;
          font-family:inherit;font-size:12px;font-weight:500;transition:all .14s;
        }
        .vtab.on{background:rgba(255,255,255,.12);color:#F5F5F0}
        .vtab.off{background:transparent;color:rgba(245,245,240,.4)}
        /* Project card */
        .proj-card{
          display:flex;align-items:center;gap:10px;padding:10px 14px;
          cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05);
          transition:background .12s;
        }
        .proj-card:hover{background:rgba(255,255,255,.04)}
        .proj-card.active{background:rgba(239,159,39,.08);border-left:2px solid #EF9F27}
      `}</style>

      <SixxabNav active="/website-builder"/>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",bottom:20,right:16,left:16,maxWidth:360,marginLeft:"auto",zIndex:999,padding:"10px 16px",borderRadius:10,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 24px rgba(0,0,0,.3)",animation:"fadeUp .25s ease"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

      {/* Main layout */}
      <div style={{display:"flex",height:"calc(100vh - 52px)"}}>

        {/* ── LEFT SIDEBAR: Projects + Chat ── */}
        <div style={{width:380,flexShrink:0,display:"flex",flexDirection:"column",borderRight:"1px solid rgba(255,255,255,.07)",background:"#0D1117"}}>

          {/* Sidebar header */}
          <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:8,background:"rgba(124,58,237,.25)",border:"1px solid rgba(124,58,237,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <i className="ti ti-device-desktop" style={{fontSize:14,color:"#A78BFA"}} aria-hidden="true"/>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:CHALK}}>Website Builder</div>
                <div style={{fontSize:10.5,color:"rgba(245,245,240,.35)"}}>AI agent · describe → build → deploy</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setShowClients(s=>!s)}
                style={{padding:"4px 10px",borderRadius:7,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",fontSize:11.5,color:"rgba(245,245,240,.5)",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                <i className="ti ti-folders" style={{fontSize:11}} aria-hidden="true"/>
                {clients.length}
              </button>
              <button onClick={newProject}
                style={{padding:"4px 10px",borderRadius:7,background:AMBER,color:N,border:"none",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                + New
              </button>
            </div>
          </div>

          {/* Projects drawer */}
          {showClients&&(
            <div style={{borderBottom:"1px solid rgba(255,255,255,.07)",maxHeight:200,overflowY:"auto",flexShrink:0}}>
              {clients.length===0 ? (
                <div style={{padding:"16px 14px",fontSize:12.5,color:"rgba(245,245,240,.3)"}}>No projects yet. Start building below.</div>
              ) : clients.map(c=>(
                <div key={c.id} className={`proj-card${activeId===c.id?" active":""}`} onClick={()=>loadProject(c)}>
                  <div style={{width:32,height:24,borderRadius:5,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",flexShrink:0,overflow:"hidden",fontSize:6,color:"rgba(245,245,240,.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {c.html?"HTML":"···"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12.5,fontWeight:500,color:CHALK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name||c.preview||"Untitled"}</div>
                    <div style={{fontSize:10.5,color:"rgba(245,245,240,.3)"}}>{new Date(c.updatedAt||Date.now()).toLocaleDateString()}</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();deleteProject(c.id)}} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(245,245,240,.2)",fontSize:15,padding:"0 2px"}}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Chat history */}
          <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"14px"}}>
            {messages.length===0 ? (
              // Empty state — starter prompts
              <div>
                <div style={{fontSize:13.5,fontWeight:600,color:CHALK,marginBottom:4}}>Describe your website</div>
                <div style={{fontSize:12.5,color:"rgba(245,245,240,.4)",lineHeight:1.6,marginBottom:16}}>Tell me about your business — name, industry, services, vibe. I'll build a complete professional website from your description.</div>
                <div style={{fontSize:10.5,fontWeight:700,color:"rgba(245,245,240,.25)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Quick start</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {STARTERS.map((s,i)=>(
                    <button key={i} onClick={()=>send(s.prompt)}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.03)",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all .14s"}}
                      onMouseOver={e=>{e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.borderColor="rgba(255,255,255,.12)"}}
                      onMouseOut={e=>{e.currentTarget.style.background="rgba(255,255,255,.03)";e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}}>
                      <span style={{fontSize:18,flexShrink:0}}>{s.icon}</span>
                      <div>
                        <div style={{fontSize:12.5,fontWeight:500,color:CHALK}}>{s.label}</div>
                        <div style={{fontSize:11,color:"rgba(245,245,240,.3)",lineHeight:1.4,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s.prompt.slice(0,80)}…</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Messages
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {messages.map((m,i)=>(
                  <div key={i} className="fu" style={{animationDelay:`${Math.min(i*0.04,0.3)}s`}}>
                    {m.role==="user" ? (
                      <div style={{display:"flex",justifyContent:"flex-end"}}>
                        <div style={{maxWidth:"85%",padding:"9px 13px",borderRadius:"13px 13px 3px 13px",background:"rgba(239,159,39,.15)",border:"1px solid rgba(239,159,39,.25)",fontSize:13,color:CHALK,lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                          {m.content}
                        </div>
                      </div>
                    ) : (
                      <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                        <div style={{width:26,height:26,borderRadius:7,background:"rgba(124,58,237,.25)",border:"1px solid rgba(124,58,237,.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                          <i className="ti ti-robot" style={{fontSize:12,color:"#A78BFA"}} aria-hidden="true"/>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          {m.html&&(
                            <div style={{display:"flex",alignItems:"center",gap:7,padding:"6px 10px",borderRadius:8,background:"rgba(29,158,117,.12)",border:"1px solid rgba(29,158,117,.25)",marginBottom:6}}>
                              <div style={{width:7,height:7,borderRadius:"50%",background:GREEN}}/>
                              <span style={{fontSize:12,color:"#6EE7B7",fontWeight:500}}>Website built</span>
                              <span style={{fontSize:11,color:"rgba(245,245,240,.3)",marginLeft:"auto"}}>{((m.html.length)/1024).toFixed(0)}KB</span>
                            </div>
                          )}
                          <div style={{fontSize:13,color:"rgba(245,245,240,.75)",lineHeight:1.65}}>{m.content}</div>
                          {m.suggestions?.length>0&&(
                            <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:5}}>
                              {m.suggestions.map((s,j)=>(
                                <button key={j} className="sugg" onClick={()=>send(s)}>{s}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {loading&&(
                  <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                    <div style={{width:26,height:26,borderRadius:7,background:"rgba(124,58,237,.25)",border:"1px solid rgba(124,58,237,.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <div style={{width:10,height:10,border:"2px solid rgba(167,139,250,.3)",borderTopColor:"#A78BFA",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
                    </div>
                    <div style={{padding:"9px 13px",borderRadius:"13px 13px 13px 3px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)"}}>
                      <div style={{display:"flex",gap:4,alignItems:"center"}}>
                        {[0,1,2].map(j=>(
                          <div key={j} style={{width:5,height:5,borderRadius:"50%",background:"rgba(245,245,240,.4)",animation:`pulse 1.2s ease ${j*0.2}s infinite`}}/>
                        ))}
                        <span style={{fontSize:12,color:"rgba(245,245,240,.4)",marginLeft:6}}>Building your website…</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <textarea
                ref={inputRef}
                className="chat-inp"
                placeholder={hasWebsite?"Refine: change colors, add a section, update copy…":"Describe your business and website…"}
                value={input}
                rows={1}
                onChange={e=>{
                  setInput(e.target.value)
                  e.target.style.height="auto"
                  e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"
                }}
                onKeyDown={e=>{
                  if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}
                }}
              />
              <button
                onClick={()=>send()}
                disabled={!input.trim()||loading}
                style={{width:40,height:40,borderRadius:10,background:input.trim()&&!loading?AMBER:"rgba(255,255,255,.06)",color:input.trim()&&!loading?N:"rgba(245,245,240,.3)",border:"none",cursor:input.trim()&&!loading?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                <i className="ti ti-send" style={{fontSize:16}} aria-hidden="true"/>
              </button>
            </div>
            {tokens>0&&<div style={{fontSize:10,color:"rgba(245,245,240,.2)",marginTop:5,textAlign:"right"}}>{tokens.toLocaleString()} tokens used this session</div>}
          </div>
        </div>

        {/* ── RIGHT: Preview + Code ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>

          {/* Preview toolbar */}
          <div style={{height:44,background:"#111827",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",padding:"0 14px",gap:10,flexShrink:0}}>
            {/* View tabs */}
            <div style={{display:"flex",gap:3,background:"rgba(255,255,255,.05)",borderRadius:8,padding:3}}>
              {[["split","Split"],["preview","Preview"],["code","Code"]].map(([v,l])=>(
                <button key={v} className={`vtab ${view===v?"on":"off"}`} onClick={()=>setView(v)}>{l}</button>
              ))}
            </div>

            {hasWebsite&&(
              <>
                <div style={{height:18,width:1,background:"rgba(255,255,255,.08)"}}/>
                <span style={{fontSize:11,color:"rgba(245,245,240,.3)"}}>{htmlSize}</span>
                {bizName&&<span style={{fontSize:12,color:"rgba(245,245,240,.4)",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{bizName}</span>}
              </>
            )}

            <div style={{marginLeft:"auto",display:"flex",gap:7}}>
              {hasWebsite&&(
                <>
                  <button onClick={()=>{const w=window.open("","_blank");w.document.write(currentHtml);w.document.close()}}
                    style={{padding:"5px 11px",borderRadius:7,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",fontSize:12,color:"rgba(245,245,240,.6)",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                    <i className="ti ti-external-link" style={{fontSize:11}} aria-hidden="true"/>Open
                  </button>
                  <button onClick={download}
                    style={{padding:"5px 11px",borderRadius:7,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",fontSize:12,color:"rgba(245,245,240,.6)",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                    <i className="ti ti-download" style={{fontSize:11}} aria-hidden="true"/>HTML
                  </button>
                  <button onClick={deploy} disabled={deploying}
                    style={{padding:"5px 14px",borderRadius:7,background:deploying?"rgba(255,255,255,.06)":N,border:`1px solid ${deploying?"rgba(255,255,255,.1)":"rgba(255,255,255,.2)"}`,fontSize:12,fontWeight:600,color:deploying?"rgba(245,245,240,.3)":CHALK,cursor:deploying?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
                    {deploying?<><div style={{width:10,height:10,border:"1.5px solid rgba(245,245,240,.2)",borderTopColor:CHALK,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Deploying…</>:<><i className="ti ti-brand-vercel" style={{fontSize:11}} aria-hidden="true"/>Deploy</>}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Deploy result bar */}
          {deployResult&&(
            <div style={{padding:"9px 16px",background:deployResult.deployed?"rgba(29,158,117,.12)":deployResult.needsSetup?"rgba(239,159,39,.08)":"rgba(220,38,38,.1)",borderBottom:`1px solid ${deployResult.deployed?"rgba(29,158,117,.25)":deployResult.needsSetup?"rgba(239,159,39,.2)":"rgba(220,38,38,.2)"}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
              {deployResult.deployed ? (
                <>
                  <div style={{width:7,height:7,borderRadius:"50%",background:GREEN}}/>
                  <span style={{fontSize:13,color:"#6EE7B7",fontWeight:500}}>Deploying to Vercel — live in ~60 seconds</span>
                  <a href={deployResult.url} target="_blank" rel="noopener noreferrer"
                    style={{fontSize:12.5,color:GREEN,fontWeight:600,textDecoration:"none",marginLeft:"auto"}}>{deployResult.url} ↗</a>
                </>
              ) : deployResult.needsSetup ? (
                <>
                  <span style={{fontSize:12.5,color:AMBER,fontWeight:500}}>⚙️ Add VERCEL_TOKEN to Vercel env vars to enable one-click deploy</span>
                  <button onClick={download} style={{marginLeft:"auto",padding:"4px 11px",borderRadius:7,background:AMBER,color:N,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Download HTML instead →</button>
                </>
              ) : (
                <span style={{fontSize:12.5,color:"#FCA5A5"}}>{deployResult.error}</span>
              )}
              <button onClick={()=>setDeployResult(null)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(245,245,240,.3)",fontSize:16,marginLeft:deployResult.deployed?8:"auto",padding:0}}>×</button>
            </div>
          )}

          {/* Preview / Code area */}
          <div style={{flex:1,overflow:"hidden",display:"flex"}}>
            {!hasWebsite ? (
              // No website yet
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"rgba(245,245,240,.2)"}}>
                <i className="ti ti-device-desktop" style={{fontSize:56,marginBottom:16,opacity:.3}} aria-hidden="true"/>
                <div style={{fontSize:16,fontWeight:500,color:"rgba(245,245,240,.4)",marginBottom:8}}>Your website will appear here</div>
                <div style={{fontSize:13,color:"rgba(245,245,240,.2)",maxWidth:340,textAlign:"center",lineHeight:1.65}}>
                  Describe your business in the chat panel. The AI agent will build a complete professional website in seconds.
                </div>
              </div>
            ) : view==="code" ? (
              // Code view
              <div style={{flex:1,overflowY:"auto",padding:"16px",fontFamily:"'DM Mono',monospace",fontSize:11.5,lineHeight:1.6,color:"rgba(245,245,240,.6)",whiteSpace:"pre-wrap",wordBreak:"break-word",background:"#0D1117"}}>
                {currentHtml}
              </div>
            ) : view==="preview" ? (
              // Full preview
              <iframe
                key={currentHtml.length}
                srcDoc={currentHtml}
                style={{flex:1,border:"none",background:"#fff"}}
                sandbox="allow-scripts allow-same-origin"
                title="Website preview"
              />
            ) : (
              // Split view
              <div style={{flex:1,display:"flex"}}>
                <iframe
                  key={currentHtml.length}
                  srcDoc={currentHtml}
                  style={{flex:1,border:"none",borderRight:"1px solid rgba(255,255,255,.07)",background:"#fff",minWidth:0}}
                  sandbox="allow-scripts allow-same-origin"
                  title="Website preview"
                />
                <div style={{width:280,overflowY:"auto",padding:"14px",flexShrink:0}}>
                  <div style={{fontSize:10.5,fontWeight:700,color:"rgba(245,245,240,.25)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:12}}>Quick edits</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {[
                      "Change the color scheme to dark navy and gold",
                      "Make the hero section more impactful with a stronger headline",
                      "Add a pricing section with 3 tiers",
                      "Add more social proof and client logos",
                      "Make the contact form more prominent",
                      "Add an FAQ section with 6 questions",
                      "Change the font to something more modern",
                      "Add a team section with 3 bios",
                      "Make it more mobile-friendly",
                      "Add a video embed section",
                    ].map((s,i)=>(
                      <button key={i} className="sugg" onClick={()=>send(s)} style={{textAlign:"left"}}>{s}</button>
                    ))}
                  </div>
                  {hasWebsite&&(
                    <div style={{marginTop:16,padding:"12px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}}>
                      <div style={{fontSize:11,fontWeight:600,color:"rgba(245,245,240,.4)",marginBottom:8}}>Connect to SIXXAB</div>
                      {[["📅","/calendar","Schedule posts"],["💬","/leads","Generate leads"],["📊","/social","Social pages"]].map(([ico,href,l])=>(
                        <a key={href} href={href} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",textDecoration:"none",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                          <span>{ico}</span>
                          <span style={{fontSize:12,color:"rgba(245,245,240,.5)"}}>{l}</span>
                          <span style={{marginLeft:"auto",fontSize:11,color:"rgba(245,245,240,.2)"}}>→</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
