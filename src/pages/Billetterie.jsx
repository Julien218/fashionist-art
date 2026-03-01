import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import FreeBadge from '@/components/shared/FreeBadge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Ticket, Check, Loader2, CalendarPlus, MapPin, Calendar } from 'lucide-react';
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
    await base44.entities.Registration.create({ ...form, source: 'website' });
    await base44.integrations.Core.SendEmail({
      to: form.email,
      subject: "Confirmation d'inscription — Fashionist'ART — 18 avril 2026",
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#fff;padding:40px;border-radius:16px;"><h1 style="color:#FF2D8A;">Fashionist'<span style="color:#fff;font-weight:900;">ART</span></h1><h2 style="color:#fff;">Votre inscription est confirmée !</h2><p>Bonjour ${form.first_name} ${form.last_name},</p><p style="color:#aaa;">Votre inscription à <strong style="color:#fff;">Fashionist'ART</strong> est bien enregistrée.</p><div style="background:rgba(255,45,138,0.1);border:1px solid rgba(255,45,138,0.3);border-radius:12px;padding:20px;text-align:center;margin:20px 0;"><p style="margin:0;color:#FF2D8A;font-weight:700;font-size:18px;">📅 18 avril 2026</p><p style="margin:5px 0 0;color:#aaa;">📍 Centre Sportif d'Élouges (Dour), Belgique</p><span style="display:inline-block;margin-top:10px;background:linear-gradient(135deg,#D4AF37,#F5D76E);color:#000;padding:4px 16px;border-radius:20px;font-weight:700;font-size:12px;">🎉 ENTRÉE GRATUITE</span></div><p style="color:#aaa;">À très bientôt !</p><p style="color:#555;font-size:11px;">© 2026 Fashionist'ART</p></div>`
    });
    setLoading(false);
    setSuccess(true);
  };

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Fashionist'ART")}&dates=20260418T080000Z/20260418T200000Z&details=${encodeURIComponent("Fashionist'ART — Entrée gratuite !")}&location=${encodeURIComponent("Centre Sportif d'Élouges, Dour, Belgique")}`;

  if (success) {
    return (
      <div className="py-20 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto glass-dark neon-border rounded-3xl p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 mx-auto mb-6 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">Inscription confirmée !</h2>
          <p className="text-white/50 mb-6">Un e-mail de confirmation vous a été envoyé. Rendez-vous le <strong className="text-white">18 avril 2026</strong> au <strong className="text-white">Centre Sportif d'Élouges (Dour)</strong>.</p>
          <FreeBadge className="mb-6" />
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={googleCalUrl} target="_blank" rel="noopener noreferrer" className="btn-outline flex items-center justify-center gap-2 text-sm">
              <CalendarPlus className="w-4 h-4" /> Ajouter à mon agenda
            </a>
            <Link to={createPageUrl('Programme')} className="btn-primary text-sm text-center justify-center">Voir le programme</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6"><FreeBadge /></div>
        <SectionTitle title="Billetterie" subtitle="Entrée gratuite — inscription recommandée" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark neon-border rounded-3xl p-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/50 mb-8 p-4 rounded-2xl bg-white/3 border border-white/5">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#FF2D8A]" /> 18 avril 2026</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#FF2D8A]" /> Centre Sportif d'Élouges (Dour)</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Prénom *</label>
                <Input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" placeholder="Votre prénom" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Nom *</label>
                <Input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" placeholder="Votre nom" />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">E-mail *</label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" placeholder="votre@email.com" />
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <Checkbox id="terms" checked={form.accepts_terms} onCheckedChange={(v) => setForm({ ...form, accepts_terms: v })} className="mt-0.5 border-white/20" />
                <label htmlFor="terms" className="text-xs text-white/40 cursor-pointer">
                  J'accepte les <Link to={createPageUrl('Legal')} className="text-[#FF2D8A] underline">conditions générales</Link> et la <Link to={createPageUrl('Privacy')} className="text-[#FF2D8A] underline">politique de confidentialité</Link>. *
                </label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="contact" checked={form.accepts_contact} onCheckedChange={(v) => setForm({ ...form, accepts_contact: v })} className="mt-0.5 border-white/20" />
                <label htmlFor="contact" className="text-xs text-white/40 cursor-pointer">
                  J'accepte d'être contacté(e) au sujet de l'événement. (facultatif)
                </label>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="btn-primary w-full h-14 text-base rounded-full border-0">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ticket className="w-5 h-5" />}
              Je m'inscris – C'est gratuit !
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}