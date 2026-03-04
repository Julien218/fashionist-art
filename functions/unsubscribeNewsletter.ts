import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, email } = await req.json();

    if (!token || !email) {
      return Response.json({ error: 'Token et email requis' }, { status: 400 });
    }

    const subs = await base44.asServiceRole.entities.NewsletterSubscriber.filter({ unsubscribe_token: token, email: email.toLowerCase() });
    if (!subs || subs.length === 0) {
      return Response.json({ error: 'Abonné introuvable ou token invalide' }, { status: 404 });
    }

    const sub = subs[0];
    await base44.asServiceRole.entities.NewsletterSubscriber.update(sub.id, {
      unsubscribed: true,
      unsubscribed_date: new Date().toISOString(),
    });

    console.log(`[Newsletter] Unsubscribed: ${email}`);
    return Response.json({ success: true, message: 'Vous avez été désinscrit(e) avec succès.' });
  } catch (error) {
    console.error('[unsubscribeNewsletter] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});