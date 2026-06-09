// components/SupportWidget.js — SIXXAB AI Website Support Widget
import { useState, useEffect, useRef } from "react"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

const QUICK = [
  "What is SIXXAB AI?",
  "How much does it cost?",
  "Which plan should I choose?",
  "How does the Orchestrator work?",
  "Talk to a human",
]

const INIT = {
  role: "assistant",
  content: "Hi! I'm the SIXXAB AI support agent. I can answer questions about the platform, pricing, features or help you find the right tool.\n\nWhat can I help you with?"
}

export default function SupportWidget() {
  const [open,      setOpen]      = useState(false)
  const [messages,  setMessages]  = useState([INIT])
  const [input,     setInput]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const [email,     setEmail]     = useState("")
  const [showEmail, setShowEmail] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [unread,    setUnread]    = useState(0)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" })
  }, [messages, loading])

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(()=>inputRef.current?.focus(), 100) }
  }, [open])

  async function send(override) {
    const text = (override || input).trim()
    if (!text || loading) return
    setInput("")
    if (/human|talk to|escalate|call/i.test(text)) {
      setMessages(m=>[...m,{role:"user",content:text},{role:"assistant",content:"I'll connect you with Sunil directly. Leave your email below and he'll reply within a few hours."}])
      setShowEmail(true)
      return
    }
    const next = [...messages, {role:"user",content:text}]
    setMessages(next)
    setLoading(true)
    try {
      const r = await fetch("/api/support",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next})})
      const d = await r.json()
      const reply = d.reply || "I'm not sure — let me connect you with Sunil."
      setMessages(m=>[...m,{role:"assistant",content:reply}])
      if (!open) setUnread(u=>u+1)
      if (/Sunil|connect you/i.test(reply)) setShowEmail(true)
    } catch {
      setMessages(m=>[...m,{role:"assistant",content:"Something went wrong — email sunil.kattikar@gmail.com directly."}])
    }
    setLoading(false)
  }

  async function escalate() {
    if (!email.includes("@")) return
    setLoading(true)
    try {
      await fetch("/api/support",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages,visitorEmail:email,escalate:true})})
      setEscalated(true)
      setMessages(m=>[...m,{role:"assistant",content:`✓ Done! Sunil will email you at ${email} within a few hours. You can also book a call at startupsinabox.com/discovery`}])
      setShowEmail(false)
    } catch {
      setMessages(m=>[...m,{role:"assistant",content:"Couldn't send — email sunil.kattikar@gmail.com directly."}])
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @keyframes sw-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sw-spin{to{transform:rotate(360deg)}}
        /* Widget trigger button — always fixed bottom-right */
        .sw-btn{
          position:fixed;bottom:20px;right:16px;z-index:9999;
          width:50px;height:50px;border-radius:50%;
          background:#0A0E1A;border:2px solid #EF9F27;
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 20px rgba(0,0,0,.3);transition:transform .2s;
        }
        .sw-btn:hover{transform:scale(1.06)}
        /* Badge */
        .sw-badge{
          position:absolute;top:-4px;right:-4px;
          width:18px;height:18px;border-radius:50%;
          background:#DC2626;color:#fff;font-size:10px;font-weight:700;
          display:flex;align-items:center;justify-content:center;
          border:2px solid #0A0E1A;
        }
        /* Panel — fixed, stays on screen on mobile */
        .sw-panel{
          position:fixed;
          bottom:80px;
          right:16px;
          left:16px;
          max-width:360px;
          margin-left:auto;
          background:#fff;
          border-radius:16px;
          box-shadow:0 8px 40px rgba(0,0,0,.2);
          border:1px solid #E2E8F0;
          z-index:9998;
          animation:sw-up .25s ease;
          display:flex;
          flex-direction:column;
          max-height:calc(100vh - 110px);
          overflow:hidden;
        }
        /* On wider screens, anchor to right only */
        @media(min-width:420px){
          .sw-panel{left:auto;width:340px}
          .sw-btn{bottom:24px;right:20px}
        }
        .sw-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
        .sw-user{background:rgba(239,159,39,.12);border:1px solid rgba(239,159,39,.25);border-radius:13px 13px 3px 13px;padding:8px 12px;max-width:83%;margin-left:auto;font-size:13px;line-height:1.6;color:#0A0E1A;white-space:pre-wrap;word-break:break-word}
        .sw-ai{background:#F8F9FA;border:1px solid #E8ECF4;border-radius:13px 13px 13px 3px;padding:8px 12px;max-width:88%;font-size:13px;line-height:1.7;color:#0A0E1A;white-space:pre-wrap;word-break:break-word}
        .sw-quick{font-size:11px;padding:4px 10px;border-radius:18px;border:1px solid rgba(239,159,39,.35);background:rgba(239,159,39,.07);cursor:pointer;color:#EF9F27;font-weight:500;white-space:nowrap;font-family:inherit}
        .sw-quick:hover{background:rgba(239,159,39,.18)}
        .sw-inp{flex:1;border:1.5px solid #E2E8F0;border-radius:8px;padding:8px 11px;font-size:13px;font-family:inherit;outline:none;resize:none;line-height:1.5;max-height:70px;color:#0A0E1A}
        .sw-inp:focus{border-color:#EF9F27}
        .sw-send{width:34px;height:34px;border-radius:8px;border:none;background:#EF9F27;color:#0A0E1A;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px}
        .sw-send:disabled{background:#F1F5F9;cursor:not-allowed}
        .sw-spin{width:12px;height:12px;border:2px solid rgba(10,14,26,.2);border-top-color:#0A0E1A;border-radius:50%;animation:sw-spin .7s linear infinite}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:#EF9F27;border-radius:2px}
      `}</style>

      {/* Panel */}
      {open && (
        <div className="sw-panel">
          {/* Header */}
          <div style={{background:N,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:30,height:30,borderRadius:8,background:"rgba(239,159,39,.18)",border:"1px solid rgba(239,159,39,.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="17" height="17" viewBox="0 0 72 72"><rect x="2" y="2" width="68" height="68" rx="14" fill="none" stroke={AMBER} strokeWidth="3"/><text x="7" y="52" fontFamily="Georgia,serif" fontSize="44" fill="none" stroke={AMBER} strokeWidth="1.5">S</text><text x="34" y="54" fontFamily="Georgia,serif" fontSize="50" fill="none" stroke={AMBER} strokeWidth="1.5" fontStyle="italic">X</text></svg>
              </div>
              <div>
                <div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:700,color:CHALK}}>SIXXAB <span style={{color:AMBER,fontStyle:"italic"}}>AI</span></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:"#1D9E75"}}/>
                  <span style={{fontSize:9.5,color:"rgba(245,245,240,.45)"}}>Support · Usually instant</span>
                </div>
              </div>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(245,245,240,.4)",fontSize:20,lineHeight:1,padding:0}}>×</button>
          </div>

          {/* Messages */}
          <div className="sw-msgs">
            {messages.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div className={m.role==="user"?"sw-user":"sw-ai"}>{m.content}</div>
              </div>
            ))}
            {loading && <div style={{display:"flex"}}><div className="sw-ai" style={{color:"#94A3B8"}}>Thinking…</div></div>}
            <div ref={bottomRef}/>
          </div>

          {/* Quick prompts */}
          {messages.length===1 && (
            <div style={{padding:"6px 10px 8px",display:"flex",gap:5,flexWrap:"wrap",borderTop:"1px solid #F1F5F9",flexShrink:0}}>
              {QUICK.map((q,i)=><button key={i} className="sw-quick" onClick={()=>send(q)}>{q}</button>)}
            </div>
          )}

          {/* Email escalation */}
          {showEmail && !escalated && (
            <div style={{padding:"10px 12px",borderTop:"1px solid #F1F5F9",background:"#FFFBF2",flexShrink:0}}>
              <div style={{fontSize:12,fontWeight:500,color:N,marginBottom:5}}>Your email:</div>
              <div style={{display:"flex",gap:6}}>
                <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&escalate()}
                  style={{flex:1,padding:"7px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:12.5,fontFamily:"inherit",outline:"none"}}/>
                <button onClick={escalate} style={{padding:"7px 12px",borderRadius:8,background:AMBER,color:N,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600}}>Connect</button>
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{padding:"8px 10px",borderTop:"1px solid #E8ECF4",display:"flex",gap:7,alignItems:"flex-end",flexShrink:0}}>
            <textarea ref={inputRef} className="sw-inp" rows={1} value={input}
              onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,70)+"px"}}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())}
              placeholder="Type a question…"/>
            <button className="sw-send" onClick={()=>send()} disabled={!input.trim()||loading}>
              {loading?<div className="sw-spin"/>:"↑"}
            </button>
          </div>

          {/* Footer */}
          <div style={{padding:"6px 12px",background:"#F8F9FA",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <span style={{fontSize:10,color:"#94A3B8"}}>Powered by SIXXAB AI</span>
            <a href="/discovery" style={{fontSize:10.5,color:AMBER,textDecoration:"none",fontWeight:500}}>Book free call →</a>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button className="sw-btn" onClick={()=>setOpen(o=>!o)} aria-label="Open support chat">
        {unread>0 && <div className="sw-badge">{unread}</div>}
        {open
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>
    </>
  )
}
