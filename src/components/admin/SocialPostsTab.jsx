import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Zap, Copy, CheckCircle2, AlertCircle, Loader2, Trash2, Send } from 'lucide-react';

const PLATFORM_COLORS = {
  facebook: 'text-blue-600',
  instagram: 'text-pink-600',
  linkedin: 'text-blue-700',
  x: 'text-black',
  website: 'text-purple-600',
};

const STATUS_ICONS = {
  DRAFT: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  PENDING_APPROVAL: <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />,
  APPROVED: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  PUBLISHED: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  REJECTED: <AlertCircle className="w-4 h-4 text-red-500" />,
};

const STATUS_LABELS = {
  DRAFT: 'Brouillon',
  PENDING_APPROVAL: 'En validation',
  APPROVED: 'Approuvé',
  PUBLISHED: 'Publié',
  REJECTED: 'Rejeté',
};

export default function SocialPostsTab({ user }) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState([]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['socialPosts'],
    queryFn: () => base44.asServiceRole.entities.SocialPostDraft.list('-updated_date', 100),
    initialData: [],
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      base44.functions.invoke('generateSocialPosts', {
        quantity: 10,
        includeArtists: true,
        includeEvents: true,
        includeCountdown: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
      toast.success('Posts générés !');
    },
    onError: (err) => toast.error(err.message),
  });

  const submitMutation = useMutation({
    mutationFn: () => base44.functions.invoke('submitSocialPostsForApproval', { post_ids: selectedPosts }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
      setSelectedPosts([]);
      toast.success('Posts soumis pour validation');
    },
    onError: (err) => toast.error(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: (postId) => base44.functions.invoke('approveSocialPost', { post_id: postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
      toast.success('Post approuvé');
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (postId) => base44.functions.invoke('rejectSocialPost', { post_id: postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
      toast.success('Post rejeté');
    },
    onError: (err) => toast.error(err.message),
  });

  const publishMutation = useMutation({
    mutationFn: () => base44.functions.invoke('publishApprovedPosts', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
      toast.success('Posts publiés !');
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredPosts = posts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (platformFilter !== 'all' && p.platform !== platformFilter) return false;
    return true;
  });

  const handleCopyPost = (post) => {
    const text = `${post.content}${post.hashtags ? '\n\n' + post.hashtags : ''}${post.link_url ? '\n\n' + post.link_url : ''}`;
    navigator.clipboard.writeText(text);
    toast.success('Post copié !');
  };

  const togglePost = (postId) => {
    setSelectedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2"
          >
            {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Générer posts (IA)
          </Button>
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={selectedPosts.length === 0 || submitMutation.isPending}
            variant="outline"
            className="border-white/20 text-white/70"
          >
            Soumettre {selectedPosts.length > 0 && `(${selectedPosts.length})`}
          </Button>
          {user?.role === 'super_admin' && (
            <Button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              {publishMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Publier sur site
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="DRAFT">Brouillon</SelectItem>
              <SelectItem value="PENDING_APPROVAL">En validation</SelectItem>
              <SelectItem value="APPROVED">Approuvés</SelectItem>
              <SelectItem value="PUBLISHED">Publiés</SelectItem>
              <SelectItem value="REJECTED">Rejetés</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes plateformes</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="x">X/Twitter</SelectItem>
              <SelectItem value="website">Site web</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="text-center py-8 text-white/40">Chargement...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-8 text-white/40">Aucun post</div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.id)}
                    onChange={() => togglePost(post.id)}
                    className="w-5 h-5 rounded border-white/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${PLATFORM_COLORS[post.platform]}`}>
                        {post.platform.toUpperCase()}
                      </span>
                      <span className="text-xs text-white/40">{post.post_type}</span>
                      <div className="flex items-center gap-1">{STATUS_ICONS[post.status]}</div>
                      <span className="text-xs text-white/40">{post.status}</span>
                    </div>
                    {post.title && <p className="text-sm font-semibold text-white mb-1">{post.title}</p>}
                    <p className="text-sm text-white/80 line-clamp-3">{post.content}</p>
                    {post.hashtags && (
                      <p className="text-xs text-[#FF2D8A] mt-2">{post.hashtags}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyPost(post)}
                    className="text-white/60 hover:text-white h-8 px-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  {user?.role === 'super_admin' && post.status === 'PENDING_APPROVAL' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(post.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600/30 hover:bg-green-600/50 text-green-300 h-8 px-2 text-xs"
                      >
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => rejectMutation.mutate(post.id)}
                        disabled={rejectMutation.isPending}
                        className="bg-red-600/30 hover:bg-red-600/50 text-red-300 h-8 px-2 text-xs"
                      >
                        Refuser
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}