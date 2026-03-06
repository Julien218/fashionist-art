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

    const { organization_id, return_url, refresh_url } = await req.json();
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
      return Response.json({ error: 'No Stripe account. Create one first.' }, { status: 400 });
    }

    const accountLink = await stripe.accountLinks.create({
      account: org.stripe_connected_account_id,
      refresh_url: refresh_url || 'https://fashionistart.be/admin?tab=stripe&refresh=1',
      return_url: return_url || 'https://fashionistart.be/admin?tab=stripe&onboarding=complete',
      type: 'account_onboarding',
    });

    console.log(`Onboarding link created for ${org.stripe_connected_account_id}`);

    await base44.asServiceRole.entities.Organization.update(organization_id, {
      onboarding_status: 'PENDING',
    });

    return Response.json({ success: true, onboarding_url: accountLink.url });
  } catch (error) {
    console.error('connectCreateOnboardingLink error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});