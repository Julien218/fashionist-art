import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import FreeBadge from '@/components/shared/FreeBadge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Ticket, Check, Loader2, CalendarPlus, MapPin, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Billetterie() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', accepts_terms: false, accepts_contact: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.accepts_terms) { toast.error('Veuillez accepter les conditions générales.'); return; }
    setLoading(true);

    await base44.entities.Registration.create({
      ...form,
      source: 'website'
    });

    // Send confirmation email
    await base44.integrations.Core.SendEmail({
      to: form.email,
      subject: "Confirmation d'inscription — Fashionist'ART — 18 avril 2026",
      body: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF8F0; padding: 40px 30px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-family: 'Dancing Script', cursive; font-size: 32px; color: #C2185B;">Fashionist'</span><span style="font-family: 'Montserrat', sans-serif; font-weight: 900; font-size: 28px; color: #2D2024;">ART</span>
          </div>
          <h1 style="text-align: center; color: #2D2024; font-size: 24px; margin-bottom: 20px;">Votre inscription est confirmée !</h1>
          <p style="color: #2D2024; font-size: 16px;">Bonjour ${form.first_name} ${form.last_name},</p>
          <p style="color: #555; font-size: 14px; line-height: 1.6;">Nous avons bien enregistré votre inscription à <strong>Fashionist'ART</strong>.</p>
          <div style="background: linear-gradient(135deg, #F2C4CE22, #D4AF3722); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #C2185B; font-weight: 700; font-size: 18px;">📅 18 avril 2026</p>
            <p style="margin: 5px 0 0; color: #555; font-size: 14px;">📍 Centre Sportif d'Élouges (Dour), Belgique</p>
            <p style="margin: 10px 0 0; background: linear-gradient(135deg, #D4AF37, #E8C547); color: #2D2024; display: inline-block; padding: 4px 16px; border-radius: 20px; font-weight: 700; font-size: 12px;">✦ ENTRÉE GRATUITE</p>
          </div>
          <p style="color: #555; font-size: 14px; line-height: 1.6;">Nous avons hâte de vous accueillir !</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">© 2026 Fashionist'ART — Tous droits réservés</p>
        </div>
      `
    });

    setLoading(false);
    setSuccess(true);
    toast.success('Inscription confirmée ! Vérifiez votre boîte mail.');
  };

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Fashionist'ART")}&dates=20260418T080000Z/20260418T200000Z&details=${encodeURIComponent("Fashionist'ART — Exposition art & mode. Entrée gratuite.")}&location=${encodeURIComponent("Centre Sportif d'Élouges, Dour, Belgique")}`;

  if (success) {
    return (
      <div className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto glass glow-card rounded-3xl p-10 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 mx-auto mb-6 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-3">Inscription confirmée !</h2>
          <p className="text-[#2D2024]/60 mb-6">
            Un e-mail de confirmation vous a été envoyé. Nous avons hâte de vous accueillir le <strong>18 avril 2026</strong> au <strong>Centre Sportif d'Élouges (Dour)</strong>.
          </p>
          <FreeBadge className="mb-6" />
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={googleCalUrl} target="_blank" rel="noopener noreferrer" className="btn-gold flex items-center justify-center gap-2 text-sm">
              <CalendarPlus className="w-4 h-4" /> Ajouter à mon agenda
            </a>
            <Link to={createPageUrl('Programme')} className="btn-premium text-sm text-center">
              Voir le programme
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <FreeBadge />
        </div>

        <SectionTitle title="Billetterie" subtitle="Entrée gratuite — inscription recommandée" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass glow-card rounded-3xl p-8"
        >
          {/* Event info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#2D2024]/60 mb-8 p-4 rounded-2xl bg-gradient-to-r from-[#C2185B]/5 to-[#D4AF37]/5">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C2185B]" /> 18 avril 2026
            </span>
            <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C2185B]" /> Centre Sportif d'Élouges (Dour)
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#2D2024]/50 mb-1 block">Prénom *</label>
                <Input
                  required
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="rounded-xl border-[#E8A0B4]/40 bg-white/60 h-12"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#2D2024]/50 mb-1 block">Nom *</label>
                <Input
                  required
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="rounded-xl border-[#E8A0B4]/40 bg-white/60 h-12"
                  placeholder="Votre nom"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#2D2024]/50 mb-1 block">E-mail *</label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl border-[#E8A0B4]/40 bg-white/60 h-12"
                placeholder="votre@email.com"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={form.accepts_terms}
                  onCheckedChange={(v) => setForm({ ...form, accepts_terms: v })}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-xs text-[#2D2024]/60 cursor-pointer">
                  J'accepte les <Link to={createPageUrl('Legal')} className="text-[#C2185B] underline">conditions générales</Link> et la <Link to={createPageUrl('Privacy')} className="text-[#C2185B] underline">politique de confidentialité</Link>. *
                </label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="contact"
                  checked={form.accepts_contact}
                  onCheckedChange={(v) => setForm({ ...form, accepts_contact: v })}
                  className="mt-0.5"
                />
                <label htmlFor="contact" className="text-xs text-[#2D2024]/60 cursor-pointer">
                  J'accepte d'être contacté(e) au sujet de l'événement Fashionist'ART. (facultatif)
                </label>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="btn-premium w-full h-14 text-lg gap-3">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ticket className="w-5 h-5" />}
              Je m'inscris gratuitement
            </Button>

            <p className="text-[10px] text-center text-[#2D2024]/40">
              Vos données sont traitées conformément au RGPD. Voir notre <Link to={createPageUrl('Privacy')} className="underline">politique de confidentialité</Link>.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}