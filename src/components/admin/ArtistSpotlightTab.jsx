import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2, Zap, Calendar, User, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente',  color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  VALIDATED: { label: 'Validé',      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  REJECTED:  { label: 'Refusé',      color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  PUBLISHED: { label: 'Publié ✅',   color: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

export default function ArtistSpotlightTab({ user }) {
  const [runningManual, setRunningManual] = useState(false);
  const [validatingId, setValidatingId] = useState(null);
  const queryClient = useQueryClient();

  const { data: spotlights = [], isLoading } = useQuery({
    queryKey: ['artist-spotlights'],
    queryFn: () => base44.entities.ArtistDailySpotlight.list('-created_date', 30),
    refetchInterval: 10000,
  });

  // Lancer manuellement le bot du jour
  const runManual = async () => {
    setRunningManual(true);
    try {
      const res = await base44.functions.invoke('dailyArtistSpotlight', {});
      toast.success(res?.data?.message || '2 artistes envoyés à Olivier !');
      queryClient.invalidateQueries({ queryKey: ['artist-spotlights'] });
    } catch (e) {
      toast.error('Erreur : ' + e.message);
    } finally {
      setRunningManual(false);
    }
  };

  // Valider ou refuser
  const handleAction = async (spotlight_id, action, platform = 'facebook') => {
    setValidatingId(spotlight_id + action);
    try {
      const res = await base44.functions.invoke('validateArtistSpotlight', {
        spotlight_id,
        action,
        platform,
      });
      toast.success(res?.data?.message || 'Action effectuée');
      queryClient.invalidateQueries({ queryKey: ['artist-spotlights'] });
    } catch (e) {
      toast.error('Erreur : ' + e.message);
    } finally {
      setValidatingId(null);
    }
  };

  const pending = spotlights.filter(s => s.validation_status === 'PENDING');
  const done = spotlights.filter(s => s.validation_status !== 'PENDING');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FF2D8A]" /> Spotlight Artistes Quotidien
          </h2>
          <p className="text-xs text-white/40 mt-1">2 artistes sélectionnés automatiquement chaque jour à 9h → validation Olivier → publication</p>
        </div>
        <Button
          onClick={runManual}
          disabled={runningManual}
          className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2 text-sm"
        >
          {runningManual ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Lancer maintenant
        </Button>
      </div>

      {/* Pending validations */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-display font-semibold text-yellow-400 mb-3 flex items-center gap-2">
            ⏳ En attente de validation ({pending.length})
          </h3>
          <div className="space-y-4">
            {pending.map(s => (
              <div key={s.id} className="bg-white/5 border border-yellow-500/20 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#FF2D8A]/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#FF2D8A]" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-white text-sm">{s.artist_name}</p>
                      <p className="text-xs text-white/40 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {s.date} · Artiste {s.batch_index}/2
                      </p>
                    </div>
                  </div>
                  <Badge className={STATUS_CONFIG[s.validation_status]?.color + ' text-xs'}>
                    {STATUS_CONFIG[s.validation_status]?.label}
                  </Badge>
                </div>

                {/* Post preview */}
                <div className="bg-black/30 rounded-xl p-3 mb-4 text-xs text-white/70 leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto border border-white/5">
                  {s.post_content}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {['facebook', 'instagram'].map(platform => (
                    <Button
                      key={platform}
                      onClick={() => handleAction(s.id, 'VALIDATED', platform)}
                      disabled={!!validatingId}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs"
                    >
                      {validatingId === s.id + 'VALIDATED' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      ✅ Valider → {platform}
                    </Button>
                  ))}
                  <Button
                    onClick={() => handleAction(s.id, 'REJECTED')}
                    disabled={!!validatingId}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/10 gap-1.5 text-xs border border-red-500/20"
                  >
                    {validatingId === s.id + 'REJECTED' ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                    Refuser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#FF2D8A]" /></div>}

      {/* Historique */}
      {done.length > 0 && (
        <div>
          <h3 className="text-sm font-display font-semibold text-white/50 mb-3">Historique ({done.length})</h3>
          <div className="space-y-2">
            {done.map(s => (
              <div key={s.id} className="bg-white/3 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-white/30" />
                  <div>
                    <p className="text-sm font-display font-semibold text-white/80">{s.artist_name}</p>
                    <p className="text-xs text-white/30">{s.date} · {s.platform}</p>
                  </div>
                </div>
                <Badge className={STATUS_CONFIG[s.validation_status]?.color + ' text-xs'}>
                  {STATUS_CONFIG[s.validation_status]?.label}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && spotlights.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <Zap className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Aucun spotlight généré pour l'instant.</p>
          <p className="text-xs mt-1">Le bot tourne automatiquement chaque jour à 9h.</p>
        </div>
      )}
    </div>
  );
}