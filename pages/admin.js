// pages/admin.js — SIXXAB AI Admin Dashboard
// Calls Supabase REST API directly — no pages/api dependency
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N="#0A0E1A", AMBER="#EF9F27", CHALK="#F5F5F0", GREEN="#1D9E75"
const RC = { admin:"#DC2626", operator:"#7C3AED", customer:GREEN }
const SC = { active:GREEN, trialing:AMBER, past_due:"#DC2626", cancelled:"#94A3B8" }
const MRR_MAP = { starter:250, pro:999, agency:2499 }

export default function AdminPage() {
  const [phase,    setPhase]   = useState("boot") // boot|noauth|noadmin|ready|err
  const [error,    setError]   = useState("")
  const [token,    setToken]   = useState("")
  const [sbUrl,    setSbUrl]   = useState("")
  const [sbKey,    setSbKey]   = useState("")
  const [myEmail,  setMyEmail] = useState("")
  const [myRole,   setMyRole]  = useState("")
  const [users,    setUsers]   = useState([])
  const [search,   setSearch]  = useState("")
  const [rf,       setRf]      = useState("")
  const [tab,      setTab]     = useState("users")
  const [toast,    setToast]   = useState(null)
  const [saving,   setSaving]  = useState(null)

  useEffect(() => { boot() }, [])

  async function boot() {
    // 1. Get Supabase config injected by Next.js from env
    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anon) {
      setError("NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set in Vercel env vars")
      setPhase("err"); return
    }
    setSbUrl(url); setSbKey(anon)

    // 2. Get session token from localStorage
    let tok = "", email = ""
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("sb-") && k.endsWith("-auth-token"))
      if (!keys.length) { setPhase("noauth"); return }
      const s = JSON.parse(localStorage.getItem(keys[0]) || "{}")
      tok   = s?.access_token || ""
      email = s?.user?.email  || ""
      if (!tok) { setPhase("noauth"); return }
      setToken(tok); setMyEmail(email)
    } catch(e) { setError("localStorage error: " + e.message); setPhase("err"); return }

    // 3. Get my profile directly from Supabase REST
    try {
      const r = await fetch(`${url}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id,email,user_role,plan,plan_status&limit=1`, {
        headers: { apikey: anon, Authorization: `Bearer ${tok}` }
      })
      if (!r.ok) {
        const t = await r.text()
        setError(`Supabase REST error ${r.status}: ${t.slice(0,200)}`)
        setPhase("err"); return
      }
      const rows = await r.json()
      const me = rows[0]
      if (!me) {
        // Profile doesn't exist yet — create it
        setError("Your profile row doesn't exist in the profiles table yet. Sign out and sign back in to trigger profile creation.")
        setPhase("err"); return
      }
      const role = me.user_role || "customer"
      setMyRole(role)
      if (role !== "admin") { setPhase("noadmin"); return }
    } catch(e) { setError("Failed to fetch profile: " + e.message); setPhase("err"); return }

    // 4. Load all users
    await loadUsers(url, anon, tok)
    setPhase("ready")
  }

  async function loadUsers(url, anon, tok) {
    url  = url  || sbUrl
    anon = anon || sbKey
    tok  = tok  || token
    try {
      const r = await fetch(`${url}/rest/v1/profiles?select=id,email,full_name,company,user_role,plan,plan_status,created_at&order=created_at.desc&limit=500`, {
        headers: { apikey: anon, Authorization: `Bearer ${tok}` }
      })
      const rows = await r.json()
      setUsers(Array.isArray(rows) ? rows : [])
    } catch(e) { toast_("Failed to load users: " + e.message, false) }
  }

  async function changeRole(id, newRole) {
    setSaving(id)
    try {
      const r = await fetch(`${sbUrl}/rest/v1/profiles?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          apikey: sbKey,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({ user_role: newRole })
      })
      if (r.ok) {
        setUsers(u => u.map(x => x.id === id ? { ...x, user_role: newRole } : x))
        toast_("Role → " + newRole)
      } else {
        const d = await r.json()
        toast_(d.message || "Update failed", false)
      }
    } catch(e) { toast_(e.message, false) }
    setSaving(null)
  }

  function toast_(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),4000) }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const ms = !q || (u.email||"").includes(q) || (u.full_name||"").toLowerCase().includes(q) || (u.company||"").toLowerCase().includes(q)
    const mr = !rf  || u.user_role === rf
    return ms && mr
  })

  const stats = {
    total:     users.length,
    admins:    users.filter(u=>u.user_role==="admin").length,
    operators: users.filter(u=>u.user_role==="operator").length,
    customers: users.filter(u=>u.user_role==="customer").length,
    trialing:  users.filter(u=>u.plan_status==="trialing").length,
    mrr:       users.filter(u=>u.plan_status==="active").reduce((a,u)=>a+(MRR_MAP[u.plan]||0),0),
  }

  const S = { // shared styles
    card: { background:"#fff", borderRadius:13, border:"1px solid #E2E8F0", overflow:"hidden" },
    inp:  { padding:"8px 12px", border:"1.5px solid #E2E8F0", borderRadius:8, fontSize:13, color:N, fontFamily:"inherit", outline:"none", background:"#fff" },
  }

  // ── Non-ready screens ─────────────────────────────────────────
  const Wrap = ({children}) => (<><Head><title>SIXXAB AI — Admin</title></Head><SixxabNav active="/admin"/>{children}</>)

  if (phase==="boot") return <Wrap>
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"calc(100vh - 52px)",flexDirection:"column",gap:12,background:"#F4F4F0"}}>
      <div style={{width:32,height:32,border:`3px solid ${AMBER}44`,borderTopColor:AMBER,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <div style={{fontSize:13,color:"#64748B"}}>Loading admin dashboard…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  </Wrap>

  if (phase==="noauth") return <Wrap>
    <div style={{maxWidth:440,margin:"80px auto",padding:"0 20px",textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>🔐</div>
      <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:N,marginBottom:8}}>Sign in required</h2>
      <p style={{color:"#64748B",marginBottom:24,fontSize:14}}>You need to sign in to access the admin dashboard.</p>
      <a href="/login?redirect=/admin" style={{display:"inline-block",padding:"12px 28px",borderRadius:10,background:AMBER,color:N,textDecoration:"none",fontWeight:700,fontSize:14}}>Sign in →</a>
    </div>
  </Wrap>

  if (phase==="noadmin") return <Wrap>
    <div style={{maxWidth:560,margin:"60px auto",padding:"0 20px"}}>
      <div style={{background:"#FEF2F2",border:"2px solid #FECACA",borderRadius:14,padding:"28px"}}>
        <div style={{fontSize:32,marginBottom:12}}>🚫</div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:20,color:N,marginBottom:8}}>Admin access required</h2>
        <p style={{color:"#64748B",fontSize:14,marginBottom:20}}>
          Signed in as <strong>{myEmail}</strong> · current role: <strong style={{color:RC[myRole]||"#64748B"}}>{myRole||"customer"}</strong>
        </p>
        <div style={{background:"#fff",border:"1px solid #FECACA",borderRadius:10,padding:"16px",fontSize:13}}>
          <strong>Run this in Supabase → SQL Editor:</strong>
          <pre style={{background:"#0A0E1A",color:AMBER,padding:"12px",borderRadius:8,marginTop:8,fontSize:12,fontFamily:"monospace",overflowX:"auto",whiteSpace:"pre-wrap"}}>
{`UPDATE profiles
SET user_role = 'admin'
WHERE email = '${myEmail}';

-- Verify:
SELECT email, user_role FROM profiles
WHERE email = '${myEmail}';`}
          </pre>
          <p style={{color:"#64748B",marginTop:10,fontSize:12.5}}>After running: sign out → sign back in → revisit /admin</p>
        </div>
      </div>
      <div style={{textAlign:"center",marginTop:16}}><a href="/" style={{color:"#94A3B8",fontSize:13}}>← Back to home</a></div>
    </div>
  </Wrap>

  if (phase==="err") return <Wrap>
    <div style={{maxWidth:580,margin:"60px auto",padding:"0 20px"}}>
      <div style={{background:"#FEF2F2",border:"2px solid #FECACA",borderRadius:14,padding:"28px"}}>
        <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:20,color:N,marginBottom:8}}>Setup required</h2>
        <div style={{background:"#fff",border:"1px solid #FECACA",borderRadius:10,padding:"14px",fontSize:13,color:"#7F1D1D",marginBottom:16}}>
          {error}
        </div>
        <div style={{fontSize:13,color:"#374151",lineHeight:1.8}}>
          <strong>Checklist:</strong><br/>
          ☐ Run <code>schema.sql</code> in Supabase SQL Editor<br/>
          ☐ Run the ALTER TABLE SQL from previous step<br/>
          ☐ Add env vars in Vercel: <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code><br/>
          ☐ Sign out and sign back in after running SQL
        </div>
      </div>
    </div>
  </Wrap>

  // ── Full admin dashboard ──────────────────────────────────────
  return (<>
    <Head><title>SIXXAB AI — Admin</title></Head>
    <style>{`
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .fu{animation:fadeUp .25s ease}
      tr:hover td{background:#FAFAFA}
      .tab{padding:7px 16px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500}
      .ton{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.1)}
      .toff{background:transparent;color:#64748B}
    `}</style>
    <SixxabNav active="/admin"/>

    {toast && (
      <div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>
        {toast.ok?"✓":"✗"} {toast.msg}
      </div>
    )}

    {/* Header */}
    <div style={{background:N,padding:"16px 5%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:CHALK,marginBottom:2}}>Admin <span style={{color:AMBER,fontStyle:"italic"}}>Dashboard</span></h1>
          <p style={{fontSize:12,color:"rgba(245,245,240,.4)"}}>{myEmail} · Admin · {users.length} users</p>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["👥",stats.total,"Users",CHALK],["⚙️",stats.admins,"Admins","#FCA5A5"],["🏢",stats.operators,"Operators","#C4B5FD"],["👤",stats.customers,"Customers","#6EE7B7"],["⏰",stats.trialing,"Trialing",AMBER],["💰","$"+stats.mrr.toLocaleString(),"MRR",GREEN]].map(([ic,v,l,c])=>(
            <div key={l} style={{textAlign:"center",padding:"5px 10px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
              <div style={{fontSize:13}}>{ic}</div>
              <div style={{fontFamily:"Georgia",fontSize:16,fontWeight:800,color:c,lineHeight:1.2}}>{v}</div>
              <div style={{fontSize:9,color:"rgba(245,245,240,.35)",textTransform:"uppercase",letterSpacing:".06em"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 20px 60px"}}>

      {/* Tabs */}
      <div style={{display:"inline-flex",gap:3,background:"#E8ECF4",borderRadius:10,padding:3,marginBottom:20}}>
        {[["users","👥 Users"],["roles","🔐 Roles"],["stats","📊 Stats"],["sql","🛠 Quick SQL"]].map(([t,l])=>(
          <button key={t} className={`tab ${tab===t?"ton":"toff"}`} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      {/* USERS */}
      {tab==="users" && (
        <div className="fu">
          <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <input style={S.inp} placeholder="Search name, email, company…" value={search} onChange={e=>setSearch(e.target.value)} style={{...S.inp,width:260}}/>
            <select style={S.inp} value={rf} onChange={e=>setRf(e.target.value)}>
              <option value="">All roles</option>
              <option value="admin">Admin ({stats.admins})</option>
              <option value="operator">Operator ({stats.operators})</option>
              <option value="customer">Customer ({stats.customers})</option>
            </select>
            <button onClick={()=>loadUsers()} style={{padding:"8px 16px",borderRadius:8,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>↻ Refresh</button>
            <span style={{fontSize:12,color:"#94A3B8",marginLeft:"auto"}}>{filtered.length} / {users.length}</span>
          </div>

          <div style={S.card}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
                    {["User","Role","Plan","Status","Joined","Change Role"].map(h=>(
                      <th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:10.5,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0
                    ?<tr><td colSpan={6} style={{padding:"48px",textAlign:"center",color:"#94A3B8"}}>No users match</td></tr>
                    :filtered.map(u=>(
                    <tr key={u.id} style={{borderBottom:"1px solid #F1F5F9",transition:"background .1s"}}>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:34,height:34,borderRadius:9,background:`${RC[u.user_role]||"#64748B"}15`,border:`1px solid ${RC[u.user_role]||"#64748B"}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:RC[u.user_role]||"#64748B",flexShrink:0}}>
                            {(u.full_name||u.email||"U")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{fontSize:13.5,fontWeight:500,color:N}}>{u.full_name||"—"}</div>
                            <div style={{fontSize:11.5,color:"#94A3B8"}}>{u.email}</div>
                            {u.company&&<div style={{fontSize:11,color:"#CBD5E1"}}>{u.company}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"12px 16px"}}>
                        <span style={{padding:"3px 10px",borderRadius:20,background:`${RC[u.user_role]||"#64748B"}15`,fontSize:12,fontWeight:600,color:RC[u.user_role]||"#64748B",textTransform:"capitalize"}}>
                          {u.user_role||"customer"}
                        </span>
                      </td>
                      <td style={{padding:"12px 16px",fontSize:13,color:N,textTransform:"capitalize"}}>{u.plan||"—"}</td>
                      <td style={{padding:"12px 16px"}}>
                        {u.plan_status?<span style={{padding:"3px 9px",borderRadius:20,background:`${SC[u.plan_status]||"#94A3B8"}18`,fontSize:11.5,fontWeight:600,color:SC[u.plan_status]||"#94A3B8",textTransform:"capitalize"}}>{u.plan_status}</span>:<span style={{color:"#CBD5E1",fontSize:12}}>—</span>}
                      </td>
                      <td style={{padding:"12px 16px",fontSize:12.5,color:"#64748B",whiteSpace:"nowrap"}}>
                        {u.created_at?new Date(u.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"}):"—"}
                      </td>
                      <td style={{padding:"12px 16px"}}>
                        {saving===u.id
                          ?<div style={{width:18,height:18,border:`2px solid ${AMBER}44`,borderTopColor:AMBER,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                          :<select value={u.user_role||"customer"} onChange={e=>changeRole(u.id,e.target.value)}
                            style={{padding:"5px 10px",borderRadius:7,border:`1.5px solid ${RC[u.user_role]||"#64748B"}40`,background:"#FAFAFA",fontSize:12.5,fontWeight:600,color:RC[u.user_role]||"#64748B",cursor:"pointer",fontFamily:"inherit",outline:"none"}}>
                            <option value="customer">Customer</option>
                            <option value="operator">Operator</option>
                            <option value="admin">Admin</option>
                          </select>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ROLES */}
      {tab==="roles" && (
        <div className="fu" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
          {[
            {r:"admin",   c:"#DC2626",bg:"#FEF2F2",bd:"#FECACA",
             perms:["Manage all users and roles","View all data platform-wide","See MRR and platform metrics","Change any user's role","Access every tool and page"]},
            {r:"operator",c:"#7C3AED",bg:"#F5F3FF",bd:"#DDD6FE",
             perms:["Manage org customers","Invite new users","Run agents for clients","Build websites for clients","Requires Agency plan"]},
            {r:"customer",c:GREEN,    bg:"#F0FDF4",bd:"#BBF7D0",
             perms:["Full own workspace access","CRM, Leads, Studio, Social","Website Builder + Deploy","All 18 AI agents + CXO","Billed per plan"]},
          ].map(({r,c,bg,bd,perms})=>(
            <div key={r} style={{background:bg,borderRadius:14,border:`2px solid ${bd}`,padding:"22px"}}>
              <div style={{fontSize:17,fontWeight:800,color:c,marginBottom:12,textTransform:"capitalize"}}>{r}</div>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                {perms.map(p=><li key={p} style={{display:"flex",gap:9,fontSize:13.5,color:N,alignItems:"flex-start"}}><span style={{color:c,flexShrink:0}}>✓</span>{p}</li>)}
              </ul>
              <pre style={{background:"#0A0E1A",color:AMBER,padding:"10px 12px",borderRadius:8,fontSize:11,fontFamily:"monospace",overflowX:"auto",whiteSpace:"pre-wrap"}}>
{`UPDATE profiles
SET user_role = '${r}'
WHERE email = 'user@email.com';`}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* STATS */}
      {tab==="stats" && (
        <div className="fu" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
          {[["👥","Total Users",stats.total,N],["⚙️","Admins",stats.admins,"#DC2626"],["🏢","Operators",stats.operators,"#7C3AED"],["👤","Customers",stats.customers,GREEN],["⏰","On Trial",stats.trialing,AMBER],["💰","Monthly MRR","$"+stats.mrr.toLocaleString(),GREEN]].map(([ic,l,v,c])=>(
            <div key={l} style={{...S.card,padding:"22px",textAlign:"center"}}>
              <div style={{fontSize:30,marginBottom:8}}>{ic}</div>
              <div style={{fontFamily:"Georgia",fontSize:34,fontWeight:800,color:c,lineHeight:1,marginBottom:6}}>{v}</div>
              <div style={{fontSize:13,color:"#64748B"}}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* QUICK SQL */}
      {tab==="sql" && (
        <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {title:"Make user admin",sql:`UPDATE profiles SET user_role = 'admin' WHERE email = 'EMAIL';`},
            {title:"Make user operator",sql:`UPDATE profiles SET user_role = 'operator' WHERE email = 'EMAIL';`},
            {title:"Reset to customer",sql:`UPDATE profiles SET user_role = 'customer' WHERE email = 'EMAIL';`},
            {title:"View all users",sql:`SELECT email, user_role, plan, plan_status, created_at FROM profiles ORDER BY created_at DESC;`},
            {title:"View all profiles with business",sql:`SELECT p.email, p.user_role, b.business_name, b.industry, b.stage FROM profiles p LEFT JOIN business_profiles b ON b.user_id = p.id ORDER BY p.created_at DESC;`},
          ].map(({title,sql})=>(
            <div key={title} style={S.card}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",fontSize:13.5,fontWeight:600,color:N}}>{title}</div>
              <div style={{padding:"14px 16px",position:"relative"}}>
                <pre style={{background:"#0A0E1A",color:"#6EE7B7",padding:"12px 14px",borderRadius:9,fontSize:12.5,fontFamily:"monospace",overflowX:"auto",whiteSpace:"pre-wrap",margin:0}}>{sql}</pre>
                <button onClick={()=>{navigator.clipboard?.writeText(sql);toast_("Copied!")}} style={{position:"absolute",top:22,right:24,padding:"4px 10px",borderRadius:6,background:AMBER,color:N,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Copy</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </>)
}
