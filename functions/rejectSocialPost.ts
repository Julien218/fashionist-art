import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'super_admin') {
      return Response.json({ error: 'Super admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { post_id, reason } = body;

    if (!post_id) {
      return Response.json({ error: 'post_id required' }, { status: 400 });
    }

    console.log(`Rejecting post ${post_id}...`);

    const rejected_post = await base44.asServiceRole.entities.SocialPostDraft.update(post_id, {
      status: 'REJECTED',
      error: reason || 'Rejeté par super_admin',
      approved_by_user_id: user.id,
    });

    console.log(`Post ${post_id} rejected`);

    return Response.json({
      success: true,
      post: rejected_post,
      message: 'Post rejeté',
    });
  } catch (error) {
    console.error('Error in rejectSocialPost:', error.message);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});