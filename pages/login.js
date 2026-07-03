// pages/login.js — SIXXAB AI · Sign in / Sign up
import Head from "next/head"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"

const N="#0A0E1A", AMBER="#EF9F27", CHALK="#F5F5F0"

export default function LoginPage() {
  const router = useRouter()
  const { redirect, plan } = router.query

  const [mode,    setMode]    = useState("login")
  const [email,   setEmail]   = useState("")
  const [pw,      setPw]      = useState("")
  const [name,    setName]    = useState("")
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState("")
  const [msg,     setMsg]     = useState("")
  const [showPw,  setShowPw]  = useState(false)

  // If already logged in, redirect
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("sb-") && k.endsWith("-auth-token"))
      if (keys.length) {
        const s = JSON.parse(localStorage.getItem(keys[0]) || "{}")
        if (s?.access_token) {
          router.replace(redirect || "/")
        }
      }
    } catch {}
  }, [])

  async function submit(e) {
    e.preventDefault()
    setErr(""); setMsg("")
    if (!email.trim()) { setErr("Email is required"); return }
    if (mode !== "forgot" && !pw) { setErr("Password is required"); return }
    if (mode === "signup" && pw.length < 6) { setErr("Password must be at least 6 characters"); return }
    setLoading(true)

    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, identifier: email.trim().toLowerCase(), password: pw, name: name.trim() })
      })
      const d = await r.json()

      if (!r.ok || d.error) {
        setErr(d.error || "Something went wrong")
        setLoading(false)
        return
      }

      if (mode === "forgot") {
        setMsg(d.message || "Reset link sent — check your email")
        setLoading(false)
        return
      }

      // Save session to localStorage (Supabase format)
      if (d.session || d.access_token) {
        const session = d.session || d
        const SB_URL = session.user?.aud || ""
        // Find the right localStorage key pattern
        const projectRef = new URL(window.location.href).hostname === "localhost"
          ? "localhost"
          : (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace("https://", "").replace(".supabase.co", "")

        const storageKey = `sb-${projectRef}-auth-token`
        localStorage.setItem(storageKey, JSON.stringify({
          access_token:  session.access_token,
          refresh_token: session.refresh_token,
          expires_in:    session.expires_in || 3600,
          expires_at:    Math.floor(Date.now()/1000) + (session.expires_in || 3600),
          token_type:    "bearer",
          user:          d.user || session.user,
        }))
      }

      // Redirect after login
      const dest = redirect || (plan ? `/billing?plan=${plan}` : "/")
      router.replace(dest)

    } catch(e) {
      setErr("Network error: " + e.message)
      setLoading(false)
    }
  }

  return (<>
    <Head>
      <title>SIXXAB AI — {mode==="signup"?"Sign up":mode==="forgot"?"Reset password":"Sign in"}</title>
    </Head>
    <style>{`
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:${N};font-family:'Inter',system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
      .inp{width:100%;padding:12px 14px;border:1.5px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.06);color:${CHALK};font-size:14px;font-family:inherit;outline:none;transition:border .15s}
      .inp:focus{border-color:${AMBER}}
      .inp::placeholder{color:rgba(245,245,240,.3)}
      .btn{width:100%;padding:13px;border-radius:10px;font-size:15px;font-weight:700;border:none;cursor:pointer;font-family:inherit;transition:all .15s}
      .btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.3)}
      .btn:disabled{opacity:.6;cursor:not-allowed}
      @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    `}</style>

    <div style={{width:"100%",maxWidth:420,animation:"fadeUp .3s ease"}}>
      {/* Logo */}
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:8}}>
          <svg width={36} height={36} viewBox="0 0 72 72" fill="none">
            <rect x={2} y={2} width={68} height={68} rx={14} stroke={AMBER} strokeWidth={3}/>
            <text x={7}  y={52} fontFamily="Georgia,serif" fontSize={44} fill="none" stroke={AMBER} strokeWidth={1.5}>S</text>
            <text x={34} y={54} fontFamily="Georgia,serif" fontSize={50} fill="none" stroke={AMBER} strokeWidth={1.5} fontStyle="italic">X</text>
          </svg>
          <span style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:CHALK}}>SIXXAB <span style={{color:AMBER,fontStyle:"italic"}}>AI</span></span>
        </div>
        <div style={{fontSize:13,color:"rgba(245,245,240,.4)"}}>Your business runs itself.</div>
      </div>

      {/* Card */}
      <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,padding:"28px 28px 24px"}}>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:CHALK,marginBottom:4}}>
          {mode==="signup" ? "Create account" : mode==="forgot" ? "Reset password" : "Welcome back"}
        </h1>
        <p style={{fontSize:13,color:"rgba(245,245,240,.4)",marginBottom:22}}>
          {mode==="signup" ? "14-day free trial · No credit card required" : mode==="forgot" ? "We'll email you a reset link" : "Sign in to your SIXXAB AI workspace"}
        </p>

        {err && <div style={{padding:"10px 14px",borderRadius:9,background:"rgba(220,38,38,.15)",border:"1px solid rgba(220,38,38,.3)",color:"#FCA5A5",fontSize:13,marginBottom:16}}>{err}</div>}
        {msg && <div style={{padding:"10px 14px",borderRadius:9,background:"rgba(29,158,117,.15)",border:"1px solid rgba(29,158,117,.3)",color:"#6EE7B7",fontSize:13,marginBottom:16}}>{msg}</div>}

        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:12}}>
          {mode==="signup" && (
            <div>
              <label style={{fontSize:11,fontWeight:700,color:"rgba(245,245,240,.4)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5}}>Full name</label>
              <input className="inp" type="text" placeholder="Sunil Kattikar" value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/>
            </div>
          )}

          <div>
            <label style={{fontSize:11,fontWeight:700,color:"rgba(245,245,240,.4)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5}}>Email</label>
            <input className="inp" type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/>
          </div>

          {mode !== "forgot" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <label style={{fontSize:11,fontWeight:700,color:"rgba(245,245,240,.4)",textTransform:"uppercase",letterSpacing:".08em"}}>Password</label>
                {mode==="login" && <button type="button" onClick={()=>{setMode("forgot");setErr("");setMsg("")}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:AMBER,fontFamily:"inherit"}}>Forgot?</button>}
              </div>
              <div style={{position:"relative"}}>
                <input className="inp" type={showPw?"text":"password"} placeholder={mode==="signup"?"Min 6 characters":"Your password"} value={pw} onChange={e=>setPw(e.target.value)} autoComplete={mode==="login"?"current-password":"new-password"} style={{paddingRight:44}} required/>
                <button type="button" onClick={()=>setShowPw(s=>!s)}
                  style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(245,245,240,.4)",fontSize:16,padding:0}}>
                  {showPw?"🙈":"👁"}
                </button>
              </div>
            </div>
          )}

          <button className="btn" type="submit" disabled={loading}
            style={{marginTop:4,background:AMBER,color:N}}>
            {loading ? "Please wait…" : mode==="signup" ? "Create account →" : mode==="forgot" ? "Send reset link →" : "Sign in →"}
          </button>
        </form>

        {/* Mode toggle */}
        <div style={{marginTop:18,textAlign:"center",fontSize:13,color:"rgba(245,245,240,.4)"}}>
          {mode==="login" && <>Don't have an account?{" "}<button onClick={()=>{setMode("signup");setErr("");setMsg("")}} style={{background:"none",border:"none",cursor:"pointer",color:AMBER,fontWeight:600,fontFamily:"inherit",fontSize:13}}>Sign up free</button></>}
          {mode==="signup" && <>Already have an account?{" "}<button onClick={()=>{setMode("login");setErr("");setMsg("")}} style={{background:"none",border:"none",cursor:"pointer",color:AMBER,fontWeight:600,fontFamily:"inherit",fontSize:13}}>Sign in</button></>}
          {mode==="forgot" && <button onClick={()=>{setMode("login");setErr("");setMsg("")}} style={{background:"none",border:"none",cursor:"pointer",color:AMBER,fontFamily:"inherit",fontSize:13}}>← Back to sign in</button>}
        </div>
      </div>

      {/* Trial note */}
      {mode==="signup" && (
        <div style={{textAlign:"center",marginTop:16,fontSize:12.5,color:"rgba(245,245,240,.25)"}}>
          By signing up you agree to our terms of service.<br/>
          14-day free trial · Cancel anytime.
        </div>
      )}
    </div>
  </>)
}
