import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket, CheckCircle, AlertCircle, Loader2, QrCode, Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PRICE = 15;
const LOGO_URL = "https://media.base44.com/images/public/69a460cb984c65f748b49e7d/2db995f80_454009299_122112677468384538_2558620218814362312_n.jpg";
const POSTER_URL = "https://media.base44.com/images/public/69a460cb984c65f748b49e7d/5baf7f039_grok-image-7dcac967-c0bd-4390-8ae0-3d285ca4549f.png";

// Ornement doré SVG
const GoldOrnament = () => (
  <svg viewBox="0 0 300 40" className="w-full max-w-xs mx-auto" fill="none">
    <path d="M150 20 Q130 5 100 10 Q70 15 50 8 Q30 1 10 5" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7"/>
    <path d="M150 20 Q170 5 200 10 Q230 15 250 8 Q270 1 290 5" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7"/>
    <circle cx="150" cy="20" r="4" fill="#D4AF37" opacity="0.9"/>
    <circle cx="150" cy="20" r="2" fill="#F5D76E"/>
    <path d="M140 20 L130 14 L135 20 L130 26 Z" fill="#D4AF37" opacity="0.5"/>
    <path d="M160 20 L170 14 L165 20 L170 26 Z" fill="#D4AF37" opacity="0.5"/>
  </svg>
);

