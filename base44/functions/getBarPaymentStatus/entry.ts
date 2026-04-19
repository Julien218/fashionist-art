import Stripe from 'npm:stripe@14.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    const { session_id } = body;

    if (!session_id) {
      return Response.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Vérifier directement via Stripe (source de vérité)
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log(`Stripe session ${session_id} status: ${session.status}, payment_status: ${session.payment_status}`);

    const isPaid = session.payment_status === 'paid' && session.status === 'complete';
    const isCancelled = session.status === 'expired';

    // Si payé, mettre à jour la Sale si pas encore fait
    if (isPaid) {
      const sales = await base44.asServiceRole.entities.Sale.filter({ stripe_session_id: session_id });
      const sale = sales?.[0];
      if (sale && sale.status === 'PENDING') {
        // Récupérer les frais Stripe
        let stripeFee = 0;
        try {
          if (session.payment_intent) {
            const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
            const chargeId = pi.latest_charge;
            if (chargeId) {
              const charge = await stripe.charges.retrieve(chargeId);
              const btId = charge.balance_transaction;
              if (btId) {
                const bt = await stripe.balanceTransactions.retrieve(btId);
                stripeFee = bt.fee || 0;
              }
            }
          }
        } catch (feeErr) {
          console.warn('Failed to get stripe fee:', feeErr.message);
        }

        await base44.asServiceRole.entities.Sale.update(sale.id, {
          status: 'PAID',
          stripe_payment_intent_id: session.payment_intent || null,
          stripe_fee_cents: stripeFee,
          paid_at: new Date().toISOString(),
        });
        console.log(`Sale ${sale.id} updated to PAID via polling`);
      }

      return Response.json({
        status: 'PAID',
        amount_cents: session.amount_total,
        paid_at: new Date().toISOString(),
      });
    }

    if (isCancelled) {
      const sales = await base44.asServiceRole.entities.Sale.filter({ stripe_session_id: session_id });
      const sale = sales?.[0];
      if (sale && sale.status === 'PENDING') {
        await base44.asServiceRole.entities.Sale.update(sale.id, { status: 'CANCELLED' });
      }
      return Response.json({ status: 'CANCELLED' });
    }

    return Response.json({ status: 'PENDING' });
  } catch (error) {
    console.error('getBarPaymentStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});