// pages/profile.js — User Profile + Business Context
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N="#0A0E1A",AMBER="#EF9F27",CHALK="#F5F5F0",GREEN="#1D9E75"
const ROLE_CONFIG={
  admin:    {label:"Admin",    color:"#DC2626",bg:"#FEF2F2",border:"#FECACA",desc:"Full platform access — all users, all data"},
  operator: {label:"Operator", color:"#7C3AED",bg:"#F5F3FF",border:"#DDD6FE",desc:"Manage customers within your organisation"},
  customer: {label:"Customer", color:GREEN,    bg:"#F0FDF4",border:"#BBF7D0",desc:"Full access to your SIXXAB AI workspace"},
}
const STAGES=["Pre-revenue","$0–$10k MRR","$10k–$50k MRR","$50k–$200k MRR","$200k+ MRR"]
const INDUSTRIES=["Technology Consulting","SaaS / Software","HVAC & Home Services","Real Estate","Legal","Marketing Agency","Financial Services","Health & Wellness","E-commerce","Manufacturing","Other"]

async function sbFetch(url,token,opts={}) {
  const r = await fetch(url,{...opts,headers:{"Content-Type":"application/json","Authorization":"Bearer "+token,...(opts.headers||{})}})
  return r.json()
}

export default function ProfilePage() {
  const [tab,    setTab]    = useState("profile")
  const [user,   setUser]   = useState(null)
  const [token,  setToken]  = useState(null)
  const [prof,   setProf]   = useState({})
  const [biz,    setBiz]    = useState({})
  const [saving, setSaving] = useState(false)
  const [toast,  setToast]  = useState(null)

  useEffect(()=>{
    try {
      const keys=Object.keys(localStorage).filter(k=>k.startsWith("sb-")&&k.endsWith("-auth-token"))
      if(!keys.length) return
      const s=JSON.parse(localStorage.getItem(keys[0])||"{}")
      if(!s?.access_token) return
      setToken(s.access_token)
      setUser(s.user)
      // Load profile + business
      Promise.all([
        fetch("/api/db-users",{headers:{Authorization:"Bearer "+s.access_token}}).then(r=>r.json()),
        fetch("/api/db-business",{headers:{Authorization:"Bearer "+s.access_token}}).then(r=>r.json()),
      ]).then(([pd,bd])=>{
        if(pd.users?.[0]) setProf(pd.users[0])
        if(bd.business)   setBiz(bd.business)
      }).catch(console.error)
    } catch{}
  },[])

  function toast_(msg,ok=true){setToast({msg,ok});setTimeout(()=>setToast(null),4000)}

  async function saveProfile(){
    setSaving(true)
    try {
      const d=await sbFetch("/api/db-users",token,{method:"PATCH",body:JSON.stringify(prof)})
      if(d.profile){setProf(d.profile);toast_("Profile saved!")}
      else toast_(d.error||"Save failed",false)
    }catch(e){toast_(e.message,false)}
    setSaving(false)
  }

  async function saveBusiness(){
    setSaving(true)
    try {
      const d=await sbFetch("/api/db-business",token,{method:"POST",body:JSON.stringify(biz)})
      if(d.business){setBiz(d.business);toast_("Business profile saved!")}
      else toast_(d.error||"Save failed",false)
    }catch(e){toast_(e.message,false)}
    setSaving(false)
  }

  const role=prof.user_role||"customer"
  const roleInfo=ROLE_CONFIG[role]
  const initials=(prof.full_name||user?.email||"U")[0].toUpperCase()

  return(<>
    <Head><title>SIXXAB AI — Profile</title></Head>
    <style>{`
      body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      .fu{animation:fadeUp .3s ease}
      .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0}
      .inp{width:100%;padding:10px 13px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:${N};font-family:inherit;outline:none;transition:border .15s}
      .inp:focus{border-color:${AMBER}}
      select.inp,textarea.inp{cursor:pointer;resize:vertical}
      .lbl{font-size:10.5px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:5px}
      .tab{padding:7px 16px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;transition:all .14s}
      .tab-on{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.1)}
      .tab-off{background:transparent;color:#64748B}
      .save-btn{padding:9px 22px;border-radius:9px;background:${AMBER};color:${N};border:none;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:700}
    `}</style>
    <SixxabNav active="/profile"/>

    {toast&&<div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

    {/* Header */}
    <div style={{background:N,padding:"16px 5%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{width:56,height:56,borderRadius:16,background:`${AMBER}22`,border:`2px solid ${AMBER}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:AMBER,fontFamily:"Georgia,serif"}}>
          {initials}
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:CHALK}}>{prof.full_name||"Your Profile"}</div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginTop:3}}>
            <span style={{fontSize:13,color:"rgba(245,245,240,.45)"}}>{user?.email}</span>
            {roleInfo&&<span style={{padding:"2px 10px",borderRadius:20,background:roleInfo.bg,border:`1px solid ${roleInfo.border}`,fontSize:11,fontWeight:700,color:roleInfo.color}}>{roleInfo.label}</span>}
            {prof.plan&&<span style={{padding:"2px 10px",borderRadius:20,background:"rgba(29,158,117,.15)",border:"1px solid rgba(29,158,117,.3)",fontSize:11,fontWeight:600,color:"#6EE7B7",textTransform:"capitalize"}}>{prof.plan} plan</span>}
          </div>
        </div>
        <a href="/billing" style={{padding:"8px 18px",borderRadius:9,background:AMBER,color:N,textDecoration:"none",fontSize:13,fontWeight:700}}>Manage billing →</a>
      </div>
    </div>

    {/* Tabs */}
    <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"8px 5%"}}>
      <div style={{display:"inline-flex",gap:3,background:"#F1F5F9",borderRadius:10,padding:3}}>
        {[["profile","👤 Profile"],["business","🏢 Business"],["access","🔐 Access"]].map(([t,l])=>(
          <button key={t} className={`tab ${tab===t?"tab-on":"tab-off"}`} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>
    </div>

    <div style={{maxWidth:860,margin:"0 auto",padding:"24px 20px 60px"}}>

      {tab==="profile"&&(
        <div className="card fu">
          <div style={{padding:"14px 20px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:14,fontWeight:700,color:N}}>Personal details</div>
            <button onClick={saveProfile} disabled={saving} className="save-btn">{saving?"Saving…":"Save changes"}</button>
          </div>
          <div style={{padding:"20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[["full_name","Full name","Your name"],["company","Company","Business name"],["phone","Phone","+1 (972) 000-0000"],["timezone","Timezone","America/Chicago"]].map(([k,l,ph])=>(
              <div key={k}><label className="lbl">{l}</label><input className="inp" value={prof[k]||""} placeholder={ph} onChange={e=>setProf(p=>({...p,[k]:e.target.value}))}/></div>
            ))}
            <div style={{gridColumn:"1/-1"}}>
              <label className="lbl">Bio <span style={{fontWeight:400,fontSize:10,color:"#94A3B8"}}>(used by AI agents)</span></label>
              <textarea className="inp" rows={2} value={prof.bio||""} placeholder="Brief bio about you and what you're building…" onChange={e=>setProf(p=>({...p,bio:e.target.value}))}/>
            </div>
          </div>
        </div>
      )}

      {tab==="business"&&(
        <div className="card fu">
          <div style={{padding:"14px 20px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:N}}>Business profile</div>
              <div style={{fontSize:12,color:"#64748B"}}>All 18 SIXXAB agents use this context to personalise every response</div>
            </div>
            <button onClick={saveBusiness} disabled={saving} className="save-btn">{saving?"Saving…":"Save"}</button>
          </div>
          <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label className="lbl">Business name *</label><input className="inp" value={biz.business_name||""} placeholder="e.g. BigTech Consulting" onChange={e=>setBiz(b=>({...b,business_name:e.target.value}))}/></div>
              <div><label className="lbl">Industry</label><select className="inp" value={biz.industry||""} onChange={e=>setBiz(b=>({...b,industry:e.target.value}))}><option value="">Select…</option>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select></div>
              <div><label className="lbl">Current stage</label><select className="inp" value={biz.stage||""} onChange={e=>setBiz(b=>({...b,stage:e.target.value}))}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label className="lbl">Target MRR ($)</label><input className="inp" type="number" value={biz.target_mrr||""} placeholder="10000" onChange={e=>setBiz(b=>({...b,target_mrr:e.target.value}))}/></div>
              <div><label className="lbl">Location</label><input className="inp" value={biz.location||""} placeholder="Dallas, TX" onChange={e=>setBiz(b=>({...b,location:e.target.value}))}/></div>
              <div><label className="lbl">Website</label><input className="inp" value={biz.website||""} placeholder="https://" onChange={e=>setBiz(b=>({...b,website:e.target.value}))}/></div>
            </div>
            {[
              ["target_market","Target market","Who buys from you — job title, company size, geography"],
              ["icp","Ideal Customer Profile (ICP)","Describe your perfect customer in 2-3 sentences"],
              ["usp","Unique Selling Proposition","What makes you different from every competitor"],
              ["pain_points","Customer pain points","What problems do your customers desperately need solved"],
            ].map(([k,l,ph])=>(
              <div key={k}><label className="lbl">{l}</label><textarea className="inp" rows={2} placeholder={ph} value={biz[k]||""} onChange={e=>setBiz(b=>({...b,[k]:e.target.value}))}/></div>
            ))}
            <div style={{padding:"12px 16px",borderRadius:10,background:"#FFFBF2",border:"1px solid rgba(239,159,39,.3)",fontSize:13,color:"#92400E"}}>
              💡 The more detail you add here, the sharper every agent gets. Your CEO, CMO, CSO, COO and all 18 agents read this before every response.
            </div>
          </div>
        </div>
      )}

      {tab==="access"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card fu">
            <div style={{padding:"14px 20px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
              <div style={{fontSize:14,fontWeight:700,color:N}}>Your access level</div>
            </div>
            <div style={{padding:"20px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {Object.entries(ROLE_CONFIG).map(([r,info])=>(
                <div key={r} style={{padding:"16px",borderRadius:11,border:`2px solid ${role===r?info.color:"#E2E8F0"}`,background:role===r?info.bg:"#F8F9FA"}}>
                  <div style={{fontSize:14,fontWeight:700,color:role===r?info.color:N,marginBottom:4}}>{info.label}</div>
                  <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.6}}>{info.desc}</div>
                  {role===r&&<div style={{marginTop:8,fontSize:11,fontWeight:700,color:info.color}}>✓ Your current role</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div style={{padding:"14px 20px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
              <div style={{fontSize:14,fontWeight:700,color:N}}>Feature access</div>
            </div>
            <div style={{padding:"16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                ["All AI Agents + CXO Suite","All plans"],["SIXXAB CRM","All plans"],
                ["Lead Generation","All plans"],["Content Studio","All plans"],
                ["Website Builder","All plans"],["Social Hub","All plans"],
                ["Investor Hub","Pro + Agency"],["Vertical Packs","Pro + Agency"],
                ["Team management","Agency only"],["Admin dashboard","Admin only"],
                ["All users data","Admin only"],["White-label portal","Agency only"],
              ].map(([feat,access])=>(
                <div key={feat} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"#F8F9FA",border:"1px solid #E8ECF4"}}>
                  <span style={{fontSize:13,color:N}}>{feat}</span>
                  <span style={{fontSize:11,fontWeight:600,color:access==="All plans"?GREEN:access.includes("Admin")?AMBER:"#7C3AED"}}>{access}</span>
                </div>
              ))}
            </div>
            {role==="admin"&&<div style={{margin:"0 16px 16px",padding:"12px 16px",borderRadius:10,background:"#FEF2F2",border:"1px solid #FECACA",fontSize:13,color:"#DC2626",fontWeight:500}}>⚙️ Admin: You can manage all users at <a href="/admin" style={{color:"#DC2626",fontWeight:700}}>/admin</a></div>}
          </div>
        </div>
      )}
    </div>
  </>)
}
