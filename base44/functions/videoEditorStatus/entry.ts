import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { service, api_key, task_id } = await req.json();

    if (service === 'runway') {
      const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${task_id}`, {
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'X-Runway-Version': '2024-11-06',
        },
      });
      const data = await res.json();
      return Response.json({ status: data.status, video_url: data.output?.[0], progress: data.progressRatio });

    } else if (service === 'kling') {
      const res = await fetch(`https://api.klingai.com/v1/videos/text2video/${task_id}`, {
        headers: { 'Authorization': `Bearer ${api_key}` },
      });
      const data = await res.json();
      const video = data.data?.task_result?.videos?.[0];
      return Response.json({ status: data.data?.task_status, video_url: video?.url });

    } else if (service === 'luma') {
      const res = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${task_id}`, {
        headers: { 'Authorization': `Bearer ${api_key}` },
      });
      const data = await res.json();
      return Response.json({ status: data.state, video_url: data.assets?.video });
    }

    return Response.json({ error: 'Service inconnu' }, { status: 400 });
  } catch (error) {
    console.error('videoEditorStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});