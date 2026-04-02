import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const PRICE_ID = 'price_1THnFuCuAdKyChzdXc0O6FUz';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { first_name, last_name, email, phone, quantity, success_url, cancel_url } = await req.json();

    if (!first_name || !last_name || !email || !quantity) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const qty = parseInt(quantity) || 1;

    // Créer la réservation en statut PENDING
    const reservation = await base44.asServiceRole.entities.MissMisterReservation.create({
      first_name,
      last_name,
      email,
      phone: phone || '',
      quantity: qty,
      amount_cents: qty * 1500,
      status: 'PENDING',
    });

    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: PRICE_ID,
        quantity: qty,
      }],
      mode: 'payment',
      customer_email: email,
      success_url: success_url || `${req.headers.get('origin') || ''}/MissMister?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get('origin') || ''}/MissMister?cancelled=1`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        reservation_id: reservation.id,
        first_name,
        last_name,
        email,
        quantity: String(qty),
      },
    });

    // Sauvegarder le session ID
    await base44.asServiceRole.entities.MissMisterReservation.update(reservation.id, {
      stripe_session_id: session.id,
    });

    return Response.json({ url: session.url, reservation_id: reservation.id });
  } catch (error) {
    console.error('missMisterCheckout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});