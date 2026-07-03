import { supabaseAdmin, getUserFromRequest } from '../../lib/supabase'
export default async function handler(req, res) {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const db = supabaseAdmin
  if (!db) return res.status(500).json({ error: 'Database not configured' })
  const uid = user.id
  switch(req.method) {
    case 'GET': {
      const { status, limit = 100 } = req.query
      let q = db.from('leads').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(+limit)
      if (status) q = q.eq('status', status)
      const { data, error } = await q
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ leads: data })
    }
    case 'POST': {
      const payload = Array.isArray(req.body) ? req.body.map(l=>({...l,user_id:uid})) : [{...req.body,user_id:uid}]
      const { data, error } = await db.from('leads').insert(payload).select()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json({ leads: data })
    }
    case 'PUT': {
      const { id, ...updates } = req.body
      const { data, error } = await db.from('leads').update(updates).eq('id', id).eq('user_id', uid).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ lead: data })
    }
    case 'DELETE': {
      const { id } = req.query
      const { error } = await db.from('leads').delete().eq('id', id).eq('user_id', uid)
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ deleted: id })
    }
    default: return res.status(405).end()
  }
}
