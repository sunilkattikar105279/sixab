// pages/api/website-export.js
// Converts content JSON into a standalone HTML file using the chosen template
export const config = { api: { bodyParser: { sizeLimit: "2mb" } } }

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { content, template = "corporate" } = req.body ?? {}
  if (!content) return res.status(400).json({ error: "content required" })

  const c = content
  const accent = c.accentColor || "#2563EB"
  const name   = c.businessName || "Business"
  const phone  = (c.phone || "").replace(/\D/g, "")

  // Template color schemes
  const THEMES = {
    corporate: { primary:"#0f1b2d", secondary:"#1e3a5f", accent:"#0ea5e9", light:"#f0f7ff", text:"#1e293b" },
    bold:      { primary:"#09090b", secondary:"#18181b", accent:c.accentColor||"#f97316", light:"#fff7ed", text:"#1c1917" },
    elegant:   { primary:"#1c1917", secondary:"#292524", accent:"#d4af37", light:"#fafaf9", text:"#1c1917" },
    fresh:     { primary:"#052e16", secondary:"#14532d", accent:"#16a34a", light:"#f0fdf4", text:"#14532d" },
    vibrant:   { primary:"#1e1b4b", secondary:"#312e81", accent:"#7c3aed", light:"#f5f3ff", text:"#1e1b4b" },
  }
  const T = THEMES[template] || THEMES.corporate

  const services = c.services || []
  const testimonials = c.testimonials || []
  const process = c.process || []
  const whyUs = c.whyUs || []
  const navLinks = c.navLinks || ["Services","About","Process","Testimonials","Contact"]

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} | ${c.tagline||""}</title>
<meta name="description" content="${c.heroSubheadline||""}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
/* ── Reset ── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;font-size:16px}
body{font-family:'Inter',system-ui,sans-serif;background:#ffffff;color:${T.text};line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:'Plus Jakarta Sans',sans-serif;line-height:1.15;letter-spacing:-0.02em}
a{text-decoration:none;color:inherit}
img{max-width:100%;display:block}
button,input,textarea,select{font-family:inherit}

/* ── Variables ── */
:root{
  --primary:${T.primary};
  --secondary:${T.secondary};
  --accent:${T.accent};
  --light:${T.light};
  --text:${T.text};
  --white:#ffffff;
  --gray:#64748b;
  --border:#e2e8f0;
  --radius:12px;
  --shadow:0 4px 24px rgba(0,0,0,0.08);
}

/* ── Layout ── */
.container{max-width:1180px;margin:0 auto;padding:0 24px}
section{padding:96px 0}
.section-label{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px}
.section-title{font-size:clamp(28px,4vw,44px);font-weight:800;margin-bottom:16px}
.section-sub{font-size:17px;color:var(--gray);max-width:560px;line-height:1.7}

/* ── Navigation ── */
#nav{position:fixed;top:0;left:0;right:0;z-index:1000;padding:0 32px;height:68px;display:flex;align-items:center;justify-content:space-between;transition:background .3s,box-shadow .3s;background:rgba(${parseInt(T.primary.slice(1,3),16)},${parseInt(T.primary.slice(3,5),16)},${parseInt(T.primary.slice(5,7),16)},0.95);backdrop-filter:blur(12px)}
#nav.scrolled{background:var(--white);box-shadow:0 1px 0 var(--border)}
#nav.scrolled .nav-logo{color:var(--primary)}
#nav.scrolled .nav-link{color:var(--text)}
#nav.scrolled .nav-link:hover{color:var(--accent)}
.nav-logo{font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:800;color:var(--white);letter-spacing:-0.02em}
.nav-logo span{color:var(--accent)}
.nav-links{display:flex;align-items:center;gap:32px}
.nav-link{font-size:14px;font-weight:500;color:rgba(255,255,255,0.8);transition:color .15s}
.nav-link:hover{color:var(--white)}
.nav-cta{background:var(--accent);color:var(--white)!important;padding:9px 22px;border-radius:8px;font-size:14px;font-weight:600;transition:opacity .15s}
.nav-cta:hover{opacity:.88}
.nav-mobile-btn{display:none;background:none;border:none;cursor:pointer;color:var(--white);font-size:22px;padding:4px}
#nav.scrolled .nav-mobile-btn{color:var(--text)}
.nav-mobile-menu{display:none;position:fixed;top:68px;left:0;right:0;background:var(--white);padding:24px;box-shadow:0 8px 32px rgba(0,0,0,.12);z-index:999;flex-direction:column;gap:16px}
.nav-mobile-menu.open{display:flex}
.nav-mobile-link{font-size:15px;font-weight:500;color:var(--text);padding:8px 0;border-bottom:1px solid var(--border)}

