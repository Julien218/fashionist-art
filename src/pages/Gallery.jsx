import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import SocialShare from '@/components/shared/SocialShare';
import FreeBadge from '@/components/shared/FreeBadge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Image, Film, FileText, Grid3X3 } from 'lucide-react';

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
        <div className="flex items-center justify-between mb-8">
          <FreeBadge />
          <SocialShare title="Galerie — Fashionist'ART" description="Explorez la galerie de Fashionist'ART — 18 avril 2026" />
        </div>

        <SectionTitle title="Galerie" subtitle="Plongez dans l'univers visuel de Fashionist'ART" />

        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {FILTERS.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setFilter(value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === value ? 'bg-[#FF2D8A] text-white shadow-lg shadow-[#FF2D8A]/30' : 'glass-dark border border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square glass-dark rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass-dark neon-border rounded-3xl">
            <Image className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="font-display font-semibold text-white/40 text-lg">Galerie à venir</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedMedia(item)}
                  className="aspect-square glass-dark neon-border rounded-2xl overflow-hidden cursor-pointer group relative">
                  {(item.type === 'photo' || item.type === 'video') ? (
                    <img src={item.thumbnail_url || item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white/3">
                      <FileText className="w-10 h-10 text-white/20" />
                      <p className="mt-2 text-xs text-white/30 px-3 text-center">{item.title}</p>
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center"><Film className="w-5 h-5 text-white" /></div>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="bg-[#12121A] border border-white/10 max-w-3xl p-0 overflow-hidden">
          {selectedMedia && (
            <div>
              {selectedMedia.type === 'video' ? (
                <video src={selectedMedia.url} controls className="w-full max-h-[70vh] bg-black" />
              ) : selectedMedia.type === 'photo' ? (
                <img src={selectedMedia.url} alt={selectedMedia.title} className="w-full max-h-[70vh] object-contain bg-black/5" />
              ) : (
                <div className="p-10 text-center text-white">
                  <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="font-display font-semibold">{selectedMedia.title}</p>
                  <a href={selectedMedia.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block btn-primary text-sm">Télécharger</a>
                </div>
              )}
              <div className="p-4 flex items-center justify-between">
                <p className="font-display font-semibold text-sm text-white">{selectedMedia.title}</p>
                <SocialShare title={`${selectedMedia.title} — Fashionist'ART`} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}