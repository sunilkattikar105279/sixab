// pages/_app.js — SIXXAB AI App Shell
// Auth guard uses Supabase localStorage session (sb-{project}-auth-token)
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Script from "next/script"
import SupportWidget from "../components/SupportWidget"

// Pages that require login
const PROTECTED = [
  "/agents", "/crm", "/leads", "/social", "/studio",
  "/retention", "/calendar", "/website-builder", "/proposal",
  "/niche-validator", "/seo", "/invoice", "/email-automator",
  "/analytics", "/reviews", "/profile", "/admin", "/billing",
  "/runbook", "/orchestrator",
]

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ""

function getSession() {
  try {
    const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    if (!SB_URL) return null
    const ref = SB_URL.replace("https://","").replace(".supabase.co","")
    const raw = localStorage.getItem(`sb-${ref}-auth-token`)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (!s?.access_token) return null
    // Check expiry
    if (s.expires_at && Math.floor(Date.now()/1000) > s.expires_at) {
      localStorage.removeItem(`sb-${ref}-auth-token`)
      return null
    }
    return s
  } catch { return null }
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const path = router.pathname
    const isProtected = PROTECTED.some(p => path === p || path.startsWith(p + "/"))

    if (isProtected) {
      const session = getSession()
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`)
        return
      }
    }
    setReady(true)
  }, [router.pathname])

  // GA pageview tracking
  useEffect(() => {
    if (!GA_ID) return
    const handle = (url) => {
      if (typeof window.gtag === "function") window.gtag("config", GA_ID, { page_path: url })
    }
    router.events.on("routeChangeComplete", handle)
    return () => router.events.off("routeChangeComplete", handle)
  }, [router.events])

  if (!ready) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0A0E1A"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:28,height:28,border:"2px solid rgba(239,159,39,.2)",borderTopColor:"#EF9F27",borderRadius:"50%",margin:"0 auto 10px",animation:"spin .7s linear infinite"}}/>
        <div style={{color:"rgba(245,245,240,.25)",fontSize:11,fontFamily:"monospace",letterSpacing:".1em"}}>SIXXAB AI</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (<>
    {GA_ID && (<>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive"/>
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer=window.dataLayer||[];
        function gtag(){dataLayer.push(arguments);}
        gtag('js',new Date());
        gtag('config','${GA_ID}',{page_path:window.location.pathname});
      `}</Script>
    </>)}
    <Component {...pageProps}/>
    <SupportWidget/>
  </>)
}
