import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Logo from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ParticipantsTab from '@/components/admin/ParticipantsTab';
import StripeTab from '@/components/admin/StripeTab';
import ArtistsTab from '@/components/admin/ArtistsTab';
import NewsletterTab from '@/components/admin/NewsletterTab';
import BlogTab from '@/components/admin/BlogTab';
import { 
  Users, Calendar, Palette, Handshake, Image, Mail, 
  Plus, Pencil, Trash2, LogOut, Shield, Loader2,
  Eye, UserPlus, Home, ChevronRight, CreditCard, ClipboardList, Send, BookOpen
} from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => { setUser(u); setLoading(false); }).catch(() => {
      base44.auth.redirectToLogin(createPageUrl('Admin'));
    });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#C2185B]" /></div>;
  if (!user || !['super_admin', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-dark neon-border rounded-3xl p-10 text-center max-w-md">
          <Shield className="w-16 h-16 text-[#FF2D8A]/30 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-white mb-2">Accès réservé</h2>
          <p className="text-sm text-white/50 mb-6">Cette section est réservée aux administrateurs.</p>
          <Link to={createPageUrl('Home')} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Home className="w-4 h-4" /> Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Admin header */}
      <div className="bg-[#12121A] border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')} className="text-sm text-white/60 hover:text-[#FF2D8A] flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-[#FF2D8A]/30 transition-all">
              <Home className="w-4 h-4" /> Accueil
            </Link>
            <Link to={createPageUrl('Home')} className="text-sm text-white/50 hover:text-[#FF2D8A] flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 hover:border-[#FF2D8A]/30 transition-all">
              <Eye className="w-4 h-4" /> Voir le site
            </Link>
            <Button variant="ghost" size="sm" onClick={() => base44.auth.logout()} className="text-white/50 hover:text-white">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="participants">
          <TabsList className="bg-[#12121A] border border-white/10 mb-8 flex flex-wrap gap-1 h-auto p-1.5">
            <TabsTrigger value="participants" className="gap-2"><ClipboardList className="w-4 h-4" /> Participants</TabsTrigger>
            <TabsTrigger value="artists" className="gap-2"><Palette className="w-4 h-4" /> Artistes</TabsTrigger>
            <TabsTrigger value="program" className="gap-2"><Calendar className="w-4 h-4" /> Programme</TabsTrigger>
            <TabsTrigger value="partners" className="gap-2"><Handshake className="w-4 h-4" /> Partenaires</TabsTrigger>
            <TabsTrigger value="media" className="gap-2"><Image className="w-4 h-4" /> Médias</TabsTrigger>
            <TabsTrigger value="registrations" className="gap-2"><Mail className="w-4 h-4" /> Inscriptions</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" /> Utilisateurs</TabsTrigger>
            <TabsTrigger value="newsletter" className="gap-2"><Send className="w-4 h-4" /> Newsletter</TabsTrigger>
            <TabsTrigger value="blog" className="gap-2"><BookOpen className="w-4 h-4" /> Blog</TabsTrigger>
            {user.role === 'super_admin' && (
              <TabsTrigger value="stripe" className="gap-2"><CreditCard className="w-4 h-4" /> Stripe</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="participants"><ParticipantsTab user={user} /></TabsContent>

          <TabsContent value="artists"><ArtistsTab user={user} /></TabsContent>

          <TabsContent value="program"><AdminCRUD entity="ProgramEvent" queryClient={queryClient} fields={[
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'category', label: 'Catégorie', type: 'select', options: ['performance', 'atelier', 'exposition', 'conference'], required: true },
            { key: 'start_time', label: 'Heure début', type: 'text', placeholder: 'HH:MM' },
            { key: 'end_time', label: 'Heure fin', type: 'text', placeholder: 'HH:MM' },
            { key: 'location', label: 'Lieu', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
          ]} /></TabsContent>

          <TabsContent value="partners"><AdminCRUD entity="Partner" queryClient={queryClient} fields={[
            { key: 'name', label: 'Nom', type: 'text', required: true },
            { key: 'category', label: 'Catégorie', type: 'select', options: ['principal', 'officiel', 'media', 'technique', 'institutionnel'], required: true },
            { key: 'logo_url', label: 'Logo URL', type: 'text' },
            { key: 'website', label: 'Site web', type: 'text' },
            { key: 'display_order', label: 'Ordre', type: 'number' },
          ]} /></TabsContent>

          <TabsContent value="media"><AdminCRUD entity="GalleryMedia" queryClient={queryClient} fields={[
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'type', label: 'Type', type: 'select', options: ['photo', 'video', 'document'], required: true },
            { key: 'url', label: 'URL', type: 'text', required: true },
            { key: 'thumbnail_url', label: 'Miniature URL', type: 'text' },
          ]} /></TabsContent>

          <TabsContent value="registrations"><AdminReadOnly entity="Registration" queryClient={queryClient} columns={['first_name', 'last_name', 'email', 'accepts_terms', 'accepts_contact', 'created_date']} /></TabsContent>

          <TabsContent value="users"><AdminUsers user={user} /></TabsContent>
          <TabsContent value="newsletter"><NewsletterTab user={user} /></TabsContent>
          {user.role === 'super_admin' && (
            <TabsContent value="stripe"><StripeTab /></TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function AdminCRUD({ entity, queryClient, fields }) {
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => base44.entities[entity].list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities[entity].create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [entity] }); setDialogOpen(false); toast.success('Créé !'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities[entity].update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [entity] }); setDialogOpen(false); toast.success('Mis à jour !'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities[entity].delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [entity] }); toast.success('Supprimé !'); },
  });

  const openCreate = () => { setEditItem(null); setFormData({}); setDialogOpen(true); };
  const openEdit = (item) => { setEditItem(item); setFormData(item); setDialogOpen(true); };
  const handleSave = () => {
    if (editItem) { updateMutation.mutate({ id: editItem.id, data: formData }); }
    else { createMutation.mutate(formData); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display font-bold text-xl text-white">{entity}</h2>
        <Button onClick={openCreate} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white text-sm gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
      </div>

      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-display font-semibold text-sm text-white">{item.name || item.title || item.email || item.id}</p>
                <p className="text-xs text-white/40">{item.category || item.discipline || item.type || ''}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { if(confirm('Supprimer ?')) deleteMutation.mutate(item.id); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-[#2D2024]/40 py-8">Aucun élément</p>}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Modifier' : 'Ajouter'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-white/50 mb-1 block">{field.label}{field.required && ' *'}</label>
                {field.type === 'textarea' ? (
                  <Textarea value={formData[field.key] || ''} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} className="rounded-xl bg-white/5 border-white/10 text-white" />
                ) : field.type === 'select' ? (
                  <Select value={formData[field.key] || ''} onValueChange={(v) => setFormData({ ...formData, [field.key]: v })}>
                    <SelectTrigger className="rounded-xl bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {field.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                    placeholder={field.placeholder}
                    className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                )}
              </div>
            ))}
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white w-full">
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminReadOnly({ entity, columns }) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => base44.entities[entity].list('-created_date'),
  });

  return (
    <div>
      <h2 className="font-display font-bold text-xl mb-6 text-white">{entity} ({items.length})</h2>
      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                {columns.map((col) => <th key={col} className="text-left py-3 px-3 font-display font-semibold text-xs uppercase tracking-wider text-white/40">{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/3">
                  {columns.map((col) => (
                    <td key={col} className="py-2 px-3 text-white/70">
                      {typeof item[col] === 'boolean' ? (item[col] ? '✓' : '✗') : (item[col] || '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminUsers({ user }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    const roleForInvite = ['super_admin', 'admin'].includes(inviteRole) ? 'admin' : 'user';
    await base44.users.inviteUser(inviteEmail, roleForInvite);
    toast.success(`Invitation envoyée à ${inviteEmail}`);
    setInviteEmail('');
    setInviting(false);
  };

  const roleColors = {
    super_admin: 'bg-[#C2185B]/10 text-[#C2185B]',
    admin: 'bg-[#D4AF37]/10 text-[#D4AF37]',
    member: 'bg-blue-100 text-blue-700',
    user: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <h2 className="font-display font-bold text-xl mb-6 text-white">Utilisateurs</h2>
      
      {/* Invite */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2 text-white"><UserPlus className="w-4 h-4 text-[#FF2D8A]" /> Inviter un utilisateur</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="email@exemple.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 flex-1"
          />
          <Select value={inviteRole} onValueChange={setInviteRole}>
            <SelectTrigger className="rounded-xl bg-white/5 border-white/10 text-white w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {user.role === 'super_admin' && <SelectItem value="admin">Admin</SelectItem>}
              <SelectItem value="member">Membre</SelectItem>
              <SelectItem value="user">Visiteur</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleInvite} disabled={inviting} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white">
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Inviter'}
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-display font-semibold text-sm text-white">{u.full_name || u.email}</p>
                <p className="text-xs text-white/40">{u.email}</p>
              </div>
              <Badge className={roleColors[u.role] || roleColors.user}>{u.role || 'user'}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}