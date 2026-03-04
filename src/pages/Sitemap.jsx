import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const PAGES = [
  { label: 'Accueil', page: 'Home', desc: 'Page principale de Fashionist\'ART' },
  { label: 'Programme', page: 'Programme', desc: 'Programme des activités du 18 avril 2026' },
  { label: 'Artistes & Partenaires', page: 'Artists', desc: 'Les artistes et partenaires de l\'événement' },
  { label: 'Galerie', page: 'Gallery', desc: 'Photos et vidéos de Fashionist\'ART' },
  { label: 'Infos pratiques', page: 'Infos', desc: 'Accès, horaires, accessibilité' },
  { label: 'Billetterie', page: 'Billetterie', desc: 'Réservation gratuite en ligne' },
  { label: 'Mentions légales', page: 'Legal', desc: 'Informations légales' },
  { label: 'Politique de confidentialité', page: 'Privacy', desc: 'Gestion des données personnelles' },
];

// Also output XML sitemap content as a hidden element for crawlers
const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://fashionistart.base44.app/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://fashionistart.base44.app/programme</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://fashionistart.base44.app/artists</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://fashionistart.base44.app/gallery</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://fashionistart.base44.app/infos</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://fashionistart.base44.app/billetterie</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
</urlset>`;

export default function Sitemap() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-black text-3xl text-white mb-2">Plan du site</h1>
          <p className="text-white/40 text-sm mb-10">Fashionist'ART — 18 avril 2026, Dour, Belgique</p>

          <div className="space-y-3">
            {PAGES.map(({ label, page, desc }) => (
              <Link key={page} to={createPageUrl(page)}
                className="flex flex-col glass-dark neon-border rounded-xl px-5 py-4 hover:bg-white/5 transition-all group">
                <span className="font-display font-semibold text-white group-hover:text-[#FF2D8A] transition-colors">{label}</span>
                <span className="text-xs text-white/40 mt-0.5">{desc}</span>
              </Link>
            ))}
          </div>

          {/* XML sitemap pour copie/référence */}
          <details className="mt-10 glass-dark rounded-xl p-4 border border-white/10">
            <summary className="text-xs text-white/40 cursor-pointer select-none">Voir le sitemap XML</summary>
            <pre className="text-[10px] text-white/30 mt-3 whitespace-pre-wrap overflow-x-auto">{SITEMAP_XML}</pre>
          </details>
        </motion.div>
      </div>
    </div>
  );
}