const GoldDivider = () => (
  <div className="flex items-center gap-3 my-6">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#D4AF37] shrink-0" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
  </div>
);

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
  const total = (parseInt(form.quantity) || 1) * PRICE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (window.self !== window.top) {
      alert("Le paiement ne peut s'effectuer que depuis l'application publiée.");
      return;
    }
    if (!form.first_name || !form.last_name || !form.email) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const qty = parseInt(form.quantity) || 1;
    if (qty < 1 || qty > 10) { setError('Quantité entre 1 et 10 places.'); return; }
    setLoading(true);
    const res = await base44.functions.invoke('missMisterCheckout', {
      ...form, quantity: qty,
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

  // === VUE SUCCÈS ===
  if (success) {
    return (
      <PageShell>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full mx-auto text-center">
          <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-6" style={{background: 'radial-gradient(circle, rgba(212,175,55,0.15), transparent)'}}>
            <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h2 className="text-3xl font-serif text-white mb-2" style={{fontFamily: "'Playfair Display', serif"}}>Réservation confirmée !</h2>
          <p className="text-white/50 mb-8 text-sm">Votre place est réservée pour le grand événement.</p>

          {reservation?.qr_code ? (
            <div className="border border-[#D4AF37]/30 rounded-2xl p-6 mb-6" style={{background: 'rgba(212,175,55,0.04)'}}>
              <div className="flex items-center justify-center gap-2 mb-5">
                <QrCode className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm font-semibold text-[#D4AF37] uppercase tracking-widest">Votre billet d'entrée</span>
              </div>
              <div className="flex justify-center mb-4 p-3 bg-white rounded-xl inline-block mx-auto">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(reservation.qr_code)}&color=0A0A0F&bgcolor=ffffff`}
                  alt="QR Code"
                  className="rounded-lg"
                  width={200} height={200}
                />
              </div>
              <p className="text-xs text-white/20 font-mono break-all mb-4">{reservation.qr_code}</p>
              <GoldDivider />
              <div className="text-sm text-white/60 space-y-2">
                <p><span className="text-[#D4AF37]/70">Nom :</span> {reservation.first_name} {reservation.last_name}</p>
                <p><span className="text-[#D4AF37]/70">Places :</span> {reservation.quantity}</p>
                <p><span className="text-[#D4AF37]/70">Montant :</span> {((reservation.amount_cents || 0) / 100).toFixed(2)} €</p>
              </div>
            </div>
          ) : (
            <div className="border border-[#D4AF37]/20 rounded-2xl p-8 mb-6 text-white/40 text-sm">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
              Génération de votre billet en cours…
            </div>
          )}
          <button onClick={() => window.location.href = '/'} className="btn-outline text-sm px-8 py-2.5 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10">
            Retour à l'accueil
          </button>
        </motion.div>
      </PageShell>
    );
  }

  // === VUE ANNULATION ===
  if (cancelled) {
    return (
      <PageShell>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full mx-auto text-center">
          <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-white/40" />
          </div>
          <h2 className="text-2xl font-serif text-white mb-3" style={{fontFamily: "'Playfair Display', serif"}}>Paiement annulé</h2>
          <p className="text-white/40 mb-8">Votre réservation n'a pas été finalisée.</p>
          <button onClick={() => { setCancelled(false); window.history.replaceState({}, '', '/MissMister'); }}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-black font-bold text-sm"
            style={{background: 'linear-gradient(135deg, #D4AF37, #F5D76E)'}}>
            <Ticket className="w-4 h-4" /> Réessayer
          </button>
        </motion.div>
      </PageShell>
    );
  }

  // === PAGE PRINCIPALE ===
  return (
    <div className="min-h-screen" style={{background: 'radial-gradient(ellipse at top, #1a1408 0%, #0A0A0F 60%)'}}>
      {/* Hero pleine largeur */}
      <div className="relative overflow-hidden">
        {/* Image affiche en fond */}
        <div className="absolute inset-0 z-0">
          <img src={POSTER_URL} alt="" className="w-full h-full object-cover object-top opacity-25" />
          <div className="absolute inset-0" style={{background: 'linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,1) 100%)'}} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-12 pb-16 text-center">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <img src={LOGO_URL} alt="Miss & Mister Dour 2026" className="w-48 h-48 md:w-64 md:h-64 object-contain mx-auto drop-shadow-2xl" style={{borderRadius: '12px'}} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GoldOrnament />

            <p className="text-[#D4AF37] text-sm uppercase tracking-[0.3em] font-semibold mb-2 mt-4">La Grande Soirée</p>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 mb-2">
              {[
                { icon: Calendar, text: 'Dimanche 19 Avril 2026' },
                { icon: Clock, text: 'À partir de 14h00' },
                { icon: MapPin, text: "Centre Sportif d'Élouges, Dour" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/60 text-sm">
                  <Icon className="w-4 h-4 text-[#D4AF37]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <GoldOrnament />
          </motion.div>
        </div>
      </div>

      {/* Section réservation */}
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>

          {/* Prix mis en avant */}
          <div className="text-center mb-8">
            <div className="inline-flex flex-col items-center px-10 py-5 rounded-2xl border border-[#D4AF37]/30"
              style={{background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03))'}}>
              <span className="text-[#D4AF37]/60 text-xs uppercase tracking-widest mb-1">Prix par place</span>
              <span className="text-5xl font-serif font-bold text-[#D4AF37]" style={{fontFamily: "'Playfair Display', serif", textShadow: '0 0 30px rgba(212,175,55,0.4)'}}>15 €</span>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit}
            className="rounded-3xl p-6 md:p-8 border border-[#D4AF37]/20 space-y-5"
            style={{background: 'rgba(10,10,8,0.8)', backdropFilter: 'blur(20px)'}}>

            <div className="text-center mb-2">
              <h2 className="text-xl font-serif text-white" style={{fontFamily: "'Playfair Display', serif"}}>Réservez vos places</h2>
              <p className="text-white/30 text-xs mt-1">Tous les champs marqués * sont obligatoires</p>
            </div>

            <GoldDivider />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#D4AF37]/70 uppercase tracking-widest mb-1.5 block">Prénom *</label>
                <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Jean" required
                  className="border-[#D4AF37]/20 text-white placeholder:text-white/15 focus:border-[#D4AF37]/50"
                  style={{background: 'rgba(212,175,55,0.05)'}} />
              </div>
              <div>
                <label className="text-xs text-[#D4AF37]/70 uppercase tracking-widest mb-1.5 block">Nom *</label>
                <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Dupont" required
                  className="border-[#D4AF37]/20 text-white placeholder:text-white/15 focus:border-[#D4AF37]/50"
                  style={{background: 'rgba(212,175,55,0.05)'}} />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#D4AF37]/70 uppercase tracking-widest mb-1.5 block">Email *</label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jean.dupont@email.com" required
                className="border-[#D4AF37]/20 text-white placeholder:text-white/15 focus:border-[#D4AF37]/50"
                style={{background: 'rgba(212,175,55,0.05)'}} />
              <p className="text-xs text-white/25 mt-1">Votre billet QR vous sera transmis à cette adresse</p>
            </div>

            <div>
              <label className="text-xs text-[#D4AF37]/70 uppercase tracking-widest mb-1.5 block">Téléphone</label>
              <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+32 470 00 00 00"
                className="border-[#D4AF37]/20 text-white placeholder:text-white/15 focus:border-[#D4AF37]/50"
                style={{background: 'rgba(212,175,55,0.05)'}} />
            </div>

            {/* Quantité */}
            <div>
              <label className="text-xs text-[#D4AF37]/70 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Nombre de places *
              </label>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => set('quantity', Math.max(1, (parseInt(form.quantity) || 1) - 1))}
                  className="w-11 h-11 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-xl font-light hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center">−</button>
                <span className="text-3xl font-serif font-bold text-white w-10 text-center" style={{fontFamily: "'Playfair Display', serif"}}>{form.quantity}</span>
                <button type="button" onClick={() => set('quantity', Math.min(10, (parseInt(form.quantity) || 1) + 1))}
                  className="w-11 h-11 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-xl font-light hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center">+</button>
                <div className="ml-4 text-right">
                  <p className="text-xs text-white/30">Total</p>
                  <p className="text-2xl font-bold text-[#D4AF37]" style={{textShadow: '0 0 20px rgba(212,175,55,0.4)'}}>{total.toFixed(2)} €</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400/90 text-sm bg-red-400/8 border border-red-400/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <GoldDivider />

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-base text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{background: loading ? 'rgba(212,175,55,0.4)' : 'linear-gradient(135deg, #D4AF37, #F5D76E)', boxShadow: '0 8px 30px rgba(212,175,55,0.3)'}}>
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Redirection vers le paiement…</>
              ) : (
                <><Ticket className="w-5 h-5" /> Réserver — {total.toFixed(2)} €</>
              )}
            </button>
            <p className="text-xs text-white/20 text-center">Paiement 100% sécurisé par Stripe</p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// Wrapper pour les vues succès/annulation
function PageShell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{background: 'radial-gradient(ellipse at top, #1a1408 0%, #0A0A0F 60%)'}}>
      {children}
    </div>
  );
}