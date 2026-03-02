import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ArtistComplete() {
  const [token, setToken] = useState('');
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    setToken(t || '');
    if (!t) { setError('Token manquant.'); setLoading(false); return; }
    loadArtist(t);
  }, []);

  const loadArtist = async (t) => {
    try {
      const artists = await base44.entities.Artist.filter({ info_request_token: t });
      if (!artists || artists.length === 0) { setError('Lien invalide ou expiré.'); setLoading(false); return; }
      const a = artists[0];
      // Check expiration
      if (a.info_request_token_expires_at) {
        const exp = new Date(a.info_request_token_expires_at);
        if (exp < new Date()) { setError('Ce lien a expiré. Contactez les organisateurs.'); setLoading(false); return; }
      }
      setArtist(a);
      setForm({
        photo_url: a.photo_url || '',
        short_bio: a.short_bio || '',
        full_bio: a.full_bio || '',
        instagram: a.instagram || '',
        facebook: a.facebook || '',
        tiktok: a.tiktok || '',
        youtube: a.youtube || '',
        website: a.website || '',
        consent_diffusion: a.consent_diffusion || false,
      });
    } catch (e) {
      setError('Erreur lors du chargement. Réessayez plus tard.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Artist.update(artist.id, {
        ...form,
        info_request_token: null,
        info_request_token_expires_at: null,
      });
      setSuccess(true);
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde.');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF2D8A]" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-dark neon-border rounded-3xl p-10 text-center">
        <AlertCircle className="w-16 h-16 text-red-400/60 mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl text-white mb-3">Lien invalide</h2>
        <p className="text-white/50 mb-4">{error}</p>
        <a href="mailto:contact@fashionistart.be" className="text-[#FF2D8A] underline text-sm">contact@fashionistart.be</a>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-dark neon-border rounded-3xl p-10 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl text-white mb-3">Fiche mise à jour !</h2>
        <p className="text-white/50">Merci {artist?.stage_name || artist?.first_name || artist?.name} ! Tes informations ont bien été enregistrées.</p>
      </div>
    </div>
  );

  const artistName = artist?.stage_name || `${artist?.first_name || ''} ${artist?.last_name || ''}`.trim() || artist?.name;

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="mb-4">
            <span className="font-script text-3xl text-[#FF2D8A]">Fashionist'</span>
            <span className="font-display font-black text-3xl text-white">ART</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Ma fiche artiste</h1>
          <p className="text-white/50">Bonjour <strong className="text-white">{artistName}</strong> — complète tes informations pour apparaître sur le site.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-dark neon-border rounded-3xl p-8 space-y-6">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Photo (URL) *</label>
            <Input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })}
              className="bg-white/5 border-white/10 text-white" placeholder="https://..." />
            {form.photo_url && <img src={form.photo_url} alt="preview" className="mt-2 w-24 h-24 rounded-full object-cover border border-white/10" />}
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1 block">Bio courte *</label>
            <Textarea value={form.short_bio} onChange={e => setForm({ ...form, short_bio: e.target.value })}
              className="bg-white/5 border-white/10 text-white h-20" placeholder="2-3 phrases de présentation..." />
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1 block">Bio complète</label>
            <Textarea value={form.full_bio} onChange={e => setForm({ ...form, full_bio: e.target.value })}
              className="bg-white/5 border-white/10 text-white h-32" placeholder="Biographie détaillée..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
              { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
              { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
              { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
              { key: 'website', label: 'Site web', placeholder: 'https://...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-white/40 mb-1 block">{label}</label>
                <Input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="bg-white/5 border-white/10 text-white" placeholder={placeholder} />
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/3 border border-white/5">
            <Checkbox id="consent" checked={form.consent_diffusion}
              onCheckedChange={v => setForm({ ...form, consent_diffusion: v })}
              className="mt-0.5 border-white/20" />
            <label htmlFor="consent" className="text-sm text-white/60 cursor-pointer">
              J'autorise Fashionist'ART à diffuser ma photo et mes informations sur leurs supports de communication (site, réseaux sociaux, affiches...).
            </label>
          </div>

          <Button type="submit" disabled={saving} className="btn-primary w-full h-14 text-base rounded-full border-0">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : '✅ Valider ma fiche artiste'}
          </Button>
        </form>
      </div>
    </div>
  );
}