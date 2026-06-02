// pages/api/niche-validate.js — Dedicated niche validation endpoint

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.startsWith("sk-ant-your")) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" })
  }

  const { industry, location, teamSize, experience, budget, targetCustomer, problem } = req.body ?? {}
  if (!industry || !location) {
    return res.status(400).json({ error: "industry and location are required" })
  }

  const prompt = `You are a senior business analyst specialising in startup market validation. A founder wants to validate this niche:

Industry: ${industry}
Location: ${location}
Team size: ${teamSize || "Solo founder"}
Experience: ${experience || "Not specified"}
Monthly budget: ${budget || "Not specified"}
Target customer: ${targetCustomer || "Not specified"}
Problem they solve: ${problem || "Not specified"}

Analyse this niche with real market data for ${location}. Return ONLY a valid JSON object, no markdown fences, no preamble:

{
  "viabilityScore": <integer 1-100 based on market size, competition, founder fit>,
  "verdict": "<one decisive sentence — pursue it or not>",
  "marketSize": {
    "tam": "<Total Addressable Market with dollar figure>",
    "sam": "<Serviceable Addressable Market — realistic portion>",
    "som": "<Year 1 obtainable — conservative specific number>",
    "localBusinessCount": "<estimated businesses in this niche in ${location}>"
  },
  "pricingBenchmark": {
    "lowEnd": "<lowest price in market>",
    "midMarket": "<typical rate>",
    "premium": "<top of market>",
    "recommended": "<specific price this founder should charge with reasoning>",
    "monthlyRecurring": "<what a retainer/subscription looks like>"
  },
  "competition": {
    "level": "<Low | Medium | High | Very High>",
    "topCompetitors": ["<type 1>", "<type 2>", "<type 3>"],
    "differentiator": "<one specific way to stand out in ${location}>"
  },
  "customerProfile": {
    "primaryBuyer": "<who actually signs the cheque>",
    "painPoints": ["<pain 1>", "<pain 2>", "<pain 3>"],
    "whereToFindThem": "<specific channels in ${location}>"
  },
  "revenueProjection": {
    "month3": "<realistic MRR with focused execution>",
    "month6": "<realistic MRR>",
    "month12": "<realistic MRR>",
    "firstSaleTimeline": "<days to first paying customer if starting today>"
  },
  "topRisks": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "immediateActions": ["<do today>", "<do this week>", "<do this month>"],
  "sixxabFit": "<which SIXXAB agents would help most and why>"
}`

  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const aiData = await aiRes.json()
    if (!aiRes.ok) {
      console.error("[NicheValidator] API error:", aiData)
      return res.status(500).json({ error: aiData.error?.message || "AI API error" })
    }

    const raw = aiData.content?.[0]?.text || ""
    // Strip any markdown fences Claude might add
    const clean = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim()

    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch (parseErr) {
      // Try to extract JSON from the text
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) {
        parsed = JSON.parse(match[0])
      } else {
        console.error("[NicheValidator] Parse failed:", raw.slice(0, 200))
        return res.status(500).json({ error: "Failed to parse AI response", raw: raw.slice(0, 500) })
      }
    }

    return res.status(200).json({ success: true, result: { ...parsed, industry, location } })
  } catch (err) {
    console.error("[NicheValidator] Error:", err.message)
    return res.status(500).json({ error: err.message })
  }
}
