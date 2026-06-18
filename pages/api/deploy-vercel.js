// pages/api/deploy-vercel.js — Deploy static HTML to Vercel
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
        "Go to vercel.com → avatar (top-right) → Account Settings",
        "Left sidebar → Tokens → Create Token",
        "Name: SIXXAB Deployer · Expiry: 1 year · Copy immediately",
        "Your SIXXAB project → Settings → Environment Variables",
        "Add VERCEL_TOKEN = [your token] → all environments → Save",
        "Redeploy SIXXAB → try Deploy again",
      ],
    })
  }

  if (!html) return res.status(400).json({ error: "HTML required" })

  const slug = (projectName || "sixxab-site")
    .toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")
    .replace(/^-|-$/g, "").slice(0, 52) || "sixxab-site"

  const fullHtml = html.trimStart().startsWith("<!DOCTYPE") ? html
    : `<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"></head><body>${html}</body></html>`

  // Minimal vercel.json for plain static HTML — no builder, no framework
  const vercelJson = `{"version":2,"routes":[{"src":"/","dest":"/index.html"},{"src":"/(.*)","dest":"/index.html"}]}`

  const sha1 = s => crypto.createHash("sha1").update(s, "utf8").digest("hex")

  const htmlSha  = sha1(fullHtml)
  const vcfgSha  = sha1(vercelJson)
  const htmlSize = Buffer.byteLength(fullHtml,  "utf8")
  const vcfgSize = Buffer.byteLength(vercelJson, "utf8")

  const headers = { Authorization: `Bearer ${TOKEN}` }

  try {
    // Step 1 — upload blobs
    for (const { content, sha } of [
      { content: fullHtml,   sha: htmlSha },
      { content: vercelJson, sha: vcfgSha },
    ]) {
      const up = await fetch("https://api.vercel.com/v2/files", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/octet-stream", "x-vercel-digest": sha },
        body: content,
      })
      if (!up.ok && up.status !== 409) {
        const t = await up.text()
        return res.status(400).json({ error: "Upload failed: " + t.slice(0, 200) })
      }
    }

    // Step 2 — create deployment (no framework, no builder — pure static)
    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: slug,
        target: "production",
        files: [
          { file: "index.html", sha: htmlSha,  size: htmlSize  },
          { file: "vercel.json", sha: vcfgSha, size: vcfgSize  },
        ],
        projectSettings: {
          framework: null,
          buildCommand: null,
          outputDirectory: null,
          installCommand: null,
          devCommand: null,
        },
      }),
    })

    const deploy = await deployRes.json()

    if (!deployRes.ok) {
      const msg = deploy.error?.message || deploy.message || JSON.stringify(deploy).slice(0, 300)
      return res.status(400).json({ error: msg, vercel_raw: deploy })
    }

    const liveUrl = deploy.url ? `https://${deploy.url}` : `https://${slug}.vercel.app`

    return res.status(200).json({
      deployed: true,
      url: liveUrl,
      id: deploy.id,
      status: deploy.readyState || "BUILDING",
      eta: "30–60 seconds to go live",
    })

  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
