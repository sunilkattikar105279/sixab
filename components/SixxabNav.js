// components/SixxabNav.js — Global branded nav for all SIXXAB AI modules
import { useState, useEffect } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

export const MODULES = [
  { label:"Orchestrator",   href:"/orchestrator",     icon:"ti-crown",            color:AMBER,    desc:"Set goal → 18 agents run" },
  { label:"CXO Suite",      href:"/agents",            icon:"ti-briefcase",        color:"#EF9F27",desc:"7 CXO advisors" },
  { label:"SIXXAB CRM",     href:"/crm",               icon:"ti-address-book",     color:"#1D9E75",desc:"Contacts + pipeline" },
  { label:"Niche Selector", href:"/niche-validator",   icon:"ti-target",           color:"#378ADD",desc:"Validate before you build" },
  { label:"AI Coach",       href:"/coach",             icon:"ti-message-chatbot",  color:"#7C3AED",desc:"Strategy chat" },
  { label:"Verticals",      href:"/verticals",         icon:"ti-building-factory", color:"#EC4899",desc:"10 industry packs" },
  { label:"Roadmap",        href:"/roadmap",           icon:"ti-map",              color:"#F59E0B",desc:"12-month plan" },
  { label:"Runbook",        href:"/runbook",           icon:"ti-book",             color:"#16A34A",desc:"How to use SIXXAB" },
]

export default function SixxabNav({ active = "" }) {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn, { passive: true })
    try { setUser(JSON.parse(sessionStorage.getItem("sixxab_user"))) } catch {}
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <>
      <style>{`
        .snav-link{font-size:11.5px;color:rgba(255,255,255,.5);text-decoration:none;display:flex;align-items:center;gap:5px;padding:4px 9px;border-radius:7px;transition:all .15s;white-space:nowrap}
        .snav-link:hover{color:#fff;background:rgba(255,255,255,.07)}
        .snav-link.on{background:rgba(255,255,255,.1);border:0.5px solid rgba(255,255,255,.12)}
      `}</style>
      <nav style={{position:"sticky",top:0,zIndex:200,height:52,display:"flex",alignItems:"center",gap:0,padding:"0 4%",background:N,backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        {/* Logo */}
        <a href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none",flexShrink:0,marginRight:12}}>
          <svg width="20" height="20" viewBox="0 0 72 72"><rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/><text x="7" y="54" fontFamily="Georgia" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text><text x="35" y="54" fontFamily="Georgia" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text></svg>
          <div>
            <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:CHALK,letterSpacing:1,lineHeight:1}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB <span style={{fontSize:9,color:"rgba(245,245,240,.4)",letterSpacing:2,fontStyle:"normal"}}>AI</span></div>
            <div style={{fontSize:7,color:"#5F5E5A",letterSpacing:".12em",fontFamily:"monospace",marginTop:1}}>autonomous business platform</div>
          </div>
        </a>
        {/* Divider */}
        <div style={{width:1,height:20,background:"rgba(255,255,255,.12)",marginRight:12,flexShrink:0}}/>
        {/* Modules */}
        <div style={{display:"flex",gap:2,alignItems:"center",flex:1,overflowX:"auto",scrollbarWidth:"none"}}>
          {MODULES.map(m=>(
            <a key={m.href} href={m.href} className={`snav-link${active===m.href?" on":""}`}
              style={{color:active===m.href?m.color:"rgba(255,255,255,.5)"}}>
              <i className={`ti ${m.icon}`} style={{fontSize:11,color:active===m.href?m.color:"rgba(255,255,255,.38)"}} aria-hidden="true"/>
              {m.label}
            </a>
          ))}
        </div>
        {/* Right */}
        <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0}}>
          <a href="/" style={{fontSize:11,color:"rgba(255,255,255,.38)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:6,border:"0.5px solid rgba(255,255,255,.1)"}}>
            <i className="ti ti-home" style={{fontSize:11}} aria-hidden="true"/>Home
          </a>
          {user&&<div style={{fontSize:11,color:AMBER,padding:"3px 9px",borderRadius:6,background:"rgba(239,159,39,.1)",border:"0.5px solid rgba(239,159,39,.2)"}}>{(user.name||user.email||"").split(/[ @]/)[0]}</div>}
          <a href="/discovery" style={{padding:"4px 12px",borderRadius:7,background:AMBER,color:N,fontSize:11,fontWeight:600,textDecoration:"none"}}>Book call</a>
        </div>
      </nav>
    </>
  )
}
