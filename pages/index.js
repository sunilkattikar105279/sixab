import { useState, useEffect, useRef } from "react"

// ── PRICING ─────────────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "starter", name: "Starter", price: 99, founding: 49.50,
    tagline: "Everything a solo founder needs to launch fast",
    highlight: false,
    features: [
      "AI strategy advisor — 50 sessions/month",
      "7-day launch sprint framework",
      "Niche selection with 3-Filter Formula",
      "Marketing agent — 20 DM scripts/month",
      "Strategy & Content agents",
      "Email support · Cancel anytime",
    ],
  },
  {
    id: "pro", name: "Pro", price: 199, founding: 99.50,
    tagline: "For founders moving fast and scaling exponentially",
    highlight: true, badge: "Most Popular",
    features: [
      "AI strategy advisor — unlimited sessions",
      "All 6 agents — marketing, sales, support, ops, content, strategy",
      "Full CXO command center (CEO · CMO · CFO · COO · CTO · CISO · CDO)",
      "Multi-channel outreach — LinkedIn, X, Instagram, WhatsApp, Email, SMS",
      "Revenue optimizer + live sales pipeline",
      "1 discovery call per month with Sunil",
      "Priority support — 4hr SLA",
    ],
  },
  {
    id: "agency", name: "Agency", price: 350, founding: 175,
    tagline: "Built for consultants managing multiple client businesses",
    highlight: false,
    features: [
      "Everything in Pro — unlimited",
      "5 team seats",
      "White-label AI coach persona",
      "HR + HR Ops agents",
      "API access",
      "Dedicated success manager",
      "Custom onboarding & setup call",
    ],
  },
]

// ── PLATFORM CAPABILITIES ────────────────────────────────────────────────────
const CAPS = [
  { icon: "🧠", title: "AI Strategy Advisor", desc: "Your 24/7 McKinsey-level advisor. Get a numbered action plan — not vague advice — in under 60 seconds.", tag: "Core" },
  { icon: "🚀", title: "48-Hour Launch Sprint", desc: "Proven 7-step framework. Idea on Monday, first revenue by Wednesday. Used by 247+ founders globally.", tag: "Launch" },
  { icon: "📣", title: "Multi-Channel Marketing", desc: "Personalised DM scripts for LinkedIn, Instagram, X, WhatsApp, Email and SMS. Tailored to each contact.", tag: "Marketing" },
  { icon: "📈", title: "Sales Pipeline", desc: "Visual pipeline from prospect to closed deal. Hot lead alerts, demo scripts and proposal templates.", tag: "Sales" },
  { icon: "👑", title: "CXO Command Center", desc: "CEO, CTO, CFO, COO, CISO, CDO and CMO advisors — each with dashboards, KPIs and AI chat.", tag: "Enterprise" },
  { icon: "🎧", title: "Support & Retention", desc: "Onboarding checklists, AI-drafted ticket replies and NPS tracking. Keep churn below 2%.", tag: "Support" },
  { icon: "👥", title: "HR & People Ops", desc: "Hiring pipeline, onboarding workflows, performance checklists. Build your team the right way.", tag: "Operations" },
  { icon: "📊", title: "Finance & Analytics", desc: "MRR tracking, Stripe reconciliation, LTV/CAC analysis and 90-day revenue forecasts.", tag: "Finance" },
]

