// pages/api/website-content.js
// AI generates CONTENT ONLY (JSON) — templates handle all CSS/layout
export const config = { api: { bodyParser: { sizeLimit: "2mb" } } }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { prompt, currentContent, action } = req.body ?? {}
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" })

  const isRefine = !!currentContent

  const systemPrompt = `You are a professional copywriter and business strategist. 
You generate website content as structured JSON.
Output ONLY valid JSON — no markdown, no backticks, no explanation.
All text must be specific, professional, and compelling for the business.
Never use placeholder text like "Lorem ipsum" or "[Your text here]".`

  const schema = `{
  "businessName": "string",
  "tagline": "string — 6 words max, punchy",
  "industry": "string",
  "accentColor": "hex color that fits the brand",
  "heroHeadline": "string — 4-7 words, bold statement",
  "heroSubheadline": "string — one sentence, specific benefit",
  "heroCTA1": "string — primary button text",
  "heroCTA2": "string — secondary button text",
  "heroStats": [
    {"number": "string e.g. 500+", "label": "string e.g. Clients Served"},
    {"number": "string", "label": "string"},
    {"number": "string", "label": "string"}
  ],
  "services": [
    {"icon": "emoji", "title": "string", "description": "string — 2 sentences"},
    {"icon": "emoji", "title": "string", "description": "string — 2 sentences"},
    {"icon": "emoji", "title": "string", "description": "string — 2 sentences"},
    {"icon": "emoji", "title": "string", "description": "string — 2 sentences"},
    {"icon": "emoji", "title": "string", "description": "string — 2 sentences"},
    {"icon": "emoji", "title": "string", "description": "string — 2 sentences"}
  ],
  "whyUs": [
    {"icon": "emoji", "title": "string", "stat": "string e.g. 98%", "description": "string — 1 sentence"},
    {"icon": "emoji", "title": "string", "stat": "string", "description": "string — 1 sentence"},
    {"icon": "emoji", "title": "string", "stat": "string", "description": "string — 1 sentence"}
  ],
  "testimonials": [
    {"quote": "string — 1-2 sentences, specific", "name": "string", "role": "string", "company": "string", "initials": "string 2 chars"},
    {"quote": "string", "name": "string", "role": "string", "company": "string", "initials": "string 2 chars"},
    {"quote": "string", "name": "string", "role": "string", "company": "string", "initials": "string 2 chars"}
  ],
  "process": [
    {"step": "1", "title": "string", "description": "string — 1 sentence"},
    {"step": "2", "title": "string", "description": "string — 1 sentence"},
    {"step": "3", "title": "string", "description": "string — 1 sentence"},
    {"step": "4", "title": "string", "description": "string — 1 sentence"}
  ],
  "navLinks": ["string", "string", "string", "string", "string"],
  "phone": "string",
  "email": "string",
  "address": "string",
  "footerTagline": "string — 1 sentence",
  "suggestions": ["string", "string", "string"]
}`

  const userMessage = isRefine
    ? `Current content: ${JSON.stringify(currentContent)}\n\nUser wants: ${prompt}\n\nReturn updated JSON with the same structure, applying the requested changes.`
    : `Generate complete website content JSON for this business: ${prompt}\n\nReturn JSON matching this exact schema:\n${schema}`

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    })
    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message || "API error" })

    const raw = d.content?.[0]?.text || ""

    // Parse JSON — strip any accidental markdown
    let content
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim()
      content = JSON.parse(cleaned)
    } catch(e) {
      // Try to extract JSON object
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) {
        try { content = JSON.parse(match[0]) }
        catch { return res.status(500).json({ error: "JSON parse failed", raw: raw.slice(0, 300) }) }
      } else {
        return res.status(500).json({ error: "No JSON found", raw: raw.slice(0, 300) })
      }
    }

    return res.status(200).json({ content, tokens: d.usage?.output_tokens || 0 })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
