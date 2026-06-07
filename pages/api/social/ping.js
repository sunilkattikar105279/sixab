// pages/api/social/ping.js — health check
export default function handler(req, res) {
  const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"
  res.status(200).json({
    ok: true,
    redirectUris: {
      linkedin:  `${BASE}/api/linkedin-callback`,
      twitter:   `${BASE}/api/twitter-callback`,
      facebook:  `${BASE}/api/facebook-callback`,
      instagram: `${BASE}/api/facebook-callback`,
      youtube:   `${BASE}/api/youtube-callback`,
    },
    env: {
      LINKEDIN_CLIENT_ID:     !!process.env.LINKEDIN_CLIENT_ID,
      LINKEDIN_CLIENT_SECRET: !!process.env.LINKEDIN_CLIENT_SECRET,
      FACEBOOK_APP_ID:        !!process.env.FACEBOOK_APP_ID,
      FACEBOOK_APP_SECRET:    !!process.env.FACEBOOK_APP_SECRET,
      TWITTER_CLIENT_ID:      !!process.env.TWITTER_CLIENT_ID,
      GOOGLE_CLIENT_ID:       !!process.env.GOOGLE_CLIENT_ID,
      APP_URL:                process.env.NEXT_PUBLIC_APP_URL || "(not set — defaulting to www.startupsinabox.com)",
    }
  })
}
