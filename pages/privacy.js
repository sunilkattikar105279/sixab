import Head from "next/head"
import SixxabNav from "../components/SixxabNav"
import { SixxabMark, SixxabWordmark } from "../components/SixxabNav"

const N = "#0A0E1A", AMBER = "#EF9F27"

const SECTIONS = [
  { title:"1. Who we are",
    body:`SIXXAB AI is operated by Sunil Kattikar, Dallas, TX. Contact: sunil.kattikar@gmail.com. We operate the autonomous business platform at startupsinabox.com ("the Service").` },
  { title:"2. What data we collect",
    body:`We collect: (a) Account data — name, email address, password hash when you create an account; (b) Payment data — handled entirely by Stripe. We never see or store your card details; (c) Usage data — pages visited, features used, goal text entered into the Orchestrator, collected anonymously via Vercel Analytics; (d) CRM data — contact information you enter into SIXXAB CRM is stored in your browser's local storage by default and not transmitted to our servers unless you use email or agent dispatch features; (e) Communications — emails you send us and discovery call booking details via Calendly.` },
  { title:"3. How we use your data",
    body:`We use your data to: provide and improve the Service; send transactional emails (welcome, password reset, billing receipts) via Resend; respond to your support requests; send product update emails (you may unsubscribe at any time). We do not use your data for advertising. We do not sell your data to any third party.` },
  { title:"4. AI and your data",
    body:`Text you enter into the Orchestrator, AI Coach, or agent chat is sent to Anthropic's Claude API for processing. Anthropic's enterprise policy means this data is not used to train their models. We recommend not entering sensitive personal information (SSNs, financial account numbers, passwords) into AI chat fields.` },
  { title:"5. Cookies and tracking",
    body:`We use: essential session cookies for authentication (sessionStorage, cleared when you close the browser); Vercel Analytics for anonymous usage statistics (no personal data, no cross-site tracking); Google Analytics if configured (see our GA settings — IP anonymisation enabled). We do not use advertising cookies. You may disable cookies in your browser settings; this will prevent login from working.` },
  { title:"6. Data sharing",
    body:`We share data only with: Stripe (payment processing); Resend (transactional email delivery); Anthropic (AI processing via API); Vercel (hosting and anonymous analytics); Calendly (discovery call booking). All third parties are bound by their own privacy policies and are prohibited from using your data for any other purpose.` },
  { title:"7. Data retention",
    body:`We retain your account data for as long as your account is active. If you cancel, we retain your data for 90 days in case you wish to return, then delete it. You may request immediate deletion at any time by emailing sunil.kattikar@gmail.com.` },
  { title:"8. Your rights (GDPR / CCPA)",
    body:`You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your data; export your data in a portable format; object to processing; withdraw consent at any time. To exercise any of these rights, email sunil.kattikar@gmail.com with the subject "Data Request". We will respond within 30 days.` },
  { title:"9. Data security",
    body:`We use HTTPS (TLS 1.3) for all data in transit. Passwords are hashed using bcrypt. API keys are stored as environment variables and never exposed client-side. We conduct regular security reviews and plan SOC 2 Type II certification in 2026.` },
  { title:"10. Children",
    body:`The Service is not directed at children under 16. We do not knowingly collect data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.` },
  { title:"11. Changes to this policy",
    body:`We may update this privacy policy from time to time. Material changes will be communicated by email to subscribers. Continued use of the Service after changes constitutes acceptance.` },
  { title:"12. Contact",
    body:`For privacy questions, data requests, or complaints, contact: sunil.kattikar@gmail.com · SIXXAB AI · Dallas, TX, United States.` },
]

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy · SIXXAB AI</title>
        <meta name="description" content="SIXXAB AI Privacy Policy — how we collect, use and protect your data."/>
      </Head>
      <SixxabNav active=""/>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"48px 5% 80px" }}>
        <div style={{ marginBottom:36 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:AMBER,
                        letterSpacing:".12em", textTransform:"uppercase", marginBottom:10 }}>
            Legal · Last updated June 2025
          </div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:36, fontWeight:700,
                        color:N, marginBottom:12, lineHeight:1.15 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize:15, color:"#64748B", lineHeight:1.75 }}>
            We believe privacy is a right, not a feature. Here is exactly what data we collect, why, and how you can control it.
          </p>
        </div>
        {SECTIONS.map((s,i) => (
          <div key={i} style={{ marginBottom:28, paddingBottom:28,
                                 borderBottom: i < SECTIONS.length-1 ? "1px solid #E8ECF4" : "none" }}>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700,
                          color:N, marginBottom:10 }}>{s.title}</h2>
            <p style={{ fontSize:14.5, color:"#475569", lineHeight:1.8 }}>{s.body}</p>
          </div>
        ))}
        <div style={{ marginTop:40, padding:"20px 24px", background:"#FFFBF2",
                      borderRadius:12, border:`1px solid rgba(239,159,39,.3)` }}>
          <p style={{ fontSize:14, color:"#64748B", lineHeight:1.7 }}>
            <strong style={{ color:N }}>Data request or privacy question?</strong>{" "}
            Email{" "}
            <a href="mailto:sunil.kattikar@gmail.com"
               style={{ color:AMBER, textDecoration:"none", fontWeight:500 }}>
              sunil.kattikar@gmail.com
            </a>{" "}
            — we respond within 30 days.
          </p>
        </div>
      </div>
    </>
  )
}
