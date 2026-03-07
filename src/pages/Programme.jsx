import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import SocialShare from '@/components/shared/SocialShare';
import FreeBadge from '@/components/shared/FreeBadge';
import { Clock, MapPin, Sparkles, Palette, BookOpen, Mic, CalendarDays, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { value: 'all', label: 'Tout', icon: Sparkles },
  { value: 'performance', label: 'Performances', icon: Mic },
  { value: 'atelier', label: 'Ateliers', icon: Palette },
  { value: 'exposition', label: 'Expositions', icon: BookOpen },
  { value: 'conference', label: 'Conférences', icon: BookOpen },
];

const categoryColors = {
  performance: 'border-[#FF2D8A]/30 bg-[#FF2D8A]/5',
  atelier: 'border-[#D4AF37]/30 bg-[#D4AF37]/5',
  exposition: 'border-purple-500/30 bg-purple-500/5',
  conference: 'border-cyan-500/30 bg-cyan-500/5',
};

const categoryBadge = {
  performance: 'text-[#FF2D8A]',
  atelier: 'text-[#D4AF37]',
  exposition: 'text-purple-400',
  conference: 'text-cyan-400',
};

export default function Programme() {
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['program-events'],
    queryFn: () => base44.entities.ProgramEvent.list('start_time'),
  });

  const filtered = activeCategory === 'all' ? events : events.filter(e => e.category === activeCategory);

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <FreeBadge />
          <SocialShare title="Programme — Fashionist'ART" description="Découvrez le programme complet de Fashionist'ART — 18 avril 2026 — Centre Sportif d'Élouges (Dour)" />
        </div>

        <SectionTitle title="Programme" subtitle="18 avril 2026 — Centre Sportif d'Élouges (Dour), Belgique" />

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {CATEGORIES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === value
                  ? 'bg-[#FF2D8A] text-white shadow-lg shadow-[#FF2D8A]/30'
                  : 'glass-dark border border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#FF2D8A]/30 via-[#D4AF37]/20 to-transparent" />
          <div className="space-y-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="ml-14 md:ml-20 glass-dark rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 glass-dark neon-border rounded-3xl">
                <Sparkles className="w-12 h-12 text-[#FF2D8A]/30 mx-auto mb-4" />
                <p className="font-display font-semibold text-white/40 text-lg">Programme à venir</p>
              </div>
            ) : (
              filtered.map((event, i) => (
                <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="relative flex gap-4 md:gap-6">
                  <div className="relative z-10 flex-shrink-0 w-12 md:w-16 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-[#FF2D8A] ring-4 ring-[#FF2D8A]/10" />
                    <span className="mt-2 text-xs font-display font-bold text-[#FF2D8A]">{event.start_time}</span>
                    {event.end_time && <span className="text-[10px] text-white/30">{event.end_time}</span>}
                  </div>
                  <div className={`flex-1 glass-dark rounded-2xl p-5 border ${categoryColors[event.category] || 'border-white/10'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className={`text-[10px] uppercase tracking-widest font-display font-bold ${categoryBadge[event.category] || 'text-white/40'}`}>
                          {event.category}
                        </span>
                        <h3 className="font-display font-bold text-white mt-1">{event.title}</h3>
                        {event.location && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-white/40">
                            <MapPin className="w-3 h-3" /> {event.location}
                          </div>
                        )}
                        {event.description && <p className="mt-3 text-sm text-white/50 leading-relaxed">{event.description}</p>}
                      </div>
                      <SocialShare title={`${event.title} — Fashionist'ART`} description={`${event.title} à ${event.start_time} — Fashionist'ART — 18 avril 2026`} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}