// pages/api/website-agent.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { prompt, html: existingHtml } = req.body ?? {}
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set in Vercel environment variables" })
  if (!prompt) return res.status(400).json({ error: "prompt is required" })

  const systemPrompt = `You are an expert web developer. You build complete, production-ready single-file HTML websites.

OUTPUT FORMAT — FOLLOW EXACTLY:
1. Output the raw HTML file FIRST — starting with <!DOCTYPE html> and ending with </html>
2. Then on a new line after </html>, write exactly 3 suggestions like this:
   SUGGEST: Change the color scheme to dark and modern
   SUGGEST: Add a pricing section with 3 tiers
   SUGGEST: Make the hero more impactful

DO NOT wrap the HTML in backticks or code blocks. Output raw HTML directly.
DO NOT add any explanation before the HTML.

WEBSITE REQUIREMENTS:
- Embed ALL CSS in a <style> tag in <head> — no external stylesheet links
- Load 2 Google Fonts via CDN
- Sticky navigation with logo, nav links, CTA button
- Full-viewport hero with gradient background, headline, subheadline, 2 buttons, 3 animated stat numbers
- Services grid — 6 cards with emoji icons, titles, 2-sentence descriptions
- Why Us — 3 columns with specific differentiators
- Testimonials — 3 cards with star ratings, quotes, names
- 4-step process section
- Contact section with form (name, email, phone, message, submit)
- Footer with 3 columns
- WhatsApp floating button bottom-right: href="https://wa.me/PHONENUMBER"
- Fully mobile-responsive using CSS Grid/Flexbox
- Hover animations on cards (translateY)
- Smooth scroll
- Write REAL specific content for the business — no Lorem ipsum`

  const userMessage = existingHtml
    ? `Current website HTML:\n${existingHtml}\n\nUser request: ${prompt}\n\nReturn the complete updated HTML file (raw, no backticks), then 3 SUGGEST: lines.`
    : `Build a complete professional website for: ${prompt}\n\nOutput raw HTML directly (no backticks), then 3 SUGGEST: lines.`

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    })

    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message || "Anthropic API error" })

    const raw = d.content?.[0]?.text || ""

    // ── Extract HTML ──────────────────────────────────────────────────────────
    let html = null

    // Try 1: fenced block with or without "html" language tag
    const fenced = raw.match(/```(?:html)?\s*(<!DOCTYPE[\s\S]*?<\/html>)\s*```/i)
    if (fenced) html = fenced[1].trim()

    // Try 2: extract DOCTYPE…/html (non-greedy up to last </html>)
    if (!html) {
      const idx = raw.lastIndexOf("</html>")
      if (idx !== -1) {
        const start = raw.indexOf("<!DOCTYPE")
        if (start !== -1 && start < idx) {
          html = raw.slice(start, idx + 7).trim()
        }
      }
    }

    // Try 3: starts with DOCTYPE after stripping leading whitespace
    if (!html) {
      const stripped = raw.trimStart()
      if (stripped.startsWith("<!DOCTYPE") || stripped.startsWith("<html")) {
        // find end
        const end = stripped.lastIndexOf("</html>")
        html = end !== -1 ? stripped.slice(0, end + 7) : stripped
      }
    }

    // ── Extract SUGGEST lines ──────────────────────────────────────────────
    const suggestions = raw
      .split("\n")
      .filter(l => l.trim().startsWith("SUGGEST:"))
      .map(l => l.replace(/^SUGGEST:\s*/i, "").trim())
      .filter(Boolean)
      .slice(0, 3)

    if (suggestions.length === 0) {
      suggestions.push(
        "Change the color scheme to dark and modern",
        "Add a pricing section with 3 tiers",
        "Make the hero section more impactful"
      )
    }

    // ── Build reply ────────────────────────────────────────────────────────
    let reply
    if (html) {
      reply = existingHtml
        ? "Done! Website updated with your changes."
        : "Your website is built! Click the green badge above to preview it, or use the Deploy button below the preview."
    } else {
      // HTML extraction failed — tell the user and include raw for debugging
      reply = "⚠️ The website was generated but could not be extracted. Raw response preview:\n\n" + raw.slice(0, 300) + "…"
    }

    return res.status(200).json({
      html,
      reply,
      suggestions,
      tokens: d.usage?.output_tokens || 0,
      // Send raw for debugging (truncated)
      debug_raw_start: raw.slice(0, 200),
      debug_raw_end: raw.slice(-200),
    })

  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
