// pages/api/deploy-vercel.js
import crypto from "crypto"
export const config = { api: { bodyParser: { sizeLimit: "4mb" } } }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { html, projectName } = req.body ?? {}
  const TOKEN = process.env.VERCEL_TOKEN

  if (!TOKEN) {
    return res.status(200).json({
      deployed: false, needsSetup: true,
      setupSteps: [
        "vercel.com → avatar → Account Settings → Tokens → Create Token",
        "Name: SIXXAB Deployer · Expiry: 1 year",
        "Copy token once — add to SIXXAB project → Settings → Env Vars → VERCEL_TOKEN",
        "Redeploy SIXXAB then try Deploy again",
      ],
    })
  }
  if (!html) return res.status(400).json({ error: "HTML required" })

  const slug = (projectName || "sixxab-site")
    .toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,52) || "sixxab-site"

  const fullHtml = html.trimStart().startsWith("<!DOCTYPE") ? html
    : `<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"></head><body>${html}</body></html>`

  const sha1 = s => crypto.createHash("sha1").update(s,"utf8").digest("hex")

  const hSha = sha1(fullHtml)
  const hSize = Buffer.byteLength(fullHtml,"utf8")

  const AUTH = { Authorization: `Bearer ${TOKEN}` }

  try {
    // Upload HTML blob
    const up = await fetch("https://api.vercel.com/v2/files", {
      method: "POST",
      headers: { ...AUTH, "Content-Type":"application/octet-stream", "x-vercel-digest": hSha },
      body: fullHtml,
    })
    if (!up.ok && up.status !== 409) {
      const t = await up.text()
      return res.status(400).json({ error: "Upload failed: " + t.slice(0,300) })
    }

    // Create deployment — simplest possible static config
    const body = {
      name:   slug,
      target: "production",
      files:  [{ file:"index.html", sha: hSha, size: hSize }],
      projectSettings: { framework: null, buildCommand: null, outputDirectory: null, installCommand: null },
    }

    const dr = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: { ...AUTH, "Content-Type":"application/json" },
      body: JSON.stringify(body),
    })
    const deploy = await dr.json()

    if (!dr.ok) {
      return res.status(400).json({
        error: deploy.error?.message || deploy.message || "Deployment failed",
        vercel: deploy,
      })
    }

    const url = deploy.url ? `https://${deploy.url}` : `https://${slug}.vercel.app`
    return res.status(200).json({ deployed:true, url, id:deploy.id, status:deploy.readyState||"BUILDING" })

  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
