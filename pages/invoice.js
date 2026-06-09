// pages/invoice.js — SIXXAB AI · Invoice Generator
import SixxabNav from "../components/SixxabNav"
import { ToolHeader, TOOL_STYLES } from "../components/ToolLayout"
import Head from "next/head"
import { useState } from "react"

const AMBER = "#EF9F27", N = "#0A0E1A"

export default function InvoicePage() {
  const emptyItem = { desc:"", qty:1, rate:0 }
  const [from, setFrom] = useState({ name:"", email:"", address:"" })
  const [to,   setTo]   = useState({ name:"", company:"", email:"" })
  const [items,setItems]= useState([{...emptyItem}])
  const [meta, setMeta] = useState({ invoiceNum:"", date:new Date().toISOString().slice(0,10), dueDate:"Net 30", tax:0, notes:"Thank you for your business." })
  const [out,  setOut]  = useState("")
  const [busy, setBusy] = useState(false)
  const [copied,setCopied]=useState(false)

  const subtotal = items.reduce((a,i)=>a+(+i.qty*(+i.rate||0)),0)
  const tax      = subtotal * (+meta.tax||0) / 100
  const total    = subtotal + tax

  async function generate() {
    setBusy(true); setOut("")
    try {
      const r = await fetch("/api/automations",{ method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ tool:"invoice_generate", params:{ fromName:from.name, fromEmail:from.email, fromAddress:from.address, toName:to.name, toCompany:to.company, toEmail:to.email, items, ...meta } }) })
      const d = await r.json(); setOut(d.result||d.error)
    } catch(e){setOut("Error: "+e.message)}
    setBusy(false)
  }

  return (
    <>
      <Head><title>SIXXAB AI — Invoice Generator</title></Head>
      <style>{TOOL_STYLES}</style>
      <SixxabNav active="/invoice"/>
      <ToolHeader icon="ti-receipt" iconColor={AMBER} iconBg="rgba(239,159,39,.18)" iconBorder="rgba(239,159,39,.4)" titleAccent="Invoice Generator" badge="Sales Suite" badgeColor={AMBER} badgeBg="rgba(239,159,39,.15)" badgeBorder="rgba(239,159,39,.35)" subtitle="Professional invoices in seconds · Itemised · Tax · Payment terms"/>
      <div className="tool-body">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* From */}
            <div className="card">
              <div className="card-hdr"><span className="card-hdr-title">Your business</span></div>
              <div className="card-pad" style={{display:"flex",flexDirection:"column",gap:10}}>
                {[["name","Name *"],["email","Email *"],["address","Address"]].map(([k,l])=>(
                  <div key={k}>
                    <label className="lbl">{l}</label>
                    <input className="inp" value={from[k]} onChange={e=>setFrom(f=>({...f,[k]:e.target.value}))}/>
                  </div>
                ))}
              </div>
            </div>
            {/* To */}
            <div className="card">
              <div className="card-hdr"><span className="card-hdr-title">Client</span></div>
              <div className="card-pad" style={{display:"flex",flexDirection:"column",gap:10}}>
                {[["name","Name *"],["company","Company"],["email","Email"]].map(([k,l])=>(
                  <div key={k}>
                    <label className="lbl">{l}</label>
                    <input className="inp" value={to[k]} onChange={e=>setTo(f=>({...f,[k]:e.target.value}))}/>
                  </div>
                ))}
              </div>
            </div>
            {/* Meta */}
            <div className="card">
              <div className="card-hdr"><span className="card-hdr-title">Invoice details</span></div>
              <div className="card-pad" style={{display:"flex",flexDirection:"column",gap:10}}>
                <div className="grid-2">
                  <div><label className="lbl">Invoice #</label><input className="inp" placeholder="INV-001" value={meta.invoiceNum} onChange={e=>setMeta(m=>({...m,invoiceNum:e.target.value}))}/></div>
                  <div><label className="lbl">Date</label><input type="date" className="inp" value={meta.date} onChange={e=>setMeta(m=>({...m,date:e.target.value}))}/></div>
                </div>
                <div className="grid-2">
                  <div><label className="lbl">Payment terms</label><input className="inp" value={meta.dueDate} onChange={e=>setMeta(m=>({...m,dueDate:e.target.value}))}/></div>
                  <div><label className="lbl">Tax rate %</label><input type="number" className="inp" value={meta.tax} onChange={e=>setMeta(m=>({...m,tax:e.target.value}))}/></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Line items */}
            <div className="card">
              <div className="card-hdr">
                <span className="card-hdr-title">Line items</span>
                <button className="btn btn-ghost btn-sm" onClick={()=>setItems(i=>[...i,{...emptyItem}])}>+ Add item</button>
              </div>
              <div className="card-pad" style={{display:"flex",flexDirection:"column",gap:8}}>
                {items.map((item,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 60px 80px 24px",gap:7,alignItems:"center"}}>
                    <input className="inp" placeholder="Description" value={item.desc} onChange={e=>setItems(ii=>ii.map((x,j)=>j===i?{...x,desc:e.target.value}:x))}/>
                    <input type="number" className="inp" placeholder="Qty" value={item.qty} onChange={e=>setItems(ii=>ii.map((x,j)=>j===i?{...x,qty:e.target.value}:x))} style={{textAlign:"center"}}/>
                    <input type="number" className="inp" placeholder="Rate" value={item.rate} onChange={e=>setItems(ii=>ii.map((x,j)=>j===i?{...x,rate:e.target.value}:x))}/>
                    <button onClick={()=>setItems(ii=>ii.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",fontSize:16,padding:0}}>×</button>
                  </div>
                ))}
                <div style={{borderTop:"1px solid #E8ECF4",paddingTop:10,marginTop:4}}>
                  {[["Subtotal",`$${subtotal.toFixed(2)}`],["Tax ("+meta.tax+"%)",`$${tax.toFixed(2)}`],["TOTAL",`$${total.toFixed(2)}`]].map(([l,v],i)=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:i===2?15:13,fontWeight:i===2?700:400,color:i===2?N:"#64748B"}}>
                      <span>{l}</span><span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card card-pad">
              <label className="lbl">Notes / payment instructions</label>
              <textarea className="inp" rows={2} value={meta.notes} onChange={e=>setMeta(m=>({...m,notes:e.target.value}))}/>
            </div>
            <button className="btn btn-primary" onClick={generate} disabled={busy||!from.name||!to.name} style={{width:"100%"}}>
              {busy?<><div className="spinner spinner-dark"/>Generating invoice…</>:"Generate professional invoice →"}
            </button>
            {out&&(
              <div className="card fu">
                <div className="card-hdr">
                  <span className="card-hdr-title">Invoice ready</span>
                  <button className="btn btn-ghost btn-sm" onClick={()=>{navigator.clipboard.writeText(out);setCopied(true);setTimeout(()=>setCopied(false),2000)}}>{copied?"✓":"Copy"}</button>
                </div>
                <div style={{padding:"16px 18px",fontSize:13,lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:"'DM Mono',monospace",maxHeight:400,overflowY:"auto",color:N}}>{out}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
