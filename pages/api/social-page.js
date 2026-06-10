// pages/api/create-social-page.js
// Generates optimised social media profile content (bio, posts, cover text)
// for LinkedIn Company Page, Facebook Page, Instagram Business, Twitter/X
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { bizName, industry, tagline, website, location, services, platform } = req.body ?? {}
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" })

  const PROMPTS = {
    linkedin: `You are an expert LinkedIn Company Page optimizer.

Create a complete LinkedIn Company Page setup for:
Business: ${bizName}
Industry: ${industry}
Tagline: ${tagline || "Professional. Reliable. Results."}
Website: ${website || "https://startupsinabox.com"}
Location: ${location || "Dallas, TX"}
Services: ${services}

Generate:

## COMPANY NAME
Exactly as it should appear on LinkedIn

## TAGLINE
Max 120 characters. Clear value prop. No buzzwords.

## ABOUT SECTION
Max 2,000 characters. First 2 sentences must hook — show in preview before "See more".
Structure: Hook → What we do → Who we serve → How we're different → CTA with URL.

## SPECIALTIES
10 keywords/phrases for the Specialties field (comma-separated). These drive search discovery.

## FIRST 3 POSTS
Write 3 LinkedIn posts to publish on Day 1, Day 3, Day 7.
Each: hook line, 3–4 short paragraphs, CTA, 3 hashtags.

## COVER IMAGE BRIEF
Describe exactly what the cover image should show (designer brief).`,

    facebook: `You are an expert Facebook Business Page optimizer.

Create a complete Facebook Page setup for:
Business: ${bizName}
Industry: ${industry}
Website: ${website || "https://startupsinabox.com"}
Location: ${location || "Dallas, TX"}
Services: ${services}

Generate:

## PAGE NAME & CATEGORY
Exact page name + the best Facebook category to choose

## SHORT DESCRIPTION
Max 255 characters. Shows on page header. Must include CTA.

## ABOUT SECTION
Full about text (max 1,000 chars). Include: what you do, location, contact, website.

## SERVICES TO ADD
List 5–8 services to add in the Services tab with short descriptions.

## CALL TO ACTION BUTTON
Which CTA button to select (Book Now / Contact Us / Call Now / etc) and why.

## FIRST 3 POSTS
3 Facebook posts for Day 1, Day 3, Day 7. Include image brief for each.

## PINNED POST
Write the post to pin at the top — the first thing visitors see.`,

    instagram: `You are an Instagram Business Account expert.

Create a complete Instagram Business profile for:
Business: ${bizName}
Industry: ${industry}
Website: ${website || "https://startupsinabox.com"}
Location: ${location || "Dallas, TX"}
Services: ${services}

Generate:

## USERNAME
Best Instagram username (max 30 chars, relevant, memorable)

## DISPLAY NAME
How the business name should appear

## BIO
Max 150 characters. Line breaks matter — write it formatted.
Line 1: What you do (5 words)
Line 2: Who you serve (location/audience)
Line 3: Proof or differentiator
Line 4: CTA + link emoji 🔗

## LINK IN BIO STRATEGY
What URL to use and why (website, booking page, linktree, etc.)

## CONTENT PILLARS
5 content categories to post about consistently (e.g. "Before/After", "Tips", "Behind the scenes")

## FIRST 9 POSTS PLAN
The first 9 posts to create a cohesive grid. For each: caption concept + image brief + hashtags.

## STORY HIGHLIGHTS
5 highlight categories to create with names and what to put in each.`,

    twitter: `You are a Twitter/X Business Account expert.

Create a complete Twitter/X profile for:
Business: ${bizName}
Industry: ${industry}
Website: ${website || "https://startupsinabox.com"}
Location: ${location || "Dallas, TX"}

Generate:

## USERNAME / HANDLE
Best @handle (max 15 chars, available-likely, on-brand)

## DISPLAY NAME
How the business name appears

## BIO
Max 160 characters. No generic phrases. Include: what you do, for whom, CTA or hashtag.

## PINNED TWEET
A thread or single tweet to pin — your best introduction to the business.

## FIRST 7 TWEETS
One tweet per day for the first week. Mix: insight, proof, question, tip, story, offer.

## HASHTAG STRATEGY
10 hashtags to use regularly. Mix: niche (e.g. #HVAC), local (e.g. #Dallas), topic (#SmallBusiness).

## WHO TO FOLLOW FIRST
5 types of accounts to follow immediately to get noticed by the right people.`,
  }

  const prompt = PROMPTS[platform]
  if (!prompt) return res.status(400).json({ error: `Unknown platform: ${platform}` })

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:  "POST",
      headers: { "x-api-key": key, "anthropic-version":"2023-06-01", "Content-Type":"application/json" },
      body:    JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:2500, messages:[{ role:"user", content:prompt }] })
    })
    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message })
    return res.status(200).json({ result: d.content?.[0]?.text || "", platform })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
