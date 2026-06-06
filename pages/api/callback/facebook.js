// pages/api/facebook-callback.js — handles Facebook + Instagram
export default async function handler(req, res) {
  const { code, state, error } = req.query
  const BASE = (process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com").replace(/\/$/, "")
  if (error) return res.redirect(302, `${BASE}/social?error=${encodeURIComponent(error)}`)
  if (!code)  return res.redirect(302, `${BASE}/social?error=no_code`)
  let redirectTo = `${BASE}/social`
  try { const p = JSON.parse(Buffer.from(state||"","base64").toString()); if(p.redirect) redirectTo=`${BASE}${p.redirect}` } catch{}
  try {
    const t = await (await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({ client_id:process.env.FACEBOOK_APP_ID, client_secret:process.env.FACEBOOK_APP_SECRET, redirect_uri:`${BASE}/api/facebook-callback`, code })}`)).json()
    if (!t.access_token) throw new Error(t.error?.message||"Token failed")
    const lt = await (await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({ grant_type:"fb_exchange_token", client_id:process.env.FACEBOOK_APP_ID, client_secret:process.env.FACEBOOK_APP_SECRET, fb_exchange_token:t.access_token })}`)).json()
    const at = lt.access_token || t.access_token
    const me = await (await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${at}`)).json()
    const pages = await (await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${at}`)).json()
    const igAccounts = []
    for (const pg of (pages.data||[]).slice(0,5)) {
      const ig = await (await fetch(`https://graph.facebook.com/v19.0/${pg.id}?fields=instagram_business_account&access_token=${pg.access_token}`)).json()
      if (ig.instagram_business_account?.id) igAccounts.push({ pageId:pg.id, igId:ig.instagram_business_account.id, pageName:pg.name, pageToken:pg.access_token })
    }
    const val = encodeURIComponent(JSON.stringify({ platform:"facebook", accessToken:at, expiresAt:Date.now()+5184000000, userId:me.id, name:me.name, pages:(pages.data||[]).map(p=>({id:p.id,name:p.name,token:p.access_token})), igAccounts, connected:true, connectedAt:new Date().toISOString() }))
    res.setHeader("Set-Cookie", `sixxab_social_facebook=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=5184000`)
    return res.redirect(302, `${redirectTo}?connected=facebook`)
  } catch(e) { return res.redirect(302, `${BASE}/social?error=token_failed&desc=${encodeURIComponent(e.message)}`) }
}
