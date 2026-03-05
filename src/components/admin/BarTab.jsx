import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { QrCode, Loader2, Copy } from 'lucide-react';

const QUICK_AMOUNTS = [200, 300, 500, 1000, 2000]; // en centimes

export default function BarTab({ user }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [qrUrl, setQrUrl] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (amountCents) => {
      const res = await base44.functions.invoke('stripeCreateCheckout', {
        title: `Bar Fashionist'ART ${note ? ` - ${note}` : ''}`,
        amount_cents: amountCents,
        sale_type: 'bar',
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.checkout_url) {
        setCheckoutUrl(data.checkout_url);
        generateQR(data.checkout_url);
        toast.success('Lien paiement généré !');
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const generateQR = async (url) => {
    try {
      const qrRes = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
      );
      if (qrRes.ok) {
        setQrUrl(qrRes.url);
      }
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  };

  const handleQuickAmount = (amountCents) => {
    setAmount(amountCents.toString());
    generateMutation.mutate(amountCents);
  };

  const handleCustom = () => {
    if (!amount || isNaN(amount)) {
      toast.error('Montant invalide');
      return;
    }
    const cents = Math.round(parseFloat(amount) * 100);
    generateMutation.mutate(cents);
  };

  const copyLink = () => {
    if (checkoutUrl) {
      navigator.clipboard.writeText(checkoutUrl);
      toast.success('Lien copié !');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-xl text-white mb-2">Bar QR Paiement</h2>
        <p className="text-sm text-white/60">Générez des QR codes pour encaisser des paiements montant libre</p>
      </div>

      {/* Quick amounts */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="font-display font-semibold text-white mb-4">Montants rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {QUICK_AMOUNTS.map((amt) => (
            <Button
              key={amt}
              onClick={() => handleQuickAmount(amt)}
              disabled={generateMutation.isPending}
              className="bg-[#FF2D8A]/20 hover:bg-[#FF2D8A]/30 text-[#FF2D8A] font-semibold"
            >
              {(amt / 100).toFixed(2)} €
            </Button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="font-display font-semibold text-white">Montant personnalisé</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 15.50"
              className="bg-white/5 border-white/10 text-white h-10 text-sm"
            />
          </div>
          <span className="flex items-center text-white/60">€</span>
        </div>
        <Input
          placeholder="Note (optionnel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="bg-white/5 border-white/10 text-white h-10 text-sm"
        />
        <Button
          onClick={handleCustom}
          disabled={generateMutation.isPending}
          className="w-full bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2"
        >
          {generateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <QrCode className="w-4 h-4" />
          )}
          Générer QR
        </Button>
      </div>

      {/* QR Code Display */}
      {qrUrl && (
        <div className="bg-white/5 border border-[#FF2D8A]/30 rounded-xl p-6 text-center space-y-4">
          <h3 className="font-display font-semibold text-white">Code QR généré</h3>
          <img
            src={qrUrl}
            alt="QR Code paiement"
            className="w-64 h-64 mx-auto border-4 border-white/10 rounded-lg bg-white p-4"
          />
          <p className="text-sm text-white/60">
            Montant: <span className="font-semibold text-white">{(parseInt(amount || '0') || 0).toFixed(2)} €</span>
          </p>
          {checkoutUrl && (
            <Button
              onClick={copyLink}
              variant="outline"
              className="border-white/20 text-white/70 hover:text-white w-full gap-2"
            >
              <Copy className="w-4 h-4" /> Copier le lien
            </Button>
          )}
        </div>
      )}

      {/* Branding */}
      <div className="text-center text-xs text-white/40 pt-6 border-t border-white/10">
        <p>
          Architecture &amp; réalisation : <span className="text-white/60">Js-Innov.IA</span>
        </p>
        <p className="mt-1">
          Design &amp; mise en page : <span className="text-white/60">JY-Trix.AI</span>
        </p>
      </div>
    </div>
  );
}