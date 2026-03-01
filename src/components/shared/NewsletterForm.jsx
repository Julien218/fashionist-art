import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Loader2, Mail } from 'lucide-react';
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
    await base44.entities.NewsletterSubscriber.create({ email, consent: true, consent_date: new Date().toISOString() });
    setLoading(false);
    setDone(true);
    toast.success('Inscription confirmée !');
  };

  if (done) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-3 p-4 rounded-2xl glass-dark border border-green-500/20 text-green-400">
        <Check className="w-5 h-5" />
        <span className="text-sm">Merci ! Vous êtes inscrit(e) à la newsletter.</span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input type="email" required placeholder="Votre adresse e-mail" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-full focus:border-[#FF2D8A]/50" />
        </div>
        <Button type="submit" disabled={loading} className="btn-primary h-12 px-8 rounded-full border-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "S'inscrire"}
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox id="nl-consent" checked={consent} onCheckedChange={setConsent} className="mt-0.5 border-white/20" />
        <label htmlFor="nl-consent" className="text-xs text-white/40 cursor-pointer">
          J'accepte de recevoir la newsletter de Fashionist'ART et je comprends que je peux me désinscrire à tout moment. *
        </label>
      </div>
    </form>
  );
}