import React, { useState } from 'react';
import { Share2, Facebook, Instagram, Link, Check, Youtube, MessageSquare } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

const BASE_URL = 'https://fashionistart.base44.app';
const VIDEO_URL = 'https://youtu.be/Ti8_bJHM8VM?si=ITO8EMGq4VnxcFg2';
const HASHTAGS_FR = '#FashionistART #ModeArt #Dour #Belgique #EventGratuit #FestivalMode #Art2026 #JSInnovIA #JYTrixAI';
const SIGNATURE = '💻 Plateforme développée par JS-Innov.IA (Pagin Julien) & JY-TrixAI';

// Génère le texte pré-rédigé selon la page / contexte
function buildShareText({ title, description, pageUrl }) {
  const url = pageUrl || (typeof window !== 'undefined' ? window.location.href : BASE_URL);
  const desc = description || "Une fusion unique entre mode et art — entrée GRATUITE !";

  return {
    short: `✨ ${title || "Fashionist'ART"} — ${desc}\n📅 18 avril 2026 | Centre Sportif d'Élouges, Dour 🇧🇪\n🎟️ Entrée gratuite !\n🎬 Vidéo : ${VIDEO_URL}\n👉 ${url}\n${HASHTAGS_FR}\n\n${SIGNATURE}`,
    facebook: `🎨✨ ${title || "Fashionist'ART 2026"} ✨🎨\n\n${desc}\n\n📅 Date : Samedi 18 avril 2026\n📍 Lieu : Centre Sportif d'Élouges, Dour, Belgique\n🎟️ Entrée GRATUITE — places limitées !\n\n🎬 Découvrez la vidéo officielle : ${VIDEO_URL}\n🔗 Réservez votre place : ${url}\n\n${HASHTAGS_FR}\n\n${SIGNATURE}`,
    twitter: `✨ ${title || "Fashionist'ART 2026"} — Mode & Art à Dour 🇧🇪\n📅 18 avril 2026 | Entrée GRATUITE !\n🎬 ${VIDEO_URL}\n🎟️ ${url}\n#FashionistART #ModeArt #Dour #Belgique #JSInnovIA`,
    whatsapp: `🎨 *${title || "Fashionist'ART 2026"}* 🎨\n\n${desc}\n\n📅 *18 avril 2026*\n📍 Centre Sportif d'Élouges, Dour, Belgique\n🎟️ Entrée *gratuite* !\n\n🎬 Vidéo officielle : ${VIDEO_URL}\n👉 ${url}\n\n${HASHTAGS_FR}\n\n_${SIGNATURE}_`,
  };
}

const TikTokIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

export default function SocialShare({ title, description, pageUrl }) {
  const [copied, setCopied] = useState(false);
  const [showDraft, setShowDraft] = useState(null);

  const currentUrl = pageUrl || (typeof window !== 'undefined' ? window.location.href : BASE_URL);
  const texts = buildShareText({ title, description, pageUrl: currentUrl });

  const encodedFb = encodeURIComponent(currentUrl);
  const encodedTw = encodeURIComponent(texts.twitter);
  const encodedWa = encodeURIComponent(texts.whatsapp);

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyDraft = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Texte copié ! Collez-le dans votre post.');
  };

  const shareItems = [
    {
      id: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      color: 'text-[#1877F2]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedFb}&quote=${encodeURIComponent(texts.facebook)}`,
      draft: texts.facebook,
      draftLabel: 'Post Facebook',
    },
    {
      id: 'twitter',
      icon: () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      label: 'X (Twitter)',
      color: 'text-white',
      href: `https://twitter.com/intent/tweet?text=${encodedTw}`,
      draft: texts.twitter,
      draftLabel: 'Tweet',
    },
    {
      id: 'whatsapp',
      icon: WhatsAppIcon,
      label: 'WhatsApp',
      color: 'text-[#25D366]',
      href: `https://wa.me/?text=${encodedWa}`,
      draft: texts.whatsapp,
      draftLabel: 'Message WhatsApp',
    },
    {
      id: 'instagram',
      icon: Instagram,
      label: 'Instagram',
      color: 'text-[#E1306C]',
      href: `https://www.instagram.com/fashionist.art.dour/`,
      draft: texts.short,
      draftLabel: 'Légende Instagram',
    },
    {
      id: 'tiktok',
      icon: TikTokIcon,
      label: 'TikTok',
      color: 'text-white',
      href: `https://www.tiktok.com/@user6921475292315`,
      draft: texts.short,
      draftLabel: 'Description TikTok',
    },
    {
      id: 'youtube',
      icon: Youtube,
      label: 'Clip officiel',
      color: 'text-[#FF0000]',
      href: `https://youtu.be/Ti8_bJHM8VM?si=ITO8EMGq4VnxcFg2`,
      draft: null,
    },
  ];

  return (
    <Popover onOpenChange={() => setShowDraft(null)}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dark border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 transition-all">
          <Share2 className="w-3 h-3" /> Partager
        </button>
      </PopoverTrigger>

      <PopoverContent className="bg-[#12121A] border border-white/10 w-72 p-3" align="end">

        {/* Texte pré-rédigé affiché si demandé */}
        {showDraft && (
          <div className="mb-3 p-2 rounded-lg bg-white/5 border border-white/10">
            <p className="text-[10px] text-[#FF2D8A] font-display font-bold uppercase tracking-wider mb-1">{showDraft.label}</p>
            <p className="text-xs text-white/70 whitespace-pre-wrap leading-relaxed line-clamp-6">{showDraft.text}</p>
            <button
              onClick={() => copyDraft(showDraft.text)}
              className="mt-2 w-full text-[10px] font-display font-semibold py-1 rounded bg-[#FF2D8A]/20 text-[#FF2D8A] hover:bg-[#FF2D8A]/30 transition-colors"
            >
              📋 Copier ce texte
            </button>
            <button onClick={() => setShowDraft(null)} className="mt-1 w-full text-[10px] text-white/30 hover:text-white/60 transition-colors">
              ← Retour
            </button>
          </div>
        )}

        {!showDraft && (
          <div className="space-y-0.5">
            {shareItems.map(({ id, icon: Icon, label, color, href, draft, draftLabel }) => (
              <div key={id} className="flex items-center gap-1">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/70 hover:text-white"
                >
                  <span className={color}><Icon /></span>
                  {label}
                </a>
                {draft && (
                  <button
                    onClick={() => setShowDraft({ text: draft, label: draftLabel })}
                    title="Voir le texte pré-rédigé"
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-[#D4AF37] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            <div className="pt-1 border-t border-white/10 mt-1">
              <button
                onClick={copyLink}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/70 hover:text-white w-full"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Link className="w-4 h-4 text-[#D4AF37]" />}
                {copied ? 'Lien copié !' : 'Copier le lien'}
              </button>
            </div>

            <p className="text-center text-[9px] text-white/15 pt-1 font-display">
              💡 Cliquez <span className="text-white/25">💬</span> pour le texte pré-rédigé
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}