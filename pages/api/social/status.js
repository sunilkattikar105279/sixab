// pages/api/social/status.js — Returns connection status for all platforms

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end()
  // Parse cookies manually — no external package needed
  const cookies = Object.fromEntries(
    (req.headers.cookie || "").split(";").map(c => {
      const idx = c.indexOf("=")
      return [c.slice(0,idx).trim(), c.slice(idx+1).trim()]
    }).filter(([k]) => k)
  )
  const platforms = ["linkedin","twitter","facebook","instagram","youtube"]

  const status = {}
  for (const p of platforms) {
    try {
      const raw = cookies[`sixxab_social_${p}`]
      if (!raw) { status[p] = { connected:false }; continue }
      const data = JSON.parse(decodeURIComponent(raw))
      const expired = data.expiresAt && Date.now() > data.expiresAt
      status[p] = {
        connected:   data.connected && !expired,
        expired,
        name:        data.name || data.channelName || data.username,
        picture:     data.picture || data.channelThumb,
        pages:       data.pages?.length || 0,
        igAccounts:  data.igAccounts?.length || 0,
        connectedAt: data.connectedAt,
      }
    } catch { status[p] = { connected:false } }
  }
  // Instagram shares Facebook token — mirror status
  if (!status.instagram?.connected && status.facebook?.connected) {
    status.instagram = { ...status.facebook, platform:"instagram",
      connected: (status.facebook.igAccounts || 0) > 0,
      note: status.facebook.igAccounts ? undefined : "Connect Instagram to your Facebook Page in Meta Business Suite" }
  }
  res.status(200).json({ status })
}
