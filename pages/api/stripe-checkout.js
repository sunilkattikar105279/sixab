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
const PRICES = { starter:process.env.STRIPE_PRICE_STARTER, pro:process.env.STRIPE_PRICE_PRO, agency:process.env.STRIPE_PRICE_AGENCY }
export default async function handler(req,res) {
  if(req.method!=='POST') return res.status(405).end()
  const user = await getUser(req)
  if(!user) return res.status(401).json({error:'Login required'})
  const {plan} = req.body
  const priceId = PRICES[plan]
  if(!priceId) return res.status(400).json({error:`Set STRIPE_PRICE_${(plan||'').toUpperCase()} in Vercel env vars`})
  const BASE = process.env.NEXT_PUBLIC_APP_URL||'https://www.startupsinabox.com'
  let customerId = null
  if(getAdmin()) {
    const {data:profile} = await getAdmin().from('profiles').select('stripe_customer_id').eq('id',user.id).single()
    customerId = profile?.stripe_customer_id
    if(!customerId) {
      const c = await stripe.customers.create({email:user.email,metadata:{supabase_uid:user.id}})
      customerId = c.id
      await getAdmin().from('profiles').update({stripe_customer_id:customerId}).eq('id',user.id)
    }
  }
  try {
    const session = await stripe.checkout.sessions.create({
      customer:customerId||undefined, customer_email:customerId?undefined:user.email,
      mode:'subscription', payment_method_types:['card'],
      line_items:[{price:priceId,quantity:1}],
      subscription_data:{trial_period_days:14,metadata:{supabase_uid:user.id,plan}},
      success_url:`${BASE}/billing?success=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${BASE}/billing?cancelled=true`,
      allow_promotion_codes:true,
    })
    return res.status(200).json({url:session.url})
  } catch(e) { return res.status(500).json({error:e.message}) }
}
