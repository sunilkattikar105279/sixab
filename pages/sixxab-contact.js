import { useState } from "react"
import Head from "next/head"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

function SixxabIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/>
      <text x="7" y="54" fontFamily="Georgia,serif" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
      <text x="35" y="54" fontFamily="Georgia,serif" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
    </svg>
  )
}

const INQUIRY_TYPES = [
  { id:"general",    icon:"💬", label:"General inquiry",      desc:"Questions about SIXXAB" },
  { id:"partner",    icon:"🤝", label:"Partnership",          desc:"Referral or co-marketing" },
  { id:"enterprise", icon:"🏢", label:"Enterprise",           desc:"Team or agency pricing" },
  { id:"press",      icon:"📰", label:"Press & media",        desc:"Interviews or features" },
  { id:"investor",   icon:"💼", label:"Investor inquiry",     desc:"Funding & investment" },
  { id:"technical",  icon:"⚙️", label:"Technical support",    desc:"Platform or billing help" },
]

export default function ContactPage() {
  const [type, setType]         = useState("")
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [company, setCompany]   = useState("")
  const [message, setMessage]   = useState("")
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [err, setErr]           = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setErr("")
    if (!type)          { setErr("Please select an inquiry type."); return }
    if (!name.trim())   { setErr("Please enter your name."); return }
    if (!email.trim() || !email.includes("@")) { setErr("Please enter a valid email."); return }
    if (!message.trim()) { setErr("Please describe how we can help."); return }

    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, email, company, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Send failed")
      setSent(true)
    } catch (err) {
      setErr(err.message || "Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Contact SIXXAB — Get in touch</title>
        <meta name="description" content="Contact SIXXAB for partnerships, enterprise pricing, press inquiries, or technical support. We respond within 24 hours." />
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;min-height:100vh}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fadeUp{animation:fadeUp .4s ease both}
        input,select,textarea{font-family:inherit}
        input:focus,textarea:focus{outline:none}
        .finput{width:100%;padding:11px 14px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:14px;background:#fff;color:${N};transition:border .15s;line-height:1.5}
        .finput:focus{border-color:${AMBER}}
        .pbtn{width:100%;padding:13px;border-radius:10px;background:${AMBER};color:${N};font-size:15px;font-weight:600;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .15s}
        .pbtn:hover:not(:disabled){opacity:.9}
        .pbtn:disabled{opacity:.5;cursor:not-allowed}
        .type-card{border:1.5px solid #E2E8F0;border-radius:10px;padding:12px;cursor:pointer;background:#fff;transition:all .15s;text-align:left}
        .type-card:hover{border-color:#CBD5E1;background:#FAFAFA}
        .type-card.active{border-color:${AMBER};background:#FFFBF2}
      `}</style>

      {/* Nav */}
      <nav style={{background:N,padding:"0 5%",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
          <SixxabIcon size={28}/>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:CHALK,letterSpacing:2,lineHeight:1}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:8,color:"#5F5E5A",letterSpacing:".12em"}}>startupsinabox.com</div>
          </div>
        </a>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          {[["Pricing","/#pricing"],["Coach","/coach"],["Agents","/agents"],["Discovery","/discovery"]].map(([l,h]) => (
            <a key={l} href={h} style={{fontSize:13,color:"rgba(255,255,255,.55)",textDecoration:"none"}}>{l}</a>
          ))}
          <a href="/login" style={{padding:"6px 16px",borderRadius:8,background:AMBER,color:N,fontSize:13,fontWeight:600,textDecoration:"none"}}>Get started</a>
        </div>
      </nav>

      <div style={{maxWidth:900,margin:"0 auto",padding:"52px 20px 80px"}}>

        {/* Hero */}
        <div className="fadeUp" style={{textAlign:"center",marginBottom:52}}>
          <h1 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(36px,6vw,64px)",color:N,letterSpacing:1.5,lineHeight:1.05,marginBottom:14}}>
            Get in touch
          </h1>
          <p style={{fontSize:17,color:"#64748B",maxWidth:480,margin:"0 auto",lineHeight:1.7}}>
            Whether you're a founder, partner, investor, or journalist — we'd love to hear from you. We respond within <strong style={{color:N}}>24 hours</strong>.
          </p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:24,alignItems:"start"}}>

          {/* Form */}
          {sent ? (
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #BBF7D0",padding:48,textAlign:"center"}} className="fadeUp">
              <div style={{width:64,height:64,borderRadius:"50%",background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:28}}>✓</div>
              <h2 style={{fontFamily:"'Bebas Neue'",fontSize:30,color:N,letterSpacing:1,marginBottom:10}}>Message received!</h2>
              <p style={{fontSize:15,color:"#64748B",lineHeight:1.7,marginBottom:24}}>
                Thanks <strong style={{color:N}}>{name.split(" ")[0]}</strong> — we'll reply to <strong style={{color:N}}>{email}</strong> within 24 hours.
              </p>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                <a href="/discovery" style={{padding:"11px 22px",borderRadius:10,background:AMBER,color:N,fontSize:14,fontWeight:600,textDecoration:"none"}}>Book a call instead →</a>
                <a href="/" style={{padding:"11px 22px",borderRadius:10,border:"1px solid #E2E8F0",color:"#64748B",fontSize:14,textDecoration:"none"}}>Back to home</a>
              </div>
            </div>
          ) : (
            <div style={{background:"#fff",borderRadius:16,border:"1px solid #E2E8F0",padding:28}} className="fadeUp">
              <h2 style={{fontFamily:"'Bebas Neue'",fontSize:22,color:N,letterSpacing:1,marginBottom:4}}>Send us a message</h2>
              <p style={{fontSize:13,color:"#64748B",marginBottom:22}}>Fill in the form and we'll get back to you within 24 hours.</p>

              {/* Inquiry type */}
              <div style={{marginBottom:18}}>
                <label style={{fontSize:12,fontWeight:500,color:"#475569",display:"block",marginBottom:8}}>What's your inquiry about? *</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {INQUIRY_TYPES.map(t => (
                    <div key={t.id} className={`type-card ${type===t.id?"active":""}`} onClick={()=>setType(t.id)}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:16}}>{t.icon}</span>
                        <div>
                          <div style={{fontSize:12.5,fontWeight:500,color:N}}>{t.label}</div>
                          <div style={{fontSize:11,color:"#94A3B8"}}>{t.desc}</div>
                        </div>
                        {type===t.id && <div style={{marginLeft:"auto",width:16,height:16,borderRadius:"50%",background:AMBER,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={N} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
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
                  <label style={{fontSize:12,fontWeight:500,color:"#475569",display:"block",marginBottom:5}}>Company / organisation (optional)</label>
                  <input className="finput" type="text" placeholder="My startup or organisation" value={company} onChange={e=>setCompany(e.target.value)}/>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:"#475569",display:"block",marginBottom:5}}>Your message *</label>
                  <textarea className="finput" rows={5} placeholder="Tell us what you're working on and how we can help…"
                    value={message} onChange={e=>setMessage(e.target.value)} style={{resize:"vertical"}}/>
                  <div style={{fontSize:11,color:"#94A3B8",marginTop:4,textAlign:"right"}}>{message.length}/1000</div>
                </div>
                {err && <div style={{padding:"8px 12px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,fontSize:13,color:"#991B1B"}}>{err}</div>}
                <button type="submit" className="pbtn" disabled={loading}>
                  {loading?<><div style={{width:16,height:16,border:"2px solid rgba(10,14,26,.25)",borderTopColor:N,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Sending…</>
                    :<>Send message →</>}
                </button>
                <p style={{fontSize:11,color:"#94A3B8",textAlign:"center"}}>
                  We respond to all inquiries within 24 hours · <a href="/privacy" style={{color:"#64748B"}}>Privacy Policy</a>
                </p>
              </form>
            </div>
          )}

          {/* Right sidebar */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Contact info */}
            <div style={{background:N,borderRadius:14,padding:22}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:CHALK,letterSpacing:1.5,marginBottom:16}}>Direct contact</div>
              {[
                {icon:"ti-mail",label:"Email",value:"hello@startupsinabox.com",href:"mailto:hello@startupsinabox.com"},
                {icon:"ti-calendar",label:"Discovery call",value:"Book a free 20-min call",href:"/discovery"},
                {icon:"ti-brand-linkedin",label:"LinkedIn",value:"linkedin.com/in/sunilkattikar",href:"https://linkedin.com/in/sunilkattikar"},
                {icon:"ti-map-pin",label:"Location",value:"Dallas, TX · Global",href:null},
              ].map((c,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
                  <div style={{width:34,height:34,borderRadius:8,background:"rgba(239,159,39,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <i className={`ti ${c.icon}`} style={{fontSize:15,color:AMBER}} aria-hidden="true"/>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"rgba(245,245,240,.4)",fontWeight:500,textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>{c.label}</div>
                    {c.href ? <a href={c.href} style={{fontSize:13,color:CHALK,textDecoration:"none"}}>{c.value}</a>
                      : <span style={{fontSize:13,color:CHALK}}>{c.value}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Response time */}
            <div style={{background:"#fff",borderRadius:14,border:"1px solid #E2E8F0",padding:18}}>
              <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Response times</div>
              {[
                {t:"General inquiry",r:"Within 24 hours",c:"#1D9E75"},
                {t:"Partnership",r:"Within 24 hours",c:"#1D9E75"},
                {t:"Enterprise pricing",r:"Same business day",c:"#EF9F27"},
                {t:"Technical support",r:"Within 4 hours",c:"#EF9F27"},
                {t:"Press & media",r:"Within 48 hours",c:"#64748B"},
              ].map((x,i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<4?"1px solid #F1F5F9":"none"}}>
                  <span style={{fontSize:13,color:N}}>{x.t}</span>
                  <span style={{fontSize:11,fontWeight:600,color:x.c}}>{x.r}</span>
                </div>
              ))}
            </div>

            {/* Book a call CTA */}
            <div style={{background:AMBER,borderRadius:14,padding:20,textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:8}}>📅</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:N,letterSpacing:1,marginBottom:6}}>Prefer to talk?</div>
              <p style={{fontSize:13,color:"rgba(10,14,26,.65)",lineHeight:1.6,marginBottom:14}}>
                Book a free 20-minute discovery call with Sunil directly — no forms, just conversation.
              </p>
              <a href="/discovery" style={{display:"block",padding:"11px 20px",borderRadius:9,background:N,color:CHALK,fontSize:13,fontWeight:600,textDecoration:"none"}}>
                Book a discovery call →
              </a>
            </div>

            {/* Communities */}
            <div style={{background:"#fff",borderRadius:14,border:"1px solid #E2E8F0",padding:18}}>
              <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Find us in Dallas</div>
              {["Capital Factory","The DEC Network","Dallas Founders Club","Startup Grind Dallas"].map((c,i) => (
                <div key={i} style={{fontSize:13,color:"#64748B",padding:"6px 0",borderBottom:i<3?"1px solid #F1F5F9":"none",display:"flex",alignItems:"center",gap:7}}>
                  <span style={{color:AMBER}}>→</span>{c}
                </div>
              ))}
            </div>
          </div>
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
