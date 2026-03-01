import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const PLACEHOLDER_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
];

export default function ArtistPreview() {
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 6;

  const { data: artists = [] } = useQuery({
    queryKey: ['artists-preview'],
    queryFn: () => base44.entities.Artist.list('display_order'),
  });

  const displayArtists = artists.length > 0 ? artists : Array.from({ length: 6 });
  const totalPages = Math.ceil(displayArtists.length / ITEMS_PER_PAGE);
  const visible = displayArtists.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <section className="py-20 px-4 bg-[#1A0A1E]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[#FF2D8A] text-xs font-display font-semibold uppercase tracking-widest block mb-2">Artistes</span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-white leading-tight">
              LES TALENTS DE{' '}
              <span className="font-script text-3xl md:text-5xl text-[#FF2D8A] italic">L'ÉDITION 2026</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="w-8 h-8 rounded-full glass-dark border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="w-8 h-8 rounded-full glass-dark border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <Link to={createPageUrl('Artists')} className="ml-2 px-4 py-1.5 rounded-full glass-dark border border-white/10 text-xs text-white/50 hover:text-white transition-colors">
              Voir tous
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {visible.map((artist, i) => (
            <motion.div key={artist?.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl overflow-hidden cursor-pointer group"
              style={{ background: 'rgba(80,20,60,0.5)', border: '1px solid rgba(255,45,138,0.1)' }}
            >
              <div className="aspect-[3/4] overflow-hidden flex items-center justify-center bg-[#2D0A28]">
                {artist?.photo_url ? (
                  <img src={artist.photo_url} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <svg className="w-12 h-12 text-[#FF2D8A]/25" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-[#FF2D8A] text-[10px] font-display font-bold uppercase tracking-wide">{artist?.discipline || 'Peintre'}</p>
                <h3 className="font-display font-bold text-xs text-white mt-0.5 truncate">{artist?.name || `Artiste ${i + 1}`}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}