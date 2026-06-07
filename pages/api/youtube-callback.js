// pages/api/youtube-callback.js
export default async function handler(req, res) {
  const { code, state, error } = req.query
  const BASE = (process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com").replace(/\/$/, "")
  if (error) return res.redirect(302, `${BASE}/social?error=${encodeURIComponent(error)}`)
  if (!code)  return res.redirect(302, `${BASE}/social?error=no_code`)
  let redirectTo = `${BASE}/social`
  try { const p = JSON.parse(Buffer.from(state||"","base64").toString()); if(p.redirect) redirectTo=`${BASE}${p.redirect}` } catch{}
  try {
    const token = await (await fetch("https://oauth2.googleapis.com/token", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:new URLSearchParams({ grant_type:"authorization_code", code, redirect_uri:`${BASE}/api/youtube-callback`, client_id:process.env.GOOGLE_CLIENT_ID, client_secret:process.env.GOOGLE_CLIENT_SECRET }) })).json()
    if (!token.access_token) throw new Error(token.error||"Token failed")
    const ch = await (await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers:{ Authorization:`Bearer ${token.access_token}` } })).json()
    const channel = ch.items?.[0]
    const val = encodeURIComponent(JSON.stringify({ platform:"youtube", accessToken:token.access_token, refreshToken:token.refresh_token, expiresAt:Date.now()+(token.expires_in||3600)*1000, channelId:channel?.id, channelName:channel?.snippet?.title, connected:true, connectedAt:new Date().toISOString() }))
    res.setHeader("Set-Cookie", `sixxab_social_youtube=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=5184000`)
    return res.redirect(302, `${redirectTo}?connected=youtube`)
  } catch(e) { return res.redirect(302, `${BASE}/social?error=token_failed&desc=${encodeURIComponent(e.message)}`) }
}