// ── DEMO STEPS — visual, non-technical ──────────────────────────────────────
const DEMOS = [
  {
    id: 0, label: "Get your plan", icon: "🎯",
    heading: "Tell SIXXAB your idea — get a numbered action plan in 60 seconds",
    subhead: "No technical knowledge needed. Just describe your business in plain English.",
    visual: "chat",
    user: "I want to launch an AI tool for real estate agents in Dallas.",
    reply: [
      { icon: "🎯", title: "Your niche is strong", body: "47,000+ active agents in DFW. Most waste 3hrs/day on listing descriptions and client follow-ups. High pain = high willingness to pay." },
      { icon: "⚡", title: "Your 48-hour plan", body: "Build a listing description generator. Agent inputs address + 5 bullets → AI writes professional copy in 10 seconds. Price at $49/mo." },
      { icon: "📣", title: "How to get first sale", body: "DM 20 agents on LinkedIn today. Use the outreach script SIXXAB generates. Offer a free 7-day trial. Expect 4–6 replies, 1–2 paying customers." },
    ],
    prompts: ["Write my DM script", "Build my landing page", "What should I charge?"],
  },
  {
    id: 1, label: "Send outreach", icon: "📨",
    heading: "Personalised outreach scripts — ready to copy and send",
    subhead: "SIXXAB generates a tailored DM for every contact, on every platform, in one click.",
    visual: "cards",
    cards: [
      { platform: "LinkedIn", color: "#0A66C2", name: "Sarah Chen", role: "RE Agent · Dallas", time: "Best time: Tue 9am", msg: "Hi Sarah, I saw you specialise in DFW listings. I built a tool that writes professional listing descriptions in 10 seconds. Saves agents 45 min per property. Free trial this week — want access?" },
      { platform: "Email", color: "#EF9F27", name: "Tom Walsh", role: "RE Broker · 12 agents", time: "Best time: Mon 7am", msg: "Subject: Save your team 45 min per listing\n\nHi Tom, how much time does your team spend writing listing descriptions? I built a tool that does it in 10 seconds. Happy to set up a free trial for your whole office." },
      { platform: "WhatsApp", color: "#25D366", name: "Priya N.", role: "Luxury Specialist", time: "Best time: Weekday AM", msg: "Hi Priya! Built an AI listing tool for Dallas agents — saves ~45 mins per property. Would you try it free for a week? Takes 2 mins to set up 🏠" },
    ],
  },
  {
    id: 2, label: "Track your pipeline", icon: "📊",
    heading: "Your full sales pipeline — from first DM to closed customer",
    subhead: "See exactly where every lead is. Get AI-generated follow-up scripts for each stage.",
    visual: "pipeline",
    stages: [
      { label: "Outreach sent", count: 20, color: "#F1EFE8", txt: "#5F5E5A" },
      { label: "Replied", count: 7, color: "#FAEEDA", txt: "#633806" },
      { label: "Demo booked", count: 4, color: "#E6F1FB", txt: "#0C447C" },
      { label: "Closed ✓", count: 2, color: "#E1F5EE", txt: "#085041" },
    ],
    stats: [["First MRR","$98/mo"],["Days to first sale","2.3 days"],["Close rate","28%"],["Cost to acquire","$0"]],
  },
  {
    id: 3, label: "Your CXO advisors", icon: "🏢",
    heading: "7 CXO advisors — CEO to CMO — mapped to your real business data",
    subhead: "Each advisor has a dedicated dashboard, live KPIs and AI chat tuned to their exact role.",
    visual: "cxo",
    advisors: [
      { role: "CEO", icon: "👑", color: "#EF9F27", question: "How do I reach $10k MRR?", answer: "At $49/mo you need 204 customers. At your 28% close rate that's 728 DMs — 36 per day for 20 days. Start with your LinkedIn network first: agents, freelancers, local businesses." },
      { role: "CMO", icon: "📢", color: "#D4537E", question: "Best channel for DFW agents?", answer: "LinkedIn first — DFW agents are highly active Tuesday to Thursday. Target 500+ connection profiles. Message at 8–10am. Expected response rate: 18–22%." },
      { role: "CFO", icon: "📊", color: "#1D9E75", question: "What are my unit economics?", answer: "At $49/mo: CAC = $0 (organic), LTV = $588 (12mo avg), payback = immediate. You break even at 3 customers covering your $99.50 SIXXAB subscription." },
    ],
  },
]

// ── TESTIMONIALS ─────────────────────────────────────────────────────────────
const TESTI = [
  { name: "Marcus T.", role: "Solo founder, Dallas", avatar: "MT", quote: "Closed my first $2,400 client on Day 3. SIXXAB told me exactly what to say and who to call." },
  { name: "Priya S.", role: "Freelance consultant, India", avatar: "PS", quote: "Idea to landing page in 48 hours. The strategy sessions feel like a McKinsey advisor in my pocket." },
  { name: "Jason K.", role: "SaaS entrepreneur, UK", avatar: "JK", quote: "Hit $5k MRR in 6 weeks. The niche framework alone was worth 10× the subscription price." },
  { name: "Angela B.", role: "Marketing agency, Dallas", avatar: "AB", quote: "Signed 3 new clients in the first week using the outreach scripts. The ROI was immediate." },
  { name: "James P.", role: "E-commerce founder, Australia", avatar: "JP", quote: "The CXO command center is incredible. Having CFO, CMO and COO advisors in one platform changed how I think." },
  { name: "Ravi M.", role: "Tech founder, Singapore", avatar: "RM", quote: "From idea to first Stripe payment in 31 hours. The 48-hour sprint framework is genuinely magic." },
]

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

function SXLogo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/>
      <text x="7" y="54" fontFamily="Georgia,serif" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
      <text x="35" y="54" fontFamily="Georgia,serif" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
    </svg>
  )
}

