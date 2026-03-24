import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return Response.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const sales = await base44.asServiceRole.entities.Sale.filter({ stripe_session_id: session_id });
    const sale = sales?.[0];

    if (!sale) {
      return Response.json({ status: 'NOT_FOUND' });
    }

    return Response.json({
      status: sale.status,
      amount_cents: sale.amount_total_cents,
      paid_at: sale.paid_at,
      stripe_fee_cents: sale.stripe_fee_cents || 0,
      note: sale.note,
    });
  } catch (error) {
    console.error('getBarPaymentStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});