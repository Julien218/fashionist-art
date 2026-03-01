import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Link, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

export default function SocialShare({ title, description, url }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const shareText = `${title || "Fashionist'ART"} — 18 avril 2026 — Centre Sportif d'Élouges (Dour)`;
  const fullDesc = description || shareText;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const links = [
    { icon: Facebook, label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(fullDesc)}` },
    { icon: Twitter, label: 'X / Twitter', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullDesc)}&url=${encodeURIComponent(shareUrl)}` },
    { icon: Linkedin, label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full border-[#E8A0B4]/40 hover:bg-[#F2C4CE]/20 gap-2">
          <Share2 className="w-4 h-4" />
          Partager
        </Button>
      </PopoverTrigger>
      <PopoverContent className="glass w-56 p-3" align="end">
        <div className="space-y-1">
          {links.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F2C4CE]/20 transition-colors text-sm"
            >
              <Icon className="w-4 h-4 text-[#C2185B]" />
              {label}
            </a>
          ))}
          <button
            onClick={copyLink}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F2C4CE]/20 transition-colors text-sm w-full"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link className="w-4 h-4 text-[#D4AF37]" />}
            {copied ? 'Copié !' : 'Copier le lien'}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}