import { useState, useEffect } from "react"
import { useRouter } from "next/router"

function SixxabLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="69" height="69" rx="15" fill="none" stroke="#EF9F27" strokeWidth="3"/>
      <text x="7" y="54" fontFamily="Georgia,serif" fontSize="48" fill="none" stroke="#EF9F27" strokeWidth="1.5" letterSpacing="-3">S</text>
      <text x="35" y="54" fontFamily="Georgia,serif" fontSize="54" fill="none" stroke="#EF9F27" strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { redirect, plan } = router.query

  const [mode, setMode]           = useState("login")   // login | signup | forgot
  const [identifier, setId]       = useState("")        // email or phone
  const [password, setPassword]   = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [name, setName]           = useState("")
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")
  const [success, setSuccess]     = useState("")
  const [idType, setIdType]       = useState("email")   // email | phone

  // Detect if input is phone or email
  useEffect(() => {
    const isPhone = /^[\d\s\+\-\(\)]{7,}$/.test(identifier)
    setIdType(isPhone ? "phone" : "email")
  }, [identifier])

  // If already logged in redirect
  useEffect(() => {
    const user = typeof window !== "undefined" && sessionStorage.getItem("sixxab_user")
    if (user) router.replace(redirect || "/coach")
  }, [redirect, router])

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!identifier.trim()) { setError("Please enter your email or mobile number."); return }
    if (mode !== "forgot" && !password) { setError("Please enter your password."); return }
    if (mode === "signup") {
      if (!name.trim()) { setError("Please enter your name."); return }
      if (password.length < 8) { setError("Password must be at least 8 characters."); return }
      if (password !== confirmPw) { setError("Passwords don't match."); return }
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, identifier: identifier.trim(), password, name: name.trim(), plan }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.")
        setLoading(false)
        return
      }

      if (mode === "forgot") {
        setSuccess("Reset link sent! Check your email or SMS.")
        setLoading(false)
        return
      }

      // Store session
      sessionStorage.setItem("sixxab_user", JSON.stringify({
        id: data.user?.id || "usr_" + Date.now(),
        name: data.user?.name || name || identifier.split("@")[0],
        email: data.user?.email || identifier,
        plan: data.user?.plan || plan || "free",
        token: data.token || "tok_" + Date.now(),
      }))

      // Route based on flow
      if (mode === "signup" && plan) {
        // Complete payment after signup
        router.replace(`/checkout?plan=${plan}`)
      } else {
        router.replace(redirect || "/coach")
      }

    } catch {
      setError("Network error — please check your connection and retry.")
      setLoading(false)
    }
  }

  const N = "#0A0E1A", AMBER = "#EF9F27"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F4F4F0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
        input{font-family:'Plus Jakarta Sans',sans-serif}
        input:focus{outline:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fadeUp{animation:fadeUp .4s ease both}
        .field-wrap{position:relative}
        .field-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:16px;color:#94A3B8;pointer-events:none}
        .field-action{position:absolute;right:13px;top:50%;transform:translateY(-50%);font-size:14px;color:#94A3B8;cursor:pointer;background:none;border:none;padding:0}
        .field-action:hover{color:#64748B}
        .form-input{width:100%;padding:11px 13px 11px 40px;border:1.5px solid #E2E8F0;border-radius:10px;font-size:14px;background:#fff;color:${N};line-height:1.4;transition:border .15s}
        .form-input:focus{border-color:${AMBER}}
        .form-input.error{border-color:#FCA5A5}
        .primary-btn{width:100%;padding:13px;border-radius:10px;background:${AMBER};color:${N};font-size:15px;font-weight:600;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:opacity .15s}
        .primary-btn:hover:not(:disabled){opacity:.9}
        .primary-btn:disabled{opacity:.55;cursor:not-allowed}
        .divider{display:flex;align-items:center;gap:10px;margin:16px 0}
        .divider::before,.divider::after{content:'';flex:1;height:.5px;background:#E2E8F0}
        .divider span{font-size:12px;color:#94A3B8;white-space:nowrap}
        .social-btn{width:100%;padding:11px;border-radius:10px;border:1.5px solid #E2E8F0;background:#fff;font-size:13.5px;font-weight:500;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;color:#374151;transition:border .15s}
        .social-btn:hover{border-color:#CBD5E1;background:#F8F9FA}
        .mode-link{background:none;border:none;color:${AMBER};font-size:13px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;padding:0;text-decoration:underline;text-underline-offset:2px}
        .mode-link:hover{opacity:.8}
        .tab-btn{flex:1;padding:8px;border-radius:8px;border:none;font-size:13px;font-weight:500;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s}
      `}</style>

      <div style={{width:"100%",maxWidth:420}} className="fadeUp">

        {/* Card */}
        <div style={{background:"#fff",borderRadius:18,border:"1px solid #E2E8F0",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,.07)"}}>

          {/* Header */}
          <div style={{background:N,padding:"28px 32px 22px",textAlign:"center"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:14}}>
              <SixxabLogo size={36}/>
              <div style={{textAlign:"left"}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:"#F5F5F0",letterSpacing:2,lineHeight:1}}>
                  SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB
                </div>
                <div style={{fontFamily:"'DM Mono'",fontSize:9,color:"#5F5E5A",letterSpacing:".15em"}}>startupsinabox.com</div>
              </div>
            </div>

            {plan && (
              <div style={{background:"rgba(239,159,39,.15)",border:"1px solid rgba(239,159,39,.3)",borderRadius:8,padding:"7px 12px",marginBottom:14,display:"inline-flex",alignItems:"center",gap:6}}>
                <i className="ti ti-lock-open" style={{fontSize:13,color:AMBER}} aria-hidden="true"/>
                <span style={{fontSize:12,color:AMBER,fontWeight:500}}>
                  {mode==="signup"?"Create account to unlock":"Sign in to access"} {plan} plan — 50% off
                </span>
              </div>
            )}

            <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:"#F5F5F0",letterSpacing:1.5,marginBottom:4}}>
              {mode==="login" ? "Welcome back" : mode==="signup" ? "Create your account" : "Reset password"}
            </div>
            <div style={{fontSize:13,color:"rgba(245,245,240,.5)"}}>
              {mode==="login" ? "Sign in to access your SIXXAB platform" : mode==="signup" ? "Join 247+ founders already inside" : "We'll send a reset link to your email or mobile"}
            </div>
          </div>

          {/* Form body */}
          <div style={{padding:"24px 28px 28px"}}>

            {/* Login/Signup tabs */}
            {mode !== "forgot" && (
              <div style={{display:"flex",background:"#F8F9FA",borderRadius:10,padding:4,marginBottom:20,gap:4}}>
                <button className="tab-btn" onClick={()=>{setMode("login");setError("")}}
                  style={{background:mode==="login"?"#fff":"transparent",color:mode==="login"?N:"#94A3B8",boxShadow:mode==="login"?"0 1px 4px rgba(0,0,0,.08)":"none"}}>
                  Sign in
                </button>
                <button className="tab-btn" onClick={()=>{setMode("signup");setError("")}}
                  style={{background:mode==="signup"?"#fff":"transparent",color:mode==="signup"?N:"#94A3B8",boxShadow:mode==="signup"?"0 1px 4px rgba(0,0,0,.08)":"none"}}>
                  Create account
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* Name — signup only */}
              {mode === "signup" && (
                <div className="field-wrap">
                  <i className="ti ti-user field-icon" aria-hidden="true"/>
                  <input className={`form-input ${error&&!name?"error":""}`} type="text" placeholder="Full name"
                    value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/>
                </div>
              )}

              {/* Email or phone */}
              <div className="field-wrap">
                <i className={`ti ${idType==="phone"?"ti-phone":"ti-mail"} field-icon`} aria-hidden="true"/>
                <input className={`form-input ${error&&!identifier?"error":""}`}
                  type="text"
                  placeholder="Email address or mobile number"
                  value={identifier}
                  onChange={e=>setId(e.target.value)}
                  autoComplete={mode==="login"?"username":"email"}
                  inputMode={idType==="phone"?"tel":"email"}
                />
                {identifier && (
                  <div style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:8,background:idType==="phone"?"#E1F5EE":"#EEF2FF",color:idType==="phone"?"#085041":"#3D52A0"}}>
                    {idType==="phone"?"Mobile":"Email"}
                  </div>
                )}
              </div>

              {/* Password */}
              {mode !== "forgot" && (
                <div className="field-wrap">
                  <i className="ti ti-lock field-icon" aria-hidden="true"/>
                  <input className={`form-input ${error&&!password?"error":""}`}
                    type={showPw?"text":"password"}
                    placeholder="Password"
                    value={password}
                    onChange={e=>setPassword(e.target.value)}
                    autoComplete={mode==="login"?"current-password":"new-password"}
                    style={{paddingRight:40}}
                  />
                  <button type="button" className="field-action" onClick={()=>setShowPw(s=>!s)} aria-label={showPw?"Hide password":"Show password"}>
                    <i className={`ti ${showPw?"ti-eye-off":"ti-eye"}`} aria-hidden="true"/>
                  </button>
                </div>
              )}

              {/* Confirm password — signup only */}
              {mode === "signup" && (
                <div className="field-wrap">
                  <i className="ti ti-lock-check field-icon" aria-hidden="true"/>
                  <input className={`form-input ${error&&confirmPw&&confirmPw!==password?"error":""}`}
                    type={showPw?"text":"password"}
                    placeholder="Confirm password"
                    value={confirmPw}
                    onChange={e=>setConfirmPw(e.target.value)}
                    autoComplete="new-password"
                  />
                  {confirmPw && (
                    <div style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)"}}>
                      <i className={`ti ${confirmPw===password?"ti-circle-check":"ti-circle-x"}`}
                        style={{fontSize:16,color:confirmPw===password?"#1D9E75":"#EF4444"}} aria-hidden="true"/>
                    </div>
                  )}
                </div>
              )}

              {/* Password strength — signup */}
              {mode === "signup" && password && (
                <div style={{display:"flex",gap:4}}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{flex:1,height:3,borderRadius:2,transition:"background .2s",background:
                      password.length >= i*3 && (i<3 || /[A-Z]/.test(password)) && (i<4 || /[0-9!@#$]/.test(password))
                        ? i<=1?"#EF9F27":i<=2?"#F59E0B":i<=3?"#1D9E75":"#059669"
                        : "#E2E8F0"
                    }}/>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{padding:"9px 12px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,fontSize:13,color:"#991B1B",display:"flex",alignItems:"center",gap:7}}>
                  <i className="ti ti-alert-circle" style={{fontSize:15,flexShrink:0}} aria-hidden="true"/>
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div style={{padding:"9px 12px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:8,fontSize:13,color:"#166534",display:"flex",alignItems:"center",gap:7}}>
                  <i className="ti ti-circle-check" style={{fontSize:15,flexShrink:0}} aria-hidden="true"/>
                  {success}
                </div>
              )}

              {/* Forgot password link */}
              {mode === "login" && (
                <div style={{textAlign:"right",marginTop:-4}}>
                  <button type="button" className="mode-link" onClick={()=>{setMode("forgot");setError("")}}>
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="primary-btn" disabled={loading} style={{marginTop:4}}>
                {loading
                  ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      <div style={{width:16,height:16,border:"2px solid rgba(10,14,26,.25)",borderTopColor:N,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
                      {mode==="login"?"Signing in…":mode==="signup"?"Creating account…":"Sending reset link…"}
                    </span>
                  : mode==="login" ? "Sign in to SIXXAB →"
                  : mode==="signup" ? (plan ? `Create account & pay →` : "Create account →")
                  : "Send reset link →"
                }
              </button>

              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </form>

            {/* Divider + social — login/signup only */}
            {mode !== "forgot" && (
              <>
                <div className="divider"><span>or continue with</span></div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <button className="social-btn" onClick={() => setError("Google sign-in coming soon — use email or mobile for now")}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Continue with Google
                  </button>
                  <button className="social-btn" onClick={() => setError("Apple sign-in coming soon — use email or mobile for now")}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/></svg>
                    Continue with Apple
                  </button>
                </div>
              </>
            )}

            {/* Back to login from forgot */}
            {mode === "forgot" && (
              <div style={{textAlign:"center",marginTop:16}}>
                <button type="button" className="mode-link" onClick={()=>{setMode("login");setError("");setSuccess("")}}>
                  ← Back to sign in
                </button>
              </div>
            )}

            {/* Terms */}
            {mode === "signup" && (
              <p style={{fontSize:11,color:"#94A3B8",textAlign:"center",marginTop:14,lineHeight:1.6}}>
                By creating an account you agree to our{" "}
                <a href="/terms" style={{color:"#64748B"}}>Terms</a> and{" "}
                <a href="/privacy" style={{color:"#64748B"}}>Privacy Policy</a>.
                14-day money-back guarantee on all paid plans.
              </p>
            )}
          </div>
        </div>

        {/* Back to home */}
        <div style={{textAlign:"center",marginTop:16}}>
          <a href="/" style={{fontSize:13,color:"#94A3B8",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:5}}>
            <i className="ti ti-arrow-left" style={{fontSize:13}} aria-hidden="true"/>
            Back to startupsinabox.com
          </a>
        </div>
      </div>
    </>
  )
}
