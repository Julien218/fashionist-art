import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Film, Copy, Eye, EyeOff, RefreshCw, Clapperboard, Download } from 'lucide-react';
import { toast } from 'sonner';

const SERVICES = [
  { value: 'runway', label: 'RunwayML Gen-4', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', docs: 'https://runwayml.com' },
  { value: 'kling', label: 'Kling AI v1', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', docs: 'https://klingai.com' },
  { value: 'luma', label: 'Luma Dream Machine', color: 'bg-green-500/20 text-green-300 border-green-500/30', docs: 'https://lumalabs.ai' },
];

const RATIOS = ['16:9', '9:16', '1:1', '4:3', '1280:720'];
const DURATIONS = [5, 10];

const SUGGESTIONS = [
  "Défilé de mode Fashionist'ART, couleurs fuchsia et dorées, flou artistique cinématique",
  "Artiste peintre en performance live, gestes expressifs, lumière dramatique",
  "Backstage d'un défilé, ambiance coulisses, caméra épaule",
  "Silhouette de mannequin élégante, fond sombre, lumières néon rose",
  "Foule admirant des œuvres dans une galerie d'art, ambiance feutrée",
];

export default function VideoEditorAgent() {
  const [service, setService] = useState('runway');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [duration, setDuration] = useState(5);
  const [ratio, setRatio] = useState('16:9');

  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [progress, setProgress] = useState(null);
  const pollingRef = useRef(null);

  const stopPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  const startPolling = (tid, svc, key) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await base44.functions.invoke('videoEditorStatus', { service: svc, api_key: key, task_id: tid });
        const d = res.data;
        setTaskStatus(d.status);
        if (d.progress != null) setProgress(Math.round(d.progress * 100));
        if (d.video_url) {
          setVideoUrl(d.video_url);
          setLoading(false);
          stopPolling();
          toast.success('Vidéo générée !');
        }
        const failed = ['FAILED', 'failed', 'error'].includes(d.status);
        if (failed) {
          setLoading(false);
          stopPolling();
          toast.error('Génération échouée.');
        }
      } catch (e) {
        console.error(e);
      }
    }, 5000);
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) { toast.error('Clé API requise'); return; }
    if (!prompt.trim()) { toast.error('Prompt requis'); return; }

    setLoading(true);
    setTaskId(null);
    setVideoUrl(null);
    setTaskStatus(null);
    setProgress(null);

    try {
      const res = await base44.functions.invoke('videoEditorAgent', {
        service,
        api_key: apiKey,
        prompt,
        image_url: imageUrl || undefined,
        duration,
        ratio,
      });
      const d = res.data;
      if (d?.error) { toast.error(d.error); setLoading(false); return; }
      setTaskId(d.task_id);
      setTaskStatus(d.status);
      toast.success('Tâche lancée, génération en cours...');
      startPolling(d.task_id, service, apiKey);
    } catch (e) {
      toast.error(e.message);
      setLoading(false);
    }
  };

  const selectedService = SERVICES.find(s => s.value === service);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: config */}
      <div className="space-y-5">

        {/* Service selector */}
        <div>
          <label className="text-xs font-medium text-white/50 mb-2 block">Service IA vidéo</label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map(s => (
              <button
                key={s.value}
                onClick={() => setService(s.value)}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  service === s.value ? s.color : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <a href={selectedService?.docs} target="_blank" rel="noopener noreferrer"
            className="text-xs text-white/30 hover:text-white/60 mt-1 inline-block transition-colors">
            → Obtenir une clé API {selectedService?.label}
          </a>
        </div>

        {/* API Key */}
        <div>
          <label className="text-xs font-medium text-white/50 mb-2 block">Clé API personnelle *</label>
          <div className="flex gap-2">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-... ou votre clé API"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl flex-1"
            />
            <Button size="icon" variant="ghost" onClick={() => setShowKey(!showKey)} className="text-white/50 hover:text-white border border-white/10 rounded-xl">
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-white/25 mt-1">Clé utilisée uniquement pour cette génération, non sauvegardée.</p>
        </div>

        {/* Prompt */}
        <div>
          <label className="text-xs font-medium text-white/50 mb-2 block">Prompt vidéo *</label>
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Décrivez la vidéo à générer..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-28 resize-none"
          />
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-xs font-medium text-white/40 mb-2">💡 Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => setPrompt(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-[#7C4DFF]/40 transition-all text-left">
                {s.slice(0, 38)}…
              </button>
            ))}
          </div>
        </div>

        {/* Image de référence */}
        <div>
          <label className="text-xs font-medium text-white/50 mb-2 block">Image de référence (URL, optionnel)</label>
          <Input
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://... (image de départ)"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
          />
        </div>

        {/* Durée & ratio */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-white/50 mb-2 block">Durée</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-xl text-sm border transition-all ${
                    duration === d ? 'bg-[#7C4DFF] border-[#7C4DFF] text-white' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}>
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 mb-2 block">Format</label>
            <div className="flex flex-wrap gap-2">
              {['16:9', '9:16', '1:1'].map(r => (
                <button key={r} onClick={() => setRatio(r)}
                  className={`px-3 py-2 rounded-xl text-xs border transition-all ${
                    ratio === r ? 'bg-[#7C4DFF] border-[#7C4DFF] text-white' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || !apiKey.trim()}
          className="bg-[#7C4DFF] hover:bg-[#6B3FCC] text-white w-full gap-2 py-6 text-base font-semibold"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Génération en cours...</>
          ) : (
            <><Clapperboard className="w-5 h-5" /> Générer la vidéo</>
          )}
        </Button>
      </div>

      {/* Right: result */}
      <div className="space-y-4">
        {videoUrl ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Vidéo générée</p>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
              <video src={videoUrl} controls className="w-full" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { navigator.clipboard.writeText(videoUrl); toast.success('URL copiée !'); }}
                variant="outline" size="sm" className="gap-1.5 border-white/10 text-white/60 hover:text-white">
                <Copy className="w-3.5 h-3.5" /> Copier URL
              </Button>
              <a href={videoUrl} download target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-[#7C4DFF] hover:bg-[#6B3FCC] text-white gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Télécharger
                </Button>
              </a>
            </div>
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#7C4DFF]" />
            <div className="text-center">
              <p className="text-white/60 text-sm">Génération vidéo en cours...</p>
              {taskId && <p className="text-white/30 text-xs mt-1">Task: {taskId.slice(0, 16)}…</p>}
              {taskStatus && <Badge className="mt-2 bg-[#7C4DFF]/20 text-[#7C4DFF] border-[#7C4DFF]/30">{taskStatus}</Badge>}
              {progress != null && <p className="text-white/40 text-xs mt-1">{progress}%</p>}
              <p className="text-white/25 text-xs mt-2">Vérification toutes les 5 secondes...</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 flex items-center justify-center h-64">
            <div className="text-center text-white/20">
              <Film className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">La vidéo générée apparaîtra ici</p>
              <p className="text-xs mt-1 text-white/15">Durée estimée : 1-3 minutes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}