import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { artistIds, appUrl } = await req.json();
    if (!artistIds || !artistIds.length) {
      return Response.json({ error: 'No artist IDs provided' }, { status: 400 });
    }

    const results = [];

    for (const artistId of artistIds) {
      const artist = await base44.asServiceRole.entities.Artist.get(artistId);
      if (!artist || !artist.email) {
        results.push({ id: artistId, status: 'skipped', reason: 'No email' });
        continue;
      }

      // Generate unique token
      const token = crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      await base44.asServiceRole.entities.Artist.update(artistId, {
        info_request_token: token,
        info_request_token_expires_at: expiresAt,
      });

      const completionUrl = `${appUrl}/artiste/complete?token=${token}`;
      const artistName = artist.stage_name || `${artist.first_name || ''} ${artist.last_name || ''}`.trim() || artist.name;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: artist.email,
        subject: "Fashionist'ART 2026 – Complète tes informations artiste",
        body: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#fff;padding:40px;border-radius:16px;">
  <h1 style="color:#FF2D8A;margin-bottom:4px;">Fashionist'<span style="color:#fff;font-weight:900;">ART</span></h1>
  <p style="color:#aaa;font-size:12px;margin-top:0;">18 avril 2026 — Centre Sportif d'Élouges, Dour</p>
  <h2 style="color:#fff;">Bonjour ${artistName} 👋</h2>
  <p style="color:#ccc;">Merci de participer à <strong style="color:#fff;">Fashionist'ART 2026</strong> !</p>
  <p style="color:#ccc;">Pour que nous puissions te présenter au mieux sur notre site et nos supports de communication, nous t'invitons à compléter ta fiche artiste :</p>
  <ul style="color:#aaa;line-height:1.8;">
    <li>📸 Ta photo</li>
    <li>✍️ Ta biographie courte et longue</li>
    <li>🔗 Tes liens réseaux sociaux</li>
    <li>✅ Ton consentement de diffusion</li>
  </ul>
  <div style="text-align:center;margin:30px 0;">
    <a href="${completionUrl}" style="display:inline-block;background:linear-gradient(135deg,#FF2D8A,#C2185B);color:#fff;padding:14px 32px;border-radius:50px;font-weight:700;text-decoration:none;font-size:16px;">
      Compléter ma fiche artiste →
    </a>
  </div>
  <p style="color:#888;font-size:12px;">Ce lien est valable 14 jours. Si tu as des questions, contacte-nous à <a href="mailto:contact@fashionistart.be" style="color:#FF2D8A;">contact@fashionistart.be</a></p>
  <hr style="border-color:#333;margin:24px 0;" />
  <p style="color:#555;font-size:11px;text-align:center;">© 2026 Fashionist'ART — Élouges, Dour, Belgique</p>
</div>`,
      });

      results.push({ id: artistId, status: 'sent', email: artist.email });
    }

    return Response.json({ results });
  } catch (error) {
    console.error('sendArtistInfoRequest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});