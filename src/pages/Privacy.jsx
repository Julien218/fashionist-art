import React from 'react';
import SectionTitle from '@/components/shared/SectionTitle';
import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title="Politique de confidentialité & Cookies" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-dark neon-border rounded-3xl p-8 md:p-12 space-y-8 text-sm text-white/60 leading-relaxed">

          {[
            { title: "1. Responsable du traitement", content: <p><strong className="text-white">Nom :</strong> <em>[À compléter]</em><br /><strong className="text-white">Adresse :</strong> <em>[À compléter]</em><br /><strong className="text-white">E-mail :</strong> <em>[À compléter]</em></p> },
            { title: "2. Base légale et finalités", content: (<ul className="list-disc pl-5 space-y-2"><li><strong className="text-white">Consentement (Art. 6.1.a RGPD) :</strong> Inscription à l'événement, newsletter, formulaire de contact.</li><li><strong className="text-white">Intérêt légitime (Art. 6.1.f RGPD) :</strong> Amélioration de nos services.</li><li><strong className="text-white">Exécution d'un contrat (Art. 6.1.b RGPD) :</strong> Gestion de votre inscription.</li></ul>) },
            { title: "3. Données collectées", content: (<ul className="list-disc pl-5 space-y-2"><li><strong className="text-white">Billetterie :</strong> Nom, prénom, e-mail, consentements.</li><li><strong className="text-white">Newsletter :</strong> E-mail, date de consentement.</li><li><strong className="text-white">Contact :</strong> Nom, e-mail, message.</li></ul>) },
            { title: "4. Durée de conservation", content: (<ul className="list-disc pl-5 space-y-2"><li><strong className="text-white">Inscriptions :</strong> 1 an après l'événement (18 avril 2026).</li><li><strong className="text-white">Newsletter :</strong> Jusqu'au retrait du consentement.</li><li><strong className="text-white">Messages :</strong> 1 an après traitement.</li></ul>) },
            { title: "5. Vos droits (RGPD)", content: (<><p>Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, de portabilité et d'opposition. Pour les exercer : <em>[À compléter]</em></p><p className="mt-2">Réclamation possible auprès de l'<strong className="text-white">APD</strong> : <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" className="text-[#FF2D8A] underline">autoriteprotectiondonnees.be</a></p></>) },
            { title: "6. Cookies", content: (<p>Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement. Aucun cookie publicitaire ou de tracking tiers n'est utilisé. En cas d'ajout futur, un bandeau de consentement sera mis en place.</p>) },
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