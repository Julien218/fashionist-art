import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Accès réservé aux admins' }, { status: 403 });
    }

    const { campaign_id, title, subject, html, text, scheduled_at } = await req.json();
    if (!campaign_id) return Response.json({ error: 'campaign_id requis' }, { status: 400 });

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (subject !== undefined) updates.subject = subject;
    if (html !== undefined) updates.html = html;
    if (text !== undefined) updates.text = text;
    if (scheduled_at !== undefined) updates.scheduled_at = scheduled_at;

    await base44.asServiceRole.entities.NewsletterCampaign.update(campaign_id, updates);
    console.log(`[Newsletter] Campaign ${campaign_id} updated by ${user.email}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('[newsletterUpdate] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});