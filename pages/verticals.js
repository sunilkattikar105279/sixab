// pages/verticals.js — SIXXAB AI · Global Vertical Agent Packs
// 30 packs across 3 tiers: Texas/Local · US National · Europe & Global
import { useState, useEffect } from "react"
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

const TIERS = [
  {
    id:"texas", label:"Texas & Local", icon:"🤠", color:AMBER,
    desc:"Pre-built for the businesses that power Dallas, DFW and Texas. Industry language, customer patterns and workflows already tuned.",
    packs:[
      {id:"hvac",       icon:"❄️", name:"HVAC & Air Conditioning", color:"#0EA5E9", market:"47,000+ businesses in Texas", phase:"Phase 02–04",
       agents:["Seasonal campaign scripts","Service quote generator","Maintenance reminder sequences","Tech scheduling prompts","Review request automation","Neighbour referral scripts"]},
      {id:"realestate", icon:"🏠", name:"Real Estate & Property",   color:"#1D9E75", market:"150,000+ agents in Texas", phase:"Phase 02–04",
       agents:["Listing description writer","Buyer/seller outreach scripts","CMA report builder","Open house follow-up sequences","Market update newsletter","Investor property outreach"]},
      {id:"legal",      icon:"⚖️", name:"Legal Services",           color:"#7C3AED", market:"$8.2B Texas legal market", phase:"Phase 02–05",
       agents:["Client intake forms","Retainer proposal writer","Billing reminder scripts","Practice area content calendar","Referral network builder","Case update communications"]},
      {id:"consulting", icon:"📊", name:"Business Consulting",      color:"#EF9F27", market:"Growing 12% YoY in DFW", phase:"Phase 02–05",
       agents:["Proposal writer","ROI calculator","Case study builder","LinkedIn thought leadership","Discovery call script","Engagement follow-up sequences"]},
      {id:"landscaping",icon:"🌿", name:"Landscaping & Lawn Care",  color:"#16A34A", market:"$1.4B Texas landscaping market", phase:"Phase 02–03",
       agents:["Seasonal upsell scripts","HOA contract templates","Route optimisation prompts","Google review requests","Neighbour door-hanger scripts","Annual contract renewals"]},
      {id:"plumbing",   icon:"🔧", name:"Plumbing & Electrical",    color:"#DC2626", market:"35,000+ licensed contractors in TX", phase:"Phase 02–03",
       agents:["Emergency response scripts","Maintenance plan upsell","Insurance doc templates","Referral programme builder","Real estate agent network outreach","Review requests"]},
      {id:"autorepair", icon:"🚗", name:"Auto Repair & Detailing",  color:"#F59E0B", market:"$4.1B Texas auto service market", phase:"Phase 02–03",
       agents:["Service reminder sequences","Loyalty programme scripts","Fleet account outreach","Review request automation","Seasonal campaign scripts","Vehicle birthday messages"]},
      {id:"health",     icon:"💊", name:"Health & Wellness",        color:"#EC4899", market:"$2.8B Texas fitness market", phase:"Phase 02–04",
       agents:["New client onboarding","Package upsell sequences","Corporate wellness proposals","Referral programme","Progress check-in sequences","Event and workshop promotion"]},
      {id:"roofing",    icon:"🏗️", name:"Roofing & Construction",  color:"#6B7280", market:"Texas #1 roofing market in US", phase:"Phase 02–04",
       agents:["Storm season campaigns","Insurance claim guidance","Estimate scripts","Subcontractor outreach","Project proposal generator","HOA and property manager outreach"]},
      {id:"it",         icon:"💼", name:"IT Support & MSP",         color:"#378ADD", market:"$12.4B Texas IT services market", phase:"Phase 02–05",
       agents:["Monthly retainer proposal","Security audit template","QBR deck generator","Onboarding checklist","Upsell sequences","Client health score alerts"]},
    ]
  },
  {
    id:"us", label:"US National", icon:"🇺🇸", color:"#378ADD",
    desc:"Scaled for US-wide operations. Compliance, licensing and customer language tuned for the full American market.",
    packs:[
      {id:"hvac_us",       icon:"❄️", name:"HVAC — US National",      color:"#0284C7", market:"$156B US HVAC market", phase:"Phase 04–06",
       agents:["National franchise outreach","Multi-state contract templates","Federal energy rebate campaigns (IRA)","EPA Section 608 compliance","National technician recruiting","Multi-market scheduling"]},
      {id:"realestate_us", icon:"🏠", name:"Real Estate — US National",color:"#0D9488", market:"$4.4T US residential market", phase:"Phase 04–06",
       agents:["Multi-market investment outreach","Commercial RE proposals","1031 exchange guidance scripts","National broker network outreach","PropTech partnership proposals","REIT investor communications"]},
      {id:"fintech",       icon:"💳", name:"FinTech — US",             color:"#7C3AED", market:"$72B US FinTech investment (2024)", phase:"Phase 03–05",
       agents:["B2B payments pitch deck","Lending platform onboarding","InsurTech proposal templates","FINRA/SEC compliance checklist","Banking partnership outreach","Investor update for FinTech KPIs"]},
      {id:"ecommerce",     icon:"🛒", name:"E-Commerce — US",          color:"#F59E0B", market:"$1.1T US e-commerce (2024)", phase:"Phase 02–05",
       agents:["DTC brand launch scripts","Amazon FBA optimisation","Shopify email sequences","Post-purchase retention flows","Wholesale buyer outreach","Influencer partnership proposals"]},
      {id:"education",     icon:"🏫", name:"EdTech — US",              color:"#8B5CF6", market:"$146B US EdTech market", phase:"Phase 03–05",
       agents:["Online course launch scripts","Corporate L&D proposals","K-12 district sales outreach","Tutoring platform acquisition","University partnership letters","Course completion retention sequences"]},
      {id:"hospitality",   icon:"🏨", name:"Hospitality — US",         color:"#EF4444", market:"$950B US hospitality industry", phase:"Phase 02–04",
       agents:["Hotel revenue management scripts","Restaurant group expansion","Franchise development proposals","OTA optimisation guide","Guest review request sequences","Corporate travel account outreach"]},
      {id:"manufacturing", icon:"🏭", name:"Manufacturing — US",       color:"#64748B", market:"$2.9T US manufacturing GDP", phase:"Phase 03–05",
       agents:["B2B industrial sales outreach","Contract manufacturing proposals","OSHA compliance checklist","Lean process documentation","Supplier relationship scripts","Industry trade show follow-up"]},
      {id:"logistics",     icon:"🚛", name:"Logistics & Supply Chain",  color:"#0EA5E9", market:"$1.6T US logistics market", phase:"Phase 03–05",
       agents:["3PL business development pitch","Freight broker outreach scripts","Shipper RFP responses","DOT compliance checklist","Last-mile partner outreach","Cross-border USMCA documentation"]},
      {id:"media",         icon:"🎬", name:"Media & Content — US",     color:"#D4537E", market:"$700B US media & entertainment", phase:"Phase 02–04",
       agents:["Newsletter monetisation strategy","Podcast sponsor outreach","YouTube partnership proposals","Content licensing templates","Brand deal negotiation scripts","Subscriber retention sequences"]},
      {id:"nonprofit",     icon:"❤️", name:"Non-Profit — US",          color:"#16A34A", market:"1.5M registered 501(c)(3)s in US", phase:"Phase 02–04",
       agents:["Grant application templates","Major donor cultivation scripts","Corporate sponsorship proposals","Impact report writer","Volunteer recruitment campaigns","Year-end giving appeal sequences"]},
    ]
  },
  {
    id:"europe", label:"Europe & Global", icon:"🌍", color:"#7C3AED",
    desc:"Configured for European regulations, market language and business culture — UK, DACH, France, Nordics, Benelux and beyond.",
    packs:[
      {id:"hvac_eu",          icon:"❄️", name:"HVAC — Europe",          color:"#0369A1", market:"€119B European HVAC market", phase:"Phase 04–06",
       agents:["UK Boiler Upgrade Scheme campaigns","EU heat pump incentive scripts","F-Gas compliance checklist","EPBD energy efficiency outreach","Cross-border franchise templates","German Energieberatung positioning"]},
      {id:"realestate_eu",    icon:"🏠", name:"Real Estate — Europe",   color:"#0F766E", market:"€1.4T European property market", phase:"Phase 04–06",
       agents:["UK lettings compliance (EPC, licensing)","German property investment outreach","French immobilier scripts","Spanish Golden Visa positioning","EU AML compliance checklist","PropTech platform partnership letters"]},
      {id:"legal_eu",         icon:"⚖️", name:"Legal Services — Europe",color:"#6D28D9", market:"€200B European legal services market", phase:"Phase 03–05",
       agents:["GDPR compliance advisory scripts","EU commercial contract templates","Cross-border dispute guidance","UK SRA compliance checklist","German legal market positioning","EU data protection retainer proposal"]},
      {id:"fintech_eu",       icon:"💳", name:"FinTech — Europe",       color:"#4F46E5", market:"€100B European FinTech ecosystem", phase:"Phase 03–05",
       agents:["FCA authorisation roadmap","EMI licence application guide","PSD2/Open Banking pitch deck","DORA compliance checklist","EU passporting strategy","MiCA crypto compliance guide"]},
      {id:"saas_eu",          icon:"☁️", name:"SaaS — Europe",          color:"#1E3A5F", market:"€130B European SaaS market", phase:"Phase 03–05",
       agents:["GDPR-native positioning scripts","EU AI Act compliance guide","DACH enterprise sales outreach","French enterprise decision maker scripts","Nordics SaaS partnership proposals","EU data residency FAQ for prospects"]},
      {id:"healthcare_eu",    icon:"🏥", name:"HealthTech — Europe",    color:"#BE185D", market:"€46B European digital health market", phase:"Phase 03–05",
       agents:["NHS Digital procurement proposal","EU MDR CE marking checklist","German DiGA approval roadmap","French digital health scripts","Health data GDPR compliance template","Payer reimbursement pathway guide"]},
      {id:"retail_eu",        icon:"🛍️", name:"Retail & Commerce — EU", color:"#B45309", market:"€7.5T European retail market", phase:"Phase 03–05",
       agents:["EU consumer rights compliance checklist","VAT OSS registration guide","Amazon Europe marketplace scripts","Zalando/ASOS partner pitch templates","Sustainable retail positioning","EU returns policy generator"]},
      {id:"manufacturing_eu", icon:"🏭", name:"Manufacturing — Europe", color:"#475569", market:"€1.9T EU manufacturing GDP", phase:"Phase 04–06",
       agents:["CE marking requirements guide","EU supply chain due diligence scripts","German Mittelstand positioning","Industry 4.0 adoption proposals","EU Green Deal compliance checklist","European B2B industrial outreach"]},
      {id:"sustainability",   icon:"🌱", name:"Sustainability & ESG",   color:"#15803D", market:"$40T sustainable finance (global)", phase:"Phase 04–06",
       agents:["CSRD reporting template","UK SECR carbon reporting guide","B Corp certification checklist","Carbon accounting methodology","ESG investor report generator","Green procurement proposal templates"]},
      {id:"govtech",          icon:"🏛️", name:"GovTech & Public Sector", color:"#1E40AF", market:"$1.1T global GovTech market", phase:"Phase 04–06",
       agents:["UK G-Cloud listing guide","EU OJEU procurement templates","US GSA Schedule proposal","Civic tech pitch deck","Government RFP response templates","Digital transformation business case"]},
    ]
  },
]

