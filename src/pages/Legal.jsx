import React from 'react';
import SectionTitle from '@/components/shared/SectionTitle';
import { motion } from 'framer-motion';

export default function Legal() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title="Mentions légales" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass glow-card rounded-3xl p-8 md:p-12 space-y-8 font-body text-sm text-[#2D2024]/70 leading-relaxed">
          
          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">1. Éditeur du site</h3>
            <p>
              <strong>Nom de l'organisateur :</strong> <em>[À compléter]</em><br />
              <strong>Forme juridique :</strong> <em>[À compléter — ex : ASBL, SRL, etc.]</em><br />
              <strong>Adresse du siège social :</strong> <em>[À compléter]</em><br />
              <strong>Numéro d'entreprise (BCE) :</strong> <em>[À compléter]</em><br />
              <strong>Numéro de TVA :</strong> <em>[À compléter]</em><br />
              <strong>E-mail de contact :</strong> <em>[À compléter]</em><br />
              <strong>Responsable de la publication :</strong> <em>[À compléter]</em>
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">2. Hébergement</h3>
            <p>
              Ce site est hébergé par Base44.<br />
              Les données sont stockées conformément aux normes européennes de protection des données.
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">3. Propriété intellectuelle</h3>
            <p>
              L'ensemble du contenu de ce site (textes, images, logos, vidéos, graphismes, mise en page) est protégé par le droit d'auteur et le droit de la propriété intellectuelle. Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, de ces éléments est interdite sans l'accord écrit préalable de l'organisateur.
            </p>
            <p className="mt-2">
              Le logo, le nom <strong>Fashionist'ART</strong> et l'identité visuelle associée sont des éléments protégés.
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">4. Responsabilité</h3>
            <p>
              L'organisateur s'efforce de fournir des informations exactes et à jour sur ce site. Toutefois, il ne peut garantir l'exactitude, la complétude ou l'actualité des informations diffusées. L'organisateur décline toute responsabilité pour les éventuelles erreurs ou omissions.
            </p>
            <p className="mt-2">
              L'organisateur ne saurait être tenu responsable des dommages directs ou indirects résultant de l'accès ou de l'utilisation de ce site, y compris l'inaccessibilité, les pertes de données, les dégradations ou les virus.
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">5. Liens hypertextes</h3>
            <p>
              Ce site peut contenir des liens vers d'autres sites Internet. L'organisateur n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">6. Conditions générales d'utilisation (CGU)</h3>
            <p>
              En accédant à ce site, l'utilisateur accepte les présentes conditions d'utilisation. L'organisateur se réserve le droit de modifier ces conditions à tout moment. L'utilisation continue du site après modification vaut acceptation des nouvelles conditions.
            </p>
            <p className="mt-2">
              L'inscription à l'événement Fashionist'ART (18 avril 2026, Centre Sportif d'Élouges, Dour, Belgique) est gratuite. L'organisateur se réserve le droit de modifier le programme, les horaires ou d'annuler l'événement en cas de force majeure.
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">7. Droit applicable</h3>
            <p>
              Les présentes mentions légales sont régies par le droit belge. Tout litige relatif à l'utilisation de ce site sera soumis à la compétence exclusive des tribunaux de <em>[À compléter — ex : Mons]</em>, Belgique.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  );
}