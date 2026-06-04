// pages/api/support.js — SIXXAB AI Website Support Agent
// Handles visitor questions, escalates to human via email
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { messages = [], visitorEmail = "", escalate = false } = req.body ?? {}

  // ── Escalate to human ──────────────────────────────────────────────────────
  if (escalate && visitorEmail) {
    const lastMsg = messages[messages.length - 1]?.content || "No message"
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && resendKey.length > 10) {
      const domain = process.env.RESEND_DOMAIN_VERIFIED === "true"
      const from = domain ? "SIXXAB AI Support <support@startupsinabox.com>" : "SIXXAB AI <onboarding@resend.dev>"
      const notify = process.env.NOTIFY_EMAIL || "sunil.kattikar@gmail.com"
      const convo = messages.map(m=>`${m.role==="user"?"Visitor":"AI"}: ${m.content}`).join("\n\n")
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from, to: [notify],
            subject: `SIXXAB Support Escalation — ${visitorEmail || "Anonymous"}`,
            text: `Support escalation from: ${visitorEmail || "Anonymous"}\n\nConversation:\n${convo}\n\nLast message: ${lastMsg}`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#0A0E1A;padding:14px 20px"><span style="color:#EF9F27;font-family:Georgia;font-size:18px;font-weight:700">SIXXAB AI</span> <span style="color:rgba(245,245,240,.4);font-size:11px">Support Escalation</span></div><div style="padding:20px"><p><strong>Visitor:</strong> ${visitorEmail||"Anonymous"}</p><div style="background:#F8F9FA;border-radius:8px;padding:14px;margin:12px 0;font-size:13px;line-height:1.7;white-space:pre-wrap">${convo}</div></div></div>`
          })
        })
      } catch(e) { console.error("Escalation email failed:", e.message) }
    }
    return res.status(200).json({ escalated: true })
  }

  // ── AI response ────────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: "API not configured" })

  const SYSTEM = `You are the SIXXAB AI support agent on startupsinabox.com — a friendly, knowledgeable assistant helping visitors and customers.

About SIXXAB AI:
- Autonomous Business Platform — "Your business runs itself"
- 6-phase framework: Validate → Launch → Optimise → Scale → Capitalise → Global ($0 to $10M ARR)
- 18 AI specialist agents + 11 CXO advisors (CEO, CMO, CSO, CFO, COO, CTO, CDO, CHRO, CISO, CIO, Corporate Board)
- Pricing: Starter $49.50/mo, Pro $99.50/mo, Agency $175/mo (founding member rates — 50% off, locked forever)
- Tools: Orchestrator, SIXXAB CRM, Niche Selector, CXO Suite, Vertical Packs, Investor Hub, AI Coach
- 10 Vertical Agent Packs for Texas markets: HVAC, Real Estate, Legal, Consulting, Landscaping, Plumbing, Auto Repair, Health, Roofing, IT/MSP
- Founded by Sunil Kattikar, Dallas TX. Email: sunil.kattikar@gmail.com
- Book a call: startupsinabox.com/discovery

How to respond:
1. Answer business and product questions clearly and specifically
2. For pricing questions: give exact founding rates and what each plan includes
3. For technical questions: explain how the feature works and which page to find it
4. For "I need help with X" questions: identify which SIXXAB tool or agent handles X
5. If you cannot answer confidently, offer to connect them with Sunil directly
6. Keep responses concise — 2–4 sentences max unless detail is needed
7. Be warm but professional. Never oversell. Be honest about what the platform does and doesn't do.
8. If the visitor seems ready to buy, direct them to startupsinabox.com/#pricing
9. For complex issues, offer to escalate to a human`

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: SYSTEM,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    })
    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message || "AI error" })
    const reply = d.content?.[0]?.text || "I'm not sure — let me connect you with Sunil directly."
    return res.status(200).json({ reply })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
