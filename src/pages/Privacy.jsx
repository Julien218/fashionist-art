import React from 'react';
import SectionTitle from '@/components/shared/SectionTitle';
import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title="Politique de confidentialité & Cookies" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass glow-card rounded-3xl p-8 md:p-12 space-y-8 font-body text-sm text-[#2D2024]/70 leading-relaxed">

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">1. Responsable du traitement</h3>
            <p>
              <strong>Nom :</strong> <em>[À compléter]</em><br />
              <strong>Adresse :</strong> <em>[À compléter]</em><br />
              <strong>E-mail :</strong> <em>[À compléter]</em><br />
              <strong>Numéro BCE :</strong> <em>[À compléter]</em>
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">2. Base légale et finalités du traitement</h3>
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679), nous traitons vos données personnelles sur les bases suivantes :</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Consentement (Art. 6.1.a RGPD) :</strong> Inscription à l'événement, inscription à la newsletter, envoi de messages via le formulaire de contact.</li>
              <li><strong>Intérêt légitime (Art. 6.1.f RGPD) :</strong> Amélioration de nos services et statistiques anonymisées.</li>
              <li><strong>Exécution d'un contrat (Art. 6.1.b RGPD) :</strong> Gestion de votre inscription à l'événement Fashionist'ART.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">3. Données collectées</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Billetterie / Inscription :</strong> Nom, prénom, adresse e-mail, consentements.</li>
              <li><strong>Newsletter :</strong> Adresse e-mail, date de consentement.</li>
              <li><strong>Formulaire de contact :</strong> Nom, adresse e-mail, message.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">4. Durée de conservation</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Inscriptions à l'événement :</strong> Conservées pendant la durée nécessaire à l'organisation de l'événement, puis 1 an après l'événement (18 avril 2026) à des fins de suivi.</li>
              <li><strong>Newsletter :</strong> Jusqu'au retrait du consentement.</li>
              <li><strong>Messages de contact :</strong> 1 an après traitement de la demande.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">5. Vos droits</h3>
            <p>Conformément au RGPD et à la loi belge du 30 juillet 2018 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Droit d'accès :</strong> Obtenir la confirmation que vos données sont traitées et en recevoir une copie.</li>
              <li><strong>Droit de rectification :</strong> Corriger des données inexactes ou incomplètes.</li>
              <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données.</li>
              <li><strong>Droit à la limitation :</strong> Demander la restriction du traitement.</li>
              <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré.</li>
              <li><strong>Droit d'opposition :</strong> Vous opposer au traitement à tout moment.</li>
              <li><strong>Droit de retrait du consentement :</strong> Retirer votre consentement à tout moment.</li>
            </ul>
            <p className="mt-3">
              Pour exercer vos droits, contactez-nous à : <em>[À compléter]</em>
            </p>
            <p className="mt-2">
              Vous avez également le droit d'introduire une réclamation auprès de l'<strong>Autorité de protection des données (APD)</strong> : <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" className="text-[#C2185B] underline">www.autoriteprotectiondonnees.be</a>
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">6. Transferts de données</h3>
            <p>
              Vos données ne sont pas transférées en dehors de l'Espace Économique Européen (EEE), sauf si des garanties appropriées sont mises en place conformément au RGPD (clauses contractuelles types, décision d'adéquation).
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">7. Cookies</h3>
            <p>Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement du site :</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8A0B4]/30">
                    <th className="text-left py-2 pr-4 font-display font-semibold">Cookie</th>
                    <th className="text-left py-2 pr-4 font-display font-semibold">Finalité</th>
                    <th className="text-left py-2 font-display font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#E8A0B4]/10">
                    <td className="py-2 pr-4">Session</td>
                    <td className="py-2 pr-4">Authentification et session utilisateur</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Préférences</td>
                    <td className="py-2 pr-4">Mémorisation des préférences d'affichage</td>
                    <td className="py-2">1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Aucun cookie de tracking ou publicitaire n'est utilisé. En cas d'ajout futur de cookies de mesure d'audience, un bandeau de consentement sera mis en place conformément à la directive ePrivacy et au RGPD.
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">8. Sécurité</h3>
            <p>
              Nous mettons en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, destruction ou altération.
            </p>
          </section>

          <section>
            <h3 className="font-display font-bold text-lg text-[#2D2024] mb-3">9. Modification de la politique</h3>
            <p>
              Cette politique peut être modifiée à tout moment. La version en vigueur est celle publiée sur ce site. Dernière mise à jour : mars 2026.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  );
}