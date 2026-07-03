// pages/admin.js — SIXXAB AI Admin Dashboard (admin role only)
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N="#0A0E1A",AMBER="#EF9F27",CHALK="#F5F5F0",GREEN="#1D9E75"

const ROLE_COLORS = { admin:"#DC2626", operator:"#7C3AED", customer:"#1D9E75" }
const PLAN_COLORS = { starter:"#64748B", pro:"#2563EB", agency:"#7C3AED" }
const STATUS_COLORS = { active:"#1D9E75", trialing:"#EF9F27", past_due:"#DC2626", cancelled:"#94A3B8" }

export default function AdminPage() {
  const [users,    setUsers]   = useState([])
  const [stats,    setStats]   = useState({ total:0, admins:0, operators:0, customers:0, mrr:0, trialing:0 })
  const [search,   setSearch]  = useState("")
  const [roleFilter,setRole]   = useState("")
  const [loading,  setLoading] = useState(true)
  const [token,    setToken]   = useState(null)
  const [toast,    setToast]   = useState(null)
  const [selected, setSelected]= useState(null)

  useEffect(() => { loadToken() }, [])
  useEffect(() => { if(token) loadUsers() }, [token, search, roleFilter])

  async function loadToken() {
    try {
      const keys = Object.keys(localStorage).filter(k=>k.startsWith("sb-")&&k.endsWith("-auth-token"))
      if (!keys.length) { window.location.href="/login"; return }
      const s = JSON.parse(localStorage.getItem(keys[0])||"{}")
      setToken(s.access_token)
    } catch { window.location.href="/login" }
  }

  async function loadUsers() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit:"200", ...(search&&{search}), ...(roleFilter&&{role:roleFilter}) })
      const r = await fetch(`/api/db/users?${params}`, { headers:{ Authorization:"Bearer "+token } })
      const d = await r.json()
      if (r.status===403) { window.location.href="/"; return }
      const u = d.users || []
      setUsers(u)
      const MRR_BY_PLAN = { starter:250, pro:999, agency:2499 }
      setStats({
        total:     u.length,
        admins:    u.filter(x=>x.user_role==="admin").length,
        operators: u.filter(x=>x.user_role==="operator").length,
        customers: u.filter(x=>x.user_role==="customer").length,
        mrr:       u.filter(x=>x.plan_status==="active").reduce((a,x)=>a+(MRR_BY_PLAN[x.plan]||0),0),
        trialing:  u.filter(x=>x.plan_status==="trialing").length,
      })
    } catch {}
    setLoading(false)
  }

  function showToast(msg,ok=true){setToast({msg,ok});setTimeout(()=>setToast(null),4000)}

  async function changeRole(userId, newRole) {
    try {
      const r = await fetch("/api/db/users",{method:"PATCH",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({id:userId,user_role:newRole})})
      const d = await r.json()
      if(d.profile){ setUsers(u=>u.map(x=>x.id===userId?{...x,user_role:newRole}:x)); showToast("Role updated") }
      else showToast(d.error||"Failed",false)
    } catch(e){showToast(e.message,false)}
  }

  async function deleteUser(userId) {
    if(!confirm("Delete this user? This cannot be undone.")) return
    const r = await fetch(`/api/db/users?id=${userId}`,{method:"DELETE",headers:{Authorization:"Bearer "+token}})
    if(r.ok){setUsers(u=>u.filter(x=>x.id!==userId));showToast("User deleted")}
    else showToast("Delete failed",false)
  }

  return (<>
    <Head><title>SIXXAB AI — Admin</title></Head>
    <style>{`
      body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      .fu{animation:fadeUp .3s ease}
      .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
      .inp{padding:8px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;color:${N};font-family:inherit;outline:none}
      .inp:focus{border-color:${AMBER}}
      select.inp{cursor:pointer}
      .row:hover{background:#FAFAFA}
    `}</style>
    <SixxabNav active="/admin"/>

    {toast&&<div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

    <div style={{background:N,padding:"16px 5%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:CHALK,marginBottom:2}}>Admin <span style={{color:AMBER,fontStyle:"italic"}}>Dashboard</span></h1>
          <p style={{fontSize:12,color:"rgba(245,245,240,.4)"}}>User management · Roles · Platform metrics</p>
        </div>
        {/* KPIs */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["Users",stats.total,CHALK],["Admins",stats.admins,"#DC2626"],["Operators",stats.operators,"#7C3AED"],["Customers",stats.customers,GREEN],["Trialing",stats.trialing,AMBER],["MRR","$"+stats.mrr.toLocaleString(),GREEN]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",padding:"6px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
              <div style={{fontFamily:"Georgia",fontSize:18,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontSize:9.5,color:"rgba(245,245,240,.35)",textTransform:"uppercase",letterSpacing:".06em"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 20px 60px"}}>
      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input className="inp" placeholder="Search users…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:220}}/>
        <select className="inp" value={roleFilter} onChange={e=>setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
          <option value="customer">Customer</option>
        </select>
        <span style={{fontSize:13,color:"#94A3B8",marginLeft:"auto"}}>{users.length} users</span>
      </div>

      {/* Users table */}
      <div className="card">
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
                {["User","Role","Plan","Status","Joined","Actions"].map(h=>(
                  <th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading?<tr><td colSpan={6} style={{padding:"32px",textAlign:"center",color:"#94A3B8"}}>Loading…</td></tr>
              :users.length===0?<tr><td colSpan={6} style={{padding:"32px",textAlign:"center",color:"#94A3B8"}}>No users found</td></tr>
              :users.map(u=>(
                <tr key={u.id} className="row" style={{borderBottom:"1px solid #F1F5F9"}}>
                  <td style={{padding:"12px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:9,background:`${ROLE_COLORS[u.user_role]||"#64748B"}18`,border:`1px solid ${ROLE_COLORS[u.user_role]||"#64748B"}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:ROLE_COLORS[u.user_role]||"#64748B",flexShrink:0}}>
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
                    <select value={u.user_role||"customer"} onChange={e=>changeRole(u.id,e.target.value)}
                      style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${ROLE_COLORS[u.user_role]||"#64748B"}44`,background:`${ROLE_COLORS[u.user_role]||"#64748B"}12`,fontSize:12,fontWeight:600,color:ROLE_COLORS[u.user_role]||"#64748B",cursor:"pointer",fontFamily:"inherit"}}>
                      <option value="admin">Admin</option>
                      <option value="operator">Operator</option>
                      <option value="customer">Customer</option>
                    </select>
                  </td>
                  <td style={{padding:"12px 16px"}}>
                    <span style={{fontSize:12.5,fontWeight:600,color:PLAN_COLORS[u.plan]||"#64748B",textTransform:"capitalize"}}>{u.plan||"starter"}</span>
                  </td>
                  <td style={{padding:"12px 16px"}}>
                    <span style={{padding:"3px 9px",borderRadius:20,background:`${STATUS_COLORS[u.plan_status]||"#94A3B8"}15`,fontSize:11.5,fontWeight:600,color:STATUS_COLORS[u.plan_status]||"#94A3B8",textTransform:"capitalize"}}>{u.plan_status||"active"}</span>
                  </td>
                  <td style={{padding:"12px 16px",fontSize:12.5,color:"#64748B"}}>{u.created_at?new Date(u.created_at).toLocaleDateString():"-"}</td>
                  <td style={{padding:"12px 16px"}}>
                    <button onClick={()=>deleteUser(u.id)} style={{padding:"4px 10px",borderRadius:7,background:"#FEF2F2",border:"1px solid #FECACA",color:"#DC2626",fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </>)
}
