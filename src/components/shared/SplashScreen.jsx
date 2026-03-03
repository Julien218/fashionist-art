import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef(null);

  const handleSkip = () => {
    setVisible(false);
    setTimeout(onDone, 600);
  };

  // Auto-dismiss after 40 seconds (38s video + 2s buffer)
  useEffect(() => {
    const timer = setTimeout(handleSkip, 40000);
    return () => clearTimeout(timer);
  }, []);

  // Request fullscreen on mount
  useEffect(() => {
    const el = containerRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el && el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        >
          <iframe
            src="https://drive.google.com/file/d/1KJsOcAV_tOdlq1dx-P4W18o9gipgXSlj/preview?autoplay=1&controls=0"
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all backdrop-blur-sm border border-white/20"
          >
            <X className="w-4 h-4" /> Passer l'intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}