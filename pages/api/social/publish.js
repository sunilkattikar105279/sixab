// pages/api/social/publish.js — Unified multi-platform publish endpoint
// Called from Content Studio — posts to any connected platform

// ── Token helpers ──────────────────────────────────────────────────────────────
function getToken(req, platform) {
  try {
    // Parse cookies manually — no external package needed
    const cookies = Object.fromEntries(
      (req.headers.cookie || "").split(";").map(c => {
        const idx = c.indexOf("=")
        return [c.slice(0,idx).trim(), c.slice(idx+1).trim()]
      }).filter(([k]) => k)
    )
    const raw = cookies[`sixxab_social_${platform}`]
    if (!raw) return null
    return JSON.parse(decodeURIComponent(raw))
  } catch { return null }
}

// ── Platform publishers ────────────────────────────────────────────────────────
async function publishLinkedIn(token, { content, mediaUrl }) {
  const { accessToken, sub } = token
  if (!sub) throw new Error("LinkedIn sub (user ID) missing — reconnect your account")

  const body = {
    author: `urn:li:person:${sub}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: content },
        shareMediaCategory: "NONE",
      }
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
  }

  const r = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": "202401",
    },
    body: JSON.stringify(body)
  })
  const text = await r.text()
  let d = {}
  try { d = JSON.parse(text) } catch {}
  if (!r.ok) throw new Error(d.message || d.serviceErrorCode || `LinkedIn error ${r.status}: ${text.slice(0,200)}`)
  const postId = d.id || r.headers?.get("x-restli-id") || ""
  return { platform:"linkedin", id: postId, url: postId ? `https://www.linkedin.com/feed/update/${postId}` : "https://www.linkedin.com/feed" }
}

async function publishTwitter(token, { content }) {
  const { accessToken } = token
  // Twitter/X: max 280 chars — truncate if longer
  const text = content.length > 280 ? content.slice(0,277)+"…" : content
  const r = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  })
  const d = await r.json()
  if (!r.ok || d.errors) {
    const msg = d.errors?.[0]?.message || d.detail || d.title || `Twitter error ${r.status}`
    throw new Error(msg)
  }
  const id = d.data?.id
  return { platform:"twitter", id, url: id ? `https://twitter.com/i/web/status/${id}` : "https://twitter.com" }
}

async function publishFacebook(token, { content, pageId, mediaUrl }) {
  const page = token.pages?.find(p => p.id === pageId) || token.pages?.[0]
  if (!page) throw new Error("No Facebook page found. Connect a Facebook page first.")
  const pageToken = page.token

  let endpoint = `https://graph.facebook.com/v19.0/${page.id}/feed`
  const body = { message: content, access_token: pageToken }
  if (mediaUrl) {
    endpoint = `https://graph.facebook.com/v19.0/${page.id}/photos`
    body.url = mediaUrl
    body.caption = content
  }
  const r = await fetch(endpoint, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
  const d = await r.json()
  if (d.error) throw new Error(d.error.message || "Facebook publish failed")
  return { platform:"facebook", id: d.id, url: `https://www.facebook.com/${page.id}/posts/${d.id?.split("_")[1]}` }
}

async function publishInstagram(token, { content, mediaUrl, igId }) {
  const igAccount = token.igAccounts?.[0]
  if (!igAccount) throw new Error("No Instagram business account found. Link Instagram to your Facebook page first.")
  const { igId: accountId, pageToken } = igAccount

  if (!mediaUrl) {
    // Instagram requires media — use a brand default or skip
    return { platform:"instagram", id:"text_skipped", url:"#", note:"Instagram requires an image. Add a media URL to post." }
  }

  // Step 1: Create media container
  const containerRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/media`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ image_url: mediaUrl, caption: content, access_token: pageToken })
  })
  const container = await containerRes.json()
  if (container.error) throw new Error(container.error.message)

  // Step 2: Publish
  const publishRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/media_publish`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ creation_id: container.id, access_token: pageToken })
  })
  const published = await publishRes.json()
  if (published.error) throw new Error(published.error.message)
  return { platform:"instagram", id: published.id, url: `https://www.instagram.com/p/${published.id}` }
}

async function publishYouTube(token, { content, title, videoUrl, privacyStatus = "public" }) {
  const { accessToken } = token
  if (!videoUrl) {
    return { platform:"youtube", id:"text_skipped", url:"#", note:"YouTube requires a video URL. Add a video to post." }
  }
  // YouTube community post (channel post, not video)
  const r = await fetch("https://www.googleapis.com/youtube/v3/posts?part=snippet,status", {
    method:"POST",
    headers: { Authorization:`Bearer ${accessToken}`, "Content-Type":"application/json" },
    body: JSON.stringify({ snippet: { text: content }, status: { isPublic: privacyStatus === "public" } })
  })
  const d = await r.json()
  if (d.error) throw new Error(d.error.message || "YouTube publish failed")
  return { platform:"youtube", id: d.id, url: `https://youtube.com/channel` }
}

// ── Main handler ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error:"Method not allowed" })
  const {
    platforms = [],   // ["linkedin","twitter","facebook","instagram","youtube"]
    content   = "",
    title     = "",
    mediaUrl  = "",
    videoUrl  = "",
    pageId    = "",
    scheduleAt,       // ISO string — for future scheduled posts
  } = req.body ?? {}

  if (!content)          return res.status(400).json({ error:"Content is required" })
  if (!platforms.length) return res.status(400).json({ error:"Select at least one platform" })

  const results = []
  const errors  = []

  for (const platform of platforms) {
    const token = getToken(req, platform)
    if (!token?.connected) {
      errors.push({ platform, error:`${platform} not connected — go to /social to connect` })
      continue
    }
    // Check token expiry
    if (token.expiresAt && Date.now() > token.expiresAt) {
      errors.push({ platform, error:`${platform} token expired — reconnect at /social` })
      continue
    }
    try {
      let result
      if      (platform === "linkedin")  result = await publishLinkedIn(token,  { content, mediaUrl })
      else if (platform === "twitter")   result = await publishTwitter(token,   { content })
      else if (platform === "facebook")  result = await publishFacebook(token,  { content, pageId, mediaUrl })
      else if (platform === "instagram") result = await publishInstagram(token, { content, mediaUrl })
      else if (platform === "youtube")   result = await publishYouTube(token,   { content, title, videoUrl })
      else { errors.push({ platform, error:`Unknown platform: ${platform}` }); continue }
      results.push(result)
    } catch(e) {
      errors.push({ platform, error: e.message })
    }
  }

  const success = results.length > 0
  return res.status(success ? 200 : 400).json({
    success,
    published: results,
    failed:    errors,
    summary:   `Published to ${results.length}/${platforms.length} platforms`,
  })
}
