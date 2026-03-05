import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import { ExternalLink } from 'lucide-react';

export default function PartnersPage() {
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => base44.entities.Partner.filter({ status: 'approved' }, 'order', 100),
    initialData: [],
  });

  const groupedByCategory = partners.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const categoryLabels = {
    technique: 'Partenaires techniques',
    institutionnel: 'Partenaires institutionnels',
    sponsor: 'Sponsors',
    media: 'Partenaires média',
    artistique: 'Partenaires artistiques',
    autre: 'Autres partenaires',
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionTitle
          tag="PARTENAIRES"
          title="Nos partenaires"
          subtitle="Découvrez les organisations qui soutiennent Fashionist'ART"
          align="center"
        />

        {isLoading ? (
          <div className="text-center py-12 text-white/40">Chargement...</div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12 text-white/40">Aucun partenaire approuvé</div>
        ) : (
          <div className="mt-12 space-y-16">
            {Object.entries(groupedByCategory).map(([category, categoryPartners]) => (
              <div key={category}>
                <h2 className="font-display font-bold text-2xl text-white mb-8">
                  {categoryLabels[category] || category}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {categoryPartners.map((partner, idx) => (
                    <motion.a
                      key={partner.id}
                      href={partner.website || '#'}
                      target={partner.website ? '_blank' : undefined}
                      rel={partner.website ? 'noopener noreferrer' : undefined}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center min-h-64 hover:border-[#FF2D8A]/30 transition-all duration-300"
                    >
                      {partner.logo_file && (
                        <div className="h-24 mb-4 flex items-center justify-center">
                          <img
                            src={partner.logo_file}
                            alt={partner.name}
                            className="h-full object-contain max-w-[90%] group-hover:opacity-90 transition-opacity"
                          />
                        </div>
                      )}
                      <h3 className="font-display font-semibold text-white text-center mb-2">
                        {partner.name}
                      </h3>
                      {partner.short_description && (
                        <p className="text-xs text-white/60 text-center mb-4 line-clamp-3">
                          {partner.short_description}
                        </p>
                      )}
                      {partner.website && (
                        <span className="text-[#FF2D8A]/60 group-hover:text-[#FF2D8A] transition-colors flex items-center gap-1 text-xs mt-auto">
                          Visiter <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </motion.a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Branding Footer */}
        <div className="mt-20 pt-12 border-t border-white/10 text-center text-xs text-white/40">
          <p>
            Architecture &amp; réalisation : <span className="text-white/60">Js-Innov.IA</span>
          </p>
          <p className="mt-1">
            Design &amp; mise en page : <span className="text-white/60">JY-Trix.AI</span>
          </p>
        </div>
      </div>
    </div>
  );
}