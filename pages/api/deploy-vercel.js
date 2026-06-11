// pages/api/deploy-vercel.js
// Correctly deploys static HTML to Vercel REST API v13
// Key fix: files need sha256 digest when using data field
import crypto from "crypto"

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { html, projectName, bizName } = req.body ?? {}
  const TOKEN = process.env.VERCEL_TOKEN

  if (!TOKEN) {
    return res.status(200).json({
      deployed:   false,
      needsSetup: true,
      setupSteps: [
        "Go to vercel.com → click your avatar → Account Settings",
        "Left sidebar: Tokens → Create Token",
        "Name: SIXXAB Website Deployer · Expiry: 1 year",
        "Copy the token immediately — shown once only",
        "Your SIXXAB Vercel project → Settings → Environment Variables",
        "Add: VERCEL_TOKEN = [token] → all environments → Save",
        "Redeploy SIXXAB, then try again",
      ],
    })
  }

  if (!html) return res.status(400).json({ error: "HTML required" })

  // Clean project slug
  const slug = (projectName || bizName || "sixxab-site")
    .toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-")
    .replace(/^-|-$/g,"").slice(0,52) || "sixxab-site"

  // Ensure full HTML document
  const fullHtml = html.trimStart().startsWith("<!DOCTYPE")
    ? html
    : `<!DOCTYPE html>\n<html lang="en">${html}</html>`

  // vercel.json — static output config
  const vercelCfg = JSON.stringify({
    version: 2,
    builds:  [{ src:"index.html", use:"@vercel/static" }],
    routes:  [{ src:"/(.*)", dest:"/index.html" }],
  })

  // Compute SHA1 for each file (Vercel API requirement)
  function sha1(str) {
    return crypto.createHash("sha1").update(str,"utf8").digest("hex")
  }

  const files = [
    { file:"index.html", sha:sha1(fullHtml),  size:Buffer.byteLength(fullHtml,"utf8") },
    { file:"vercel.json", sha:sha1(vercelCfg), size:Buffer.byteLength(vercelCfg,"utf8") },
  ]

  try {
    // Step 1: Upload file blobs
    for (const f of [{ content:fullHtml, sha:files[0].sha }, { content:vercelCfg, sha:files[1].sha }]) {
      const up = await fetch(`https://api.vercel.com/v2/files`, {
        method:  "POST",
        headers: {
          Authorization:   `Bearer ${TOKEN}`,
          "Content-Type":  "application/octet-stream",
          "x-vercel-digest": f.sha,
        },
        body: f.content,
      })
      // 200 = uploaded, 409 = already exists — both are fine
      if (!up.ok && up.status !== 409) {
        const e = await up.text()
        return res.status(400).json({ error:`File upload failed: ${e.slice(0,200)}` })
      }
    }

    // Step 2: Create deployment
    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method:  "POST",
      headers: { Authorization:`Bearer ${TOKEN}`, "Content-Type":"application/json" },
      body: JSON.stringify({
        name:   slug,
        files,
        projectSettings: { framework:null, buildCommand:null, outputDirectory:null, installCommand:null },
        target: "production",
      }),
    })

    const deploy = await deployRes.json()

    if (!deployRes.ok) {
      const msg = deploy.error?.message || deploy.message || JSON.stringify(deploy).slice(0,300)
      if (msg.includes("rate limit")) return res.status(429).json({ error:"Vercel rate limit — wait 1 minute" })
      if (deploy.error?.code==="forbidden") return res.status(401).json({ error:"Invalid token — regenerate at vercel.com/account/tokens" })
      return res.status(400).json({ error:msg, raw:deploy })
    }

    const url = deploy.url ? `https://${deploy.url}` : `https://${slug}.vercel.app`

    return res.status(200).json({
      deployed:  true,
      url,
      id:        deploy.id,
      status:    deploy.readyState || "BUILDING",
      dashboard: "https://vercel.com/dashboard",
      eta:       "60–90 seconds",
    })

  } catch(e) {
    return res.status(500).json({ error:e.message })
  }
}
