// pages/api/discovery-alert.js
// Sends email alert to Sunil when someone books a discovery call or shows interest

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { name, email, company, goal, stage, eventUri, inviteeUri } = req.body ?? {}

  if (!name || !email) return res.status(400).json({ error: "Name and email required" })

  const key = process.env.RESEND_API_KEY
  const notifyTo = process.env.NOTIFY_EMAIL || "sunil.kattikar@gmail.com"
  const domainVerified = process.env.RESEND_DOMAIN_VERIFIED === "true"
  const from = domainVerified
    ? (process.env.RESEND_FROM_EMAIL || "SIXXAB <hello@startupsinabox.com>")
    : "SIXXAB <onboarding@resend.dev>"

  const isBooked = stage !== "interested" // fully booked vs just expressed interest

  console.log(`[SIXXAB Discovery] ${isBooked ? "BOOKED" : "Interested"}: ${name} (${email}) | Goal: ${goal}`)

  if (!key || key.length < 10) {
    console.error("[SIXXAB Discovery] RESEND_API_KEY not configured")
    return res.status(200).json({ success: true, warning: "Email not sent — RESEND_API_KEY missing" })
  }

  const goalLabels = {
    validate: "Validate idea before building",
    launch: "Launch first product this week",
    revenue: "Get first paying customer",
    scale: "Scale to $10k MRR",
    freelance: "Turn freelance into a product",
    saas: "Build and launch a SaaS",
    partner: "Explore SIXXAB partnership",
    invest: "Investment opportunities",
    other: "Something else",
  }
  const goalText = goalLabels[goal] || goal || "Not specified"
  const companyText = company || "Not provided"

  // ── 1. Alert email to Sunil ───────────────────────────────────────────────
  const founderSubject = isBooked
    ? `📅 Discovery call BOOKED — ${name} (${email})`
    : `👀 New discovery call interest — ${name} (${email})`

  const founderHtml = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:520px;margin:32px auto;background:#0A0E1A;border-radius:14px;overflow:hidden">
  <div style="background:${isBooked ? "#1D9E75" : "#EF9F27"};padding:16px 24px">
    <div style="font-size:16px;font-weight:800;color:${isBooked ? "#fff" : "#0A0E1A"};letter-spacing:1px">
      ${isBooked ? "📅 New discovery call BOOKED" : "👀 New discovery call interest"}
    </div>
  </div>
  <div style="padding:24px">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${[
        ["Name", name],
        ["Email", `<a href="mailto:${email}" style="color:#EF9F27">${email}</a>`],
        ["Company", companyText],
        ["Goal", goalText],
        ["Status", isBooked ? "✅ BOOKED — check your Google Calendar" : "📋 Expressed interest — no time booked yet"],
      ].map(([label, value]) => `
        <tr>
          <td style="padding:8px 0;font-size:12px;color:rgba(245,245,240,.5);font-weight:600;text-transform:uppercase;letter-spacing:.06em;width:120px;vertical-align:top">${label}</td>
          <td style="padding:8px 0;font-size:14px;color:#F5F5F0">${value}</td>
        </tr>
      `).join("")}
    </table>
    ${isBooked ? `
    <div style="margin-top:20px;padding:14px 16px;background:rgba(29,158,117,.1);border:1px solid rgba(29,158,117,.3);border-radius:10px">
      <div style="font-size:13px;color:#1D9E75;font-weight:600;margin-bottom:6px">✅ Calendly booking confirmed</div>
      <div style="font-size:12px;color:rgba(245,245,240,.55)">The calendar invite has been sent to both ${email} and sunil.kattikar@gmail.com automatically by Calendly.</div>
    </div>` : `
    <div style="margin-top:20px;padding:14px 16px;background:rgba(239,159,39,.1);border:1px solid rgba(239,159,39,.3);border-radius:10px">
      <div style="font-size:13px;color:#EF9F27;font-weight:600;margin-bottom:6px">⏳ They haven't picked a time yet</div>
      <div style="font-size:12px;color:rgba(245,245,240,.55)">They submitted their details and are now on the Calendly page. If they don't book, follow up at ${email} within 24 hours.</div>
    </div>`}
    <div style="margin-top:16px;text-align:center">
      <a href="https://calendly.com" style="display:inline-block;background:#EF9F27;color:#0A0E1A;text-decoration:none;padding:11px 24px;border-radius:8px;font-weight:700;font-size:13px">
        View Calendly dashboard →
      </a>
    </div>
  </div>
  <div style="padding:12px 24px;border-top:1px solid rgba(255,255,255,.06);text-align:center">
    <p style="font-size:11px;color:rgba(245,245,240,.2);margin:0">SIXXAB · startupsinabox.com · Alert system</p>
  </div>
