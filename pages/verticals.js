// pages/verticals.js — SIXXAB AI Vertical Agent Packs
// 10 industry-specific agent dashboards — linked to Global Phase 3
import { useState, useEffect } from "react"
import Head from "next/head"
import SixxabNav from "../components/SixxabNav"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

const VERTICALS = [
  {
    id:"hvac", icon:"❄️", name:"HVAC & Air Conditioning", color:"#0EA5E9", bg:"#EFF6FF",
    market:"47,000+ businesses in Texas", phase:"Phase 2 — Scale",
    tagline:"Win more HVAC jobs with AI-powered outreach, quoting and seasonal campaigns",
    agents:[
      {name:"Campaign Agent",    icon:"📣", desc:"Seasonal email and DM campaigns tuned to Texas summer/winter demand cycles"},
      {name:"Quote Agent",       icon:"📋", desc:"Instant service quotes with parts, labour and margin pre-calculated"},
      {name:"Scheduling Agent",  icon:"🗓️", desc:"Technician dispatch scripts and appointment confirmation sequences"},
      {name:"Review Agent",      icon:"⭐", desc:"Automated Google review requests sent 24hrs after job completion"},
      {name:"Referral Agent",    icon:"🤝", desc:"Referral programme scripts — neighbor-to-neighbor outreach for DFW areas"},
    ],
    workflows:[
      {step:"1",title:"Run Niche Selector",desc:"Validate your specific HVAC sub-niche — residential, commercial, or industrial — and get DFW market sizing"},
      {step:"2",title:"Import your contacts",desc:"Add your existing customer list to SIXXAB CRM. Campaign Agent segments by last service date and equipment age"},
      {step:"3",title:"Launch seasonal campaign",desc:"Set goal: 'Book 20 A/C tune-ups before summer peak.' Orchestrator runs all agents in parallel"},
      {step:"4",title:"Automate follow-up",desc:"Review Agent fires 24hrs after each completed job. Referral Agent sends scripts to satisfied customers"},
    ],
    crmFields:["Service address","Equipment make/model","Last service date","Contract type","Technician assigned","Next service due"],
    metrics:["Jobs booked","Revenue per job","Review count","Referrals sent","Close rate","Repeat customers"],
  },
  {
    id:"realestate", icon:"🏠", name:"Real Estate & Property", color:"#1D9E75", bg:"#F0FDF4",
    market:"150,000+ agents in Texas", phase:"Phase 2 — Scale",
    tagline:"More listings, faster closes, and a content engine that keeps you top of mind",
    agents:[
      {name:"Listing Agent",    icon:"🏡", desc:"AI listing descriptions from address + 5 bullets. Professional copy in 10 seconds"},
      {name:"Buyer Agent",      icon:"👥", desc:"Personalised buyer outreach scripts for new listings matching their saved criteria"},
      {name:"CMA Agent",        icon:"📊", desc:"Comparative market analysis narratives for seller presentations"},
      {name:"Open House Agent", icon:"🚪", desc:"Follow-up sequence for open house visitors — text, email and DM variants"},
      {name:"Content Agent",    icon:"✍️", desc:"Weekly market update posts for Instagram, LinkedIn and email newsletter"},
    ],
    workflows:[
      {step:"1",title:"Validate your niche",desc:"SIXXAB Niche Selector analyses your target zip codes, price range and buyer/seller split"},
      {step:"2",title:"Import your database",desc:"CSV upload of your MLS contacts into SIXXAB CRM. Tagged by buyer/seller/investor/referral"},
      {step:"3",title:"Generate listing content",desc:"Input address and 5 property features. Listing Agent writes MLS description, social posts and email blast"},
      {step:"4",title:"Run follow-up sequences",desc:"Open House Agent auto-sends Day 1, Day 3 and Day 7 messages to every visitor"},
    ],
    crmFields:["Property interest","Budget range","Timeline","Pre-approval status","Preferred areas","Last contact"],
    metrics:["Active listings","Buyer leads","Days on market","Close rate","Commission pipeline","Reviews"],
  },
  {
    id:"legal", icon:"⚖️", name:"Legal Services", color:"#7C3AED", bg:"#F5F3FF",
    market:"$8.2B Texas legal market", phase:"Phase 3 — Global",
    tagline:"Attract better clients, present professionally, and bill without chasing",
    agents:[
      {name:"Intake Agent",    icon:"📝", desc:"Client intake form generator tailored to practice area — family, business, criminal, PI"},
      {name:"Proposal Agent",  icon:"📄", desc:"Retainer proposal writer with scope, timeline and fee structure"},
      {name:"Billing Agent",   icon:"💰", desc:"Billing reminder sequences — professional, persistent, non-aggressive"},
      {name:"Content Agent",   icon:"✍️", desc:"Educational content for LinkedIn and blog — builds referral network authority"},
      {name:"Referral Agent",  icon:"🤝", desc:"Scripts for building relationships with CPAs, financial planners and real estate attorneys"},
    ],
    workflows:[
      {step:"1",title:"Validate your practice niche",desc:"Niche Selector ranks your top 3 practice areas by DFW market demand and competition"},
      {step:"2",title:"Set up intake system",desc:"Intake Agent generates custom forms for each practice area. Add to website via embed"},
      {step:"3",title:"Automate proposals",desc:"After inquiry, Proposal Agent drafts retainer agreement in 60 seconds. Sunil reviews and sends"},
      {step:"4",title:"Build referral network",desc:"Content Agent publishes weekly legal tips. Referral Agent manages CPA and planner relationships"},
    ],
    crmFields:["Practice area","Matter type","Retainer amount","Billing rate","Referral source","Matter status"],
    metrics:["New matters","Retainer value","Collection rate","Referrals received","Content reach","Pipeline value"],
  },
  {
    id:"consulting", icon:"📊", name:"Business Consulting", color:"#EF9F27", bg:"#FFFBF2",
    market:"Growing 12% YoY in DFW", phase:"Phase 2 — Scale",
    tagline:"Close bigger retainers, deliver faster and build the referral engine that replaces cold outreach",
    agents:[
      {name:"Proposal Agent", icon:"📄", desc:"Consulting proposal writer — scope, deliverables, timeline, investment and ROI case"},
      {name:"Discovery Agent", icon:"🔍", desc:"Discovery call script and intake questionnaire tuned to your consulting focus"},
      {name:"ROI Agent",      icon:"📈", desc:"ROI calculator and business case builder for client presentations"},
      {name:"Case Study Agent",icon:"📋", desc:"Client success story writer from bullet points — for website and LinkedIn"},
      {name:"LinkedIn Agent",  icon:"💼", desc:"Thought leadership content calendar — 3 posts per week, 52-week plan"},
    ],
    workflows:[
      {step:"1",title:"Define your consulting niche",desc:"Niche Selector finds your highest-value positioning — operations, growth, digital, HR or finance"},
      {step:"2",title:"Build your proposal system",desc:"Proposal Agent creates reusable templates for each engagement type. Personalised in 90 seconds"},
      {step:"3",title:"Publish thought leadership",desc:"LinkedIn Agent plans 52 weeks of content. You review and publish. Builds inbound pipeline"},
      {step:"4",title:"Convert engagements to retainers",desc:"After project delivery, ROI Agent documents results. Case Study Agent writes the success story"},
    ],
    crmFields:["Engagement type","Monthly retainer","Project scope","Start date","Key stakeholder","Revenue generated for client"],
    metrics:["Active retainers","Monthly retainer MRR","Proposal win rate","Average engagement value","Referrals","LinkedIn reach"],
  },
  {
    id:"landscaping", icon:"🌿", name:"Landscaping & Lawn Care", color:"#16A34A", bg:"#F0FDF4",
    market:"$1.4B Texas landscaping market", phase:"Phase 2 — Scale",
    tagline:"Fill your schedule, lock in annual contracts and build a referral machine in your target zip codes",
    agents:[
      {name:"Seasonal Agent",  icon:"🌞", desc:"Spring, summer, fall and winter campaign scripts tuned to Texas weather patterns"},
      {name:"Contract Agent",  icon:"📄", desc:"Annual maintenance contract templates and upsell scripts for existing customers"},
      {name:"HOA Agent",       icon:"🏘️", desc:"HOA and property manager outreach — the highest-value accounts in DFW"},
      {name:"Review Agent",    icon:"⭐", desc:"Google review request sequences sent after every completed job"},
      {name:"Neighbour Agent", icon:"🚪", desc:"Door-to-door and next-door scripts — turn one job into a street contract"},
    ],
    workflows:[
      {step:"1",title:"Map your target zip codes",desc:"Niche Selector identifies highest-density residential areas in DFW with lowest competition"},
      {step:"2",title:"Import customer database",desc:"Upload existing customer list. Contract Agent identifies who's due for renewal or upsell"},
      {step:"3",title:"Launch neighbourhood campaigns",desc:"Neighbour Agent generates door hanger scripts and next-door social posts by street"},
      {step:"4",title:"Lock in annual contracts",desc:"Contract Agent sends upsell sequences to seasonal customers converting them to annual plans"},
    ],
    crmFields:["Service address","Lot size","Service frequency","Contract type","Last mow date","Annual contract value"],
    metrics:["Jobs this week","Annual contracts","Revenue per customer","Google reviews","Referrals","Zip code penetration"],
  },
  {
    id:"plumbing", icon:"🔧", name:"Plumbing & Electrical", color:"#DC2626", bg:"#FEF2F2",
    market:"35,000+ licensed contractors in TX", phase:"Phase 2 — Scale",
    tagline:"Emergency response scripts, maintenance upsells and the referral network that keeps your schedule full",
    agents:[
      {name:"Emergency Agent",    icon:"🚨", desc:"24/7 emergency response scripts and callback templates for after-hours calls"},
      {name:"Maintenance Agent",  icon:"🔄", desc:"Annual maintenance plan upsell scripts for water heaters, panels and drains"},
      {name:"Insurance Agent",    icon:"📋", desc:"Insurance documentation templates and adjuster communication scripts"},
      {name:"Referral Agent",     icon:"🤝", desc:"Real estate agent and property manager referral network builder"},
      {name:"Review Agent",       icon:"⭐", desc:"Post-job review requests with photos prompts for Google and Yelp"},
    ],
    workflows:[
      {step:"1",title:"Validate service area",desc:"Niche Selector maps plumbing/electrical demand by zip code across DFW — find underserved areas"},
      {step:"2",title:"Set up emergency response",desc:"Emergency Agent creates on-call scripts, after-hours messaging and dispatch templates"},
      {step:"3",title:"Build maintenance revenue",desc:"Maintenance Agent identifies every customer without an annual plan and runs the upsell sequence"},
      {step:"4",title:"Grow referral network",desc:"Referral Agent manages relationships with 50+ real estate agents who need reliable contractors"},
    ],
    crmFields:["Service type","Property type","Last service","Insurance claim active","Maintenance plan","Technician"],
    metrics:["Emergency calls","Maintenance plans","Insurance jobs","Referral partners","Average ticket","Review score"],
  },
  {
    id:"autorepair", icon:"🚗", name:"Auto Repair & Detailing", color:"#F59E0B", bg:"#FFFBF2",
    market:"$4.1B Texas auto service market", phase:"Phase 2 — Scale",
    tagline:"Keep bays full with automated reminders, loyalty programmes and fleet account outreach",
    agents:[
      {name:"Reminder Agent",  icon:"🔔", desc:"Oil change, tyre rotation and inspection reminders timed to mileage and date"},
      {name:"Loyalty Agent",   icon:"🎯", desc:"Loyalty stamp programme scripts and VIP customer reward communications"},
      {name:"Fleet Agent",     icon:"🚛", desc:"Fleet account outreach — target businesses with 5+ vehicles in DFW"},
      {name:"Upsell Agent",    icon:"📈", desc:"Service upsell scripts for brake checks, air filters and seasonal tyres"},
      {name:"Review Agent",    icon:"⭐", desc:"Post-service review requests for Google, Facebook and Yelp"},
    ],
    workflows:[
      {step:"1",title:"Validate your shop positioning",desc:"Niche Selector compares dealership vs independent vs specialist vs detailing in your area"},
      {step:"2",title:"Import vehicle database",desc:"Upload customer list with vehicle year/make/model. Reminder Agent schedules all future outreach"},
      {step:"3",title:"Launch fleet outreach",desc:"Fleet Agent identifies businesses with 5+ vehicles within 10 miles and generates outreach scripts"},
      {step:"4",title:"Build loyalty revenue",desc:"Loyalty Agent converts one-time customers to loyalty members with recurring visit incentives"},
    ],
    crmFields:["Vehicle year/make/model","Last service","Mileage","Next service due","Fleet account","Loyalty tier"],
    metrics:["Bays booked","Return customer rate","Fleet accounts","Average repair value","Loyalty members","Reviews"],
  },
  {
    id:"health", icon:"💊", name:"Health & Wellness", color:"#EC4899", bg:"#FDF2F8",
    market:"$2.8B Texas fitness market", phase:"Phase 3 — Global",
    tagline:"Fill your roster, sell packages and build a referral engine from every satisfied client",
    agents:[
      {name:"Onboarding Agent",  icon:"👋", desc:"New client welcome sequence — intake, expectations and first session prep"},
      {name:"Package Agent",     icon:"📦", desc:"Package and programme upsell scripts timed to transformation milestones"},
      {name:"Corporate Agent",   icon:"🏢", desc:"Corporate wellness proposals for DFW employers — 10+ employee groups"},
      {name:"Referral Agent",    icon:"🤝", desc:"Client referral scripts — results-based testimonial requests and friend invites"},
      {name:"Content Agent",     icon:"📱", desc:"Instagram, TikTok and email content calendar — 30 days of posts planned"},
    ],
    workflows:[
      {step:"1",title:"Validate your wellness niche",desc:"Niche Selector compares PT, yoga, nutrition, meditation and functional fitness demand in your area"},
      {step:"2",title:"Set up onboarding system",desc:"Onboarding Agent creates welcome pack, intake form and 30-day check-in sequence"},
      {step:"3",title:"Launch corporate outreach",desc:"Corporate Agent identifies DFW employers within 5 miles and generates wellness proposal"},
      {step:"4",title:"Build referral flywheel",desc:"Referral Agent requests testimonials at Day 30 and 90. Turns results into referral scripts"},
    ],
    crmFields:["Goal and focus area","Session frequency","Package type","Start date","Progress milestone","Referral source"],
    metrics:["Active clients","Package revenue","Corporate contracts","Referrals","Content reach","Retention rate"],
  },
  {
    id:"roofing", icon:"🏗️", name:"Roofing & Construction", color:"#6B7280", bg:"#F9FAFB",
    market:"Texas #1 roofing market in US", phase:"Phase 2 — Scale",
    tagline:"Storm season campaigns, insurance claim guidance and the subcontractor network that scales your capacity",
    agents:[
      {name:"Storm Agent",       icon:"⛈️", desc:"Storm damage campaign scripts launched within 24hrs of major weather events in DFW"},
      {name:"Insurance Agent",   icon:"📋", desc:"Homeowner insurance claim guidance templates and adjuster communication scripts"},
      {name:"Estimate Agent",    icon:"📏", desc:"Roofing estimate scripts with material, labour and margin breakdowns"},
      {name:"Sub Agent",         icon:"👷", desc:"Subcontractor outreach and qualification scripts for capacity overflow"},
      {name:"Referral Agent",    icon:"🏠", desc:"Real estate agent and property manager referral network for pre-sale roof work"},
    ],
    workflows:[
      {step:"1",title:"Map your DFW territory",desc:"Niche Selector identifies hail-prone zip codes and estimates annual replacement demand"},
      {step:"2",title:"Set up storm response",desc:"Storm Agent monitors weather alerts and launches targeted scripts within hours of events"},
      {step:"3",title:"Build insurance pipeline",desc:"Insurance Agent guides homeowners through claims — positions your company as the expert"},
      {step:"4",title:"Scale with subcontractors",desc:"Sub Agent manages overflow capacity — ensuring you never turn down profitable storm work"},
    ],
    crmFields:["Claim status","Insurance company","Adjuster name","Material selected","Crew assigned","Project value"],
    metrics:["Storm jobs","Insurance claims","Average project value","Crew utilisation","Referral partners","Permits pulled"],
  },
  {
    id:"it", icon:"💼", name:"IT Support & MSP", color:"#378ADD", bg:"#EFF6FF",
    market:"$12.4B Texas IT services market", phase:"Phase 3 — Global",
    tagline:"Win and retain managed services contracts with professional proposals, QBRs and proactive client communication",
    agents:[
      {name:"Proposal Agent",   icon:"📄", desc:"Managed services proposal writer — tiered MSP packages with SLA and pricing"},
      {name:"Security Agent",   icon:"🔐", desc:"Security audit template and vulnerability report writer for prospect presentations"},
      {name:"QBR Agent",        icon:"📊", desc:"Quarterly business review deck generator from ticket and uptime data"},
      {name:"Onboarding Agent", icon:"📋", desc:"New client onboarding checklist, credential collection and network documentation"},
      {name:"Upsell Agent",     icon:"📈", desc:"Microsoft 365, backup, security and compliance upsell scripts for existing clients"},
    ],
    workflows:[
      {step:"1",title:"Validate your MSP niche",desc:"Niche Selector analyses SMB vs enterprise vs vertical-specific (legal, medical, construction) in Texas"},
      {step:"2",title:"Build proposal library",desc:"Proposal Agent creates tiered MSP packages. Security Agent adds risk assessment for each prospect"},
      {step:"3",title:"Systematise onboarding",desc:"Onboarding Agent generates client-specific checklists. Reduces setup time from days to hours"},
      {step:"4",title:"Run quarterly reviews",desc:"QBR Agent generates professional review decks. Upsell Agent adds expansion recommendations"},
    ],
    crmFields:["Contract tier","MRR value","Seat count","Contract renewal","Primary contact","Stack and tools"],
    metrics:["Managed clients","Monthly MRR","Average seats","Ticket volume","SLA compliance","NPS score"],
  },
]

