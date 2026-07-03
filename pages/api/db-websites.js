import { supabaseAdmin, getUserFromRequest } from '../../../lib/supabase'
export default async function handler(req, res) {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const db = supabaseAdmin
  if (!db) return res.status(500).json({ error: 'Database not configured' })
  const uid = user.id
  switch(req.method) {
    case 'GET': {
      const { data, error } = await db.from('websites').select('id,client_name,industry,template,vercel_url,status,created_at,updated_at').eq('user_id', uid).order('updated_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ websites: data })
    }
    case 'POST': {
      const { data, error } = await db.from('websites').insert({ ...req.body, user_id: uid }).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json({ website: data })
    }
    case 'PUT': {
      const { id, ...updates } = req.body
      const { data, error } = await db.from('websites').update(updates).eq('id', id).eq('user_id', uid).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ website: data })
    }
    case 'DELETE': {
      const { id } = req.query
      const { error } = await db.from('websites').delete().eq('id', id).eq('user_id', uid)
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ deleted: id })
    }
    default: return res.status(405).end()
  }
}
