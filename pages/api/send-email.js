// pages/api/send-email.js — unified email sender used by CRM and all agents
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { to, subject, body, fromName, replyTo, type = "outreach" } = req.body ?? {}
  if (!to || !subject || !body) return res.status(400).json({ error: "to, subject and body are required" })
  if (!to.includes("@")) return res.status(400).json({ error: "Invalid email address" })

  const key = process.env.RESEND_API_KEY
  if (!key || key.length < 10) {
    console.log(`[Email] Would send to ${to}: "${subject}"`)
    return res.status(200).json({ success: true, simulated: true, message: "Email logged (RESEND_API_KEY not set)" })
  }

  const domainVerified = process.env.RESEND_DOMAIN_VERIFIED === "true"
  const from = domainVerified
    ? `${fromName || "SIXXAB"} <hello@startupsinabox.com>`
    : "SIXXAB <onboarding@resend.dev>"

  const typeColors = { outreach:"#EF9F27", follow_up:"#1D9E75", proposal:"#378ADD", crm:"#7C3AED" }
  const accentColor = typeColors[type] || "#EF9F27"

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:560px;margin:28px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0">
  <div style="background:#0A0E1A;padding:16px 24px;display:flex;align-items:center;gap:10px">
    <div style="font-size:18px;font-weight:800;letter-spacing:2px;color:#F5F5F0">SIX<span style="color:${accentColor};font-style:italic">X</span>AB</div>
    <div style="margin-left:auto;font-size:10px;color:rgba(245,245,240,.4);letter-spacing:.12em;text-transform:uppercase">${type.replace("_"," ")}</div>
  </div>
  <div style="padding:24px;font-size:14px;color:#374151;line-height:1.75;white-space:pre-wrap">${body.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
  <div style="padding:14px 24px;border-top:1px solid #F1F5F9;background:#FAFAFA;font-size:11px;color:#9CA3AF;text-align:center">
    Sent via SIXXAB · startupsinabox.com · Dallas, TX
  </div>
</div></body></html>`

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [to], subject,
        html,
        text: body,
        ...(replyTo && { reply_to: replyTo }),
      }),
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) { console.error("[Email] Resend error:", d); return res.status(500).json({ error: d.message || "Send failed" }) }
    console.log(`[Email] ✓ Sent to ${to} | id: ${d.id}`)
    return res.status(200).json({ success: true, id: d.id })
  } catch (err) {
    console.error("[Email] Network error:", err.message)
    return res.status(500).json({ error: "Network error — " + err.message })
  }
}
