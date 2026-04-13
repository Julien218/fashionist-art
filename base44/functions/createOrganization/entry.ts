import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name?.trim()) return Response.json({ error: 'Nom requis' }, { status: 400 });

    const org = await base44.asServiceRole.entities.Organization.create({
      name: name.trim(),
      owner_user_id: user.id,
    });

    return Response.json({ success: true, org });
  } catch (error) {
    console.error('createOrganization error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});