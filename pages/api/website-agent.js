// pages/api/website-agent.js — AI website building agent
export const config = { api: { bodyParser: { sizeLimit: "4mb" } } }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { prompt, html: existingHtml } = req.body ?? {}
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set in Vercel environment variables" })
  if (!prompt) return res.status(400).json({ error: "prompt is required" })

  const systemPrompt = `You are an expert web developer. Build complete, production-ready single-file HTML websites.

STRICT OUTPUT FORMAT:
- Output ONLY raw HTML. Start immediately with <!DOCTYPE html>
- End with </html>
- After </html> on a new line add exactly 3 suggestions:
  SUGGEST: First suggestion here
  SUGGEST: Second suggestion here  
  SUGGEST: Third suggestion here
- NEVER use markdown fences (no backticks)
- NEVER add any text before <!DOCTYPE html>
- NEVER add any explanation after the SUGGEST lines

TECHNICAL REQUIREMENTS:
- ALL CSS embedded in <style> tag inside <head>
- Google Fonts loaded via <link> in <head> (2 fonts max)
- No external CSS framework links (no Bootstrap, no Tailwind CDN)
- Mobile responsive with CSS Grid/Flexbox
- Dark background sections must have light text with sufficient contrast
- All images: use CSS gradients or emoji — no <img> tags that will 404
- Test every color combination for readability

REQUIRED SECTIONS (all 8 must be present):
1. Sticky nav: logo text left, 4-5 nav links, CTA button right
2. Hero: full viewport height, gradient background, big headline, subheadline, 2 buttons, 3 stat counters
3. Services: 6 cards in CSS grid (3 col desktop, 2 tablet, 1 mobile), each with emoji icon + title + 2-sentence description
4. Why choose us: 3 columns, specific measurable claims, not generic
5. Testimonials: 3 cards with ★★★★★, quote, name, company
6. Process: 4 numbered steps with connecting line
7. Contact: form (name email phone message submit) + address/phone/email info
8. Footer: logo + tagline, services list, company links, contact info, copyright

EXTRAS:
- WhatsApp float button: <a href="https://wa.me/PHONE" style="position:fixed;bottom:20px;right:20px;...">💬</a>
- Smooth scroll: html { scroll-behavior: smooth }
- Card hover: transform translateY(-6px) with box-shadow transition
- Counter animation via JS for stat numbers

Write REAL content specific to the business — business name, actual services, real-sounding testimonials.`

  const userMessage = existingHtml
    ? `Current website:\n${existingHtml}\n\nChange requested: ${prompt}\n\nReturn the complete updated HTML (raw, starting with <!DOCTYPE html>), then 3 SUGGEST: lines.`
    : `Build a complete professional website for this business: ${prompt}\n\nOutput raw HTML starting with <!DOCTYPE html>, then 3 SUGGEST: lines.`

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
    if (!r.ok) return res.status(500).json({ error: d.error?.message || "Anthropic API error", code: d.error?.type })

    const raw = d.content?.[0]?.text || ""

    // ── Extract HTML (robust, handles all AI output patterns) ──────────────
    let html = null

    // Strip any markdown fences the AI added despite instructions
    let cleaned = raw
      .replace(/^```(?:html)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim()

    // Find DOCTYPE start and last </html>
    const doctypeIdx = cleaned.indexOf("<!DOCTYPE")
    const htmlEndIdx = cleaned.lastIndexOf("</html>")

    if (doctypeIdx !== -1 && htmlEndIdx !== -1 && doctypeIdx < htmlEndIdx) {
      html = cleaned.slice(doctypeIdx, htmlEndIdx + 7)
    } else if (doctypeIdx !== -1) {
      // No closing tag found — use everything from DOCTYPE
      html = cleaned.slice(doctypeIdx)
      // Ensure it closes
      if (!html.includes("</html>")) html += "\n</html>"
    }

    // ── Extract SUGGEST lines ──────────────────────────────────────────────
    const suggestions = raw
      .split("\n")
      .filter(l => /^SUGGEST:/i.test(l.trim()))
      .map(l => l.replace(/^SUGGEST:\s*/i, "").trim())
      .filter(Boolean)
      .slice(0, 3)

    if (suggestions.length < 3) {
      const defaults = [
        "Change the color scheme to dark navy and gold",
        "Add a pricing section with 3 tiers — Starter, Pro, Enterprise",
        "Make the hero headline more compelling and specific",
      ]
      while (suggestions.length < 3) suggestions.push(defaults[suggestions.length])
    }

    const reply = html
      ? (existingHtml
          ? "Done! Your website has been updated. Click the green badge to see the changes."
          : "Your website is built! Click the green badge above to preview it.")
      : `⚠️ HTML extraction failed. The AI responded but we couldn't parse the HTML.\n\nRaw start: ${raw.slice(0, 150)}`

    return res.status(200).json({ html, reply, suggestions, tokens: d.usage?.output_tokens || 0 })

  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
