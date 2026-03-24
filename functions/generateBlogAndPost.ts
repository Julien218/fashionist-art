import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { action, topic, category, artist_name, article_id, article_title, article_content } = body;

    // --- ACTION 1 : Générer un article de blog ---
    if (action === 'generateBlogArticle') {
      const prompt = `Tu es rédacteur pour Fashionist'ART, un événement mode et art à Dour (Belgique) le 18 avril 2026. Entrée gratuite.

Rédige un article de blog complet en français sur le sujet : "${topic || 'l\'événement Fashionist\'ART 2026'}".
Catégorie : ${category || 'actualites'}

Structure :
- Titre accrocheur
- Résumé court (2-3 phrases)
- Contenu en Markdown (500-800 mots)
- 3 à 5 tags pertinents

Termine par : "---\n*Plateforme propulsée par JS-Innov.IA*"

Réponds en JSON : { "title": "...", "excerpt": "...", "content": "...", "tags": ["..."] }`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            excerpt: { type: 'string' },
            content: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      const slug = result.title.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const post = await base44.asServiceRole.entities.BlogPost.create({
        title: result.title,
        slug,
        category: category || 'actualites',
        excerpt: result.excerpt,
        content: result.content,
        tags: result.tags || [],
        author_name: user.full_name || 'Fashionist\'ART',
        published: false,
        reading_time: Math.ceil((result.content || '').split(' ').length / 200),
      });

      return Response.json({ success: true, post });
    }

    // --- ACTION 2 : Générer un post Facebook ---
    if (action === 'generateFacebookPost') {
      const prompt = `Tu es community manager pour Fashionist'ART, événement mode et art à Dour (Belgique), 18 avril 2026. Entrée gratuite.

Rédige un post Facebook engageant en français${artist_name ? ` mettant en avant l'artiste : ${artist_name}` : ` sur le thème : ${topic || 'l\'événement'}`}.

Règles :
- Ton enthousiaste et bienveillant
- 150-250 mots
- Emojis appropriés
- 5-8 hashtags pertinents en fin de post
- Termine par : "Propulsé par JS-Innov.IA 🤖"

Réponds en JSON : { "content": "...", "hashtags": "..." }`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            hashtags: { type: 'string' }
          }
        }
      });

      const draft = await base44.asServiceRole.entities.SocialPostDraft.create({
        platform: 'facebook',
        post_type: artist_name ? 'artist' : 'event',
        content: result.content,
        hashtags: result.hashtags,
        status: 'DRAFT',
        created_by_user_id: user.id,
      });

      return Response.json({ success: true, draft });
    }

    // --- ACTION 3 : Transformer un article en post Facebook ---
    if (action === 'generatePostFromBlog') {
      if (!article_content) {
        return Response.json({ error: 'article_content requis' }, { status: 400 });
      }

      const prompt = `Tu es community manager pour Fashionist'ART.

Voici un article de blog :
Titre : ${article_title || ''}
Contenu : ${article_content.substring(0, 1500)}

Transforme cet article en post Facebook engageant en français.
- 150-200 mots maximum
- Emojis appropriés
- 5-8 hashtags pertinents
- Lien vers l'article si possible
- Termine par : "Propulsé par JS-Innov.IA 🤖"

Réponds en JSON : { "content": "...", "hashtags": "..." }`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            hashtags: { type: 'string' }
          }
        }
      });

      const draft = await base44.asServiceRole.entities.SocialPostDraft.create({
        platform: 'facebook',
        post_type: 'event',
        title: article_title ? `Post Facebook : ${article_title}` : undefined,
        content: result.content,
        hashtags: result.hashtags,
        status: 'DRAFT',
        created_by_user_id: user.id,
      });

      return Response.json({ success: true, draft });
    }

    return Response.json({ error: 'Action inconnue. Utilisez: generateBlogArticle, generateFacebookPost, generatePostFromBlog' }, { status: 400 });

  } catch (error) {
    console.error('generateBlogAndPost error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});