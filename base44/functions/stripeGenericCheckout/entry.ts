import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const { price_id, quantity = 1, success_url, cancel_url, customer_email } = await req.json();

    if (!price_id) return Response.json({ error: 'price_id requis' }, { status: 400 });

    const params = {
      mode: 'payment',
      line_items: [{ price: price_id, quantity }],
      success_url: success_url || `${req.headers.get('origin') || 'https://fashionistart.be'}/Billetterie?success=true`,
      cancel_url: cancel_url || `${req.headers.get('origin') || 'https://fashionistart.be'}/Billetterie?cancelled=true`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
      },
    };

    if (customer_email) params.customer_email = customer_email;

    // Detect subscription mode
    const price = await stripe.prices.retrieve(price_id);
    if (price.type === 'recurring') params.mode = 'subscription';

    const session = await stripe.checkout.sessions.create(params);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('stripeGenericCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});