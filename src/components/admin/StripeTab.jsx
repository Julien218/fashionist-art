import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CreditCard, Loader2, ExternalLink, AlertTriangle } from 'lucide-react';

export default function StripeTab() {
  const [form, setForm] = useState({ label: '', description: '', amount: '', currency: 'eur' });
  const [loading, setLoading] = useState(false);

  const isInIframe = () => {
    try { return window.self !== window.top; } catch { return true; }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!form.label || !form.amount) { toast.error('Libellé et montant requis'); return; }

    if (isInIframe()) {
      toast.error('Le paiement Stripe ne fonctionne que depuis l\'application publiée, pas depuis l\'éditeur.', { duration: 5000 });
      return;
    }

    setLoading(true);
    const res = await base44.functions.invoke('stripeCreateCheckout', {
      label: form.label,
      description: form.description,
      amount: Math.round(Number(form.amount) * 100),
      currency: form.currency,
    });

    if (res.data?.url) {
      window.open(res.data.url, '_blank');
      toast.success('Session Stripe créée !');
    } else {
      toast.error(res.data?.error || 'Erreur Stripe');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass-dark neon-border rounded-2xl p-6">
        <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#FF2D8A]" /> Paiement Stripe
        </h3>
        <p className="text-white/40 text-sm mb-6">Créez une session de paiement Stripe. Accès réservé au super admin.</p>

        {isInIframe() && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-6">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-300 text-sm">Le checkout Stripe fonctionne uniquement depuis l'application publiée, pas depuis l'éditeur.</p>
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Libellé du produit / service *</label>
            <Input required value={form.label} onChange={e => setForm({...form, label: e.target.value})}
              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
              placeholder="Ex: Emplacement exposant — Fashionist'ART" />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Description (optionnel)</label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
              placeholder="Détails du produit ou service..." rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Montant (€) *</label>
              <Input required type="number" step="0.01" min="0.50" value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                placeholder="Ex: 25.00" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Devise</label>
              <Input value={form.currency.toUpperCase()} disabled
                className="h-12 bg-white/5 border-white/10 text-white/50 rounded-xl cursor-not-allowed" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="btn-primary w-full h-12 rounded-full border-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Lancer le paiement Stripe
          </Button>
        </form>
      </div>

      <div className="glass-dark rounded-2xl p-5 border border-white/5">
        <p className="text-white/40 text-xs leading-relaxed">
          <span className="text-[#D4AF37] font-semibold">Mode test actif.</span> Utilisez la carte <code className="bg-white/10 px-1.5 py-0.5 rounded text-white">4242 4242 4242 4242</code> avec n'importe quelle date future et CVC pour tester. 
          Pour passer en production, rendez-vous dans <strong className="text-white">Dashboard → Integrations</strong> et reliez votre compte Stripe.
        </p>
      </div>
    </div>
  );
}