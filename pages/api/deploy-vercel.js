// pages/api/deploy-vercel.js
// Deploys a static HTML website to Vercel via REST API
// Requires VERCEL_TOKEN in env vars
// Docs: https://vercel.com/docs/rest-api

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { html, css, projectName, bizName, industry, template } = req.body ?? {}
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN

  // ── No token — return manual instructions ────────────────────────────────
  if (!VERCEL_TOKEN) {
    return res.status(200).json({
      deployed:    false,
      needsSetup:  true,
      message:     "VERCEL_TOKEN not configured",
      setupSteps: [
        "1. Go to vercel.com → click your avatar (top-right) → Account Settings",
        "2. Click 'Tokens' in the left sidebar (or go to vercel.com/account/tokens)",
        "3. Click 'Create Token' — name it 'SIXXAB Website Deployer'",
        "4. Set expiry to 1 year, scope to your account",
        "5. Copy the token — shown ONCE only",
        "6. In your SIXXAB Vercel project → Settings → Environment Variables",
        "7. Add: VERCEL_TOKEN = [paste token] → select all environments → Save",
        "8. Redeploy SIXXAB → then click Deploy to Vercel again",
      ],
    })
  }

  if (!html) return res.status(400).json({ error: "HTML content required" })

  // Sanitise project name
  const slug = (projectName || bizName || "sixxab-site")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 52) || "sixxab-site"

  // Build a clean, production-ready HTML if we only got a fragment
  const fullHtml = html.includes("<!DOCTYPE") ? html : `<!DOCTYPE html><html>${html}</html>`

  try {
    // ── Step 1: Check if project already exists ──────────────────────────────
    const checkRes = await fetch(`https://api.vercel.com/v9/projects/${slug}`, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
    })

    // ── Step 2: Deploy files ─────────────────────────────────────────────────
    const deployBody = {
      name:      slug,
      framework: null,   // static — no framework
      public:    true,
      files: [
        {
          file:     "index.html",
          data:     fullHtml,
          encoding: "utf-8",
        },
        {
          // vercel.json tells Vercel this is a static site
          file:     "vercel.json",
          data:     JSON.stringify({
            cleanUrls:    true,
            trailingSlash: false,
            headers: [
              { source:"/(.*)", headers:[
                { key:"X-Frame-Options",         value:"SAMEORIGIN" },
                { key:"X-Content-Type-Options",  value:"nosniff" },
              ]}
            ]
          }, null, 2),
          encoding: "utf-8",
        },
      ],
      projectSettings: {
        framework:       null,
        buildCommand:    null,
        outputDirectory: null,
        installCommand:  null,
        devCommand:      null,
        rootDirectory:   null,
      },
      target: "production",
    }

    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deployBody),
    })

    const deploy = await deployRes.json()

    if (!deployRes.ok) {
      const errMsg = deploy.error?.message || deploy.message || JSON.stringify(deploy).slice(0,200)
      // Common errors
      if (errMsg.includes("rate limit"))
        return res.status(429).json({ error: "Vercel rate limit — wait 1 minute and try again" })
      if (errMsg.includes("forbidden") || errMsg.includes("401"))
        return res.status(401).json({ error: "Invalid VERCEL_TOKEN — regenerate at vercel.com/account/tokens" })
      return res.status(400).json({ error: errMsg, raw: deploy })
    }

    const deployUrl = deploy.url
      ? `https://${deploy.url}`
      : `https://${slug}.vercel.app`

    const dashboardUrl = `https://vercel.com/dashboard`

    return res.status(200).json({
      deployed:     true,
      id:           deploy.id,
      url:          deployUrl,
      alias:        `https://${slug}.vercel.app`,
      status:       deploy.readyState || "BUILDING",
      dashboard:    dashboardUrl,
      eta:          "60–90 seconds to go live",
      customDomain: `To add a custom domain: ${dashboardUrl} → your project → Settings → Domains`,
    })

  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