export default function Index() {
  const [activeDemo, setActiveDemo] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState("")
  const [email, setEmail] = useState("")
  const [betaDone, setBetaDone] = useState(false)
  const [betaBusy, setBetaBusy] = useState(false)
  const [betaError, setBetaError] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const pricingRef = useRef(null)
  const demoRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveDemo(a => (a + 1) % DEMOS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const scrollTo = r => r.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  async function handleCheckout(tier) {
    const user = typeof window !== "undefined" && sessionStorage.getItem("sixxab_user")
    if (!user) { window.location.href = `/login?redirect=%2F&plan=${tier.id}`; return }
    setLoading(true); setSelectedTier(tier.id)
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tierId: tier.id }) })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || "Error")
      window.location.href = d.url
    } catch (e) { alert("Checkout error: " + e.message); setLoading(false) }
  }

  async function handleBeta(e) {
    e.preventDefault(); setBetaError("")
    if (!email || !email.includes("@")) { setBetaError("Enter a valid email."); return }
    setBetaBusy(true)
    try {
      const r = await fetch("/api/beta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "Try again.")
      setBetaDone(true)
    } catch (err) { setBetaError(err.message) }
    finally { setBetaBusy(false) }
  }

  const demo = DEMOS[activeDemo]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Plus Jakarta Sans',sans-serif;color:${N};overflow-x:hidden;background:#fff}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${AMBER};border-radius:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes slideIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes shimmer{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}
        .fu{animation:fadeUp .55s ease both}
        .d1{animation-delay:.05s}.d2{animation-delay:.15s}.d3{animation-delay:.25s}.d4{animation-delay:.35s}.d5{animation-delay:.45s}
        .pulse{animation:pulse 2s infinite}
        .slideIn{animation:slideIn .35s ease both}
        .btn-amber{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 28px;border-radius:11px;background:${AMBER};color:${N};font-size:15px;font-weight:700;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .18s;text-decoration:none}
        .btn-amber:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(239,159,39,.38)}
        .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:11px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:${CHALK};font-size:15px;font-weight:500;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .18s;text-decoration:none}
        .btn-ghost:hover{background:rgba(255,255,255,.15)}
        .nav-a{font-size:13px;color:rgba(255,255,255,.58);text-decoration:none;cursor:pointer;transition:color .15s}
        .nav-a:hover{color:#fff}
        .cap-card{background:#fff;border:1px solid #E8ECF4;border-radius:14px;padding:22px;transition:all .2s;cursor:default}
        .cap-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.07);border-color:#CBD5E1}
        .tier{background:#fff;border:1.5px solid #E8ECF4;border-radius:16px;padding:28px 22px;display:flex;flex-direction:column;transition:all .2s;position:relative}
        .tier:hover{transform:translateY(-4px);box-shadow:0 18px 44px rgba(0,0,0,.1)}
        .tier.pop{border:2px solid ${AMBER};background:#FFFBF2}
        .demo-btn{padding:9px 16px;border-radius:9px;border:1px solid #E2E8F0;background:#F8F9FA;color:#64748B;font-size:12.5px;font-weight:500;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .18s;display:flex;align-items:center;gap:6px;white-space:nowrap}
        .demo-btn.active{background:${N};border-color:${N};color:${CHALK}}
        .check{width:18px;height:18px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;margin-top:2px}
        .tcard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:22px}
        @media(max-width:900px){
          .grid2{grid-template-columns:1fr!important}
          .grid3{grid-template-columns:1fr!important}
          .grid4{grid-template-columns:1fr 1fr!important}
          .hide-mob{display:none!important}
        }
      `}</style>

      {/* ──────────── NAV ──────────── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:60,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5%",background:scrolled?"rgba(10,14,26,.95)":"transparent",backdropFilter:scrolled?"blur(18px)":"none",transition:"all .3s",borderBottom:scrolled?"1px solid rgba(255,255,255,.07)":"none"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:9,textDecoration:"none"}}>
          <SXLogo size={28}/>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:CHALK,letterSpacing:2,lineHeight:1}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:8,color:"#5F5E5A",letterSpacing:".14em"}}>startupsinabox.com</div>
          </div>
        </a>
        <div className="hide-mob" style={{display:"flex",gap:22,alignItems:"center"}}>
          {[["How it works","demo"],["Pricing","pricing"],["Agents","/agents",true],["Book a call","/discovery",true],["Contact","/contact",true]].map(([label,target,isLink])=>(
            isLink
              ? <a key={label} className="nav-a" href={target}>{label}</a>
              : <a key={label} className="nav-a" onClick={()=>target==="demo"?scrollTo(demoRef):scrollTo(pricingRef)} style={{cursor:"pointer"}}>{label}</a>
          ))}
          <button className="btn-amber" style={{padding:"8px 18px",fontSize:13}} onClick={()=>scrollTo(pricingRef)}>Get 50% off →</button>
        </div>
      </nav>

      {/* ──────────── HERO ──────────── */}
      <section style={{minHeight:"100vh",background:N,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"120px 5% 80px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(rgba(239,159,39,.13) 1px,transparent 1px)`,backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"35%",left:"50%",transform:"translate(-50%,-50%)",width:700,height:500,background:"radial-gradient(ellipse,rgba(239,159,39,.14) 0%,transparent 68%)",pointerEvents:"none"}}/>

        {/* Live badge */}
        <div className="fu d1" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"7px 18px",borderRadius:20,border:"1px solid rgba(239,159,39,.35)",background:"rgba(239,159,39,.1)",fontSize:13,fontWeight:500,color:AMBER,marginBottom:32}}>
          <span className="pulse" style={{width:7,height:7,borderRadius:"50%",background:AMBER,display:"inline-block"}}/>
          Live now · 247+ founders · Dallas, TX · Global
        </div>

        {/* Headline */}
        <h1 className="fu d2" style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(54px,9vw,110px)",color:CHALK,letterSpacing:1.5,lineHeight:.96,marginBottom:28,maxWidth:960}}>
          Your entire startup.<br/>
          <span style={{color:AMBER,WebkitTextStroke:"2px "+AMBER,WebkitTextFillColor:"transparent"}}>In one box.</span>
        </h1>

        {/* Sub */}
        <p className="fu d3" style={{fontSize:"clamp(16px,2.2vw,20px)",color:"rgba(245,245,240,.62)",maxWidth:600,lineHeight:1.75,marginBottom:44}}>
          SIXXAB is the AI-powered startup platform that gives any founder a complete business system — strategy, launch, marketing, sales, support and finance — from <strong style={{color:CHALK}}>idea to first revenue in 48 hours</strong>.
        </p>

        {/* CTAs */}
        <div className="fu d4" style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginBottom:56}}>
          <button className="btn-amber" onClick={()=>scrollTo(pricingRef)}>Start for $49.50 / mo →</button>
          <button className="btn-ghost" onClick={()=>scrollTo(demoRef)}>See how it works ↓</button>
          <a className="btn-ghost" href="/discovery" style={{borderColor:"rgba(239,159,39,.35)",color:AMBER}}>📅 Book a free call</a>
        </div>

        {/* Proof pills */}
        <div className="fu d5" style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          {[["247+","founders inside"],["2.3 days","avg first revenue"],["72","Net Promoter Score"],["$0","avg acquisition cost"],["7","AI agents included"]].map(([v,l],i)=>(
            <div key={i} style={{padding:"7px 16px",borderRadius:20,background:"rgba(255,255,255,.055)",border:"1px solid rgba(255,255,255,.1)",fontSize:13}}>
              <strong style={{color:CHALK}}>{v}</strong>&nbsp;<span style={{color:"rgba(245,245,240,.42)"}}>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── CITIES STRIP ──────────── */}
      <div style={{background:"#F8F9FA",borderTop:"1px solid #E8ECF4",borderBottom:"1px solid #E8ECF4",padding:"14px 5%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap",fontSize:13,color:"#64748B"}}>
          <span style={{fontWeight:600,color:N,marginRight:4}}>Founders from:</span>
          {["🇺🇸 Dallas","🇬🇧 London","🇮🇳 Mumbai","🇸🇬 Singapore","🇦🇺 Sydney","🇨🇦 Toronto","🇿🇦 Cape Town","🇦🇪 Dubai"].map((c,i)=>(
            <span key={i} style={{padding:"3px 12px",borderRadius:20,background:"#fff",border:"1px solid #E2E8F0",fontWeight:500,color:"#475569"}}>{c}</span>
          ))}
        </div>
      </div>

      {/* ──────────── HOW IT WORKS — VISUAL DEMO ──────────── */}
      <section ref={demoRef} style={{padding:"90px 5% 80px",background:"#fff"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>How SIXXAB works</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(32px,5vw,62px)",color:N,letterSpacing:1.5,lineHeight:1.05,marginBottom:14}}>
            Idea to revenue in 4 steps
          </h2>
          <p style={{fontSize:16,color:"#64748B",maxWidth:500,margin:"0 auto",lineHeight:1.7}}>
            No code required. No complex setup. Describe your business in plain English and follow the numbered plan.
          </p>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:32}}>
          {DEMOS.map((d,i)=>(
            <button key={i} className={`demo-btn ${activeDemo===i?"active":""}`} onClick={()=>setActiveDemo(i)}>
              {d.icon} {d.label}
            </button>
          ))}
        </div>

        {/* Screen */}
        <div style={{maxWidth:940,margin:"0 auto",borderRadius:20,overflow:"hidden",boxShadow:"0 28px 70px rgba(0,0,0,.2)",border:"1px solid rgba(255,255,255,.06)"}}>
          {/* Chrome bar */}
          <div style={{background:"#1A2035",padding:"11px 16px",display:"flex",alignItems:"center",gap:8}}>
            {["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{width:11,height:11,borderRadius:"50%",background:c}}/>)}
            <div style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:6,padding:"4px 12px",marginLeft:8,display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:"#1D9E75",display:"inline-block"}} className="pulse"/>
              <span style={{fontFamily:"'DM Mono'",fontSize:11,color:"rgba(255,255,255,.35)"}}>startupsinabox.com · {demo.label}</span>
            </div>
          </div>

          {/* Content */}
          <div style={{background:N,padding:"28px 28px 32px"}} key={activeDemo} className="slideIn">
            {/* Step header */}
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:"'DM Mono'",fontSize:11,color:AMBER,letterSpacing:".08em",marginBottom:6}}>STEP {activeDemo+1} OF {DEMOS.length}</div>
              <h3 style={{fontSize:"clamp(17px,2.5vw,22px)",fontWeight:600,color:CHALK,marginBottom:6,lineHeight:1.3}}>{demo.heading}</h3>
              <p style={{fontSize:13.5,color:"rgba(245,245,240,.5)",lineHeight:1.6}}>{demo.subhead}</p>
            </div>

            {/* VISUAL: Chat */}
            {demo.visual === "chat" && (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"flex",justifyContent:"flex-end"}}>
                  <div style={{maxWidth:"68%",background:"rgba(239,159,39,.15)",border:"1px solid rgba(239,159,39,.22)",borderRadius:"13px 13px 3px 13px",padding:"12px 16px",fontSize:14,color:"rgba(245,245,240,.88)",lineHeight:1.65}}>
                    {demo.user}
                  </div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <div style={{width:34,height:34,borderRadius:9,background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"'Bebas Neue'",fontSize:12,color:N,fontWeight:700}}>SX</div>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
                    {demo.reply.map((r,i)=>(
                      <div key={i} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:11,padding:"13px 15px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                          <span style={{fontSize:16}}>{r.icon}</span>
                          <span style={{fontSize:13,fontWeight:600,color:CHALK}}>{r.title}</span>
                        </div>
                        <p style={{fontSize:13.5,color:"rgba(245,245,240,.78)",lineHeight:1.65}}>{r.body}</p>
                      </div>
                    ))}
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      {demo.prompts.map((p,i)=>(
                        <div key={i} style={{padding:"7px 14px",borderRadius:20,background:"rgba(239,159,39,.12)",border:"1px solid rgba(239,159,39,.25)",fontSize:12.5,color:AMBER,cursor:"pointer"}}>{p}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VISUAL: Cards */}
            {demo.visual === "cards" && (
              <div>
                <div style={{fontSize:12,fontFamily:"'DM Mono'",color:"rgba(245,245,240,.4)",marginBottom:14}}>3 personalised scripts generated · ready to send</div>
                <div className="grid3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
                  {demo.cards.map((c,i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${c.color}44`,borderRadius:13,overflow:"hidden"}}>
                      <div style={{background:`${c.color}18`,borderBottom:`1px solid ${c.color}33`,padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div>
                          <div style={{fontSize:12.5,fontWeight:600,color:CHALK}}>{c.name}</div>
                          <div style={{fontSize:10.5,color:"rgba(245,245,240,.4)"}}>{c.role}</div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                          <span style={{fontSize:10,fontWeight:700,color:c.color,padding:"2px 8px",borderRadius:8,background:`${c.color}22`}}>{c.platform}</span>
                          <span style={{fontSize:9.5,color:"rgba(245,245,240,.3)"}}>{c.time}</span>
                        </div>
                      </div>
                      <div style={{padding:"12px 14px 8px",fontSize:12.5,color:"rgba(245,245,240,.75)",lineHeight:1.65,whiteSpace:"pre-wrap",minHeight:120}}>{c.msg}</div>
                      <div style={{display:"flex",gap:6,padding:"8px 14px 12px"}}>
                        <div style={{flex:1,padding:"6px 0",textAlign:"center",background:"rgba(255,255,255,.07)",borderRadius:7,fontSize:11,color:"rgba(245,245,240,.45)",cursor:"pointer"}}>Copy</div>
                        <div style={{flex:1,padding:"6px 0",textAlign:"center",background:c.color,borderRadius:7,fontSize:11,fontWeight:600,color:"#fff",cursor:"pointer"}}>Send</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VISUAL: Pipeline */}
            {demo.visual === "pipeline" && (
              <div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
                  {demo.stages.map((s,i)=>(
                    <div key={i} style={{background:s.color,borderRadius:12,padding:"16px 14px"}}>
                      <div style={{fontSize:10.5,fontWeight:700,color:s.txt,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>{s.label}</div>
                      <div style={{fontSize:32,fontWeight:700,color:s.txt,lineHeight:1}}>{s.count}</div>
                      <div style={{fontSize:11,color:s.txt,opacity:.65,marginTop:2}}>contacts</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"rgba(29,158,117,.12)",border:"1px solid rgba(29,158,117,.25)",borderRadius:12,padding:"18px 22px",display:"flex",gap:28,flexWrap:"wrap"}}>
                  {demo.stats.map(([label,val],i)=>(
                    <div key={i}>
                      <div style={{fontSize:11,color:"rgba(29,158,117,.65)",marginBottom:3}}>{label}</div>
                      <div style={{fontSize:22,fontWeight:700,color:"#1D9E75"}}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VISUAL: CXO */}
            {demo.visual === "cxo" && (
              <div className="grid3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
                {demo.advisors.map((a,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${a.color}33`,borderRadius:13,padding:"16px 15px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                      <div style={{width:36,height:36,borderRadius:9,background:`${a.color}22`,border:`1px solid ${a.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{a.icon}</div>
                      <div>
                        <div style={{fontFamily:"'Bebas Neue'",fontSize:15,color:CHALK,letterSpacing:1}}>{a.role} Advisor</div>
                        <div style={{fontSize:9.5,color:"rgba(245,245,240,.3)",textTransform:"uppercase",letterSpacing:".07em"}}>AI · Always on</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:a.color,fontWeight:600,marginBottom:8,lineHeight:1.4}}>Q: {a.question}</div>
                    <div style={{fontSize:12.5,color:"rgba(245,245,240,.73)",lineHeight:1.65}}>{a.answer}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step dots */}
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:20}}>
          {DEMOS.map((_,i)=>(
            <div key={i} onClick={()=>setActiveDemo(i)} style={{width:activeDemo===i?24:8,height:8,borderRadius:4,background:activeDemo===i?AMBER:"#E2E8F0",cursor:"pointer",transition:"all .25s"}}/>
          ))}
        </div>
      </section>

      {/* ──────────── PLATFORM CAPABILITIES ──────────── */}
      <section style={{padding:"90px 5% 80px",background:"#F8F9FA"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Everything included</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(32px,5vw,62px)",color:N,letterSpacing:1.5,marginBottom:14}}>8 systems. One subscription.</h2>
          <p style={{fontSize:16,color:"#64748B",maxWidth:500,margin:"0 auto",lineHeight:1.7}}>Most founders spend $2,796+/month on these tools separately. SIXXAB packs all of them into one AI-powered platform.</p>
        </div>
        <div className="grid4" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,maxWidth:1160,margin:"0 auto 48px"}}>
          {CAPS.map((c,i)=>(
            <div key={i} className="cap-card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <span style={{fontSize:26}}>{c.icon}</span>
                <span style={{fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:8,background:"#EEF2FF",color:"#3D52A0"}}>{c.tag}</span>
              </div>
              <h3 style={{fontSize:14.5,fontWeight:600,color:N,marginBottom:7,lineHeight:1.3}}>{c.title}</h3>
              <p style={{fontSize:12.5,color:"#64748B",lineHeight:1.65}}>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Value comparison */}
        <div style={{maxWidth:760,margin:"0 auto",background:N,borderRadius:18,padding:"28px 32px",display:"flex",gap:28,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:CHALK,letterSpacing:1,marginBottom:14}}>What this costs separately</div>
            {[["Strategy consultant","$2,000+"],["Marketing tools","$299+"],["Sales CRM","$149+"],["HR software","$199+"],["Analytics platform","$149+"]].map(([l,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"rgba(245,245,240,.5)",marginBottom:6}}>
                <span>{l}</span><span style={{color:"#EF4444",fontWeight:600}}>{v}</span>
              </div>
            ))}
            <div style={{borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:8,marginTop:4,display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700}}>
              <span style={{color:CHALK}}>Total per month</span><span style={{color:"#EF4444"}}>$2,796+</span>
            </div>
          </div>
          <div style={{textAlign:"center",background:AMBER,borderRadius:14,padding:"22px 28px",minWidth:168}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:N,letterSpacing:1,marginBottom:2}}>SIXXAB Pro</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:52,color:N,lineHeight:1,marginBottom:2}}>$99.50</div>
            <div style={{fontSize:12,color:"rgba(10,14,26,.6)",marginBottom:8}}>/month</div>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(10,14,26,.55)",textTransform:"uppercase",letterSpacing:".05em"}}>You save $2,696/mo</div>
          </div>
        </div>
      </section>

      {/* ──────────── PRICING ──────────── */}
      <section ref={pricingRef} style={{padding:"90px 5% 80px",background:"#fff"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Pricing</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(32px,5vw,62px)",color:N,letterSpacing:1.5,marginBottom:14}}>Pick your box</h2>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 20px",borderRadius:20,background:"#FFFBF2",border:"1.5px solid rgba(239,159,39,.4)",fontSize:14,fontWeight:500,color:"#633806"}}>
            🔥 Beta launch — <strong>50% off for founding members.</strong> Rate locked forever.
          </div>
        </div>

        <div className="grid3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,maxWidth:1060,margin:"0 auto"}}>
          {TIERS.map(tier=>(
            <div key={tier.id} className={`tier ${tier.highlight?"pop":""}`}>
              {tier.badge && <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:AMBER,color:N,fontSize:11,fontWeight:700,padding:"5px 16px",borderRadius:20,letterSpacing:".06em",whiteSpace:"nowrap",boxShadow:"0 4px 12px rgba(239,159,39,.35)"}}>{tier.badge}</div>}
              <div style={{marginBottom:18}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:N,letterSpacing:1,marginBottom:3}}>{tier.name}</div>
                <div style={{fontSize:13,color:"#64748B",lineHeight:1.5}}>{tier.tagline}</div>
              </div>

              {/* Price */}
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:3}}>
                  <span style={{fontSize:14,color:"#CBD5E1",textDecoration:"line-through"}}>${tier.price}/mo</span>
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:56,color:tier.highlight?AMBER:N,lineHeight:1,letterSpacing:1}}>${tier.founding}</span>
                  <span style={{fontSize:14,color:"#94A3B8"}}>/mo</span>
                </div>
                <div style={{fontSize:12,color:"#1D9E75",fontWeight:600,marginTop:3}}>
                  ↑ Founding rate · save ${(tier.price - tier.founding).toFixed(2)}/mo · locked forever
                </div>
              </div>

              {/* Features */}
              <ul style={{listStyle:"none",flex:1,marginBottom:24,display:"flex",flexDirection:"column",gap:9}}>
                {tier.features.map(f=>(
                  <li key={f} style={{display:"flex",gap:9,fontSize:13.5,color:N,alignItems:"flex-start"}}>
                    <span className="check" style={{background:tier.highlight?"rgba(239,159,39,.15)":"#F1F5F9",color:tier.highlight?AMBER:"#64748B"}}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button onClick={()=>handleCheckout(tier)}
                disabled={loading&&selectedTier===tier.id}
                style={{width:"100%",padding:14,borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",border:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all .18s",background:tier.highlight?AMBER:"#0A0E1A",color:tier.highlight?N:CHALK,opacity:loading&&selectedTier===tier.id?.6:1}}>
                {loading&&selectedTier===tier.id?"Opening checkout…":`Start for $${tier.founding}/mo →`}
              </button>
            </div>
          ))}
        </div>

        <p style={{textAlign:"center",marginTop:26,fontSize:14,color:"#94A3B8"}}>
          🛡️ <strong style={{color:"#475569"}}>14-day money-back guarantee</strong> — full refund if SIXXAB doesn't help you make progress. No questions asked.
        </p>
      </section>

      {/* ──────────── TESTIMONIALS ──────────── */}
      <section style={{padding:"90px 5% 80px",background:N}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Results</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(32px,5vw,62px)",color:CHALK,letterSpacing:1.5}}>What founders say</h2>
        </div>
        <div className="grid3" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,maxWidth:1060,margin:"0 auto"}}>
          {TESTI.map((t,i)=>(
            <div key={i} className="tcard">
              <div style={{color:AMBER,fontSize:13,letterSpacing:2,marginBottom:12}}>★★★★★</div>
              <p style={{fontSize:14,color:"rgba(245,245,240,.8)",lineHeight:1.75,marginBottom:18,fontStyle:"italic"}}>"{t.quote}"</p>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(239,159,39,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:13,color:AMBER}}>{t.avatar}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:CHALK}}>{t.name}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── DISCOVERY CALL ──────────── */}
      <section style={{padding:"80px 5%",background:"#F8F9FA"}}>
        <div style={{maxWidth:860,margin:"0 auto",background:N,borderRadius:20,padding:"48px 44px",display:"grid",gridTemplateColumns:"1fr auto",gap:36,alignItems:"center",flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:10}}>Free · 20 minutes · No pitch</div>
            <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(26px,4vw,46px)",color:CHALK,letterSpacing:1.5,lineHeight:1.1,marginBottom:14}}>Talk to Sunil directly.<br/>Get your launch plan.</h2>
            <p style={{fontSize:15,color:"rgba(245,245,240,.58)",lineHeight:1.7,maxWidth:400}}>20 minutes. Walk away with a personalised 48-hour plan specific to your idea. Pure strategy — no sales pitch.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,minWidth:190}}>
            <a href="/discovery" className="btn-amber" style={{justifyContent:"center"}}>📅 Book your free call</a>
            <a href="/contact" className="btn-ghost" style={{justifyContent:"center",fontSize:14}}>Send an inquiry</a>
          </div>
        </div>
      </section>

      {/* ──────────── BETA CTA ──────────── */}
      <section style={{padding:"80px 5%",background:AMBER,textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 16px",borderRadius:20,background:"rgba(10,14,26,.12)",marginBottom:20,fontSize:13,fontWeight:600,color:N}}>
          247 founders already inside
        </div>
        <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(32px,5vw,62px)",color:N,letterSpacing:1.5,lineHeight:1.05,marginBottom:10}}>Get 50% off. Locked forever.</h2>
        <p style={{fontSize:16,color:"rgba(10,14,26,.62)",marginBottom:32,maxWidth:400,margin:"0 auto 32px",lineHeight:1.65}}>
          Founding member rate: <strong style={{color:N}}>$49.50 · $99.50 · $175/mo</strong><br/>Your price never increases — ever.
        </p>

        {betaDone ? (
          <div style={{background:"rgba(10,14,26,.1)",borderRadius:14,padding:"20px 32px",display:"inline-block"}}>
            <p style={{fontSize:16,fontWeight:700,color:N,marginBottom:6}}>🎉 You're in!</p>
            <p style={{fontSize:14,color:"rgba(10,14,26,.65)",marginBottom:16}}>Check your inbox — 50% off details are on their way.</p>
            <button onClick={()=>scrollTo(pricingRef)} style={{padding:"11px 24px",borderRadius:9,background:N,color:CHALK,fontSize:14,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Pick your plan →</button>
          </div>
        ) : (
          <div style={{maxWidth:480,margin:"0 auto"}}>
            <form onSubmit={handleBeta} style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <input type="email" placeholder="Enter your email" value={email} onChange={e=>{setEmail(e.target.value);setBetaError("")}} required
                style={{flex:1,minWidth:200,padding:"13px 16px",borderRadius:9,border:betaError?"2px solid rgba(153,27,27,.5)":"2px solid transparent",fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",background:"rgba(10,14,26,.1)",color:N,outline:"none"}}/>
              <button type="submit" disabled={betaBusy}
                style={{padding:"13px 22px",borderRadius:9,background:N,color:CHALK,fontSize:14,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",opacity:betaBusy?.65:1,whiteSpace:"nowrap"}}>
                {betaBusy?"Sending…":"Get 50% off →"}
              </button>
            </form>
            {betaError && <p style={{fontSize:13,color:"rgba(120,20,20,.8)",fontWeight:500,marginBottom:8}}>⚠ {betaError}</p>}
            <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
              {["✓ No credit card required","✓ Cancel anytime","✓ Rate locked forever"].map((t,i)=><span key={i} style={{fontSize:12,color:"rgba(10,14,26,.48)"}}>{t}</span>)}
            </div>
            <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid rgba(10,14,26,.15)"}}>
              <button onClick={()=>scrollTo(pricingRef)} style={{padding:"10px 22px",borderRadius:9,background:"rgba(10,14,26,.1)",color:N,fontSize:13,fontWeight:600,border:"1.5px solid rgba(10,14,26,.2)",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>See pricing →</button>
            </div>
          </div>
        )}
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer style={{background:"#111520",padding:"32px 5%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:22}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <SXLogo size={22}/>
            <div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:CHALK,letterSpacing:2,lineHeight:1}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</div>
              <div style={{fontFamily:"'DM Mono'",fontSize:8,color:"#444",letterSpacing:".12em"}}>startupsinabox.com</div>
            </div>
          </div>
          <div style={{display:"flex",gap:18,flexWrap:"wrap"}}>
            {[["How it works","/#demo"],["Pricing","/#pricing"],["AI Coach","/coach"],["Agents","/agents"],["Discovery","/discovery"],["Contact","/contact"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h])=>(
              <a key={l} href={h} style={{fontSize:12,color:"rgba(255,255,255,.32)",textDecoration:"none"}}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,.22)"}}>© 2025 SIXXAB · Startups In eXponential A Box · Dallas, TX · Global</span>
          <span style={{fontSize:12,color:"rgba(255,255,255,.18)"}}>247+ founders · NPS 72 · 2.3 days avg first revenue</span>
        </div>
      </footer>
    </>
  )
}