export default function VerticalsPage() {
  const [activeV, setActiveV] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [crmData, setCrmData] = useState([])

  useEffect(() => {
    try { setCrmData(JSON.parse(localStorage.getItem("sixxab_crm_contacts") || "[]")) } catch {}
  }, [])

  const v = VERTICALS[activeV]
  const vContacts = crmData.filter(c =>
    c.company?.toLowerCase().includes(v.id) ||
    c.role?.toLowerCase().includes(v.name.split(" ")[0].toLowerCase()) ||
    c.tags?.includes(v.name.split(" ")[0])
  )

  return (
    <>
      <Head>
        <title>SIXXAB AI — Vertical Agent Packs</title>
        <meta name="description" content="10 industry-specific AI agent packs for Dallas and Texas markets — HVAC, Real Estate, Legal, Consulting and more"/>
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;color:${N};min-height:100vh}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        .fu{animation:fadeUp .35s ease both}
        .si{animation:slideIn .3s ease both}
        .card{background:#fff;border-radius:13px;border:1px solid #E2E8F0;overflow:hidden}
        .tab-btn{padding:8px 16px;border-radius:8px;border:none;background:transparent;font-size:12.5px;font-weight:500;cursor:pointer;font-family:inherit;color:#64748B;transition:all .15s}
        .tab-btn.on{background:#fff;color:${N};box-shadow:0 1px 3px rgba(0,0,0,.08)}
        .agent-card{border:0.5px solid var(--c,#E2E8F0);border-radius:11px;padding:14px;background:#fff;transition:all .15s}
        .agent-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.07)}
      `}</style>

      <SixxabNav active="/verticals"/>

      {/* Industry selector */}
      <div style={{background:N,padding:"20px 4%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:AMBER,marginBottom:4}}>SIXXAB AI — Vertical Agent Packs</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:CHALK,letterSpacing:1.5}}>
            10 Industries · Dallas & Texas Market
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {VERTICALS.map((vt,i)=>(
            <button key={i} onClick={()=>{setActiveV(i);setActiveTab("overview")}}
              style={{display:"flex",alignItems:"center",gap:6,padding:"6px 13px",borderRadius:20,border:`1.5px solid ${activeV===i?vt.color:vt.color+"33"}`,background:activeV===i?`${vt.color}22`:`${vt.color}0A`,fontSize:12,fontWeight:500,color:activeV===i?CHALK:"rgba(245,245,240,.5)",cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
              {vt.icon} <span>{vt.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 20px 60px"}}>

        {/* Header */}
        <div className="card fu" style={{marginBottom:18,border:`2px solid ${v.color}44`}}>
          <div style={{background:N,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:52,height:52,borderRadius:13,background:`${v.color}22`,border:`2px solid ${v.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{v.icon}</div>
              <div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:CHALK,letterSpacing:1}}>{v.name}</div>
                <div style={{fontSize:13,color:"rgba(245,245,240,.55)"}}>{v.tagline}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:8,background:`${v.color}22`,color:v.color}}>{v.market}</span>
              <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:8,background:"rgba(239,159,39,.15)",color:AMBER}}>{v.phase}</span>
              <a href="/niche-validator" style={{padding:"7px 16px",borderRadius:9,background:v.color,color:v.color===AMBER?N:"#fff",fontSize:12,fontWeight:600,textDecoration:"none"}}>🎯 Validate this niche →</a>
            </div>
          </div>
          {/* Tabs */}
          <div style={{padding:"8px 16px",background:"#FAFAFA",borderTop:"1px solid #E8ECF4",display:"flex",gap:4}}>
            {[["overview","Overview"],["agents","AI Agents"],["workflow","Workflow"],["crm","SIXXAB CRM"],["metrics","Metrics"]].map(([t,l])=>(
              <button key={t} className={`tab-btn${activeTab===t?" on":""}`} onClick={()=>setActiveTab(t)}>{l}</button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div key={`${activeV}-${activeTab}`} className="si">

          {/* Overview */}
          {activeTab==="overview" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="card" style={{padding:22}}>
                <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>What this pack includes</div>
                {v.agents.map((a,i)=>(
                  <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<v.agents.length-1?"1px solid #F1F5F9":"none",alignItems:"flex-start"}}>
                    <span style={{fontSize:20,flexShrink:0}}>{a.icon}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:500,color:N,marginBottom:3}}>{a.name}</div>
                      <div style={{fontSize:12,color:"#64748B",lineHeight:1.5}}>{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div className="card" style={{padding:18}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Quick start</div>
                  {v.workflows.map((w,i)=>(
                    <div key={i} style={{display:"flex",gap:10,marginBottom:12}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:`${v.color}22`,border:`1px solid ${v.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:v.color,flexShrink:0}}>{w.step}</div>
                      <div>
                        <div style={{fontSize:12.5,fontWeight:500,color:N,marginBottom:2}}>{w.title}</div>
                        <div style={{fontSize:11.5,color:"#64748B",lineHeight:1.5}}>{w.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{background:N,borderRadius:13,padding:18}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:CHALK,letterSpacing:1,marginBottom:8}}>Phase connection</div>
                  <div style={{fontSize:12.5,color:"rgba(245,245,240,.55)",lineHeight:1.65,marginBottom:14}}>
                    This vertical pack is configured for <strong style={{color:AMBER}}>{v.phase}</strong> of the SIXXAB autonomous business framework. All agents feed data back to your Orchestrator and CXO Suite.
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <a href="/orchestrator" style={{flex:1,padding:"8px",borderRadius:8,background:AMBER,color:N,fontSize:12,fontWeight:600,textDecoration:"none",textAlign:"center"}}>Run Orchestrator →</a>
                    <a href="/roadmap" style={{flex:1,padding:"8px",borderRadius:8,border:"1px solid rgba(255,255,255,.15)",color:CHALK,fontSize:12,textDecoration:"none",textAlign:"center"}}>View Roadmap</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Agents */}
          {activeTab==="agents" && (
            <div>
              <div style={{fontSize:13,color:"#64748B",marginBottom:16}}>Each agent is pre-configured for the <strong style={{color:N}}>{v.name}</strong> industry. Scripts, templates and workflows tuned to Texas market language and customer behaviour.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {v.agents.map((a,i)=>(
                  <div key={i} className="agent-card" style={{"--c":`${v.color}33`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <div style={{width:40,height:40,borderRadius:10,background:`${v.color}15`,border:`1px solid ${v.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{a.icon}</div>
                      <div>
                        <div style={{fontSize:13.5,fontWeight:600,color:N}}>{a.name}</div>
                        <div style={{fontSize:10,color:v.color,fontWeight:500,textTransform:"uppercase",letterSpacing:".06em"}}>{v.name.split(" ")[0]} vertical</div>
                      </div>
                    </div>
                    <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.65,marginBottom:12}}>{a.desc}</div>
                    <div style={{display:"flex",gap:7}}>
                      <a href="/orchestrator" style={{flex:1,padding:"7px",borderRadius:7,background:`${v.color}15`,border:`1px solid ${v.color}33`,fontSize:11.5,fontWeight:500,color:v.color,textDecoration:"none",textAlign:"center"}}>Run via Orchestrator</a>
                      <a href="/agents" style={{padding:"7px 12px",borderRadius:7,border:"1px solid #E2E8F0",fontSize:11.5,color:"#64748B",textDecoration:"none"}}>Open CXO Hub</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workflow */}
          {activeTab==="workflow" && (
            <div className="card" style={{padding:24}}>
              <div style={{fontSize:14,fontWeight:600,color:N,marginBottom:4}}>{v.name} — Step-by-step workflow</div>
              <div style={{fontSize:12.5,color:"#64748B",marginBottom:24}}>Follow these steps to get your {v.name.split(" ")[0].toLowerCase()} business running autonomously with SIXXAB AI.</div>
              {v.workflows.map((w,i)=>(
                <div key={i} style={{display:"flex",gap:14,marginBottom:i<v.workflows.length-1?28:0,paddingBottom:i<v.workflows.length-1?28:0,borderBottom:i<v.workflows.length-1?"1px solid #F1F5F9":"none"}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:`${v.color}22`,border:`2px solid ${v.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:18,color:v.color,flexShrink:0}}>{w.step}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:600,color:N,marginBottom:6}}>{w.title}</div>
                    <div style={{fontSize:13,color:"#64748B",lineHeight:1.7,marginBottom:10}}>{w.desc}</div>
                    {i===0&&<a href="/niche-validator" style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,color:"#378ADD",textDecoration:"none",fontWeight:500}}>→ Open SIXXAB Niche Selector</a>}
                    {i===1&&<a href="/crm" style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,color:"#1D9E75",textDecoration:"none",fontWeight:500}}>→ Open SIXXAB CRM</a>}
                    {i===2&&<a href="/orchestrator" style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,color:AMBER,textDecoration:"none",fontWeight:500}}>→ Open Orchestrator</a>}
                    {i===3&&<a href="/agents" style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,color:"#7C3AED",textDecoration:"none",fontWeight:500}}>→ Open CXO Suite</a>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CRM */}
          {activeTab==="crm" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="card" style={{padding:20}}>
                <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:4}}>SIXXAB CRM — {v.name} fields</div>
                <div style={{fontSize:12,color:"#64748B",marginBottom:14}}>Industry-specific fields tracked for every {v.name.split(" ")[0].toLowerCase()} contact.</div>
                {v.crmFields.map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:i<v.crmFields.length-1?"1px solid #F1F5F9":"none"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:v.color,flexShrink:0}}/>
                    <span style={{fontSize:13,color:N}}>{f}</span>
                  </div>
                ))}
                <a href="/crm" style={{display:"block",marginTop:14,padding:"10px",borderRadius:9,background:v.color,color:v.color===AMBER?N:"#fff",fontSize:13,fontWeight:600,textDecoration:"none",textAlign:"center"}}>Open SIXXAB CRM →</a>
              </div>
              <div className="card" style={{padding:20}}>
                <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:4}}>Contacts from this vertical</div>
                {vContacts.length===0?(
                  <div style={{padding:"20px",textAlign:"center",color:"#94A3B8"}}>
                    <div style={{fontSize:14,marginBottom:8}}>{v.icon}</div>
                    <div style={{fontSize:12.5,marginBottom:12}}>No {v.name.split(" ")[0]} contacts in SIXXAB CRM yet</div>
                    <a href="/crm" style={{fontSize:12,color:"#378ADD",textDecoration:"none",fontWeight:500}}>Import from LinkedIn →</a>
                  </div>
                ):vContacts.slice(0,8).map(c=>(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:"1px solid #F1F5F9"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:`${v.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,color:v.color}}>
                      {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                      <div style={{fontSize:10.5,color:"#94A3B8"}}>{c.stage}</div>
                    </div>
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:8,background:`${v.color}15`,color:v.color,fontWeight:600}}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {activeTab==="metrics" && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
                {v.metrics.map((m,i)=>(
                  <div key={i} className="card" style={{padding:"16px 18px"}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>{m}</div>
                    <div style={{fontSize:26,fontWeight:700,color:v.color,fontFamily:"'Bebas Neue'",letterSpacing:.5}}>—</div>
                    <div style={{fontSize:10.5,color:"#94A3B8",marginTop:2}}>Connect data via Orchestrator</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{padding:18,background:"#FFFBF2",border:`1px solid ${AMBER}44`}}>
                <div style={{fontSize:12.5,fontWeight:600,color:"#633806",marginBottom:6}}>📊 Live metrics coming when you run the Orchestrator</div>
                <div style={{fontSize:12,color:"#92400E",lineHeight:1.65}}>
                  Set a weekly goal in the Orchestrator (e.g. "Book 10 {v.name.split(" ")[0]} jobs this week"). The Finance and Analytics agents track all metrics automatically and populate this dashboard.
                </div>
                <a href="/orchestrator" style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:12,padding:"9px 18px",borderRadius:9,background:AMBER,color:N,fontSize:13,fontWeight:600,textDecoration:"none"}}>
                  Run Orchestrator now →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
