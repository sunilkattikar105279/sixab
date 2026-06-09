// pages/agents.js — SIXXAB AI · CXO Suite & Agent Hub
// Complete rebuild: all CXOs working, vertical agent head, real-time CRM sync
import SixxabNav from "../components/SixxabNav"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import Head from "next/head"

// ── Constants ─────────────────────────────────────────────────────────────────
const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"
const CRM_KEY = "sixxab_crm_contacts"

function loadCRM() {
  try { return JSON.parse(localStorage.getItem(CRM_KEY) || "[]") } catch { return [] }
}
function saveCRM(list) {
  try {
    localStorage.setItem(CRM_KEY, JSON.stringify(list))
    localStorage.setItem("sixxab_crm_lastupdate", Date.now().toString())
    window.dispatchEvent(new CustomEvent("sixxab_crm_updated", { detail: { contacts: list } }))
  } catch {}
}
function mkId() { return `${Date.now()}-${Math.random().toString(36).slice(2)}` }
function crmScore(c) {
  let s = 30
  if (c.email)    s += 15; if (c.phone)   s += 10
  if (c.linkedin) s += 10; if (c.company) s += 5; if (c.role) s += 5
  if (c.notes?.length > 10) s += 10
  const sb = { Prospect:0,Outreach:5,Replied:15,Demo:25,Proposal:35,Negotiation:45,"Closed ✓":60,Lost:0 }
  s += sb[c.stage] || 0
  if (c.value === "Pro") s += 5; if (c.value === "Agency" || c.value === "Enterprise") s += 10
  return Math.min(99, s)
}

// ── CXO Definitions ───────────────────────────────────────────────────────────
const CXOS = [
  { id:"ceo",  title:"CEO",  name:"Chief Executive Officer",
    color:"#EF9F27", icon:"ti-crown",
    desc:"Vision, strategy, investors, 48-hr sprint execution and revenue targets",
    agents:["strategy","pitch","financial_model"],
    chatRole:"You are the SIXXAB CEO AI advisor. Give decisive, revenue-focused guidance. Focus on: goal validation, 48-hour sprint planning, investor readiness, strategic direction, and the 6-phase framework ($0 to $10M). Know when a founder should move from Scale to Capitalise. Always include a specific numbered action." },
  { id:"cmo",  title:"CMO",  name:"Chief Marketing Officer",
    color:"#D4537E", icon:"ti-speakerphone",
    desc:"Brand, content, multi-channel campaigns, Product Hunt, AppSumo and SEO",
    agents:["marketing","content","social","seo"],
    chatRole:"You are the SIXXAB CMO AI advisor. You have access to the Content Studio (/studio) which generates LinkedIn posts, email campaigns, blog posts, video scripts, ad copy, press releases and brand stories. Focus on: channel selection, LinkedIn and X growth, content calendar, Product Hunt strategy, AppSumo campaigns, and converting attention into trial signups. Always recommend the Content Studio for content generation tasks." },
  { id:"cso",  title:"CSO",  name:"Chief Sales Officer",
    color:"#1D9E75", icon:"ti-trending-up",
    desc:"Pipeline management, lead qualification, demos, proposals and revenue closing",
    agents:["sales","leads","partnership"],
    chatRole:"You are the SIXXAB CSO AI advisor. You have access to: Lead Generation (/leads) for ICP building, prospect generation, outreach sequences and objection handling; and Proposal Writer (/proposal) for full proposals, SOW, case studies and follow-ups. Focus on: pipeline conversion, demo scripts, proposal writing, objection handling, upsell strategy, and closing. Always recommend /leads for prospecting and /proposal for writing proposals." },
  { id:"cfo",  title:"CFO",  name:"Chief Financial Officer",
    color:"#378ADD", icon:"ti-chart-line",
    desc:"MRR, burn rate, unit economics, Stripe reconciliation and fundraising",
    agents:["finance","pricing","compliance"],
    chatRole:"You are the SIXXAB CFO AI advisor. Focus on: MRR tracking, LTV/CAC calculation, burn rate, Stripe revenue, fundraising readiness (are we ready to raise?), valuation modelling, pricing strategy, and financial forecasting. When a founder is in Phase 5 (Capitalise), focus on building the financial model and due diligence package. Use real numbers from the context." },
  { id:"coo",  title:"COO",  name:"Chief Operating Officer",
    color:"#7C3AED", icon:"ti-settings-automation",
    desc:"Operations, onboarding, customer success, retention and website design/build/deploy for clients",
    agents:["support","ops","customer_success","onboarding_agent","website_designer","website_builder","website_deployer"],
    chatRole:"You are the SIXXAB COO AI advisor. You own customer onboarding, customer success, support operations, retention systems and process documentation. When a customer signs up, the Onboarding Agent runs their welcome sequence. The Customer Success Agent monitors health scores, NPS and churn signals. Always tie advice to specific metrics: Day 1 activation rate, Day 30 retention, NPS score." },
  { id:"cto",  title:"CTO",  name:"Chief Technology Officer",
    color:"#0EA5E9", icon:"ti-code",
    desc:"Tech stack, product roadmap, deployments, security and API integrations",
    agents:["product","tech","security"],
    chatRole:"You are the SIXXAB CTO AI advisor. Focus on: Next.js architecture, Vercel deployment, Supabase integration, Stripe webhooks, Claude API usage, and product roadmap prioritisation." },
  { id:"cdo",  title:"CDO",  name:"Chief Data Officer",
    color:"#16A34A", icon:"ti-database",
    desc:"Analytics, funnel data, cohort analysis, activation and growth metrics",
    agents:["analytics","intelligence"],
    chatRole:"You are the SIXXAB CDO AI advisor. Focus on: funnel conversion, cohort retention, activation rate optimisation, A/B test design, product analytics, and turning data into specific growth actions." },
  { id:"chro", title:"CHRO", name:"Chief People Officer",
    color:"#F59E0B", icon:"ti-users",
    desc:"Hiring strategy, team culture, onboarding workflows and people operations",
    agents:["hr","hrops"],
    chatRole:"You are the SIXXAB CHRO AI advisor. Focus on: when to hire, what roles, job description writing, interview scripts, onboarding checklists, and building team culture at an early-stage startup." },
  { id:"ciso", title:"CISO", name:"Chief Information Security Officer",
    color:"#DC2626", icon:"ti-shield-lock",
    desc:"Data security, compliance, GDPR, API key hygiene and incident response",
    agents:["security","compliance"],
    chatRole:"You are the SIXXAB CISO AI advisor. Focus on: Next.js security best practices, Stripe PCI compliance, GDPR, API key rotation, Supabase row-level security, and data breach prevention." },
  // Head of Verticals — new
  { id:"cio",  title:"CIO", name:"Chief Investment Officer",
    color:"#DC2626", icon:"ti-currency-dollar",
    desc:"Phase 5 — Capitalise: investor relations, fundraising strategy, due diligence, board management and enterprise deal closing",
    agents:["investor_relations","due_diligence","board_mgmt","fundraising","enterprise_deals","valuation"],
    chatRole:"You are the SIXXAB CIO AI advisor — Chief Investment Officer. You specialise in Phase 5 (Capitalise) of the SIXXAB 6-phase framework. Your focus: investor relationship strategy, fundraising readiness, due diligence preparation, board management, term sheet negotiation, valuation positioning, enterprise contract structuring, and building the financial narrative from $500k to $2M ARR. Be direct, use real numbers, and always tie advice back to the founder's live metrics." },
  { id:"board", title:"Board", name:"Corporate Board & Governance",
    color:"#1E3A5F", icon:"ti-gavel",
    desc:"Corporate governance, M&A strategy, legal compliance, audit, risk management and board-level decision making",
    agents:["governance","mergers_acquisitions","legal_counsel","audit_risk","board_comms","compliance_corp","exit_strategy"],
    chatRole:"You are the SIXXAB Corporate Board AI advisor. You provide board-level strategic guidance for founders in the Capitalise and Global phases. Focus on: corporate governance frameworks, M&A evaluation, legal compliance, audit readiness, risk management, fiduciary duties, board meeting facilitation, exit planning and shareholder value. Always advise with the rigour of a seasoned independent board director. Be direct, specific and legally precise." },
  { id:"hov",  title:"Verticals", name:"Head of Vertical Markets — Global",
    color:"#EC4899", icon:"ti-building-factory",
    desc:"30 vertical agent packs across Texas, US national, Europe and global markets — 10 industries × 3 geographic tiers",
    agents:[
      "hvac","realestate","legal","consulting","landscaping","plumbing","autorepair","health","roofing","it",
      "hvac_us","realestate_us","fintech","ecommerce","education","hospitality","manufacturing","logistics","media","nonprofit",
      "hvac_eu","realestate_eu","legal_eu","fintech_eu","saas_eu","healthcare_eu","retail_eu","manufacturing_eu","sustainability","govtech"
    ],
    chatRole:"You are the SIXXAB Head of Vertical Markets AI advisor — Global. You have deep expertise across 30 vertical market configurations spanning Texas/local, US national, and European/global markets. Verticals include: HVAC, Real Estate, Legal, Consulting, Landscaping, Plumbing, Auto Repair, Health, Roofing, IT/MSP (Texas), plus FinTech, E-Commerce, Education, Hospitality, Manufacturing, Logistics, Media, Non-Profit (US national), plus SaaS EU, HealthTech EU, RetailTech EU, Green/Sustainability, GovTech, Legal EU and more. Give industry and geography-specific tactical advice." },
]

