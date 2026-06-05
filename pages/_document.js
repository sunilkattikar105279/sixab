import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8"/>
        <meta name="theme-color" content="#0A0E1A"/>
        <meta name="author" content="SIXXAB AI"/>

        {/* ── Google Fonts — loaded ONCE here, not per page ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

        {/* ── Tabler Icons CDN ── */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.x/dist/tabler-icons.min.css"/>

        {/* ── Favicon suite ── */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
        <link rel="alternate icon" href="/favicon.ico"/>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
        <link rel="manifest" href="/site.webmanifest"/>

        {/* ── Primary SEO ── */}
        <meta name="description" content="SIXXAB AI — Autonomous Business Platform. Your business runs itself. Validate your niche, launch in 48 hours, run with 18 AI agents. From $49.50/mo."/>
        <meta name="keywords" content="SIXXAB AI, autonomous business platform, AI startup advisor, niche validator, founder tools, Dallas startup, SaaS launch, business automation"/>
        <meta name="robots" content="index, follow"/>

        {/* ── Open Graph — LinkedIn + Facebook share preview ── */}
        <meta property="og:type" content="website"/>
        <meta property="og:site_name" content="SIXXAB AI"/>
        <meta property="og:title" content="SIXXAB AI — Your business runs itself."/>
        <meta property="og:description" content="Set one goal. 18 AI agents run in parallel. One numbered action plan. Validate your niche, launch in 48 hours, scale autonomously. From $49.50/mo."/>
        <meta property="og:url" content="https://www.startupsinabox.com"/>
        <meta property="og:image" content="https://www.startupsinabox.com/og.png"/>
        <meta property="og:image:width" content="1200"/>
        <meta property="og:image:height" content="630"/>
        <meta property="og:image:alt" content="SIXXAB AI — Autonomous Business Platform"/>
        <meta property="og:locale" content="en_US"/>

        {/* ── Twitter / X Card ── */}
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:site" content="@SIXXAB"/>
        <meta name="twitter:title" content="SIXXAB AI — Your business runs itself."/>
        <meta name="twitter:description" content="Set one goal. 18 AI agents run. One numbered action plan. Validate, launch, scale. From $49.50/mo."/>
        <meta name="twitter:image" content="https://www.startupsinabox.com/og.png"/>

        {/* ── Canonical ── */}
        <link rel="canonical" href="https://www.startupsinabox.com"/>

        {/* ── Global base styles — no per-page duplication ── */}
        <style>{`
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          html{scroll-behavior:smooth}
          body{font-family:'Inter','Plus Jakarta Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;letter-spacing:-0.01em}
          h1,h2,h3{letter-spacing:-0.03em}
          strong{font-weight:600}
          ::-webkit-scrollbar{width:3px}
          ::-webkit-scrollbar-thumb{background:#EF9F27;border-radius:2px}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
          @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
          .fu{animation:fadeUp .45s ease both}
          .d1{animation-delay:.05s}.d2{animation-delay:.13s}.d3{animation-delay:.21s}.d4{animation-delay:.29s}.d5{animation-delay:.37s}
          .pulse{animation:pulse 1.8s infinite}
          .si{animation:slideIn .3s ease both}
        `}</style>
      </Head>
      <body>
        <Main/>
        <NextScript/>
      </body>
    </Html>
  )
}
