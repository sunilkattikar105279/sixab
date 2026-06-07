// pages/api/social/debug-facebook.js — temporary debug endpoint
// Shows exactly what URL would be sent to Facebook
// DELETE after fixing
export default function handler(req, res) {
  const APP_ID = process.env.FACEBOOK_APP_ID || ""
  const BASE   = "https://www.startupsinabox.com"

  const params = new URLSearchParams({
    client_id:     APP_ID,
    redirect_uri:  `${BASE}/api/facebook-callback`,
    scope:         "pages_manage_posts,pages_read_engagement,pages_show_list",
    state:         "test",
    response_type: "code",
  })

  const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params}`

  res.status(200).json({
    app_id_value:    APP_ID,
    app_id_length:   APP_ID.length,
    app_id_is_numeric: /^\d+$/.test(APP_ID),
    app_id_trimmed:  APP_ID.trim() === APP_ID,
    redirect_uri:    `${BASE}/api/facebook-callback`,
    full_oauth_url:  oauthUrl,
  })
}
