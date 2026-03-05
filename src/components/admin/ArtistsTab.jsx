import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Upload, Download, Mail, Pencil, ToggleLeft, ToggleRight,
  Loader2, Search, Plus, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, ThumbsUp, ThumbsDown, Clock
} from 'lucide-react';
import ArtistFormDialog from './ArtistFormDialog';
import ArtistImportDialog from './ArtistImportDialog';

export default function ArtistsTab({ user }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [editArtist, setEditArtist] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['artists-admin'],
    queryFn: () => base44.entities.Artist.list(),
  });

  const categories = [...new Set(artists.map(a => a.category || a.discipline).filter(Boolean))];

  const filtered = artists
    .filter(a => {
      const matchSearch = !search || [a.name, a.first_name, a.last_name, a.stage_name, a.email].join(' ').toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'all' || (a.category || a.discipline) === filterCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      const va = (a[sortField] || '').toString().toLowerCase();
      const vb = (b[sortField] || '').toString().toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === filtered.length ? [] : filtered.map(a => a.id));

  const toggleStatus = async (artist) => {
    const newStatus = artist.status === 'active' ? 'inactive' : 'active';
    await base44.entities.Artist.update(artist.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['artists-admin'] });
    queryClient.invalidateQueries({ queryKey: ['artists'] });
    toast.success(`Artiste ${newStatus === 'active' ? 'activé' : 'désactivé'}`);
  };

  const handleSendEmails = async () => {
    const targets = selected.filter(id => {
      const a = artists.find(x => x.id === id);
      return a && a.email;
    });
    if (targets.length === 0) { toast.error('Aucun artiste sélectionné avec un email.'); return; }
    setSendingEmail(true);
    try {
      const appUrl = window.location.origin;
      await base44.functions.invoke('sendArtistInfoRequest', { artistIds: targets, appUrl });
      toast.success(`Email(s) envoyé(s) à ${targets.length} artiste(s) !`);
      setSelected([]);
    } catch (e) {
      toast.error("Erreur lors de l'envoi.");
    }
    setSendingEmail(false);
  };

  const downloadTemplate = () => {
    const headers = ['name', 'first_name', 'last_name', 'stage_name', 'email', 'phone', 'category', 'discipline', 'photo_url', 'short_bio', 'full_bio', 'website', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'consent_diffusion', 'status', 'display_order'];
    const csv = Papa.unparse({ fields: headers, data: [['Dupont Jean', 'Jean', 'Dupont', 'JD', 'jean@example.com', '+32...', 'Musique', 'Chanteur', '', 'Bio courte', 'Bio longue', '', '', '', '', '', '', 'false', 'active', '1']] });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fashionistart_artists_import_template.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#FF2D8A]" /> : <ChevronDown className="w-3 h-3 text-[#FF2D8A]" />;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-display font-bold text-xl text-white">Artistes <span className="text-white/30 font-normal text-base">({artists.length})</span></h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={downloadTemplate} variant="outline" size="sm" className="gap-2 border-white/10 text-white/70 hover:text-white text-xs">
            <Download className="w-3.5 h-3.5" /> Modèle CSV
          </Button>
          <Button onClick={() => setImportOpen(true)} variant="outline" size="sm" className="gap-2 border-white/10 text-white/70 hover:text-white text-xs">
            <Upload className="w-3.5 h-3.5" /> Importer CSV/XLSX
          </Button>
          <Button onClick={() => { setEditArtist(null); setFormOpen(true); }} size="sm" className="gap-2 bg-[#FF2D8A] hover:bg-[#C2185B] text-white text-xs">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-[#FF2D8A]/10 border border-[#FF2D8A]/20">
          <span className="text-sm text-white/70">{selected.length} sélectionné(s)</span>
          <Button onClick={handleSendEmails} disabled={sendingEmail} size="sm" className="gap-2 bg-[#FF2D8A] hover:bg-[#C2185B] text-white text-xs">
            {sendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
            Envoyer demande d'infos
          </Button>
          <Button onClick={() => setSelected([])} variant="ghost" size="sm" className="text-white/50 text-xs"><X className="w-3.5 h-3.5" /></Button>
        </div>
      )}

      {/* Table */}
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#FF2D8A]" /></div> : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="py-3 px-3 text-left w-10">
                  <Checkbox checked={selected.length === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleAll} className="border-white/20" />
                </th>
                <th className="py-3 px-3 text-left cursor-pointer hover:text-[#FF2D8A]" onClick={() => toggleSort('name')}>
                  <span className="flex items-center gap-1 font-display font-semibold text-xs uppercase tracking-wider text-white/40">
                    Nom <SortIcon field="name" />
                  </span>
                </th>
                <th className="py-3 px-3 text-left cursor-pointer hover:text-[#FF2D8A]">
                  <span className="flex items-center gap-1 font-display font-semibold text-xs uppercase tracking-wider text-white/40">Email</span>
                </th>
                <th className="py-3 px-3 text-left cursor-pointer hover:text-[#FF2D8A]" onClick={() => toggleSort('category')}>
                  <span className="flex items-center gap-1 font-display font-semibold text-xs uppercase tracking-wider text-white/40">
                    Catégorie <SortIcon field="category" />
                  </span>
                </th>
                <th className="py-3 px-3 text-center font-display font-semibold text-xs uppercase tracking-wider text-white/40">Statut</th>
                <th className="py-3 px-3 text-center font-display font-semibold text-xs uppercase tracking-wider text-white/40">Consent.</th>
                <th className="py-3 px-3 text-right font-display font-semibold text-xs uppercase tracking-wider text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((artist) => (
                <tr key={artist.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="py-3 px-3">
                    <Checkbox checked={selected.includes(artist.id)} onCheckedChange={() => toggleSelect(artist.id)} className="border-white/20" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      {artist.photo_url ? (
                        <img src={artist.photo_url} alt={artist.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#FF2D8A]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#FF2D8A] font-bold text-xs">{(artist.name || '?')[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-sm">{artist.name}</p>
                        {artist.stage_name && <p className="text-white/40 text-xs">"{artist.stage_name}"</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-white/50 text-xs">{artist.email || '—'}</td>
                  <td className="py-3 px-3">
                    <span className="text-xs text-white/60">{artist.category || artist.discipline || '—'}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge className={artist.status === 'active'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20 text-xs'
                      : 'bg-red-500/10 text-red-400 border-red-500/20 text-xs'}>
                      {artist.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {artist.consent_diffusion
                      ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                      : <AlertCircle className="w-4 h-4 text-white/20 mx-auto" />}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditArtist(artist); setFormOpen(true); }}>
                        <Pencil className="w-3.5 h-3.5 text-white/50 hover:text-white" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleStatus(artist)}>
                        {artist.status === 'active'
                          ? <ToggleRight className="w-4 h-4 text-green-400" />
                          : <ToggleLeft className="w-4 h-4 text-white/30" />}
                      </Button>
                      {artist.email && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Envoyer demande d'infos"
                          onClick={async () => {
                            setSendingEmail(true);
                            await base44.functions.invoke('sendArtistInfoRequest', { artistIds: [artist.id], appUrl: window.location.origin });
                            setSendingEmail(false);
                            toast.success('Email envoyé !');
                          }}>
                          <Mail className="w-3.5 h-3.5 text-[#FF2D8A]" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-white/30">Aucun artiste trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ArtistFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        artist={editArtist}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['artists-admin'] });
          queryClient.invalidateQueries({ queryKey: ['artists'] });
          setFormOpen(false);
        }}
      />

      <ArtistImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => {
          queryClient.invalidateQueries({ queryKey: ['artists-admin'] });
          queryClient.invalidateQueries({ queryKey: ['artists'] });
          setImportOpen(false);
        }}
      />
    </div>
  );
}