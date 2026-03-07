import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Zap, Calendar, Send, Copy, Trash2, Pencil, Loader2, 
  CheckCircle2, Clock, AlertCircle, Plus, Megaphone, Mail, RefreshCw
} from 'lucide-react';

const EVENT_DATE = new Date('2026-04-18');
const EVENT_NAME = "Fashionist'ART";
const EVENT_URL = "https://www.fashionistart.be";

const PLATFORM_COLORS = {
  facebook: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  instagram: 'bg-pink-600/20 text-pink-400 border-pink-600/30',
  linkedin: 'bg-blue-800/20 text-blue-300 border-blue-800/30',
  x: 'bg-gray-600/20 text-gray-300 border-gray-600/30',
  website: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
};

const POST_TYPE_LABELS = {
  event_announcement: '📢 Annonce',
  candidate_spotlight: '🌟 Candidat',
  artist_spotlight: '🎨 Artiste',
  partner_highlight: '🤝 Partenaire',
  program_update: '📋 Programme',
  countdown: '⏳ Compte à rebours',
  event_day: '🎉 Jour J',
  event_result: '🏆 Résultats',
};

const STATUS_CONFIG = {
  DRAFT: { icon: <AlertCircle className="w-3 h-3" />, label: 'Brouillon', color: 'bg-yellow-500/20 text-yellow-400' },
  PENDING_APPROVAL: { icon: <Clock className="w-3 h-3" />, label: 'En attente', color: 'bg-orange-500/20 text-orange-400' },
  APPROVED: { icon: <CheckCircle2 className="w-3 h-3" />, label: 'Approuvé', color: 'bg-green-500/20 text-green-400' },
  PUBLISHED: { icon: <CheckCircle2 className="w-3 h-3" />, label: 'Publié', color: 'bg-green-600/20 text-green-300' },
  REJECTED: { icon: <AlertCircle className="w-3 h-3" />, label: 'Rejeté', color: 'bg-red-500/20 text-red-400' },
};

