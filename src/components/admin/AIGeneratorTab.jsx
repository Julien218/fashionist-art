import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Image, Film, Download, Copy, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AIGeneratorTab() {
  const [activeTab, setActiveTab] = useState('image');

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-[#FF2D8A]" />
        <h2 className="font-display font-bold text-2xl text-white">Générateur IA</h2>
        <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">Super Admin</Badge>
      </div>

      {/* Tab switch */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'image'
              ? 'bg-[#FF2D8A] text-white shadow-lg'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Image className="w-4 h-4" /> Génération d'image
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'video'
              ? 'bg-[#7C4DFF] text-white shadow-lg'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" /> Prompt vidéo IA
        </button>
      </div>

      {activeTab === 'image' && <ImageGenerator />}
      {activeTab === 'video' && <VideoPromptGenerator />}
    </div>
  );
}

function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const suggestions = [
    'Affiche événementielle mode & art, style néon fuchsia sur fond sombre, typographie élégante',
    'Portrait artistique d\'une mannequin en tenue haute couture, lumière dorée, ambiance galerie',
    'Scène de défilé de mode futuriste, couleurs vives, flou artistique, style magazine',
    'Bannière réseaux sociaux Fashionist\'ART 2026, palette rose/or/noir, dynamique',
    'Arrière-plan scénique pour exposition art & mode, abstraite, tons sombres lumineux',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Décrivez l\'image à générer'); return; }
    setLoading(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt,
        ...(referenceUrl ? { existing_image_urls: [referenceUrl] } : {}),
      });
      setGeneratedUrl(result.url);
      setHistory((prev) => [{ url: result.url, prompt }, ...prev.slice(0, 7)]);
      toast.success('Image générée !');
    } catch (e) {
      toast.error('Erreur de génération : ' + e.message);
    }
    setLoading(false);
  };

  const handleDownload = async (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `fashionistart-ia-${Date.now()}.png`;
    a.target = '_blank';
    a.click();
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiée !');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: controls */}
      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium text-white/50 mb-2 block">Prompt de génération *</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez l'image souhaitée en détail..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-32 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/50 mb-2 block">Image de référence (URL, optionnel)</label>
          <Input
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="https://... (pour s'en inspirer ou la modifier)"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
          />
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-xs font-medium text-white/40 mb-2">💡 Suggestions rapides</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setPrompt(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-[#FF2D8A]/40 transition-all text-left"
              >
                {s.slice(0, 40)}…
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white w-full gap-2 py-6 text-base font-semibold"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Génération en cours (5-10s)...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Générer l'image</>
          )}
        </Button>
      </div>

      {/* Right: result */}
      <div className="space-y-5">
        {generatedUrl ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Résultat</p>
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={generatedUrl} alt="Généré par IA" className="w-full object-cover" />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <Button size="sm" onClick={() => handleCopyUrl(generatedUrl)} className="bg-black/70 hover:bg-black text-white gap-1.5 text-xs">
                  <Copy className="w-3.5 h-3.5" /> URL
                </Button>
                <Button size="sm" onClick={() => handleDownload(generatedUrl)} className="bg-[#FF2D8A]/90 hover:bg-[#FF2D8A] text-white gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5" /> Télécharger
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 flex items-center justify-center h-64">
            <div className="text-center text-white/20">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">L'image générée apparaîtra ici</p>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div>
            <p className="text-xs font-medium text-white/40 mb-2">Historique de session</p>
            <div className="grid grid-cols-4 gap-2">
              {history.slice(1).map((item, i) => (
                <button key={i} onClick={() => setGeneratedUrl(item.url)} title={item.prompt} className="rounded-lg overflow-hidden border border-white/10 hover:border-[#FF2D8A]/40 transition-all">
                  <img src={item.url} alt="" className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoPromptGenerator() {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = [
    { value: 'cinematic', label: '🎬 Cinématique' },
    { value: 'social_media', label: '📱 Réseaux sociaux' },
    { value: 'documentary', label: '🎥 Documentaire' },
    { value: 'artistic', label: '🎨 Artistique' },
    { value: 'teaser', label: '⚡ Teaser / Hype' },
  ];

  const topicSuggestions = [
    'Défilé de mode Fashionist\'ART 2026',
    'Artiste en performance live',
    'Backstage de l\'événement',
    'Présentation d\'un partenaire',
    'Compte à rebours avant l\'événement',
    'Visite des expositions',
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error('Décrivez le sujet de la vidéo'); return; }
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un expert en production vidéo pour événements mode & art. 
Génère un prompt détaillé pour créer une vidéo IA (Sora, Runway, Kling...) sur ce sujet :

Sujet : ${topic}
Style visuel : ${style}
Événement : Fashionist'ART – fusion mode & art, Centre Sportif d'Élouges, Dour, Belgique, 18 avril 2026
Palette : rose fuchsia #FF2D8A, or #D4AF37, fond sombre

Fournis :
1. Un prompt principal ultra-détaillé en anglais (pour Sora/Runway)
2. Une version courte en français pour brief créatif
3. Paramètres recommandés (durée, ratio, style caméra)
4. 3 idées de plans/scènes`,
        response_json_schema: {
          type: 'object',
          properties: {
            prompt_en: { type: 'string' },
            brief_fr: { type: 'string' },
            params: { type: 'string' },
            scenes: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      setGenerated(result);
      toast.success('Prompt vidéo généré !');
    } catch (e) {
      toast.error('Erreur : ' + e.message);
    }
    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié !');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left */}
      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium text-white/50 mb-2 block">Sujet / scène de la vidéo *</label>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: défilé de mode avec artistes, ambiance événementielle..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-28 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/50 mb-2 block">Style visuel</label>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  style === s.value
                    ? 'bg-[#7C4DFF] text-white'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-white/40 mb-2">💡 Idées de sujets</p>
          <div className="flex flex-wrap gap-2">
            {topicSuggestions.map((s, i) => (
              <button key={i} onClick={() => setTopic(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-[#7C4DFF]/40 transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="bg-[#7C4DFF] hover:bg-[#6B3FCC] text-white w-full gap-2 py-6 text-base font-semibold"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Génération en cours...</>
          ) : (
            <><Film className="w-5 h-5" /> Générer le prompt vidéo</>
          )}
        </Button>
      </div>

      {/* Right: result */}
      <div className="space-y-4">
        {generated ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#7C4DFF] uppercase tracking-wider">Prompt principal (EN) — pour Sora / Runway / Kling</p>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(generated.prompt_en)} className="text-white/50 hover:text-white h-7 px-2">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{generated.prompt_en}</p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Brief créatif (FR)</p>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(generated.brief_fr)} className="text-white/50 hover:text-white h-7 px-2">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{generated.brief_fr}</p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Paramètres recommandés</p>
                <p className="text-sm text-white/60">{generated.params}</p>
              </div>

              {generated.scenes?.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Plans / Scènes</p>
                  <ul className="space-y-1.5">
                    {generated.scenes.map((scene, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-[#7C4DFF] font-bold shrink-0">{i + 1}.</span>
                        {scene}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button variant="outline" onClick={handleGenerate} className="w-full gap-2 border-white/10 text-white/60 hover:text-white">
              <RefreshCw className="w-4 h-4" /> Regénérer
            </Button>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 flex items-center justify-center h-64">
            <div className="text-center text-white/20">
              <Film className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Le prompt vidéo apparaîtra ici</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}