// pages/api/stripe-portal.js — Stripe customer portal
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const SK = process.env.STRIPE_SECRET_KEY
  if (!SK) return res.status(500).json({ error: "STRIPE_SECRET_KEY not set" })

  const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"

  // Get stripe_customer_id from Supabase
  let customerId = null
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")
    const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const SB_SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (token && SB_URL && SB_ANON) {
      const ur = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_ANON, Authorization: `Bearer ${token}` } })
      if (ur.ok) {
        const user = await ur.json()
        const pr = await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${user.id}&select=stripe_customer_id&limit=1`, {
          headers: { apikey: SB_SVC || SB_ANON, Authorization: `Bearer ${SB_SVC || token}` }
        })
        if (pr.ok) { const [p] = await pr.json(); customerId = p?.stripe_customer_id }
      }
    }
  } catch {}

  if (!customerId) {
    return res.status(400).json({ error: "No subscription found. Please subscribe to a plan first." })
  }

  try {
    const Stripe = require("stripe")
    const stripe = Stripe(SK)
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${BASE}/billing`,
    })
    return res.status(200).json({ url: session.url })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
