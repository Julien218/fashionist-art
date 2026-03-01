import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return Response.json({ error: 'Accès réservé aux admins' }, { status: 403 });
    }

    const participants = await base44.asServiceRole.entities.ParticipantForm.list('-created_date');

    const columns = [
      'email', 'first_name', 'last_name', 'phone', 'age', 'city', 'country',
      'discipline', 'experience_level', 'motivation', 'portfolio_url',
      'participation_type', 'special_needs', 'how_did_you_hear',
      'consent_rgpd', 'status', 'invitation_sent_at', 'submitted_at', 'created_date'
    ];

    const headers = [
      'Email', 'Prénom', 'Nom', 'Téléphone', 'Âge', 'Ville', 'Pays',
      'Discipline', 'Niveau', 'Motivation', 'Portfolio',
      'Type de participation', 'Besoins spéciaux', 'Comment entendu parler',
      'Consentement RGPD', 'Statut', 'Invitation envoyée', 'Formulaire soumis', 'Date création'
    ];

    const escape = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = [
      headers.join(','),
      ...participants.map(p => columns.map(col => escape(p[col])).join(','))
    ];

    const csv = rows.join('\n');
    const bom = '\uFEFF'; // UTF-8 BOM for Excel

    return new Response(bom + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="participants_fashionistart_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('exportParticipantsCSV error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});