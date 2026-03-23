import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ae1c019dacc474a322f2b2/742499905_Capturedecran2026-02-26a175005.png";
const BG_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a460cb984c65f748b49e7d/ef497c4fd_artisteimageb.jpg";

// URL par défaut hardcodée (vidéo intro officielle)
const DEFAULT_INTRO_EMBED = "https://www.youtube-nocookie.com/embed/Ti8_bJHM8VM?si=dGJBhskALwNHsXtK&start=1&autoplay=1&mute=1&controls=1&modestbranding=1&playsinline=1&rel=0";

// Détermine si une URL est un embed iframe (YouTube/Vimeo) ou un fichier vidéo direct
const getVideoInfo = (url) => {
  if (!url) return { type: 'none', src: null };

  // Déjà un embed YouTube
  const embedMatch = url.match(/youtube(?:-nocookie)?\.com\/embed\/([^?&]+)/);
  if (embedMatch) {
    const base = url.split('?')[0];
    return { type: 'youtube', src: `${base}?autoplay=1&mute=1&controls=1&modestbranding=1&playsinline=1&rel=0` };
  }

  // youtube.com/watch ou youtu.be
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (youtubeMatch) {
    return { type: 'youtube', src: `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1&controls=1&modestbranding=1&playsinline=1&rel=0` };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=0` };
  }

  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return { type: 'iframe', src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
  }

  // Fichier vidéo direct (mp4, webm, etc.)
  return { type: 'video', src: url };
};

// Compat : conservé pour éviter d'autres refs éventuelles
const getEmbedUrl = (url) => getVideoInfo(url).src;

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);
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
  const rawVideoUrl = config?.intro_video_url || DEFAULT_INTRO_EMBED;
  const videoInfo = getVideoInfo(rawVideoUrl);
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
          {/* === VIDÉO EMBED (YouTube / Vimeo / Drive) === */}
          {(videoInfo.type === 'youtube' || videoInfo.type === 'iframe') && !videoError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <iframe
                width="100%"
                height="100%"
                src={videoInfo.src}
                title="Intro video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onError={() => setVideoError(true)}
                style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
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
            /* === VIDÉO MP4 directe === */
            <video
              ref={videoRef}
              src={videoInfo.src}
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

          {/* === BOUTON SON (masqué si YouTube/iframe ou fallback) === */}
          {!videoError && videoInfo.type === 'video' && (
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