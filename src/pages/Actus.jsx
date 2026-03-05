import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';

export default function ActusPage() {
  const { data: news, isLoading } = useQuery({
    queryKey: ['siteNews'],
    queryFn: () => base44.entities.SiteNews.list('-published_at', 50),
    initialData: [],
  });

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionTitle tag="ACTUALITÉS" title="Dernières nouvelles" align="center" />

        <div className="mt-12 space-y-6">
          {isLoading ? (
            <div className="text-center text-white/40 py-12">Chargement...</div>
          ) : news.length === 0 ? (
            <div className="text-center text-white/40 py-12">Aucune actualité pour le moment</div>
          ) : (
            news.map((item, idx) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-[#FF2D8A]/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  {item.media_url && (
                    <div className="md:w-64 flex-shrink-0">
                      <img
                        src={item.media_url}
                        alt={item.title}
                        className="w-full h-64 md:h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-[#FF2D8A] font-semibold mb-2">
                      {new Date(item.published_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <h2 className="text-xl font-display font-bold text-white mb-3">{item.title}</h2>
                    <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>

        {/* Footer branding */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-white/40">
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