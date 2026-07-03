import Stripe from 'stripe'
import { supabaseAdmin } from '../../../lib/supabase'
import { buffer } from 'micro'
export const config = {api:{bodyParser:false}}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY||'',{apiVersion:'2024-04-10'})
export default async function handler(req,res) {
  if(req.method!=='POST') return res.status(405).end()
  const sig=req.headers['stripe-signature'],body=await buffer(req)
  let event
  try { event=stripe.webhooks.constructEvent(body,sig,process.env.STRIPE_WEBHOOK_SECRET) }
  catch(e) { return res.status(400).json({error:e.message}) }
  const db=supabaseAdmin; if(!db) return res.status(200).json({received:true})
  const uid=(o)=>o?.metadata?.supabase_uid
  switch(event.type) {
    case 'checkout.session.completed': { const s=event.data.object; if(uid(s)) await db.from('profiles').update({plan:s.metadata?.plan,plan_status:'trialing',stripe_subscription_id:s.subscription}).eq('id',uid(s)); break }
    case 'customer.subscription.updated': { const s=event.data.object; if(uid(s)) await db.from('profiles').update({plan_status:s.status,stripe_subscription_id:s.id}).eq('id',uid(s)); break }
    case 'customer.subscription.deleted': { const s=event.data.object; if(uid(s)) await db.from('profiles').update({plan_status:'cancelled'}).eq('id',uid(s)); break }
    case 'invoice.payment_failed': { const i=event.data.object; const s=i.subscription?await stripe.subscriptions.retrieve(i.subscription):null; if(uid(s)) await db.from('profiles').update({plan_status:'past_due'}).eq('id',uid(s)); break }
  }
  return res.status(200).json({received:true})
}
