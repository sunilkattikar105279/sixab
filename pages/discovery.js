import { useEffect, useState } from "react"
import Head from "next/head"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

function SixxabIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/>
      <text x="7" y="54" fontFamily="Georgia,serif" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
      <text x="35" y="54" fontFamily="Georgia,serif" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
    </svg>
  )
}

// Replace with your actual Calendly URL
const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/sunil-kattikar/sixxab-discovery"

export default function DiscoveryPage() {
  const [booked, setBooked] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [goal, setGoal] = useState("")
  const [step, setStep] = useState(1) // 1=details, 2=calendly, 3=done
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState("")

  // Listen for Calendly booking event
  useEffect(() => {
    function onCalendlyEvent(e) {
      if (e.data?.event === "calendly.event_scheduled") {
        setBooked(true)
        setStep(3)
        // Send alert email to founder
        fetch("/api/discovery-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            company,
            goal,
            eventUri: e.data?.payload?.event?.uri || "",
            inviteeUri: e.data?.payload?.invitee?.uri || "",
          }),
        }).catch(() => {})
      }
    }
    window.addEventListener("message", onCalendlyEvent)
    return () => window.removeEventListener("message", onCalendlyEvent)
  }, [name, email, company, goal])

  // Inject Calendly widget script
  useEffect(() => {
    if (step !== 2) return
    const existing = document.getElementById("calendly-script")
    if (!existing) {
      const s = document.createElement("script")
      s.id = "calendly-script"
      s.src = "https://assets.calendly.com/assets/external/widget.js"
      s.async = true
      document.head.appendChild(s)
    }
  }, [step])

  async function handleDetailsSubmit(e) {
    e.preventDefault()
    setErr("")
    if (!name.trim()) { setErr("Please enter your name."); return }
    if (!email.trim() || !email.includes("@")) { setErr("Please enter a valid email."); return }
    if (!goal) { setErr("Please tell us your main goal."); return }
    setSubmitting(true)
    // Pre-notify founder of interest before booking
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
        <meta name="description" content="Book a free 20-minute discovery call with SIXXAB founder Sunil Kattikar. Get a personalised startup launch plan for your business." />
        <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css"/>
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;min-height:100vh}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fadeUp{animation:fadeUp .5s ease both}
        input,select,textarea{font-family:inherit}
        input:focus,select:focus,textarea:focus{outline:none}
        .finput{width:100%;padding:11px 14px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:14px;background:#fff;color:${N};transition:border .15s}
        .finput:focus{border-color:${AMBER}}
        .pbtn{width:100%;padding:13px;border-radius:10px;background:${AMBER};color:${N};font-size:15px;font-weight:600;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:opacity .15s;display:flex;align-items:center;justify-content:center;gap:8px}
        .pbtn:hover:not(:disabled){opacity:.9}
        .pbtn:disabled{opacity:.5;cursor:not-allowed}
        .calendly-inline-widget{border-radius:14px;overflow:hidden;border:1px solid #E2E8F0}
      `}</style>

      {/* Nav */}
      <nav style={{background:N,padding:"0 5%",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
          <SixxabIcon size={28}/>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            <span style={{fontFamily:"'Bebas Neue'",fontSize:20,color:CHALK,letterSpacing:2,lineHeight:1}}>
              SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB
            </span>
            <span style={{fontFamily:"'DM Mono'",fontSize:8,color:"#5F5E5A",letterSpacing:".12em"}}>startupsinabox.com</span>
          </div>
        </a>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          {[["Pricing","/#pricing"],["Coach","/coach"],["Agents","/agents"],["Contact","/contact"]].map(([l,h]) => (
            <a key={l} href={h} style={{fontSize:13,color:"rgba(255,255,255,.55)",textDecoration:"none"}}>{l}</a>
          ))}
          <a href="/login" style={{padding:"6px 16px",borderRadius:8,background:AMBER,color:N,fontSize:13,fontWeight:600,textDecoration:"none"}}>Get started</a>
        </div>
      </nav>

      <div style={{maxWidth:880,margin:"0 auto",padding:"48px 20px 80px"}}>

        {/* Hero */}
        <div className="fadeUp" style={{textAlign:"center",marginBottom:48}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,border:"1px solid rgba(239,159,39,.3)",background:"rgba(239,159,39,.08)",fontSize:12,fontWeight:500,color:AMBER,marginBottom:18}}>
            📅 Free · 20 minutes · No pitch, just strategy
          </div>
          <h1 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(36px,6vw,64px)",color:N,letterSpacing:1.5,lineHeight:1.05,marginBottom:14}}>
            Book your free<br/>discovery call
          </h1>
          <p style={{fontSize:17,color:"#64748B",maxWidth:520,margin:"0 auto 20px",lineHeight:1.7}}>
            20 minutes with SIXXAB founder <strong style={{color:N}}>Sunil Kattikar</strong>. We'll map your idea to revenue in a personalised 48-hour launch plan — free, no strings attached.
          </p>
          <div style={{display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap",fontSize:13,color:"#64748B"}}>
            {["✓ Personalised for your business","✓ Dallas & global founders welcome","✓ No sales pitch — pure strategy"].map((t,i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>

        {/* Progress steps */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,marginBottom:40}}>
          {[{n:1,l:"Your details"},{n:2,l:"Pick a time"},{n:3,l:"Confirmed"}].map((s,i) => (
            <div key={s.n} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:step>=s.n?AMBER:"#E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:step>=s.n?N:"#94A3B8",transition:"all .3s"}}>
                  {step>s.n?<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={N} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>:s.n}
                </div>
                <span style={{fontSize:11,fontWeight:step===s.n?600:400,color:step>=s.n?N:"#94A3B8",whiteSpace:"nowrap"}}>{s.l}</span>
              </div>
              {i<2 && <div style={{width:80,height:2,background:step>s.n?AMBER:"#E2E8F0",margin:"0 8px 20px",transition:"background .3s"}}/>}
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:step===2?"1fr":"1fr 340px",gap:24,alignItems:"start"}}>

          {/* STEP 1: Details form */}
          {step === 1 && (
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #E2E8F0",padding:28}} className="fadeUp">
              <h2 style={{fontFamily:"'Bebas Neue'",fontSize:24,color:N,letterSpacing:1,marginBottom:4}}>Tell us about yourself</h2>
              <p style={{fontSize:13,color:"#64748B",marginBottom:22}}>So Sunil can come prepared with ideas specific to your business.</p>
              <form onSubmit={handleDetailsSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
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
                  <label style={{fontSize:12,fontWeight:500,color:"#475569",display:"block",marginBottom:5}}>Company / business (optional)</label>
                  <input className="finput" type="text" placeholder="My startup or freelance work" value={company} onChange={e=>setCompany(e.target.value)}/>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:"#475569",display:"block",marginBottom:5}}>What's your #1 goal right now? *</label>
                  <select className="finput" value={goal} onChange={e=>setGoal(e.target.value)} style={{cursor:"pointer",color:goal?"#0A0E1A":"#94A3B8"}}>
                    <option value="" disabled>Select your main goal…</option>
                    <option value="validate">Validate my idea before building</option>
                    <option value="launch">Launch my first product this week</option>
                    <option value="revenue">Get my first paying customer</option>
                    <option value="scale">Scale from first revenue to $10k MRR</option>
                    <option value="freelance">Turn my freelance work into a product</option>
                    <option value="saas">Build and launch a SaaS business</option>
                    <option value="partner">Explore partnership with SIXXAB</option>
                    <option value="invest">Learn about investment opportunities</option>
                    <option value="other">Something else</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:"#475569",display:"block",marginBottom:5}}>Anything else you'd like Sunil to know? (optional)</label>
                  <textarea className="finput" rows={3} placeholder="Tell us about your business, what you've tried, or what's holding you back…"
                    style={{resize:"vertical",lineHeight:1.6}} onChange={()=>{}}/>
                </div>
                {err && <div style={{padding:"8px 12px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,fontSize:13,color:"#991B1B"}}>{err}</div>}
                <button type="submit" className="pbtn" disabled={submitting}>
                  {submitting?<><div style={{width:16,height:16,border:"2px solid rgba(10,14,26,.25)",borderTopColor:N,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Saving…</>
                    :<>Continue to pick a time →</>}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Calendly */}
          {step === 2 && (
            <div className="fadeUp">
              <div style={{background:"#fff",borderRadius:16,border:"1px solid #E2E8F0",padding:"20px 20px 0",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:15,color:N,fontWeight:700}}>SK</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:N}}>Sunil Kattikar</div>
                    <div style={{fontSize:12,color:"#64748B"}}>Founder, SIXXAB · Dallas, TX</div>
                  </div>
                  <div style={{marginLeft:"auto",fontSize:12,color:"#1D9E75",fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:"#1D9E75"}}/>
                    Available this week
                  </div>
                </div>
                <div style={{display:"flex",gap:16,padding:"12px 0",borderTop:"1px solid #F1F5F9",borderBottom:"1px solid #F1F5F9",marginBottom:16}}>
                  {[["🕐","20 minutes"],["📹","Google Meet or Zoom"],["🌍","Any timezone"],["🆓","Free"]].map(([icon,text],i) => (
                    <div key={i} style={{fontSize:12,color:"#64748B",display:"flex",alignItems:"center",gap:5}}>
                      <span>{icon}</span>{text}
                    </div>
                  ))}
                </div>
              </div>
              {/* Calendly inline widget */}
              <div
                className="calendly-inline-widget"
                data-url={`${CALENDLY_URL}?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&hide_event_type_details=1&hide_gdpr_banner=1&primary_color=ef9f27`}
                style={{minWidth:320,height:700}}
              />
            </div>
          )}

          {/* STEP 3: Confirmed */}
          {step === 3 && (
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #BBF7D0",padding:40,textAlign:"center"}} className="fadeUp">
              <div style={{width:64,height:64,borderRadius:"50%",background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:28}}>🎉</div>
              <h2 style={{fontFamily:"'Bebas Neue'",fontSize:32,color:N,letterSpacing:1,marginBottom:10}}>You're booked!</h2>
              <p style={{fontSize:15,color:"#64748B",lineHeight:1.7,marginBottom:24,maxWidth:440,margin:"0 auto 24px"}}>
                A calendar invite has been sent to <strong style={{color:N}}>{email}</strong>. Sunil will also receive an alert and come prepared with ideas for your business.
              </p>
              <div style={{background:"#F8F9FA",borderRadius:12,padding:20,marginBottom:24,textAlign:"left"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>What happens next</div>
                {["✓ Check your email for the calendar invite","✓ Add it to your Google/Apple Calendar","✓ You'll get a reminder 24h and 1h before","✓ Join via the video link in the invite","✓ Sunil will have your details ready"].map((t,i) => (
                  <div key={i} style={{fontSize:13,color:N,marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{color:"#1D9E75",fontWeight:600}}>{t.slice(0,1)}</span>{t.slice(2)}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                <a href="/coach" style={{padding:"11px 24px",borderRadius:10,background:AMBER,color:N,fontSize:14,fontWeight:600,textDecoration:"none"}}>
                  Try the AI coach now →
                </a>
                <a href="/" style={{padding:"11px 24px",borderRadius:10,border:"1px solid #E2E8F0",color:"#64748B",fontSize:14,fontWeight:500,textDecoration:"none"}}>
                  Back to home
                </a>
              </div>
            </div>
          )}

          {/* Right sidebar — only on step 1 */}
          {step === 1 && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {/* Sunil card */}
              <div style={{background:"#fff",borderRadius:14,border:"1px solid #E2E8F0",padding:20}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <div style={{width:52,height:52,borderRadius:"50%",background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:20,color:N,fontWeight:700,flexShrink:0}}>SK</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:N}}>Sunil Kattikar</div>
                    <div style={{fontSize:12,color:"#64748B"}}>Founder & CEO, SIXXAB</div>
                    <div style={{fontSize:11,color:"#94A3B8"}}>Dallas, TX · Global</div>
                  </div>
                </div>
                <p style={{fontSize:13,color:"#64748B",lineHeight:1.7,marginBottom:14}}>
                  I've helped 247+ founders go from idea to first revenue. In 20 minutes I'll give you a personalised action plan — not a sales pitch.
                </p>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {["SIXXAB founder — built in 48 hours","Ex-entrepreneur & business strategist","Dallas startup community — DEC, Capital Factory","Global reach: India, UK, Australia, SEA"].map((t,i) => (
                    <div key={i} style={{display:"flex",gap:8,fontSize:12,color:"#64748B",alignItems:"flex-start"}}>
                      <span style={{color:AMBER,flexShrink:0,fontWeight:700}}>→</span>{t}
                    </div>
                  ))}
                </div>
              </div>

              {/* What we'll cover */}
              <div style={{background:N,borderRadius:14,padding:20}}>
                <div style={{fontSize:12,fontWeight:600,color:"rgba(245,245,240,.5)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>What we'll cover</div>
                {[
                  {n:"1",t:"Your business idea",d:"We'll pressure-test it in 3 minutes"},
                  {n:"2",t:"Your target customer",d:"Niche selection using the 3-Filter Formula"},
                  {n:"3",t:"Your 48-hour plan",d:"Numbered steps you can start today"},
                  {n:"4",t:"How SIXXAB fits",d:"Only if it's genuinely right for you"},
                ].map((x,i) => (
                  <div key={i} style={{display:"flex",gap:10,marginBottom:12}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:N,flexShrink:0}}>{x.n}</div>
                    <div><div style={{fontSize:13,fontWeight:500,color:CHALK,marginBottom:2}}>{x.t}</div><div style={{fontSize:11,color:"rgba(245,245,240,.45)"}}>{x.d}</div></div>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div style={{background:"#fff",borderRadius:14,border:"1px solid #E2E8F0",padding:16}}>
                <div style={{color:AMBER,fontSize:12,marginBottom:8}}>★★★★★</div>
                <p style={{fontSize:13,color:"#64748B",lineHeight:1.7,fontStyle:"italic",marginBottom:10}}>
                  "The 20-min call with Sunil gave me more clarity than 6 months of planning alone. I launched 3 days later."
                </p>
                <div style={{fontSize:12,fontWeight:500,color:N}}>Marcus T. · Solo founder, Dallas</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{background:"#111520",borderTop:"1px solid rgba(255,255,255,.06)",padding:"20px 5%",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <SixxabIcon size={20}/>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:15,color:CHALK,letterSpacing:2}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</span>
        </div>
        <span style={{fontSize:12,color:"rgba(255,255,255,.25)"}}>© 2025 SIXXAB · Startups In eXponential A Box · Dallas, TX</span>
      </footer>
    </>
  )
}
