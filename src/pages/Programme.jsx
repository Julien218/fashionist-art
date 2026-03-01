import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import SocialShare from '@/components/shared/SocialShare';
import FreeBadge from '@/components/shared/FreeBadge';
import { Clock, MapPin, Filter, Sparkles, Palette, BookOpen, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { value: 'all', label: 'Tout', icon: Sparkles },
  { value: 'performance', label: 'Performances', icon: Mic },
  { value: 'atelier', label: 'Ateliers', icon: Palette },
  { value: 'exposition', label: 'Expositions', icon: BookOpen },
  { value: 'conference', label: 'Conférences', icon: BookOpen },
];

const categoryColors = {
  performance: 'from-[#C2185B]/20 to-[#E8A0B4]/20 border-[#C2185B]/20',
  atelier: 'from-[#D4AF37]/20 to-[#F7E7CE]/20 border-[#D4AF37]/20',
  exposition: 'from-[#6B4C9A]/20 to-[#B39DDB]/20 border-[#6B4C9A]/20',
  conference: 'from-[#00838F]/20 to-[#80DEEA]/20 border-[#00838F]/20',
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
        <div className="flex items-center justify-between mb-4">
          <FreeBadge />
          <SocialShare title="Programme — Fashionist'ART" description="Découvrez le programme complet de Fashionist'ART — 18 avril 2026 — Centre Sportif d'Élouges (Dour)" />
        </div>

        <SectionTitle 
          title="Programme" 
          subtitle="18 avril 2026 — Centre Sportif d'Élouges (Dour), Belgique"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {CATEGORIES.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={activeCategory === value ? 'default' : 'outline'}
              onClick={() => setActiveCategory(value)}
              className={`rounded-full gap-2 ${activeCategory === value ? 'bg-[#C2185B] hover:bg-[#C2185B]/90 text-white' : 'border-[#E8A0B4]/40 hover:bg-[#F2C4CE]/20'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#C2185B]/20 via-[#D4AF37]/20 to-transparent" />

          <AnimatePresence mode="wait">
            <div className="space-y-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="ml-14 md:ml-20 glass rounded-2xl p-6 animate-pulse">
                    <div className="h-4 bg-[#E8A0B4]/20 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-[#E8A0B4]/10 rounded w-2/3" />
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 glass rounded-3xl">
                  <Sparkles className="w-12 h-12 text-[#D4AF37]/40 mx-auto mb-4" />
                  <p className="font-display font-semibold text-[#2D2024]/40 text-lg">Programme à venir</p>
                  <p className="text-sm text-[#2D2024]/30 mt-2">Les activités seront bientôt annoncées</p>
                </div>
              ) : (
                filtered.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative flex gap-4 md:gap-6"
                  >
                    <div className="relative z-10 flex-shrink-0 w-12 md:w-16 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#C2185B] ring-4 ring-[#C2185B]/10" />
                      <span className="mt-2 text-xs font-display font-bold text-[#C2185B]">{event.start_time}</span>
                      {event.end_time && <span className="text-[10px] text-[#2D2024]/40">{event.end_time}</span>}
                    </div>

                    <div className={`flex-1 glass glow-card rounded-2xl p-5 md:p-6 border bg-gradient-to-br ${categoryColors[event.category] || ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className="inline-block text-[10px] uppercase tracking-wider font-display font-bold text-[#C2185B]/60 mb-1">
                            {event.category}
                          </span>
                          <h3 className="font-display font-bold text-lg text-[#2D2024]">{event.title}</h3>
                          {event.location && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-[#2D2024]/50">
                              <MapPin className="w-3 h-3" /> {event.location}
                            </div>
                          )}
                          {event.description && (
                            <p className="mt-3 text-sm text-[#2D2024]/60 font-body leading-relaxed">{event.description}</p>
                          )}
                        </div>
                        <SocialShare 
                          title={`${event.title} — Fashionist'ART`}
                          description={`${event.title} à ${event.start_time} — Fashionist'ART — 18 avril 2026 — Centre Sportif d'Élouges (Dour)`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}