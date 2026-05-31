import Head from "next/head"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

export default function DiscoveryPage() {
  // ── SET YOUR CALENDLY LINK HERE ─────────────────────────────────────────
  // Go to calendly.com → create a 20-min event → copy the link
  // Example: https://calendly.com/sunil-kattikar
  const CALENDLY = "https://calendly.com/sunil-kattikar"
  // ────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>Book a Discovery Call — SIXXAB</title>
        <meta name="description" content="Book a free 20-minute discovery call with Sunil Kattikar, founder of SIXXAB. Walk away with a personalised 48-hour startup launch plan." />
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;min-height:100vh}
        a{text-decoration:none}
      `}</style>

      {/* Nav */}
      <nav style={{background:N,padding:"0 5%",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:10}}>
          <svg width="26" height="26" viewBox="0 0 72 72">
            <rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/>
            <text x="7" y="54" fontFamily="Georgia" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
            <text x="35" y="54" fontFamily="Georgia" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
          </svg>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:CHALK,letterSpacing:2,lineHeight:1}}>
              SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB
            </div>
            <div style={{fontFamily:"'DM Mono'",fontSize:8,color:"#5F5E5A",letterSpacing:".12em"}}>startupsinabox.com</div>
          </div>
        </a>
        <div style={{display:"flex",gap:20,alignItems:"center"}}>
          <a href="/" style={{fontSize:13,color:"rgba(255,255,255,.5)"}}>Home</a>
          <a href="/#pricing" style={{fontSize:13,color:"rgba(255,255,255,.5)"}}>Pricing</a>
          <a href="/contact" style={{fontSize:13,color:"rgba(255,255,255,.5)"}}>Contact</a>
          <a href="/login" style={{padding:"6px 16px",borderRadius:8,background:AMBER,color:N,fontSize:13,fontWeight:600}}>Get started</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{background:N,padding:"48px 5% 40px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,border:"1px solid rgba(239,159,39,.3)",background:"rgba(239,159,39,.08)",fontSize:12,fontWeight:500,color:AMBER,marginBottom:18}}>
          📅 Free · 20 minutes · No sales pitch
        </div>
        <h1 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(36px,6vw,60px)",color:CHALK,letterSpacing:1.5,lineHeight:1.05,marginBottom:12}}>
          Book your free discovery call
        </h1>
        <p style={{fontSize:16,color:"rgba(245,245,240,.6)",maxWidth:500,margin:"0 auto 20px",lineHeight:1.7}}>
          20 minutes with <strong style={{color:CHALK}}>Sunil Kattikar</strong>, SIXXAB founder. Walk away with a personalised 48-hour action plan for your business — completely free.
        </p>
        <div style={{display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap",fontSize:13,color:"rgba(245,245,240,.45)"}}>
          <span>✓ Personalised for your business</span>
          <span>✓ Dallas + global founders welcome</span>
          <span>✓ Pure strategy — no pitch</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"36px 20px 80px",display:"grid",gridTemplateColumns:"1fr 300px",gap:24,alignItems:"start"}}>

        {/* Calendly embed — full iframe */}
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #E2E8F0",overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}>
          {/* Card header */}
          <div style={{padding:"16px 20px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:15,color:N,fontWeight:700,flexShrink:0}}>SK</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:N}}>Sunil Kattikar · SIXXAB</div>
              <div style={{fontSize:12,color:"#64748B"}}>Discovery Call · 20 min · Google Meet · Free</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#1D9E75",fontWeight:500}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#1D9E75"}}/>
              Available this week
            </div>
          </div>

          {/* Calendly iframe */}
          <iframe
            src={CALENDLY}
            width="100%"
            height="700"
            frameBorder="0"
            scrolling="no"
            title="Book a discovery call"
            style={{display:"block",border:"none",minHeight:700}}
          />
        </div>

        {/* Sidebar */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* What we cover */}
          <div style={{background:N,borderRadius:14,padding:20}}>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(245,245,240,.45)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>What we'll cover</div>
            {[
              {n:"1",t:"Your business idea",d:"Pressure-tested in 3 minutes"},
              {n:"2",t:"Your target customer",d:"3-Filter niche selection"},
              {n:"3",t:"Your 48-hour plan",d:"Numbered steps, start today"},
              {n:"4",t:"How SIXXAB fits",d:"Only if it's right for you"},
            ].map((x,i) => (
              <div key={i} style={{display:"flex",gap:10,marginBottom:12}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:AMBER,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:N,flexShrink:0}}>{x.n}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:CHALK,marginBottom:2}}>{x.t}</div>
                  <div style={{fontSize:11,color:"rgba(245,245,240,.4)"}}>{x.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{background:"#fff",borderRadius:14,border:"1px solid #E2E8F0",padding:16}}>
            <div style={{color:AMBER,fontSize:13,marginBottom:8}}>★★★★★</div>
            <p style={{fontSize:13,color:"#64748B",lineHeight:1.7,fontStyle:"italic",marginBottom:10}}>
              "The 20-min call with Sunil gave me more clarity than 6 months of planning. I launched 3 days later."
            </p>
            <div style={{fontSize:12,fontWeight:600,color:N}}>Marcus T. · Solo founder, Dallas</div>
          </div>

          {/* What you'll leave with */}
          <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:14,padding:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"#166534",marginBottom:10}}>🎯 You'll walk away with</div>
            {[
              "A clear niche to target this week",
              "48-hour action plan, numbered steps",
              "Honest advice — we don't hard sell",
              "Sunil's email for follow-up questions",
            ].map((t,i) => (
              <div key={i} style={{fontSize:12,color:"#166534",marginBottom:6,display:"flex",gap:7}}>
                <span style={{flexShrink:0}}>✓</span>{t}
              </div>
            ))}
          </div>

          {/* Alternative contact */}
          <div style={{background:"#fff",borderRadius:14,border:"1px solid #E2E8F0",padding:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"#64748B",marginBottom:10}}>Can't find a time?</div>
            <a href="mailto:hello@startupsinabox.com?subject=Discovery call request"
              style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:9,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:13,fontWeight:500,color:N,marginBottom:8}}>
              <span>📧</span> Email Sunil directly
            </a>
            <a href="/contact"
              style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:9,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:13,fontWeight:500,color:N}}>
              <span>💬</span> Send an inquiry
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{background:"#111520",borderTop:"1px solid rgba(255,255,255,.06)",padding:"18px 5%",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <svg width="18" height="18" viewBox="0 0 72 72">
            <rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/>
            <text x="7" y="54" fontFamily="Georgia" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text>
            <text x="35" y="54" fontFamily="Georgia" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
          </svg>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:14,color:CHALK,letterSpacing:2}}>SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB</span>
        </div>
        <div style={{display:"flex",gap:16}}>
          {[["Home","/"],["Contact","/contact"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h]) => (
            <a key={l} href={h} style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>{l}</a>
          ))}
        </div>
        <span style={{fontSize:12,color:"rgba(255,255,255,.25)"}}>© 2025 SIXXAB · Dallas, TX</span>
      </footer>
    </>
  )
}