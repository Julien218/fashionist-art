import { useEffect } from 'react';

const OG_IMAGE_MAIN = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a460cb984c65f748b49e7d/ef497c4fd_artisteimageb.jpg';
const OG_IMAGE_LOGO = 'https://media.base44.com/images/public/6a035427dca907aa03b71398/30db7f0e0_logoFashionistArtLogo.png';
const BASE_URL = 'https://fashionistart.base44.app';
const SITE_NAME = "Fashionist'ART – JS-Innov.IA & JY-TrixAI";
const AUTHOR = "JS-Innov.IA (Pagin Julien) & JY-TrixAI";
const VIDEO_EMBED = 'https://www.youtube.com/embed/Ti8_bJHM8VM';
const VIDEO_URL = 'https://youtu.be/Ti8_bJHM8VM?si=yJ3jtYRkaF1GoI3U';

const PAGE_META = {
  Home: {
    title: "Fashionist'ART – Festival Mode & Art – 18 avril 2026 | Dour, Belgique",
    description: "Fashionist'ART : une fusion unique entre mode et art le 18 avril 2026 au Centre Sportif d'Élouges à Dour, Belgique. Entrée GRATUITE. Performances, ateliers créatifs et expositions.",
    canonical: '/',
    keywords: "Fashionist'ART, festival mode art, Dour, Belgique, 2026, entrée gratuite, événement mode, Centre Sportif Élouges",
    type: 'website',
  },
  Programme: {
    title: "Programme complet – Fashionist'ART 2026 | Dour, Belgique",
    description: "Consultez le programme officiel de Fashionist'ART 2026 : performances artistiques, ateliers créatifs, expositions et conférences le 18 avril 2026 à Élouges (Dour, Belgique). Entrée gratuite.",
    canonical: '/Programme',
    keywords: "programme Fashionist'ART, agenda mode art, ateliers créatifs, performances 2026, Dour Belgique",
    type: 'website',
  },
  Artists: {
    title: "Artistes & Partenaires – Fashionist'ART 2026 | Dour",
    description: "Découvrez tous les artistes et créateurs de Fashionist'ART 2026 à Dour, Belgique. Mode, peinture, performance, sculpture et bien plus. Rejoignez l'expérience mode & art.",
    canonical: '/Artists',
    keywords: "artistes Fashionist'ART, créateurs mode art, artistes Dour Belgique, partenaires festival",
    type: 'website',
  },
  Gallery: {
    title: "Galerie Photos & Vidéos – Fashionist'ART 2026",
    description: "Explorez la galerie officielle de Fashionist'ART : photos, vidéos et coulisses de l'événement mode & art à Dour, Belgique. Revivez chaque instant.",
    canonical: '/Gallery',
    keywords: "galerie Fashionist'ART, photos mode art, vidéos événement, défilé Dour Belgique",
    type: 'website',
  },
  Infos: {
    title: "Infos pratiques – Fashionist'ART 2026 | Accès, Horaires, Parking",
    description: "Toutes les infos pratiques pour Fashionist'ART 2026 : accès, parking, horaires, accessibilité PMR. Centre Sportif d'Élouges, Dour, Belgique. Entrée entièrement gratuite le 18 avril 2026.",
    canonical: '/Infos',
    keywords: "accès Fashionist'ART, parking Dour, horaires festival, infos pratiques Élouges",
    type: 'website',
  },
  Billetterie: {
    title: "Réservation gratuite – Fashionist'ART 2026 | Places limitées",
    description: "Réservez gratuitement votre place pour Fashionist'ART le 18 avril 2026 à Dour, Belgique. Inscription en ligne rapide. Places limitées – ne manquez pas cet événement unique !",
    canonical: '/Billetterie',
    keywords: "réservation Fashionist'ART, billet gratuit, inscription mode art Dour, événement 18 avril 2026",
    type: 'website',
  },
  Blog: {
    title: "Blog – Actualités Fashionist'ART 2026 | Mode & Art",
    description: "Suivez les actualités, coulisses et tendances de Fashionist'ART 2026. Articles sur la mode, l'art, les artistes et l'événement de Dour, Belgique.",
    canonical: '/Blog',
    keywords: "blog Fashionist'ART, actualités mode art, coulisses festival, tendances 2026",
    type: 'website',
  },
  Histoire: {
    title: "Histoire de Fashionist'ART | Origines & Éditions passées",
    description: "Découvrez l'histoire et les origines de Fashionist'ART, le festival mode & art de Dour, Belgique. Retour sur les éditions passées et la vision du projet.",
    canonical: '/Histoire',
    keywords: "histoire Fashionist'ART, origines festival, éditions passées mode art Dour",
    type: 'website',
  },
  ArtistDetail: {
    title: "Artiste – Fashionist'ART 2026",
    description: "Découvrez le profil complet de cet artiste participant à Fashionist'ART 2026 à Dour, Belgique. Mode, art, performance et créativité.",
    canonical: '/ArtistDetail',
    keywords: "artiste Fashionist'ART, profil créateur, mode art Belgique",
    type: 'profile',
  },
  Partners: {
    title: "Partenaires & Sponsors – Fashionist'ART 2026",
    description: "Découvrez les partenaires et sponsors qui soutiennent Fashionist'ART 2026. Rejoignez l'aventure et participez à cet événement mode & art unique.",
    canonical: '/Partners',
    keywords: "partenaires Fashionist'ART, sponsors festival mode art, soutien événement Dour",
    type: 'website',
  },
  Legal: {
    title: "Mentions légales – Fashionist'ART | Développé par JS-Innov.IA & JY-TrixAI",
    description: "Mentions légales et conditions d'utilisation du site officiel Fashionist'ART. Site développé par JS-Innov.IA & JY-TrixAI.",
    canonical: '/Legal',
    keywords: "mentions légales Fashionist'ART, conditions utilisation",
    type: 'website',
  },
  Privacy: {
    title: "Politique de confidentialité – Fashionist'ART | RGPD",
    description: "Politique de confidentialité, gestion des cookies et conformité RGPD du site Fashionist'ART. Développé par JS-Innov.IA & JY-TrixAI.",
    canonical: '/Privacy',
    keywords: "confidentialité Fashionist'ART, RGPD, cookies, données personnelles",
    type: 'website',
  },
  Sitemap: {
    title: "Plan du site – Fashionist'ART 2026",
    description: "Plan du site officiel Fashionist'ART 2026. Retrouvez toutes les pages et sections du site.",
    canonical: '/Sitemap',
    keywords: "plan du site Fashionist'ART, navigation",
    type: 'website',
  },
};

