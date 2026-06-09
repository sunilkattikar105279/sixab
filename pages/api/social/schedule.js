// pages/api/social/schedule.js — Store scheduled posts and publish when due
// Since we have no persistent DB, we store in-memory and use a cron-like check
// For production use: replace with Supabase or a cron job service

const SCHEDULE_STORE = global._sixxabSchedule || (global._sixxabSchedule = [])

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Add a scheduled post
    const { platforms, content, mediaUrl, scheduleAt, title } = req.body ?? {}
    if (!scheduleAt) return res.status(400).json({ error: "scheduleAt required" })
    if (!content)    return res.status(400).json({ error: "content required" })

    const post = {
      id:         `sch_${Date.now()}`,
      platforms:  platforms || [],
      content,
      mediaUrl:   mediaUrl || "",
      title:      title || content.slice(0,50),
      scheduleAt: new Date(scheduleAt).toISOString(),
      status:     "scheduled",
      createdAt:  new Date().toISOString(),
      // Copy cookies for server-side publishing
      cookies:    req.headers.cookie || "",
    }
    SCHEDULE_STORE.push(post)
    return res.status(200).json({ scheduled: true, id: post.id, scheduleAt: post.scheduleAt, post })
  }

  if (req.method === "GET") {
    // Check and publish any due posts
    const now = Date.now()
    const due = SCHEDULE_STORE.filter(p => p.status === "scheduled" && new Date(p.scheduleAt).getTime() <= now)

    const results = []
    for (const post of due) {
      try {
        const r = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"}/api/social/publish`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", "Cookie": post.cookies },
          body:    JSON.stringify({ platforms: post.platforms, content: post.content, mediaUrl: post.mediaUrl })
        })
        const d = await r.json()
        post.status    = d.published?.length > 0 ? "published" : "failed"
        post.result    = d
        post.publishedAt = new Date().toISOString()
        results.push({ id: post.id, status: post.status, summary: d.summary })
      } catch(e) {
        post.status = "failed"
        post.error  = e.message
        results.push({ id: post.id, status: "failed", error: e.message })
      }
    }

    return res.status(200).json({
      checked:   due.length,
      published: results.filter(r=>r.status==="published").length,
      failed:    results.filter(r=>r.status==="failed").length,
      results,
      allPosts:  SCHEDULE_STORE.map(p=>({ id:p.id, title:p.title, platforms:p.platforms, scheduleAt:p.scheduleAt, status:p.status }))
    })
  }

  if (req.method === "DELETE") {
    const { id } = req.body ?? {}
    const idx = SCHEDULE_STORE.findIndex(p=>p.id===id)
    if (idx>=0) { SCHEDULE_STORE.splice(idx,1); return res.status(200).json({ deleted: id }) }
    return res.status(404).json({ error: "Post not found" })
  }

  res.status(405).end()
}
