import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BIOGRAPHY_PROMPT = (artist) => `Tu es un expert en rédaction artistique pour un événement culturel appelé "Fashionist'ART" (18 avril 2026, Centre Sportif d'Élouges, Dour, Belgique).

Génère 4 versions optimisées de la biographie de cet artiste :

DONNÉES DE L'ARTISTE:
- Nom: ${artist.name || artist.stage_name || ''}
- Bio courante: ${artist.short_bio || artist.full_bio || 'Non renseignée'}
- Discipline: ${artist.discipline || ''}
- Catégorie: ${artist.category || ''}
- Ville: ${artist.city || ''}
- Pays: ${artist.country || ''}
- Site web: ${artist.website || 'N/A'}
- Instagram: ${artist.instagram || 'N/A'}
- Vidéo: ${artist.promo_video_url || 'N/A'}

INSTRUCTIONS:

1) VERSION SITE WEB (300-600 mots)
Suit cette structure:
- Phrase d'accroche artistique (1 phrase forte)
- Présentation du travail artistique (style, inspirations, univers)
- Description des œuvres (techniques, concepts, message)
- Question ou réflexion artistique
- Origine ou lien culturel

Ton: Artistique, accessible, professionnel.
Évite: Phrases trop longues, jargon complexe, inventions.
Préfère: Paragraphes courts, mots visuels, phrases impactantes.

2) VERSION COURTE (100 mots max)
Résumé concis et percutant de la biographie.

3) POST RÉSEAUX SOCIAUX
Format:
🎨 Artiste présenté à Fashionist'ART: [Nom]
[Courte description artistique 2-3 phrases]
📍 18 avril 2026 — Centre Sportif d'Élouges (Dour)
Architecture & réalisation: Js-Innov.IA
Design & mise en page: JY-trix.AI

4) TEXTE NEWSLETTER
Format:
Focus artiste: [Nom]
[Présentation courte 2-3 phrases + invitation à découvrir son univers]

RÈGLES IMPORTANTES:
- Ne jamais inventer d'expositions, récompenses ou parcours non mentionnés
- Utiliser UNIQUEMENT les informations disponibles
- Inclure le branding obligatoire (Js-Innov.IA et JY-trix.AI)
- Adapte le contenu à la culture et la région si mentionnées
- Le texte doit être mobilisable immédiatement

Réponds en JSON avec cette structure exacte:
{
  "bio_website": "...",
  "bio_short": "...",
  "post_social": "...",
  "text_newsletter": "..."
}`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Vérifier que c'est un admin
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const artistId = body.artistId;

    if (!artistId) {
      return Response.json({ error: 'artistId required' }, { status: 400 });
    }

    // Récupérer l'artiste
    const artists = await base44.asServiceRole.entities.Artist.filter({ id: artistId });
    if (!artists || artists.length === 0) {
      return Response.json({ error: 'Artist not found' }, { status: 404 });
    }

    const artist = artists[0];
    console.log(`Generating bios for artist: ${artist.name || artist.stage_name}`);

    // Générer les bios via LLM
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: BIOGRAPHY_PROMPT(artist),
      response_json_schema: {
        type: 'object',
        properties: {
          bio_website: { type: 'string' },
          bio_short: { type: 'string' },
          post_social: { type: 'string' },
          text_newsletter: { type: 'string' },
        },
        required: ['bio_website', 'bio_short', 'post_social', 'text_newsletter'],
      },
    });

    if (!result || !result.bio_website) {
      console.error('LLM generation failed', result);
      return Response.json({ error: 'Failed to generate biographies' }, { status: 500 });
    }

    // Vérifier si une génération existe déjà
    const existing = await base44.asServiceRole.entities.ArtistBioGenerated.filter({ artist_id: artistId });

    let bioRecord;
    if (existing && existing.length > 0) {
      bioRecord = await base44.asServiceRole.entities.ArtistBioGenerated.update(existing[0].id, {
        ...result,
        generated_at: new Date().toISOString(),
        source_bio: artist.full_bio || artist.short_bio || '',
      });
    } else {
      bioRecord = await base44.asServiceRole.entities.ArtistBioGenerated.create({
        artist_id: artistId,
        ...result,
        generated_at: new Date().toISOString(),
        source_bio: artist.full_bio || artist.short_bio || '',
      });
    }

    console.log(`Bios generated successfully for artist ${artistId}`);

    return Response.json({
      success: true,
      bio_record: bioRecord,
      message: 'Biographies générées avec succès',
    });
  } catch (error) {
    console.error('Error in generateArtistBios:', error.message, error.stack);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});