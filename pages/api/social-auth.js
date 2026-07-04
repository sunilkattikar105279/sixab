// pages/api/social/auth.js — OAuth initiation
// HARDCODED BASE URL — never reads from env to avoid www mismatch
export default function handler(req, res) {
  const { platform, redirect = "/social", _probe } = req.query
  const BASE  = "https://www.startupsinabox.com"
  const STATE = Buffer.from(JSON.stringify({ platform, redirect, ts: Date.now() })).toString("base64")

  const CALLBACKS = {
    linkedin:  `${BASE}/api/linkedin-callback`,
    twitter:   `${BASE}/api/twitter-callback`,
    facebook:  `${BASE}/api/facebook-callback`,
    instagram: `${BASE}/api/facebook-callback`,
    youtube:   `${BASE}/api/youtube-callback`,
  }

  const URLS = {
    linkedin: () => `https://www.linkedin.com/oauth/v2/authorization?${new URLSearchParams({
      response_type: "code",
      client_id:     process.env.LINKEDIN_CLIENT_ID,
      redirect_uri:  CALLBACKS.linkedin,
      state:         STATE,
      scope:         "openid profile email w_member_social",
    })}`,
    twitter: () => `https://twitter.com/i/oauth2/authorize?${new URLSearchParams({
      response_type:         "code",
      client_id:             process.env.TWITTER_CLIENT_ID,
      redirect_uri:          CALLBACKS.twitter,
      scope:                 "tweet.read tweet.write users.read offline.access",
      state:                 STATE,
      code_challenge:        "challenge",
      code_challenge_method: "plain",
    })}`,
    facebook: () => `https://www.facebook.com/v19.0/dialog/oauth?${new URLSearchParams({
      client_id:     process.env.FACEBOOK_APP_ID,
      redirect_uri:  CALLBACKS.facebook,
      // Only use basic scopes that don't require app review
      // pages_manage_posts requires Facebook review submission
      scope:         "public_profile,email,pages_show_list,pages_read_engagement",
      state:         STATE,
      response_type: "code",
    })}`,
    instagram: () => `https://www.facebook.com/v19.0/dialog/oauth?${new URLSearchParams({
      client_id:     process.env.FACEBOOK_APP_ID,
      redirect_uri:  CALLBACKS.instagram,
      scope:         "public_profile,email,pages_show_list,instagram_basic",
      state:         STATE,
      response_type: "code",
    })}`,
    youtube: () => `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      redirect_uri:  CALLBACKS.youtube,
      response_type: "code",
      scope:         "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.profile",
      access_type:   "offline",
      prompt:        "consent",
      state:         STATE,
    })}`,
  }

  const urlFn = URLS[platform]
  if (!urlFn) return res.status(400).json({ error: `Unknown platform: ${platform}` })

  const ENV_REQUIRED = {
    linkedin:"LINKEDIN_CLIENT_ID", twitter:"TWITTER_CLIENT_ID",
    facebook:"FACEBOOK_APP_ID", instagram:"FACEBOOK_APP_ID", youtube:"GOOGLE_CLIENT_ID"
  }
  const envKey = ENV_REQUIRED[platform]
  if (!process.env[envKey]) {
    return res.status(500).json({ error: `${platform} not configured — add ${envKey} to Vercel env vars`, callback: CALLBACKS[platform] })
  }

  if (_probe) return res.status(200).json({ ok:true, platform, callback: CALLBACKS[platform] })

  res.redirect(302, urlFn())
}
