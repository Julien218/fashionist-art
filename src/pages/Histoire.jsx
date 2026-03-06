import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function Histoire() {
  const { data: pages = [], isLoading: pageLoading } = useQuery({
    queryKey: ['history-page'],
    queryFn: () => base44.entities.HistoryPage.list('-last_updated_at', 1),
  });

  const { data: organizers = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['organizers-public'],
    queryFn: () => base44.entities.Organizer.filter({ active: true }, 'order', 20),
  });

  const page = pages?.[0];

  const getSocials = (socialsStr) => {
    try { return typeof socialsStr === 'string' ? JSON.parse(socialsStr) : (socialsStr || {}); }
    catch { return {}; }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF2D8A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="label-tag mb-4">Notre histoire</p>
          <h1 className="title-section mb-4">
            <span className="font-script text-[#FF2D8A]">L'histoire de </span>
            <span>Fashionist'ART</span>
          </h1>
          {page?.approved_by_name && (
            <p className="text-sm text-white/40 mt-3">
              Validé par <span className="text-white/60">{page.approved_by_name}</span>
              {page.approved_at && <> · {new Date(page.approved_at).toLocaleDateString('fr-FR')}</>}
            </p>
          )}
        </div>

        {/* Content */}
        {page ? (
          <div
            className="prose prose-invert prose-lg max-w-none bg-white/5 border border-white/10 rounded-2xl p-8 mb-16
              prose-headings:font-display prose-headings:text-white
              prose-p:text-white/80 prose-p:leading-relaxed
              prose-a:text-[#FF2D8A] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-em:text-white/80
              prose-ul:text-white/80 prose-ol:text-white/80
              prose-blockquote:border-l-[#FF2D8A] prose-blockquote:text-white/60"
            dangerouslySetInnerHTML={{ __html: page.content_html }}
          />
        ) : (
          <div className="text-center py-16 text-white/40 bg-white/5 rounded-2xl border border-white/10 mb-16">
            <p className="text-lg">La page Histoire est en cours de rédaction.</p>
            <p className="text-sm mt-2">Revenez bientôt !</p>
          </div>
        )}

        {/* Organisateurs */}
        {organizers.length > 0 && (
          <section className="mb-16">
            <div className="divider mb-12" />
            <h2 className="font-display font-bold text-2xl text-white text-center mb-10">
              <span className="font-script text-[#D4AF37]">L'équipe</span> organisatrice
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {organizers.map((org) => {
                const socials = getSocials(org.socials);
                return (
                  <div key={org.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-5">
                    {org.photo ? (
                      <img src={org.photo} alt={org.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#FF2D8A]/30 flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#FF2D8A]/10 border-2 border-[#FF2D8A]/20 flex items-center justify-center text-2xl font-bold text-[#FF2D8A] flex-shrink-0">
                        {org.name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-white">{org.name}</h3>
                      {org.role_title && <p className="text-sm text-[#D4AF37] mb-2">{org.role_title}</p>}
                      {org.bio && <p className="text-sm text-white/60 leading-relaxed line-clamp-3">{org.bio}</p>}
                      <div className="flex gap-3 mt-3 flex-wrap">
                        {socials.instagram && (
                          <a href={`https://instagram.com/${socials.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-[#FF2D8A] transition-colors">Instagram</a>
                        )}
                        {socials.facebook && (
                          <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-[#FF2D8A] transition-colors">Facebook</a>
                        )}
                        {socials.linkedin && (
                          <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-[#FF2D8A] transition-colors">LinkedIn</a>
                        )}
                        {socials.website && (
                          <a href={socials.website} target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-[#FF2D8A] transition-colors">Site web</a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Branding */}
        <div className="divider mb-8" />
        <div className="text-center text-xs text-white/25 pb-4">
          <p>Architecture &amp; réalisation : <span className="text-white/40">Js-Innov.IA</span></p>
          <p className="mt-1">Design &amp; mise en page : <span className="text-white/40">JY-Trix.AI</span></p>
        </div>
      </div>
    </div>
  );
}