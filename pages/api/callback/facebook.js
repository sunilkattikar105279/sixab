// pages/api/social/callback/facebook.js — handles both Facebook and Instagram
export default async function handler(req, res) {
  const { code, state, error } = req.query
  const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://startupsinabox.com"
  if (error) return res.redirect(`/social?error=facebook_${error}`)
  if (!code)  return res.redirect("/social?error=facebook_no_code")

  let redirect = "/social"
  try { redirect = JSON.parse(Buffer.from(state, "base64").toString()).redirect || "/social" } catch {}

  try {
    // Exchange code for long-lived token
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({
      client_id:     process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      redirect_uri:  `${BASE}/api/social/callback/facebook`,
      code,
    })}`)
    const token = await tokenRes.json()
    if (!token.access_token) throw new Error(token.error?.message || "Token exchange failed")

    // Exchange for long-lived token (60 days)
    const longRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({
      grant_type:        "fb_exchange_token",
      client_id:         process.env.FACEBOOK_APP_ID,
      client_secret:     process.env.FACEBOOK_APP_SECRET,
      fb_exchange_token: token.access_token,
    })}`)
    const longToken = await longRes.json()
    const accessToken = longToken.access_token || token.access_token

    // Get user + pages
    const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${accessToken}`)
    const me = await meRes.json()

    // Get pages the user manages (for posting)
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`)
    const pages = await pagesRes.json()

    // For each page, get Instagram business account if linked
    const igAccounts = []
    for (const page of (pages.data || []).slice(0,5)) {
      const igRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`)
      const igData = await igRes.json()
      if (igData.instagram_business_account?.id) {
        igAccounts.push({ pageId: page.id, igId: igData.instagram_business_account.id, pageName: page.name, pageToken: page.access_token })
      }
    }

    const tokenData = encodeURIComponent(JSON.stringify({
      platform:    "facebook",
      accessToken,
      expiresAt:   Date.now() + 5184000000, // ~60 days
      userId:      me.id,
      name:        me.name,
      pages:       (pages.data || []).map(p => ({ id:p.id, name:p.name, token:p.access_token, category:p.category })),
      igAccounts,
      connected:   true,
      connectedAt: new Date().toISOString(),
    }))
    res.setHeader("Set-Cookie", `sixxab_social_facebook=${tokenData}; Path=/; HttpOnly; SameSite=Lax; Max-Age=5184000`)
    res.redirect(`${redirect}?connected=facebook`)
  } catch(e) {
    console.error("Facebook callback error:", e.message)
    res.redirect("/social?error=facebook_token_failed")
  }
}
