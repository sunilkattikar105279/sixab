// pages/admin.js — Admin dashboard (admin role only)
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N="#0A0E1A",AMBER="#EF9F27",CHALK="#F5F5F0",GREEN="#1D9E75"
const ROLE_COLORS={admin:"#DC2626",operator:"#7C3AED",customer:GREEN}
const PLAN_COLORS={starter:"#64748B",pro:"#2563EB",agency:"#7C3AED"}
const STATUS_COLORS={active:GREEN,trialing:AMBER,past_due:"#DC2626",cancelled:"#94A3B8"}

export default function AdminPage() {
  const [users,    setUsers]    = useState([])
  const [stats,    setStats]    = useState({total:0,admins:0,operators:0,customers:0,mrr:0,trialing:0})
  const [search,   setSearch]   = useState("")
  const [roleFilter,setRole]    = useState("")
  const [loading,  setLoading]  = useState(true)
  const [token,    setToken]    = useState(null)
  const [toast,    setToast]    = useState(null)
  const [tab,      setTab]      = useState("users")

  useEffect(()=>{
    try {
      const keys=Object.keys(localStorage).filter(k=>k.startsWith("sb-")&&k.endsWith("-auth-token"))
      if(!keys.length){window.location.href="/login";return}
      const s=JSON.parse(localStorage.getItem(keys[0])||"{}")
      setToken(s.access_token)
    }catch{window.location.href="/login"}
  },[])

  useEffect(()=>{if(token)load()},[token,search,roleFilter])

  async function load(){
    setLoading(true)
    try{
      const p=new URLSearchParams({limit:"500",...(search&&{search}),...(roleFilter&&{role:roleFilter})})
      const r=await fetch(`/api/db-users?${p}`,{headers:{Authorization:"Bearer "+token}})
      if(r.status===403){window.location.href="/";return}
      const d=await r.json()
      const u=d.users||[]
      setUsers(u)
      const MRR={starter:250,pro:999,agency:2499}
      setStats({
        total:u.length,
        admins:u.filter(x=>x.user_role==="admin").length,
        operators:u.filter(x=>x.user_role==="operator").length,
        customers:u.filter(x=>x.user_role==="customer").length,
        mrr:u.filter(x=>x.plan_status==="active").reduce((a,x)=>a+(MRR[x.plan]||0),0),
        trialing:u.filter(x=>x.plan_status==="trialing").length,
      })
    }catch(e){toast_(e.message,false)}
    setLoading(false)
  }

  function toast_(msg,ok=true){setToast({msg,ok});setTimeout(()=>setToast(null),4000)}

  async function changeRole(id,role){
    try{
      const r=await fetch("/api/db-users",{method:"PATCH",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({id,user_role:role})})
      const d=await r.json()
      if(d.profile){setUsers(u=>u.map(x=>x.id===id?{...x,user_role:role}:x));toast_("Role updated to "+role)}
      else toast_(d.error||"Failed",false)
    }catch(e){toast_(e.message,false)}
  }

  return(<>
    <Head><title>SIXXAB AI — Admin</title></Head>
    <style>{`
      body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      .fu{animation:fadeUp .3s ease}
      .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
      .inp{padding:8px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;color:${N};font-family:inherit;outline:none}
      .inp:focus{border-color:${AMBER}}
      tr:hover td{background:#FAFAFA}
      .tab{padding:7px 16px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;transition:all .14s}
      .tab-on{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.1)}
      .tab-off{background:transparent;color:#64748B}
    `}</style>
    <SixxabNav active="/admin"/>

    {toast&&<div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

    {/* Header */}
    <div style={{background:N,padding:"16px 5%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:CHALK,marginBottom:2}}>Admin <span style={{color:AMBER,fontStyle:"italic"}}>Dashboard</span></h1>
          <p style={{fontSize:12,color:"rgba(245,245,240,.4)"}}>User management · Roles · Platform metrics</p>
        </div>
        {/* KPI row */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["Users",stats.total,CHALK],["Admins",stats.admins,"#FCA5A5"],["Operators",stats.operators,"#C4B5FD"],["Customers",stats.customers,"#6EE7B7"],["Trialing",stats.trialing,AMBER],["MRR","$"+stats.mrr.toLocaleString(),GREEN]].map(([l,v,c])=>(
            <div key={l} style={{textAlign:"center",padding:"6px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
              <div style={{fontFamily:"Georgia",fontSize:17,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontSize:9.5,color:"rgba(245,245,240,.35)",textTransform:"uppercase",letterSpacing:".06em",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 20px 60px"}}>

      {/* Tabs */}
      <div style={{display:"inline-flex",gap:3,background:"#E8ECF4",borderRadius:10,padding:3,marginBottom:16}}>
        {[["users","👥 Users"],["roles","🔐 Roles Guide"],["stats","📊 Stats"]].map(([t,l])=>(
          <button key={t} className={`tab ${tab===t?"tab-on":"tab-off"}`} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      {tab==="users"&&(<>
        {/* Filters */}
        <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
          <input className="inp" placeholder="Search by name, email, company…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:260}}/>
          <select className="inp" value={roleFilter} onChange={e=>setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="customer">Customer</option>
          </select>
          <button onClick={load} style={{padding:"8px 16px",borderRadius:8,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>Refresh</button>
          <span style={{fontSize:13,color:"#94A3B8",marginLeft:"auto"}}>{users.length} users</span>
        </div>

        {/* Users table */}
        <div className="card">
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
                {loading
                  ?<tr><td colSpan={6} style={{padding:"40px",textAlign:"center",color:"#94A3B8"}}>Loading users…</td></tr>
                  :users.length===0
                    ?<tr><td colSpan={6} style={{padding:"40px",textAlign:"center",color:"#94A3B8"}}>No users found</td></tr>
                    :users.map(u=>(
                    <tr key={u.id} style={{borderBottom:"1px solid #F1F5F9"}}>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:34,height:34,borderRadius:9,background:`${ROLE_COLORS[u.user_role]||"#64748B"}15`,border:`1px solid ${ROLE_COLORS[u.user_role]||"#64748B"}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:ROLE_COLORS[u.user_role]||"#64748B",flexShrink:0}}>
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
                        <span style={{padding:"3px 10px",borderRadius:20,background:`${ROLE_COLORS[u.user_role]||"#64748B"}15`,border:`1px solid ${ROLE_COLORS[u.user_role]||"#64748B"}30`,fontSize:12,fontWeight:600,color:ROLE_COLORS[u.user_role]||"#64748B",textTransform:"capitalize"}}>
                          {u.user_role||"customer"}
                        </span>
                      </td>
                      <td style={{padding:"12px 16px",fontSize:13,fontWeight:500,color:PLAN_COLORS[u.plan]||"#64748B",textTransform:"capitalize"}}>{u.plan||"starter"}</td>
                      <td style={{padding:"12px 16px"}}>
                        <span style={{padding:"3px 9px",borderRadius:20,background:`${STATUS_COLORS[u.plan_status]||"#94A3B8"}15`,fontSize:11.5,fontWeight:600,color:STATUS_COLORS[u.plan_status]||"#94A3B8",textTransform:"capitalize"}}>
                          {u.plan_status||"—"}
                        </span>
                      </td>
                      <td style={{padding:"12px 16px",fontSize:12.5,color:"#64748B",whiteSpace:"nowrap"}}>{u.created_at?new Date(u.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"}):"-"}</td>
                      <td style={{padding:"12px 16px"}}>
                        <select
                          value={u.user_role||"customer"}
                          onChange={e=>changeRole(u.id,e.target.value)}
                          style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${ROLE_COLORS[u.user_role]||"#64748B"}40`,background:`${ROLE_COLORS[u.user_role]||"#64748B"}10`,fontSize:12,fontWeight:600,color:ROLE_COLORS[u.user_role]||"#64748B",cursor:"pointer",fontFamily:"inherit"}}>
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
      </>)}

      {tab==="roles"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
          {[
            {role:"admin",color:"#DC2626",bg:"#FEF2F2",border:"#FECACA",title:"Admin",perms:["View and edit all users","Change any user's role","Access all data across all accounts","View platform MRR and metrics","Delete user accounts","Full access to every tool"]},
            {role:"operator",color:"#7C3AED",bg:"#F5F3FF",border:"#DDD6FE",title:"Operator",perms:["Manage customers in their org","Invite new customers","View customers' CRM and leads","Run agents on behalf of customers","Website Builder for clients","Upgrade to Agency plan required"]},
            {role:"customer",color:GREEN,bg:"#F0FDF4",border:"#BBF7D0",title:"Customer",perms:["Full access to own workspace","CRM, Leads, Content Studio","Website Builder + Deploy","Social Hub all platforms","AI Coach and all 18 agents","Billed individually per plan"]},
          ].map(({role,color,bg,border,title,perms})=>(
            <div key={role} style={{background:bg,borderRadius:14,border:`2px solid ${border}`,padding:"22px"}}>
              <div style={{fontSize:16,fontWeight:800,color,marginBottom:4}}>{title}</div>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
                {perms.map(p=>(
                  <li key={p} style={{display:"flex",gap:8,fontSize:13.5,color:"#1a1a2e",alignItems:"flex-start"}}>
                    <span style={{color,flexShrink:0}}>✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab==="stats"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
          {[
            {label:"Total Users",value:stats.total,icon:"👥",color:N},
            {label:"Admins",value:stats.admins,icon:"⚙️",color:"#DC2626"},
            {label:"Operators",value:stats.operators,icon:"🏢",color:"#7C3AED"},
            {label:"Customers",value:stats.customers,icon:"👤",color:GREEN},
            {label:"On Trial",value:stats.trialing,icon:"⏰",color:AMBER},
            {label:"Monthly MRR",value:"$"+stats.mrr.toLocaleString(),icon:"💰",color:GREEN},
          ].map(({label,value,icon,color})=>(
            <div key={label} className="card" style={{padding:"22px",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:8}}>{icon}</div>
              <div style={{fontFamily:"Georgia",fontSize:32,fontWeight:800,color,lineHeight:1,marginBottom:6}}>{value}</div>
              <div style={{fontSize:13,color:"#64748B"}}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  </>)
}
