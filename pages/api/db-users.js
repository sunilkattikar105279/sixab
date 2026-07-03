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
  const { data: me } = await db.from('profiles').select('user_role,org_id').eq('id', uid).single()
  const isAdmin = me?.user_role === 'admin'
  const isOp = me?.user_role === 'operator' || isAdmin
  if (req.method === 'GET') {
    if (isAdmin) {
      const { search, role: r, limit = 200 } = req.query
      let q = db.from('profiles').select('id,email,full_name,company,user_role,plan,plan_status,created_at').order('created_at', { ascending: false }).limit(+limit)
      if (r) q = q.eq('user_role', r)
      if (search) q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
      const { data, error } = await q
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ users: data })
    }
    const { data, error } = await db.from('profiles').select('*').eq('id', uid).single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ users: [data] })
  }
  if (req.method === 'PATCH') {
    const { id: targetId, user_role, ...updates } = req.body
    const updateId = (isAdmin && targetId) ? targetId : uid
    const safe = isAdmin ? { ...updates, ...(user_role && { user_role }) } : updates
    const { data, error } = await db.from('profiles').update(safe).eq('id', updateId).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ profile: data })
  }
  res.status(405).end()
}
