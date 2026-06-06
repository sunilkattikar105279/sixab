// pages/api/social/auth.js — OAuth initiation for all platforms
export default function handler(req, res) {
  const { platform, redirect = "/social" } = req.query

  // Hardcoded — matches exactly what is registered in every developer console
  const BASE = "https://www.startupsinabox.com"
  const STATE = Buffer.from(JSON.stringify({ platform, redirect, ts: Date.now() })).toString("base64")

  const OAUTH_URLS = {
    linkedin: () => {
      const p = new URLSearchParams({
        response_type: "code",
        client_id:     process.env.LINKEDIN_CLIENT_ID || "",
        redirect_uri:  `${BASE}/api/linkedin-callback`,
        state:         STATE,
        scope:         "openid profile email w_member_social",
      })
      return `https://www.linkedin.com/oauth/v2/authorization?${p}`
    },
    twitter: () => {
      const p = new URLSearchParams({
        response_type:         "code",
        client_id:             process.env.TWITTER_CLIENT_ID || "",
        redirect_uri:          `${BASE}/api/twitter-callback`,
        scope:                 "tweet.read tweet.write users.read offline.access",
        state:                 STATE,
        code_challenge:        "challenge",
        code_challenge_method: "plain",
      })
      return `https://twitter.com/i/oauth2/authorize?${p}`
    },
    facebook: () => {
      const p = new URLSearchParams({
        client_id:     process.env.FACEBOOK_APP_ID || "",
        redirect_uri:  `${BASE}/api/facebook-callback`,
        scope:         "pages_manage_posts,pages_read_engagement,pages_show_list,instagram_basic,instagram_content_publish",
        state:         STATE,
        response_type: "code",
      })
      return `https://www.facebook.com/v19.0/dialog/oauth?${p}`
    },
    instagram: () => {
      const p = new URLSearchParams({
        client_id:     process.env.FACEBOOK_APP_ID || "",
        redirect_uri:  `${BASE}/api/facebook-callback`,
        scope:         "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement",
        state:         STATE,
        response_type: "code",
      })
      return `https://www.facebook.com/v19.0/dialog/oauth?${p}`
    },
    youtube: () => {
      const p = new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID || "",
        redirect_uri:  `${BASE}/api/youtube-callback`,
        response_type: "code",
        scope:         "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/userinfo.profile",
        access_type:   "offline",
        prompt:        "consent",
        state:         STATE,
      })
      return `https://accounts.google.com/o/oauth2/v2/auth?${p}`
    },
  }

  const urlFn = OAUTH_URLS[platform]
  if (!urlFn) return res.status(400).json({ error: `Unknown platform: ${platform}` })

  // Check env vars configured
  const ENV_CHECK = {
    linkedin:  "LINKEDIN_CLIENT_ID",
    twitter:   "TWITTER_CLIENT_ID",
    facebook:  "FACEBOOK_APP_ID",
    instagram: "FACEBOOK_APP_ID",
    youtube:   "GOOGLE_CLIENT_ID",
  }
  const envKey = ENV_CHECK[platform]
  if (!process.env[envKey]) {
    return res.status(500).json({
      error:   `${platform} not configured — add ${envKey} to Vercel environment variables`,
      redirect_uri: `${BASE}/api/${platform === "instagram" ? "facebook" : platform}-callback`,
    })
  }

  // Probe — just confirm route is alive and env is set
  if (req.query._probe) {
    return res.status(200).json({ ok: true, platform, redirect_uri: `${BASE}/api/${platform}-callback` })
  }

  res.redirect(302, urlFn())
}
