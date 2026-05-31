// pages/api/auth.js
// Handles login, signup, and forgot password
// Uses simple token-based auth stored in sessionStorage client-side
// For production: replace with Supabase Auth or NextAuth.js

const ADMIN_EMAILS = ["sunil.kattikar@gmail.com"]

// Simple hash — replace with bcrypt in production
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// In-memory user store — replace with Supabase/DB in production
// This persists per-server-instance only (resets on redeploy)
const USERS = new Map()

// Pre-seed admin user
USERS.set("sunil.kattikar@gmail.com", {
  id: "usr_admin",
  name: "Sunil Kattikar",
  email: "sunil.kattikar@gmail.com",
  phone: null,
  passwordHash: simpleHash("sixxab2025!"),
  plan: "agency",
  createdAt: new Date().toISOString(),
})

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { mode, identifier, password, name, plan } = req.body ?? {}

  if (!mode || !identifier) {
    return res.status(400).json({ error: "Mode and identifier are required." })
  }

  const id = identifier.trim().toLowerCase()
  const isPhone = /^[\d\s\+\-\(\)]{7,}$/.test(id)

  // ── SIGNUP ───────────────────────────────────────────────────────────────
  if (mode === "signup") {
    if (!name || !password) {
      return res.status(400).json({ error: "Name and password are required." })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." })
    }

    // Check if user already exists
    const existing = USERS.get(id)
    if (existing) {
      return res.status(409).json({ error: "An account with this email or mobile already exists. Please sign in." })
    }

    const userId = "usr_" + Date.now()
    const user = {
      id: userId,
      name: name.trim(),
      email: isPhone ? null : id,
      phone: isPhone ? id : null,
      passwordHash: simpleHash(password),
      plan: plan || "free",
      createdAt: new Date().toISOString(),
    }

    USERS.set(id, user)
    console.log(`[SIXXAB Auth] New signup: ${id} | plan: ${plan}`)

    // Send welcome notification
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && !isPhone) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "SIXXAB <hello@startupsinabox.com>",
          to: [id],
          subject: "Welcome to SIXXAB — account created",
          html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <h2 style="color:#0A0E1A">Welcome, ${name}!</h2>
            <p style="color:#64748B">Your SIXXAB account is ready. <a href="https://www.startupsinabox.com/coach">Open your AI coach</a></p>
            <p style="color:#64748B;font-size:12px">startupsinabox.com · Dallas, TX</p>
          </div>`,
        }),
      }).catch(() => {})
    }

    const token = `tok_${userId}_${Date.now()}`
    return res.status(201).json({
      success: true,
      token,
      user: { id: userId, name: user.name, email: user.email, plan: user.plan },
    })
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if (mode === "login") {
    const user = USERS.get(id)

    if (!user) {
      return res.status(401).json({ error: "No account found with this email or mobile. Please create an account." })
    }

    if (user.passwordHash !== simpleHash(password)) {
      return res.status(401).json({ error: "Incorrect password. Please try again or reset your password." })
    }

    console.log(`[SIXXAB Auth] Login: ${id}`)
    const token = `tok_${user.id}_${Date.now()}`

    return res.status(200).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
    })
  }

  // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
  if (mode === "forgot") {
    const user = USERS.get(id)

    // Always return success to prevent user enumeration
    console.log(`[SIXXAB Auth] Password reset requested: ${id} | exists: ${!!user}`)

    if (user && !isPhone) {
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        const resetToken = simpleHash(id + Date.now())
        const resetLink = `https://www.startupsinabox.com/login?reset=${resetToken}&email=${encodeURIComponent(id)}`

        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "SIXXAB <hello@startupsinabox.com>",
            to: [id],
            subject: "Reset your SIXXAB password",
            html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
              <h2 style="color:#0A0E1A">Reset your password</h2>
              <p style="color:#64748B">Click the link below to set a new password for your SIXXAB account.</p>
              <a href="${resetLink}" style="display:inline-block;background:#EF9F27;color:#0A0E1A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Reset password →</a>
              <p style="color:#94A3B8;font-size:12px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
            </div>`,
          }),
        }).catch(() => {})
      }
    }

    return res.status(200).json({ success: true })
  }

  return res.status(400).json({ error: "Invalid mode." })
}
