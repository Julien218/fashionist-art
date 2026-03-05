import Stripe from 'npm:stripe@14.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST only' }, { status: 405 });
    }

    const body = await req.json();
    const { title, amount_cents, sale_type, seller_user_id, metadata = {} } = body;

    if (!title || !amount_cents || !sale_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`Creating checkout: ${title} ${amount_cents} cents, type=${sale_type}`);

    // Initialiser SDK
    const base44 = createClientFromRequest(req);

    // Récupérer les règles de commission plateforme
    let platformFeeCents = 0;
    try {
      const rules = await base44.asServiceRole.entities.PlatformFeeRule.filter(
        { sale_type, active: true },
        '-created_date',
        1
      );
      
      if (rules && rules.length > 0) {
        const rule = rules[0];
        if (rule.mode === 'percent') {
          platformFeeCents = Math.round(amount_cents * (rule.value / 100));
        } else if (rule.mode === 'fixed') {
          platformFeeCents = Math.round(rule.value * 100); // Convertir € en centimes
        }
      }
    } catch (err) {
      console.warn('Failed to fetch platform fee rule:', err.message);
    }

    console.log(`Platform fee calculated: ${platformFeeCents} cents`);

    // Créer session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: title,
            },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://fashionistart.be?payment=success&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://fashionistart.be?payment=cancelled',
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        sale_type,
        seller_user_id: seller_user_id || 'none',
        ...metadata,
      },
    });

    console.log(`Stripe session created: ${session.id}`);

    // Créer Sale record en PENDING
    const sale = await base44.asServiceRole.entities.Sale.create({
      sale_type,
      title,
      amount_total_cents: amount_cents,
      currency: 'eur',
      status: 'PENDING',
      stripe_session_id: session.id,
      platform_fee_cents: platformFeeCents,
      seller_user_id: seller_user_id || null,
    });

    console.log(`Sale created: ${sale.id}`);

    return Response.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      platform_fee_cents: platformFeeCents,
      sale_id: sale.id,
    });
  } catch (error) {
    console.error('Error in stripeCreateCheckout:', error.message, error.stack);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});