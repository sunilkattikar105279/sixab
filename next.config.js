/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Security headers on all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",          value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ]
  },

  // NOTE: www redirect is handled by Vercel domain settings directly.
  // Do NOT add a redirect here — Vercel's domain panel already handles
  // www ↔ non-www, and a Next.js redirect on top creates a redirect loop.
}

module.exports = nextConfig
