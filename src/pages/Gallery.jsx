import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import { Play, X, ChevronLeft, ChevronRight, Camera, Film, Filter, Upload, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('all');
  const [lightbox, setLightbox] = useState(null);
  const [selectedEdition, setSelectedEdition] = useState('2025');

  const { data: media = [] } = useQuery({
    queryKey: ['gallery-media', selectedEdition],
    queryFn: () => base44.entities.GalleryMedia.filter(
      selectedEdition === 'all' ? {} : { edition: selectedEdition },
      'display_order'
    ),
  });

  const filtered = media.filter(m => {
    if (activeTab === 'all') return true;
    return m.type === activeTab;
  });

  const photos = filtered.filter(m => m.type === 'photo');
  const videos = filtered.filter(m => m.type === 'video');
  const displayList = activeTab === 'all' ? filtered : filtered;

  const openLightbox = (item, list) => setLightbox({ item, list });
  const closeLightbox = () => setLightbox(null);
  const navLightbox = (dir) => {
    if (!lightbox) return;
    const idx = lightbox.list.findIndex(i => i.id === lightbox.item.id);
    const next = lightbox.list[(idx + dir + lightbox.list.length) % lightbox.list.length];
    setLightbox({ item: next, list: lightbox.list });
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="Les Talents de l'Édition 2025"
          subtitle="Revivez les moments forts de la première édition Fashionist'ART"
        />

        {/* Tabs */}
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

        {/* Empty state */}
        {displayList.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-display">Galerie en cours de construction…</p>
            <p className="text-xs mt-2">Les médias seront disponibles prochainement.</p>
          </div>
        )}

        {/* Videos section */}
        {(activeTab === 'all' || activeTab === 'video') && videos.length > 0 && (
          <div className="mb-12">
            {activeTab === 'all' && (
              <h3 className="font-display font-bold text-white/70 text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                <Film className="w-4 h-4 text-[#FF2D8A]" /> Vidéos
              </h3>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-dark neon-border rounded-2xl overflow-hidden group cursor-pointer"
                  onClick={() => openLightbox(item, videos)}
                >
                  <div className="relative aspect-video bg-black/40">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF2D8A]/10 to-purple-900/20">
                        <Film className="w-10 h-10 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-[#FF2D8A]/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white ml-1" fill="white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-display font-semibold text-white text-sm truncate">{item.title}</p>
                    {item.artist_name && <p className="text-xs text-[#FF2D8A]/70 mt-0.5">{item.artist_name}</p>}
                    {item.category && <p className="text-xs text-white/30 mt-0.5">{item.category}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Photos section */}
        {(activeTab === 'all' || activeTab === 'photo') && photos.length > 0 && (
          <div>
            {activeTab === 'all' && (
              <h3 className="font-display font-bold text-white/70 text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D4AF37]" /> Photos
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

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-5 right-5 text-white/60 hover:text-white z-10 p-2">
              <X className="w-7 h-7" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); navLightbox(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10 p-3">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); navLightbox(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10 p-3">
              <ChevronRight className="w-8 h-8" />
            </button>

            <motion.div
              key={lightbox.item.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-5xl w-full mx-8"
              onClick={e => e.stopPropagation()}
            >
              {lightbox.item.type === 'video' ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden">
                  <iframe
                    src={lightbox.item.url}
                    className="w-full h-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={lightbox.item.title}
                  />
                </div>
              ) : (
                <img src={lightbox.item.url} alt={lightbox.item.title} className="max-h-[80vh] w-full object-contain rounded-2xl" />
              )}
              <div className="mt-4 text-center">
                <p className="font-display font-bold text-white">{lightbox.item.title}</p>
                {lightbox.item.artist_name && <p className="text-[#FF2D8A] text-sm mt-1">{lightbox.item.artist_name}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}