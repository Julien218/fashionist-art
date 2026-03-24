import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const EVENT_DATE = new Date('2026-04-18T10:00:00');
const EVENT_NAME = "Fashionist'ART";
const EVENT_CITY = "Dour, Belgique";
const EVENT_URL = "https://www.fashionistart.be";
const SEO_BACKLINK = "https://js-innov.ia";
const SEO_TEXT = "Plateforme propulsée par JS-Innov.IA";

const CREDITS = `\n\n---\n${SEO_TEXT} → ${SEO_BACKLINK}`;

function daysUntil(target) {
  const now = new Date();
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function scheduleDate(daysBefore) {
  const d = new Date(EVENT_DATE);
  d.setDate(d.getDate() - daysBefore);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

const CALENDAR_TEMPLATES = [
  {
    daysBefore: 60,
    post_type: 'event_announcement',
    platforms: ['facebook', 'instagram', 'linkedin'],
    title: `Annonce officielle — ${EVENT_NAME}`,
    content: (artists) => `🎉 L'événement ${EVENT_NAME} arrive bientôt à ${EVENT_CITY} !

Découvrez un événement unique réunissant passion, créativité et talents de toute la région.

📅 Date : 18 avril 2026
📍 Lieu : Centre Sportif d'Élouges, Dour
🎟️ Entrée gratuite

Rejoignez-nous pour une expérience inoubliable mêlant mode, art et performances.

👉 Plus d'informations : ${EVENT_URL}${CREDITS}`,
    hashtags: `#FashionistART #Dour #Belgique #Mode #Art #Festival #EventDNA #JsInnovIA`,
  },
  {
    daysBefore: 30,
    post_type: 'countdown',
    platforms: ['facebook', 'instagram', 'x'],
    title: `J-30 — ${EVENT_NAME}`,
    content: () => `⏳ Plus que 30 jours avant ${EVENT_NAME} !

La passion, la créativité et les talents se réunissent à ${EVENT_CITY}.

🗓️ 18 avril 2026
📍 Centre Sportif d'Élouges — Entrée GRATUITE

Réservez votre journée dès maintenant et partagez l'événement avec vos proches !

🔗 ${EVENT_URL}${CREDITS}`,
    hashtags: `#FashionistART #Countdown #J30 #Dour #Festival #JsInnovIA`,
  },
  {
    daysBefore: 15,
    post_type: 'artist_spotlight',
    platforms: ['facebook', 'instagram', 'linkedin'],
    title: `Découvrez nos artistes — ${EVENT_NAME}`,
    content: (artists) => {
      const artistList = artists && artists.length > 0
        ? artists.slice(0, 3).map(a => `✨ ${a.name}${a.discipline ? ` — ${a.discipline}` : ''}`).join('\n')
        : '✨ Nos artistes seront révélés très bientôt...';
      return `🌟 Découvrez les talents de ${EVENT_NAME} !

${artistList}

Chaque artiste apporte une vision unique et un talent exceptionnel à notre événement.

📅 Rendez-vous le 18 avril 2026 à ${EVENT_CITY}
🎟️ Entrée gratuite

👉 Découvrez tous les artistes : ${EVENT_URL}${CREDITS}`;
    },
    hashtags: `#FashionistART #Artistes #Talents #Dour #Art #Mode #JsInnovIA`,
  },
  {
    daysBefore: 7,
    post_type: 'program_update',
    platforms: ['facebook', 'instagram', 'linkedin', 'x'],
    title: `Programme — ${EVENT_NAME}`,
    content: () => `📋 Le programme complet de ${EVENT_NAME} est disponible !

🎭 Performances artistiques
🖼️ Expositions
🎨 Ateliers créatifs
👗 Défilé de mode

📅 18 avril 2026 — Toute la journée
📍 Centre Sportif d'Élouges, ${EVENT_CITY}
🎟️ Entrée 100% gratuite !

Consultez le programme détaillé sur notre site :
🔗 ${EVENT_URL}${CREDITS}`,
    hashtags: `#FashionistART #Programme #Dour #Belgique #Festival #JsInnovIA`,
  },
  {
    daysBefore: 3,
    post_type: 'countdown',
    platforms: ['facebook', 'instagram', 'x'],
    title: `J-3 — ${EVENT_NAME}`,
    content: () => `🔥 Plus que 3 jours avant ${EVENT_NAME} !

L'événement mode et art de l'année arrive à ${EVENT_CITY}.

📅 18 avril 2026
📍 Centre Sportif d'Élouges, Dour
🎟️ Entrée GRATUITE

Partagez avec vos amis et venez nombreux !
🔗 ${EVENT_URL}${CREDITS}`,
    hashtags: `#FashionistART #J3 #Countdown #Dour #Mode #Art #JsInnovIA`,
  },
  {
    daysBefore: 0,
    post_type: 'event_day',
    platforms: ['facebook', 'instagram', 'x'],
    title: `Jour J — ${EVENT_NAME} c'est aujourd'hui !`,
    content: () => `🎉 C'est aujourd'hui ! ${EVENT_NAME} ouvre ses portes !

Nous vous attendons au Centre Sportif d'Élouges à ${EVENT_CITY} pour une journée exceptionnelle !

🎭 Performances live
🖼️ Expositions
👗 Défilé de mode
🎨 Ateliers créatifs

📍 Rue du Stade, Élouges — Dour, Belgique
🎟️ Entrée GRATUITE

À tout à l'heure ! 🌟
🔗 ${EVENT_URL}${CREDITS}`,
    hashtags: `#FashionistART #JourJ #Live #Dour #Belgique #Mode #Art #JsInnovIA`,
  },
];

const NEWSLETTER_TEMPLATES = [
  {
    daysBefore: 60,
    subject: `🎉 ${EVENT_NAME} — L'annonce officielle`,
    content: (artists) => `Bonjour,

Nous sommes ravis de vous annoncer officiellement ${EVENT_NAME} !

📅 Date : 18 avril 2026
📍 Lieu : Centre Sportif d'Élouges, Dour, Belgique
🎟️ Entrée : Gratuite

Un événement unique réunissant mode, art et talents de la région. Au programme : performances artistiques, expositions, ateliers créatifs et défilé de mode.

Restez connectés pour découvrir nos artistes et le programme complet.

👉 En savoir plus : ${EVENT_URL}

À très bientôt !
L'équipe ${EVENT_NAME}

---
${SEO_TEXT} → ${SEO_BACKLINK}`,
  },
  {
    daysBefore: 7,
    subject: `📋 J-7 — Programme complet de ${EVENT_NAME}`,
    content: (artists) => {
      const artistList = artists && artists.length > 0
        ? artists.slice(0, 5).map(a => `• ${a.name}${a.discipline ? ` — ${a.discipline}` : ''}`).join('\n')
        : '• Programme à découvrir sur notre site';
      return `Bonjour,

Plus que 7 jours avant ${EVENT_NAME} !

🎭 NOS ARTISTES :
${artistList}

📋 AU PROGRAMME :
• Performances artistiques
• Expositions
• Ateliers créatifs
• Défilé de mode

📅 18 avril 2026 — Toute la journée
📍 Centre Sportif d'Élouges, Dour, Belgique
🎟️ Entrée gratuite

Consultez le programme complet : ${EVENT_URL}

On vous attend nombreux !
L'équipe ${EVENT_NAME}

---
${SEO_TEXT} → ${SEO_BACKLINK}`;
    },
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    console.log('Generating marketing calendar...');

    // Récupérer artistes approuvés
    const artists = await base44.asServiceRole.entities.Artist.filter(
      { status: 'approved' }, '-updated_date', 10
    );

    const artistsData = artists ? artists.map(a => ({
      name: a.name || a.stage_name || '',
      discipline: a.discipline || '',
      short_bio: a.short_bio || '',
    })) : [];

    const createdPosts = [];
    const createdNewsletters = [];
    const skipped = [];
    const daysLeft = daysUntil(EVENT_DATE);

    // Créer les posts du calendrier
    for (const tpl of CALENDAR_TEMPLATES) {
      // Skip si la date est déjà passée
      if (daysLeft < tpl.daysBefore - 1 && tpl.daysBefore !== 0) {
        skipped.push({ daysBefore: tpl.daysBefore, reason: 'date passée' });
        continue;
      }

      const scheduledAt = tpl.daysBefore === 0
        ? EVENT_DATE.toISOString()
        : scheduleDate(tpl.daysBefore);

      const contentText = typeof tpl.content === 'function'
        ? tpl.content(artistsData)
        : tpl.content;

      for (const platform of tpl.platforms) {
        const postData = {
          platform,
          post_type: tpl.post_type,
          title: tpl.title || '',
          content: contentText,
          hashtags: tpl.hashtags || '',
          link_url: EVENT_URL,
          scheduled_at: scheduledAt,
          status: 'DRAFT',
          created_by_user_id: user.id,
        };

        const created = await base44.asServiceRole.entities.SocialPostDraft.create(postData);
        createdPosts.push(created);
      }
    }

    // Créer les newsletters automatiques
    for (const tpl of NEWSLETTER_TEMPLATES) {
      if (daysLeft < tpl.daysBefore - 1) {
        continue;
      }
      const scheduledAt = scheduleDate(tpl.daysBefore);
      const contentText = typeof tpl.content === 'function'
        ? tpl.content(artistsData)
        : tpl.content;

      const newsletter = await base44.asServiceRole.entities.NewsletterCampaign.create({
        title: `[Auto] ${tpl.subject}`,
        subject: tpl.subject,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">${contentText.replace(/\n/g, '<br/>')}</div>`,
        text: contentText,
        scheduled_at: scheduledAt,
        status: 'DRAFT',
        created_by_user_id: user.id,
      });
      createdNewsletters.push(newsletter);
    }

    console.log(`Marketing calendar generated: ${createdPosts.length} posts, ${createdNewsletters.length} newsletters`);

    return Response.json({
      success: true,
      posts_created: createdPosts.length,
      newsletters_created: createdNewsletters.length,
      skipped: skipped.length,
      message: `${createdPosts.length} posts et ${createdNewsletters.length} newsletters créés`,
    });
  } catch (error) {
    console.error('Error in generateMarketingCalendar:', error.message, error.stack);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});