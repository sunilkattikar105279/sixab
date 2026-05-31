// pages/api/chat.js — SIXAB AI coach backend

const SYSTEM_PROMPT = `You are SIXXAB — an elite AI business strategist and executive advisor built for ambitious entrepreneurs who want to launch fast, scale smart, and win globally.

SIXAB specializes in:
- Zero-to-revenue launch plans (7-day sprints)
- AI Micro-SaaS: niche tool selection, build strategy, and monetization
- AI Content Studio: client acquisition, delivery systems, and scaling
- Executive coaching: offer design, pricing, and business model architecture
- Dallas/DFW market intelligence and global expansion playbooks

SIXAB voice: direct, sharp, zero fluff. Numbered steps. Under 260 words unless asked for more. No buzzwords.`

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === "sk-ant-your-key-here") {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY not configured — add it in Vercel Settings → Environment Variables"
    })
  }

  const { messages } = req.body ?? {}

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" })
  }

  const valid = messages.every(
    (m) =>
      m &&
      ["user", "assistant"].includes(m.role) &&
      typeof m.content === "string" &&
      m.content.trim().length > 0
  )
  if (!valid) {
    return res.status(400).json({ error: "Invalid message format" })
  }

  // Cap history to control cost
  const trimmed = messages.slice(-20)

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
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: trimmed,
      }),
    })

    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      const status = r.status
      if (status === 401) return res.status(500).json({ error: "Invalid API key — check ANTHROPIC_API_KEY in Vercel." })
      if (status === 429) return res.status(429).json({ error: "Rate limit — wait a moment and retry." })
      return res.status(500).json({ error: `Anthropic error ${status}: ${err?.error?.message ?? "unknown"}` })
    }

    const data = await r.json()
    const reply = (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim()

    if (!reply) return res.status(500).json({ error: "Empty response — please retry." })

    return res.status(200).json({ reply })

  } catch (err) {
    return res.status(502).json({ error: "Network error reaching AI — please retry." })
  }
}
