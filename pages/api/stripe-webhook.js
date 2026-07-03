// pages/api/stripe-webhook.js
// Handles Stripe events after trial ends and subscription changes
// CRITICAL: This is what charges the card after 14 days
export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const SK  = process.env.STRIPE_SECRET_KEY
  const WHS = process.env.STRIPE_WEBHOOK_SECRET

  if (!SK)  return res.status(500).json({ error: "STRIPE_SECRET_KEY not set" })
  if (!WHS) return res.status(500).json({ error: "STRIPE_WEBHOOK_SECRET not set — add it in Vercel env vars" })

  // Read raw body for signature verification
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const rawBody = Buffer.concat(chunks)
  const sig = req.headers["stripe-signature"]

  let event
  try {
    const Stripe = require("stripe")
    const stripe = Stripe(SK, { apiVersion: "2024-04-10" })
    event = stripe.webhooks.constructEvent(rawBody, sig, WHS)
  } catch(e) {
    console.error("Webhook signature failed:", e.message)
    return res.status(400).json({ error: `Signature verification failed: ${e.message}` })
  }

  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Helper: update user profile in Supabase
  async function updateProfile(uid, updates) {
    if (!uid || !SB_URL || !SB_SVC) return
    try {
      const r = await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${uid}`, {
        method: "PATCH",
        headers: {
          apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`,
          "Content-Type": "application/json", Prefer: "return=minimal"
        },
        body: JSON.stringify(updates)
      })
      if (!r.ok) console.error("Profile update failed:", await r.text())
    } catch(e) {
      console.error("Profile update error:", e.message)
    }
  }

  // Helper: get uid from Stripe object metadata
  const getUid = (obj) => obj?.metadata?.supabase_uid || null

  // Helper: get uid from customer ID via Supabase
  async function getUidFromCustomer(customerId) {
    if (!customerId || !SB_URL || !SB_SVC) return null
    try {
      const r = await fetch(`${SB_URL}/rest/v1/profiles?stripe_customer_id=eq.${customerId}&select=id&limit=1`, {
        headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}` }
      })
      if (r.ok) { const [p] = await r.json(); return p?.id || null }
    } catch {}
    return null
  }

  console.log(`Stripe webhook: ${event.type}`)

  switch (event.type) {

    // ── Trial started / checkout completed ────────────────────
    case "checkout.session.completed": {
      const session = event.data.object
      const uid = getUid(session) || await getUidFromCustomer(session.customer)
      if (uid) {
        await updateProfile(uid, {
          plan:                   session.metadata?.plan || "starter",
          plan_status:            "trialing",
          stripe_customer_id:     session.customer,
          stripe_subscription_id: session.subscription,
        })
        console.log(`✓ Trial started for user ${uid}, plan: ${session.metadata?.plan}`)
      }
      break
    }

    // ── Trial ends → first payment taken ─────────────────────
    case "invoice.paid": {
      const inv = event.data.object
      // Only fire after trial (billing_reason = subscription_cycle or subscription_update)
      if (inv.billing_reason === "subscription_create") break // first invoice during trial — skip
      const uid = await getUidFromCustomer(inv.customer)
      if (uid) {
        await updateProfile(uid, { plan_status: "active" })
        console.log(`✓ Payment succeeded, plan active for user ${uid}`)
      }
      break
    }

    // ── Subscription updated (upgrade/downgrade) ──────────────
    case "customer.subscription.updated": {
      const sub = event.data.object
      const uid = getUid(sub) || await getUidFromCustomer(sub.customer)
      if (uid) {
        // Map Stripe status to our status
        const statusMap = {
          trialing: "trialing",
          active:   "active",
          past_due: "past_due",
          canceled: "cancelled",
          unpaid:   "past_due",
          paused:   "cancelled",
        }
        const planStatus = statusMap[sub.status] || sub.status

        // Get plan from metadata or price nickname
        let plan = sub.metadata?.plan
        if (!plan && sub.items?.data?.[0]?.price?.nickname) {
          plan = sub.items.data[0].price.nickname.toLowerCase()
        }

        await updateProfile(uid, {
          plan_status: planStatus,
          stripe_subscription_id: sub.id,
          ...(plan && { plan }),
        })
        console.log(`✓ Subscription updated: ${planStatus} for user ${uid}`)
      }
      break
    }

    // ── Payment failed after trial ends ───────────────────────
    case "invoice.payment_failed": {
      const inv = event.data.object
      const uid = await getUidFromCustomer(inv.customer)
      if (uid) {
        await updateProfile(uid, { plan_status: "past_due" })
        console.log(`⚠ Payment failed for user ${uid}`)
      }
      break
    }

    // ── Subscription cancelled ────────────────────────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object
      const uid = getUid(sub) || await getUidFromCustomer(sub.customer)
      if (uid) {
        await updateProfile(uid, { plan_status: "cancelled" })
        console.log(`✓ Subscription cancelled for user ${uid}`)
      }
      break
    }

    // ── Trial will end in 3 days (send reminder) ──────────────
    case "customer.subscription.trial_will_end": {
      const sub = event.data.object
      const uid = getUid(sub) || await getUidFromCustomer(sub.customer)
      console.log(`⏰ Trial ending soon for user ${uid} — send reminder email`)
      // TODO: send reminder via Resend: "Your trial ends in 3 days"
      break
    }

    default:
      console.log(`Unhandled event: ${event.type}`)
  }

  return res.status(200).json({ received: true, event: event.type })
}
