import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Logo from '../shared/Logo';
import FreeBadge from '../shared/FreeBadge';
import Countdown from '../shared/Countdown';
import SocialShare from '../shared/SocialShare';
import { CalendarPlus, MapPin, Calendar } from 'lucide-react';

export default function HeroSection() {
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Fashionist'ART")}&dates=20260418T080000Z/20260418T200000Z&details=${encodeURIComponent("Fashionist'ART — Exposition art & mode. Entrée gratuite.")}&location=${encodeURIComponent("Centre Sportif d'Élouges, Dour, Belgique")}`;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C2185B]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] opacity-[0.06]">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ae1c019dacc474a322f2b2/742499905_Capturedecran2026-02-26a175005.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <FreeBadge className="mb-6" />
          
          <div className="mb-6">
            <Logo size="xl" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[#2D2024]/60 font-body mb-8">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C2185B]" />
              18 avril 2026
            </span>
            <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C2185B]" />
              Centre Sportif d'Élouges (Dour), Belgique
            </span>
          </div>

          <p className="text-lg md:text-xl font-body text-[#2D2024]/50 max-w-2xl mx-auto mb-10">
            Quand la mode rencontre l'art contemporain — une expérience immersive unique
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-12"
        >
          <Countdown />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link to={createPageUrl('Billetterie')} className="btn-premium text-lg px-10 py-4">
            Je m'inscris
          </Link>
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold flex items-center gap-2 text-sm"
          >
            <CalendarPlus className="w-4 h-4" />
            Ajouter à mon agenda
          </a>
          <SocialShare title="Fashionist'ART" description="Fashionist'ART — 18 avril 2026 — Centre Sportif d'Élouges (Dour), Belgique. Entrée gratuite !" />
        </motion.div>
      </div>
    </section>
  );
}