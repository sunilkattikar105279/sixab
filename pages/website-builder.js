// pages/website-builder.js — SIXXAB AI · Website Builder
// Design → Build → Deploy to Vercel → Create social pages
// COO Suite — managed for BigTech Consulting and any client business
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"
const PURPLE = "#7C3AED", GREEN = "#1D9E75", BLUE = "#378ADD", PINK = "#EC4899"

const INDUSTRIES = [
  "Technology Consulting","IT Consulting & MSP","HVAC & Air Conditioning",
  "Real Estate","Legal Services","Business Consulting","Marketing Agency",
  "Financial Planning","Health & Wellness","Roofing & Construction",
  "Landscaping","Plumbing & Electrical","Auto Repair","Restaurant & Food",
  "Retail & E-commerce","Photography","Cleaning Services","Accounting","Other",
]

const TEMPLATES = [
  { id:"corporate", label:"Corporate",      color:"#1E3A5F", accent:"#0EA5E9", preview:"Navy + Blue",
    desc:"Authority and trust. Best for: Consulting, Finance, Legal, Tech" },
  { id:"bold",      label:"Bold & Modern",  color:"#0A0E1A", accent:"#EF9F27", preview:"Black + Amber",
    desc:"High-impact. Best for: Startups, SaaS, Agencies" },
  { id:"warm",      label:"Warm & Local",   color:"#7C2D12", accent:"#F97316", preview:"Brown + Orange",
    desc:"Community feel. Best for: HVAC, Plumbing, Local services" },
  { id:"fresh",     label:"Fresh & Clean",  color:"#064E3B", accent:"#10B981", preview:"Green + Mint",
    desc:"Health-forward. Best for: Wellness, Coaching, Non-profit" },
  { id:"luxury",    label:"Luxury",         color:"#1F1F1F", accent:"#D4AF37", preview:"Black + Gold",
    desc:"Premium. Best for: Real Estate, Photography, High-end services" },
]

const SOCIAL_PLATFORMS = [
  { id:"linkedin",  label:"LinkedIn Company Page", icon:"ti-brand-linkedin", color:"#0A66C2",
    desc:"Professional bio, about section, specialties, first 3 posts" },
  { id:"facebook",  label:"Facebook Business Page",icon:"ti-brand-facebook", color:"#1877F2",
    desc:"Page description, services, pinned post, cover brief" },
  { id:"instagram", label:"Instagram Business",   icon:"ti-brand-instagram",color:"#E1306C",
    desc:"Bio (150 chars), content pillars, 9-post grid plan" },
  { id:"twitter",   label:"Twitter / X Business", icon:"ti-brand-x",        color:"#000000",
    desc:"Handle, bio, hashtag strategy, first 7 tweets" },
]

const STAGES = [
  { id:"design", n:1, label:"Design",       icon:"ti-palette",         color:AMBER,
    desc:"AI creates your site structure, colors, copy and layout" },
  { id:"build",  n:2, label:"Build",        icon:"ti-code",            color:BLUE,
    desc:"AI generates a complete production-ready HTML/CSS website" },
  { id:"deploy", n:3, label:"Deploy",       icon:"ti-brand-vercel",    color:GREEN,
    desc:"One-click deploy to Vercel — live in 60 seconds" },
  { id:"social", n:4, label:"Social Pages", icon:"ti-share",           color:PINK,
    desc:"Create LinkedIn, Facebook, Instagram and Twitter profiles" },
]

// Default — BigTech Consulting
const BTC_DEFAULTS = {
  bizName:       "BigTech Consulting",
  industry:      "Technology Consulting",
  tagline:       "Transforming businesses through technology. From strategy to execution.",
  services:      "Digital Transformation, IT Strategy, Cloud Migration, Cybersecurity, Data Analytics, Custom Software Development, CTO-as-a-Service, AI & Automation",
  phone:         "+1 (972) 000-0000",
  email:         "info@bigtechconsulting.com",
  address:       "Dallas, TX",
  website:       "https://bigtech-consulting.vercel.app",
  template:      "corporate",
}

