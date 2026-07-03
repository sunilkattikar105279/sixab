// pages/api/auth.js — SIXXAB AI Authentication
// Handles signup, login, logout using Supabase Auth REST API
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { mode, identifier, password, name } = req.body ?? {}
  const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const SB_SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SB_URL || !SB_ANON) {
    return res.status(500).json({ error: "Supabase not configured — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel env vars" })
  }

  const email = (identifier || "").trim().toLowerCase()
  if (!email) return res.status(400).json({ error: "Email is required" })

  // ── SIGN UP ───────────────────────────────────────────────────
  if (mode === "signup") {
    if (!password || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" })

    const r = await fetch(`${SB_URL}/auth/v1/signup`, {
      method: "POST",
      headers: { apikey: SB_ANON, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        data: { full_name: name || email.split("@")[0] }
      })
    })
    const d = await r.json()

    if (d.error || !d.user) {
      const msg = d.error?.message || d.msg || "Signup failed"
      if (msg.includes("already registered")) return res.status(400).json({ error: "Email already registered — please sign in instead" })
      return res.status(400).json({ error: msg })
    }

    // Create profile row immediately (don't wait for trigger)
    if (SB_SVC && d.user?.id) {
      await fetch(`${SB_URL}/rest/v1/profiles`, {
        method: "POST",
        headers: {
          apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`,
          "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates"
        },
        body: JSON.stringify({
          id:         d.user.id,
          email:      d.user.email,
          full_name:  name || d.user.email.split("@")[0],
          user_role:  "customer",
          plan:       "starter",
          plan_status:"trialing"
        })
      })
    }

    return res.status(200).json({
      success: true,
      user:    d.user,
      session: d.session,
      message: d.session ? "Account created!" : "Check your email to confirm your account, then sign in."
    })
  }

  // ── SIGN IN ───────────────────────────────────────────────────
  if (mode === "login") {
    if (!password) return res.status(400).json({ error: "Password is required" })

    const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: SB_ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    const d = await r.json()

    if (d.error || !d.access_token) {
      const msg = d.error_description || d.error?.message || d.msg || "Invalid email or password"
      return res.status(401).json({ error: msg })
    }

    // Update last_seen_at
    if (SB_SVC) {
      await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${d.user.id}`, {
        method: "PATCH",
        headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`, "Content-Type": "application/json" },
        body: JSON.stringify({ last_seen_at: new Date().toISOString() })
      }).catch(() => {})
    }

    return res.status(200).json({
      success:      true,
      access_token: d.access_token,
      refresh_token:d.refresh_token,
      expires_in:   d.expires_in,
      user:         d.user,
      session:      d
    })
  }

  // ── FORGOT PASSWORD ───────────────────────────────────────────
  if (mode === "forgot") {
    const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"
    const r = await fetch(`${SB_URL}/auth/v1/recover`, {
      method: "POST",
      headers: { apikey: SB_ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, redirect_to: `${BASE}/login?reset=true` })
    })
    // Always return success to prevent email enumeration
    return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." })
  }

  return res.status(400).json({ error: "Invalid mode. Use: signup, login, forgot" })
}
