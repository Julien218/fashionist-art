import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    // Vérifier auth (super_admin) OU cron secret
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const cronSecret = req.headers.get('x-cron-secret');
    const envSecret = Deno.env.get('CRON_SECRET');

    const isAuthorized =
      (user && user.role === 'super_admin') ||
      (cronSecret && envSecret && cronSecret === envSecret);

    if (!isAuthorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('Publishing approved posts...');

    // Récupérer les posts APPROVED avec scheduled_at <= now ou sans scheduled_at
    const now = new Date().toISOString();
    const approvedPosts = await base44.asServiceRole.entities.SocialPostDraft.filter({
      status: 'APPROVED',
    });

    const postsToPublish = approvedPosts.filter((p) => !p.scheduled_at || p.scheduled_at <= now);

    console.log(`Found ${postsToPublish.length} posts to publish`);

    let published = 0;
    for (const post of postsToPublish) {
      if (post.platform === 'website') {
        // Créer un SiteNews
        const newsData = {
          title: post.title || `Actualité Fashionist'ART`,
          content: post.content,
          media_url: post.media_url || null,
          published_at: now,
          source_post_id: post.id,
        };

        const siteNews = await base44.asServiceRole.entities.SiteNews.create(newsData);
        console.log(`Created SiteNews ${siteNews.id} from post ${post.id}`);

        // Marquer le post comme PUBLISHED
        await base44.asServiceRole.entities.SocialPostDraft.update(post.id, {
          status: 'PUBLISHED',
          published_at: now,
        });

        // Créer un log
        await base44.asServiceRole.entities.SocialPostPublishLog.create({
          post_id: post.id,
          platform: 'website',
          status: 'PUBLISHED',
          published_at: now,
        });

        published++;
      }
    }

    console.log(`Published ${published} posts to website`);

    return Response.json({
      success: true,
      published_count: published,
      message: `${published} posts publiés sur le site`,
    });
  } catch (error) {
    console.error('Error in publishApprovedPosts:', error.message, error.stack);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});