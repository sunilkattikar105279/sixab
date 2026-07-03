import { supabaseAdmin, getUserFromRequest } from '../../lib/supabase'
export default async function handler(req, res) {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const db = supabaseAdmin
  if (!db) return res.status(500).json({ error: 'Database not configured — add SUPABASE env vars to Vercel' })
  const uid = user.id
  switch(req.method) {
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
