// pages/api/stripe-portal.js — Opens Stripe customer portal
// Users can: cancel, upgrade, downgrade, update card
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const SK = process.env.STRIPE_SECRET_KEY
  if (!SK) return res.status(500).json({ error: "STRIPE_SECRET_KEY not set" })

  const BASE    = process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"
  const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const SB_SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Get user and their Stripe customer ID
  const token = req.headers.authorization?.replace("Bearer ", "")
  if (!token) return res.status(401).json({ error: "Login required" })

  let customerId = null
  let userEmail  = null

  try {
    const ur = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { apikey: SB_ANON, Authorization: `Bearer ${token}` }
    })
    if (!ur.ok) return res.status(401).json({ error: "Invalid session — please log in again" })

    const user = await ur.json()
    userEmail = user.email

    const pr = await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${user.id}&select=stripe_customer_id&limit=1`, {
      headers: { apikey: SB_SVC || SB_ANON, Authorization: `Bearer ${SB_SVC || token}` }
    })
    if (pr.ok) {
      const [profile] = await pr.json()
      customerId = profile?.stripe_customer_id
    }
  } catch(e) {
    return res.status(500).json({ error: "Failed to load profile: " + e.message })
  }

  if (!customerId) {
    return res.status(400).json({
      error: "No billing account found",
      hint: "You need to subscribe to a plan first before managing billing",
      action: "subscribe"
    })
  }

  try {
    const Stripe = require("stripe")
    const stripe = Stripe(SK, { apiVersion: "2024-04-10" })

    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${BASE}/billing`,
    })

    return res.status(200).json({ url: session.url })
  } catch(e) {
    // Common error: portal not configured in Stripe dashboard
    if (e.message.includes("No configuration")) {
      return res.status(500).json({
        error: "Stripe Customer Portal not enabled",
        fix: "Stripe dashboard → Settings → Billing → Customer portal → Enable and save"
      })
    }
    return res.status(500).json({ error: e.message })
  }
}
