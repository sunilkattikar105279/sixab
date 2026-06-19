// pages/api/website-agent.js
export const config = { api: { bodyParser: { sizeLimit: "4mb" } } }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { prompt, html: existingHtml } = req.body ?? {}
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" })
  if (!prompt) return res.status(400).json({ error: "prompt required" })

  const systemPrompt = `You are an expert web developer. Build complete, beautiful, production-ready single-file HTML websites.

CRITICAL OUTPUT RULES:
1. Start your response with <!DOCTYPE html> — nothing before it
2. End with </html>
3. After </html>, add exactly 3 lines starting with SUGGEST:
4. Never use markdown fences or backticks

CSS RULES — READ CAREFULLY:
- Every section MUST explicitly set both background-color AND color
- NEVER rely on inheritance for text color
- Dark sections: background: #1a1a2e or similar; color: #ffffff !important
- Light sections: background: #ffffff; color: #1a1a2e !important
- ALL p, h1, h2, h3, h4, span, li inside a section must have explicit color
- Use this pattern for every section:
  .section-dark { background: #0f0f23; color: #ffffff; }
  .section-dark h2, .section-dark p, .section-dark li { color: #ffffff; }
  .section-light { background: #ffffff; color: #1a1a2e; }
  .section-light h2, .section-light p { color: #1a1a2e; }
- Cards on dark bg: background: rgba(255,255,255,0.08); color: #ffffff; border: 1px solid rgba(255,255,255,0.15)
- Cards on light bg: background: #ffffff; color: #1a1a2e; box-shadow: 0 4px 20px rgba(0,0,0,0.08)
- NEVER use a dark text color on a dark background section
- Hero section: always use color: #ffffff for all text, buttons must have contrasting colors

REQUIRED SECTIONS (include all 8, in this order):

1. <head>: charset, viewport, title, meta description, Google Fonts link (Outfit + Inter), all CSS in <style>

2. NAV: position:fixed, top:0, z-index:1000, starts transparent then white on scroll via JS
   - Logo: business name, bold, accent color
   - Links: 5 nav links smooth scrolling
   - CTA button: accent color bg, white text, padding 10px 24px, border-radius 6px

3. HERO: min-height:100vh, padding-top:80px (for fixed nav)
   - Bold gradient background (use the business's color theme)
   - EXPLICIT: color: #ffffff on ALL hero text
   - h1: font-size clamp(2.5rem, 6vw, 5rem), font-weight:800
   - Subheadline: font-size:1.2rem, opacity:0.9, color:#ffffff
   - 2 buttons side by side
   - 3 stat numbers with labels below, color:#ffffff

4. SERVICES: white background, color:#1a1a2e
   - Section title: color:#1a1a2e
   - 6 cards in CSS Grid: grid-template-columns: repeat(auto-fit, minmax(280px,1fr))
   - Cards: background:#f8f9fa, color:#1a1a2e, padding:28px, border-radius:12px
   - Emoji icon 2.5rem, h3 color:#1a1a2e, p color:#555

5. WHY US: dark background, ALL text color:#ffffff
   - 3 columns with numbers/stats, h3 and p explicitly color:#ffffff

6. TESTIMONIALS: light gray background (#f8f9fa), color:#1a1a2e
   - 3 cards: background:#ffffff, color:#1a1a2e, p color:#444

7. PROCESS: white background, color:#1a1a2e
   - 4 steps numbered, all text explicitly dark

8. CONTACT: split layout — form left, info right
   - Light background, all labels and text color:#1a1a2e
   - Input fields: border:2px solid #e2e8f0, color:#1a1a2e, background:#ffffff
   - Submit button: accent color background, color:#ffffff

9. FOOTER: dark background
   - ALL footer text: color:#ffffff or color:rgba(255,255,255,0.7)
   - Links: color:rgba(255,255,255,0.7), hover color:#ffffff

JS (at bottom in <script>):
- Nav scroll: window.addEventListener('scroll', () => { nav.style.background = scrollY > 50 ? '#fff' : 'transparent' })
- Counter animation for hero stats
- Smooth scroll for anchor links
- WhatsApp float: <a href="https://wa.me/PHONE" style="position:fixed;bottom:24px;right:24px;width:52px;height:52px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;text-decoration:none;z-index:999;box-shadow:0 4px 12px rgba(37,211,102,.4)">💬</a>

Write REAL content specific to the business — actual services, real testimonials, specific statistics.`

  const userMessage = existingHtml
    ? `Current website HTML:\n${existingHtml}\n\nUser wants: ${prompt}\n\nReturn complete updated HTML (raw, starting with <!DOCTYPE html>), then 3 SUGGEST: lines.`
    : `Build a complete professional website for: ${prompt}\n\nOutput raw HTML starting with <!DOCTYPE html>, then 3 SUGGEST: lines.`

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
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

    // Extract HTML — strip any accidental markdown fences first
    let cleaned = raw.replace(/^```(?:html)?\s*/i, "").replace(/\s*```\s*$/i, "").trim()
    let html = null
    const start = cleaned.indexOf("<!DOCTYPE")
    const end   = cleaned.lastIndexOf("</html>")
    if (start !== -1 && end !== -1) {
      html = cleaned.slice(start, end + 7)
    } else if (start !== -1) {
      html = cleaned.slice(start)
      if (!html.includes("</html>")) html += "\n</html>"
    }

    const suggestions = raw.split("\n")
      .filter(l => /^SUGGEST:/i.test(l.trim()))
      .map(l => l.replace(/^SUGGEST:\s*/i, "").trim())
      .filter(Boolean).slice(0, 3)

    while (suggestions.length < 3) {
      suggestions.push(["Change color scheme to dark and modern","Add pricing section with 3 tiers","Make the hero more impactful"][suggestions.length])
    }

    const reply = html
      ? (existingHtml ? "Done! Website updated." : "Your website is built! Click the green badge to preview it.")
      : `⚠️ Could not extract HTML. Raw start: ${raw.slice(0, 200)}`

    return res.status(200).json({ html, reply, suggestions, tokens: d.usage?.output_tokens || 0 })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
