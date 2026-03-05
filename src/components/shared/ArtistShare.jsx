import React, { useState } from 'react';
import { Share2, Facebook, Instagram, Link, Check, Twitter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

const TikTokIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
  </svg>
);

export default function ArtistShare({ artist }) {
  const [copied, setCopied] = useState(false);

  if (!artist) return null;

  const origin = window.location.origin;
  const artistUrl = `${origin}/artists?artist=${encodeURIComponent(artist.name)}`;
  const shareText = `🎨 Découvrez ${artist.name} — ${artist.discipline} — à Fashionist'ART le 18 avril 2026 à Dour, Belgique ! Entrée gratuite. #FashionistART #Mode #Art #Dour`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(artistUrl);

  const copyLink = () => {
    navigator.clipboard.writeText(artistUrl);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const links = [
    {
      icon: Facebook,
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      color: 'text-[#1877F2]',
    },
    {
      icon: Twitter,
      label: 'X / Twitter',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'text-white',
    },
    {
      icon: TikTokIcon,
      label: 'TikTok',
      href: `https://www.tiktok.com/@user6921475292315`,
      color: 'text-[#FF2D8A]',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      href: `https://www.instagram.com/fashionist.art.dour/`,
      color: 'text-[#E1306C]',
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dark border border-white/10 text-xs text-white/60 hover:text-[#FF2D8A] hover:border-[#FF2D8A]/30 transition-all">
          <Share2 className="w-3 h-3" /> Partager cet artiste
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-[#12121A] border border-white/10 w-56 p-2" align="end">
        <p className="text-[10px] text-white/30 px-3 pt-1 pb-2 font-display uppercase tracking-widest">Partager {artist.name}</p>
        <div className="space-y-1">
          {links.map(({ icon: Icon, label, href, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/70 hover:text-white">
              <span className={color}><Icon /></span> {label}
            </a>
          ))}
          <div className="border-t border-white/5 my-1" />
          <button onClick={copyLink} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/70 hover:text-white w-full">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Link className="w-4 h-4 text-[#D4AF37]" />}
            {copied ? 'Copié !' : 'Copier le lien'}
          </button>
        </div>
        {/* Crédits développeurs */}
        <div className="border-t border-white/5 mt-2 pt-2 px-3 pb-1 flex items-center justify-center gap-2">
          <span className="text-[9px] text-white/20">By</span>
          <span className="text-[9px] text-[#D4AF37]/60 font-display">Js-Innov.IA</span>
          <span className="text-[9px] text-white/20">&</span>
          <span className="text-[9px] text-[#FF2D8A]/60 font-display">JY-Trix.AI</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}