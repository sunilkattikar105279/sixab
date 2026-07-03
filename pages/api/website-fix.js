// pages/api/website-fix.js — Auto-fix loop for generated websites
// Validates HTML quality and auto-corrects common issues
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { html, issues } = req.body ?? {}
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })
  if (!html) return res.status(400).json({ error: 'html required' })

  // Detect issues automatically
  const detected = []
  if (!html.includes('</nav>') && !html.includes('</header>')) detected.push('Missing navigation')
  if (!html.includes('<footer')) detected.push('Missing footer')
  if (!html.includes('@media')) detected.push('Not mobile responsive')
  if (!html.includes('contact') && !html.includes('Contact')) detected.push('Missing contact section')
  if (html.split('section').length < 4) detected.push('Too few sections — needs more content')
  if (html.length < 8000) detected.push('Website too short — needs more detail')
  if (!html.includes('Google Fonts') && !html.includes('fonts.googleapis')) detected.push('Missing Google Fonts')
  if (!html.includes('position:fixed') && !html.includes('position: fixed')) detected.push('Nav not sticky')

  const allIssues = [...new Set([...(issues || []), ...detected])]

  if (allIssues.length === 0) {
    return res.status(200).json({ html, fixed: false, issues: [], message: 'No issues detected' })
  }

  // Fix with AI
  const fixPrompt = `You are an expert web developer fixing a website HTML file.

ISSUES TO FIX:
${allIssues.map((i, n) => `${n + 1}. ${i}`).join('\n')}

CURRENT HTML:
${html}

Fix ALL the listed issues. Return the complete corrected HTML file.
Rules:
- Start with <!DOCTYPE html>, end with </html>
- Keep all existing content and sections
- Only add/fix what is broken
- Ensure all text is visible (proper color contrast)
- Do not add markdown fences or explanations`

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        system: 'You are an expert web developer. Output ONLY the corrected HTML file. Start with <!DOCTYPE html>.',
        messages: [{ role: 'user', content: fixPrompt }],
      }),
    })
    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message })

    const raw = d.content?.[0]?.text || ''
    const cleaned = raw.replace(/^```(?:html)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    const start = cleaned.indexOf('<!DOCTYPE')
    const end = cleaned.lastIndexOf('</html>')
    const fixedHtml = start !== -1 && end !== -1 ? cleaned.slice(start, end + 7) : (start !== -1 ? cleaned.slice(start) : null)

    return res.status(200).json({
      html: fixedHtml || html,
      fixed: !!fixedHtml,
      issues: allIssues,
      issuesFixed: allIssues.length,
      tokens: d.usage?.output_tokens || 0,
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
