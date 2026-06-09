// pages/seo.js — SIXXAB AI · SEO Analyzer
import SixxabNav from "../components/SixxabNav"
import { ToolHeader, TOOL_STYLES } from "../components/ToolLayout"
import Head from "next/head"
import { useState } from "react"

const AMBER = "#EF9F27", N = "#0A0E1A", GREEN = "#1D9E75"
const INDUSTRIES = ["HVAC","Real Estate","Legal","Consulting","Health & Wellness","Roofing","IT / MSP","Restaurant","Retail","SaaS","Other"]
const LOCATIONS  = ["Dallas, TX","Houston, TX","Austin, TX","DFW Metroplex","United States","United Kingdom","Other"]

export default function SeoPage() {
  const [form, setForm] = useState({ bizName:"", industry:"", location:"Dallas, TX", website:"", keywords:"" })
  const [out, setOut]   = useState("")
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  async function run() {
    setBusy(true); setOut("")
    try {
      const r = await fetch("/api/automations", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ tool:"seo_audit", params:form }) })
      const d = await r.json()
      setOut(d.result || d.error || "Error")
    } catch(e) { setOut("Network error: "+e.message) }
    setBusy(false)
  }

  return (
    <>
      <Head><title>SIXXAB AI — SEO Analyzer</title></Head>
      <style>{TOOL_STYLES}</style>
      <SixxabNav active="/seo"/>
      <ToolHeader icon="ti-chart-bar" iconColor="#378ADD" iconBg="rgba(55,138,221,.18)" iconBorder="rgba(55,138,221,.4)" titleAccent="SEO Analyzer" badge="Marketing Suite" badgeColor="#93C5FD" badgeBg="rgba(55,138,221,.15)" badgeBorder="rgba(55,138,221,.35)" subtitle="Keyword research · On-page audit · Local SEO · Content gaps · 90-day action plan" actions={[{href:"/studio",label:"Content Studio →"},{href:"/website-builder",label:"Website Builder →"}]}/>
      <div className="tool-body">
        <div className="grid-2" style={{gap:16}}>
          <div className="card">
            <div className="card-hdr"><span className="card-hdr-title">Business details</span></div>
            <div className="card-pad" style={{display:"flex",flexDirection:"column",gap:12}}>
              {[["bizName","Business name *","Dallas Pro HVAC"],["website","Website URL","https://"],["keywords","Target keywords","AC repair Dallas, HVAC installation"]].map(([k,l,ph])=>(
                <div key={k}>
                  <label className="lbl">{l}</label>
                  <input className="inp" placeholder={ph} value={form[k]} onChange={e=>set(k,e.target.value)}/>
                </div>
              ))}
              <div className="grid-2">
                <div>
                  <label className="lbl">Industry</label>
                  <select className="inp" value={form.industry} onChange={e=>set("industry",e.target.value)}>
                    <option value="">Select…</option>
                    {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Location</label>
                  <select className="inp" value={form.location} onChange={e=>set("location",e.target.value)}>
                    {LOCATIONS.map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" onClick={run} disabled={busy||!form.bizName||!form.industry} style={{width:"100%"}}>
                {busy?<><div className="spinner spinner-dark"/>Running SEO audit…</>:<><i className="ti ti-search" style={{fontSize:13}}/>Run SEO analysis →</>}
              </button>
            </div>
          </div>
          <div>
            {out ? (
              <div className="card fu">
                <div className="card-hdr">
                  <span className="card-hdr-title">SEO Report — {form.bizName}</span>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{navigator.clipboard.writeText(out);setCopied(true);setTimeout(()=>setCopied(false),2000)}}>{copied?"✓ Copied!":"Copy report"}</button>
                </div>
                <div style={{padding:"18px 20px",fontSize:13.5,lineHeight:1.9,whiteSpace:"pre-wrap",maxHeight:640,overflowY:"auto",color:N}}>{out}</div>
                <div style={{padding:"10px 16px",borderTop:"1px solid #E8ECF4",background:"#FAFAFA",display:"flex",gap:8,flexWrap:"wrap"}}>
                  <a className="btn btn-ghost btn-sm" href="/studio">Create SEO content →</a>
                  <a className="btn btn-ghost btn-sm" href="/website-builder">Fix website SEO →</a>
                  <a className="btn btn-ghost btn-sm" href="/calendar">Schedule blog posts →</a>
                </div>
              </div>
            ) : (
              <div className="card" style={{padding:"48px 24px",textAlign:"center",color:"#94A3B8"}}>
                <i className="ti ti-chart-bar" style={{fontSize:36,color:"rgba(55,138,221,.3)",display:"block",marginBottom:12}}/>
                <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>SEO Analyzer</div>
                <div style={{fontSize:13,maxWidth:280,margin:"0 auto",lineHeight:1.65}}>Enter your business details and get a complete SEO audit with keywords, fixes and a 90-day action plan.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
