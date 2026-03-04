import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import SocialShare from '@/components/shared/SocialShare';
import FreeBadge from '@/components/shared/FreeBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Globe, Instagram, Facebook as FacebookIcon } from 'lucide-react';



export default function Artists() {
  const [selectedArtist, setSelectedArtist] = useState(null);

  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const all = await base44.entities.Artist.list('display_order');
      return all.filter(a => !a.status || a.status === 'active');
    },
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <FreeBadge />
          <SocialShare title="Artistes — Fashionist'ART" description="Découvrez les artistes de Fashionist'ART — 18 avril 2026 — Centre Sportif d'Élouges (Dour)" />
        </div>

        <SectionTitle title="Artistes" subtitle="Les talents qui façonnent Fashionist'ART" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-dark rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                </div>
              </div>
            ))
          ) : artists.length === 0 ? (
            <div className="col-span-full text-center py-16 glass-dark neon-border rounded-3xl">
              <User className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="font-display font-semibold text-white/40 text-lg">Artistes à venir</p>
            </div>
          ) : (
            artists.map((artist, i) => (
              <motion.div key={artist.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedArtist(artist)}
                className="glass-dark card-hover neon-border rounded-2xl overflow-hidden cursor-pointer group"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={artist.photo_url || PLACEHOLDER_PHOTOS[i % PLACEHOLDER_PHOTOS.length]}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[#FF2D8A] text-xs font-semibold uppercase tracking-wide">{artist.discipline}</p>
                  <h3 className="font-display font-bold text-white mt-1 group-hover:text-[#FF2D8A] transition-colors">{artist.name}</h3>
                  {artist.short_bio && <p className="text-xs text-white/40 mt-2 line-clamp-2">{artist.short_bio}</p>}
                  <div className="mt-3">
                    <SocialShare title={`${artist.name} — Fashionist'ART`} description={`Découvrez ${artist.name} (${artist.discipline}) à Fashionist'ART — 18 avril 2026`} />
                  </div>
                </div>
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
                    <img src={selectedArtist.photo_url || PLACEHOLDER_PHOTOS[0]} alt={selectedArtist.name} className="w-full h-full object-cover" />
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
                <div className="flex gap-3">
                  {selectedArtist.website && <a href={selectedArtist.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><Globe className="w-4 h-4 text-[#FF2D8A]" /></a>}
                  {selectedArtist.instagram && <a href={selectedArtist.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><Instagram className="w-4 h-4 text-[#FF2D8A]" /></a>}
                  {selectedArtist.facebook && <a href={selectedArtist.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><FacebookIcon className="w-4 h-4 text-[#FF2D8A]" /></a>}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}