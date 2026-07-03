// pages/api/orchestrate.js — Master orchestration engine
// Connects business profile + all agents into one strategy + execution plan
export const config = { api: { bodyParser: { sizeLimit: '2mb' } } }
import { supabaseAdmin, getUserFromRequest } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })

  const user = await getUserFromRequest(req)
  const db = supabaseAdmin

  const { goal, mode = 'full', context = {} } = req.body ?? {}

  // Load business profile from DB if user is authenticated
  let bizContext = context
  if (user && db) {
    const { data: biz } = await db.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle()
    const { data: contacts } = await db.from('crm_contacts').select('id,name,stage').eq('user_id', user.id).limit(10)
    const { data: leads } = await db.from('leads').select('id,name,status').eq('user_id', user.id).limit(10)
    if (biz) bizContext = { ...biz, recent_contacts: contacts || [], recent_leads: leads || [], ...context }
  }

  const MODES = {
    strategy: buildStrategyPrompt,
    marketing: buildMarketingPrompt,
    sales: buildSalesPrompt,
    ops: buildOpsPrompt,
    full: buildFullPrompt,
  }

  const promptFn = MODES[mode] || MODES.full
  const prompt = promptFn(goal, bizContext)

  const start = Date.now()
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
    })
    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message })

    const output = d.content?.[0]?.text || ''
    const tokens = d.usage?.output_tokens || 0
    const duration = Date.now() - start

    // Save agent run to DB
    if (user && db) {
      await db.from('agent_runs').insert({ user_id: user.id, agent_type: 'orchestrator', tool: mode, input: goal, output, tokens_used: tokens, duration_ms: duration })
    }

    return res.status(200).json({ output, mode, tokens, duration })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}

// ── Prompt builders ─────────────────────────────────────────────
function bizContext(biz) {
  if (!biz || !biz.business_name) return ""
  return `
BUSINESS CONTEXT:
Business: ${biz.business_name}
Industry: ${biz.industry || "Not specified"}
Stage: ${biz.stage || "Pre-revenue"}
Location: ${biz.location || "Dallas, TX"}
Target MRR: $${biz.target_mrr || "TBD"}
Current MRR: $${biz.current_mrr || 0}
Target market: ${biz.target_market || "SMB owners"}
ICP: ${biz.icp || "Not defined"}
USP: ${biz.usp || "Not defined"}
Pain points: ${biz.pain_points || "Not defined"}
Website: ${biz.website || "Not built yet"}
Team size: ${biz.team_size || 1}
Recent contacts in CRM: ${biz.recent_contacts?.length || 0}
Recent leads: ${biz.recent_leads?.length || 0}
`}

function buildStrategyPrompt(goal, biz) {
  return `You are the SIXXAB AI CEO + Board of Directors.
${bizContext(biz)}

GOAL: ${goal}

Create a complete 90-day strategic plan:

## SITUATION ANALYSIS
- Where are we now? (strengths, gaps, risks)
- What is the ONE bottleneck blocking growth right now?

## 90-DAY STRATEGIC PRIORITIES
Three priorities only. For each: what, why, success metric.

## WEEK 1 ACTION PLAN (48-HOUR SPRINT)
Exactly 5 actions the founder does personally in the next 48 hours. Specific, no fluff.

## OFFER STRATEGY
What exact offer should we be selling right now?
- Productised service or SaaS product?
- Price point and justification
- How to position it against competitors

## KEY METRICS TO TRACK
5 KPIs with current baseline, target and how to measure.

## RISKS
Top 3 risks and mitigation plan.

Be direct, specific, opinionated. No generic advice.`
}

