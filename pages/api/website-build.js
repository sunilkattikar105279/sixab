// pages/api/website-build.js
// Dedicated API for website generation — NO word limits, full HTML output
// Completely separate from /api/chat to avoid the 260-word system prompt cap

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { action, bizData } = req.body ?? {}
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error:"ANTHROPIC_API_KEY not set" })

  const { bizName="Business", industry="Consulting", tagline="", services="",
          phone="", email="", address="Dallas, TX", website="",
          template="corporate", primaryColor="#1E3A5F", accentColor="#0EA5E9" } = bizData || {}

  // Template color schemes
  const SCHEMES = {
    corporate: { bg:"#0F1B2D", hero:"linear-gradient(135deg,#0F1B2D 0%,#1E3A5F 50%,#0EA5E9 100%)", accent:"#0EA5E9", text:"#fff", card:"#fff", cardBorder:"#E2E8F0" },
    bold:      { bg:"#0A0E1A", hero:"linear-gradient(135deg,#0A0E1A 0%,#1a1a2e 60%,#EF9F27 100%)", accent:"#EF9F27", text:"#fff", card:"#fff", cardBorder:"#E2E8F0" },
    warm:      { bg:"#7C2D12", hero:"linear-gradient(135deg,#7C2D12 0%,#9A3412 60%,#F97316 100%)", accent:"#F97316", text:"#fff", card:"#fff", cardBorder:"#FED7AA" },
    fresh:     { bg:"#064E3B", hero:"linear-gradient(135deg,#064E3B 0%,#065F46 60%,#10B981 100%)", accent:"#10B981", text:"#fff", card:"#fff", cardBorder:"#A7F3D0" },
    luxury:    { bg:"#1F1F1F", hero:"linear-gradient(135deg,#1F1F1F 0%,#2D2D2D 60%,#D4AF37 100%)", accent:"#D4AF37", text:"#fff", card:"#fff", cardBorder:"#E8D5B7" },
  }
  const scheme = SCHEMES[template] || SCHEMES.corporate

  const PROMPTS = {

    design: `You are a senior website strategist and UX architect. Create a detailed website strategy for:

BUSINESS: ${bizName}
INDUSTRY: ${industry}
TAGLINE: ${tagline || "Professional. Reliable. Results."}
SERVICES: ${services || "Professional consulting services"}
LOCATION: ${address}
CONTACT: ${phone} | ${email}

Produce a complete strategy document with these exact sections:

## BRAND POSITIONING
In one sentence: what makes ${bizName} different from every competitor in ${industry}.

## TARGET AUDIENCE
Primary buyer: [job title or description]
Their #1 problem: [specific pain point]
What makes them choose ${bizName}: [specific reason]

## SITE STRUCTURE
List every section in order with purpose:
1. Navigation — items and CTA button
2. Hero — headline (6 words max), subheadline, 2 CTAs
3. Social proof bar — stats with numbers
4. Services grid — 6 services with icons and descriptions
5. Why us — 3 differentiators with proof
6. Case study or result — specific example
7. Testimonials — 3 real-sounding client quotes
8. Process — 4 steps
9. Team section — 2-3 roles
10. FAQ — 5 questions and answers
11. CTA section — final push
12. Contact — form + map
13. Footer — 4 columns

## COPY ESSENTIALS
Hero headline: [write the exact words — max 6 words]
Hero subheadline: [write the exact words — max 18 words]
Primary CTA button: [exact text]
Secondary CTA button: [exact text]
Value prop 1: [specific and measurable]
Value prop 2: [specific and measurable]
Value prop 3: [specific and measurable]

## SEO STRATEGY
Page title (max 60 chars): [write it]
Meta description (max 155 chars): [write it]
Top 5 target keywords: [list them]

## CONTENT FOR EACH SERVICE
Write a title and 2-sentence description for each of these services: ${services || "Digital Transformation, IT Strategy, Cloud Migration, Cybersecurity, Data Analytics, Custom Development"}

## SOCIAL MEDIA ALIGNMENT
Which 2 platforms to focus on and what type of content to post there.`,

    build: `You are an expert front-end developer who writes clean, professional, production-ready HTML/CSS websites.

Build a COMPLETE single-file website for:
BUSINESS: ${bizName}
INDUSTRY: ${industry}
TAGLINE: ${tagline || "Professional. Reliable. Results."}
SERVICES: ${services || "Digital Transformation, IT Strategy, Cloud Migration, Cybersecurity, Data Analytics, Custom Development"}
PHONE: ${phone || "+1 (972) 000-0000"}
EMAIL: ${email || "info@business.com"}
ADDRESS: ${address}
WEBSITE: ${website}
COLOR SCHEME: Hero gradient — ${scheme.hero}, Accent — ${scheme.accent}

ABSOLUTE REQUIREMENTS:
1. Start with <!DOCTYPE html> and end with </html> — output the COMPLETE file, every single line
2. Embed ALL CSS in one <style> tag — no external CSS files
3. Load fonts from Google Fonts CDN in <head>
4. Every section has REAL content written for ${bizName} — no "Lorem ipsum", no "[Your text here]", no placeholder copy
5. All 13 sections must be present and complete

SECTIONS REQUIRED (in this order):

1. <head>: charset, viewport, title "${bizName} | ${industry} | ${address}", meta description, Google Fonts (Outfit for headings, Inter for body), favicon emoji 🏢

2. NAVIGATION: sticky, logo "${bizName}", nav links (Home Services About Process Testimonials Contact), CTA button "Get Free Consultation" linking to #contact. CSS: bg transparent → white on scroll via JS.

3. HERO: full-viewport height, background ${scheme.hero}. Large heading (64px desktop, 36px mobile): write a compelling headline for ${bizName}. Subheadline paragraph. Two buttons: primary "${phone||"Contact Us"}" (amber/accent color), secondary "See Our Services" (outline white). Hero includes 3 animated stat numbers (e.g. "150+ Clients", "12 Years", "98% Satisfaction").

4. SERVICES GRID: white background, section title "Our Services", subtitle. 6 service cards in CSS grid (3 col desktop, 2 tablet, 1 mobile). Each card: large emoji icon, service name, 2-sentence description. Hover: lift + shadow. Services from: ${services || "Digital Transformation, IT Strategy, Cloud Migration, Cybersecurity, Data Analytics, Custom Development"}.

5. WHY CHOOSE US: ${scheme.bg} dark background, 3 columns with icon + title + description. Include real differentiators for ${industry}.

6. PROCESS: white bg, 4 numbered steps with arrows between them. Steps: Discovery → Strategy → Execution → Results. Each with description.

7. RESULTS/STATS: accent color background (${scheme.accent}), 4 large numbers (clients served, years experience, projects completed, satisfaction rate) with labels.

8. TESTIMONIALS: light gray bg, 3 cards with quote, 5 stars (★★★★★), client name, company, avatar initials.

9. TEAM: white bg, 3 team member cards with initials avatar, name, role, brief bio.

10. FAQ: accordion-style, 6 questions relevant to ${industry} with detailed answers. Pure CSS accordion (no JS needed, use <details><summary>).

11. CTA BANNER: ${scheme.hero} gradient, bold headline "Ready to Transform Your Business?", subtext, two buttons.

12. CONTACT: two-column. Left: contact info (address, phone, email, working hours) with icons. Right: form (name, email, phone, company, message, submit button). Form action="https://formspree.io/f/placeholder" method="POST".

13. FOOTER: dark (${scheme.bg}), 4 columns: Logo+tagline+social links, Services list, Company links (About/Blog/Careers/Privacy), Contact info. Bottom bar with copyright "${new Date().getFullYear()} ${bizName}. All rights reserved."

FLOATING ELEMENTS:
- WhatsApp button: fixed bottom-right, green circle, WhatsApp icon (W), href="https://wa.me/${(phone||"1972000000").replace(/\D/g,"")}"
- Back-to-top button: fixed bottom-right (above WhatsApp), appears after scroll

CSS REQUIREMENTS:
- Mobile-first responsive (breakpoints: 768px, 1024px)
- CSS custom properties (--accent: ${scheme.accent}, --bg: ${scheme.bg})
- Smooth scroll (scroll-behavior: smooth)
- Cards: hover transform translateY(-6px) + box-shadow transition
- Buttons: hover opacity + slight scale
- Nav: position fixed, transitions to white bg with shadow on scroll
- Fade-in animation on scroll using Intersection Observer (pure JS, ~10 lines)

JS (inline, <script> at bottom):
1. Nav background change on scroll
2. Intersection Observer for fade-in animations
3. Counter animation for stat numbers (0 to final value)
4. Smooth scroll for anchor links

OUTPUT: The complete HTML file from <!DOCTYPE html> to </html>. Do not truncate. Do not stop early. Do not add any explanation before or after the HTML.`,

  }

  const prompt = PROMPTS[action]
  if (!prompt) return res.status(400).json({ error: `Unknown action: ${action}` })

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         key,
        "anthropic-version": "2023-06-01",
        "Content-Type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 8000,          // Full HTML — needs high token limit
        system:     "You are an expert web developer and business strategist. When asked to build a website, output ONLY the complete HTML file with no explanation before or after. Start directly with <!DOCTYPE html> and end with </html>.",
        messages: [{ role:"user", content:prompt }],
      }),
    })

    const d = await r.json()
    if (!r.ok) return res.status(500).json({ error: d.error?.message || "API error" })

    const result = d.content?.[0]?.text || ""
    return res.status(200).json({ result, action, stop_reason: d.stop_reason })

  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
