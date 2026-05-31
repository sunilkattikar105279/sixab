// pages/api/auth/apple.js — Apple Sign In callback
// Apple uses form_post so this receives POST

export default async function handler(req, res) {
  if (req.method !== "POST") return res.redirect("/login?err=method")

  const { code, state, error, user: appleUser } = req.body || {}

  if (error) return res.redirect("/login?err=apple_cancelled")
  if (!code) return res.redirect("/login?err=no_code")

  let redirectTo = "/coach", plan = "", userName = ""
  try {
    const s = JSON.parse(decodeURIComponent(state || "{}"))
    redirectTo = s.redirect || "/coach"
    plan = s.plan || ""
  } catch {}

  // Apple sends name only on first sign-in
  if (appleUser) {
    try {
      const u = JSON.parse(appleUser)
      userName = `${u.name?.firstName || ""} ${u.name?.lastName || ""}`.trim()
    } catch {}
  }

  try {
    // Decode JWT id_token to get email (Apple provides it in the token)
    const idToken = req.body.id_token
    let email = ""
    if (idToken) {
      const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString())
      email = payload.email || payload.sub + "@privaterelay.appleid.com"
    }
    if (!email) return res.redirect("/login?err=no_email")

    const authRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "oauth", oauthUser: { email, name: userName || email.split("@")[0], provider: "apple" }, plan }),
    })
    const authData = await authRes.json()
    if (!authRes.ok) return res.redirect("/login?err=oauth_auth")

    const user = encodeURIComponent(JSON.stringify(authData.user))
    const dest = encodeURIComponent(redirectTo)
    return res.redirect(`/login?oauth_user=${user}&oauth_token=${authData.token}&redirect=${dest}${plan?`&plan=${plan}`:""}`)
  } catch (err) {
    console.error("[Apple OAuth] Exception:", err.message)
    return res.redirect("/login?err=apple_error")
  }
}
