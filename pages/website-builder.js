// pages/website-builder.js — SIXXAB AI · Website Builder MicroSaaS
// Dedicated API (/api/website-build) with 8000 tokens — no truncation
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect, useRef } from "react"
const N="#0A0E1A",AMBER="#EF9F27",CHALK="#F5F5F0",GREEN="#1D9E75",BLUE="#378ADD",PINK="#EC4899",PURPLE="#7C3AED"
const TEMPLATES=[
  {id:"corporate",label:"Corporate",     accent:"#0EA5E9",bg:"#0F1B2D",desc:"Tech, Finance, Legal"},
  {id:"bold",     label:"Bold & Modern", accent:"#EF9F27",bg:"#0A0E1A",desc:"Startups, SaaS, Agencies"},
  {id:"warm",     label:"Warm & Local",  accent:"#F97316",bg:"#7C2D12",desc:"HVAC, Plumbing, Local"},
  {id:"fresh",    label:"Fresh & Clean", accent:"#10B981",bg:"#064E3B",desc:"Health, Wellness"},
  {id:"luxury",   label:"Luxury",        accent:"#D4AF37",bg:"#1F1F1F",desc:"Real Estate, Photography"},
]
const INDUSTRIES=["Technology Consulting","IT Consulting & MSP","Digital Marketing Agency","HVAC & Air Conditioning","Real Estate","Legal Services","Business Consulting","Financial Planning","Health & Wellness","Roofing & Construction","Landscaping","Plumbing & Electrical","Auto Repair","Restaurant & Food","Retail & E-commerce","Photography","Cleaning Services","Other"]
const STAGES=[
  {id:"design",label:"Design Brief",  icon:"ti-palette",        color:AMBER, desc:"AI strategy, copy and structure"},
  {id:"build", label:"Build Website", icon:"ti-code",           color:BLUE,  desc:"Complete HTML/CSS — 13 sections"},
  {id:"deploy",label:"Deploy",        icon:"ti-brand-vercel",   color:GREEN, desc:"Vercel one-click or download"},
  {id:"social",label:"Social Pages",  icon:"ti-share",          color:PINK,  desc:"LinkedIn, Facebook, Instagram, X"},
]
const CLIENTS_KEY="sixxab_wb_clients"
const EMPTY={bizName:"",industry:"Technology Consulting",tagline:"",services:"",phone:"",email:"",address:"Dallas, TX",website:"",template:"corporate"}

