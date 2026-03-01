import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import SectionTitle from '../shared/SectionTitle';
import { ArrowRight, User } from 'lucide-react';

export default function ArtistPreview() {
  const { data: artists = [] } = useQuery({
    queryKey: ['artists-preview'],
    queryFn: () => base44.entities.Artist.list('display_order', 6),
  });

  return (
    <section className="py-20 px-4">
      <SectionTitle title="Artistes à l'affiche" subtitle="Découvrez les talents qui feront vibrer Fashionist'ART" />
      
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {artists.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass glow-card rounded-2xl p-6 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F2C4CE] to-[#E8A0B4] mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <p className="font-display font-semibold text-[#2D2024]/40">À découvrir</p>
              <p className="text-xs text-[#2D2024]/30 mt-1">Bientôt annoncé</p>
            </motion.div>
          ))
        ) : (
          artists.map((artist, i) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass glow-card rounded-2xl p-6 text-center group cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-[#F2C4CE] to-[#E8A0B4]">
                {artist.photo_url ? (
                  <img src={artist.photo_url} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <p className="font-display font-semibold text-[#2D2024] group-hover:text-[#C2185B] transition-colors">{artist.name}</p>
              <p className="text-xs text-[#2D2024]/50 mt-1">{artist.discipline}</p>
            </motion.div>
          ))
        )}
      </div>

      <div className="text-center mt-10">
        <Link to={createPageUrl('Artists')} className="inline-flex items-center gap-2 text-[#C2185B] font-display font-semibold hover:gap-3 transition-all">
          Voir tous les artistes <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}