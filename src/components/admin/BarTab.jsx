import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QrCode, Loader2, Copy, ExternalLink, AlertTriangle, CheckCircle2, RefreshCw, Plus } from 'lucide-react';
import ConnectOnboarding from './ConnectOnboarding';

const QUICK_AMOUNTS_CENTS = [200, 300, 500, 1000, 2000];

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500/10 text-yellow-400',
  PAID: 'bg-green-500/10 text-green-400',
  FAILED: 'bg-red-500/10 text-red-400',
  CANCELLED: 'bg-gray-500/10 text-gray-400',
  REFUNDED: 'bg-gray-500/10 text-gray-400',
};

export default function BarTab({ user }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [qrUrl, setQrUrl] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // null | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'
  const [paidData, setPaidData] = useState(null);
  const pollingRef = useRef(null);
  const pollingStart = useRef(null);
  const qc = useQueryClient();

  // Charger l'organisation du user
  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['my-organizations'],
    queryFn: async () => {
      const res = await base44.functions.invoke('listOrganizations', {});
      return res.data?.orgs || [];
    },
  });

  const myOrg = orgs?.[0] || null;
  const isReady = myOrg?.charges_enabled && myOrg?.onboarding_status === 'COMPLETE';

  // Caisse du jour
  const today = new Date().toISOString().split('T')[0];
  const { data: salesRaw = [], refetch: refetchSales } = useQuery({
    queryKey: ['bar-sales-today'],
    queryFn: () => base44.entities.Sale.filter({ sale_type: 'bar' }, '-created_at', 100),
    refetchInterval: 10000,
  });

  const salesToday = salesRaw.filter((s) => {
    const d = (s.created_at || s.created_date || '').split('T')[0];
    return d === today;
  });

  const totalToday = salesToday
    .filter((s) => s.status === 'PAID')
    .reduce((acc, s) => acc + (s.amount_total_cents || 0), 0);

  // Polling du statut paiement
  const startPolling = (sid) => {
    stopPolling();
    pollingStart.current = Date.now();
    pollingRef.current = setInterval(async () => {
      const elapsed = Date.now() - pollingStart.current;
      // Arrêter après 3 minutes
      if (elapsed > 180000) {
        stopPolling();
        return;
      }
      try {
        const res = await base44.functions.invoke('getBarPaymentStatus', { session_id: sid });
        const data = res.data;
        if (data?.status === 'PAID') {
          stopPolling();
          setPaymentStatus('PAID');
          setPaidData(data);
          refetchSales();
          qc.invalidateQueries({ queryKey: ['bar-sales-today'] });
        } else if (data?.status === 'FAILED' || data?.status === 'CANCELLED') {
          stopPolling();
          setPaymentStatus(data.status);
        }
      } catch (err) {
        console.warn('Polling error:', err.message);
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => () => stopPolling(), []);

  const generateQR = (url) => {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    setQrUrl(qrImageUrl);
  };

  const generateMutation = useMutation({
    mutationFn: async (amountCents) => {
      const res = await base44.functions.invoke('stripeCreateBarCheckout', {
        organization_id: myOrg.id,
        amount_cents: amountCents,
        note: note || undefined,
        app_url: window.location.origin,
      });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.checkout_url) {
        setCheckoutUrl(data.checkout_url);
        setSessionId(data.session_id);
        setPaymentStatus('PENDING');
        setPaidData(null);
        generateQR(data.checkout_url);
        qc.invalidateQueries({ queryKey: ['bar-sales-today'] });
        toast.success('QR code généré ! En attente de paiement...');
        startPolling(data.session_id);
      } else {
        toast.error('Pas de lien paiement dans la réponse');
      }
    },
    onError: (err) => toast.error(err.message || 'Erreur génération QR'),
  });

  const handleQuickAmount = (cents) => {
    setAmount((cents / 100).toString());
    generateMutation.mutate(cents);
  };

  const handleCustom = () => {
    const val = parseFloat(amount);
    if (!val || isNaN(val) || val <= 0 || val > 2000) {
      toast.error('Montant invalide (entre 0.01€ et 2000€)');
      return;
    }
    generateMutation.mutate(Math.round(val * 100));
  };

  const handleNewSale = () => {
    stopPolling();
    setQrUrl(null);
    setCheckoutUrl(null);
    setSessionId(null);
    setPaymentStatus(null);
    setPaidData(null);
    setAmount('');
    setNote('');
  };

  const copyLink = () => {
    if (checkoutUrl) {
      navigator.clipboard.writeText(checkoutUrl);
      toast.success('Lien copié !');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display font-bold text-xl text-white mb-1">Bar QR Paiement</h2>
        <p className="text-sm text-white/50">Encaissez des paiements via QR code Stripe</p>
      </div>

      {/* Onboarding Stripe */}
      {orgsLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-white/40" /></div>
      ) : (
        <ConnectOnboarding user={user} />
      )}

      {/* Blocage si pas prêt */}
      {!orgsLoading && myOrg && !isReady && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-300">
            Le module Bar est <strong>bloqué</strong> tant que l'onboarding Stripe n'est pas terminé. Complétez la connexion Stripe ci-dessus.
          </p>
        </div>
      )}

      {/* Module Bar */}
      {isReady && (
        <>
          {/* PAIEMENT VALIDÉ */}
          {paymentStatus === 'PAID' && paidData && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
              <h3 className="font-display font-bold text-2xl text-green-400">✅ PAIEMENT VALIDÉ</h3>
              <p className="text-white text-lg font-semibold">{((paidData.amount_cents || 0) / 100).toFixed(2)} €</p>
              {user.role === 'super_admin' && paidData.stripe_fee_cents > 0 && (
                <p className="text-white/40 text-xs">Frais Stripe : {(paidData.stripe_fee_cents / 100).toFixed(2)} €</p>
              )}
              <Button onClick={handleNewSale} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2 mt-4">
                <Plus className="w-4 h-4" /> Nouvelle vente
              </Button>
            </div>
          )}

          {/* FAILED / CANCELLED */}
          {(paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center space-y-3">
              <p className="text-red-400 font-bold text-lg">
                {paymentStatus === 'FAILED' ? '❌ Paiement échoué' : '⚠️ Paiement annulé'}
              </p>
              <Button onClick={handleNewSale} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2">
                <RefreshCw className="w-4 h-4" /> Réessayer
              </Button>
            </div>
          )}

          {/* Formulaire (caché si PAID) */}
          {paymentStatus !== 'PAID' && (
            <>
              {/* Quick amounts */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="font-display font-semibold text-white mb-4">Montants rapides</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {QUICK_AMOUNTS_CENTS.map((amt) => (
                    <Button
                      key={amt}
                      onClick={() => handleQuickAmount(amt)}
                      disabled={generateMutation.isPending}
                      className="bg-[#FF2D8A]/20 hover:bg-[#FF2D8A]/40 text-[#FF2D8A] font-semibold"
                    >
                      {(amt / 100).toFixed(2)} €
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
                <h3 className="font-display font-semibold text-white">Montant personnalisé</h3>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="2000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ex: 15.50"
                    className="bg-white/5 border-white/10 text-white h-10 text-sm flex-1"
                  />
                  <span className="flex items-center text-white/60 font-semibold">€</span>
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
                  {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                  Générer QR
                </Button>
              </div>

              {/* QR Code + polling PENDING */}
              {qrUrl && checkoutUrl && paymentStatus === 'PENDING' && (
                <div className="bg-white/5 border border-[#FF2D8A]/30 rounded-xl p-6 text-center space-y-4">
                  <h3 className="font-display font-semibold text-white">Code QR généré</h3>
                  <img src={qrUrl} alt="QR Code paiement" className="w-64 h-64 mx-auto border-4 border-white/10 rounded-lg bg-white p-4" />
                  <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    En attente de paiement...
                  </div>
                  <p className="text-sm text-white/60">
                    Montant : <span className="font-semibold text-white">{parseFloat(amount || 0).toFixed(2)} €</span>
                    {note && <> — <span className="text-white/50">{note}</span></>}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={copyLink} variant="outline" className="border-white/20 text-white/70 hover:text-white gap-2">
                      <Copy className="w-4 h-4" /> Copier le lien
                    </Button>
                    <Button onClick={() => window.open(checkoutUrl, '_blank')} variant="outline" className="border-white/20 text-white/70 hover:text-white gap-2">
                      <ExternalLink className="w-4 h-4" /> Ouvrir
                    </Button>
                    <Button onClick={handleNewSale} variant="outline" className="border-white/20 text-white/70 hover:text-white gap-2">
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Caisse du jour */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-white">Caisse du jour</h3>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => refetchSales()} className="text-white/40 hover:text-white gap-1 text-xs">
                  <RefreshCw className="w-3 h-3" /> Actualiser
                </Button>
                <span className="text-lg font-bold text-green-400">{(totalToday / 100).toFixed(2)} €</span>
              </div>
            </div>

            {salesToday.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-4">Aucune transaction aujourd'hui</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-2 text-xs text-white/40 font-display uppercase">Heure</th>
                      <th className="text-left py-2 px-2 text-xs text-white/40 font-display uppercase">Montant</th>
                      <th className="text-left py-2 px-2 text-xs text-white/40 font-display uppercase">Note</th>
                      {user.role === 'super_admin' && <th className="text-left py-2 px-2 text-xs text-white/40 font-display uppercase">Comm.</th>}
                      <th className="text-left py-2 px-2 text-xs text-white/40 font-display uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesToday.map((s) => (
                      <tr key={s.id} className="border-b border-white/5">
                        <td className="py-2 px-2 text-white/60 text-xs">
                          {new Date(s.created_at || s.created_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2 px-2 font-semibold text-white">{((s.amount_total_cents || 0) / 100).toFixed(2)} €</td>
                        <td className="py-2 px-2 text-white/50 text-xs">{s.note || '—'}</td>
                        {user.role === 'super_admin' && (
                          <td className="py-2 px-2 text-orange-400 text-xs">
                            {s.status === 'PAID' ? `${((s.platform_fee_cents || 0) / 100).toFixed(2)} €` : '—'}
                          </td>
                        )}
                        <td className="py-2 px-2">
                          <Badge className={STATUS_COLORS[s.status] || 'bg-gray-500/10 text-gray-400'}>{s.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Branding */}
      <div className="text-center text-xs text-white/30 pt-4 border-t border-white/10">
        <p>Architecture &amp; réalisation : <span className="text-white/50">Js-Innov.IA</span></p>
        <p className="mt-1">Design &amp; mise en page : <span className="text-white/50">JY-Trix.AI</span></p>
      </div>
    </div>
  );
}