function daysUntilEvent() {
  const now = new Date();
  const diff = EVENT_DATE - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function MarketingTab({ user }) {
  const queryClient = useQueryClient();
  const [editPost, setEditPost] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorForm, setGeneratorForm] = useState({
    platform: 'facebook',
    post_type: 'event_announcement',
    artist_name: '',
    partner_name: '',
    candidate_name: '',
    custom_context: '',
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['socialPostsMarketing'],
    queryFn: () => base44.asServiceRole.entities.SocialPostDraft.list('-created_date', 100),
  });

  const { data: newsletters = [], isLoading: newslettersLoading } = useQuery({
    queryKey: ['newsletterCampaignsMarketing'],
    queryFn: () => base44.asServiceRole.entities.NewsletterCampaign.list('-created_date', 50),
  });

  const calendarMutation = useMutation({
    mutationFn: () => base44.functions.invoke('generateMarketingCalendar', {}),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['socialPostsMarketing'] });
      queryClient.invalidateQueries({ queryKey: ['newsletterCampaignsMarketing'] });
      toast.success(res.data?.message || 'Calendrier généré !');
    },
    onError: (err) => toast.error('Erreur : ' + err.message),
  });

  const singlePostMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('generateSinglePost', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPostsMarketing'] });
      setShowGenerator(false);
      toast.success('Post généré !');
    },
    onError: (err) => toast.error('Erreur : ' + err.message),
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => base44.asServiceRole.entities.SocialPostDraft.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPostsMarketing'] });
      setEditPost(null);
      toast.success('Post mis à jour !');
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.SocialPostDraft.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPostsMarketing'] });
      toast.success('Post supprimé');
    },
  });

  const deleteNewsletterMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.NewsletterCampaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletterCampaignsMarketing'] });
      toast.success('Newsletter supprimée');
    },
  });

  const handleCopy = (post) => {
    const text = `${post.content}${post.hashtags ? '\n\n' + post.hashtags : ''}${post.link_url ? '\n\n' + post.link_url : ''}`;
    navigator.clipboard.writeText(text);
    toast.success('Copié !');
  };

  const daysLeft = daysUntilEvent();

  // Calendrier marketing statique
  const CALENDAR = [
    { label: 'Annonce officielle', daysBefore: 60, post_type: 'event_announcement', icon: '📢' },
    { label: 'Teaser J-30', daysBefore: 30, post_type: 'countdown', icon: '⏳' },
    { label: 'Présentation artistes', daysBefore: 15, post_type: 'artist_spotlight', icon: '🎨' },
    { label: 'Programme complet', daysBefore: 7, post_type: 'program_update', icon: '📋' },
    { label: 'Rappel J-3', daysBefore: 3, post_type: 'countdown', icon: '🔔' },
    { label: 'Jour J', daysBefore: 0, post_type: 'event_day', icon: '🎉' },
  ];

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-[#FF2D8A]">{daysLeft}</p>
          <p className="text-xs text-white/40 mt-1">Jours avant l'événement</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{posts.length}</p>
          <p className="text-xs text-white/40 mt-1">Posts créés</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{posts.filter(p => p.status === 'PUBLISHED').length}</p>
          <p className="text-xs text-white/40 mt-1">Publiés</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-[#D4AF37]">{newsletters.length}</p>
          <p className="text-xs text-white/40 mt-1">Newsletters</p>
        </div>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList className="bg-[#12121A] border border-white/10 w-full flex">
          <TabsTrigger value="calendar" className="flex-1 gap-2 text-xs"><Calendar className="w-3.5 h-3.5" /> Calendrier</TabsTrigger>
          <TabsTrigger value="posts" className="flex-1 gap-2 text-xs"><Megaphone className="w-3.5 h-3.5" /> Posts</TabsTrigger>
          <TabsTrigger value="newsletter" className="flex-1 gap-2 text-xs"><Mail className="w-3.5 h-3.5" /> Newsletter</TabsTrigger>
        </TabsList>

        {/* ===== CALENDRIER ===== */}
        <TabsContent value="calendar" className="space-y-4 mt-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-white">Calendrier marketing automatique</h3>
                <p className="text-xs text-white/40 mt-1">Génère tous les posts planifiés pour {EVENT_NAME}</p>
              </div>
              <Button
                onClick={() => calendarMutation.mutate()}
                disabled={calendarMutation.isPending}
                className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2 text-sm"
              >
                {calendarMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Générer le calendrier
              </Button>
            </div>

            <div className="space-y-3">
              {CALENDAR.map((item, idx) => {
                const eventDate = new Date('2026-04-18');
                eventDate.setDate(eventDate.getDate() - item.daysBefore);
                const isPast = daysLeft < item.daysBefore;
                const isNext = !isPast && (idx === 0 || daysLeft < CALENDAR[idx - 1]?.daysBefore);

                return (
                  <div key={idx} className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                    isPast ? 'border-white/5 opacity-40' :
                    isNext ? 'border-[#FF2D8A]/40 bg-[#FF2D8A]/5' :
                    'border-white/10 bg-white/3'
                  }`}>
                    <div className="text-xl w-8 text-center">{item.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-white/40">
                        {item.daysBefore === 0 ? 'Le 18 avril 2026' : `J-${item.daysBefore} — ${eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`}
                      </p>
                    </div>
                    <Badge className="text-xs bg-white/5 text-white/50 border-white/10">
                      {POST_TYPE_LABELS[item.post_type] || item.post_type}
                    </Badge>
                    {isPast && <Badge className="text-xs bg-gray-500/20 text-gray-400">Passé</Badge>}
                    {isNext && <Badge className="text-xs bg-[#FF2D8A]/20 text-[#FF2D8A]">Prochain</Badge>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Générateur post unique */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-white">Générer un post personnalisé</h3>
                <p className="text-xs text-white/40 mt-1">Créez un post IA pour un artiste, partenaire ou contexte spécifique</p>
              </div>
              <Button onClick={() => setShowGenerator(true)} variant="outline" className="border-white/20 text-white/70 gap-2 text-sm">
                <Plus className="w-4 h-4" /> Nouveau post
              </Button>
            </div>
            <div className="text-xs text-white/40 bg-black/20 rounded-lg p-3 border border-white/5">
              <p className="font-medium text-white/60 mb-1">🔗 Backlink SEO automatique</p>
              <p>Chaque post généré inclut : <span className="text-[#FF2D8A]">Plateforme propulsée par JS-Innov.IA → https://js-innov.ia</span></p>
            </div>
          </div>
        </TabsContent>

        {/* ===== POSTS ===== */}
        <TabsContent value="posts" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">{posts.length} post{posts.length !== 1 ? 's' : ''} au total</p>
            <Button onClick={() => setShowGenerator(true)} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2 text-sm">
              <Plus className="w-4 h-4" /> Générer un post
            </Button>
          </div>

          {postsLoading ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun post. Générez le calendrier marketing pour démarrer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const statusConf = STATUS_CONFIG[post.status] || STATUS_CONFIG.DRAFT;
                return (
                  <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className={`text-xs border ${PLATFORM_COLORS[post.platform] || 'bg-white/10 text-white'}`}>
                            {post.platform?.toUpperCase()}
                          </Badge>
                          <Badge className={`text-xs flex items-center gap-1 ${statusConf.color}`}>
                            {statusConf.icon} {statusConf.label}
                          </Badge>
                          <span className="text-xs text-white/30">
                            {POST_TYPE_LABELS[post.post_type] || post.post_type}
                          </span>
                          {post.scheduled_at && (
                            <span className="text-xs text-white/30">
                              📅 {new Date(post.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                        {post.title && <p className="text-sm font-semibold text-white mb-1">{post.title}</p>}
                        <p className="text-xs text-white/60 line-clamp-3 whitespace-pre-line">{post.content}</p>
                        {post.hashtags && <p className="text-xs text-[#FF2D8A] mt-1 line-clamp-1">{post.hashtags}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(post)} className="text-white/50 hover:text-white h-7 w-7 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditPost(post)} className="text-white/50 hover:text-white h-7 w-7 p-0">
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { if (confirm('Supprimer ce post ?')) deletePostMutation.mutate(post.id); }} className="text-red-400/60 hover:text-red-400 h-7 w-7 p-0">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ===== NEWSLETTER ===== */}
        <TabsContent value="newsletter" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">{newsletters.length} newsletter{newsletters.length !== 1 ? 's' : ''}</p>
            <Button onClick={() => calendarMutation.mutate()} disabled={calendarMutation.isPending} variant="outline" className="border-white/20 text-white/70 gap-2 text-sm">
              {calendarMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Régénérer
            </Button>
          </div>

          {newslettersLoading ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
          ) : newsletters.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune newsletter. Générez le calendrier pour créer les newsletters automatiques.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {newsletters.map((nl) => {
                const statusConf = STATUS_CONFIG[nl.status] || STATUS_CONFIG.DRAFT;
                return (
                  <div key={nl.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs flex items-center gap-1 ${statusConf.color}`}>
                            {statusConf.icon} {statusConf.label}
                          </Badge>
                          {nl.scheduled_at && (
                            <span className="text-xs text-white/30">
                              📅 {new Date(nl.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-white mb-1">{nl.subject}</p>
                        <p className="text-xs text-white/50 line-clamp-2">{nl.text}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => { if (confirm('Supprimer ?')) deleteNewsletterMutation.mutate(nl.id); }} className="text-red-400/60 hover:text-red-400 h-7 w-7 p-0 shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog : modifier post */}
      <Dialog open={!!editPost} onOpenChange={(open) => !open && setEditPost(null)}>
        <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le post</DialogTitle>
          </DialogHeader>
          {editPost && (
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Titre</label>
                <Input
                  value={editPost.title || ''}
                  onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Contenu</label>
                <Textarea
                  value={editPost.content || ''}
                  onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-40"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Hashtags</label>
                <Input
                  value={editPost.hashtags || ''}
                  onChange={(e) => setEditPost({ ...editPost, hashtags: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Date de planification</label>
                <Input
                  type="datetime-local"
                  value={editPost.scheduled_at ? editPost.scheduled_at.slice(0, 16) : ''}
                  onChange={(e) => setEditPost({ ...editPost, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setEditPost(null)} className="text-white/50">Annuler</Button>
                <Button
                  onClick={() => updatePostMutation.mutate({ id: editPost.id, data: editPost })}
                  disabled={updatePostMutation.isPending}
                  className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white"
                >
                  {updatePostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog : générer post unique */}
      <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
        <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Générer un post IA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Plateforme</label>
                <Select value={generatorForm.platform} onValueChange={(v) => setGeneratorForm({ ...generatorForm, platform: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['facebook', 'instagram', 'linkedin', 'x', 'website'].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Type de post</label>
                <Select value={generatorForm.post_type} onValueChange={(v) => setGeneratorForm({ ...generatorForm, post_type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(POST_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Artiste (optionnel)</label>
              <Input
                value={generatorForm.artist_name}
                onChange={(e) => setGeneratorForm({ ...generatorForm, artist_name: e.target.value })}
                placeholder="Nom de l'artiste"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Partenaire (optionnel)</label>
              <Input
                value={generatorForm.partner_name}
                onChange={(e) => setGeneratorForm({ ...generatorForm, partner_name: e.target.value })}
                placeholder="Nom du partenaire"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Contexte supplémentaire</label>
              <Textarea
                value={generatorForm.custom_context}
                onChange={(e) => setGeneratorForm({ ...generatorForm, custom_context: e.target.value })}
                placeholder="Informations supplémentaires pour l'IA..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-20 text-sm"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowGenerator(false)} className="text-white/50">Annuler</Button>
              <Button
                onClick={() => singlePostMutation.mutate({
                  ...generatorForm,
                  event_name: EVENT_NAME,
                  event_city: "Dour, Belgique",
                  event_date: "18 avril 2026",
                })}
                disabled={singlePostMutation.isPending}
                className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2"
              >
                {singlePostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Générer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}