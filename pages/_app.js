import { useEffect, useState } from "react"
import { useRouter } from "next/router"

const PROTECTED = ["/coach", "/agents", "/agent", "/success", "/orchestrator", "/roadmap", "/crm"]

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const path = router.pathname
    const isProtected = PROTECTED.some(p => path.startsWith(p))
    if (isProtected) {
      try {
        const stored = sessionStorage.getItem("sixxab_user")
        if (!stored) {
          router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`)
          return
        }
        JSON.parse(stored)
        setAllowed(true)
      } catch {
        sessionStorage.removeItem("sixxab_user")
        router.replace("/login")
        return
      }
    } else {
      setAllowed(true)
    }
    setChecked(true)
  }, [router.pathname, router.asPath, router])

  if (!checked || !allowed) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0A0E1A"}}>
        <div style={{textAlign:"center"}}>
          <div style={{width:32,height:32,border:"2px solid rgba(239,159,39,.3)",borderTopColor:"#EF9F27",borderRadius:"50%",margin:"0 auto 12px",animation:"spin .8s linear infinite"}}/>
          <div style={{color:"rgba(245,245,240,.4)",fontSize:13,fontFamily:"sans-serif"}}>Loading SIXXAB…</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return <Component {...pageProps} />
}
