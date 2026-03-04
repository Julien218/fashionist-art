import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Countdown from '../shared/Countdown';
import { CalendarPlus, ArrowRight, Facebook, Instagram, Link as LinkIcon, Check, Ticket, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function HeroSection() {
  const [copied, setCopied] = useState(false);

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Fashionist'ART")}&dates=20260418T080000Z/20260418T200000Z&details=${encodeURIComponent("Fashionist'ART — Exposition art & mode. Entrée gratuite.")}&location=${encodeURIComponent("Centre Sportif d'Élouges, Dour, Belgique")}`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = encodeURIComponent("Fashionist'ART – 18 avril 2026, Centre Sportif d'Élouges (Dour). Mode & Art. Entrée gratuite !");

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const TikTokIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
  );

  const socialLinks = [
    { icon: Facebook, href: `https://www.facebook.com/61575203516618/`, label: 'Facebook', color: '#1877F2' },
    { icon: Instagram, href: `https://www.instagram.com/fashionist.art.dour/`, label: 'Instagram', color: '#E1306C' },
    { icon: TikTokIcon, href: `https://www.tiktok.com/@user6921475292315?_r=1&_t=ZG-94Kw7dIEGcS`, label: 'TikTok', color: '#010101' },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0A0A0F]" />
        {/* Ambient glows */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#FF2D8A]/10 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-4 py-20">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-white/10 mb-8 text-sm text-white/70"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF2D8A] animate-pulse" />
          Événement gratuit • 18 avril 2026
        </motion.div>



        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-white/60 text-base md:text-lg mt-4 mb-6 font-display font-normal tracking-wide"
        >
          Quand la mode rencontre l'art
        </motion.p>

        {/* Event info pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-6 text-sm"
        >
          <span className="flex items-center gap-2 text-white/70">
            📅 18 avril 2026
          </span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span className="flex items-center gap-2 text-white/70">
            📍 Centre Sportif d'Élouges, Dour
          </span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span className="text-[#D4AF37] font-semibold">🎉 Entrée gratuite</span>
        </motion.div>

        {/* Social share */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <span className="text-white/40 text-sm">Partager :</span>
          {socialLinks.map(({ icon: Icon, href, label, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: color }}
            >
              <Icon className="w-4 h-4 text-white" />
            </a>
          ))}
          <button onClick={copyLink}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all hover:scale-110">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <LinkIcon className="w-4 h-4 text-white" />}
          </button>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to={createPageUrl('Billetterie')} className="btn-primary text-base px-8 py-4">
            <Ticket className="w-5 h-5" />
            Je m'inscris – C'est gratuit !
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to={createPageUrl('Programme')} className="btn-outline text-base px-8 py-4">
            Découvrir le programme
          </Link>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/30"
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
}