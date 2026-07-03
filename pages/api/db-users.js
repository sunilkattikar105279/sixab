// pages/api/db-users.js — User profile management

// ── Inline Supabase (no lib/ dependency) ─────────────────────
let _admin = null
function getAdmin() {
  if (_admin) return _admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const { createClient } = require('@supabase/supabase-js')
  _admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  return _admin
}
async function getUser(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null
  const { createClient } = require('@supabase/supabase-js')
  const client = createClient(url, key)
  const { data: { user } } = await client.auth.getUser(token)
  return user
}
// ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const user = await getUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const db = getAdmin()
  if (!db) return res.status(500).json({ error: 'Database not configured — add SUPABASE env vars to Vercel' })
  const uid = user.id
  // Get current user role
  const { data: me } = await db.from('profiles').select('user_role,org_id').eq('id', uid).single()
  const isAdmin    = me?.user_role === 'admin'
  const isOperator = me?.user_role === 'operator' || isAdmin
  switch (req.method) {
    case 'GET': {
      if (isAdmin) {
        const { search, role: roleFilter, limit = 200 } = req.query
        let q = db.from('profiles').select('id,email,full_name,company,user_role,plan,plan_status,org_id,created_at,last_seen_at,onboarded').order('created_at', { ascending: false }).limit(+limit)
        if (roleFilter) q = q.eq('user_role', roleFilter)
        if (search)     q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,company.ilike.%${search}%`)
        const { data, error } = await q
        if (error) return res.status(500).json({ error: error.message })
        return res.status(200).json({ users: data })
      }
      if (isOperator && me?.org_id) {
        const { data, error } = await db.from('profiles').select('id,email,full_name,company,user_role,plan,plan_status,created_at').eq('org_id', me.org_id)
        if (error) return res.status(500).json({ error: error.message })
        return res.status(200).json({ users: data })
      }
      const { data, error } = await db.from('profiles').select('*').eq('id', uid).single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ users: [data] })
    }
    case 'PATCH': {
      const { id: targetId, user_role, ...updates } = req.body
      const updateId = (isAdmin && targetId) ? targetId : uid
      const safeUpdates = isAdmin ? { ...updates, ...(user_role && { user_role }) } : updates
      const { data, error } = await db.from('profiles').update(safeUpdates).eq('id', updateId).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ profile: data })
    }
    case 'POST': {
      if (!isOperator) return res.status(403).json({ error: 'Operator or Admin required' })
      const { email, role: inviteRole = 'customer', org_id } = req.body
      const { data, error } = await db.from('user_invites').insert({ email, role: inviteRole, org_id: org_id || me?.org_id || null, invited_by: uid }).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json({ invite: data })
    }
    case 'DELETE': {
      if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
      const { id: deleteId } = req.query
      const { error } = await db.auth.admin.deleteUser(deleteId)
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ deleted: deleteId })
    }
    default: return res.status(405).end()
  }
}