// pages/api/auth/google.js — Google OAuth callback handler
// Redirect URI: https://www.startupsinabox.com/api/auth/google

export default async function handler(req, res) {
  const { code, state, error } = req.query

  if (error) {
    console.error("[Google OAuth] Error:", error)
    return res.redirect("/login?err=google_cancelled")
  }

  if (!code) return res.redirect("/login?err=no_code")

  let redirectTo = "/coach", plan = ""
  try {
    const s = JSON.parse(decodeURIComponent(state || "{}"))
    redirectTo = s.redirect || "/coach"
    plan = s.plan || ""
  } catch {}

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    console.error("[Google OAuth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set")
    return res.redirect(`/login?err=google_not_configured`)
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"}/api/auth/google`,
        grant_type: "authorization_code",
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[Google OAuth] Token error:", tokenData)
      return res.redirect("/login?err=google_token")
    }

    // Get user profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile = await profileRes.json()
    if (!profile.email) return res.redirect("/login?err=no_email")

    // Create/update user via auth API
    const authRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "oauth", oauthUser: { email: profile.email, name: profile.name, provider: "google" }, plan }),
    })
    const authData = await authRes.json()
    if (!authRes.ok || !authData.token) return res.redirect("/login?err=oauth_auth")

    // Set session cookie and redirect
    const user = encodeURIComponent(JSON.stringify(authData.user))
    const token = authData.token
    const dest = encodeURIComponent(redirectTo)
    // Pass user data via query param — client stores in sessionStorage
    return res.redirect(`/login?oauth_user=${user}&oauth_token=${token}&redirect=${dest}${plan?`&plan=${plan}`:""}`)

  } catch (err) {
    console.error("[Google OAuth] Exception:", err.message)
    return res.redirect("/login?err=google_error")
  }
}
