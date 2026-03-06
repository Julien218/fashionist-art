import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Globe, Instagram, Facebook as FacebookIcon } from 'lucide-react';
import ArtistShare from '@/components/shared/ArtistShare';
import SEOHead from '@/components/shared/SEOHead';
import SchemaOrgPerson from '@/components/shared/SchemaOrgPerson';
import { createPageUrl } from '@/utils';

export default function ArtistDetail() {
  const navigate = useNavigate();
  const [artistId, setArtistId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      navigate(createPageUrl('Artists'));
      return;
    }
    setArtistId(id);
  }, [navigate]);

  const { data: artist, isLoading, error } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => base44.entities.Artist.get(artistId),
    enabled: !!artistId,
  });

  const { data: works = [] } = useQuery({
    queryKey: ['artistWorks', artistId],
    queryFn: () => base44.entities.ArtistWork.filter({ artist_id: artistId }),
    enabled: !!artistId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!artist || error) {
    return (
      <div className="min-h-screen pt-20 px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/40">Artiste non trouvé</p>
          <button onClick={() => navigate(createPageUrl('Artists'))} className="mt-4 text-[#FF2D8A] underline">
            Retour aux artistes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <SEOHead pageName="Artists" title={`${artist.name} — ${artist.discipline} | Fashionist'ART 2026`} description={artist.short_bio || artist.full_bio || `${artist.name} participera à Fashionist'ART le 18 avril 2026 à Dour, Belgique. ${artist.discipline}. Entrée gratuite !`} image={artist.photo_url} />
      <SchemaOrgPerson person={artist} />
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(createPageUrl('Artists'))}
          className="flex items-center gap-2 text-[#FF2D8A] hover:text-[#FF6BB3] transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux artistes
        </motion.button>

        {/* Header with photo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {/* Photo */}
          <div className="md:col-span-1">
            <div className="sticky top-24 rounded-2xl overflow-hidden bg-white/5 aspect-[3/4] flex items-center justify-center">
              {artist.photo_url ? (
                <img src={artist.photo_url} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-[#FF2D8A]/20" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <p className="text-[#FF2D8A] text-xs font-bold uppercase tracking-widest mb-2">{artist.discipline}</p>
              <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-2">{artist.name}</h1>
              {artist.stage_name && artist.stage_name !== artist.name && (
                <p className="text-white/40 text-sm mb-6">Nom de scène: {artist.stage_name}</p>
              )}
              {(artist.full_bio || artist.short_bio) && (
                <p className="text-white/60 text-base leading-relaxed mb-6">{artist.full_bio || artist.short_bio}</p>
              )}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 flex-wrap">
              {artist.website && (
                <a href={artist.website} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <Globe className="w-5 h-5 text-[#FF2D8A]" />
                </a>
              )}
              {artist.instagram && (
                <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <Instagram className="w-5 h-5 text-[#FF2D8A]" />
                </a>
              )}
              {artist.facebook && (
                <a href={artist.facebook} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <FacebookIcon className="w-5 h-5 text-[#FF2D8A]" />
                </a>
              )}
              {artist.tiktok && (
                <a href={artist.tiktok} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-[#FF2D8A]">
                  TikTok
                </a>
              )}
              {artist.youtube && (
                <a href={artist.youtube} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-[#FF2D8A]">
                  YouTube
                </a>
              )}
              {artist.linkedin && (
                <a href={artist.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-[#FF2D8A]">
                  LinkedIn
                </a>
              )}
              <div className="ml-auto">
                <ArtistShare artist={artist} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Works gallery */}
        {works.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-display font-bold text-2xl text-white mb-6">Œuvres</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {works
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                .map((work, i) => (
                  <motion.div
                    key={work.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl overflow-hidden group"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/5">
                      <img src={work.image_url} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="mt-3">
                      <h3 className="font-semibold text-white">{work.title}</h3>
                      {work.description && <p className="text-white/40 text-sm mt-1">{work.description}</p>}
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}