/* ── Hero ── */
#hero{min-height:100vh;background:linear-gradient(135deg,var(--primary) 0%,var(--secondary) 60%,${T.accent}44 100%);display:flex;align-items:center;padding:100px 0 60px;position:relative;overflow:hidden}
#hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}
.hero-content{position:relative;z-index:1}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:100px;padding:6px 16px;font-size:13px;font-weight:500;color:rgba(255,255,255,0.9);margin-bottom:28px;backdrop-filter:blur(8px)}
.hero-badge::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--accent);flex-shrink:0}
.hero-h1{font-size:clamp(38px,6vw,76px);font-weight:800;color:#ffffff;line-height:1.05;margin-bottom:22px;letter-spacing:-0.03em}
.hero-h1 em{color:var(--accent);font-style:normal}
.hero-sub{font-size:clamp(16px,2vw,20px);color:rgba(255,255,255,0.75);margin-bottom:36px;max-width:560px;line-height:1.7}
.hero-buttons{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:64px}
.btn-primary{background:var(--accent);color:#ffffff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;transition:all .15s;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.25)}
.btn-secondary{background:rgba(255,255,255,0.1);color:#ffffff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;border:1.5px solid rgba(255,255,255,0.25);transition:all .15s;cursor:pointer;backdrop-filter:blur(8px)}
.btn-secondary:hover{background:rgba(255,255,255,0.18)}
.hero-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;max-width:480px}
.stat-card{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);padding:20px 16px;text-align:center;backdrop-filter:blur(8px)}
.stat-card:first-child{border-radius:12px 0 0 12px}
.stat-card:last-child{border-radius:0 12px 12px 0}
.stat-num{font-family:'Plus Jakarta Sans',sans-serif;font-size:28px;font-weight:800;color:#ffffff;display:block;line-height:1}
.stat-label{font-size:12px;color:rgba(255,255,255,0.55);margin-top:4px;font-weight:500;letter-spacing:.02em}

/* ── Services ── */
#services{background:#ffffff}
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:52px}
.service-card{background:#ffffff;border:1.5px solid var(--border);border-radius:var(--radius);padding:28px;transition:all .2s;position:relative;overflow:hidden}
.service-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--accent)08,transparent);opacity:0;transition:opacity .2s}
.service-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.1);border-color:var(--accent)}
.service-card:hover::before{opacity:1}
.service-icon{font-size:32px;margin-bottom:16px;display:block}
.service-title{font-size:17px;font-weight:700;color:var(--text);margin-bottom:8px}
.service-desc{font-size:14px;color:var(--gray);line-height:1.65}

/* ── Why Us ── */
#why{background:var(--primary)}
#why .section-label{color:var(--accent)}
#why .section-title{color:#ffffff}
#why .section-sub{color:rgba(255,255,255,0.6)}
.why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:52px}
.why-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius);padding:32px;transition:border-color .2s}
.why-card:hover{border-color:var(--accent)}
.why-icon{font-size:28px;margin-bottom:12px}
.why-stat{font-family:'Plus Jakarta Sans',sans-serif;font-size:40px;font-weight:800;color:var(--accent);line-height:1;margin-bottom:8px}
.why-title{font-size:16px;font-weight:700;color:#ffffff;margin-bottom:8px}
.why-desc{font-size:14px;color:rgba(255,255,255,0.55);line-height:1.6}

/* ── Testimonials ── */
#testimonials{background:var(--light)}
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:52px}
.testi-card{background:#ffffff;border:1px solid var(--border);border-radius:var(--radius);padding:28px;transition:box-shadow .2s}
.testi-card:hover{box-shadow:var(--shadow)}
.testi-stars{color:#f59e0b;font-size:15px;margin-bottom:14px;letter-spacing:2px}
.testi-quote{font-size:15px;color:var(--text);line-height:1.7;margin-bottom:20px;font-style:italic}
.testi-author{display:flex;align-items:center;gap:12px}
.testi-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--secondary));color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
.testi-name{font-size:14px;font-weight:700;color:var(--text)}
.testi-role{font-size:12px;color:var(--gray)}

