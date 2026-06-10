// pages/website-builder.js — SIXXAB AI · Website Builder
// Design → Build → Deploy client websites. COO-owned.
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { useState } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

const INDUSTRIES = ["HVAC & Air Conditioning","Real Estate","Legal Services","Business Consulting","Landscaping","Plumbing & Electrical","Health & Wellness","Roofing","IT Support / MSP","Auto Repair","Restaurant & Food","Retail & E-commerce","Accounting & Finance","Photography & Videography","Cleaning Services","Personal Trainer","SaaS / Software","Marketing Agency","Non-Profit","Other"]

const TEMPLATES = [
  { id:"professional", label:"Professional",    color:"#1E3A5F", accent:"#EF9F27", desc:"Clean, trust-first. Best for: Legal, Finance, Consulting" },
  { id:"bold",         label:"Bold & Modern",   color:"#0A0E1A", accent:"#EF9F27", desc:"High-impact hero. Best for: Tech, SaaS, Startups" },
  { id:"warm",         label:"Warm & Local",    color:"#92400E", accent:"#F59E0B", desc:"Friendly, community feel. Best for: HVAC, Plumbing, Local services" },
  { id:"fresh",        label:"Fresh & Clean",   color:"#064E3B", accent:"#10B981", desc:"Light, modern. Best for: Health, Wellness, Coaching" },
  { id:"luxury",       label:"Luxury & Premium",color:"#1F1F1F", accent:"#D4AF37", desc:"Sophisticated. Best for: Real Estate, Photography, Events" },
]

const STAGES = [
  { id:"design",  n:"01", label:"Design",  icon:"ti-palette",       color:AMBER,     desc:"AI designs your site structure, colors and layout" },
  { id:"build",   n:"02", label:"Build",   icon:"ti-code",          color:"#378ADD", desc:"AI generates your complete HTML/CSS website code" },
  { id:"deploy",  n:"03", label:"Deploy",  icon:"ti-brand-vercel",  color:"#1D9E75", desc:"One-click deploy to Vercel or step-by-step manual guide" },
  { id:"social",  n:"04", label:"Social Pages", icon:"ti-share",   color:"#EC4899", desc:"Create LinkedIn, Facebook, Instagram and Twitter profiles" },
  { id:"connect", n:"05", label:"Connect", icon:"ti-plug",         color:"#7C3AED", desc:"Wire Google Analytics, pixels and SIXXAB CRM to your site" },
]

const DEPLOY_TARGETS = ["Vercel (recommended)", "Netlify", "GitHub Pages", "cPanel / Shared hosting", "Google Sites"]

