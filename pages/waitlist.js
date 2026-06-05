// pages/waitlist.js — SIXXAB AI · Join the Waitlist
import Head from "next/head"
import SixxabNav, { SixxabMark, SixxabWordmark } from "../components/SixxabNav"
import { useState } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

const STAGES  = ["Just starting out", "Idea validated — not launched", "Launched — under $5k MRR", "$5k–$25k MRR", "$25k+ MRR"]
const MARKETS = ["Dallas / DFW, TX", "Texas (statewide)", "United States (national)", "United Kingdom", "Europe", "India", "Australia / NZ", "Southeast Asia", "Other"]
const SOURCES = ["LinkedIn", "Friend or colleague", "Google search", "Twitter / X", "Product Hunt", "Podcast or article", "SIXXAB Advisor", "Other"]

const BENEFITS = [
  { icon:"🚀", text:"Early access — be among the first to run your business autonomously" },
  { icon:"🎯", text:"Full access to Niche Selector, Orchestrator and all 30 Vertical Packs" },
  { icon:"📅", text:"Priority onboarding call with Sunil — your personal 48-hour launch plan" },
  { icon:"💼", text:"First access to new features — board agents, content studio, lead gen and more" },
  { icon:"📖", text:"Platform runbook and Founder Mental Model sent before you start" },
  { icon:"🌍", text:"Global vertical packs — Texas, US national, UK, Europe and beyond" },
]

const PLANS = [
  { name:"Starter", price:"$250", desc:"Validate and launch", color:"#64748B" },
  { name:"Pro",     price:"$999", desc:"Scale with 11 CXO advisors", color:AMBER, highlight:true },
  { name:"Agency",  price:"$2,499", desc:"Multiple businesses and clients", color:"#64748B" },
]

const SOCIAL = [
  { initials:"MT", name:"Marcus T.", role:"Solo founder · Dallas",   text:"Set one goal Monday. By Thursday I had 3 demos booked. The Orchestrator just works." },
  { initials:"PS", name:"Priya S.", role:"Consultant · Mumbai",     text:"The Niche Selector told me exactly where to focus. I stopped guessing and started executing." },
  { initials:"JK", name:"Jason K.", role:"SaaS founder · London",   text:"Switched from 11 tools to SIXXAB. Cut my ops time in half and know what to do every week." },
]

