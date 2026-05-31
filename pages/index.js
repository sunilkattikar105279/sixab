Sixxab index nav · JS
import { useState, useEffect, useRef } from "react"
 
const TIERS = [
  {
    id: "starter", name: "Starter", price: 29,
    desc: "Perfect for solo founders launching their first idea",
    features: ["50 AI strategy sessions / month", "7-day launch sprint planner", "Niche selection framework", "Email support", "Cancel anytime"],
    cta: "Start for $14.50 / mo", highlight: false,
  },
  {
    id: "pro", name: "Pro", price: 49,
    desc: "For entrepreneurs moving fast and scaling exponentially",
    features: ["Unlimited AI strategy sessions", "Revenue optimizer tool", "Marketing & sales playbooks", "Priority support (4hr SLA)", "1 live coaching call / month"],
    cta: "Start for $24.50 / mo", highlight: true,
  },
  {
    id: "agency", name: "Agency", price: 69,
    desc: "Built for consultants running multiple client businesses",
    features: ["Everything in Pro", "5 team seats", "White-label coach persona", "API access", "Dedicated success manager"],
    cta: "Start for $34.50 / mo", highlight: false,
  },
]
 
const DEMO_MSGS = [
  { role: "user", text: "I want to launch a SaaS tool for HVAC contractors in Dallas. Where do I start?" },
  { role: "ai", text: "Sharp niche. Here's your Day 1 plan:\n\n1. Build a single-output MVP: proposal writer that turns a job form into a professional PDF in 60 seconds.\n2. Price at $49/mo — contractors bill $150/hr, this saves them 2 hours a week.\n3. DM 10 HVAC owners on LinkedIn today with a free trial.\n\nWhat's your tech skill level — can you ship a React app?" },
  { role: "user", text: "Yes I can code. What's the fastest way to get first revenue?" },
  { role: "ai", text: "Build in 6 hours, charge in 24:\n\n• Hour 1–3: Claude API + 1 intake form → output on Vercel free\n• Hour 4: Stripe checkout, $49/mo\n• Hour 5: Landing page, demo screenshot, live link\n• Hour 6: DM 20 warm contacts — offer 50% off for feedback\n\nYou only need 1 paying customer to prove the model. Go." },
]
 
const PROOF = [
  { name: "Marcus T.", role: "Solo founder, Dallas", quote: "Closed my first $2,400 client on Day 3. SIXXAB told me exactly what to say and who to call." },
  { name: "Priya S.", role: "Freelance consultant", quote: "Idea to landing page in 48 hours. The strategy sessions feel like a McKinsey advisor in my pocket." },
  { name: "Jason K.", role: "SaaS entrepreneur", quote: "Hit $5k MRR in 6 weeks. The niche framework alone was worth 10× the price." },
]
 
// ── SIXXAB SVG Icon ──────────────────────────────────────────────────────
function SixabIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="69" height="69" rx="15" fill="none" stroke="#EF9F27" strokeWidth="3"/>
      <text x="7" y="54" fontFamily="'Bebas Neue', sans-serif" fontSize="48" fill="none" stroke="#EF9F27" strokeWidth="1.5" letterSpacing="-3" paintOrder="stroke">S</text>
      <text x="35" y="54" fontFamily="'Bebas Neue', sans-serif" fontSize="54" fill="none" stroke="#EF9F27" strokeWidth="1.5" fontStyle="italic" letterSpacing="-3" paintOrder="stroke">X</text>
    </svg>
  )
}
 
// ── SIXXAB Wordmark ─────────────────────────────────────────────────────
function SixabWordmark({ size = 28, domainSize = 11, dark = false }) {
  const base = dark ? "#0A0E1A" : "#F5F5F0"
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", lineHeight: 1 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: size, color: base, letterSpacing: 2 }}>SIX</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: size * 1.18, color: "#EF9F27", fontStyle: "italic", letterSpacing: 1 }}>X</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: size, color: base, letterSpacing: 2 }}>AB</span>
      </div>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: domainSize, color: dark ? "#888780" : "#5F5E5A", letterSpacing: "0.18em" }}>startupsinabox.com</span>
    </div>
  )
}
 
