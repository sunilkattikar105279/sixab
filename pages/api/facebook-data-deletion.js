// pages/api/facebook-data-deletion.js
// Facebook Data Deletion Callback URL
// Facebook sends a signed POST request — we return a status URL
// Register as: https://www.startupsinabox.com/api/facebook-data-deletion

import crypto from "crypto"

export default function handler(req, res) {
  if (req.method === "GET") {
    // Confirm the endpoint is live
    return res.status(200).json({
      status: "active",
      message: "SIXXAB AI Facebook Data Deletion Callback",
      instructions: "https://www.startupsinabox.com/data-deletion"
    })
  }

  if (req.method !== "POST") return res.status(405).end()

  try {
    const { signed_request } = req.body ?? {}

    if (!signed_request) {
      return res.status(400).json({ error: "Missing signed_request" })
    }

    // Verify the signed request from Facebook
    const [encodedSig, payload] = signed_request.split(".")
    const secret = process.env.FACEBOOK_APP_SECRET || ""

    const sig = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")

    if (sig !== encodedSig) {
      console.error("[Facebook deletion] Invalid signature")
      return res.status(400).json({ error: "Invalid signature" })
    }

    // Decode the payload
    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g,"+").replace(/_/g,"/"), "base64").toString("utf8")
    )

    const userId      = data.user_id || "unknown"
    const confirmCode = `del_${userId}_${Date.now()}`

    // SIXXAB AI stores no server-side user data — tokens are HttpOnly cookies
    // Nothing to delete on our side. Confirm immediately.
    console.log(`[Facebook deletion] Request for user ${userId} — no server data held`)

    // Facebook requires this exact response format
    return res.status(200).json({
      url:            `https://www.startupsinabox.com/data-deletion?code=${confirmCode}`,
      confirmation_code: confirmCode,
    })

  } catch (e) {
    console.error("[Facebook deletion callback error]", e.message)
    return res.status(200).json({
      url:            "https://www.startupsinabox.com/data-deletion",
      confirmation_code: `err_${Date.now()}`,
    })
  }
}

export const config = { api: { bodyParser: { type: "application/x-www-form-urlencoded" } } }
