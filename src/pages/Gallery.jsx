import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import SocialShare from '@/components/shared/SocialShare';
import FreeBadge from '@/components/shared/FreeBadge';
import { Image, Film, FileText, Grid3X3, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const FILTERS = [
  { value: 'all', label: 'Tout', icon: Grid3X3 },
  { value: 'photo', label: 'Photos', icon: Image },
  { value: 'video', label: 'Vidéos', icon: Film },
  { value: 'document', label: 'Documents', icon: FileText },
];

function Lightbox({ items, index, onClose, onPrev, onNext }) {
  const item = items[index];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm font-display">
        {index + 1} / {items.length}
      </div>

      {/* Prev */}
      {items.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Media */}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-5xl max-h-[85vh] mx-16 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'video' ? (
          <video src={item.url} controls autoPlay className="max-w-full max-h-[75vh] rounded-xl bg-black" />
        ) : item.type === 'photo' ? (
          <img
            src={item.url}
            alt={item.title}
            className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
          />
        ) : (
          <div className="p-12 text-center text-white glass-dark rounded-2xl border border-white/10">
            <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="font-display font-semibold mb-4">{item.title}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">Télécharger</a>
          </div>
        )}
        <p className="mt-4 text-white/70 text-sm font-display">{item.title}</p>
      </motion.div>

      {/* Next */}
      {items.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}
    </motion.div>
  );
}

export default function Gallery() {
  const [filter, setFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['gallery-media'],
    queryFn: () => base44.entities.GalleryMedia.list('-created_date'),
  });

  const filtered = filter === 'all' ? media : media.filter(m => m.type === filter);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = useCallback(() => setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length), [filtered.length]);
  const nextItem = useCallback(() => setLightboxIndex(i => (i + 1) % filtered.length), [filtered.length]);

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <FreeBadge />
          <SocialShare title="Galerie — Fashionist'ART" description="Explorez la galerie de Fashionist'ART — 18 avril 2026" />
        </div>

        <SectionTitle title="Galerie" subtitle="Plongez dans l'univers visuel de Fashionist'ART" />

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {FILTERS.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setFilter(value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === value
                  ? 'bg-[#FF2D8A] text-white shadow-lg shadow-[#FF2D8A]/30'
                  : 'glass-dark border border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square glass-dark rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass-dark neon-border rounded-3xl">
            <Image className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="font-display font-semibold text-white/40 text-lg">Galerie à venir</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  onClick={() => openLightbox(i)}
                  className="aspect-square glass-dark neon-border rounded-2xl overflow-hidden cursor-pointer group relative"
                >
                  {(item.type === 'photo' || item.type === 'video') ? (
                    <img
                      src={item.thumbnail_url || item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <FileText className="w-10 h-10 text-white/20" />
                      <p className="mt-2 text-xs text-white/30 px-3 text-center">{item.title}</p>
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                        <Film className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-medium truncate">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={filtered}
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevItem}
            onNext={nextItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}