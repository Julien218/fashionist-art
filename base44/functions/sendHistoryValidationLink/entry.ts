import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return Response.json({ error: 'POST only' }, { status: 405 });

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { draft_id, organizer_email, organizer_name, app_url } = await req.json();
    if (!draft_id || !organizer_email || !organizer_name) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const token = generateToken();
    const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    await base44.asServiceRole.entities.HistoryDraft.update(draft_id, {
      status: 'PENDING_VALIDATION',
      organizer_email,
      organizer_name,
      validation_token: token,
      validation_expires_at: expires,
      updated_at: new Date().toISOString(),
    });

    const validationUrl = `${app_url || 'https://fashionistart.be'}/histoire-validation?token=${token}`;

    const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #FF2D8A, #C2185B); padding: 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; color: white;">Fashionist'ART</h1>
    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Validation de la page officielle</p>
  </div>
  <div style="padding: 32px;">
    <p style="color: rgba(255,255,255,0.9);">Bonjour <strong>${organizer_name}</strong>,</p>
    <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">
      Un contenu a été préparé pour la page officielle <strong>"Histoire de Fashionist'ART"</strong>.
      Nous vous invitons à en prendre connaissance et à nous faire part de votre décision.
    </p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${validationUrl}" style="background: linear-gradient(135deg, #FF2D8A, #C2185B); color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Accéder à la validation →
      </a>
    </div>
    <p style="color: rgba(255,255,255,0.5); font-size: 12px;">Ce lien est valable 14 jours et ne peut être utilisé qu'une seule fois.</p>
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.35); font-size: 11px; text-align: center;">
      <p>Architecture &amp; réalisation : Js-Innov.IA</p>
      <p>Design &amp; mise en page : JY-Trix.AI</p>
    </div>
  </div>
</div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: organizer_email,
      subject: "Fashionist'ART — Validation page Histoire",
      body: emailBody,
      from_name: "Fashionist'ART",
    });

    console.log(`Validation email sent to ${organizer_email} for draft ${draft_id}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('sendHistoryValidationLink error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});