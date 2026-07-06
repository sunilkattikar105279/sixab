// pages/api/social/schedule.js
// GET  — cron job endpoint (call every 5 min via cron-job.org)
// POST — save a scheduled post to localStorage on client / Supabase if configured
export default async function handler(req, res) {

  // ── GET — process due posts (called by cron) ───────────────────
  if (req.method === "GET") {
    const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SB_URL || !SB_SVC) {
      return res.status(200).json({ processed: 0, reason: "Supabase not configured — posts are stored client-side only" })
    }

    try {
      const now = new Date().toISOString()

      // Fetch posts due now
      const r = await fetch(
        `${SB_URL}/rest/v1/scheduled_posts?status=eq.scheduled&schedule_at=lte.${now}&select=*&limit=20`,
        { headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}` } }
      )
      const posts = await r.json()
      if (!Array.isArray(posts) || posts.length === 0) {
        return res.status(200).json({ processed: 0, message: "No posts due" })
      }

      const results = []

      for (const post of posts) {
        // Get user's social tokens from Supabase (stored in social_tokens table if it exists)
        // For now mark as attempted and log — actual publishing requires user tokens
        try {
          // Call publish endpoint internally
          const pr = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://www.startupsinabox.com"}/api/social/publish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platforms: post.platforms, content: post.content }),
          })
          const pd = await pr.json()

          // Update post status
          await fetch(`${SB_URL}/rest/v1/scheduled_posts?id=eq.${post.id}`, {
            method: "PATCH",
            headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              status: pd.published?.length > 0 ? "published" : "failed",
              result: pd,
            }),
          })

          results.push({ id: post.id, status: pd.published?.length > 0 ? "published" : "failed" })
        } catch(e) {
          results.push({ id: post.id, status: "error", error: e.message })
        }
      }

      return res.status(200).json({ processed: posts.length, results })
    } catch(e) {
      return res.status(200).json({ processed: 0, error: e.message })
    }
  }

  // ── POST — save a scheduled post ──────────────────────────────
  if (req.method === "POST") {
    const { platforms, content, scheduleAt, mediaUrl } = req.body ?? {}
    if (!platforms?.length || !content || !scheduleAt) {
      return res.status(400).json({ error: "platforms, content and scheduleAt required" })
    }

    const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY

    // If Supabase configured, save there
    if (SB_URL && SB_SVC) {
      // Get user from token
      const token = req.headers.authorization?.replace("Bearer ", "")
      let userId = null
      if (token) {
        try {
          const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          const ur = await fetch(`${SB_URL}/auth/v1/user`, {
            headers: { apikey: SB_ANON, Authorization: `Bearer ${token}` }
          })
          if (ur.ok) { const u = await ur.json(); userId = u.id }
        } catch {}
      }

      if (userId) {
        const r = await fetch(`${SB_URL}/rest/v1/scheduled_posts`, {
          method: "POST",
          headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify({ user_id: userId, platforms, content, media_url: mediaUrl || null, schedule_at: scheduleAt, status: "scheduled" }),
        })
        const d = await r.json()
        if (r.ok) return res.status(200).json({ scheduled: true, id: Array.isArray(d) ? d[0]?.id : d?.id, storage: "database" })
      }
    }

    // Fallback — client handles scheduling in localStorage
    return res.status(200).json({ scheduled: true, storage: "client", message: "Post saved. Client-side scheduler will publish at the scheduled time." })
  }

  res.status(405).end()
}
