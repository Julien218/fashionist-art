import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ae1c019dacc474a322f2b2/742499905_Capturedecran2026-02-26a175005.png";
const BG_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a460cb984c65f748b49e7d/ef497c4fd_artisteimageb.jpg";

// Convertir YouTube URL en embed URL
const getEmbedUrl = (url) => {
  if (!url) return null;
  
  // youtube.com/watch?v=...
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&fs=1&modestbranding=1`;
  }
  
  // Si c'est déjà un embed ou une URL directe, retourner tel quel
  return url;
};

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(() => {
    // Vérifier si c'est la première visite
    if (typeof window !== 'undefined') {
      const hasSeenIntro = localStorage.getItem('fashionistart_intro_seen');
      return !hasSeenIntro;
    }
    return true;
  });
  const [muted, setMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    base44.entities.HomePageConfig.list().then(items => {
      if (items?.[0]) setConfig(items[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDone = () => {
    // Marquer que l'intro a été vue
    localStorage.setItem('fashionistart_intro_seen', 'true');
    setVisible(false);
    setTimeout(onDone, 600);
  };

  useEffect(() => {
    if (loading) return;

    const duration = (config?.intro_duration_seconds || 12) * 1000;
    const timer = setTimeout(handleDone, Math.min(duration, 60000));

    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(() => {
        setVideoError(true);
      });
    }

    return () => clearTimeout(timer);
  }, [loading, config]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !muted;
      setMuted(!muted);
    }
  };

  // Ne pas afficher si config désactivée
  const shouldShow = !config || config.intro_enabled !== false;
  const videoUrl = config?.intro_video_url ? getEmbedUrl(config.intro_video_url) : null;
  const imageUrl = config?.intro_image_url;

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: '#000',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {/* === VIDÉO YOUTUBE/VIMEO EMBED === */}
          {videoUrl && videoUrl.includes('youtube.com/embed') ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <iframe
                width="100%"
                height="100%"
                src={videoUrl}
                title="Intro video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ objectFit: 'cover' }}
                onLoad={() => {
                  setTimeout(handleDone, (config?.intro_duration_seconds || 12) * 1000);
                }}
              />
            </div>
          ) : videoError ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                backgroundImage: `url("${imageUrl || BG_URL}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/70" />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 flex flex-col items-center gap-6 text-center px-8"
              >
                <img src={LOGO_URL} alt="Fashionist'ART" className="w-24 h-24 rounded-full object-cover ring-4 ring-[#FF2D8A]/50 shadow-2xl" />
                <div>
                  <div className="text-4xl md:text-6xl">
                    <span className="font-script text-[#FF2D8A]">Fashionist'</span>
                    <span className="font-display font-black text-white">ART</span>
                  </div>
                  <p className="text-white/60 font-display text-lg mt-2">18 avril 2026 · Dour, Belgique</p>
                  <p className="text-white/40 text-sm mt-1">Entrée gratuite</p>
                </div>
                <button
                  onClick={handleDone}
                  className="mt-4 px-8 py-3 rounded-full bg-[#FF2D8A] hover:bg-[#C2185B] text-white font-display font-bold text-sm transition-all shadow-lg"
                >
                  Entrer dans l'événement →
                </button>
              </motion.div>
            </div>
          ) : (
            /* === VIDÉO MP4 === */
            <video
              ref={videoRef}
              src={videoUrl}
              playsInline
              muted
              autoPlay
              loop={false}
              preload="auto"
              onEnded={handleDone}
              onError={() => setVideoError(true)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}

          {/* === BOUTON PASSER === */}
          <button
            onClick={handleDone}
            style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100000 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-sm font-medium transition-all backdrop-blur-sm border border-white/30"
          >
            <X className="w-4 h-4" /> Passer
          </button>

          {/* === BOUTON SON (masqué si YouTube ou fallback) === */}
          {!videoError && !videoUrl?.includes('youtube') && (
            <button
              onClick={toggleMute}
              style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 100000 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-sm font-medium transition-all backdrop-blur-sm border border-white/30"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {muted ? 'Activer le son' : 'Couper le son'}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}