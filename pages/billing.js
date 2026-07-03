// pages/billing.js — SIXXAB AI · Billing & Plans
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N="#0A0E1A", AMBER="#EF9F27", CHALK="#F5F5F0", GREEN="#1D9E75"

const PLANS = [
  {
    id: "starter", name: "Starter", price: 250, yearlyPrice: 2250,
    desc: "Validate and launch your business",
    badge: null,
    features: [
      "Niche Validator + market scoring",
      "Orchestrator — 18 AI agents",
      "SIXXAB CRM — 100 contacts",
      "Lead Generation engine",
      "Content Studio",
      "Social Hub — 3 platforms",
      "AI Coach (chat)",
      "Email support",
    ],
  },
  {
    id: "pro", name: "Pro", price: 999, yearlyPrice: 8990,
    desc: "Scale with the full CXO suite",
    badge: "Most Popular",
    highlight: true,
    features: [
      "Everything in Starter",
      "11 CXO advisors — CEO to Board",
      "Unlimited CRM contacts",
      "Website Builder + 1-click Deploy",
      "Social Hub — all 5 platforms",
      "Proposal Writer",
      "Investor Hub",
      "30 Vertical Agent Packs",
      "Priority support",
    ],
  },
  {
    id: "agency", name: "Agency", price: 2499, yearlyPrice: 22490,
    desc: "Manage clients and teams at scale",
    badge: null,
    features: [
      "Everything in Pro",
      "10 team seats",
      "White-label client portal",
      "Corporate Board agents",
      "API access",
      "20% advisor revenue share",
      "Dedicated success manager",
      "Custom onboarding",
    ],
  },
]

