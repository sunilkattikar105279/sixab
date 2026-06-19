// pages/website-builder.js — SIXXAB AI Website Builder
// Architecture: AI generates content JSON → hardcoded template renders it
// This guarantees perfect visuals every time — AI never writes CSS
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect, useRef } from "react"

const N="#0A0E1A",AMBER="#EF9F27",CHALK="#F5F5F0",GREEN="#1D9E75"

const STORE="sixxab_wb3_projects"
function loadProjects(){try{return JSON.parse(localStorage.getItem(STORE)||"[]")}catch{return[]}}
function saveProjects(p){try{localStorage.setItem(STORE,JSON.stringify(p.slice(0,20)))}catch{}}

const TEMPLATES=[
  {id:"corporate",label:"Corporate",colors:["#0f1b2d","#0ea5e9"],desc:"Tech, Finance, Legal"},
  {id:"bold",     label:"Bold",     colors:["#09090b","#f97316"],desc:"Startups, Agencies"},
  {id:"elegant",  label:"Elegant",  colors:["#1c1917","#d4af37"],desc:"Luxury, Real Estate"},
  {id:"fresh",    label:"Fresh",    colors:["#052e16","#16a34a"],desc:"Health, Wellness"},
  {id:"vibrant",  label:"Vibrant",  colors:["#1e1b4b","#7c3aed"],desc:"Creative, SaaS"},
]

const STARTERS=[
  {icon:"🏢",label:"Tech consulting",  prompt:"BigTech Consulting — enterprise AI transformation and IT strategy firm, Dallas TX. Services: Digital Transformation, Cloud Migration, Cybersecurity, Data Analytics, AI Strategy, CTO-as-a-Service. Phone: +1 972-555-0100, Email: info@bigtechconsulting.com"},
  {icon:"🔧",label:"HVAC business",    prompt:"Dallas Pro HVAC — local AC and heating company serving DFW since 2010. Services: AC repair, installation, maintenance plans, heating, commercial HVAC, emergency service 24/7. Phone: +1 214-555-0200, Email: service@dallaspro.com, Dallas TX"},
  {icon:"⚖️",label:"Law firm",         prompt:"Morrison & Associates — Dallas family law and estate planning firm. Practice areas: divorce, child custody, wills, trusts, business law, estate planning. Phone: +1 972-555-0300, Email: info@morrisonlaw.com"},
  {icon:"💪",label:"Personal trainer", prompt:"Jake Morrison Fitness — personal training in Dallas. Programs: weight loss, muscle building, athlete performance, online coaching. Phone: +1 214-555-0400, Email: jake@jakemorrisonfitness.com"},
  {icon:"🏠",label:"Real estate",      prompt:"Sarah Johnson Realty — luxury Dallas real estate agent. Services: buyer representation, seller marketing, property valuation, relocation, investment properties. Phone: +1 972-555-0500"},
  {icon:"🍕",label:"Restaurant",       prompt:"Rosario's Kitchen — authentic Italian restaurant in Dallas. Menu: handmade pasta, wood-fired pizza, Italian wines. Reservations: +1 214-555-0600, Email: hello@rosarioskitchen.com, 2450 McKinney Ave Dallas TX"},
]

