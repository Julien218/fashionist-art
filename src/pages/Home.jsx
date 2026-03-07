import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import HeroSection from '@/components/home/HeroSection';
import ArtistPreview from '@/components/home/ArtistPreview';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import NewsletterForm from '@/components/shared/NewsletterForm';
import SectionTitle from '@/components/shared/SectionTitle';
import Countdown from '@/components/shared/Countdown';
import SchemaOrgEvent from '@/components/shared/SchemaOrgEvent';
import SchemaOrgOrganization from '@/components/shared/SchemaOrgOrganization';
import { motion } from 'framer-motion';
import { Palette, Shirt, Users, Zap, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const HIGHLIGHTS = [
  { icon: Palette, title: 'Expositions artistiques', desc: "Découvrez des œuvres uniques mêlant art contemporain et inspiration mode." },
  { icon: Shirt, title: 'Défilés de mode', desc: "Des créateurs locaux et internationaux présentent leurs collections exclusives." },
  { icon: Users, title: 'Ateliers créatifs', desc: "Participez à des workshops interactifs animés par des artistes renommés." },
  { icon: Zap, title: 'Networking', desc: "Rencontrez des professionnels de la mode et de l'art dans un cadre unique." },
];

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    base44.auth.me().then(u => { if (u && ['super_admin', 'admin'].includes(u.role)) setIsAdmin(true); }).catch(() => {});
  }, []);

  return (
    <div>
      <SchemaOrgEvent event={{
        name: "Fashionist'ART 2026",
        description: "Une fusion unique entre mode et art au Centre Sportif d'Élouges (Dour). Entrée gratuite !",
        startDate: "2026-04-18T10:00:00+02:00",
        endDate: "2026-04-18T22:00:00+02:00",
        locationName: "Centre Sportif d'Élouges",
        streetAddress: "Rue du Stade",
        city: "Élouges",
        postalCode: "7370",
        region: "Hainaut",
        country: "BE",
        price: "0",
        currency: "EUR"
      }} />
      <SchemaOrgOrganization />
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link to={createPageUrl('Admin')} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#D4AF37]/90 hover:bg-[#D4AF37] text-black font-display font-bold text-sm shadow-lg transition-all hover:scale-105">
            <Shield className="w-4 h-4" /> Admin
          </Link>
        </div>
      )}
      <HeroSection />

      {/* Countdown section */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[#FF2D8A] text-xs font-display font-semibold uppercase tracking-widest block mb-4">Compte à rebours</span>
          <h2 className="font-display font-black text-[clamp(1.4rem,3.5vw,2.5rem)] text-white mb-2 tracking-tight uppercase">L'événement commence dans</h2>
          <p className="text-white/40 text-sm mb-10">18 avril 2026 · Centre Sportif d'Élouges, Dour</p>
          <Countdown />
        </div>
      </section>

      <div className="divider max-w-4xl mx-auto" />

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

      {/* Artists preview */}
      <ArtistPreview />

      <div className="divider max-w-4xl mx-auto" />

      {/* Testimonials */}
      <TestimonialsCarousel />

      <div className="divider max-w-4xl mx-auto" />

      {/* Newsletter */}
      <section className="py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF2D8A, #C2185B)' }}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </motion.div>
          <h2 className="font-display font-black text-[clamp(1.6rem,3vw,2.2rem)] text-white mb-3 tracking-tight">Restez informé</h2>
          <p className="text-white/50 mb-10">Inscrivez-vous à notre newsletter pour recevoir les dernières actualités et ne manquer aucune information sur Fashionist'ART.</p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-dark neon-border rounded-2xl p-8"
          >
            <NewsletterForm />
          </motion.div>
        </div>
      </section>
    </div>
  );
}