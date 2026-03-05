import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST only' }, { status: 405 });
    }

    // Vérifier si on est en iframe
    const origin = req.headers.get('origin');
    const isIframe = origin && !origin.includes('fashionistart.be');
    
    if (isIframe) {
      return Response.json({
        error: 'Checkout works only from published app',
        message: 'Pour procéder au paiement, veuillez accéder au site directement',
      }, { status: 400 });
    }

    const body = await req.json();
    const { title, amount_cents, sale_type, seller_user_id, metadata = {} } = body;

    if (!title || !amount_cents || !sale_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`Creating checkout: ${title} ${amount_cents} cents, type=${sale_type}`);

    // Récupérer la règle de commission plateforme
    const response = await fetch(`${Deno.env.get('BASE44_API_URL') || 'http://localhost:3000'}/api/entities/PlatformFeeRule/filter?sale_type=${sale_type}&active=true`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_TOKEN') || ''}`,
      },
    });

    let platformFeeCents = 0;
    if (response.ok) {
      const rules = await response.json();
      if (rules && rules.length > 0) {
        const rule = rules[0];
        if (rule.mode === 'percent') {
          platformFeeCents = Math.round(amount_cents * (rule.value / 100));
        } else if (rule.mode === 'fixed') {
          platformFeeCents = rule.value;
        }
      }
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
      success_url: `${Deno.env.get('APP_URL') || 'https://fashionistart.be'}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL') || 'https://fashionistart.be'}?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        sale_type,
        seller_user_id: seller_user_id || 'none',
        ...metadata,
      },
    });

    console.log(`Stripe session created: ${session.id}`);

    // TODO: Créer record Sale en PENDING
    // Pour cela il faudrait avoir accès au SDK Base44
    // Pour l'instant on retourne juste la session

    return Response.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      platform_fee_cents: platformFeeCents,
    });
  } catch (error) {
    console.error('Error in stripeCreateCheckout:', error.message, error.stack);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});