// ── Specialist agents ─────────────────────────────────────────────────────────
const AGENTS = {
  // CXO horizontal agents
  strategy:        { label:"Strategy Agent",       icon:"ti-brain",              color:"#EF9F27", cxo:"ceo",  desc:"Business model, niche, pricing, positioning and 90-day planning" },
  pitch:           { label:"Pitch Deck Agent",     icon:"ti-presentation",       color:"#EF9F27", cxo:"ceo",  desc:"Investor slide deck from business data — PDF and PPT" },
  financial_model: { label:"Financial Model",      icon:"ti-calculator",         color:"#EF9F27", cxo:"ceo",  desc:"P&L, cash flow, cap table basics and scenario modelling" },
  marketing:       { label:"Marketing Agent",      icon:"ti-speakerphone",       color:"#D4537E", cxo:"cmo",  desc:"Multi-channel DM scripts — LinkedIn, X, WhatsApp, Email, SMS" },
  content:         { label:"Content Agent",        icon:"ti-writing",            color:"#D4537E", cxo:"cmo",  desc:"Blog posts, newsletters, social copy, SEO and video scripts" },
  social:          { label:"Social Agent",         icon:"ti-share",              color:"#D4537E", cxo:"cmo",  desc:"Social calendar, scheduling, community management" },
  seo:             { label:"SEO Agent",            icon:"ti-search",             color:"#D4537E", cxo:"cmo",  desc:"Keyword research, content briefs, on-page optimisation" },
  sales:           { label:"Sales Agent",          icon:"ti-trending-up",        color:"#1D9E75", cxo:"cso",  desc:"Pipeline, demo scripts, proposals, close playbooks" },
  leads:           { label:"Lead Gen Agent",       icon:"ti-user-search",        color:"#1D9E75", cxo:"cso",  desc:"Prospect discovery, scoring, qualification and timing" },
  partnership:     { label:"Partnership Agent",    icon:"ti-handshake",          color:"#1D9E75", cxo:"cso",  desc:"Strategic partner outreach, referral tracking, deal pipeline" },
  finance:         { label:"Finance Agent",        icon:"ti-chart-line",         color:"#378ADD", cxo:"cfo",  desc:"MRR, P&L, Stripe reconciliation, 90-day forecasts" },
  pricing:         { label:"Pricing Agent",        icon:"ti-tag",                color:"#378ADD", cxo:"cfo",  desc:"Price benchmarking, upgrade triggers, revenue impact models" },
  compliance:      { label:"Compliance Agent",     icon:"ti-certificate",        color:"#378ADD", cxo:"cfo",  desc:"GDPR, PCI, CCPA, HIPAA checklists and legal templates" },
  support:         { label:"Support Agent",        icon:"ti-headset",            color:"#7C3AED", cxo:"coo",  desc:"Ticket drafts, onboarding emails, NPS surveys, escalation" },
  ops:             { label:"Ops Agent",            icon:"ti-settings-automation",color:"#7C3AED", cxo:"coo",  desc:"Process automation, SOP builder, system documentation" },
  customer_success:{ label:"Customer Success Agent",icon:"ti-star",               color:"#7C3AED", cxo:"coo",
    desc:"Customer health scoring, churn signals, NPS surveys, expansion revenue and renewal management",
    chatRole:"You are the SIXXAB Customer Success Agent. Your goal is to ensure every customer achieves their promised outcome: first revenue in 48 hours, $10k MRR in 90 days. You monitor: Day 1 activation (did they run the Orchestrator?), Day 7 engagement (are they using the CRM?), Day 30 retention (are they seeing results?), Day 90 NPS (would they refer others?). You generate: health score reports, at-risk customer alerts, expansion opportunity flags, renewal scripts, and win-back sequences for churned customers. Always give specific, actionable interventions not generic advice." },
  onboarding_agent:{ label:"Onboarding Agent",       icon:"ti-rocket",             color:"#7C3AED", cxo:"coo",
    desc:"New customer welcome sequences, platform walkthrough scripts, milestone check-ins and first-value moments",
    chatRole:"You are the SIXXAB Onboarding Agent. Every new customer needs to experience their first value moment within 48 hours of signing up. You design and write: welcome email sequences (Day 0, 1, 3, 7, 14, 30), platform walkthrough scripts, milestone celebration messages, first-goal guidance prompts, and check-in questions that surface obstacles early. You know the SIXXAB platform thoroughly: Niche Selector → Orchestrator → CRM → CXO Suite → Content Studio → Lead Gen → Proposal Writer. Always tell customers which tool to open first and exactly what to do with it." },
  product:         { label:"Product Agent",        icon:"ti-package",            color:"#0EA5E9", cxo:"cto",  desc:"Roadmap, feature prioritisation, user feedback sprints" },
  tech:            { label:"Tech Agent",           icon:"ti-code",               color:"#0EA5E9", cxo:"cto",  desc:"Architecture decisions, deployments, API integrations" },
  security:        { label:"Security Agent",       icon:"ti-shield-lock",        color:"#DC2626", cxo:"cto",  desc:"Vulnerability scanning, API key hygiene, pen test prep" },
  analytics:       { label:"Analytics Agent",      icon:"ti-chart-bar",          color:"#16A34A", cxo:"cdo",  desc:"Funnel analysis, cohort data, activation, retention" },
  intelligence:    { label:"Intelligence Agent",   icon:"ti-bulb",               color:"#16A34A", cxo:"cdo",  desc:"Customer insights, NPS verbatims, churn signal analysis" },
  hr:              { label:"HR Agent",             icon:"ti-users",              color:"#F59E0B", cxo:"chro", desc:"Hiring pipeline, job descriptions, interview scripts" },
  hrops:           { label:"HR Ops Agent",         icon:"ti-user-check",         color:"#F59E0B", cxo:"chro", desc:"Onboarding workflows, performance reviews, culture" },
  // Capitalise agents — Phase 5 · mapped to cio
  investor_relations: { label:"Investor Relations Agent", icon:"ti-users-group",    color:"#DC2626", cxo:"cio",
    desc:"Investor outreach scripts, update emails, relationship nurturing and warm intro request templates",
    chatRole:"You are the SIXXAB Investor Relations Agent. Write personalised investor outreach scripts, monthly investor update emails, follow-up messages, and warm intro request templates. Always be specific, data-driven and professional." },
  due_diligence:      { label:"Due Diligence Agent",      icon:"ti-file-search",    color:"#DC2626", cxo:"cio",
    desc:"Due diligence checklist, data room preparation, financials packaging and investor Q&A anticipation",
    chatRole:"You are the SIXXAB Due Diligence Agent. Help founders prepare for investor due diligence: build the data room checklist, package financial metrics, anticipate investor questions and prepare clear honest answers. Focus on what seed-stage investors actually ask." },
  board_mgmt:         { label:"Board Management Agent",   icon:"ti-layout-board",   color:"#DC2626", cxo:"cio",
    desc:"Board meeting agendas, investor update reports, advisor onboarding and governance frameworks",
    chatRole:"You are the SIXXAB Board Management Agent. Draft board meeting agendas, monthly investor update reports, advisor agreements, and governance frameworks for early-stage companies. Keep everything concise and metrics-driven." },
  fundraising:        { label:"Fundraising Agent",        icon:"ti-cash",           color:"#DC2626", cxo:"cio",
    desc:"Fundraising strategy, round structure, investor targeting criteria and deal flow management",
    chatRole:"You are the SIXXAB Fundraising Agent. Help founders design their fundraising strategy: round size, valuation, ideal investor profile, timeline, and outreach sequencing. Give specific, actionable advice based on the founder's live metrics." },
  enterprise_deals:   { label:"Enterprise Deals Agent",  icon:"ti-building-skyscraper", color:"#DC2626", cxo:"cio",
    desc:"Enterprise contract proposals, MSA templates, procurement navigation and C-suite pitch scripts",
    chatRole:"You are the SIXXAB Enterprise Deals Agent. Draft enterprise contract proposals, MSA frameworks, SOW templates, and C-suite pitch scripts. Help founders navigate enterprise procurement cycles and close large contracts." },
  valuation:          { label:"Valuation Agent",          icon:"ti-chart-donut",    color:"#DC2626", cxo:"cio",
    desc:"Pre-money valuation justification, comparable analysis, ARR multiples and dilution modelling",
    chatRole:"You are the SIXXAB Valuation Agent. Help founders justify their pre-money valuation using ARR multiples, comparable companies, growth rate, retention and market size. Build the valuation narrative that withstands investor scrutiny." },

  // Board & Governance agents — mapped to board
  governance:       { label:"Governance Agent",     icon:"ti-gavel",            color:"#1E3A5F", cxo:"board",
    desc:"Corporate governance frameworks, board charter, director duties, shareholder agreements and company constitution",
    chatRole:"You are the SIXXAB Governance Agent. Draft corporate governance frameworks, board charters, director duty summaries, shareholder agreements and company constitution clauses for early and growth-stage startups. Advise on best practices for Delaware C-corps and Texas LLCs. Be precise and legally careful." },
  mergers_acquisitions:{ label:"M&A Agent",         icon:"ti-arrows-exchange",  color:"#1E3A5F", cxo:"board",
    desc:"M&A strategy, acquisition evaluation, due diligence frameworks, LOI drafting and deal structuring",
    chatRole:"You are the SIXXAB M&A Agent. Help founders evaluate acquisition targets, structure deals, draft Letter of Intent frameworks, and manage M&A due diligence. Also advise on being acquired — what makes your company attractive, how to run a sell-side process, and how to evaluate acquirer offers. Be analytical and deal-focused." },
  legal_counsel:    { label:"Legal Counsel Agent",  icon:"ti-scale",            color:"#1E3A5F", cxo:"board",
    desc:"Contract review guidance, employment law, IP protection, shareholder disputes and corporate legal structure",
    chatRole:"You are the SIXXAB Legal Counsel Agent. Provide legal guidance on contract structures, employment agreements, IP protection, shareholder disputes, corporate restructuring and compliance requirements. Always recommend consulting a qualified attorney for final decisions while giving founders the framework to understand their situation." },
  audit_risk:       { label:"Audit & Risk Agent",   icon:"ti-shield-check",     color:"#1E3A5F", cxo:"board",
    desc:"Financial audit readiness, risk register, internal controls, SOC 2 preparation and insurance planning",
    chatRole:"You are the SIXXAB Audit & Risk Agent. Help founders build financial audit readiness, create risk registers, design internal controls, prepare for SOC 2 Type II, assess business insurance needs and establish risk management frameworks appropriate for a funded startup." },
  board_comms:      { label:"Board Comms Agent",    icon:"ti-mail-forward",     color:"#1E3A5F", cxo:"board",
    desc:"Board meeting agendas, investor update reports, board deck templates and shareholder communications",
    chatRole:"You are the SIXXAB Board Communications Agent. Draft professional board meeting agendas, monthly and quarterly investor update reports, board deck templates, and shareholder communications. Keep everything metrics-driven, concise and boardroom-ready. Mirror the tone of a Fortune 500 board communication style." },
  compliance_corp:  { label:"Corp Compliance Agent",icon:"ti-certificate",      color:"#1E3A5F", cxo:"board",
    desc:"Regulatory compliance, data privacy (GDPR/CCPA), employment law, tax compliance and licensing requirements",
    chatRole:"You are the SIXXAB Corporate Compliance Agent. Guide founders on regulatory compliance across: data privacy (GDPR, CCPA), employment law, tax obligations, industry-specific licensing, anti-bribery, environmental requirements and multi-jurisdiction compliance for global operations." },
  exit_strategy:    { label:"Exit Strategy Agent",  icon:"ti-door-exit",        color:"#1E3A5F", cxo:"board",
    desc:"Exit planning, IPO readiness, acquisition positioning, earnout structures and shareholder liquidity strategies",
    chatRole:"You are the SIXXAB Exit Strategy Agent. Help founders plan their exit: evaluate IPO vs strategic acquisition vs private equity, build the story that maximises exit valuation, structure earnout agreements, plan employee equity liquidity events, and prepare the company for a professional M&A process. Focus on value maximisation and founder protection." },

  // Website Builder agents — mapped to coo
  website_designer:{ label:"Website Designer Agent", icon:"ti-palette",        color:"#7C3AED", cxo:"coo",
    desc:"Designs complete website structure, color scheme, typography and layout for any business type",
    chatRole:"You are the SIXXAB Website Designer Agent. You design professional websites for small and medium businesses. When given a business type, industry and target audience, you produce: a complete page structure (Home, About, Services, Portfolio/Case Studies, Pricing, Contact), recommended color palette with hex codes, typography pairing (heading font + body font), layout direction for each section, and hero message/tagline. You know current web design trends and produce specific, actionable design briefs — not generic advice. Always include: above-the-fold hero design, social proof placement, CTA strategy, and mobile-first layout notes." },

  website_builder:{ label:"Website Builder Agent",  icon:"ti-code",           color:"#7C3AED", cxo:"coo",
    desc:"Generates complete HTML/CSS website code with stylish templates for any business",
    chatRole:"You are the SIXXAB Website Builder Agent. You write complete, production-ready single-page HTML websites with embedded CSS. When given a business name, type, color scheme and content, you produce a full HTML file that: uses Google Fonts, has a sticky nav, a hero section, services/features grid, testimonials, pricing (if applicable), a contact form and a footer. The code must be clean, semantic, mobile-responsive using CSS Grid/Flexbox, and ready to deploy on Vercel, Netlify or GitHub Pages with zero configuration. Always include: scroll animations, hover effects, a WhatsApp/email CTA button, and social media links. Output the FULL HTML file — never truncate." },

  website_deployer:{ label:"Website Deployer Agent", icon:"ti-rocket",         color:"#7C3AED", cxo:"coo",
    desc:"Step-by-step deployment guide for Vercel, Netlify, GitHub Pages and custom domains",
    chatRole:"You are the SIXXAB Website Deployer Agent. You guide business owners through deploying their website with zero technical knowledge. For each deployment target (Vercel, Netlify, GitHub Pages, or cPanel/shared hosting), you provide: a numbered step-by-step deployment guide, how to connect a custom domain, how to set up SSL (HTTPS), how to connect Google Analytics, how to set up a contact form (using Formspree or Netlify Forms), and how to connect social media pixels (LinkedIn Insight Tag, Facebook Pixel, Twitter Pixel). Always give the exact URLs, button names and field values — assume the user has never deployed a website before." },

  // Vertical agents — mapped to hov
  hvac:       { label:"HVAC Agent",       icon:"ti-air-conditioning",    color:"#0EA5E9", cxo:"hov", desc:"Seasonal campaigns, service quotes, tech scheduling, review requests" },
  realestate: { label:"Real Estate Agent",icon:"ti-home",                color:"#1D9E75", cxo:"hov", desc:"Listing descriptions, buyer/seller outreach, CMA reports" },
  legal:      { label:"Legal Agent",      icon:"ti-scale",               color:"#7C3AED", cxo:"hov", desc:"Client intake, retainer proposals, billing reminders, referrals" },
  consulting: { label:"Consulting Agent", icon:"ti-briefcase",           color:"#EF9F27", cxo:"hov", desc:"Proposals, ROI calculator, case studies, LinkedIn thought leadership" },
  landscaping:{ label:"Landscaping Agent",icon:"ti-plant",               color:"#16A34A", cxo:"hov", desc:"Seasonal upsell, HOA outreach, neighbour scripts, annual contracts" },
  plumbing:   { label:"Plumbing Agent",   icon:"ti-tool",                color:"#DC2626", cxo:"hov", desc:"Emergency response, maintenance upsell, insurance docs, referrals" },
  autorepair: { label:"Auto Repair Agent",icon:"ti-car",                 color:"#F59E0B", cxo:"hov", desc:"Service reminders, fleet outreach, loyalty programme, reviews" },
  health:     { label:"Health Agent",     icon:"ti-heart-rate-monitor",  color:"#EC4899", cxo:"hov", desc:"Client onboarding, package upsell, corporate wellness, referrals" },
  roofing:    { label:"Roofing Agent",    icon:"ti-building",            color:"#6B7280", cxo:"hov", desc:"Storm campaigns, insurance claims, estimate scripts, sub network" },
  it:         { label:"IT/MSP Agent",     icon:"ti-server",              color:"#378ADD", cxo:"hov", desc:"Managed services proposals, QBR decks, security audits, onboarding" },

  // ── US National vertical agents ──────────────────────────────────────────
  hvac_us:       { label:"HVAC — US National",     icon:"ti-air-conditioning",    color:"#0284C7", cxo:"hov",
    desc:"National HVAC franchise outreach, multi-state service contracts, energy efficiency rebate campaigns, EPA compliance",
    chatRole:"You are the SIXXAB US National HVAC agent. Focus on multi-state HVAC operations, national franchise models, federal energy efficiency programmes (IRA rebates), EPA Section 608 compliance, and scaling from regional to national coverage." },
  realestate_us: { label:"Real Estate — US National",icon:"ti-home",              color:"#0D9488", cxo:"hov",
    desc:"Multi-market investment, REITs, national broker network, 1031 exchanges, commercial real estate nationwide",
    chatRole:"You are the SIXXAB US National Real Estate agent. Focus on: multi-market residential investment, commercial RE, REITs, 1031 exchanges, national brokerage networks, iBuyer strategy, PropTech integration, and multi-state compliance." },
  fintech:       { label:"FinTech — US",            icon:"ti-credit-card",         color:"#7C3AED", cxo:"hov",
    desc:"Financial technology products, payment processing, lending, InsurTech, WealthTech — US regulatory framework",
    chatRole:"You are the SIXXAB US FinTech agent. Focus on: payment processing (Stripe, Square), BNPL, lending platforms, robo-advisors, InsurTech, regulatory compliance (SEC, FINRA, FinCEN), banking partnerships, and US financial product GTM." },
  ecommerce:     { label:"E-Commerce — US",         icon:"ti-shopping-cart",       color:"#F59E0B", cxo:"hov",
    desc:"D2C brands, Amazon FBA, Shopify stores, marketplace strategy, US fulfilment and returns management",
    chatRole:"You are the SIXXAB US E-Commerce agent. Focus on: DTC brand building, Amazon FBA/FBM strategy, Shopify optimisation, marketplace diversification, US fulfilment networks, ROAS optimisation, and post-purchase retention." },
  education:     { label:"EdTech — US",             icon:"ti-school",              color:"#8B5CF6", cxo:"hov",
    desc:"Online courses, tutoring marketplaces, corporate training, K-12 EdTech and higher education platforms",
    chatRole:"You are the SIXXAB US EdTech agent. Focus on: online course creation and marketing, tutoring platform acquisition, corporate L&D partnerships, K-12 district sales cycles, accreditation strategy, and LMS integration." },
  hospitality:   { label:"Hospitality — US",        icon:"ti-building-estate",     color:"#EF4444", cxo:"hov",
    desc:"Hotels, restaurants, event venues, food service chains — US hospitality operations and guest experience",
    chatRole:"You are the SIXXAB US Hospitality agent. Focus on: hotel revenue management, restaurant group expansion, event venue marketing, franchise restaurant development, food service supply chain, and US hospitality technology." },
  manufacturing: { label:"Manufacturing — US",      icon:"ti-tool",                color:"#64748B", cxo:"hov",
    desc:"US manufacturing SMBs, contract manufacturing, supply chain optimisation, Industry 4.0 adoption",
    chatRole:"You are the SIXXAB US Manufacturing agent. Focus on: small-batch and contract manufacturing, US supply chain resilience, Industry 4.0 and IIoT adoption, OSHA compliance, lean manufacturing, and B2B industrial sales." },
  logistics:     { label:"Logistics & Supply Chain",icon:"ti-truck",               color:"#0EA5E9", cxo:"hov",
    desc:"3PL providers, freight brokers, last-mile delivery, warehouse management, cross-border US logistics",
    chatRole:"You are the SIXXAB Logistics & Supply Chain agent. Focus on: 3PL business development, freight brokerage, last-mile delivery operations, warehouse automation, USMCA cross-border trade, and DOT compliance for US carriers." },
  media:         { label:"Media & Content — US",    icon:"ti-video",               color:"#D4537E", cxo:"hov",
    desc:"Digital media, podcasting, newsletter businesses, creator economy, content licensing and syndication",
    chatRole:"You are the SIXXAB US Media & Content agent. Focus on: newsletter monetisation, podcast growth, YouTube channel strategy, creator brand deals, content licensing, subscription media models, and US digital advertising." },
  nonprofit:     { label:"Non-Profit — US",         icon:"ti-heart",               color:"#16A34A", cxo:"hov",
    desc:"501(c)(3) organisations, grant writing, donor development, impact measurement and non-profit marketing",
    chatRole:"You are the SIXXAB US Non-Profit agent. Focus on: 501(c)(3) formation and compliance, grant writing and foundation outreach, major donor cultivation, impact reporting, volunteer management, and cause marketing." },

  // ── European & Global vertical agents ─────────────────────────────────────
  hvac_eu:          { label:"HVAC — Europe",          icon:"ti-air-conditioning",  color:"#0369A1", cxo:"hov",
    desc:"European HVAC — heat pumps, Boiler Upgrade Scheme (UK), EU energy directives, F-Gas regulation compliance",
    chatRole:"You are the SIXXAB European HVAC agent. Focus on: heat pump installation marketing, UK Boiler Upgrade Scheme, EU Energy Performance of Buildings Directive, F-Gas regulation, European energy efficiency incentives, and HVAC business expansion across UK, Germany, France, Benelux and Nordics." },
  realestate_eu:    { label:"Real Estate — Europe",   icon:"ti-home",              color:"#0F766E", cxo:"hov",
    desc:"European property — UK, Germany, France, Benelux, Spain — lettings, sales, PropTech and cross-border investment",
    chatRole:"You are the SIXXAB European Real Estate agent. Focus on: UK lettings compliance (EPC, licensing), German property market, French immobilier, Spanish property investment, European PropTech, cross-border property investment structures, and EU AML regulations for property transactions." },
  legal_eu:         { label:"Legal Services — Europe",icon:"ti-scale",             color:"#6D28D9", cxo:"hov",
    desc:"European legal — GDPR compliance, EU commercial law, cross-border contracts, German Rechtsanwalt, UK Solicitor positioning",
    chatRole:"You are the SIXXAB European Legal Services agent. Focus on: GDPR compliance advisory, EU commercial law, cross-border contract structures, UK Solicitors Regulation Authority requirements, German legal market, EU data protection practice building, and legal tech adoption in European law firms." },
  fintech_eu:       { label:"FinTech — Europe",       icon:"ti-credit-card",       color:"#7C3AED", cxo:"hov",
    desc:"European FinTech — PSD2, Open Banking, EMI licensing, FCA authorisation, DORA compliance, EU passporting",
    chatRole:"You are the SIXXAB European FinTech agent. Focus on: FCA authorisation (UK), EMI/PI licensing (EU), PSD2 and Open Banking, DORA digital resilience compliance, EU passporting strategy, MiCA (crypto), and European payments infrastructure." },
  saas_eu:          { label:"SaaS — Europe",          icon:"ti-cloud",             color:"#1E3A5F", cxo:"hov",
    desc:"European B2B SaaS — GDPR-native positioning, EU AI Act compliance, enterprise sales in UK, DACH, Nordics and France",
    chatRole:"You are the SIXXAB European SaaS agent. Focus on: GDPR-native product positioning, EU AI Act compliance for AI products, B2B enterprise sales in UK, Germany, France, Nordics and Benelux, European pricing and localisation, and data residency requirements for EU customers." },
  healthcare_eu:    { label:"HealthTech — Europe",    icon:"ti-heart-rate-monitor",color:"#BE185D", cxo:"hov",
    desc:"European healthcare technology — NHS procurement (UK), CE marking, MDR compliance, GDPR in health data, digital health reimbursement",
    chatRole:"You are the SIXXAB European HealthTech agent. Focus on: NHS Digital procurement pathway, EU Medical Device Regulation (MDR), CE marking, health data GDPR requirements, German DiGA (Digital Health Application) approval, French healthcare digital, and European digital health reimbursement routes." },
  retail_eu:        { label:"Retail & Commerce — EU", icon:"ti-shopping-bag",      color:"#B45309", cxo:"hov",
    desc:"European retail — omnichannel strategy, EU consumer rights, high street and marketplace expansion, VAT OSS compliance",
    chatRole:"You are the SIXXAB European Retail agent. Focus on: EU omnichannel retail strategy, EU Consumer Rights Directive compliance, VAT One-Stop-Shop (OSS), Amazon Europe marketplace strategy, Zalando and European marketplace expansion, and sustainable retail positioning for European consumers." },
  manufacturing_eu: { label:"Manufacturing — Europe", icon:"ti-tool",              color:"#475569", cxo:"hov",
    desc:"European manufacturing — CE marking, Industry 4.0, EU Green Deal supply chain, German Mittelstand positioning",
    chatRole:"You are the SIXXAB European Manufacturing agent. Focus on: CE marking requirements, EU Green Deal supply chain compliance, German Mittelstand market positioning, European Industry 4.0 adoption, EU supply chain due diligence directive, and manufacturing reshoring trends in Europe." },
  sustainability:   { label:"Sustainability & ESG",   icon:"ti-leaf",              color:"#15803D", cxo:"hov",
    desc:"ESG advisory, carbon accounting, sustainability reporting (CSRD), B Corp certification, green business strategy globally",
    chatRole:"You are the SIXXAB Sustainability & ESG agent. Focus on: EU Corporate Sustainability Reporting Directive (CSRD), UK Streamlined Energy and Carbon Reporting (SECR), B Corp certification, carbon accounting and offsetting, ESG investor reporting, and building sustainability as a competitive differentiator globally." },
  govtech:          { label:"GovTech & Public Sector", icon:"ti-building-government",color:"#1E40AF", cxo:"hov",
    desc:"Government technology, public sector procurement, G-Cloud (UK), EU public procurement frameworks, civic tech",
    chatRole:"You are the SIXXAB GovTech agent. Focus on: UK G-Cloud and Digital Marketplace procurement, EU public procurement (OJEU), US Federal and state procurement (GSA schedule), civic technology positioning, digital transformation projects in government, and navigating public sector sales cycles globally." },
}

