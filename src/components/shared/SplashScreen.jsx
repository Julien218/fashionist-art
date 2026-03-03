import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Google Drive embed with autoplay
const IFRAME_SRC = "https://drive.google.com/file/d/1KJsOcAV_tOdlq1dx-P4W18o9gipgXSlj/preview";

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);

  const handleSkip = () => {
    setVisible(false);
    setTimeout(onDone, 700);
  };

  // Auto-dismiss after 40 seconds (full video 38s + buffer)
  useEffect(() => {
    const timer = setTimeout(handleSkip, 40000);
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100vw',
            height: '100vh',
          }}
        >
          <iframe
            src={IFRAME_SRC}
            style={{
              position: 'absolute',
              top: '-60px',
              left: '-60px',
              width: 'calc(100% + 120px)',
              height: 'calc(100% + 120px)',
              border: 'none',
            }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />

          {/* Skip button — toujours visible par-dessus l'iframe */}
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