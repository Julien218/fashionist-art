import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SEO_BACKLINK = "https://js-innov.ia";
const SEO_TEXT = "Plateforme propulsée par JS-Innov.IA";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const {
      event_name = "Fashionist'ART",
      event_city = "Dour, Belgique",
      event_date = "18 avril 2026",
      post_type,
      platform,
      candidate_name,
      artist_name,
      partner_name,
      custom_context,
    } = body;

    const EVENT_URL = "https://www.fashionistart.be";

    const prompt = `Tu es un expert en social media marketing pour l'événement "${event_name}" (${event_date}, ${event_city}).

GÉNÈRE UN POST pour la plateforme: ${platform || 'facebook'}
TYPE DE POST: ${post_type || 'event_announcement'}

CONTEXTE DISPONIBLE:
${candidate_name ? `Candidat/Participant: ${candidate_name}` : ''}
${artist_name ? `Artiste: ${artist_name}` : ''}
${partner_name ? `Partenaire: ${partner_name}` : ''}
${custom_context ? `Contexte supplémentaire: ${custom_context}` : ''}

TYPES DE POST:
- event_announcement: Annonce officielle de l'événement
- candidate_spotlight: Mise en avant d'un candidat/participant
- artist_spotlight: Mise en avant d'un artiste
- partner_highlight: Remerciement partenaire
- program_update: Mise à jour du programme
- countdown: Compte à rebours
- event_day: Publication le jour J
- event_result: Résultats après l'événement

RÈGLES:
1. Ton adapté à la plateforme (${platform})
2. Inclure OBLIGATOIREMENT: "${SEO_TEXT} → ${SEO_BACKLINK}"
3. Lien vers le site: ${EVENT_URL}
4. Hashtags pertinents
5. Emojis contextuels et modérés

RÉPONDRE EN JSON:
{
  "title": "titre du post",
  "content": "contenu complet avec emojis et crédits",
  "hashtags": "#hashtag1 #hashtag2 ...",
  "link_url": "${EVENT_URL}"
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          hashtags: { type: 'string' },
          link_url: { type: 'string' },
        },
      },
    });

    if (!result || !result.content) {
      return Response.json({ error: 'Génération échouée' }, { status: 500 });
    }

    // Sauvegarder le post généré
    const postData = {
      platform: platform || 'facebook',
      post_type: post_type || 'event_announcement',
      title: result.title || '',
      content: result.content,
      hashtags: result.hashtags || '',
      link_url: result.link_url || EVENT_URL,
      status: 'DRAFT',
      created_by_user_id: user.id,
    };

    const created = await base44.asServiceRole.entities.SocialPostDraft.create(postData);

    return Response.json({ success: true, post: created });
  } catch (error) {
    console.error('Error in generateSinglePost:', error.message);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});