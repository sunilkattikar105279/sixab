// pages/email-automator.js — SIXXAB AI · Email Automator
import SixxabNav from "../components/SixxabNav"
import { ToolHeader, TOOL_STYLES } from "../components/ToolLayout"
import Head from "next/head"
import { useState } from "react"

const AMBER="#EF9F27",N="#0A0E1A",PINK="#D4537E"

const SEQ_TYPES=["Welcome sequence","Lead nurture","Sales sequence","Customer onboarding","Win-back campaign","Post-purchase follow-up","Event promotion","Product launch"]
const INDUSTRIES=["HVAC","Real Estate","Legal","Consulting","SaaS","Health & Wellness","Retail","Roofing","IT Services","Restaurant","Other"]

export default function EmailAutomatorPage() {
  const [form,setForm]=useState({bizName:"",industry:"",seqType:"Welcome sequence",audience:"",goal:"",emailCount:5,duration:"30 days"})
  const [out,setOut]=useState("")
  const [busy,setBusy]=useState(false)
  const [copied,setCopied]=useState(false)
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))

  async function run(){
    setBusy(true);setOut("")
    try{
      const r=await fetch("/api/automations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tool:"email_sequence",params:form})})
      const d=await r.json();setOut(d.result||d.error)
    }catch(e){setOut("Error: "+e.message)}
    setBusy(false)
  }

  // Parse emails from output
  const emailBlocks = out ? out.split(/EMAIL \d+/).filter(s=>s.trim()) : []

  return (
    <>
      <Head><title>SIXXAB AI — Email Automator</title></Head>
      <style>{TOOL_STYLES}</style>
      <SixxabNav active="/email-automator"/>
      <ToolHeader icon="ti-mail-forward" iconColor={PINK} iconBg="rgba(212,83,126,.18)" iconBorder="rgba(212,83,126,.4)" titleAccent="Email Automator" badge="Marketing Suite" badgeColor="#F9A8D4" badgeBg="rgba(212,83,126,.15)" badgeBorder="rgba(212,83,126,.35)" subtitle="Welcome · Nurture · Sales · Onboarding · Win-back · Post-purchase — full sequences generated in seconds" actions={[{href:"/leads",label:"Lead Gen →"},{href:"/calendar",label:"Calendar →"}]}/>

      <div className="tool-body">
        <div className="grid-2" style={{gap:16}}>
          <div className="card">
            <div className="card-hdr"><span className="card-hdr-title">Sequence setup</span></div>
            <div className="card-pad" style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <label className="lbl">Business name *</label>
                <input className="inp" placeholder="SIXXAB AI" value={form.bizName} onChange={e=>set("bizName",e.target.value)}/>
              </div>
              <div className="grid-2">
                <div>
                  <label className="lbl">Industry</label>
                  <select className="inp" value={form.industry} onChange={e=>set("industry",e.target.value)}>
                    <option value="">Select…</option>
                    {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Sequence type</label>
                  <select className="inp" value={form.seqType} onChange={e=>set("seqType",e.target.value)}>
                    {SEQ_TYPES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="lbl">Audience *</label>
                <input className="inp" placeholder="e.g. New leads who downloaded our guide" value={form.audience} onChange={e=>set("audience",e.target.value)}/>
              </div>
              <div>
                <label className="lbl">Sequence goal *</label>
                <input className="inp" placeholder="e.g. Book a discovery call within 14 days" value={form.goal} onChange={e=>set("goal",e.target.value)}/>
              </div>
              <div className="grid-2">
                <div>
                  <label className="lbl">Number of emails</label>
                  <select className="inp" value={form.emailCount} onChange={e=>set("emailCount",+e.target.value)}>
                    {[3,5,7,10].map(n=><option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Duration</label>
                  <select className="inp" value={form.duration} onChange={e=>set("duration",e.target.value)}>
                    {["7 days","14 days","30 days","60 days","90 days"].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" onClick={run} disabled={busy||!form.bizName||!form.audience||!form.goal} style={{width:"100%"}}>
                {busy?<><div className="spinner spinner-dark"/>Writing {form.emailCount} emails…</>:<><i className="ti ti-mail-forward" style={{fontSize:13}}/>Generate {form.emailCount}-email sequence →</>}
              </button>
            </div>
          </div>

          <div>
            {emailBlocks.length>0 ? (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
                  <div style={{fontSize:13,fontWeight:600,color:N}}>{emailBlocks.length} emails generated</div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{navigator.clipboard.writeText(out);setCopied(true);setTimeout(()=>setCopied(false),2000)}}>{copied?"✓ Copied":"Copy all"}</button>
                </div>
                {emailBlocks.map((block,i)=>{
                  const dayMatch = block.match(/Day (\d+)/i)
                  const subjMatch = block.match(/SUBJECT:\s*(.+)/i)
                  const day = dayMatch?.[1]||String(i+1)
                  const subj = subjMatch?.[1]?.trim()||"Email "+(i+1)
                  const body = block.replace(/^.*\n/,"").trim()
                  return (
                    <div key={i} className="card fu">
                      <div style={{padding:"10px 14px",background:"#FAFAFA",borderBottom:"1px solid #E8ECF4",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                        <div>
                          <div style={{fontSize:10,fontWeight:700,color:PINK,letterSpacing:".06em",marginBottom:2}}>EMAIL {i+1} · DAY {day}</div>
                          <div style={{fontSize:13,fontWeight:600,color:N}}>{subj}</div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={()=>navigator.clipboard.writeText(`Subject: ${subj}\n\n${body}`)}>Copy</button>
                      </div>
                      <div style={{padding:"12px 14px",fontSize:13,color:"#475569",lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:160,overflowY:"auto"}}>{body}</div>
                    </div>
                  )
                })}
              </div>
            ) : out ? (
              <div className="card fu">
                <div className="card-hdr"><span className="card-hdr-title">Email sequence</span><button className="btn btn-ghost btn-sm" onClick={()=>{navigator.clipboard.writeText(out);setCopied(true);setTimeout(()=>setCopied(false),2000)}}>{copied?"✓":"Copy all"}</button></div>
                <div style={{padding:"16px 18px",fontSize:13.5,lineHeight:1.85,whiteSpace:"pre-wrap",maxHeight:600,overflowY:"auto",color:N}}>{out}</div>
              </div>
            ) : (
              <div className="card" style={{padding:"48px 24px",textAlign:"center",color:"#94A3B8"}}>
                <i className="ti ti-mail-forward" style={{fontSize:36,color:"rgba(212,83,126,.3)",display:"block",marginBottom:12}}/>
                <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>Email Automator</div>
                <div style={{fontSize:13,maxWidth:280,margin:"0 auto",lineHeight:1.65}}>Generate complete email sequences — welcome, nurture, sales, onboarding, win-back. Every email is written and ready to load into your ESP.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
