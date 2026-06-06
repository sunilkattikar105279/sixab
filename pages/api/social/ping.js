// pages/api/social/ping.js — health check, delete after confirming routes work
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    routes: [
      "/api/social/auth",
      "/api/social/status",
      "/api/social/publish",
      "/api/social/disconnect",
      "/api/social/callback/linkedin",
      "/api/social/callback/twitter",
      "/api/social/callback/facebook",
      "/api/social/callback/youtube",
    ],
    env: {
      LINKEDIN_CLIENT_ID:  !!process.env.LINKEDIN_CLIENT_ID,
      LINKEDIN_CLIENT_SECRET: !!process.env.LINKEDIN_CLIENT_SECRET,
      FACEBOOK_APP_ID:     !!process.env.FACEBOOK_APP_ID,
      TWITTER_CLIENT_ID:   !!process.env.TWITTER_CLIENT_ID,
      GOOGLE_CLIENT_ID:    !!process.env.GOOGLE_CLIENT_ID,
      APP_URL:             process.env.NEXT_PUBLIC_APP_URL || "(not set)",
    }
  })
}
