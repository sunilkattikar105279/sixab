export default async function handler(req, res) {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !svc || !anon) return res.status(500).json({ error: 'Supabase env vars not set' })
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const { data: { user } } = await createClient(url, anon).auth.getUser(token)
  if (!user) return res.status(401).json({ error: 'Invalid token' })
  const db = createClient(url, svc, { auth: { autoRefreshToken: false, persistSession: false } })
  const uid = user.id
  if (req.method === 'GET') {
    const { stage, search, limit = 200 } = req.query
    let q = db.from('crm_contacts').select('*').eq('user_id', uid).order('updated_at', { ascending: false }).limit(+limit)
    if (stage) q = q.eq('stage', stage)
    if (search) q = q.or(`name.ilike.%${search}%,company.ilike.%${search}%`)
    const { data, error } = await q
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ contacts: data })
  }
  if (req.method === 'POST') {
    const { data, error } = await db.from('crm_contacts').insert({ ...req.body, user_id: uid }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ contact: data })
  }
  if (req.method === 'PUT') {
    const { id, ...updates } = req.body
    const { data, error } = await db.from('crm_contacts').update(updates).eq('id', id).eq('user_id', uid).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ contact: data })
  }
  if (req.method === 'DELETE') {
    const { id } = req.query
    const { error } = await db.from('crm_contacts').delete().eq('id', id).eq('user_id', uid)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ deleted: id })
  }
  res.status(405).end()
}
