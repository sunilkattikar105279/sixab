// pages/api/social/callback/linkedin.js
// LinkedIn OAuth 2.0 callback — exchanges code for access token
export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query

  // Use www prefix to match registered redirect URI exactly
  const BASE = (process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com")
    .replace(/\/$/, "") // strip trailing slash

  // ── LinkedIn returned an error ────────────────────────────────────────────
  if (error) {
    return res.redirect(302,
      `${BASE}/social?error=${encodeURIComponent(error)}&desc=${encodeURIComponent(error_description || error)}`
    )
  }

  // ── No code — something went wrong before we got here ────────────────────
  if (!code) {
    return res.redirect(302, `${BASE}/social?error=no_code`)
  }

  // ── Parse state to get the post-auth redirect destination ─────────────────
  let redirectTo = `${BASE}/social`
  try {
    const parsed = JSON.parse(Buffer.from(state || "", "base64").toString())
    if (parsed.redirect) {
      redirectTo = `${BASE}${parsed.redirect.startsWith("/") ? parsed.redirect : "/" + parsed.redirect}`
    }
  } catch { /* use default redirectTo */ }

  // ── Exchange code for access token ────────────────────────────────────────
  try {
    const REDIRECT_URI = `${BASE}/api/social/callback/linkedin`

    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  REDIRECT_URI,
        client_id:     process.env.LINKEDIN_CLIENT_ID     || "",
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
      }),
    })

    const tokenText = await tokenRes.text()
    let token
    try { token = JSON.parse(tokenText) }
    catch { throw new Error(`LinkedIn returned non-JSON: ${tokenText.slice(0, 200)}`) }

    if (!token.access_token) {
      throw new Error(token.error_description || token.error || `No access_token in response: ${tokenText.slice(0,200)}`)
    }

    // ── Fetch user profile ─────────────────────────────────────────────────
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    })
    const profile = await profileRes.json()

    // ── Store in HttpOnly cookie ───────────────────────────────────────────
    const cookieValue = encodeURIComponent(JSON.stringify({
      platform:    "linkedin",
      accessToken: token.access_token,
      expiresAt:   Date.now() + (token.expires_in || 5184000) * 1000,
      sub:         profile.sub || profile.id || "",
      name:        profile.name || profile.localizedFirstName || "LinkedIn user",
      picture:     profile.picture || "",
      connected:   true,
      connectedAt: new Date().toISOString(),
    }))

    res.setHeader("Set-Cookie",
      `sixxab_social_linkedin=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=5184000`
    )
    return res.redirect(302, `${redirectTo}?connected=linkedin`)

  } catch (e) {
    console.error("[LinkedIn callback error]", e.message)
    return res.redirect(302,
      `${BASE}/social?error=token_failed&desc=${encodeURIComponent(e.message)}`
    )
  }
}
