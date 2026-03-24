import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { post_ids } = body;

    if (!post_ids || !Array.isArray(post_ids) || post_ids.length === 0) {
      return Response.json({ error: 'post_ids array required' }, { status: 400 });
    }

    console.log(`Submitting ${post_ids.length} posts for approval...`);

    const updated = [];
    for (const post_id of post_ids) {
      const updated_post = await base44.asServiceRole.entities.SocialPostDraft.update(post_id, {
        status: 'PENDING_APPROVAL',
      });
      updated.push(updated_post);
    }

    console.log(`Successfully submitted ${updated.length} posts for approval`);

    return Response.json({
      success: true,
      posts_updated: updated.length,
      message: `${updated.length} posts soumis pour validation`,
    });
  } catch (error) {
    console.error('Error in submitSocialPostsForApproval:', error.message);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});