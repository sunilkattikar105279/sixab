// pages/api/beta.js — SIXXAB email capture
// Sender domain: startupsinabox.com
// Verified via Resend → Domains

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email } = req.body ?? {}

  if (!email || typeof email !== "string" || !email.includes("@") || !email.includes(".")) {
    return res.status(400).json({ error: "Please enter a valid email address." })
  }

  const subscriberEmail = email.trim().toLowerCase()
  console.log(`[SIXXAB] New signup: ${subscriberEmail}`)

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey || resendKey.length < 10) {
    console.error("[SIXXAB] RESEND_API_KEY missing")
    return res.status(200).json({ success: true, email: subscriberEmail })
  }

  // ── Detect whether domain is verified in Resend ─────────────────────────
  // Set RESEND_DOMAIN_VERIFIED=true in Vercel env vars after verifying
  // startupsinabox.com in Resend Dashboard → Domains
  const domainVerified = process.env.RESEND_DOMAIN_VERIFIED === "true"
  const fromAddress = domainVerified
    ? "SIXXAB <hello@startupsinabox.com>"
    : "SIXXAB <onboarding@resend.dev>"

  console.log(`[SIXXAB] Domain verified: ${domainVerified}`)
  console.log(`[SIXXAB] From: ${fromAddress}`)
  console.log(`[SIXXAB] To: ${subscriberEmail}`)
  console.log(`[SIXXAB] Key prefix: ${resendKey.slice(0, 8)}...`)

  const welcomeResult = { ok: false, status: 0, data: {} }
  const notifyResult  = { ok: false, status: 0, data: {} }

  // ── Send welcome email ────────────────────────────────────────────────────
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [subscriberEmail],
        reply_to: "hello@startupsinabox.com",
        subject: "You're in — SIXXAB 50% founding member access 🎉",
        html: welcomeEmail(subscriberEmail),
      }),
    })
    welcomeResult.status = r.status
    welcomeResult.ok = r.ok
    try { welcomeResult.data = await r.json() } catch {}

    if (r.ok) {
      console.log(`[SIXXAB] ✓ Welcome sent. Resend ID: ${welcomeResult.data.id}`)
    } else {
      console.error(`[SIXXAB] ✗ Welcome FAILED. Status: ${r.status}`)
      console.error(`[SIXXAB] Resend error:`, JSON.stringify(welcomeResult.data))
    }
  } catch (err) {
    welcomeResult.data = { networkError: err.message }
    console.error("[SIXXAB] ✗ Welcome network error:", err.message)
  }

  // ── Send founder notification ─────────────────────────────────────────────
  const notifyTo = process.env.NOTIFY_EMAIL
  if (notifyTo) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [notifyTo],
          subject: `🔔 New SIXXAB signup: ${subscriberEmail}`,
          html: notifyEmail(subscriberEmail),
        }),
      })
      notifyResult.status = r.status
      notifyResult.ok = r.ok
      try { notifyResult.data = await r.json() } catch {}

      if (r.ok) {
        console.log(`[SIXXAB] ✓ Notify sent to founder`)
      } else {
        console.error(`[SIXXAB] ✗ Notify FAILED. Status: ${r.status}`)
        console.error(`[SIXXAB] Notify error:`, JSON.stringify(notifyResult.data))
      }
    } catch (err) {
      notifyResult.data = { networkError: err.message }
      console.error("[SIXXAB] ✗ Notify network error:", err.message)
    }
  }

  // Return full debug info — remove debugInfo from response once working
  return res.status(200).json({
    success: true,
    email: subscriberEmail,
    debugInfo: {
      domainVerified,
      fromAddress,
      welcome: {
        ok: welcomeResult.ok,
        status: welcomeResult.status,
        resendError: welcomeResult.ok ? null : (welcomeResult.data?.message || welcomeResult.data?.error || JSON.stringify(welcomeResult.data)),
        emailId: welcomeResult.ok ? welcomeResult.data?.id : null,
      },
      notify: notifyTo ? {
        ok: notifyResult.ok,
        status: notifyResult.status,
        resendError: notifyResult.ok ? null : (notifyResult.data?.message || notifyResult.data?.error || JSON.stringify(notifyResult.data)),
      } : "NOTIFY_EMAIL not set",
    }
  })
}

