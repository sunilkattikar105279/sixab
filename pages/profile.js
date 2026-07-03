// pages/profile.js — User profile + business setup + role info
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N="#0A0E1A",AMBER="#EF9F27",CHALK="#F5F5F0",GREEN="#1D9E75"

const ROLE_CONFIG = {
  admin:    { label:"Admin",    color:"#DC2626", bg:"#FEF2F2", border:"#FECACA", desc:"Full platform access — all users, all data, all tools" },
  operator: { label:"Operator", color:"#7C3AED", bg:"#F5F3FF", border:"#DDD6FE", desc:"Manage customer accounts within your organisation" },
  customer: { label:"Customer", color:"#1D9E75", bg:"#F0FDF4", border:"#BBF7D0", desc:"Full access to your own SIXXAB AI workspace" },
}

const STAGES = ["Pre-revenue","$0–$10k MRR","$10k–$50k MRR","$50k–$200k MRR","$200k–$500k MRR","$500k–$2M ARR","$2M+ ARR"]
const INDUSTRIES = ["Technology Consulting","SaaS","HVAC & Home Services","Real Estate","Legal","Marketing Agency","Financial Services","Health & Wellness","E-commerce","Manufacturing","Other"]

export default function ProfilePage() {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [biz,     setBiz]     = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [tab,     setTab]     = useState("profile")
  const [toast,   setToast]   = useState(null)
  const [token,   setToken]   = useState(null)

  useEffect(() => {
    loadSession()
  }, [])

  async function loadSession() {
    try {
      // Load from Supabase localStorage session
      const keys = Object.keys(localStorage).filter(k => k.startsWith("sb-") && k.endsWith("-auth-token"))
      if (!keys.length) return
      const session = JSON.parse(localStorage.getItem(keys[0]) || "{}")
      if (!session?.access_token) return
      setToken(session.access_token)
      setUser(session.user)

      // Load profile + business from DB
      const [pRes, bRes] = await Promise.all([
        fetch("/api/db/users", { headers: { Authorization: "Bearer " + session.access_token } }),
        fetch("/api/db/business", { headers: { Authorization: "Bearer " + session.access_token } }),
      ])
      const pData = await pRes.json()
      const bData = await bRes.json()
      if (pData.users?.[0]) setProfile(pData.users[0])
      if (bData.business) setBiz(bData.business)
    } catch(e) { console.error(e) }
  }

  function showToast(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),4000) }

  async function saveProfile() {
    if (!token) return
    setSaving(true)
    try {
      const r = await fetch("/api/db/users", {
        method:"PATCH", headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
        body: JSON.stringify(profile),
      })
      const d = await r.json()
      if (d.profile) { setProfile(d.profile); showToast("Profile saved!") }
      else showToast(d.error || "Save failed", false)
    } catch(e) { showToast(e.message, false) }
    setSaving(false)
  }

  async function saveBusiness() {
    if (!token) return
    setSaving(true)
    try {
      const r = await fetch("/api/db/business", {
        method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
        body: JSON.stringify(biz),
      })
      const d = await r.json()
      if (d.business) { setBiz(d.business); showToast("Business profile saved!") }
      else showToast(d.error || "Save failed", false)
    } catch(e) { showToast(e.message, false) }
    setSaving(false)
  }

  const roleInfo = ROLE_CONFIG[profile?.user_role || "customer"]

  return (<>
    <Head><title>SIXXAB AI — My Profile</title></Head>
    <style>{`
      body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      .fu{animation:fadeUp .3s ease}
      .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
      .inp{width:100%;padding:10px 13px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:${N};background:#fff;font-family:inherit;outline:none;transition:border .15s}
      .inp:focus{border-color:${AMBER}}
      select.inp{cursor:pointer}
      textarea.inp{resize:vertical;line-height:1.65}
      .lbl{font-size:10.5px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:5px}
      .tab{padding:8px 18px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;transition:all .14s}
      .tab-on{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.08)}
      .tab-off{background:transparent;color:#64748B}
    `}</style>
    <SixxabNav active="/profile"/>

    {toast&&<div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

    {/* Header */}
    <div style={{background:N,padding:"16px 5%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        {/* Avatar */}
        <div style={{width:56,height:56,borderRadius:16,background:`${AMBER}22`,border:`2px solid ${AMBER}55`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22,fontWeight:700,color:AMBER,fontFamily:"Georgia,serif"}}>
          {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:CHALK,marginBottom:3}}>
            {profile?.full_name || "Your Profile"}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:13,color:"rgba(245,245,240,.5)"}}>{user?.email}</span>
            {roleInfo&&<span style={{padding:"2px 10px",borderRadius:20,background:roleInfo.bg,border:`1px solid ${roleInfo.border}`,fontSize:11,fontWeight:700,color:roleInfo.color}}>{roleInfo.label}</span>}
            {profile?.plan&&<span style={{padding:"2px 10px",borderRadius:20,background:"rgba(29,158,117,.15)",border:"1px solid rgba(29,158,117,.3)",fontSize:11,fontWeight:600,color:"#6EE7B7"}}>{profile.plan} plan</span>}
          </div>
        </div>
        <a href="/billing" style={{padding:"8px 18px",borderRadius:9,background:AMBER,color:N,textDecoration:"none",fontSize:13,fontWeight:700}}>Manage billing →</a>
      </div>
    </div>

    {/* Tabs */}
    <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"8px 5%"}}>
      <div style={{display:"flex",gap:4,background:"#F1F5F9",borderRadius:10,padding:3,width:"fit-content"}}>
        {[["profile","👤 Profile"],["business","🏢 Business"],["access","🔐 Access & Role"],["team","👥 Team"]].map(([t,l])=>(
          <button key={t} className={`tab ${tab===t?"tab-on":"tab-off"}`} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>
    </div>

    <div style={{maxWidth:860,margin:"0 auto",padding:"24px 20px 60px"}}>

      {/* PROFILE TAB */}
      {tab==="profile"&&(
        <div className="card fu">
          <div style={{padding:"14px 20px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:14,fontWeight:700,color:N}}>Personal details</div>
            <button onClick={saveProfile} disabled={saving||!profile} style={{padding:"8px 20px",borderRadius:9,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13.5,fontWeight:700}}>
              {saving?"Saving…":"Save changes"}
            </button>
          </div>
          <div style={{padding:"20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[["full_name","Full name","Your full name"],["company","Company","Your business name"],["phone","Phone","+1 (972) 000-0000"],["timezone","Timezone","America/Chicago"]].map(([k,l,ph])=>(
              <div key={k}>
                <label className="lbl">{l}</label>
                <input className="inp" value={profile?.[k]||""} placeholder={ph}
                  onChange={e=>setProfile(p=>({...p,[k]:e.target.value}))}/>
              </div>
            ))}
            <div style={{gridColumn:"1/-1"}}>
              <label className="lbl">Bio</label>
              <textarea className="inp" rows={2} placeholder="Brief bio — used by AI agents to personalise advice"
                value={profile?.bio||""} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))}/>
            </div>
          </div>
        </div>
      )}

      {/* BUSINESS TAB */}
      {tab==="business"&&(
        <div className="card fu">
          <div style={{padding:"14px 20px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:N}}>Business profile</div>
              <div style={{fontSize:12,color:"#64748B"}}>This context is used by all 18 SIXXAB AI agents to personalise every response</div>
            </div>
            <button onClick={saveBusiness} disabled={saving} style={{padding:"8px 20px",borderRadius:9,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13.5,fontWeight:700}}>
              {saving?"Saving…":"Save"}
            </button>
          </div>
          <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <label className="lbl">Business name *</label>
                <input className="inp" value={biz?.business_name||""} placeholder="BigTech Consulting" onChange={e=>setBiz(b=>({...b,business_name:e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Industry</label>
                <select className="inp" value={biz?.industry||""} onChange={e=>setBiz(b=>({...b,industry:e.target.value}))}>
                  <option value="">Select…</option>
                  {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Current stage</label>
                <select className="inp" value={biz?.stage||""} onChange={e=>setBiz(b=>({...b,stage:e.target.value}))}>
                  {STAGES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Target MRR ($)</label>
                <input className="inp" type="number" value={biz?.target_mrr||""} placeholder="10000" onChange={e=>setBiz(b=>({...b,target_mrr:e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Location</label>
                <input className="inp" value={biz?.location||""} placeholder="Dallas, TX" onChange={e=>setBiz(b=>({...b,location:e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Website</label>
                <input className="inp" value={biz?.website||""} placeholder="https://" onChange={e=>setBiz(b=>({...b,website:e.target.value}))}/>
              </div>
            </div>
            {[["target_market","Target market","Who buys from you — job title, company size, geography"],["icp","Ideal Customer Profile (ICP)","Describe your perfect customer in detail"],["usp","Unique Selling Proposition","What makes you different from every competitor"],["pain_points","Customer pain points","What problems do your customers desperately need solved"]].map(([k,l,ph])=>(
              <div key={k}>
                <label className="lbl">{l}</label>
                <textarea className="inp" rows={2} placeholder={ph} value={biz?.[k]||""} onChange={e=>setBiz(b=>({...b,[k]:e.target.value}))}/>
              </div>
            ))}
            <div style={{padding:"13px 16px",borderRadius:10,background:"#FFFBF2",border:"1px solid rgba(239,159,39,.3)",fontSize:13,color:"#92400E"}}>
              💡 The more detail you add here, the better every AI agent performs. Your CXO Suite, Lead Gen, Content Studio and all 18 agents use this as context for every response.
            </div>
          </div>
        </div>
      )}

      {/* ACCESS & ROLE TAB */}
      {tab==="access"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card fu">
            <div style={{padding:"14px 20px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
              <div style={{fontSize:14,fontWeight:700,color:N}}>Your access level</div>
            </div>
            <div style={{padding:"20px"}}>
              <div style={{display:"flex",gap:14}}>
                {Object.entries(ROLE_CONFIG).map(([role,info])=>(
                  <div key={role} style={{flex:1,padding:"16px",borderRadius:11,border:`2px solid ${profile?.user_role===role?info.color:"#E2E8F0"}`,background:profile?.user_role===role?info.bg:"#F8F9FA",transition:"all .15s"}}>
                    <div style={{fontSize:14,fontWeight:700,color:profile?.user_role===role?info.color:N,marginBottom:4}}>{info.label}</div>
                    <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.6}}>{info.desc}</div>
                    {profile?.user_role===role&&<div style={{marginTop:8,fontSize:11,fontWeight:700,color:info.color}}>✓ Your current role</div>}
                  </div>
                ))}
              </div>
              <div style={{marginTop:16,padding:"12px 16px",borderRadius:10,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:13,color:"#64748B"}}>
                Role changes are managed by the platform admin. Contact <a href="mailto:sunil.kattikar@gmail.com" style={{color:AMBER}}>sunil.kattikar@gmail.com</a> to request a role change.
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{padding:"14px 20px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
              <div style={{fontSize:14,fontWeight:700,color:N}}>What you can access</div>
            </div>
            <div style={{padding:"16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                ["Orchestrator & CXO Suite","All plans"],["Lead Generation","All plans"],["SIXXAB CRM","All plans"],
                ["Content Studio","All plans"],["Social Hub","All plans"],["Website Builder","All plans"],
                ["Investor Hub","Pro + Agency"],["Vertical Packs","Pro + Agency"],["Team management","Agency only"],
                ["Admin dashboard","Admin only"],["All users data","Admin only"],["White-label","Agency only"],
              ].map(([feat,access])=>(
                <div key={feat} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"#F8F9FA",border:"1px solid #E8ECF4"}}>
                  <span style={{fontSize:13,color:N}}>{feat}</span>
                  <span style={{fontSize:11.5,fontWeight:600,color:access==="All plans"?GREEN:access.includes("Admin")?AMBER:"#7C3AED"}}>{access}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TEAM TAB */}
      {tab==="team"&&(
        <div className="card fu" style={{padding:"28px",textAlign:"center",color:"#94A3B8"}}>
          <i className="ti ti-users" style={{fontSize:36,color:"rgba(239,159,39,.3)",display:"block",marginBottom:12}} aria-hidden="true"/>
          <div style={{fontSize:15,fontWeight:600,color:"#64748B",marginBottom:8}}>Team management</div>
          <div style={{fontSize:13,lineHeight:1.7,maxWidth:320,margin:"0 auto 16px"}}>
            {profile?.plan==="agency" ? "Invite team members and operators to your organisation." : "Upgrade to Agency plan to invite team members and manage clients."}
          </div>
          {profile?.plan!=="agency"
            ? <a href="/billing" style={{padding:"10px 22px",borderRadius:9,background:AMBER,color:N,textDecoration:"none",fontSize:13.5,fontWeight:700}}>Upgrade to Agency →</a>
            : <button style={{padding:"10px 22px",borderRadius:9,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13.5,fontWeight:700}}>Invite team member →</button>
          }
        </div>
      )}
    </div>
  </>)
}
