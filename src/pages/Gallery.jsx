import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import { Play, X, ChevronLeft, ChevronRight, Camera, Film, Filter, Loader2 } from 'lucide-react';

const EDITIONS = [
  { key: '2026', label: 'Édition 2026', color: 'from-[#FF2D8A] to-[#ff6600]' },
  { key: '2025', label: 'Édition 2025', color: 'from-[#D4AF37] to-[#ff6600]' },
];

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('all');
  const [lightbox, setLightbox] = useState(null);
  const [selectedEdition, setSelectedEdition] = useState('2026');

  const { data: media = [] } = useQuery({
    queryKey: ['gallery-media', selectedEdition],
    queryFn: () => base44.entities.GalleryMedia.filter(
      { edition: selectedEdition },
      'display_order'
    ),
  });

  const filtered = media.filter(m => {
    if (activeTab === 'all') return true;
    return m.type === activeTab;
  });

  const photos = filtered.filter(m => m.type === 'photo');
  const videos = filtered.filter(m => m.type === 'video');

  const openLightbox = (item, list) => setLightbox({ item, list });
  const closeLightbox = () => setLightbox(null);
  const navLightbox = (dir) => {
    if (!lightbox) return;
    const idx = lightbox.list.findIndex(i => i.id === lightbox.item.id);
    const next = lightbox.list[(idx + dir + lightbox.list.length) % lightbox.list.length];
    setLightbox({ item: next, list: lightbox.list });
  };

  const currentEdition = EDITIONS.find(e => e.key === selectedEdition);

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <SectionTitle
          title="Médias & Galerie"
          subtitle="Revivez les moments forts de chaque édition Fashionist'ART"
        />

        {/* ====== SÉLECTEUR ÉDITION ====== */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {EDITIONS.map(ed => (
            <button
              key={ed.key}
              onClick={() => { setSelectedEdition(ed.key); setActiveTab('all'); }}
              className={`relative px-8 py-3 rounded-full font-display font-bold text-sm uppercase tracking-widest transition-all duration-300 ${
                selectedEdition === ed.key
                  ? `bg-gradient-to-r ${ed.color} text-white shadow-lg scale-105`
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30'
              }`}
            >
              {ed.label}
              {selectedEdition === ed.key && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>

        {/* ====== TABS TYPE ====== */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {[
            { key: 'all', label: 'Tout voir', icon: Filter },
            { key: 'photo', label: `Photos (${media.filter(m => m.type === 'photo').length})`, icon: Camera },
            { key: 'video', label: `Vidéos (${media.filter(m => m.type === 'video').length})`, icon: Film },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-display font-semibold transition-all border ${
                activeTab === key
                  ? 'bg-[#FF2D8A] border-[#FF2D8A] text-white shadow-lg shadow-[#FF2D8A]/30'
                  : 'border-white/10 text-white/60 hover:text-white hover:border-white/30 bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ====== EMPTY STATE ====== */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-display text-lg">Galerie {selectedEdition} en cours de construction…</p>
            <p className="text-xs mt-2">Les médias seront disponibles prochainement.</p>
          </div>
        )}

        {/* ====== VIDÉOS ====== */}
        {(activeTab === 'all' || activeTab === 'video') && videos.length > 0 && (
          <div className="mb-12">
            {activeTab === 'all' && (
              <h3 className="font-display font-bold text-white/70 text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                <Film className="w-4 h-4 text-[#FF2D8A]" /> Vidéos — {currentEdition?.label}
              </h3>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl overflow-hidden border border-white/10 hover:border-[#FF2D8A]/50 transition-all duration-300 bg-black/40 group"
                >
                  <div className="relative aspect-video">
                    <iframe
                      src={item.url}
                      title={item.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF2D8A]/20 flex items-center justify-center flex-shrink-0">
                      <Film className="w-4 h-4 text-[#FF2D8A]" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-white text-sm">{item.title}</p>
                      {item.category && <p className="text-xs text-white/40 mt-0.5">{item.category}</p>}
                    </div>
                    <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-[#FF2D8A]/20 text-[#FF2D8A]">
                      {item.edition}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ====== PHOTOS ====== */}
        {(activeTab === 'all' || activeTab === 'photo') && photos.length > 0 && (
          <div>
            {activeTab === 'all' && (
              <h3 className="font-display font-bold text-white/70 text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D4AF37]" /> Photos — {currentEdition?.label}
              </h3>
            )}
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {photos.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group relative"
                  onClick={() => openLightbox(item, photos)}
                >
                  <img src={item.url} alt={item.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div>
                      <p className="text-white text-xs font-display font-semibold truncate">{item.title}</p>
                      {item.artist_name && <p className="text-[#FF2D8A] text-[10px]">{item.artist_name}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ====== LIGHTBOX ====== */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={lightbox.item.url}
                alt={lightbox.item.title}
                className="max-h-[80vh] w-full object-contain rounded-2xl"
              />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-white">{lightbox.item.title}</p>
                  {lightbox.item.artist_name && (
                    <p className="text-[#FF2D8A] text-sm mt-1">{lightbox.item.artist_name}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navLightbox(-1)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => navLightbox(1)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
