// pages/api/db/users.js — User + profile management (admin/operator/customer)
import { supabaseAdmin } from '../../../lib/supabase'
import { requireRole } from '../../../lib/auth'

export default async function handler(req, res) {
  const { user, profile, error, status } = await requireRole(req, ['admin','operator','customer'])
  if (error) return res.status(status).json({ error })

  const db = supabaseAdmin
  const isAdmin    = profile?.user_role === 'admin'
  const isOperator = profile?.user_role === 'operator' || isAdmin
  const uid = user.id

  switch(req.method) {
    // GET /api/db/users — admin: all users; operator: their org; customer: just themselves
    case 'GET': {
      if (isAdmin) {
        const { search, role: roleFilter, limit = 100 } = req.query
        let q = db.from('profiles').select('id,email,full_name,company,user_role,plan,plan_status,org_id,created_at,last_seen_at,onboarded').order('created_at', { ascending: false }).limit(+limit)
        if (roleFilter) q = q.eq('user_role', roleFilter)
        if (search) q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,company.ilike.%${search}%`)
        const { data, error: e } = await q
        if (e) return res.status(500).json({ error: e.message })
        return res.status(200).json({ users: data })
      }
      if (isOperator && profile?.org_id) {
        const { data, error: e } = await db.from('profiles').select('id,email,full_name,company,user_role,plan,plan_status,created_at').eq('org_id', profile.org_id)
        if (e) return res.status(500).json({ error: e.message })
        return res.status(200).json({ users: data })
      }
      // Customer: just their own profile
      const { data, error: e } = await db.from('profiles').select('*').eq('id', uid).single()
      if (e) return res.status(500).json({ error: e.message })
      return res.status(200).json({ users: [data] })
    }

    // GET /api/db/users/me — current user's full profile + business profile
    // PATCH — update own profile (or admin can update any)
    case 'PATCH': {
      const { id: targetId, user_role, ...updates } = req.body
      const updateId = (isAdmin && targetId) ? targetId : uid
      // Only admin can change roles
      const safeUpdates = isAdmin ? { ...updates, ...(user_role && { user_role }) } : updates
      const { data, error: e } = await db.from('profiles').update(safeUpdates).eq('id', updateId).select().single()
      if (e) return res.status(500).json({ error: e.message })
      return res.status(200).json({ profile: data })
    }

    // POST — admin invites a new user
    case 'POST': {
      if (!isOperator) return res.status(403).json({ error: 'Operator or Admin required' })
      const { email, role: inviteRole = 'customer', org_id } = req.body
      const { data, error: e } = await db.from('user_invites').insert({
        email, role: inviteRole,
        org_id: org_id || profile?.org_id || null,
        invited_by: uid,
      }).select().single()
      if (e) return res.status(500).json({ error: e.message })
      // TODO: send invite email via Resend
      return res.status(201).json({ invite: data })
    }

    // DELETE — admin only: deactivate user
    case 'DELETE': {
      if (!isAdmin) return res.status(403).json({ error: 'Admin only' })
      const { id: deleteId } = req.query
      const { error: e } = await db.auth.admin.deleteUser(deleteId)
      if (e) return res.status(500).json({ error: e.message })
      return res.status(200).json({ deleted: deleteId })
    }

    default: return res.status(405).end()
  }
}
