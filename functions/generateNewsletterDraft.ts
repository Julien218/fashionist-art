import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Accès réservé aux admins' }, { status: 403 });
    }

    const { title, theme, month, includeUpcomingEvents } = await req.json();

    // Récupérer événements et artistes pour contexte
    let eventsContext = '';
    let artistsContext = '';
    if (includeUpcomingEvents) {
      try {
        const events = await base44.asServiceRole.entities.ProgramEvent.list();
        if (events.length > 0) {
          eventsContext = 'Événements au programme: ' + events.map(e => `${e.title} (${e.start_time})`).join(', ');
        }
        const artists = await base44.asServiceRole.entities.Artist.filter({ status: 'active' });
        if (artists.length > 0) {
          artistsContext = 'Artistes participants: ' + artists.slice(0, 10).map(a => a.name).join(', ');
        }
      } catch (e) {
        console.warn('Could not fetch events/artists:', e.message);
      }
    }

    const prompt = `Tu es le rédacteur de la newsletter de Fashionist'ART, un événement de mode et d'art qui aura lieu le 18 avril 2026 au Centre Sportif d'Élouges (Dour, Belgique). Entrée gratuite.

Génère une newsletter complète pour le thème: "${theme || 'actualités Fashionist'ART'}".
Mois ciblé: ${month || 'mars 2026'}.
${eventsContext ? eventsContext : ''}
${artistsContext ? artistsContext : ''}

Génère:
1. Un objet d'email accrocheur (subject)
2. Un contenu HTML complet et beau avec les styles inline (fond sombre #0A0A0F, accents fuchsia #FF2D8A, or #D4AF37). Inclure: header avec logo texte "Fashionist'ART", contenu principal engageant, bouton CTA "Voir le programme", section infos pratiques (18 avril 2026, Centre Sportif d'Élouges, Dour, Belgique, Entrée gratuite).
3. Une version texte brut du contenu

IMPORTANT - Inclure OBLIGATOIREMENT ce footer dans l'HTML:
<div style="text-align:center;padding:20px;color:#555;font-size:11px;border-top:1px solid #333;margin-top:30px;">
  <p>Architecture & réalisation de clips : <strong>Js-Innov.IA</strong> | Mise en page & direction web : <strong>JY-Trix.AI</strong></p>
  <p>© 2026 Fashionist'ART — Tous droits réservés</p>
  <p><a href="{{UNSUBSCRIBE_URL}}" style="color:#FF2D8A;">Se désinscrire</a></p>
</div>

Réponds en JSON avec: { subject: string, html: string, text: string }`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          html: { type: 'string' },
          text: { type: 'string' },
        },
        required: ['subject', 'html', 'text'],
      },
    });

    const campaign = await base44.asServiceRole.entities.NewsletterCampaign.create({
      title: title || `Newsletter ${month || new Date().toLocaleDateString('fr-BE', { month: 'long', year: 'numeric' })}`,
      subject: result.subject,
      html: result.html,
      text: result.text,
      status: 'DRAFT',
      created_by_user_id: user.id,
    });

    console.log(`[Newsletter] Draft created: ${campaign.id} by ${user.email}`);
    return Response.json({ campaign_id: campaign.id, campaign });
  } catch (error) {
    console.error('[generateNewsletterDraft] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});