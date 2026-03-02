import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

const TARGET_FIELDS = [
  { key: 'name', label: 'Nom complet' },
  { key: 'first_name', label: 'Prénom' },
  { key: 'last_name', label: 'Nom' },
  { key: 'stage_name', label: 'Nom de scène' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Téléphone' },
  { key: 'category', label: 'Catégorie' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'photo_url', label: 'Photo URL' },
  { key: 'short_bio', label: 'Bio courte' },
  { key: 'full_bio', label: 'Bio complète' },
  { key: 'website', label: 'Site web' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'consent_diffusion', label: 'Consentement diffusion' },
  { key: 'status', label: 'Statut' },
  { key: 'display_order', label: 'Ordre' },
];

// Auto-map column names to target fields
const autoMap = (headers) => {
  const mapping = {};
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const aliases = {
    name: ['name', 'nom', 'nomcomplet', 'fullname'],
    first_name: ['firstname', 'prenom', 'givenname'],
    last_name: ['lastname', 'nom', 'nomdefamille', 'surname'],
    stage_name: ['stagename', 'nomscene', 'pseudonyme', 'alias'],
    email: ['email', 'mail', 'courriel'],
    phone: ['phone', 'tel', 'telephone', 'mobile'],
    category: ['category', 'categorie', 'cat'],
    discipline: ['discipline', 'style', 'type'],
    photo_url: ['photourl', 'photo', 'image', 'photolink', 'photodrive'],
    short_bio: ['shortbio', 'biocourte', 'minibio', 'bio'],
    full_bio: ['fullbio', 'biocomplete', 'biographie', 'longbio'],
    website: ['website', 'siteweb', 'web', 'url'],
    instagram: ['instagram', 'insta'],
    facebook: ['facebook', 'fb'],
    tiktok: ['tiktok', 'tt'],
    youtube: ['youtube', 'yt'],
    linkedin: ['linkedin'],
    consent_diffusion: ['consentdiffusion', 'consent', 'consentement', 'diffusion'],
    status: ['status', 'statut', 'etat'],
    display_order: ['displayorder', 'ordre', 'order', 'position'],
  };
  headers.forEach(header => {
    const norm = normalize(header);
    for (const [field, aliasList] of Object.entries(aliases)) {
      if (aliasList.includes(norm)) { mapping[header] = field; break; }
    }
    if (!mapping[header]) mapping[header] = '__skip__';
  });
  return mapping;
};

export default function ArtistImportDialog({ open, onOpenChange, onImported }) {
  const [step, setStep] = useState('upload'); // upload | preview | importing | result
  const [rawRows, setRawRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const reset = () => { setStep('upload'); setRawRows([]); setHeaders([]); setMapping({}); setResult(null); };

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: ({ data, meta }) => {
          const h = meta.fields || [];
          setHeaders(h); setRawRows(data); setMapping(autoMap(h)); setStep('preview');
        }
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const h = data.length > 0 ? Object.keys(data[0]) : [];
        setHeaders(h); setRawRows(data); setMapping(autoMap(h)); setStep('preview');
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Format non supporté. Utilisez .csv ou .xlsx');
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setStep('importing');
    const existingArtists = await base44.entities.Artist.list();
    const emailMap = {};
    const keyMap = {};
    existingArtists.forEach(a => {
      if (a.email) emailMap[a.email.toLowerCase()] = a;
      const fallbackKey = `${a.stage_name || ''}|${a.last_name || ''}|${a.first_name || ''}`.toLowerCase();
      if (fallbackKey !== '||') keyMap[fallbackKey] = a;
    });

    let created = 0, updated = 0, errors = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const record = {};
      for (const [header, targetField] of Object.entries(mapping)) {
        if (targetField === '__skip__') continue;
        let val = row[header];
        if (targetField === 'consent_diffusion') val = ['true', '1', 'oui', 'yes'].includes(String(val).toLowerCase());
        else if (targetField === 'display_order') val = val ? Number(val) : undefined;
        if (val !== undefined && val !== '') record[targetField] = val;
      }

      // Validation
      const hasId = record.name || record.stage_name || (record.first_name && record.last_name);
      if (!hasId) { errors.push({ row: i + 2, reason: 'Pas d\'identifiant (nom/prénom ou nom de scène)' }); continue; }
      if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
        errors.push({ row: i + 2, reason: `Email invalide: ${record.email}` }); continue;
      }
      if (!record.name) record.name = record.stage_name || `${record.first_name || ''} ${record.last_name || ''}`.trim();
      if (!record.status) record.status = 'active';

      // UPSERT logic
      const existingByEmail = record.email ? emailMap[record.email.toLowerCase()] : null;
      const fallbackKey = `${record.stage_name || ''}|${record.last_name || ''}|${record.first_name || ''}`.toLowerCase();
      const existingByKey = fallbackKey !== '||' ? keyMap[fallbackKey] : null;
      const existing = existingByEmail || existingByKey;

      try {
        if (existing) {
          await base44.entities.Artist.update(existing.id, record);
          updated++;
        } else {
          await base44.entities.Artist.create(record);
          created++;
        }
      } catch (e) {
        errors.push({ row: i + 2, reason: e.message });
      }
    }

    setResult({ created, updated, errors });
    setStep('result');
    setImporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="bg-[#12121A] border border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-bold">Importer des artistes (CSV / XLSX)</DialogTitle>
        </DialogHeader>

        {/* STEP: Upload */}
        {step === 'upload' && (
          <div className="mt-4">
            <div
              className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center cursor-pointer hover:border-[#FF2D8A]/40 transition-colors"
              onClick={() => fileRef.current?.click()}
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              onDragOver={e => e.preventDefault()}
            >
              <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 mb-1">Glisser-déposer ou <span className="text-[#FF2D8A]">choisir un fichier</span></p>
              <p className="text-xs text-white/30">Formats acceptés : .csv, .xlsx, .xls</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          </div>
        )}

        {/* STEP: Preview + Mapping */}
        {step === 'preview' && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <FileText className="w-4 h-4 text-[#FF2D8A]" />
              <span>{rawRows.length} lignes détectées — Aperçu des 5 premières :</span>
            </div>

            {/* Mapping */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="py-2 px-3 text-left text-white/40">Colonne fichier</th>
                    <th className="py-2 px-3 text-left text-white/40">→ Champ artiste</th>
                    <th className="py-2 px-3 text-left text-white/40">Exemple</th>
                  </tr>
                </thead>
                <tbody>
                  {headers.map(h => (
                    <tr key={h} className="border-b border-white/5">
                      <td className="py-2 px-3 text-white font-mono">{h}</td>
                      <td className="py-2 px-3">
                        <Select value={mapping[h] || '__skip__'} onValueChange={v => setMapping(m => ({ ...m, [h]: v }))}>
                          <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10 text-white w-44"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__skip__">— Ignorer —</SelectItem>
                            {TARGET_FIELDS.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-3 text-white/30 truncate max-w-[120px]">{String(rawRows[0]?.[h] || '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={reset} className="border-white/10 text-white/50 text-sm">Annuler</Button>
              <Button onClick={handleImport} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white text-sm gap-2">
                <Upload className="w-4 h-4" /> Importer {rawRows.length} artiste(s)
              </Button>
            </div>
          </div>
        )}

        {/* STEP: Importing */}
        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#FF2D8A]" />
            <p className="text-white/50">Import en cours...</p>
          </div>
        )}

        {/* STEP: Result */}
        {step === 'result' && result && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{result.created}</p>
                <p className="text-xs text-white/40 mt-1">Créés</p>
              </div>
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{result.updated}</p>
                <p className="text-xs text-white/40 mt-1">Mis à jour</p>
              </div>
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
                <p className="text-2xl font-bold text-red-400">{result.errors.length}</p>
                <p className="text-xs text-white/40 mt-1">Erreurs</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-xs font-semibold text-red-400 mb-2">Lignes en erreur :</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-white/50">Ligne {e.row} : {e.reason}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={reset} className="border-white/10 text-white/50 text-sm">Importer un autre fichier</Button>
              <Button onClick={() => { onImported(); reset(); }} className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white text-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Terminé
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}