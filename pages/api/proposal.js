// pages/api/proposal.js — SIXXAB AI Proposal Writer engine
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { type, params } = req.body ?? {}
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" })

  const PROMPTS = {
    full_proposal: `You are the SIXXAB AI Proposal Writer — Chief Sales Officer agent.\n\nWrite a complete business proposal for:\n\nClient: ${params.clientName} — ${params.clientRole} at ${params.company}\nIndustry: ${params.industry}\nProblem they have: ${params.problem}\nSolution offering: ${params.solution||"SIXXAB AI — Autonomous Business Platform"}\nInvestment: ${params.price}\nTimeline: ${params.timeline||"30-day onboarding"}\nKey outcomes promised: ${params.outcomes||"First revenue in 48 hours, $10k MRR in 90 days"}\nPrepared by: Sunil Kattikar, SIXXAB AI\n\nStructure the proposal as:\n\n# EXECUTIVE SUMMARY\nTwo sentences on the problem and the proposed solution.\n\n# THE PROBLEM WE'RE SOLVING\nDescribe ${params.clientName}'s specific situation and the cost of inaction (time, money, opportunity).\n\n# OUR APPROACH\nExplain the SIXXAB methodology (validate → launch → optimise → scale) applied to their specific situation.\n\n# WHAT'S INCLUDED\nBullet list of specific deliverables, tools, agents and outcomes. Be concrete — no vague promises.\n\n# INVESTMENT\n${params.price} investment. What they get for this. ROI framing.\n\n# TIMELINE\nWeek-by-week milestones for the first 30 days.\n\n# SUCCESS METRICS\n5 specific, measurable outcomes to be achieved in 90 days.\n\n# NEXT STEPS\n3-step action plan — what Sunil does, what ${params.clientName} does, and by when.\n\n# ABOUT SIXXAB AI\nOne paragraph. Include: startupsinabox.com, Dallas TX, founding member rates.\n\nWrite in second person — address ${params.clientName} directly. Professional but not stiff. No jargon.`,

    executive_summary: `Write a 150-word executive summary for a proposal to:\n${params.clientName} (${params.clientRole}) at ${params.company}\nProblem: ${params.problem}\nSolution: ${params.solution||"SIXXAB AI"}\nPrice: ${params.price}\n\nMake it specific to their situation. End with a clear statement of the expected ROI or outcome.`,

    scope_of_work: `Write a detailed Scope of Work document for:\nClient: ${params.company}\nEngagement: ${params.engagement||"SIXXAB AI platform onboarding and setup"}\nDuration: ${params.duration||"90 days"}\nPrice: ${params.price}\n\nInclude:\n1. SCOPE INCLUDED — specific deliverables\n2. SCOPE EXCLUDED — what is not covered\n3. CLIENT RESPONSIBILITIES — what they must provide\n4. MILESTONES — 4 key checkpoints\n5. ACCEPTANCE CRITERIA — how success is defined\n6. CHANGE CONTROL — how scope changes are handled`,

    objection_rebuttal: `Write a one-page objection rebuttal document for:\nObjection: "${params.objection}"\nClient context: ${params.context}\n\nStructure:\n1. ACKNOWLEDGE — show you heard them\n2. VALIDATE — why this is a fair concern\n3. REFRAME — new perspective on the risk\n4. EVIDENCE — specific proof point\n5. OFFER — de-risk the decision (trial, guarantee, phased start)\n6. CTA — specific next step`,

    follow_up_proposal: `Write a proposal follow-up email for:\nProspect: ${params.name} at ${params.company}\nProposal sent: ${params.sentDate||"last week"}\nNo response received\nProposal value: ${params.price}\n\nRequirements:\n- Subject: Not "following up on my proposal" — something specific\n- Body: 3 sentences max\n- Add one new piece of value (insight, relevant stat)\n- Soft CTA — not "did you get a chance to review"\n- PS: one-line de-risk (money-back guarantee, free session, etc.)\n\nWrite subject and body.`,

    case_study: `Write a client case study for:\nClient: ${params.clientName} (anonymised if needed: ${params.anonymous||"use real name"})\nIndustry: ${params.industry}\nSituation before: ${params.before}\nWhat SIXXAB AI did: ${params.solution||"Ran Orchestrator, set up CRM, launched outreach sequences"}\nResults achieved: ${params.results}\nTimeline: ${params.timeline||"90 days"}\n\nStructure:\nHEADLINE: [Result in numbers]\n\nTHE SITUATION: What was happening before (1 paragraph)\nTHE CHALLENGE: What was blocking them (2–3 bullets)\nTHE APPROACH: What SIXXAB AI implemented (1 paragraph)\nTHE RESULTS: Specific metrics with timeframe\nCLIENT QUOTE: A realistic quote from ${params.clientName}\nKEY TAKEAWAY: One sentence lesson for other founders in this industry`,
  }

  const prompt = PROMPTS[type]
  if (!prompt) return res.status(400).json({ error: `Unknown proposal type: ${type}` })

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 3000,
        messages: [{ role: "user", content: prompt }] })
    })
    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message || "AI error" })
    return res.status(200).json({ content: d.content?.[0]?.text || "", type })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
