import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Upload, Trash, Eye } from 'lucide-react';

export default function HomePageTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [videoDetailOpen, setVideoDetailOpen] = useState(false);
  const [introEnabled, setIntroEnabled] = useState(true);
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [introImageUrl, setIntroImageUrl] = useState('');
  const [introDuration, setIntroDuration] = useState(5);
  const [editingId, setEditingId] = useState(null);

  const { data: config, isLoading } = useQuery({
    queryKey: ['homePageConfig'],
    queryFn: async () => {
      const items = await base44.entities.HomePageConfig.list();
      return items[0] || null;
    },
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['socialPosts'],
    queryFn: () => base44.entities.SocialPostDraft.filter({ status: 'APPROVED' }),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingId) {
        return base44.entities.HomePageConfig.update(editingId, data);
      } else {
        return base44.entities.HomePageConfig.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homePageConfig'] });
      setDialogOpen(false);
      toast.success('Configuration sauvegardée !');
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HomePageConfig.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homePageConfig'] });
      toast.success('Supprimé !');
    },
  });

  const resetForm = () => {
    setIntroEnabled(true);
    setIntroVideoUrl('');
    setIntroImageUrl('');
    setIntroDuration(5);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setIntroEnabled(item.intro_enabled ?? true);
    setIntroVideoUrl(item.intro_video_url || '');
    setIntroImageUrl(item.intro_image_url || '');
    setIntroDuration(item.intro_duration_seconds || 5);
    setDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      intro_enabled: introEnabled,
      intro_video_url: introVideoUrl,
      intro_image_url: introImageUrl,
      intro_duration_seconds: introDuration,
      updated_at: new Date().toISOString(),
    });
  };

  const handleUploadMedia = async (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'video' ? 'video/*' : 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        if (type === 'video') {
          setIntroVideoUrl(file_url);
        } else {
          setIntroImageUrl(file_url);
        }
        toast.success(`${type === 'video' ? 'Vidéo' : 'Image'} uploadée !`);
      } catch (err) {
        toast.error('Erreur lors de l\'upload');
      }
    };
    input.click();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#FF2D8A]" /></div>;
  }

  return (
    <Tabs defaultValue="intro" className="space-y-6">
      <TabsList className="bg-[#12121A] border border-white/10 h-auto p-1.5">
        <TabsTrigger value="intro" className="gap-2">Configuration Intro</TabsTrigger>
        <TabsTrigger value="posts" className="gap-2">Posts à l'accueil</TabsTrigger>
      </TabsList>

      {/* Intro Configuration */}
      <TabsContent value="intro" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">Page d'accueil - Intro</h2>
          {!config && (
            <Button 
              onClick={() => { resetForm(); setDialogOpen(true); }}
              className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2"
            >
              <Plus className="w-4 h-4" /> Créer config
            </Button>
          )}
        </div>

        {config ? (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-white/50 mb-2">Intro activée</p>
                  <Badge className={config.intro_enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                    {config.intro_enabled ? 'Activée' : 'Désactivée'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-2">Durée</p>
                  <p className="text-white font-semibold">{config.intro_duration_seconds}s</p>
                </div>
              </div>

              {config.intro_video_url && (
                <div className="mb-4">
                  <p className="text-xs text-white/50 mb-2">Vidéo intro</p>
                  <Button 
                    onClick={() => setVideoDetailOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="text-[#FF2D8A] hover:bg-white/5 gap-2"
                  >
                    <Eye className="w-4 h-4" /> Voir les détails
                  </Button>
                </div>
              )}

              {config.intro_image_url && (
                <div className="mb-4">
                  <p className="text-xs text-white/50 mb-2">Image intro</p>
                  <img src={config.intro_image_url} alt="intro" className="h-24 rounded-lg object-cover" />
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button 
                  onClick={() => handleEdit(config)}
                  variant="ghost"
                  size="sm"
                  className="text-[#FF2D8A] hover:bg-white/5"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => { if(confirm('Supprimer ?')) deleteMutation.mutate(config.id); }}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-white/5"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/40 mb-4">Aucune configuration créée</p>
            <Button 
              onClick={() => { resetForm(); setDialogOpen(true); }}
              className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white"
            >
              Créer maintenant
            </Button>
          </div>
        )}
      </TabsContent>

      {/* Posts to feature */}
      <TabsContent value="posts" className="space-y-6">
        <h2 className="font-display font-bold text-xl text-white">Posts à mettre en avant</h2>
        <div className="grid grid-cols-2 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm text-white font-semibold mb-2 line-clamp-2">{post.title || post.content.substring(0, 50)}</p>
              <p className="text-xs text-white/40 mb-3">{post.platform}</p>
              <Button 
                size="sm" 
                variant="ghost"
                className="w-full text-[#FF2D8A] hover:bg-white/5 gap-2"
              >
                <Eye className="w-3 h-3" /> Mettre en avant
              </Button>
            </div>
          ))}
        </div>
        {posts.length === 0 && (
          <div className="bg-white/5 rounded-2xl p-8 text-center">
            <p className="text-white/40">Aucun post approuvé disponible</p>
          </div>
        )}
      </TabsContent>

      {/* Video Detail Dialog */}
      <Dialog open={videoDetailOpen} onOpenChange={setVideoDetailOpen}>
        <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la vidéo intro</DialogTitle>
          </DialogHeader>
          {config?.intro_video_url && (
            <div className="space-y-4 mt-4">
              <div className="rounded-xl overflow-hidden bg-black/30 aspect-video">
                <iframe
                  src={config.intro_video_url}
                  title="Video intro"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="space-y-3 bg-white/5 rounded-lg p-4">
                <div>
                  <p className="text-xs text-white/50 mb-1">URL vidéo</p>
                  <a href={config.intro_video_url} target="_blank" rel="noopener noreferrer" className="text-[#FF2D8A] text-sm break-all hover:underline">
                    {config.intro_video_url}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">Durée affichage</p>
                  <p className="text-white font-semibold">{config.intro_duration_seconds} secondes</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Configuration Intro - Page d'accueil</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Intro enabled toggle */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <label className="text-sm font-medium">Activer l'intro</label>
              <button
                onClick={() => setIntroEnabled(!introEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${introEnabled ? 'bg-[#FF2D8A]' : 'bg-white/10'}`}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Durée affichage (secondes)</label>
              <Input
                type="number"
                min="1"
                max="30"
                value={introDuration}
                onChange={(e) => setIntroDuration(Number(e.target.value))}
                className="rounded-xl bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Vidéo intro</label>
              <div className="flex gap-2">
                <Input
                  placeholder="URL vidéo (YouTube, Vimeo, Drive...)"
                  value={introVideoUrl}
                  onChange={(e) => setIntroVideoUrl(e.target.value)}
                  className="rounded-xl bg-white/5 border-white/10 text-white flex-1"
                />
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={() => handleUploadMedia('video')}
                  className="text-[#FF2D8A] hover:bg-white/5"
                  title="Uploader une vidéo"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                {introVideoUrl && (
                  <Button 
                    size="icon"
                    variant="ghost"
                    onClick={() => setIntroVideoUrl('')}
                    className="text-red-500 hover:bg-white/5"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1 block">Image intro</label>
              <div className="flex gap-2">
                <Input
                  placeholder="URL image"
                  value={introImageUrl}
                  onChange={(e) => setIntroImageUrl(e.target.value)}
                  className="rounded-xl bg-white/5 border-white/10 text-white flex-1"
                />
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={() => handleUploadMedia('image')}
                  className="text-[#FF2D8A] hover:bg-white/5"
                  title="Uploader une image"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                {introImageUrl && (
                  <Button 
                    size="icon"
                    variant="ghost"
                    onClick={() => setIntroImageUrl('')}
                    className="text-red-500 hover:bg-white/5"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {introImageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img src={introImageUrl} alt="preview" className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}

            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white w-full"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}