export default function WebsiteBuilder() {
  const [clients,      setClients]      = useState([])
  const [activeId,     setActiveId]     = useState(null)
  const [form,         setForm]         = useState({...EMPTY})
  const [stage,        setStage]        = useState("design")
  const [loading,      setLoading]      = useState(false)
  const [designOut,    setDesignOut]    = useState("")
  const [htmlCode,     setHtmlCode]     = useState("")
  const [progress,     setProgress]     = useState(0)
  const [previewing,   setPreviewing]   = useState(false)
  const [deploying,    setDeploying]    = useState(false)
  const [deployResult, setDeployResult] = useState(null)
  const [socialP,      setSocialP]      = useState("linkedin")
  const [socialOut,    setSocialOut]    = useState("")
  const [socialLoading,setSocialLoading]= useState(false)
  const [copied,       setCopied]       = useState(false)
  const [toast,        setToast]        = useState(null)
  const [showClients,  setShowClients]  = useState(false)
  const timer = useRef(null)

  useEffect(()=>{ try{setClients(JSON.parse(localStorage.getItem(CLIENTS_KEY)||"[]"))}catch{} },[])

  function showToast(msg,ok=true){setToast({msg,ok});setTimeout(()=>setToast(null),4000)}
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))

  function newClient(){
    setForm({...EMPTY});setActiveId(null)
    setDesignOut("");setHtmlCode("");setDeployResult(null);setSocialOut("")
    setStage("design");setPreviewing(false)
  }

  function saveClient(){
    const now=new Date().toISOString()
    let updated
    if(activeId){
      updated=clients.map(c=>c.id===activeId?{...c,...form,updatedAt:now}:c)
    } else {
      const id=Date.now()
      updated=[...clients,{...form,id,createdAt:now}]
      setActiveId(id)
    }
    setClients(updated)
    try{localStorage.setItem(CLIENTS_KEY,JSON.stringify(updated))}catch{}
    showToast(form.bizName+" saved")
  }

  function loadClient(c){
    setForm({...EMPTY,...c});setActiveId(c.id)
    setDesignOut("");setHtmlCode("");setDeployResult(null);setSocialOut("")
    setStage("design");setPreviewing(false);setShowClients(false)
    showToast("Loaded "+c.bizName)
  }

  function deleteClient(id){
    const updated=clients.filter(c=>c.id!==id)
    setClients(updated)
    try{localStorage.setItem(CLIENTS_KEY,JSON.stringify(updated))}catch{}
    if(activeId===id)newClient()
    showToast("Deleted")
  }

  async function generate(action){
    if(!form.bizName||!form.industry){showToast("Enter business name and industry",false);return}
    setLoading(true)
    if(action==="design")setDesignOut("")
    if(action==="build"){setHtmlCode("");setPreviewing(false);setProgress(0);timer.current=setInterval(()=>setProgress(p=>p<88?p+(p<50?3:p<75?2:1):p),900)}
    try{
      const r=await fetch("/api/website-build",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,bizData:form})})
      const d=await r.json()
      if(action==="build"){clearInterval(timer.current);setProgress(100)}
      if(!r.ok||d.error){showToast(d.error||action+" failed",false);setLoading(false);return}
      if(action==="design"){
        setDesignOut(d.result||"")
        saveClient()
      } else {
        const raw=d.result||""
        const match=raw.match(/<!DOCTYPE html>[\s\S]*<\/html>/i)
        const clean=match?match[0]:"<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><title>"+form.bizName+"</title></head><body>"+raw+"</body></html>"
        setHtmlCode(clean)
        showToast("Built! Preview below → deploy when ready")
        // Save html to client record
        if(activeId){
          const updated=clients.map(c=>c.id===activeId?{...c,...form,html:clean,builtAt:new Date().toISOString()}:c)
          setClients(updated);try{localStorage.setItem(CLIENTS_KEY,JSON.stringify(updated))}catch{}
        }
      }
    } catch(e){clearInterval(timer.current);showToast("Error: "+e.message,false)}
    setLoading(false)
  }

  async function deployToVercel(){
    if(!htmlCode){showToast("Build the website first",false);setStage("build");return}
    setDeploying(true);setDeployResult(null)
    try{
      const slug=form.bizName.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")
      const r=await fetch("/api/deploy-vercel",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({html:htmlCode,projectName:slug,bizName:form.bizName})})
      const d=await r.json()
      setDeployResult(d)
      if(d.deployed){
        showToast("Deploying "+form.bizName+" — live in ~60s!")
        if(activeId){
          const updated=clients.map(c=>c.id===activeId?{...c,vercelUrl:d.url,deployedAt:new Date().toISOString(),status:"deployed"}:c)
          setClients(updated);try{localStorage.setItem(CLIENTS_KEY,JSON.stringify(updated))}catch{}
        }
      } else if(d.needsSetup){
        showToast("Add VERCEL_TOKEN to Vercel env vars — guide below",false)
      } else {
        showToast(d.error||"Deploy failed",false)
      }
    } catch(e){showToast("Error: "+e.message,false)}
    setDeploying(false)
  }

  async function generateSocial(){
    if(!form.bizName){showToast("Enter business name",false);return}
    setSocialLoading(true);setSocialOut("")
    try{
      const r=await fetch("/api/create-social-page",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,platform:socialP})})
      const d=await r.json()
      setSocialOut(d.result||d.error||"Error")
    } catch(e){setSocialOut("Error: "+e.message)}
    setSocialLoading(false)
  }

  function downloadHtml(){
    if(!htmlCode)return
    const a=document.createElement("a")
    a.href=URL.createObjectURL(new Blob([htmlCode],{type:"text/html"}))
    a.download=form.bizName.toLowerCase().replace(/\s+/g,"-")+".html"
    a.click();showToast("Downloaded!")
  }

  const tmpl=TEMPLATES.find(t=>t.id===form.template)||TEMPLATES[0]
  const curStage=STAGES.find(s=>s.id===stage)||STAGES[0]

  return(
    <>
      <Head><title>SIXXAB AI — Website Builder MicroSaaS</title></Head>
      <style>{`
        body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .3s ease both}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        .inp{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13px;color:${N};background:#fff;font-family:inherit;outline:none;transition:border .15s}
        .inp:focus{border-color:${AMBER}}
        select.inp{cursor:pointer}
        textarea.inp{resize:vertical;line-height:1.65}
        .lbl{font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.09em;display:block;margin-bottom:5px}
        .stab{display:flex;align-items:center;gap:6px;padding:10px 16px;cursor:pointer;border:none;background:transparent;font-family:inherit;font-size:12.5px;font-weight:500;color:#64748B;border-bottom:2px solid transparent;transition:all .14s;white-space:nowrap}
        .stab.on{color:var(--sc);border-bottom-color:var(--sc);font-weight:700}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${AMBER};border-radius:2px}
        @media(max-width:900px){.wbg{grid-template-columns:1fr!important}}
      `}</style>

      <SixxabNav active="/website-builder"/>
      {toast&&<div style={{position:"fixed",bottom:20,right:16,left:16,maxWidth:380,marginLeft:"auto",zIndex:999,padding:"11px 16px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 20px rgba(0,0,0,.15)",animation:"fadeUp .3s ease"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

      {/* Header */}
      <div style={{background:N,padding:"13px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(124,58,237,.18)",border:"1.5px solid rgba(124,58,237,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className="ti ti-device-desktop" style={{fontSize:22,color:"#A78BFA"}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                <h1 style={{fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,color:CHALK,letterSpacing:.3}}>SIXXAB <span style={{color:"#A78BFA",fontStyle:"italic"}}>Website Builder</span></h1>
                <span style={{padding:"2px 9px",borderRadius:20,background:"rgba(124,58,237,.15)",border:"1px solid rgba(124,58,237,.35)",fontSize:10,fontWeight:600,color:"#C4B5FD"}}>MicroSaaS · COO Suite</span>
              </div>
              <p style={{fontSize:11.5,color:"rgba(245,245,240,.4)"}}>Design → Build → Preview → Deploy Vercel → Social Media Pages</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setShowClients(s=>!s)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",cursor:"pointer",fontFamily:"inherit",color:CHALK,fontSize:12}}>
              <i className="ti ti-users" style={{fontSize:12,color:AMBER}} aria-hidden="true"/>{clients.length} clients
            </button>
            <button onClick={newClient} style={{padding:"7px 14px",borderRadius:8,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
              <i className="ti ti-plus" style={{fontSize:11}} aria-hidden="true"/>New client
            </button>
          </div>
        </div>
      </div>

      {/* Client panel */}
      {showClients&&(
        <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"14px 4%"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:600,color:N}}>Client websites ({clients.length})</div>
            <button onClick={()=>setShowClients(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",fontSize:20}}>×</button>
          </div>
          {clients.length===0?<div style={{fontSize:13,color:"#94A3B8"}}>No clients yet. Add details below and click Save.</div>:(
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {clients.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",borderRadius:10,border:`1px solid ${activeId===c.id?AMBER:"#E2E8F0"}`,background:activeId===c.id?"#FFFBF2":"#F8F9FA",cursor:"pointer"}} onClick={()=>loadClient(c)}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:N}}>{c.bizName}</div>
                    <div style={{fontSize:11,color:"#94A3B8"}}>{c.industry}</div>
                    {c.vercelUrl&&<a href={c.vercelUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:10.5,color:GREEN,textDecoration:"none"}} onClick={e=>e.stopPropagation()}>Live site ↗</a>}
                  </div>
                  <button onClick={e=>{e.stopPropagation();deleteClient(c.id)}} style={{background:"none",border:"none",cursor:"pointer",color:"#FECACA",fontSize:16}}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stage tabs */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"0 4%",display:"flex",overflowX:"auto"}}>
        {STAGES.map(s=>(
          <button key={s.id} className={`stab${stage===s.id?" on":""}`} style={{"--sc":s.color}} onClick={()=>{setStage(s.id);setPreviewing(false)}}>
            <i className={`ti ${s.icon}`} style={{fontSize:12,color:stage===s.id?s.color:"#94A3B8"}} aria-hidden="true"/>
            {s.label}
            {s.id==="build"&&htmlCode&&<span style={{width:7,height:7,borderRadius:"50%",background:GREEN,display:"inline-block",marginLeft:2}}/>}
            {s.id==="deploy"&&deployResult?.deployed&&<span style={{width:7,height:7,borderRadius:"50%",background:GREEN,display:"inline-block",marginLeft:2}}/>}
          </button>
        ))}
      </div>

      {/* Build progress */}
      {loading&&stage==="build"&&progress>0&&progress<100&&(
        <div style={{background:"#fff",padding:"8px 4% 10px",borderBottom:"1px solid #E8ECF4"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,color:"#64748B",marginBottom:4}}><span>Building {form.bizName||"website"} — 13 sections, full HTML/CSS…</span><span>{progress}%</span></div>
          <div style={{height:5,borderRadius:3,background:"#F1F5F9",overflow:"hidden"}}><div style={{height:"100%",width:progress+"%",background:BLUE,borderRadius:3,transition:"width .8s ease"}}/></div>
        </div>
      )}

      <div style={{maxWidth:1280,margin:"0 auto",padding:"16px 16px 60px"}}>
        <div className="wbg" style={{display:"grid",gridTemplateColumns:"270px 1fr",gap:14,alignItems:"start"}}>

          {/* LEFT: form */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div className="card">
              <div style={{padding:"10px 13px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:12,fontWeight:700,color:N}}>{activeId?"Edit client":"New client"}</div>
                <button onClick={saveClient} style={{padding:"4px 11px",borderRadius:7,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11.5,fontWeight:700}}>Save</button>
              </div>
              <div style={{padding:"12px 13px",display:"flex",flexDirection:"column",gap:8}}>
                {[["bizName","Business name *","BigTech Consulting"],["tagline","Tagline","Transforming businesses through technology"],["phone","Phone","+1 (972) 000-0000"],["email","Email","info@business.com"],["address","Location","Dallas, TX"],["website","Website URL","https://"]].map(([k,l,ph])=>(
                  <div key={k}>
                    <label className="lbl">{l}</label>
                    <input className="inp" value={form[k]||""} onChange={e=>set(k,e.target.value)} placeholder={ph}/>
                  </div>
                ))}
                <div>
                  <label className="lbl">Industry *</label>
                  <select className="inp" value={form.industry} onChange={e=>set("industry",e.target.value)}>
                    {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Services (comma-separated)</label>
                  <textarea className="inp" rows={2} value={form.services||""} onChange={e=>set("services",e.target.value)} placeholder="Digital Transformation, IT Strategy, Cloud..."/>
                </div>
              </div>
            </div>

            {/* Template */}
            <div className="card" style={{padding:"12px 13px"}}>
              <div style={{fontSize:12,fontWeight:700,color:N,marginBottom:8}}>Template</div>
              {TEMPLATES.map(t=>(
                <div key={t.id} onClick={()=>set("template",t.id)}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:9,border:`1.5px solid ${form.template===t.id?t.accent:"#E2E8F0"}`,background:form.template===t.id?`${t.accent}10`:"#F8F9FA",cursor:"pointer",marginBottom:5,transition:"all .13s"}}>
                  <div style={{width:32,height:20,borderRadius:4,background:t.bg,flexShrink:0,border:"1px solid rgba(0,0,0,.08)",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,height:6,background:t.accent}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12.5,fontWeight:form.template===t.id?700:400,color:N}}>{t.label}</div>
                    <div style={{fontSize:10.5,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.desc}</div>
                  </div>
                  {form.template===t.id&&<div style={{width:7,height:7,borderRadius:"50%",background:t.accent,flexShrink:0}}/>}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: stage content */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>

            {/* DESIGN */}
            {stage==="design"&&(
              <div>
                <button onClick={()=>generate("design")} disabled={loading||!form.bizName}
                  style={{width:"100%",padding:13,borderRadius:11,background:loading||!form.bizName?"#F1F5F9":AMBER,color:loading||!form.bizName?"#94A3B8":N,border:"none",cursor:loading||!form.bizName?"not-allowed":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:9,marginBottom:12}}>
                  {loading?<><div style={{width:15,height:15,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Generating design strategy…</>:<><i className="ti ti-palette" style={{fontSize:14}} aria-hidden="true"/>Generate design brief & strategy →</>}
                </button>
                {designOut?(
                  <div className="card fu">
                    <div style={{padding:"11px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:13,fontWeight:600,color:N}}>Design brief — {form.bizName}</span>
                      <div style={{display:"flex",gap:7}}>
                        <button onClick={()=>navigator.clipboard.writeText(designOut).then(()=>showToast("Copied!"))} style={{padding:"5px 12px",borderRadius:7,background:"#F1F5F9",border:"1px solid #E2E8F0",fontSize:12,cursor:"pointer",fontFamily:"inherit",color:"#64748B"}}>Copy</button>
                        <button onClick={()=>setStage("build")} style={{padding:"5px 14px",borderRadius:7,background:BLUE,color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Build website →</button>
                      </div>
                    </div>
                    <div style={{padding:"16px 20px",fontSize:13.5,lineHeight:1.9,whiteSpace:"pre-wrap",maxHeight:600,overflowY:"auto",color:N}}>{designOut}</div>
                  </div>
                ):(
                  <div className="card" style={{padding:"52px 24px",textAlign:"center",color:"#94A3B8"}}>
                    <i className="ti ti-palette" style={{fontSize:44,color:"rgba(239,159,39,.25)",display:"block",marginBottom:14}} aria-hidden="true"/>
                    <div style={{fontSize:15,fontWeight:600,color:"#64748B",marginBottom:8}}>Design Brief</div>
                    <div style={{fontSize:13,lineHeight:1.7,maxWidth:360,margin:"0 auto"}}>AI generates a complete website strategy: brand positioning, site structure, all copy, SEO keywords and content for every section — specific to {form.bizName||"your business"} in {form.industry}.</div>
                  </div>
                )}
              </div>
            )}

            {/* BUILD */}
            {stage==="build"&&(
              <div>
                <button onClick={()=>generate("build")} disabled={loading||!form.bizName}
                  style={{width:"100%",padding:13,borderRadius:11,background:loading||!form.bizName?"#F1F5F9":BLUE,color:loading||!form.bizName?"#94A3B8":"#fff",border:"none",cursor:loading||!form.bizName?"not-allowed":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:9,marginBottom:12}}>
                  {loading?<><div style={{width:15,height:15,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Building complete website — 30–60 seconds…</>:<><i className="ti ti-code" style={{fontSize:14}} aria-hidden="true"/>Build complete HTML/CSS website →</>}
                </button>

                {!htmlCode&&!loading&&(
                  <div className="card" style={{marginBottom:12}}>
                    <div style={{padding:"12px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
                      <div style={{fontSize:13,fontWeight:700,color:N}}>What gets built for {form.bizName||"your business"}</div>
                      <div style={{fontSize:12,color:"#64748B"}}>Complete single-file HTML/CSS — 13 sections, real content, fully mobile-responsive</div>
                    </div>
                    <div style={{padding:"14px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                      {[["ti-layout-navbar","Sticky navigation + CTA"],["ti-stars","Full-viewport hero + animated stats"],["ti-grid-dots","6-card services grid"],["ti-quote","3 client testimonials"],["ti-list-numbers","4-step process section"],["ti-phone","Contact form + WhatsApp button"],["ti-device-mobile","100% mobile responsive"],["ti-brand-google","Google Analytics ready"],["ti-bolt","Scroll animations + hover effects"],["ti-receipt","Formspree contact form"]].map(([ico,label])=>(
                        <div key={label} style={{display:"flex",alignItems:"center",gap:7,fontSize:12.5,color:"#475569"}}>
                          <i className={`ti ${ico}`} style={{fontSize:12,color:GREEN,flexShrink:0}} aria-hidden="true"/>{label}
                        </div>
                      ))}
                    </div>
                    <div style={{padding:"9px 14px",borderTop:"1px solid #E8ECF4",background:"#FFFBF2",fontSize:12,color:"#92400E",display:"flex",gap:6,alignItems:"center"}}>
                      <i className="ti ti-info-circle" style={{fontSize:12}} aria-hidden="true"/>
                      Uses dedicated /api/website-build with 8,000 token limit — full HTML always generated, no truncation.
                    </div>
                  </div>
                )}

                {htmlCode&&(
                  <div className="card fu">
                    <div style={{padding:"11px 16px",borderBottom:"1px solid #E8ECF4",background:"#F0FDF4",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:GREEN}}/>
                        <span style={{fontSize:13,fontWeight:700,color:"#085041"}}>{form.bizName} — website ready</span>
                        <span style={{fontSize:11,color:"#64748B"}}>{(htmlCode.length/1024).toFixed(0)}KB</span>
                      </div>
                      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                        <button onClick={()=>setPreviewing(p=>!p)} style={{padding:"5px 12px",borderRadius:7,background:previewing?"#0A0E1A":"#EFF6FF",color:previewing?"#fff":"#1D4ED8",border:previewing?"none":"1px solid #BFDBFE",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>{previewing?"Hide":"👁 Preview"}</button>
                        <button onClick={downloadHtml} style={{padding:"5px 12px",borderRadius:7,background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#085041",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>↓ Download</button>
                        <button onClick={()=>navigator.clipboard.writeText(htmlCode).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500)})} style={{padding:"5px 12px",borderRadius:7,background:copied?GREEN:BLUE,color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"background .2s"}}>{copied?"✓ Copied":"Copy HTML"}</button>
                        <button onClick={()=>setStage("deploy")} style={{padding:"5px 14px",borderRadius:7,background:N,color:CHALK,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}><i className="ti ti-brand-vercel" style={{fontSize:11}} aria-hidden="true"/>Deploy →</button>
                      </div>
                    </div>
                    {previewing&&(
                      <div style={{borderBottom:"1px solid #E8ECF4"}}>
                        <div style={{padding:"6px 14px",background:"#F1F5F9",fontSize:11,color:"#64748B",display:"flex",alignItems:"center",gap:6}}>
                          <i className="ti ti-device-desktop" style={{fontSize:11}} aria-hidden="true"/>Live preview — scroll to see all 13 sections
                          <button onClick={()=>{const w=window.open("","_blank");w.document.write(htmlCode);w.document.close()}} style={{marginLeft:"auto",padding:"3px 8px",borderRadius:5,background:BLUE,color:"#fff",border:"none",fontSize:10.5,cursor:"pointer",fontFamily:"inherit"}}>Full screen ↗</button>
                        </div>
                        <iframe srcDoc={htmlCode} style={{width:"100%",height:580,border:"none",display:"block"}} sandbox="allow-scripts allow-same-origin" title="Website preview"/>
                      </div>
                    )}
                    {!previewing&&(
                      <div style={{padding:"12px 16px",fontSize:11,lineHeight:1.6,whiteSpace:"pre-wrap",maxHeight:380,overflowY:"auto",color:"#334155",fontFamily:"'DM Mono',monospace",background:"#F8FAFB"}}>
                        {htmlCode.slice(0,2500)}{htmlCode.length>2500&&"\n\n... ["+((htmlCode.length-2500)/1024).toFixed(0)+"KB more — click Preview or Copy HTML for full code] ..."}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* DEPLOY */}
            {stage==="deploy"&&(
              <div className="fu" style={{display:"flex",flexDirection:"column",gap:12}}>
                {!htmlCode&&(
                  <div style={{padding:"14px 18px",borderRadius:12,background:"#FEF3C7",border:"1px solid #FCD34D",fontSize:13,color:"#92400E",display:"flex",gap:10,alignItems:"center"}}>
                    <i className="ti ti-alert-triangle" style={{fontSize:16,flexShrink:0}} aria-hidden="true"/>
                    Build the website first (Step 02) before deploying.
                    <button onClick={()=>setStage("build")} style={{marginLeft:"auto",padding:"6px 14px",borderRadius:8,background:"#92400E",color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:600,whiteSpace:"nowrap"}}>Go to Build →</button>
                  </div>
                )}

                <div className="card">
                  <div style={{padding:"13px 16px",borderBottom:"1px solid #E8ECF4",background:"#F8F9FA",display:"flex",alignItems:"center",gap:10}}>
                    <i className="ti ti-brand-vercel" style={{fontSize:20,color:N}} aria-hidden="true"/>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:N}}>Deploy to Vercel</div>
                      <div style={{fontSize:12,color:"#64748B"}}>One-click · Free · Auto HTTPS · Global CDN · Live in 60s</div>
                    </div>
                    {deployResult?.deployed&&<span style={{marginLeft:"auto",padding:"3px 10px",borderRadius:20,background:"#E1F5EE",border:"1px solid #6EE7B7",fontSize:11,fontWeight:700,color:"#085041"}}>Live ✓</span>}
                  </div>
                  <div style={{padding:"16px"}}>
                    <button onClick={deployToVercel} disabled={deploying||!htmlCode}
                      style={{width:"100%",padding:13,borderRadius:10,background:deploying||!htmlCode?"#F1F5F9":N,color:deploying||!htmlCode?"#94A3B8":CHALK,border:"none",cursor:deploying||!htmlCode?"not-allowed":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:9,marginBottom:12}}>
                      {deploying?<><div style={{width:15,height:15,border:"2px solid rgba(245,245,240,.3)",borderTopColor:CHALK,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Deploying…</>:<><i className="ti ti-brand-vercel" style={{fontSize:14}} aria-hidden="true"/>{htmlCode?"Deploy to Vercel now →":"Build website first (Step 02)"}</>}
                    </button>
                    {deployResult&&(
                      <div style={{padding:"14px",borderRadius:10,background:deployResult.deployed?"#F0FDF4":deployResult.needsSetup?"#FFFBF2":"#FEF2F2",border:`1px solid ${deployResult.deployed?"#BBF7D0":deployResult.needsSetup?"#FCD34D":"#FECACA"}`,marginBottom:12}}>
                        {deployResult.deployed?(
                          <div>
                            <div style={{fontSize:14,fontWeight:700,color:"#085041",marginBottom:10}}>🚀 Live in ~60 seconds</div>
                            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                              <a href={deployResult.url} target="_blank" rel="noopener noreferrer" style={{padding:"8px 18px",borderRadius:9,background:GREEN,color:"#fff",fontSize:13,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}><i className="ti ti-external-link" style={{fontSize:12}} aria-hidden="true"/>Open live site ↗</a>
                              <a href={deployResult.dashboard} target="_blank" rel="noopener noreferrer" style={{padding:"8px 14px",borderRadius:9,background:"#fff",border:"1px solid #BBF7D0",color:"#085041",fontSize:13,textDecoration:"none"}}>Vercel dashboard</a>
                            </div>
                            <div style={{fontSize:12,color:"#64748B",marginBottom:4}}>{deployResult.url}</div>
                            <div style={{fontSize:12,color:"#94A3B8"}}>Custom domain: Vercel dashboard → project → Settings → Domains → add yourdomain.com</div>
                          </div>
                        ):deployResult.needsSetup?(
                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:"#92400E",marginBottom:8}}>⚙️ Add VERCEL_TOKEN to enable one-click deploy</div>
                            {deployResult.setupSteps?.map((step,i)=>(
                              <div key={i} style={{display:"flex",gap:8,fontSize:12,color:"#475569",lineHeight:1.55,marginBottom:4}}>
                                <span style={{color:AMBER,fontWeight:700,flexShrink:0,width:16}}>{i+1}.</span>
                                {step.replace(/^\d+\.\s*/,"")}
                              </div>
                            ))}
                          </div>
                        ):(
                          <div style={{fontSize:13,color:"#991B1B"}}><strong>Error:</strong> {deployResult.error}</div>
                        )}
                      </div>
                    )}
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {[
                        {label:"Netlify (drag & drop)",color:"#00AD9F",icon:"ti-cloud-upload",desc:"Go to app.netlify.com/drop → drag HTML file → live in 30 seconds. Free.",action:()=>window.open("https://app.netlify.com/drop","_blank"),btn:"Open Netlify ↗"},
                        {label:"Download HTML",       color:BLUE,        icon:"ti-download",  desc:"Download index.html → upload to any hosting (cPanel, SiteGround, Hostinger).",action:downloadHtml,btn:htmlCode?"Download →":"Build first"},
                      ].map((opt,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 12px",borderRadius:10,border:"1px solid #E2E8F0",background:"#F8F9FA"}}>
                          <i className={`ti ${opt.icon}`} style={{fontSize:16,color:opt.color,flexShrink:0}} aria-hidden="true"/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:2}}>{opt.label}</div>
                            <div style={{fontSize:11.5,color:"#64748B",lineHeight:1.5}}>{opt.desc}</div>
                          </div>
                          <button onClick={opt.action} style={{padding:"7px 13px",borderRadius:8,background:opt.color,color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{opt.btn}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SOCIAL */}
            {stage==="social"&&(
              <div className="fu" style={{display:"flex",flexDirection:"column",gap:12}}>
                <div className="card">
                  <div style={{padding:"13px 16px",borderBottom:"1px solid #E8ECF4",background:"#FDF0F5"}}>
                    <div style={{fontSize:14,fontWeight:700,color:N}}>Create social media pages</div>
                    <div style={{fontSize:12,color:"#64748B"}}>Complete profile content — ready to copy and paste into each platform</div>
                  </div>
                  <div style={{padding:"16px"}}>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                      {[{id:"linkedin",label:"LinkedIn",icon:"ti-brand-linkedin",color:"#0A66C2"},{id:"facebook",label:"Facebook",icon:"ti-brand-facebook",color:"#1877F2"},{id:"instagram",label:"Instagram",icon:"ti-brand-instagram",color:"#E1306C"},{id:"twitter",label:"X / Twitter",icon:"ti-brand-x",color:"#000"}].map(p=>(
                        <button key={p.id} onClick={()=>{setSocialP(p.id);setSocialOut("")}}
                          style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:9,border:`1.5px solid ${socialP===p.id?p.color:"#E2E8F0"}`,background:socialP===p.id?`${p.color}10`:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:socialP===p.id?700:400,color:socialP===p.id?p.color:N,transition:"all .14s"}}>
                          <i className={`ti ${p.icon}`} style={{fontSize:14,color:socialP===p.id?p.color:"#94A3B8"}} aria-hidden="true"/>{p.label}
                        </button>
                      ))}
                    </div>
                    <button onClick={generateSocial} disabled={socialLoading||!form.bizName}
                      style={{width:"100%",padding:12,borderRadius:10,background:socialLoading?"#F1F5F9":PINK,color:socialLoading?"#94A3B8":"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      {socialLoading?<><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Creating {socialP} content…</>:<><i className={`ti ti-brand-${socialP}`} style={{fontSize:14}} aria-hidden="true"/>Generate {socialP} page content →</>}
                    </button>
                  </div>
                </div>
                {socialOut&&(
                  <div className="card fu">
                    <div style={{padding:"11px 16px",borderBottom:"1px solid #E8ECF4",background:"#FDF0F5",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                      <span style={{fontSize:13,fontWeight:700,color:N}}>{({linkedin:"LinkedIn Company Page",facebook:"Facebook Business Page",instagram:"Instagram Business",twitter:"Twitter / X Profile"})[socialP]} — {form.bizName}</span>
                      <div style={{display:"flex",gap:7}}>
                        <button onClick={()=>navigator.clipboard.writeText(socialOut).then(()=>showToast("Copied!"))} style={{padding:"5px 12px",borderRadius:7,background:PINK,color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Copy all</button>
                        <a href="/social" style={{padding:"5px 12px",borderRadius:7,background:N,color:CHALK,fontSize:12,fontWeight:500,textDecoration:"none"}}>Connect & publish →</a>
                      </div>
                    </div>
                    <div style={{padding:"16px 20px",fontSize:13.5,lineHeight:1.9,whiteSpace:"pre-wrap",maxHeight:560,overflowY:"auto",color:N}}>{socialOut}</div>
                    <div style={{padding:"10px 16px",borderTop:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",gap:8,flexWrap:"wrap"}}>
                      <a href="/social" style={{padding:"7px 14px",borderRadius:8,background:"#0A66C2",color:"#fff",fontSize:12.5,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:5}}><i className="ti ti-send" style={{fontSize:11}} aria-hidden="true"/>Social Hub</a>
                      <a href="/calendar" style={{padding:"7px 14px",borderRadius:8,background:"#FFFBF2",border:"1px solid rgba(239,159,39,.3)",color:AMBER,fontSize:12.5,fontWeight:500,textDecoration:"none"}}>📅 Schedule posts</a>
                      <a href="/studio" style={{padding:"7px 14px",borderRadius:8,background:"#FDF0F5",border:"1px solid rgba(212,83,126,.3)",color:PINK,fontSize:12.5,fontWeight:500,textDecoration:"none"}}>✦ Content Studio</a>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
