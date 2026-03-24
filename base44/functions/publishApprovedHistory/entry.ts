import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return Response.json({ error: 'POST only' }, { status: 405 });

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { draft_id, force } = await req.json();
    if (!draft_id) return Response.json({ error: 'Missing draft_id' }, { status: 400 });

    const drafts = await base44.asServiceRole.entities.HistoryDraft.filter({ id: draft_id });
    const draft = drafts?.[0];
    if (!draft) return Response.json({ error: 'Draft not found' }, { status: 404 });

    if (!force && draft.status !== 'APPROVED') {
      return Response.json({ error: 'Draft must be APPROVED to publish. Use force=true to override.' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Upsert HistoryPage (récupérer l'existant ou créer)
    const existing = await base44.asServiceRole.entities.HistoryPage.list('-last_updated_at', 1);
    const pageData = {
      title: draft.title,
      content_html: draft.content_html,
      content_text: draft.content_text || null,
      last_updated_at: now,
      approved_by_name: draft.organizer_name || null,
      approved_at: draft.approved_at || now,
    };

    if (existing?.length > 0) {
      await base44.asServiceRole.entities.HistoryPage.update(existing[0].id, pageData);
    } else {
      await base44.asServiceRole.entities.HistoryPage.create(pageData);
    }

    await base44.asServiceRole.entities.HistoryDraft.update(draft_id, {
      status: 'PUBLISHED',
      published_at: now,
      updated_by_user_id: user.id,
      updated_at: now,
    });

    console.log(`History draft ${draft_id} published by ${user.email}${force ? ' (FORCED)' : ''}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('publishApprovedHistory error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});