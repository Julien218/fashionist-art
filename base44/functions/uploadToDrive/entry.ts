import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const FOLDER_ID = '1jzow_cn4EQ8m6w7L5opt3wWuWZOIBgc6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

    const fileName = formData.get('filename') || file.name || `artist_${Date.now()}`;
    const fileBuffer = await file.arrayBuffer();
    const mimeType = file.type || 'image/jpeg';

    // Upload to Google Drive using multipart upload
    const metadata = JSON.stringify({ name: fileName, parents: [FOLDER_ID] });
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = `${delimiter}Content-Type: application/json\r\n\r\n${metadata}`;
    const dataPart = `${delimiter}Content-Type: ${mimeType}\r\n\r\n`;
    const closeDelimiterBytes = new TextEncoder().encode(closeDelimiter);

    const metadataBytes = new TextEncoder().encode(metadataPart);
    const dataPartBytes = new TextEncoder().encode(dataPart);
    const fileBytes = new Uint8Array(fileBuffer);

    const body = new Uint8Array(metadataBytes.length + dataPartBytes.length + fileBytes.length + closeDelimiterBytes.length);
    body.set(metadataBytes, 0);
    body.set(dataPartBytes, metadataBytes.length);
    body.set(fileBytes, metadataBytes.length + dataPartBytes.length);
    body.set(closeDelimiterBytes, metadataBytes.length + dataPartBytes.length + fileBytes.length);

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webContentLink,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error('Drive upload error:', err);
      return Response.json({ error: 'Drive upload failed', details: err }, { status: 500 });
    }

    const driveFile = await uploadRes.json();

    // Make file publicly readable
    await fetch(`https://www.googleapis.com/drive/v3/files/${driveFile.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    });

    const publicUrl = `https://drive.google.com/uc?export=view&id=${driveFile.id}`;

    return Response.json({ file_url: publicUrl, drive_id: driveFile.id, name: driveFile.name });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});