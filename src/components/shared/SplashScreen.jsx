import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Lien de streaming direct Google Drive (pas d'iframe, pas de bouton play)
const VIDEO_SRC = "https://drive.google.com/uc?export=download&id=1KJsOcAV_tOdlq1dx-P4W18o9gipgXSlj";

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);
  const videoRef = useRef(null);

  const handleSkip = () => {
    setVisible(false);
    setTimeout(onDone, 700);
  };

  useEffect(() => {
    // Auto-dismiss après 45 secondes max
    const timer = setTimeout(handleSkip, 45000);

    // Force autoplay dès que le composant est monté
    const video = videoRef.current;
    if (video) {
      video.muted = true; // muted obligatoire pour autoplay sans interaction
      video.play().then(() => {
        // Une fois lancée, on peut tenter d'activer le son
        video.muted = false;
      }).catch(() => {
        // Si autoplay bloqué, on reste muet mais la vidéo tourne
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
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
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            autoPlay
            playsInline
            muted
            onEnded={handleSkip}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Bouton passer */}
          <button
            onClick={handleSkip}
            style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 100000 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-sm font-medium transition-all backdrop-blur-sm border border-white/30"
          >
            <X className="w-4 h-4" /> Passer l'intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}