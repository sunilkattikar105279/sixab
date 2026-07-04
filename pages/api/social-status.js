export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end()
  return res.status(200).json({
    platforms: {
      linkedin: { configured: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) },
      facebook: { configured: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET), appId: process.env.FACEBOOK_APP_ID || null },
      twitter:  { configured: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) },
      youtube:  { configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) },
    },
    redirectUris: {
      linkedin: "https://www.startupsinabox.com/api/linkedin-callback",
      facebook: "https://www.startupsinabox.com/api/facebook-callback",
      twitter:  "https://www.startupsinabox.com/api/twitter-callback",
      youtube:  "https://www.startupsinabox.com/api/youtube-callback",
    },
    ok: true
  })
}