export default function SixabLanding() {
  const [activeMsg, setActiveMsg] = useState(0)
  const [typed, setTyped] = useState("")
  const [selectedTier, setSelectedTier] = useState("pro")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [betaSubmitted, setBetaSubmitted] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const demoRef = useRef(null)
  const pricingRef = useRef(null)
 
  useEffect(() => {
    if (activeMsg >= DEMO_MSGS.length) return
    const msg = DEMO_MSGS[activeMsg]
    if (msg.role !== "ai") { const t = setTimeout(() => setActiveMsg(i => i + 1), 900); return () => clearTimeout(t) }
    let i = 0; setTyped("")
    const iv = setInterval(() => {
      setTyped(msg.text.slice(0, i + 1)); i++
      if (i >= msg.text.length) { clearInterval(iv); if (activeMsg < DEMO_MSGS.length - 1) setTimeout(() => setActiveMsg(a => a + 1), 1200) }
    }, 14)
    return () => clearInterval(iv)
  }, [activeMsg])
 
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])
 
  async function handleCheckout(tier) {
    // Check if user is logged in — if not, send to login/signup with plan context
    const storedUser = typeof window !== "undefined" && sessionStorage.getItem("sixxab_user")
    if (!storedUser) {
      window.location.href = `/login?redirect=/&plan=${tier.id}`
      return
    }
    setLoading(true); setSelectedTier(tier.id)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: tier.id }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Server error")
      window.location.href = data.url
    } catch (err) { alert("Checkout error: " + err.message) }
    finally { setLoading(false) }
  }
 
  const [betaError, setBetaError] = useState("")
  const [betaLoading, setBetaLoading] = useState(false)
 
  async function handleBeta(e) {
    e.preventDefault()
    if (!email || !email.includes("@")) { setBetaError("Enter a valid email address."); return }
    setBetaLoading(true); setBetaError("")
    try {
      const res = await fetch("/api/beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Something went wrong")
 
      // Surface Resend error directly on screen — remove once email is confirmed working
      if (data.debugInfo && !data.debugInfo.welcome?.ok) {
        const err = data.debugInfo.welcome?.resendError || "unknown error"
        const from = data.debugInfo.fromAddress || "?"
        const verified = data.debugInfo.domainVerified
        setBetaError(`Email failed — Resend error: "${err}" | Sending from: ${from} | Domain verified in Resend: ${verified}`)
        return
      }
      setBetaSubmitted(true)
    } catch (err) {
      setBetaError(err.message || "Could not sign up — please try again.")
    } finally {
      setBetaLoading(false)
    }
  }
 
  const scrollTo = ref => ref.current?.scrollIntoView({ behavior: "smooth" })
 
  const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0", INK = "#111520"
  const navBg = scrollY > 20 ? "rgba(10,14,26,0.96)" : "transparent"
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F7F8FA; color: #1A1A2E; line-height: 1.65; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: ${AMBER}; border-radius: 2px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        .fade1{animation:fadeUp .7s .05s both} .fade2{animation:fadeUp .7s .15s both} .fade3{animation:fadeUp .7s .25s both} .fade4{animation:fadeUp .7s .35s both}
        .cursor{display:inline-block;width:2px;height:13px;background:${AMBER};animation:blink .8s infinite;vertical-align:middle;margin-left:2px}
        .pulsedot{width:7px;height:7px;border-radius:50%;background:${AMBER};animation:pulse 2s infinite;display:inline-block}
        .tier-card{background:#fff;border:1.5px solid #E2E8F0;border-radius:16px;padding:28px 24px;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s}
        .tier-card:hover{transform:translateY(-4px);box-shadow:0 12px 36px rgba(0,0,0,.08)}
        .tier-card.feat{border-color:${AMBER};border-width:2px;background:#FFFBF2}
        .btn-amber{padding:13px 30px;border-radius:9px;background:${AMBER};color:${N};font-size:15px;font-weight:600;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:opacity .15s,transform .15s}
        .btn-amber:hover{opacity:.9;transform:translateY(-2px)}
        .btn-ghost{padding:13px 30px;border-radius:9px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:${CHALK};font-size:15px;font-weight:500;cursor:pointer;transition:background .2s}
        .btn-ghost:hover{background:rgba(255,255,255,.14)}
        .check-icon{width:18px;height:18px;border-radius:50%;background:#FEF3C7;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;margin-top:2px}
        .check-icon.feat{background:rgba(239,159,39,.15)}
        .testi-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:24px 20px}
        .step-card{background:#fff;border:1px solid #E8ECF4;border-radius:12px;padding:26px 22px;position:relative}
        .step-num{font-family:'Bebas Neue',sans-serif;font-size:52px;color:rgba(239,159,39,.1);position:absolute;top:12px;right:16px;line-height:1}
        .nav-link{font-size:13.5px;color:rgba(255,255,255,.65);text-decoration:none;cursor:pointer;transition:color .2s}
        .nav-link:hover{color:${CHALK}}
        @media(max-width:640px){.nav-links{display:none!important}}
      `}</style>
 
      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5%", height: 62, background: navBg, backdropFilter: scrollY > 20 ? "blur(14px)" : "none", transition: "background .3s", borderBottom: scrollY > 20 ? "0.5px solid rgba(255,255,255,.07)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SixabIcon size={30} />
          <SixabWordmark size={22} domainSize={10} />
        </div>
        <div className="nav-links" style={{ display: "flex", gap: 26, alignItems: "center" }}>
          <a className="nav-link" onClick={() => scrollTo(demoRef)}>Demo</a>
          <a className="nav-link" onClick={() => scrollTo(pricingRef)}>Pricing</a>
          <a className="nav-link" href="/coach">AI Coach</a>
          <a className="nav-link" href="/agents">Agents</a>
          <a className="nav-link" href="/discovery">Book a Call</a>
          <a className="nav-link" href="/contact">Contact</a>
          <button className="btn-amber" style={{ padding: "7px 18px", fontSize: 13 }} onClick={() => scrollTo(pricingRef)}>Get 50% off →</button>
        </div>
      </nav>
 
      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", background: N, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 5% 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 65% 50% at 50% 38%, rgba(239,159,39,.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(239,159,39,.15) 1px, transparent 1px)", backgroundSize: "34px 34px", opacity: .15, pointerEvents: "none" }} />
 
        <div className="fade1" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 20, border: "1px solid rgba(239,159,39,.3)", background: "rgba(239,159,39,.08)", fontSize: 12, fontWeight: 500, color: AMBER, marginBottom: 28 }}>
          <span className="pulsedot" /> Beta launch — 50% off founding members
        </div>
 
        <h1 className="fade2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 7vw, 88px)", color: CHALK, textAlign: "center", maxWidth: 820, marginBottom: 20, lineHeight: 1.05, letterSpacing: 2 }}>
          Your entire startup.<br />In one bo<span style={{ color: AMBER, fontStyle: "italic" }}>x</span>.
        </h1>
 
        <p className="fade3" style={{ fontSize: "clamp(15px, 2vw, 19px)", color: "rgba(245,245,240,.58)", textAlign: "center", maxWidth: 540, marginBottom: 38 }}>
          SIXXAB packs strategy, launch, marketing and sales into one AI — so any founder can go from idea to revenue in 48 hours.
        </p>
 
        <div className="fade3" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 60 }}>
          <button className="btn-amber" onClick={() => scrollTo(pricingRef)}>Start for $14.50 / mo →</button>
          <button className="btn-ghost" onClick={() => scrollTo(demoRef)}>See it live ↓</button>
        </div>
 
        {/* DEMO WINDOW */}
        <div className="fade4" ref={demoRef} style={{ width: "100%", maxWidth: 720 }}>
          <div style={{ background: "#1C2235", borderRadius: "14px 14px 0 0", padding: "10px 16px", display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(255,255,255,.07)", borderBottom: "none" }}>
            {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(255,255,255,.3)", marginLeft: 8 }}>startupsinabox.com/coach</span>
          </div>
          <div style={{ background: INK, border: "1px solid rgba(255,255,255,.07)", borderRadius: "0 0 14px 14px", padding: 20, minHeight: 300, display: "flex", flexDirection: "column", gap: 14 }}>
            {DEMO_MSGS.slice(0, activeMsg + 1).map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ width: 28, height: 28, borderRadius: msg.role === "ai" ? 8 : "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, marginTop: 2, background: msg.role === "ai" ? AMBER : "rgba(239,159,39,.15)", color: msg.role === "ai" ? N : AMBER }}>
                  {msg.role === "ai" ? "SX" : "You"}
                </div>
                <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", background: msg.role === "user" ? "rgba(239,159,39,.12)" : "rgba(255,255,255,.05)", border: `1px solid ${msg.role === "user" ? "rgba(239,159,39,.2)" : "rgba(255,255,255,.07)"}`, color: "rgba(245,245,240,.88)" }}>
                  {i === activeMsg && msg.role === "ai" ? typed : msg.text}
                  {i === activeMsg && msg.role === "ai" && typed.length < msg.text.length && <span className="cursor" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* PROOF STRIP */}
      <div style={{ background: INK, borderTop: "1px solid rgba(255,255,255,.05)", padding: "13px 5%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", fontSize: 13, color: "rgba(255,255,255,.45)" }}>
        {[["🎯", "Dallas-born"], ["247+", "founders inside"], ["2.3 days", "avg first revenue"], ["72", "Net Promoter Score"]].map(([val, lbl], i) => (
          <span key={i}>{i > 0 && <span style={{ margin: "0 8px", opacity: .3 }}>·</span>}<strong style={{ color: CHALK }}>{val}</strong> {lbl}</span>
        ))}
      </div>
 
      {/* HOW IT WORKS */}
      <section style={{ padding: "90px 5%", background: "#fff" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: AMBER, marginBottom: 10 }}>How it works</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 5vw, 52px)", color: N, marginBottom: 14, letterSpacing: 1.5 }}>Idea to revenue in 48 hours</h2>
          <p style={{ fontSize: 16, color: "#64748B", maxWidth: 500, margin: "0 auto" }}>No vague strategy. SIXXAB gives you numbered actions you execute today.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20, maxWidth: 960, margin: "0 auto" }}>
          {[
            { icon: "🎯", n: "01", title: "Pick your niche", body: "Use the 3-Filter Formula to find a painful, specific, reachable market in under 60 minutes." },
            { icon: "⚡", n: "02", title: "Build your MVP", body: "SIXXAB guides your 6-hour sprint: intake form + AI output + Stripe checkout. Ship it today." },
            { icon: "📣", n: "03", title: "Land first customers", body: "Get a personalised outreach script. DM 20 warm contacts. Convert the first 3 to paying users." },
            { icon: "📈", n: "04", title: "Scale to $10k MRR", body: "Weekly strategy sessions adapt to your real numbers. SIXXAB tells you exactly what to do next." },
          ].map(s => (
            <div key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF9EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16, border: "1px solid #FDE68A" }}>{s.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: N, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.65 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* PRICING */}
      <section ref={pricingRef} style={{ padding: "90px 5%", background: "#F7F8FA" }}>
        <div style={{ textAlign: "center", marginBottom: 46 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: AMBER, marginBottom: 10 }}>Pricing</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 5vw, 52px)", color: N, marginBottom: 12, letterSpacing: 1.5 }}>Pick your box</h2>
          <p style={{ fontSize: 16, color: "#64748B" }}>Beta launch — <strong>50% off</strong> for founding members. Locked forever.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, maxWidth: 980, margin: "0 auto" }}>
          {TIERS.map(tier => (
            <div key={tier.id} className={`tier-card ${tier.highlight ? "feat" : ""}`} style={{ position: "relative" }}>
              {tier.highlight && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: AMBER, color: N, fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 20, letterSpacing: ".06em", whiteSpace: "nowrap" }}>MOST POPULAR</div>}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#FEF9EE", color: "#92400E", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20, marginBottom: 14 }}>🔥 Beta — 50% off</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: N, marginBottom: 5, letterSpacing: 1 }}>{tier.name}</div>
              <div style={{ fontSize: 12.5, color: "#64748B", marginBottom: 18, minHeight: 36 }}>{tier.desc}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 16, color: "#94A3B8", textDecoration: "line-through" }}>${tier.price}</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 46, color: tier.highlight ? AMBER : N, letterSpacing: 1 }}>${tier.price === 29 ? "14.50" : tier.price === 49 ? "24.50" : "34.50"}</span>
                <span style={{ fontSize: 14, color: "#94A3B8" }}>/mo</span>
              </div>
              <div style={{ fontSize: 11, color: "#1D9E75", fontWeight: 600, marginBottom: 22 }}>↑ Founding rate — locked forever</div>
              <ul style={{ listStyle: "none", flex: 1, marginBottom: 26, display: "flex", flexDirection: "column", gap: 10 }}>
                {tier.features.map(f => (
                  <li key={f} style={{ display: "flex", gap: 8, fontSize: 13.5, color: N, alignItems: "flex-start" }}>
                    <span className={`check-icon ${tier.highlight ? "feat" : ""}`}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleCheckout(tier)} disabled={loading && selectedTier === tier.id}
                style={{ width: "100%", padding: 13, borderRadius: 9, fontSize: 15, fontWeight: 600, cursor: "pointer", border: "none", background: tier.highlight ? AMBER : "#F1F5F9", color: tier.highlight ? N : "#475569", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "opacity .15s,transform .15s", opacity: loading && selectedTier === tier.id ? .6 : 1 }}>
                {loading && selectedTier === tier.id ? "Opening checkout…" : tier.cta.replace('$29', '$14.50').replace('$49', '$24.50').replace('$69', '$34.50')}
              </button>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "#94A3B8" }}>
          🛡️ <strong style={{ color: "#475569" }}>14-day money-back guarantee</strong> — if SIXXAB doesn't help you make progress in 2 weeks, full refund. No questions.
        </p>
      </section>
 
      {/* TESTIMONIALS */}
      <section style={{ background: N, padding: "90px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 46 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: AMBER, marginBottom: 10 }}>Results</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 5vw, 52px)", color: CHALK, letterSpacing: 1.5 }}>What founders say</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18, maxWidth: 960, margin: "0 auto" }}>
          {PROOF.map(p => (
            <div key={p.name} className="testi-card">
              <div style={{ color: AMBER, fontSize: 14, letterSpacing: 2, marginBottom: 12 }}>★★★★★</div>
              <p style={{ fontSize: 14, color: "rgba(245,245,240,.78)", lineHeight: 1.7, marginBottom: 18, fontStyle: "italic" }}>"{p.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(239,159,39,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: AMBER }}>{p.name[0]}</div>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: CHALK }}>{p.name}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,.38)" }}>{p.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>
 
      {/* BETA CTA */}
      <section style={{ background: AMBER, padding: "72px 5%", textAlign: "center" }}>
        {/* Counter row */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(10,14,26,.12)", borderRadius: 20, padding: "6px 16px", marginBottom: 20 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: `rgba(10,14,26,${0.15 + i * 0.07})`, border: "2px solid rgba(10,14,26,.25)", marginLeft: i > 0 ? -10 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "rgba(10,14,26,.7)" }}>{["M","P","J","A","K"][i]}</div>
          ))}
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(10,14,26,.75)", marginLeft: 6 }}>247 founders already inside</span>
        </div>
 
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 5vw, 58px)", color: N, marginBottom: 10, letterSpacing: 1.5, lineHeight: 1.05 }}>
          Get 50% off.<br />Locked forever.
        </h2>
        <p style={{ fontSize: 16, color: "rgba(10,14,26,.65)", marginBottom: 32, maxWidth: 420, margin: "0 auto 32px" }}>
          Founding member rate: <strong style={{ color: N }}>$14.50 · $24.50 · $34.50/mo</strong><br />
          Your price never goes up — ever.
        </p>
 
        {betaSubmitted ? (
          <div style={{ background: "rgba(10,14,26,.1)", borderRadius: 14, padding: "20px 28px", display: "inline-block", maxWidth: 440 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
            <p style={{ fontSize: 17, fontWeight: 600, color: N, marginBottom: 6 }}>You're on the list!</p>
            <p style={{ fontSize: 14, color: "rgba(10,14,26,.65)", marginBottom: 16 }}>
              Check <strong>{email}</strong> — your 50% off code is on its way.
            </p>
            <button onClick={() => scrollTo(pricingRef)} style={{ padding: "12px 24px", borderRadius: 9, background: N, color: CHALK, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Pick your plan now →
            </button>
          </div>
        ) : (
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <form onSubmit={handleBeta} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => { setEmail(e.target.value); if (betaError) setBetaError("") }}
                required
                style={{ flex: 1, minWidth: 220, padding: "13px 16px", borderRadius: 9, border: betaError ? "2px solid rgba(220,38,38,.6)" : "2px solid transparent", fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(10,14,26,.1)", color: N, outline: "none", transition: "border .15s" }}
              />
              <button
                type="submit"
                disabled={betaLoading}
                style={{ padding: "13px 22px", borderRadius: 9, background: N, color: CHALK, fontSize: 14, fontWeight: 600, border: "none", cursor: betaLoading ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: betaLoading ? .65 : 1, whiteSpace: "nowrap" }}
              >
                {betaLoading ? "Sending…" : "Get 50% off →"}
              </button>
            </form>
            {betaError && (
              <p style={{ fontSize: 13, color: "rgba(153,27,27,.85)", fontWeight: 500, marginBottom: 8 }}>⚠ {betaError}</p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(10,14,26,.5)" }}>✓ No credit card required</span>
              <span style={{ fontSize: 12, color: "rgba(10,14,26,.5)" }}>✓ Cancel anytime</span>
              <span style={{ fontSize: 12, color: "rgba(10,14,26,.5)" }}>✓ Rate locked forever</span>
            </div>
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(10,14,26,.15)" }}>
              <p style={{ fontSize: 13, color: "rgba(10,14,26,.6)", marginBottom: 10 }}>Ready to start now? Pick a plan directly:</p>
              <button onClick={() => scrollTo(pricingRef)} style={{ padding: "11px 24px", borderRadius: 9, background: "rgba(10,14,26,.12)", color: N, fontSize: 13, fontWeight: 600, border: "1.5px solid rgba(10,14,26,.25)", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                See pricing →
              </button>
            </div>
          </div>
        )}
      </section>
 
      {/* FOOTER */}
      <footer style={{ background: INK, borderTop: "1px solid rgba(255,255,255,.06)", padding: "28px 5%", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SixabIcon size={24} />
          <SixabWordmark size={18} domainSize={9} />
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {[["Privacy","/privacy"],["Terms","/terms"],["Coach","/coach"],["Agents","/agents"],["Discovery","/discovery"],["Contact","/contact"]].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: "rgba(255,255,255,.35)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,.25)" }}>© 2025 SIXXAB · Startups In eXponential A Box · Dallas, TX</span>
      </footer>
    </>
  )
}