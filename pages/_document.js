import { Html, Head, Main, NextScript } from "next/document"
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />

        {/* ── Primary SEO ── */}
        <meta name="description" content="SIXXAB — Startups In eXponential A Box. AI-powered platform that takes any founder from idea to first revenue in 48 hours. Strategy, launch, marketing and sales — all in one box. From $14.50/mo." />
        <meta name="keywords" content="SIXXAB, startup in a box, AI startup advisor, founder tools, launch SaaS fast, startupsinabox, Dallas startup, idea to revenue" />
        <meta name="author" content="SIXXAB" />
        <meta name="theme-color" content="#0A0E1A" />

        {/* ── Open Graph — LinkedIn reads these for link preview ── */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SIXXAB" />
        <meta property="og:title" content="SIXXAB — Your Entire Startup. In One Box." />
        <meta property="og:description" content="From idea to first revenue in 48 hours. AI strategy advisor, 7-day launch sprint, marketing agent and revenue optimizer — all in one subscription. 50% off founding member rate." />
        <meta property="og:url" content="https://www.startupsinabox.com" />
        <meta property="og:image" content="https://www.startupsinabox.com/og.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="SIXXAB — Startups In eXponential A Box" />
        <meta property="og:locale" content="en_US" />

        {/* ── Twitter / X Card ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@SIXXAB" />
        <meta name="twitter:title" content="SIXXAB — Your Entire Startup. In One Box." />
        <meta name="twitter:description" content="From idea to first revenue in 48 hours. AI strategy, launch sprint, marketing and sales — all packed in one box. 50% off founding rate." />
        <meta name="twitter:image" content="https://www.startupsinabox.com/og.png" />

        {/* ── Canonical URL ── */}
        <link rel="canonical" href="https://www.startupsinabox.com" />
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  )
}
