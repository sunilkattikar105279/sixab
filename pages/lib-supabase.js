import { createClient } from '@supabase/supabase-js'
const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabase      = URL && ANON ? createClient(URL, ANON) : null
export const supabaseAdmin = URL && SVC  ? createClient(URL, SVC, { auth:{ autoRefreshToken:false, persistSession:false }}) : null
export async function getUserFromRequest(req) {
  if (!supabaseAdmin) return null
  const token = req.headers.authorization?.replace('Bearer ','')
  if (!token) return null
  const { data:{ user } } = await supabaseAdmin.auth.getUser(token)
  return user
}