export default function WaitlistPage() {
  const [form,    setForm]    = useState({ name:"", email:"", phone:"", business:"", idea:"", stage:"", market:"", source:"", message:"" })
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(null)
  const [err,     setErr]     = useState("")
  const [agree,   setAgree]   = useState(false)

  const set = (k,v) => setForm(f => ({...f, [k]:v}))

  async function submit(e) {
    e.preventDefault(); setErr("")
    if (!form.name.trim())                      { setErr("Please enter your name."); return }
    if (!form.email || !form.email.includes("@")) { setErr("Please enter a valid email."); return }
    if (!agree)                                 { setErr("Please agree to the terms to continue."); return }
    setLoading(true)
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: form.source || "waitlist-page" })
      })
      const d = await r.json()
      if (!r.ok) { setErr(d.error || "Something went wrong — please try again."); setLoading(false); return }
      setDone({ position: d.position, name: d.name, duplicate: d.duplicate })
    } catch { setErr("Network error — please try again.") }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>SIXXAB AI — Join the Waitlist</title>
        <meta name="description" content="Join the SIXXAB AI waitlist. Get early access, priority onboarding and full access to the autonomous business platform from $250/mo."/>
      </Head>

      <style>{`
        body { background: ${N} }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin   { to   { transform:rotate(360deg) } }
        .fu { animation: fadeUp .4s ease both }

        /* ── Inputs ── */
        .inp { width:100%; padding:11px 14px; border:1.5px solid #E2E8F0; border-radius:10px; font-size:14px; color:${N}; background:#fff; transition:border .15s; font-family:inherit; outline:none }
        .inp:focus { border-color:${AMBER} }
        select.inp { cursor:pointer }
        textarea.inp { resize:vertical; line-height:1.6 }
        .lbl { font-size:11px; font-weight:600; color:#64748B; text-transform:uppercase; letter-spacing:.07em; display:block; margin-bottom:5px }

        /* ── Layout ── */
        .wl-grid { display:grid; grid-template-columns:1fr 1fr; min-height:100vh }

        /* ── Mobile ── */
        @media(max-width:768px) {
          .wl-grid { grid-template-columns:1fr }
          .wl-left  { padding:40px 6% 32px }
          .wl-social { display:none }
          .wl-right { padding:32px 6% 48px }
        }
      `}</style>

      <SixxabNav active=""/>

      <div className="wl-grid">

        {/* ── Left: brand + benefits ── */}
        <div className="wl-left" style={{ padding:"52px 7%", display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", overflow:"hidden" }}>
          {/* bg texture */}
          <div style={{ position:"absolute", inset:0,
            backgroundImage:"radial-gradient(rgba(239,159,39,.08) 1px,transparent 1px)",
            backgroundSize:"32px 32px", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", top:"35%", left:"50%", transform:"translate(-50%,-50%)",
            width:560, height:460, pointerEvents:"none",
            background:"radial-gradient(ellipse,rgba(239,159,39,.13) 0%,transparent 65%)" }}/>

          <div style={{ position:"relative", zIndex:1 }}>

            {/* Logo */}
            <a href="/" style={{ display:"inline-flex", alignItems:"center", gap:9, textDecoration:"none", marginBottom:28 }}>
              <SixxabMark size={26}/>
              <SixxabWordmark/>
            </a>

            {/* Label */}
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:AMBER,
                          letterSpacing:".14em", textTransform:"uppercase", marginBottom:14 }}>
              Early access — get started first
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily:"Georgia,serif", fontSize:"clamp(26px,3.5vw,48px)",
                          fontWeight:700, color:CHALK, letterSpacing:"-0.5px",
                          lineHeight:1.05, marginBottom:14 }}>
              Your business<br/>
              <span style={{ color:AMBER, fontStyle:"italic" }}>runs itself.</span>
            </h1>

            <p style={{ fontSize:15, color:"rgba(245,245,240,.55)", lineHeight:1.8,
                        maxWidth:400, marginBottom:28 }}>
              SIXXAB AI is the autonomous business platform that takes any business from idea to $10M ARR. Six phases. 11 CXO advisors. 36 AI agents. 30 vertical packs.
            </p>

            {/* Benefits */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
              {BENEFITS.map((b,i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10,
                                      fontSize:13.5, color:"rgba(245,245,240,.75)", lineHeight:1.5 }}>
                  <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{b.icon}</span>
                  {b.text}
                </div>
              ))}
            </div>

            {/* Plan pills */}
            <div style={{ display:"flex", gap:8, marginBottom:28, flexWrap:"wrap" }}>
              {PLANS.map(p => (
                <div key={p.name} style={{ padding:"8px 14px", borderRadius:10,
                  background: p.highlight ? `${AMBER}18` : "rgba(255,255,255,.05)",
                  border: `1px solid ${p.highlight ? AMBER+"55" : "rgba(255,255,255,.1)"}` }}>
                  <div style={{ fontSize:12, fontWeight:700, color: p.highlight ? AMBER : CHALK }}>{p.name}</div>
                  <div style={{ fontSize:16, fontWeight:700, color: p.highlight ? AMBER : CHALK, lineHeight:1.1 }}>{p.price}<span style={{ fontSize:11, fontWeight:400, color:"rgba(245,245,240,.4)" }}>/mo</span></div>
                  <div style={{ fontSize:10.5, color:"rgba(245,245,240,.4)", marginTop:1 }}>{p.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11.5, color:"rgba(245,245,240,.3)", marginBottom:28 }}>
              All plans include a 14-day free trial · Cancel anytime
            </div>

            {/* Testimonials */}
            <div className="wl-social" style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {SOCIAL.map((s,i) => (
                <div key={i} style={{ padding:"12px 14px", borderRadius:11,
                                      background:"rgba(255,255,255,.04)",
                                      border:"1px solid rgba(255,255,255,.07)" }}>
                  <p style={{ fontSize:13, color:"rgba(245,245,240,.65)", lineHeight:1.65,
                               fontStyle:"italic", marginBottom:7 }}>"{s.text}"</p>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:24, height:24, borderRadius:"50%",
                                  background:"rgba(239,159,39,.15)",
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  fontSize:9, fontWeight:700, color:AMBER }}>
                      {s.initials}
                    </div>
                    <span style={{ fontSize:11, color:"rgba(245,245,240,.35)" }}>
                      {s.name} · {s.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className="wl-right" style={{ background:"#F4F4F0", padding:"52px 7%",
                                           display:"flex", flexDirection:"column",
                                           justifyContent:"center", overflowY:"auto" }}>
          {done ? (

            /* ── Success ── */
            <div className="fu" style={{ textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:16, background:"rgba(239,159,39,.15)",
                            border:`2px solid ${AMBER}44`, display:"flex", alignItems:"center",
                            justifyContent:"center", fontSize:32, margin:"0 auto 20px" }}>
                🎉
              </div>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:28, fontWeight:700,
                            color:N, marginBottom:8 }}>
                You're #{done.position} on the list
              </h2>
              <p style={{ fontSize:15, color:"#64748B", lineHeight:1.75, maxWidth:340,
                          margin:"0 auto 24px" }}>
                {done.duplicate
                  ? `You're already on the waitlist at position #${done.position}. We'll be in touch.`
                  : `Welcome, ${done.name?.split(" ")[0]}. Check your inbox — we've sent early access resources to get you started while you wait.`}
              </p>

              <div style={{ display:"flex", flexDirection:"column", gap:8, maxWidth:320, margin:"0 auto" }}>
                {[
                  { label:"🎯 Validate your niche — free",  href:"/niche-validator", primary:true },
                  { label:"📖 Read the platform runbook",   href:"/runbook" },
                  { label:"🧠 Founder Mental Model",        href:"/mindset" },
                  { label:"📋 Product Validation Guide",    href:"/validate" },
                  { label:"📅 Book a free strategy call",   href:"/discovery" },
                ].map(a => (
                  <a key={a.href} href={a.href} style={{
                    padding:"11px 18px", borderRadius:10, textDecoration:"none",
                    fontSize:14, fontWeight: a.primary ? 700 : 500, display:"block",
                    textAlign:"center", transition:"opacity .15s",
                    background: a.primary ? AMBER : "#fff",
                    color: a.primary ? N : N,
                    border: a.primary ? "none" : "1px solid #E2E8F0"
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity=".85"}
                  onMouseOut={e  => e.currentTarget.style.opacity="1"}>
                    {a.label}
                  </a>
                ))}
              </div>
            </div>

          ) : (

            /* ── Form ── */
            <div>
              <div style={{ marginBottom:22 }}>
                <h2 style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:700,
                              color:N, marginBottom:5 }}>
                  Request early access
                </h2>
                <p style={{ fontSize:13.5, color:"#64748B", lineHeight:1.65 }}>
                  Plans from $250/mo · 14-day free trial · No credit card required
                </p>
              </div>

              <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:12 }}>

                {/* Name + Email */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label className="lbl">Full name *</label>
                    <input className="inp" type="text" placeholder="Sunil Kattikar"
                      value={form.name} onChange={e => set("name", e.target.value)}/>
                  </div>
                  <div>
                    <label className="lbl">Email *</label>
                    <input className="inp" type="email" placeholder="you@company.com"
                      value={form.email} onChange={e => set("email", e.target.value)}/>
                  </div>
                </div>

                {/* Phone + Company */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label className="lbl">Mobile</label>
                    <input className="inp" type="tel" placeholder="+1 (555) 000-0000"
                      value={form.phone} onChange={e => set("phone", e.target.value)}/>
                  </div>
                  <div>
                    <label className="lbl">Business / Company</label>
                    <input className="inp" type="text" placeholder="Acme Inc"
                      value={form.business} onChange={e => set("business", e.target.value)}/>
                  </div>
                </div>

                {/* Idea */}
                <div>
                  <label className="lbl">Your business idea or niche</label>
                  <input className="inp" type="text"
                    placeholder="e.g. HVAC automation for Texas contractors, Legal tech for UK solicitors"
                    value={form.idea} onChange={e => set("idea", e.target.value)}/>
                </div>

                {/* Stage + Market */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label className="lbl">Current stage</label>
                    <select className="inp" value={form.stage} onChange={e => set("stage", e.target.value)}>
                      <option value="">Select…</option>
                      {STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">Target market</label>
                    <select className="inp" value={form.market} onChange={e => set("market", e.target.value)}>
                      <option value="">Select…</option>
                      {MARKETS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                {/* Source */}
                <div>
                  <label className="lbl">How did you hear about SIXXAB AI?</label>
                  <select className="inp" value={form.source} onChange={e => set("source", e.target.value)}>
                    <option value="">Select…</option>
                    {SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="lbl">Anything else? (optional)</label>
                  <textarea className="inp" rows={2}
                    placeholder="e.g. I want the Pro plan, I need a UK HVAC pack, I'm launching in Q3…"
                    value={form.message} onChange={e => set("message", e.target.value)}/>
                </div>

                {/* Terms */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:10,
                              padding:"12px 13px", borderRadius:10, cursor:"pointer",
                              background:"#fff", border:`1.5px solid ${agree ? AMBER : "#E2E8F0"}`,
                              transition:"border .15s" }}
                     onClick={() => setAgree(a => !a)}>
                  <div style={{ width:20, height:20, borderRadius:6, flexShrink:0, marginTop:1,
                                border:`2px solid ${agree ? AMBER : "#CBD5E1"}`,
                                background: agree ? AMBER : "#fff",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                transition:"all .14s" }}>
                    {agree && (
                      <svg width="11" height="9" viewBox="0 0 11 9">
                        <path d="M1 4.5l3.5 3.5 5.5-7" stroke={N} strokeWidth="2"
                              fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize:12.5, color:"#475569", lineHeight:1.6 }}>
                    I agree to the{" "}
                    <a href="/terms" style={{ color:AMBER }} onClick={e => e.stopPropagation()}>Terms</a>
                    {" "}and{" "}
                    <a href="/privacy" style={{ color:AMBER }} onClick={e => e.stopPropagation()}>Privacy Policy</a>.
                    {" "}No spam — one email when your spot is ready.
                  </span>
                </div>

                {/* Error */}
                {err && (
                  <div style={{ padding:"10px 13px", background:"#FEF2F2",
                                border:"1px solid #FECACA", borderRadius:9,
                                fontSize:13, color:"#991B1B",
                                display:"flex", alignItems:"center", gap:7 }}>
                    <i className="ti ti-alert-circle" style={{ fontSize:14, flexShrink:0 }} aria-hidden="true"/>
                    {err}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading} style={{
                  width:"100%", padding:14, borderRadius:10, border:"none",
                  background: loading ? "#F1F5F9" : AMBER,
                  color: loading ? "#94A3B8" : N,
                  fontSize:15, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily:"inherit", display:"flex", alignItems:"center",
                  justifyContent:"center", gap:9, transition:"opacity .15s"
                }}>
                  {loading
                    ? <><div style={{ width:16, height:16, border:"2px solid rgba(10,14,26,.2)",
                                      borderTopColor:N, borderRadius:"50%",
                                      animation:"spin .8s linear infinite" }}/>
                        Submitting…</>
                    : "Request early access →"}
                </button>

                <p style={{ fontSize:11.5, color:"#94A3B8", textAlign:"center", lineHeight:1.65 }}>
                  No credit card required · Cancel anytime · Your data is never sold
                </p>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background:"#111520", padding:"14px 5%",
                       display:"flex", alignItems:"center",
                       justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <span style={{ fontSize:11, color:"rgba(255,255,255,.22)" }}>
          © 2025 SIXXAB AI · Autonomous Business Platform · Dallas, TX
        </span>
        <div style={{ display:"flex", gap:16 }}>
          {[["Home","/"],["Pricing","/#pricing"],["Runbook","/runbook"],["Terms","/terms"],["Privacy","/privacy"]].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize:11, color:"rgba(255,255,255,.28)", textDecoration:"none" }}
               onMouseOver={e => e.target.style.color="rgba(255,255,255,.6)"}
               onMouseOut={e  => e.target.style.color="rgba(255,255,255,.28)"}>
              {l}
            </a>
          ))}
        </div>
      </footer>
    </>
  )
}