// ── Welcome email template ──────────────────────────────────────────────────
function welcomeEmail(email) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SIXXAB</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  
  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F7F8FA;padding:40px 0;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="background-color:#0A0E1A;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding:28px 36px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
              <div style="font-size:32px;font-weight:800;letter-spacing:4px;color:#F5F5F0;font-family:Georgia,serif;">
                SIX<span style="color:#EF9F27;">X</span>AB
              </div>
              <div style="font-size:11px;color:#5F5E5A;letter-spacing:0.2em;margin-top:6px;font-family:monospace;">
                startupsinabox.com
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px;">
              
              <h1 style="font-size:26px;font-weight:700;color:#F5F5F0;margin:0 0 12px 0;line-height:1.2;">
                You're in the box. 🎉
              </h1>
              
              <p style="font-size:15px;color:rgba(245,245,240,0.65);line-height:1.75;margin:0 0 28px 0;">
                You've secured <strong style="color:#EF9F27;">SIXXAB founding member pricing — 50% off forever.</strong> 
                This rate locks the moment you subscribe and never changes, no matter how much our price increases for new members.
              </p>

              <!-- Pricing table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(239,159,39,0.08);border:1px solid rgba(239,159,39,0.25);border-radius:12px;margin:0 0 28px 0;">
                <tr>
                  <td width="33%" style="padding:18px 12px;text-align:center;border-right:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:11px;color:rgba(245,245,240,0.4);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Starter</div>
                    <div style="font-size:28px;font-weight:700;color:#F5F5F0;line-height:1;">$14.50</div>
                    <div style="font-size:11px;color:rgba(245,245,240,0.35);margin-top:4px;">per month</div>
                    <div style="font-size:10px;color:rgba(245,245,240,0.25);text-decoration:line-through;margin-top:2px;">was $29</div>
                  </td>
                  <td width="34%" style="padding:18px 12px;text-align:center;border-right:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:11px;color:#EF9F27;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;font-weight:600;">⭐ Pro</div>
                    <div style="font-size:28px;font-weight:700;color:#EF9F27;line-height:1;">$24.50</div>
                    <div style="font-size:11px;color:rgba(245,245,240,0.35);margin-top:4px;">per month</div>
                    <div style="font-size:10px;color:rgba(245,245,240,0.25);text-decoration:line-through;margin-top:2px;">was $49</div>
                  </td>
                  <td width="33%" style="padding:18px 12px;text-align:center;">
                    <div style="font-size:11px;color:rgba(245,245,240,0.4);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Agency</div>
                    <div style="font-size:28px;font-weight:700;color:#F5F5F0;line-height:1;">$34.50</div>
                    <div style="font-size:11px;color:rgba(245,245,240,0.35);margin-top:4px;">per month</div>
                    <div style="font-size:10px;color:rgba(245,245,240,0.25);text-decoration:line-through;margin-top:2px;">was $69</div>
                  </td>
                </tr>
              </table>

              <!-- What you get -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px 0;">
                <tr>
                  <td style="padding:0 0 10px 0;">
                    <div style="font-size:12px;font-weight:600;color:rgba(245,245,240,0.5);text-transform:uppercase;letter-spacing:0.08em;">What's in your box</div>
                  </td>
                </tr>
                ${[
                  "AI strategy sessions — unlimited",
                  "7-day launch sprint planner",
                  "Niche selection framework",
                  "Marketing & sales playbooks",
                  "Revenue optimizer tool",
                  "Priority support & coaching calls",
                ].map(item => `
                <tr>
                  <td style="padding:6px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:20px;vertical-align:top;padding-top:1px;">
                          <div style="width:16px;height:16px;background:rgba(239,159,39,0.15);border-radius:50%;text-align:center;line-height:16px;font-size:9px;color:#EF9F27;">✓</div>
                        </td>
                        <td style="padding-left:8px;font-size:13.5px;color:rgba(245,245,240,0.75);line-height:1.5;">${item}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join("")}
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="https://www.startupsinabox.com"
                       style="display:inline-block;background:#EF9F27;color:#0A0E1A;text-decoration:none;padding:16px 40px;border-radius:10px;font-weight:700;font-size:16px;letter-spacing:0.02em;">
                      Pick your plan now →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:rgba(245,245,240,0.3);line-height:1.6;margin:0;text-align:center;">
                No credit card required to sign up. Cancel anytime.<br>
                Your 50% off founding rate applies automatically at checkout.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 36px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="font-size:11px;color:rgba(245,245,240,0.2);margin:0;line-height:1.6;">
                SIXXAB · Startups In eXponential A Box<br>
                Dallas, TX · <a href="https://startupsinabox.com" style="color:rgba(245,245,240,0.2);text-decoration:none;">startupsinabox.com</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- End card -->

      </td>
    </tr>
  </table>

</body>
</html>`
}

// ── Founder notification email ──────────────────────────────────────────────
function notifyEmail(subscriberEmail) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:440px;margin:0 auto;background:#0A0E1A;border-radius:12px;overflow:hidden;">
    <div style="background:#EF9F27;padding:16px 24px;">
      <div style="font-size:16px;font-weight:800;color:#0A0E1A;letter-spacing:2px;">SIXXAB · New Signup</div>
    </div>
    <div style="padding:24px;">
      <p style="font-size:14px;color:#F5F5F0;margin:0 0 16px;">🎉 New founding member signed up</p>
      <div style="background:rgba(239,159,39,0.1);border:1px solid rgba(239,159,39,0.3);border-radius:8px;padding:14px 18px;margin-bottom:20px;">
        <div style="font-size:11px;color:#EF9F27;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Email</div>
        <div style="font-size:18px;font-weight:600;color:#F5F5F0;">${subscriberEmail}</div>
      </div>
      <p style="font-size:12px;color:rgba(245,245,240,0.4);margin:0;">Welcome email sent automatically to this address.</p>
    </div>
  </div>
</body>
</html>`
}
