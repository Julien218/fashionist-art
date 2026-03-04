import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function NewsletterForm({ light = false }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) { toast.error('Veuillez accepter de recevoir la newsletter.'); return; }
    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);
    try {
      // Anti-doublon
      const existing = await base44.entities.NewsletterSubscriber.filter({ email: normalizedEmail, unsubscribed: false });
      if (existing && existing.length > 0) {
        toast.error('Cette adresse est déjà inscrite à la newsletter.');
        setLoading(false);
        return;
      }
      // Générer token de désinscription
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      await base44.entities.NewsletterSubscriber.create({
        email: normalizedEmail,
        first_name: firstName.trim() || null,
        consent: true,
        consent_date: new Date().toISOString(),
        unsubscribed: false,
        source: 'website',
        unsubscribe_token: token,
      });
      setDone(true);
      toast.success('Inscription confirmée !');
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center gap-3 p-4 rounded-2xl border ${light ? 'border-green-300 bg-green-50 text-green-700' : 'glass-dark border-green-500/20 text-green-400'}`}>
        <Check className="w-5 h-5" />
        <span className="text-sm">Merci ! Vous êtes inscrit(e) à la newsletter.</span>
      </motion.div>
    );
  }

  const inputClass = light
    ? "h-12 border border-gray-200 text-[#2D2024] placeholder:text-[#2D2024]/40 rounded-xl bg-white focus:border-[#FF2D8A]/50"
    : "h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#FF2D8A]/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input placeholder="Prénom (optionnel)" value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={inputClass} />
        <Input type="email" required placeholder="Votre adresse e-mail *" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass} />
      </div>
      <div className="flex items-start gap-2">
        <Checkbox id="nl-consent" checked={consent} onCheckedChange={setConsent} className={`mt-0.5 ${light ? 'border-gray-300' : 'border-white/20'}`} />
        <label htmlFor="nl-consent" className={`text-xs cursor-pointer ${light ? 'text-[#2D2024]/50' : 'text-white/40'}`}>
          J'accepte de recevoir la newsletter de Fashionist'ART et je comprends que je peux me désinscrire à tout moment. *
        </label>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl border-0 font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #FF2D8A, #9B26AF)' }}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>✦ S'inscrire à la newsletter</>}
      </Button>
    </form>
  );
}