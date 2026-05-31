// pages/success.js
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

function SixabIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="69" height="69" rx="15" fill="none" stroke="#EF9F27" strokeWidth="3"/>
      <text x="7" y="54" fontFamily="'Bebas Neue', sans-serif" fontSize="48" fill="none" stroke="#EF9F27" strokeWidth="1.5" letterSpacing="-3" paintOrder="stroke">S</text>
      <text x="35" y="54" fontFamily="'Bebas Neue', sans-serif" fontSize="54" fill="none" stroke="#EF9F27" strokeWidth="1.5" fontStyle="italic" letterSpacing="-3" paintOrder="stroke">X</text>
    </svg>
  )
}

export default function Success() {
  const router = useRouter()
  const { tier } = router.query
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (count <= 0) { router.push("/coach"); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, router])

  const names = { starter: "Starter", pro: "Pro", agency: "Agency" }
  const name = names[tier] || "SIXXAB"

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Plus Jakarta Sans',sans-serif;background:#0A0E1A;min-height:100vh;display:flex;align-items:center;justify-content:center;color:#F5F5F0}`}</style>
      <div style={{ textAlign: "center", maxWidth: 460, padding: "48px 36px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(239,159,39,.2)", borderRadius: 20 }}>
        <SixabIcon size={56} />
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 2, margin: "20px 0 12px", color: "#EF9F27" }}>You're in the box.</h1>
        <p style={{ color: "rgba(245,245,240,.65)", fontSize: 15, marginBottom: 8 }}>Welcome to SIXXAB <strong style={{ color: "#EF9F27" }}>{name}</strong>.</p>
        <p style={{ color: "rgba(245,245,240,.5)", fontSize: 14, marginBottom: 28 }}>Your 50% founding member rate is locked in forever.<br />Redirecting to your AI coach in {count}s…</p>
        <button onClick={() => router.push("/coach")} style={{ padding: "13px 28px", borderRadius: 9, background: "#EF9F27", color: "#0A0E1A", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Open SIXXAB now →
        </button>
        <p style={{ marginTop: 18, fontSize: 12, color: "rgba(245,245,240,.3)" }}>Check your inbox for your welcome message.</p>
      </div>
    </>
  )
}
