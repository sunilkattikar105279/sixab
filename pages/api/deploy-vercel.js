// pages/api/deploy-vercel.js — Deploy HTML to Vercel via API
// Docs: https://vercel.com/docs/rest-api
// Requires: VERCEL_TOKEN in env vars (from vercel.com → Settings → Tokens)
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { html, projectName, framework = "static" } = req.body ?? {}
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN

  if (!VERCEL_TOKEN) {
    return res.status(200).json({
      deployed: false,
      message:  "VERCEL_TOKEN not set",
      setup:    "To enable one-click Vercel deployment: go to vercel.com → Settings → Tokens → Create Token → add as VERCEL_TOKEN in your Vercel project env vars",
      manual:   "For now use the manual deploy guide below",
    })
  }

  if (!html)        return res.status(400).json({ error: "HTML content required" })
  if (!projectName) return res.status(400).json({ error: "Project name required" })

  // Sanitise project name — Vercel requires lowercase, hyphens only
  const slug = projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 52)

  try {
    // Step 1 — Create a deployment via Vercel Files API
    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name:      slug,
        framework: null,        // static HTML, no framework
        public:    true,
        files: [
          {
            file:     "index.html",
            data:     html,
            encoding: "utf-8",
          },
        ],
        projectSettings: {
          framework:        null,
          buildCommand:     null,
          outputDirectory:  null,
          installCommand:   null,
          devCommand:       null,
        },
      }),
    })

    const deploy = await deployRes.json()

    if (!deployRes.ok) {
      return res.status(400).json({
        deployed: false,
        error:    deploy.error?.message || deploy.message || "Vercel API error",
        detail:   deploy,
      })
    }

    const url = deploy.url ? `https://${deploy.url}` : null
    const id  = deploy.id

    return res.status(200).json({
      deployed: true,
      id,
      url,
      name:      slug,
      status:    deploy.readyState || "BUILDING",
      message:   url ? `Deploying to ${url}` : "Deployment initiated",
      dashboard: `https://vercel.com/dashboard`,
      eta:       "30–60 seconds to go live",
    })

  } catch(e) {
    return res.status(500).json({ deployed: false, error: e.message })
  }
}
