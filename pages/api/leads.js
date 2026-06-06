// pages/api/leads.js — SIXXAB AI Lead Generation engine
// Handles: prospect generation, scoring, outreach sequences, qualification
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { type, params, existingContacts = [] } = req.body ?? {}
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" })

  const existingEmails = existingContacts.map(c => c.email).filter(Boolean).join(", ")

  const PROMPTS = {
    prospect_profile: `You are the SIXXAB Lead Generation Agent.\n\nCreate a detailed Ideal Customer Profile (ICP) for:\nIndustry: ${params.industry}\nLocation: ${params.location||"United States"}\nProduct/service: ${params.product}\nPrice point: ${params.price||"$250–$2,499/mo"}\n\nReturn a structured profile with:\n1. DEMOGRAPHICS — job titles, company size, revenue range, geography\n2. PSYCHOGRAPHICS — goals, fears, frustrations, what they read\n3. BUYING BEHAVIOUR — how they find solutions, decision timeline, budget process\n4. WHERE TO FIND THEM — specific LinkedIn groups, communities, events, hashtags\n5. TRIGGER EVENTS — what happens in their life/business that makes them ready to buy RIGHT NOW\n6. MESSAGE THAT LANDS — the one sentence that makes them stop scrolling\n7. MESSAGE THAT FAILS — what to never say to this person\n\nBe specific. No generalities. Base on real buyer psychology.`,

    prospect_list: `You are the SIXXAB Lead Generation Agent.\n\nGenerate 15 specific prospect types for:\nIndustry: ${params.industry}\nLocation: ${params.location||"Dallas, TX / United States"}\nProduct: ${params.product}\n\nFor each prospect return JSON:\n[\n  {\n    "name": "Realistic full name",\n    "role": "Specific job title",\n    "company": "Realistic company name and type",\n    "location": "City, State/Country",\n    "linkedin": "linkedin.com/in/firstname-lastname",\n    "painPoint": "One specific sentence about their #1 problem",\n    "triggerEvent": "What just happened that makes them ready to buy",\n    "score": 45-95,\n    "stage": "Prospect",\n    "source": "LinkedIn",\n    "tags": ["relevant","tags"]\n  }\n]\n\nReturn only the JSON array. Make the names, companies and roles realistic for the geography and industry. Do not include: ${existingEmails||"none"}.`,

    outreach_sequence: `You are the SIXXAB Lead Generation Agent.\n\nWrite a 7-touchpoint multi-channel outreach sequence for:\nProspect: ${params.prospectName} — ${params.prospectRole} at ${params.company}\nPain point: ${params.painPoint}\nOffer: ${params.offer||"SIXXAB AI — Autonomous Business Platform (from $250/mo)"}\nYour name: Sunil Kattikar, SIXXAB AI\n\nTouchpoints:\nDay 1 — LinkedIn connection request (max 300 chars, no pitch)\nDay 3 — LinkedIn DM after connect (4 sentences, problem-focused)\nDay 7 — Email (subject + body, max 80 words)\nDay 10 — LinkedIn post comment or reshare note\nDay 14 — Email follow-up (reference Day 7, 60 words)\nDay 21 — LinkedIn DM — share a relevant insight\nDay 30 — Final email — breakup + door-left-open\n\nLabel each touchpoint clearly. Write each in full — do not summarise.`,

    qualify_lead: `You are the SIXXAB Lead Generation Agent.\n\nScore and qualify this prospect:\nName: ${params.name}\nRole: ${params.role}\nCompany: ${params.company}\nIndustry: ${params.industry}\nLocation: ${params.location}\nNotes: ${params.notes||"No notes yet"}\nBudget signal: ${params.budget||"Unknown"}\nTimeline signal: ${params.timeline||"Unknown"}\n\nOur ideal customer: Solo founder or SMB owner (1–50 employees), decision maker, $50k+ annual revenue, wants to grow but overwhelmed by operations, English-speaking market.\n\nReturn:\nSCORE: [0-100]\nFIT: [Strong/Moderate/Weak]\nSTRONGEST SIGNAL: [what makes them a good fit]\nWEAKEST SIGNAL: [what might make them not a fit]\nRECOMMENDED ACTION: [specific next step for Sunil]\nBEST CHANNEL: [LinkedIn/Email/Phone/WhatsApp]\nBEST MESSAGE ANGLE: [one sentence opening hook for this specific person]`,

    follow_up: `You are the SIXXAB Lead Generation Agent.\n\nWrite a follow-up message for:\nName: ${params.name}\nLast touchpoint: ${params.lastTouch||"Initial outreach"}\nDays since last contact: ${params.daysSince||7}\nChannel: ${params.channel||"LinkedIn"}\nStage: ${params.stage||"Outreach"}\nNotes: ${params.notes||"No response yet"}\n\nWrite ONE follow-up message. Rules:\n- Reference the last message naturally\n- Add new value (insight, stat, relevant news)\n- No guilt-tripping ("just following up" is banned)\n- Soft CTA — question, not demand\n- Max 4 sentences\n- Platform-appropriate length and tone\n\nWrite only the message.`,

    linkedin_dm: `You are the SIXXAB LinkedIn Direct Message specialist.

Write a personalised LinkedIn DM for:
Prospect: ${params.prospectName} — ${params.prospectRole} at ${params.company}
Industry: ${params.industry||"Business"}
Their pain point: ${params.painPoint||"operational inefficiency"}
Trigger event: ${params.triggerEvent||"recent LinkedIn activity"}
Message goal: ${params.goal||"start a conversation — not pitch"}
Sender: ${params.senderName||"Sunil"} from SIXXAB AI
Tone: ${params.tone||"direct, peer-to-peer, no corporate speak"}

Write 3 variations:

VARIATION A — OBSERVATION (comment on something specific about them)
VARIATION B — INSIGHT (share a relevant insight for their industry)  
VARIATION C — MUTUAL PROBLEM (frame a shared challenge)

Rules for every variation:
- Max 300 characters (LinkedIn DM connection request limit)
- First line must make them stop scrolling — no "Hi [name], I came across your profile"
- No pitch in the first message — ever
- No "I hope this message finds you well"
- End with ONE easy yes/no question
- Write as if from ${params.senderName||"Sunil"} personally

Label each clearly. Write the message only — no explanation.`,

    bulk_outreach: `You are the SIXXAB Lead Generation Agent.

Generate personalised LinkedIn opening messages for these ${params.prospects?.length||5} prospects. Each message must reference something specific to that individual.

Prospects:
${(params.prospects||[]).map((p,i)=>`${i+1}. ${p.name} — ${p.role} at ${p.company}. Pain: ${p.painPoint}. Trigger: ${p.triggerEvent}`).join("\n")}

Product context: SIXXAB AI — Autonomous Business Platform. Helps founders and SMB owners run their business autonomously from $0 to $10M ARR.
Sender: ${params.senderName||"Sunil Kattikar"}, SIXXAB AI

For each prospect write ONE personalised LinkedIn connection request message (max 300 chars).
Format:
[PROSPECT NAME]
[MESSAGE]
---

Make each message feel written just for them. Reference their specific role, company type or pain point.`,

    email_dm: `You are the SIXXAB Lead Generation Agent.

Write a personalised cold email for:
Prospect: ${params.prospectName} — ${params.prospectRole} at ${params.company}
Industry: ${params.industry||"Business"}
Pain point: ${params.painPoint||"operational inefficiency"}
Offer: SIXXAB AI — automates business operations from $250/mo
Sender: ${params.senderName||"Sunil Kattikar"}, SIXXAB AI (sunil.kattikar@gmail.com)

Write the email:
SUBJECT: [under 8 words, specific, not clickbait]
BODY: [4 sentences max — problem recognition, credibility, offer, soft CTA]
PS: [one line that de-risks or adds urgency]

Rules:
- Personalise line 1 to their specific situation
- Never "I hope this email finds you well"
- CTA is a question, not a demand
- PS is optional but effective`,

    objection_handler: `You are the SIXXAB Lead Generation Agent.\n\nHandle this sales objection for SIXXAB AI:\nObjection: "${params.objection}"\nProspect context: ${params.context||"Business owner who engaged with our outreach"}\n\nWrite 3 responses:\n1. ACKNOWLEDGE & REFRAME — validate, then shift perspective\n2. PROOF RESPONSE — use a specific example or metric\n3. QUESTION RESPONSE — answer with a diagnostic question that uncovers the real objection\n\nEach response max 3 sentences. Direct, non-salesy tone.`,
  }

  const prompt = PROMPTS[type]
  if (!prompt) return res.status(400).json({ error: `Unknown lead type: ${type}` })

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000,
        messages: [{ role: "user", content: prompt }] })
    })
    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message || "AI error" })

    let result = d.content?.[0]?.text || ""
    // Try to parse JSON for prospect_list
    if (type === "prospect_list") {
      try {
        const clean = result.replace(/```json|```/g, "").trim()
        result = JSON.parse(clean)
      } catch { /* return as text */ }
    }
    return res.status(200).json({ result, type })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
