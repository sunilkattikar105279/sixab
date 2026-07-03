// lib/auth.js — Auth helpers, role checks, session management
import { supabase, supabaseAdmin } from './supabase'

// ── Get current user + profile on the CLIENT ─────────────────
export async function getCurrentUser() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  return { ...session.user, profile, token: session.access_token }
}

// ── Role checks ───────────────────────────────────────────────
export const isAdmin    = (profile) => profile?.user_role === 'admin'
export const isOperator = (profile) => profile?.user_role === 'operator' || profile?.user_role === 'admin'
export const isCustomer = (profile) => !!profile

// ── Auth header for API calls ─────────────────────────────────
export function authHeader(token) {
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

// ── Sign up ───────────────────────────────────────────────────
export async function signUp({ email, password, fullName, company }) {
  if (!supabase) return { error: 'Supabase not configured' }
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, company } }
  })
  if (error) return { error: error.message }
  return { user: data.user, session: data.session }
}

// ── Sign in ───────────────────────────────────────────────────
export async function signIn({ email, password }) {
  if (!supabase) return { error: 'Supabase not configured' }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return { user: data.user, session: data.session, token: data.session?.access_token }
}

// ── Sign out ──────────────────────────────────────────────────
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
  if (typeof window !== 'undefined') window.location.href = '/login'
}

// ── Protect a page (call in useEffect) ───────────────────────
export async function requireAuth(router, allowedRoles = ['customer','operator','admin']) {
  const user = await getCurrentUser()
  if (!user) { router.replace('/login'); return null }
  if (!allowedRoles.includes(user.profile?.user_role || 'customer')) {
    router.replace('/'); return null
  }
  return user
}

// ── Server-side role check for API routes ─────────────────────
export async function requireRole(req, roles = ['customer','operator','admin']) {
  const { getUserFromRequest } = await import('./supabase')
  const user = await getUserFromRequest(req)
  if (!user) return { error: 'Unauthorized', status: 401 }
  if (!supabaseAdmin) return { user, profile: null }
  const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single()
  if (!roles.includes(profile?.user_role || 'customer')) return { error: 'Forbidden', status: 403 }
  return { user, profile }
}
