// pages/analytics.js — SIXXAB AI · Analytics Dashboard
import SixxabNav from "../components/SixxabNav"
import { ToolHeader, TOOL_STYLES } from "../components/ToolLayout"
import Head from "next/head"
import { useState, useEffect } from "react"

const AMBER="#EF9F27",N="#0A0E1A",GREEN="#1D9E75"

export default function AnalyticsPage() {
  const [metrics,setMetrics]=useState({mrr:0,newCustomers:0,churned:0,leads:0,convRate:0,dealSize:0,topChannel:"LinkedIn"})
  const [crmStats,setCrmStats]=useState({total:0,byStage:{}})
  const [out,setOut]=useState("")
  const [busy,setBusy]=useState(false)
  const [bizName,setBizName]=useState("My Business")
  const [period,setPeriod]=useState("Last 30 days")

  useEffect(()=>{
    try{
      const contacts=JSON.parse(localStorage.getItem("sixxab_crm_contacts")||"[]")
      const byStage=contacts.reduce((a,c)=>{a[c.stage]=(a[c.stage]||0)+1;return a},{})
      const closed=contacts.filter(c=>c.stage==="Closed ✓"||c.stage==="Active"||c.stage==="Renewal")
      const mrr=closed.reduce((a,c)=>a+(c.value==="Pro"?999:c.value==="Agency"?2499:250),0)
      const leads=contacts.filter(c=>c.stage==="Prospect"||c.stage==="Outreach").length
      setCrmStats({total:contacts.length,byStage})
      setMetrics(m=>({...m,mrr,leads,newCustomers:closed.length}))
    }catch{}
  },[])

  const set=(k,v)=>setMetrics(m=>({...m,[k]:v}))

  async function runReport(){
    setBusy(true);setOut("")
    try{
      const r=await fetch("/api/automations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tool:"analytics_report",params:{bizName,...metrics,period}})})
      const d=await r.json();setOut(d.result||d.error)
    }catch(e){setOut("Error: "+e.message)}
    setBusy(false)
  }

  const STAGE_COLORS={"Prospect":"#64748B","Outreach":"#EF9F27","Replied":"#378ADD","Demo":"#7C3AED","Proposal":"#EC4899","Closed ✓":"#1D9E75","Active":"#1D9E75","At Risk":"#DC2626","Churned":"#94A3B8"}

  return (
    <>
      <Head><title>SIXXAB AI — Analytics Dashboard</title></Head>
      <style>{TOOL_STYLES}</style>
      <SixxabNav active="/analytics"/>
      <ToolHeader icon="ti-chart-pie" iconColor={GREEN} iconBg="rgba(29,158,117,.18)" iconBorder="rgba(29,158,117,.4)" titleAccent="Analytics" badge="Finance Suite" badgeColor="#6EE7B7" badgeBg="rgba(29,158,117,.15)" badgeBorder="rgba(29,158,117,.35)" subtitle="Revenue · Pipeline · MRR · Churn · CAC · LTV — auto-synced from SIXXAB CRM" stats={[["MRR","$"+metrics.mrr.toLocaleString(),GREEN],["Leads",metrics.leads,AMBER],["Contacts",crmStats.total,"#378ADD"]]} actions={[{href:"/crm",label:"Open CRM →"},{href:"/retention",label:"Pipeline →"}]}/>

      <div className="tool-body">
        {/* KPI cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:16}}>
          {[["Monthly Revenue","$"+metrics.mrr.toLocaleString(),GREEN,"ti-trending-up"],["Active Customers",metrics.newCustomers,"#378ADD","ti-users"],["Leads in Pipeline",metrics.leads,AMBER,"ti-user-search"],["Conversion Rate",metrics.convRate+"%","#7C3AED","ti-percentage"],["Avg Deal Size","$"+metrics.dealSize,"#EC4899","ti-receipt"],["CRM Contacts",crmStats.total,"#64748B","ti-address-book"]].map(([l,v,c,ico])=>(
            <div key={l} className="card card-pad" style={{textAlign:"center"}}>
              <i className={`ti ${ico}`} style={{fontSize:18,color:c,display:"block",marginBottom:6}} aria-hidden="true"/>
              <div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:c,lineHeight:1,marginBottom:4}}>{v}</div>
              <div style={{fontSize:11,color:"#94A3B8"}}>{l}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{gap:16,alignItems:"start"}}>
          {/* Pipeline breakdown from CRM */}
          <div className="card">
            <div className="card-hdr"><span className="card-hdr-title">Pipeline breakdown — live from CRM</span></div>
            <div className="card-pad">
              {Object.entries(crmStats.byStage).length===0 ? (
                <div style={{textAlign:"center",padding:"20px",color:"#94A3B8",fontSize:13}}>No CRM data yet. <a href="/crm" style={{color:AMBER}}>Open CRM →</a></div>
              ) : Object.entries(crmStats.byStage).sort((a,b)=>b[1]-a[1]).map(([stage,count])=>{
                const max=Math.max(...Object.values(crmStats.byStage))
                const pct=(count/max)*100
                return (
                  <div key={stage} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12.5}}>
                      <span style={{color:N,fontWeight:500}}>{stage}</span>
                      <span style={{color:"#64748B",fontWeight:600}}>{count}</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"#F1F5F9",overflow:"hidden"}}>
                      <div style={{height:"100%",width:pct+"%",background:STAGE_COLORS[stage]||"#94A3B8",borderRadius:3,transition:"width .4s"}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* AI report generator */}
          <div className="card">
            <div className="card-hdr"><span className="card-hdr-title">AI performance report</span></div>
            <div className="card-pad" style={{display:"flex",flexDirection:"column",gap:10}}>
              <div className="grid-2">
                <div>
                  <label className="lbl">Business name</label>
                  <input className="inp" value={bizName} onChange={e=>setBizName(e.target.value)}/>
                </div>
                <div>
                  <label className="lbl">Period</label>
                  <select className="inp" value={period} onChange={e=>setPeriod(e.target.value)}>
                    {["Last 7 days","Last 30 days","Last 90 days","This year"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {[["convRate","Conversion rate %"],["dealSize","Avg deal size $"],["churned","Churned customers"]].map(([k,l])=>(
                <div key={k}>
                  <label className="lbl">{l}</label>
                  <input type="number" className="inp" value={metrics[k]} onChange={e=>set(k,+e.target.value)}/>
                </div>
              ))}
              <button className="btn btn-green" onClick={runReport} disabled={busy} style={{width:"100%"}}>
                {busy?<><div className="spinner"/>Generating report…</>:<><i className="ti ti-chart-pie" style={{fontSize:13}}/>Generate AI report →</>}
              </button>
              {out&&(
                <div style={{fontSize:13,lineHeight:1.85,whiteSpace:"pre-wrap",maxHeight:400,overflowY:"auto",color:N,padding:"4px 0"}}>{out}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
