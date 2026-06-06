// components/SixxabNav.js — SIXXAB AI · Unified navigation
import { useState, useEffect } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

export const MODULES = [
  { label:"Validate",   href:"/niche-validator", icon:"ti-target",          color:"#EF9F27" },
  { label:"Launch",     href:"/orchestrator",    icon:"ti-crown",           color:"#1D9E75" },
  { label:"Optimise",   href:"/agents",          icon:"ti-briefcase",       color:"#378ADD" },
  { label:"Content Studio", href:"/studio",          icon:"ti-sparkles",        color:"#D4537E" },
  { label:"Social Hub",     href:"/social",          icon:"ti-share",           color:"#EF9F27" },
  { label:"Lead Gen",       href:"/leads",           icon:"ti-user-search",     color:"#1D9E75" },
  { label:"Proposals",      href:"/proposal",        icon:"ti-file-text",       color:"#378ADD" },
  { label:"Scale",      href:"/crm",             icon:"ti-address-book",    color:"#7C3AED" },
  { label:"Capitalise", href:"/investor",        icon:"ti-currency-dollar", color:"#DC2626" },
  { label:"Global",     href:"/verticals",       icon:"ti-building-factory",color:"#EC4899" },
  { label:"Coach",         href:"/coach",           icon:"ti-message-chatbot", color:"#7C3AED" },
  { label:"Roadmap",       href:"/roadmap",         icon:"ti-map",             color:"#F59E0B" },
  { label:"Runbook",       href:"/runbook",         icon:"ti-book",            color:"#16A34A" },
]

export function SixxabMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true">
      <rect x="1.5" y="1.5" width="69" height="69" rx="14"
        fill="none" stroke={AMBER} strokeWidth="3"/>
      <text x="7" y="54" fontFamily="Georgia,serif" fontSize="48"
        fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
      <text x="35" y="54" fontFamily="Georgia,serif" fontSize="54"
        fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
    </svg>
  )
}

export function SixxabWordmark({ size = "md" }) {
  const fs = size === "lg" ? 20 : size === "sm" ? 12 : 15
  return (
    <div>
      <div style={{ fontFamily:"Georgia,serif", fontSize:fs, fontWeight:700,
                    color:CHALK, letterSpacing:1, lineHeight:1 }}>
        SIX<span style={{ color:AMBER, fontStyle:"italic" }}>X</span>AB{" "}
        <span style={{ fontSize:Math.round(fs*.58), color:"rgba(245,245,240,.38)",
                        letterSpacing:2, fontStyle:"normal" }}>AI</span>
      </div>
      <div style={{ fontSize:7, color:"#5F5E5A", letterSpacing:".12em",
                    fontFamily:"monospace", marginTop:1 }}>
        autonomous business platform
      </div>
    </div>
  )
}

