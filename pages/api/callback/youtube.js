// pages/api/social/callback/youtube.js
export default async function handler(req, res) {
  const { code, state, error } = req.query
  const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://startupsinabox.com"
  if (error) return res.redirect(`/social?error=youtube_${error}`)
  if (!code)  return res.redirect("/social?error=youtube_no_code")

  let redirect = "/social"
  try { redirect = JSON.parse(Buffer.from(state, "base64").toString()).redirect || "/social" } catch {}

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  `${BASE}/api/social/callback/youtube`,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
      })
    })
    const token = await tokenRes.json()
    if (!token.access_token) throw new Error(token.error || "Token exchange failed")

    // Get channel info
    const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`, {
      headers: { Authorization: `Bearer ${token.access_token}` }
    })
    const ch = await chRes.json()
    const channel = ch.items?.[0]

    const tokenData = encodeURIComponent(JSON.stringify({
      platform:      "youtube",
      accessToken:   token.access_token,
      refreshToken:  token.refresh_token,
      expiresAt:     Date.now() + (token.expires_in || 3600) * 1000,
      channelId:     channel?.id,
      channelName:   channel?.snippet?.title,
      channelThumb:  channel?.snippet?.thumbnails?.default?.url,
      connected:     true,
      connectedAt:   new Date().toISOString(),
    }))
    res.setHeader("Set-Cookie", `sixxab_social_youtube=${tokenData}; Path=/; HttpOnly; SameSite=Lax; Max-Age=5184000`)
    res.redirect(`${redirect}?connected=youtube`)
  } catch(e) {
    console.error("YouTube callback error:", e.message)
    res.redirect("/social?error=youtube_token_failed")
  }
}
