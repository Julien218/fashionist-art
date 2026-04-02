import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Crown, Users, Calendar, MapPin, Ticket, CheckCircle, AlertCircle, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PRICE = 15;

export default function MissMister() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', quantity: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') {
      setSuccess(true);
      const sessionId = params.get('session_id');
      if (sessionId) fetchReservation(sessionId);
    }
    if (params.get('cancelled') === '1') setCancelled(true);
  }, []);

  const fetchReservation = async (sessionId) => {
    try {
      const all = await base44.entities.MissMisterReservation.filter({ stripe_session_id: sessionId });
      if (all && all.length > 0) setReservation(all[0]);
    } catch (_) {}
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Vérifier si dans un iframe (checkout Stripe ne fonctionne pas en iframe)
    if (window.self !== window.top) {
      alert("Le paiement ne peut s'effectuer que depuis l'application publiée, pas en prévisualisation.");
      return;
    }

    if (!form.first_name || !form.last_name || !form.email) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const qty = parseInt(form.quantity) || 1;
    if (qty < 1 || qty > 10) {
      setError('Quantité entre 1 et 10 places.');
      return;
    }

    setLoading(true);
    const res = await base44.functions.invoke('missMisterCheckout', {
      ...form,
      quantity: qty,
      success_url: `${window.location.origin}/MissMister?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/MissMister?cancelled=1`,
    });

    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      setError(res.data?.error || 'Une erreur est survenue.');
      setLoading(false);
    }
  };

  const total = (parseInt(form.quantity) || 1) * PRICE;

  // === VUE SUCCÈS ===
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-display font-black text-white mb-3">Réservation confirmée !</h1>
          <p className="text-white/60 mb-8">Merci pour votre réservation. Vous recevrez votre QR code par email.</p>

          {reservation?.qr_code ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-[#FF2D8A]" />
                <span className="text-sm font-display font-semibold text-white/80">Votre QR Code d'entrée</span>
              </div>
              {/* QR code visuel via API tierce */}
              <div className="flex justify-center mb-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(reservation.qr_code)}`}
                  alt="QR Code"
                  className="rounded-xl border border-white/20"
                  width={200}
                  height={200}
                />
              </div>
              <p className="text-xs text-white/30 font-mono break-all">{reservation.qr_code}</p>
              <div className="mt-4 pt-4 border-t border-white/10 text-sm text-white/60 space-y-1">
                <p><span className="text-white/40">Nom :</span> {reservation.first_name} {reservation.last_name}</p>
                <p><span className="text-white/40">Places :</span> {reservation.quantity}</p>
                <p><span className="text-white/40">Montant :</span> {((reservation.amount_cents || 0) / 100).toFixed(2)} €</p>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-white/50 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Génération du QR code en cours…
            </div>
          )}

          <button onClick={() => window.location.href = '/'} className="btn-outline text-sm px-6 py-2.5">
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    );
  }

  // === VUE ANNULATION ===
  if (cancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-orange-400" />
          </div>
          <h2 className="text-2xl font-display font-black text-white mb-3">Paiement annulé</h2>
          <p className="text-white/50 mb-6">Votre réservation n'a pas été finalisée.</p>
          <button onClick={() => { setCancelled(false); window.history.replaceState({}, '', '/MissMister'); }} className="btn-primary text-sm">
            Réessayer
          </button>
        </motion.div>
      </div>
    );
  }

  // === FORMULAIRE ===
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-display font-bold uppercase tracking-widest mb-6">
            <Crown className="w-4 h-4" /> Concours
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
            Miss & <span className="text-gradient">Mister Dour</span>
          </h1>
          <p className="text-white/60 text-lg">Réservez votre place pour la grande soirée</p>
        </motion.div>

        {/* Infos événement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: Calendar, label: 'Date', value: 'Dimanche 19 avril 2026' },
            { icon: MapPin, label: 'Lieu', value: "Centre Sportif d'Élouges, Dour" },
            { icon: Ticket, label: 'Prix / place', value: '15,00 €' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass-dark rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF2D8A]/10 border border-[#FF2D8A]/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#FF2D8A]" />
              </div>
              <div>
                <p className="text-xs text-white/30 font-display uppercase tracking-wide">{label}</p>
                <p className="text-sm text-white font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Formulaire */}
        <motion.form
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass-dark rounded-3xl p-6 md:p-8 border border-white/10 space-y-5"
        >
          <h2 className="text-xl font-display font-bold text-white mb-2">Vos informations</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 font-display uppercase tracking-wide mb-1 block">Prénom *</label>
              <Input
                value={form.first_name}
                onChange={e => set('first_name', e.target.value)}
                placeholder="Jean"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 font-display uppercase tracking-wide mb-1 block">Nom *</label>
              <Input
                value={form.last_name}
                onChange={e => set('last_name', e.target.value)}
                placeholder="Dupont"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 font-display uppercase tracking-wide mb-1 block">Email *</label>
            <Input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="jean.dupont@email.com"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
            />
            <p className="text-xs text-white/30 mt-1">Le QR code vous sera envoyé à cette adresse</p>
          </div>

          <div>
            <label className="text-xs text-white/40 font-display uppercase tracking-wide mb-1 block">Téléphone</label>
            <Input
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+32 470 00 00 00"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
            />
          </div>

          {/* Quantité */}
          <div>
            <label className="text-xs text-white/40 font-display uppercase tracking-wide mb-2 block">
              <Users className="w-3.5 h-3.5 inline mr-1" />Nombre de places *
            </label>
            <div className="flex items-center gap-3">
              <button type="button"
                onClick={() => set('quantity', Math.max(1, (parseInt(form.quantity) || 1) - 1))}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white text-xl font-bold hover:bg-white/10 transition-colors flex items-center justify-center"
              >−</button>
              <span className="text-2xl font-display font-black text-white w-10 text-center">{form.quantity}</span>
              <button type="button"
                onClick={() => set('quantity', Math.min(10, (parseInt(form.quantity) || 1) + 1))}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white text-xl font-bold hover:bg-white/10 transition-colors flex items-center justify-center"
              >+</button>
              <span className="text-white/40 text-sm ml-2">× 15,00 € =</span>
              <span className="text-[#D4AF37] font-display font-black text-xl">{total.toFixed(2)} €</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-base py-4 rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Redirection vers le paiement…</>
              ) : (
                <><Ticket className="w-5 h-5" /> Réserver — {total.toFixed(2)} €</>
              )}
            </button>
            <p className="text-xs text-white/25 text-center mt-3">
              Paiement sécurisé par Stripe · Entrée gratuite annulée si non payée
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}