export default function WebsiteBuilder() {
  const [stage,       setStage]       = useState("design")
  const [form,        setForm]        = useState(BTC_DEFAULTS)
  const [loading,     setLoading]     = useState(false)
  const [output,      setOutput]      = useState("")
  const [htmlCode,    setHtmlCode]    = useState("")  // clean HTML extracted from build
  const [previewing,  setPreviewing]  = useState(false)
  const [deploying,   setDeploying]   = useState(false)
  const [deployResult,setDeployResult]= useState(null)
  const [socialPlatform,setSocialPlatform] = useState("linkedin")
  const [socialOut,   setSocialOut]   = useState("")
  const [socialLoading,setSocialLoading] = useState(false)
  const [copied,      setCopied]      = useState(false)
  const [toast,       setToast]       = useState(null)
  const [savedSites,  setSavedSites]  = useState([])
  const [clientMode,  setClientMode]  = useState(false) // managing for a client vs own site

  useEffect(() => {
    try { setSavedSites(JSON.parse(localStorage.getItem("sixxab_websites")||"[]")) } catch {}
  }, [])

  function showToast(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),4000) }
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const currentStage = STAGES.find(s=>s.id===stage) || STAGES[0]

  // ── Prompts ────────────────────────────────────────────────────────────────
  function getPrompt() {
    const t = TEMPLATES.find(t=>t.id===form.template) || TEMPLATES[0]
    const shared = `Business: ${form.bizName}
Industry: ${form.industry}
Tagline: ${form.tagline}
Services: ${form.services}
Phone: ${form.phone}
Email: ${form.email}
Location: ${form.address}
Website: ${form.website}
Template style: ${t.label} (${t.preview})`

    if (stage==="design") return `You are the SIXXAB Website Designer Agent.

Design a complete, professional website for:
${shared}

Produce a detailed design brief:

## BRAND IDENTITY
Color palette: Primary #${t.color.replace("#","")}, Accent ${t.accent}
Font pairing: [Heading font from Google Fonts] + [Body font from Google Fonts]
Brand personality: 3 adjectives

## SITE STRUCTURE
Home page sections (in order):
- Navigation items
- Hero: headline (6 words max), subheadline (15 words max), 2 CTAs
- Services/solutions grid: 6 items with icons and descriptions
- Why us: 3 differentiators with evidence
- Case studies or proof: 2–3 examples
- Testimonials: 3 client quotes
- Team section: titles and brief bios
- Contact: form + map placeholder
- Footer: columns and links

## COPY ESSENTIALS
Hero headline: [write it — max 6 words]
Hero subheadline: [write it — conversational, specific]
Primary CTA: [button text]
Secondary CTA: [button text]
3 value propositions: [write each — specific and measurable]

## UX / MOBILE NOTES
Mobile-first layout decisions for this industry.

## SEO
5 target keywords for this business.`

    if (stage==="build") return `You are the SIXXAB Website Builder Agent.

Build a COMPLETE, production-ready HTML website for:
${shared}
Template: ${t.label} colors: primary ${t.color}, accent ${t.accent}

CRITICAL REQUIREMENTS:
1. Output the FULL HTML from <!DOCTYPE html> to </html> — NEVER truncate
2. Embed ALL CSS in a <style> tag — no external CSS files needed
3. Use Google Fonts via CDN link in <head>
4. Every section must be fully written — no placeholder text like "Lorem ipsum" or "[Content here]"
5. Write real, specific content for ${form.bizName}

REQUIRED SECTIONS IN ORDER:
1. <head> — title, meta description, Google Fonts, viewport, favicon emoji
2. Sticky nav — logo text + ${form.bizName}, nav links, CTA button
3. Hero — full-screen gradient, headline, subheadline, 2 buttons, scroll indicator
4. Services grid — 6 service cards with emoji icons, titles and 2-sentence descriptions
5. Why ${form.bizName} — 3 columns with stats/numbers as proof
6. Testimonials — 3 cards with quote, name, company, star rating
7. Process — 4-step numbered process with icons
8. CTA banner — dark background, bold headline, 2 buttons
9. Contact section — form with name/email/phone/message + contact info
10. Footer — 4 columns: logo+about, services, company links, contact + social icons

DESIGN REQUIREMENTS:
- Primary color: ${t.color}, Accent: ${t.accent}
- Mobile-responsive CSS Grid/Flexbox — works perfectly on mobile
- Hover animations on cards and buttons (transform: translateY)
- Smooth scroll for nav links
- WhatsApp button fixed bottom-right: <a href="https://wa.me/${form.phone?.replace(/\D/g,"")}" ...>
- Professional typography — no Comic Sans ever

OUTPUT THE COMPLETE HTML FILE NOW:`

    if (stage==="deploy") return `You are the SIXXAB Website Deployer Agent.

Write the complete manual deployment guide for ${form.bizName}.

## OPTION A — VERCEL (RECOMMENDED — FREE)
Step-by-step with exact URLs:
1. Sign up at vercel.com with GitHub
2. From the dashboard, click "Add New" → "Project"  
3. Click "Deploy" without Git — drag and drop index.html
4. Wait 60 seconds — site is live at [project-name].vercel.app
5. Go to Settings → Domains → add your custom domain
6. Copy the 2 DNS records Vercel shows you
7. Paste them in your domain registrar DNS settings
8. HTTPS is automatic — free SSL

## OPTION B — NETLIFY (ALTERNATIVE — FREE)
Similar steps with netlify.com — drag and drop into app.netlify.com/drop

## OPTION C — GITHUB PAGES (FREE)
1. Create a GitHub account at github.com
2. New repository named: ${form.bizName?.toLowerCase().replace(/\s+/g,"-")}-website
3. Upload index.html
4. Settings → Pages → Deploy from main branch
5. Live at username.github.io/repo-name

## CONTACT FORM SETUP (FORMSPREE — FREE)
1. Go to formspree.io → sign up → New Form
2. Copy the form endpoint (looks like: https://formspree.io/f/xbjwkgpz)
3. In your HTML: change <form> action to that endpoint, method="POST"
4. Add: <input type="hidden" name="_replyto" value="${form.email}">
5. Submissions arrive at ${form.email}

## GOOGLE ANALYTICS 4 — FREE
1. analytics.google.com → Admin → Create property → "Web"
2. Copy Measurement ID (G-XXXXXXXXXX)
3. Paste before </head>:
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>window.dataLayer=[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-XXXXXXXXXX')</script>

## GO-LIVE CHECKLIST
☐ Site loads on mobile and desktop
☐ Contact form sends a test email to ${form.email}
☐ Phone number ${form.phone} is clickable
☐ All 6 services are accurate and complete
☐ Google Analytics shows first visit
☐ Custom domain connected with HTTPS padlock
☐ WhatsApp button works
☐ Page speed: run https://pagespeed.web.dev — aim for 85+`

    return "" // social handled separately
  }

  async function generate() {
    const p = getPrompt()
    if (!p) return
    setLoading(true); setOutput(""); setHtmlCode(""); setPreviewing(false)
    try {
      const r = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:p }] })
      })
      const d = await r.json()
      const result = d.reply || d.content || "Unable to generate — check API connection."
      setOutput(result)
      // Extract clean HTML from build output
      if (stage==="build") {
        const match = result.match(/<!DOCTYPE html>[\s\S]*<\/html>/i)
        if (match) {
          setHtmlCode(match[0])
          showToast("Website built! Preview and deploy below.")
          // Auto-save to sites list
          const site = { id:Date.now(), name:form.bizName, html:match[0], template:form.template, createdAt:new Date().toISOString() }
          const updated = [site, ...savedSites].slice(0,10)
          setSavedSites(updated)
          localStorage.setItem("sixxab_websites", JSON.stringify(updated))
        } else {
          showToast("HTML generated but not wrapped in DOCTYPE — copy the code below", false)
        }
      }
    } catch(e) { showToast("Network error: "+e.message, false) }
    setLoading(false)
  }

  async function deployToVercel() {
    if (!htmlCode) { showToast("Build your website first (Step 2)", false); return }
    setDeploying(true); setDeployResult(null)
    try {
      const slug = form.bizName.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-")
      const r = await fetch("/api/deploy-vercel", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ html:htmlCode, projectName:slug, bizName:form.bizName })
      })
      const d = await r.json()
      setDeployResult(d)
      if (d.deployed) showToast(`Deploying ${form.bizName} to Vercel! Live in ~60 seconds`)
      else if (d.needsSetup) showToast("Add VERCEL_TOKEN to env vars first — see setup guide below", false)
      else showToast(d.error || "Deploy failed — see details below", false)
    } catch(e) { showToast("Error: "+e.message, false) }
    setDeploying(false)
  }

  async function generateSocialPage() {
    if (!form.bizName || !form.industry) { showToast("Fill in business name and industry first", false); return }
    setSocialLoading(true); setSocialOut("")
    try {
      const r = await fetch("/api/create-social-page", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, platform:socialPlatform })
      })
      const d = await r.json()
      setSocialOut(d.result || d.error || "Error")
    } catch(e) { setSocialOut("Error: "+e.message) }
    setSocialLoading(false)
  }

  function downloadHtml() {
    if (!htmlCode) { showToast("Build website first", false); return }
    const blob = new Blob([htmlCode], {type:"text/html"})
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${form.bizName.toLowerCase().replace(/\s+/g,"-")}.html`
    a.click()
    showToast("Downloaded!")
  }

  function copyText() {
    const text = stage==="build" && htmlCode ? htmlCode : output
    navigator.clipboard.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2500) })
  }

  const canGenerate = !loading && form.bizName && form.industry

  return (
    <>
      <Head>
        <title>SIXXAB AI — Website Builder · Design, Build & Deploy</title>
        <meta name="description" content="Design, build and deploy professional websites for any business. One-click Vercel deployment, social media page creation, Google Analytics setup."/>
      </Head>
      <style>{`
        body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fu{animation:fadeUp .3s ease both}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        .inp{width:100%;padding:10px 13px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:${N};background:#fff;font-family:inherit;outline:none;transition:border .15s}
        .inp:focus{border-color:${AMBER}}
        select.inp{cursor:pointer}
        textarea.inp{resize:vertical;line-height:1.65}
        .lbl{font-size:10.5px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:5px}
        .stage-btn{display:flex;align-items:center;gap:10px;width:100%;padding:11px 14px;border:none;background:transparent;cursor:pointer;font-family:inherit;text-align:left;border-bottom:1px solid #F1F5F9;transition:background .12s;border-left:3px solid transparent}
        .stage-btn:hover{background:#FAFAFA}
        .stage-btn.active{background:rgba(239,159,39,.06);border-left-color:var(--sc)}
        .tmpl-btn{display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:9px;cursor:pointer;transition:all .14s;border:1.5px solid #E2E8F0}
        .tmpl-btn:hover{border-color:#CBD5E1}
        .tmpl-btn.sel{border-color:${PURPLE};background:#F5F3FF}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${AMBER};border-radius:2px}
        @media(max-width:768px){.desktop-grid{grid-template-columns:1fr!important}.hide-m{display:none!important}}
      `}</style>

      <SixxabNav active="/website-builder"/>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",bottom:20,right:16,left:16,maxWidth:380,marginLeft:"auto",zIndex:999,padding:"11px 16px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 20px rgba(0,0,0,.15)",animation:"fadeUp .3s ease"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

      {/* Header */}
      <div style={{background:N,padding:"14px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(124,58,237,.18)",border:"1.5px solid rgba(124,58,237,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className="ti ti-device-desktop" style={{fontSize:22,color:"#A78BFA"}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                <h1 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:CHALK,letterSpacing:.5}}>
                  SIXXAB <span style={{color:"#A78BFA",fontStyle:"italic"}}>Website Builder</span>
                </h1>
                <span style={{padding:"2px 9px",borderRadius:20,background:"rgba(124,58,237,.15)",border:"1px solid rgba(124,58,237,.35)",fontSize:10,fontWeight:600,color:"#C4B5FD"}}>COO Suite · Design → Build → Deploy</span>
              </div>
              <p style={{fontSize:12,color:"rgba(245,245,240,.45)"}}>Design · Build HTML · Deploy Vercel · LinkedIn · Facebook · Instagram · Twitter</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {/* Client mode toggle */}
            <div style={{display:"flex",alignItems:"center",gap:7,padding:"6px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
              <label style={{fontSize:11.5,color:"rgba(245,245,240,.5)",cursor:"pointer"}} onClick={()=>setClientMode(c=>!c)}>
                {clientMode?"Client site":"My site"}
              </label>
              <div onClick={()=>setClientMode(c=>!c)} style={{width:30,height:16,borderRadius:8,background:clientMode?PURPLE:"#374151",cursor:"pointer",position:"relative",transition:"background .2s"}}>
                <div style={{position:"absolute",width:12,height:12,borderRadius:"50%",background:"#fff",top:2,left:clientMode?16:2,transition:"left .2s"}}/>
              </div>
            </div>
            <a href="/agents?cxo=coo" style={{padding:"6px 13px",borderRadius:8,background:"rgba(124,58,237,.2)",border:"1px solid rgba(124,58,237,.4)",fontSize:12,fontWeight:500,color:"#C4B5FD",textDecoration:"none"}}>COO Suite</a>
            <a href="/social" style={{padding:"6px 13px",borderRadius:8,background:"rgba(239,159,39,.15)",border:"1px solid rgba(239,159,39,.35)",fontSize:12,fontWeight:500,color:AMBER,textDecoration:"none"}}>Social Hub</a>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1260,margin:"0 auto",padding:"18px 18px 60px"}}>
        <div className="desktop-grid" style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:16,alignItems:"start"}}>

          {/* ── LEFT COLUMN ── */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>

            {/* Stage navigator */}
            <div className="card">
              <div style={{padding:"9px 14px",borderBottom:"1px solid #F1F5F9",fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".1em"}}>Build stages</div>
              {STAGES.map((s,i)=>(
                <button key={s.id}
                  className={`stage-btn${stage===s.id?" active":""}`}
                  style={{"--sc":s.color}}
                  onClick={()=>{setStage(s.id);setOutput("");setPreviewing(false)}}>
                  <div style={{width:32,height:32,borderRadius:9,background:stage===s.id?`${s.color}20`:"#F1F5F9",border:`1px solid ${stage===s.id?s.color+"44":"transparent"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .14s"}}>
                    <i className={`ti ${s.icon}`} style={{fontSize:14,color:stage===s.id?s.color:"#94A3B8"}} aria-hidden="true"/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:9,fontFamily:"monospace",color:s.color,letterSpacing:".06em",marginBottom:1}}>0{s.n}</div>
                    <div style={{fontSize:13,fontWeight:stage===s.id?700:400,color:stage===s.id?N:"#64748B",lineHeight:1.2}}>{s.label}</div>
                    <div style={{fontSize:10.5,color:"#94A3B8",lineHeight:1.3,marginTop:1}}>{s.desc}</div>
                  </div>
                  {stage===s.id&&<div style={{width:6,height:6,borderRadius:"50%",background:s.color,flexShrink:0}}/>}
                </button>
              ))}
            </div>

            {/* Business details */}
            <div className="card">
              <div style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9",fontSize:12,fontWeight:600,color:N,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span>Business details</span>
                {clientMode&&<span style={{fontSize:10.5,color:PURPLE,fontWeight:500}}>Client site mode</span>}
              </div>
              <div style={{padding:"14px",display:"flex",flexDirection:"column",gap:10}}>
                <div>
                  <label className="lbl">Business name *</label>
                  <input className="inp" value={form.bizName} onChange={e=>set("bizName",e.target.value)} placeholder="BigTech Consulting"/>
                </div>
                <div>
                  <label className="lbl">Industry *</label>
                  <select className="inp" value={form.industry} onChange={e=>set("industry",e.target.value)}>
                    {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Tagline</label>
                  <input className="inp" value={form.tagline} onChange={e=>set("tagline",e.target.value)} placeholder="Your value proposition"/>
                </div>
                <div>
                  <label className="lbl">Services / solutions</label>
                  <textarea className="inp" rows={2} value={form.services} onChange={e=>set("services",e.target.value)} placeholder="List your services"/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div>
                    <label className="lbl">Phone</label>
                    <input className="inp" value={form.phone} onChange={e=>set("phone",e.target.value)}/>
                  </div>
                  <div>
                    <label className="lbl">Email</label>
                    <input className="inp" value={form.email} onChange={e=>set("email",e.target.value)}/>
                  </div>
                </div>
                <div>
                  <label className="lbl">Location</label>
                  <input className="inp" value={form.address} onChange={e=>set("address",e.target.value)}/>
                </div>
                <div>
                  <label className="lbl">Website URL</label>
                  <input className="inp" value={form.website} onChange={e=>set("website",e.target.value)} placeholder="https://"/>
                </div>
              </div>
            </div>

            {/* Template selector */}
            <div className="card" style={{padding:"12px 14px"}}>
              <div style={{fontSize:12,fontWeight:600,color:N,marginBottom:10}}>Template style</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {TEMPLATES.map(t=>(
                  <div key={t.id} className={`tmpl-btn${form.template===t.id?" sel":""}`}
                    onClick={()=>set("template",t.id)}>
                    <div style={{width:32,height:22,borderRadius:5,background:t.color,flexShrink:0,position:"relative",overflow:"hidden",border:"1px solid rgba(0,0,0,.1)"}}>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,height:7,background:t.accent}}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:form.template===t.id?600:400,color:N}}>{t.label}</div>
                      <div style={{fontSize:10.5,color:"#94A3B8"}}>{t.desc}</div>
                    </div>
                    {form.template===t.id&&<div style={{width:7,height:7,borderRadius:"50%",background:PURPLE}}/>}
                  </div>
                ))}
              </div>
            </div>

            {/* Saved sites */}
            {savedSites.length>0&&(
              <div className="card" style={{padding:"12px 14px"}}>
                <div style={{fontSize:12,fontWeight:600,color:N,marginBottom:8}}>Saved websites ({savedSites.length})</div>
                {savedSites.slice(0,5).map(site=>(
                  <div key={site.id} style={{display:"flex",alignItems:"center",gap:9,padding:"6px 0",borderBottom:"1px solid #F1F5F9"}}>
                    <i className="ti ti-device-desktop" style={{fontSize:12,color:"#94A3B8",flexShrink:0}} aria-hidden="true"/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{site.name}</div>
                      <div style={{fontSize:10.5,color:"#94A3B8"}}>{new Date(site.createdAt).toLocaleDateString()}</div>
                    </div>
                    <button onClick={()=>{setHtmlCode(site.html);setStage("deploy");showToast(`Loaded ${site.name}`)}}
                      style={{fontSize:11,padding:"3px 9px",borderRadius:6,border:"1px solid #E2E8F0",background:"#F8F9FA",cursor:"pointer",color:"#64748B",fontFamily:"inherit"}}>
                      Load
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>

            {/* Action button */}
            {stage!=="social" && stage!=="deploy" && (
              <button onClick={generate} disabled={!canGenerate}
                style={{width:"100%",padding:13,borderRadius:11,background:!canGenerate?"#F1F5F9":currentStage.color,color:!canGenerate?"#94A3B8":currentStage.color===AMBER?N:"#fff",border:"none",cursor:!canGenerate?"not-allowed":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:9,transition:"all .15s"}}>
                {loading
                  ? <><div style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
                      {stage==="design"?"Designing your website…":"Building complete website — this takes 30–60 seconds…"}</>
                  : <><i className={`ti ${currentStage.icon}`} style={{fontSize:14}} aria-hidden="true"/>
                      {stage==="design"?"Design my website →":"Build complete HTML website →"}</>
                }
              </button>
            )}

            {/* Deploy stage panel */}
            {stage==="deploy" && (
              <div className="card fu">
                <div style={{padding:"13px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",gap:10}}>
                  <i className="ti ti-brand-vercel" style={{fontSize:18,color:GREEN}} aria-hidden="true"/>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:700,color:N}}>Deploy to Vercel</div>
                    <div style={{fontSize:12,color:"#64748B"}}>{htmlCode ? `${form.bizName} ready to deploy` : "Build your website first (Step 02)"}</div>
                  </div>
                </div>
                <div style={{padding:"16px"}}>
                  {/* One-click deploy */}
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:12.5,fontWeight:600,color:N,marginBottom:8}}>One-click deploy</div>
                    <button onClick={deployToVercel} disabled={deploying||!htmlCode}
                      style={{width:"100%",padding:"12px",borderRadius:10,background:deploying||!htmlCode?"#F1F5F9":N,color:deploying||!htmlCode?"#94A3B8":CHALK,border:"none",cursor:deploying||!htmlCode?"not-allowed":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:9,transition:"all .15s"}}>
                      {deploying
                        ? <><div style={{width:15,height:15,border:"2px solid rgba(245,245,240,.3)",borderTopColor:CHALK,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Deploying to Vercel…</>
                        : <><i className="ti ti-brand-vercel" style={{fontSize:14}} aria-hidden="true"/>{htmlCode?"Deploy to Vercel now →":"Build website first (Step 02)"}</>
                      }
                    </button>

                    {/* Deploy result */}
                    {deployResult && (
                      <div style={{marginTop:10,padding:"12px 14px",borderRadius:10,background:deployResult.deployed?"#F0FDF4":deployResult.needsSetup?"#FFFBF2":"#FEF2F2",border:`1px solid ${deployResult.deployed?"#BBF7D0":deployResult.needsSetup?"rgba(239,159,39,.3)":"#FECACA"}`}}>
                        {deployResult.deployed ? (
                          <div>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                              <div style={{width:8,height:8,borderRadius:"50%",background:"#1D9E75"}}/>
                              <span style={{fontSize:13,fontWeight:700,color:"#085041"}}>Deploying — live in ~60 seconds</span>
                            </div>
                            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                              <a href={deployResult.url} target="_blank" rel="noopener noreferrer"
                                style={{padding:"6px 14px",borderRadius:8,background:"#1D9E75",color:"#fff",fontSize:12.5,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:5}}>
                                <i className="ti ti-external-link" style={{fontSize:11}} aria-hidden="true"/>Open site ↗
                              </a>
                              <a href={deployResult.dashboard} target="_blank" rel="noopener noreferrer"
                                style={{padding:"6px 14px",borderRadius:8,background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#085041",fontSize:12,textDecoration:"none"}}>
                                Vercel dashboard
                              </a>
                            </div>
                            {deployResult.alias&&<div style={{marginTop:8,fontSize:12,color:"#64748B"}}>URL: {deployResult.alias}</div>}
                            {deployResult.customDomain&&<div style={{marginTop:4,fontSize:11.5,color:"#94A3B8"}}>{deployResult.customDomain}</div>}
                          </div>
                        ) : deployResult.needsSetup ? (
                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:"#92400E",marginBottom:8}}>Setup required — add VERCEL_TOKEN</div>
                            <div style={{display:"flex",flexDirection:"column",gap:5}}>
                              {deployResult.setupSteps?.map((step,i)=>(
                                <div key={i} style={{fontSize:12,color:"#64748B",lineHeight:1.55,display:"flex",gap:7}}>
                                  <span style={{color:AMBER,flexShrink:0,fontWeight:600}}>{i+1}.</span>{step.replace(/^\d+\.\s*/,"")}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div style={{fontSize:13,color:"#991B1B"}}>{deployResult.error}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Manual options */}
                  <div style={{borderTop:"1px solid #E8ECF4",paddingTop:14}}>
                    <div style={{fontSize:12.5,fontWeight:600,color:N,marginBottom:10}}>Or deploy manually</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                      {htmlCode && (
                        <button onClick={downloadHtml}
                          style={{padding:"9px 18px",borderRadius:9,background:"#EFF6FF",border:"1px solid #BFDBFE",color:"#1D4ED8",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
                          <i className="ti ti-download" style={{fontSize:12}} aria-hidden="true"/>Download index.html
                        </button>
                      )}
                      <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer"
                        style={{padding:"9px 18px",borderRadius:9,background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#085041",fontSize:13,fontWeight:500,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>
                        <i className="ti ti-cloud-upload" style={{fontSize:12}} aria-hidden="true"/>Netlify drag & drop ↗
                      </a>
                    </div>
                    <div style={{padding:"11px 14px",borderRadius:10,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:12.5,color:"#64748B",lineHeight:1.65}}>
                      <strong style={{color:N}}>Quickest manual deploy:</strong> Download the HTML → go to{" "}
                      <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" style={{color:"#0EA5E9"}}>app.netlify.com/drop</a>
                      {" "}→ drag the file → live in 30 seconds. Free forever.
                    </div>
                  </div>

                  {/* AI deploy guide */}
                  <div style={{borderTop:"1px solid #E8ECF4",paddingTop:14}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <div style={{fontSize:12.5,fontWeight:600,color:N}}>Full setup guide (Analytics, Forms, Domain)</div>
                    </div>
                    <button onClick={generate} disabled={loading}
                      style={{width:"100%",padding:"10px",borderRadius:9,background:loading?"#F1F5F9":GREEN,color:loading?"#94A3B8":"#fff",border:"none",cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                      {loading?<><div style={{width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Generating guide…</>:<><i className="ti ti-book" style={{fontSize:13}} aria-hidden="true"/>Generate complete deployment guide</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Social pages stage */}
            {stage==="social" && (
              <div className="card fu">
                <div style={{padding:"13px 16px",borderBottom:"1px solid #E8ECF4",background:"#FDF0F5",display:"flex",alignItems:"center",gap:10}}>
                  <i className="ti ti-share" style={{fontSize:18,color:PINK}} aria-hidden="true"/>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:700,color:N}}>Create social media pages</div>
                    <div style={{fontSize:12,color:"#64748B"}}>Complete profile content for {form.bizName} — ready to copy and paste</div>
                  </div>
                </div>
                <div style={{padding:"16px"}}>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                    {SOCIAL_PLATFORMS.map(p=>(
                      <button key={p.id} onClick={()=>{setSocialPlatform(p.id);setSocialOut("")}}
                        style={{display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:9,border:`1.5px solid ${socialPlatform===p.id?p.color:"#E2E8F0"}`,background:socialPlatform===p.id?`${p.color}10`:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:socialPlatform===p.id?700:400,color:socialPlatform===p.id?p.color:N,transition:"all .14s"}}>
                        <i className={`ti ${p.icon}`} style={{fontSize:14,color:socialPlatform===p.id?p.color:"#94A3B8"}} aria-hidden="true"/>
                        {p.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                  <div style={{padding:"10px 13px",borderRadius:9,background:"#F8F9FA",border:"1px solid #E2E8F0",fontSize:12.5,color:"#64748B",marginBottom:14}}>
                    {SOCIAL_PLATFORMS.find(p=>p.id===socialPlatform)?.desc}
                  </div>
                  <button onClick={generateSocialPage} disabled={socialLoading||!form.bizName||!form.industry}
                    style={{width:"100%",padding:"12px",borderRadius:10,background:socialLoading?"#F1F5F9":PINK,color:socialLoading?"#94A3B8":"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
                    {socialLoading
                      ? <><div style={{width:15,height:15,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Creating {socialPlatform} page…</>
                      : <><i className={`ti ${SOCIAL_PLATFORMS.find(p=>p.id===socialPlatform)?.icon}`} style={{fontSize:14}} aria-hidden="true"/>Generate {SOCIAL_PLATFORMS.find(p=>p.id===socialPlatform)?.label} content →</>
                    }
                  </button>
                  {socialOut&&(
                    <div style={{marginTop:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{fontSize:12.5,fontWeight:600,color:N}}>{SOCIAL_PLATFORMS.find(p=>p.id===socialPlatform)?.label} content ready</div>
                        <button onClick={()=>{navigator.clipboard.writeText(socialOut);showToast("Copied!")}}
                          style={{padding:"5px 12px",borderRadius:7,background:PINK,color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>
                          Copy all
                        </button>
                      </div>
                      <div style={{padding:"14px 16px",background:"#FAFAFA",borderRadius:11,border:"1px solid #E2E8F0",fontSize:13.5,lineHeight:1.85,whiteSpace:"pre-wrap",maxHeight:500,overflowY:"auto",color:N}}>
                        {socialOut}
                      </div>
                      <div style={{marginTop:10,display:"flex",gap:8}}>
                        <a href="/social" style={{padding:"8px 16px",borderRadius:9,background:"#0A0E1A",color:CHALK,fontSize:13,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>
                          <i className="ti ti-send" style={{fontSize:12}} aria-hidden="true"/>Connect & publish in Social Hub
                        </a>
                        <a href="/calendar" style={{padding:"8px 14px",borderRadius:9,background:"#FFFBF2",border:"1px solid rgba(239,159,39,.3)",color:AMBER,fontSize:13,fontWeight:500,textDecoration:"none"}}>
                          📅 Schedule posts
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Output area — Design and Build */}
            {output && stage!=="social" && (
              <div className="card fu">
                <div style={{padding:"12px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <i className={`ti ${currentStage.icon}`} style={{fontSize:14,color:currentStage.color}} aria-hidden="true"/>
                    <span style={{fontSize:13,fontWeight:600,color:N}}>
                      {stage==="design"?"Design brief":"Complete HTML website"} — {form.bizName}
                    </span>
                  </div>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {stage==="build"&&htmlCode&&(
                      <>
                        <button onClick={()=>setPreviewing(p=>!p)}
                          style={{padding:"5px 12px",borderRadius:7,background:"#EFF6FF",border:"1px solid #BFDBFE",color:"#1D4ED8",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                          {previewing?"Hide":"👁 Preview"}
                        </button>
                        <button onClick={downloadHtml}
                          style={{padding:"5px 12px",borderRadius:7,background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#085041",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                          ↓ Download HTML
                        </button>
                      </>
                    )}
                    <button onClick={copyText}
                      style={{padding:"5px 12px",borderRadius:7,background:copied?GREEN:currentStage.color,color:currentStage.color===AMBER&&!copied?N:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"background .2s"}}>
                      {copied?"✓ Copied!":"Copy"}
                    </button>
                  </div>
                </div>

                {/* Live preview */}
                {previewing&&htmlCode&&(
                  <div style={{borderBottom:"1px solid #E8ECF4"}}>
                    <div style={{padding:"7px 14px",background:"#F1F5F9",fontSize:11,color:"#64748B",display:"flex",alignItems:"center",gap:6}}>
                      <i className="ti ti-device-desktop" style={{fontSize:11}} aria-hidden="true"/>
                      Live preview — exactly how the website looks
                    </div>
                    <iframe srcDoc={htmlCode} style={{width:"100%",height:520,border:"none",display:"block"}} sandbox="allow-same-origin" title="Website preview"/>
                  </div>
                )}

                {/* Output text */}
                <div style={{padding:"16px 20px",fontSize:stage==="build"?12:13.5,lineHeight:1.85,whiteSpace:"pre-wrap",maxHeight:560,overflowY:"auto",color:N,fontFamily:stage==="build"?"'DM Mono',monospace":"inherit"}}>
                  {output}
                </div>

                {/* Stage navigation footer */}
                <div style={{padding:"11px 16px",borderTop:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  {stage==="design"&&(
                    <button onClick={()=>{setStage("build");setOutput("")}}
                      style={{padding:"8px 18px",borderRadius:9,background:BLUE,color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                      <i className="ti ti-code" style={{fontSize:12}} aria-hidden="true"/>Build website from this design →
                    </button>
                  )}
                  {stage==="build"&&htmlCode&&(
                    <button onClick={()=>{setStage("deploy");setOutput("")}}
                      style={{padding:"8px 18px",borderRadius:9,background:GREEN,color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                      <i className="ti ti-brand-vercel" style={{fontSize:12}} aria-hidden="true"/>Deploy to Vercel →
                    </button>
                  )}
                  {stage==="build"&&(
                    <button onClick={()=>{setStage("social");setOutput("")}}
                      style={{padding:"8px 16px",borderRadius:9,background:PINK,color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                      Create social media pages →
                    </button>
                  )}
                  <a href="/agents?cxo=coo" style={{fontSize:12,color:"#64748B",textDecoration:"none",marginLeft:"auto"}}>COO Suite →</a>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!output && !deployResult && stage!=="social" && stage!=="deploy" && (
              <div className="card" style={{padding:"52px 24px",textAlign:"center",color:"#94A3B8"}}>
                <i className={`ti ${currentStage.icon}`} style={{fontSize:44,color:`${currentStage.color}33`,display:"block",marginBottom:14}} aria-hidden="true"/>
                <div style={{fontSize:16,fontWeight:600,color:"#64748B",marginBottom:8}}>Step {currentStage.n}: {currentStage.label}</div>
                <div style={{fontSize:13.5,lineHeight:1.7,maxWidth:320,margin:"0 auto",marginBottom:20}}>{currentStage.desc}</div>
                {stage==="build"&&!htmlCode&&(
                  <div style={{padding:"10px 14px",borderRadius:9,background:"#FFFBF2",border:"1px solid rgba(239,159,39,.25)",fontSize:12.5,color:"#92400E",maxWidth:340,margin:"0 auto"}}>
                    Tip: Run Design (Step 01) first to plan the structure, then Build will generate a much better result.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
