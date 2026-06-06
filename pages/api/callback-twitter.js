// pages/api/social/callback/twitter.js
export default async function handler(req, res) {
  const { code, state, error } = req.query
  const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://startupsinabox.com"
  if (error) return res.redirect(`/social?error=twitter_${error}`)
  if (!code)  return res.redirect("/social?error=twitter_no_code")

  let redirect = "/social"
  try { redirect = JSON.parse(Buffer.from(state, "base64").toString()).redirect || "/social" } catch {}

  try {
    const credentials = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")
    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${credentials}` },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  `${BASE}/api/social/callback/twitter`,
        code_verifier: "challenge",
      })
    })
    const token = await tokenRes.json()
    if (!token.access_token) throw new Error(token.error || "Token exchange failed")

    // Get user info
    const meRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${token.access_token}` }
    })
    const me = await meRes.json()

    const tokenData = encodeURIComponent(JSON.stringify({
      platform:     "twitter",
      accessToken:  token.access_token,
      refreshToken: token.refresh_token,
      expiresAt:    Date.now() + (token.expires_in || 7200) * 1000,
      userId:       me.data?.id,
      name:         me.data?.name,
      username:     me.data?.username,
      connected:    true,
      connectedAt:  new Date().toISOString(),
    }))
    res.setHeader("Set-Cookie", `sixxab_social_twitter=${tokenData}; Path=/; HttpOnly; SameSite=Lax; Max-Age=5184000`)
    res.redirect(`${redirect}?connected=twitter`)
  } catch(e) {
    console.error("Twitter callback error:", e.message)
    res.redirect("/social?error=twitter_token_failed")
  }
}
