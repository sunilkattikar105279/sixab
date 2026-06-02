// pages/niche-validator.js
// SIXXAB Niche Validator — Input: industry + location → Output: viability score, TAM, pricing benchmark
import { useState } from "react"
import Head from "next/head"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

const INDUSTRIES = [
  "HVAC & Air Conditioning","Real Estate & Property","Legal Services","Business Consulting",
  "Digital Marketing Agency","Landscaping & Lawn Care","Plumbing & Electrical","Auto Repair & Detailing",
  "Financial Planning & Accounting","Health & Wellness / Personal Training","Childcare & Education",
  "Cleaning & Janitorial Services","Roofing & Construction","IT Support & Managed Services",
  "Restaurant & Food Service","Retail & E-commerce","Photography & Videography",
  "Insurance Brokerage","Staffing & Recruiting","Freight & Logistics",
  "Home Renovation & Interior Design","Pest Control","Security Services","Other",
]

const LOCATIONS = [
  "Dallas, TX","Houston, TX","Austin, TX","San Antonio, TX","Fort Worth, TX",
  "DFW Metroplex, TX","Plano, TX","Irving, TX","Garland, TX","Frisco, TX",
  "New York, NY","Los Angeles, CA","Chicago, IL","Miami, FL","Atlanta, GA",
  "Phoenix, AZ","Denver, CO","Seattle, WA","Boston, MA","Nashville, TN",
  "United States (National)","United Kingdom","India","Australia","Singapore","Other",
]

const TEAM_SIZES = ["Just me (solo)","2–5 people","6–15 people","16–50 people","50+ people"]
const EXPERIENCE = ["Brand new — less than 1 year","1–3 years","3–7 years","7+ years"]
const BUDGETS = ["Under $500/mo","$500–$2,000/mo","$2,000–$5,000/mo","$5,000+/mo"]

function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 72 72">
      <rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/>
      <text x="7" y="54" fontFamily="Georgia" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
      <text x="35" y="54" fontFamily="Georgia" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
    </svg>
  )
}

