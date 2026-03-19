/**
 * validateArtistSpotlight
 * Appelé par Olivier depuis l'admin ou le lien email pour VALIDER ou REFUSER un spotlight.
 * Après validation → crée le SocialPostDraft et le publie.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const EVENT_URL = 'https://fashionistart.base44.app';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Admin uniquement' }, { status: 403 });
    }

    const body = await req.json();
    const { spotlight_id, action, platform } = body;

    if (!spotlight_id || !['VALIDATED', 'REJECTED'].includes(action)) {
      return Response.json({ error: 'Paramètres invalides (spotlight_id + action: VALIDATED|REJECTED)' }, { status: 400 });
    }

    // Récupérer le spotlight
    const spotlights = await base44.asServiceRole.entities.ArtistDailySpotlight.filter({ id: spotlight_id });
    const spotlight = spotlights?.[0];

    if (!spotlight) {
      return Response.json({ error: 'Spotlight introuvable' }, { status: 404 });
    }

    if (spotlight.validation_status !== 'PENDING') {
      return Response.json({ error: `Déjà traité : ${spotlight.validation_status}` }, { status: 400 });
    }

    if (action === 'REJECTED') {
      await base44.asServiceRole.entities.ArtistDailySpotlight.update(spotlight_id, {
        validation_status: 'REJECTED',
      });
      console.log(`❌ Spotlight refusé: ${spotlight.artist_name}`);
      return Response.json({ success: true, message: `Post de ${spotlight.artist_name} refusé.` });
    }

    // VALIDATED → créer le SocialPostDraft
    const targetPlatform = platform || spotlight.platform || 'facebook';
    const fullContent = `${spotlight.post_content}\n\n${spotlight.hashtags}`;

    const postDraft = await base44.asServiceRole.entities.SocialPostDraft.create({
      platform: targetPlatform,
      post_type: 'artist_spotlight',
      title: `Spotlight : ${spotlight.artist_name}`,
      content: fullContent,
      hashtags: spotlight.hashtags,
      link_url: EVENT_URL,
      status: 'APPROVED',
      approved_by_user_id: user.id,
      approved_at: new Date().toISOString(),
    });

    // Mettre à jour le spotlight
    await base44.asServiceRole.entities.ArtistDailySpotlight.update(spotlight_id, {
      validation_status: 'VALIDATED',
      validated_at: new Date().toISOString(),
      social_post_id: postDraft.id,
    });

    // Publier immédiatement via la fonction existante
    const publishRes = await base44.asServiceRole.functions.invoke('publishApprovedPosts', {
      post_ids: [postDraft.id],
    });

    // Marquer comme publié
    await base44.asServiceRole.entities.ArtistDailySpotlight.update(spotlight_id, {
      validation_status: 'PUBLISHED',
      published_at: new Date().toISOString(),
    });

    // Email de confirmation
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'oliviertrevis@gmail.com',
      from_name: "Fashionist'ART – Bot",
      subject: `✅ Publié : ${spotlight.artist_name} sur ${targetPlatform}`,
      body: `Le post pour <strong>${spotlight.artist_name}</strong> a été validé et publié sur <strong>${targetPlatform}</strong>.<br/><br/>💻 JS-Innov.IA × JY-TrixAI`,
    });

    console.log(`✅ Spotlight validé & publié: ${spotlight.artist_name} → ${targetPlatform}`);
    return Response.json({
      success: true,
      message: `Post de ${spotlight.artist_name} validé et publié sur ${targetPlatform}`,
      post_id: postDraft.id,
    });

  } catch (error) {
    console.error('validateArtistSpotlight error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});