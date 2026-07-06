// pages/api/sales/agent.js — Unified 4-Level Sales AI Engine
export const config = { api: { bodyParser: { sizeLimit: '2mb' } } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })

  const { mode, prospect, context, contacts, playbook } = req.body ?? {}

  const MODES = {

    // ── LEVEL 1: Research a prospect ──────────────────────────────
    research: `You are an elite B2B sales intelligence analyst.
Prospect: ${JSON.stringify(prospect || {})}
Context: ${context || ''}

Deliver a full prospect intelligence brief:

## PROSPECT PROFILE
- Role, seniority, decision-making power
- Company size, revenue, growth stage
- Tech stack (likely based on industry/size)
- Recent news, funding, hires, expansions

## PAIN POINT ANALYSIS
List 5 specific pain points this prospect DEFINITELY has right now based on their role and company stage. For each:
- Pain: [specific problem]
- Evidence: [why you know they have this]
- Cost: [what it's costing them monthly/annually]
- Our solution: [how SIXXAB AI solves it]

## BUYING SIGNALS
- Trigger events that make them likely to buy NOW
- Questions to ask to uncover urgency
- Red flags to watch for

## PERSONALISATION HOOKS
5 conversation starters specific to this person — not generic.

## RECOMMENDED APPROACH
- Best channel (LinkedIn/email/phone/referral)
- Best time to reach out
- Opening line that will get a response
- Decision timeline estimate`,

    // ── LEVEL 1: Draft email with subject lines ────────────────────
    email: `You are an elite cold email copywriter with 40% open rate track record.
Prospect: ${JSON.stringify(prospect || {})}
Context: ${context || ''}

Create a complete cold email package:

## SUBJECT LINES (A/B/C test — 3 options)
A: [Pattern interrupt / curiosity]
B: [Specific result / number]
C: [Name drop / relevance]

## EMAIL BODY (under 150 words)
[Personalised opening — 1 line referencing something specific]
[Pain point statement — make them feel understood]
[Proof — one specific result/stat]
[CTA — one low-friction ask]

## PS LINE
[Extra value or urgency]

## FOLLOW-UP SEQUENCE
Day 3: [Subject + 2-sentence reply bump]
Day 7: [Different angle entirely]
Day 14: [Value add — share resource]
Day 21: [Break-up email]

Make every word earn its place. No "Hope this finds you well."`,

    // ── LEVEL 1: Create pitch materials ───────────────────────────
    pitch: `You are a world-class sales deck consultant.
Prospect: ${JSON.stringify(prospect || {})}
Context: ${context || ''}

Create a tailored pitch one-pager:

## HEADLINE
[Their outcome, not our feature — max 8 words]

## THE PROBLEM (as they experience it)
[2-3 sentences in their language, not ours]

## THE COST OF INACTION
[Specific numbers — time lost, revenue missed, headcount cost]

## OUR SOLUTION
[What we do in 2 sentences — clear, no jargon]

## PROOF
[3 specific results with numbers]
[1 relevant case study — similar company/industry]

## THE OFFER
[Exact package, price, timeline]
[Risk reversal — what happens if it doesn't work]

## NEXT STEP
[One clear action — meeting, trial, demo]

Format for a one-page PDF or slide.`,

    // ── LEVEL 2: Pre-call intelligence brief ──────────────────────
    precall: `You are a sales intelligence system preparing a rep for a discovery call.
Prospect: ${JSON.stringify(prospect || {})}
Context: ${context || ''}

Generate a 5-minute pre-call brief:

## 30-SECOND COMPANY SNAPSHOT
[Everything they need to know about this company]

## THIS PERSON'S LIKELY PRIORITIES
[What keeps them up at night based on their role]

## CONVERSATION HISTORY SUMMARY
${context || 'No previous interactions recorded'}

## DISCOVERY QUESTIONS (prioritised)
1. [Most important — uncovers budget/urgency]
2. [Uncovers the real pain]
3. [Identifies decision process]
4. [Surfaces competition]
5. [Creates vision of success]

## OBJECTIONS TO EXPECT + REBUTTALS
- "Too expensive" → 
- "We already have a solution" →
- "Not the right time" →
- "Need to think about it" →
- "Need to talk to my team" →

## DEAL INTELLIGENCE
- Budget estimate based on company size
- Decision timeline
- Key stakeholders to involve
- Win probability: [%]

## CLOSING RECOMMENDATION
[If it goes well — exact next step to propose]`,

    // ── LEVEL 2: Buyer persona builder ────────────────────────────
    persona: `You are a B2B sales strategist building buyer personas.
Context: ${context || ''}
Contacts: ${JSON.stringify(contacts?.slice(0,5) || [])}

Build a detailed buyer persona:

## PRIMARY BUYER PERSONA: [Name the persona]
**Role:** [Job title range]
**Company:** [Size, industry, stage]
**Age range & background:** 

### GOALS
- Professional: [What they're measured on]
- Personal: [What they want for their career]

### PAINS (ranked by intensity)
1. [Most urgent pain — they'd pay to fix today]
2. [Important but not urgent]
3. [Nice to have fixed]

### BUYING BEHAVIOUR
- Research process: [How they evaluate vendors]
- Decision timeline: [Days from first contact to close]
- Budget authority: [Can they sign? What's the limit?]
- Who else is involved: [Economic buyer, champion, blocker]

### MESSAGING THAT WORKS
- Channels: [Where they spend time]
- Content: [What they read/watch]
- Tone: [Formal/casual, data-driven/story-driven]
- Hot words: [Phrases that resonate]
- Cold words: [Phrases that turn them off]

### SALES PLAYBOOK FOR THIS PERSONA
- Opening: [How to start the conversation]
- Demo focus: [What to show first]
- ROI framing: [How to present value]
- Close style: [Direct/consultative/trial]`,

    // ── LEVEL 3: Sales cadence designer ───────────────────────────
    cadence: `You are an elite sales cadence architect. Industry best: 7-13 touches over 3-4 weeks.
Prospect: ${JSON.stringify(prospect || {})}
Context: ${context || ''}

Build a complete multi-channel cadence:

## CADENCE: [Name it based on prospect type]
**Goal:** [Specific outcome — meeting booked, trial started, etc.]
**Length:** [X days, Y touches]

### TOUCH SEQUENCE

**Day 1 — LinkedIn Connection**
Action: Send connection request
Message: [Write the exact request — max 300 chars]

**Day 2 — LinkedIn View Profile**
Action: View profile (they get notified — no message needed)

**Day 3 — Email #1**
Subject: [Write it]
Body: [Write the full email — under 100 words]

**Day 5 — LinkedIn DM**
Message: [Write exact DM — reference connection — under 200 chars]

**Day 8 — Email #2 (different angle)**
Subject: [Write it]
Body: [Write the full email — share insight or resource]

**Day 12 — Phone/Voicemail**
Script: [Write 20-second voicemail script]

**Day 15 — LinkedIn Post Engage**
Action: Comment on their recent post
Comment: [Write a genuine, non-salesy comment]

**Day 18 — Email #3 (case study)**
Subject: [Write it]  
Body: [Write full email — relevant result for their industry]

**Day 21 — Break-up Email**
Subject: [Write it]
Body: [Write the email — permission to close/permission to re-engage]

### CADENCE RULES
- Never send more than 2 emails/week
- Always personalise the first line
- Track opens — if opened 3+ times without reply, call immediately
- If they engage on LinkedIn, pause email, move to social

### SUCCESS METRICS
- Open rate target: >40%
- Reply rate target: >8%
- Meeting rate target: >3%`,

    // ── LEVEL 3: Pipeline analysis + forecast ─────────────────────
    pipeline: `You are a revenue intelligence analyst and sales forecasting expert.
Pipeline data: ${JSON.stringify(contacts || [])}
Context: ${context || ''}

Deliver a complete pipeline analysis:

## PIPELINE HEALTH SCORE: [X/100]

## REVENUE FORECAST
- This month (high confidence): $[X]
- This quarter (medium confidence): $[X]
- Risk-adjusted (conservative): $[X]

## STAGE ANALYSIS
For each stage, identify:
- Velocity (days stuck in stage)
- Conversion rate vs benchmark
- Actions needed to move deals

## TOP 3 DEALS TO CLOSE NOW
[For each: deal name, value, probability, single best action to close]

## PIPELINE GAPS
- Volume gap: Need [X] more deals to hit quota
- Stage gap: Too many deals in [stage] — need to accelerate
- Mix gap: [Deal type] is underrepresented

## RED FLAGS (at-risk deals)
[List deals at risk and why]

## RECOMMENDED ACTIONS
Week 1: [3 specific actions to maximise revenue]
Week 2: [3 specific actions for pipeline building]
Month: [1 strategic change to improve win rate]

## QUOTA ATTAINMENT PROJECTION
On track to hit [X]% of quota by [date]`,

    // ── LEVEL 4: Batch campaign builder ───────────────────────────
    campaign: `You are a demand generation expert running outbound campaigns at scale.
Context: ${context || ''}
Target segment: ${JSON.stringify(prospect || {})}

Build a complete outbound campaign:

## CAMPAIGN BRIEF
**Name:** [Descriptive campaign name]
**Target:** [ICP definition — specific enough to pull 500-1000 contacts]
**Goal:** [X meetings in Y days]
**Budget:** [Messages sent × conversion rates = pipeline]

## ICP TARGETING CRITERIA (for LinkedIn Sales Nav / Apollo)
- Job titles: [List 5-8 exact titles]
- Seniority: [Director+/VP+/C-Suite]
- Company size: [Employee range]
- Industry: [Specific sectors]
- Geography: [Regions]
- Signals: [Hiring for X, raised funding, using competitor]

## EMAIL SEQUENCE (personalised at scale)
Email 1 — Day 0:
Subject: [Personalisable — {{FirstName}}, {{Company}} + hook]
Body: [Template with {{variables}} — 80 words max]

Email 2 — Day 4:
[Follow-up — different value prop]

Email 3 — Day 10:
[Social proof / case study angle]

Email 4 — Day 18:
[Break-up / permission pass]

## LINKEDIN SEQUENCE
Connection message: [Template — 200 chars]
Follow-up DM Day 3: [Template — 300 chars]
InMail (if not connected): [Template]

## PERSONALISATION VARIABLES
[List all {{variables}} and where to source them — Apollo, LinkedIn, company website]

## CAMPAIGN METRICS TO TRACK
- Deliverability rate (target: >95%)
- Open rate (target: >35%)  
- Reply rate (target: >8%)
- Positive reply rate (target: >3%)
- Meeting booked rate (target: >1.5%)
- Pipeline generated: $[X per 1000 contacts]

## A/B TESTS TO RUN
Test 1: [Subject line variation]
Test 2: [CTA variation]
Test 3: [Send time]

## WEEK-BY-WEEK LAUNCH PLAN
Week 1: [Setup, list building, copy finalisation]
Week 2: [Soft launch — 100 contacts]
Week 3: [Full send — 400 contacts]
Week 4: [Optimise and scale]`,

  }

  const prompt = MODES[mode]
  if (!prompt) return res.status(400).json({ error: `Unknown mode: ${mode}. Valid: research, email, pitch, precall, persona, cadence, pipeline, campaign` })

  const start = Date.now()
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: 'You are the SIXXAB AI Sales Intelligence Engine — the world\'s most advanced B2B sales co-pilot. You operate across all 4 levels of Sales AI: outreach & lead gen, sales co-pilot workflow, custom cadences, and full-cycle automation. Every output is specific, actionable and ready to use. Never use filler phrases or generic advice.',
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message || 'API error' })
    const output = d.content?.[0]?.text || ''
    return res.status(200).json({ output, mode, tokens: d.usage?.output_tokens, duration: Date.now() - start })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
