// pages/api/stripe-checkout.js
// Creates Stripe checkout session with 14-day trial
// Passes supabase_uid in metadata so webhook can update DB after trial
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  // ── Validate env vars ────────────────────────────────────────
  const SK = process.env.STRIPE_SECRET_KEY
  if (!SK) return res.status(500).json({
    error: "STRIPE_SECRET_KEY not set",
    fix: "Vercel → Project → Settings → Environment Variables → Add STRIPE_SECRET_KEY"
  })

  const PRICES = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro:     process.env.STRIPE_PRICE_PRO,
    agency:  process.env.STRIPE_PRICE_AGENCY,
  }

  const { plan } = req.body ?? {}
  if (!plan || !PRICES[plan]) {
    return res.status(400).json({
      error: `Invalid plan or price not set`,
      missing: Object.entries(PRICES).filter(([,v])=>!v).map(([k])=>`STRIPE_PRICE_${k.toUpperCase()}`),
      fix: "Vercel env vars: set STRIPE_PRICE_STARTER, STRIPE_PRICE_PRO, STRIPE_PRICE_AGENCY from Stripe → Products"
    })
  }

  const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"

  // ── Get user from Supabase token ─────────────────────────────
  let uid   = null
  let email = null
  let customerId = null

  const token   = req.headers.authorization?.replace("Bearer ", "")
  const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const SB_SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (token && SB_URL && SB_ANON) {
    try {
      // Get user identity
      const ur = await fetch(`${SB_URL}/auth/v1/user`, {
        headers: { apikey: SB_ANON, Authorization: `Bearer ${token}` }
      })
      if (ur.ok) {
        const u = await ur.json()
        uid   = u.id
        email = u.email

        // Get existing Stripe customer ID from profile
        if (SB_SVC) {
          const pr = await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${uid}&select=stripe_customer_id&limit=1`, {
            headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}` }
          })
          if (pr.ok) {
            const [prof] = await pr.json()
            customerId = prof?.stripe_customer_id || null
          }
        }
      }
    } catch(e) {
      console.error("Supabase lookup failed:", e.message)
    }
  }

  // ── Create or reuse Stripe customer ─────────────────────────
  try {
    const Stripe = require("stripe")
    const stripe = Stripe(SK, { apiVersion: "2024-04-10" })

    // Create customer if we have email but no existing customer
    if (email && !customerId) {
      try {
        const customer = await stripe.customers.create({
          email,
          metadata: { supabase_uid: uid || "" }
        })
        customerId = customer.id

        // Save customer ID back to Supabase
        if (uid && SB_URL && SB_SVC) {
          await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${uid}`, {
            method: "PATCH",
            headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`, "Content-Type": "application/json" },
            body: JSON.stringify({ stripe_customer_id: customerId })
          })
        }
      } catch(e) {
        console.error("Customer create failed:", e.message)
      }
    }

    // ── Build checkout session ─────────────────────────────────
    const sessionParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          supabase_uid: uid || "",
          plan,
        },
      },
      success_url: `${BASE}/billing?success=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE}/billing?cancelled=true`,
      allow_promotion_codes: true,
      metadata: { supabase_uid: uid || "", plan },
    }

    // Attach customer or prefill email
    if (customerId) {
      sessionParams.customer = customerId
    } else if (email) {
      sessionParams.customer_email = email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return res.status(200).json({ url: session.url })

  } catch(e) {
    return res.status(500).json({
      error: e.message,
      hint: e.message.includes("No such price") ? "Price ID is invalid — check STRIPE_PRICE_* env vars match your Stripe dashboard prices" : undefined
    })
  }
}
