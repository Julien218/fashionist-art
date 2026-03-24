import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return Response.json({ error: 'Accès réservé aux admins' }, { status: 403 });
    }

    const { email, first_name, last_name } = await req.json();
    if (!email) return Response.json({ error: 'Email requis' }, { status: 400 });

    const token = crypto.randomUUID();
    const appUrl = req.headers.get('origin') || 'https://your-app.base44.app';
    const formUrl = `${appUrl}?page=ParticipantFormPage&token=${token}`;

    // Save participant invitation
    const participant = await base44.asServiceRole.entities.ParticipantForm.create({
      email,
      first_name: first_name || '',
      last_name: last_name || '',
      status: 'invite',
      invitation_token: token,
      invitation_sent_at: new Date().toISOString(),
    });

    // Send invitation email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: "Invitation à Fashionist'ART — Complétez votre formulaire de participation",
      body: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#fff;padding:40px;border-radius:16px;">
          <h1 style="color:#FF2D8A;margin:0;">Fashionist'<span style="color:#fff;font-weight:900;">ART</span></h1>
          <p style="color:#aaa;font-size:12px;">18 avril 2026 · Centre Sportif d'Élouges, Dour</p>
          <hr style="border:1px solid rgba(255,255,255,0.1);margin:20px 0;">
          <h2 style="color:#fff;">Vous êtes invité(e) à participer !</h2>
          <p style="color:#bbb;">Bonjour ${first_name || ''} ${last_name || ''},</p>
          <p style="color:#bbb;">Vous avez été invité(e) à compléter votre formulaire de participation à <strong style="color:#fff;">Fashionist'ART</strong>.</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${formUrl}" style="display:inline-block;background:linear-gradient(135deg,#FF2D8A,#C2185B);color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;">
              Compléter mon formulaire →
            </a>
          </div>
          <p style="color:#666;font-size:12px;">Ce lien est personnel et unique. Ne le partagez pas.</p>
          <hr style="border:1px solid rgba(255,255,255,0.1);margin:20px 0;">
          <p style="color:#555;font-size:11px;">© 2026 Fashionist'ART — Si vous n'êtes pas concerné(e), ignorez cet email.</p>
        </div>
      `
    });

    return Response.json({ success: true, participant_id: participant.id, token });
  } catch (error) {
    console.error('sendParticipantInvitation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});