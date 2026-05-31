import { useEffect, useState } from "react"
import Head from "next/head"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

// ── Get your Calendly link ──────────────────────────────────────────────────
// 1. Go to calendly.com and sign in with sunil.kattikar@gmail.com
// 2. Create a new event type (20 min, Google Meet)
// 3. Copy your event link e.g. https://calendly.com/sunil-kattikar/discovery
// 4. Add it in Vercel env vars as: NEXT_PUBLIC_CALENDLY_URL
// ───────────────────────────────────────────────────────────────────────────
const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL || ""

function SixxabIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/>
      <text x="7" y="54" fontFamily="Georgia,serif" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
      <text x="35" y="54" fontFamily="Georgia,serif" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
    </svg>
  )
}

export default function DiscoveryPage() {
  const [name, setName]       = useState("")
  const [email, setEmail]     = useState("")
  const [company, setCompany] = useState("")
  const [goal, setGoal]       = useState("")
  const [step, setStep]       = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [booked, setBooked]   = useState(false)
  const [err, setErr]         = useState("")
  const [noUrl, setNoUrl]     = useState(false)

  // Build the Calendly iframe URL with prefill params
  function buildCalendlyUrl() {
    if (!CALENDLY_URL) return ""
    const base = CALENDLY_URL.includes("?") ? CALENDLY_URL : CALENDLY_URL
    const params = new URLSearchParams({
      hide_event_type_details: "1",
      hide_gdpr_banner: "1",
      primary_color: "ef9f27",
      ...(name  && { name }),
      ...(email && { email }),
    })
    return `${base}?${params.toString()}`
  }

  // Listen for Calendly booking confirmation message
  useEffect(() => {
    function onMsg(e) {
      if (e.data?.event === "calendly.event_scheduled") {
        setBooked(true)
        setStep(3)
        // Fire alert email
        fetch("/api/discovery-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, company, goal, stage: "booked" }),
        }).catch(() => {})
      }
    }
    window.addEventListener("message", onMsg)
    return () => window.removeEventListener("message", onMsg)
  }, [name, email, company, goal])

  async function handleStep1(e) {
    e.preventDefault()
    setErr("")
    if (!name.trim())   { setErr("Please enter your name."); return }
    if (!email.trim() || !email.includes("@")) { setErr("Please enter a valid email."); return }
    if (!goal)          { setErr("Please select your main goal."); return }

    if (!CALENDLY_URL) { setNoUrl(true); setStep(2); return }

    setSubmitting(true)
    // Pre-alert — they're about to book
    await fetch("/api/discovery-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, company, goal, stage: "interested" }),
    }).catch(() => {})
    setSubmitting(false)
    setStep(2)
  }

  return (
    <>
      <Head>
        <title>Book a Discovery Call — SIXXAB</title>
        <meta name="description" content="Book a free 20-minute discovery call with SIXXAB founder Sunil Kattikar. Get a personalised startup launch plan." />
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;min-height:100vh}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fadeUp{animation:fadeUp .4s ease both}
        input,select,textarea{font-family:inherit}
        input:focus,select:focus,textarea:focus{outline:none}
        .finput{width:100%;padding:11px 14px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:14px;background:#fff;color:${N};transition:border .15s}
        .finput:focus{border-color:${AMBER}}
        .pbtn{width:100%;padding:13px;border-radius:10px;background:${AMBER};color:${N};font-size:15px;font-weight:600;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .15s}
        .pbtn:hover:not(:disabled){opacity:.9}
        .pbtn:disabled{opacity:.5;cursor:not-allowed}
        .nav-link{font-size:13px;color:rgba(255,255,255,.55);text-decoration:none;cursor:pointer}
        .nav-link:hover{color:#F5F5F0}
      `}</style>

      {/* Nav */}
      <nav style={{background:N,padding:"0 5%",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
          <SixxabIcon size={26}/>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:CHALK,letterSpacing:2,lineHeight:1}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:8,color:"#5F5E5A",letterSpacing:".12em"}}>startupsinabox.com</div>
          </div>
        </a>
        <div style={{display:"flex",gap:20,alignItems:"center"}}>
          {[["Home","/"],["Pricing","/#pricing"],["Coach","/coach"],["Contact","/contact"]].map(([l,h])=>(
            <a key={l} href={h} className="nav-link">{l}</a>
          ))}
          <a href="/login" style={{padding:"6px 16px",borderRadius:8,background:AMBER,color:N,fontSize:13,fontWeight:600,textDecoration:"none"}}>Get started</a>
        </div>
      </nav>

      <div style={{maxWidth:920,margin:"0 auto",padding:"44px 20px 80px"}}>

        {/* Hero */}
        <div className="fadeUp" style={{textAlign:"center",marginBottom:44}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,border:"1px solid rgba(239,159,39,.3)",background:"rgba(239,159,39,.08)",fontSize:12,fontWeight:500,color:AMBER,marginBottom:16}}>
            📅 Free · 20 minutes · No sales pitch, just strategy
          </div>
          <h1 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(36px,6vw,64px)",color:N,letterSpacing:1.5,lineHeight:1.05,marginBottom:12}}>
            Book your free discovery call
          </h1>
          <p style={{fontSize:17,color:"#64748B",maxWidth:520,margin:"0 auto 16px",lineHeight:1.7}}>
            20 minutes with SIXXAB founder <strong style={{color:N}}>Sunil Kattikar</strong>. Walk away with a personalised 48-hour launch plan for your business.
          </p>
          <div style={{display:"flex",gap:18,justifyContent:"center",flexWrap:"wrap",fontSize:13,color:"#64748B"}}>
            {["✓ Personalised for your business","✓ Dallas & global founders welcome","✓ Pure strategy — no pitch"].map((t,i)=>(
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>

        {/* Steps indicator */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:36}}>
          {[{n:1,l:"Your details"},{n:2,l:"Pick a time"},{n:3,l:"Confirmed"}].map((s,i)=>(
            <div key={s.n} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:step>=s.n?AMBER:"#E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:step>=s.n?N:"#94A3B8",transition:"all .3s"}}>
                  {step>s.n?"✓":s.n}
                </div>
                <span style={{fontSize:11,fontWeight:step===s.n?600:400,color:step>=s.n?N:"#94A3B8",whiteSpace:"nowrap"}}>{s.l}</span>
              </div>
              {i<2&&<div style={{width:72,height:2,background:step>s.n?AMBER:"#E2E8F0",margin:"0 6px 18px",transition:"background .3s"}}/>}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Details form ── */}
        {step === 1 && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20,alignItems:"start"}} className="fadeUp">
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #E2E8F0",padding:28}}>
              <h2 style={{fontFamily:"'Bebas Neue'",fontSize:22,color:N,letterSpacing:1,marginBottom:4}}>Tell us about yourself</h2>
              <p style={{fontSize:13,color:"#64748B",marginBottom:22}}>So Sunil can come prepared with specific ideas for your business.</p>
              <form onSubmit={handleStep1} style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <label style={{fontSize:12,fontWeight:500,color:"#475569",display:"block",marginBottom:5}}>Full name *</label>
                    <input className="finput" type="text" placeholder="Sarah Chen" value={name} onChange={e=>setName(e.target.value)}/>
                  </div>
                  <div>
                    <label style={{fontSize:12,fontWeight:500,color:"#475569",display:"block",marginBottom:5}}>Email address *</label>
                    <input className="finput" type="email" placeholder="sarah@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
                  </div>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:"#475569",display:"block",marginBottom:5}}>Company / business <span style={{color:"#94A3B8"}}>(optional)</span></label>
                  <input className="finput" type="text" placeholder="My startup or freelance work" value={company} onChange={e=>setCompany(e.target.value)}/>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:"#475569",display:"block",marginBottom:5}}>Your #1 goal right now *</label>
                  <select className="finput" value={goal} onChange={e=>setGoal(e.target.value)} style={{cursor:"pointer",color:goal?N:"#94A3B8"}}>
                    <option value="" disabled>Select your main goal…</option>
                    <option value="validate">Validate my idea before building</option>
                    <option value="launch">Launch my first product this week</option>
                    <option value="revenue">Get my first paying customer</option>
                    <option value="scale">Scale from first revenue to $10k MRR</option>
                    <option value="freelance">Turn my freelance into a product</option>
                    <option value="saas">Build and launch a SaaS business</option>
                    <option value="partner">Explore a partnership with SIXXAB</option>
                    <option value="invest">Investment opportunities</option>
                    <option value="other">Something else</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:"#475569",display:"block",marginBottom:5}}>Anything else to know? <span style={{color:"#94A3B8"}}>(optional)</span></label>
                  <textarea className="finput" rows={2} placeholder="What you've tried, what's holding you back…" style={{resize:"vertical",lineHeight:1.6}} onChange={()=>{}}/>
                </div>
                {err && <div style={{padding:"8px 12px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,fontSize:13,color:"#991B1B"}}>{err}</div>}
                <button type="submit" className="pbtn" disabled={submitting}>
                  {submitting?<><div style={{width:16,height:16,border:"2px solid rgba(10,14,26,.25)",borderTopColor:N,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Saving…</>
                    :<>Continue to pick a time →</>}
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:N,borderRadius:14,padding:20}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:16,color:N,fontWeight:700,flexShrink:0}}>SK</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:CHALK}}>Sunil Kattikar</div>
                    <div style={{fontSize:11,color:"rgba(245,245,240,.5)"}}>Founder & CEO, SIXXAB · Dallas TX</div>
                  </div>
                </div>
                {[{n:"1",t:"Your idea",d:"Pressure-tested in 3 mins"},{n:"2",t:"Your niche",d:"3-Filter Formula"},{n:"3",t:"Your 48-hr plan",d:"Numbered steps, start today"},{n:"4",t:"How SIXXAB fits",d:"Only if it's right for you"}].map((x,i)=>(
                  <div key={i} style={{display:"flex",gap:9,marginBottom:10}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:N,flexShrink:0}}>{x.n}</div>
                    <div><div style={{fontSize:12.5,fontWeight:500,color:CHALK,marginBottom:1}}>{x.t}</div><div style={{fontSize:11,color:"rgba(245,245,240,.4)"}}>{x.d}</div></div>
                  </div>
                ))}
              </div>
              <div style={{background:"#fff",borderRadius:14,border:"1px solid #E2E8F0",padding:16}}>
                <div style={{color:AMBER,fontSize:12,marginBottom:6}}>★★★★★</div>
                <p style={{fontSize:12.5,color:"#64748B",lineHeight:1.7,fontStyle:"italic",marginBottom:8}}>"The 20-min call with Sunil gave me more clarity than 6 months of planning. I launched 3 days later."</p>
                <div style={{fontSize:12,fontWeight:500,color:N}}>Marcus T. · Solo founder, Dallas</div>
              </div>
              <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:14,padding:14}}>
                <div style={{fontSize:12,fontWeight:600,color:"#166534",marginBottom:5}}>🎯 What you'll leave with</div>
                {["A clear niche to target this week","A 48-hour action plan with numbered steps","The right SIXXAB plan (or honest advice if it's not right)","Sunil's personal email for follow-up questions"].map((t,i)=>(
                  <div key={i} style={{fontSize:12,color:"#166534",marginBottom:4,display:"flex",gap:6}}><span>✓</span>{t}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Calendly ── */}
        {step === 2 && (
          <div className="fadeUp">
            {noUrl || !CALENDLY_URL ? (
              /* Calendly URL not configured — show direct booking options */
              <div style={{background:"#fff",borderRadius:16,border:"1px solid #E2E8F0",padding:40,textAlign:"center",maxWidth:600,margin:"0 auto"}}>
                <div style={{fontSize:32,marginBottom:16}}>📅</div>
                <h2 style={{fontFamily:"'Bebas Neue'",fontSize:28,color:N,letterSpacing:1,marginBottom:10}}>Pick a time, {name.split(" ")[0]}!</h2>
                <p style={{fontSize:14,color:"#64748B",lineHeight:1.7,marginBottom:24}}>
                  Sunil will confirm your 20-min discovery call. Choose the option that works best for you:
                </p>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                  <a href="mailto:hello@startupsinabox.com?subject=Discovery call request — " + encodeURIComponent(name) + "&body=Hi Sunil, I'd like to book a discovery call. My goal is: " + encodeURIComponent(goal)
                    style={{display:"block",padding:"14px 20px",borderRadius:10,background:AMBER,color:N,fontSize:14,fontWeight:600,textDecoration:"none"}}>
                    📧 Email Sunil directly →
                  </a>
                  <a href="https://calendly.com" target="_blank" rel="noopener noreferrer"
                    style={{display:"block",padding:"14px 20px",borderRadius:10,border:"1.5px solid #E2E8F0",color:N,fontSize:14,fontWeight:500,textDecoration:"none",background:"#F8F9FA"}}>
                    📅 Open Calendly directly ↗
                  </a>
                </div>
                <div style={{padding:"12px 16px",background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:10,fontSize:13,color:"#92400E",lineHeight:1.6}}>
                  <strong>Setup note:</strong> To enable the inline booking widget, add your Calendly link in Vercel env vars:<br/>
                  <code style={{fontFamily:"monospace",fontSize:11}}>NEXT_PUBLIC_CALENDLY_URL = https://calendly.com/your-username/event-name</code>
                </div>
              </div>
            ) : (
              /* Calendly iframe embed — most reliable method */
              <div style={{background:"#fff",borderRadius:16,border:"1px solid #E2E8F0",overflow:"hidden",maxWidth:760,margin:"0 auto"}}>
                {/* Header */}
                <div style={{padding:"16px 20px",borderBottom:"1px solid #E8ECF4",display:"flex",alignItems:"center",gap:12,background:"#FAFAFA"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:14,color:N,fontWeight:700,flexShrink:0}}>SK</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600,color:N}}>Sunil Kattikar · SIXXAB Discovery Call</div>
                    <div style={{fontSize:12,color:"#64748B"}}>20 minutes · Google Meet · Free</div>
                  </div>
                  <div style={{fontSize:11,color:"#1D9E75",fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:"#1D9E75"}}/>
                    Available this week
                  </div>
                </div>

                {/* Calendly iframe — most reliable way to embed */}
                <iframe
                  src={buildCalendlyUrl()}
                  width="100%"
                  height="700px"
                  frameBorder="0"
                  title="Book a discovery call with Sunil Kattikar"
                  style={{display:"block",border:"none"}}
                  allow="payment"
                />

                <div style={{padding:"10px 20px",background:"#F8F9FA",borderTop:"1px solid #E8ECF4",fontSize:11,color:"#94A3B8",textAlign:"center"}}>
                  Powered by Calendly · Your info is secure and will not be shared
                </div>
              </div>
            )}

            <div style={{textAlign:"center",marginTop:14}}>
              <button onClick={()=>setStep(1)} style={{background:"none",border:"none",fontSize:13,color:"#94A3B8",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'"}}>
                ← Back to edit your details
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirmed ── */}
        {step === 3 && (
          <div style={{background:"#fff",borderRadius:16,border:"1px solid #BBF7D0",padding:48,textAlign:"center",maxWidth:600,margin:"0 auto"}} className="fadeUp">
            <div style={{width:64,height:64,borderRadius:"50%",background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:28}}>🎉</div>
            <h2 style={{fontFamily:"'Bebas Neue'",fontSize:32,color:N,letterSpacing:1,marginBottom:10}}>You're booked, {name.split(" ")[0]}!</h2>
            <p style={{fontSize:15,color:"#64748B",lineHeight:1.7,marginBottom:24,maxWidth:420,margin:"0 auto 24px"}}>
              A calendar invite is on its way to <strong style={{color:N}}>{email}</strong>. Sunil has been notified and will come prepared with ideas for your business.
            </p>
            <div style={{background:"#F8F9FA",borderRadius:12,padding:20,marginBottom:24,textAlign:"left",maxWidth:400,margin:"0 auto 24px"}}>
              {["Check your email for the calendar invite","Add it to your Google or Apple Calendar","You'll get a reminder 1 hour before the call","Join via the video link in the invite","No prep needed — just show up!"].map((t,i)=>(
                <div key={i} style={{fontSize:13,color:"#1D9E75",marginBottom:7,display:"flex",gap:8}}>
                  <span style={{flexShrink:0}}>✓</span>{t}
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <a href="/coach" style={{padding:"12px 24px",borderRadius:10,background:AMBER,color:N,fontSize:14,fontWeight:600,textDecoration:"none"}}>
                Try the AI coach now →
              </a>
              <a href="/" style={{padding:"12px 24px",borderRadius:10,border:"1px solid #E2E8F0",color:"#64748B",fontSize:14,textDecoration:"none"}}>
                Back to home
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{background:"#111520",borderTop:"1px solid rgba(255,255,255,.06)",padding:"18px 5%",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <SixxabIcon size={20}/>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:15,color:CHALK,letterSpacing:2}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</span>
        </div>
        <div style={{display:"flex",gap:16}}>
          {[["Privacy","/privacy"],["Terms","/terms"],["Contact","/contact"]].map(([l,h])=>(
            <a key={l} href={h} style={{fontSize:12,color:"rgba(255,255,255,.3)",textDecoration:"none"}}>{l}</a>
          ))}
        </div>
        <span style={{fontSize:12,color:"rgba(255,255,255,.25)"}}>© 2025 SIXXAB · Dallas, TX</span>
      </footer>
    </>
  )
}
