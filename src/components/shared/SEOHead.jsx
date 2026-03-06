import { useEffect } from 'react';

const PAGE_META = {
  Home: {
    title: "Fashionist'ART – Mode & Art – 18 avril 2026, Dour, Belgique",
    description: "Fashionist'ART : une fusion unique entre mode et art le 18 avril 2026 au Centre Sportif d'Élouges à Dour, Belgique. Entrée gratuite. Performances, ateliers et expositions.",
    canonical: '/',
  },
  Programme: {
    title: "Programme – Fashionist'ART 2026",
    description: "Découvrez le programme complet de Fashionist'ART : performances, ateliers créatifs, expositions et conférences le 18 avril 2026 à Élouges (Dour, Belgique).",
    canonical: '/programme',
  },
  Artists: {
    title: "Artistes & Partenaires – Fashionist'ART 2026",
    description: "Rencontrez les artistes et créateurs qui participent à Fashionist'ART le 18 avril 2026 à Dour. Mode, peinture, performance et bien plus.",
    canonical: '/artists',
  },
  Gallery: {
    title: "Galerie – Fashionist'ART 2026",
    description: "Explorez la galerie photo et vidéo de Fashionist'ART. Revivez les moments forts de l'événement mode et art à Dour, Belgique.",
    canonical: '/gallery',
  },
  Infos: {
    title: "Infos pratiques – Fashionist'ART 2026",
    description: "Toutes les infos pratiques pour Fashionist'ART : accès, parking, horaires, accessibilité. Centre Sportif d'Élouges, Dour, Belgique. Entrée gratuite le 18 avril 2026.",
    canonical: '/infos',
  },
  Billetterie: {
    title: "Réservation gratuite – Fashionist'ART 2026",
    description: "Inscrivez-vous gratuitement à Fashionist'ART le 18 avril 2026 à Dour. Places limitées, réservez dès maintenant !",
    canonical: '/billetterie',
  },
  Legal: {
    title: "Mentions légales – Fashionist'ART",
    description: "Mentions légales et conditions d'utilisation du site Fashionist'ART.",
    canonical: '/legal',
  },
  Privacy: {
    title: "Politique de confidentialité – Fashionist'ART",
    description: "Politique de confidentialité et gestion des cookies du site Fashionist'ART.",
    canonical: '/privacy',
  },
};

const BASE_URL = 'https://fashionistart.base44.app';
const OG_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ae1c019dacc474a322f2b2/742499905_Capturedecran2026-02-26a175005.png';

export default function SEOHead({ pageName, title: overrideTitle, description: overrideDescription, image: overrideImage, url: overrideUrl }) {
  const base = PAGE_META[pageName] || PAGE_META.Home;

  const title = overrideTitle || base.title;
  const description = overrideDescription || base.description;
  const image = overrideImage || OG_IMAGE;
  const url = overrideUrl || (BASE_URL + base.canonical);

  useEffect(() => {
    document.title = title;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.match(/\[([^=]+)="([^"]+)"\]/)?.slice(1) || [];
        if (attrName) el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
      el.setAttribute('href', href);
    };

    // Standard meta
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="robots"]', 'content', 'index, follow');
    setLink('canonical', url);

    // Open Graph
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[property="og:locale"]', 'content', 'fr_BE');
    setMeta('meta[property="og:site_name"]', 'content', "Fashionist'ART");

    // Twitter
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', image);

    // Lang
    document.documentElement.lang = 'fr';
  }, [title, description, image, url]);

  return null;
}