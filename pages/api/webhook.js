// pages/api/webhook.js
// Stripe webhook handler — processes payment events
// Set webhook endpoint in Stripe Dashboard → Developers → Webhooks
// Endpoint URL: https://your-app.vercel.app/api/webhook

export const config = {
  api: { bodyParser: false }, // Must be raw for signature verification
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on("data", chunk => chunks.push(chunk))
    req.on("end", () => resolve(Buffer.concat(chunks)))
    req.on("error", reject)
  })
}

async function verifyStripeSignature(rawBody, signature, secret) {
  // Manual HMAC-SHA256 verification without Stripe SDK
  const crypto = await import("crypto")
  const elements = signature.split(",")
  const timestamp = elements.find(e => e.startsWith("t="))?.split("=")[1]
  const v1 = elements.find(e => e.startsWith("v1="))?.split("=")[1]

  if (!timestamp || !v1) return false

  const tolerance = 300 // 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > tolerance) return false

  const payload = `${timestamp}.${rawBody}`
  const expectedSig = crypto
    .default.createHmac("sha256", secret)
    .update(payload)
    .digest("hex")

  return crypto.default.timingSafeEqual(
    Buffer.from(v1, "hex"),
    Buffer.from(expectedSig, "hex")
  )
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("[SIXAB Webhook] STRIPE_WEBHOOK_SECRET not set")
    return res.status(500).json({ error: "Webhook secret not configured" })
  }

  const rawBody = await getRawBody(req)
  const signature = req.headers["stripe-signature"]

  let verified = false
  try {
    verified = await verifyStripeSignature(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error("[SIXAB Webhook] Signature verification error:", err.message)
    return res.status(400).json({ error: "Signature verification failed" })
  }

  if (!verified) {
    console.error("[SIXAB Webhook] Invalid signature")
    return res.status(400).json({ error: "Invalid webhook signature" })
  }

  let event
  try {
    event = JSON.parse(rawBody.toString())
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON" })
  }

  console.log(`[SIXAB Webhook] Event: ${event.type}`)

  // ── Handle events ─────────────────────────────────────────────────────
  switch (event.type) {

    case "checkout.session.completed": {
      const session = event.data.object
      const customerId = session.customer
      const customerEmail = session.customer_details?.email
      const subscriptionId = session.subscription
      const amountTotal = session.amount_total // in cents
      const currency = session.currency

      console.log(`[SIXXAB] ✅ New subscriber: ${customerEmail} | $${amountTotal/100} ${currency} | Sub: ${subscriptionId}`)

      // TODO: Save to Supabase
      // await supabase.from('subscribers').upsert({ email: customerEmail, stripe_customer_id: customerId, subscription_id: subscriptionId, status: 'active' })

      // TODO: Send welcome email via Resend
      // await sendWelcomeEmail(customerEmail)

      // TODO: Add to Notion CRM
      // await addToNotionCRM({ email: customerEmail, tier: session.metadata?.tierId })

      break
    }

    case "customer.subscription.updated": {
      const sub = event.data.object
      const status = sub.status // active, past_due, canceled, etc.
      console.log(`[SIXXAB] 🔄 Subscription updated: ${sub.id} → ${status}`)
      // TODO: Update user status in DB
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object
      console.log(`[SIXXAB] ❌ Subscription cancelled: ${sub.id}`)
      // TODO: Downgrade user access, trigger win-back email
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object
      console.log(`[SIXXAB] ⚠️ Payment failed: ${invoice.customer_email}`)
      // TODO: Send dunning email, notify user to update card
      break
    }

    case "invoice.paid": {
      const invoice = event.data.object
      console.log(`[SIXXAB] 💰 Invoice paid: ${invoice.customer_email} | $${invoice.amount_paid/100}`)
      // TODO: Log MRR event, update billing history
      break
    }

    default:
      console.log(`[SIXAB Webhook] Unhandled event type: ${event.type}`)
  }

  return res.status(200).json({ received: true })
}