function buildMarketingPrompt(goal, biz) {
  return `You are the SIXXAB AI CMO.
${bizContext(biz)}

GOAL: ${goal}

Create a complete marketing and content strategy:

## IDEAL CUSTOMER PROFILE (ICP)
- Primary buyer persona: job title, company size, trigger events
- Where they spend time online
- What content they respond to

## CONTENT MARKETING PLAN
- 3 content pillars for LinkedIn
- 5 specific post ideas with hooks (write the first line of each)
- YouTube/video strategy if applicable
- Email newsletter approach

## LEAD GENERATION STRATEGY
- Top 3 channels to focus on (ranked by ROI for this business)
- LinkedIn outreach sequence (7 touchpoints)
- Cold email subject lines (write 5 specific ones)
- Lead magnet idea that would convert

## SOCIAL MEDIA
- Primary platform and why
- Posting frequency
- Content mix (educational/promotional/personal ratio)

## PAID ADVERTISING
- Should we run paid ads? If yes: platform, budget, targeting, offer
- Google Ads: which keywords to target

## 30-DAY MARKETING SPRINT
Week by week plan. What to execute each week.

Be specific. Give actual copy examples, not templates.`
}

function buildSalesPrompt(goal, biz) {
  return `You are the SIXXAB AI CSO (Chief Sales Officer).
${bizContext(biz)}

GOAL: ${goal}

Build a complete sales system:

## SALES STRATEGY
- Best sales motion for this business (inbound/outbound/channel/PLG?)
- Target deal size and sales cycle length
- How many deals needed to hit target MRR?

## OUTREACH SEQUENCE
Write a 7-touchpoint LinkedIn + email sequence:
Day 1: LinkedIn connection request (max 300 chars)
Day 3: LinkedIn follow-up message
Day 5: Email subject + first 2 sentences
Day 8: LinkedIn DM with value
Day 12: Email with case study angle
Day 16: LinkedIn video message prompt
Day 21: Final break-up message

## DISCOVERY CALL SCRIPT
Opening (30 sec), 5 discovery questions, demo flow, closing technique.

## PROPOSAL STRUCTURE
What to include in a proposal for this business type. Give section headings and what goes in each.

## OBJECTION HANDLING
Top 5 objections and exact rebuttals.

## CRM PIPELINE
5 stages with entry/exit criteria and suggested follow-up cadence.

Give actual scripts and copy, not generic advice.`
}

function buildOpsPrompt(goal, biz) {
  return `You are the SIXXAB AI COO.
${bizContext(biz)}

GOAL: ${goal}

Design the operations system:

## DAILY OPERATING RHYTHM
What the founder does each day in 2 hours or less to run the business.

## ONBOARDING SEQUENCE
For a new customer: Day 0, Day 1, Day 3, Day 7, Day 14, Day 30 touchpoints.
Write the actual email/message for each.

## CUSTOMER SUCCESS SYSTEM
- Health score definition (what signals good vs at-risk)
- NPS cadence
- Expansion triggers
- Churn intervention playbook

## AUTOMATION OPPORTUNITIES
Top 5 processes to automate right now (tools + how).

## WEBSITE & DIGITAL PRESENCE
What pages/sections the website needs for this business type.
Social media profiles to set up and what to post first week.

## TEAM BUILDING
When to hire the first person, what role, how to find them.

Be very specific. Give actual templates, not frameworks.`
}

function buildFullPrompt(goal, biz) {
  return `You are the full SIXXAB AI executive team: CEO, CMO, CSO, COO, CFO all collaborating.
${bizContext(biz)}

GOAL: ${goal}

Create a complete business execution plan covering all functions:

## CEO: STRATEGIC DIRECTION
- The single most important move to make right now
- 90-day milestone with specific revenue target
- Biggest risk and how to avoid it

## CMO: MARKETING & CONTENT
- Top 2 channels (ranked by ROI)
- 3 content pillar topics for LinkedIn
- Lead magnet that would convert
- First 3 posts to publish this week (write the hooks)

## CSO: SALES SYSTEM
- Outreach target: who to contact and how
- Write a LinkedIn connection request for the ICP
- 7-day outreach sequence outline
- Pricing recommendation with justification

## COO: OPERATIONS & DELIVERY
- Customer onboarding flow (Day 0 → Day 30)
- One process to systematise this week
- Website checklist: what must be live before selling

## CFO: FINANCIAL MODEL
- Revenue model recommendation
- Unit economics: CAC, LTV, payback period
- When to break even at current trajectory

## WEEK 1 SPRINT
Exactly 10 actions ranked by impact × effort. Owner (founder/hire/tool) for each.

Make every section specific to ${biz?.business_name || "this business"}. No generic advice.`
}
