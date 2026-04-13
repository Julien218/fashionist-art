import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { service, api_key, prompt, image_url, duration, ratio } = await req.json();

    if (!api_key?.trim()) return Response.json({ error: 'Clé API manquante' }, { status: 400 });
    if (!prompt?.trim()) return Response.json({ error: 'Prompt manquant' }, { status: 400 });

    if (service === 'runway') {
      // RunwayML Gen-4 Turbo - text-to-video or image-to-video
      const body = {
        model: 'gen4_turbo',
        promptText: prompt,
        duration: duration || 5,
        ratio: ratio || '1280:720',
      };
      if (image_url) {
        body.promptImage = image_url;
      }

      const taskRes = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06',
        },
        body: JSON.stringify(body),
      });

      if (!taskRes.ok) {
        const err = await taskRes.text();
        console.error('Runway error:', err);
        return Response.json({ error: `Runway API error: ${err}` }, { status: 400 });
      }

      const task = await taskRes.json();
      return Response.json({ success: true, task_id: task.id, status: task.status, service: 'runway' });

    } else if (service === 'kling') {
      // Kling AI - text-to-video
      const klingRes = await fetch('https://api.klingai.com/v1/videos/text2video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_name: 'kling-v1',
          prompt,
          duration: String(duration || 5),
          aspect_ratio: ratio || '16:9',
          cfg_scale: 0.5,
          mode: 'std',
        }),
      });

      if (!klingRes.ok) {
        const err = await klingRes.text();
        console.error('Kling error:', err);
        return Response.json({ error: `Kling API error: ${err}` }, { status: 400 });
      }

      const klingData = await klingRes.json();
      return Response.json({ success: true, task_id: klingData.data?.task_id, status: 'submitted', service: 'kling' });

    } else if (service === 'luma') {
      // Luma Dream Machine
      const lumaRes = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          ...(image_url ? { keyframes: { frame0: { type: 'image', url: image_url } } } : {}),
          loop: false,
          aspect_ratio: ratio || '16:9',
        }),
      });

      if (!lumaRes.ok) {
        const err = await lumaRes.text();
        console.error('Luma error:', err);
        return Response.json({ error: `Luma API error: ${err}` }, { status: 400 });
      }

      const lumaData = await lumaRes.json();
      return Response.json({ success: true, task_id: lumaData.id, status: lumaData.state, service: 'luma' });
    }

    return Response.json({ error: 'Service non supporté' }, { status: 400 });

  } catch (error) {
    console.error('videoEditorAgent error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});