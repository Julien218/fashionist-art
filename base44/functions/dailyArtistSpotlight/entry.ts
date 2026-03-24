/**
 * dailyArtistSpotlight
 * Sélectionne 2 artistes aléatoires actifs, génère un post IA pour chacun,
 * puis envoie sur WhatsApp à Olivier pour validation.
 * Appelé chaque jour par une automatisation schedulée.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const HASHTAGS = '#FashionistART #FashionistART2026 #ModeArt #Dour #Belgique #ArtisteSpotlight #jsinnovia #jytrixai';
const EVENT_URL = 'https://fashionistart.base44.app';
const EVENT_DATE = '18 avril 2026';
const OLIVIER_WHATSAPP = '+32479819368'; // Numéro WhatsApp d'Olivier (format international)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth service role pour accès complet
    const allArtists = await base44.asServiceRole.entities.Artist.filter({ status: 'active' });

    if (!allArtists || allArtists.length === 0) {
      console.log('Aucun artiste actif trouvé.');
      return Response.json({ message: 'Aucun artiste actif' });
    }

    // Date du jour
    const today = new Date().toISOString().split('T')[0];

    // Artistes déjà mis en avant aujourd'hui
    const alreadyDone = await base44.asServiceRole.entities.ArtistDailySpotlight.filter({ date: today });
    const alreadyIds = (alreadyDone || []).map(s => s.artist_id);

    // Filtrer les artistes non encore mis en avant aujourd'hui
    const eligible = allArtists.filter(a => !alreadyIds.includes(a.id));

    if (eligible.length === 0) {
      console.log('Tous les artistes ont déjà été mis en avant aujourd\'hui.');
      return Response.json({ message: 'Déjà traité aujourd\'hui' });
    }

    // Sélection aléatoire de 2 artistes (ou moins si pas assez)
    const shuffled = eligible.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(2, shuffled.length));

    const results = [];

    for (let i = 0; i < selected.length; i++) {
      const artist = selected[i];

      // Génère un post avec l'IA
      const prompt = `Tu es community manager pour l'événement Fashionist'ART (${EVENT_DATE}, Dour, Belgique, entrée gratuite).

Génère un post Facebook/Instagram pour mettre en avant cet artiste :
Nom : ${artist.name}
Discipline : ${artist.discipline || 'artiste'}
${artist.short_bio ? `Bio courte : ${artist.short_bio}` : ''}
${artist.stage_name ? `Nom de scène : ${artist.stage_name}` : ''}

RÈGLES :
- Accroche percutante dès la 1ère ligne
- Ton chaleureux, local, festif
- Mentionner l'événement : Fashionist'ART, ${EVENT_DATE}, Dour, Belgique
- Entrée gratuite
- Lien : ${EVENT_URL}
- Signature : 💻 JS-Innov.IA × JY-TrixAI
- Hashtags : ${HASHTAGS}

FORMAT JSON :
{
  "content": "texte complet du post avec emojis",
  "hashtags": "#hashtags"
}`;

      const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            hashtags: { type: 'string' },
          },
        },
      });

      const postContent = llmResult?.content || `✨ Focus artiste : ${artist.name} !\n\nRetrouvez ${artist.name} le ${EVENT_DATE} à Dour, Belgique pour Fashionist'ART 🎨\n🎟️ Entrée gratuite → ${EVENT_URL}\n${HASHTAGS}\n\n💻 JS-Innov.IA × JY-TrixAI`;
      const hashtags = llmResult?.hashtags || HASHTAGS;

      // Sauvegarde en base
      const spotlight = await base44.asServiceRole.entities.ArtistDailySpotlight.create({
        artist_id: artist.id,
        artist_name: artist.name,
        date: today,
        platform: 'facebook',
        post_content: postContent,
        hashtags,
        validation_status: 'PENDING',
        whatsapp_sent_at: new Date().toISOString(),
        batch_index: i + 1,
      });

      // Message WhatsApp pour Olivier
      const waMessage = `🎨 *SPOTLIGHT ARTISTE ${i + 1}/2 – ${today}*\n*Fashionist'ART 2026*\n\n👤 *${artist.name}* (${artist.discipline || 'artiste'})\n\n📝 *POST GÉNÉRÉ :*\n${postContent}\n\n---\n✅ *Répondre :*\n• *VALIDER ${spotlight.id}* → publication\n• *REFUSER ${spotlight.id}* → annuler\n\n💻 _JS-Innov.IA × JY-TrixAI_`;

      // Envoi WhatsApp via email (fallback si API WhatsApp non dispo)
      // On utilise l'email comme canal de notification avec le lien WhatsApp
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'oliviertrevis@gmail.com',
        from_name: "Fashionist'ART – Bot Automatique",
        subject: `🎨 Artiste Spotlight ${i + 1}/2 – ${artist.name} – ${today} | Action requise`,
        body: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><style>
body{font-family:Arial,sans-serif;background:#0A0A0F;color:#fff;margin:0;padding:20px;}
.card{background:#12121A;border:1px solid rgba(255,45,138,0.3);border-radius:16px;padding:24px;max-width:600px;margin:0 auto;}
h2{color:#FF2D8A;font-size:20px;margin-bottom:4px;}
.artist{background:rgba(255,45,138,0.1);border-radius:8px;padding:12px;margin:16px 0;}
.post{background:#1A1A24;border-radius:8px;padding:16px;white-space:pre-wrap;font-size:14px;line-height:1.6;border-left:3px solid #FF2D8A;}
.btn{display:inline-block;padding:12px 24px;border-radius:50px;font-weight:bold;text-decoration:none;margin:8px 4px;}
.btn-validate{background:#FF2D8A;color:#fff;}
.btn-reject{background:#333;color:#aaa;}
.footer{margin-top:20px;font-size:11px;color:#555;text-align:center;}
</style></head>
<body>
<div class="card">
  <h2>🎨 Spotlight Artiste ${i + 1}/2 — ${today}</h2>
  <p style="color:#aaa;font-size:13px;">Fashionist'ART 2026 – Validation requise</p>
  
  <div class="artist">
    <strong style="color:#D4AF37;">👤 ${artist.name}</strong><br/>
    <span style="color:#888;font-size:13px;">${artist.discipline || 'Artiste'}</span>
  </div>

  <p style="color:#FF2D8A;font-weight:bold;margin-bottom:8px;">📝 Post généré :</p>
  <div class="post">${postContent}</div>

  <div style="margin-top:20px;text-align:center;">
    <a href="https://fashionistart.base44.app/Admin?validate_spotlight=${spotlight.id}" class="btn btn-validate">✅ VALIDER & PUBLIER</a>
    <a href="https://fashionistart.base44.app/Admin?reject_spotlight=${spotlight.id}" class="btn btn-reject">❌ REFUSER</a>
  </div>

  <p style="margin-top:16px;color:#555;font-size:12px;text-align:center;">
    Ou répondez par WhatsApp :<br/>
    <strong style="color:#25D366;">VALIDER ${spotlight.id}</strong> ou <strong>REFUSER ${spotlight.id}</strong>
  </p>

  <div class="footer">
    💻 JS-Innov.IA × 🤖 JY-TrixAI<br/>
    Système automatisé Fashionist'ART
  </div>
</div>
</body>
</html>`,
      });

      console.log(`✅ Spotlight ${i + 1} créé pour ${artist.name} (ID: ${spotlight.id})`);
      results.push({ artist: artist.name, spotlight_id: spotlight.id, status: 'PENDING' });
    }

    return Response.json({
      success: true,
      date: today,
      spotlights: results,
      message: `${results.length} artiste(s) envoyés à Olivier pour validation`,
    });

  } catch (error) {
    console.error('dailyArtistSpotlight error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});