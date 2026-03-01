import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UserPlus, Download, Mail, CheckCircle, XCircle, Clock, Eye, Loader2, Search } from 'lucide-react';

const statusColors = {
  invite: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  en_attente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  valide: 'bg-green-500/10 text-green-400 border-green-500/20',
  refuse: 'bg-red-500/10 text-red-400 border-red-500/20',
};
const statusLabels = { invite: 'Invité', en_attente: 'En attente', valide: 'Validé', refuse: 'Refusé' };

export default function ParticipantsTab({ user }) {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirst, setInviteFirst] = useState('');
  const [inviteLast, setInviteLast] = useState('');
  const [inviting, setInviting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [exporting, setExporting] = useState(false);

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ['participants'],
    queryFn: () => base44.entities.ParticipantForm.list('-created_date'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ParticipantForm.update(id, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['participants'] }); toast.success('Statut mis à jour'); },
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    const res = await base44.functions.invoke('sendParticipantInvitation', {
      email: inviteEmail, first_name: inviteFirst, last_name: inviteLast
    });
    if (res.data?.success) {
      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setInviteEmail(''); setInviteFirst(''); setInviteLast('');
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    } else {
      toast.error(res.data?.error || 'Erreur lors de l\'envoi');
    }
    setInviting(false);
  };

  const handleExport = async () => {
    setExporting(true);
    const res = await base44.functions.invoke('exportParticipantsCSV', {});
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `participants_fashionistart_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    setExporting(false);
  };

  const filtered = participants.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.email || '').toLowerCase().includes(q) ||
      (p.first_name || '').toLowerCase().includes(q) ||
      (p.last_name || '').toLowerCase().includes(q);
  });

  const stats = {
    total: participants.length,
    invite: participants.filter(p => p.status === 'invite').length,
    en_attente: participants.filter(p => p.status === 'en_attente').length,
    valide: participants.filter(p => p.status === 'valide').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Invités', value: stats.invite, color: 'text-blue-400' },
          { label: 'En attente', value: stats.en_attente, color: 'text-yellow-400' },
          { label: 'Validés', value: stats.valide, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="glass-dark neon-border rounded-xl p-4 text-center">
            <p className={`font-display font-black text-3xl ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invite form */}
      <div className="glass-dark neon-border rounded-2xl p-6">
        <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#FF2D8A]" /> Inviter un participant
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <Input placeholder="Prénom" value={inviteFirst} onChange={e => setInviteFirst(e.target.value)}
            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" />
          <Input placeholder="Nom" value={inviteLast} onChange={e => setInviteLast(e.target.value)}
            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" />
          <Input type="email" placeholder="email@exemple.com *" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <Button onClick={handleInvite} disabled={inviting || !inviteEmail} className="btn-primary text-sm py-2.5 px-5">
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Envoyer l'invitation
          </Button>
          <Button onClick={handleExport} disabled={exporting} variant="outline"
            className="text-sm py-2.5 px-5 border-white/20 text-white/70 hover:text-white hover:bg-white/5">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Search + list */}
      <div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="h-11 pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" />
        </div>

        {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF2D8A]" /> : (
          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="glass-dark rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-white truncate">
                    {p.first_name || ''} {p.last_name || ''} {(!p.first_name && !p.last_name) ? p.email : ''}
                  </p>
                  <p className="text-xs text-white/40 truncate">{p.email} · {p.discipline || '—'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={`text-xs border ${statusColors[p.status] || ''}`}>{statusLabels[p.status] || p.status}</Badge>
                  {p.status === 'en_attente' && (
                    <>
                      <button onClick={() => updateStatus.mutate({ id: p.id, status: 'valide' })}
                        className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateStatus.mutate({ id: p.id, status: 'refuse' })}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setSelectedParticipant(p)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-center text-white/30 py-8">Aucun participant</p>}
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedParticipant} onOpenChange={() => setSelectedParticipant(null)}>
        <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedParticipant && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white font-display">
                  {selectedParticipant.first_name} {selectedParticipant.last_name || selectedParticipant.email}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  ['Email', selectedParticipant.email],
                  ['Téléphone', selectedParticipant.phone],
                  ['Âge', selectedParticipant.age],
                  ['Ville', selectedParticipant.city],
                  ['Pays', selectedParticipant.country],
                  ['Discipline', selectedParticipant.discipline],
                  ['Niveau', selectedParticipant.experience_level],
                  ['Type participation', selectedParticipant.participation_type],
                  ['Portfolio', selectedParticipant.portfolio_url],
                  ['Besoins spéciaux', selectedParticipant.special_needs],
                  ['Comment entendu', selectedParticipant.how_did_you_hear],
                  ['Soumis le', selectedParticipant.submitted_at ? new Date(selectedParticipant.submitted_at).toLocaleString('fr-BE') : null],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-white/40 min-w-[120px]">{label} :</span>
                    <span className="text-white/80 break-all">{value}</span>
                  </div>
                ))}
                {selectedParticipant.motivation && (
                  <div>
                    <p className="text-white/40 mb-1">Motivation :</p>
                    <p className="text-white/80 bg-white/5 rounded-xl p-3 text-xs leading-relaxed">{selectedParticipant.motivation}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => { updateStatus.mutate({ id: selectedParticipant.id, status: 'valide' }); setSelectedParticipant(null); }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="w-4 h-4" /> Valider
                  </Button>
                  <Button onClick={() => { updateStatus.mutate({ id: selectedParticipant.id, status: 'refuse' }); setSelectedParticipant(null); }}
                    variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <XCircle className="w-4 h-4" /> Refuser
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}