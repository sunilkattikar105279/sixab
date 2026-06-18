// pages/api/website-agent.js
// Agent-based website builder — iterative, conversational, streaming-compatible
// Each message refines the website. The agent maintains context and improves the site.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { messages, currentHtml, businessContext } = req.body ?? {}
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error:"ANTHROPIC_API_KEY not set" })

  const SYSTEM = `You are an expert web developer and designer working as an AI website building agent for SIXXAB AI.

Your job: build and iteratively improve professional business websites based on natural language instructions.

RULES:
1. When building or updating a website, ALWAYS output the complete HTML file — never partial. Start with <!DOCTYPE html> and end with </html>.
2. Every response that produces a website must contain EXACTLY ONE code block with the full HTML, wrapped in \`\`\`html ... \`\`\`
3. If the user asks a question or needs clarification, respond conversationally WITHOUT code
4. When refining an existing site, incorporate ALL existing content and improve/extend it
5. Make every website production-ready: mobile-responsive, real content, modern CSS

WEBSITE QUALITY STANDARDS:
- Embed ALL CSS in a <style> tag — no external CSS files
- Use Google Fonts via CDN (2 fonts max)  
- Write REAL, specific content for the business — no "Lorem ipsum" or placeholders
- Every section must be complete and polished
- Mobile-first responsive design using CSS Grid/Flexbox
- Smooth scroll, hover effects, subtle animations
- WhatsApp/email CTA buttons
- Contact form using Formspree pattern

SECTIONS TO INCLUDE (adapt based on business type):
Nav, Hero (with stats), Services/Products, Why Us, Process (4 steps), Testimonials, FAQ (accordion), CTA banner, Contact, Footer

DESIGN PHILOSOPHY:
- Pick ONE bold design choice and commit to it
- Typography must feel intentional (not default sans-serif everywhere)
- Color palette: 2-3 colors max, used consistently
- White space is your friend
- Make it feel like a $5,000 custom website, not a template

AFTER each website build, respond with:
AGENT_RESPONSE: [one conversational sentence about what you just built/changed]
AGENT_SUGGESTIONS: [3 specific follow-up prompts the user could try, as a JSON array of strings]`

  // Build the message history with current HTML as context
  const apiMessages = []

  if (currentHtml) {
    apiMessages.push({
      role: "user",
      content: `Here is the current website HTML I'm working on:\n\n\`\`\`html\n${currentHtml}\n\`\`\`\n\nPlease keep this as the base and apply my next instruction.`
    })
    apiMessages.push({
      role: "assistant",
      content: "Got it — I have the current website loaded. What would you like to change or add?"
    })
  }

  if (businessContext) {
    apiMessages.push({
      role: "user",
      content: `Business context: ${businessContext}`
    })
    apiMessages.push({
      role: "assistant",
      content: "Business context noted. Ready to build."
    })
  }

  // Add actual conversation
  for (const m of (messages || [])) {
    apiMessages.push({ role: m.role, content: m.content })
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 8000,
        system:     SYSTEM,
        messages:   apiMessages,
      }),
    })

    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message || "API error" })

    const text = d.content?.[0]?.text || ""

    // Extract HTML from code block
    const htmlMatch = text.match(/```html\n([\s\S]*?)```/)
    const html = htmlMatch ? htmlMatch[1].trim() : null

    // Extract agent response and suggestions
    const agentResponseMatch = text.match(/AGENT_RESPONSE:\s*(.+?)(?=\nAGENT_SUGGESTIONS:|$)/s)
    const agentSuggestionsMatch = text.match(/AGENT_SUGGESTIONS:\s*(\[[\s\S]*?\])/s)

    let suggestions = []
    if (agentSuggestionsMatch) {
      try { suggestions = JSON.parse(agentSuggestionsMatch[1]) } catch {}
    }

    // If no HTML, it's a conversational response
    const conversational = !html
    const reply = conversational
      ? text
      : (agentResponseMatch?.[1]?.trim() || "Website updated!")

    return res.status(200).json({
      html,
      reply,
      suggestions,
      conversational,
      tokens: d.usage?.output_tokens || 0,
    })

  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
