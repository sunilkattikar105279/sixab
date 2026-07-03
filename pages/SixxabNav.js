// components/SixxabNav.js — SIXXAB AI · Global Navigation
// Grouped drop-down nav with phase structure
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

// ── Brand marks (exported for reuse in pages) ─────────────────────────────────
export function SixxabMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="68" height="68" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/>
      <text x="7"  y="52" fontFamily="Georgia,serif" fontSize="44" fill="none" stroke={AMBER} strokeWidth="1.5">S</text>
      <text x="34" y="54" fontFamily="Georgia,serif" fontSize="50" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic">X</text>
    </svg>
  )
}

export function SixxabWordmark() {
  return (
    <span style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:CHALK, letterSpacing:.5, lineHeight:1 }}>
      SIXXAB <span style={{ color:AMBER, fontStyle:"italic" }}>AI</span>
    </span>
  )
}

// ── Nav groups — each group renders as a dropdown ────────────────────────────
const NAV_GROUPS = [
  {
    label: "Strategy", icon: "ti-crown", color: AMBER,
    items: [
      { label:"Orchestrator",    href:"/orchestrator",    icon:"ti-crown",          desc:"18 agents, one goal, one plan" },
      { label:"CXO Suite",       href:"/agents",          icon:"ti-briefcase",      desc:"11 advisors — CEO to Board" },
      { label:"AI Coach",        href:"/coach",           icon:"ti-message-chatbot",desc:"Personal strategy coach" },
      { label:"Roadmap",         href:"/roadmap",         icon:"ti-map",            desc:"$0 to $10M milestones" },
      { label:"Niche Selector",  href:"/niche-validator", icon:"ti-target",         desc:"Validate before you build" },
    ]
  },
  {
    label: "Marketing", icon: "ti-speakerphone", color: "#D4537E",
    items: [
      { label:"Content Studio",  href:"/studio",   icon:"ti-sparkles",        desc:"10 content types, AI-generated" },
      { label:"Social Hub",      href:"/social",   icon:"ti-share",           desc:"LinkedIn, X, Facebook, Instagram, YouTube" },
      { label:"Calendar",        href:"/calendar", icon:"ti-calendar-month",  desc:"Monthly & yearly publish schedule" },
      { label:"Website Builder", href:"/website-builder",icon:"ti-device-desktop",desc:"Design, build and deploy websites" },
      { label:"SEO Analyzer",    href:"/seo",      icon:"ti-chart-bar",       desc:"Keywords, rankings and on-page SEO" },
      { label:"Email Automator", href:"/email-automator",icon:"ti-mail-forward",desc:"Automated email sequences and campaigns" },
    ]
  },
  {
    label: "Sales", icon: "ti-trending-up", color: "#1D9E75",
    items: [
      { label:"Lead Generation", href:"/leads",     icon:"ti-user-search",    desc:"ICP, prospects, outreach sequences" },
      { label:"SIXXAB CRM",      href:"/crm",       icon:"ti-address-book",   desc:"Full pipeline with AI scoring" },
      { label:"Proposal Writer", href:"/proposal",  icon:"ti-file-text",      desc:"Proposals, SOW, case studies" },
      { label:"Retention",       href:"/retention", icon:"ti-chart-arrows-vertical",desc:"Prospect to renewal lifecycle" },
      { label:"Invoice Generator",href:"/invoice",  icon:"ti-receipt",        desc:"Professional invoices in seconds" },
    ]
  },
  {
    label: "Finance", icon: "ti-currency-dollar", color: "#378ADD",
    items: [
      { label:"Investor Hub",    href:"/investor",  icon:"ti-currency-dollar",desc:"Pitch, CRM, fundraising model" },
      { label:"Vertical Packs",  href:"/verticals", icon:"ti-building-factory",desc:"30 industry packs, TX · US · EU" },
      { label:"Analytics",       href:"/analytics", icon:"ti-chart-pie",      desc:"Revenue, MRR, churn, growth dashboard" },
      { label:"Review Manager",  href:"/reviews",   icon:"ti-star",           desc:"Google, Facebook and Yelp reviews" },
    ]
  },
  {
    label: "Learn", icon: "ti-book", color: "#7C3AED",
    items: [
      { label:"Runbook",         href:"/runbook",   icon:"ti-book",           desc:"Platform guide, every module" },
      { label:"Mental Model",    href:"/mindset",   icon:"ti-brain",          desc:"12 laws of autonomous business" },
      { label:"Validate Ideas",  href:"/validate",  icon:"ti-bulb",           desc:"Customer interview guide" },
    ]
  },
]

