import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import SocialShare from '@/components/shared/SocialShare';
import FreeBadge from '@/components/shared/FreeBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Globe, Instagram, Facebook as FacebookIcon, X, ExternalLink } from 'lucide-react';

export default function Artists() {
  const [selectedArtist, setSelectedArtist] = useState(null);

  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list('display_order'),
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
    principal: 'Partenaires principaux',
    officiel: 'Partenaires officiels',
    media: 'Partenaires médias',
    technique: 'Partenaires techniques',
    institutionnel: 'Partenaires institutionnels',
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <FreeBadge />
          <SocialShare title="Artistes — Fashionist'ART" description="Découvrez les artistes de Fashionist'ART — 18 avril 2026 — Centre Sportif d'Élouges (Dour)" />
        </div>

        <SectionTitle title="Artistes" subtitle="Les talents qui façonnent Fashionist'ART" />

        {/* Artists grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="w-24 h-24 rounded-full bg-[#E8A0B4]/20 mx-auto mb-4" />
                <div className="h-4 bg-[#E8A0B4]/20 rounded w-2/3 mx-auto mb-2" />
                <div className="h-3 bg-[#E8A0B4]/10 rounded w-1/2 mx-auto" />
              </div>
            ))
          ) : artists.length === 0 ? (
            <div className="col-span-full text-center py-16 glass rounded-3xl">
              <User className="w-16 h-16 text-[#E8A0B4]/40 mx-auto mb-4" />
              <p className="font-display font-semibold text-[#2D2024]/40 text-lg">Artistes à venir</p>
              <p className="text-sm text-[#2D2024]/30 mt-2">La programmation sera bientôt dévoilée</p>
            </div>
          ) : (
            artists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedArtist(artist)}
                className="glass glow-card rounded-2xl p-6 text-center cursor-pointer group"
              >
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-[#F2C4CE] to-[#E8A0B4] ring-2 ring-white/50">
                  {artist.photo_url ? (
                    <img src={artist.photo_url} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><User className="w-10 h-10 text-white" /></div>
                  )}
                </div>
                <h3 className="font-display font-bold text-[#2D2024] group-hover:text-[#C2185B] transition-colors">{artist.name}</h3>
                <p className="text-sm text-[#D4AF37] font-medium mt-1">{artist.discipline}</p>
                {artist.short_bio && <p className="text-xs text-[#2D2024]/50 mt-3 line-clamp-2">{artist.short_bio}</p>}
                <div className="mt-4 flex justify-center">
                  <SocialShare
                    title={`${artist.name} — Fashionist'ART`}
                    description={`Découvrez ${artist.name} (${artist.discipline}) à Fashionist'ART — 18 avril 2026 — Centre Sportif d'Élouges (Dour)`}
                  />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Partners */}
        <div className="section-divider mb-16" />
        <SectionTitle title="Partenaires & Sponsors" subtitle="Ils soutiennent Fashionist'ART" />

        {Object.keys(partnersByCategory).length === 0 ? (
          <div className="text-center py-12 glass rounded-3xl">
            <p className="font-display font-semibold text-[#2D2024]/40">Partenaires à venir</p>
          </div>
        ) : (
          Object.entries(partnersByCategory).map(([cat, items]) => (
            <div key={cat} className="mb-12">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-[#2D2024]/40 mb-6 text-center">
                {categoryLabels[cat] || cat}
              </h3>
              <div className="flex flex-wrap justify-center gap-6">
                {items.map((partner) => (
                  <a
                    key={partner.id}
                    href={partner.website || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass glow-card rounded-2xl p-6 flex flex-col items-center gap-3 min-w-[140px] max-w-[180px]"
                  >
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt={partner.name} className="h-12 w-auto object-contain" loading="lazy" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#F7E7CE]/40 flex items-center justify-center">
                        <span className="font-display font-bold text-[#D4AF37]">{partner.name[0]}</span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-[#2D2024]/60 text-center">{partner.name}</span>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Artist Detail Modal */}
      <Dialog open={!!selectedArtist} onOpenChange={() => setSelectedArtist(null)}>
        <DialogContent className="glass max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedArtist && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#F2C4CE] to-[#E8A0B4] flex-shrink-0">
                    {selectedArtist.photo_url ? (
                      <img src={selectedArtist.photo_url} alt={selectedArtist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-white" /></div>
                    )}
                  </div>
                  <div>
                    <DialogTitle className="font-display font-bold text-xl">{selectedArtist.name}</DialogTitle>
                    <p className="text-sm text-[#D4AF37] font-medium">{selectedArtist.discipline}</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                {selectedArtist.full_bio && <p className="text-sm text-[#2D2024]/70 leading-relaxed">{selectedArtist.full_bio}</p>}
                {!selectedArtist.full_bio && selectedArtist.short_bio && <p className="text-sm text-[#2D2024]/70 leading-relaxed">{selectedArtist.short_bio}</p>}
                
                <div className="flex gap-3">
                  {selectedArtist.website && (
                    <a href={selectedArtist.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:bg-[#C2185B]/10 transition-colors">
                      <Globe className="w-4 h-4 text-[#C2185B]" />
                    </a>
                  )}
                  {selectedArtist.instagram && (
                    <a href={selectedArtist.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:bg-[#C2185B]/10 transition-colors">
                      <Instagram className="w-4 h-4 text-[#C2185B]" />
                    </a>
                  )}
                  {selectedArtist.facebook && (
                    <a href={selectedArtist.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:bg-[#C2185B]/10 transition-colors">
                      <FacebookIcon className="w-4 h-4 text-[#C2185B]" />
                    </a>
                  )}
                </div>

                {selectedArtist.works && selectedArtist.works.length > 0 && (
                  <div>
                    <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-[#2D2024]/40 mb-3">Œuvres</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedArtist.works.map((work, i) => (
                        <div key={i} className="rounded-xl overflow-hidden bg-[#F2C4CE]/10">
                          {work.image_url && <img src={work.image_url} alt={work.title} className="w-full h-32 object-cover" loading="lazy" />}
                          <div className="p-2">
                            <p className="text-xs font-medium">{work.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}