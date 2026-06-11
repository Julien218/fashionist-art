import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ARTISTS_DATA } from '@/data/artists';
import { useQuery } from '@tanstack/react-query';

export default function ArtistPreview() {
  const trackRef = useRef(null);

  const { data: artists = [] } = useQuery({
    queryKey: ['artists-preview'],
    queryFn: () => ARTISTS_DATA,
  });

  const displayArtists = artists.length > 0 ? artists : Array.from({ length: 8 });
  // Duplicate for infinite loop effect
  const items = [...displayArtists, ...displayArtists];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animId;
    let pos = 0;
    const speed = 0.5; // px per frame
    const halfWidth = track.scrollWidth / 2;

    const animate = () => {
      pos += speed;
      if (pos >= halfWidth) pos = 0;
      track.style.transform = `translateX(-${pos}px)`;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const pause = () => cancelAnimationFrame(animId);
    const resume = () => { animId = requestAnimationFrame(animate); };

    track.addEventListener('mouseenter', pause);
    track.addEventListener('mouseleave', resume);

    return () => {
      cancelAnimationFrame(animId);
      track.removeEventListener('mouseenter', pause);
      track.removeEventListener('mouseleave', resume);
    };
  }, [displayArtists.length]);

  return (
    <section className="py-20 bg-[#1A0A1E] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#FF2D8A] text-xs font-display font-semibold uppercase tracking-widest block mb-2">Artistes</span>
            <h2 className="font-display font-black text-[clamp(1.5rem,3.5vw,2.6rem)] text-white leading-tight tracking-tight">
              LES TALENTS DE{' '}
              <span className="font-script text-[clamp(1.5rem,3.5vw,2.6rem)] text-[#FF2D8A]" style={{fontStyle:'italic'}}>L'ÉDITION 2026</span>
            </h2>
          </div>
          <Link to={createPageUrl('Artists')} className="px-4 py-1.5 rounded-full glass-dark border border-white/10 text-xs text-white/50 hover:text-white transition-colors">
            Voir tous
          </Link>
        </div>
      </div>

      {/* Scrolling track */}
      <div className="relative w-full" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
        <div ref={trackRef} className="flex gap-4 will-change-transform" style={{ width: 'max-content' }}>
          {items.map((artist, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden flex-shrink-0 group cursor-pointer"
              style={{ width: 160, background: 'rgba(80,20,60,0.5)', border: '1px solid rgba(255,45,138,0.1)' }}
            >
              <div className="overflow-hidden flex items-center justify-center bg-[#2D0A28]" style={{ height: 213 }}>
                {artist?.photo_url ? (
                  <img src={artist.photo_url} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <svg className="w-12 h-12 text-[#FF2D8A]/25" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-[#FF2D8A] text-[10px] font-display font-bold uppercase tracking-wide truncate">{artist?.discipline || 'Artiste'}</p>
                <h3 className="font-display font-bold text-xs text-white mt-0.5 truncate">{artist?.name || `Artiste ${(i % displayArtists.length) + 1}`}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}