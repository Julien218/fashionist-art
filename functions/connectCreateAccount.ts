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

    const { organization_id } = await req.json();
    if (!organization_id) {
      return Response.json({ error: 'Missing organization_id' }, { status: 400 });
    }

    // Charger l'organisation
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: organization_id });
    const org = orgs?.[0];
    if (!org) return Response.json({ error: 'Organization not found' }, { status: 404 });

    // Vérifier ownership
    if (user.role !== 'super_admin' && org.owner_user_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Si déjà un compte, retourner l'existant
    if (org.stripe_connected_account_id) {
      return Response.json({ account_id: org.stripe_connected_account_id });
    }

    // Créer compte Stripe Connect Express
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'BE',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        organization_id,
        owner_user_id: user.id,
      },
    });

    console.log(`Stripe Connect account created: ${account.id} for org ${organization_id}`);

    // Mettre à jour l'organisation
    await base44.asServiceRole.entities.Organization.update(organization_id, {
      stripe_connected_account_id: account.id,
      onboarding_status: 'PENDING',
    });

    return Response.json({ success: true, account_id: account.id });
  } catch (error) {
    console.error('connectCreateAccount error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});