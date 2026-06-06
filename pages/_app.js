import { useEffect, useState } from "react"
import { useRouter }           from "next/router"
import Script                  from "next/script"
import SupportWidget            from "../components/SupportWidget"

const PROTECTED = [
  "/coach", "/agents", "/agent", "/success",
  "/orchestrator", "/roadmap", "/crm",
  "/niche-validator", "/verticals", "/investor", "/studio", "/leads", "/proposal", "/social", "/calendar",
]

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ""

export default function App({ Component, pageProps }) {
  const router  = useRouter()
  const [ready, setReady]   = useState(false)
  const [allowed, setAllowed] = useState(false)

  /* ── Auth guard ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const path = router.pathname
    const isProtected = PROTECTED.some(p => path === p || path.startsWith(p + "/"))
    if (isProtected) {
      try {
        const stored = sessionStorage.getItem("sixxab_user")
        if (!stored) {
          router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`)
          return
        }
        JSON.parse(stored)  // validate JSON
        setAllowed(true)
      } catch {
        sessionStorage.removeItem("sixxab_user")
        router.replace("/login")
        return
      }
    } else {
      setAllowed(true)
    }
    setReady(true)
  }, [router.pathname])

  /* ── GA pageview on route change ─────────────────────────────────────────── */
  useEffect(() => {
    if (!GA_ID) return
    const handleRoute = (url) => {
      if (typeof window.gtag === "function") {
        window.gtag("config", GA_ID, { page_path: url })
      }
    }
    router.events.on("routeChangeComplete", handleRoute)
    return () => router.events.off("routeChangeComplete", handleRoute)
  }, [router.events])

  if (!ready || !allowed) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
                    justifyContent:"center", background:"#0A0E1A" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:28, height:28, border:"2px solid rgba(239,159,39,.25)",
                        borderTopColor:"#EF9F27", borderRadius:"50%",
                        margin:"0 auto 10px", animation:"spin .7s linear infinite" }}/>
          <div style={{ color:"rgba(245,245,240,.3)", fontSize:11,
                        fontFamily:"monospace", letterSpacing:".1em" }}>
            LOADING SIXXAB AI…
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <>
      {/* Google Analytics — only loads when GA_ID env var is set */}
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                  strategy="afterInteractive"/>
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}</Script>
        </>
      )}
      <Component {...pageProps}/>
      <SupportWidget/>
    </>
  )
}
