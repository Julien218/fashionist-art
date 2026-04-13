import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100,
    });

    const items = prices.data
      .filter(p => p.product && !p.product.deleted && p.product.active)
      .map(p => ({
        price_id: p.id,
        product_id: p.product.id,
        name: p.product.name,
        description: p.product.description || '',
        image: p.product.images?.[0] || null,
        amount: p.unit_amount,
        currency: p.currency,
        type: p.type,
        recurring: p.recurring || null,
        metadata: p.product.metadata || {},
      }));

    return Response.json({ items });
  } catch (error) {
    console.error('stripeGetProducts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});