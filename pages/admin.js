// pages/admin.js — SIXXAB AI Admin Dashboard
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N="#0A0E1A", AMBER="#EF9F27", CHALK="#F5F5F0", GREEN="#1D9E75"

export default function AdminPage() {
  const [state,      setState]    = useState("loading") // loading|noauth|noadmin|ready|error
  const [token,      setToken]    = useState(null)
  const [myEmail,    setMyEmail]  = useState("")
  const [myRole,     setMyRole]   = useState("")
  const [users,      setUsers]    = useState([])
  const [search,     setSearch]   = useState("")
  const [roleFilter, setRoleF]    = useState("")
  const [tab,        setTab]      = useState("users")
  const [toast,      setToast]    = useState(null)
  const [stats,      setStats]    = useState({total:0,admins:0,operators:0,customers:0,mrr:0,trialing:0})
  const [diagInfo,   setDiag]     = useState({})

  useEffect(() => { init() }, [])

  async function init() {
    // Step 1: get token from localStorage
    let tok = null
    let sessionUser = null
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("sb-") && k.endsWith("-auth-token"))
      if (!keys.length) { setState("noauth"); return }
      const s = JSON.parse(localStorage.getItem(keys[0]) || "{}")
      tok = s?.access_token
      sessionUser = s?.user
      if (!tok) { setState("noauth"); return }
      setToken(tok)
      setMyEmail(sessionUser?.email || "")
    } catch(e) {
      setState("error")
      setDiag({ error: "Could not read localStorage: " + e.message })
      return
    }

    // Step 2: call db-users API
    try {
      const r = await fetch("/api/db-users?limit=500", {
        headers: { Authorization: "Bearer " + tok }
      })

      // Check what came back
      setDiag({
        status: r.status,
        url: "/api/db-users",
        token_first20: tok?.slice(0, 20) + "...",
        session_email: sessionUser?.email,
      })

      if (r.status === 401) { setState("noauth"); return }
      if (r.status === 403) { setState("noadmin"); setMyRole("customer"); return }
      if (r.status === 500) {
        const d = await r.json()
        setState("error")
        setDiag(prev => ({ ...prev, api_error: d.error, fix: d.fix || "Check Supabase env vars in Vercel" }))
        return
      }

      const d = await r.json()
      if (d.error) {
        setState("error")
        setDiag(prev => ({ ...prev, api_error: d.error }))
        return
      }

      const allUsers = d.users || []
      // Find my role in the returned users
      const me = allUsers.find(u => u.email === sessionUser?.email)
      const role = me?.user_role || "customer"
      setMyRole(role)

      if (role !== "admin") {
        setState("noadmin")
        return
      }

      setUsers(allUsers)
      calcStats(allUsers)
      setState("ready")

    } catch(e) {
      setState("error")
      setDiag(prev => ({ ...prev, fetch_error: e.message, hint: "API route /api/db-users may not exist in GitHub" }))
    }
  }

  function calcStats(u) {
    const MRR = { starter:250, pro:999, agency:2499 }
    setStats({
      total:     u.length,
      admins:    u.filter(x => x.user_role === "admin").length,
      operators: u.filter(x => x.user_role === "operator").length,
      customers: u.filter(x => x.user_role === "customer").length,
      mrr:       u.filter(x => x.plan_status === "active").reduce((a,x) => a + (MRR[x.plan]||0), 0),
      trialing:  u.filter(x => x.plan_status === "trialing").length,
    })
  }

  function toast_(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null), 4000) }

  async function changeRole(id, role) {
    try {
      const r = await fetch("/api/db-users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ id, user_role: role })
      })
      const d = await r.json()
      if (d.profile) {
        setUsers(u => u.map(x => x.id === id ? { ...x, user_role: role } : x))
        toast_("Role updated → " + role)
      } else {
        toast_(d.error || "Update failed", false)
      }
    } catch(e) { toast_(e.message, false) }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || (u.email||"").includes(q) || (u.full_name||"").toLowerCase().includes(q) || (u.company||"").toLowerCase().includes(q)
    const matchRole   = !roleFilter || u.user_role === roleFilter
    return matchSearch && matchRole
  })

  const ROLE_COLORS = { admin:"#DC2626", operator:"#7C3AED", customer:GREEN }
  const STATUS_BG   = { active:"#E1F5EE", trialing:"#FFFBF2", past_due:"#FEF2F2", cancelled:"#F1F5F9" }
  const STATUS_TEXT = { active:GREEN, trialing:"#92400E", past_due:"#DC2626", cancelled:"#64748B" }

  // ── Render non-ready states ────────────────────────────────────
  if (state === "loading") return (
    <>
      <Head><title>SIXXAB AI — Admin</title></Head>
      <SixxabNav active="/admin"/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"calc(100vh - 52px)",flexDirection:"column",gap:16,background:"#F4F4F0"}}>
        <div style={{width:36,height:36,border:"3px solid rgba(239,159,39,.3)",borderTopColor:AMBER,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
        <div style={{fontSize:14,color:"#64748B"}}>Loading admin dashboard…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  )

  if (state === "noauth") return (
    <>
      <Head><title>SIXXAB AI — Admin</title></Head>
      <SixxabNav active="/admin"/>
      <div style={{maxWidth:480,margin:"80px auto",padding:"0 20px",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>🔐</div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:N,marginBottom:8}}>Sign in required</h2>
        <p style={{color:"#64748B",marginBottom:24}}>You need to be signed in to access the admin dashboard.</p>
        <a href="/login?redirect=/admin" style={{padding:"12px 28px",borderRadius:10,background:AMBER,color:N,textDecoration:"none",fontWeight:700,fontSize:14}}>Sign in →</a>
      </div>
    </>
  )

  if (state === "noadmin") return (
    <>
      <Head><title>SIXXAB AI — Admin</title></Head>
      <SixxabNav active="/admin"/>
      <div style={{maxWidth:520,margin:"80px auto",padding:"0 20px",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>🚫</div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:N,marginBottom:8}}>Admin access required</h2>
        <p style={{color:"#64748B",marginBottom:16}}>
          You are signed in as <strong>{myEmail}</strong> with role <strong>{myRole}</strong>.<br/>
          Admin role is required to access this page.
        </p>
        <div style={{background:"#F8F9FA",border:"1px solid #E2E8F0",borderRadius:12,padding:"16px 20px",textAlign:"left",fontSize:13,color:"#374151",marginBottom:24}}>
          <strong>To grant yourself admin access:</strong><br/>
          1. Go to <strong>Supabase → SQL Editor</strong><br/>
          2. Run this query:<br/>
          <code style={{display:"block",background:"#0A0E1A",color:AMBER,padding:"10px 12px",borderRadius:8,marginTop:8,fontFamily:"monospace",fontSize:12}}>
            UPDATE profiles SET user_role = 'admin'<br/>
            WHERE email = '{myEmail || "your-email@example.com"}';
          </code>
          3. Sign out and sign back in
        </div>
        <a href="/" style={{color:"#64748B",fontSize:13}}>← Back to home</a>
      </div>
    </>
  )

  if (state === "error") return (
    <>
      <Head><title>SIXXAB AI — Admin</title></Head>
      <SixxabNav active="/admin"/>
      <div style={{maxWidth:580,margin:"60px auto",padding:"0 20px"}}>
        <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:14,padding:"24px"}}>
          <div style={{fontSize:22,marginBottom:8}}>⚠️ Admin page error</div>
          <p style={{color:"#991B1B",marginBottom:16,fontSize:14}}>Something went wrong loading the admin dashboard.</p>
          <div style={{background:"#fff",border:"1px solid #FECACA",borderRadius:10,padding:"14px",fontSize:12.5,fontFamily:"monospace",color:"#374151"}}>
            {Object.entries(diagInfo).map(([k,v]) => (
              <div key={k} style={{marginBottom:4}}><strong>{k}:</strong> {String(v)}</div>
            ))}
          </div>
          <div style={{marginTop:16,fontSize:13,color:"#7F1D1D"}}>
            <strong>Most likely fixes:</strong><br/>
            1. Add Supabase env vars to Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY<br/>
            2. Run schema.sql + schema-v2.sql in Supabase SQL Editor<br/>
            3. Make sure pages/api/db-users.js exists in GitHub<br/>
            4. Run: UPDATE profiles SET user_role = 'admin' WHERE email = '{myEmail}';
          </div>
        </div>
      </div>
    </>
  )

  // ── Main admin dashboard ───────────────────────────────────────
  return (
    <>
      <Head><title>SIXXAB AI — Admin Dashboard</title></Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .25s ease}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        .inp{padding:8px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;color:${N};font-family:inherit;outline:none;background:#fff}
        .inp:focus{border-color:${AMBER}}
        .row-hover:hover td{background:#FAFAFA}
        .tab{padding:7px 16px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;transition:all .14s}
        .tab-on{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.1)}
        .tab-off{background:transparent;color:#64748B}
      `}</style>
      <SixxabNav active="/admin"/>

      {toast && (
        <div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>
          {toast.ok ? "✓" : "✗"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{background:N,padding:"16px 5%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:CHALK,marginBottom:2}}>
              Admin <span style={{color:AMBER,fontStyle:"italic"}}>Dashboard</span>
            </h1>
            <p style={{fontSize:12,color:"rgba(245,245,240,.4)"}}>Signed in as {myEmail} · Admin</p>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[
              ["👥","Users",stats.total,CHALK],
              ["⚙️","Admins",stats.admins,"#FCA5A5"],
              ["🏢","Operators",stats.operators,"#C4B5FD"],
              ["👤","Customers",stats.customers,"#6EE7B7"],
              ["⏰","Trialing",stats.trialing,AMBER],
              ["💰","MRR","$"+stats.mrr.toLocaleString(),GREEN],
            ].map(([icon,l,v,c]) => (
              <div key={l} style={{textAlign:"center",padding:"6px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
                <div style={{fontSize:14,lineHeight:1}}>{icon}</div>
                <div style={{fontFamily:"Georgia",fontSize:17,fontWeight:800,color:c,lineHeight:1.2}}>{v}</div>
                <div style={{fontSize:9.5,color:"rgba(245,245,240,.35)",textTransform:"uppercase",letterSpacing:".06em"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 20px 60px"}}>
        {/* Tabs */}
        <div style={{display:"inline-flex",gap:3,background:"#E8ECF4",borderRadius:10,padding:3,marginBottom:20}}>
          {[["users","👥 Users"],["roles","🔐 Roles"],["stats","📊 Stats"]].map(([t,l]) => (
            <button key={t} className={`tab ${tab===t?"tab-on":"tab-off"}`} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>

        {/* USERS TAB */}
        {tab==="users" && (
          <div className="fu">
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <input className="inp" placeholder="Search name, email, company…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:260}}/>
              <select className="inp" value={roleFilter} onChange={e=>setRoleF(e.target.value)}>
                <option value="">All roles ({users.length})</option>
                <option value="admin">Admin ({stats.admins})</option>
                <option value="operator">Operator ({stats.operators})</option>
                <option value="customer">Customer ({stats.customers})</option>
              </select>
              <button onClick={init} style={{padding:"8px 16px",borderRadius:8,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>
                ↻ Refresh
              </button>
              <span style={{fontSize:12.5,color:"#94A3B8",marginLeft:"auto"}}>{filtered.length} of {users.length} users</span>
            </div>

            <div className="card">
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
                      {["User","Role","Plan","Status","Joined","Change Role"].map(h => (
                        <th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:10.5,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} style={{padding:"48px",textAlign:"center",color:"#94A3B8"}}>
                        {search || roleFilter ? "No users match your filter" : "No users found"}
                      </td></tr>
                    ) : filtered.map(u => (
                      <tr key={u.id} className="row-hover" style={{borderBottom:"1px solid #F1F5F9",transition:"background .1s"}}>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:34,height:34,borderRadius:9,background:`${ROLE_COLORS[u.user_role]||"#64748B"}15`,border:`1px solid ${ROLE_COLORS[u.user_role]||"#64748B"}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:ROLE_COLORS[u.user_role]||"#64748B",flexShrink:0}}>
                              {(u.full_name||u.email||"U")[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{fontSize:13.5,fontWeight:500,color:N}}>{u.full_name||"—"}</div>
                              <div style={{fontSize:11.5,color:"#94A3B8"}}>{u.email}</div>
                              {u.company && <div style={{fontSize:11,color:"#CBD5E1"}}>{u.company}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"12px 16px"}}>
                          <span style={{padding:"3px 10px",borderRadius:20,background:`${ROLE_COLORS[u.user_role]||"#64748B"}15`,fontSize:12,fontWeight:600,color:ROLE_COLORS[u.user_role]||"#64748B",textTransform:"capitalize"}}>
                            {u.user_role||"customer"}
                          </span>
                        </td>
                        <td style={{padding:"12px 16px",fontSize:13,fontWeight:500,color:N,textTransform:"capitalize"}}>{u.plan||"starter"}</td>
                        <td style={{padding:"12px 16px"}}>
                          {u.plan_status ? (
                            <span style={{padding:"3px 9px",borderRadius:20,background:STATUS_BG[u.plan_status]||"#F1F5F9",fontSize:11.5,fontWeight:600,color:STATUS_TEXT[u.plan_status]||"#64748B",textTransform:"capitalize"}}>
                              {u.plan_status}
                            </span>
                          ) : <span style={{color:"#CBD5E1",fontSize:12}}>—</span>}
                        </td>
                        <td style={{padding:"12px 16px",fontSize:12.5,color:"#64748B",whiteSpace:"nowrap"}}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"}) : "—"}
                        </td>
                        <td style={{padding:"12px 16px"}}>
                          <select
                            value={u.user_role||"customer"}
                            onChange={e => changeRole(u.id, e.target.value)}
                            style={{padding:"5px 10px",borderRadius:7,border:`1.5px solid ${ROLE_COLORS[u.user_role]||"#64748B"}40`,background:"#FAFAFA",fontSize:12.5,fontWeight:600,color:ROLE_COLORS[u.user_role]||"#64748B",cursor:"pointer",fontFamily:"inherit",outline:"none"}}>
                            <option value="customer">Customer</option>
                            <option value="operator">Operator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ROLES TAB */}
        {tab==="roles" && (
          <div className="fu" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
            {[
              {role:"admin",   color:"#DC2626",bg:"#FEF2F2",border:"#FECACA",
               perms:["View and manage ALL users","Change any user's role","See all data platform-wide","View MRR and platform metrics","Delete accounts","Grant admin to others"]},
              {role:"operator",color:"#7C3AED",bg:"#F5F3FF",border:"#DDD6FE",
               perms:["Manage their org's customers","Invite new customers","Run agents for clients","Build websites for clients","View client CRM and leads","Requires Agency plan"]},
              {role:"customer",color:GREEN,    bg:"#F0FDF4",border:"#BBF7D0",
               perms:["Full access to own workspace","CRM, Leads, Content Studio","Website Builder + Deploy","Social Hub all platforms","All 18 AI agents + CXO","Billed per plan"]},
            ].map(({role,color,bg,border,perms}) => (
              <div key={role} style={{background:bg,borderRadius:14,border:`2px solid ${border}`,padding:"22px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <div style={{width:36,height:36,borderRadius:10,background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff"}}>
                    {role==="admin"?"⚙️":role==="operator"?"🏢":"👤"}
                  </div>
                  <div style={{fontSize:17,fontWeight:800,color}}>{role.charAt(0).toUpperCase()+role.slice(1)}</div>
                </div>
                <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8}}>
                  {perms.map(p => (
                    <li key={p} style={{display:"flex",gap:9,fontSize:13.5,color:"#1a1a2e",alignItems:"flex-start"}}>
                      <span style={{color,flexShrink:0,marginTop:1}}>✓</span>{p}
                    </li>
                  ))}
                </ul>
                <div style={{marginTop:16,padding:"10px 12px",borderRadius:9,background:"rgba(255,255,255,.6)",fontSize:12,color:"#374151"}}>
                  <strong>SQL to assign:</strong><br/>
                  <code style={{fontSize:11}}>UPDATE profiles SET user_role = '{role}' WHERE email = 'user@email.com';</code>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STATS TAB */}
        {tab==="stats" && (
          <div className="fu" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
            {[
              {icon:"👥",label:"Total Users",   value:stats.total,    color:N},
              {icon:"⚙️",label:"Admins",        value:stats.admins,   color:"#DC2626"},
              {icon:"🏢",label:"Operators",     value:stats.operators,color:"#7C3AED"},
              {icon:"👤",label:"Customers",     value:stats.customers,color:GREEN},
              {icon:"⏰",label:"On Free Trial", value:stats.trialing, color:AMBER},
              {icon:"💰",label:"Monthly MRR",   value:"$"+stats.mrr.toLocaleString(),color:GREEN},
            ].map(({icon,label,value,color}) => (
              <div key={label} className="card" style={{padding:"22px",textAlign:"center"}}>
                <div style={{fontSize:30,marginBottom:8}}>{icon}</div>
                <div style={{fontFamily:"Georgia",fontSize:34,fontWeight:800,color,lineHeight:1,marginBottom:6}}>{value}</div>
                <div style={{fontSize:13,color:"#64748B"}}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
