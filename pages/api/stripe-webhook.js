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
import { buffer } from 'micro'
export const config = {api:{bodyParser:false}}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY||'',{apiVersion:'2024-04-10'})
export default async function handler(req,res) {
  if(req.method!=='POST') return res.status(405).end()
  const sig=req.headers['stripe-signature'],body=await buffer(req)
  let event
  try { event=stripe.webhooks.constructEvent(body,sig,process.env.STRIPE_WEBHOOK_SECRET) }
  catch(e) { return res.status(400).json({error:e.message}) }
  const db=getAdmin(); if(!db) return res.status(200).json({received:true})
  const uid=(o)=>o?.metadata?.supabase_uid
  switch(event.type) {
    case 'checkout.session.completed': { const s=event.data.object; if(uid(s)) await db.from('profiles').update({plan:s.metadata?.plan,plan_status:'trialing',stripe_subscription_id:s.subscription}).eq('id',uid(s)); break }
    case 'customer.subscription.updated': { const s=event.data.object; if(uid(s)) await db.from('profiles').update({plan_status:s.status,stripe_subscription_id:s.id}).eq('id',uid(s)); break }
    case 'customer.subscription.deleted': { const s=event.data.object; if(uid(s)) await db.from('profiles').update({plan_status:'cancelled'}).eq('id',uid(s)); break }
    case 'invoice.payment_failed': { const i=event.data.object; const s=i.subscription?await stripe.subscriptions.retrieve(i.subscription):null; if(uid(s)) await db.from('profiles').update({plan_status:'past_due'}).eq('id',uid(s)); break }
  }
  return res.status(200).json({received:true})
}