export default function SixxabNav({ active = "" }) {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [user,      setUser]      = useState(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", fn, { passive:true })
    try { setUser(JSON.parse(sessionStorage.getItem("sixxab_user"))) } catch {}
    return () => window.removeEventListener("scroll", fn)
  }, [])

  /* close menu on resize past mobile breakpoint */
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])

  const displayName = ((user?.name || user?.email || "").split(/[ @]/)[0])

  return (
    <>
      <style>{`
        .snav{position:sticky;top:0;z-index:200;height:52px;display:flex;
          align-items:center;gap:0;padding:0 4%;border-bottom:1px solid
          rgba(255,255,255,.08);transition:background .28s}
        .snav-link{font-size:11.5px;color:rgba(255,255,255,.5);text-decoration:none;
          display:flex;align-items:center;gap:4px;padding:4px 9px;border-radius:7px;
          transition:all .14s;white-space:nowrap}
        .snav-link:hover{color:#fff;background:rgba(255,255,255,.07)}
        .snav-link.on{background:rgba(255,255,255,.1);border:0.5px solid rgba(255,255,255,.13)}
        .snav-scroll{display:flex;gap:2px;align-items:center;flex:1;overflow-x:auto}
        .snav-scroll::-webkit-scrollbar{display:none}
        /* ── hamburger button ── */
        .ham-btn{display:none;flex-direction:column;justify-content:center;
          align-items:center;gap:4px;width:34px;height:34px;border-radius:8px;
          background:rgba(255,255,255,.06);border:0.5px solid rgba(255,255,255,.12);
          cursor:pointer;padding:0;margin-left:auto;flex-shrink:0}
        .ham-line{width:16px;height:1.5px;background:rgba(245,245,240,.7);
          border-radius:1px;transition:all .2s}
        /* ── mobile dropdown ── */
        .mob-menu{position:fixed;top:52px;left:0;right:0;bottom:0;z-index:199;
          background:rgba(10,14,26,.97);backdrop-filter:blur(20px);
          overflow-y:auto;padding:16px 5% 40px;display:flex;flex-direction:column;gap:4px}
        .mob-link{display:flex;align-items:center;gap:10px;padding:13px 14px;
          border-radius:10px;text-decoration:none;font-size:14px;font-weight:500;
          color:rgba(245,245,240,.65);border:0.5px solid rgba(255,255,255,.06);
          transition:all .14s}
        .mob-link:hover,.mob-link.on{background:rgba(255,255,255,.07);
          color:#fff;border-color:rgba(255,255,255,.12)}
        @media(max-width:767px){
          .snav-scroll{display:none}
          .ham-btn{display:flex}
        }
        @media(min-width:768px){
          .mob-menu{display:none!important}
        }
      `}</style>

      {/* ── Nav bar ── */}
      <nav className="snav"
           style={{ background: scrolled ? "rgba(10,14,26,.97)" : N,
                    backdropFilter:"blur(18px)" }}>

        {/* Logo */}
        <a href="/" style={{ display:"flex", alignItems:"center", gap:8,
                              textDecoration:"none", flexShrink:0, marginRight:10 }}
           onClick={() => setMenuOpen(false)}>
          <SixxabMark size={22}/>
          <SixxabWordmark/>
        </a>

        {/* Divider — desktop only */}
        <div className="snav-scroll" style={{ marginLeft:0 }}>
          <div style={{ width:1, height:18, background:"rgba(255,255,255,.12)",
                        marginRight:10, flexShrink:0 }}/>
          {MODULES.map(m => (
            <a key={m.href} href={m.href}
               className={`snav-link${active === m.href ? " on" : ""}`}
               style={{ color: active === m.href ? m.color : undefined }}>
              <i className={`ti ${m.icon}`}
                 style={{ fontSize:11,
                          color: active === m.href ? m.color : "rgba(255,255,255,.36)" }}
                 aria-hidden="true"/>
              {m.label}
            </a>
          ))}
        </div>

        {/* Right — desktop */}
        <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
          <a href="/" className="snav-link"
             style={{ fontSize:11, border:"0.5px solid rgba(255,255,255,.1)" }}>
            <i className="ti ti-home" style={{ fontSize:11 }} aria-hidden="true"/>
            <span style={{ display:"none" }} className="label-home">Home</span>
          </a>
          {user && displayName && (
            <div style={{ fontSize:11, color:AMBER, padding:"3px 9px",
                          borderRadius:6, background:"rgba(239,159,39,.1)",
                          border:"0.5px solid rgba(239,159,39,.2)" }}>
              {displayName}
            </div>
          )}
          <a href="/discovery"
             style={{ padding:"4px 12px", borderRadius:7, background:AMBER,
                      color:N, fontSize:11, fontWeight:700, textDecoration:"none",
                      whiteSpace:"nowrap" }}>
            Book call
          </a>

          {/* Hamburger — mobile only */}
          <button className="ham-btn" aria-label="Menu"
                  onClick={() => setMenuOpen(o => !o)}>
            <div className="ham-line"
                 style={{ transform: menuOpen ? "rotate(45deg) translate(4px,4px)" : "none" }}/>
            <div className="ham-line"
                 style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? "scaleX(0)" : "none" }}/>
            <div className="ham-line"
                 style={{ transform: menuOpen ? "rotate(-45deg) translate(4px,-4px)" : "none" }}/>
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div className="mob-menu">
          <a href="/" className="mob-link" onClick={() => setMenuOpen(false)}>
            <i className="ti ti-home" style={{ fontSize:18, color:"rgba(245,245,240,.5)" }}
               aria-hidden="true"/>
            Home
          </a>
          <div style={{ height:1, background:"rgba(255,255,255,.07)", margin:"6px 0" }}/>
          {MODULES.map(m => (
            <a key={m.href} href={m.href}
               className={`mob-link${active === m.href ? " on" : ""}`}
               onClick={() => setMenuOpen(false)}
               style={{ borderColor: active === m.href ? `${m.color}33` : undefined }}>
              <i className={`ti ${m.icon}`}
                 style={{ fontSize:20, color: active === m.href ? m.color : "rgba(245,245,240,.4)",
                          width:24, textAlign:"center" }}
                 aria-hidden="true"/>
              <div>
                <div style={{ fontSize:14, fontWeight:500,
                              color: active === m.href ? CHALK : "rgba(245,245,240,.7)" }}>
                  {m.label}
                </div>
              </div>
              {active === m.href && (
                <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%",
                              background:m.color }}/>
              )}
            </a>
          ))}
          <div style={{ height:1, background:"rgba(255,255,255,.07)", margin:"6px 0" }}/>
          {user && displayName && (
            <div style={{ padding:"10px 14px", fontSize:13, color:AMBER, fontWeight:500 }}>
              Signed in as {displayName}
            </div>
          )}
          <a href="/discovery"
             onClick={() => setMenuOpen(false)}
             style={{ display:"block", marginTop:8, padding:"14px",
                      borderRadius:11, background:AMBER, color:N,
                      fontSize:15, fontWeight:700, textDecoration:"none",
                      textAlign:"center" }}>
            Book a free strategy call →
          </a>
          <a href="/login"
             onClick={() => setMenuOpen(false)}
             style={{ display:"block", marginTop:8, padding:"12px",
                      borderRadius:11, border:"1px solid rgba(255,255,255,.12)",
                      color:"rgba(245,245,240,.6)", fontSize:14,
                      textDecoration:"none", textAlign:"center" }}>
            {user ? "My account" : "Login →"}
          </a>
        </div>
      )}
    </>
  )
}
