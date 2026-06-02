/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // www → non-www canonical redirect + HTTPS enforcement
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.startupsinabox.com" }],
        destination: "https://startupsinabox.com/:path*",
        permanent: true,
      },
    ]
  },

  // Security headers — professional standard
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
}

module.exports = nextConfig
