// pages/api/stripe-checkout.js — Create Stripe checkout session
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const SK = process.env.STRIPE_SECRET_KEY
  if (!SK) return res.status(500).json({ error: "STRIPE_SECRET_KEY not set in Vercel env vars" })

  const PRICES = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro:     process.env.STRIPE_PRICE_PRO,
    agency:  process.env.STRIPE_PRICE_AGENCY,
  }
  const { plan } = req.body ?? {}
  const priceId = PRICES[plan]
  if (!priceId) return res.status(400).json({ error: `STRIPE_PRICE_${(plan||"").toUpperCase()} not set in Vercel env vars` })

  const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"

  // Get user email from token if logged in
  let email = null
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")
    const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (token && SB_URL && SB_ANON) {
      const r = await fetch(`${SB_URL}/auth/v1/user`, {
        headers: { apikey: SB_ANON, Authorization: `Bearer ${token}` }
      })
      if (r.ok) { const u = await r.json(); email = u.email }
    }
  } catch {}

  try {
    const Stripe = require("stripe")
    const stripe = Stripe(SK)

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      ...(email ? { customer_email: email } : {}),
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { plan },
      },
      success_url: `${BASE}/billing?success=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE}/billing?cancelled=true`,
      allow_promotion_codes: true,
      metadata: { plan },
    })
    return res.status(200).json({ url: session.url })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
