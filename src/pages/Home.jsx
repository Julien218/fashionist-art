import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import ArtistPreview from '@/components/home/ArtistPreview';
import NewsletterForm from '@/components/shared/NewsletterForm';
import SectionTitle from '@/components/shared/SectionTitle';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div>
      <HeroSection />
      
      <div className="section-divider" />

      <ArtistPreview />

      <div className="section-divider" />

      {/* Newsletter section */}
      <section className="py-20 px-4">
        <div className="max-w-xl mx-auto">
          <SectionTitle 
            title="Restez informé(e)" 
            subtitle="Recevez les dernières nouvelles de Fashionist'ART directement dans votre boîte mail"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass glow-card rounded-3xl p-8"
          >
            <NewsletterForm />
          </motion.div>
        </div>
      </section>
    </div>
  );
}