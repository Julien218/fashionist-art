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

    // Valider signature (async car Deno utilise SubtleCrypto)
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Webhook event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`Checkout completed: ${session.id}`);

      // Initialiser le SDK après validation Stripe
      const base44 = createClientFromRequest(req);

      // Récupérer la balance transaction pour les frais
      const balanceTransaction = await stripe.balanceTransactions.retrieve(
        session.payment_intent
      );

      const stripeFeeAmount = balanceTransaction.fee || 0;

      console.log(`Stripe fee: ${stripeFeeAmount} cents`);

      // TODO: Mettre à jour Sale avec status PAID + stripe_fee_cents
      // Cela nécessite d'avoir un lien entre session.id et Sale.stripe_session_id
      // Pour l'instant, on log seulement

      return Response.json({ received: true });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Error in stripeWebhook:', error.message, error.stack);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});