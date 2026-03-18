import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { partner_id } = body;

    if (!partner_id) {
      return Response.json({ error: 'partner_id required' }, { status: 400 });
    }

    console.log(`Submitting partner ${partner_id} for approval...`);

    const updated = await base44.asServiceRole.entities.Partner.update(partner_id, {
      status: 'pending_approval',
    });

    console.log(`Partner ${partner_id} submitted for approval`);

    return Response.json({
      success: true,
      partner: updated,
      message: 'Partenaire soumis pour validation',
    });
  } catch (error) {
    console.error('Error in submitPartnerForApproval:', error.message);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});