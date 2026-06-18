// pages/api/website-agent.js
// Simple, reliable website building agent
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { prompt, html: existingHtml } = req.body ?? {}
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set in Vercel environment variables" })
  if (!prompt) return res.status(400).json({ error: "prompt is required" })

  const isRefine = !!existingHtml

  const systemPrompt = `You are an expert web developer. You build complete, production-ready HTML websites.

CRITICAL RULES:
- Always output the COMPLETE HTML file from <!DOCTYPE html> to </html>
- Embed ALL CSS inside a <style> tag — no external CSS files
- Use Google Fonts via CDN link in <head>
- Write REAL content — never use Lorem ipsum or placeholder text
- Make it fully mobile-responsive
- Include smooth animations and hover effects
- After the HTML, write exactly 3 follow-up suggestions on separate lines starting with "SUGGEST:"

QUALITY BAR: Every website must include:
1. Sticky navigation with smooth scroll
2. Hero section with headline, subheadline, and 2 CTA buttons
3. Services/features section (6 items in grid)
4. Social proof (testimonials or stats)
5. Contact section with form
6. Footer
7. WhatsApp floating button
8. Mobile-responsive at 768px breakpoint`

  const userMessage = isRefine
    ? `Here is the current website:\n\n${existingHtml}\n\nUser request: ${prompt}\n\nApply this change and return the complete updated HTML file.`
    : `Build a complete professional website: ${prompt}`

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

    const text = d.content?.[0]?.text || ""

    // Extract HTML — multiple strategies
    let html = null

    // Strategy 1: fenced code block
    const fenced = text.match(/```html\s*([\s\S]*?)```/i)
    if (fenced) html = fenced[1].trim()

    // Strategy 2: bare DOCTYPE
    if (!html) {
      const bare = text.match(/(<!DOCTYPE html>[\s\S]*<\/html>)/i)
      if (bare) html = bare[1].trim()
    }

    // Strategy 3: everything if it starts with DOCTYPE
    if (!html && text.trim().startsWith("<!DOCTYPE")) {
      html = text.trim()
    }

    // Extract suggestions
    const suggestions = []
    const lines = text.split("\n")
    for (const line of lines) {
      if (line.startsWith("SUGGEST:")) {
        suggestions.push(line.replace("SUGGEST:", "").trim())
      }
    }

    // Fallback suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        "Change the color scheme to dark and modern",
        "Add a pricing section with 3 tiers",
        "Make the hero section more impactful"
      )
    }

    const reply = isRefine
      ? "Done! I've updated the website with your changes."
      : `Your website is ready! I've built a complete professional site with navigation, hero, services, testimonials, contact form and footer.`

    return res.status(200).json({ html, reply, suggestions, tokens: d.usage?.output_tokens || 0 })

  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
