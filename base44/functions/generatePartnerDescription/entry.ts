import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const CREDITS = "Architecture & réalisation : Js-Innov.IA — Design & mise en page : JY-Trix.AI";

const GENERATION_PROMPT = (partner) => `Tu es un expert en relations publiques pour l'événement "Fashionist'ART" (18 avril 2026, Belgique).

DONNÉES DU PARTENAIRE:
- Nom: ${partner.name}
- Catégorie: ${partner.category}
- Site web: ${partner.website || 'N/A'}

GÉNÉRER AUTOMATIQUEMENT:

1) DESCRIPTION (80-150 mots)
- Style professionnel, clair, accessible
- Expliquer le lien avec Fashionist'ART
- Valoriser la contribution du partenaire
- Inclure en footer: "${CREDITS}"
- Ne PAS inventer d'infos (prix, partenariats antérieurs, etc.)

2) SHORT_DESCRIPTION (1 phrase, 12-18 mots max)
- Percutante, engageante
- Résume l'essence du partenariat

3) TAGS (5-10 max, séparés par virgules)
- Catégorie du partenaire
- Domaine d'expertise
- Lien avec l'événement
- Exemple: "Mode, Design, Belgique, Innovation"

RÈGLES IMPORTANTES:
- Ne jamais inventer de faits
- Utiliser UNIQUEMENT les infos disponibles
- Ton: professionnel, événement culturel, local Belgique
- Adapter au secteur du partenaire

RÉPONDRE EN JSON:
{
  "description": "...",
  "short_description": "...",
  "tags": "tag1, tag2, tag3, ..."
}`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { partner_id } = body;

    if (!partner_id) {
      return Response.json({ error: 'partner_id required' }, { status: 400 });
    }

    console.log(`Generating description for partner ${partner_id}...`);

    // Récupérer le partenaire
    const partners = await base44.asServiceRole.entities.Partner.filter({ id: partner_id });
    if (!partners || partners.length === 0) {
      return Response.json({ error: 'Partner not found' }, { status: 404 });
    }

    const partner = partners[0];

    // Générer via LLM
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: GENERATION_PROMPT(partner),
      response_json_schema: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          short_description: { type: 'string' },
          tags: { type: 'string' },
        },
        required: ['description', 'short_description', 'tags'],
      },
    });

    if (!result || !result.description) {
      console.error('LLM generation failed', result);
      return Response.json({ error: 'Failed to generate description' }, { status: 500 });
    }

    // Sauvegarder
    const updated = await base44.asServiceRole.entities.Partner.update(partner_id, {
      description: result.description,
      short_description: result.short_description,
      tags: result.tags,
    });

    console.log(`Description generated for partner ${partner_id}`);

    return Response.json({
      success: true,
      partner: updated,
      message: 'Description générée avec succès',
    });
  } catch (error) {
    console.error('Error in generatePartnerDescription:', error.message);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});