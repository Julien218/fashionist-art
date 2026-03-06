import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, Building2, Zap } from 'lucide-react';

const STATUS_CONFIG = {
  NOT_STARTED: { label: 'Non connecté', color: 'bg-gray-500/10 text-gray-400', icon: AlertTriangle },
  PENDING: { label: 'En cours', color: 'bg-yellow-500/10 text-yellow-400', icon: Loader2 },
  COMPLETE: { label: 'Actif ✓', color: 'bg-green-500/10 text-green-400', icon: CheckCircle2 },
  RESTRICTED: { label: 'Restreint', color: 'bg-red-500/10 text-red-400', icon: AlertTriangle },
};

export default function ConnectOnboarding({ user }) {
  const [orgName, setOrgName] = useState('');
  const [creating, setCreating] = useState(false);
  const qc = useQueryClient();

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['my-organizations'],
    queryFn: async () => {
      const all = await base44.entities.Organization.list('-created_date', 20);
      if (user.role === 'super_admin') return all;
      return all.filter((o) => o.owner_user_id === user.id);
    },
  });

  const myOrg = orgs?.[0] || null;

  const createOrg = async () => {
    if (!orgName.trim()) return toast.error('Nom requis');
    setCreating(true);
    await base44.entities.Organization.create({ name: orgName, owner_user_id: user.id });
    await qc.invalidateQueries({ queryKey: ['my-organizations'] });
    setOrgName('');
    setCreating(false);
    toast.success('Organisation créée !');
  };

  const connectMutation = useMutation({
    mutationFn: async (org_id) => {
      const res = await base44.functions.invoke('connectCreateAccount', { organization_id: org_id });
      return res.data;
    },
    onSuccess: async (data, org_id) => {
      if (data?.success) {
        // Créer lien onboarding
        const linkRes = await base44.functions.invoke('connectCreateOnboardingLink', { organization_id: org_id });
        if (linkRes.data?.onboarding_url) {
          window.open(linkRes.data.onboarding_url, '_blank');
          toast.success('Redirection vers Stripe...');
        }
        qc.invalidateQueries({ queryKey: ['my-organizations'] });
      } else {
        toast.error(data?.error || 'Erreur connexion Stripe');
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const refreshMutation = useMutation({
    mutationFn: async (org_id) => {
      const res = await base44.functions.invoke('connectRefreshStatus', { organization_id: org_id });
      return res.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['my-organizations'] });
      if (data?.onboarding_status === 'COMPLETE') {
        toast.success('Compte Stripe actif !');
      } else {
        toast.info(`Statut: ${data?.onboarding_status}`);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const resumeOnboardingMutation = useMutation({
    mutationFn: async (org_id) => {
      const res = await base44.functions.invoke('connectCreateOnboardingLink', { organization_id: org_id });
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.onboarding_url) window.open(data.onboarding_url, '_blank');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white/40" /></div>;

  if (!myOrg) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-5 h-5 text-[#FF2D8A]" />
          <h3 className="font-display font-semibold text-white">Créer votre organisation</h3>
        </div>
        <p className="text-sm text-white/50">Avant de configurer Stripe, créez votre organisation pour recevoir les paiements.</p>
        <div className="flex gap-3">
          <Input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Nom de l'organisation (ex: Bar Fashionist'ART)"
            className="bg-white/5 border-white/10 text-white flex-1"
          />
          <Button onClick={createOrg} disabled={creating} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer'}
          </Button>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[myOrg.onboarding_status || 'NOT_STARTED'];
  const isComplete = myOrg.onboarding_status === 'COMPLETE' && myOrg.charges_enabled;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#FF2D8A]" />
          <div>
            <h3 className="font-display font-semibold text-white">{myOrg.name}</h3>
            <p className="text-xs text-white/40">{myOrg.stripe_connected_account_id || 'Pas encore de compte Stripe'}</p>
          </div>
        </div>
        <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
      </div>

      {isComplete ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <p className="text-sm text-green-300">Compte Stripe actif — vous pouvez encaisser des paiements.</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <p className="text-sm text-yellow-300">Compte non activé — le module Bar sera bloqué tant que l'onboarding n'est pas terminé.</p>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        {!myOrg.stripe_connected_account_id && (
          <Button
            onClick={() => connectMutation.mutate(myOrg.id)}
            disabled={connectMutation.isPending}
            className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-2"
          >
            {connectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Connecter mon compte Stripe
          </Button>
        )}

        {myOrg.stripe_connected_account_id && !isComplete && (
          <Button
            onClick={() => resumeOnboardingMutation.mutate(myOrg.id)}
            disabled={resumeOnboardingMutation.isPending}
            className="bg-[#D4AF37] hover:bg-[#B8960C] text-black gap-2"
          >
            {resumeOnboardingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Reprendre l'onboarding
          </Button>
        )}

        {myOrg.stripe_connected_account_id && (
          <Button
            onClick={() => refreshMutation.mutate(myOrg.id)}
            disabled={refreshMutation.isPending}
            variant="outline"
            className="border-white/20 text-white/70 hover:text-white gap-2"
          >
            {refreshMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Actualiser le statut
          </Button>
        )}
      </div>
    </div>
  );
}