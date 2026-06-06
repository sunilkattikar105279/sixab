// pages/api/social/disconnect.js — Clear a platform's cookie/token
export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()
  const { platform } = req.body ?? {}
  if (!platform) return res.status(400).json({ error:"Platform required" })
  // Clear by setting expired cookie
  res.setHeader("Set-Cookie", `sixxab_social_${platform}=; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`)
  res.status(200).json({ disconnected: platform })
}
