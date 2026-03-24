import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { fileId } = await req.json();
    if (!fileId) return Response.json({ error: 'fileId required' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    // Export or download the file from Drive
    // First get file metadata
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webContentLink,thumbnailLink`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const meta = await metaRes.json();
    if (meta.error) return Response.json({ error: meta.error.message }, { status: 400 });

    // Download the file content
    const dlRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!dlRes.ok) return Response.json({ error: 'Impossible de télécharger le fichier' }, { status: 400 });

    const blob = await dlRes.blob();
    const file = new File([blob], meta.name, { type: meta.mimeType });

    // Upload to Base44 public storage
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    return Response.json({ file_url, name: meta.name });
  } catch (error) {
    console.error('drivePickFile error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});