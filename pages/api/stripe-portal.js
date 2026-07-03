import Stripe from 'stripe'

let _admin = null
function getAdmin() {
  if (_admin) return _admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const { createClient } = require('@supabase/supabase-js')
  _admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  return _admin
}
async function getUser(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null
  const { createClient } = require('@supabase/supabase-js')
  const { data: { user } } = await createClient(url, key).auth.getUser(token)
  return user
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY||'',{apiVersion:'2024-04-10'})
export default async function handler(req,res) {
  if(req.method!=='POST') return res.status(405).end()
  const user=await getUser(req)
  if(!user) return res.status(401).json({error:'Login required'})
  const {data:profile}=await getAdmin().from('profiles').select('stripe_customer_id').eq('id',user.id).single()
  if(!profile?.stripe_customer_id) return res.status(400).json({error:'No subscription found'})
  const BASE=process.env.NEXT_PUBLIC_APP_URL||'https://www.startupsinabox.com'
  const s=await stripe.billingPortal.sessions.create({customer:profile.stripe_customer_id,return_url:`${BASE}/billing`})
  return res.status(200).json({url:s.url})
}