export default function BillingPage() {
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState(null)
  const [annual,   setAnnual]   = useState(false)
  const [token,    setToken]    = useState(null)
  const [profile,  setProfile]  = useState(null)

  // Read URL params for success/cancel
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const success   = params.get("success")
  const cancelled = params.get("cancelled")
  const plan      = params.get("plan")

  useEffect(() => {
    // Try to load session from Supabase localStorage
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("sb-") && k.endsWith("-auth-token"))
      if (keys.length) {
        const s = JSON.parse(localStorage.getItem(keys[0]) || "{}")
        if (s?.access_token) {
          setToken(s.access_token)
          // Load profile
          fetch("/api/db-users", { headers: { Authorization: "Bearer " + s.access_token } })
            .then(r => r.json())
            .then(d => { if (d.users?.[0]) setProfile(d.users[0]) })
            .catch(() => {})
        }
      }
    } catch {}
  }, [])

  function showToast(msg, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 5000)
  }

  async function subscribe(planId) {
    if (!token) {
      // Not logged in — redirect to login
      window.location.href = "/login?redirect=/billing"
      return
    }
    setLoading(true)
    try {
      const r = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ plan: planId, annual }),
      })
      const d = await r.json()
      if (d.url) {
        window.location.href = d.url
      } else {
        showToast(d.error || "Checkout failed — check Stripe env vars in Vercel", false)
      }
    } catch (e) {
      showToast("Error: " + e.message, false)
    }
    setLoading(false)
  }

  async function openPortal() {
    if (!token) { window.location.href = "/login?redirect=/billing"; return }
    setLoading(true)
    try {
      const r = await fetch("/api/stripe-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      })
      const d = await r.json()
      if (d.url) window.location.href = d.url
      else showToast(d.error || "Portal not available — enable it in Stripe dashboard", false)
    } catch (e) {
      showToast("Error: " + e.message, false)
    }
    setLoading(false)
  }

  const currentPlan = profile?.plan || null
  const planStatus  = profile?.plan_status || null

  const STATUS_COLOR = {
    active:   { bg: "#E1F5EE", border: "#6EE7B7", text: GREEN,    label: "Active" },
    trialing: { bg: "#FFFBF2", border: "#FCD34D", text: "#92400E", label: "Free trial" },
    past_due: { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626", label: "Payment due" },
    cancelled:{ bg: "#F1F5F9", border: "#CBD5E1", text: "#64748B", label: "Cancelled" },
  }
  const statusInfo = STATUS_COLOR[planStatus] || null

  return (<>
    <Head>
      <title>SIXXAB AI — Billing & Plans</title>
      <meta name="description" content="Choose your SIXXAB AI plan. 14-day free trial. Cancel anytime."/>
    </Head>
    <style>{`
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif;color:${N}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      .fu{animation:fadeUp .3s ease both}
      .card{background:#fff;border-radius:14px;border:1px solid #E2E8F0}
      .check{color:${GREEN};flex-shrink:0;margin-top:1px}
      .plan-btn{width:100%;padding:14px;border-radius:10px;font-size:14.5px;font-weight:700;
        border:none;cursor:pointer;font-family:inherit;transition:all .15s}
      .plan-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.15)}
      .plan-btn:disabled{opacity:.6;cursor:not-allowed}
      .toggle{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none}
      .toggle-track{width:44px;height:24px;border-radius:12px;background:#E2E8F0;position:relative;transition:background .2s}
      .toggle-track.on{background:${AMBER}}
      .toggle-thumb{width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,.2)}
      .toggle-track.on .toggle-thumb{transform:translateX(20px)}
      a{text-decoration:none;color:inherit}
      @media(max-width:900px){.plans-grid{grid-template-columns:1fr!important}}
    `}</style>

    <SixxabNav active="/billing"/>

    {/* Toast */}
    {toast && (
      <div className="fu" style={{position:"fixed",bottom:20,right:16,zIndex:9999,maxWidth:380,
        padding:"12px 18px",borderRadius:12,
        background:toast.ok?"#E1F5EE":"#FEF2F2",
        border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,
        fontSize:13.5,fontWeight:500,
        color:toast.ok?"#085041":"#991B1B",
        boxShadow:"0 4px 24px rgba(0,0,0,.15)"}}>
        {toast.ok ? "✓" : "✗"} {toast.msg}
      </div>
    )}

    {/* Hero */}
    <div style={{background:N,padding:"32px 5% 28px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
      <div style={{maxWidth:900,margin:"0 auto",textAlign:"center"}}>
        <div style={{fontFamily:"monospace",fontSize:10.5,color:AMBER,letterSpacing:".14em",textTransform:"uppercase",marginBottom:10}}>
          Pricing
        </div>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(28px,5vw,52px)",fontWeight:700,color:CHALK,letterSpacing:"-0.5px",marginBottom:12}}>
          Simple, transparent pricing.<br/>
          <span style={{color:AMBER,fontStyle:"italic"}}>Start free for 14 days.</span>
        </h1>
        <p style={{fontSize:16,color:"rgba(245,245,240,.5)",marginBottom:24}}>
          Cancel anytime · No setup fees · No lock-in
        </p>

        {/* Annual toggle */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
          <span style={{fontSize:14,color:"rgba(245,245,240,.6)"}}>Monthly</span>
          <label className="toggle" onClick={()=>setAnnual(a=>!a)}>
            <div className={`toggle-track ${annual?"on":""}`}>
              <div className="toggle-thumb"/>
            </div>
          </label>
          <span style={{fontSize:14,color:"rgba(245,245,240,.6)"}}>
            Annual <span style={{background:"rgba(29,158,117,.2)",color:"#6EE7B7",padding:"2px 8px",borderRadius:20,fontSize:12,fontWeight:600,marginLeft:4}}>Save 25%</span>
          </span>
        </div>
      </div>
    </div>

    <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 20px 60px"}}>

      {/* Success banner */}
      {success && (
        <div className="fu" style={{padding:"16px 22px",borderRadius:13,background:"#E1F5EE",border:"1px solid #6EE7B7",marginBottom:24,display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:28}}>🎉</span>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:"#085041"}}>Welcome to SIXXAB AI {plan ? `— ${plan.charAt(0).toUpperCase()+plan.slice(1)} plan` : ""}!</div>
            <div style={{fontSize:13,color:"#065f46",marginTop:2}}>Your 14-day free trial is active. Check your email for confirmation. Go to your <a href="/profile" style={{color:GREEN,fontWeight:600}}>profile</a> to set up your business context.</div>
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {cancelled && (
        <div className="fu" style={{padding:"14px 20px",borderRadius:12,background:"#FFFBF2",border:"1px solid #FCD34D",marginBottom:24,fontSize:14,color:"#92400E"}}>
          ← Checkout cancelled. No charge was made. Choose a plan below when you're ready.
        </div>
      )}

      {/* Current subscription status */}
      {profile && statusInfo && (
        <div className="card fu" style={{padding:"18px 22px",marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${AMBER}18`,border:`2px solid ${AMBER}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:AMBER}}>
              {(profile.full_name||profile.email||"U")[0].toUpperCase()}
            </div>
            <div>
              <div style={{fontSize:13,color:"#94A3B8",marginBottom:3}}>Current plan</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:N}}>
                  {PLANS.find(p=>p.id===currentPlan)?.name || "Starter"}
                </span>
                <span style={{padding:"3px 11px",borderRadius:20,background:statusInfo.bg,border:`1px solid ${statusInfo.border}`,fontSize:12,fontWeight:700,color:statusInfo.text}}>
                  {statusInfo.label}
                </span>
              </div>
              {profile.email && <div style={{fontSize:12.5,color:"#94A3B8",marginTop:2}}>{profile.email}</div>}
            </div>
          </div>
          <button onClick={openPortal} disabled={loading}
            style={{padding:"10px 22px",borderRadius:10,background:N,color:CHALK,border:"1px solid rgba(255,255,255,.15)",cursor:"pointer",fontFamily:"inherit",fontSize:13.5,fontWeight:600,display:"flex",alignItems:"center",gap:8}}>
            {loading ? "Loading…" : "Manage subscription →"}
          </button>
        </div>
      )}

      {/* Plan cards */}
      <div className="plans-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:40}}>
        {PLANS.map(p => {
          const isCurrent  = currentPlan === p.id
          const displayPrice = annual ? Math.round(p.yearlyPrice/12) : p.price
          const saving       = annual ? Math.round(p.price*12 - p.yearlyPrice) : 0

          return (
            <div key={p.id} style={{
              background: p.highlight ? N : "#fff",
              borderRadius:16,
              border: p.highlight
                ? `2px solid ${AMBER}`
                : isCurrent
                  ? `2px solid ${GREEN}`
                  : "1.5px solid #E2E8F0",
              padding:"28px 24px",
              display:"flex",flexDirection:"column",
              position:"relative",
              boxShadow: p.highlight ? "0 16px 40px rgba(0,0,0,.2)" : "none",
            }}>
              {/* Badge */}
              {p.badge && (
                <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:AMBER,color:N,fontSize:11,fontWeight:800,padding:"4px 18px",borderRadius:20,whiteSpace:"nowrap",letterSpacing:".05em"}}>
                  {p.badge}
                </div>
              )}
              {isCurrent && (
                <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:GREEN,color:"#fff",fontSize:11,fontWeight:700,padding:"4px 16px",borderRadius:20}}>
                  Current plan
                </div>
              )}

              {/* Plan header */}
              <div style={{marginBottom:6}}>
                <div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:p.highlight?CHALK:N}}>{p.name}</div>
                <div style={{fontSize:13,color:p.highlight?"rgba(245,245,240,.45)":"#64748B",marginTop:2}}>{p.desc}</div>
              </div>

              {/* Price */}
              <div style={{margin:"18px 0 6px",display:"flex",alignItems:"baseline",gap:4}}>
                <span style={{fontFamily:"Georgia,serif",fontSize:48,fontWeight:800,color:p.highlight?CHALK:N,lineHeight:1}}>${displayPrice}</span>
                <span style={{fontSize:14,color:p.highlight?"rgba(245,245,240,.4)":"#94A3B8"}}>/mo</span>
              </div>
              {annual && (
                <div style={{fontSize:12.5,color:GREEN,fontWeight:600,marginBottom:4}}>
                  Save ${saving}/year · billed ${p.yearlyPrice.toLocaleString()}/yr
                </div>
              )}
              <div style={{fontSize:12.5,color:GREEN,fontWeight:500,marginBottom:20}}>
                ✓ 14-day free trial included
              </div>

              {/* Features */}
              <ul style={{listStyle:"none",flex:1,marginBottom:24,display:"flex",flexDirection:"column",gap:9}}>
                {p.features.map(f => (
                  <li key={f} style={{display:"flex",gap:9,fontSize:13.5,color:p.highlight?CHALK:N,alignItems:"flex-start",lineHeight:1.45}}>
                    <span className="check">✓</span>{f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className="plan-btn"
                onClick={() => isCurrent ? openPortal() : subscribe(p.id)}
                disabled={loading}
                style={{
                  background: isCurrent ? `${GREEN}18` : p.highlight ? AMBER : N,
                  color: isCurrent ? GREEN : p.highlight ? N : CHALK,
                  border: isCurrent ? `2px solid ${GREEN}44` : "none",
                }}>
                {loading ? "Working…" : isCurrent ? "Manage plan →" : "Start free trial →"}
              </button>
            </div>
          )
        })}
      </div>

      {/* Trust bar */}
      <div style={{display:"flex",justifyContent:"center",gap:32,flexWrap:"wrap",marginBottom:36,padding:"0 20px"}}>
        {[["🔒","Stripe-secured payments"],["📅","14-day free trial"],["❌","Cancel anytime"],["💳","No setup fees"],["🔄","Switch plans anytime"]].map(([icon,label])=>(
          <div key={label} style={{display:"flex",alignItems:"center",gap:7,fontSize:13.5,color:"#64748B"}}>
            <span>{icon}</span>{label}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="card" style={{overflow:"hidden",marginBottom:32}}>
        <div style={{padding:"16px 22px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:N}}>Plan comparison</div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:"1px solid #E8ECF4"}}>
                <th style={{padding:"12px 20px",textAlign:"left",fontSize:12,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",width:"40%"}}>Feature</th>
                {PLANS.map(p=><th key={p.id} style={{padding:"12px 16px",textAlign:"center",fontSize:13,fontWeight:700,color:N,background:p.highlight?"#FFFBF2":""}}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["CRM contacts",             "100","Unlimited","Unlimited"],
                ["AI agents",               "18","18 + 11 CXO","All + Board"],
                ["Social platforms",        "3","All 5","All 5"],
                ["Website Builder",         "✓","✓ + Deploy","✓ + Deploy"],
                ["Vertical Agent Packs",    "—","30 packs","30 packs"],
                ["Investor Hub",            "—","✓","✓"],
                ["Team seats",              "1","1","10"],
                ["White-label portal",      "—","—","✓"],
                ["API access",             "—","—","✓"],
                ["Support",                "Email","Priority","Dedicated"],
              ].map(([feat,...vals])=>(
                <tr key={feat} style={{borderBottom:"1px solid #F1F5F9"}}>
                  <td style={{padding:"11px 20px",fontSize:13.5,color:N,fontWeight:500}}>{feat}</td>
                  {vals.map((v,i)=>(
                    <td key={i} style={{padding:"11px 16px",textAlign:"center",fontSize:13.5,color:v==="—"?"#CBD5E1":v==="✓"?GREEN:N,fontWeight:v==="✓"?"600":"400",background:i===1?"#FFFBF2":""}}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="card" style={{padding:"24px 28px"}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:N,marginBottom:20}}>Frequently asked questions</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {[
            ["When does billing start?","After your 14-day free trial ends. No charge during the trial — cancel anytime before day 15."],
            ["Can I switch plans?","Yes — upgrade or downgrade instantly from the Manage Subscription portal. Prorated automatically."],
            ["What payment methods?","All major credit and debit cards via Stripe. Enterprise invoicing available for Agency plan."],
            ["Is there a money-back guarantee?","Yes — 14-day money-back guarantee if SIXXAB AI doesn't help you make meaningful progress."],
            ["Do you offer refunds?","Pro-rated refunds within 14 days. Contact sunil.kattikar@gmail.com for any billing issues."],
            ["How do I cancel?","One click from the Manage Subscription portal — no hoops, no cancellation fees, instant."],
          ].map(([q,a])=>(
            <div key={q} style={{paddingBottom:16,borderBottom:"1px solid #F1F5F9"}}>
              <div style={{fontSize:14,fontWeight:700,color:N,marginBottom:5}}>{q}</div>
              <div style={{fontSize:13.5,color:"#64748B",lineHeight:1.7}}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>)
}
