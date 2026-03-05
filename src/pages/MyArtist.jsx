import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, User, CheckCircle2, Clock, XCircle, Save, Palette } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'En attente de validation', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
  approved: { label: 'Profil approuvé ✓', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle2 },
  active: { label: 'Profil actif', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle2 },
  rejected: { label: 'Profil refusé', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
  inactive: { label: 'Inactif', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: XCircle },
};

export default function MyArtist() {
  const [user, setUser] = useState(null);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    base44.auth.me()
      .then(async (u) => {
        setUser(u);
        const list = await base44.entities.Artist.filter({ owner_user_id: u.id });
        if (list && list.length > 0) {
          setArtist(list[0]);
          setForm(buildForm(list[0]));
        }
        setLoading(false);
      })
      .catch(() => {
        base44.auth.redirectToLogin(window.location.pathname);
      });
  }, []);

  const buildForm = (a) => ({
    name: a.name || '',
    stage_name: a.stage_name || '',
    discipline: a.discipline || '',
    short_bio: a.short_bio || '',
    full_bio: a.full_bio || '',
    photo_url: a.photo_url || '',
    phone: a.phone || '',
    email: a.email || '',
    website: a.website || '',
    instagram: a.instagram || '',
    facebook: a.facebook || '',
    tiktok: a.tiktok || '',
    youtube: a.youtube || '',
    linkedin: a.linkedin || '',
    promo_video_url: a.promo_video_url || '',
    consent_diffusion: a.consent_diffusion || false,
  });

  const handleCreate = async () => {
    setCreating(true);
    const newArtist = await base44.entities.Artist.create({
      name: user.full_name || user.email,
      discipline: 'Non défini',
      owner_user_id: user.id,
      status: 'pending',
    });
    setArtist(newArtist);
    setForm(buildForm(newArtist));
    setCreating(false);
    toast.success('Fiche artiste créée ! Complétez vos informations.');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const updated = await base44.entities.Artist.update(artist.id, form);
    setArtist(updated);
    toast.success('Profil mis à jour !');
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF2D8A]" />
    </div>
  );

  const statusCfg = STATUS_CONFIG[artist?.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-[#FF2D8A]/10 flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-[#FF2D8A]" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Mon espace artiste</h1>
          <p className="text-white/40 text-sm">Gérez votre fiche et votre présence sur Fashionist'ART</p>
        </div>

        {!artist ? (
          <div className="glass-dark neon-border rounded-3xl p-10 text-center">
            <User className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-white mb-3">Vous n'avez pas encore de fiche artiste</h2>
            <p className="text-white/40 text-sm mb-6">Créez votre fiche pour apparaître sur le site et participer à Fashionist'ART.</p>
            <Button onClick={handleCreate} disabled={creating} className="btn-primary border-0">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
              Créer ma fiche artiste
            </Button>
          </div>
        ) : (
          <div>
            {/* Status badge */}
            <div className="flex justify-center mb-6">
              <Badge className={`${statusCfg.color} flex items-center gap-1.5 px-4 py-1.5`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusCfg.label}
              </Badge>
            </div>

            <form onSubmit={handleSave} className="glass-dark neon-border rounded-3xl p-8 space-y-6">
              {/* Photo preview */}
              {form.photo_url && (
                <div className="flex justify-center">
                  <img src={form.photo_url} alt="Photo" className="w-28 h-28 rounded-full object-cover border-2 border-[#FF2D8A]/30" />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Nom complet *</label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Nom de scène</label>
                  <Input value={form.stage_name} onChange={e => setForm({ ...form, stage_name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Discipline *</label>
                  <Input value={form.discipline} onChange={e => setForm({ ...form, discipline: e.target.value })} required
                    placeholder="Danse, Peinture, Mode..." className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Photo (URL)</label>
                  <Input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })}
                    placeholder="https://..." className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Téléphone</label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Email contact</label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">Bio courte</label>
                <Textarea value={form.short_bio} onChange={e => setForm({ ...form, short_bio: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-20 placeholder:text-white/20" placeholder="2-3 phrases de présentation..." />
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">Bio complète</label>
                <Textarea value={form.full_bio} onChange={e => setForm({ ...form, full_bio: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-28 placeholder:text-white/20" placeholder="Biographie détaillée..." />
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">Vidéo promo (YouTube, Vimeo...)</label>
                <Input value={form.promo_video_url} onChange={e => setForm({ ...form, promo_video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..." className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'website', label: 'Site web', ph: 'https://...' },
                  { key: 'instagram', label: 'Instagram', ph: 'https://instagram.com/...' },
                  { key: 'facebook', label: 'Facebook', ph: 'https://facebook.com/...' },
                  { key: 'tiktok', label: 'TikTok', ph: 'https://tiktok.com/@...' },
                  { key: 'youtube', label: 'YouTube', ph: 'https://youtube.com/...' },
                  { key: 'linkedin', label: 'LinkedIn', ph: 'https://linkedin.com/in/...' },
                ].map(({ key, label, ph }) => (
                  <div key={key}>
                    <label className="text-xs text-white/40 mb-1 block">{label}</label>
                    <Input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      placeholder={ph} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/3 border border-white/5">
                <Checkbox id="consent" checked={form.consent_diffusion}
                  onCheckedChange={v => setForm({ ...form, consent_diffusion: v })}
                  className="mt-0.5 border-white/20" />
                <label htmlFor="consent" className="text-sm text-white/60 cursor-pointer">
                  J'autorise Fashionist'ART à diffuser ma photo et mes informations sur leurs supports de communication.
                </label>
              </div>

              <Button type="submit" disabled={saving} className="btn-primary w-full h-12 rounded-full border-0 text-base">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer mon profil
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}