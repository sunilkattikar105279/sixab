// pages/sitemap.xml.js — Dynamic sitemap for SEO
// Generates /sitemap.xml automatically on every request
const BASE = "https://startupsinabox.com"

const STATIC_ROUTES = [
  { path: "/",               priority: "1.0",  freq: "weekly"  },
  { path: "/niche-validator",priority: "0.9",  freq: "weekly"  },
  { path: "/orchestrator",   priority: "0.9",  freq: "weekly"  },
  { path: "/verticals",      priority: "0.85", freq: "weekly"  },
  { path: "/calendar", priority: "0.8", freq: "weekly" },
  { path: "/social",  priority: "0.8", freq: "weekly" },
  { path: "/studio",   priority: "0.85", freq: "weekly"  },
  { path: "/leads",    priority: "0.85", freq: "weekly"  },
  { path: "/proposal", priority: "0.85", freq: "weekly"  },
  { path: "/investor",  priority: "0.8",  freq: "weekly"  },
  { path: "/validate", priority: "0.9",  freq: "monthly"  },
  { path: "/waitlist", priority: "0.95", freq: "weekly"   },
  { path: "/mindset",  priority: "0.85", freq: "monthly" },
  { path: "/runbook",        priority: "0.8",  freq: "monthly" },
  { path: "/agents",         priority: "0.8",  freq: "weekly"  },
  { path: "/crm",            priority: "0.75", freq: "weekly"  },
  { path: "/roadmap",        priority: "0.75", freq: "monthly" },
  { path: "/coach",          priority: "0.7",  freq: "monthly" },
  { path: "/discovery",      priority: "0.85", freq: "monthly" },
  { path: "/contact",        priority: "0.65", freq: "monthly" },
  { path: "/terms",          priority: "0.4",  freq: "yearly"  },
  { path: "/privacy",        priority: "0.4",  freq: "yearly"  },
]

function sitemap() {
  const today = new Date().toISOString().split("T")[0]
  const urls = STATIC_ROUTES.map(r => `
  <url>
    <loc>${BASE}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.freq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

export default function SitemapPage() { return null }

export function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/xml; charset=utf-8")
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600")
  res.write(sitemap())
  res.end()
  return { props: {} }
}