// All hrefs flat — used to highlight active item
const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items)

export default function SixxabNav({ active = "" }) {
  const [open,     setOpen]     = useState(null)  // group label or null
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(null)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Find active group
  const activeGroup = NAV_GROUPS.find(g => g.items.some(i => i.href === active))

  return (
    <>
      <style>{`
        .snav{position:sticky;top:0;z-index:100;background:${N};border-bottom:1px solid rgba(255,255,255,.07);height:52px;display:flex;align-items:center;padding:0 3%}
        .snav-item{display:flex;align-items:center;gap:5px;padding:6px 11px;border-radius:7px;cursor:pointer;font-size:12.5px;font-weight:500;color:rgba(245,245,240,.55);border:none;background:transparent;font-family:inherit;transition:all .14s;white-space:nowrap}
        .snav-item:hover,.snav-item.on{color:${CHALK};background:rgba(255,255,255,.07)}
        .snav-item.active-group{color:${AMBER}}
        .snav-dropdown{position:absolute;top:calc(100% + 4px);left:0;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.18);border:1px solid #E2E8F0;padding:6px;min-width:240px;z-index:200;animation:snav-drop .15s ease}
        @keyframes snav-drop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .snav-link{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;text-decoration:none;transition:background .12s;color:${N}}
        .snav-link:hover{background:#F8F9FA}
        .snav-link.active{background:rgba(239,159,39,.1);color:${AMBER}}
        .snav-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        /* Mobile menu */
        .snav-mobile{display:none}
        @media(max-width:768px){
          .snav-desktop{display:none!important}
          .snav-mobile{display:block}
        }
        @media(min-width:769px){.snav-mobile{display:none!important}}
      `}</style>

      <nav className="snav" ref={navRef}>
        {/* Logo */}
        <Link href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none",marginRight:8,flexShrink:0}}>
          <SixxabMark size={24}/>
          <SixxabWordmark/>
        </Link>

        {/* Desktop grouped nav */}
        <div className="snav-desktop" style={{display:"flex",alignItems:"center",flex:1,gap:1}}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{position:"relative"}}>
              <button
                className={`snav-item${open===group.label?" on":""}${activeGroup?.label===group.label?" active-group":""}`}
                onClick={()=>setOpen(o=>o===group.label?null:group.label)}
                style={{color:activeGroup?.label===group.label?group.color:undefined}}>
                <i className={`ti ${group.icon}`} style={{fontSize:12}} aria-hidden="true"/>
                {group.label}
                <i className={`ti ti-chevron-${open===group.label?"up":"down"}`} style={{fontSize:10,opacity:.6}} aria-hidden="true"/>
              </button>

              {open===group.label && (
                <div className="snav-dropdown">
                  <div style={{padding:"4px 8px 6px",fontSize:9.5,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".1em",borderBottom:"1px solid #F1F5F9",marginBottom:4}}>
                    {group.label}
                  </div>
                  {group.items.map(item => (
                    <Link key={item.href} href={item.href}
                      className={`snav-link${active===item.href?" active":""}`}
                      onClick={()=>setOpen(null)}>
                      <div style={{width:28,height:28,borderRadius:7,background:active===item.href?`${group.color}18`:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <i className={`ti ${item.icon}`} style={{fontSize:12,color:active===item.href?group.color:"#64748B"}} aria-hidden="true"/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:active===item.href?600:400,lineHeight:1.2,color:active===item.href?group.color:N}}>{item.label}</div>
                        <div style={{fontSize:10.5,color:"#94A3B8",lineHeight:1.3,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.desc}</div>
                      </div>
                      {active===item.href && <div className="snav-dot" style={{background:group.color}}/>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right side actions */}
        <div className="snav-desktop" style={{display:"flex",alignItems:"center",gap:7,marginLeft:"auto"}}>
          <Link href="/crm" style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:7,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",fontSize:12,color:"rgba(245,245,240,.6)",textDecoration:"none"}}>
            <i className="ti ti-address-book" style={{fontSize:11}} aria-hidden="true"/>CRM
          </Link>
          <Link href="/agents" style={{padding:"6px 14px",borderRadius:8,background:AMBER,color:N,fontSize:12.5,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:5}}>
            <i className="ti ti-crown" style={{fontSize:11}} aria-hidden="true"/>Launch
          </Link>

          {/* User profile dropdown */}
          <div ref={userRef} style={{position:"relative"}}>
            <button
              onClick={()=>setShowUser(s=>!s)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"4px 10px 4px 4px",borderRadius:10,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",cursor:"pointer",transition:"all .15s"}}
              onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,.12)"}
              onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,.07)"}
            >
              {/* Avatar */}
              <div style={{width:28,height:28,borderRadius:8,background:`${AMBER}22`,border:`1.5px solid ${AMBER}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:AMBER,flexShrink:0}}>
                {initials}
              </div>
              <div style={{textAlign:"left",maxWidth:120}}>
                <div style={{fontSize:12,fontWeight:600,color:CHALK,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</div>
                <div style={{fontSize:9.5,color:"rgba(245,245,240,.35)",lineHeight:1,textTransform:"capitalize"}}>{role}</div>
              </div>
              <i className={`ti ti-chevron-${showUser?"up":"down"}`} style={{fontSize:10,color:"rgba(245,245,240,.4)",flexShrink:0}} aria-hidden="true"/>
            </button>

            {/* Dropdown */}
            {showUser && (
              <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,width:220,background:"#fff",borderRadius:13,border:"1px solid #E2E8F0",boxShadow:"0 8px 32px rgba(0,0,0,.18)",zIndex:200,overflow:"hidden"}}>
                {/* User info header */}
                <div style={{padding:"14px 16px",borderBottom:"1px solid #F1F5F9",background:"#FAFAFA"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:10,background:`${AMBER}18`,border:`2px solid ${AMBER}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:AMBER}}>
                      {initials}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#0A0E1A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</div>
                      <div style={{fontSize:11,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</div>
                    </div>
                  </div>
                  {/* Role badge */}
                  <div style={{marginTop:8}}>
                    {{
                      admin:    <span style={{padding:"2px 10px",borderRadius:20,background:"#FEF2F2",border:"1px solid #FECACA",fontSize:10.5,fontWeight:700,color:"#DC2626"}}>Admin</span>,
                      operator: <span style={{padding:"2px 10px",borderRadius:20,background:"#F5F3FF",border:"1px solid #DDD6FE",fontSize:10.5,fontWeight:700,color:"#7C3AED"}}>Operator</span>,
                      customer: <span style={{padding:"2px 10px",borderRadius:20,background:"#F0FDF4",border:"1px solid #BBF7D0",fontSize:10.5,fontWeight:700,color:"#1D9E75"}}>Customer</span>,
                    }[role] || <span style={{padding:"2px 10px",borderRadius:20,background:"#F1F5F9",fontSize:10.5,color:"#64748B"}}>Customer</span>}
                  </div>
                </div>

                {/* Menu items */}
                <div style={{padding:"6px"}}>
                  {[
                    { href:"/profile",  icon:"ti-user-circle", label:"My Profile" },
                    { href:"/billing",  icon:"ti-credit-card",  label:"Billing & Plans" },
                    ...(role==="admin"    ? [{ href:"/admin",   icon:"ti-shield-lock", label:"Admin Dashboard", color:"#DC2626" }] : []),
                    ...(role==="operator" ? [{ href:"/admin",   icon:"ti-users",       label:"Manage Customers", color:"#7C3AED" }] : []),
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={()=>setShowUser(false)}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:9,textDecoration:"none",color:item.color||"#0A0E1A",fontSize:13.5,fontWeight:500,transition:"background .12s"}}
                      onMouseOver={e=>e.currentTarget.style.background="#F8F9FA"}
                      onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                      <i className={`ti ${item.icon}`} style={{fontSize:14,color:item.color||"#64748B",width:18,textAlign:"center"}} aria-hidden="true"/>
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Sign out */}
                <div style={{padding:"6px",borderTop:"1px solid #F1F5F9"}}>
                  <button onClick={signOut}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:9,background:"transparent",border:"none",cursor:"pointer",color:"#DC2626",fontSize:13.5,fontWeight:500,width:"100%",fontFamily:"inherit",transition:"background .12s"}}
                    onMouseOver={e=>e.currentTarget.style.background="#FEF2F2"}
                    onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <i className="ti ti-logout" style={{fontSize:14,width:18,textAlign:"center"}} aria-hidden="true"/>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <div className="snav-mobile" style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <Link href="/orchestrator" style={{padding:"6px 12px",borderRadius:7,background:AMBER,color:N,fontSize:12,fontWeight:700,textDecoration:"none"}}>Launch</Link>
          <button onClick={()=>setMobileOpen(o=>!o)} style={{background:"none",border:"1px solid rgba(255,255,255,.2)",borderRadius:7,padding:"6px 8px",cursor:"pointer",color:CHALK,display:"flex",alignItems:"center"}}>
            <i className={`ti ti-${mobileOpen?"x":"menu-2"}`} style={{fontSize:16}} aria-hidden="true"/>
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      {mobileOpen && (
        <div style={{position:"fixed",inset:0,top:52,background:N,zIndex:99,overflowY:"auto",padding:"12px 0 40px"}}>
          {NAV_GROUPS.map(group=>(
            <div key={group.label}>
              <div style={{padding:"10px 20px 5px",fontSize:10,fontWeight:700,color:group.color,textTransform:"uppercase",letterSpacing:".1em"}}>{group.label}</div>
              {group.items.map(item=>(
                <Link key={item.href} href={item.href}
                  onClick={()=>setMobileOpen(false)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"10px 20px",textDecoration:"none",background:active===item.href?"rgba(239,159,39,.08)":"transparent",borderLeft:active===item.href?`3px solid ${group.color}`:"3px solid transparent"}}>
                  <i className={`ti ${item.icon}`} style={{fontSize:15,color:active===item.href?group.color:"rgba(245,245,240,.5)",flexShrink:0}} aria-hidden="true"/>
                  <div>
                    <div style={{fontSize:14,fontWeight:active===item.href?600:400,color:active===item.href?CHALK:"rgba(245,245,240,.7)"}}>{item.label}</div>
                    <div style={{fontSize:11,color:"rgba(245,245,240,.3)"}}>{item.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
          <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,.07)",marginTop:8}}>
            {/* Mobile user card */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px",borderRadius:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:9,background:`${AMBER}22`,border:`1.5px solid ${AMBER}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:AMBER}}>
                {initials}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:CHALK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</div>
                <div style={{fontSize:11,color:"rgba(245,245,240,.35)"}}>{user?.email}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Link href="/profile" onClick={()=>setMobileOpen(false)} style={{flex:1,padding:"10px",borderRadius:9,background:"rgba(255,255,255,.07)",color:CHALK,fontSize:13,fontWeight:500,textDecoration:"none",textAlign:"center",minWidth:80}}>Profile</Link>
              <Link href="/billing" onClick={()=>setMobileOpen(false)} style={{flex:1,padding:"10px",borderRadius:9,background:"rgba(255,255,255,.07)",color:CHALK,fontSize:13,fontWeight:500,textDecoration:"none",textAlign:"center",minWidth:80}}>Billing</Link>
              <button onClick={()=>{setMobileOpen(false);signOut()}} style={{flex:1,padding:"10px",borderRadius:9,border:"1px solid rgba(220,38,38,.3)",background:"rgba(220,38,38,.1)",color:"#FCA5A5",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",minWidth:80}}>Sign out</button>
            </div>
            {role==="admin"&&<Link href="/admin" onClick={()=>setMobileOpen(false)} style={{display:"block",marginTop:8,padding:"10px",borderRadius:9,background:"rgba(220,38,38,.1)",border:"1px solid rgba(220,38,38,.2)",color:"#FCA5A5",fontSize:13,fontWeight:600,textDecoration:"none",textAlign:"center"}}>⚙️ Admin Dashboard</Link>}
          </div>
        </div>
      )}
    </>
  )
}
