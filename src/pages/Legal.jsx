import React from 'react';
import SectionTitle from '@/components/shared/SectionTitle';
import { motion } from 'framer-motion';

export default function Legal() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title="Mentions légales" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-dark neon-border rounded-3xl p-8 md:p-12 space-y-8 text-sm text-white/60 leading-relaxed">
          
          {[
            { title: "1. Éditeur du site", content: (<p><strong className="text-white">Nom de l'organisateur :</strong> <em>[À compléter]</em><br /><strong className="text-white">Forme juridique :</strong> <em>[À compléter]</em><br /><strong className="text-white">Adresse :</strong> <em>[À compléter]</em><br /><strong className="text-white">Numéro BCE :</strong> <em>[À compléter]</em><br /><strong className="text-white">Numéro TVA :</strong> <em>[À compléter]</em></p>) },
            { title: "2. Hébergement", content: <p>Ce site est hébergé par Base44. Les données sont stockées conformément aux normes européennes.</p> },
            { title: "3. Propriété intellectuelle", content: <p>L'ensemble du contenu (textes, images, logos, vidéos) est protégé par le droit d'auteur. Le nom <strong className="text-white">Fashionist'ART</strong> et l'identité visuelle sont des éléments protégés.</p> },
            { title: "4. Responsabilité", content: <p>L'organisateur s'efforce de fournir des informations exactes. Il décline toute responsabilité pour les erreurs ou omissions sur ce site.</p> },
            { title: "5. CGU", content: <p>En accédant à ce site, l'utilisateur accepte les présentes conditions. L'inscription à l'événement (18 avril 2026, Centre Sportif d'Élouges, Dour) est gratuite. L'organisateur se réserve le droit de modifier le programme.</p> },
            { title: "6. Droit applicable", content: <p>Les présentes mentions sont régies par le droit belge. Tout litige sera soumis aux tribunaux de <em>[À compléter]</em>, Belgique.</p> },
          ].map(({ title, content }) => (
            <section key={title}>
              <h3 className="font-display font-bold text-lg text-white mb-3">{title}</h3>
              {content}
            </section>
          ))}
        </motion.div>
      </div>
    </div>
  );
}