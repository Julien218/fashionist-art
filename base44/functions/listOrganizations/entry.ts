import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const all = await base44.asServiceRole.entities.Organization.list('-created_date', 50);

    // super_admin voit tout, admin voit seulement les siennes
    const orgs = user.role === 'super_admin'
      ? all
      : all.filter((o) => o.owner_user_id === user.id);

    return Response.json({ orgs });
  } catch (error) {
    console.error('listOrganizations error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});