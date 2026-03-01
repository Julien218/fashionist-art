import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import HeroSection from '@/components/home/HeroSection';
import ArtistPreview from '@/components/home/ArtistPreview';
import NewsletterForm from '@/components/shared/NewsletterForm';
import SectionTitle from '@/components/shared/SectionTitle';
import Countdown from '@/components/shared/Countdown';
import { motion } from 'framer-motion';
import { Palette, Shirt, Users, Zap } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Palette, title: 'Expositions artistiques', desc: "Découvrez des œuvres uniques mêlant art contemporain et inspiration mode." },
  { icon: Shirt, title: 'Défilés de mode', desc: "Des créateurs locaux et internationaux présentent leurs collections exclusives." },
  { icon: Users, title: 'Ateliers créatifs', desc: "Participez à des workshops interactifs animés par des artistes renommés." },
  { icon: Zap, title: 'Networking', desc: "Rencontrez des professionnels de la mode et de l'art dans un cadre unique." },
];

export default function Home() {
  return (
    <div>
      <HeroSection />

      {/* About section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <span className="text-[#FF2D8A] text-xs font-display font-semibold uppercase tracking-widest">À propos</span>
          </div>
          <SectionTitle
            title="Une expérience immersive"
            subtitle="Fashionist'ART est un événement unique qui célèbre la fusion entre la mode et l'art. Le 18 avril 2026 au Centre Sportif d'Élouges (Dour), plongez dans un univers créatif où performances, expositions et ateliers vous attendent."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-dark card-hover neon-border rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FF2D8A]/10 flex items-center justify-center mx-auto mb-4">
                  <h.icon className="w-6 h-6 text-[#FF2D8A]" />
                </div>
                <h3 className="font-display font-bold text-sm text-white mb-2">{h.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider max-w-4xl mx-auto" />

      {/* Countdown section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[#FF2D8A] text-xs font-display font-semibold uppercase tracking-widest block mb-4">Compte à rebours</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-8">L'événement commence dans</h2>
          <Countdown />
        </div>
      </section>

      <div className="divider max-w-4xl mx-auto" />

      {/* Artists preview */}
      <ArtistPreview />

      <div className="divider max-w-4xl mx-auto" />

      {/* Newsletter */}
      <section className="py-20 px-4">
        <div className="max-w-xl mx-auto">
          <SectionTitle
            title="Restez informé"
            subtitle="Inscrivez-vous à notre newsletter pour recevoir les dernières actualités et ne manquer aucune information sur Fashionist'ART."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-dark neon-border rounded-3xl p-8"
          >
            <NewsletterForm />
          </motion.div>
        </div>
      </section>
    </div>
  );
}