// All packs flat for search
const ALL_PACKS = TIERS.flatMap(t => t.packs.map(p => ({...p, tier:t.id, tierLabel:t.label, tierColor:t.color})))

export default function VerticalsPage() {
  const [activeTier,    setActiveTier]    = useState("texas")
  const [activePack,    setActivePack]    = useState("hvac")
  const [search,        setSearch]        = useState("")
  const [crmData,       setCrmData]       = useState([])

  useEffect(() => {
    try { setCrmData(JSON.parse(localStorage.getItem("sixxab_crm_contacts") || "[]")) } catch {}
  }, [])

  const tier = TIERS.find(t => t.id === activeTier) || TIERS[0]
  const pack = ALL_PACKS.find(p => p.id === activePack) || ALL_PACKS[0]
  const packTier = TIERS.find(t => t.packs.find(p => p.id === activePack))

  const searchResults = search.length > 1
    ? ALL_PACKS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.agents.some(a => a.toLowerCase().includes(search.toLowerCase())))
    : []

  const vContacts = crmData.filter(c =>
    c.tags?.includes(activePack) ||
    c.role?.toLowerCase().includes(pack.name.split(" ")[0].toLowerCase())
  )

  return (
    <>
      <Head>
        <title>SIXXAB AI — Global Vertical Agent Packs · 30 Industries</title>
        <meta name="description" content="30 vertical AI agent packs across Texas, US national and European markets. Pre-built workflows, scripts and templates for your exact industry."/>
      </Head>
      <style>{`
        body{background:#F4F4F0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
        .fu{animation:fadeUp .3s ease both}
        .si{animation:slideIn .28s ease both}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        .pack-btn{display:flex;align-items:center;gap:8px;width:100%;padding:10px 12px;border:none;background:transparent;cursor:pointer;text-align:left;font-family:inherit;border-radius:9px;transition:all .14s;border-left:3px solid transparent}
        .pack-btn:hover{background:#F8F9FA}
        .pack-btn.on{background:#F8F9FA;border-left-color:var(--pc)}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#EF9F27;border-radius:2px}
      `}</style>

      <SixxabNav active="/verticals"/>

      {/* Page header */}
      <div style={{background:N,padding:"18px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:"rgba(236,72,153,.18)",border:"1.5px solid rgba(236,72,153,.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-building-factory" style={{fontSize:22,color:"#EC4899"}} aria-hidden="true"/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                <h1 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:CHALK,letterSpacing:.5}}>
                  SIXXAB <span style={{color:"#EC4899",fontStyle:"italic"}}>Vertical Agent Packs</span>
                </h1>
                <span style={{padding:"2px 9px",borderRadius:20,background:"rgba(236,72,153,.15)",border:"1px solid rgba(236,72,153,.35)",fontSize:10,fontWeight:600,color:"#F9A8D4"}}>Phase 06 — Global · 30 packs</span>
              </div>
              <p style={{fontSize:12,color:"rgba(245,245,240,.45)"}}>Texas & Local · US National · Europe & Global · 3 geographic tiers</p>
            </div>
          </div>
          {/* Search */}
          <div style={{position:"relative",minWidth:260}}>
            <i className="ti ti-search" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"rgba(245,245,240,.4)",fontSize:13}} aria-hidden="true"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search all 30 vertical packs…"
              style={{width:"100%",padding:"8px 12px 8px 32px",borderRadius:9,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.07)",color:CHALK,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
            {search && (
              <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",boxShadow:"0 8px 24px rgba(0,0,0,.12)",zIndex:50,maxHeight:260,overflowY:"auto"}}>
                {searchResults.length === 0
                  ? <div style={{padding:"12px 14px",fontSize:13,color:"#94A3B8"}}>No packs match "{search}"</div>
                  : searchResults.map(p=>(
                    <div key={p.id} onClick={()=>{setActiveTier(p.tier);setActivePack(p.id);setSearch("")}}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #F1F5F9"}}
                      onMouseOver={e=>e.currentTarget.style.background="#F8F9FA"}
                      onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{fontSize:20}}>{p.icon}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:500,color:N}}>{p.name}</div>
                        <div style={{fontSize:10.5,color:"#94A3B8"}}>{p.tierLabel} · {p.market}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tier tabs */}
      <div style={{background:"#FAFAFA",borderBottom:"1px solid #E8ECF4",padding:"10px 4%",display:"flex",gap:8}}>
        {TIERS.map(t=>(
          <button key={t.id} onClick={()=>{setActiveTier(t.id);setActivePack(t.packs[0].id)}}
            style={{display:"flex",alignItems:"center",gap:7,padding:"8px 18px",borderRadius:10,border:`2px solid ${activeTier===t.id?t.color:"#E2E8F0"}`,background:activeTier===t.id?`${t.color}10`:"#fff",cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
            <span style={{fontSize:18}}>{t.icon}</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:13,fontWeight:600,color:activeTier===t.id?N:"#64748B"}}>{t.label}</div>
              <div style={{fontSize:10,color:activeTier===t.id?t.color:"#94A3B8"}}>{t.packs.length} packs</div>
            </div>
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#64748B"}}>
          <span style={{fontWeight:600,color:N}}>30</span> total vertical packs
          <span style={{color:"#CBD5E1"}}>·</span>
          <a href="/niche-validator" style={{color:AMBER,fontWeight:500,textDecoration:"none"}}>🎯 Validate your niche →</a>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"220px 1fr",height:"calc(100vh - 170px)",overflow:"hidden"}}>

        {/* Pack list */}
        <div style={{borderRight:"1px solid #E8ECF4",background:"#FAFAFA",overflowY:"auto",padding:"10px 8px"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",padding:"4px 8px 8px"}}>{tier.label}</div>
          {tier.packs.map(p=>(
            <button key={p.id} className={`pack-btn${activePack===p.id?" on":""}`}
              style={{"--pc":p.color}} onClick={()=>setActivePack(p.id)}>
              <span style={{fontSize:20,flexShrink:0}}>{p.icon}</span>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12.5,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{fontSize:10,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.market.split(" ").slice(0,3).join(" ")}</div>
              </div>
              {activePack===p.id && <div style={{width:6,height:6,borderRadius:"50%",background:p.color,flexShrink:0,marginLeft:"auto"}}/>}
            </button>
          ))}
        </div>

        {/* Pack detail */}
        <div style={{overflowY:"auto",padding:"20px 24px"}} className="si" key={activePack}>
          {/* Pack header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:56,height:56,borderRadius:14,background:`${pack.color}18`,border:`2px solid ${pack.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>
                {pack.icon}
              </div>
              <div>
                <h2 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:N,letterSpacing:.3,marginBottom:4}}>{pack.name}</h2>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:8,background:`${pack.color}15`,color:pack.color}}>{pack.market}</span>
                  <span style={{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:8,background:"rgba(239,159,39,.12)",color:AMBER}}>{pack.phase}</span>
                  <span style={{fontSize:11,padding:"2px 9px",borderRadius:8,background:`${packTier?.color}12`,color:packTier?.color,fontWeight:500}}>{packTier?.icon} {packTier?.label}</span>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <a href="/niche-validator" style={{padding:"8px 16px",borderRadius:9,background:pack.color,color:["#EF9F27","#F59E0B","#FBBF24"].includes(pack.color)?N:"#fff",fontSize:12,fontWeight:600,textDecoration:"none"}}>
                🎯 Validate this niche →
              </a>
              <a href="/orchestrator" style={{padding:"8px 16px",borderRadius:9,border:"1px solid #E2E8F0",background:"#fff",fontSize:12,fontWeight:500,color:N,textDecoration:"none"}}>
                Run Orchestrator →
              </a>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {/* Agents */}
            <div className="card">
              <div style={{padding:"11px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",fontSize:12,fontWeight:600,color:N}}>
                AI Agents in this pack
              </div>
              <div style={{padding:"12px 16px"}}>
                {pack.agents.map((a,i)=>(
                  <div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:i<pack.agents.length-1?"1px solid #F1F5F9":"none",alignItems:"flex-start"}}>
                    <div style={{width:26,height:26,borderRadius:7,background:`${pack.color}18`,border:`1px solid ${pack.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:pack.color,flexShrink:0}}>{i+1}</div>
                    <div style={{fontSize:13,color:N,lineHeight:1.5}}>{a}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {/* Quick workflow */}
              <div className="card" style={{padding:16}}>
                <div style={{fontSize:12,fontWeight:600,color:N,marginBottom:12}}>Quick start — 4 steps</div>
                {[
                  {n:"1",title:"Validate",desc:`Run SIXXAB Niche Selector for ${pack.name.split(" ")[0]} in your target market`,link:"/niche-validator"},
                  {n:"2",title:"Import contacts",desc:"Add your customer list to SIXXAB CRM — tagged for this vertical",link:"/crm"},
                  {n:"3",title:"Run Orchestrator",desc:`Set goal: "Get 10 ${pack.name.split(" ")[0]} clients this month"`,link:"/orchestrator"},
                  {n:"4",title:"CXO Suite",desc:"Use HOV and CMO advisors for vertical-specific outreach strategies",link:"/agents"},
                ].map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:9,marginBottom:10}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:`${pack.color}20`,border:`1px solid ${pack.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:pack.color,flexShrink:0}}>{s.n}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:500,color:N,marginBottom:1}}>{s.title}</div>
                      <div style={{fontSize:11.5,color:"#64748B",marginBottom:3}}>{s.desc}</div>
                      <a href={s.link} style={{fontSize:11,color:pack.color,textDecoration:"none",fontWeight:500}}>→ Open {s.link.replace("/","")}</a>
                    </div>
                  </div>
                ))}
              </div>

              {/* CRM contacts */}
              <div className="card" style={{padding:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:600,color:N}}>SIXXAB CRM contacts</div>
                  <a href="/crm" style={{fontSize:11,color:"#1D9E75",textDecoration:"none",fontWeight:500}}>Open CRM →</a>
                </div>
                {vContacts.length===0 ? (
                  <div style={{fontSize:12.5,color:"#94A3B8",padding:"10px 0"}}>
                    No contacts tagged for {pack.name.split(" ")[0]} yet.
                    <a href="/crm" style={{color:"#378ADD",marginLeft:4}}>Import from LinkedIn →</a>
                  </div>
                ) : vContacts.slice(0,5).map(c=>(
                  <div key={String(c.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F1F5F9"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:`${pack.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,color:pack.color,flexShrink:0}}>
                      {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                    </div>
                    <div style={{flex:1,fontSize:12,color:N}}>{c.name}</div>
                    <span style={{fontSize:10,padding:"1px 6px",borderRadius:6,background:`${pack.color}15`,color:pack.color}}>{c.stage}</span>
                  </div>
                ))}
              </div>

              {/* Phase connection */}
              <div style={{background:N,borderRadius:13,padding:16}}>
                <div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:700,color:CHALK,marginBottom:6}}>Phase connection</div>
                <div style={{fontSize:12,color:"rgba(245,245,240,.5)",lineHeight:1.65,marginBottom:12}}>
                  This vertical pack is active in <strong style={{color:AMBER}}>{pack.phase}</strong> of the SIXXAB framework.
                  {packTier?.id==="europe" && " European regulations, GDPR compliance and local market language pre-configured."}
                  {packTier?.id==="us" && " US federal and state compliance, national market language pre-configured."}
                  {packTier?.id==="texas" && " Texas market language, local customer patterns and DFW-specific workflows pre-configured."}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <a href="/orchestrator" style={{flex:1,padding:"8px",borderRadius:8,background:AMBER,color:N,fontSize:12,fontWeight:600,textDecoration:"none",textAlign:"center"}}>Run Orchestrator →</a>
                  <a href="/roadmap" style={{flex:1,padding:"8px",borderRadius:8,border:"1px solid rgba(255,255,255,.15)",color:CHALK,fontSize:12,textDecoration:"none",textAlign:"center"}}>View Roadmap</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