export default function SEOHead({
  pageName,
  title: overrideTitle,
  description: overrideDescription,
  image: overrideImage,
  url: overrideUrl,
  keywords: overrideKeywords,
}) {
  const base = PAGE_META[pageName] || PAGE_META.Home;

  const title = overrideTitle || base.title;
  const description = overrideDescription || base.description;
  const image = overrideImage || OG_IMAGE_MAIN;
  const url = overrideUrl || (BASE_URL + base.canonical);
  const keywords = overrideKeywords || base.keywords || '';
  const type = base.type || 'website';

  useEffect(() => {
    document.title = title;
    document.documentElement.lang = 'fr';

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const match = selector.match(/\[([^=]+)="([^"]+)"\]/);
        if (match) el.setAttribute(match[1], match[2]);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // ── Standard Meta ──
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="keywords"]', 'content', keywords);
    setMeta('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMeta('meta[name="author"]', 'content', AUTHOR);
    setMeta('meta[name="creator"]', 'content', AUTHOR);
    setMeta('meta[name="publisher"]', 'content', "Fashionist'ART");
    setMeta('meta[name="theme-color"]', 'content', '#FF2D8A');
    setLink('canonical', url);

    // ── Open Graph ──
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:site_name"]', 'content', SITE_NAME);
    setMeta('meta[property="og:locale"]', 'content', 'fr_BE');
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:image:secure_url"]', 'content', image);
    setMeta('meta[property="og:image:width"]', 'content', '1200');
    setMeta('meta[property="og:image:height"]', 'content', '630');
    setMeta('meta[property="og:image:alt"]', 'content', `${title} – Fashionist'ART 2026`);
    setMeta('meta[property="og:image:type"]', 'content', 'image/jpeg');

    // ── Open Graph Vidéo (pour partage avec aperçu vidéo) ──
    setMeta('meta[property="og:video"]', 'content', VIDEO_EMBED);
    setMeta('meta[property="og:video:secure_url"]', 'content', VIDEO_EMBED);
    setMeta('meta[property="og:video:type"]', 'content', 'text/html');
    setMeta('meta[property="og:video:width"]', 'content', '1280');
    setMeta('meta[property="og:video:height"]', 'content', '720');

    // ── Référencement créateur caché (meta non-affichées) ──
    setMeta('meta[name="developer"]', 'content', 'JS-Innov.IA – Pagin Julien');
    setMeta('meta[name="designer"]', 'content', 'JY-TrixAI');
    setMeta('meta[name="contact"]', 'content', 'contact@fashionistart.be');
    setMeta('meta[name="application-name"]', 'content', "Fashionist'ART – Powered by JS-Innov.IA");
    setMeta('meta[name="generator"]', 'content', 'JS-Innov.IA SaaS Platform – Pagin Julien');

    // ── Twitter / X ──
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:site"]', 'content', '@fashionistart');
    setMeta('meta[name="twitter:creator"]', 'content', '@fashionistart');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', image);
    setMeta('meta[name="twitter:image:alt"]', 'content', `${title} – Fashionist'ART 2026`);
    setMeta('meta[name="twitter:player"]', 'content', VIDEO_EMBED);
    setMeta('meta[name="twitter:player:width"]', 'content', '1280');
    setMeta('meta[name="twitter:player:height"]', 'content', '720');

    // ── Géolocalisation ──
    setMeta('meta[name="geo.region"]', 'content', 'BE-WHT');
    setMeta('meta[name="geo.placename"]', 'content', 'Dour, Belgique');
    setMeta('meta[name="geo.position"]', 'content', '50.3926;3.7752');
    setMeta('meta[name="ICBM"]', 'content', '50.3926, 3.7752');

    // ── Apple / Mobile ──
    setLink('apple-touch-icon', OG_IMAGE_LOGO);

    // ── JSON-LD dynamique par page ──
    const ldId = 'dynamic-ld-json';
    let ldEl = document.getElementById(ldId);
    if (!ldEl) {
      ldEl = document.createElement('script');
      ldEl.id = ldId;
      ldEl.type = 'application/ld+json';
      document.head.appendChild(ldEl);
    }
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url,
      inLanguage: 'fr',
      image: {
        '@type': 'ImageObject',
        url: image,
        width: 1200,
        height: 630,
      },
      video: {
        '@type': 'VideoObject',
        name: `Fashionist'ART 2026 – Vidéo officielle`,
        description: `Découvrez Fashionist'ART 2026 — Mode & Art à Dour, Belgique. 18 avril 2026. Entrée gratuite.`,
        thumbnailUrl: image,
        contentUrl: VIDEO_URL,
        embedUrl: VIDEO_EMBED,
        uploadDate: '2026-01-01',
        publisher: { '@type': 'Organization', name: "Fashionist'ART" },
      },
      isPartOf: {
        '@type': 'WebSite',
        name: "Fashionist'ART",
        url: BASE_URL,
        author: [
          { '@type': 'Organization', name: 'JS-Innov.IA', url: 'https://js-innov.ia' },
          { '@type': 'Organization', name: 'JY-TrixAI' },
        ],
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE_URL + '/' },
          { '@type': 'ListItem', position: 2, name: pageName || 'Page', item: url },
        ],
      },
      creator: [
        {
          '@type': 'Person',
          name: 'Pagin Julien',
          jobTitle: 'Développeur Web & IA',
          worksFor: { '@type': 'Organization', name: 'JS-Innov.IA' },
          url: 'https://js-innov.ia',
          sameAs: ['https://js-innov.ia'],
        },
        { '@type': 'Organization', name: 'JS-Innov.IA', description: 'Développement web & SaaS IA', url: 'https://js-innov.ia' },
        { '@type': 'Organization', name: 'JY-TrixAI', description: 'Solutions IA innovantes' },
      ],
    };
    ldEl.textContent = JSON.stringify(ld);
  }, [title, description, image, url, keywords, pageName]);

  return null;
}