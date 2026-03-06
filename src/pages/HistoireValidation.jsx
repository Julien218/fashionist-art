import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function HistoireValidation() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | found | invalid | expired | decided
  const [note, setNote] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [decision, setDecision] = useState(null); // 'approved' | 'rejected'

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    loadDraft();
  }, [token]);

  const loadDraft = async () => {
    try {
      const results = await base44.entities.HistoryDraft.filter({ validation_token: token });
      const d = results?.[0];
      if (!d) { setStatus('invalid'); return; }
      if (new Date(d.validation_expires_at) < new Date()) { setStatus('expired'); return; }
      if (d.status !== 'PENDING_VALIDATION') { setStatus('decided'); setDraft(d); return; }
      setDraft(d);
      setStatus('found');
    } catch (err) {
      setStatus('invalid');
    }
  };

  const handleDecision = async (approve) => {
    if (!approve && !note.trim()) {
      toast.error('Veuillez indiquer une raison de refus.');
      return;
    }
    setDeciding(true);
    const now = new Date().toISOString();
    await base44.entities.HistoryDraft.update(draft.id, {
      status: approve ? 'APPROVED' : 'REJECTED',
      approved_at: approve ? now : null,
      organizer_decision_note: note || null,
      validation_token: null,
    });
    setDecision(approve ? 'approved' : 'rejected');
    setStatus('decided');
    setDeciding(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF2D8A]" />
      </div>
    );
  }

  if (status === 'invalid') {
    return <TokenMessage icon={<XCircle className="w-12 h-12 text-red-400" />} title="Lien invalide" message="Ce lien de validation est invalide ou n'existe pas." />;
  }

  if (status === 'expired') {
    return <TokenMessage icon={<Clock className="w-12 h-12 text-yellow-400" />} title="Lien expiré" message="Ce lien de validation a expiré (validité 14 jours). Contactez l'administrateur pour en obtenir un nouveau." />;
  }

  if (status === 'decided' && !decision) {
    const alreadyDecided = draft?.status === 'APPROVED' ? 'approuvé' : draft?.status === 'PUBLISHED' ? 'publié' : 'traité';
    return <TokenMessage icon={<CheckCircle2 className="w-12 h-12 text-green-400" />} title="Déjà traité" message={`Ce contenu a déjà été ${alreadyDecided}.`} />;
  }

  if (decision) {
    return (
      <TokenMessage
        icon={decision === 'approved' ? <CheckCircle2 className="w-12 h-12 text-green-400" /> : <XCircle className="w-12 h-12 text-red-400" />}
        title={decision === 'approved' ? 'Contenu validé ✓' : 'Contenu refusé'}
        message={decision === 'approved'
          ? 'Merci ! Votre validation a bien été prise en compte. Le contenu sera publié prochainement.'
          : 'Votre refus a bien été enregistré. L\'administrateur sera notifié.'}
      />
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF2D8A]/10 border border-[#FF2D8A]/20 mb-4">
            <span className="text-[#FF2D8A] text-sm font-semibold">Fashionist'ART — Validation officielle</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-2">
            Validation de la page <span className="text-[#FF2D8A]">Histoire</span>
          </h1>
          {draft?.organizer_name && (
            <p className="text-white/50 text-sm">Bonjour <strong className="text-white">{draft.organizer_name}</strong>, merci de prendre le temps de relire ce contenu.</p>
          )}
        </div>

        {/* Preview du contenu */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="font-display font-bold text-white text-lg mb-4 border-b border-white/10 pb-3">{draft?.title}</h2>
          <div
            className="prose prose-invert max-w-none prose-p:text-white/80 prose-headings:text-white prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: draft?.content_html || '' }}
          />
        </div>

        {/* Décision */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <h3 className="font-display font-semibold text-white">Votre décision</h3>

          <div>
            <label className="text-xs text-white/40 mb-1 block">Note (obligatoire si refus, optionnelle si validation)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Commentaire, remarques, raison du refus..."
              className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-3 text-sm min-h-[80px] resize-y placeholder:text-white/30"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => handleDecision(true)}
              disabled={deciding}
              className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-1 sm:flex-none"
            >
              {deciding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Valider le contenu
            </Button>
            <Button
              onClick={() => handleDecision(false)}
              disabled={deciding}
              className="bg-red-600 hover:bg-red-700 text-white gap-2 flex-1 sm:flex-none"
            >
              {deciding ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Refuser
            </Button>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center text-xs text-white/25 mt-10 pt-6 border-t border-white/10">
          <p>Architecture &amp; réalisation : <span className="text-white/35">Js-Innov.IA</span></p>
          <p className="mt-1">Design &amp; mise en page : <span className="text-white/35">JY-Trix.AI</span></p>
        </div>
      </div>
    </div>
  );
}

function TokenMessage({ icon, title, message }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md bg-white/5 border border-white/10 rounded-2xl p-10">
        <div className="flex justify-center mb-4">{icon}</div>
        <h2 className="font-display font-bold text-xl text-white mb-3">{title}</h2>
        <p className="text-white/50 text-sm leading-relaxed">{message}</p>
        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/20">
          <p>Architecture &amp; réalisation : Js-Innov.IA</p>
          <p className="mt-1">Design &amp; mise en page : JY-Trix.AI</p>
        </div>
      </div>
    </div>
  );
}