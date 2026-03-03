import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const VIDEO_ID = '1KJsOcAV_tOdlq1dx-P4W18o9gipgXSlj';
// Direct streaming link from Google Drive
const VIDEO_SRC = `https://drive.google.com/uc?export=download&id=${VIDEO_ID}`;

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);
  const videoRef = useRef(null);

  const handleSkip = () => {
    setVisible(false);
    setTimeout(onDone, 600);
  };

  // Auto-dismiss after 40 seconds
  useEffect(() => {
    const timer = setTimeout(handleSkip, 40000);
    return () => clearTimeout(timer);
  }, []);

  // Autoplay on mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, []);

  const handleEnded = () => {
    handleSkip();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        >
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            autoPlay
            playsInline
            muted={false}
            onEnded={handleEnded}
            className="w-full h-full object-cover"
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