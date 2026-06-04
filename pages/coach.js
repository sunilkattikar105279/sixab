// pages/coach.js — SIXXAB AI · Strategy Coach
import Head from "next/head"
import SixxabNav, { SixxabMark, SixxabWordmark } from "../components/SixxabNav"
import { useState, useRef, useEffect } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0", INK = "#111520"

const QUICK_PROMPTS = [
  "What is my #1 priority this week?",
  "How do I get my first 10 customers?",
  "Write my LinkedIn post for SIXXAB AI.",
  "Validate my niche and pricing.",
  "Build me a 7-day revenue sprint plan.",
  "How do I land my first paying client in 48 hours?",
]

const INITIAL = {
  role: "assistant",
  content: `Hey — I'm your SIXXAB AI Strategy Coach.\n\nI'm built for founders who move fast. You have a 48-hour window to go from idea to first revenue — and I'm here to make every hour count.\n\nNo fluff. No vague strategy. Just numbered steps you can execute today.\n\nWhat are we working on?`,
}

export default function CoachPage() {
  const [messages, setMessages] = useState([INITIAL])
  const [input,    setInput]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [user,     setUser]     = useState(null)
  const bottomRef   = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    try { setUser(JSON.parse(sessionStorage.getItem("sixxab_user"))) } catch {}
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function sendMessage(overrideText) {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return
    setInput(""); setError(null)
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    const next = [...messages, { role: "user", content: text }]
    setMessages(next); setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      setMessages([...next, { role: "assistant", content: data.reply }])
    } catch (err) {
      setError(err.message)
      setMessages(messages)
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  function autoResize(e) {
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
  }

  const displayName = user ? ((user.name || user.email || "").split(/[ @]/)[0]) : null

  return (
    <>
      <Head>
        <title>SIXXAB AI — Strategy Coach</title>
        <meta name="description" content="SIXXAB AI Strategy Coach — numbered steps, no fluff. Built for founders who move fast."/>
      </Head>

      <style>{`
        body{background:#F4F4F0}
        @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .vd{display:inline-block;width:5px;height:5px;border-radius:50%;background:#9CA3AF;animation:blink 1.3s infinite}
        .vd:nth-child(2){animation-delay:.22s}.vd:nth-child(3){animation-delay:.44s}
        .qbtn{font-size:11px;padding:5px 12px;border-radius:20px;border:1px solid rgba(239,159,39,.3);background:rgba(239,159,39,.07);cursor:pointer;color:#EF9F27;white-space:nowrap;font-weight:500;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif}
        .qbtn:hover:not(:disabled){background:rgba(239,159,39,.16);border-color:#EF9F27}
        .qbtn:disabled{opacity:.4;cursor:not-allowed}
        .send-btn{width:38px;height:38px;border-radius:9px;border:none;background:#EF9F27;color:#0A0E1A;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:opacity .15s}
        .send-btn:disabled{background:rgba(255,255,255,.08);cursor:not-allowed;color:rgba(245,245,240,.25)}
        .send-btn:not(:disabled):hover{opacity:.87}
        textarea:focus{outline:none;border-color:#EF9F27!important}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#EF9F27;border-radius:2px}
      `}</style>

      {/* ── Shared nav ── */}
      <SixxabNav active="/coach"/>

      {/* ── Page layout ── */}
      <div style={{maxWidth:760, margin:"0 auto", padding:"20px 16px 40px", display:"flex", flexDirection:"column", height:"calc(100vh - 52px)"}}>

        {/* ── Coach card ── */}
        <div style={{flex:1, display:"flex", flexDirection:"column", background:N, borderRadius:18, border:"1px solid rgba(239,159,39,.18)", overflow:"hidden", boxShadow:"0 8px 40px rgba(0,0,0,.2)", minHeight:0}}>

          {/* ── Header ── */}
          <header style={{padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0}}>
            <div style={{display:"flex", alignItems:"center", gap:12}}>
              {/* Brand mark */}
              <div style={{width:38, height:38, borderRadius:10, background:"rgba(239,159,39,.12)", border:"1.5px solid rgba(239,159,39,.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                <SixxabMark size={24}/>
              </div>
              {/* Wordmark */}
              <div>
                <div style={{fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:CHALK, letterSpacing:1, lineHeight:1}}>
                  SIX<span style={{color:AMBER, fontStyle:"italic"}}>X</span>AB{" "}
                  <span style={{fontSize:9, color:"rgba(245,245,240,.35)", letterSpacing:2, fontStyle:"normal"}}>AI</span>
                </div>
                <div style={{fontFamily:"monospace", fontSize:7, color:"#5F5E5A", letterSpacing:".13em", marginTop:1}}>
                  strategy coach
                </div>
              </div>
            </div>

            {/* Status + user */}
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <div style={{display:"flex", alignItems:"center", gap:5, fontSize:11.5, color:"rgba(245,245,240,.45)", padding:"4px 11px", borderRadius:20, border:"1px solid rgba(255,255,255,.08)"}}>
                <div style={{width:6, height:6, borderRadius:"50%", background:"#1D9E75", boxShadow:"0 0 6px #1D9E75"}}/>
                {displayName || "Online"}
              </div>
              <a href="/orchestrator" style={{fontSize:11, color:"rgba(245,245,240,.4)", textDecoration:"none", padding:"4px 11px", borderRadius:20, border:"1px solid rgba(255,255,255,.08)"}}>
                Orchestrator →
              </a>
            </div>
          </header>

          {/* ── Messages ── */}
          <div style={{flex:1, overflowY:"auto", padding:"20px 20px 8px", display:"flex", flexDirection:"column", gap:14}}>
            {messages.map((msg, i) => {
              const isUser = msg.role === "user"
              return (
                <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start", flexDirection:isUser?"row-reverse":"row"}}>
                  {isUser ? (
                    <div style={{width:28, height:28, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, background:"rgba(239,159,39,.15)", color:AMBER, border:"1px solid rgba(239,159,39,.2)"}}>
                      {displayName?.slice(0,2).toUpperCase() || "ME"}
                    </div>
                  ) : (
                    <div style={{width:28, height:28, borderRadius:8, background:"rgba(239,159,39,.12)", border:"1px solid rgba(239,159,39,.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                      <SixxabMark size={18}/>
                    </div>
                  )}
                  <div style={{
                    maxWidth:"80%", padding:"11px 15px",
                    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    fontSize:13.5, lineHeight:1.75,
                    background: isUser ? "rgba(239,159,39,.11)" : "rgba(255,255,255,.04)",
                    border:`1px solid ${isUser?"rgba(239,159,39,.2)":"rgba(255,255,255,.07)"}`,
                    whiteSpace:"pre-wrap", wordBreak:"break-word",
                    color:"rgba(245,245,240,.9)", fontFamily:"'Plus Jakarta Sans',sans-serif",
                  }}>
                    {msg.content}
                  </div>
                </div>
              )
            })}

            {/* Typing indicator */}
            {loading && (
              <div style={{display:"flex", gap:10, alignItems:"flex-start"}}>
                <div style={{width:28, height:28, borderRadius:8, background:"rgba(239,159,39,.12)", border:"1px solid rgba(239,159,39,.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  <SixxabMark size={18}/>
                </div>
                <div style={{padding:"13px 16px", borderRadius:"16px 16px 16px 4px", border:"1px solid rgba(255,255,255,.07)", background:"rgba(255,255,255,.04)", display:"flex", gap:5, alignItems:"center"}}>
                  <span className="vd"/><span className="vd"/><span className="vd"/>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{padding:"10px 14px", background:"rgba(220,38,38,.1)", border:"1px solid rgba(220,38,38,.25)", borderRadius:10, fontSize:12, color:"#FCA5A5", display:"flex", alignItems:"center", gap:10}}>
                <span>⚠ {error}</span>
                <button onClick={()=>{ setError(null); sendMessage(messages[messages.length-1]?.content) }}
                  style={{marginLeft:"auto", padding:"3px 10px", borderRadius:6, border:"1px solid rgba(220,38,38,.3)", background:"transparent", color:"#FCA5A5", fontSize:11, cursor:"pointer", fontFamily:"inherit"}}>
                  Retry
                </button>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* ── Quick prompts ── */}
          <div style={{display:"flex", flexWrap:"wrap", gap:6, padding:"10px 18px", borderTop:"1px solid rgba(255,255,255,.06)", background:INK, flexShrink:0}}>
            {QUICK_PROMPTS.map((q, i) => (
              <button key={i} className="qbtn" disabled={loading} onClick={()=>sendMessage(q)}>
                {q.length > 44 ? q.slice(0, 44) + "…" : q}
              </button>
            ))}
          </div>

          {/* ── Input ── */}
          <div style={{padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,.07)", display:"flex", gap:8, alignItems:"flex-end", background:N, flexShrink:0}}>
            <textarea
              ref={textareaRef} value={input}
              onChange={e=>{ setInput(e.target.value); autoResize(e) }}
              onKeyDown={handleKey}
              placeholder="Ask SIXXAB AI anything…"
              rows={1} disabled={loading}
              style={{flex:1, resize:"none", border:"1px solid rgba(255,255,255,.1)", borderRadius:10, padding:"9px 13px", fontSize:13.5, background:INK, color:CHALK, lineHeight:1.6, minHeight:40, maxHeight:120, fontFamily:"'Plus Jakarta Sans',sans-serif"}}
            />
            <button className="send-btn" onClick={()=>sendMessage()}
              disabled={!input.trim()||loading} aria-label="Send">
              {loading
                ? <div style={{width:14, height:14, border:"2px solid rgba(10,14,26,.3)", borderTopColor:N, borderRadius:"50%", animation:"spin .7s linear infinite"}}/>
                : "↑"}
            </button>
          </div>
        </div>

        {/* ── Footer strip ── */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 4px", flexWrap:"wrap", gap:8}}>
          <div style={{fontSize:11, color:"#94A3B8"}}>
            <strong style={{color:"#64748B"}}>SIXXAB AI Coach</strong> · Powered by Claude · Your conversations are private
          </div>
          <div style={{display:"flex", gap:12}}>
            {[["/orchestrator","Orchestrator"],["/crm","SIXXAB CRM"],["/agents","CXO Suite"],["/runbook","Runbook"]].map(([h,l])=>(
              <a key={l} href={h} style={{fontSize:11, color:"#94A3B8", textDecoration:"none"}}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
