export default async function handler(req, res) {

const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function sbGet(table, uid, extra = '') {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?user_id=eq.${uid}&order=created_at.desc${extra}`, {
    headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`, 'Content-Type': 'application/json' }
  })
  return r.json()
}
async function sbPost(table, body) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(body)
  })
  const d = await r.json()
  return Array.isArray(d) ? d[0] : d
}
async function sbPatch(table, id, uid, body) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}&user_id=eq.${uid}`, {
    method: 'PATCH',
    headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(body)
  })
  const d = await r.json()
  return Array.isArray(d) ? d[0] : d
}
async function sbDelete(table, id, uid) {
  await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}&user_id=eq.${uid}`, {
    method: 'DELETE',
    headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}` }
  })
}
async function sbUpsert(table, body) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(body)
  })
  const d = await r.json()
  return Array.isArray(d) ? d[0] : d
}
async function getUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || !SB_URL || !SB_ANON) return null
  const r = await fetch(`${SB_URL}/auth/v1/user`, {
    headers: { apikey: SB_ANON, Authorization: `Bearer ${token}` }
  })
  if (!r.ok) return null
  return r.json()
}
function noDb(res) { return res.status(500).json({ error: 'NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set in Vercel env vars' }) }
  if (!SB_URL || !SB_SVC) return noDb(res)
  const user = await getUser(req)
  if (!user?.id) return res.status(401).json({ error: 'Unauthorized' })
  const uid = user.id
  if (req.method === 'GET') {
    const { status, limit = 100 } = req.query
    let qs = `user_id=eq.${uid}&order=created_at.desc&limit=${limit}`
    if (status) qs += `&status=eq.${status}`
    const r = await fetch(`${SB_URL}/rest/v1/leads?${qs}`, { headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}` } })
    const leads = await r.json()
    return res.status(200).json({ leads: Array.isArray(leads) ? leads : [] })
  }
  if (req.method === 'POST') {
    const payload = Array.isArray(req.body) ? req.body.map(l => ({ ...l, user_id: uid })) : [{ ...req.body, user_id: uid }]
    const r = await fetch(`${SB_URL}/rest/v1/leads`, { method: 'POST', headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payload) })
    const data = await r.json()
    return res.status(201).json({ leads: Array.isArray(data) ? data : [data] })
  }
  if (req.method === 'PUT') {
    const { id, ...updates } = req.body
    const data = await sbPatch('leads', id, uid, updates)
    return res.status(200).json({ lead: data })
  }
  if (req.method === 'DELETE') {
    await sbDelete('leads', req.query.id, uid)
    return res.status(200).json({ deleted: req.query.id })
  }
  res.status(405).end()
}