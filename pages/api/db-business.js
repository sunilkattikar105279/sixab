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
    const { data, error } = await db.from('business_profiles').select('*').eq('user_id', uid).maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ business: data })
  }
  if (req.method === 'POST' || req.method === 'PUT') {
    const { data, error } = await db.from('business_profiles').upsert({ ...req.body, user_id: uid, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ business: data })
  }
  res.status(405).end()
}
