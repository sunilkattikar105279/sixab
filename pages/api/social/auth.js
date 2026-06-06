// pages/api/social/auth.js — OAuth initiation for all platforms
// GET /api/social/auth?platform=linkedin&action=connect
export default function handler(req, res) {
  const { platform, action = "connect", redirect = "/social" } = req.query
  const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://startupsinabox.com"
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
      // Twitter OAuth 2.0 PKCE
      const p = new URLSearchParams({
        response_type:         "code",
        client_id:             process.env.TWITTER_CLIENT_ID || "",
        redirect_uri:          `${BASE}/api/twitter-callback`,
        scope:                 "tweet.read tweet.write users.read offline.access",
        state:                 STATE,
        code_challenge:        "challenge", // simplified — full PKCE in production
        code_challenge_method: "plain",
      })
      return `https://twitter.com/i/oauth2/authorize?${p}`
    },
    facebook: () => {
      const p = new URLSearchParams({
        client_id:    process.env.FACEBOOK_APP_ID || "",
        redirect_uri: `${BASE}/api/facebook-callback`,
        scope:        "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,pages_show_list",
        state:        STATE,
        response_type:"code",
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
    instagram: () => {
      // Instagram uses Facebook OAuth — same flow, different scope handling
      const p = new URLSearchParams({
        client_id:    process.env.FACEBOOK_APP_ID || "",
        redirect_uri: `${BASE}/api/facebook-callback`,
        scope:        "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement",
        state:        STATE,
        response_type:"code",
      })
      return `https://www.facebook.com/v19.0/dialog/oauth?${p}`
    },
  }

  // Probe request — just check if route exists and env vars are set
  const { _probe } = req.query
  const urlFn = OAUTH_URLS[platform]
  if (!urlFn) return res.status(400).json({ error: `Unknown platform: ${platform}` })

  const missingEnv = {
    linkedin:  !process.env.LINKEDIN_CLIENT_ID,
    twitter:   !process.env.TWITTER_CLIENT_ID,
    facebook:  !process.env.FACEBOOK_APP_ID,
    youtube:   !process.env.GOOGLE_CLIENT_ID,
    instagram: !process.env.FACEBOOK_APP_ID,
  }[platform]

  if (missingEnv) {
    return res.status(500).json({
      error: `${platform} OAuth not configured`,
      setup: `Add ${platform.toUpperCase()}_CLIENT_ID (or FACEBOOK_APP_ID for Meta) to Vercel environment variables`,
      docs:  `/social#setup`
    })
  }

  // If this was just a probe, confirm the route is alive
  if (_probe) return res.status(200).json({ ok: true, platform })
  res.redirect(302, urlFn())
}
