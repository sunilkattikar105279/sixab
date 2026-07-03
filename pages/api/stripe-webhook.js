// pages/api/stripe-webhook.js — Stripe webhook handler
export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const SK  = process.env.STRIPE_SECRET_KEY
  const WHS = process.env.STRIPE_WEBHOOK_SECRET
  if (!SK || !WHS) return res.status(200).json({ received: true }) // graceful no-op

  // Read raw body
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const rawBody = Buffer.concat(chunks)
  const sig = req.headers["stripe-signature"]

  let event
  try {
    const Stripe = require("stripe")
    const stripe = Stripe(SK)
    event = stripe.webhooks.constructEvent(rawBody, sig, WHS)
  } catch(e) {
    return res.status(400).json({ error: `Webhook signature failed: ${e.message}` })
  }

  // Update Supabase based on event
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY

  async function updateProfile(uid, updates) {
    if (!SB_URL || !SB_SVC || !uid) return
    await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${uid}`, {
      method: "PATCH",
      headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`, "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
  }

  const uid = (o) => o?.metadata?.supabase_uid

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object
      if (uid(s)) await updateProfile(uid(s), { plan: s.metadata?.plan, plan_status: "trialing", stripe_subscription_id: s.subscription })
      break
    }
    case "customer.subscription.updated": {
      const s = event.data.object
      if (uid(s)) await updateProfile(uid(s), { plan_status: s.status, stripe_subscription_id: s.id })
      break
    }
    case "customer.subscription.deleted": {
      const s = event.data.object
      if (uid(s)) await updateProfile(uid(s), { plan_status: "cancelled" })
      break
    }
    case "invoice.payment_failed": {
      const i = event.data.object
      // Try to get uid from subscription metadata
      if (i.subscription && SB_URL && SB_SVC) {
        try {
          const Stripe = require("stripe")
          const sub = await Stripe(SK).subscriptions.retrieve(i.subscription)
          if (uid(sub)) await updateProfile(uid(sub), { plan_status: "past_due" })
        } catch {}
      }
      break
    }
  }

  return res.status(200).json({ received: true })
}
