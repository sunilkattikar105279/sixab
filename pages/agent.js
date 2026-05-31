import { useState } from "react"

const DEFAULTS = [
  { name: "Sarah Chen", role: "Freelance designer", platform: "LinkedIn", context: "Met at Dallas Design Week. Mentioned wanting passive income." },
  { name: "Mike Rodriguez", role: "HVAC contractor owner", platform: "LinkedIn", context: "Referred a client. Always complains about paperwork." },
  { name: "Priya Nair", role: "Business consultant", platform: "Email", context: "Former colleague. Recently posted about wanting to launch a SaaS." },
  { name: "Tom Walsh", role: "Real estate agent", platform: "Instagram DM", context: "DFW market. Overwhelmed with listings content." },
  { name: "Angela Brooks", role: "Marketing freelancer", platform: "LinkedIn", context: "Met at Capital Factory. Looking for recurring revenue." },
]

function SixabIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="69" height="69" rx="15" fill="none" stroke="#EF9F27" strokeWidth="3"/>
      <text x="7" y="54" fontFamily="'Bebas Neue', sans-serif" fontSize="48" fill="none" stroke="#EF9F27" strokeWidth="1.5" letterSpacing="-3" paintOrder="stroke">S</text>
      <text x="35" y="54" fontFamily="'Bebas Neue', sans-serif" fontSize="54" fill="none" stroke="#EF9F27" strokeWidth="1.5" fontStyle="italic" letterSpacing="-3" paintOrder="stroke">X</text>
    </svg>
  )
}

