import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Check, Loader2, Send, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ParticipantFormPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', age: '', city: '', country: '',
    discipline: '', experience_level: '', motivation: '', portfolio_url: '',
    participation_type: '', special_needs: '', how_did_you_hear: '', consent_rgpd: false,
  });

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    base44.entities.ParticipantForm.filter({ invitation_token: token }).then((results) => {
      if (results.length > 0) {
        const p = results[0];
        setParticipant(p);
        setForm(f => ({
          ...f,
          first_name: p.first_name || '',
          last_name: p.last_name || '',
        }));
        if (p.status === 'valide') setDone(true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.consent_rgpd) { toast.error('Veuillez accepter la politique de confidentialité.'); return; }
    setSubmitting(true);
    await base44.entities.ParticipantForm.update(participant.id, {
      ...form,
      age: form.age ? Number(form.age) : undefined,
      status: 'en_attente',
      submitted_at: new Date().toISOString(),
    });
    setSubmitting(false);
    setDone(true);
    toast.success('Formulaire soumis avec succès !');
  };

  const inputClass = "h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#FF2D8A]/50";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF2D8A]" />
    </div>
  );

  if (!token || !participant) return (
    <div className="py-20 px-4 text-center">
      <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h2 className="font-display font-bold text-2xl text-white mb-3">Lien invalide</h2>
      <p className="text-white/50 mb-6">Ce lien d'invitation est invalide ou a expiré.</p>
      <Link to={createPageUrl('Home')} className="btn-primary">Retour à l'accueil</Link>
    </div>
  );

  if (done) return (
    <div className="py-20 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto glass-dark neon-border rounded-3xl p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 mx-auto mb-6 flex items-center justify-center">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="font-display font-bold text-2xl text-white mb-3">Formulaire soumis !</h2>
        <p className="text-white/50 mb-6">Merci, votre formulaire de participation a bien été reçu. Nous reviendrons vers vous prochainement.</p>
        <Link to={createPageUrl('Home')} className="btn-primary">Retour à l'accueil</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[#FF2D8A] text-xs font-display font-semibold uppercase tracking-widest block mb-3">Formulaire de participation</span>
          <h1 className="font-display font-black text-3xl text-white mb-2">Fashionist'<span className="text-[#FF2D8A]">ART</span></h1>
          <p className="text-white/50 text-sm">18 avril 2026 · Centre Sportif d'Élouges, Dour</p>
        </div>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} className="glass-dark neon-border rounded-3xl p-8 space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-white/40 mb-1 block">Prénom *</label>
              <Input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className={inputClass} placeholder="Prénom" /></div>
            <div><label className="text-xs text-white/40 mb-1 block">Nom *</label>
              <Input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className={inputClass} placeholder="Nom" /></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-white/40 mb-1 block">Téléphone</label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} placeholder="+32 ..." /></div>
            <div><label className="text-xs text-white/40 mb-1 block">Âge</label>
              <Input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className={inputClass} placeholder="Ex: 28" /></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-white/40 mb-1 block">Ville</label>
              <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={inputClass} placeholder="Ville" /></div>
            <div><label className="text-xs text-white/40 mb-1 block">Pays</label>
              <Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} className={inputClass} placeholder="Belgique" /></div>
          </div>

          <div><label className="text-xs text-white/40 mb-1 block">Discipline artistique / domaine *</label>
            <Input required value={form.discipline} onChange={e => setForm({...form, discipline: e.target.value})} className={inputClass} placeholder="Ex: peinture, photographie, mode..." /></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-white/40 mb-1 block">Niveau d'expérience</label>
              <Select value={form.experience_level} onValueChange={v => setForm({...form, experience_level: v})}>
                <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="debutant">Débutant</SelectItem>
                  <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                  <SelectItem value="avance">Avancé</SelectItem>
                  <SelectItem value="professionnel">Professionnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-xs text-white/40 mb-1 block">Type de participation *</label>
              <Select value={form.participation_type} onValueChange={v => setForm({...form, participation_type: v})}>
                <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exposant">Exposant</SelectItem>
                  <SelectItem value="performeur">Performeur</SelectItem>
                  <SelectItem value="visiteur">Visiteur</SelectItem>
                  <SelectItem value="benevole">Bénévole</SelectItem>
                  <SelectItem value="partenaire">Partenaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div><label className="text-xs text-white/40 mb-1 block">Motivation / Pourquoi participer ? *</label>
            <Textarea required value={form.motivation} onChange={e => setForm({...form, motivation: e.target.value})}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#FF2D8A]/50 min-h-[100px]"
              placeholder="Parlez-nous de votre motivation..." /></div>

          <div><label className="text-xs text-white/40 mb-1 block">Lien portfolio / réseaux sociaux</label>
            <Input value={form.portfolio_url} onChange={e => setForm({...form, portfolio_url: e.target.value})} className={inputClass} placeholder="https://..." /></div>

          <div><label className="text-xs text-white/40 mb-1 block">Besoins spéciaux / accessibilité</label>
            <Input value={form.special_needs} onChange={e => setForm({...form, special_needs: e.target.value})} className={inputClass} placeholder="Ex: fauteuil roulant, régime alimentaire..." /></div>

          <div><label className="text-xs text-white/40 mb-1 block">Comment avez-vous entendu parler de l'événement ?</label>
            <Input value={form.how_did_you_hear} onChange={e => setForm({...form, how_did_you_hear: e.target.value})} className={inputClass} placeholder="Réseaux sociaux, bouche à oreille..." /></div>

          <div className="flex items-start gap-2 pt-2">
            <Checkbox id="rgpd" checked={form.consent_rgpd} onCheckedChange={v => setForm({...form, consent_rgpd: v})} className="mt-0.5 border-white/20" />
            <label htmlFor="rgpd" className="text-xs text-white/40 cursor-pointer">
              J'accepte que mes données soient traitées conformément au RGPD pour la gestion de ma participation à Fashionist'ART. *
            </label>
          </div>

          <Button type="submit" disabled={submitting} className="btn-primary w-full h-14 text-base rounded-full border-0">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Soumettre ma candidature
          </Button>
        </motion.form>
      </div>
    </div>
  );
}