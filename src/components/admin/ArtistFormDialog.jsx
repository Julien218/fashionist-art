import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Plus, Trash2, Image } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = {
  name: '', first_name: '', last_name: '', stage_name: '', email: '', phone: '',
  category: '', discipline: '', photo_url: '', short_bio: '', full_bio: '',
  website: '', instagram: '', facebook: '', tiktok: '', youtube: '', linkedin: '',
  consent_diffusion: false, status: 'active', display_order: '', works: [],
};

export default function ArtistFormDialog({ open, onOpenChange, artist, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [uploadingWork, setUploadingWork] = useState(null); // index or null

  const handleUploadPortrait = async (file) => {
    if (!file) return;
    setUploadingPortrait(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('photo_url', file_url);
    setUploadingPortrait(false);
  };

  const handleUploadWork = async (file, idx) => {
    if (!file) return;
    setUploadingWork(idx);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const works = [...(form.works || [])];
    works[idx] = { ...works[idx], image_url: file_url };
    set('works', works);
    setUploadingWork(null);
  };

  const addWork = () => set('works', [...(form.works || []), { title: '', image_url: '', description: '' }]);
  const removeWork = (idx) => set('works', (form.works || []).filter((_, i) => i !== idx));
  const updateWork = (idx, key, val) => {
    const works = [...(form.works || [])];
    works[idx] = { ...works[idx], [key]: val };
    set('works', works);
  };

  useEffect(() => {
    if (artist) setForm({ ...EMPTY, ...artist });
    else setForm(EMPTY);
  }, [artist, open]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name && !form.stage_name && !(form.first_name && form.last_name)) {
      toast.error('Un nom ou nom de scène est requis.'); return;
    }
    setSaving(true);
    const data = { ...form, display_order: form.display_order ? Number(form.display_order) : undefined };
    if (!data.name) data.name = data.stage_name || `${data.first_name} ${data.last_name}`.trim();
    if (artist?.id) await base44.entities.Artist.update(artist.id, data);
    else await base44.entities.Artist.create(data);
    toast.success(artist?.id ? 'Artiste mis à jour !' : 'Artiste créé !');
    setSaving(false);
    onSaved();
  };

  const F = ({ label, k, type = 'text', placeholder }) => (
    <div>
      <label className="text-xs text-white/40 mb-1 block">{label}</label>
      <Input type={type} value={form[k] || ''} onChange={e => set(k, e.target.value)}
        placeholder={placeholder} className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-9 text-sm" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-bold">{artist?.id ? 'Modifier l\'artiste' : 'Ajouter un artiste'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <F label="Prénom" k="first_name" />
            <F label="Nom" k="last_name" />
            <F label="Nom de scène" k="stage_name" />
          </div>
          <F label="Nom complet (affiché)" k="name" placeholder="Nom affiché sur le site" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Email" k="email" type="email" />
            <F label="Téléphone" k="phone" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Catégorie" k="category" placeholder="ex: Musique" />
            <F label="Discipline" k="discipline" placeholder="ex: Chanteur" />
          </div>
          {/* Photo portrait */}
          <div>
            <label className="text-xs text-white/40 mb-2 block">Photo portrait</label>
            <div className="flex items-center gap-3">
              {form.photo_url
                ? <img src={form.photo_url} className="w-16 h-16 rounded-full object-cover border border-white/10 flex-shrink-0" alt="portrait" />
                : <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center flex-shrink-0"><Image className="w-6 h-6 text-white/20" /></div>
              }
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 text-xs text-white/60 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors w-fit">
                  {uploadingPortrait ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  {uploadingPortrait ? 'Upload...' : 'Uploader une photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleUploadPortrait(e.target.files[0])} />
                </label>
                <Input value={form.photo_url || ''} onChange={e => set('photo_url', e.target.value)}
                  placeholder="ou coller un lien URL..." className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-8 text-xs" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Bio courte</label>
            <Textarea value={form.short_bio} onChange={e => set('short_bio', e.target.value)} className="bg-white/5 border-white/10 text-white h-16 text-sm" />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Bio complète</label>
            <Textarea value={form.full_bio} onChange={e => set('full_bio', e.target.value)} className="bg-white/5 border-white/10 text-white h-24 text-sm" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <F label="Instagram" k="instagram" />
            <F label="Facebook" k="facebook" />
            <F label="TikTok" k="tiktok" />
            <F label="YouTube" k="youtube" />
            <F label="LinkedIn" k="linkedin" />
            <F label="Site web" k="website" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Statut</label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <F label="Ordre d'affichage" k="display_order" type="number" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="consent_d" checked={form.consent_diffusion} onCheckedChange={v => set('consent_diffusion', v)} className="border-white/20" />
            <label htmlFor="consent_d" className="text-sm text-white/60 cursor-pointer">Consentement diffusion</label>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-[#FF2D8A] hover:bg-[#C2185B] text-white h-11 font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}