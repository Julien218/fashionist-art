import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'super_admin') {
      return Response.json({ error: 'Super admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { partner_id, reason } = body;

    if (!partner_id) {
      return Response.json({ error: 'partner_id required' }, { status: 400 });
    }

    console.log(`Rejecting partner ${partner_id}...`);

    const updated = await base44.asServiceRole.entities.Partner.update(partner_id, {
      status: 'rejected',
    });

    console.log(`Partner ${partner_id} rejected`);

    return Response.json({
      success: true,
      partner: updated,
      message: 'Partenaire rejeté',
    });
  } catch (error) {
    console.error('Error in rejectPartner:', error.message);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});