import Stripe from 'npm:stripe@14.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Calcule la commission plateforme selon les règles PlatformFeeRule
async function calcPlatformFee(base44, amountCents, saleType) {
  try {
    const rules = await base44.asServiceRole.entities.PlatformFeeRule.filter({ sale_type: saleType, active: true });
    const rule = rules?.[0];
    if (!rule) return 0;
    if (rule.mode === 'percent') {
      return Math.round(amountCents * rule.value / 100);
    } else if (rule.mode === 'fixed') {
      return Math.round(rule.value); // en centimes
    }
    return 0;
  } catch (err) {
    console.warn('calcPlatformFee error:', err.message);
    return 0;
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST only' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { amount_cents, note, app_url } = body;

    if (!amount_cents || amount_cents <= 0 || amount_cents > 200000) {
      return Response.json({ error: 'Montant invalide (max 2000€)' }, { status: 400 });
    }

    const baseUrl = app_url || 'https://fashionistart.be';
    const title = `Bar Fashionist'ART${note ? ` — ${note}` : ''}`;

    // Calculer commission plateforme (cachée à l'admin)
    const platformFeeCents = await calcPlatformFee(base44, amount_cents, 'bar');

    console.log(`Bar checkout: ${amount_cents} cents, commission=${platformFeeCents} cents, user=${user.email}`);

    // Créer Checkout Session Stripe sur le compte principal
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: title },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        sale_type: 'bar',
        created_by_user_id: user.id,
        platform_fee_cents: String(platformFeeCents),
      },
    });

    console.log(`Stripe session created: ${session.id}`);

    // Créer Sale en PENDING avec commission stockée
    const sale = await base44.asServiceRole.entities.Sale.create({
      sale_type: 'bar',
      title,
      amount_total_cents: amount_cents,
      currency: 'eur',
      status: 'PENDING',
      stripe_session_id: session.id,
      platform_fee_cents: platformFeeCents,
      stripe_fee_cents: 0,
      created_by_user_id: user.id,
      note: note || null,
      created_at: new Date().toISOString(),
    });

    console.log(`Sale created: ${sale.id}, platform_fee=${platformFeeCents}`);

    return Response.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      sale_id: sale.id,
    });
  } catch (error) {
    console.error('stripeCreateBarCheckout error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});