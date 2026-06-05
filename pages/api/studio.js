// pages/api/studio.js — SIXXAB AI Content Studio engine
// Handles all content generation: social posts, emails, blogs, video scripts, ads
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const { type, params, crmContacts = [], brand = {} } = req.body ?? {}
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" })

  const brandCtx = brand.name
    ? `Brand: ${brand.name}. Tone: ${brand.tone||"professional and direct"}. CTA: ${brand.cta||"Book a free call at startupsinabox.com"}. Target: ${brand.target||"founders and business owners"}.`
    : `Brand: SIXXAB AI — Autonomous Business Platform. Tagline: "Your business runs itself." Tone: direct, confident, founder-to-founder. CTA: startupsinabox.com. Target: founders, entrepreneurs and SMB owners.`

  const crmCtx = crmContacts.length > 0
    ? `\n\nTarget audience from CRM: ${crmContacts.slice(0,5).map(c=>`${c.name} (${c.role||""} at ${c.company||""})`).join(", ")}.`
    : ""

  const PROMPTS = {
    linkedin_post: `${brandCtx}${crmCtx}\n\nWrite a high-performing LinkedIn post about: "${params.topic}"\n\nRequirements:\n- Hook in first line (no "I" as first word, no generic opener)\n- 3–5 short paragraphs or bullets\n- Personal insight or specific data point\n- CTA at end — not sales-y, conversation-starting\n- Hashtags: 3 relevant ones at the bottom\n- Total: 150–250 words\n\nWrite the post only, no preamble.`,

    twitter_thread: `${brandCtx}${crmCtx}\n\nWrite a Twitter/X thread about: "${params.topic}"\n\nRequirements:\n- 6–8 tweets\n- Tweet 1: strong hook that stops the scroll\n- Tweets 2–6: one insight per tweet, max 250 chars each\n- Tweet 7: summary or contrarian take\n- Tweet 8: CTA with link\n- Number each tweet: 1/ 2/ 3/ etc.\n\nWrite the thread only.`,

    email_campaign: `${brandCtx}${crmCtx}\n\nWrite a cold outreach email for: "${params.purpose}"\n${params.recipientRole ? `Recipient role: ${params.recipientRole}` : ""}\n\nRequirements:\n- Subject line: specific, curiosity-driven, under 8 words (no clickbait)\n- Body: 4 sentences max — problem, proof, offer, CTA\n- No attachments, no "I hope this finds you well"\n- Personalisation placeholder: [First name], [Company]\n- PS line optional\n\nFormat as:\nSUBJECT: [subject]\n\n[body]\n\nPS: [ps]`,

    email_sequence: `${brandCtx}${crmCtx}\n\nWrite a 5-email nurture sequence for: "${params.purpose}"\nAudience stage: ${params.stage||"warm prospect"}\n\nRequirements:\n- Email 1 (Day 1): Welcome/value — no pitch\n- Email 2 (Day 3): One insight or tip relevant to their problem\n- Email 3 (Day 7): Social proof or case study\n- Email 4 (Day 14): Soft pitch with specific offer\n- Email 5 (Day 21): Last contact — breakup email style\n\nFor each email provide:\nDAY X — SUBJECT: [subject]\n[body — max 100 words]\n---`,

    blog_post: `${brandCtx}\n\nWrite a complete blog post on: "${params.topic}"\nTarget keyword: ${params.keyword||params.topic}\nWord count: ${params.wordCount||"600–800"} words\n\nStructure:\n- H1 headline (include keyword)\n- Intro: hook + promise\n- 3–4 H2 sections with practical content\n- Conclusion with CTA\n- Meta description: 155 chars\n\nWrite the full blog post.`,

    video_script: `${brandCtx}${crmCtx}\n\nWrite a video script for: "${params.topic}"\nPlatform: ${params.platform||"YouTube"}\nLength: ${params.length||"3–5 minutes"}\n\nStructure:\n[HOOK 0:00–0:15] — pattern interrupt opener\n[INTRO 0:15–0:30] — who you are, what they'll learn\n[MAIN CONTENT] — 3 key points with examples\n[CTA] — specific next step\n\nInclude: [B-ROLL], [TITLE CARD], [PAUSE] stage directions.`,

    ad_copy: `${brandCtx}${crmCtx}\n\nWrite 3 ad variations for: "${params.product||"SIXXAB AI"}"\nPlatform: ${params.platform||"LinkedIn"}\nObjective: ${params.objective||"trial signups"}\nAudience: ${params.audience||"founders and SMB owners"}\n\nFor each variation:\n- Headline: max 7 words\n- Primary text: 2–3 sentences\n- CTA button: 2–3 words\n- Describe the creative concept in one line\n\nLabel as: VARIATION A, B, C`,

    instagram_carousel: `${brandCtx}\n\nWrite a 7-slide Instagram carousel on: "${params.topic}"\n\nFor each slide:\nSLIDE [N]: [HEADLINE — max 6 words]\n[BODY — 1–2 sentences]\n[VISUAL NOTE — what to show]\n\nSlide 1: Hook — make them stop scrolling\nSlides 2–6: One insight each\nSlide 7: CTA — save this + follow`,

    press_release: `${brandCtx}\n\nWrite a press release for: "${params.announcement}"\nDate: ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}\n\nStructure:\n- FOR IMMEDIATE RELEASE\n- Headline\n- Subheadline\n- Dallas, TX dateline + lead paragraph (who, what, when, where, why)\n- 2–3 body paragraphs\n- Quote from founder (Sunil Kattikar)\n- Boilerplate about SIXXAB AI\n- Contact: sunil.kattikar@gmail.com\n\nWrite the full press release.`,

    brand_story: `${brandCtx}\n\nWrite the SIXXAB AI brand story in 3 versions:\n\n1. ELEVATOR (30 seconds spoken): One paragraph, conversational\n2. SOCIAL BIO (Twitter/LinkedIn): Under 160 characters  \n3. FULL STORY (2 minutes): Origin, problem, mission, vision — for About page\n\nLabel each clearly.`,
  }

  const prompt = PROMPTS[type]
  if (!prompt) return res.status(400).json({ error: `Unknown content type: ${type}` })

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000,
        messages: [{ role: "user", content: prompt }] })
    })
    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message || "AI error" })
    return res.status(200).json({ content: d.content?.[0]?.text || "", type, params })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
