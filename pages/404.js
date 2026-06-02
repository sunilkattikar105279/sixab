import { SixxabMark, SixxabWordmark } from "../components/SixxabNav"
import Head from "next/head"

export default function NotFound() {
  const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"
  return (
    <>
      <Head>
        <title>404 — Page not found · SIXXAB AI</title>
      </Head>
      <div style={{ minHeight:"100vh", background:N, display:"flex",
                    flexDirection:"column", alignItems:"center",
                    justifyContent:"center", padding:"40px 5%", textAlign:"center" }}>
        {/* Background grid */}
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"radial-gradient(rgba(239,159,39,.08) 1px,transparent 1px)",
          backgroundSize:"36px 36px", pointerEvents:"none" }}/>

        <a href="/" style={{ display:"flex", alignItems:"center", gap:9,
                              textDecoration:"none", marginBottom:48 }}>
          <SixxabMark size={32}/>
          <SixxabWordmark size="lg"/>
        </a>

        <div style={{ fontFamily:"'Bebas Neue',Georgia,serif", fontSize:"clamp(80px,16vw,160px)",
                      color:AMBER, lineHeight:1, opacity:.18, position:"absolute",
                      userSelect:"none", pointerEvents:"none" }}>
          404
        </div>

        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11,
                        color:AMBER, letterSpacing:".14em",
                        textTransform:"uppercase", marginBottom:16 }}>
            Page not found
          </div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:"clamp(24px,5vw,48px)",
                        fontWeight:700, color:CHALK, marginBottom:14, lineHeight:1.15 }}>
            This page doesn't exist — yet.
          </h1>
          <p style={{ fontSize:16, color:"rgba(245,245,240,.5)", maxWidth:400,
                      margin:"0 auto 36px", lineHeight:1.75 }}>
            The URL might have changed or the page was removed. Start from the homepage or go to one of the modules.
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <a href="/" style={{ padding:"12px 24px", borderRadius:10, background:AMBER,
                                  color:N, fontSize:14, fontWeight:700,
                                  textDecoration:"none" }}>
              ← Back to home
            </a>
            <a href="/orchestrator" style={{ padding:"12px 24px", borderRadius:10,
                                              border:"1px solid rgba(255,255,255,.15)",
                                              color:CHALK, fontSize:14,
                                              textDecoration:"none" }}>
              Open Orchestrator
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
