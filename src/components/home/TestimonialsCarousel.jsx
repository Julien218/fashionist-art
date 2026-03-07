import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, User } from 'lucide-react';

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => base44.entities.Testimonial.list('display_order'),
  });

  if (testimonials.length === 0) return null;

  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  };

  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % testimonials.length);
  };

  const t = testimonials[index];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[#FF2D8A] text-xs font-display font-semibold uppercase tracking-widest block mb-3">Témoignages</span>
          <h2 className="font-display font-black text-[clamp(1.4rem,3.5vw,2.5rem)] text-white tracking-tight uppercase">Ce qu'ils en disent</h2>
        </div>

        <div className="relative flex items-center gap-4">
          {/* Prev */}
          <button onClick={prev} className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-[#FF2D8A]/40 hover:bg-[#FF2D8A]/10 flex items-center justify-center transition-all">
            <ChevronLeft className="w-5 h-5 text-white/60" />
          </button>

          {/* Card */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={t.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="glass-dark neon-border rounded-3xl p-8 sm:p-10 text-center"
              >
                <Quote className="w-8 h-8 text-[#FF2D8A]/40 mx-auto mb-6" />
                <p className="text-white/80 text-lg leading-relaxed italic mb-8">"{t.text}"</p>
                <div className="flex items-center justify-center gap-3">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FF2D8A]/30" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#FF2D8A]/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#FF2D8A]/60" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-display font-bold text-white text-sm">{t.name}</p>
                    {t.role && <p className="text-[#FF2D8A] text-xs font-display">{t.role}</p>}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next */}
          <button onClick={next} className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-[#FF2D8A]/40 hover:bg-[#FF2D8A]/10 flex items-center justify-center transition-all">
            <ChevronRight className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Dots */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-[#FF2D8A] w-5' : 'bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}