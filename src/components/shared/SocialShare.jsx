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

  const links = [
    { icon: Facebook, label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}` },
    { icon: Twitter, label: 'X / Twitter', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { icon: Linkedin, label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
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