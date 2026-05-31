// pages/api/contact.js — Contact form handler

const TYPE_LABELS = {
  general: "General inquiry",
  partner: "Partnership",
  enterprise: "Enterprise pricing",
  press: "Press & media",
  investor: "Investor inquiry",
  technical: "Technical support",
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { type, name, email, company, message } = req.body ?? {}
  if (!name || !email || !message || !type) {
    return res.status(400).json({ error: "All required fields must be filled." })
  }
  if (!email.includes("@") || !email.includes(".")) {
    return res.status(400).json({ error: "Please enter a valid email address." })
  }
  if (message.length > 1000) {
    return res.status(400).json({ error: "Message must be under 1000 characters." })
  }

  const key = process.env.RESEND_API_KEY
  const notifyTo = process.env.NOTIFY_EMAIL || "sunil.kattikar@gmail.com"
  const domainVerified = process.env.RESEND_DOMAIN_VERIFIED === "true"
  const from = domainVerified
    ? (process.env.RESEND_FROM_EMAIL || "SIXXAB <hello@startupsinabox.com>")
    : "SIXXAB <onboarding@resend.dev>"

  const typeLabel = TYPE_LABELS[type] || type
  const companyText = company || "Not provided"

  console.log(`[SIXXAB Contact] New inquiry: ${typeLabel} from ${name} (${email})`)

  if (!key || key.length < 10) {
    console.error("[SIXXAB Contact] RESEND_API_KEY not configured")
    return res.status(200).json({ success: true, warning: "Email not sent — RESEND_API_KEY missing" })
  }

  const priorityColor = {
    enterprise: "#EF9F27", investor: "#EF9F27", technical: "#EF9F27",
    partner: "#1D9E75", press: "#378ADD", general: "#5F5E5A",
  }[type] || "#5F5E5A"

  const founderHtml = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:540px;margin:32px auto;background:#0A0E1A;border-radius:14px;overflow:hidden">
  <div style="background:${priorityColor};padding:14px 24px;display:flex;align-items:center;justify-content:space-between">
    <div style="font-size:15px;font-weight:800;color:${type==="general"||type==="technical"?"#F5F5F0":"#0A0E1A"}">📬 New contact: ${typeLabel}</div>
  </div>
  <div style="padding:24px">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      ${[["Name",name],["Email",`<a href="mailto:${email}" style="color:#EF9F27">${email}</a>`],["Company",companyText],["Type",typeLabel]].map(([l,v]) => `
        <tr>
          <td style="padding:7px 0;font-size:11px;color:rgba(245,245,240,.4);font-weight:600;text-transform:uppercase;letter-spacing:.06em;width:100px;vertical-align:top">${l}</td>
          <td style="padding:7px 0;font-size:14px;color:#F5F5F0">${v}</td>
        </tr>`).join("")}
    </table>
    <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:16px;margin-bottom:20px">
      <div style="font-size:11px;color:rgba(245,245,240,.4);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Message</div>
      <div style="font-size:14px;color:#F5F5F0;line-height:1.7;white-space:pre-wrap">${message}</div>
    </div>
    <a href="mailto:${email}?subject=Re: Your SIXXAB inquiry" style="display:inline-block;background:#EF9F27;color:#0A0E1A;text-decoration:none;padding:11px 22px;border-radius:8px;font-weight:700;font-size:13px">Reply to ${name.split(" ")[0]} →</a>
  </div>
  <div style="padding:12px 24px;border-top:1px solid rgba(255,255,255,.06);text-align:center">
    <p style="font-size:11px;color:rgba(245,245,240,.2);margin:0">SIXXAB · startupsinabox.com · Contact system</p>
  </div>
</div>
</body>
</html>`

  const userHtml = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:480px;margin:32px auto;background:#0A0E1A;border-radius:14px;overflow:hidden">
  <div style="padding:22px 26px;text-align:center;border-bottom:1px solid rgba(255,255,255,.08)">
    <div style="font-size:26px;font-weight:800;letter-spacing:3px;color:#F5F5F0">SIX<span style="color:#EF9F27">X</span>AB</div>
    <div style="font-size:10px;color:#5F5E5A;letter-spacing:.18em;margin-top:4px">startupsinabox.com</div>
  </div>
  <div style="padding:24px">
    <h2 style="font-size:20px;font-weight:700;color:#F5F5F0;margin:0 0 10px">Got your message, ${name.split(" ")[0]}! ✓</h2>
    <p style="font-size:14px;color:rgba(245,245,240,.65);line-height:1.75;margin:0 0 16px">
      We've received your <strong style="color:#EF9F27">${typeLabel.toLowerCase()}</strong> inquiry. Sunil will reply to <strong style="color:#F5F5F0">${email}</strong> within ${{ enterprise:"the same business day", technical:"4 hours", investor:"the same business day"}[type] || "24 hours"}.
    </p>
    <div style="background:rgba(239,159,39,.1);border:1px solid rgba(239,159,39,.2);border-radius:10px;padding:14px;margin-bottom:20px">
      <div style="font-size:12px;color:rgba(245,245,240,.45);margin-bottom:6px">Your message summary</div>
      <div style="font-size:13px;color:#F5F5F0;line-height:1.6;white-space:pre-wrap">${message.length > 200 ? message.slice(0, 200) + "…" : message}</div>
    </div>
    <p style="font-size:13px;color:rgba(245,245,240,.5);line-height:1.6;margin:0 0 16px">
      While you wait, you're welcome to try the SIXXAB AI coach — it's free to explore.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%"><tr><td align="center">
      <a href="https://www.startupsinabox.com/coach" style="display:inline-block;background:#EF9F27;color:#0A0E1A;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:13px">
        Try the AI coach →
      </a>
    </td></tr></table>
  </div>
  <div style="padding:12px 24px;border-top:1px solid rgba(255,255,255,.06);text-align:center">
    <p style="font-size:11px;color:rgba(245,245,240,.2);margin:0">SIXXAB · Startups In eXponential A Box · Dallas, TX</p>
  </div>
</div>
</body>
</html>`

  try {
    const [r1, r2] = await Promise.all([
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [notifyTo], reply_to: email, subject: `[${typeLabel}] ${name} — SIXXAB contact`, html: founderHtml }),
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [email], reply_to: "hello@startupsinabox.com", subject: `We received your message — SIXXAB`, html: userHtml }),
      }),
    ])
    const [d1, d2] = await Promise.all([r1.json().catch(()=>({})), r2.json().catch(()=>({}))])
    if (r1.ok) console.log(`[SIXXAB Contact] ✓ Founder notified | id: ${d1.id}`)
    else console.error(`[SIXXAB Contact] ✗ Founder notify failed ${r1.status}:`, d1)
    if (r2.ok) console.log(`[SIXXAB Contact] ✓ User confirmation sent | id: ${d2.id}`)
    else console.error(`[SIXXAB Contact] ✗ User confirm failed ${r2.status}:`, d2)
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error("[SIXXAB Contact] Network error:", err.message)
    return res.status(500).json({ error: "Failed to send message. Please email us directly at hello@startupsinabox.com" })
  }
}