const PIPELINE_STAGES = [
  {stage:"Prospect",  color:"#F1EFE8", txt:"#5F5E5A"},
  {stage:"Outreach",  color:"#FAEEDA", txt:"#633806"},
  {stage:"Replied",   color:"#EFF6FF", txt:"#1E40AF"},
  {stage:"Demo",      color:"#E6F1FB", txt:"#0C447C"},
  {stage:"Proposal",  color:"#F5F3FF", txt:"#4C1D95"},
  {stage:"Closed ✓",  color:"#E1F5EE", txt:"#085041"},
  {stage:"Lost",      color:"#FEF2F2", txt:"#991B1B"},
]

const HIRE_PLAN = [
  {role:"Customer Success Manager", when:"Month 4", cost:"$3.5k/mo", why:"Support exceeds solo capacity at 100+ customers"},
  {role:"Growth Marketer",          when:"Month 6", cost:"$4k/mo",   why:"AppSumo + LinkedIn + global all running simultaneously"},
  {role:"Engineer",                 when:"Month 9", cost:"$6k/mo",   why:"AWS migration + Supabase + API v2"},
  {role:"Sales Rep",                when:"Month 9", cost:"$4k+comm", why:"Enterprise and university deal closing"},
  {role:"Head of Advisors",         when:"Month 10",cost:"$5k/mo",   why:"Managing 50+ global SIXXAB Advisors"},
]

