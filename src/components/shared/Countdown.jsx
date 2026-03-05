import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, Share2, Facebook, Linkedin, Twitter } from 'lucide-react';
import { toast } from 'sonner';

const EVENT_DATE = new Date('2026-04-18T10:00:00+02:00');

function pad(n) { return String(n).padStart(2, '0'); }

export default function Countdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = Math.max(0, EVENT_DATE - now);
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const blocks = [
    { label: 'Jours', value: time.days },
    { label: 'Heures', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Secondes', value: time.seconds },
  ];

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Fashionist'ART – Mode & Art")}&dates=20260418T100000/20260418T220000&details=${encodeURIComponent("Événement mode & art au Centre Sportif d'Élouges (Dour). Entrée gratuite !")}&location=${encodeURIComponent("Centre Sportif d'Élouges, Rue du Stade, 7370 Dour, Belgique")}`;

  return (
    <div>
      <div className="flex gap-4 sm:gap-6 justify-center">
        {blocks.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center"
        >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,45,138,0.35), rgba(212,175,55,0.2))',
                border: '2px solid rgba(255,45,138,0.6)',
                boxShadow: '0 0 30px rgba(255,45,138,0.3), inset 0 0 20px rgba(255,45,138,0.08)'
              }}>
              <span className="font-display font-black text-4xl sm:text-5xl text-white"
                style={{ textShadow: '0 0 20px rgba(255,255,255,0.6)' }}>
                {pad(b.value)}
              </span>
            </div>
            <span className="mt-3 text-sm font-bold text-white/80 uppercase tracking-widest font-display">
              {b.label}
            </span>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-white/40 text-sm mt-4 mb-6">18 avril 2026 · Centre Sportif d'Élouges, Dour</p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href={googleCalUrl} target="_blank" rel="noopener noreferrer"
          className="btn-outline text-sm py-2.5 px-5">
          <CalendarPlus className="w-4 h-4" /> Ajouter à mon agenda
        </a>
        <button onClick={() => { navigator.clipboard.writeText('https://fashionistart.base44.app'); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #FF2D8A, #C2185B)', boxShadow: '0 4px 20px rgba(255,45,138,0.4)' }}>
          <Share2 className="w-4 h-4" /> Partager l'événement
        </button>
      </div>
    </div>
  );
}