export default function AgentPage() {
  const [contacts, setContacts] = useState(DEFAULTS)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(null)
  const [tab, setTab] = useState("contacts")
  const platforms = ["LinkedIn", "Email", "Instagram DM", "Twitter/X DM", "WhatsApp", "Text"]

  function update(i, f, v) { setContacts(cs => cs.map((c, ci) => ci === i ? { ...c, [f]: v } : c)) }
  function add() { setContacts(cs => [...cs, { name: "", role: "", platform: "LinkedIn", context: "" }]) }
  function remove(i) { setContacts(cs => cs.filter((_, ci) => ci !== i)) }

  async function generate() {
    const valid = contacts.filter(c => c.name && c.role && c.context)
    if (!valid.length) { setError("Add at least 1 contact with name, role and context."); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/marketing-agent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: valid.slice(0, 20) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(data.messages); setTab("results")
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  function copy(i, text) {
    navigator.clipboard.writeText(text).then(() => { setCopied(i); setTimeout(() => setCopied(null), 2000) })
  }

  function copyAll() {
    const all = messages.map((m, i) => `── ${i+1}. ${m.name} (${m.platform}) ──\n${m.message}\n\nFollow-up: ${m.followUp}\nBest time: ${m.bestTime}`).join("\n\n")
    navigator.clipboard.writeText(all).then(() => { setCopied("all"); setTimeout(() => setCopied(null), 2000) })
  }

  const N = "#0A0E1A", AMBER = "#EF9F27"

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'Plus Jakarta Sans',sans-serif;background:#F7F8FA;color:#1A1A2E}input,select,textarea{font-family:inherit}textarea{resize:vertical}`}</style>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 18px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <SixabIcon size={34} />
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: N, letterSpacing: 2, lineHeight: 1 }}>
              SIX<span style={{ color: AMBER, fontStyle: "italic" }}>X</span>AB <span style={{ fontSize: 18, color: "#64748B", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, letterSpacing: 0 }}>Marketing Agent</span>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#888", marginTop: 2, letterSpacing: ".12em" }}>startupsinabox.com/agent</div>
          </div>
        </div>

        <div style={{ background: "#FFFBF2", border: "1.5px solid rgba(239,159,39,.35)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#633806", fontWeight: 500, marginBottom: 22 }}>
          🎯 Offer embedded in every DM: 50% off SIXXAB founding membership — Starter $14.50 · Pro $24.50 · Agency $34.50 /mo — expires at public launch
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#E8ECF4", borderRadius: 10, padding: 4, width: "fit-content" }}>
          {["contacts", "results"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: tab === t ? "#fff" : "transparent", color: tab === t ? N : "#64748B", fontSize: 13, fontWeight: 500, cursor: "pointer", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,.08)" : "none" }}>
              {t === "contacts" ? `Contacts (${contacts.length})` : `DM Scripts ${messages.length > 0 ? `(${messages.length})` : ""}`}
            </button>
          ))}
        </div>

        {tab === "contacts" && (
          <>
            {contacts.map((c, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 10, position: "relative" }}>
                <div style={{ position: "absolute", top: 12, right: 42, width: 22, height: 22, borderRadius: "50%", background: "#FAEEDA", color: "#633806", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i+1}</div>
                <button onClick={() => remove(i)} style={{ position: "absolute", top: 12, right: 12, width: 22, height: 22, borderRadius: "50%", background: "#FEE2E2", color: "#DC2626", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                  {[["Full name", "name", "text", "Sarah Chen"], ["Role / industry", "role", "text", "Freelance designer"], ["Platform", "platform", "select", ""]].map(([lbl, field, type, ph]) => (
                    <div key={field}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{lbl}</label>
                      {type === "select"
                        ? <select value={c.platform} onChange={e => update(i, "platform", e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, background: "#FAFBFC", color: N }}>
                            {platforms.map(p => <option key={p}>{p}</option>)}
                          </select>
                        : <input type="text" value={c[field]} onChange={e => update(i, field, e.target.value)} placeholder={ph} style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, background: "#FAFBFC", color: N }} />
                      }
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Context (how you know them)</label>
                  <textarea value={c.context} onChange={e => update(i, "context", e.target.value)} placeholder="Met at Dallas Startup Week. Mentioned wanting to launch a SaaS..." rows={2} style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, background: "#FAFBFC", color: N, lineHeight: 1.5 }} />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
              <button onClick={add} style={{ padding: "9px 18px", borderRadius: 9, border: "1.5px dashed #CBD5E1", background: "transparent", color: "#64748B", fontSize: 13, cursor: "pointer" }}>+ Add contact</button>
              <button onClick={generate} disabled={loading} style={{ padding: "11px 24px", borderRadius: 9, background: AMBER, color: N, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", opacity: loading ? .6 : 1, display: "flex", alignItems: "center", gap: 6 }}>
                {loading ? "Generating…" : "✨ Generate DM scripts →"}
              </button>
              <span style={{ fontSize: 12, color: "#94A3B8", marginLeft: "auto" }}>{Math.min(contacts.filter(c => c.name && c.role && c.context).length, 20)} ready</span>
            </div>
            {error && <div style={{ marginTop: 12, padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 13, color: "#991B1B" }}>⚠ {error}</div>}
          </>
        )}

        {tab === "results" && (
          loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748B" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #E2E8F0", borderTopColor: AMBER, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
              <p>SIXXAB agent is writing your personalised scripts…</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#94A3B8" }}>Go to Contacts and click Generate.</div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: N, letterSpacing: 1 }}>{messages.length} personalised scripts ready</span>
                <button onClick={copyAll} style={{ padding: "7px 14px", borderRadius: 8, background: "#FAEEDA", border: "1px solid rgba(239,159,39,.4)", color: "#633806", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  {copied === "all" ? "✓ Copied!" : "Copy all"}
                </button>
              </div>
              {messages.map((m, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFC" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: N }}>{m.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "#FAEEDA", color: "#633806" }}>{m.platform}</span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>DM message</div>
                    <div style={{ fontSize: 13.5, color: N, lineHeight: 1.65, background: "#F7F8FA", borderRadius: 8, padding: "11px 13px", border: "1px solid #E2E8F0", whiteSpace: "pre-wrap", marginBottom: 10 }}>{m.message}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Follow-up (3 days later)</div>
                    <div style={{ fontSize: 13, color: N, lineHeight: 1.65, background: "#FFFBF2", borderRadius: 8, padding: "10px 13px", border: "1px solid rgba(239,159,39,.25)", whiteSpace: "pre-wrap", marginBottom: 10 }}>{m.followUp}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: "#F0FDF4", color: "#059669", fontWeight: 500 }}>⏰ Best: {m.bestTime}</span>
                      <button onClick={() => copy(i, m.message)} style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 7, background: copied === i ? "#ECFDF5" : "#EEF2FF", border: `1px solid ${copied === i ? "#059669" : "#C7D2FE"}`, color: copied === i ? "#059669" : "#4338CA", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                        {copied === i ? "✓ Copied!" : "Copy DM"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )
        )}
      </div>
    </>
  )
}
