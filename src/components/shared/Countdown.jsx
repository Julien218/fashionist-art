import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

  return (
    <div className="flex gap-3 sm:gap-5 justify-center">
      {blocks.map((b, i) => (
        <motion.div
          key={b.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="glass glow-card rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <span className="font-display font-bold text-2xl sm:text-3xl text-[#C2185B]">
              {pad(b.value)}
            </span>
          </div>
          <span className="mt-2 text-xs sm:text-sm font-body text-[#2D2024]/50 uppercase tracking-wider">
            {b.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}