export default function WebsiteBuilder() {
  const [stage,        setStage]        = useState("design")
  const [form,         setForm]         = useState({ bizName:"", industry:"", tagline:"", colors:"", phone:"", email:"", address:"", services:"", template:"professional", deployTarget:"Vercel (recommended)" })
  const [loading,      setLoading]      = useState(false)
  const [output,       setOutput]       = useState("")
  const [generatedHtml,setGeneratedHtml]= useState("")
  const [copied,       setCopied]       = useState(false)
  const [previewing,   setPreviewing]   = useState(false)
  const [deploying,    setDeploying]    = useState(false)
  const [deployResult, setDeployResult] = useState(null)
  const [socialPlatform, setSocialPlatform] = useState("linkedin")
  const [socialOutput, setSocialOutput] = useState("")
  const [socialLoading,setSocialLoading]= useState(false)
  const [toast,        setToast]        = useState(null)

  function showToast(msg, ok=true) { setToast({msg,ok}); setTimeout(()=>setToast(null),3500) }
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const AGENT_PROMPTS = {
    design: `You are the SIXXAB Website Designer Agent.

Design a complete website for:
Business name: ${form.bizName||"My Business"}
Industry: ${form.industry||"Business Services"}
Tagline: ${form.tagline||""}
Template style: ${form.template}
Contact: ${form.phone||""} · ${form.email||""}
Location: ${form.address||"Dallas, TX"}
Services: ${form.services||""}

Produce a complete design brief with these sections:

## SITE STRUCTURE
List every page and its sections (e.g. Home: Hero, Services, Why Us, Testimonials, CTA, Footer)

## COLOR PALETTE
Primary: #hex · Secondary: #hex · Accent: #hex · Background: #hex · Text: #hex
Explain why these work for this industry.

## TYPOGRAPHY
Heading font: [Google Font name] · Body font: [Google Font name]
Explain the pairing.

## HERO SECTION
Headline (max 6 words) · Subheadline (max 15 words) · Primary CTA · Secondary CTA

## KEY MESSAGES
3 value propositions — what makes this business the right choice

## SOCIAL PROOF STRATEGY
What testimonials to collect and where to place them

## CTA STRATEGY
Primary CTA · Secondary CTA · Urgency element

## MOBILE NOTES
Specific mobile layout considerations for this industry`,

    build: `You are the SIXXAB Website Builder Agent.

Build a complete, production-ready single-page HTML website for:
Business: ${form.bizName||"My Business"}
Industry: ${form.industry||"Business Services"}
Template: ${form.template}
Phone: ${form.phone||"+1 (555) 000-0000"}
Email: ${form.email||"contact@business.com"}
Address: ${form.address||"Dallas, TX"}
Services: ${form.services||"Professional Services"}
Tagline: ${form.tagline||"Professional. Reliable. Results."}

Requirements:
- Full HTML5 with embedded CSS (no external CSS files)
- Google Fonts via CDN link in <head>
- Sticky navigation with smooth scroll
- Hero section with gradient background matching the ${form.template} template
- Services/features grid (3-6 items)
- Why choose us section (3 reasons with icons via CSS)
- Testimonials section (3 placeholder testimonials)
- Contact section with mailto: and tel: links
- Footer with social media placeholders
- Mobile-responsive using CSS Flexbox/Grid
- Hover animations on cards and buttons
- WhatsApp CTA button (green, fixed bottom-right on mobile)
- Professional color scheme matching the ${form.template} template

Output the COMPLETE HTML file from <!DOCTYPE html> to </html>. Do NOT truncate. Do NOT use placeholder like "<!-- rest of code here -->".`,

    deploy: `You are the SIXXAB Website Deployer Agent.

Write a complete deployment guide for deploying a single HTML file website to: ${form.deployTarget}

Business: ${form.bizName||"My Business"}

Include these sections:

## STEP-BY-STEP DEPLOYMENT TO ${form.deployTarget.toUpperCase()}
Number every step. Include exact URLs, button names and field values. Assume the user has never deployed a website before.

## CUSTOM DOMAIN SETUP
How to connect a domain (e.g. mybusiness.com) — include where to buy a domain and where to add the DNS records.

## SSL / HTTPS
How to enable HTTPS (free SSL) — most platforms do this automatically, confirm this.

## CONTACT FORM SETUP
How to set up Formspree (free) so the contact form sends emails. Exact steps with URLs.

## GOOGLE ANALYTICS
How to add Google Analytics 4 — where to get the tracking code and where to paste it.

## FACEBOOK PIXEL & LINKEDIN INSIGHT TAG
How to add both tracking pixels for social media advertising.

## GOING LIVE CHECKLIST
10-item checklist to confirm before sharing the website URL.`,

    connect: `You are the SIXXAB Website Deployer Agent.

Create a complete social media and analytics integration guide for ${form.bizName||"My Business"} (${form.industry||"Business"}) website.

Include:

## GOOGLE BUSINESS PROFILE
Step-by-step to create/claim Google Business Profile and link to the website. This drives local SEO.

## LINKEDIN COMPANY PAGE
How to create a LinkedIn company page, add the website URL, and set up the LinkedIn Insight Tag on the website.

## FACEBOOK BUSINESS PAGE
Create Facebook Page, link website, install Facebook Pixel, set up Facebook/Instagram ad account.

## INSTAGRAM BUSINESS ACCOUNT
Switch to business account, link Facebook Page, add website to bio, enable contact button.

## GOOGLE ADS SETUP (OPTIONAL)
How to run a first Google Search campaign targeting local customers for this industry.

## SEO BASICS
5 specific on-page SEO actions for this business type to rank in Google within 90 days.

## SIXXAB AI INTEGRATION
How to connect this website to: SIXXAB CRM (add contact form leads), Content Studio (schedule posts), Social Hub (publish content), Lead Gen (add prospects).`,
  }

  async function deployToVercel() {
    if (!generatedHtml) { showToast("Build your website first (Step 02)", false); return }
    setDeploying(true); setDeployResult(null)
    try {
      const slug = (form.bizName||"my-business").toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-")
      const r = await fetch("/api/deploy-vercel", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ html: generatedHtml, projectName: slug })
      })
      const d = await r.json()
      setDeployResult(d)
      if (d.deployed) showToast("Deploying to Vercel — live in ~60 seconds!")
      else if (d.message==="VERCEL_TOKEN not set") showToast("Add VERCEL_TOKEN to Vercel env vars to enable one-click deploy", false)
      else showToast(d.error || "Deploy failed", false)
    } catch(e) { showToast("Error: "+e.message, false) }
    setDeploying(false)
  }

  async function createSocialPage() {
    if (!form.bizName || !form.industry) { showToast("Fill in business name and industry first", false); return }
    setSocialLoading(true); setSocialOutput("")
    try {
      const r = await fetch("/api/create-social-page", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, website: form.email ? undefined : "https://startupsinabox.com", platform: socialPlatform })
      })
      const d = await r.json()
      setSocialOutput(d.result || d.error || "Error")
    } catch(e) { setSocialOutput("Error: "+e.message) }
    setSocialLoading(false)
  }

  async function generate() {
    setLoading(true); setOutput(""); setGeneratedHtml("")
    try {
      const r = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content: AGENT_PROMPTS[stage] }] })
      })
      const d = await r.json()
      const result = d.reply || "Unable to generate — check API connection."
      setOutput(result)
      // If building — extract HTML
      if (stage==="build") {
        const htmlMatch = result.match(/<!DOCTYPE html>[\s\S]*<\/html>/i)
        if (htmlMatch) setGeneratedHtml(htmlMatch[0])
      }
    } catch { showToast("Network error", false) }
    setLoading(false)
  }

  function copyOutput() {
    const text = stage==="build" && generatedHtml ? generatedHtml : output
    navigator.clipboard.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2500) })
  }

  function downloadHtml() {
    if (!generatedHtml) return
    const blob = new Blob([generatedHtml], {type:"text/html"})
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${(form.bizName||"website").toLowerCase().replace(/\s+/g,"-")}.html`
    a.click()
    showToast("HTML file downloaded!")
  }

  const currentStage = STAGES.find(s=>s.id===stage) || STAGES[0]

  return (
    <>
      <Head>
        <title>SIXXAB AI — Website Builder · Design, Build & Deploy</title>
        <meta name="description" content="AI-powered website design, builder and deployment for any business. Generate complete HTML websites with stylish templates in minutes."/>
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
        textarea.inp{resize:vertical;line-height:1.6}
        .lbl{font-size:10.5px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:5px}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${AMBER};border-radius:2px}
      `}</style>

      <SixxabNav active="/website-builder"/>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",bottom:24,right:24,zIndex:999,padding:"11px 18px",borderRadius:11,background:toast.ok?"#E1F5EE":"#FEF2F2",border:`1px solid ${toast.ok?"#6EE7B7":"#FECACA"}`,fontSize:13,fontWeight:500,color:toast.ok?"#085041":"#991B1B",boxShadow:"0 4px 16px rgba(0,0,0,.12)",animation:"fadeUp .3s ease"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}

      {/* Header */}
      <div style={{background:N,padding:"16px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(124,58,237,.18)",border:"1.5px solid rgba(124,58,237,.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-device-desktop" style={{fontSize:22,color:"#A78BFA"}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                <h1 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:CHALK,letterSpacing:.5}}>
                  SIXXAB <span style={{color:"#A78BFA",fontStyle:"italic"}}>Website Builder</span>
                </h1>
                <span style={{padding:"2px 9px",borderRadius:20,background:"rgba(124,58,237,.15)",border:"1px solid rgba(124,58,237,.35)",fontSize:10,fontWeight:600,color:"#C4B5FD"}}>COO Suite · Design → Build → Deploy</span>
              </div>
              <p style={{fontSize:12,color:"rgba(245,245,240,.45)"}}>Design · Build HTML · Deploy to Vercel · Connect social media and analytics</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <a href="/agents?cxo=coo" style={{padding:"7px 14px",borderRadius:8,background:"rgba(124,58,237,.2)",border:"1px solid rgba(124,58,237,.4)",fontSize:12,fontWeight:500,color:"#C4B5FD",textDecoration:"none"}}>COO Suite →</a>
            <a href="/social" style={{padding:"7px 14px",borderRadius:8,background:"rgba(239,159,39,.15)",border:"1px solid rgba(239,159,39,.35)",fontSize:12,fontWeight:500,color:AMBER,textDecoration:"none"}}>Social Hub →</a>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 20px 60px"}}>
        <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:16,alignItems:"start"}}>

          {/* Left: form */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>

            {/* Stage selector */}
            <div className="card">
              {STAGES.map((s,i)=>(
                <button key={s.id} onClick={()=>{setStage(s.id);setOutput("")}}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:11,padding:"11px 14px",border:"none",background:stage===s.id?`${s.color}10`:"transparent",borderLeft:`3px solid ${stage===s.id?s.color:"transparent"}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left",borderBottom:i<3?"1px solid #F1F5F9":"none",transition:"all .14s"}}>
                  <div style={{width:30,height:30,borderRadius:8,background:`${s.color}18`,border:`1px solid ${s.color}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <i className={`ti ${s.icon}`} style={{fontSize:13,color:s.color}} aria-hidden="true"/>
                  </div>
                  <div>
                    <div style={{fontSize:9.5,fontFamily:"monospace",color:s.color,letterSpacing:".06em"}}>{s.n}</div>
                    <div style={{fontSize:13,fontWeight:stage===s.id?700:500,color:stage===s.id?N:"#64748B",lineHeight:1.2}}>{s.label}</div>
                    <div style={{fontSize:11,color:"#94A3B8",lineHeight:1.3}}>{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Business details form */}
            <div className="card" style={{padding:"16px"}}>
              <div style={{fontSize:12,fontWeight:600,color:N,marginBottom:12}}>Business details</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div>
                  <label className="lbl">Business name *</label>
                  <input className="inp" placeholder="Dallas Pro HVAC" value={form.bizName} onChange={e=>set("bizName",e.target.value)}/>
                </div>
                <div>
                  <label className="lbl">Industry *</label>
                  <select className="inp" value={form.industry} onChange={e=>set("industry",e.target.value)}>
                    <option value="">Select industry…</option>
                    {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Tagline</label>
                  <input className="inp" placeholder="Keeping Dallas cool since 2010" value={form.tagline} onChange={e=>set("tagline",e.target.value)}/>
                </div>
                <div>
                  <label className="lbl">Services (comma-separated)</label>
                  <textarea className="inp" rows={2} placeholder="AC Installation, Heating Repair, Maintenance Plans" value={form.services} onChange={e=>set("services",e.target.value)}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div>
                    <label className="lbl">Phone</label>
                    <input className="inp" placeholder="+1 (555) 000" value={form.phone} onChange={e=>set("phone",e.target.value)}/>
                  </div>
                  <div>
                    <label className="lbl">Email</label>
                    <input className="inp" placeholder="info@business.com" value={form.email} onChange={e=>set("email",e.target.value)}/>
                  </div>
                </div>
                <div>
                  <label className="lbl">Address / Location</label>
                  <input className="inp" placeholder="Dallas, TX" value={form.address} onChange={e=>set("address",e.target.value)}/>
                </div>
              </div>
            </div>

            {/* Template selector */}
            <div className="card" style={{padding:"14px 16px"}}>
              <div style={{fontSize:12,fontWeight:600,color:N,marginBottom:10}}>Website template</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {TEMPLATES.map(t=>(
                  <div key={t.id} onClick={()=>set("template",t.id)}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:9,border:`1.5px solid ${form.template===t.id?"#7C3AED":"#E2E8F0"}`,background:form.template===t.id?"#F5F3FF":"#fff",cursor:"pointer",transition:"all .14s"}}>
                    <div style={{width:28,height:20,borderRadius:4,background:t.color,border:"1px solid rgba(0,0,0,.1)",flexShrink:0,position:"relative",overflow:"hidden"}}>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,height:6,background:t.accent}}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:form.template===t.id?600:400,color:N}}>{t.label}</div>
                      <div style={{fontSize:10.5,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.desc}</div>
                    </div>
                    {form.template===t.id&&<div style={{width:8,height:8,borderRadius:"50%",background:"#7C3AED",flexShrink:0}}/>}
                  </div>
                ))}
              </div>
            </div>

            {/* Deploy target (for deploy stage) */}
            {stage==="deploy"&&(
              <div className="card" style={{padding:"14px 16px"}}>
                <label className="lbl">Deploy target</label>
                <select className="inp" value={form.deployTarget} onChange={e=>set("deployTarget",e.target.value)}>
                  {DEPLOY_TARGETS.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            )}

            {/* Generate button */}
            <button onClick={generate} disabled={loading||!form.bizName||!form.industry}
              style={{width:"100%",padding:13,borderRadius:11,background:loading||!form.bizName||!form.industry?"#F1F5F9":currentStage.color,color:loading?"#94A3B8":currentStage.color===AMBER?N:"#fff",border:"none",cursor:loading||!form.bizName||!form.industry?"not-allowed":"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:9,transition:"all .15s"}}>
              {loading
                ? <><div style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
                    {stage==="design"?"Designing your site…":stage==="build"?"Building your website…":stage==="deploy"?"Generating deploy guide…":"Generating integration guide…"}</>
                : <><i className={`ti ${currentStage.icon}`} style={{fontSize:14}} aria-hidden="true"/>
                    {stage==="design"?"Design my website →":stage==="build"?"Build my website →":stage==="deploy"?"Generate deploy guide →":"Generate integration guide →"}</>
              }
            </button>
          </div>

          {/* Right: output */}
          <div>
            {!output ? (
              <div className="card" style={{padding:"48px 24px",textAlign:"center",color:"#94A3B8"}}>
                <i className={`ti ${currentStage.icon}`} style={{fontSize:40,color:`${currentStage.color}44`,display:"block",marginBottom:14}} aria-hidden="true"/>
                <div style={{fontSize:15,fontWeight:500,color:"#64748B",marginBottom:8}}>Step {currentStage.n}: {currentStage.label}</div>
                <div style={{fontSize:13,lineHeight:1.65,maxWidth:300,margin:"0 auto"}}>{currentStage.desc}</div>
                <div style={{marginTop:20,fontSize:12.5,color:"#94A3B8"}}>Fill in your business details on the left, then click the generate button.</div>
              </div>
            ) : (
              <div className="card fu">
                {/* Output header */}
                <div style={{padding:"12px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <i className={`ti ${currentStage.icon}`} style={{fontSize:15,color:currentStage.color}} aria-hidden="true"/>
                    <div style={{fontSize:13,fontWeight:600,color:N}}>{form.bizName} — {currentStage.label} complete</div>
                  </div>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {stage==="build"&&generatedHtml&&(
                      <>
                        <button onClick={()=>setPreviewing(p=>!p)}
                          style={{padding:"5px 13px",borderRadius:7,background:"#EFF6FF",border:"1px solid #BFDBFE",fontSize:12,fontWeight:500,color:"#1D4ED8",cursor:"pointer",fontFamily:"inherit"}}>
                          {previewing?"Hide":"👁 Preview"}
                        </button>
                        <button onClick={downloadHtml}
                          style={{padding:"5px 13px",borderRadius:7,background:"#F0FDF4",border:"1px solid #BBF7D0",fontSize:12,fontWeight:500,color:"#085041",cursor:"pointer",fontFamily:"inherit"}}>
                          ↓ Download HTML
                        </button>
                      </>
                    )}
                    <button onClick={copyOutput}
                      style={{padding:"5px 13px",borderRadius:7,background:copied?"#1D9E75":currentStage.color,color:currentStage.color===AMBER&&!copied?N:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"background .2s"}}>
                      {copied?"✓ Copied!":"Copy"}
                    </button>
                  </div>
                </div>
                {/* Vercel deploy result */}
                {deployResult && (
                  <div style={{padding:"12px 16px",borderBottom:"1px solid #E8ECF4",background:deployResult.deployed?"#F0FDF4":"#FFFBF2"}}>
                    {deployResult.deployed ? (
                      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:"#1D9E75",flexShrink:0}}/>
                        <span style={{fontSize:13,fontWeight:600,color:"#085041"}}>Deploying to Vercel…</span>
                        {deployResult.url&&<a href={deployResult.url} target="_blank" rel="noopener noreferrer" style={{fontSize:12.5,color:"#1D9E75",fontWeight:600,textDecoration:"none"}}>{deployResult.url} ↗</a>}
                        <a href={deployResult.dashboard} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#64748B",textDecoration:"none"}}>Vercel dashboard ↗</a>
                        <span style={{fontSize:11.5,color:"#94A3B8"}}>{deployResult.eta}</span>
                      </div>
                    ) : (
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:"#92400E",marginBottom:4}}>{deployResult.message}</div>
                        {deployResult.setup&&<div style={{fontSize:12,color:"#64748B",lineHeight:1.65}}>{deployResult.setup}</div>}
                      </div>
                    )}
                  </div>
                )}

                {/* Preview iframe */}
                {previewing&&generatedHtml&&(
                  <div style={{borderBottom:"1px solid #E8ECF4"}}>
                    <div style={{padding:"8px 14px",background:"#F1F5F9",fontSize:11,color:"#64748B",display:"flex",alignItems:"center",gap:6}}>
                      <i className="ti ti-device-desktop" style={{fontSize:12}} aria-hidden="true"/>
                      Live preview — this is exactly how the website will look
                    </div>
                    <iframe
                      srcDoc={generatedHtml}
                      style={{width:"100%",height:500,border:"none",display:"block"}}
                      sandbox="allow-same-origin"
                      title="Website preview"
                    />
                  </div>
                )}

                {/* Social page creator (stage: social) */}
                {stage==="social" && !output && (
                  <div style={{padding:"16px 18px"}}>
                    <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:12}}>Generate your social media page content</div>
                    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                      {[["linkedin","LinkedIn","#0A66C2","ti-brand-linkedin"],["facebook","Facebook","#1877F2","ti-brand-facebook"],["instagram","Instagram","#E1306C","ti-brand-instagram"],["twitter","Twitter / X","#000","ti-brand-x"]].map(([id,label,color,icon])=>(
                        <button key={id} onClick={()=>setSocialPlatform(id)}
                          style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:20,border:`1.5px solid ${socialPlatform===id?color:"#E2E8F0"}`,background:socialPlatform===id?`${color}12`:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:socialPlatform===id?600:400,color:socialPlatform===id?color:N,transition:"all .14s"}}>
                          <i className={`ti ${icon}`} style={{fontSize:13,color:socialPlatform===id?color:"#94A3B8"}} aria-hidden="true"/>
                          {label}
                        </button>
                      ))}
                    </div>
                    <button onClick={createSocialPage} disabled={socialLoading||!form.bizName||!form.industry}
                      style={{width:"100%",padding:"11px",borderRadius:10,background:socialLoading||!form.bizName||!form.industry?"#F1F5F9":"#EC4899",color:socialLoading||!form.bizName?"#94A3B8":"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13.5,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      {socialLoading?<><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Creating {socialPlatform} page…</>:<><i className={`ti ti-brand-${socialPlatform}`} style={{fontSize:14}} aria-hidden="true"/>Create {socialPlatform} page content →</>}
                    </button>
                    {socialOutput&&(
                      <div style={{marginTop:14,fontSize:13.5,lineHeight:1.85,whiteSpace:"pre-wrap",maxHeight:500,overflowY:"auto",color:N}}>{socialOutput}</div>
                    )}
                  </div>
                )}
                {/* Text output */}
                {(stage!=="social" || output) && (
                <div style={{padding:"18px 20px",fontSize:13.5,lineHeight:1.85,whiteSpace:"pre-wrap",maxHeight:600,overflowY:"auto",color:N,fontFamily:stage==="build"?"'DM Mono',monospace":"inherit",fontSize:stage==="build"?12:13.5}}>
                  {output}
                </div>
                )}

                {/* Next step CTA */}
                <div style={{padding:"12px 16px",borderTop:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  {stage==="design" && <button onClick={()=>{setStage("build");setOutput("")}} style={{padding:"7px 16px",borderRadius:8,background:N,color:CHALK,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:600}}>Next: Build website →</button>}
                  {stage==="build" && generatedHtml && (
                    <button onClick={deployToVercel} disabled={deploying}
                      style={{padding:"7px 16px",borderRadius:8,background:deploying?"#F1F5F9":N,color:deploying?"#94A3B8":CHALK,border:"none",cursor:deploying?"not-allowed":"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                      {deploying?<><div style={{width:12,height:12,border:"2px solid rgba(245,245,240,.3)",borderTopColor:CHALK,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Deploying…</>:<><i className="ti ti-brand-vercel" style={{fontSize:12}} aria-hidden="true"/>Deploy to Vercel</>}
                    </button>
                  )}
                  {stage==="build" && <button onClick={()=>{setStage("deploy");setOutput("")}} style={{padding:"7px 16px",borderRadius:8,background:"#1D9E75",color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:600}}>Manual deploy guide →</button>}
                  {stage==="deploy" && <button onClick={()=>{setStage("connect");setOutput("")}} style={{padding:"7px 16px",borderRadius:8,background:"#EC4899",color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:600}}>Next: Connect social media →</button>}
                  {stage==="social" && <a href="/social" style={{padding:"7px 16px",borderRadius:8,background:"#EC4899",color:"#fff",textDecoration:"none",fontSize:12.5,fontWeight:600}}>Manage in Social Hub →</a>}
                  {stage==="connect"&& <a href="/social" style={{padding:"7px 16px",borderRadius:8,background:AMBER,color:N,textDecoration:"none",fontSize:12.5,fontWeight:600}}>Open Social Hub →</a>}
                  <a href="/agents?cxo=coo" style={{fontSize:12,color:"#64748B",textDecoration:"none"}}>More in COO Suite →</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
