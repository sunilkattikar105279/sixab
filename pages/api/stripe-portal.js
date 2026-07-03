import Stripe from 'stripe'
import { supabaseAdmin, getUserFromRequest } from '../../../lib/supabase'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY||'',{apiVersion:'2024-04-10'})
export default async function handler(req,res) {
  if(req.method!=='POST') return res.status(405).end()
  const user=await getUserFromRequest(req)
  if(!user) return res.status(401).json({error:'Login required'})
  const {data:profile}=await supabaseAdmin.from('profiles').select('stripe_customer_id').eq('id',user.id).single()
  if(!profile?.stripe_customer_id) return res.status(400).json({error:'No subscription found'})
  const BASE=process.env.NEXT_PUBLIC_APP_URL||'https://www.startupsinabox.com'
  const s=await stripe.billingPortal.sessions.create({customer:profile.stripe_customer_id,return_url:`${BASE}/billing`})
  return res.status(200).json({url:s.url})
}