/* ── Process ── */
#process{background:#ffffff}
.process-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:52px;position:relative}
.process-grid::before{content:'';position:absolute;top:40px;left:12.5%;right:12.5%;height:2px;background:linear-gradient(90deg,var(--accent),var(--secondary));z-index:0}
.process-step{text-align:center;padding:0 16px;position:relative;z-index:1}
.step-num{width:56px;height:56px;border-radius:50%;background:var(--accent);color:#ffffff;font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 0 0 8px var(--light)}
.step-title{font-size:16px;font-weight:700;color:var(--text);margin-bottom:8px}
.step-desc{font-size:13.5px;color:var(--gray);line-height:1.6}

/* ── Pricing ── */
#pricing{background:var(--light)}
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:52px}
.price-card{background:#ffffff;border:1.5px solid var(--border);border-radius:var(--radius);padding:32px;transition:all .2s;position:relative}
.price-card.featured{border-color:var(--accent);box-shadow:0 0 0 4px ${T.accent}18}
.price-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--accent);color:#ffffff;font-size:11px;font-weight:700;padding:4px 16px;border-radius:100px;white-space:nowrap;letter-spacing:.06em;text-transform:uppercase}
.price-name{font-size:16px;font-weight:700;color:var(--text);margin-bottom:4px}
.price-desc{font-size:13px;color:var(--gray);margin-bottom:24px}
.price-amount{display:flex;align-items:baseline;gap:4px;margin-bottom:28px}
.price-dollar{font-family:'Plus Jakarta Sans',sans-serif;font-size:42px;font-weight:800;color:var(--text);line-height:1}
.price-per{font-size:14px;color:var(--gray)}
.price-features{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
.price-features li{display:flex;align-items:center;gap:9px;font-size:14px;color:var(--text)}
.price-features li::before{content:'✓';color:var(--accent);font-weight:700;flex-shrink:0}
.price-btn{width:100%;padding:12px;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer;border:none;transition:all .15s}
.price-btn-primary{background:var(--accent);color:#ffffff}
.price-btn-secondary{background:transparent;border:1.5px solid var(--border);color:var(--text)}
.price-btn:hover{transform:translateY(-1px)}

/* ── Contact ── */
#contact{background:var(--primary)}
#contact .section-label{color:var(--accent)}
#contact .section-title{color:#ffffff}
#contact .section-sub{color:rgba(255,255,255,0.6)}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:52px}
.contact-info{color:rgba(255,255,255,0.8)}
.contact-info-item{display:flex;align-items:flex-start;gap:14px;margin-bottom:28px}
.contact-info-icon{width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.contact-info-label{font-size:12px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}
.contact-info-value{font-size:15px;color:#ffffff;font-weight:500}
.contact-form{display:flex;flex-direction:column;gap:14px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form-field{display:flex;flex-direction:column;gap:6px}
.form-field label{font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:.05em;text-transform:uppercase}
.form-field input,.form-field textarea,.form-field select{background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.12);border-radius:8px;padding:11px 14px;font-size:14px;color:#ffffff;font-family:inherit;outline:none;transition:border .15s}
.form-field input::placeholder,.form-field textarea::placeholder{color:rgba(255,255,255,0.3)}
.form-field input:focus,.form-field textarea:focus{border-color:var(--accent)}
.form-field textarea{resize:vertical;min-height:110px}
.form-submit{background:var(--accent);color:#ffffff;border:none;border-radius:10px;padding:14px 28px;font-size:15px;font-weight:700;cursor:pointer;transition:all .15s;width:100%;margin-top:4px}
.form-submit:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.25)}

/* ── Footer ── */
footer{background:#050810;padding:56px 0 28px;color:rgba(255,255,255,0.5)}
.footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px}
.footer-brand .footer-logo{font-family:'Plus Jakarta Sans',sans-serif;font-size:20px;font-weight:800;color:#ffffff;margin-bottom:12px}
.footer-brand .footer-logo span{color:var(--accent)}
.footer-brand p{font-size:14px;line-height:1.7;max-width:260px}
.footer-col-title{font-size:12px;font-weight:700;color:#ffffff;letter-spacing:.1em;text-transform:uppercase;margin-bottom:16px}
.footer-link{display:block;font-size:14px;color:rgba(255,255,255,0.45);padding:4px 0;transition:color .14s}
.footer-link:hover{color:#ffffff}
.footer-bottom{border-top:1px solid rgba(255,255,255,0.07);padding-top:24px;display:flex;justify-content:space-between;align-items:center;font-size:13px;flex-wrap:wrap;gap:8px}

/* ── WhatsApp ── */
.wa-btn{position:fixed;bottom:24px;right:24px;width:52px;height:52px;border-radius:50%;background:#25D366;color:#ffffff;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 4px 16px rgba(37,211,102,0.4);z-index:998;transition:transform .2s}
.wa-btn:hover{transform:scale(1.08)}

/* ── Responsive ── */
@media(max-width:1024px){
  .services-grid,.why-grid,.testi-grid,.pricing-grid{grid-template-columns:repeat(2,1fr)}
  .process-grid{grid-template-columns:repeat(2,1fr)}
  .process-grid::before{display:none}
  .footer-grid{grid-template-columns:1fr 1fr}
  .contact-grid{grid-template-columns:1fr}
}
@media(max-width:768px){
  section{padding:64px 0}
  .services-grid,.why-grid,.testi-grid,.pricing-grid,.process-grid,.footer-grid{grid-template-columns:1fr}
  .nav-links{display:none}
  .nav-mobile-btn{display:block}
  .hero-stats{grid-template-columns:1fr;gap:0}
  .stat-card:first-child{border-radius:12px 12px 0 0}
  .stat-card:last-child{border-radius:0 0 12px 12px}
  .form-row{grid-template-columns:1fr}
  .hero-h1{font-size:36px}
  .stat-num{font-size:22px}
  .footer-bottom{flex-direction:column;text-align:center}
}
</style>
</head>
<body>

<!-- Navigation -->
<nav id="nav">
  <a href="#" class="nav-logo">${name.split(" ").slice(0,-1).join(" ")} <span>${name.split(" ").slice(-1)}</span></a>
  <div class="nav-links">
    ${navLinks.slice(0,4).map(l=>`<a href="#${l.toLowerCase().replace(/\s+/g,"-")}" class="nav-link">${l}</a>`).join("")}
    <a href="#contact" class="nav-link nav-cta">${navLinks[4]||"Get Started"}</a>
  </div>
  <button class="nav-mobile-btn" onclick="toggleMenu()" aria-label="Menu">☰</button>
</nav>
<div class="nav-mobile-menu" id="mobileMenu">
  ${navLinks.map(l=>`<a href="#${l.toLowerCase().replace(/\s+/g,"-")}" class="nav-mobile-link" onclick="toggleMenu()">${l}</a>`).join("")}
  <a href="#contact" onclick="toggleMenu()" style="background:var(--accent);color:#fff;padding:12px 20px;border-radius:9px;font-weight:700;text-align:center">Get Free Consultation</a>
</div>

<!-- Hero -->
<section id="hero">
  <div class="container">
    <div class="hero-content">
      <div class="hero-badge">🚀 ${c.tagline||"Professional Excellence"}</div>
      <h1 class="hero-h1">${c.heroHeadline||name}</h1>
      <p class="hero-sub">${c.heroSubheadline||""}</p>
      <div class="hero-buttons">
        <a href="#contact" class="btn-primary">${c.heroCTA1||"Get Started"} →</a>
        <a href="#services" class="btn-secondary">${c.heroCTA2||"Learn More"}</a>
      </div>
      <div class="hero-stats">
        ${(c.heroStats||[]).map(s=>`
        <div class="stat-card">
          <span class="stat-num" data-target="${s.number}">${s.number}</span>
          <div class="stat-label">${s.label}</div>
        </div>`).join("")}
      </div>
    </div>
  </div>
</section>

<!-- Services -->
<section id="services">
  <div class="container">
    <div class="section-label" style="color:var(--accent)">What We Offer</div>
    <h2 class="section-title">Our Services</h2>
    <p class="section-sub">Comprehensive solutions tailored to your business needs and growth objectives.</p>
    <div class="services-grid">
      ${services.map(s=>`
      <div class="service-card">
        <span class="service-icon">${s.icon}</span>
        <div class="service-title">${s.title}</div>
        <div class="service-desc">${s.description}</div>
      </div>`).join("")}
    </div>
  </div>
</section>

<!-- Why Us -->
<section id="why">
  <div class="container">
    <div class="section-label">Why Choose Us</div>
    <h2 class="section-title">The ${name} Difference</h2>
    <p class="section-sub">Proven results backed by years of expertise and client success stories.</p>
    <div class="why-grid">
      ${whyUs.map(w=>`
      <div class="why-card">
        <div class="why-icon">${w.icon}</div>
        <div class="why-stat">${w.stat}</div>
        <div class="why-title">${w.title}</div>
        <div class="why-desc">${w.description}</div>
      </div>`).join("")}
    </div>
  </div>
</section>

<!-- Testimonials -->
<section id="testimonials">
  <div class="container">
    <div class="section-label" style="color:var(--accent)">Client Stories</div>
    <h2 class="section-title">What Our Clients Say</h2>
    <p class="section-sub">Real results from real businesses. See why clients trust us.</p>
    <div class="testi-grid">
      ${testimonials.map(t=>`
      <div class="testi-card">
        <div class="testi-stars">★★★★★</div>
        <div class="testi-quote">"${t.quote}"</div>
        <div class="testi-author">
          <div class="testi-avatar">${t.initials||t.name.slice(0,2)}</div>
          <div>
            <div class="testi-name">${t.name}</div>
            <div class="testi-role">${t.role}${t.company?", "+t.company:""}</div>
          </div>
        </div>
      </div>`).join("")}
    </div>
  </div>
</section>

<!-- Process -->
<section id="process">
  <div class="container">
    <div class="section-label" style="color:var(--accent)">How It Works</div>
    <h2 class="section-title">Our Process</h2>
    <p class="section-sub">A streamlined approach that gets you results quickly and efficiently.</p>
    <div class="process-grid">
      ${process.map(p=>`
      <div class="process-step">
        <div class="step-num">${p.step}</div>
        <div class="step-title">${p.title}</div>
        <div class="step-desc">${p.description}</div>
      </div>`).join("")}
    </div>
  </div>
</section>

<!-- Contact -->
<section id="contact">
  <div class="container">
    <div class="section-label">Get In Touch</div>
    <h2 class="section-title">Let's Work Together</h2>
    <p class="section-sub">Ready to transform your business? Get in touch and we'll respond within 24 hours.</p>
    <div class="contact-grid">
      <div class="contact-info">
        ${c.phone?`<div class="contact-info-item"><div class="contact-info-icon">📞</div><div><div class="contact-info-label">Phone</div><div class="contact-info-value">${c.phone}</div></div></div>`:""}
        ${c.email?`<div class="contact-info-item"><div class="contact-info-icon">✉️</div><div><div class="contact-info-label">Email</div><div class="contact-info-value">${c.email}</div></div></div>`:""}
        ${c.address?`<div class="contact-info-item"><div class="contact-info-icon">📍</div><div><div class="contact-info-label">Location</div><div class="contact-info-value">${c.address}</div></div></div>`:""}
        <div class="contact-info-item"><div class="contact-info-icon">⏰</div><div><div class="contact-info-label">Hours</div><div class="contact-info-value">Mon–Fri: 9AM – 6PM</div></div></div>
      </div>
      <form class="contact-form" action="https://formspree.io/f/placeholder" method="POST">
        <div class="form-row">
          <div class="form-field"><label>First Name</label><input name="first_name" type="text" placeholder="John" required></div>
          <div class="form-field"><label>Last Name</label><input name="last_name" type="text" placeholder="Smith"></div>
        </div>
        <div class="form-row">
          <div class="form-field"><label>Email</label><input name="email" type="email" placeholder="john@company.com" required></div>
          <div class="form-field"><label>Phone</label><input name="phone" type="tel" placeholder="+1 (555) 000-0000"></div>
        </div>
        <div class="form-field"><label>Company</label><input name="company" type="text" placeholder="Your company name"></div>
        <div class="form-field"><label>Message</label><textarea name="message" placeholder="Tell us about your project and goals..." required></textarea></div>
        <button type="submit" class="form-submit">Send Message →</button>
      </form>
    </div>
  </div>
</section>

<!-- Footer -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo">${name.split(" ").slice(0,-1).join(" ")} <span>${name.split(" ").slice(-1)}</span></div>
        <p>${c.footerTagline||c.heroSubheadline||""}</p>
      </div>
      <div>
        <div class="footer-col-title">Services</div>
        ${services.slice(0,4).map(s=>`<a href="#services" class="footer-link">${s.title}</a>`).join("")}
      </div>
      <div>
        <div class="footer-col-title">Company</div>
        <a href="#why" class="footer-link">About Us</a>
        <a href="#process" class="footer-link">Our Process</a>
        <a href="#testimonials" class="footer-link">Case Studies</a>
        <a href="#contact" class="footer-link">Contact</a>
      </div>
      <div>
        <div class="footer-col-title">Contact</div>
        ${c.phone?`<a href="tel:${c.phone}" class="footer-link">${c.phone}</a>`:""}
        ${c.email?`<a href="mailto:${c.email}" class="footer-link">${c.email}</a>`:""}
        ${c.address?`<span class="footer-link">${c.address}</span>`:""}
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ${name}. All rights reserved.</span>
      <div style="display:flex;gap:20px">
        <a href="#" class="footer-link">Privacy Policy</a>
        <a href="#" class="footer-link">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>

<!-- WhatsApp -->
${phone?`<a href="https://wa.me/${phone}" class="wa-btn" target="_blank" rel="noopener" aria-label="WhatsApp">💬</a>`:""}

<script>
// Nav scroll
const nav = document.getElementById('nav')
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60)
}, { passive: true })

// Mobile menu
function toggleMenu() {
  const m = document.getElementById('mobileMenu')
  m.classList.toggle('open')
}
document.addEventListener('click', e => {
  const m = document.getElementById('mobileMenu')
  if (!nav.contains(e.target) && !m.contains(e.target)) m.classList.remove('open')
})

// Counter animation
function animateCounter(el) {
  const text = el.textContent
  const num = parseFloat(text.replace(/[^\d.]/g, ''))
  if (!num) return
  const suffix = text.replace(/[\d.]/g, '')
  let start = 0, duration = 1800, startTime = null
  const step = ts => {
    if (!startTime) startTime = ts
    const progress = Math.min((ts - startTime) / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    el.textContent = (num % 1 === 0 ? Math.floor(ease * num) : (ease * num).toFixed(1)) + suffix
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// Intersection observer for counters + fade-in
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1'
      entry.target.style.transform = 'translateY(0)'
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter)
      io.unobserve(entry.target)
    }
  })
}, { threshold: 0.15 })

document.querySelectorAll('.service-card,.why-card,.testi-card,.process-step,#hero').forEach(el => {
  if (el.id !== 'hero') { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.5s ease, transform 0.5s ease' }
  io.observe(el)
})
document.querySelectorAll('#hero .stat-num').forEach(animateCounter)
</script>
</body>
</html>`

  res.status(200).json({ html })
}
