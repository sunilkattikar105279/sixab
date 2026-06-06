// pages/api/linkedin-callback.js
// Register in LinkedIn app as: https://www.startupsinabox.com/api/linkedin-callback
export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query
  const BASE = (process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com").replace(/\/$/, "")

  if (error) {
    return res.redirect(302, `${BASE}/social?error=${encodeURIComponent(error)}&desc=${encodeURIComponent(error_description || error)}`)
  }
  if (!code) {
    return res.redirect(302, `${BASE}/social?error=no_code`)
  }

  let redirectTo = `${BASE}/social`
  try {
    const parsed = JSON.parse(Buffer.from(state || "", "base64").toString())
    if (parsed.redirect) redirectTo = `${BASE}${parsed.redirect}`
  } catch {}

  try {
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  `${BASE}/api/linkedin-callback`,
        client_id:     process.env.LINKEDIN_CLIENT_ID     || "",
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
      }),
    })
    const token = await tokenRes.json()
    if (!token.access_token) {
      throw new Error(token.error_description || token.error || "Token exchange failed")
    }

    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    })
    const profile = await profileRes.json()

    const cookieVal = encodeURIComponent(JSON.stringify({
      platform:    "linkedin",
      accessToken: token.access_token,
      expiresAt:   Date.now() + (token.expires_in || 5184000) * 1000,
      sub:         profile.sub || profile.id || "",
      name:        profile.name || "LinkedIn user",
      picture:     profile.picture || "",
      connected:   true,
      connectedAt: new Date().toISOString(),
    }))

    res.setHeader("Set-Cookie",
      `sixxab_social_linkedin=${cookieVal}; Path=/; HttpOnly; SameSite=Lax; Max-Age=5184000`
    )
    return res.redirect(302, `${redirectTo}?connected=linkedin`)

  } catch (e) {
    console.error("[LinkedIn]", e.message)
    return res.redirect(302, `${BASE}/social?error=token_failed&desc=${encodeURIComponent(e.message)}`)
  }
}
