// pages/api/db/business.js — Business profile (strategy context for agents)
import { supabaseAdmin, getUserFromRequest } from '../../../lib/supabase'

export default async function handler(req, res) {
  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const db = supabaseAdmin
  if (!db) return res.status(500).json({ error: 'Database not configured' })
  const uid = user.id

  switch(req.method) {
    case 'GET': {
      const { data, error } = await db.from('business_profiles').select('*').eq('user_id', uid).maybeSingle()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ business: data })
    }
    case 'POST':
    case 'PUT': {
      const { data, error } = await db.from('business_profiles')
        .upsert({ ...req.body, user_id: uid, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        .select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ business: data })
    }
    default: return res.status(405).end()
  }
}
