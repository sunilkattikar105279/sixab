// pages/login.js — SIXXAB AI · Sign in / Sign up
import Head from "next/head"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"

const N="#0A0E1A", AMBER="#EF9F27", CHALK="#F5F5F0"

export default function LoginPage() {
  const router = useRouter()
  const [ready,   setReady]   = useState(false)
  const [mode,    setMode]    = useState("login")
  const [email,   setEmail]   = useState("")
  const [pw,      setPw]      = useState("")
  const [name,    setName]    = useState("")
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState("")
  const [msg,     setMsg]     = useState("")
  const [showPw,  setShowPw]  = useState(false)

  // Only check session AFTER router is ready — prevents premature redirect
  useEffect(() => {
    if (!router.isReady) return
    setReady(true)

    // Check for existing VALID session
    try {
      const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      if (!SB_URL) return // no supabase configured, don't redirect

      const projectRef = SB_URL.replace("https://","").replace(".supabase.co","")
      const key = `sb-${projectRef}-auth-token`
      const raw = localStorage.getItem(key)
      if (!raw) return

      const session = JSON.parse(raw)
      const token = session?.access_token
      const expiresAt = session?.expires_at // unix timestamp

      if (!token) return
      // Check not expired
      if (expiresAt && Math.floor(Date.now()/1000) > expiresAt) {
        // Expired — clear it
        localStorage.removeItem(key)
        return
      }

      // Valid session exists — redirect
      const dest = router.query.redirect || "/"
      router.replace(dest)
    } catch {
      // Parse error — ignore, show login
    }
  }, [router.isReady])

  async function submit(e) {
    e.preventDefault()
    setErr(""); setMsg("")

    if (!email.trim())                          { setErr("Email is required"); return }
    if (mode !== "forgot" && !pw)               { setErr("Password is required"); return }
    if (mode === "signup" && pw.length < 6)     { setErr("Password must be at least 6 characters"); return }
    if (mode === "signup" && pw !== pw)         {} // skip confirm for now

    setLoading(true)

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          identifier: email.trim().toLowerCase(),
          password: pw,
          name: name.trim(),
        })
      })

      let data
      try { data = await res.json() }
      catch { setErr("Server error — invalid response"); setLoading(false); return }

      if (!res.ok || data.error) {
        setErr(data.error || "Something went wrong")
        setLoading(false)
        return
      }

      // Forgot password — just show message
      if (mode === "forgot") {
        setMsg(data.message || "Reset link sent — check your email")
        setLoading(false)
        return
      }

      // Signup with email confirmation required
      if (mode === "signup" && data.needsConfirmation) {
        setMsg(data.message || "Check your email and click the confirmation link, then sign in.")
        setLoading(false)
        return
      }

      // Got a session — save it
      const token     = data.access_token  || data.session?.access_token
      const refresh   = data.refresh_token || data.session?.refresh_token
      const expiresIn = data.expires_in    || data.session?.expires_in || 3600
      const user      = data.user          || data.session?.user

      if (!token) {
        setErr("Login succeeded but no session returned. Check Supabase email confirmation settings.")
        setLoading(false)
        return
      }

      // Save session using the correct Supabase localStorage key
      const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const projectRef = SB_URL.replace("https://","").replace(".supabase.co","")
      const storageKey = `sb-${projectRef}-auth-token`

      const sessionObj = {
        access_token:  token,
        refresh_token: refresh,
        expires_in:    expiresIn,
        expires_at:    Math.floor(Date.now()/1000) + expiresIn,
        token_type:    "bearer",
        user:          user,
      }

      localStorage.setItem(storageKey, JSON.stringify(sessionObj))

      // Small delay to ensure localStorage is written
      await new Promise(r => setTimeout(r, 100))

      // Redirect
      const dest = router.query.redirect || (router.query.plan ? `/billing?plan=${router.query.plan}` : "/")
      router.replace(dest)

    } catch(e) {
      setErr("Network error: " + e.message)
      setLoading(false)
    }
  }

  // Don't render until router is ready (prevents flash)
  if (!ready) return (
    <div style={{background:N,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:28,height:28,border:`3px solid ${AMBER}33`,borderTopColor:AMBER,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (<>
    <Head>
      <title>SIXXAB AI — {mode==="signup"?"Sign up":mode==="forgot"?"Reset password":"Sign in"}</title>
    </Head>
    <style>{`
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:${N};font-family:'Inter',system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      .card{animation:fadeUp .3s ease;width:100%;max-width:420px}
      .inp{width:100%;padding:12px 14px;border:1.5px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.06);color:${CHALK};font-size:14px;font-family:inherit;outline:none;transition:border .15s;-webkit-appearance:none}
      .inp:focus{border-color:${AMBER};background:rgba(255,255,255,.08)}
      .inp::placeholder{color:rgba(245,245,240,.3)}
      .inp:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px rgba(255,255,255,.06) inset;-webkit-text-fill-color:${CHALK}}
      .btn{width:100%;padding:13px;border-radius:10px;font-size:15px;font-weight:700;border:none;cursor:pointer;font-family:inherit;transition:all .15s;letter-spacing:.01em}
      .btn:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(239,159,39,.35)}
      .btn:disabled{opacity:.55;cursor:not-allowed}
      .lbl{font-size:11px;font-weight:700;color:rgba(245,245,240,.4);text-transform:uppercase;letter-spacing:.09em;display:block;margin-bottom:6px}
      .link-btn{background:none;border:none;cursor:pointer;font-family:inherit;font-size:13.5px;color:${AMBER};font-weight:600;padding:0;text-decoration:underline;text-underline-offset:3px}
    `}</style>

    <div className="card">
      {/* Logo */}
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:6}}>
          <svg width={38} height={38} viewBox="0 0 72 72" fill="none">
            <rect x={2} y={2} width={68} height={68} rx={14} stroke={AMBER} strokeWidth={3}/>
            <text x={6}  y={52} fontFamily="Georgia,serif" fontSize={44} fill="none" stroke={AMBER} strokeWidth={1.5}>S</text>
            <text x={34} y={54} fontFamily="Georgia,serif" fontSize={50} fill="none" stroke={AMBER} strokeWidth={1.5} fontStyle="italic">X</text>
          </svg>
          <span style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:CHALK}}>SIXXAB <span style={{color:AMBER,fontStyle:"italic"}}>AI</span></span>
        </div>
        <div style={{fontSize:12.5,color:"rgba(245,245,240,.35)"}}>Your business runs itself.</div>
      </div>

      {/* Card */}
      <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,padding:"28px 28px 22px"}}>

        <h1 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:CHALK,marginBottom:4,letterSpacing:"-.01em"}}>
          {mode==="signup" ? "Create account" : mode==="forgot" ? "Reset password" : "Welcome back"}
        </h1>
        <p style={{fontSize:13,color:"rgba(245,245,240,.38)",marginBottom:20,lineHeight:1.5}}>
          {mode==="signup"  ? "14-day free trial · No credit card required"
          :mode==="forgot"  ? "We'll email you a password reset link"
          :"Sign in to your SIXXAB AI workspace"}
        </p>

        {/* Error */}
        {err && (
          <div style={{padding:"10px 14px",borderRadius:9,background:"rgba(220,38,38,.12)",border:"1px solid rgba(220,38,38,.25)",color:"#FCA5A5",fontSize:13.5,marginBottom:16,lineHeight:1.5}}>
            ⚠️ {err}
          </div>
        )}

        {/* Success message */}
        {msg && (
          <div style={{padding:"10px 14px",borderRadius:9,background:"rgba(29,158,117,.12)",border:"1px solid rgba(29,158,117,.25)",color:"#6EE7B7",fontSize:13.5,marginBottom:16,lineHeight:1.5}}>
            ✓ {msg}
          </div>
        )}

        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>

          {mode==="signup" && (
            <div>
              <label className="lbl">Your name</label>
              <input className="inp" type="text" placeholder="Sunil Kattikar" value={name}
                onChange={e=>setName(e.target.value)} autoComplete="name"/>
            </div>
          )}

          <div>
            <label className="lbl">Email address</label>
            <input className="inp" type="email" placeholder="you@company.com" value={email}
              onChange={e=>{setEmail(e.target.value);setErr("")}}
              autoComplete="email" required autoFocus={mode==="login"}/>
          </div>

          {mode !== "forgot" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <label className="lbl" style={{margin:0}}>Password</label>
                {mode==="login" && (
                  <button type="button" className="link-btn" style={{fontSize:12}}
                    onClick={()=>{setMode("forgot");setErr("");setMsg("")}}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{position:"relative"}}>
                <input className="inp" type={showPw?"text":"password"}
                  placeholder={mode==="signup"?"At least 6 characters":"Enter your password"}
                  value={pw} onChange={e=>{setPw(e.target.value);setErr("")}}
                  autoComplete={mode==="login"?"current-password":"new-password"}
                  style={{paddingRight:44}} required/>
                <button type="button" onClick={()=>setShowPw(s=>!s)}
                  style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:18,lineHeight:1,color:"rgba(245,245,240,.35)",padding:2}}>
                  {showPw?"🙈":"👁️"}
                </button>
              </div>
            </div>
          )}

          <button className="btn" type="submit" disabled={loading}
            style={{background:loading?"rgba(239,159,39,.5)":AMBER,color:N,marginTop:4}}>
            {loading
              ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <span style={{width:16,height:16,border:"2px solid rgba(10,14,26,.3)",borderTopColor:N,borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>
                  {mode==="signup"?"Creating account…":mode==="forgot"?"Sending…":"Signing in…"}
                </span>
              : mode==="signup" ? "Create account →"
              : mode==="forgot" ? "Send reset link →"
              : "Sign in →"
            }
          </button>
        </form>

        {/* Toggle mode */}
        <div style={{marginTop:18,paddingTop:16,borderTop:"1px solid rgba(255,255,255,.07)",textAlign:"center",fontSize:13.5,color:"rgba(245,245,240,.4)"}}>
          {mode==="login"  && <>New to SIXXAB?{" "}<button className="link-btn" onClick={()=>{setMode("signup");setErr("");setMsg("")}}>Create free account</button></>}
          {mode==="signup" && <>Already have an account?{" "}<button className="link-btn" onClick={()=>{setMode("login");setErr("");setMsg("")}}>Sign in</button></>}
          {mode==="forgot" && <button className="link-btn" onClick={()=>{setMode("login");setErr("");setMsg("")}}>← Back to sign in</button>}
        </div>
      </div>

      {/* Trust line */}
      {mode==="signup" && (
        <p style={{textAlign:"center",marginTop:14,fontSize:12,color:"rgba(245,245,240,.2)",lineHeight:1.6}}>
          14-day free trial · No credit card · Cancel anytime
        </p>
      )}
    </div>
  </>)
}
