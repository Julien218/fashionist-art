import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) { toast.error('Veuillez accepter de recevoir la newsletter.'); return; }
    setLoading(true);
    await base44.entities.NewsletterSubscriber.create({
      email,
      consent: true,
      consent_date: new Date().toISOString()
    });
    setLoading(false);
    setDone(true);
    toast.success('Inscription à la newsletter confirmée !');
  };

  if (done) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-3 p-4 rounded-2xl glass">
        <Check className="w-6 h-6 text-green-600" />
        <span className="font-body text-[#2D2024]">Merci ! Vous êtes inscrit(e) à la newsletter.</span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C2185B]/50" />
          <Input
            type="email"
            required
            placeholder="Votre adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 rounded-full border-[#E8A0B4]/40 bg-white/60 focus:border-[#C2185B] h-12"
          />
        </div>
        <Button type="submit" disabled={loading} className="btn-premium h-12 px-8">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "S'inscrire"}
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="newsletter-consent"
          checked={consent}
          onCheckedChange={setConsent}
          className="mt-0.5"
        />
        <label htmlFor="newsletter-consent" className="text-xs text-[#2D2024]/60 font-body cursor-pointer">
          J'accepte de recevoir la newsletter Fashionist'ART. Vous pouvez vous désinscrire à tout moment.
        </label>
      </div>
    </form>
  );
}