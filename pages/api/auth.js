// pages/api/auth.js — SIXXAB auth: login / signup / forgot / reset / oauth-verify

const RESET_TOKENS = new Map() // token -> { email, expires }

function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h }
  return Math.abs(h).toString(36)
}

const USERS = new Map()
USERS.set("sunil.kattikar@gmail.com", {
  id: "usr_admin", name: "Sunil Kattikar",
  email: "sunil.kattikar@gmail.com", phone: null,
  passwordHash: simpleHash("sixxab2025!"), plan: "agency",
  createdAt: new Date().toISOString(),
})

async function sendEmail(key, { from, to, subject, html }) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) console.error(`[SIXXAB Email] ${r.status}:`, JSON.stringify(d))
  else console.log(`[SIXXAB Email] ✓ sent to ${to} | id: ${d.id}`)
  return { ok: r.ok, status: r.status, data: d }
}

function fromAddress(verified) {
  return verified === "true"
    ? (process.env.RESEND_FROM_EMAIL || "SIXXAB <hello@startupsinabox.com>")
    : "SIXXAB <onboarding@resend.dev>"
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { mode, identifier, password, name, plan, token, newPassword, oauthUser } = req.body ?? {}
  if (!mode) return res.status(400).json({ error: "Mode required" })

  const key = process.env.RESEND_API_KEY || ""
  const verified = process.env.RESEND_DOMAIN_VERIFIED || "false"
  const id = (identifier || "").trim().toLowerCase()
  const isPhone = /^[\d\s\+\-\(\)]{7,}$/.test(id)

  // ── OAUTH (Google / Apple) ──────────────────────────────────────────────
  if (mode === "oauth") {
    if (!oauthUser?.email) return res.status(400).json({ error: "OAuth user data missing" })
    const oauthId = oauthUser.email.toLowerCase()
    let user = USERS.get(oauthId)
    if (!user) {
      user = {
        id: "usr_oauth_" + Date.now(), name: oauthUser.name || oauthId.split("@")[0],
        email: oauthId, phone: null, passwordHash: null,
        plan: plan || "free", provider: oauthUser.provider || "google",
        createdAt: new Date().toISOString(),
      }
      USERS.set(oauthId, user)
      console.log(`[SIXXAB Auth] OAuth signup: ${oauthId} via ${user.provider}`)
      if (key) {
        await sendEmail(key, {
          from: fromAddress(verified), to: oauthId,
          subject: "Welcome to SIXXAB!",
          html: welcomeHtml(user.name),
        })
      }
    }
    const tok = `tok_${user.id}_${Date.now()}`
    return res.status(200).json({ success: true, token: tok, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } })
  }

  if (!id) return res.status(400).json({ error: "Email or mobile required" })

  // ── SIGNUP ──────────────────────────────────────────────────────────────
  if (mode === "signup") {
    if (!name || !password) return res.status(400).json({ error: "Name and password required" })
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" })
    if (USERS.has(id)) return res.status(409).json({ error: "Account already exists with this email/mobile. Please sign in." })
    const uid = "usr_" + Date.now()
    const user = { id: uid, name: name.trim(), email: isPhone ? null : id, phone: isPhone ? id : null, passwordHash: simpleHash(password), plan: plan || "free", createdAt: new Date().toISOString() }
    USERS.set(id, user)
    console.log(`[SIXXAB Auth] Signup: ${id}`)
    if (key && !isPhone) {
      await sendEmail(key, { from: fromAddress(verified), to: id, subject: "Welcome to SIXXAB!", html: welcomeHtml(name) })
    }
    if (key && process.env.NOTIFY_EMAIL) {
      await sendEmail(key, { from: fromAddress(verified), to: process.env.NOTIFY_EMAIL, subject: `New SIXXAB signup: ${id}`, html: `<p>New user: <strong>${name}</strong> (${id}) · Plan: ${plan || "free"}</p>` })
    }
    const tok = `tok_${uid}_${Date.now()}`
    return res.status(201).json({ success: true, token: tok, user: { id: uid, name: user.name, email: user.email, plan: user.plan } })
  }

  // ── LOGIN ───────────────────────────────────────────────────────────────
  if (mode === "login") {
    const user = USERS.get(id)
    if (!user) return res.status(401).json({ error: "No account found. Please create an account first." })
    if (user.passwordHash && user.passwordHash !== simpleHash(password)) {
      return res.status(401).json({ error: "Incorrect password. Try again or reset your password." })
    }
    const tok = `tok_${user.id}_${Date.now()}`
    return res.status(200).json({ success: true, token: tok, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } })
  }

  // ── FORGOT PASSWORD ─────────────────────────────────────────────────────
  if (mode === "forgot") {
    console.log(`[SIXXAB Auth] Password reset for: ${id}`)
    if (!key || key.length < 10) {
      console.error("[SIXXAB Auth] RESEND_API_KEY not configured — cannot send reset email")
      return res.status(200).json({ success: true, _debug: "RESEND_API_KEY missing" })
    }
    const user = USERS.get(id)
    if (!user || isPhone) {
      // Silent success — don't reveal if account exists
      return res.status(200).json({ success: true })
    }
    const resetToken = simpleHash(id + Date.now() + Math.random())
    const expires = Date.now() + 60 * 60 * 1000 // 1 hour
    RESET_TOKENS.set(resetToken, { email: id, expires })
    const resetLink = `https://www.startupsinabox.com/login?reset=${resetToken}&email=${encodeURIComponent(id)}`
    console.log(`[SIXXAB Auth] Reset link: ${resetLink}`)
    const result = await sendEmail(key, {
      from: fromAddress(verified),
      to: id,
      subject: "Reset your SIXXAB password",
      html: resetHtml(user.name, resetLink),
    })
    return res.status(200).json({ success: true, _debug: result.ok ? "sent" : `failed: ${result.data?.message}` })
  }

  // ── RESET PASSWORD ──────────────────────────────────────────────────────
  if (mode === "reset") {
    const stored = RESET_TOKENS.get(token)
    if (!stored) return res.status(400).json({ error: "Invalid or expired reset link. Please request a new one." })
    if (Date.now() > stored.expires) { RESET_TOKENS.delete(token); return res.status(400).json({ error: "Reset link expired. Please request a new one." }) }
    if (stored.email !== id) return res.status(400).json({ error: "Reset link mismatch." })
    if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." })
    const user = USERS.get(id)
    if (!user) return res.status(404).json({ error: "Account not found." })
    user.passwordHash = simpleHash(newPassword)
    USERS.set(id, user)
    RESET_TOKENS.delete(token)
    console.log(`[SIXXAB Auth] Password reset complete: ${id}`)
    return res.status(200).json({ success: true })
  }

  return res.status(400).json({ error: "Invalid mode" })
}

