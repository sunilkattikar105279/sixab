// pages/api/social/publish.js
// Publishes content to social platforms using tokens from HttpOnly cookies
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { platforms, content, mediaUrl, scheduleAt } = req.body ?? {}

  if (!platforms?.length) return res.status(400).json({ error: "platforms array required" })
  if (!content?.trim())   return res.status(400).json({ error: "content required" })

  // Parse a cookie by name
  const raw = req.headers.cookie || ""
  function getCookie(name) {
    const match = raw.split(";").map(c => c.trim()).find(c => c.startsWith(name + "="))
    if (!match) return null
    try { return JSON.parse(decodeURIComponent(match.slice(name.length + 1))) } catch { return null }
  }

  const published = []
  const failed    = []

  for (const platform of platforms) {
    const cookieData = getCookie(`sixxab_social_${platform}`)
    const token = cookieData?.accessToken

    if (!token) {
      failed.push({ platform, error: `Not connected — visit /social to connect ${platform}` })
      continue
    }
    if (cookieData.expiresAt && Date.now() > cookieData.expiresAt) {
      failed.push({ platform, error: `${platform} token expired — reconnect at /social` })
      continue
    }

    try {
      let postUrl = null

      // ── LinkedIn ──────────────────────────────────────────────
      if (platform === "linkedin") {
        const sub = cookieData.sub
        if (!sub) { failed.push({ platform, error: "LinkedIn user ID missing — reconnect" }); continue }

        const body = {
          author:          `urn:li:person:${sub}`,
          lifecycleState:  "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: content },
              shareMediaCategory: "NONE",
            }
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
        }

        const r = await fetch("https://api.linkedin.com/v2/ugcPosts", {
          method:  "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0" },
          body:    JSON.stringify(body),
        })
        const d = await r.json()

        if (r.ok && d.id) {
          postUrl = `https://www.linkedin.com/feed/update/${d.id}/`
          published.push({ platform, url: postUrl, id: d.id })
        } else {
          failed.push({ platform, error: d.message || d.errorDetails || JSON.stringify(d).slice(0,200) })
        }
      }

      // ── Twitter / X ───────────────────────────────────────────
      else if (platform === "twitter") {
        const tweetText = content.length > 280 ? content.slice(0, 277) + "…" : content
        const r = await fetch("https://api.twitter.com/2/tweets", {
          method:  "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body:    JSON.stringify({ text: tweetText }),
        })
        const d = await r.json()
        if (r.ok && d.data?.id) {
          postUrl = `https://twitter.com/i/web/status/${d.data.id}`
          published.push({ platform, url: postUrl, id: d.data.id })
        } else {
          failed.push({ platform, error: d.detail || d.errors?.[0]?.message || "Tweet failed" })
        }
      }

      // ── Facebook ──────────────────────────────────────────────
      else if (platform === "facebook") {
        const pageId = cookieData.pageId || "me"
        const r = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ message: content, access_token: token }),
        })
        const d = await r.json()
        if (r.ok && d.id) {
          published.push({ platform, id: d.id })
        } else {
          failed.push({ platform, error: d.error?.message || "Facebook post failed" })
        }
      }

      // ── Instagram ─────────────────────────────────────────────
      else if (platform === "instagram") {
        const igId = cookieData.instagramId
        if (!igId) { failed.push({ platform, error: "Instagram Business account not linked — connect Facebook first" }); continue }
        // Create media container
        const mc = await fetch(`https://graph.facebook.com/v19.0/${igId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caption: content, media_type: "REELS", ...(mediaUrl ? { video_url: mediaUrl } : { image_url: "https://www.startupsinabox.com/og.png" }), access_token: token }),
        })
        const mcData = await mc.json()
        if (!mc.ok || !mcData.id) { failed.push({ platform, error: mcData.error?.message || "Instagram media create failed" }); continue }
        // Publish
        const pub = await fetch(`https://graph.facebook.com/v19.0/${igId}/media_publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creation_id: mcData.id, access_token: token }),
        })
        const pubData = await pub.json()
        if (pub.ok && pubData.id) published.push({ platform, id: pubData.id })
        else failed.push({ platform, error: pubData.error?.message || "Instagram publish failed" })
      }

      // ── YouTube (Community post) ───────────────────────────────
      else if (platform === "youtube") {
        // YouTube Community posts via Data API v3
        const r = await fetch("https://www.googleapis.com/youtube/v3/communityPosts?part=snippet,status", {
          method:  "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body:    JSON.stringify({ snippet: { textOriginal: content }, status: { privacyStatus: "public" } }),
        })
        const d = await r.json()
        if (r.ok && d.id) published.push({ platform, id: d.id })
        else failed.push({ platform, error: d.error?.message || "YouTube post failed — Community posts require 500+ subscribers" })
      }

      else {
        failed.push({ platform, error: `Platform "${platform}" not yet supported` })
      }

    } catch(e) {
      failed.push({ platform, error: e.message })
    }
  }

  const success = published.length > 0
  return res.status(200).json({
    success,
    published,
    failed,
    summary: published.length
      ? `Published to ${published.length} platform${published.length!==1?"s":""}`
      : `Failed: ${failed.map(f=>f.error).join(", ")}`,
  })
}