</div>
</body>
</html>`

  // ── 2. Confirmation email to the person who booked ────────────────────────
  const userSubject = isBooked
    ? "Your SIXXAB discovery call is confirmed! 📅"
    : "We received your details — pick a time for your call"

  const userHtml = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:520px;margin:32px auto;background:#0A0E1A;border-radius:14px;overflow:hidden">
  <div style="padding:24px 28px;text-align:center;border-bottom:1px solid rgba(255,255,255,.08)">
    <div style="font-size:28px;font-weight:800;letter-spacing:3px;color:#F5F5F0">SIX<span style="color:#EF9F27">X</span>AB</div>
    <div style="font-size:10px;color:#5F5E5A;letter-spacing:.18em;margin-top:4px">startupsinabox.com</div>
  </div>
  <div style="padding:28px">
    <h2 style="font-size:22px;font-weight:700;color:#F5F5F0;margin:0 0 12px">
      ${isBooked ? "You're booked, " + name.split(" ")[0] + "! 🎉" : "We received your details, " + name.split(" ")[0] + "!"}
    </h2>
    <p style="font-size:14px;color:rgba(245,245,240,.65);line-height:1.75;margin:0 0 20px">
      ${isBooked
        ? `Your 20-minute discovery call with Sunil Kattikar is confirmed. A calendar invite has been sent to <strong style="color:#F5F5F0">${email}</strong>. Sunil will come prepared with ideas specific to your goal: <strong style="color:#EF9F27">${goalText}</strong>.`
        : `Your details are saved. Sunil will see your goal — <strong style="color:#EF9F27">${goalText}</strong> — and come prepared. If you haven't picked a time yet, visit the link below to complete your booking.`
      }
    </p>
    ${isBooked ? `
    <div style="background:rgba(29,158,117,.1);border:1px solid rgba(29,158,117,.25);border-radius:10px;padding:16px;margin:0 0 20px">
      <div style="font-size:12px;font-weight:600;color:#1D9E75;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">What to expect</div>
      ${["Check your email for the calendar invite","Add to Google / Apple Calendar","Get a reminder 24h and 1h before","Join via the video link in the invite","No prep needed — just show up!"].map(t => `<div style="font-size:13px;color:rgba(245,245,240,.7);margin-bottom:6px;display:flex;gap:8px"><span style="color:#1D9E75;font-weight:600">✓</span>${t}</div>`).join("")}
    </div>` : ""}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
      <tr><td align="center">
        <a href="${isBooked ? "https://www.startupsinabox.com/coach" : "https://www.startupsinabox.com/discovery"}"
           style="display:inline-block;background:#EF9F27;color:#0A0E1A;text-decoration:none;padding:13px 28px;border-radius:9px;font-weight:700;font-size:14px">
          ${isBooked ? "Try the AI coach while you wait →" : "Complete your booking →"}
        </a>
      </td></tr>
    </table>
    <p style="font-size:12px;color:rgba(245,245,240,.35);text-align:center;line-height:1.6">
      Questions? Reply to this email or message Sunil directly.<br>
      SIXXAB · Startups In eXponential A Box · Dallas, TX
    </p>
  </div>
</div>
</body>
</html>`

  try {
    // Send to Sunil
    const r1 = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [notifyTo], subject: founderSubject, html: founderHtml }),
    })
    const d1 = await r1.json().catch(() => ({}))
    if (r1.ok) console.log(`[SIXXAB Discovery] ✓ Founder alert sent | id: ${d1.id}`)
    else console.error(`[SIXXAB Discovery] ✗ Founder alert failed ${r1.status}:`, JSON.stringify(d1))

    // Send confirmation to user
    const r2 = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], reply_to: "sunil.kattikar@gmail.com", subject: userSubject, html: userHtml }),
    })
    const d2 = await r2.json().catch(() => ({}))
    if (r2.ok) console.log(`[SIXXAB Discovery] ✓ User confirmation sent | id: ${d2.id}`)
    else console.error(`[SIXXAB Discovery] ✗ User confirmation failed ${r2.status}:`, JSON.stringify(d2))

    return res.status(200).json({ success: true, founderEmailSent: r1.ok, userEmailSent: r2.ok })
  } catch (err) {
    console.error("[SIXXAB Discovery] Network error:", err.message)
    return res.status(200).json({ success: true, warning: err.message })
  }
}