export default function WebsiteBuilder(){
  const [projects,     setProjects]    = useState([])
  const [activeId,     setActiveId]    = useState(null)
  const [content,      setContent]     = useState(null)   // JSON content
  const [html,         setHtml]        = useState("")     // rendered HTML
  const [messages,     setMessages]    = useState([])
  const [input,        setInput]       = useState("")
  const [loading,      setLoading]     = useState(false)
  const [loadingStep,  setLoadingStep] = useState("")
  const [template,     setTemplate]    = useState("corporate")
  const [view,         setView]        = useState("preview")
  const [deploying,    setDeploying]   = useState(false)
  const [deployResult, setDeployResult]= useState(null)
  const [showProjects, setShowProjects]= useState(false)
  const [toast,        setToast]       = useState(null)
  const inputRef=useRef(null)
  const bottomRef=useRef(null)

  useEffect(()=>{setProjects(loadProjects())},[])
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"})},[messages,loading])

  function showToast(msg,ok=true){setToast({msg,ok});setTimeout(()=>setToast(null),4000)}

  // Re-render HTML when template changes
  useEffect(()=>{
    if(content) renderHtml(content,template)
  },[template])

  async function renderHtml(c,tmpl){
    try{
      const r=await fetch("/api/website-export",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:c,template:tmpl||template})})
      const d=await r.json()
      if(d.html) setHtml(d.html)
    }catch(e){console.error("render failed",e)}
  }

  function newProject(){
    setActiveId(null);setContent(null);setHtml("");setMessages([])
    setInput("");setDeployResult(null)
  }

  function upsertProject(c,h){
    const proj={id:activeId||Date.now(),name:c.businessName||"Website",content:c,html:h,template,updatedAt:new Date().toISOString()}
    const updated=activeId?projects.map(p=>p.id===activeId?proj:p):[proj,...projects].slice(0,20)
    setProjects(updated);saveProjects(updated)
    if(!activeId)setActiveId(proj.id)
  }

  function loadProject(p){
    setActiveId(p.id);setContent(p.content||null);setHtml(p.html||"")
    setTemplate(p.template||"corporate");setMessages([]);setDeployResult(null)
    setShowProjects(false);showToast("Loaded: "+p.name)
  }

  async function send(override){
    const msg=(override||input).trim()
    if(!msg||loading)return
    setInput("");setDeployResult(null)
    const userMsg={role:"user",content:msg,ts:Date.now()}
    setMessages(prev=>[...prev,userMsg])
    setLoading(true)

    try{
      // Step 1: Generate content JSON
      setLoadingStep("✦ Generating content…")
      const cr=await fetch("/api/website-content",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt:msg,currentContent:content||undefined})
      })
      const cd=await cr.json()
      if(!cr.ok||cd.error){
        setMessages(prev=>[...prev,{role:"assistant",content:"⚠️ "+(cd.error||"Content generation failed"),error:true,ts:Date.now()}])
        setLoading(false);return
      }
      const newContent=cd.content
      setContent(newContent)

      // Step 2: Render HTML from template
      setLoadingStep("✦ Building website…")
      const hr=await fetch("/api/website-export",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({content:newContent,template})
      })
      const hd=await hr.json()
      if(hd.html){
        setHtml(hd.html)
        setView("preview")
        upsertProject(newContent,hd.html)
      }

      const assistantMsg={
        role:"assistant",
        content:content
          ?"Done! Website updated with your changes."
          :`${newContent.businessName||"Your website"} is ready! I've built a complete site with navigation, hero, services, testimonials, process and contact sections.`,
        hasWebsite:!!hd.html,
        suggestions:newContent.suggestions||["Change the color scheme","Add a pricing section","Make the hero more impactful"],
        ts:Date.now()
      }
      setMessages(prev=>[...prev,assistantMsg])

    }catch(e){
      setMessages(prev=>[...prev,{role:"assistant",content:"⚠️ Network error: "+e.message,error:true,ts:Date.now()}])
    }
    setLoading(false);setLoadingStep("")
    setTimeout(()=>inputRef.current?.focus(),100)
  }

  async function deploy(){
    if(!html){showToast("Build a website first",false);return}
    setDeploying(true);setDeployResult(null)
    try{
      const name=content?.businessName||"sixxab-site"
      const slug=name.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,52)
      const r=await fetch("/api/deploy-vercel",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({html,projectName:slug})})
      const d=await r.json()
      setDeployResult(d)
      if(d.deployed)showToast("Deploying! Live in ~60 seconds 🚀")
      else if(d.needsSetup)showToast("Add VERCEL_TOKEN to deploy",false)
      else showToast(d.error||"Deploy failed",false)
    }catch(e){showToast("Error: "+e.message,false)}
    setDeploying(false)
  }

  function download(){
    if(!html)return
    const name=(content?.businessName||"website").toLowerCase().replace(/\s+/g,"-")
    const a=document.createElement("a")
    a.href=URL.createObjectURL(new Blob([html],{type:"text/html"}))
    a.download=name+".html";a.click();showToast("Downloaded!")
  }

  const hasHtml=html.length>0

  return(<>
    <Head><title>SIXXAB AI — Website Builder</title></Head>
    <style>{`
      *{box-sizing:border-box;margin:0;padding:0}
      html,body{height:100%;overflow:hidden}
      body{font-family:'Inter',system-ui,sans-serif;background:${N};color:${CHALK}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes blink{0%,100%{opacity:.3}50%{opacity:1}}
      .fu{animation:fadeUp .2s ease both}
      .chat-inp{flex:1;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);border-radius:12px;padding:11px 15px;font-size:14px;color:${CHALK};font-family:inherit;outline:none;resize:none;line-height:1.5;transition:border .15s;max-height:130px;min-height:44px}
      .chat-inp:focus{border-color:rgba(239,159,39,.7)}
      .chat-inp::placeholder{color:rgba(245,245,240,.3)}
      .pill{padding:5px 12px;border-radius:18px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(245,245,240,.6);font-size:12px;cursor:pointer;font-family:inherit;transition:all .14s;text-align:left;white-space:nowrap}
      .pill:hover{background:rgba(239,159,39,.12);border-color:rgba(239,159,39,.4);color:${AMBER}}
      .vtab{padding:5px 13px;border-radius:7px;font-size:12px;font-weight:500;cursor:pointer;border:none;font-family:inherit;transition:all .14s}
      .vtab-on{background:rgba(255,255,255,.14);color:${CHALK}}
      .vtab-off{background:transparent;color:rgba(245,245,240,.4)}
      .bubble-user{background:rgba(239,159,39,.13);border:1px solid rgba(239,159,39,.22);border-radius:14px 14px 3px 14px;padding:9px 13px;max-width:88%;font-size:13.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word;color:${CHALK}}
      .bubble-ai{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:14px 14px 14px 3px;padding:9px 13px;max-width:92%;font-size:13.5px;line-height:1.6;color:rgba(245,245,240,.85)}
      .bubble-err{background:rgba(220,38,38,.1);border-color:rgba(220,38,38,.25)}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(239,159,39,.4);border-radius:2px}
      @media(max-width:800px){.sidebar{width:100%!important;height:50vh!important;border-right:none!important;border-bottom:1px solid rgba(255,255,255,.08)!important}.main-panel{height:50vh!important}.hide-sm{display:none!important}}
    `}</style>

    <SixxabNav active="/website-builder"/>

    {toast&&<div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:9999,padding:"10px 16px",borderRadius:10,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 24px rgba(0,0,0,.35)"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

    <div style={{display:"flex",height:"calc(100vh - 52px)"}}>

      {/* SIDEBAR */}
      <div className="sidebar" style={{width:360,flexShrink:0,display:"flex",flexDirection:"column",borderRight:"1px solid rgba(255,255,255,.08)",background:"#0D1117"}}>

        {/* Header */}
        <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:32,height:32,borderRadius:9,background:"rgba(124,58,237,.22)",border:"1px solid rgba(124,58,237,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className="ti ti-wand" style={{fontSize:16,color:"#A78BFA"}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:CHALK}}>Website Builder</div>
              <div style={{fontSize:10.5,color:"rgba(245,245,240,.3)"}}>AI agent · describe → build → deploy</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setShowProjects(s=>!s)} style={{padding:"4px 10px",borderRadius:7,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",fontSize:11.5,color:"rgba(245,245,240,.5)",cursor:"pointer",fontFamily:"inherit"}}>
              {projects.length} saved
            </button>
            <button onClick={newProject} style={{padding:"4px 12px",borderRadius:7,background:AMBER,color:N,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ New</button>
          </div>
        </div>

        {/* Projects */}
        {showProjects&&(
          <div style={{borderBottom:"1px solid rgba(255,255,255,.07)",maxHeight:180,overflowY:"auto",flexShrink:0}}>
            {projects.length===0?<div style={{padding:"14px",fontSize:12.5,color:"rgba(245,245,240,.3)"}}>No saved projects yet.</div>
            :projects.map(p=>(
              <div key={p.id} onClick={()=>loadProject(p)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,.04)",background:activeId===p.id?"rgba(239,159,39,.08)":"transparent",borderLeft:activeId===p.id?`2px solid ${AMBER}`:"2px solid transparent",transition:"background .12s"}}
                onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                onMouseOut={e=>e.currentTarget.style.background=activeId===p.id?"rgba(239,159,39,.08)":"transparent"}
              >
                <i className="ti ti-file-code" style={{fontSize:13,color:"rgba(245,245,240,.3)",flexShrink:0}} aria-hidden="true"/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:500,color:CHALK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{fontSize:10.5,color:"rgba(245,245,240,.25)"}}>{new Date(p.updatedAt).toLocaleDateString()}</div>
                </div>
                <button onClick={e=>{e.stopPropagation();const u=projects.filter(x=>x.id!==p.id);setProjects(u);saveProjects(u);if(activeId===p.id)newProject()}} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(245,245,240,.2)",fontSize:16,padding:"0 3px"}}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Template picker */}
        {!hasHtml&&messages.length===0&&(
          <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
            <div style={{fontSize:10.5,fontWeight:700,color:"rgba(245,245,240,.25)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>Template style</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {TEMPLATES.map(t=>(
                <button key={t.id} onClick={()=>setTemplate(t.id)}
                  style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:8,border:`1.5px solid ${template===t.id?"rgba(239,159,39,.6)":"rgba(255,255,255,.08)"}`,background:template===t.id?"rgba(239,159,39,.1)":"rgba(255,255,255,.04)",cursor:"pointer",fontFamily:"inherit",fontSize:11.5,fontWeight:template===t.id?700:400,color:template===t.id?AMBER:"rgba(245,245,240,.5)",transition:"all .14s"}}>
                  <div style={{display:"flex",gap:2}}>
                    {t.colors.map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}
                  </div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
          {messages.length===0?(
            <div>
              <p style={{fontSize:13.5,fontWeight:600,color:CHALK,marginBottom:4}}>Describe your business</p>
              <p style={{fontSize:12.5,color:"rgba(245,245,240,.4)",lineHeight:1.65,marginBottom:18}}>Tell me your business name, what you do, your phone and email. I'll build a complete professional website instantly.</p>
              <div style={{fontSize:10.5,fontWeight:700,color:"rgba(245,245,240,.2)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Quick start</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {STARTERS.map((s,i)=>(
                  <button key={i} onClick={()=>send(s.prompt)}
                    style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.03)",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all .14s"}}
                    onMouseOver={e=>{e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.borderColor="rgba(255,255,255,.12)"}}
                    onMouseOut={e=>{e.currentTarget.style.background="rgba(255,255,255,.03)";e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}}>
                    <span style={{fontSize:20,flexShrink:0,lineHeight:1.2}}>{s.icon}</span>
                    <div>
                      <div style={{fontSize:12.5,fontWeight:600,color:CHALK,marginBottom:2}}>{s.label}</div>
                      <div style={{fontSize:11,color:"rgba(245,245,240,.3)",lineHeight:1.4}}>{s.prompt.slice(0,65)}…</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {messages.map((m,i)=>(
                <div key={i} className="fu" style={{animationDelay:`${i*.03}s`}}>
                  {m.role==="user"?(
                    <div style={{display:"flex",justifyContent:"flex-end"}}>
                      <div className="bubble-user">{m.content}</div>
                    </div>
                  ):(
                    <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                      <div style={{width:26,height:26,borderRadius:7,flexShrink:0,marginTop:2,background:"rgba(124,58,237,.25)",border:"1px solid rgba(124,58,237,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <i className="ti ti-robot" style={{fontSize:13,color:"#A78BFA"}} aria-hidden="true"/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        {m.hasWebsite&&(
                          <button onClick={()=>setView("preview")}
                            style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"8px 12px",borderRadius:9,marginBottom:8,background:"rgba(29,158,117,.15)",border:"2px solid rgba(29,158,117,.4)",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all .15s"}}
                            onMouseOver={e=>e.currentTarget.style.background="rgba(29,158,117,.25)"}
                            onMouseOut={e=>e.currentTarget.style.background="rgba(29,158,117,.15)"}>
                            <i className="ti ti-eye" style={{fontSize:14,color:"#6EE7B7"}} aria-hidden="true"/>
                            <span style={{fontSize:13,color:"#6EE7B7",fontWeight:700}}>✓ Website ready — click to preview</span>
                            <span style={{fontSize:11,color:"rgba(245,245,240,.4)",marginLeft:"auto",fontFamily:"monospace"}}>{(html.length/1024).toFixed(0)}KB</span>
                          </button>
                        )}
                        <div className={`bubble-ai${m.error?" bubble-err":""}`}>{m.content}</div>
                        {m.suggestions?.length>0&&(
                          <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:5}}>
                            {m.suggestions.map((s,j)=><button key={j} className="pill" onClick={()=>send(s)}>{s}</button>)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading&&(
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <div style={{width:26,height:26,borderRadius:7,flexShrink:0,background:"rgba(124,58,237,.25)",border:"1px solid rgba(124,58,237,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{width:11,height:11,border:"2px solid rgba(167,139,250,.3)",borderTopColor:"#A78BFA",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div className="bubble-ai" style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      {[0,1,2].map(j=><div key={j} style={{width:5,height:5,borderRadius:"50%",background:"rgba(245,245,240,.4)",animation:`blink 1.2s ${j*.2}s ease infinite`}}/>)}
                      <span style={{fontSize:12,color:"rgba(245,245,240,.4)"}}>{loadingStep||"Working…"}</span>
                    </div>
                    {/* Template selector during build */}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {TEMPLATES.map(t=>(
                        <button key={t.id} onClick={()=>setTemplate(t.id)}
                          style={{display:"flex",alignItems:"center",gap:5,padding:"4px 9px",borderRadius:7,border:`1px solid ${template===t.id?"rgba(239,159,39,.5)":"rgba(255,255,255,.07)"}`,background:template===t.id?"rgba(239,159,39,.08)":"transparent",cursor:"pointer",fontFamily:"inherit",fontSize:11,color:template===t.id?AMBER:"rgba(245,245,240,.4)"}}>
                          {t.colors.map((c,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:c}}/>)}
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <textarea ref={inputRef} className="chat-inp" rows={1}
              placeholder={hasHtml?"Refine: change colors, add pricing, update copy…":"Describe your business and website…"}
              value={input}
              onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,130)+"px"}}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}}
            />
            <button onClick={()=>send()} disabled={!input.trim()||loading}
              style={{width:42,height:42,borderRadius:11,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:input.trim()&&!loading?AMBER:"rgba(255,255,255,.06)",border:"none",cursor:input.trim()&&!loading?"pointer":"not-allowed",transition:"all .15s"}}>
              <i className="ti ti-send" style={{fontSize:17,color:input.trim()&&!loading?N:"rgba(245,245,240,.3)"}} aria-hidden="true"/>
            </button>
          </div>
          <div style={{fontSize:10.5,color:"rgba(245,245,240,.2)",marginTop:5}}>Enter to send · Shift+Enter for new line</div>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="main-panel" id="wb-preview-panel" style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,background:"#111827"}}>

        {/* Toolbar */}
        <div style={{height:46,flexShrink:0,display:"flex",alignItems:"center",padding:"0 14px",gap:8,borderBottom:"1px solid rgba(255,255,255,.07)",background:"#0D1117"}}>
          <div style={{display:"flex",gap:2,background:"rgba(255,255,255,.05)",borderRadius:8,padding:3}}>
            {[["preview","👁 Preview"],["split","Split"],["code","Code"]].map(([v,l])=>(
              <button key={v} className={`vtab ${view===v?"vtab-on":"vtab-off"}`} onClick={()=>setView(v)}>{l}</button>
            ))}
          </div>
          {hasHtml&&<span style={{fontSize:11.5,color:"rgba(245,245,240,.3)",marginLeft:4}}>{(html.length/1024).toFixed(0)}KB</span>}
          {/* Template switcher in toolbar */}
          {hasHtml&&(
            <div style={{display:"flex",gap:4,marginLeft:8}}>
              {TEMPLATES.map(t=>(
                <button key={t.id} onClick={()=>setTemplate(t.id)} title={t.label}
                  style={{display:"flex",gap:2,padding:"4px 7px",borderRadius:6,border:`1px solid ${template===t.id?"rgba(239,159,39,.5)":"rgba(255,255,255,.08)"}`,background:template===t.id?"rgba(239,159,39,.08)":"transparent",cursor:"pointer"}}>
                  {t.colors.map((c,i)=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:c}}/>)}
                </button>
              ))}
            </div>
          )}
          <div style={{marginLeft:"auto",display:"flex",gap:7}}>
            {hasHtml&&(
              <>
                <button onClick={()=>{const w=window.open("","_blank");w.document.write(html);w.document.close()}}
                  style={{padding:"5px 11px",borderRadius:7,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",fontSize:12,color:"rgba(245,245,240,.6)",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                  <i className="ti ti-external-link" style={{fontSize:11}} aria-hidden="true"/> Open
                </button>
                <button onClick={download}
                  style={{padding:"5px 11px",borderRadius:7,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",fontSize:12,color:"rgba(245,245,240,.6)",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                  <i className="ti ti-download" style={{fontSize:11}} aria-hidden="true"/> HTML
                </button>
                <button onClick={deploy} disabled={deploying}
                  style={{padding:"6px 18px",borderRadius:8,fontSize:13,fontWeight:700,border:"none",cursor:deploying?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,background:deploying?"rgba(255,255,255,.06)":AMBER,color:deploying?"rgba(245,245,240,.3)":N}}>
                  {deploying?<><div style={{width:12,height:12,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"spin .8s linear infinite"}}/> Deploying…</>:<><i className="ti ti-brand-vercel" style={{fontSize:13}} aria-hidden="true"/> Deploy to Vercel</>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Deploy banner */}
        {deployResult&&(
          <div style={{padding:"9px 16px",flexShrink:0,display:"flex",alignItems:"center",gap:12,background:deployResult.deployed?"rgba(29,158,117,.1)":deployResult.needsSetup?"rgba(239,159,39,.08)":"rgba(220,38,38,.1)",borderBottom:`1px solid ${deployResult.deployed?"rgba(29,158,117,.2)":deployResult.needsSetup?"rgba(239,159,39,.2)":"rgba(220,38,38,.2)"}`}}>
            {deployResult.deployed?<>
              <div style={{width:7,height:7,borderRadius:"50%",background:GREEN}}/>
              <span style={{fontSize:13,color:"#6EE7B7",fontWeight:500}}>Deploying — live in ~60 seconds</span>
              <a href={deployResult.url} target="_blank" rel="noopener noreferrer" style={{fontSize:12.5,color:GREEN,fontWeight:700,textDecoration:"none",marginLeft:"auto"}}>{deployResult.url} ↗</a>
            </>:deployResult.needsSetup?<>
              <span style={{fontSize:12.5,color:AMBER}}>⚙️ Add VERCEL_TOKEN in Vercel project → Settings → Environment Variables → VERCEL_TOKEN</span>
              <button onClick={download} style={{marginLeft:"auto",padding:"5px 12px",borderRadius:7,background:AMBER,color:N,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Download HTML →</button>
            </>:<span style={{fontSize:12.5,color:"#FCA5A5"}}>{deployResult.error}</span>}
            <button onClick={()=>setDeployResult(null)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(245,245,240,.3)",fontSize:18,padding:"0 4px",marginLeft:8}}>×</button>
          </div>
        )}

        {/* Preview area */}
        <div style={{flex:1,overflow:"hidden",position:"relative"}}>
          {!hasHtml?(
            <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
              {loading?(
                <>
                  <div style={{width:72,height:72,borderRadius:20,background:"rgba(37,99,235,.1)",border:"1px solid rgba(37,99,235,.2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
                    <div style={{width:32,height:32,border:"3px solid rgba(37,99,235,.3)",borderTopColor:"#2563EB",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
                  </div>
                  <div style={{fontSize:18,fontWeight:600,color:"rgba(245,245,240,.5)",marginBottom:8}}>{loadingStep||"Building your website…"}</div>
                  <div style={{fontSize:13,color:"rgba(245,245,240,.25)",lineHeight:1.7,maxWidth:280}}>Generating content, applying template and rendering all sections. Usually 15–30 seconds.</div>
                </>
              ):(
                <>
                  <div style={{width:72,height:72,borderRadius:20,background:"rgba(124,58,237,.1)",border:"1px solid rgba(124,58,237,.2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
                    <i className="ti ti-device-desktop" style={{fontSize:36,color:"rgba(167,139,250,.4)"}} aria-hidden="true"/>
                  </div>
                  <div style={{fontSize:18,fontWeight:600,color:"rgba(245,245,240,.4)",marginBottom:8}}>Your website will appear here</div>
                  <div style={{fontSize:14,color:"rgba(245,245,240,.2)",lineHeight:1.7,maxWidth:320}}>Type a description in the chat or click a quick-start button. Your website appears here instantly.</div>
                </>
              )}
            </div>
          ):view==="code"?(
            <div style={{height:"100%",overflowY:"auto",padding:16,fontFamily:"'DM Mono',monospace",fontSize:11.5,lineHeight:1.65,color:"rgba(245,245,240,.6)",whiteSpace:"pre-wrap",wordBreak:"break-word",background:"#0D1117"}}>{html}</div>
          ):view==="preview"?(
            <iframe key={content?.businessName} srcDoc={html} style={{width:"100%",height:"100%",border:"none",display:"block",background:"#fff"}} title="Website preview"/>
          ):(
            <div style={{display:"flex",height:"100%"}}>
              <iframe key={content?.businessName} srcDoc={html} style={{flex:1,border:"none",borderRight:"1px solid rgba(255,255,255,.07)",background:"#fff",minWidth:0}} title="Website preview"/>
              <div style={{width:220,overflowY:"auto",padding:14,flexShrink:0}}>
                <div style={{fontSize:10.5,fontWeight:700,color:"rgba(245,245,240,.25)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Quick edits</div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {["Change to dark color scheme","Add a pricing section with 3 tiers","Make the hero headline bolder","Add more testimonials","Update the services section","Add an FAQ section","Change to warm colors","Add team member bios","Improve the contact form","Add a sticky top banner"].map((s,i)=>(
                    <button key={i} className="pill" onClick={()=>send(s)} style={{textAlign:"left"}}>{s}</button>
                  ))}
                </div>
                <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{fontSize:10.5,fontWeight:700,color:"rgba(245,245,240,.25)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Connect</div>
                  {[["📅 Schedule posts","/calendar"],["💬 Generate leads","/leads"],["📊 Social pages","/social"]].map(([l,h])=>(
                    <a key={h} href={h} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",textDecoration:"none",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                      <span style={{fontSize:12.5,color:"rgba(245,245,240,.5)"}}>{l}</span>
                      <span style={{fontSize:12,color:"rgba(245,245,240,.2)"}}>→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        {hasHtml&&(
          <div style={{flexShrink:0,padding:"10px 16px",borderTop:"1px solid rgba(255,255,255,.08)",background:"#0D1117",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{fontSize:12,color:"rgba(245,245,240,.4)",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:GREEN}}/>
              {content?.businessName||"Website"} · {(html.length/1024).toFixed(0)}KB
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={download} style={{padding:"7px 14px",borderRadius:8,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",fontSize:12.5,color:CHALK,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
                <i className="ti ti-download" style={{fontSize:12}} aria-hidden="true"/> Download HTML
              </button>
              <button onClick={()=>{const w=window.open("","_blank");w.document.write(html);w.document.close()}}
                style={{padding:"7px 14px",borderRadius:8,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",fontSize:12.5,color:CHALK,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
                <i className="ti ti-external-link" style={{fontSize:12}} aria-hidden="true"/> Open full screen
              </button>
              <button onClick={deploy} disabled={deploying}
                style={{padding:"8px 22px",borderRadius:9,fontSize:13.5,fontWeight:700,border:"none",cursor:deploying?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8,background:deploying?"rgba(255,255,255,.06)":AMBER,color:deploying?"rgba(245,245,240,.3)":N}}>
                {deploying?<><div style={{width:14,height:14,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"spin .8s linear infinite"}}/> Deploying…</>:<><i className="ti ti-brand-vercel" style={{fontSize:15}} aria-hidden="true"/> Deploy to Vercel →</>}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  </>)
}
