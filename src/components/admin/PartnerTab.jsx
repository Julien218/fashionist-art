import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Upload, Loader2, Pencil, Trash2, Plus, Check, X, Zap, Send } from 'lucide-react';

const STATUS_COLORS = {
  draft: 'bg-yellow-500/10 text-yellow-400',
  pending_approval: 'bg-orange-500/10 text-orange-400',
  approved: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
};

export default function PartnerTab({ user }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: 'sponsor',
    website: '',
    logo_file: null,
    description: '',
    short_description: '',
    tags: '',
    status: 'draft',
    order: 0,
  });

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => base44.asServiceRole.entities.Partner.list('-order', 100),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.asServiceRole.entities.Partner.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setDialogOpen(false);
      resetForm();
      toast.success('Partenaire créé !');
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.asServiceRole.entities.Partner.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setDialogOpen(false);
      resetForm();
      toast.success('Partenaire mis à jour !');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.Partner.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Partenaire supprimé !');
    },
    onError: (err) => toast.error(err.message),
  });

  const generateMutation = useMutation({
    mutationFn: (partnerId) => base44.functions.invoke('generatePartnerDescription', { partner_id: partnerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Description générée !');
    },
    onError: (err) => toast.error(err.message),
  });

  const submitMutation = useMutation({
    mutationFn: (partnerId) => base44.functions.invoke('submitPartnerForApproval', { partner_id: partnerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Partenaire soumis pour validation');
    },
    onError: (err) => toast.error(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: (partnerId) => base44.functions.invoke('approvePartner', { partner_id: partnerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Partenaire approuvé !');
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (partnerId) => base44.functions.invoke('rejectPartner', { partner_id: partnerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Partenaire rejeté');
    },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => {
    setForm({
      name: '',
      category: 'sponsor',
      website: '',
      logo_file: null,
      description: '',
      short_description: '',
      tags: '',
      status: 'draft',
      order: 0,
    });
    setEditingPartner(null);
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, logo_file: file_url }));
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (partner) => {
    setEditingPartner(partner);
    setForm(partner);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.logo_file) {
      toast.error('Nom et logo obligatoires');
      return;
    }

    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-display font-bold text-xl text-white">Partenaires</h2>
        <Button
          onClick={handleOpenCreate}
          className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter partenaire
        </Button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="text-center py-8 text-white/40">Chargement...</div>
      ) : partners.length === 0 ? (
        <div className="text-center py-8 text-white/40">Aucun partenaire</div>
      ) : (
        <div className="space-y-3">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
            >
              {partner.logo_file && (
                <img
                  src={partner.logo_file}
                  alt={partner.name}
                  className="w-16 h-16 object-contain flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-white truncate">{partner.name}</p>
                  <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[partner.status]}`}>
                    {partner.status}
                  </span>
                </div>
                <p className="text-sm text-white/60 line-clamp-2">{partner.short_description}</p>
                {partner.tags && <p className="text-xs text-[#FF2D8A] mt-1">{partner.tags}</p>}
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenEdit(partner)}
                  className="h-8 px-2 text-white/60 hover:text-white"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                {partner.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => generateMutation.mutate(partner.id)}
                    disabled={generateMutation.isPending}
                    className="h-8 px-2 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] text-xs gap-1"
                  >
                    {generateMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                  </Button>
                )}
                {partner.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => submitMutation.mutate(partner.id)}
                    disabled={submitMutation.isPending}
                    className="h-8 px-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs"
                  >
                    {submitMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  </Button>
                )}
                {user?.role === 'super_admin' && partner.status === 'pending_approval' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(partner.id)}
                      disabled={approveMutation.isPending}
                      className="h-8 px-2 bg-green-600/30 hover:bg-green-600/50 text-green-300 text-xs"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => rejectMutation.mutate(partner.id)}
                      disabled={rejectMutation.isPending}
                      className="h-8 px-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Supprimer ce partenaire ?')) {
                      deleteMutation.mutate(partner.id);
                    }
                  }}
                  className="h-8 px-2 text-red-500/60 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              {editingPartner ? 'Modifier partenaire' : 'Nouveau partenaire'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Nom *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nom du partenaire"
                className="bg-white/5 border-white/10 text-white h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Catégorie *</label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="institutionnel">Institutionnel</SelectItem>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="artistique">Artistique</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Ordre</label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  className="bg-white/5 border-white/10 text-white h-9 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Site web</label>
              <Input
                value={form.website || ''}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://..."
                className="bg-white/5 border-white/10 text-white h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Logo *</label>
              <div className="flex items-center gap-2">
                {form.logo_file && (
                  <img src={form.logo_file} alt="logo" className="w-12 h-12 object-contain rounded" />
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 text-xs text-white/60 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors flex-1">
                  <Upload className="w-3 h-3" /> Upload logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Description courte (générée)</label>
              <Input
                value={form.short_description || ''}
                onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
                placeholder="1 phrase..."
                className="bg-white/5 border-white/10 text-white h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Description (générée)</label>
              <Textarea
                value={form.description || ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="80-150 mots..."
                className="bg-white/5 border-white/10 text-white h-24 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Tags (générés)</label>
              <Input
                value={form.tags || ''}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3..."
                className="bg-white/5 border-white/10 text-white h-9 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-[#FF2D8A] hover:bg-[#C2185B] text-white"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Enregistrer'
                )}
              </Button>
              <Button
                onClick={() => {
                  if (editingPartner && !form.description) {
                    generateMutation.mutate(editingPartner.id);
                  }
                }}
                disabled={generateMutation.isPending || !editingPartner}
                variant="outline"
                className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}