export default function AgentHub() {
  const router = useRouter()
  const [activeCxo, setActiveCxo]     = useState("ceo")
  const [activeAgent, setActiveAgent] = useState(null)
  const [activeVertical, setActiveVertical] = useState("hvac")
  const [chatMsgs, setChatMsgs]       = useState({})
  const [chatInput, setChatInput]     = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [scriptLoading, setScriptLoading] = useState(false)
  const [scripts, setScripts]         = useState(null)
  const [selectedLeads, setSelectedLeads] = useState([])
  const [activeChannel, setActiveChannel] = useState("LinkedIn")
  const [offer, setOffer]             = useState("Start with SIXXAB AI — autonomous business platform from $49.50/mo.")
  const [showCrmPicker, setShowCrmPicker] = useState(false)
  const [crmSearch, setCrmSearch]     = useState("")
  const [crmContacts, setCrmContacts] = useState([])
  const [activeTab, setActiveTab]     = useState("chat") // chat | agents | pipeline | details
  const bottomRef = useRef(null)

  // ── Read URL params from CRM navigation ─────────────────────────────────────
  useEffect(() => {
    const { cxo, contact } = router.query
    if (cxo) setActiveCxo(cxo)
    if (contact) {
      // Pre-fill chat input with the contact name from CRM
      setChatInput(`Help me with ${decodeURIComponent(contact)} — they are a CRM contact I just sent to this agent`)
    }
  }, [router.query])

  // ── Real-time CRM sync ─────────────────────────────────────────────────────
  useEffect(() => {
    setCrmContacts(loadCRM())
    // Listen for CRM updates from other tabs and from CRM page
    const onCrmUpdate = (e) => {
      if (e.detail?.contacts) setCrmContacts(e.detail.contacts)
    }
    const onStorage = (e) => {
      if (e.key === CRM_KEY) {
        try { setCrmContacts(JSON.parse(e.newValue || "[]")) } catch {}
      }
    }
    window.addEventListener("sixxab_crm_updated", onCrmUpdate)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("sixxab_crm_updated", onCrmUpdate)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }) }, [chatMsgs, activeCxo])

  // ── Derived state ──────────────────────────────────────────────────────────
  const LEADS = crmContacts.length > 0
    ? crmContacts.map(c => ({
        id: String(c.id), name: c.name, role: c.role||"", email: c.email||"",
        phone: c.phone||"", linkedin: c.linkedin||"", company: c.company||"",
        stage: c.stage||"Prospect", score: c.score||50, source: c.source||"LinkedIn",
        value: c.value||"Starter", notes: c.notes||"", tags: c.tags||[],
        lastTouch: c.lastTouch||"—", assignedAgent: c.assignedAgent||"marketing",
      }))
    : []

  const cxo = CXOS.find(c => c.id === activeCxo) || CXOS[0]
  const chatKey = activeAgent || activeCxo
  const msgs = chatMsgs[chatKey] || [{
    role:"assistant",
    content: activeAgent
      ? `${AGENTS[activeAgent]?.label} ready. ${AGENTS[activeAgent]?.desc}. How can I help you today?`
      : `${cxo.title} advisor active — ${cxo.name}. ${cxo.desc}. What's your priority today?`
  }]

  // CXO-specific CRM stats
  const crmStats = {
    total: crmContacts.length,
    hot: crmContacts.filter(c => (c.score||0) >= 80).length,
    pipeline: crmContacts.filter(c => ["Outreach","Replied","Demo","Proposal","Negotiation"].includes(c.stage)).length,
    closed: crmContacts.filter(c => c.stage === "Closed ✓").length,
    mrr: crmContacts.filter(c => c.stage==="Closed ✓").reduce((a,c) =>
      a+(c.value==="Pro"?99.50:c.value==="Agency"?175:c.value==="Enterprise"?350:49.50), 0),
  }

  // ── Chat ──────────────────────────────────────────────────────────────────
  async function sendMsg() {
    const text = chatInput.trim()
    if (!text || chatLoading) return
    setChatInput("")
    setChatLoading(true)
    const role = activeAgent ? AGENTS[activeAgent]?.chatRole||"" : cxo.chatRole||""
    const crmContext = `\n\nCRM context: ${crmStats.total} contacts, ${crmStats.pipeline} in pipeline, ${crmStats.closed} closed, MRR potential $${crmStats.mrr.toFixed(2)}.`
    const next = [...msgs, { role:"user", content:text }]
    setChatMsgs(m => ({ ...m, [chatKey]: next }))
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[
          { role:"user", content:`${role}${crmContext}\n\nFounder question: ${text}` }
        ]})
      })
      const d = await res.json()
      setChatMsgs(m => ({ ...m, [chatKey]: [...next, { role:"assistant", content: d.reply||"Unable to respond — check API connection." }] }))
    } catch {
      setChatMsgs(m => ({ ...m, [chatKey]: [...next, { role:"assistant", content:"Network error — check connection." }] }))
    }
    setChatLoading(false)
  }

  // ── Generate outreach scripts ─────────────────────────────────────────────
  async function generateScripts() {
    const leads = LEADS.filter(l => selectedLeads.includes(String(l.id)))
    if (!leads.length) { alert("Select at least one contact first."); return }
    setScriptLoading(true); setScripts(null)
    const crmContext = leads.map(l => `Name: ${l.name}, Role: ${l.role||"—"}, Company: ${l.company||"—"}, Stage: ${l.stage}, Notes: ${l.notes||"—"}`).join("\n")
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:
          `You are the SIXXAB Marketing Agent.\n\nGenerate personalised ${activeChannel} outreach scripts for these contacts:\n${crmContext}\n\nOffer: ${offer}\nChannel: ${activeChannel}\nChannel rules: ${AGENTS.marketing?.channelHints?.[activeChannel]||""}\n\nWrite one personalised script per contact. Format:\n[Contact name]\n[Script text]\n---\n\nReturn only the scripts, no preamble.`
        }]})
      })
      const d = await res.json()
      setScripts(d.reply || "Unable to generate — check API connection.")
    } catch { setScripts("Network error — check your connection.") }
    setScriptLoading(false)
  }

  // ── Update contact stage from pipeline ───────────────────────────────────
  function updateStage(contactId, newStage) {
    const updated = crmContacts.map(c =>
      String(c.id) === String(contactId)
        ? { ...c, stage: newStage, updatedAt: new Date().toISOString(), lastTouch: "Stage updated" }
        : c
    )
    saveCRM(updated)
    setCrmContacts(updated)
  }

  const verticalAgent = AGENTS[activeVertical]

  return (
    <>
      <Head><title>SIXXAB AI — CXO Suite & Agent Hub</title></Head>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;color:${N};min-height:100vh;overflow-x:hidden}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .fu{animation:fadeUp .3s ease both}
        input,select,textarea{font-family:inherit;outline:none}
        .card{background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden}
        .tab-btn{padding:7px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:none;fontFamily:inherit;background:transparent;color:#64748B;transition:all .15s}
        .tab-btn.on{background:#fff;color:${N};box-shadow:0 1px 4px rgba(0,0,0,.08)}
        .chat-bubble-user{background:rgba(239,159,39,.15);border:1px solid rgba(239,159,39,.2);border-radius:13px 13px 3px 13px;padding:10px 13px;font-size:13px;color:${N};line-height:1.65;max-width:85%;margin-left:auto}
        .chat-bubble-ai{background:#fff;border:1px solid #E8ECF4;border-radius:13px 13px 13px 3px;padding:10px 13px;font-size:13px;color:${N};line-height:1.75;white-space:pre-wrap;max-width:92%}
        .cxo-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 8px;border-radius:10px;border:1.5px solid #E2E8F0;background:#fff;cursor:pointer;transition:all .15s;font-family:inherit;min-width:60px}
        .cxo-btn:hover{border-color:#CBD5E1;background:#F8F9FA}
        .agent-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;border:1px solid #E2E8F0;background:#F8F9FA;font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;white-space:nowrap}
        .agent-pill:hover{border-color:#CBD5E1}
        .agent-pill.on{border-color:var(--ac);background:var(--abg)}
        .inp{width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:13px;color:${N};background:#fff;transition:border .15s}
        .inp:focus{border-color:${AMBER}}
        .scrollbar-hide::-webkit-scrollbar{display:none}
      `}</style>

      <SixxabNav active="/agents"/>

      {/* Page header */}
      <div style={{background:N,padding:"16px 4% 14px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontFamily:"'DM Mono'",fontSize:10,color:AMBER,letterSpacing:".1em",marginBottom:4}}>SIXXAB AI — CXO SUITE & AGENT HUB</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:CHALK,letterSpacing:1.5}}>
              {cxo.title} — {cxo.name}
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {/* Real-time CRM stats */}
            {[["Contacts",crmStats.total,"#94A3B8"],["Pipeline",crmStats.pipeline,AMBER],["Closed",crmStats.closed,"#1D9E75"]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center",padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:c,letterSpacing:.5}}>{v}</div>
                <div style={{fontSize:9.5,color:"rgba(245,245,240,.4)",textTransform:"uppercase",letterSpacing:".07em"}}>{l}</div>
              </div>
            ))}
            <a href="/crm" style={{padding:"6px 14px",borderRadius:8,background:"rgba(29,158,117,.2)",border:"1px solid rgba(29,158,117,.4)",fontSize:12,fontWeight:500,color:"#6EE7B7",textDecoration:"none",display:"flex",alignItems:"center",gap:5}}>
              <i className="ti ti-address-book" style={{fontSize:12}} aria-hidden="true"/>SIXXAB CRM
            </a>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"68px 1fr",height:"calc(100vh - 114px)"}}>

        {/* ── CXO sidebar ── */}
        <div style={{background:N,borderRight:"1px solid rgba(255,255,255,.07)",padding:"12px 4px",display:"flex",flexDirection:"column",gap:4,overflowY:"auto"}} className="scrollbar-hide">
          {CXOS.map(c => (
            <button key={c.id} className="cxo-btn" onClick={()=>{setActiveCxo(c.id);setActiveAgent(null);setActiveTab("chat")}}
              style={{borderColor:activeCxo===c.id?c.color:"rgba(255,255,255,.08)",background:activeCxo===c.id?`${c.color}18`:"rgba(255,255,255,.04)",color:activeCxo===c.id?c.color:"rgba(245,245,240,.4)"}}>
              <i className={`ti ${c.icon}`} style={{fontSize:18,color:activeCxo===c.id?c.color:"rgba(245,245,240,.3)"}} aria-hidden="true"/>
              <span style={{fontSize:9,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase"}}>{c.title}</span>
            </button>
          ))}
        </div>

        {/* ── Main content ── */}
        <div style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* Sub-nav: agents + tabs */}
          <div style={{background:"#fff",borderBottom:"1px solid #E8ECF4",padding:"8px 16px",display:"flex",alignItems:"center",gap:8,overflowX:"auto",flexShrink:0}} className="scrollbar-hide">
            {/* Agent pills for this CXO */}
            <div style={{display:"flex",gap:5,flex:1,overflowX:"auto"}} className="scrollbar-hide">
              <button className={`agent-pill${!activeAgent?" on":""}`}
                style={{"--ac":cxo.color,"--abg":`${cxo.color}18`}}
                onClick={()=>setActiveAgent(null)}>
                <i className={`ti ${cxo.icon}`} style={{fontSize:11,color:cxo.color}} aria-hidden="true"/>
                All {cxo.title}
              </button>
              {cxo.agents.map(aid => {
                const a = AGENTS[aid]; if (!a) return null
                const isOn = activeAgent === aid
                return (
                  <button key={aid} className={`agent-pill${isOn?" on":""}`}
                    style={{"--ac":a.color,"--abg":`${a.color}15`,color:isOn?a.color:"#64748B"}}
                    onClick={()=>{setActiveAgent(isOn?null:aid);setActiveTab("chat")}}>
                    <i className={`ti ${a.icon}`} style={{fontSize:11,color:a.color}} aria-hidden="true"/>
                    {a.label.replace(" Agent","")}
                  </button>
                )
              })}
            </div>
            {/* View tabs */}
            <div style={{display:"flex",gap:2,background:"#F1F5F9",borderRadius:9,padding:3,flexShrink:0}}>
              {(activeCxo==="hov"
                ? [["chat","Chat"],["agents","Agents"],["details","Dashboard"]]
                : [["chat","Chat"],["agents","Agents"],["pipeline","Pipeline"],["details","Details"]]
              ).map(([t,l])=>(
                <button key={t} className={`tab-btn${activeTab===t?" on":""}`} onClick={()=>setActiveTab(t)}>{l}</button>
              ))}
            </div>
          </div>

          {/* ── Content area ── */}
          <div style={{flex:1,overflow:"auto",padding:"14px 16px"}} className="scrollbar-hide">

            {/* ══ CHAT TAB ══ */}
            {activeTab==="chat" && (
              <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
                <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:10}} className="scrollbar-hide">
                  {msgs.map((m,i) => (
                    <div key={i} style={{display:"flex",gap:8,justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                      {m.role==="assistant" && (
                        <div style={{width:30,height:30,borderRadius:8,background:cxo.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <i className={`ti ${activeAgent?AGENTS[activeAgent]?.icon||cxo.icon:cxo.icon}`} style={{fontSize:14,color:"#fff"}} aria-hidden="true"/>
                        </div>
                      )}
                      <div className={m.role==="user"?"chat-bubble-user":"chat-bubble-ai"}>{m.content}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{display:"flex",gap:8}}>
                      <div style={{width:30,height:30,borderRadius:8,background:cxo.color,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <div style={{width:14,height:14,border:`2px solid rgba(255,255,255,.3)`,borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
                      </div>
                      <div className="chat-bubble-ai" style={{color:"#94A3B8"}}>Thinking…</div>
                    </div>
                  )}
                  <div ref={bottomRef}/>
                </div>
                {/* Input */}
                <div style={{display:"flex",gap:8,borderTop:"1px solid #E8ECF4",paddingTop:10}}>
                  <input className="inp" value={chatInput} onChange={e=>setChatInput(e.target.value)}
                    placeholder={`Ask your ${activeAgent?AGENTS[activeAgent]?.label||"agent":cxo.title+" advisor"}…`}
                    onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMsg()}
                    style={{flex:1}}/>
                  <button onClick={sendMsg} disabled={chatLoading||!chatInput.trim()}
                    style={{padding:"9px 18px",borderRadius:8,background:chatLoading||!chatInput.trim()?"#F1F5F9":cxo.color,color:chatLoading||!chatInput.trim()?"#94A3B8":cxo.color===AMBER?N:"#fff",border:"none",cursor:chatLoading||!chatInput.trim()?"not-allowed":"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,transition:"all .15s"}}>
                    Send
                  </button>
                </div>
                {/* Quick prompts */}
                <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                  {(activeCxo==="ceo"?["What is my #1 priority this week?","How do I reach $10k MRR?","Validate my goal for today","When should I start the Capitalise phase?","Prepare my investor update"]:
                    activeCxo==="cmo"?["Best channel for my niche?","Write me a LinkedIn post","Plan my content this week"]:
                    activeCxo==="cso"?["Write a demo script","Handle my top objection","Who should I upsell?","Find my next enterprise deal","Track investor conversations"]:
                    activeCxo==="cfo"?["Calculate my unit economics","What is my break-even?","Model my 90-day MRR"]:
                    activeCxo==="coo"?["Write my Day 1 welcome email","Generate a customer health score report","Design a website for my HVAC business","Build a single-page website for a Dallas consultant","Generate HTML for a roofing company website","Deploy my website to Vercel step by step","Write a win-back sequence for churned customers"]:
                    activeCxo==="cto"?["What tech should I build next?","Review my Vercel setup","Supabase migration plan"]:
                    activeCxo==="cdo"?["What is my activation bottleneck?","Analyse my funnel","What metric should I focus on?"]:
                    activeCxo==="chro"?["When should I hire?","Write a job description","Interview questions for a growth marketer"]:
                    activeCxo==="ciso"?["Check my security posture","GDPR checklist","API key rotation plan"]:
                    activeCxo==="board"?["Draft my board meeting agenda","Review our governance framework","Evaluate an M&A opportunity","Write my investor update report","Assess our exit readiness","Build our risk register"]:
                    activeCxo==="cio"?["Am I ready to raise?","Write my investor update email","What should my valuation be?","Prepare my due diligence checklist","Write a cold investor outreach script","How do I find my lead investor?"]:
                    activeCxo==="hov"?["Best niche in Dallas for HVAC?","HVAC seasonal campaign script","Real estate listing description"]:
                    ["Help me with this","Give me a plan","What should I do today?"]
                  ).map((q,i)=>(
                    <button key={i} onClick={()=>{setChatInput(q);}} style={{padding:"4px 11px",borderRadius:20,border:`1px solid ${cxo.color}44`,background:`${cxo.color}08`,fontSize:11,color:cxo.color,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{q}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ══ AGENTS TAB ══ */}
            {activeTab==="agents" && (
              <div>
                {/* Vertical agents dashboard */}
                {activeCxo==="hov" ? (
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>
                      Head of Verticals — 10 Industry Agent Packs · Dallas & Texas
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:16}}>
                      {cxo.agents.map(aid => {
                        const a = AGENTS[aid]; if (!a) return null
                        const isActive = activeVertical === aid
                        const vContacts = crmContacts.filter(c =>
                          c.tags?.includes(aid) ||
                          c.role?.toLowerCase().includes(a.label.split(" ")[0].toLowerCase()) ||
                          c.notes?.toLowerCase().includes(aid)
                        )
                        return (
                          <div key={aid} onClick={()=>{setActiveVertical(aid);setActiveAgent(aid)}}
                            style={{padding:12,borderRadius:11,border:`1.5px solid ${isActive?a.color:a.color+"33"}`,background:isActive?`${a.color}15`:`${a.color}06`,cursor:"pointer",transition:"all .15s",textAlign:"center"}}>
                            <i className={`ti ${a.icon}`} style={{fontSize:22,color:a.color,display:"block",marginBottom:6}} aria-hidden="true"/>
                            <div style={{fontSize:11,fontWeight:600,color:N,lineHeight:1.3,marginBottom:4}}>{a.label.replace(" Agent","")}</div>
                            <div style={{fontSize:9.5,color:"#94A3B8",marginBottom:6,lineHeight:1.3}}>{a.desc.split(",")[0]}</div>
                            <div style={{fontSize:10,fontWeight:600,color:a.color}}>{vContacts.length} CRM contacts</div>
                          </div>
                        )
                      })}
                    </div>
                    {/* Active vertical detail */}
                    {(() => {
                      const va = AGENTS[activeVertical]; if (!va) return null
                      const vContacts = crmContacts.filter(c =>
                        c.tags?.includes(activeVertical) ||
                        c.role?.toLowerCase().includes(va.label.split(" ")[0].toLowerCase())
                      )
                      return (
                        <div className="card">
                          <div style={{padding:"12px 16px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",gap:10}}>
                            <i className={`ti ${va.icon}`} style={{fontSize:18,color:va.color}} aria-hidden="true"/>
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:600,color:N}}>{va.label}</div>
                              <div style={{fontSize:11.5,color:"#64748B"}}>{va.desc}</div>
                            </div>
                            <a href="/verticals" style={{fontSize:11,color:"#378ADD",textDecoration:"none",fontWeight:500}}>Full dashboard →</a>
                          </div>
                          <div style={{padding:"12px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                            <div>
                              <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>CRM contacts in this vertical</div>
                              {vContacts.length===0?(
                                <div style={{fontSize:12.5,color:"#94A3B8",padding:"10px 0"}}>No contacts tagged for this vertical yet. <a href="/crm" style={{color:"#378ADD"}}>Add in CRM →</a></div>
                              ):vContacts.slice(0,5).map(c=>(
                                <div key={String(c.id)} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:"1px solid #F1F5F9"}}>
                                  <div style={{width:24,height:24,borderRadius:"50%",background:`${va.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,color:va.color}}>
                                    {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                                  </div>
                                  <div style={{flex:1,fontSize:12,color:N}}>{c.name}</div>
                                  <span style={{fontSize:10,padding:"1px 6px",borderRadius:6,background:`${va.color}15`,color:va.color}}>{c.stage}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Quick actions</div>
                              {[`Generate ${va.label.split(" ")[0]} outreach script`,`${va.label.split(" ")[0]} seasonal campaign`,`Validate this niche with SIXXAB`].map((q,i)=>(
                                <button key={i} onClick={()=>{setChatInput(q);setActiveTab("chat")}}
                                  style={{display:"block",width:"100%",marginBottom:6,padding:"8px 11px",borderRadius:8,border:`1px solid ${va.color}33`,background:`${va.color}08`,fontSize:12,color:va.color,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all .15s"}}>
                                  → {q}
                                </button>
                              ))}
                              <a href="/niche-validator" style={{display:"block",padding:"8px 11px",borderRadius:8,background:va.color,color:va.color===AMBER?N:"#fff",fontSize:12,fontWeight:600,textDecoration:"none",textAlign:"center",marginTop:4}}>
                                🎯 Validate this niche →
                              </a>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  /* Horizontal CXO agents */
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>
                      {cxo.title} — {cxo.name} · Specialist Agents
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                      {cxo.agents.map(aid => {
                        const a = AGENTS[aid]; if (!a) return null
                        return (
                          <div key={aid} className="card" style={{border:`1px solid ${a.color}33`,cursor:"pointer",transition:"all .15s"}}
                            onClick={()=>{setActiveAgent(aid);setActiveTab("chat")}}
                            onMouseOver={e=>e.currentTarget.style.borderColor=a.color}
                            onMouseOut={e=>e.currentTarget.style.borderColor=`${a.color}33`}>
                            <div style={{padding:"12px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
                              <div style={{width:36,height:36,borderRadius:9,background:`${a.color}18`,border:`1px solid ${a.color}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                <i className={`ti ${a.icon}`} style={{fontSize:16,color:a.color}} aria-hidden="true"/>
                              </div>
                              <div style={{flex:1}}>
                                <div style={{fontSize:13,fontWeight:500,color:N,marginBottom:3}}>{a.label}</div>
                                <div style={{fontSize:11.5,color:"#64748B",lineHeight:1.5}}>{a.desc}</div>
                              </div>
                            </div>
                            <div style={{padding:"8px 14px",borderTop:`1px solid ${a.color}22`,background:`${a.color}05`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <span style={{fontSize:11,color:a.color,fontWeight:500}}>Open agent →</span>
                              <span style={{fontSize:10,color:"#94A3B8"}}>via CXO chat</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {/* Marketing agent — script generator */}
                    {(activeCxo==="cmo"||activeCxo==="cso") && (
                      <div className="card">
                        <div style={{padding:"11px 14px",borderBottom:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div style={{fontSize:13,fontWeight:500,color:N}}>Outreach script generator</div>
                          <div style={{display:"flex",gap:6}}>
                            <a href="/crm" style={{fontSize:11,color:"#1D9E75",textDecoration:"none",fontWeight:500,display:"flex",alignItems:"center",gap:4}}>
                              <i className="ti ti-address-book" style={{fontSize:11}} aria-hidden="true"/>SIXXAB CRM ({crmContacts.length})
                            </a>
                            <button onClick={()=>setShowCrmPicker(!showCrmPicker)} style={{fontSize:11,color:AMBER,fontWeight:500,background:"#FFFBF2",border:`1px solid ${AMBER}44`,borderRadius:6,padding:"3px 9px",cursor:"pointer",fontFamily:"inherit"}}>
                              + Add from CRM
                            </button>
                          </div>
                        </div>
                        {showCrmPicker && (
                          <div style={{padding:10,borderBottom:"1px solid #E8ECF4",background:"#FAFAFA"}}>
                            <input className="inp" style={{marginBottom:7}} placeholder="Search CRM contacts…" value={crmSearch} onChange={e=>setCrmSearch(e.target.value)}/>
                            <div style={{maxHeight:160,overflowY:"auto"}}>
                              {crmContacts.length===0?(
                                <div style={{fontSize:12,color:"#94A3B8",padding:"8px",textAlign:"center"}}>No CRM contacts. <a href="/crm" style={{color:"#378ADD"}}>Import from LinkedIn →</a></div>
                              ):crmContacts.filter(c=>!crmSearch||`${c.name} ${c.role} ${c.company}`.toLowerCase().includes(crmSearch.toLowerCase())).slice(0,8).map(c=>{
                                const sel = selectedLeads.includes(String(c.id))
                                return (
                                  <div key={String(c.id)} onClick={()=>setSelectedLeads(sel?selectedLeads.filter(x=>x!==String(c.id)):[...selectedLeads,String(c.id)])}
                                    style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",cursor:"pointer",borderRadius:7,background:sel?"#FFFBF2":"transparent",marginBottom:2}}>
                                    <div style={{width:20,height:20,borderRadius:"50%",background:sel?`${AMBER}30`:"#F1F5F9",border:`1.5px solid ${sel?AMBER:"#E2E8F0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:sel?AMBER:"#94A3B8",flexShrink:0}}>
                                      {sel?"✓":c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                                    </div>
                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{fontSize:12.5,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                                      <div style={{fontSize:10.5,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.role||c.company||"—"}</div>
                                    </div>
                                    <span style={{fontSize:9.5,padding:"1px 6px",borderRadius:6,background:"#F1F5F9",color:"#64748B",flexShrink:0}}>{c.stage}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            {["LinkedIn","Email","WhatsApp","X / Twitter","SMS"].map(ch=>(
                              <button key={ch} onClick={()=>setActiveChannel(ch)}
                                style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${activeChannel===ch?AMBER:"#E2E8F0"}`,background:activeChannel===ch?"#FFFBF2":"#F8F9FA",fontSize:12,fontWeight:500,color:activeChannel===ch?N:"#64748B",cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
                                {ch}
                              </button>
                            ))}
                          </div>
                          <textarea className="inp" rows={2} value={offer} onChange={e=>setOffer(e.target.value)}
                            placeholder="What are you offering? (platform name, price, value prop)" style={{resize:"none",lineHeight:1.5}}/>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{fontSize:12,color:"#64748B"}}>{selectedLeads.length} contact{selectedLeads.length!==1?"s":""} selected</span>
                            <button onClick={generateScripts} disabled={scriptLoading||!selectedLeads.length}
                              style={{flex:1,padding:10,borderRadius:9,background:scriptLoading||!selectedLeads.length?"#F1F5F9":AMBER,color:scriptLoading||!selectedLeads.length?"#94A3B8":N,border:"none",cursor:scriptLoading||!selectedLeads.length?"not-allowed":"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,transition:"all .15s"}}>
                              {scriptLoading?<><span style={{display:"inline-block",width:12,height:12,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"spin .8s linear infinite",marginRight:6,verticalAlign:"middle"}}/>Generating…</>:"✦ Generate scripts →"}
                            </button>
                          </div>
                          {scripts && (
                            <div style={{background:N,borderRadius:10,padding:"12px 14px",position:"relative"}}>
                              <div style={{fontFamily:"'DM Mono'",fontSize:9.5,color:AMBER,letterSpacing:".08em",marginBottom:8}}>GENERATED SCRIPTS</div>
                              <div style={{fontSize:12.5,color:"rgba(245,245,240,.85)",lineHeight:1.75,whiteSpace:"pre-wrap"}}>{scripts}</div>
                              <button onClick={()=>navigator.clipboard.writeText(scripts||"")}
                                style={{marginTop:10,padding:"7px 14px",borderRadius:7,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>
                                Copy all
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ══ PIPELINE TAB ══ */}
            {activeTab==="pipeline" && (
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:N}}>Sales pipeline — {crmContacts.length} contacts</div>
                    <div style={{fontSize:11.5,color:"#64748B",marginTop:2}}>
                      Pipeline value: ${crmContacts.filter(c=>["Outreach","Replied","Demo","Proposal","Negotiation"].includes(c.stage)).reduce((a,c)=>a+(c.value==="Pro"?99.50:c.value==="Agency"?175:c.value==="Enterprise"?350:49.50),0).toFixed(2)}/mo potential
                    </div>
                  </div>
                  <a href="/crm" style={{fontSize:12,color:"#1D9E75",textDecoration:"none",fontWeight:500,display:"flex",alignItems:"center",gap:4}}>
                    <i className="ti ti-external-link" style={{fontSize:12}} aria-hidden="true"/>Full SIXXAB CRM
                  </a>
                </div>
                <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8}}>
                  {PIPELINE_STAGES.map((p,i) => {
                    const stageLeads = crmContacts.filter(l => l.stage === p.stage)
                    return (
                      <div key={i} style={{minWidth:150,flex:1}}>
                        <div style={{background:p.color,borderRadius:"9px 9px 0 0",padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:10.5,fontWeight:700,color:p.txt,textTransform:"uppercase",letterSpacing:".06em"}}>{p.stage}</span>
                          <span style={{width:18,height:18,borderRadius:"50%",background:p.txt,color:p.color,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",opacity:.8}}>{stageLeads.length}</span>
                        </div>
                        <div style={{background:"#F8F9FA",borderRadius:"0 0 9px 9px",border:`1px solid ${p.color}`,borderTop:"none",minHeight:60,padding:"6px"}}>
                          {stageLeads.length===0 && <div style={{fontSize:10,color:"#CBD5E1",textAlign:"center",padding:"10px 0"}}>Empty</div>}
                          {stageLeads.map(l=>(
                            <div key={String(l.id)} style={{background:"#fff",borderRadius:7,padding:"8px 9px",marginBottom:5,border:"1px solid #E8ECF4",cursor:"pointer"}}
                              onClick={()=>window.open("/crm","_blank")}>
                              <div style={{fontSize:12,fontWeight:500,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</div>
                              <div style={{fontSize:10,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.role||l.company||"—"}</div>
                              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                                <span style={{fontSize:9.5,color:"#64748B"}}>{l.source||"—"}</span>
                                <span style={{fontSize:9.5,fontWeight:600,color:"#1D9E75"}}>{l.value||"Starter"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ══ DETAILS TAB ══ */}
            {activeTab==="details" && (
              <div>
                {/* CEO details */}
                {activeCxo==="ceo" && (
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div className="card" style={{padding:16}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>3-phase business targets</div>
                      {[["Phase 1","Months 1–3","$10k MRR · 100 customers","#EF9F27"],
                        ["Phase 2","Months 4–8","$100k ARR · 1,000 customers","#1D9E75"],
                        ["Phase 3","Months 9–12","$1M ARR · 5,000 customers","#7C3AED"]].map(([p,m,t,c])=>(
                        <div key={p} style={{padding:"10px 0",borderBottom:"1px solid #F1F5F9",display:"flex",gap:10}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:c,marginTop:5,flexShrink:0}}/>
                          <div>
                            <div style={{fontSize:12.5,fontWeight:500,color:N}}>{p} — {m}</div>
                            <div style={{fontSize:12,color:"#64748B"}}>{t}</div>
                          </div>
                        </div>
                      ))}
                      <a href="/roadmap" style={{display:"block",marginTop:12,padding:"9px",borderRadius:9,background:AMBER,color:N,fontSize:12,fontWeight:600,textDecoration:"none",textAlign:"center"}}>View full roadmap →</a>
                    </div>
                    <div className="card" style={{padding:16}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Live CRM snapshot</div>
                      {[["Total contacts",crmStats.total,"#64748B"],["In pipeline",crmStats.pipeline,AMBER],["Closed customers",crmStats.closed,"#1D9E75"],["Hot leads (80+)",crmStats.hot,"#DC2626"]].map(([l,v,c])=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #F1F5F9"}}>
                          <span style={{fontSize:12.5,color:"#64748B"}}>{l}</span>
                          <span style={{fontSize:13,fontWeight:700,color:c}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* CFO details */}
                {activeCxo==="cfo" && (
                  <div className="card" style={{padding:16}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Financial model — SIXXAB AI pricing</div>
                    {[["Starter","$99/mo","$49.50 founding","$594 annual LTV"],["Pro","$199/mo","$99.50 founding","$1,194 annual LTV"],["Agency","$350/mo","$175 founding","$2,100 annual LTV"]].map(([n,f,p,l])=>(
                      <div key={n} style={{padding:"10px 0",borderBottom:"1px solid #F1F5F9",display:"grid",gridTemplateColumns:"80px 1fr 1fr 1fr",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:12.5,fontWeight:600,color:N}}>{n}</span>
                        <span style={{fontSize:12,color:"#94A3B8",textDecoration:"line-through"}}>{f}</span>
                        <span style={{fontSize:13,fontWeight:700,color:AMBER}}>{p}</span>
                        <span style={{fontSize:12,color:"#1D9E75"}}>{l}</span>
                      </div>
                    ))}
                    <div style={{marginTop:12,padding:"10px 12px",background:"#F0FDF4",borderRadius:9,border:"1px solid #BBF7D0",fontSize:12.5,color:"#065F46"}}>
                      Current CRM MRR potential: <strong>${crmStats.mrr.toFixed(2)}/mo</strong> from {crmStats.closed} closed customers
                    </div>
                  </div>
                )}
                {/* CHRO details */}
                {activeCxo==="chro" && (
                  <div className="card" style={{padding:16}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>12-month hiring plan</div>
                    {HIRE_PLAN.map((h,i)=>(
                      <div key={i} style={{display:"flex",gap:12,padding:"11px 0",borderBottom:i<HIRE_PLAN.length-1?"1px solid #F1F5F9":"none",alignItems:"flex-start"}}>
                        <div style={{width:36,height:36,borderRadius:9,background:"#F5F3FF",border:"1px solid #C4B5FD",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <i className="ti ti-user-plus" style={{fontSize:16,color:"#7C3AED"}} aria-hidden="true"/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span style={{fontSize:13,fontWeight:500,color:N}}>{h.role}</span>
                            <span style={{fontSize:11,fontWeight:600,color:"#7C3AED"}}>{h.when} · {h.cost}</span>
                          </div>
                          <div style={{fontSize:11.5,color:"#64748B",marginTop:3}}>{h.why}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* COO details */}
                {activeCxo==="coo" && (
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div className="card" style={{padding:16}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Customer onboarding sequence</div>
                      {[["Day 0","Welcome email + account setup guide","#7C3AED"],["Day 1","Run Orchestrator walkthrough — set first weekly goal","#7C3AED"],["Day 3","Check-in — did they complete their first outreach?","#EF9F27"],["Day 7","Progress review — CRM contacts added? Scripts sent?","#EF9F27"],["Day 14","Health score check — usage signals reviewed","#DC2626"],["Day 30","NPS survey + success milestone celebration","#1D9E75"],["Day 60","Expansion conversation — upgrade or add team seats","#1D9E75"],["Day 90","Renewal + case study offer","#1D9E75"]].map(([d,t,c])=>(
                        <div key={d} style={{display:"flex",gap:9,padding:"8px 0",borderBottom:"1px solid #F1F5F9"}}>
                          <div style={{width:24,height:24,borderRadius:"50%",background:`${c}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:c,flexShrink:0}}>{d.split(" ")[1]}</div>
                          <div style={{fontSize:12.5,color:N,lineHeight:1.5}}>{t}</div>
                        </div>
                      ))}
                    </div>
                    <div className="card" style={{padding:16}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Support queue</div>
                      <div style={{padding:"20px",textAlign:"center",color:"#94A3B8",fontSize:12.5}}>
                        Connect your support system via Orchestrator.<br/>Set goal: "Resolve all open support tickets" and the Support Agent will draft replies.
                        <a href="/orchestrator" style={{display:"block",marginTop:12,padding:"9px",borderRadius:9,background:"#7C3AED",color:"#fff",fontSize:12,fontWeight:600,textDecoration:"none"}}>Run Orchestrator →</a>
                      </div>
                    </div>
                  </div>
                )}
                {/* Board — Corporate Governance details */}
                {activeCxo==="board" && (
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                      <div className="card" style={{padding:16}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Board activation timeline</div>
                        {[["Phase 1–3","Advisory board optional — 1–2 operators"],["Phase 4","Formal board at first institutional raise"],["Phase 5","Full board: lead investor + 2 independents"],["Phase 6","Expanded board + audit committee pre-IPO"]].map(([p,d])=>(
                          <div key={p} style={{padding:"7px 0",borderBottom:"1px solid #F1F5F9",fontSize:12}}>
                            <div style={{fontWeight:600,color:N,marginBottom:2}}>{p}</div>
                            <div style={{color:"#64748B"}}>{d}</div>
                          </div>
                        ))}
                      </div>
                      <div className="card" style={{padding:16}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Cross-CXO board connections</div>
                        {[{cxo:"CIO",icon:"ti-currency-dollar",color:"#DC2626",link:"Fundraising, investor relations, valuation",action:()=>setActiveCxo("cio")},{cxo:"CFO",icon:"ti-chart-line",color:"#378ADD",link:"Audit readiness, financial controls",action:()=>setActiveCxo("cfo")},{cxo:"CISO",icon:"ti-shield-lock",color:"#DC2626",link:"SOC 2, risk management, data governance",action:()=>setActiveCxo("ciso")},{cxo:"CEO",icon:"ti-crown",color:"#EF9F27",link:"Strategic decisions, board reporting",action:()=>setActiveCxo("ceo")}].map((r,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:i<3?"1px solid #F1F5F9":"none",cursor:"pointer"}} onClick={r.action}>
                            <div style={{width:26,height:26,borderRadius:7,background:`${r.color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              <i className={`ti ${r.icon}`} style={{fontSize:12,color:r.color}} aria-hidden="true"/>
                            </div>
                            <div style={{flex:1,fontSize:11.5,color:"#64748B"}}><strong style={{color:N}}>{r.cxo}</strong> — {r.link}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {[["ti-gavel","Governance","charter, duties, structure"],["ti-arrows-exchange","M&A","evaluate, structure, exit"],["ti-shield-check","Audit","controls, SOC 2, risk"],["ti-door-exit","Exit","IPO, acquisition, liquidity"]].map(([ic,l,d])=>(
                        <div key={l} style={{padding:"12px",borderRadius:10,background:"#EEF2F8",border:"1px solid #C7D2E0",textAlign:"center"}}>
                          <i className={`ti ${ic}`} style={{fontSize:20,color:"#1E3A5F",display:"block",marginBottom:6}} aria-hidden="true"/>
                          <div style={{fontSize:12,fontWeight:600,color:"#1E3A5F",marginBottom:2}}>{l}</div>
                          <div style={{fontSize:10,color:"#64748B"}}>{d}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CIO — Capitalise phase details */}
                {activeCxo==="cio" && (
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                      <div className="card" style={{padding:16}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Phase 5 — Capitalise gate</div>
                        {[["Entry","$500k ARR, MRR growing 15%+, team of 3–6"],["Exit","Seed or Series A closed, enterprise contracts signed"],["Timeline","Months 13–24"],["Revenue","$500k → $2M ARR"]].map(([l,v])=>(
                          <div key={l} style={{display:"flex",justifyContent:"space-between",gap:8,padding:"7px 0",borderBottom:"1px solid #F1F5F9",fontSize:12}}>
                            <span style={{color:"#94A3B8",flexShrink:0}}>{l}</span>
                            <span style={{fontWeight:500,color:N,textAlign:"right"}}>{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="card" style={{padding:16}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Live metrics from SIXXAB CRM</div>
                        {[["Contacts",crmStats.total],["Pipeline",crmStats.pipeline],["Closed customers",crmStats.closed],["MRR potential","$"+crmStats.mrr.toFixed(0)+"/mo"]].map(([l,v])=>(
                          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #F1F5F9",fontSize:12}}>
                            <span style={{color:"#94A3B8"}}>{l}</span>
                            <span style={{fontWeight:700,color:"#DC2626"}}>{v}</span>
                          </div>
                        ))}
                        <a href="/investor" style={{display:"block",marginTop:10,padding:"9px",borderRadius:9,background:"#DC2626",color:"#fff",fontSize:12,fontWeight:600,textDecoration:"none",textAlign:"center"}}>Open Investor Hub →</a>
                      </div>
                    </div>
                    <div className="card" style={{padding:16}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Capitalise phase cross-CXO connections</div>
                      {[
                        {cxo:"CEO",icon:"ti-crown",color:"#EF9F27",link:"Board narrative, Series A story, investor update",action:()=>setActiveCxo("ceo")},
                        {cxo:"CFO",icon:"ti-chart-line",color:"#378ADD",link:"Financial model, unit economics, fundraising ask",action:()=>setActiveCxo("cfo")},
                        {cxo:"CSO",icon:"ti-trending-up",color:"#1D9E75",link:"Enterprise pipeline, strategic partnerships",action:()=>setActiveCxo("cso")},
                        {cxo:"CHRO",icon:"ti-users",color:"#F59E0B",link:"Hire plan post-close, org structure, comp design",action:()=>setActiveCxo("chro")},
                        {cxo:"CTO",icon:"ti-code",color:"#0EA5E9",link:"Tech due diligence, SOC 2, architecture review",action:()=>setActiveCxo("cto")},
                      ].map((r,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<4?"1px solid #F1F5F9":"none",cursor:"pointer"}} onClick={r.action}>
                          <div style={{width:30,height:30,borderRadius:8,background:`${r.color}18`,border:`1px solid ${r.color}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <i className={`ti ${r.icon}`} style={{fontSize:14,color:r.color}} aria-hidden="true"/>
                          </div>
                          <div style={{flex:1}}>
                            <span style={{fontSize:12.5,fontWeight:500,color:N}}>{r.cxo}</span>
                            <span style={{fontSize:11.5,color:"#64748B",marginLeft:6}}>{r.link}</span>
                          </div>
                          <i className="ti ti-chevron-right" style={{fontSize:12,color:"#CBD5E1"}} aria-hidden="true"/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HOV — Verticals dashboard summary */}
                {activeCxo==="hov" && (
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:14}}>
                      {cxo.agents.map(aid=>{
                        const a=AGENTS[aid]; if(!a) return null
                        const cnt=crmContacts.filter(c=>c.tags?.includes(aid)||c.role?.toLowerCase().includes(a.label.split(" ")[0].toLowerCase())).length
                        return (
                          <div key={aid} style={{background:"#fff",border:`1px solid ${a.color}33`,borderRadius:10,padding:"12px 10px",textAlign:"center"}}>
                            <i className={`ti ${a.icon}`} style={{fontSize:20,color:a.color,display:"block",marginBottom:5}} aria-hidden="true"/>
                            <div style={{fontSize:11,fontWeight:500,color:N,marginBottom:3}}>{a.label.replace(" Agent","")}</div>
                            <div style={{fontSize:12,fontWeight:700,color:a.color}}>{cnt} contacts</div>
                          </div>
                        )
                      })}
                    </div>
                    <a href="/verticals" style={{display:"block",padding:"13px",borderRadius:11,background:N,color:CHALK,fontSize:14,fontWeight:700,textDecoration:"none",textAlign:"center"}}>
                      Open full Vertical Agents dashboard →
                    </a>
                  </div>
                )}
                {/* Default for unhandled CXOs */}
                {!["ceo","cfo","chro","coo","hov"].includes(activeCxo) && (
                  <div className="card" style={{padding:24,textAlign:"center"}}>
                    <div style={{fontSize:24,marginBottom:10}}><i className={`ti ${cxo.icon}`} style={{color:cxo.color}} aria-hidden="true"/></div>
                    <div style={{fontSize:14,fontWeight:600,color:N,marginBottom:6}}>{cxo.title} — {cxo.name}</div>
                    <div style={{fontSize:13,color:"#64748B",lineHeight:1.7,maxWidth:360,margin:"0 auto 16px"}}>{cxo.desc}</div>
                    <button onClick={()=>setActiveTab("chat")} style={{padding:"10px 24px",borderRadius:9,background:cxo.color,color:cxo.color===AMBER?N:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>
                      Open {cxo.title} advisor chat →
                    </button>
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
