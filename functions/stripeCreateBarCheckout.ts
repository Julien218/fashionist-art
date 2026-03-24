import Stripe from 'npm:stripe@14.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

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
    const { organization_id, amount_cents, note, app_url } = body;

    if (!organization_id || !amount_cents) {
      return Response.json({ error: 'Missing organization_id or amount_cents' }, { status: 400 });
    }

    if (amount_cents <= 0 || amount_cents > 200000) {
      return Response.json({ error: 'Montant invalide (max 2000€)' }, { status: 400 });
    }

    // Charger l'organisation
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: organization_id });
    const org = orgs?.[0];
    if (!org) return Response.json({ error: 'Organization not found' }, { status: 404 });

    if (!org.stripe_connected_account_id) {
      return Response.json({ error: 'Compte Stripe non configuré. Veuillez terminer l\'onboarding.' }, { status: 400 });
    }

    if (!org.charges_enabled) {
      return Response.json({ error: 'Le compte Stripe n\'est pas encore activé pour les paiements.' }, { status: 400 });
    }

    // Calculer commission plateforme (10% par défaut)
    let platformFeeCents = Math.round(amount_cents * 0.10);
    try {
      const rules = await base44.asServiceRole.entities.PlatformFeeRule.filter({ sale_type: 'bar', active: true });
      if (rules?.length > 0) {
        const rule = rules[0];
        if (rule.mode === 'percent') {
          platformFeeCents = Math.round(amount_cents * (rule.value / 100));
        } else if (rule.mode === 'fixed') {
          platformFeeCents = rule.value;
        }
      }
    } catch (err) {
      console.warn('PlatformFeeRule fetch failed, using default 10%:', err.message);
    }

    console.log(`Bar checkout: ${amount_cents} cents, fee=${platformFeeCents} cents, connected=${org.stripe_connected_account_id}`);

    const baseUrl = app_url || 'https://fashionistart.be';
    const title = `Bar Fashionist'ART${note ? ` — ${note}` : ''}`;

    // Créer Checkout Session Stripe avec application_fee + transfer_data
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
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: org.stripe_connected_account_id,
        },
      },
      success_url: `${baseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        sale_type: 'bar',
        organization_id,
        created_by_user_id: user.id,
      },
    });

    console.log(`Stripe session created: ${session.id}`);

    // Créer Sale en PENDING
    const sale = await base44.asServiceRole.entities.Sale.create({
      sale_type: 'bar',
      title,
      amount_total_cents: amount_cents,
      currency: 'eur',
      status: 'PENDING',
      stripe_session_id: session.id,
      stripe_connected_account_id: org.stripe_connected_account_id,
      platform_fee_cents: platformFeeCents,
      stripe_fee_cents: 0,
      created_by_user_id: user.id,
      note: note || null,
      created_at: new Date().toISOString(),
    });

    console.log(`Sale created: ${sale.id}`);

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