// pages/api/checkout.js — bulletproof Stripe checkout, no SDK

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // ── 1. Validate Stripe key ──────────────────────────────────────────────
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || stripeKey === "sk_test_your-stripe-secret-key") {
    return res.status(500).json({
      error: "STRIPE_SECRET_KEY not configured in Vercel → Settings → Environment Variables"
    })
  }

  // ── 2. Parse body ───────────────────────────────────────────────────────
  const { tierId } = req.body ?? {}

  if (!tierId) {
    return res.status(400).json({ error: "tierId is required" })
  }

  // ── 3. Map tier → price ID from server env vars ─────────────────────────
  // NOTE: Using server-side env vars (no NEXT_PUBLIC_ prefix) so they are
  // resolved at runtime on the server, not at build time on the client.
  const PRICE_MAP = {
    starter: process.env.STRIPE_PRICE_STARTER || process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
    pro:     process.env.STRIPE_PRICE_PRO     || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    agency:  process.env.STRIPE_PRICE_AGENCY  || process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY,
  }

  const priceId = PRICE_MAP[tierId]

  console.log("[SIXAB Checkout] tierId:", tierId, "| priceId:", priceId)

  if (!priceId || priceId === "undefined" || priceId === "null" || !priceId.startsWith("price_")) {
    return res.status(400).json({
      error: `Price ID for "${tierId}" is not configured. Go to Vercel → Settings → Environment Variables and add STRIPE_PRICE_${tierId.toUpperCase()} = price_xxx`
    })
  }

  // ── 4. Build Stripe params ──────────────────────────────────────────────
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "") || "https://www.startupsinabox.com"

  const params = {
    "mode":                          "subscription",
    "line_items[0][price]":          priceId,
    "line_items[0][quantity]":       "1",
    "success_url":                   `${appUrl}/success?tier=${tierId}&session_id={CHECKOUT_SESSION_ID}`,
    "cancel_url":                    `${appUrl}/`,
    "allow_promotion_codes":         "true",
    "billing_address_collection":    "auto",
  }

  // Only add coupon when env var is set AND non-empty
  const coupon = process.env.STRIPE_BETA_COUPON
  if (coupon && coupon.trim() && coupon !== "FOUNDING50_COUPON_ID_HERE") {
    params["discounts[0][coupon]"] = coupon.trim()
    console.log("[SIXAB Checkout] Applying coupon:", coupon)
  }

  console.log("[SIXAB Checkout] Params:", JSON.stringify(params))

  // ── 5. Call Stripe ──────────────────────────────────────────────────────
  let response
  try {
    response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization":  `Bearer ${stripeKey}`,
        "Content-Type":   "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params).toString(),
    })
  } catch (networkErr) {
    console.error("[SIXAB Checkout] Network error:", networkErr.message)
    return res.status(502).json({ error: "Could not reach Stripe — check your network and retry." })
  }

  // ── 6. Handle Stripe response ───────────────────────────────────────────
  let session
  try {
    session = await response.json()
  } catch {
    return res.status(500).json({ error: "Invalid response from Stripe." })
  }

  if (!response.ok) {
    const errMsg = session?.error?.message || `Stripe error ${response.status}`
    console.error("[SIXAB Checkout] Stripe error:", response.status, errMsg, JSON.stringify(session?.error))
    return res.status(500).json({ error: errMsg })
  }

  if (!session.url) {
    return res.status(500).json({ error: "Stripe returned no checkout URL." })
  }

  console.log("[SIXAB Checkout] Session created:", session.id)
  return res.status(200).json({ url: session.url, sessionId: session.id })
}
