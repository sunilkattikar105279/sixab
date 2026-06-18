// pages/api/website-test.js
// Test endpoint — visit /api/website-test to verify website-agent works
// DELETE after confirming it works
export default async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(200).json({ ok: false, error: "ANTHROPIC_API_KEY not set" })

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        messages: [{ role: "user", content: "Reply with exactly: <!DOCTYPE html><html><head><title>Test</title></head><body><h1>It works</h1></body></html>\nSUGGEST: Test suggestion" }],
      }),
    })
    const d = await r.json()
    const text = d.content?.[0]?.text || ""
    const hasDoctype = text.includes("<!DOCTYPE")
    const hasHtml    = text.includes("</html>")
    const hasSuggest = text.includes("SUGGEST:")

    return res.status(200).json({
      ok: hasDoctype && hasHtml,
      api_key_set: true,
      model: "claude-sonnet-4-6",
      has_doctype: hasDoctype,
      has_html_close: hasHtml,
      has_suggest: hasSuggest,
      raw_preview: text.slice(0, 300),
      tokens: d.usage?.output_tokens,
    })
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message })
  }
}
