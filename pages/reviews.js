// pages/reviews.js — SIXXAB AI · Review Manager
import SixxabNav from "../components/SixxabNav"
import { ToolHeader, TOOL_STYLES } from "../components/ToolLayout"
import Head from "next/head"
import { useState } from "react"

const AMBER="#EF9F27",N="#0A0E1A"
const PLATFORMS=["Google Business Profile","Facebook Reviews","Yelp","Trustpilot","G2","Clutch","TripAdvisor"]
const INDUSTRIES=["HVAC","Real Estate","Legal","Restaurant","Health & Wellness","Roofing","IT Services","Retail","Auto Repair","Cleaning","Other"]

export default function ReviewsPage() {
  const [form,setForm]=useState({bizName:"",industry:"",location:"Dallas, TX",platform:"Google Business Profile",rating:5,reviewer:"",reviewText:""})
  const [out,setOut]=useState("")
  const [busy,setBusy]=useState(false)
  const [copied,setCopied]=useState(null)
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))

  async function run(){
    setBusy(true);setOut("")
    try{
      const r=await fetch("/api/automations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tool:"review_manager",params:form})})
      const d=await r.json();setOut(d.result||d.error)
    }catch(e){setOut("Error: "+e.message)}
    setBusy(false)
  }

  // Parse sections from output
  const sections = out ? out.split(/##\s+/).filter(s=>s.trim()) : []

  return (
    <>
      <Head><title>SIXXAB AI — Review Manager</title></Head>
      <style>{TOOL_STYLES}</style>
      <SixxabNav active="/reviews"/>
      <ToolHeader icon="ti-star" iconColor="#F59E0B" iconBg="rgba(245,158,11,.18)" iconBorder="rgba(245,158,11,.4)" titleAccent="Review Manager" badge="Finance Suite" badgeColor="#FCD34D" badgeBg="rgba(245,158,11,.15)" badgeBorder="rgba(245,158,11,.35)" subtitle="Respond to reviews · Request more reviews · 5-star review strategy · Google · Facebook · Yelp"/>

      <div className="tool-body">
        <div className="grid-2" style={{gap:16}}>
          <div className="card">
            <div className="card-hdr"><span className="card-hdr-title">Review details</span></div>
            <div className="card-pad" style={{display:"flex",flexDirection:"column",gap:11}}>
              <div>
                <label className="lbl">Business name *</label>
                <input className="inp" placeholder="Dallas Pro HVAC" value={form.bizName} onChange={e=>set("bizName",e.target.value)}/>
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
                  <label className="lbl">Platform</label>
                  <select className="inp" value={form.platform} onChange={e=>set("platform",e.target.value)}>
                    {PLATFORMS.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="lbl">Star rating</label>
                <div style={{display:"flex",gap:8,marginTop:2}}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>set("rating",n)}
                      style={{width:36,height:36,borderRadius:8,border:`1.5px solid ${form.rating>=n?"#F59E0B":"#E2E8F0"}`,background:form.rating>=n?"rgba(245,158,11,.12)":"#fff",cursor:"pointer",fontSize:18,transition:"all .14s"}}>
                      {form.rating>=n?"★":"☆"}
                    </button>
                  ))}
                  <span style={{fontSize:13,color:"#64748B",alignSelf:"center",marginLeft:4}}>{form.rating} star{form.rating!==1?"s":""}</span>
                </div>
              </div>
              <div>
                <label className="lbl">Reviewer name (optional)</label>
                <input className="inp" placeholder="John S." value={form.reviewer} onChange={e=>set("reviewer",e.target.value)}/>
              </div>
              <div>
                <label className="lbl">Review text (paste it here)</label>
                <textarea className="inp" rows={3} placeholder="The team was fantastic and arrived on time…" value={form.reviewText} onChange={e=>set("reviewText",e.target.value)}/>
              </div>
              <button className="btn btn-primary" onClick={run} disabled={busy||!form.bizName||!form.industry} style={{width:"100%"}}>
                {busy?<><div className="spinner spinner-dark"/>Generating…</>:<><i className="ti ti-star" style={{fontSize:13}}/>Generate review content →</>}
              </button>
            </div>
          </div>

          <div>
            {sections.length>0 ? (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {sections.map((section,i)=>{
                  const lines = section.split("\n")
                  const title = lines[0].trim()
                  const body  = lines.slice(1).join("\n").trim()
                  return (
                    <div key={i} className="card fu">
                      <div style={{padding:"10px 14px",background:"#FAFAFA",borderBottom:"1px solid #E8ECF4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontSize:12.5,fontWeight:700,color:N}}>{title}</span>
                        <button className="btn btn-ghost btn-sm" onClick={()=>{navigator.clipboard.writeText(body);setCopied(i);setTimeout(()=>setCopied(null),2000)}}>{copied===i?"✓ Copied":"Copy"}</button>
                      </div>
                      <div style={{padding:"12px 14px",fontSize:13.5,color:"#475569",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{body}</div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="card" style={{padding:"48px 24px",textAlign:"center",color:"#94A3B8"}}>
                <i className="ti ti-star" style={{fontSize:36,color:"rgba(245,158,11,.3)",display:"block",marginBottom:12}}/>
                <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>Review Manager</div>
                <div style={{fontSize:13,maxWidth:300,margin:"0 auto",lineHeight:1.65}}>
                  Paste any review and get a professional response, a review-request email and SMS, and a strategy to generate more 5-star reviews.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
