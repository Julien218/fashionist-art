import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import SectionTitle from '../shared/SectionTitle';
import { ArrowRight, User } from 'lucide-react';

const PLACEHOLDER_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
];

export default function ArtistPreview() {
  const { data: artists = [] } = useQuery({
    queryKey: ['artists-preview'],
    queryFn: () => base44.entities.Artist.list('display_order', 4),
  });

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[#FF2D8A] text-xs font-display font-semibold uppercase tracking-widest block mb-2">Artistes</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white">Les talents de l'édition 2026</h2>
          </div>
          <Link to={createPageUrl('Artists')} className="hidden sm:inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
            Voir tous <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {(artists.length > 0 ? artists : Array.from({ length: 4 })).map((artist, i) => (
            <motion.div
              key={artist?.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-dark card-hover neon-border rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={artist?.photo_url || PLACEHOLDER_PHOTOS[i % PLACEHOLDER_PHOTOS.length]}
                  alt={artist?.name || `Artiste ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <p className="text-[#FF2D8A] text-xs font-semibold">{artist?.discipline || 'Mode & Design'}</p>
                <h3 className="font-display font-bold text-sm text-white mt-1">{artist?.name || `Artiste ${i + 1}`}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link to={createPageUrl('Artists')} className="inline-flex items-center gap-2 text-[#FF2D8A] font-semibold text-sm">
            Voir tous les artistes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}