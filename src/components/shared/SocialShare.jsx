import React, { useState } from 'react';
import { Share2, Facebook, Instagram, Link, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

export default function SocialShare({ title, description }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = description || `${title || "Fashionist'ART"} — 18 avril 2026 — Centre Sportif d'Élouges (Dour)`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const TikTokIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
  );

  const links = [
    { icon: Facebook, label: 'Facebook', href: `https://www.facebook.com/61575203516618/` },
    { icon: Instagram, label: 'Instagram', href: `https://www.instagram.com/fashionist.art.dour/` },
    { icon: TikTokIcon, label: 'TikTok', href: `https://www.tiktok.com/@user6921475292315?_r=1&_t=ZG-94Kw7dIEGcS` },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dark border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 transition-all">
          <Share2 className="w-3 h-3" /> Partager
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-[#12121A] border border-white/10 w-52 p-2" align="end">
        <div className="space-y-1">
          {links.map(({ icon: Icon, label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/70 hover:text-white">
              <Icon className="w-4 h-4 text-[#FF2D8A]" /> {label}
            </a>
          ))}
          <button onClick={copyLink} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/70 hover:text-white w-full">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Link className="w-4 h-4 text-[#D4AF37]" />}
            {copied ? 'Copié !' : 'Copier le lien'}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}