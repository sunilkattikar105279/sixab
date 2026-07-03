// pages/billing.js — SIXXAB AI · Billing & Subscription
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N="#0A0E1A",AMBER="#EF9F27",CHALK="#F5F5F0",GREEN="#1D9E75"

const PLANS=[
  {id:"starter",name:"Starter",price:250,desc:"Validate and launch your business",
   features:["Niche Selector","Orchestrator — 18 agents","Content Studio","Lead Generation","AI Coach","SIXXAB CRM (100 contacts)","Social Hub (3 platforms)","Email support"]},
  {id:"pro",name:"Pro",price:999,desc:"Scale with full CXO suite",highlight:true,
   features:["Everything in Starter","11 CXO advisors — CEO to Board","Unlimited CRM contacts","Website Builder + Deploy","Social Hub — all platforms","Proposal Writer","Investor Hub","Customer Success agents","Priority Slack support"]},
  {id:"agency",name:"Agency",price:2499,desc:"Manage multiple businesses and clients",
   features:["Everything in Pro","10 team seats","White-label portal","30 Vertical Agent Packs","Corporate Board agents","20% advisor rev share","API access","Dedicated success manager"]},
]

export default function BillingPage() {
  const [profile,     setProfile]    = useState(null)
  const [loading,     setLoading]    = useState(false)
  const [toast,       setToast]      = useState(null)
  const [token,       setToken]      = useState(null)
  const success = typeof window!=="undefined" && new URLSearchParams(window.location.search).get("success")
  const cancelled= typeof window!=="undefined" && new URLSearchParams(window.location.search).get("cancelled")

  useEffect(()=>{
    // Get token from Supabase session in localStorage
    try {
      const keys=Object.keys(localStorage).filter(k=>k.startsWith("sb-")&&k.endsWith("-auth-token"))
      if(keys.length) {
        const session=JSON.parse(localStorage.getItem(keys[0]))
        setToken(session?.access_token)
        setProfile({email:session?.user?.email, plan:session?.user?.user_metadata?.plan||"starter", plan_status:"active"})
      }
    } catch{}
  },[])

  function showToast(msg,ok=true){setToast({msg,ok});setTimeout(()=>setToast(null),5000)}

  async function subscribe(planId) {
    if(!token){showToast("Please sign in first — go to /login",false);return}
    setLoading(true)
    try {
      const r=await fetch("/api/stripe/checkout",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({plan:planId})})
      const d=await r.json()
      if(d.url) window.location.href=d.url
      else showToast(d.error||"Checkout failed",false)
    } catch(e){showToast(e.message,false)}
    setLoading(false)
  }

  async function openPortal() {
    if(!token){showToast("Please sign in first",false);return}
    setLoading(true)
    try {
      const r=await fetch("/api/stripe/portal",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token}})
      const d=await r.json()
      if(d.url) window.location.href=d.url
      else showToast(d.error||"Portal failed",false)
    } catch(e){showToast(e.message,false)}
    setLoading(false)
  }

  return(<>
    <Head><title>SIXXAB AI — Billing</title></Head>
    <style>{`
      body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      .fu{animation:fadeUp .3s ease}
      .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
    `}</style>
    <SixxabNav active="/billing"/>

    {toast&&<div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.15)"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

    {/* Page header */}
    <div style={{background:N,padding:"20px 5%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:26,fontWeight:700,color:CHALK,marginBottom:6}}>Billing <span style={{color:AMBER,fontStyle:"italic"}}>& Plans</span></h1>
      <p style={{fontSize:13,color:"rgba(245,245,240,.45)"}}>14-day free trial on all plans · Cancel anytime · No lock-in</p>
    </div>

    <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 20px 60px"}}>

      {/* Success / cancel banners */}
      {success&&<div className="fu" style={{padding:"14px 20px",borderRadius:12,background:"#E1F5EE",border:"1px solid #6EE7B7",fontSize:14,fontWeight:600,color:"#085041",marginBottom:20}}>🎉 Welcome! Your subscription is active. Check your email for confirmation.</div>}
      {cancelled&&<div className="fu" style={{padding:"14px 20px",borderRadius:12,background:"#FEF3C7",border:"1px solid #FCD34D",fontSize:14,color:"#92400E",marginBottom:20}}>Checkout cancelled. No charge was made. Choose a plan below when ready.</div>}

      {/* Current plan */}
      {profile&&(
        <div className="card" style={{padding:"20px 24px",marginBottom:28,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Current plan</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:N}}>{PLANS.find(p=>p.id===profile.plan)?.name||"Starter"}</span>
              <span style={{padding:"3px 10px",borderRadius:20,background:profile.plan_status==="active"||profile.plan_status==="trialing"?"#E1F5EE":"#FEF2F2",fontSize:11,fontWeight:700,color:profile.plan_status==="active"||profile.plan_status==="trialing"?GREEN:"#DC2626"}}>
                {profile.plan_status==="trialing"?"Free trial active":profile.plan_status==="active"?"Active":profile.plan_status==="past_due"?"⚠ Payment due":profile.plan_status||"Active"}
              </span>
            </div>
            <div style={{fontSize:13,color:"#64748B",marginTop:3}}>{profile.email}</div>
          </div>
          <button onClick={openPortal} disabled={loading}
            style={{padding:"10px 22px",borderRadius:9,background:N,color:CHALK,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13.5,fontWeight:600}}>
            Manage subscription →
          </button>
        </div>
      )}

      {/* Plan cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:36}}>
        {PLANS.map(plan=>{
          const current = profile?.plan===plan.id
          return(
            <div key={plan.id} style={{background:plan.highlight?N:"#fff",borderRadius:14,border:plan.highlight?`2px solid ${AMBER}`:`1.5px solid ${current?"#1D9E75":"#E2E8F0"}`,padding:"26px 22px",display:"flex",flexDirection:"column",position:"relative"}}>
              {plan.highlight&&<div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",background:AMBER,color:N,fontSize:11,fontWeight:700,padding:"4px 16px",borderRadius:20,whiteSpace:"nowrap"}}>Most Popular</div>}
              {current&&!plan.highlight&&<div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",background:GREEN,color:"#fff",fontSize:11,fontWeight:700,padding:"4px 16px",borderRadius:20}}>Current Plan</div>}
              <div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:plan.highlight?CHALK:N,marginBottom:3}}>{plan.name}</div>
              <div style={{fontSize:13,color:plan.highlight?"rgba(245,245,240,.5)":"#64748B",marginBottom:18}}>{plan.desc}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:6}}>
                <span style={{fontFamily:"Georgia,serif",fontSize:44,fontWeight:700,color:plan.highlight?CHALK:N,lineHeight:1}}>${plan.price}</span>
                <span style={{fontSize:13,color:plan.highlight?"rgba(245,245,240,.4)":"#94A3B8"}}>/mo</span>
              </div>
              <div style={{fontSize:12.5,color:GREEN,fontWeight:500,marginBottom:20}}>14-day free trial</div>
              <ul style={{listStyle:"none",flex:1,marginBottom:22,display:"flex",flexDirection:"column",gap:8}}>
                {plan.features.map(f=>(
                  <li key={f} style={{display:"flex",gap:8,fontSize:13.5,color:plan.highlight?CHALK:N,alignItems:"flex-start"}}>
                    <span style={{color:GREEN,flexShrink:0,marginTop:2}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={()=>current?openPortal():subscribe(plan.id)} disabled={loading}
                style={{padding:"13px",borderRadius:10,fontSize:14,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"inherit",background:current?`${GREEN}18`:plan.highlight?AMBER:"#0A0E1A",color:current?GREEN:plan.highlight?N:"#fff",transition:"opacity .15s"}}>
                {loading?"Working…":current?"Manage plan →":"Start free trial →"}
              </button>
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="card" style={{padding:"24px 28px"}}>
        <div style={{fontSize:17,fontWeight:700,color:N,marginBottom:18,fontFamily:"Georgia,serif"}}>Billing FAQ</div>
        {[
          ["When does the free trial start?","Your 14-day trial starts the moment you click Subscribe. No charge until day 15."],
          ["Can I cancel anytime?","Yes — cancel from the billing portal with one click. No cancellation fees, no lock-in."],
          ["What payment methods do you accept?","All major credit/debit cards via Stripe. Bank transfer available for Agency plan on request."],
          ["Can I switch plans?","Yes — upgrade or downgrade at any time from the Manage Subscription portal. Prorated automatically."],
          ["Is there a money-back guarantee?","Yes — 14-day money-back if SIXXAB AI doesn't help you make meaningful progress."],
        ].map(([q,a])=>(
          <div key={q} style={{marginBottom:16,paddingBottom:16,borderBottom:"1px solid #F1F5F9"}}>
            <div style={{fontSize:14,fontWeight:600,color:N,marginBottom:4}}>{q}</div>
            <div style={{fontSize:13.5,color:"#64748B",lineHeight:1.7}}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  </>)
}
