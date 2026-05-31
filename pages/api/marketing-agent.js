// pages/api/marketing-agent.js
// AI Marketing Agent — generates 20 personalised DM scripts for warm contacts
// POST { contacts: [{name, role, platform, context}] }

const AGENT_PROMPT = `You are SIXXAB's outreach specialist. Write personalised, human-sounding DM scripts for warm contacts to offer 50% off founding member access.

Rules:
- Max 4 sentences per message — no walls of text
- Sound like a real person, not a marketer
- Always personalise line 1 with something specific about them
- Mention the specific problem SIXAB solves for THEIR role/situation
- Soft CTA — ask a question, not a hard sell
- Include the 50% off founding member offer naturally
- NEVER use: "game-changer", "revolutionary", "synergy", "leverage"
- Tone: warm, direct, genuine peer-to-peer

Output JSON array: [{ name, platform, message, followUp }]`

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" })

  const { contacts } = req.body ?? {}
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: "contacts array required" })
  }

  // Batch max 20 contacts
  const batch = contacts.slice(0, 20)

  const prompt = `Write personalised DM outreach for these ${batch.length} warm contacts offering them 50% off SIXAB founding membership ($29→$14.50/mo, $49→$24.50/mo, $69→$34.50/mo).

SIXAB is an AI executive coach that helps entrepreneurs launch SaaS products in 48 hours and scale to $10k MRR.

Contacts:
${batch.map((c, i) => `${i+1}. Name: ${c.name} | Role: ${c.role} | Platform: ${c.platform} | Context: ${c.context}`).join("\n")}

Return ONLY a valid JSON array with this exact structure for each contact:
[{
  "name": "string",
  "platform": "string",
  "message": "string (the DM to send)",
  "followUp": "string (follow-up if no reply in 3 days)",
  "bestTime": "string (when to send for best open rate)"
}]

No markdown, no preamble. Just the JSON array.`

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [
          { role: "user", content: prompt }
        ],
        system: AGENT_PROMPT,
      }),
    })

    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      return res.status(500).json({ error: err?.error?.message || `Anthropic error ${r.status}` })
    }

    const data = await r.json()
    const raw = data.content?.filter(b => b.type === "text").map(b => b.text).join("").trim()

    let messages
    try {
      // Strip any accidental markdown fences
      const clean = raw.replace(/```json|```/g, "").trim()
      messages = JSON.parse(clean)
    } catch {
      return res.status(500).json({ error: "Failed to parse AI response", raw })
    }

    return res.status(200).json({ messages, count: messages.length })

  } catch (err) {
    return res.status(502).json({ error: "Network error: " + err.message })
  }
}