function welcomeHtml(name) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F8FA;font-family:sans-serif">
<div style="max-width:480px;margin:32px auto;background:#0A0E1A;border-radius:14px;overflow:hidden">
  <div style="padding:24px 28px;text-align:center;border-bottom:1px solid rgba(255,255,255,.08)">
    <div style="font-size:28px;font-weight:800;letter-spacing:3px;color:#F5F5F0">SIX<span style="color:#EF9F27">X</span>AB</div>
    <div style="font-size:10px;color:#5F5E5A;letter-spacing:.18em;margin-top:4px">startupsinabox.com</div>
  </div>
  <div style="padding:28px">
    <h2 style="font-size:20px;font-weight:700;color:#F5F5F0;margin:0 0 10px">Welcome, ${name}! 🎉</h2>
    <p style="font-size:14px;color:rgba(245,245,240,.65);line-height:1.7;margin:0 0 20px">Your SIXXAB account is ready. You now have access to the AI coach, all agents, and your founding member pricing.</p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;width:100%"><tr><td align="center">
      <a href="https://www.startupsinabox.com/coach" style="display:inline-block;background:#EF9F27;color:#0A0E1A;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px">Open your AI coach →</a>
    </td></tr></table>
    <p style="font-size:12px;color:rgba(245,245,240,.35);text-align:center">SIXXAB · Startups In eXponential A Box · Dallas, TX</p>
  </div>
</div></body></html>`
}

function resetHtml(name, link) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F8FA;font-family:sans-serif">
<div style="max-width:480px;margin:32px auto;background:#0A0E1A;border-radius:14px;overflow:hidden">
  <div style="padding:24px 28px;text-align:center;border-bottom:1px solid rgba(255,255,255,.08)">
    <div style="font-size:28px;font-weight:800;letter-spacing:3px;color:#F5F5F0">SIX<span style="color:#EF9F27">X</span>AB</div>
  </div>
  <div style="padding:28px">
    <h2 style="font-size:20px;font-weight:700;color:#F5F5F0;margin:0 0 10px">Reset your password</h2>
    <p style="font-size:14px;color:rgba(245,245,240,.65);line-height:1.7;margin:0 0 20px">Hi ${name || "there"}, click below to set a new password. This link expires in 1 hour.</p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;width:100%"><tr><td align="center">
      <a href="${link}" style="display:inline-block;background:#EF9F27;color:#0A0E1A;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px">Reset password →</a>
    </td></tr></table>
    <p style="font-size:12px;color:rgba(245,245,240,.35);text-align:center">Didn't request this? Ignore this email safely.<br>SIXXAB · startupsinabox.com</p>
  </div>
</div></body></html>`
}
