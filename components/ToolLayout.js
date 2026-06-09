// components/ToolLayout.js — Shared layout for all SIXXAB AI tools
// Consistent header, typography, colors and spacing across every logged-in page
import Head from "next/head"
import SixxabNav from "./SixxabNav"

const N = "#0A0E1A", AMBER = "#EF9F27", CHALK = "#F5F5F0"

export const TOOL_STYLES = `
  /* Reset & base */
  *, *::before, *::after { box-sizing: border-box }
  body {
    background: #F4F4F0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    color: #0A0E1A;
    -webkit-font-smoothing: antialiased;
    letter-spacing: -0.01em;
  }
  h1, h2, h3, h4 {
    font-family: Georgia, 'Times New Roman', serif;
    letter-spacing: -0.03em;
    font-weight: 700;
  }

  /* Animations */
  @keyframes fadeUp  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
  @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes spin    { to { transform:rotate(360deg) } }
  .fu { animation: fadeUp .3s ease both }
  .fi { animation: fadeIn .2s ease both }

  /* Cards */
  .card {
    background: #fff;
    border-radius: 13px;
    border: 1px solid #E2E8F0;
    overflow: hidden;
  }
  .card-pad { padding: 18px 20px }
  .card-hdr {
    padding: 12px 16px;
    border-bottom: 1px solid #E8ECF4;
    background: #FAFAFA;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  .card-hdr-title {
    font-size: 13px;
    font-weight: 600;
    color: #0A0E1A;
  }

  /* Form inputs */
  .inp {
    width: 100%;
    padding: 10px 13px;
    border: 1.5px solid #E2E8F0;
    border-radius: 9px;
    font-size: 13.5px;
    color: #0A0E1A;
    background: #fff;
    font-family: inherit;
    outline: none;
    transition: border .15s;
    line-height: 1.5;
  }
  .inp:focus { border-color: #EF9F27 }
  select.inp { cursor: pointer }
  textarea.inp { resize: vertical; line-height: 1.65 }
  .lbl {
    font-size: 10.5px;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: .08em;
    display: block;
    margin-bottom: 5px;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 10px 20px;
    border-radius: 9px;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: inherit;
    transition: opacity .15s;
    text-decoration: none;
  }
  .btn:hover { opacity: .88 }
  .btn:disabled { opacity: .45; cursor: not-allowed }
  .btn-primary { background: #EF9F27; color: #0A0E1A }
  .btn-dark    { background: #0A0E1A; color: #F5F5F0 }
  .btn-green   { background: #1D9E75; color: #fff }
  .btn-ghost   { background: transparent; border: 1.5px solid #E2E8F0; color: #64748B }
  .btn-sm      { padding: 6px 14px; font-size: 12px; border-radius: 7px }

  /* Badges / pills */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
  }

  /* Grid helpers */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px }
  .flex-c { display: flex; align-items: center; gap: 8px }

  /* Spinner */
  .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .8s linear infinite;
    flex-shrink: 0;
  }
  .spinner-dark {
    border: 2px solid rgba(10,14,26,.15);
    border-top-color: #0A0E1A;
  }

  /* Toast */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 999;
    padding: 11px 18px; border-radius: 11px;
    font-size: 13px; font-weight: 500;
    box-shadow: 0 4px 16px rgba(0,0,0,.12);
    animation: fadeUp .3s ease;
  }
  .toast-ok  { background: #E1F5EE; border: 1px solid #6EE7B7; color: #085041 }
  .toast-err { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B }

  /* Page content wrapper */
  .tool-body { max-width: 1200px; margin: 0 auto; padding: 20px 20px 60px }
  .tool-body-wide { max-width: 1400px; margin: 0 auto; padding: 20px 20px 60px }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 3px }
  ::-webkit-scrollbar-thumb { background: #EF9F27; border-radius: 2px }

  /* Mobile */
  @media(max-width: 768px) {
    .grid-2, .grid-3 { grid-template-columns: 1fr !important }
    .hide-m { display: none !important }
    .tool-body, .tool-body-wide { padding: 14px 14px 48px }
  }
  @media(max-width: 480px) {
    .stack-m { flex-direction: column !important; align-items: stretch !important }
    .full-m  { width: 100% !important }
  }
`

// Tool page header component — used at top of every tool
export function ToolHeader({ icon, iconColor="#EF9F27", iconBg="rgba(239,159,39,.18)", iconBorder="rgba(239,159,39,.4)", title, titleAccent, badge, badgeColor="#EF9F27", badgeBg="rgba(239,159,39,.15)", badgeBorder="rgba(239,159,39,.35)", subtitle, stats=[], actions=[] }) {
  return (
    <div style={{ background:"#0A0E1A", padding:"14px 4%", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:11, background:iconBg, border:`1.5px solid ${iconBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <i className={`ti ${icon}`} style={{ fontSize:22, color:iconColor }} aria-hidden="true"/>
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:3 }}>
              <h1 style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:"#F5F5F0", letterSpacing:.5, lineHeight:1 }}>
                SIXXAB <span style={{ color:iconColor, fontStyle:"italic" }}>{titleAccent || title}</span>
              </h1>
              {badge && (
                <span style={{ padding:"2px 9px", borderRadius:20, background:badgeBg, border:`1px solid ${badgeBorder}`, fontSize:10, fontWeight:600, color:badgeColor }}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p style={{ fontSize:12, color:"rgba(245,245,240,.45)", lineHeight:1.4 }}>{subtitle}</p>}
          </div>
        </div>
        {(stats.length>0 || actions.length>0) && (
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            {stats.map(([label,value,color]) => (
              <div key={label} style={{ textAlign:"center", padding:"5px 11px", borderRadius:8, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)" }}>
                <div style={{ fontFamily:"Georgia", fontSize:17, color:color||"#EF9F27", lineHeight:1 }}>{value}</div>
                <div style={{ fontSize:9.5, color:"rgba(245,245,240,.4)", textTransform:"uppercase", letterSpacing:".06em" }}>{label}</div>
              </div>
            ))}
            {actions.map((a,i) => (
              <a key={i} href={a.href} style={{ padding:"7px 14px", borderRadius:8, background:a.primary?"#EF9F27":"rgba(255,255,255,.06)", border:a.primary?"none":"1px solid rgba(255,255,255,.1)", fontSize:12, fontWeight:a.primary?700:500, color:a.primary?"#0A0E1A":"rgba(245,245,240,.6)", textDecoration:"none", display:"flex", alignItems:"center", gap:5 }}>
                {a.icon && <i className={`ti ${a.icon}`} style={{ fontSize:11 }} aria-hidden="true"/>}
                {a.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Full page wrapper
export default function ToolLayout({ title, description, active, children, ...headerProps }) {
  return (
    <>
      <Head>
        <title>{title} — SIXXAB AI</title>
        {description && <meta name="description" content={description}/>}
      </Head>
      <style>{TOOL_STYLES}</style>
      <SixxabNav active={active}/>
      {headerProps.icon && <ToolHeader {...headerProps}/>}
      {children}
    </>
  )
}
