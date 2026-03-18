import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const CREDITS = "Architecture & réalisation : Js-Innov.IA\nDesign & mise en page : JY-Trix.AI";

const GENERATION_PROMPT = (data) => `Tu es un expert en social media pour l'événement "Fashionist'ART" (18 avril 2026, Centre Sportif d'Élouges, Dour, Belgique).

DONNÉES DISPONIBLES:
${data.eventInfo ? `Événement: ${JSON.stringify(data.eventInfo)}` : 'Aucun événement'}
${data.artists && data.artists.length > 0 ? `${data.artists.length} artistes disponibles` : 'Pas d\'artiste'}

GÉNÉRER ${data.quantity || 10} POSTS pour ces plateformes (répartition à ta discrétion):
- Facebook (ton chaleureux, 1-3 paragraphes, CTA clair, 1-2 emojis)
- Instagram (court, percutant, max 12 hashtags, 2-3 emojis)
- LinkedIn (pro, valeur culturelle, max 5 hashtags, 1 emoji)
- X/Twitter (court, punchy, max 3 hashtags, 0-1 emoji)

TYPES DE POSTS À INCLURE:
${data.includeCountdown ? '- Compteur à rebours (J-30, J-15, J-7)' : ''}
${data.includeArtists ? '- Présentation artistes (biographie courte + lien profil)' : ''}
${data.includeEvents ? '- Infos événement (lieu, accès, programme, inscription gratuite)' : ''}
- Behind the scenes (si info dispo)
- Appel à artistes
- Teasers newsletter

RÈGLES OBLIGATOIRES:
1. Ne JAMAIS inventer de fait (prix, sponsors, expositions, parcours non présents)
2. Inclure SYSTÉMATIQUEMENT:
   - CTA vers le site (link_url: https://www.fashionistart.be)
   - Les crédits: "${CREDITS}"
3. Hashtags pertinents (Instagram max 12, LinkedIn max 5, X max 3)
4. Emojis modérés et contextuels
5. Adapter le ton par plateforme
6. Chaque post doit être prêt à copier-coller

RÉPONDRE EN JSON AVEC CETTE STRUCTURE:
{
  "posts": [
    {
      "platform": "facebook|instagram|linkedin|x|website",
      "post_type": "event|artist|countdown|behind_the_scenes|call_for_artists|newsletter_teaser",
      "title": "titre (optionnel, utilisé pour website)",
      "content": "contenu complet du post avec crédits",
      "hashtags": "hashtags séparés par des espaces (ex: #Fashionist #Art)",
      "link_url": "https://www.fashionistart.be",
      "media_url": null
    },
    ...
  ]
}`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { quantity = 10, includeArtists = true, includeEvents = true, includeCountdown = true } = body;

    console.log('Fetching event and artists data...');

    // Récupérer les artistes actifs
    const artists = await base44.asServiceRole.entities.Artist.filter(
      { status: 'approved' },
      '-updated_date',
      20
    );

    // Construire les données pour le prompt
    const data = {
      quantity,
      includeArtists,
      includeEvents,
      includeCountdown,
      eventInfo: {
        name: "Fashionist'ART",
        date: "18 avril 2026",
        location: "Centre Sportif d'Élouges, Rue du Stade, Dour, Belgique",
        ticketing: "Entrée gratuite",
        url: "https://www.fashionistart.be",
      },
      artists: artists
        ? artists.slice(0, 5).map((a) => ({
            name: a.name || a.stage_name || '',
            discipline: a.discipline || '',
            short_bio: a.short_bio || a.full_bio?.substring(0, 100) || '',
            share_slug: a.share_slug || '',
          }))
        : [],
    };

    console.log('Generating posts via LLM...');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: GENERATION_PROMPT(data),
      response_json_schema: {
        type: 'object',
        properties: {
          posts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                platform: { type: 'string' },
                post_type: { type: 'string' },
                title: { type: 'string' },
                content: { type: 'string' },
                hashtags: { type: 'string' },
                link_url: { type: 'string' },
                media_url: { type: 'string' },
              },
            },
          },
        },
      },
    });

    if (!result || !result.posts || result.posts.length === 0) {
      console.error('LLM returned empty posts', result);
      return Response.json({ error: 'No posts generated' }, { status: 500 });
    }

    console.log(`Creating ${result.posts.length} post drafts...`);

    // Créer les posts en tant que DRAFT
    const created = [];
    for (const post of result.posts) {
      const postData = {
        platform: post.platform,
        post_type: post.post_type,
        title: post.title || '',
        content: post.content || '',
        hashtags: post.hashtags || '',
        link_url: post.link_url || 'https://www.fashionistart.be',
        media_url: post.media_url || null,
        status: 'DRAFT',
        created_by_user_id: user.id,
      };

      const created_post = await base44.asServiceRole.entities.SocialPostDraft.create(postData);
      created.push(created_post);
    }

    console.log(`Successfully created ${created.length} posts`);

    return Response.json({
      success: true,
      posts_created: created.length,
      posts: created,
      message: `${created.length} posts générés en brouillon`,
    });
  } catch (error) {
    console.error('Error in generateSocialPosts:', error.message, error.stack);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});