import { useState, useRef, useEffect } from "react"
import { useAuth } from "../lib/useAuth"

const QUICK_PROMPTS = [
  "Which business should I launch first this week?",
  "Give me my exact next 3 moves to make money today.",
  "Write my LinkedIn launch post for SIXAB.",
  "What is the best niche for my AI Micro-SaaS?",
  "Build me a 7-day revenue sprint plan.",
  "How do I land my first paying client in 48 hours?",
]

const INITIAL = {
  role: "assistant",
  content: "Hey — I'm SIXXAB, your AI startup advisor.\n\nI'm built for founders who move fast. You have a 48-hour window to go from idea to first revenue — and I'm here to make every hour count.\n\nNo fluff. No vague strategy. Just numbered steps you can execute today.\n\nWhat are we building?",
}

function SixabIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="69" height="69" rx="15" fill="none" stroke="#EF9F27" strokeWidth="3"/>
      <text x="7" y="54" fontFamily="'Bebas Neue', sans-serif" fontSize="48" fill="none" stroke="#EF9F27" strokeWidth="1.5" letterSpacing="-3" paintOrder="stroke">S</text>
      <text x="35" y="54" fontFamily="'Bebas Neue', sans-serif" fontSize="54" fill="none" stroke="#EF9F27" strokeWidth="1.5" fontStyle="italic" letterSpacing="-3" paintOrder="stroke">X</text>
    </svg>
  )
}

function SixabWordmark({ size = 20, dark = false }) {
  const base = dark ? "#0A0E1A" : "#F5F5F0"
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", lineHeight: 1 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: size, color: base, letterSpacing: 2 }}>SIX</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: size * 1.18, color: "#EF9F27", fontStyle: "italic", letterSpacing: 1 }}>X</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: size, color: base, letterSpacing: 2 }}>AB</span>
      </div>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: size * 0.48, color: dark ? "#888780" : "#5F5E5A", letterSpacing: "0.15em" }}>startupsinabox.com</span>
    </div>
  )
}

export default function CoachPage() {
  const [messages, setMessages] = useState([INITIAL])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const { user, logout } = useAuth()
  const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0", INK = "#111520"

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])

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
    } catch (err) { setError(err.message); setMessages(messages) }
    finally { setLoading(false); textareaRef.current?.focus() }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  function autoResize(e) {
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F7F8FA}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#EF9F27;border-radius:2px}
        @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        .vd{display:inline-block;width:5px;height:5px;border-radius:50%;background:#9CA3AF;animation:blink 1.3s infinite}
        .vd:nth-child(2){animation-delay:.2s}.vd:nth-child(3){animation-delay:.4s}
        .qbtn{font-size:11px;padding:5px 12px;border-radius:20px;border:1px solid rgba(239,159,39,.3);background:rgba(239,159,39,.07);cursor:pointer;color:#EF9F27;white-space:nowrap;font-weight:500;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif}
        .qbtn:hover:not(:disabled){background:rgba(239,159,39,.15);border-color:#EF9F27}
        .qbtn:disabled{opacity:.4;cursor:not-allowed}
        .send-btn{width:38px;height:38px;border-radius:9px;border:none;background:#EF9F27;color:#0A0E1A;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:opacity .15s}
        .send-btn:disabled{background:#5F5E5A;cursor:not-allowed}
        .send-btn:not(:disabled):hover{opacity:.88}
        textarea:focus{outline:none;border-color:#EF9F27!important}
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, background: "#F7F8FA" }}>

        <div style={{ width: "100%", maxWidth: 720, marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/" style={{ fontSize: 12, color: "#64748B", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>← Home</a>
        </div>

        <div style={{ width: "100%", maxWidth: 720, height: "88vh", display: "flex", flexDirection: "column", background: N, borderRadius: 20, border: `1px solid rgba(239,159,39,.2)`, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,.25)" }}>

          {/* Header */}
          <header style={{ padding: "14px 20px", borderBottom: `1px solid rgba(255,255,255,.07)`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SixabIcon size={34} />
              <SixabWordmark size={22} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(245,245,240,.5)", padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,.08)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", animation: "pulse 2s infinite" }} />
                {user ? user.name?.split(" ")[0] : "Online"}
              </div>
              {user && (
                <button onClick={logout} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: "rgba(245,245,240,.35)", fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Sign out
                </button>
              )}
            </div>
          </header>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg, i) => {
              const isUser = msg.role === "user"
              return (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row" }}>
                  {isUser
                    ? <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, marginTop: 2, background: "rgba(239,159,39,.15)", color: AMBER }}>You</div>
                    : <SixabIcon size={30} />
                  }
                  <div style={{ maxWidth: "78%", padding: "11px 15px", borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px", fontSize: 13.5, lineHeight: 1.72, background: isUser ? "rgba(239,159,39,.12)" : "rgba(255,255,255,.04)", border: `1px solid ${isUser ? "rgba(239,159,39,.2)" : "rgba(255,255,255,.07)"}`, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "rgba(245,245,240,.9)" }}>
                    {msg.content}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <SixabIcon size={30} />
                <div style={{ padding: "13px 16px", borderRadius: "16px 16px 16px 4px", border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.04)", display: "flex", gap: 5, alignItems: "center" }}>
                  <span className="vd" /><span className="vd" /><span className="vd" />
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.25)", borderRadius: 10, fontSize: 12, color: "#FCA5A5", display: "flex", alignItems: "center", gap: 10 }}>
                <span>⚠ {error}</span>
                <button onClick={() => { setError(null); sendMessage(messages[messages.length - 1]?.content) }} style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(220,38,38,.3)", background: "transparent", color: "#FCA5A5", fontSize: 11, cursor: "pointer" }}>Retry</button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,.06)", background: INK }}>
            {QUICK_PROMPTS.map((q, i) => (
              <button key={i} className="qbtn" disabled={loading} onClick={() => sendMessage(q)}>
                {q.length > 46 ? q.slice(0, 46) + "…" : q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", gap: 8, alignItems: "flex-end", background: N }}>
            <textarea ref={textareaRef} value={input} onChange={e => { setInput(e.target.value); autoResize(e) }} onKeyDown={handleKeyDown}
              placeholder="Ask SIXXAB anything…" rows={1} disabled={loading}
              style={{ flex: 1, resize: "none", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "9px 13px", fontSize: 13.5, background: INK, color: CHALK, lineHeight: 1.55, minHeight: 40, maxHeight: 120, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
            <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading} aria-label="Send">↑</button>
          </div>
        </div>
      </div>
    </>
  )
}
