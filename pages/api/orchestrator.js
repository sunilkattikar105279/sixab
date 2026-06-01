// pages/api/orchestrator.js
// Founder Enterprise Orchestrator — AI goal decomposition endpoint
// Decomposes a founder goal into CXO tasks and returns unified plan

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { goal, phase = 1 } = req.body ?? {}
  if (!goal || goal.length < 10) {
    return res.status(400).json({ error: "Please provide a specific goal (min 10 characters)." })
  }

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured." })

  console.log(`[Orchestrator] New goal: "${goal.slice(0, 80)}" | Phase: ${phase}`)

  const PHASE_CONTEXT = {
    1: "The startup is in Phase 1 (Launch): 0–100 customers, proving product-market fit, first $10k MRR.",
    2: "The startup is in Phase 2 (Scale): 100–1000 customers, automating acquisition, expanding globally.",
    3: "The startup is in Phase 3 (Global): 1000+ customers, autonomous operations, $1M ARR target.",
  }

  const systemPrompt = `You are the SIXXAB Founder Enterprise Orchestrator — a senior AI advisor that coordinates a team of 16 specialist agents and 7 CXO advisors for startup founders.

Context: ${PHASE_CONTEXT[phase] || PHASE_CONTEXT[1]}

Platform: SIXXAB (startupsinabox.com) — AI-powered startup platform. Pricing: Starter $99/mo → $49.50 founding, Pro $199/mo → $99.50 founding, Agency $350/mo → $175 founding.

When a founder sets a goal, you must return a JSON object with this exact structure:
{
  "viability": "One sentence verdict with confidence %",
  "tasks": [
    { "cxo": "CEO", "task": "Task name", "action": "Specific action this week", "priority": 1 },
    { "cxo": "CMO", "task": "Task name", "action": "Specific action", "priority": 2 },
    { "cxo": "CSO", "task": "Task name", "action": "Specific action", "priority": 3 },
    { "cxo": "CFO", "task": "Task name", "action": "Specific action", "priority": 4 },
    { "cxo": "COO", "task": "Task name", "action": "Specific action", "priority": 5 },
    { "cxo": "CTO", "task": "Task name", "action": "Specific action", "priority": 6 },
    { "cxo": "CHRO", "task": "Task name", "action": "Specific action", "priority": 7 }
  ],
  "unifiedPlan": {
    "priority1": "Most important action this week (specific, executable today)",
    "priority2": "Second most important action",
    "priority3": "Third most important action",
    "firstActionToday": "One thing to do in the next 2 hours",
    "milestone30days": "How to know you're on track at 30 days",
    "biggestRisk": "The #1 thing that could derail this goal",
    "mitigation": "How to prevent or handle that risk"
  },
  "metrics": {
    "tasksCount": 16,
    "agentsActive": 16,
    "daysToFirstOutput": 2,
    "confidencePct": 88
  }
}

Return ONLY valid JSON. No markdown, no extra text, no code blocks.`

  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: `Founder goal: "${goal}"` }],
      }),
    })

    const aiData = await aiRes.json()
    if (!aiRes.ok) {
      console.error("[Orchestrator] API error:", aiData)
      return res.status(500).json({ error: "AI orchestrator error." })
    }

    const rawText = aiData.content?.[0]?.text || ""
    let parsed
    try {
      // Strip any markdown if present
      const clean = rawText.replace(/```json\n?|\n?```/g, "").trim()
      parsed = JSON.parse(clean)
    } catch {
      // Return structured fallback
      parsed = buildFallbackPlan(goal)
    }

    console.log(`[Orchestrator] ✓ Plan generated | confidence: ${parsed.metrics?.confidencePct}%`)
    return res.status(200).json({ success: true, plan: parsed, goal })

  } catch (err) {
    console.error("[Orchestrator] Error:", err.message)
    return res.status(200).json({ success: true, plan: buildFallbackPlan(goal), goal })
  }
}

function buildFallbackPlan(goal) {
  return {
    viability: "Goal is achievable with focused daily execution. Confidence: 85%.",
    tasks: [
      { cxo:"CEO",  task:"Goal validation",      action:"Confirm the target metric is specific and time-bound. Set the Week 1 sprint KPIs.", priority:1 },
      { cxo:"CMO",  task:"Channel identification", action:"Pick the single best channel for this goal and post one piece of content today.", priority:2 },
      { cxo:"CSO",  task:"Pipeline creation",     action:"Set up the sales stages and write the first outreach message.", priority:3 },
      { cxo:"CFO",  task:"Unit economics",        action:"Calculate the CAC, LTV and break-even required to hit this goal.", priority:4 },
      { cxo:"COO",  task:"Operations readiness",  action:"Confirm onboarding is ready for new customers before starting outreach.", priority:5 },
      { cxo:"CTO",  task:"Technical validation",  action:"Verify the checkout flow, auth and landing page are all live and working.", priority:6 },
      { cxo:"CHRO", task:"Team assessment",       action:"Determine if a hire is needed to hit this goal or if it can be done solo.", priority:7 },
    ],
    unifiedPlan: {
      priority1: "Send 20 personalised DMs to your exact target market — use the Marketing agent to generate the scripts, then send them all today.",
      priority2: "Publish 3 pieces of content on LinkedIn this week — use the Content agent calendar — focusing on the problem your product solves.",
      priority3: "Run 3 demo calls with interested prospects — use the Sales agent close script and book via your Calendly discovery link.",
      firstActionToday: "Open /agents → Marketing agent → select 10 contacts from your network → generate LinkedIn DM scripts → send all 10 before noon.",
      milestone30days: "5 paying customers, 15 active conversations in the sales pipeline, 20 pieces of content published. Hit 2 of 3 and you're on track.",
      biggestRisk: "Inconsistent daily execution — most founders execute for 2 days then stop when they don't see immediate results.",
      mitigation: "Block 90 minutes every morning for outreach before checking email. Set a daily alarm. Track one metric only: DMs sent.",
    },
    metrics: {
      tasksCount: 24,
      agentsActive: 14,
      daysToFirstOutput: 2,
      confidencePct: 85,
    },
  }
}
