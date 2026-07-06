// pages/api/social/status.js
// Reads HttpOnly cookies set by OAuth callbacks to determine connection status
export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end()

  const raw = req.headers.cookie || ""

  function parseCookie(name) {
    const match = raw.split(";").map(c => c.trim()).find(c => c.startsWith(name + "="))
    if (!match) return null
    try { return JSON.parse(decodeURIComponent(match.slice(name.length + 1))) }
    catch { return null }
  }

  const PLATFORMS = ["linkedin", "twitter", "facebook", "instagram", "youtube"]
  const status = {}

  for (const p of PLATFORMS) {
    const data = parseCookie(`sixxab_social_${p}`)
    if (data?.connected) {
      const expired = data.expiresAt && Date.now() > data.expiresAt
      status[p] = {
        connected:   !expired,
        expired:      !!expired,
        name:         data.name      || "",
        picture:      data.picture   || "",
        sub:          data.sub       || "",
        connectedAt:  data.connectedAt || "",
        expiresAt:    data.expiresAt || null,
      }
    } else {
      status[p] = { connected: false }
    }
  }

  // Also report which env vars are configured
  const configured = {
    linkedin: !!(process.env.LINKEDIN_CLIENT_ID  && process.env.LINKEDIN_CLIENT_SECRET),
    facebook: !!(process.env.FACEBOOK_APP_ID     && process.env.FACEBOOK_APP_SECRET),
    twitter:  !!(process.env.TWITTER_CLIENT_ID   && process.env.TWITTER_CLIENT_SECRET),
    youtube:  !!(process.env.GOOGLE_CLIENT_ID    && process.env.GOOGLE_CLIENT_SECRET),
  }
  configured.instagram = configured.facebook

  return res.status(200).json({ status, configured, ok: true })
}
