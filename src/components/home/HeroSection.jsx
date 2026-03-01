import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import Countdown from '../shared/Countdown';
import { CalendarPlus, ArrowRight, Facebook, Twitter, Linkedin, Link as LinkIcon, Check, Ticket, ChevronDown } from 'lucide-react';
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

  const socialLinks = [
    { icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${shareText}`, label: 'Facebook', color: '#1877F2' },
    { icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`, label: 'Twitter', color: '#1DA1F2' },
    { icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, label: 'LinkedIn', color: '#0A66C2' },
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

        {/* Logo image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ae1c019dacc474a322f2b2/742499905_Capturedecran2026-02-26a175005.png"
            alt="Fashionist'ART"
            className="w-40 h-40 md:w-48 md:h-48 rounded-2xl object-cover ring-2 ring-[#FF2D8A]/30 shadow-2xl shadow-[#FF2D8A]/20"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h1 className="leading-none mb-2">
            <span className="font-script text-[clamp(3rem,8vw,5.5rem)] text-[#FF2D8A] block" style={{fontWeight:700, fontStyle:'italic'}}>Fashionist'</span>
            <span className="font-display font-black text-[clamp(4.5rem,12vw,9rem)] text-white block" style={{letterSpacing:'-0.02em', lineHeight:0.9}}>ART</span>
          </h1>
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