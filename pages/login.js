// pages/login.js — SIXXAB AI · Login, Sign up, Password reset
import Head from "next/head"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { SixxabMark } from "../components/SixxabNav"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

export default function LoginPage() {
  const router = useRouter()
  const {
    redirect, plan,
    reset, email: resetEmail,
    oauth_user, oauth_token, err: oauthErr
  } = router.query

  const [mode,     setMode]     = useState("login")  // login | signup | forgot
  const [id,       setId]       = useState("")
  const [pw,       setPw]       = useState("")
  const [pw2,      setPw2]      = useState("")
  const [name,     setName]     = useState("")
  const [newPw,    setNewPw]    = useState("")
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [oLoading, setOLoading] = useState("")
  const [err,      setErr]      = useState("")
  const [msg,      setMsg]      = useState("")
  const [idType,   setIdType]   = useState("email")
  const [isReset,  setIsReset]  = useState(false)

  // ── OAuth callback ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (oauth_user && oauth_token) {
      try {
        const user = JSON.parse(decodeURIComponent(oauth_user))
        sessionStorage.setItem("sixxab_user", JSON.stringify({ ...user, token: oauth_token }))
        router.replace(decodeURIComponent(redirect || "/orchestrator"))
      } catch { setErr("OAuth sign-in failed. Please try email instead.") }
    }
  }, [oauth_user, oauth_token, redirect, router])

  useEffect(() => {
    const MAP = {
      google_cancelled: "Google sign-in was cancelled.",
      apple_cancelled: "Apple sign-in was cancelled.",
      google_not_configured: "Google sign-in needs setup — use email for now.",
      no_email: "Could not get your email from the sign-in provider.",
      google_error: "Google sign-in error — please try email.",
      apple_error: "Apple sign-in error — please try email.",
    }
    if (oauthErr) setErr(MAP[oauthErr] || "Sign-in error. Please try again.")
  }, [oauthErr])

  useEffect(() => {
    if (resetEmail) setId(decodeURIComponent(resetEmail))
    if (reset) setIsReset(true)
  }, [resetEmail, reset])

  useEffect(() => {
    try {
      if (sessionStorage.getItem("sixxab_user"))
        router.replace(decodeURIComponent(redirect || "/orchestrator"))
    } catch {}
  }, [redirect, router])

  useEffect(() => {
    setIdType(/^[\d\s\+\-\(\)]{7,}$/.test(id) ? "phone" : "email")
  }, [id])

  // ── Google OAuth ───────────────────────────────────────────────────────────
  function handleGoogle() {
    setOLoading("google"); setErr("")
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || clientId === "your-google-client-id") {
      setErr("Google sign-in: add NEXT_PUBLIC_GOOGLE_CLIENT_ID in Vercel env vars.")
      setOLoading(""); return
    }
    const state = encodeURIComponent(JSON.stringify({ redirect: decodeURIComponent(redirect || "/orchestrator"), plan: plan || "" }))
    const params = new URLSearchParams({ client_id: clientId, redirect_uri: `${window.location.origin}/api/auth/google`,
      response_type: "code", scope: "openid email profile", state, prompt: "select_account" })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  // ── Apple OAuth ────────────────────────────────────────────────────────────
  function handleApple() {
    setOLoading("apple"); setErr("")
    const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID
    if (!clientId || clientId === "your-apple-client-id") {
      setErr("Apple sign-in: add NEXT_PUBLIC_APPLE_CLIENT_ID in Vercel env vars.")
      setOLoading(""); return
    }
    const state = encodeURIComponent(JSON.stringify({ redirect: decodeURIComponent(redirect || "/orchestrator"), plan: plan || "" }))
    const params = new URLSearchParams({ client_id: clientId, redirect_uri: `${window.location.origin}/api/auth/apple`,
      response_type: "code id_token", scope: "name email", state, response_mode: "form_post" })
    window.location.href = `https://appleid.apple.com/auth/authorize?${params}`
  }

  // ── Set new password ───────────────────────────────────────────────────────
  async function handleSetNewPw(e) {
    e.preventDefault(); setErr("")
    if (newPw.length < 8) { setErr("Password must be at least 8 characters."); return }
    setLoading(true)
    const res = await fetch("/api/auth", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ mode:"reset", identifier:id, token:reset, newPassword:newPw }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setErr(data.error || "Reset failed. Please request a new link."); return }
    setMsg("Password updated! Signing you in…"); setIsReset(false)
    const lr = await fetch("/api/auth", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ mode:"login", identifier:id, password:newPw }) })
    const ld = await lr.json()
    if (lr.ok) {
      sessionStorage.setItem("sixxab_user", JSON.stringify({ ...ld.user, token:ld.token }))
      router.replace(decodeURIComponent(redirect || "/orchestrator"))
    }
  }

  // ── Main submit ────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault(); setErr(""); setMsg("")
    if (!id.trim()) { setErr("Please enter your email or mobile."); return }
    if (mode !== "forgot" && !pw) { setErr("Please enter your password."); return }
    if (mode === "signup") {
      if (!name.trim()) { setErr("Please enter your name."); return }
      if (pw.length < 8) { setErr("Password must be at least 8 characters."); return }
      if (pw !== pw2) { setErr("Passwords don't match."); return }
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ mode, identifier:id.trim(), password:pw, name:name.trim(), plan }) })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || "Something went wrong."); setLoading(false); return }
      if (mode === "forgot") { setMsg("Reset link sent! Check your inbox — arrives within 2 minutes."); setLoading(false); return }
      sessionStorage.setItem("sixxab_user", JSON.stringify({
        id:data.user?.id, name:data.user?.name, email:data.user?.email,
        plan:data.user?.plan || plan || "free", token:data.token
      }))
      router.replace(plan && mode === "signup" ? `/checkout?plan=${plan}` : decodeURIComponent(redirect || "/orchestrator"))
    } catch { setErr("Network error — please retry."); setLoading(false) }
  }

  const strength = [pw.length>=4, pw.length>=8, pw.length>=8&&/[A-Z]/.test(pw), pw.length>=8&&/[A-Z]/.test(pw)&&/[0-9!@#$]/.test(pw)].filter(Boolean).length
  const sColor = ["#E2E8F0","#EF4444","#F59E0B","#1D9E75","#059669"][strength]

  // ── Tab helper ─────────────────────────────────────────────────────────────
  const headings = {
    login: { title:"Welcome back", sub:"Sign in to your SIXXAB AI platform" },
    signup:{ title:"Create account", sub:plan ? `Activate ${plan} · 50% founding rate` : "Join founders building autonomous businesses" },
    forgot:{ title:"Reset password", sub:"We'll send a reset link to your email" },
    reset: { title:"Set new password", sub:"Choose a strong new password" },
  }
  const h = isReset ? headings.reset : headings[mode]

  return (
    <>
      <Head>
        <title>
          {isReset ? "Set new password" : mode==="forgot" ? "Reset password" : mode==="signup" ? "Create account" : "Sign in"} · SIXXAB AI
        </title>
        <meta name="description" content="Sign in to SIXXAB AI — Autonomous Business Platform"/>
        <meta name="robots" content="noindex"/>
      </Head>

      <style>{`
        body{background:${N};min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;font-family:'Plus Jakarta Sans',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .4s ease both}
        .fi{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:16px;color:#94A3B8;pointer-events:none}
        .inp{width:100%;padding:11px 14px 11px 40px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:14px;background:#fff;color:${N};transition:border .15s;font-family:inherit}
        .inp:focus{outline:none;border-color:${AMBER}}
        .pbtn{width:100%;padding:13px;border-radius:10px;background:${AMBER};color:${N};font-size:15px;font-weight:700;border:none;cursor:pointer;font-family:inherit;transition:opacity .15s;display:flex;align-items:center;justify-content:center;gap:8px}
        .pbtn:hover:not(:disabled){opacity:.9}
        .pbtn:disabled{opacity:.5;cursor:not-allowed}
        .obtn{width:100%;padding:11px;border-radius:10px;border:1.5px solid #E2E8F0;background:#fff;font-size:13.5px;font-weight:500;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:9px;color:#374151;transition:all .15s}
        .obtn:hover:not(:disabled){border-color:#CBD5E1;background:#F8F9FA}
        .obtn:disabled{opacity:.5;cursor:not-allowed}
        .tab{flex:1;padding:9px;border-radius:9px;border:none;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .15s}
        .lnk{background:none;border:none;color:${AMBER};font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;padding:0;text-decoration:underline;text-underline-offset:2px}
        .div{display:flex;align-items:center;gap:10px;margin:14px 0}
        .div::before,.div::after{content:'';flex:1;height:.5px;background:#E2E8F0}
        .div span{font-size:12px;color:#94A3B8;white-space:nowrap}
        .spin{width:16px;height:16px;border:2px solid rgba(10,14,26,.25);border-top-color:${N};border-radius:50%;animation:spin .8s linear infinite}
      `}</style>

      {/* Background grid pattern */}
      <div style={{position:"fixed",inset:0,backgroundImage:"radial-gradient(rgba(239,159,39,.07) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
      <div style={{position:"fixed",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:700,height:600,background:"radial-gradient(ellipse,rgba(239,159,39,.1) 0%,transparent 65%)",pointerEvents:"none"}}/>

      <div style={{width:"100%",maxWidth:420,position:"relative",zIndex:1}} className="fu">

        {/* Back link */}
        <div style={{textAlign:"center",marginBottom:20}}>
          <a href="/" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13,color:"rgba(245,245,240,.4)",textDecoration:"none"}}>
            <i className="ti ti-arrow-left" style={{fontSize:13}} aria-hidden="true"/>
            startupsinabox.com
          </a>
        </div>

        {/* Card */}
        <div style={{background:"#fff",borderRadius:20,border:"1px solid #E2E8F0",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}}>

          {/* ── Card header ── */}
          <div style={{background:N,padding:"28px 28px 22px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,.07)"}}>

            {/* Logo + wordmark */}
            <a href="/" style={{display:"inline-flex",alignItems:"center",gap:10,textDecoration:"none",marginBottom:18}}>
              <div style={{width:44,height:44,borderRadius:12,background:"rgba(239,159,39,.12)",border:"1.5px solid rgba(239,159,39,.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <SixxabMark size={28}/>
              </div>
              <div style={{textAlign:"left"}}>
                <div style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:CHALK,letterSpacing:1,lineHeight:1}}>
                  SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB{" "}
                  <span style={{fontSize:10,color:"rgba(245,245,240,.35)",letterSpacing:2,fontStyle:"normal"}}>AI</span>
                </div>
                <div style={{fontSize:7.5,color:"#5F5E5A",letterSpacing:".13em",fontFamily:"monospace",marginTop:2}}>
                  autonomous business platform
                </div>
              </div>
            </a>

            {/* Plan badge */}
            {plan && (
              <div style={{background:"rgba(239,159,39,.15)",border:"1px solid rgba(239,159,39,.3)",borderRadius:9,padding:"7px 14px",marginBottom:14,fontSize:12.5,color:AMBER,fontWeight:500}}>
                🔒 {mode==="signup" ? "Create account to activate" : "Sign in for"}{" "}
                <strong>{plan}</strong> · 50% off founding rate — locked forever
              </div>
            )}

            {/* Heading */}
            <div style={{fontFamily:"Georgia,serif",fontSize:26,fontWeight:700,color:CHALK,letterSpacing:.3,marginBottom:5}}>{h.title}</div>
            <div style={{fontSize:13,color:"rgba(245,245,240,.45)",lineHeight:1.5}}>{h.sub}</div>
          </div>

          {/* ── Card body ── */}
          <div style={{padding:"22px 24px 26px"}}>

            {/* ── Set new password ── */}
            {isReset ? (
              <form onSubmit={handleSetNewPw} style={{display:"flex",flexDirection:"column",gap:11}}>
                <div style={{padding:"9px 12px",background:"#EEF2FF",borderRadius:9,fontSize:13,color:"#3D52A0"}}>
                  Setting new password for: <strong>{id}</strong>
                </div>
                <div style={{position:"relative"}}>
                  <i className="ti ti-lock fi" aria-hidden="true"/>
                  <input className="inp" type={showPw?"text":"password"} placeholder="New password (min 8 chars)"
                    value={newPw} onChange={e=>setNewPw(e.target.value)} style={{paddingRight:40}}/>
                  <button type="button" onClick={()=>setShowPw(s=>!s)}
                    style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",border:"none",background:"none",cursor:"pointer",color:"#94A3B8",fontSize:15}}>
                    <i className={`ti ${showPw?"ti-eye-off":"ti-eye"}`} aria-hidden="true"/>
                  </button>
                </div>
                {err && <div style={{padding:"9px 12px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:9,fontSize:13,color:"#991B1B",display:"flex",alignItems:"center",gap:6}}><i className="ti ti-alert-circle" style={{fontSize:14,flexShrink:0}} aria-hidden="true"/>{err}</div>}
                {msg && <div style={{padding:"9px 12px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:9,fontSize:13,color:"#166534",display:"flex",alignItems:"center",gap:6}}><i className="ti ti-circle-check" style={{fontSize:14,flexShrink:0}} aria-hidden="true"/>{msg}</div>}
                <button type="submit" className="pbtn" disabled={loading}>
                  {loading ? <><div className="spin"/>Updating…</> : "Set new password →"}
                </button>
              </form>

            ) : (
              <>
                {/* ── Sign in / Sign up tabs ── */}
                {mode !== "forgot" && (
                  <div style={{display:"flex",background:"#F8F9FA",borderRadius:11,padding:4,marginBottom:18,gap:4}}>
                    {[["login","Sign in"],["signup","Create account"]].map(([m,l])=>(
                      <button key={m} className="tab" onClick={()=>{setMode(m);setErr("");setMsg("")}}
                        style={{background:mode===m?"#fff":"transparent",color:mode===m?N:"#94A3B8",
                          boxShadow:mode===m?"0 1px 4px rgba(0,0,0,.08)":"none",fontWeight:mode===m?600:400}}>
                        {l}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── OAuth buttons ── */}
                {mode !== "forgot" && (
                  <>
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                      <button className="obtn" onClick={handleGoogle} disabled={!!oLoading}>
                        {oLoading==="google"
                          ? <div className="spin" style={{borderTopColor:"#4285F4"}}/>
                          : <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                        Continue with Google
                      </button>
                      <button className="obtn" onClick={handleApple} disabled={!!oLoading}>
                        {oLoading==="apple"
                          ? <div className="spin"/>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/></svg>}
                        Continue with Apple
                      </button>
                    </div>
                    <div className="div"><span>or use email / mobile</span></div>
                  </>
                )}

                {/* ── Email/password form ── */}
                <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:11}}>
                  {mode==="signup" && (
                    <div style={{position:"relative"}}>
                      <i className="ti ti-user fi" aria-hidden="true"/>
                      <input className="inp" type="text" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/>
                    </div>
                  )}

                  <div style={{position:"relative"}}>
                    <i className={`ti ${idType==="phone"?"ti-phone":"ti-mail"} fi`} aria-hidden="true"/>
                    <input className="inp" type="text" placeholder="Email or mobile number" value={id} onChange={e=>setId(e.target.value)}/>
                    {id && (
                      <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:8,background:idType==="phone"?"#E1F5EE":"#EEF2FF",color:idType==="phone"?"#085041":"#3D52A0"}}>
                        {idType==="phone"?"Mobile":"Email"}
                      </span>
                    )}
                  </div>

                  {mode !== "forgot" && (
                    <div style={{position:"relative"}}>
                      <i className="ti ti-lock fi" aria-hidden="true"/>
                      <input className="inp" type={showPw?"text":"password"} placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} style={{paddingRight:40}}/>
                      <button type="button" onClick={()=>setShowPw(s=>!s)}
                        style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",border:"none",background:"none",cursor:"pointer",color:"#94A3B8",fontSize:15}}>
                        <i className={`ti ${showPw?"ti-eye-off":"ti-eye"}`} aria-hidden="true"/>
                      </button>
                    </div>
                  )}

                  {mode==="signup" && (
                    <>
                      <div style={{position:"relative"}}>
                        <i className="ti ti-lock-check fi" aria-hidden="true"/>
                        <input className="inp" type={showPw?"text":"password"} placeholder="Confirm password" value={pw2} onChange={e=>setPw2(e.target.value)} style={{paddingRight:36}}/>
                        {pw2 && <i className={`ti ${pw2===pw?"ti-circle-check":"ti-circle-x"}`} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:16,color:pw2===pw?"#1D9E75":"#EF4444"}} aria-hidden="true"/>}
                      </div>
                      {pw && (
                        <div style={{display:"flex",gap:3,alignItems:"center"}}>
                          {[1,2,3,4].map(i=>(
                            <div key={i} style={{flex:1,height:3,borderRadius:2,background:strength>=i?sColor:"#E2E8F0",transition:"background .2s"}}/>
                          ))}
                          <span style={{fontSize:10,color:"#94A3B8",marginLeft:6}}>{["","Weak","Fair","Good","Strong"][strength]}</span>
                        </div>
                      )}
                    </>
                  )}

                  {mode==="login" && (
                    <div style={{textAlign:"right",marginTop:-4}}>
                      <button type="button" className="lnk" onClick={()=>{setMode("forgot");setErr("")}}>Forgot password?</button>
                    </div>
                  )}

                  {err && (
                    <div style={{padding:"9px 12px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:9,fontSize:13,color:"#991B1B",display:"flex",alignItems:"center",gap:6}}>
                      <i className="ti ti-alert-circle" style={{fontSize:14,flexShrink:0}} aria-hidden="true"/>{err}
                    </div>
                  )}
                  {msg && (
                    <div style={{padding:"9px 12px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:9,fontSize:13,color:"#166534",display:"flex",alignItems:"center",gap:6}}>
                      <i className="ti ti-circle-check" style={{fontSize:14,flexShrink:0}} aria-hidden="true"/>{msg}
                    </div>
                  )}

                  <button type="submit" className="pbtn" disabled={loading} style={{marginTop:4}}>
                    {loading
                      ? <><div className="spin"/>{mode==="login"?"Signing in…":mode==="signup"?"Creating account…":"Sending reset…"}</>
                      : mode==="login" ? "Sign in to SIXXAB AI →"
                      : mode==="signup" ? (plan ? "Create account & activate →" : "Create account →")
                      : "Send password reset link →"}
                  </button>

                  {mode==="forgot" && (
                    <div style={{textAlign:"center"}}>
                      <button type="button" className="lnk" onClick={()=>{setMode("login");setErr("");setMsg("")}}>← Back to sign in</button>
                    </div>
                  )}
                </form>

                {mode==="signup" && (
                  <p style={{fontSize:11,color:"#94A3B8",textAlign:"center",marginTop:14,lineHeight:1.6}}>
                    By creating an account you agree to our{" "}
                    <a href="/terms" style={{color:"#64748B"}}>Terms</a> and{" "}
                    <a href="/privacy" style={{color:"#64748B"}}>Privacy</a>.{" "}
                    14-day money-back guarantee.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Footer strip ── */}
        <div style={{textAlign:"center",marginTop:20,display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
          <div style={{display:"flex",gap:14,fontSize:12.5,flexWrap:"wrap",justifyContent:"center"}}>
            {[["Runbook","/runbook"],["Pricing","/#pricing"],["Discovery","/discovery"],["Contact","/contact"]].map(([l,h])=>(
              <a key={l} href={h} style={{color:"rgba(245,245,240,.35)",textDecoration:"none"}}
                onMouseOver={e=>e.target.style.color="rgba(245,245,240,.7)"}
                onMouseOut={e=>e.target.style.color="rgba(245,245,240,.35)"}>{l}</a>
            ))}
          </div>
          <div style={{fontSize:11,color:"rgba(245,245,240,.2)"}}>© 2025 SIXXAB AI · Autonomous Business Platform · Dallas, TX</div>
        </div>
      </div>
    </>
  )
}
