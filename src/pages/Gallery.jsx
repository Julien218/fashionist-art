import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import SocialShare from '@/components/shared/SocialShare';
import FreeBadge from '@/components/shared/FreeBadge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, Film, FileText, Grid3X3, X } from 'lucide-react';

const FILTERS = [
  { value: 'all', label: 'Tout', icon: Grid3X3 },
  { value: 'photo', label: 'Photos', icon: Image },
  { value: 'video', label: 'Vidéos', icon: Film },
  { value: 'document', label: 'Documents', icon: FileText },
];

export default function Gallery() {
  const [filter, setFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['gallery-media'],
    queryFn: () => base44.entities.GalleryMedia.list('-created_date'),
  });

  const filtered = filter === 'all' ? media : media.filter(m => m.type === filter);

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <FreeBadge />
          <SocialShare title="Galerie — Fashionist'ART" description="Explorez la galerie de Fashionist'ART — 18 avril 2026 — Centre Sportif d'Élouges (Dour)" />
        </div>

        <SectionTitle title="Galerie" subtitle="Plongez dans l'univers visuel de Fashionist'ART" />

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {FILTERS.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={filter === value ? 'default' : 'outline'}
              onClick={() => setFilter(value)}
              className={`rounded-full gap-2 ${filter === value ? 'bg-[#C2185B] hover:bg-[#C2185B]/90 text-white' : 'border-[#E8A0B4]/40 hover:bg-[#F2C4CE]/20'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square glass rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl">
            <Image className="w-16 h-16 text-[#E8A0B4]/40 mx-auto mb-4" />
            <p className="font-display font-semibold text-[#2D2024]/40 text-lg">Galerie à venir</p>
            <p className="text-sm text-[#2D2024]/30 mt-2">Les médias seront bientôt disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedMedia(item)}
                  className="aspect-square glass glow-card rounded-2xl overflow-hidden cursor-pointer group relative"
                >
                  {item.type === 'photo' || item.type === 'video' ? (
                    <img
                      src={item.thumbnail_url || item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F2C4CE]/20 to-[#D4AF37]/10">
                      <FileText className="w-10 h-10 text-[#C2185B]/40" />
                      <p className="mt-2 text-xs text-[#2D2024]/50 px-3 text-center">{item.title}</p>
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                        <Film className="w-5 h-5 text-[#C2185B]" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Media Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="glass max-w-3xl p-0 overflow-hidden">
          {selectedMedia && (
            <div>
              {selectedMedia.type === 'video' ? (
                <video src={selectedMedia.url} controls className="w-full max-h-[70vh] bg-black" />
              ) : selectedMedia.type === 'photo' ? (
                <img src={selectedMedia.url} alt={selectedMedia.title} className="w-full max-h-[70vh] object-contain bg-black/5" />
              ) : (
                <div className="p-10 text-center">
                  <FileText className="w-16 h-16 text-[#C2185B]/40 mx-auto mb-4" />
                  <p className="font-display font-semibold">{selectedMedia.title}</p>
                  <a href={selectedMedia.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block btn-premium text-sm">
                    Télécharger
                  </a>
                </div>
              )}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-sm">{selectedMedia.title}</p>
                  {selectedMedia.date && <p className="text-xs text-[#2D2024]/40">{selectedMedia.date}</p>}
                </div>
                <SocialShare
                  title={`${selectedMedia.title} — Fashionist'ART`}
                  description={`${selectedMedia.title} — Fashionist'ART — 18 avril 2026`}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}