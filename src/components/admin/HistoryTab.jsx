import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Send, CheckCircle2, Globe, Users, Upload, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill';

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'bg-gray-500/10 text-gray-400' },
  PENDING_VALIDATION: { label: 'En validation', color: 'bg-yellow-500/10 text-yellow-400' },
  APPROVED: { label: 'Approuvé ✓', color: 'bg-green-500/10 text-green-400' },
  REJECTED: { label: 'Refusé', color: 'bg-red-500/10 text-red-400' },
  PUBLISHED: { label: 'Publié', color: 'bg-[#FF2D8A]/10 text-[#FF2D8A]' },
};

export default function HistoryTab({ user }) {
  const [activeView, setActiveView] = useState('drafts'); // 'drafts' | 'edit' | 'organizers'
  const [editDraft, setEditDraft] = useState(null);
  const [draftForm, setDraftForm] = useState({ title: "Histoire de Fashionist'ART", content_html: '' });
  const [orgEmail, setOrgEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [sending, setSending] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const qc = useQueryClient();

  // Drafts
  const { data: drafts = [], isLoading } = useQuery({
    queryKey: ['history-drafts'],
    queryFn: () => base44.entities.HistoryDraft.list('-created_at', 50),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const now = new Date().toISOString();
      if (editDraft?.id) {
        return base44.entities.HistoryDraft.update(editDraft.id, { ...data, updated_at: now, updated_by_user_id: user.id });
      }
      return base44.entities.HistoryDraft.create({ ...data, status: 'DRAFT', created_at: now, updated_at: now, created_by_user_id: user.id });
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['history-drafts'] });
      setEditDraft(saved);
      toast.success('Brouillon enregistré !');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSendValidation = async () => {
    if (!orgEmail || !orgName) return toast.error('Email et nom organisateur requis');
    if (!editDraft?.id) return toast.error('Sauvegardez d\'abord le brouillon');
    setSending(true);
    const res = await base44.functions.invoke('sendHistoryValidationLink', {
      draft_id: editDraft.id,
      organizer_email: orgEmail,
      organizer_name: orgName,
      app_url: window.location.origin,
    });
    setSending(false);
    if (res.data?.success) {
      toast.success(`Lien envoyé à ${orgEmail}`);
      qc.invalidateQueries({ queryKey: ['history-drafts'] });
    } else {
      toast.error(res.data?.error || 'Erreur envoi');
    }
  };

  const handlePublish = async (draft, force = false) => {
    setPublishing(true);
    const res = await base44.functions.invoke('publishApprovedHistory', { draft_id: draft.id, force });
    setPublishing(false);
    if (res.data?.success) {
      toast.success('Page publiée !');
      qc.invalidateQueries({ queryKey: ['history-drafts'] });
      setActiveView('drafts');
    } else {
      toast.error(res.data?.error || 'Erreur publication');
    }
  };

  const openEdit = (draft) => {
    setEditDraft(draft);
    setDraftForm({ title: draft.title, content_html: draft.content_html || '' });
    setOrgEmail(draft.organizer_email || '');
    setOrgName(draft.organizer_name || '');
    setActiveView('edit');
  };

  const openNew = () => {
    setEditDraft(null);
    setDraftForm({ title: "Histoire de Fashionist'ART", content_html: '' });
    setOrgEmail('');
    setOrgName('');
    setActiveView('edit');
  };

  return (
    <div className="space-y-6">
      {/* Nav */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={() => setActiveView('drafts')} variant={activeView === 'drafts' ? 'default' : 'outline'}
          className={activeView === 'drafts' ? 'bg-[#FF2D8A] hover:bg-[#C2185B] text-white' : 'border-white/20 text-white/70'}>
          <Pencil className="w-4 h-4" /> Brouillons
        </Button>
        <Button onClick={() => setActiveView('organizers')} variant={activeView === 'organizers' ? 'default' : 'outline'}
          className={activeView === 'organizers' ? 'bg-[#D4AF37] hover:bg-[#B8960C] text-black' : 'border-white/20 text-white/70'}>
          <Users className="w-4 h-4" /> Organisateurs
        </Button>
        <Button onClick={openNew} className="bg-white/10 hover:bg-white/20 text-white ml-auto gap-1">
          <Plus className="w-4 h-4" /> Nouveau brouillon
        </Button>
      </div>

      {/* DRAFTS LIST */}
      {activeView === 'drafts' && (
        <div className="space-y-3">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /> : drafts.length === 0 ? (
            <p className="text-center text-white/40 py-10">Aucun brouillon. Créez-en un !</p>
          ) : drafts.map((d) => (
            <div key={d.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-display font-semibold text-white text-sm">{d.title}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {new Date(d.updated_at || d.created_at || d.created_date).toLocaleDateString('fr-FR')}
                  {d.organizer_name && <> · {d.organizer_name}</>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={STATUS_CONFIG[d.status]?.color || 'bg-gray-500/10 text-gray-400'}>
                  {STATUS_CONFIG[d.status]?.label || d.status}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => openEdit(d)} className="text-white/60 hover:text-white">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                {(d.status === 'APPROVED' || (d.status === 'REJECTED' && user.role === 'super_admin')) && (
                  <Button size="sm" onClick={() => handlePublish(d, d.status === 'REJECTED')}
                    disabled={publishing}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs gap-1">
                    {publishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                    Publier
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT */}
      {activeView === 'edit' && (
        <div className="space-y-5">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-white">
                {editDraft ? 'Modifier le brouillon' : 'Nouveau brouillon'}
              </h3>
              {editDraft && (
                <Badge className={STATUS_CONFIG[editDraft.status]?.color}>{STATUS_CONFIG[editDraft.status]?.label}</Badge>
              )}
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Titre</label>
              <Input value={draftForm.title} onChange={(e) => setDraftForm({ ...draftForm, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white" />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Contenu</label>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-white">
                <ReactQuill
                  theme="snow"
                  value={draftForm.content_html}
                  onChange={(v) => setDraftForm({ ...draftForm, content_html: v })}
                  style={{ minHeight: '300px', color: '#000' }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => saveMutation.mutate(draftForm)} disabled={saveMutation.isPending}
                className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Enregistrer brouillon
              </Button>
              <Button onClick={() => setActiveView('drafts')} variant="ghost" className="text-white/60">Retour</Button>
            </div>
          </div>

          {/* Envoyer lien de validation */}
          {editDraft && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-[#FF2D8A]" /> Envoyer pour validation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Nom de l'organisateur</label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="ex: Julien Martin"
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Email de l'organisateur</label>
                  <Input type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} placeholder="ex: julien@fashionistart.be"
                    className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <Button onClick={handleSendValidation} disabled={sending}
                className="bg-[#D4AF37] hover:bg-[#B8960C] text-black font-semibold gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer le lien de validation
              </Button>
              {editDraft.status === 'PENDING_VALIDATION' && (
                <p className="text-xs text-yellow-400">⏳ Lien envoyé à {editDraft.organizer_email} — en attente de décision.</p>
              )}
            </div>
          )}

          {/* Publication (super_admin ou admin si approuvé) */}
          {editDraft && (editDraft.status === 'APPROVED' || (editDraft.status === 'REJECTED' && user.role === 'super_admin')) && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-display font-semibold text-green-300">
                  {editDraft.status === 'APPROVED' ? '✅ Approuvé — prêt à publier' : '⚠️ Refusé — publication forcée (super admin)'}
                </p>
                {editDraft.organizer_decision_note && (
                  <p className="text-xs text-white/50 mt-1">Note : {editDraft.organizer_decision_note}</p>
                )}
              </div>
              <Button onClick={() => handlePublish(editDraft, editDraft.status === 'REJECTED')}
                disabled={publishing} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                Publier maintenant
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ORGANIZERS */}
      {activeView === 'organizers' && <OrganizerManager />}
    </div>
  );
}

function OrganizerManager() {
  const [form, setForm] = useState({ name: '', role_title: '', bio: '', email: '', socials: '', order: 0, active: true });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const { data: organizers = [], isLoading } = useQuery({
    queryKey: ['organizers'],
    queryFn: () => base44.entities.Organizer.list('order', 50),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editId ? base44.entities.Organizer.update(editId, data) : base44.entities.Organizer.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizers'] });
      setShowForm(false);
      setEditId(null);
      toast.success('Enregistré !');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Organizer.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['organizers'] }); toast.success('Supprimé !'); },
  });

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, photo: file_url }));
    setUploading(false);
  };

  const openEdit = (org) => {
    setEditId(org.id);
    setForm({ name: org.name || '', role_title: org.role_title || '', bio: org.bio || '', email: org.email || '', socials: org.socials || '', order: org.order || 0, active: org.active !== false, photo: org.photo || '' });
    setShowForm(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm({ name: '', role_title: '', bio: '', email: '', socials: '', order: 0, active: true });
    setShowForm(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-white">Organisateurs</h3>
        <Button onClick={openNew} size="sm" className="bg-[#D4AF37] hover:bg-[#B8960C] text-black gap-1">
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </Button>
      </div>

      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white/40" /> : (
        <div className="space-y-3">
          {organizers.map((org) => (
            <div key={org.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
              {org.photo && <img src={org.photo} alt={org.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#FF2D8A]/30" />}
              {!org.photo && <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white/50">{org.name[0]}</div>}
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{org.name}</p>
                <p className="text-xs text-white/40">{org.role_title || ''}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(org)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { if (confirm('Supprimer ?')) deleteMutation.mutate(org.id); }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
              </div>
            </div>
          ))}
          {organizers.length === 0 && <p className="text-center text-white/40 py-6 text-sm">Aucun organisateur</p>}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Modifier' : 'Ajouter'} un organisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="Titre / Rôle" value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <textarea placeholder="Biographie" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white p-2 text-sm min-h-[80px] resize-y" />
            <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder='Réseaux (JSON: {"instagram":"...","website":"..."})' value={form.socials} onChange={(e) => setForm({ ...form, socials: e.target.value })} className="bg-white/5 border-white/10 text-white text-xs" />
            <Input placeholder="Ordre affichage" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="bg-white/5 border-white/10 text-white" />
            <div>
              <label className="text-xs text-white/40 mb-1 block">Photo</label>
              {form.photo && <img src={form.photo} alt="" className="w-16 h-16 rounded-full object-cover mb-2" />}
              <label className="flex items-center gap-2 cursor-pointer text-sm text-white/60 hover:text-white border border-white/10 rounded-lg px-3 py-2">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Upload...' : 'Choisir une photo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
              </label>
            </div>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white w-full">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}