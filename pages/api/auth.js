// pages/api/auth.js — SIXXAB AI Authentication
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { mode, identifier, password, name } = req.body ?? {}
  const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const SB_SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SB_URL || !SB_ANON) return res.status(500).json({
    error: "Supabase not configured",
    fix:   "Add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel env vars"
  })

  const email = (identifier || "").trim().toLowerCase()
  if (!email) return res.status(400).json({ error: "Email is required" })

  // ── SIGN UP ───────────────────────────────────────────────────
  if (mode === "signup") {
    if (!password || password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" })

    // Use service role key for signup to bypass any restrictions
    const signupKey = SB_SVC || SB_ANON

    const r = await fetch(`${SB_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: signupKey,
        Authorization: `Bearer ${signupKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        data: { full_name: name || email.split("@")[0] }
      })
    })

    const d = await r.json()
    console.log("Signup response:", JSON.stringify(d).slice(0, 300))

    if (d.error) {
      const msg = d.error?.message || d.msg || "Signup failed"
      if (msg.toLowerCase().includes("already registered"))
        return res.status(400).json({ error: "Email already registered — sign in instead" })
      return res.status(400).json({ error: msg, raw: d.error })
    }

    // d.user exists but d.session may be null if email confirmation is on
    const userId = d.user?.id || d.id
    if (!userId) return res.status(400).json({ error: "Signup failed — no user ID returned", raw: d })

    // Manually create profile row using service role (bypasses RLS + trigger issues)
    if (SB_SVC) {
      const pr = await fetch(`${SB_URL}/rest/v1/profiles`, {
        method: "POST",
        headers: {
          apikey:       SB_SVC,
          Authorization:`Bearer ${SB_SVC}`,
          "Content-Type":"application/json",
          Prefer:       "resolution=ignore-duplicates,return=minimal"
        },
        body: JSON.stringify({
          id:          userId,
          email:       email,
          full_name:   name || email.split("@")[0],
          user_role:   "customer",
          plan:        "starter",
          plan_status: "trialing"
        })
      })
      if (!pr.ok) {
        const pt = await pr.text()
        console.log("Profile insert result:", pr.status, pt.slice(0, 200))
      }
    }

    // If session exists (email confirmation off), return it
    if (d.session?.access_token) {
      return res.status(200).json({
        success: true,
        user:    d.user,
        session: d.session,
        access_token:  d.session.access_token,
        refresh_token: d.session.refresh_token,
        expires_in:    d.session.expires_in,
      })
    }

    // Email confirmation is ON — tell user to check email
    return res.status(200).json({
      success:  true,
      user:     d.user,
      needsConfirmation: true,
      message:  "Account created! Check your email and click the confirmation link, then sign in."
    })
  }

  // ── SIGN IN ───────────────────────────────────────────────────
  if (mode === "login") {
    if (!password) return res.status(400).json({ error: "Password is required" })

    const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SB_ANON,
        Authorization: `Bearer ${SB_ANON}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })

    const d = await r.json()
    console.log("Login response status:", r.status, "error:", d.error)

    if (!r.ok || d.error) {
      const msg = d.error_description || d.error?.message || d.msg || "Invalid email or password"
      if (msg.toLowerCase().includes("email not confirmed"))
        return res.status(401).json({ error: "Please confirm your email first — check your inbox for the confirmation link." })
      return res.status(401).json({ error: msg })
    }

    // Update last_seen_at (best effort)
    if (SB_SVC && d.user?.id) {
      fetch(`${SB_URL}/rest/v1/profiles?id=eq.${d.user.id}`, {
        method: "PATCH",
        headers: {
          apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ last_seen_at: new Date().toISOString() })
      }).catch(() => {})
    }

    return res.status(200).json({
      success:       true,
      access_token:  d.access_token,
      refresh_token: d.refresh_token,
      expires_in:    d.expires_in,
      user:          d.user,
      session:       d,
    })
  }

  // ── FORGOT PASSWORD ───────────────────────────────────────────
  if (mode === "forgot") {
    const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"
    await fetch(`${SB_URL}/auth/v1/recover`, {
      method: "POST",
      headers: { apikey: SB_ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, redirect_to: `${BASE}/login?reset=true` })
    })
    return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." })
  }

  return res.status(400).json({ error: `Unknown mode: ${mode}` })
}
