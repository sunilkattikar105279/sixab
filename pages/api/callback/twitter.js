// pages/api/twitter-callback.js
export default async function handler(req, res) {
  const { code, state, error } = req.query
  const BASE = (process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com").replace(/\/$/, "")
  if (error) return res.redirect(302, `${BASE}/social?error=${encodeURIComponent(error)}`)
  if (!code)  return res.redirect(302, `${BASE}/social?error=no_code`)
  let redirectTo = `${BASE}/social`
  try { const p = JSON.parse(Buffer.from(state||"","base64").toString()); if(p.redirect) redirectTo=`${BASE}${p.redirect}` } catch{}
  try {
    const creds = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")
    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${creds}` },
      body: new URLSearchParams({ grant_type:"authorization_code", code, redirect_uri:`${BASE}/api/twitter-callback`, code_verifier:"challenge" })
    })
    const token = await tokenRes.json()
    if (!token.access_token) throw new Error(token.error || "Token exchange failed")
    const me = await (await fetch("https://api.twitter.com/2/users/me", { headers:{ Authorization:`Bearer ${token.access_token}` } })).json()
    const val = encodeURIComponent(JSON.stringify({ platform:"twitter", accessToken:token.access_token, refreshToken:token.refresh_token, expiresAt:Date.now()+(token.expires_in||7200)*1000, userId:me.data?.id, name:me.data?.name, username:me.data?.username, connected:true, connectedAt:new Date().toISOString() }))
    res.setHeader("Set-Cookie", `sixxab_social_twitter=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=5184000`)
    return res.redirect(302, `${redirectTo}?connected=twitter`)
  } catch(e) { return res.redirect(302, `${BASE}/social?error=token_failed&desc=${encodeURIComponent(e.message)}`) }
}
