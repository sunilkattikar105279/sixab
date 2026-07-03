// pages/api/db-contacts.js — CRM contacts CRUD

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
  switch (req.method) {
    case 'GET': {
      const { stage, search, limit = 200 } = req.query
      let q = db.from('crm_contacts').select('*').eq('user_id', uid).order('updated_at', { ascending: false }).limit(+limit)
      if (stage)  q = q.eq('stage', stage)
      if (search) q = q.or(`name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`)
      const { data, error } = await q
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ contacts: data })
    }
    case 'POST': {
      const { data, error } = await db.from('crm_contacts').insert({ ...req.body, user_id: uid }).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json({ contact: data })
    }
    case 'PUT': {
      const { id, ...updates } = req.body
      const { data, error } = await db.from('crm_contacts').update(updates).eq('id', id).eq('user_id', uid).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ contact: data })
    }
    case 'DELETE': {
      const { id } = req.query
      const { error } = await db.from('crm_contacts').delete().eq('id', id).eq('user_id', uid)
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ deleted: id })
    }
    default: return res.status(405).end()
  }
}