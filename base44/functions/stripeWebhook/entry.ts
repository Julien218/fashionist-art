import Stripe from 'npm:stripe@14.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST only' }, { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event;
    if (webhookSecret && signature) {
      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return Response.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Pas de secret configuré : parser sans vérification (à sécuriser en prod)
      console.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
      try {
        event = JSON.parse(body);
      } catch (err) {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    }

    console.log(`Webhook event: ${event.type}`);

    const base44 = createClientFromRequest(req);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const sessionId = session.id;
      const paymentIntentId = session.payment_intent;

      console.log(`Checkout completed: ${sessionId}, PI: ${paymentIntentId}`);

      const sales = await base44.asServiceRole.entities.Sale.filter({ stripe_session_id: sessionId });
      const sale = sales?.[0];

      if (!sale) {
        console.warn(`No Sale found for session_id: ${sessionId}`);
        return Response.json({ received: true });
      }

      console.log(`Found Sale: ${sale.id}`);

      // Récupérer les frais Stripe exacts via BalanceTransaction
      let stripeFee = 0;
      try {
        if (paymentIntentId) {
          const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
          const chargeId = pi.latest_charge;
          if (chargeId) {
            const charge = await stripe.charges.retrieve(chargeId);
            const btId = charge.balance_transaction;
            if (btId) {
              const bt = await stripe.balanceTransactions.retrieve(btId);
              stripeFee = bt.fee || 0;
              console.log(`Stripe fee from balance transaction: ${stripeFee} cents`);
            }
          }
        }
      } catch (feeErr) {
        console.warn('Failed to retrieve Stripe fee:', feeErr.message);
      }

      await base44.asServiceRole.entities.Sale.update(sale.id, {
        status: 'PAID',
        stripe_payment_intent_id: paymentIntentId || null,
        stripe_fee_cents: stripeFee,
        paid_at: new Date().toISOString(),
      });

      console.log(`Sale ${sale.id} updated to PAID, stripe_fee=${stripeFee}`);
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const sessionId = session.id;
      console.log(`Checkout expired: ${sessionId}`);
      const sales = await base44.asServiceRole.entities.Sale.filter({ stripe_session_id: sessionId });
      const sale = sales?.[0];
      if (sale && sale.status === 'PENDING') {
        await base44.asServiceRole.entities.Sale.update(sale.id, { status: 'CANCELLED' });
        console.log(`Sale ${sale.id} updated to CANCELLED`);
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      console.log(`Payment failed for PI: ${pi.id}`);
      // Chercher par payment_intent_id si déjà enregistré
      const sales = await base44.asServiceRole.entities.Sale.filter({ stripe_payment_intent_id: pi.id });
      const sale = sales?.[0];
      if (sale && sale.status === 'PENDING') {
        await base44.asServiceRole.entities.Sale.update(sale.id, { status: 'FAILED' });
        console.log(`Sale ${sale.id} updated to FAILED`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('stripeWebhook error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});