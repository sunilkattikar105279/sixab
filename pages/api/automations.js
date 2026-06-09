// pages/api/automations.js — shared AI endpoint for all automation tools
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()
  const { tool, params } = req.body ?? {}
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" })

  const PROMPTS = {

    seo_audit: `You are the SIXXAB SEO Analyzer Agent. Perform a comprehensive SEO analysis for:
Business: ${params.bizName} (${params.industry}, ${params.location})
Website: ${params.website || "not yet live"}
Target keywords: ${params.keywords || "to be determined"}

Return a structured SEO report:

## KEYWORD OPPORTUNITIES
List 10 high-value, low-competition keywords with estimated monthly searches. Include 5 long-tail keywords.

## ON-PAGE SEO CHECKLIST
Rate each (✓ done / ✗ fix / ? unknown): Title tags, Meta descriptions, H1 tags, Image alt text, Page speed, Mobile-friendly, SSL, Schema markup, Internal linking, URL structure.

## LOCAL SEO (if applicable)
Google Business Profile, NAP consistency, Local citations, Review strategy.

## CONTENT GAPS
3 blog topics this business should write to rank for money keywords.

## COMPETITOR ANALYSIS
Name 3 likely competitors for this industry/location and what SEO advantage they have.

## 90-DAY QUICK WINS
5 specific actions that will move rankings in 90 days. Be very specific — include exact keyword targets.`,

    invoice_generate: `You are the SIXXAB Invoice Generator Agent. Create a professional invoice:

From: ${params.fromName} · ${params.fromEmail} · ${params.fromAddress}
To: ${params.toName} · ${params.toCompany} · ${params.toEmail}
Invoice #: ${params.invoiceNum || "INV-" + Date.now().toString().slice(-6)}
Date: ${params.date || new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
Due date: ${params.dueDate || "Net 30"}

Line items:
${(params.items || []).map((item,i) => `${i+1}. ${item.desc} — Qty: ${item.qty} × $${item.rate} = $${(item.qty * item.rate).toFixed(2)}`).join("\n")}

Tax rate: ${params.tax || 0}%
Notes: ${params.notes || "Thank you for your business."}

Generate a complete professional invoice in plain text format with:
- Clean header with business branding
- Itemised table with subtotal, tax and total
- Payment instructions (bank transfer, PayPal, Stripe, check)
- Professional closing message
- Late payment policy note if applicable`,

    email_sequence: `You are the SIXXAB Email Automator Agent. Create a complete email automation sequence:

Business: ${params.bizName} (${params.industry})
Sequence type: ${params.seqType}
Audience: ${params.audience}
Goal: ${params.goal}
Duration: ${params.duration || "30 days"}

Write ${params.emailCount || 5} emails:

For each email provide:
EMAIL [N] — Day [X]
SUBJECT: [compelling subject line]
PREVIEW TEXT: [35 chars that show in inbox]
BODY:
[full email body — conversational, max 150 words]
CTA: [specific call to action]
---

Sequence types guidance:
- Welcome: warm, value-first, no pitch
- Nurture: educate, build trust, soft CTAs
- Sales: problem-solution, urgency, direct CTA
- Onboarding: step-by-step, milestone-based
- Win-back: acknowledge gap, new value, easy yes`,

    analytics_report: `You are the SIXXAB Analytics Agent. Generate a business performance analysis:

Business: ${params.bizName} (${params.industry})
Period: ${params.period || "Last 30 days"}
Current MRR: $${params.mrr || 0}
New customers: ${params.newCustomers || 0}
Churned customers: ${params.churned || 0}
Total leads: ${params.leads || 0}
Conversion rate: ${params.convRate || 0}%
Average deal size: $${params.dealSize || 0}
Top channel: ${params.topChannel || "LinkedIn"}

Generate a comprehensive analytics report:

## HEADLINE METRICS
MRR Growth, Churn Rate, CAC, LTV, LTV:CAC ratio — calculate from the data provided.

## PIPELINE HEALTH
Analyse the conversion funnel and identify the biggest drop-off point.

## GROWTH LEVERS
Top 3 specific actions to increase MRR this month, based on the data.

## CHANNEL PERFORMANCE
Rate each channel (LinkedIn, Email, Content, Referral) based on the data provided.

## 30-DAY FORECAST
Projected MRR next month based on current trajectory.

## RED FLAGS
Any metrics that signal a problem that needs immediate attention.`,

    review_manager: `You are the SIXXAB Review Manager Agent. Generate review management content for:

Business: ${params.bizName} (${params.industry}, ${params.location})
Platform: ${params.platform || "Google Business Profile"}
Recent review: "${params.reviewText || ""}"
Review rating: ${params.rating || 5} stars
Reviewer: ${params.reviewer || "Anonymous Customer"}

Generate:

## REVIEW RESPONSE
A professional, personalised response to this review that:
- Thanks by first name if given
- References something specific they mentioned
- For negative: acknowledges, apologises, offers resolution (not defensive)
- For positive: shows genuine gratitude, subtly highlights another service
- Max 3 sentences — concise and human

## REVIEW REQUEST EMAIL
A short email to send to happy customers asking for a Google review. Max 4 sentences. Include a direct link placeholder [GOOGLE_REVIEW_LINK]. Non-pushy.

## REVIEW REQUEST SMS
A 1-sentence SMS text asking for a review. Max 160 chars. Include link placeholder.

## REVIEW STRATEGY FOR ${params.industry.toUpperCase()}
5 specific tactics to get more 5-star reviews for this type of business.`,
  }

  const prompt = PROMPTS[tool]
  if (!prompt) return res.status(400).json({ error: `Unknown tool: ${tool}` })

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version":"2023-06-01", "Content-Type":"application/json" },
      body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:2000,
        messages:[{ role:"user", content:prompt }] })
    })
    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message || "AI error" })
    return res.status(200).json({ result: d.content?.[0]?.text || "" })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
