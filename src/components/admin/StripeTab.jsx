import React from 'react';
import ConnectOnboarding from './ConnectOnboarding';
import { CreditCard } from 'lucide-react';

export default function StripeTab({ user }) {
  const isInIframe = () => {
    try { return window.self !== window.top; } catch { return true; }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-display font-bold text-xl text-white mb-1 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#FF2D8A]" /> Configuration Stripe Connect
        </h2>
        <p className="text-sm text-white/40">
          Connectez votre compte Stripe pour recevoir les paiements directement. La plateforme prélève automatiquement une commission lors de chaque transaction.
        </p>
      </div>

      {isInIframe() && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <span className="text-yellow-400 text-lg">⚠️</span>
          <p className="text-yellow-300 text-sm">Le checkout Stripe fonctionne uniquement depuis l'application publiée, pas depuis l'éditeur.</p>
        </div>
      )}

      <ConnectOnboarding user={user} />

      <div className="glass-dark rounded-2xl p-5 border border-white/5">
        <p className="text-white/40 text-xs leading-relaxed">
          <span className="text-[#D4AF37] font-semibold">Mode test actif.</span> Utilisez la carte{' '}
          <code className="bg-white/10 px-1.5 py-0.5 rounded text-white">4242 4242 4242 4242</code>{' '}
          avec n'importe quelle date future et CVC pour tester.
          Pour passer en production, rendez-vous dans <strong className="text-white">Dashboard → Integrations</strong>.
        </p>
      </div>
    </div>
  );
}