export default function NicheValidator() {
  const [form, setForm] = useState({ industry:"", customIndustry:"", location:"", customLocation:"", teamSize:"", experience:"", budget:"", targetCustomer:"", problem:"" })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const set = (k,v) => setForm(f => ({...f, [k]:v}))

  async function validate() {
    setError("")
    const industry = form.industry === "Other" ? form.customIndustry : form.industry
    const location = form.location === "Other" ? form.customLocation : form.location
    if (!industry) { setError("Please select or enter an industry."); return }
    if (!location) { setError("Please select or enter a location."); return }
    if (!form.teamSize) { setError("Please select your team size."); return }

    setLoading(true); setResult(null)


    try {
      const res = await fetch("/api/niche-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry, location,
          teamSize: form.teamSize,
          experience: form.experience,
          budget: form.budget,
          targetCustomer: form.targetCustomer,
          problem: form.problem,
        })
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || "Analysis failed — please try again.")
        setLoading(false)
        return
      }
      setResult(data.result)
    } catch(e) {
      setError("Network error — check your internet connection and try again.")
    }
    setLoading(false)
  }

  const scoreColor = result ? (result.viabilityScore >= 75 ? "#1D9E75" : result.viabilityScore >= 55 ? AMBER : "#DC2626") : AMBER
  const scoreLabel = result ? (result.viabilityScore >= 75 ? "Strong opportunity" : result.viabilityScore >= 55 ? "Viable with focus" : "High risk — read carefully") : ""

  return (
    <>
      <Head>
        <title>Niche Validator — SIXXAB</title>
        <meta name="description" content="Validate your business niche before you build. Get viability score, TAM, pricing benchmark and revenue projections in 60 seconds."/>
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;color:${N};min-height:100vh}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .4s ease both}
        select,input,textarea{font-family:inherit;outline:none}
        .inp{width:100%;padding:10px 13px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:${N};background:#fff;transition:border .15s}
        .inp:focus{border-color:${AMBER}}
        .card{background:#fff;border-radius:14px;border:1px solid #E2E8F0}
        .section-label{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#94A3B8;margin-bottom:8px}
      `}</style>

      {/* Nav */}
      <nav style={{background:N,padding:"0 5%",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:9,textDecoration:"none"}}>
          <Logo/>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:CHALK,letterSpacing:2}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
          <span style={{fontFamily:"'DM Mono'",fontSize:10,color:AMBER,marginLeft:4,letterSpacing:".08em"}}>niche validator</span>
        </a>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          {[["/agents","Agents"],["/orchestrator","Orchestrator"],["/crm","CRM"]].map(([h,l])=>(
            <a key={l} href={h} style={{fontSize:13,color:"rgba(255,255,255,.5)",textDecoration:"none"}}>{l}</a>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <div style={{background:N,padding:"36px 5% 32px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,border:"1px solid rgba(239,159,39,.3)",background:"rgba(239,159,39,.1)",fontSize:12,fontWeight:500,color:AMBER,marginBottom:14}}>
          🎯 The first decision founders get wrong — validate before you build
        </div>
        <h1 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(30px,5vw,56px)",color:CHALK,letterSpacing:1.5,lineHeight:1,marginBottom:10}}>
          Niche Validator
        </h1>
        <p style={{fontSize:15,color:"rgba(245,245,240,.55)",maxWidth:460,margin:"0 auto",lineHeight:1.7}}>
          Enter your industry and location. Get a viability score, real market size, pricing benchmarks, and a 12-month revenue projection in 60 seconds.
        </p>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"28px 20px 60px"}}>
        <div style={{display:"grid",gridTemplateColumns:result?"1fr 1fr":"1fr",gap:20,alignItems:"start"}}>

          {/* Input form */}
          <div className="card fu">
            <div style={{padding:"14px 18px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
              <div style={{fontSize:14,fontWeight:600,color:N}}>Tell us about your niche</div>
              <div style={{fontSize:12,color:"#64748B"}}>More detail = more accurate analysis</div>
            </div>
            <div style={{padding:18,display:"flex",flexDirection:"column",gap:14}}>

              <div>
                <div className="section-label">Industry *</div>
                <select className="inp" value={form.industry} onChange={e=>set("industry",e.target.value)} style={{cursor:"pointer",color:form.industry?"#0A0E1A":"#94A3B8"}}>
                  <option value="">Select your industry…</option>
                  {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                </select>
                {form.industry==="Other" && <input className="inp" style={{marginTop:8}} placeholder="Enter your industry" value={form.customIndustry} onChange={e=>set("customIndustry",e.target.value)}/>}
              </div>

              <div>
                <div className="section-label">Location / Market *</div>
                <select className="inp" value={form.location} onChange={e=>set("location",e.target.value)} style={{cursor:"pointer",color:form.location?"#0A0E1A":"#94A3B8"}}>
                  <option value="">Select your target market…</option>
                  {LOCATIONS.map(l=><option key={l}>{l}</option>)}
                </select>
                {form.location==="Other" && <input className="inp" style={{marginTop:8}} placeholder="Enter your city or region" value={form.customLocation} onChange={e=>set("customLocation",e.target.value)}/>}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <div className="section-label">Team size *</div>
                  <select className="inp" value={form.teamSize} onChange={e=>set("teamSize",e.target.value)} style={{cursor:"pointer",color:form.teamSize?"#0A0E1A":"#94A3B8"}}>
                    <option value="">Select…</option>
                    {TEAM_SIZES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <div className="section-label">Years of experience</div>
                  <select className="inp" value={form.experience} onChange={e=>set("experience",e.target.value)} style={{cursor:"pointer",color:form.experience?"#0A0E1A":"#94A3B8"}}>
                    <option value="">Select…</option>
                    {EXPERIENCE.map(e=><option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="section-label">Monthly marketing budget</div>
                <select className="inp" value={form.budget} onChange={e=>set("budget",e.target.value)} style={{cursor:"pointer",color:form.budget?"#0A0E1A":"#94A3B8"}}>
                  <option value="">Select…</option>
                  {BUDGETS.map(b=><option key={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <div className="section-label">Who is your target customer? (optional)</div>
                <input className="inp" placeholder="e.g. HVAC contractors in Dallas with 5–20 employees" value={form.targetCustomer} onChange={e=>set("targetCustomer",e.target.value)}/>
              </div>

              <div>
                <div className="section-label">What problem do you solve? (optional)</div>
                <textarea className="inp" rows={2} placeholder="e.g. They waste 3hrs/day on admin, quoting and scheduling. I automate it." value={form.problem} onChange={e=>set("problem",e.target.value)} style={{resize:"vertical",lineHeight:1.6}}/>
              </div>

              {error && <div style={{padding:"9px 12px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,fontSize:13,color:"#991B1B"}}>{error}</div>}

              <button onClick={validate} disabled={loading}
                style={{width:"100%",padding:13,borderRadius:10,background:loading?"#F1F5F9":AMBER,color:loading?"#94A3B8":N,fontSize:15,fontWeight:700,border:"none",cursor:loading?"not-allowed":"pointer",fontFamily:"'Plus Jakarta Sans'",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .15s"}}>
                {loading
                  ? <><div style={{width:16,height:16,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Analysing your niche…</>
                  : "Validate my niche →"}
              </button>

              {result && <button onClick={()=>{setResult(null);setForm({industry:"",customIndustry:"",location:"",customLocation:"",teamSize:"",experience:"",budget:"",targetCustomer:"",problem:""})}}
                style={{width:"100%",padding:10,borderRadius:10,border:"1px solid #E2E8F0",background:"#fff",fontSize:13,fontWeight:500,color:"#64748B",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'"}}>
                Validate a different niche
              </button>}
            </div>
          </div>

          {/* Results */}
          {result && (
            <div style={{display:"flex",flexDirection:"column",gap:14}} className="fu">

              {/* Score */}
              <div className="card" style={{border:`2px solid ${scoreColor}`,overflow:"hidden"}}>
                <div style={{background:N,padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:68,height:68,borderRadius:"50%",background:`${scoreColor}22`,border:`3px solid ${scoreColor}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:scoreColor,lineHeight:1}}>{result.viabilityScore}</div>
                    <div style={{fontSize:9,color:"rgba(245,245,240,.4)",letterSpacing:".06em"}}>/100</div>
                  </div>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:CHALK,letterSpacing:1,marginBottom:3}}>{scoreLabel}</div>
                    <div style={{fontSize:13,color:"rgba(245,245,240,.65)",lineHeight:1.6}}>{result.verdict}</div>
                  </div>
                </div>
                <div style={{padding:"12px 20px",background:`${scoreColor}08`,borderTop:`1px solid ${scoreColor}22`}}>
                  <div style={{fontSize:12,fontWeight:600,color:scoreColor}}>{result.industry} · {result.location}</div>
                </div>
              </div>

              {/* Market size */}
              <div className="card" style={{padding:16}}>
                <div className="section-label">Market size</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  {[["TAM",result.marketSize?.tam,"Total addressable market"],["SAM",result.marketSize?.sam,"Serviceable market"],["SOM",result.marketSize?.som,"Year 1 obtainable"],["Local businesses",result.marketSize?.localBusinessCount,"In your area"]].map(([l,v,d])=>(
                    <div key={l} style={{padding:"10px 12px",background:"#F8F9FA",borderRadius:9,border:"1px solid #E8ECF4"}}>
                      <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>{l}</div>
                      <div style={{fontSize:15,fontWeight:700,color:N,marginBottom:2}}>{v||"—"}</div>
                      <div style={{fontSize:10,color:"#94A3B8"}}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing benchmark */}
              <div className="card" style={{padding:16}}>
                <div className="section-label">Pricing benchmark</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {[["Low end",result.pricingBenchmark?.lowEnd,"#DC2626"],["Mid market",result.pricingBenchmark?.midMarket,AMBER],["Premium",result.pricingBenchmark?.premium,"#1D9E75"]].map(([l,v,c])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F1F5F9"}}>
                      <span style={{fontSize:12,color:"#64748B"}}>{l}</span>
                      <span style={{fontSize:14,fontWeight:700,color:c}}>{v||"—"}</span>
                    </div>
                  ))}
                  <div style={{padding:"10px 12px",background:"#FFFBF2",border:"1px solid rgba(239,159,39,.3)",borderRadius:9,marginTop:4}}>
                    <div style={{fontSize:10,fontWeight:600,color:AMBER,marginBottom:4}}>SIXXAB RECOMMENDATION</div>
                    <div style={{fontSize:12.5,color:N,lineHeight:1.6}}>{result.pricingBenchmark?.recommended||"—"}</div>
                    {result.pricingBenchmark?.monthlyRecurring && <div style={{fontSize:12,color:"#1D9E75",marginTop:6,fontWeight:500}}>Recurring model: {result.pricingBenchmark.monthlyRecurring}</div>}
                  </div>
                </div>
              </div>

              {/* Revenue projection */}
              <div className="card" style={{padding:16}}>
                <div className="section-label">Revenue projection</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                  {[["3 months",result.revenueProjection?.month3],["6 months",result.revenueProjection?.month6],["12 months",result.revenueProjection?.month12]].map(([l,v])=>(
                    <div key={l} style={{padding:"10px 12px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:9,textAlign:"center"}}>
                      <div style={{fontSize:10,color:"#64748B",marginBottom:4}}>{l}</div>
                      <div style={{fontSize:14,fontWeight:700,color:"#1D9E75"}}>{v||"—"}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"8px 12px",background:"#EFF6FF",borderRadius:8,fontSize:12,color:"#1E40AF"}}>
                  ⚡ First sale timeline: <strong>{result.revenueProjection?.firstSaleTimeline||"—"}</strong>
                </div>
              </div>

              {/* Competition */}
              <div className="card" style={{padding:16}}>
                <div className="section-label">Competition</div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{padding:"3px 10px",borderRadius:20,background:result.competition?.level?.includes("High")?"#FEF2F2":"#F0FDF4",color:result.competition?.level?.includes("High")?"#991B1B":"#085041",fontSize:12,fontWeight:600}}>{result.competition?.level||"Medium"}</span>
                  <span style={{fontSize:12,color:"#64748B"}}>competition level</span>
                </div>
                {result.competition?.differentiator && <div style={{padding:"8px 12px",background:"#FFFBF2",borderRadius:8,fontSize:12,color:N,lineHeight:1.6,marginBottom:10}}>💡 {result.competition.differentiator}</div>}
                {result.competition?.topCompetitors && <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {result.competition.topCompetitors.map((c,i)=><span key={i} style={{padding:"3px 10px",borderRadius:20,background:"#F1F5F9",fontSize:11,color:"#475569"}}>{c}</span>)}
                </div>}
              </div>

              {/* Customer profile */}
              <div className="card" style={{padding:16}}>
                <div className="section-label">Customer profile</div>
                <div style={{fontSize:12.5,fontWeight:500,color:N,marginBottom:6}}>{result.customerProfile?.primaryBuyer}</div>
                <div style={{fontSize:12,color:"#64748B",marginBottom:10,lineHeight:1.6}}>📍 Find them: {result.customerProfile?.wherToFindThem}</div>
                {result.customerProfile?.painPoints?.map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:7,fontSize:12,color:"#64748B",marginBottom:5}}>
                    <span style={{color:"#DC2626",flexShrink:0}}>→</span>{p}
                  </div>
                ))}
              </div>

              {/* Risks */}
              {result.topRisks?.length > 0 && <div className="card" style={{padding:16}}>
                <div className="section-label">Top risks</div>
                {result.topRisks.map((r,i)=>(
                  <div key={i} style={{display:"flex",gap:7,fontSize:12,color:"#64748B",marginBottom:7,padding:"7px 10px",background:"#FEF2F2",borderRadius:7,border:"1px solid #FECACA"}}>
                    <span style={{color:"#DC2626",flexShrink:0,fontWeight:700}}>!</span>{r}
                  </div>
                ))}
              </div>}

              {/* Immediate actions */}
              {result.immediateActions?.length > 0 && <div className="card" style={{padding:16}}>
                <div className="section-label">Start here — immediate actions</div>
                {result.immediateActions.map((a,i)=>(
                  <div key={i} style={{display:"flex",gap:8,fontSize:12.5,color:N,marginBottom:8,padding:"8px 12px",background:"#F0FDF4",borderRadius:8,border:"1px solid #BBF7D0"}}>
                    <span style={{width:20,height:20,borderRadius:"50%",background:"#1D9E75",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{i+1}</span>
                    {a}
                  </div>
                ))}
              </div>}

              {/* SIXXAB CTA */}
              <div style={{background:N,borderRadius:14,padding:18}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:CHALK,letterSpacing:1,marginBottom:6}}>Ready to launch this niche?</div>
                <div style={{fontSize:13,color:"rgba(245,245,240,.55)",lineHeight:1.6,marginBottom:14}}>{result.sixxabRecommendation}</div>
                <div style={{display:"flex",gap:8}}>
                  <a href="/orchestrator" style={{flex:1,padding:"10px",borderRadius:9,background:AMBER,color:N,fontSize:13,fontWeight:600,textDecoration:"none",textAlign:"center"}}>Run orchestrator →</a>
                  <a href="/discovery" style={{flex:1,padding:"10px",borderRadius:9,border:"1px solid rgba(255,255,255,.15)",color:CHALK,fontSize:13,textDecoration:"none",textAlign:"center"}}>📅 Book a call</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
