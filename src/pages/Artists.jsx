import React, { useState, useEffect } from 'react';
import SEOHead from '@/components/shared/SEOHead';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import SocialShare from '@/components/shared/SocialShare';
import ArtistShare from '@/components/shared/ArtistShare';
import FreeBadge from '@/components/shared/FreeBadge';
import { useNavigate } from 'react-router-dom';
import { User, Globe, Instagram, Facebook as FacebookIcon, Search, X } from 'lucide-react';



const BASE_URL = 'https://fashionistart.base44.app';


export default function Artists() {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [dynamicMeta, setDynamicMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const all = await base44.entities.Artist.list('display_order');
      return all.filter(a => !a.status || a.status === 'active');
    },
  });

  const disciplines = [...new Set(artists.map(a => a.discipline).filter(Boolean))].sort();

  const filteredArtists = artists.filter(a => {
    const matchSearch = !search || [a.name, a.stage_name, a.discipline, a.short_bio].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'all' || a.discipline === activeFilter;
    return matchSearch && matchFilter;
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['partners'],
    queryFn: () => base44.entities.Partner.list('display_order'),
  });

  const partnersByCategory = partners.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const categoryLabels = {
    principal: 'Partenaires principaux', officiel: 'Partenaires officiels',
    media: 'Partenaires médias', technique: 'Partenaires techniques', institutionnel: 'Partenaires institutionnels',
  };

  return (
    <div className="py-12 px-4">
      <SEOHead pageName="Artists" {...(dynamicMeta || {})} />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <FreeBadge />
          <SocialShare title="Artistes — Fashionist'ART" description="Découvrez les artistes de Fashionist'ART — 18 avril 2026 — Centre Sportif d'Élouges (Dour)" />
        </div>

        <SectionTitle title="Artistes" subtitle="Les talents qui façonnent Fashionist'ART" />

        {/* Search + Filters */}
        {!isLoading && artists.length > 0 && (
          <div className="mb-8 space-y-4">
            {/* Search bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un artiste, une discipline…"
                className="w-full pl-11 pr-10 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#FF2D8A]/50 focus:bg-white/8 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-3.5 h-3.5 text-white/40" />
                </button>
              )}
            </div>

            {/* Category filters */}
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

            {/* Results count */}
            {(search || activeFilter !== 'all') && (
              <p className="text-center text-xs text-white/30">
                {filteredArtists.length} artiste{filteredArtists.length !== 1 ? 's' : ''} trouvé{filteredArtists.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-20">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-white/5">
                <div className="aspect-[3/4] bg-white/5" />
              </div>
            ))
          ) : artists.length === 0 ? (
            <div className="col-span-full text-center py-16 glass-dark neon-border rounded-3xl">
              <User className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="font-display font-semibold text-white/40 text-lg">Artistes à venir</p>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="col-span-full text-center py-16 glass-dark neon-border rounded-3xl">
              <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="font-display font-semibold text-white/40 text-lg">Aucun artiste trouvé</p>
              <button onClick={() => { setSearch(''); setActiveFilter('all'); }} className="mt-4 text-[#FF2D8A] text-sm underline">Réinitialiser les filtres</button>
            </div>
          ) : (
            filteredArtists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, scale: 1.03 }}
                onClick={() => {
          setSelectedArtist(artist);
          setDynamicMeta({
            title: `${artist.name} — ${artist.discipline} | Fashionist'ART 2026`,
            description: artist.short_bio || `${artist.name} participera à Fashionist'ART le 18 avril 2026 à Dour, Belgique. ${artist.discipline}. Entrée gratuite !`,
            image: artist.photo_url || undefined,
            url: `${BASE_URL}/artists?artist=${encodeURIComponent(artist.name)}`,
          });
        }}
                className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[3/4]"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
              >
                {/* Image */}
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

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Animated fuchsia shimmer on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-[#FF2D8A]/0 to-[#FF2D8A]/0 group-hover:from-[#FF2D8A]/10 group-hover:to-transparent transition-all duration-500"
                />

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <motion.div
                    initial={false}
                    className="overflow-hidden"
                  >
                    <p className="text-[#FF2D8A] text-[10px] font-bold uppercase tracking-widest leading-none mb-1 opacity-80">{artist.discipline}</p>
                    <h3 className="font-display font-bold text-white text-sm leading-tight">{artist.name}</h3>
                  </motion.div>
                </div>

                {/* Top neon border appear on hover */}
                <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-[#FF2D8A]/40 transition-all duration-400" />
              </motion.div>
            ))
          )}
        </div>

        {/* Partners */}
        <div className="divider mb-16" />
        <SectionTitle title="Partenaires & Sponsors" subtitle="Ils soutiennent Fashionist'ART" />
        {Object.keys(partnersByCategory).length === 0 ? (
          <div className="text-center py-12 glass-dark rounded-3xl"><p className="text-white/40">Partenaires à venir</p></div>
        ) : (
          Object.entries(partnersByCategory).map(([cat, items]) => (
            <div key={cat} className="mb-10">
              <h3 className="font-display font-semibold text-xs uppercase tracking-widest text-white/30 mb-6 text-center">{categoryLabels[cat] || cat}</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {items.map((partner) => (
                  <a key={partner.id} href={partner.website || '#'} target="_blank" rel="noopener noreferrer"
                    className="glass-dark card-hover neon-border rounded-2xl p-5 flex flex-col items-center gap-3 min-w-[130px]">
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt={partner.name} className="h-10 w-auto object-contain" loading="lazy" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#FF2D8A]/10 flex items-center justify-center">
                        <span className="font-display font-bold text-[#FF2D8A]">{partner.name[0]}</span>
                      </div>
                    )}
                    <span className="text-xs text-white/50 text-center">{partner.name}</span>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!selectedArtist} onOpenChange={() => setSelectedArtist(null)}>
        <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedArtist && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
                    {selectedArtist.photo_url
                    ? <img src={selectedArtist.photo_url} alt={selectedArtist.name} className="w-full h-full object-cover" />
                    : <User className="w-8 h-8 text-white/30 m-auto" />
                  }
                  </div>
                  <div>
                    <DialogTitle className="text-white font-display font-bold text-xl">{selectedArtist.name}</DialogTitle>
                    <p className="text-[#FF2D8A] text-sm">{selectedArtist.discipline}</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                {(selectedArtist.full_bio || selectedArtist.short_bio) && (
                  <p className="text-white/60 text-sm leading-relaxed">{selectedArtist.full_bio || selectedArtist.short_bio}</p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  {selectedArtist.website && <a href={selectedArtist.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><Globe className="w-4 h-4 text-[#FF2D8A]" /></a>}
                  {selectedArtist.instagram && <a href={selectedArtist.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><Instagram className="w-4 h-4 text-[#FF2D8A]" /></a>}
                  {selectedArtist.facebook && <a href={selectedArtist.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><FacebookIcon className="w-4 h-4 text-[#FF2D8A]" /></a>}
                  <div className="ml-auto">
                    <ArtistShare artist={selectedArtist} />
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}