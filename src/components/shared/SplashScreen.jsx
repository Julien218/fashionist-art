import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX } from 'lucide-react';

// URL de la vidéo d'intro hébergée sur Base44
const VIDEO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ae1c019dacc474a322f2b2/fashionistart_intro.mp4";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ae1c019dacc474a322f2b2/742499905_Capturedecran2026-02-26a175005.png";
const BG_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a460cb984c65f748b49e7d/ef497c4fd_artisteimageb.jpg";

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);
  const [muted, setMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const handleDone = () => {
    setVisible(false);
    setTimeout(onDone, 600);
  };

  useEffect(() => {
    // Auto-dismiss après 40 secondes max
    const timer = setTimeout(handleDone, 40000);

    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(() => {
        // Autoplay bloqué → fallback statique
        setVideoError(true);
      });
    }

    return () => clearTimeout(timer);
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !muted;
      setMuted(!muted);
    }
  };

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
          {/* === FALLBACK STATIQUE si vidéo en erreur === */}
          {videoError ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                backgroundImage: `url("${BG_URL}")`,
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
            /* === VIDÉO NORMALE === */
            <video
              ref={videoRef}
              src={VIDEO_URL}
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

          {/* === BOUTON SON (masqué en fallback) === */}
          {!videoError && (
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