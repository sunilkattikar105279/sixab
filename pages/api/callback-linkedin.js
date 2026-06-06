// pages/api/social/callback/linkedin.js
// Exchange code → access token → store in session
export default async function handler(req, res) {
  const { code, state, error } = req.query
  const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://startupsinabox.com"
  if (error) return res.redirect(`/social?error=linkedin_${error}`)
  if (!code)  return res.redirect("/social?error=linkedin_no_code")

  let redirect = "/social"
  try { redirect = JSON.parse(Buffer.from(state, "base64").toString()).redirect || "/social" } catch {}

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  `${BASE}/api/social/callback/linkedin`,
        client_id:     process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      })
    })
    const token = await tokenRes.json()
    if (!token.access_token) throw new Error(token.error_description || "Token exchange failed")

    // Get user profile
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` }
    })
    const profile = await profileRes.json()

    // Store token — in production use a DB or encrypted cookie. For now: cookie.
    const tokenData = encodeURIComponent(JSON.stringify({
      platform:     "linkedin",
      accessToken:  token.access_token,
      expiresAt:    Date.now() + (token.expires_in || 5184000) * 1000,
      sub:          profile.sub || profile.id,
      name:         profile.name || profile.localizedFirstName,
      picture:      profile.picture,
      connected:    true,
      connectedAt:  new Date().toISOString(),
    }))
    res.setHeader("Set-Cookie", `sixxab_social_linkedin=${tokenData}; Path=/; HttpOnly; SameSite=Lax; Max-Age=5184000`)
    res.redirect(`${redirect}?connected=linkedin`)
  } catch(e) {
    console.error("LinkedIn callback error:", e.message)
    res.redirect(`/social?error=linkedin_token_failed`)
  }
}
