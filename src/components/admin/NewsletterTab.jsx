import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Sparkles, Send, CheckCircle, Clock, Eye, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const STATUS_LABELS = {
  DRAFT: { label: 'Brouillon', color: 'bg-gray-500/20 text-gray-300' },
  PENDING_APPROVAL: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-300' },
  APPROVED: { label: 'Approuvée', color: 'bg-green-500/20 text-green-300' },
  SENT: { label: 'Envoyée', color: 'bg-blue-500/20 text-blue-300' },
};

export default function NewsletterTab({ user }) {
  const queryClient = useQueryClient();
  const isSuperAdmin = user.role === 'super_admin';

  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({ title: '', theme: '', month: '', includeUpcomingEvents: true });
  const [showGenForm, setShowGenForm] = useState(false);

  const [actioning, setActioning] = useState(null);
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [editCampaign, setEditCampaign] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['NewsletterCampaign'],
    queryFn: () => base44.entities.NewsletterCampaign.list('-created_date'),
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ['NewsletterSubscribers'],
    queryFn: async () => {
      const all = await base44.entities.NewsletterSubscriber.list();
      return all.filter(s => !s.unsubscribed);
    },
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateNewsletterDraft', genForm);
      toast.success('Brouillon généré par IA !');
      queryClient.invalidateQueries({ queryKey: ['NewsletterCampaign'] });
      setShowGenForm(false);
      setGenForm({ title: '', theme: '', month: '', includeUpcomingEvents: true });
    } catch (err) {
      toast.error("Erreur lors de la génération.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = async (campaignId, action) => {
    setActioning(campaignId + action);
    try {
      const res = await base44.functions.invoke('newsletterActions', { action, campaign_id: campaignId });
      if (res.data?.error) throw new Error(res.data.error);
      const msgs = { submit: 'Soumis pour validation !', approve: 'Campagne approuvée !', send: `Envoyé ! (${res.data?.sent || 0} emails)` };
      toast.success(msgs[action] || 'Action effectuée');
      queryClient.invalidateQueries({ queryKey: ['NewsletterCampaign'] });
    } catch (err) {
      toast.error(err.message || "Erreur");
    } finally {
      setActioning(null);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('newsletterUpdate', {
        campaign_id: editCampaign.id,
        title: editCampaign.title,
        subject: editCampaign.subject,
        html: editCampaign.html,
        text: editCampaign.text,
        scheduled_at: editCampaign.scheduled_at || null,
      });
      toast.success('Campagne mise à jour !');
      queryClient.invalidateQueries({ queryKey: ['NewsletterCampaign'] });
      setEditCampaign(null);
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Newsletter</h2>
          <p className="text-sm text-white/40 mt-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> {subscribers.length} abonné(s) actif(s)
          </p>
        </div>
        <Button onClick={() => setShowGenForm(!showGenForm)}
          className="gap-2 text-white" style={{ background: 'linear-gradient(135deg,#FF2D8A,#9B26AF)' }}>
          <Sparkles className="w-4 h-4" /> Générer brouillon (IA)
          {showGenForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Gen form */}
      {showGenForm && (
        <div className="glass-dark neon-border rounded-2xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-white text-sm">Paramètres de génération IA</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Titre interne</label>
              <Input value={genForm.title} onChange={(e) => setGenForm({ ...genForm, title: e.target.value })}
                placeholder="Newsletter Avril 2026" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Mois ciblé</label>
              <Input value={genForm.month} onChange={(e) => setGenForm({ ...genForm, month: e.target.value })}
                placeholder="Avril 2026" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Thème / angle éditorial</label>
            <Input value={genForm.theme} onChange={(e) => setGenForm({ ...genForm, theme: e.target.value })}
              placeholder="Présentation des artistes, compte à rebours, programme..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="incl-events" checked={genForm.includeUpcomingEvents}
              onChange={(e) => setGenForm({ ...genForm, includeUpcomingEvents: e.target.checked })}
              className="rounded border-white/20" />
            <label htmlFor="incl-events" className="text-xs text-white/60">Inclure données artistes & programme</label>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="w-full gap-2 text-white"
            style={{ background: 'linear-gradient(135deg,#FF2D8A,#9B26AF)' }}>
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</> : <><Sparkles className="w-4 h-4" /> Générer la newsletter</>}
          </Button>
        </div>
      )}

      {/* Campaigns list */}
      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /> : (
        <div className="space-y-4">
          {campaigns.length === 0 && <p className="text-center text-white/30 py-12">Aucune campagne. Générez votre premier brouillon !</p>}
          {campaigns.map((c) => {
            const statusInfo = STATUS_LABELS[c.status] || STATUS_LABELS.DRAFT;
            return (
              <div key={c.id} className="glass-dark neon-border rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-display font-semibold text-white">{c.title}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{c.subject}</p>
                    {c.scheduled_at && (
                      <p className="text-xs text-[#D4AF37] mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Planifié: {new Date(c.scheduled_at).toLocaleString('fr-BE')}
                      </p>
                    )}
                    {c.sent_at && (
                      <p className="text-xs text-green-400 mt-1">Envoyée le {new Date(c.sent_at).toLocaleString('fr-BE')}</p>
                    )}
                  </div>
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Preview */}
                  <Button size="sm" variant="outline" onClick={() => setPreviewCampaign(c)}
                    className="text-xs border-white/20 text-white/70 hover:bg-white/10 gap-1">
                    <Eye className="w-3 h-3" /> Aperçu
                  </Button>

                  {/* Edit (DRAFT or PENDING) */}
                  {['DRAFT', 'PENDING_APPROVAL'].includes(c.status) && (
                    <Button size="sm" variant="outline" onClick={() => setEditCampaign({ ...c })}
                      className="text-xs border-white/20 text-white/70 hover:bg-white/10">
                      Modifier
                    </Button>
                  )}

                  {/* Submit */}
                  {c.status === 'DRAFT' && (
                    <Button size="sm" onClick={() => handleAction(c.id, 'submit')}
                      disabled={actioning === c.id + 'submit'}
                      className="text-xs bg-yellow-600/80 hover:bg-yellow-600 text-white gap-1">
                      {actioning === c.id + 'submit' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Soumettre validation
                    </Button>
                  )}

                  {/* Approve (super_admin only) */}
                  {c.status === 'PENDING_APPROVAL' && isSuperAdmin && (
                    <Button size="sm" onClick={() => handleAction(c.id, 'approve')}
                      disabled={actioning === c.id + 'approve'}
                      className="text-xs bg-green-600/80 hover:bg-green-600 text-white gap-1">
                      {actioning === c.id + 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Approuver
                    </Button>
                  )}

                  {/* Send (super_admin only) */}
                  {c.status === 'APPROVED' && isSuperAdmin && (
                    <Button size="sm" onClick={() => { if (confirm(`Envoyer à ${subscribers.length} abonnés ?`)) handleAction(c.id, 'send'); }}
                      disabled={actioning === c.id + 'send'}
                      className="text-xs gap-1 text-white" style={{ background: 'linear-gradient(135deg,#FF2D8A,#C2185B)' }}>
                      {actioning === c.id + 'send' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Envoyer maintenant ({subscribers.length})
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewCampaign} onOpenChange={() => setPreviewCampaign(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#0A0A0F] border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{previewCampaign?.title}</DialogTitle>
          </DialogHeader>
          {previewCampaign?.html ? (
            <iframe
              srcDoc={previewCampaign.html.replace('{{UNSUBSCRIBE_URL}}', '#')}
              className="w-full rounded-xl border border-white/10"
              style={{ height: '500px' }}
              title="Aperçu newsletter"
            />
          ) : (
            <pre className="text-white/60 text-xs whitespace-pre-wrap">{previewCampaign?.text}</pre>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCampaign} onOpenChange={() => setEditCampaign(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0A0A0F] border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier la campagne</DialogTitle>
          </DialogHeader>
          {editCampaign && (
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Titre interne</label>
                <Input value={editCampaign.title || ''} onChange={(e) => setEditCampaign({ ...editCampaign, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white rounded-xl" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Objet de l'email</label>
                <Input value={editCampaign.subject || ''} onChange={(e) => setEditCampaign({ ...editCampaign, subject: e.target.value })}
                  className="bg-white/5 border-white/10 text-white rounded-xl" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Planifier l'envoi (optionnel)</label>
                <Input type="datetime-local" value={editCampaign.scheduled_at ? editCampaign.scheduled_at.substring(0, 16) : ''}
                  onChange={(e) => setEditCampaign({ ...editCampaign, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="bg-white/5 border-white/10 text-white rounded-xl" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Contenu texte brut</label>
                <Textarea value={editCampaign.text || ''} onChange={(e) => setEditCampaign({ ...editCampaign, text: e.target.value })}
                  rows={5} className="bg-white/5 border-white/10 text-white rounded-xl text-xs" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">HTML</label>
                <Textarea value={editCampaign.html || ''} onChange={(e) => setEditCampaign({ ...editCampaign, html: e.target.value })}
                  rows={10} className="bg-white/5 border-white/10 text-white rounded-xl font-mono text-xs" />
              </div>
              <Button onClick={handleSaveEdit} disabled={saving} className="w-full text-white" style={{ background: 'linear-gradient(135deg,#FF2D8A,#C2185B)' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer les modifications'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}