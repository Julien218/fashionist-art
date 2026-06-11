import React, { useState } from 'react';
import SEOHead from '@/components/shared/SEOHead';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import SocialShare from '@/components/shared/SocialShare';
import FreeBadge from '@/components/shared/FreeBadge';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User, Search, X, Globe, Instagram, Facebook as FacebookIcon } from 'lucide-react';
import { ARTISTS_DATA } from '@/data/artists';

export default function Artists() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const artists = ARTISTS_DATA;
  const disciplines = [...new Set(artists.map(a => a.discipline).filter(Boolean))].sort();

  const filteredArtists = artists.filter(a => {
    const matchSearch = !search || [a.name, a.stage_name, a.discipline, a.short_bio].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'all' || a.discipline === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="py-12 px-4">
      <SEOHead pageName="Artists" />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <FreeBadge />
          <SocialShare title="Artistes — Fashionist'ART" description="Découvrez les artistes de Fashionist'ART — 18 avril 2026 — Centre Sportif d'Élouges (Dour)" />
        </div>

        <SectionTitle title="Artistes" subtitle="Les talents qui façonnent Fashionist'ART" />

        {/* Search + Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un artiste, une discipline…"
              className="w-full pl-11 pr-10 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#FF2D8A]/50 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-3.5 h-3.5 text-white/40" />
              </button>
            )}
          </div>

          {disciplines.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold font-display transition-all ${
                  activeFilter === 'all'
                    ? 'bg-[#FF2D8A] text-white shadow-lg shadow-[#FF2D8A]/30'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:text-white hover:border-white/25'
                }`}
              >
                Tous ({artists.length})
              </button>
              {disciplines.map(d => {
                const count = artists.filter(a => a.discipline === d).length;
                return (
                  <button
                    key={d}
                    onClick={() => setActiveFilter(d)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold font-display transition-all ${
                      activeFilter === d
                        ? 'bg-[#FF2D8A] text-white shadow-lg shadow-[#FF2D8A]/30'
                        : 'bg-white/5 text-white/50 border border-white/10 hover:text-white hover:border-white/25'
                    }`}
                  >
                    {d} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {(search || activeFilter !== 'all') && (
            <p className="text-center text-xs text-white/30">
              {filteredArtists.length} artiste{filteredArtists.length !== 1 ? 's' : ''} trouvé{filteredArtists.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Grid */}
        {filteredArtists.length === 0 ? (
          <div className="col-span-full text-center py-16 glass-dark neon-border rounded-3xl">
            <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="font-display font-semibold text-white/40 text-lg">Aucun artiste trouvé</p>
            <button onClick={() => { setSearch(''); setActiveFilter('all'); }} className="mt-4 text-[#FF2D8A] text-sm underline">Réinitialiser</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-20">
            {filteredArtists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, scale: 1.03 }}
                onClick={() => navigate(createPageUrl('ArtistDetail') + `?id=${artist.id}`)}
                className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[3/4]"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
              >
                {artist.photo_url ? (
                  <img
                    src={artist.photo_url}
                    alt={artist.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D8A]/20 to-[#9B26AF]/20 flex items-center justify-center">
                    <User className="w-12 h-12 text-[#FF2D8A]/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-[#FF2D8A] text-[10px] font-bold uppercase tracking-widest leading-none mb-1 opacity-80">{artist.discipline}</p>
                  <h3 className="font-display font-bold text-white text-sm leading-tight">{artist.name}</h3>
                </div>
                <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-[#FF2D8A]/40 transition-all duration-400" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Social links sous la grille */}
        <div className="text-center py-8">
          <p className="text-white/30 text-sm">
            {artists.length} artistes • Fashionist'ART 2026 • Centre Sportif d'Élouges, Dour
          </p>
        </div>
      </div>
    </div>
  );
}
