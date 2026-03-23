import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Zap, Share2 } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'coulisses', label: 'Coulisses' },
  { value: 'tendances', label: 'Tendances Mode' },
  { value: 'artistes', label: 'Artistes' },
  { value: 'evenement', label: 'Événement' },
  { value: 'actualites', label: 'Actualités' },
];

const EMPTY_FORM = {
  title: '', slug: '', category: 'actualites', cover_image_url: '',
  excerpt: '', content: '', author_name: '', author_avatar_url: '',
  published: false, reading_time: 3, tags: [],
};

export default function BlogTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState('');
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState('actualites');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [toFacebookId, setToFacebookId] = useState(null);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-admin'],
    queryFn: () => base44.entities.BlogPost.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BlogPost.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['blog-admin'] }); queryClient.invalidateQueries({ queryKey: ['blog-posts-public'] }); setDialogOpen(false); toast.success('Article créé !'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BlogPost.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['blog-admin'] }); queryClient.invalidateQueries({ queryKey: ['blog-posts-public'] }); setDialogOpen(false); toast.success('Article mis à jour !'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['blog-admin'] }); toast.success('Supprimé !'); },
  });

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setTagsInput('');
    setDialogOpen(true);
  };

  const openEdit = (post) => {
    setEditItem(post);
    setForm({ ...EMPTY_FORM, ...post });
    setTagsInput((post.tags || []).join(', '));
    setDialogOpen(true);
  };

  const handleSave = () => {
    const data = {
      ...form,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      published_at: form.published && !form.published_at ? new Date().toISOString() : form.published_at,
    };
    if (!data.slug) data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (editItem) updateMutation.mutate({ id: editItem.id, data });
    else createMutation.mutate(data);
  };

  const togglePublish = (post) => {
    const published = !post.published;
    updateMutation.mutate({ id: post.id, data: { ...post, published, published_at: published ? new Date().toISOString() : post.published_at } });
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) { toast.error('Entrez un sujet'); return; }
    setAiGenerating(true);
    try {
      const res = await base44.functions.invoke('generateBlogAndPost', { action: 'generateBlogArticle', topic: aiTopic, category: aiCategory });
      queryClient.invalidateQueries({ queryKey: ['blog-admin'] });
      toast.success('Article généré et sauvegardé en brouillon !');
      setAiDialogOpen(false);
      setAiTopic('');
    } catch (e) {
      toast.error('Erreur génération : ' + e.message);
    }
    setAiGenerating(false);
  };

  const handleToFacebook = async (post) => {
    setToFacebookId(post.id);
    try {
      await base44.functions.invoke('generateBlogAndPost', { action: 'generatePostFromBlog', article_id: post.id, article_title: post.title, article_content: post.content });
      toast.success('Post Facebook créé en brouillon dans "Posts" !');
    } catch (e) {
      toast.error('Erreur : ' + e.message);
    }
    setToFacebookId(null);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h2 className="font-display font-bold text-xl text-white">Blog ({posts.length})</h2>
        <div className="flex gap-2">
          <Button onClick={() => setAiDialogOpen(true)} variant="outline" className="border-[#FF2D8A]/30 text-[#FF2D8A] hover:bg-[#FF2D8A]/10 text-sm gap-2">
            <Zap className="w-4 h-4" /> Générer (IA)
          </Button>
          <Button onClick={openCreate} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white text-sm gap-2">
            <Plus className="w-4 h-4" /> Nouvel article
          </Button>
        </div>
      </div>

      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" /> : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {post.cover_image_url && (
                  <img src={post.cover_image_url} alt="" className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-white truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/30">{CATEGORIES.find(c => c.value === post.category)?.label}</span>
                    {post.published_at && <span className="text-xs text-white/20">{format(new Date(post.published_at), 'dd/MM/yyyy')}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={post.published ? 'bg-green-500/20 text-green-300 border-green-500/20' : 'bg-white/10 text-white/40 border-white/10'}>
                  {post.published ? 'Publié' : 'Brouillon'}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => togglePublish(post)} className="text-white/40 hover:text-white" title={post.published ? 'Dépublier' : 'Publier'}>
                  {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(post)} className="text-white/40 hover:text-white">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleToFacebook(post)} disabled={toFacebookId === post.id} className="text-white/40 hover:text-blue-400" title="Créer post Facebook">
                  {toFacebookId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm('Supprimer cet article ?')) deleteMutation.mutate(post.id); }} className="text-white/40 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-center text-white/30 py-12">Aucun article. Créez le premier !</p>}
        </div>
      )}

      {/* Dialog IA */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2"><Zap className="w-5 h-5 text-[#FF2D8A]" /> Générer un article avec l'IA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Sujet / thème de l'article *</label>
              <Input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="ex: Les artistes de mode de Fashionist'ART..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Catégorie</label>
              <Select value={aiCategory} onValueChange={setAiCategory}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-white/30">L'article sera créé en brouillon. Vous pourrez le modifier avant publication.</p>
            <Button onClick={handleAiGenerate} disabled={aiGenerating} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white w-full gap-2">
              {aiGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</> : <><Zap className="w-4 h-4" /> Générer</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editItem ? 'Modifier l\'article' : 'Nouvel article'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Titre *</label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" placeholder="Titre de l'article" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Catégorie *</label>
                <Select value={form.category} onValueChange={v => set('category', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Temps de lecture (min)</label>
                <Input type="number" value={form.reading_time} onChange={e => set('reading_time', Number(e.target.value))} className="bg-white/5 border-white/10 text-white rounded-xl" />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Image de couverture (URL)</label>
              <Input value={form.cover_image_url} onChange={e => set('cover_image_url', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Résumé</label>
              <Textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-20" placeholder="Court résumé affiché dans la liste…" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Contenu (Markdown)</label>
              <Textarea value={form.content} onChange={e => set('content', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-48 font-mono text-xs" placeholder="Rédigez votre article en Markdown…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Auteur</label>
                <Input value={form.author_name} onChange={e => set('author_name', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" placeholder="Prénom Nom" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Tags (séparés par virgule)</label>
                <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" placeholder="mode, backstage, artiste" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} className="accent-[#FF2D8A] w-4 h-4" />
                <span className="text-sm text-white/70">Publier immédiatement</span>
              </label>
            </div>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white w-full mt-2">
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}