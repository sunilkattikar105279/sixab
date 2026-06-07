// pages/data-deletion.js — Facebook Data Deletion Instructions
// Required by Meta for OAuth apps
// URL: https://www.startupsinabox.com/data-deletion
import Head from "next/head"
import { SixxabMark, SixxabWordmark } from "../components/SixxabNav"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

export default function DataDeletion() {
  return (
    <>
      <Head>
        <title>Data Deletion Request — SIXXAB AI</title>
        <meta name="description" content="How to request deletion of your data from SIXXAB AI."/>
      </Head>
      <style>{`
        body{background:#F4F4F0;font-family:'Inter',system-ui,sans-serif}
        .card{background:#fff;border-radius:14px;border:1px solid #E2E8F0;padding:28px 32px;max-width:680px;margin:0 auto}
      `}</style>

      {/* Nav strip */}
      <div style={{background:N,padding:"14px 5%",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <a href="/" style={{display:"inline-flex",alignItems:"center",gap:9,textDecoration:"none"}}>
          <SixxabMark size={24}/>
          <SixxabWordmark/>
        </a>
      </div>

      <div style={{padding:"40px 5%"}}>
        <div className="card">
          <h1 style={{fontFamily:"Georgia,serif",fontSize:28,fontWeight:700,color:N,letterSpacing:"-0.5px",marginBottom:6}}>
            Data Deletion Request
          </h1>
          <p style={{fontSize:13,color:"#94A3B8",marginBottom:24}}>
            Last updated: {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
          </p>

          <p style={{fontSize:15,color:"#475569",lineHeight:1.8,marginBottom:20}}>
            SIXXAB AI ("we", "our") respects your right to have your personal data deleted. This page explains what data we collect when you connect your Facebook or Instagram account, and how to request its deletion.
          </p>

          <h2 style={{fontSize:17,fontWeight:700,color:N,marginBottom:10,fontFamily:"Georgia,serif"}}>What data we store</h2>
          <p style={{fontSize:14,color:"#475569",lineHeight:1.8,marginBottom:20}}>
            When you connect your Facebook account to SIXXAB AI, we store an OAuth access token as an HttpOnly browser cookie on your device. We do not store your Facebook ID, name, email, profile photo or any other personal information on our servers. The token is used only to publish content you create in the SIXXAB AI Content Studio to your Facebook Page or Instagram account.
          </p>

          <h2 style={{fontSize:17,fontWeight:700,color:N,marginBottom:10,fontFamily:"Georgia,serif"}}>How to delete your data</h2>
          <p style={{fontSize:14,color:"#475569",lineHeight:1.8,marginBottom:14}}>
            Because your data is stored only as a cookie in your browser, you can delete it yourself immediately:
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {[
              ["Option 1 — Disconnect in the app","Go to startupsinabox.com/social → click Disconnect next to Facebook. This immediately clears the OAuth token from your browser."],
              ["Option 2 — Clear browser cookies","In your browser settings, clear cookies for startupsinabox.com. This removes the sixxab_social_facebook cookie."],
              ["Option 3 — Revoke in Facebook","Go to facebook.com → Settings → Security and Login → Apps and websites → find SIXXAB AI → Remove. This revokes the OAuth token at Facebook's end."],
              ["Option 4 — Email us","Send a deletion request to sunil.kattikar@gmail.com with the subject line 'Data Deletion Request'. We will confirm within 48 hours that your data has been removed."],
            ].map(([title,desc],i)=>(
              <div key={i} style={{padding:"12px 16px",background:"#F8F9FA",borderRadius:10,border:"1px solid #E2E8F0"}}>
                <div style={{fontSize:13.5,fontWeight:600,color:N,marginBottom:4}}>{title}</div>
                <div style={{fontSize:13,color:"#64748B",lineHeight:1.65}}>{desc}</div>
              </div>
            ))}
          </div>

          <h2 style={{fontSize:17,fontWeight:700,color:N,marginBottom:10,fontFamily:"Georgia,serif"}}>Contact</h2>
          <p style={{fontSize:14,color:"#475569",lineHeight:1.8,marginBottom:8}}>
            For any questions about your data or to submit a deletion request:
          </p>
          <div style={{padding:"12px 16px",background:"#FFFBF2",border:"1px solid rgba(239,159,39,.3)",borderRadius:10,fontSize:14,color:N}}>
            <strong>Sunil Kattikar</strong> — SIXXAB AI<br/>
            <a href="mailto:sunil.kattikar@gmail.com" style={{color:AMBER}}>sunil.kattikar@gmail.com</a><br/>
            Dallas, TX, United States
          </div>

          <div style={{marginTop:24,paddingTop:20,borderTop:"1px solid #E2E8F0",display:"flex",gap:12,flexWrap:"wrap"}}>
            <a href="/privacy" style={{fontSize:13.5,color:AMBER,fontWeight:500,textDecoration:"none"}}>Privacy Policy →</a>
            <a href="/terms"   style={{fontSize:13.5,color:"#64748B",textDecoration:"none"}}>Terms of Service</a>
            <a href="/"        style={{fontSize:13.5,color:"#64748B",textDecoration:"none",marginLeft:"auto"}}>← Back to SIXXAB AI</a>
          </div>
        </div>
      </div>
    </>
  )
}
