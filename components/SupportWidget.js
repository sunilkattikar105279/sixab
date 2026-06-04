// components/SupportWidget.js — SIXXAB AI Website Support Widget
// Drop <SupportWidget/> into any page — works on landing and all module pages
import { useState, useRef, useEffect } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

const QUICK = [
  "What is SIXXAB AI?",
  "How much does it cost?",
  "Which plan should I choose?",
  "What is the Niche Selector?",
  "How does the Orchestrator work?",
  "Can I cancel anytime?",
  "Do you work with HVAC businesses?",
  "Talk to a human",
]

const INIT = {
  role: "assistant",
  content: "Hi! I'm the SIXXAB AI support agent. I can answer questions about the platform, pricing, features or help you find the right tool for your business.\n\nWhat can I help you with?"
}

export default function SupportWidget() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState([INIT])
  const [input,    setInput]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [email,    setEmail]    = useState("")
  const [showEmail,setShowEmail]= useState(false)
  const [escalated,setEscalated]= useState(false)
  const [pulse,    setPulse]    = useState(true)
  const [unread,   setUnread]   = useState(0)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    // Stop pulsing after 5s
    const t = setTimeout(() => setPulse(false), 5000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  useEffect(() => {
    if (open) { setUnread(0); inputRef.current?.focus() }
  }, [open])

  async function send(override) {
    const text = (override || input).trim()
    if (!text || loading) return
    setInput("")

    // "Talk to human" shortcut
    if (text.toLowerCase().includes("human") || text.toLowerCase().includes("talk to") || text.toLowerCase().includes("escalate")) {
      setMessages(m => [...m,
        { role:"user", content: text },
        { role:"assistant", content: "Of course! I'll connect you with Sunil directly. Leave your email below and he'll get back to you within a few hours." }
      ])
      setShowEmail(true)
      return
    }

    const next = [...messages, { role:"user", content: text }]
    setMessages(next)
    setLoading(true)
    try {
      const r = await fetch("/api/support", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next })
      })
      const d = await r.json()
      const reply = d.reply || "I'm not sure about that — let me connect you with Sunil."
      setMessages(m => [...m, { role:"assistant", content: reply }])
      if (!open) setUnread(u => u + 1)
      // Auto-offer escalation if AI seems unsure
      if (reply.includes("Sunil") || reply.includes("connect you")) setShowEmail(true)
    } catch {
      setMessages(m => [...m, { role:"assistant", content: "Something went wrong — please email sunil.kattikar@gmail.com directly." }])
    }
    setLoading(false)
  }

  async function escalate() {
    if (!email.includes("@")) return
    setLoading(true)
    try {
      await fetch("/api/support", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, visitorEmail: email, escalate: true })
      })
      setEscalated(true)
      setMessages(m => [...m, { role:"assistant", content: `✓ Done! Sunil will email you at ${email} within a few hours. In the meantime you can also book a free call at startupsinabox.com/discovery` }])
      setShowEmail(false)
    } catch {
      setMessages(m => [...m, { role:"assistant", content: "Couldn't send — please email sunil.kattikar@gmail.com directly." }])
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @keyframes s-fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes s-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,159,39,.5)}70%{box-shadow:0 0 0 10px rgba(239,159,39,0)}}
        @keyframes s-spin{to{transform:rotate(360deg)}}
        .s-widget{position:fixed;bottom:24px;right:24px;z-index:9999;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
        .s-btn{width:54px;height:54px;border-radius:50%;background:#0A0E1A;border:2.5px solid #EF9F27;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(0,0,0,.25);transition:all .2s;position:relative}
        .s-btn:hover{transform:scale(1.06)}
        .s-pulse{animation:s-pulse 1.8s infinite}
        .s-badge{position:absolute;top:-3px;right:-3px;width:18px;height:18px;border-radius:50%;background:#DC2626;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff}
        .s-panel{position:absolute;bottom:66px;right:0;width:340px;background:#fff;border-radius:18px;box-shadow:0 16px 48px rgba(0,0,0,.18);overflow:hidden;animation:s-fadeUp .28s ease;border:1px solid #E2E8F0}
        .s-user{background:rgba(239,159,39,.13);border:1px solid rgba(239,159,39,.25);border-radius:14px 14px 4px 14px;padding:9px 13px;max-width:82%;margin-left:auto;font-size:13px;line-height:1.65;color:#0A0E1A;white-space:pre-wrap;word-break:break-word}
        .s-ai{background:#F8F9FA;border:1px solid #E8ECF4;border-radius:14px 14px 14px 4px;padding:9px 13px;max-width:88%;font-size:13px;line-height:1.7;color:#0A0E1A;white-space:pre-wrap;word-break:break-word}
        .s-quick{font-size:11px;padding:5px 11px;border-radius:20px;border:1px solid rgba(239,159,39,.35);background:rgba(239,159,39,.07);cursor:pointer;color:#EF9F27;font-weight:500;white-space:nowrap;transition:all .14s;font-family:inherit}
        .s-quick:hover{background:rgba(239,159,39,.18)}
        .s-inp{flex:1;border:1.5px solid #E2E8F0;border-radius:9px;padding:8px 12px;font-size:13px;font-family:inherit;outline:none;resize:none;line-height:1.5;max-height:80px;color:#0A0E1A}
        .s-inp:focus{border-color:#EF9F27}
        .s-send{width:36px;height:36px;border-radius:9px;border:none;background:#EF9F27;color:#0A0E1A;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s}
        .s-send:disabled{background:#F1F5F9;cursor:not-allowed}
        .s-email-inp{width:100%;padding:8px 11px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:12.5px;font-family:inherit;outline:none}
        .s-email-inp:focus{border-color:#EF9F27}
      `}</style>

      <div className="s-widget">
        {/* ── Chat panel ── */}
        {open && (
          <div className="s-panel">
            {/* Header */}
            <div style={{background:N,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:32,height:32,borderRadius:9,background:"rgba(239,159,39,.18)",border:"1.5px solid rgba(239,159,39,.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="18" height="18" viewBox="0 0 72 72"><rect x="1.5" y="1.5" width="69" height="69" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/><text x="7" y="54" fontFamily="Georgia,serif" fontSize="48" fill="none" stroke={AMBER} strokeWidth="1.5" letterSpacing="-3">S</text><text x="35" y="54" fontFamily="Georgia,serif" fontSize="54" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic" letterSpacing="-3">X</text></svg>
                </div>
                <div>
                  <div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:700,color:CHALK,letterSpacing:.5,lineHeight:1}}>
                    SIX<span style={{color:AMBER,fontStyle:"italic"}}>X</span>AB <span style={{fontSize:8,color:"rgba(245,245,240,.35)",letterSpacing:2}}>AI</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"#1D9E75"}}/>
                    <span style={{fontSize:9.5,color:"rgba(245,245,240,.45)"}}>Support · Usually replies instantly</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <a href="/runbook" target="_blank" style={{fontSize:10.5,color:"rgba(245,245,240,.4)",textDecoration:"none"}}>Runbook</a>
                <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(245,245,240,.4)",fontSize:20,lineHeight:1}}>×</button>
              </div>
            </div>

            {/* Messages */}
            <div style={{height:300,overflowY:"auto",padding:"14px 14px 8px",display:"flex",flexDirection:"column",gap:9}}>
              {messages.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                  <div className={m.role==="user"?"s-user":"s-ai"}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div style={{display:"flex"}}>
                  <div className="s-ai" style={{color:"#94A3B8"}}>
                    <span style={{display:"inline-block",width:4,height:4,borderRadius:"50%",background:"#94A3B8",marginRight:3,animation:"s-pulse 1s infinite"}}/>
                    <span style={{display:"inline-block",width:4,height:4,borderRadius:"50%",background:"#94A3B8",marginRight:3,animation:"s-pulse 1s .2s infinite"}}/>
                    <span style={{display:"inline-block",width:4,height:4,borderRadius:"50%",background:"#94A3B8",animation:"s-pulse 1s .4s infinite"}}/>
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Quick prompts */}
            {messages.length === 1 && (
              <div style={{padding:"6px 12px 8px",display:"flex",gap:6,flexWrap:"wrap",borderTop:"1px solid #F1F5F9"}}>
                {QUICK.slice(0,5).map((q,i)=>(
                  <button key={i} className="s-quick" onClick={()=>send(q)}>{q}</button>
                ))}
              </div>
            )}

            {/* Email escalation */}
            {showEmail && !escalated && (
              <div style={{padding:"10px 14px",borderTop:"1px solid #F1F5F9",background:"#FFFBF2"}}>
                <div style={{fontSize:12,fontWeight:500,color:N,marginBottom:6}}>Your email address:</div>
                <div style={{display:"flex",gap:7}}>
                  <input className="s-email-inp" type="email" placeholder="you@example.com"
                    value={email} onChange={e=>setEmail(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&escalate()}/>
                  <button onClick={escalate}
                    style={{padding:"7px 14px",borderRadius:8,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>
                    Connect
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div style={{padding:"10px 12px",borderTop:"1px solid #E8ECF4",display:"flex",gap:8,alignItems:"flex-end"}}>
              <textarea ref={inputRef} className="s-inp" rows={1} value={input}
                onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,80)+"px"}}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())}
                placeholder="Type a question…"/>
              <button className="s-send" onClick={()=>send()} disabled={!input.trim()||loading}>
                {loading
                  ? <div style={{width:13,height:13,border:"2px solid rgba(10,14,26,.2)",borderTopColor:N,borderRadius:"50%",animation:"s-spin .7s linear infinite"}}/>
                  : "↑"}
              </button>
            </div>

            {/* Footer */}
            <div style={{padding:"7px 14px",background:"#F8F9FA",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:"#94A3B8"}}>Powered by SIXXAB AI</span>
              <div style={{display:"flex",gap:10}}>
                <a href="/discovery" target="_blank" style={{fontSize:10.5,color:AMBER,textDecoration:"none",fontWeight:500}}>Book free call →</a>
              </div>
            </div>
          </div>
        )}

        {/* ── Trigger button ── */}
        <button className={`s-btn${pulse?" s-pulse":""}`} onClick={()=>setOpen(o=>!o)}
          aria-label="Open support chat">
          {unread > 0 && <div className="s-badge">{unread}</div>}
          {open
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          }
        </button>
      </div>
    </>
  )
}
