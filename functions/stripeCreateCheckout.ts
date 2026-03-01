import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'super_admin') {
      return Response.json({ error: 'Accès réservé au super admin' }, { status: 403 });
    }

    const { amount, label, description, currency = 'eur', success_url, cancel_url } = await req.json();

    if (!amount || !label) {
      return Response.json({ error: 'amount et label requis' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://your-app.base44.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: label,
            description: description || undefined,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: success_url || `${origin}?payment=success`,
      cancel_url: cancel_url || `${origin}?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        created_by: user.email,
      },
    });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('stripeCreateCheckout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});