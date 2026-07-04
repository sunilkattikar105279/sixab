// pages/admin.js — SIXXAB AI · Complete Admin Panel
// Direct Supabase REST — no API route dependency
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect, useCallback } from "react"

const N="#0A0E1A", AMBER="#EF9F27", CHALK="#F5F5F0", GREEN="#1D9E75"
const ROLE_COLOR = { admin:"#DC2626", operator:"#7C3AED", customer:GREEN }
const ROLE_BG    = { admin:"#FEF2F2", operator:"#F5F3FF", customer:"#F0FDF4" }
const STATUS_C   = { active:GREEN, trialing:AMBER, past_due:"#DC2626", cancelled:"#94A3B8" }
const MRR        = { starter:250, pro:999, agency:2499 }

const ROLE_CAPS = {
  admin:    ["All user management","Change any role","View all data","Platform metrics","Delete accounts"],
  operator: ["Manage org customers","Invite users","Client agent runs","Website builder","Agency plan required"],
  customer: ["Own workspace only","CRM + Leads","Content Studio","Website Builder","All 18 AI agents"],
}

export default function AdminPage() {
  const [phase,   setPhase]   = useState("boot")
  const [errMsg,  setErrMsg]  = useState("")
  const [tok,     setTok]     = useState("")
  const [sbUrl,   setSbUrl]   = useState("")
  const [sbAnon,  setSbAnon]  = useState("")
  const [sbSvc,   setSbSvc]   = useState("")
  const [myEmail, setMyEmail] = useState("")
  const [users,   setUsers]   = useState([])
  const [biz,     setBiz]     = useState({}) // userId→businessName
  const [search,  setSearch]  = useState("")
  const [roleF,   setRoleF]   = useState("")
  const [planF,   setPlanF]   = useState("")
  const [tab,     setTab]     = useState("users")
  const [toast,   setToast]   = useState(null)
  const [editing, setEditing] = useState(null) // userId being edited
  const [modal,   setModal]   = useState(null) // {type, user}
  const [invEmail,setInvEmail]= useState("")
  const [invRole, setInvRole] = useState("customer")
  const [saving,  setSaving]  = useState("")

  useEffect(() => { boot() }, [])

  async function boot() {
    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      setErrMsg("NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not in Vercel env vars")
      setPhase("err"); return
    }
    setSbUrl(url); setSbAnon(anon)

    // Get service key from env (client-side won't have it but try)
    const svc = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    setSbSvc(svc)

    // Load session
    let token = "", email = ""
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("sb-") && k.endsWith("-auth-token"))
      if (!keys.length) { setPhase("noauth"); return }
      const s = JSON.parse(localStorage.getItem(keys[0]) || "{}")
      token = s?.access_token || ""
      email = s?.user?.email  || ""
      if (!token) { setPhase("noauth"); return }
      setTok(token); setMyEmail(email)
    } catch(e) { setErrMsg("localStorage: " + e.message); setPhase("err"); return }

    // Check my profile
    try {
      const r = await fetch(
        `${url}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=user_role&limit=1`,
        { headers: { apikey: anon, Authorization: `Bearer ${token}` } }
      )
      const rows = await r.json()
      const role = rows[0]?.user_role || "customer"
      if (role !== "admin") { setPhase("noadmin"); return }
    } catch(e) { setErrMsg("Profile check failed: " + e.message); setPhase("err"); return }

    await fetchUsers(url, anon, token)
    setPhase("ready")
  }

  async function fetchUsers(url, anon, token) {
    url   = url   || sbUrl
    anon  = anon  || sbAnon
    token = token || tok
    try {
      const r = await fetch(
        `${url}/rest/v1/profiles?select=id,email,full_name,company,phone,user_role,plan,plan_status,created_at,last_seen_at,onboarded&order=created_at.desc&limit=500`,
        { headers: { apikey: anon, Authorization: `Bearer ${token}` } }
      )
      const rows = await r.json()
      setUsers(Array.isArray(rows) ? rows : [])

      // Fetch business profiles
      const br = await fetch(
        `${url}/rest/v1/business_profiles?select=user_id,business_name`,
        { headers: { apikey: anon, Authorization: `Bearer ${token}` } }
      )
      const bizRows = await br.json()
      if (Array.isArray(bizRows)) {
        const map = {}
        bizRows.forEach(b => { map[b.user_id] = b.business_name })
        setBiz(map)
      }
    } catch(e) { toast_("Failed to load: " + e.message, false) }
  }

  async function patchUser(id, updates) {
    setSaving(id)
    try {
      const r = await fetch(`${sbUrl}/rest/v1/profiles?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          apikey: sbAnon, Authorization: `Bearer ${tok}`,
          "Content-Type": "application/json", Prefer: "return=representation"
        },
        body: JSON.stringify(updates)
      })
      if (r.ok) {
        setUsers(u => u.map(x => x.id === id ? { ...x, ...updates } : x))
        toast_("Updated ✓")
      } else {
        const d = await r.json()
        toast_(d.message || "Update failed", false)
      }
    } catch(e) { toast_(e.message, false) }
    setSaving("")
    setEditing(null)
  }

  async function createUser() {
    if (!invEmail.trim()) { toast_("Email required", false); return }
    setSaving("invite")
    try {
      // Create via auth API
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "signup", identifier: invEmail.trim(), password: "Sixxab2025!", name: invEmail.split("@")[0] })
      })
      const d = await r.json()
      if (!d.success && d.error && !d.error.includes("already registered")) {
        toast_(d.error, false); setSaving(""); return
      }
      // Set role via profile patch
      await fetchUsers()
      toast_("User created — role: " + invRole)
      setModal(null); setInvEmail("")
    } catch(e) { toast_(e.message, false) }
    setSaving("")
  }

  function toast_(m, ok=true) { setToast({m,ok}); setTimeout(()=>setToast(null), 4000) }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const ms = !q || (u.email||"").includes(q) || (u.full_name||"").toLowerCase().includes(q) || (u.company||"").toLowerCase().includes(q)
    const mr = !roleF || u.user_role === roleF
    const mp = !planF || u.plan === planF
    return ms && mr && mp
  })

  const stats = {
    total:     users.length,
    admins:    users.filter(u=>u.user_role==="admin").length,
    operators: users.filter(u=>u.user_role==="operator").length,
    customers: users.filter(u=>u.user_role==="customer").length,
    trialing:  users.filter(u=>u.plan_status==="trialing").length,
    active:    users.filter(u=>u.plan_status==="active").length,
    mrr:       users.filter(u=>u.plan_status==="active").reduce((a,u)=>a+(MRR[u.plan]||0),0),
  }

  // ── Non-ready screens ─────────────────────────────────────────
  const Shell = ({ch}) => <><Head><title>SIXXAB — Admin</title></Head><SixxabNav active="/admin"/>{ch}</>

  if (phase==="boot") return <Shell ch={
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"80vh",flexDirection:"column",gap:12}}>
      <div style={{width:32,height:32,border:`3px solid ${AMBER}33`,borderTopColor:AMBER,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <div style={{fontSize:13,color:"#64748B"}}>Loading…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  }/>

  if (phase==="noauth") return <Shell ch={
    <div style={{maxWidth:400,margin:"80px auto",padding:"0 20px",textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>🔐</div>
      <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:N,marginBottom:12}}>Sign in required</h2>
      <a href="/login?redirect=/admin" style={{display:"inline-block",padding:"12px 28px",borderRadius:10,background:AMBER,color:N,textDecoration:"none",fontWeight:700}}>Sign in →</a>
    </div>
  }/>

  if (phase==="noadmin") return <Shell ch={
    <div style={{maxWidth:560,margin:"60px auto",padding:"0 20px"}}>
      <div style={{background:"#FEF2F2",border:"2px solid #FECACA",borderRadius:14,padding:"28px"}}>
        <div style={{fontSize:32,marginBottom:12}}>🚫</div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:20,color:N,marginBottom:8}}>Admin access required</h2>
        <p style={{color:"#64748B",fontSize:14,marginBottom:20}}>Signed in as <strong>{myEmail}</strong></p>
        <div style={{background:"#fff",borderRadius:10,padding:"16px",fontSize:13}}>
          <strong>Run in Supabase SQL Editor:</strong>
          <pre style={{background:"#0A0E1A",color:AMBER,padding:"12px",borderRadius:8,marginTop:8,fontSize:12,fontFamily:"monospace",overflowX:"auto"}}>
{`UPDATE profiles SET user_role = 'admin'
WHERE email = '${myEmail}';`}
          </pre>
          <p style={{color:"#64748B",marginTop:8,fontSize:12}}>Then sign out and sign back in.</p>
        </div>
      </div>
    </div>
  }/>

  if (phase==="err") return <Shell ch={
    <div style={{maxWidth:560,margin:"60px auto",padding:"0 20px"}}>
      <div style={{background:"#FEF2F2",border:"2px solid #FECACA",borderRadius:14,padding:"24px"}}>
        <div style={{fontSize:22,marginBottom:8}}>⚠️ Setup required</div>
        <div style={{background:"#fff",borderRadius:9,padding:"12px",fontSize:12.5,color:"#7F1D1D",fontFamily:"monospace",marginBottom:12}}>{errMsg}</div>
        <ol style={{fontSize:13,color:"#374151",lineHeight:2,paddingLeft:18}}>
          <li>Add Supabase env vars to Vercel</li>
          <li>Run schema.sql in Supabase SQL Editor</li>
          <li>Run the ALTER TABLE SQL to add user_role column</li>
          <li>Sign out and sign back in</li>
        </ol>
      </div>
    </div>
  }/>

  // ── Full admin dashboard ──────────────────────────────────────
  return (<>
    <Head><title>SIXXAB AI — Admin Dashboard</title></Head>
    <style>{`
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#F0F2F5;font-family:'Inter',system-ui,sans-serif;color:${N}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .fu{animation:fadeUp .25s ease}
      .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0}
      .inp{padding:8px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;color:${N};font-family:inherit;outline:none;background:#fff;transition:border .15s}
      .inp:focus{border-color:${AMBER}}
      .tab{padding:7px 18px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;transition:all .14s}
      .ton{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.1)}
      .toff{background:transparent;color:#64748B}
      .toff:hover{color:${N}}
      tr:hover>td{background:#FAFBFC}
      .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:600;text-transform:capitalize}
      .role-sel{padding:5px 10px;border-radius:7px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;outline:none;border-width:1.5px;border-style:solid;transition:all .14s}
      .icon-btn{padding:6px 12px;borderRadius:8px;border:1px solid #E2E8F0;background:#fff;cursor:pointer;font-size:12.5px;font-family:inherit;transition:all .14s}
      .icon-btn:hover{background:#F8F9FA;border-color:#CBD5E1}
      .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px}
    `}</style>
    <SixxabNav active="/admin"/>

    {/* Toast */}
    {toast && <div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.15)"}}>
      {toast.ok?"✓":"✗"} {toast.m}
    </div>}

    {/* Header */}
    <div style={{background:N,padding:"16px 24px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{maxWidth:1300,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:CHALK,marginBottom:2}}>
            Admin <span style={{color:AMBER,fontStyle:"italic"}}>Dashboard</span>
          </h1>
          <p style={{fontSize:12,color:"rgba(245,245,240,.4)"}}>{myEmail} · Administrator</p>
        </div>
        {/* KPI strip */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[
            ["👥","Total",   stats.total,    CHALK],
            ["⚙️","Admins",  stats.admins,   "#FCA5A5"],
            ["🏢","Operators",stats.operators,"#C4B5FD"],
            ["👤","Customers",stats.customers,"#6EE7B7"],
            ["✅","Active",  stats.active,   GREEN],
            ["⏰","Trialing",stats.trialing, AMBER],
            ["💰","MRR",     "$"+stats.mrr.toLocaleString(), GREEN],
          ].map(([ic,l,v,c]) => (
            <div key={l} style={{textAlign:"center",padding:"6px 12px",borderRadius:9,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)"}}>
              <div style={{fontSize:13}}>{ic}</div>
              <div style={{fontFamily:"Georgia",fontSize:16,fontWeight:800,color:c,lineHeight:1.2}}>{v}</div>
              <div style={{fontSize:9,color:"rgba(245,245,240,.3)",textTransform:"uppercase",letterSpacing:".07em"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{maxWidth:1300,margin:"0 auto",padding:"20px 24px 60px"}}>

      {/* Tabs */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div style={{display:"inline-flex",gap:3,background:"#E2E8F0",borderRadius:10,padding:3}}>
          {[["users","👥 Users"],["roles","🔐 Roles"],["stats","📊 Stats"],["sql","🛠 SQL Tools"]].map(([t,l]) => (
            <button key={t} className={`tab ${tab===t?"ton":"toff"}`} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>
        {tab==="users" && (
          <button onClick={()=>setModal({type:"create"})}
            style={{padding:"9px 18px",borderRadius:9,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
            + Add User
          </button>
        )}
      </div>

      {/* ── USERS TAB ── */}
      {tab==="users" && (
        <div className="fu">
          {/* Filters */}
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <input className="inp" placeholder="🔍  Search name, email, company…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:280}}/>
            <select className="inp" value={roleF} onChange={e=>setRoleF(e.target.value)}>
              <option value="">All roles</option>
              <option value="admin">Admin ({stats.admins})</option>
              <option value="operator">Operator ({stats.operators})</option>
              <option value="customer">Customer ({stats.customers})</option>
            </select>
            <select className="inp" value={planF} onChange={e=>setPlanF(e.target.value)}>
              <option value="">All plans</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="agency">Agency</option>
            </select>
            <button onClick={()=>fetchUsers()} style={{padding:"8px 14px",borderRadius:8,background:"#F1F5F9",border:"1px solid #E2E8F0",fontSize:12.5,cursor:"pointer",fontFamily:"inherit",color:"#64748B"}}>↻ Refresh</button>
            <span style={{fontSize:12,color:"#94A3B8",marginLeft:"auto"}}>{filtered.length} / {users.length} users</span>
          </div>

          <div className="card" style={{overflow:"hidden"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"auto"}}>
                <thead>
                  <tr style={{borderBottom:"2px solid #F1F5F9",background:"#FAFBFC"}}>
                    {["User","Business","Role","Plan","Status","Last seen","Actions"].map(h => (
                      <th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:10.5,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0 ? (
                    <tr><td colSpan={7} style={{padding:"48px",textAlign:"center",color:"#94A3B8",fontSize:14}}>
                      {search||roleF||planF ? "No users match your filters" : "No users yet"}
                    </td></tr>
                  ) : filtered.map(u => (
                    <tr key={u.id} style={{borderBottom:"1px solid #F1F5F9",transition:"background .1s"}}>
                      {/* User */}
                      <td style={{padding:"12px 16px",minWidth:220}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:36,height:36,borderRadius:10,background:ROLE_BG[u.user_role]||"#F1F5F9",border:`1.5px solid ${ROLE_COLOR[u.user_role]||"#CBD5E1"}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:ROLE_COLOR[u.user_role]||"#64748B",flexShrink:0}}>
                            {(u.full_name||u.email||"U")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{fontSize:13.5,fontWeight:600,color:N,lineHeight:1.3}}>{u.full_name||"—"}</div>
                            <div style={{fontSize:11.5,color:"#94A3B8"}}>{u.email}</div>
                            {u.company&&<div style={{fontSize:11,color:"#CBD5E1",marginTop:1}}>{u.company}</div>}
                          </div>
                        </div>
                      </td>
                      {/* Business */}
                      <td style={{padding:"12px 16px",fontSize:13,color:"#64748B",maxWidth:140}}>
                        <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {biz[u.id] || <span style={{color:"#CBD5E1",fontSize:12}}>Not set</span>}
                        </div>
                      </td>
                      {/* Role */}
                      <td style={{padding:"12px 16px"}}>
                        {saving===u.id
                          ? <div style={{width:18,height:18,border:`2px solid ${AMBER}33`,borderTopColor:AMBER,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                          : <select
                              className="role-sel"
                              value={u.user_role||"customer"}
                              onChange={e=>patchUser(u.id,{user_role:e.target.value})}
                              style={{borderColor:`${ROLE_COLOR[u.user_role]||"#CBD5E1"}50`,background:ROLE_BG[u.user_role]||"#F8F9FA",color:ROLE_COLOR[u.user_role]||"#64748B"}}>
                              <option value="customer">Customer</option>
                              <option value="operator">Operator</option>
                              <option value="admin">Admin</option>
                            </select>
                        }
                      </td>
                      {/* Plan */}
                      <td style={{padding:"12px 16px"}}>
                        {saving===u.id+"plan"
                          ? <div style={{width:18,height:18,border:`2px solid ${AMBER}33`,borderTopColor:AMBER,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                          : <select
                              className="role-sel"
                              value={u.plan||"starter"}
                              onChange={e=>patchUser(u.id+"plan",{plan:e.target.value})}
                              style={{borderColor:"#CBD5E1",background:"#F8F9FA",color:"#374151"}}>
                              <option value="starter">Starter</option>
                              <option value="pro">Pro</option>
                              <option value="agency">Agency</option>
                            </select>
                        }
                      </td>
                      {/* Status */}
                      <td style={{padding:"12px 16px"}}>
                        <span className="badge" style={{background:`${STATUS_C[u.plan_status]||"#94A3B8"}15`,color:STATUS_C[u.plan_status]||"#94A3B8",border:`1px solid ${STATUS_C[u.plan_status]||"#94A3B8"}30`}}>
                          {u.plan_status||"—"}
                        </span>
                      </td>
                      {/* Last seen */}
                      <td style={{padding:"12px 16px",fontSize:12,color:"#94A3B8",whiteSpace:"nowrap"}}>
                        {u.last_seen_at
                          ? new Date(u.last_seen_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})
                          : u.created_at
                            ? new Date(u.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"})
                            : "—"}
                      </td>
                      {/* Actions */}
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>setModal({type:"view",user:u})}
                            style={{padding:"5px 11px",borderRadius:7,border:"1px solid #E2E8F0",background:"#F8F9FA",fontSize:12,cursor:"pointer",fontFamily:"inherit",color:"#374151"}}>
                            View
                          </button>
                          <button onClick={()=>patchUser(u.id,{plan_status:"active"})}
                            disabled={u.plan_status==="active"}
                            style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${GREEN}40`,background:`${GREEN}10`,fontSize:12,cursor:u.plan_status==="active"?"not-allowed":"pointer",fontFamily:"inherit",color:GREEN,opacity:u.plan_status==="active"?.5:1}}>
                            Activate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ROLES TAB ── */}
      {tab==="roles" && (
        <div className="fu" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
          {["admin","operator","customer"].map(role => (
            <div key={role} style={{background:ROLE_BG[role],borderRadius:14,border:`2px solid ${ROLE_COLOR[role]}30`,padding:"24px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <div style={{width:44,height:44,borderRadius:12,background:ROLE_COLOR[role],display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"#fff"}}>
                  {role==="admin"?"⚙️":role==="operator"?"🏢":"👤"}
                </div>
                <div>
                  <div style={{fontSize:18,fontWeight:800,color:ROLE_COLOR[role],textTransform:"capitalize"}}>{role}</div>
                  <div style={{fontSize:12,color:"#64748B"}}>{users.filter(u=>u.user_role===role).length} users</div>
                </div>
              </div>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:9,marginBottom:18}}>
                {ROLE_CAPS[role].map(p => (
                  <li key={p} style={{display:"flex",gap:9,fontSize:13.5,color:N,alignItems:"flex-start"}}>
                    <span style={{color:ROLE_COLOR[role],flexShrink:0,marginTop:1}}>✓</span>{p}
                  </li>
                ))}
              </ul>
              {/* Users in this role */}
              <div style={{borderTop:`1px solid ${ROLE_COLOR[role]}20`,paddingTop:12}}>
                <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Current users</div>
                {users.filter(u=>u.user_role===role).length===0
                  ? <div style={{fontSize:12.5,color:"#CBD5E1"}}>None assigned</div>
                  : users.filter(u=>u.user_role===role).map(u=>(
                    <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${ROLE_COLOR[role]}10`}}>
                      <div style={{width:26,height:26,borderRadius:7,background:ROLE_COLOR[role],display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>
                        {(u.full_name||u.email||"U")[0].toUpperCase()}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12.5,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.full_name||u.email}</div>
                        <div style={{fontSize:11,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div>
                      </div>
                      <select value={u.user_role} onChange={e=>patchUser(u.id,{user_role:e.target.value})}
                        style={{padding:"3px 7px",borderRadius:6,border:"1px solid #E2E8F0",fontSize:11,fontFamily:"inherit",cursor:"pointer",color:"#64748B"}}>
                        <option value="customer">Customer</option>
                        <option value="operator">Operator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STATS TAB ── */}
      {tab==="stats" && (
        <div className="fu">
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:24}}>
            {[["👥","Total Users",stats.total,N],["⚙️","Admins",stats.admins,"#DC2626"],["🏢","Operators",stats.operators,"#7C3AED"],["👤","Customers",stats.customers,GREEN],["✅","Active",stats.active,GREEN],["⏰","Trialing",stats.trialing,AMBER],["💰","MRR","$"+stats.mrr.toLocaleString(),GREEN]].map(([ic,l,v,c])=>(
              <div key={l} className="card" style={{padding:"20px",textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:6}}>{ic}</div>
                <div style={{fontFamily:"Georgia",fontSize:32,fontWeight:800,color:c,lineHeight:1,marginBottom:4}}>{v}</div>
                <div style={{fontSize:13,color:"#64748B"}}>{l}</div>
              </div>
            ))}
          </div>
          {/* Plan breakdown */}
          <div className="card" style={{padding:"20px"}}>
            <div style={{fontSize:14,fontWeight:700,color:N,marginBottom:14}}>Plan breakdown</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {["starter","pro","agency"].map(plan=>{
                const count=users.filter(u=>u.plan===plan).length
                const pct=users.length?Math.round(count/users.length*100):0
                return(
                  <div key={plan} style={{padding:"14px",borderRadius:10,background:"#F8F9FA",border:"1px solid #E2E8F0"}}>
                    <div style={{fontSize:13,fontWeight:600,color:N,textTransform:"capitalize",marginBottom:4}}>{plan}</div>
                    <div style={{fontFamily:"Georgia",fontSize:28,fontWeight:800,color:N,lineHeight:1,marginBottom:6}}>{count}</div>
                    <div style={{height:4,borderRadius:2,background:"#E2E8F0",marginBottom:4}}>
                      <div style={{height:"100%",borderRadius:2,background:AMBER,width:`${pct}%`,transition:"width .5s"}}/>
                    </div>
                    <div style={{fontSize:11,color:"#94A3B8"}}>{pct}% of users · ${(count*MRR[plan]).toLocaleString()}/mo</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── SQL TOOLS TAB ── */}
      {tab==="sql" && (
        <div className="fu" style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            {t:"Set admin role",         s:`UPDATE profiles SET user_role = 'admin'    WHERE email = 'EMAIL_HERE';`},
            {t:"Set operator role",      s:`UPDATE profiles SET user_role = 'operator' WHERE email = 'EMAIL_HERE';`},
            {t:"Set customer role",      s:`UPDATE profiles SET user_role = 'customer' WHERE email = 'EMAIL_HERE';`},
            {t:"Activate subscription",  s:`UPDATE profiles SET plan_status = 'active', plan = 'pro' WHERE email = 'EMAIL_HERE';`},
            {t:"View all users",         s:`SELECT p.email, p.user_role, p.plan, p.plan_status, b.business_name\nFROM profiles p\nLEFT JOIN business_profiles b ON b.user_id = p.id\nORDER BY p.user_role, p.created_at;`},
            {t:"Auth users not in profiles", s:`SELECT u.id, u.email FROM auth.users u LEFT JOIN profiles p ON p.id = u.id WHERE p.id IS NULL;`},
            {t:"Backfill missing profiles", s:`INSERT INTO profiles (id, email, full_name, user_role)\nSELECT u.id, u.email, split_part(u.email,'@',1), 'customer'\nFROM auth.users u LEFT JOIN profiles p ON p.id = u.id\nWHERE p.id IS NULL ON CONFLICT DO NOTHING;`},
          ].map(({t,s})=>(
            <div key={t} className="card" style={{overflow:"hidden"}}>
              <div style={{padding:"11px 16px",background:"#FAFBFC",borderBottom:"1px solid #E8ECF4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:13.5,fontWeight:600,color:N}}>{t}</span>
                <button onClick={()=>{navigator.clipboard?.writeText(s);toast_("Copied!")}}
                  style={{padding:"4px 12px",borderRadius:7,background:AMBER,color:N,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                  Copy
                </button>
              </div>
              <pre style={{padding:"14px 16px",fontSize:12.5,fontFamily:"monospace",color:"#1e293b",background:"#F8FAFC",margin:0,overflowX:"auto",whiteSpace:"pre-wrap"}}>
                {s}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* ── MODALS ── */}
    {modal && (
      <div className="modal-bg" onClick={()=>setModal(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:480,padding:"24px",maxHeight:"80vh",overflowY:"auto"}}>

          {/* View user detail */}
          {modal.type==="view" && modal.user && (() => {
            const u = modal.user
            return(<>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <div style={{width:48,height:48,borderRadius:13,background:ROLE_BG[u.user_role]||"#F1F5F9",border:`2px solid ${ROLE_COLOR[u.user_role]||"#CBD5E1"}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:ROLE_COLOR[u.user_role]||"#64748B"}}>
                  {(u.full_name||u.email||"U")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:N}}>{u.full_name||"No name"}</div>
                  <div style={{fontSize:13,color:"#64748B"}}>{u.email}</div>
                </div>
                <button onClick={()=>setModal(null)} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94A3B8"}}>×</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  ["Role",     u.user_role||"customer"],
                  ["Plan",     u.plan||"starter"],
                  ["Status",   u.plan_status||"—"],
                  ["Company",  u.company||"—"],
                  ["Phone",    u.phone||"—"],
                  ["Business", biz[u.id]||"Not set"],
                  ["Joined",   u.created_at?new Date(u.created_at).toLocaleDateString():"—"],
                  ["Last seen",u.last_seen_at?new Date(u.last_seen_at).toLocaleDateString():"—"],
                ].map(([k,v])=>(
                  <div key={k} style={{padding:"10px 12px",borderRadius:9,background:"#F8F9FA",border:"1px solid #E2E8F0"}}>
                    <div style={{fontSize:10.5,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:3}}>{k}</div>
                    <div style={{fontSize:13.5,color:N,fontWeight:500,textTransform:"capitalize"}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,display:"flex",gap:8}}>
                {["customer","operator","admin"].map(r=>(
                  <button key={r} onClick={()=>{patchUser(u.id,{user_role:r});setModal(null)}}
                    style={{flex:1,padding:"9px",borderRadius:9,border:`1.5px solid ${ROLE_COLOR[r]}40`,background:u.user_role===r?ROLE_BG[r]:"#fff",fontSize:12.5,fontWeight:600,cursor:"pointer",color:ROLE_COLOR[r],fontFamily:"inherit",textTransform:"capitalize"}}>
                    {u.user_role===r?"✓ ":""}{r}
                  </button>
                ))}
              </div>
            </>)
          })()}

          {/* Create user */}
          {modal.type==="create" && (<>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div style={{fontSize:17,fontWeight:700,color:N}}>Add new user</div>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94A3B8"}}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5}}>Email address *</label>
                <input className="inp" style={{width:"100%"}} type="email" value={invEmail} onChange={e=>setInvEmail(e.target.value)} placeholder="user@company.com" autoFocus/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5}}>Role</label>
                <select className="inp" style={{width:"100%"}} value={invRole} onChange={e=>setInvRole(e.target.value)}>
                  <option value="customer">Customer — standard workspace access</option>
                  <option value="operator">Operator — manage org customers</option>
                  <option value="admin">Admin — full platform access</option>
                </select>
              </div>
              <div style={{padding:"11px 14px",borderRadius:9,background:"#FFFBF2",border:"1px solid rgba(239,159,39,.2)",fontSize:12.5,color:"#92400E"}}>
                Default password: <strong>Sixxab2025!</strong> — user can reset from login page.
              </div>
              <button onClick={createUser} disabled={saving==="invite"||!invEmail.trim()}
                style={{padding:"12px",borderRadius:10,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,opacity:saving==="invite"||!invEmail.trim()?0.6:1}}>
                {saving==="invite"?"Creating…":"Create user →"}
              </button>
            </div>
          </>)}
        </div>
      </div>
    )}
  </>)
}
