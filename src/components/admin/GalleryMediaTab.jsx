import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { HardDrive, Trash2, Loader2, Image, Film, Plus, ExternalLink, FolderOpen } from 'lucide-react';

export default function GalleryMediaTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ fileId: '', title: '', artistName: '', category: '', edition: '2025', mediaType: 'photo' });
  const [importing, setImporting] = useState(false);

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['gallery-media-admin'],
    queryFn: () => base44.entities.GalleryMedia.list('-created_date', 200),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GalleryMedia.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['gallery-media-admin'] }); toast.success('Supprimé !'); },
  });

  const handleImport = async () => {
    if (!form.fileId.trim()) { toast.error('Entrez un ID ou lien Google Drive'); return; }
    setImporting(true);
    try {
      let fileId = form.fileId.trim();
      const match = fileId.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) fileId = match[1];

      await base44.functions.invoke('driveImportFolder', {
        fileId,
        title: form.title,
        artistName: form.artistName,
        category: form.category,
        edition: form.edition,
        mediaType: form.mediaType,
      });
      toast.success('Média importé depuis Drive !');
      queryClient.invalidateQueries({ queryKey: ['gallery-media-admin'] });
      setForm({ fileId: '', title: '', artistName: '', category: '', edition: '2025', mediaType: 'photo' });
    } catch (e) {
      toast.error('Erreur lors de l\'import : ' + e.message);
    }
    setImporting(false);
  };

  const groupedByEdition = media.reduce((acc, m) => {
    const ed = m.edition || 'Sans édition';
    if (!acc[ed]) acc[ed] = [];
    acc[ed].push(m);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-[#FF2D8A]" /> Galerie Médias
        </h2>
        <a
          href="https://drive.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] border border-[#D4AF37]/20 rounded-full px-3 py-1.5 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> Ouvrir Google Drive
        </a>
      </div>

      {/* Import form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#D4AF37]" /> Importer depuis Google Drive
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="sm:col-span-2">
            <label className="text-xs text-white/40 mb-1 block">Lien ou ID Google Drive *</label>
            <Input
              placeholder="https://drive.google.com/file/d/... ou ID"
              value={form.fileId}
              onChange={e => setForm({ ...form, fileId: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Titre</label>
            <Input
              placeholder="Titre du média"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Artiste</label>
            <Input
              placeholder="Nom de l'artiste"
              value={form.artistName}
              onChange={e => setForm({ ...form, artistName: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Catégorie</label>
            <Input
              placeholder="Défilé, Backstage, Performance..."
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Édition</label>
            <Select value={form.edition} onValueChange={v => setForm({ ...form, edition: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Type de média</label>
            <Select value={form.mediaType} onValueChange={v => setForm({ ...form, mediaType: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleImport}
          disabled={importing || !form.fileId.trim()}
          className="bg-[#D4AF37] hover:bg-[#B8962E] text-black font-semibold gap-2 w-full sm:w-auto"
        >
          {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {importing ? 'Import en cours...' : 'Importer le fichier'}
        </Button>
        <p className="text-xs text-white/25 mt-3">
          💡 Assurez-vous que le fichier Drive est partagé en "Toute personne avec le lien peut voir"
        </p>
      </div>

      {/* Media list by edition */}
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-white/40" /></div>
      ) : (
        Object.entries(groupedByEdition).sort((a, b) => b[0].localeCompare(a[0])).map(([edition, items]) => (
          <div key={edition} className="mb-8">
            <h3 className="font-display font-semibold text-sm text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF2D8A] inline-block" />
              Édition {edition} — {items.length} média{items.length > 1 ? 's' : ''}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {items.map(item => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group relative">
                  <div className="aspect-square bg-black/40 relative">
                    {item.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <Film className="w-8 h-8 text-white/20" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Film className="w-6 h-6 text-[#FF2D8A]" />
                        </div>
                      </div>
                    ) : (
                      <img src={item.thumbnail_url || item.url} alt={item.title} className="w-full h-full object-cover" />
                    )}
                    {/* Delete button */}
                    <button
                      onClick={() => { if (confirm('Supprimer ce média ?')) deleteMutation.mutate(item.id); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/60"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                    {/* Type badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${item.type === 'video' ? 'bg-[#FF2D8A]/80 text-white' : 'bg-[#D4AF37]/80 text-black'}`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-white font-display truncate">{item.title}</p>
                    {item.artist_name && <p className="text-[10px] text-[#FF2D8A]/70 truncate">{item.artist_name}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {media.length === 0 && !isLoading && (
        <div className="text-center py-12 text-white/20">
          <Image className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Aucun média pour l'instant. Commencez par importer depuis Drive.</p>
        </div>
      )}
    </div>
  );
}