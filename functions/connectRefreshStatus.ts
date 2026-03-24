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

    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: organization_id });
    const org = orgs?.[0];
    if (!org) return Response.json({ error: 'Organization not found' }, { status: 404 });

    if (user.role !== 'super_admin' && org.owner_user_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!org.stripe_connected_account_id) {
      return Response.json({ error: 'No Stripe account' }, { status: 400 });
    }

    const account = await stripe.accounts.retrieve(org.stripe_connected_account_id);
    console.log(`Stripe account status: charges=${account.charges_enabled}, payouts=${account.payouts_enabled}`);

    let onboarding_status = 'PENDING';
    if (account.charges_enabled && account.payouts_enabled) {
      onboarding_status = 'COMPLETE';
    } else if (account.requirements?.disabled_reason) {
      onboarding_status = 'RESTRICTED';
    }

    await base44.asServiceRole.entities.Organization.update(organization_id, {
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      onboarding_status,
    });

    return Response.json({
      success: true,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      onboarding_status,
    });
  } catch (error) {
    console.error('connectRefreshStatus error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});