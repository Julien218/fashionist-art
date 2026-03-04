import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Actions: submit, approve, send
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Accès réservé aux admins' }, { status: 403 });
    }

    const { action, campaign_id } = await req.json();

    if (!campaign_id) return Response.json({ error: 'campaign_id requis' }, { status: 400 });

    // --- SUBMIT FOR APPROVAL ---
    if (action === 'submit') {
      await base44.asServiceRole.entities.NewsletterCampaign.update(campaign_id, { status: 'PENDING_APPROVAL' });
      console.log(`[Newsletter] Campaign ${campaign_id} submitted by ${user.email}`);
      return Response.json({ success: true, status: 'PENDING_APPROVAL' });
    }

    // --- APPROVE ---
    if (action === 'approve') {
      if (user.role !== 'super_admin') {
        return Response.json({ error: 'Seul un super_admin peut approuver' }, { status: 403 });
      }
      await base44.asServiceRole.entities.NewsletterCampaign.update(campaign_id, {
        status: 'APPROVED',
        approved_by_user_id: user.id,
        approved_at: new Date().toISOString(),
      });
      console.log(`[Newsletter] Campaign ${campaign_id} approved by ${user.email}`);
      return Response.json({ success: true, status: 'APPROVED' });
    }

    // --- SEND ---
    if (action === 'send') {
      if (user.role !== 'super_admin') {
        return Response.json({ error: 'Seul un super_admin peut envoyer' }, { status: 403 });
      }

      const allCampaigns = await base44.asServiceRole.entities.NewsletterCampaign.list();
      const campaign = allCampaigns.find(c => c.id === campaign_id);
      if (!campaign) return Response.json({ error: 'Campagne introuvable' }, { status: 404 });
      if (campaign.status !== 'APPROVED') {
        return Response.json({ error: 'La campagne doit être approuvée avant envoi' }, { status: 400 });
      }

      const allSubscribers = await base44.asServiceRole.entities.NewsletterSubscriber.list();
      const subscribers = allSubscribers.filter(s => !s.unsubscribed);
      console.log(`[Newsletter] Sending campaign ${campaign_id} to ${subscribers.length} subscribers`);

      let sent = 0, failed = 0, skipped = 0;

      for (const sub of subscribers) {
        const appUrl = 'https://fashionistart.base44.app';
        const unsubUrl = `${appUrl}/unsubscribe?token=${sub.unsubscribe_token}&email=${encodeURIComponent(sub.email)}`;
        const personalizedHtml = (campaign.html || '').replace('{{UNSUBSCRIBE_URL}}', unsubUrl);
        const personalizedText = (campaign.text || '') + `\n\nSe désinscrire: ${unsubUrl}`;

        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: sub.email,
            subject: campaign.subject,
            body: personalizedHtml,
          });
          await base44.asServiceRole.entities.NewsletterSendLog.create({
            campaign_id,
            email: sub.email,
            status: 'SENT',
            sent_at: new Date().toISOString(),
          });
          sent++;
        } catch (err) {
          console.error(`[Newsletter] Failed to send to ${sub.email}:`, err.message);
          await base44.asServiceRole.entities.NewsletterSendLog.create({
            campaign_id,
            email: sub.email,
            status: 'FAILED',
            error: err.message,
            sent_at: new Date().toISOString(),
          });
          failed++;
        }
      }

      await base44.asServiceRole.entities.NewsletterCampaign.update(campaign_id, {
        status: 'SENT',
        sent_at: new Date().toISOString(),
      });

      console.log(`[Newsletter] Campaign ${campaign_id} done. Sent: ${sent}, Failed: ${failed}, Skipped: ${skipped}`);
      return Response.json({ success: true, sent, failed, skipped });
    }

    // --- UPDATE campaign content ---
    if (action === 'update') {
      const { subject, html, text, title, scheduled_at } = await req.json().catch(() => ({}));
      // re-read body since already consumed above
      return Response.json({ error: 'Use dedicated update call' }, { status: 400 });
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    console.error('[newsletterActions] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});