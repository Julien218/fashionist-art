import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Import a file from Drive by ID and save to GalleryMedia entity
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { fileId, title, artistName, category, edition, mediaType } = await req.json();
    if (!fileId) return Response.json({ error: 'fileId required' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    // Get file metadata
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,thumbnailLink,webContentLink`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const meta = await metaRes.json();
    console.log('Drive file meta:', JSON.stringify(meta));

    if (meta.error) return Response.json({ error: meta.error.message }, { status: 400 });

    const isVideo = meta.mimeType?.startsWith('video/') || mediaType === 'video';
    const isPhoto = meta.mimeType?.startsWith('image/') || mediaType === 'photo';

    let file_url = '';
    let thumbnail_url = meta.thumbnailLink || '';

    if (isVideo) {
      // For videos, store the Drive preview URL directly (no download needed)
      file_url = `https://drive.google.com/file/d/${fileId}/preview`;
      thumbnail_url = thumbnail_url || `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    } else {
      // Download and re-upload photo
      const dlRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!dlRes.ok) return Response.json({ error: 'Impossible de télécharger le fichier' }, { status: 400 });

      const blob = await dlRes.blob();
      const file = new File([blob], meta.name, { type: meta.mimeType });
      const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
      file_url = uploadResult.file_url;
      thumbnail_url = file_url;
    }

    // Save to GalleryMedia
    const record = await base44.asServiceRole.entities.GalleryMedia.create({
      title: title || meta.name,
      type: isVideo ? 'video' : 'photo',
      url: file_url,
      thumbnail_url,
      drive_file_id: fileId,
      edition: edition || '2025',
      artist_name: artistName || '',
      category: category || '',
    });

    console.log('Created GalleryMedia:', record.id);
    return Response.json({ success: true, record });
  } catch (error) {
    console.error('driveImportFolder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});